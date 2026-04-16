import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import Quote from '@/models/Quote';
import Enquiry from '@/models/Enquiry';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.isApproved) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    // Find the quote
    const quote = await Quote.findById(id).populate('enquiryId');
    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Verify the agent owns the enquiry this quote belongs to
    const enquiry = await Enquiry.findById(quote.enquiryId);
    if (!enquiry || enquiry.submittedBy.toString() !== token.sub) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to accept this quote' },
        { status: 403 }
      );
    }

    // Only allow accepting quotes that are sent or updated
    if (!['sent', 'updated'].includes(quote.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot accept a quote with status "${quote.status}"`,
        },
        { status: 400 }
      );
    }

    // Update quote status to accepted
    quote.status = 'accepted';
    await quote.save({ validateBeforeSave: false });

    return NextResponse.json({
      success: true,
      data: {
        quoteId: quote._id,
        status: 'accepted',
        message: 'Quote accepted successfully. The admin team will confirm your booking shortly.',
      },
    });
  } catch (error: any) {
    console.error('Error accepting quote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to accept quote' },
      { status: 500 }
    );
  }
}
