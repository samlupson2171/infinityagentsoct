import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import Quote from '@/models/Quote';

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

    // Find all quotes that are accepted (awaiting confirmation) or booked (confirmed)
    const quotes = await Quote.find({
      status: { $in: ['accepted', 'booked'] },
    })
      .populate('enquiryId', 'leadName firstChoiceDestination tripType numberOfGuests numberOfNights agentEmail submittedBy')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 })
      .lean();

    // Separate into pending confirmation and confirmed
    const pendingConfirmation = quotes
      .filter((q: any) => q.status === 'accepted')
      .map(formatBooking);

    const confirmed = quotes
      .filter((q: any) => q.status === 'booked')
      .map(formatBooking);

    return NextResponse.json({
      success: true,
      data: {
        pendingConfirmation,
        confirmed,
        counts: {
          pending: pendingConfirmation.length,
          confirmed: confirmed.length,
          total: quotes.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

function formatBooking(quote: any) {
  const enquiry = quote.enquiryId;
  return {
    _id: quote._id,
    quoteReference: `Q${quote._id.toString().slice(-8).toUpperCase()}`,
    leadName: quote.leadName,
    destination: quote.destination || enquiry?.firstChoiceDestination || 'TBC',
    hotelName: quote.hotelName,
    numberOfPeople: quote.numberOfPeople,
    numberOfRooms: quote.numberOfRooms,
    numberOfNights: quote.numberOfNights,
    arrivalDate: quote.arrivalDate,
    totalPrice: quote.totalPrice,
    currency: quote.currency,
    status: quote.status,
    tripType: enquiry?.tripType,
    agentEmail: enquiry?.agentEmail,
    createdBy: quote.createdBy,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    whatsIncluded: quote.whatsIncluded,
    transferIncluded: quote.transferIncluded,
    selectedEvents: quote.selectedEvents || [],
  };
}
