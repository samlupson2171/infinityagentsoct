import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import Quote from '@/models/Quote';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request });
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    const quote = await Quote.findById(id);
    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    if (quote.status !== 'accepted') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot confirm a quote with status "${quote.status}". Only accepted quotes can be confirmed.`,
        },
        { status: 400 }
      );
    }

    quote.status = 'booked';
    await quote.save({ validateBeforeSave: false });

    return NextResponse.json({
      success: true,
      data: {
        quoteId: quote._id,
        status: 'booked',
        message: 'Booking confirmed successfully.',
      },
    });
  } catch (error: any) {
    console.error('Error confirming booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm booking' },
      { status: 500 }
    );
  }
}
