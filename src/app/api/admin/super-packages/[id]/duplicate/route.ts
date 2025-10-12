import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;

    // Find the original package
    const originalPackage = await SuperOfferPackage.findById(id).lean();

    if (!originalPackage) {
      return NextResponse.json(
        { error: { message: 'Package not found' } },
        { status: 404 }
      );
    }

    // Parse request body for optional new name
    const body = await request.json().catch(() => ({}));
    const newName = body.name || `${originalPackage.name} (Copy)`;

    // Create duplicate package data
    const duplicateData = {
      name: newName,
      destination: originalPackage.destination,
      resort: originalPackage.resort,
      currency: originalPackage.currency,
      groupSizeTiers: originalPackage.groupSizeTiers,
      durationOptions: originalPackage.durationOptions,
      pricingMatrix: originalPackage.pricingMatrix,
      inclusions: originalPackage.inclusions,
      accommodationExamples: originalPackage.accommodationExamples,
      salesNotes: originalPackage.salesNotes,
      status: 'inactive', // Start as inactive for review
      version: 1, // Reset version
      createdBy: session.user.id,
      lastModifiedBy: session.user.id,
      importSource: 'manual',
    };

    // Create the duplicate package
    const duplicatePackage = new SuperOfferPackage(duplicateData);
    await duplicatePackage.save();

    // Populate creator information
    await duplicatePackage.populate('createdBy', 'name email');
    await duplicatePackage.populate('lastModifiedBy', 'name email');

    return NextResponse.json({
      package: duplicatePackage,
      message: 'Package duplicated successfully',
    });
  } catch (error: any) {
    console.error('Error duplicating package:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to duplicate package',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
