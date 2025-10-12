import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';
import { SuperPackageCSVExporter } from '@/lib/super-package-csv-exporter';

/**
 * GET /api/admin/super-packages/export
 * Export super packages to CSV format
 * 
 * Query parameters:
 * - ids: Comma-separated list of package IDs to export (optional)
 * - destination: Filter by destination (optional)
 * - status: Filter by status (optional)
 * 
 * If no IDs provided, exports all packages matching filters
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    const destination = searchParams.get('destination');
    const status = searchParams.get('status');

    // Build query
    const query: any = {};

    if (idsParam) {
      // Export specific packages by ID
      const ids = idsParam.split(',').map((id) => id.trim());
      query._id = { $in: ids };
    } else {
      // Apply filters for bulk export
      if (destination) {
        query.destination = destination;
      }

      if (status && status !== 'all') {
        query.status = status;
      } else {
        // By default, don't export deleted packages
        query.status = { $ne: 'deleted' };
      }
    }

    // Fetch packages
    const packages = await SuperOfferPackage.find(query).sort({ name: 1 }).lean();

    if (!packages || packages.length === 0) {
      return NextResponse.json({ error: 'No packages found to export' }, { status: 404 });
    }

    // Generate CSV content
    let csvContent: string;
    let filename: string;

    if (packages.length === 1) {
      csvContent = SuperPackageCSVExporter.exportPackage(packages[0]);
      filename = SuperPackageCSVExporter.generateFilename(packages[0]);
    } else {
      csvContent = SuperPackageCSVExporter.exportMultiplePackages(packages);
      filename = SuperPackageCSVExporter.generateBulkFilename();
    }

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting super packages:', error);
    return NextResponse.json(
      { error: 'Failed to export packages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
