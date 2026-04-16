import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.isApproved) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const enquiries = await Enquiry.find({ submittedBy: token.sub })
      .sort({ createdAt: -1 })
      .populate('eventsRequested', 'name')
      .populate('quotes', '_id status')
      .lean();

    return NextResponse.json({ success: true, data: enquiries });
  } catch (error: any) {
    console.error('Error fetching agent enquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enquiries' },
      { status: 500 }
    );
  }
}
