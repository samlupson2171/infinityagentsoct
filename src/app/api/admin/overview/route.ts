import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';
import Quote from '@/models/Quote';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Run all queries in parallel
    const [
      // Enquiry counts
      totalEnquiries,
      newEnquiries,
      inProgressEnquiries,
      enquiriesWithoutQuotes,
      // Quote counts
      totalQuotes,
      draftQuotes,
      sentQuotes,
      acceptedQuotes,
      bookedQuotes,
      // User counts
      totalUsers,
      pendingUsers,
      // Recent data
      recentEnquiries,
      recentQuotesSent,
      pendingBookings,
      confirmedBookings,
      // This week stats
      enquiriesThisWeek,
      quotesThisWeek,
    ] = await Promise.all([
      // Enquiry counts
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'new' }),
      Enquiry.countDocuments({ status: 'in-progress' }),
      Enquiry.countDocuments({ hasQuotes: false }),
      // Quote counts
      Quote.countDocuments(),
      Quote.countDocuments({ status: 'draft' }),
      Quote.countDocuments({ status: 'sent' }),
      Quote.countDocuments({ status: 'accepted' }),
      Quote.countDocuments({ status: 'booked' }),
      // User counts
      User.countDocuments({ role: 'agent' }),
      User.countDocuments({ isApproved: false }),
      // Recent enquiries (last 5 new ones)
      Enquiry.find({ status: 'new' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('leadName firstChoiceDestination tripType numberOfGuests numberOfNights travelDate agentEmail createdAt')
        .lean(),
      // Recent quotes sent but not yet accepted (follow-ups needed)
      Quote.find({ status: 'sent' })
        .sort({ emailSentAt: -1 })
        .limit(5)
        .populate('enquiryId', 'leadName firstChoiceDestination agentEmail')
        .select('leadName destination hotelName totalPrice currency status emailSentAt createdAt')
        .lean(),
      // Bookings awaiting confirmation
      Quote.find({ status: 'accepted' })
        .sort({ updatedAt: -1 })
        .populate('enquiryId', 'leadName firstChoiceDestination agentEmail')
        .select('leadName destination hotelName totalPrice currency numberOfPeople numberOfNights arrivalDate updatedAt')
        .lean(),
      // Recent confirmed bookings
      Quote.find({ status: 'booked' })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('enquiryId', 'leadName firstChoiceDestination agentEmail')
        .select('leadName destination hotelName totalPrice currency numberOfPeople numberOfNights arrivalDate updatedAt')
        .lean(),
      // This week
      Enquiry.countDocuments({
        createdAt: { $gte: getStartOfWeek() },
      }),
      Quote.countDocuments({
        status: 'sent',
        emailSentAt: { $gte: getStartOfWeek() },
      }),
    ]);

    // Calculate revenue from confirmed bookings
    const totalRevenue = await Quote.aggregate([
      { $match: { status: 'booked' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const pipelineRevenue = await Quote.aggregate([
      { $match: { status: { $in: ['sent', 'accepted'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          enquiries: {
            total: totalEnquiries,
            new: newEnquiries,
            inProgress: inProgressEnquiries,
            withoutQuotes: enquiriesWithoutQuotes,
            thisWeek: enquiriesThisWeek,
          },
          quotes: {
            total: totalQuotes,
            draft: draftQuotes,
            sent: sentQuotes,
            accepted: acceptedQuotes,
            booked: bookedQuotes,
            thisWeek: quotesThisWeek,
          },
          users: {
            total: totalUsers,
            pendingApproval: pendingUsers,
          },
        },
        revenue: {
          confirmed: totalRevenue[0]?.total || 0,
          pipeline: pipelineRevenue[0]?.total || 0,
        },
        recent: {
          newEnquiries: recentEnquiries.map((e: any) => ({
            _id: e._id,
            leadName: e.leadName,
            destination: e.firstChoiceDestination,
            tripType: e.tripType,
            guests: e.numberOfGuests,
            nights: e.numberOfNights,
            travelDate: e.travelDate,
            agentEmail: e.agentEmail,
            createdAt: e.createdAt,
          })),
          quotesToFollowUp: recentQuotesSent.map((q: any) => ({
            _id: q._id,
            quoteReference: `Q${q._id.toString().slice(-8).toUpperCase()}`,
            leadName: q.leadName,
            destination: q.destination || q.enquiryId?.firstChoiceDestination || 'TBC',
            hotelName: q.hotelName,
            totalPrice: q.totalPrice,
            currency: q.currency,
            agentEmail: q.enquiryId?.agentEmail,
            sentAt: q.emailSentAt,
          })),
          pendingBookings: pendingBookings.map((q: any) => ({
            _id: q._id,
            quoteReference: `Q${q._id.toString().slice(-8).toUpperCase()}`,
            leadName: q.leadName,
            destination: q.destination || q.enquiryId?.firstChoiceDestination || 'TBC',
            hotelName: q.hotelName,
            totalPrice: q.totalPrice,
            currency: q.currency,
            numberOfPeople: q.numberOfPeople,
            numberOfNights: q.numberOfNights,
            arrivalDate: q.arrivalDate,
            agentEmail: q.enquiryId?.agentEmail,
            acceptedAt: q.updatedAt,
          })),
          confirmedBookings: confirmedBookings.map((q: any) => ({
            _id: q._id,
            quoteReference: `Q${q._id.toString().slice(-8).toUpperCase()}`,
            leadName: q.leadName,
            destination: q.destination || q.enquiryId?.firstChoiceDestination || 'TBC',
            hotelName: q.hotelName,
            totalPrice: q.totalPrice,
            currency: q.currency,
            arrivalDate: q.arrivalDate,
            agentEmail: q.enquiryId?.agentEmail,
            confirmedAt: q.updatedAt,
          })),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}

function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
