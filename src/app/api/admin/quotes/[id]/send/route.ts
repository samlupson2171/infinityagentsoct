import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import Quote from '@/models/Quote';

export const dynamic = 'force-dynamic';

/**
 * Simple endpoint to mark a quote as sent to the agent.
 * Updates status from draft → sent so it appears in the agent's dashboard.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request });
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const quote = await Quote.findById(params.id);
    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    if (quote.status !== 'draft' && quote.status !== 'updated') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot send a quote with status "${quote.status}"`,
        },
        { status: 400 }
      );
    }

    // Update status to sent — this makes it visible to the agent
    quote.status = 'sent';
    quote.emailSent = true;
    quote.emailSentAt = new Date();
    await quote.save({ validateBeforeSave: false });

    return NextResponse.json({
      success: true,
      data: {
        quoteId: quote._id,
        status: 'sent',
        message: 'Quote sent to agent successfully',
      },
    });
  } catch (error: any) {
    console.error('Error sending quote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send quote' },
      { status: 500 }
    );
  }
}
