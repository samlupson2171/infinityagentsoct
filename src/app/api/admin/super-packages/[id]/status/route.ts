import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';
import mongoose from 'mongoose';
import {
  handleApiError,
  validateAuthorization,
  validateRequiredFields,
  successResponse,
  PackageNotFoundError,
  PackageValidationError,
  PackageDatabaseError,
} from '@/lib/errors/super-package-error-handler';
import { logger, logApiRequest, logApiResponse } from '@/lib/logging/super-package-logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    logApiRequest('PATCH', `/api/admin/super-packages/${params.id}/status`, session?.user?.id);

    validateAuthorization(session?.user?.role);

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      throw new PackageValidationError('id', 'Invalid package ID format', 'INVALID_ID');
    }

    const body = await request.json();
    const { status } = body;

    logger.debug('UPDATE_STATUS', 'Updating package status', {
      packageId: params.id,
      newStatus: status,
    });

    validateRequiredFields(body, ['status'], 'UPDATE_STATUS');

    if (!['active', 'inactive'].includes(status)) {
      throw new PackageValidationError(
        'status',
        'Invalid status. Must be "active" or "inactive"',
        'INVALID_STATUS',
        { providedStatus: status, allowedStatuses: ['active', 'inactive'] }
      );
    }

    const packageData = await SuperOfferPackage.findById(params.id).catch((error) => {
      throw new PackageDatabaseError('fetch package for status update', error);
    });

    if (!packageData) {
      throw new PackageNotFoundError(params.id);
    }

    // Don't allow changing status of deleted packages
    if (packageData.status === 'deleted') {
      throw new PackageValidationError(
        'status',
        'Cannot change status of deleted package',
        'PACKAGE_DELETED',
        { currentStatus: 'deleted' }
      );
    }

    // Update status
    const updatedPackage = await SuperOfferPackage.findByIdAndUpdate(
      params.id,
      {
        status,
        lastModifiedBy: session.user.id,
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .catch((error) => {
        throw new PackageDatabaseError('update package status', error);
      });

    logger.success('UPDATE_STATUS', `Package status updated to ${status}`, {
      packageId: params.id,
      packageName: updatedPackage?.name,
      oldStatus: packageData.status,
      newStatus: status,
    });

    const duration = Date.now() - startTime;
    logApiResponse('PATCH', `/api/admin/super-packages/${params.id}/status`, 200, duration);

    return successResponse({
      package: updatedPackage,
      message: `Package status updated to ${status}`,
    });
  } catch (error) {
    return handleApiError(error, 'UPDATE_STATUS', {
      userId: (await getServerSession(authOptions))?.user?.id,
      packageId: params.id,
    });
  }
}
