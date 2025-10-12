import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';
import Quote from '@/models/Quote';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get all packages with their basic info
    const packages = await SuperOfferPackage.find({
      status: { $ne: 'deleted' },
    })
      .select('_id name destination resort status createdAt updatedAt')
      .lean();

    // Get quote counts for each package
    const packageIds = packages.map((pkg) => pkg._id);
    
    const quoteCounts = await Quote.aggregate([
      {
        $match: {
          'linkedPackage.packageId': { $in: packageIds },
        },
      },
      {
        $group: {
          _id: '$linkedPackage.packageId',
          count: { $sum: 1 },
          lastUsed: { $max: '$createdAt' },
        },
      },
    ]);

    // Create a map of package ID to quote count
    const quoteCountMap = new Map(
      quoteCounts.map((item) => [item._id.toString(), item])
    );

    // Combine package data with quote counts
    const packageStats = packages.map((pkg) => {
      const stats = quoteCountMap.get(pkg._id.toString());
      return {
        _id: pkg._id,
        name: pkg.name,
        destination: pkg.destination,
        resort: pkg.resort,
        status: pkg.status,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
        linkedQuotesCount: stats?.count || 0,
        lastUsedAt: stats?.lastUsed || null,
      };
    });

    // Sort by usage (most used first)
    const mostUsedPackages = [...packageStats]
      .sort((a, b) => b.linkedQuotesCount - a.linkedQuotesCount)
      .slice(0, 10);

    // Get destination-based counts
    const destinationCounts = packages.reduce((acc, pkg) => {
      const dest = pkg.destination;
      if (!acc[dest]) {
        acc[dest] = {
          total: 0,
          active: 0,
          inactive: 0,
        };
      }
      acc[dest].total++;
      if (pkg.status === 'active') {
        acc[dest].active++;
      } else if (pkg.status === 'inactive') {
        acc[dest].inactive++;
      }
      return acc;
    }, {} as Record<string, { total: number; active: number; inactive: number }>);

    // Get creation timeline (packages created per month for last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const creationTimeline = await SuperOfferPackage.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          status: { $ne: 'deleted' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          created: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Get update timeline (packages updated per month for last 12 months)
    const updateTimeline = await SuperOfferPackage.aggregate([
      {
        $match: {
          updatedAt: { $gte: twelveMonthsAgo },
          status: { $ne: 'deleted' },
          $expr: { $ne: ['$createdAt', '$updatedAt'] }, // Only count actual updates
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
          },
          updated: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Overall statistics
    const totalPackages = packages.length;
    const activePackages = packages.filter((p) => p.status === 'active').length;
    const inactivePackages = packages.filter(
      (p) => p.status === 'inactive'
    ).length;
    const totalLinkedQuotes = packageStats.reduce(
      (sum, pkg) => sum + pkg.linkedQuotesCount,
      0
    );
    const packagesWithQuotes = packageStats.filter(
      (pkg) => pkg.linkedQuotesCount > 0
    ).length;
    const unusedPackages = packageStats.filter(
      (pkg) => pkg.linkedQuotesCount === 0
    ).length;

    return NextResponse.json({
      success: true,
      statistics: {
        overview: {
          totalPackages,
          activePackages,
          inactivePackages,
          totalLinkedQuotes,
          packagesWithQuotes,
          unusedPackages,
          averageQuotesPerPackage:
            totalPackages > 0
              ? (totalLinkedQuotes / totalPackages).toFixed(2)
              : 0,
        },
        mostUsedPackages,
        destinationCounts,
        timeline: {
          creation: creationTimeline,
          updates: updateTimeline,
        },
        allPackageStats: packageStats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching package statistics:', error);
    return NextResponse.json(
      {
        error: {
          message: 'Failed to fetch package statistics',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
