import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';
import Quote from '@/models/Quote';
import mongoose from 'mongoose';

/**
 * GET /api/admin/super-packages/[id]/check-deletion
 * Check if a package can be safely deleted and return linked quote information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 });
    }

    const packageData = await SuperOfferPackage.findById(params.id);

    if (!packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Check for linked quotes
    const linkedQuotesCount = await Quote.countDocuments({
      'linkedPackage.packageId': params.id,
    });

    // Get sample quote references for display
    const linkedQuotes = await Quote.find({
      'linkedPackage.packageId': params.id,
    })
      .select('quoteNumber destination createdAt status customerName')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get status breakdown
    const statusBreakdown = await Quote.aggregate([
      {
        $match: {
          'linkedPackage.packageId': new mongoose.Types.ObjectId(params.id),
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      canHardDelete: linkedQuotesCount === 0,
      linkedQuotesCount,
      linkedQuotes: linkedQuotes.map((q) => ({
        quoteNumber: q.quoteNumber,
        destination: q.destination,
        customerName: q.customerName,
        createdAt: q.createdAt,
        status: q.status,
      })),
      statusBreakdown: statusBreakdown.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
      package: {
        _id: packageData._id,
        name: packageData.name,
        destination: packageData.destination,
        resort: packageData.resort,
        status: packageData.status,
      },
    });
  } catch (error) {
    console.error('Error checking package deletion:', error);
    return NextResponse.json(
      { error: 'Failed to check package deletion status' },
      { status: 500 }
    );
  }
}
