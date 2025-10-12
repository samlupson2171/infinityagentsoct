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

    const auditTrail = await SuperPackageVersionHistoryService.getAuditTrail(params.id);

    return NextResponse.json(auditTrail);
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    
    if (error instanceof Error && error.message.includes('No history found')) {
      return NextResponse.json(
        { error: 'No history found for this package' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch audit trail' },
      { status: 500 }
    );
  }
}
