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

    const enquiries = await Enquiry.find({
      submittedBy: token.sub,
      hasQuotes: true,
    }).lean();

    const enquiryIds = enquiries.map((e: any) => e._id);

    // Return quotes that have been sent to the agent (not drafts, not booked)
    const quotes = await Quote.find({
      enquiryId: { $in: enquiryIds },
      status: { $in: ['sent', 'updated'] },
    })
      .sort({ createdAt: -1 })
      .lean();

    const data = quotes.map((quote: any) => {
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
        createdAt: quote.createdAt,
        tripType: enquiry?.tripType,
        accommodationType: enquiry?.accommodationType,
        boardType: enquiry?.boardType,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching agent quotes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}
