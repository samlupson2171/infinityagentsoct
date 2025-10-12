import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import SuperPackageVersionHistoryService from '@/lib/super-package-version-history';
import mongoose from 'mongoose';

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

    const { searchParams } = new URL(request.url);
    const version1 = parseInt(searchParams.get('version1') || '0');
    const version2 = parseInt(searchParams.get('version2') || '0');

    if (version1 < 1 || version2 < 1) {
      return NextResponse.json(
        { error: 'Both version1 and version2 query parameters are required' },
        { status: 400 }
      );
    }

    const comparison = await SuperPackageVersionHistoryService.compareVersions(
      params.id,
      version1,
      version2
    );

    return NextResponse.json({
      version1,
      version2,
      changes: comparison
    });
  } catch (error) {
    console.error('Error comparing versions:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to compare versions' },
      { status: 500 }
    );
  }
}
