import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.isApproved) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const destination = searchParams.get('destination');
    const search = searchParams.get('search');

    const query: any = { status: 'active' };

    if (destination) {
      query.destination = destination;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { resort: { $regex: search, $options: 'i' } },
      ];
    }

    const packages = await SuperOfferPackage.find(query)
      .sort({ destination: 1, name: 1 })
      .select('-createdBy -lastModifiedBy -importSource -originalFilename')
      .lean();

    // Get unique destinations for filter
    const destinations = await SuperOfferPackage.distinct('destination', { status: 'active' });

    return NextResponse.json({
      success: true,
      data: { packages, destinations },
    });
  } catch (error: any) {
    console.error('Error fetching super packages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}
