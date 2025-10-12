import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { packageData, originalFilename } = body;

    if (!packageData) {
      return NextResponse.json(
        { error: 'No package data provided' },
        { status: 400 }
      );
    }

    // Create new package with import metadata
    const newPackage = new SuperOfferPackage({
      ...packageData,
      createdBy: session.user.id,
      lastModifiedBy: session.user.id,
      status: 'active',
      version: 1,
      importSource: 'csv',
      originalFilename: originalFilename || 'unknown.csv',
    });

    await newPackage.save();

    // Populate creator information
    await newPackage.populate('createdBy', 'name email');
    await newPackage.populate('lastModifiedBy', 'name email');

    return NextResponse.json(
      {
        package: newPackage,
        message: 'Package imported and created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error confirming package import:', error);

    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create package from import' },
      { status: 500 }
    );
  }
}
