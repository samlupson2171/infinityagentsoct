import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';
import Quote from '@/models/Quote';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.isApproved) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find all enquiries by this agent that have quotes sent
    const enquiries = await Enquiry.find({
      submittedBy: token.sub,
      hasQuotes: true,
    }).lean();

    const enquiryIds = enquiries.map((e: any) => e._id);

    // Find all quotes linked to those enquiries that are accepted or confirmed bookings
    const quotes = await Quote.find({
      enquiryId: { $in: enquiryIds },
      status: { $in: ['accepted', 'booked'] },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Merge quote data with enquiry data for a "booking" view
    const bookings = quotes.map((quote: any) => {
      const enquiry = enquiries.find(
        (e: any) => e._id.toString() === quote.enquiryId.toString()
      );
      return {
        _id: quote._id,
        quoteReference: `Q${quote._id.toString().slice(-8).toUpperCase()}`,
        title: quote.title || quote.leadName,
        destination: quote.destination || enquiry?.firstChoiceDestination || 'TBC',
        leadName: quote.leadName,
        hotelName: quote.hotelName,
        numberOfPeople: quote.numberOfPeople,
        numberOfRooms: quote.numberOfRooms,
        numberOfNights: quote.numberOfNights,
        arrivalDate: quote.arrivalDate,
        totalPrice: quote.totalPrice,
        currency: quote.currency,
        whatsIncluded: quote.whatsIncluded,
        transferIncluded: quote.transferIncluded,
        selectedEvents: quote.selectedEvents || [],
        linkedPackage: quote.linkedPackage,
        status: quote.status,
        emailSentAt: quote.emailSentAt,
        tripType: enquiry?.tripType,
        accommodationType: enquiry?.accommodationType,
        boardType: enquiry?.boardType,
      };
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error('Error fetching agent bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
