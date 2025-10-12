import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';
import Quote from '@/models/Quote';
import SuperPackageVersionHistoryService from '@/lib/super-package-version-history';
import mongoose from 'mongoose';
import {
  handleApiError,
  validateAuthorization,
  validatePackageExists,
  successResponse,
  PackageNotFoundError,
  PackageInUseError,
  PackageDatabaseError,
  PackageValidationError,
} from '@/lib/errors/super-package-error-handler';
import { logger, logApiRequest, logApiResponse } from '@/lib/logging/super-package-logger';
import { standardRateLimiter } from '@/lib/middleware/rate-limiter';
import {
  validateAndSanitizeSuperPackage,
  formatValidationErrors,
} from '@/lib/validation/super-package-validation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    logApiRequest('GET', `/api/admin/super-packages/${params.id}`, session?.user?.id);

    validateAuthorization(session?.user?.role);

    // Apply rate limiting
    const rateLimitResult = await standardRateLimiter(request, session?.user?.id);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      throw new PackageValidationError('id', 'Invalid package ID format', 'INVALID_ID');
    }

    logger.debug('GET_PACKAGE', 'Fetching package details', { packageId: params.id });

    const packageData = await SuperOfferPackage.findById(params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .lean()
      .catch((error) => {
        throw new PackageDatabaseError('fetch package', error);
      });

    if (!packageData) {
      throw new PackageNotFoundError(params.id);
    }

    // Get count of linked quotes
    const linkedQuotesCount = await Quote.countDocuments({
      'linkedPackage.packageId': params.id,
    }).catch((error) => {
      throw new PackageDatabaseError('count linked quotes', error);
    });

    logger.success('GET_PACKAGE', `Retrieved package: ${Array.isArray(packageData) ? packageData[0]?.name : packageData.name}`, {
      packageId: params.id,
      linkedQuotesCount,
    });

    const duration = Date.now() - startTime;
    logApiResponse('GET', `/api/admin/super-packages/${params.id}`, 200, duration);

    return successResponse({
      package: packageData,
      linkedQuotesCount,
    });
  } catch (error) {
    return handleApiError(error, 'GET_PACKAGE', {
      userId: (await getServerSession(authOptions))?.user?.id,
      packageId: params.id,
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    logApiRequest('PUT', `/api/admin/super-packages/${params.id}`, session?.user?.id);

    validateAuthorization(session?.user?.role);

    // Apply rate limiting
    const rateLimitResult = await standardRateLimiter(request, session?.user?.id);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      throw new PackageValidationError('id', 'Invalid package ID format', 'INVALID_ID');
    }

    const body = await request.json();
    const { changeDescription, ...updateData } = body;

    logger.debug('UPDATE_PACKAGE', 'Updating package', {
      packageId: params.id,
      changeDescription,
    });

    // Validate and sanitize update data
    const validation = validateAndSanitizeSuperPackage(updateData, true);
    if (!validation.valid) {
      const errors = formatValidationErrors(validation.errors!);
      throw new PackageValidationError(
        errors[0].field,
        errors[0].message,
        'VALIDATION_ERROR',
        { errors }
      );
    }

    const existingPackage = await SuperOfferPackage.findById(params.id).catch((error) => {
      throw new PackageDatabaseError('fetch package for update', error);
    });

    if (!existingPackage) {
      throw new PackageNotFoundError(params.id);
    }

    // Save current version to history before updating
    if (session?.user?.id) {
      await SuperPackageVersionHistoryService.saveVersion(
        existingPackage,
        session.user.id,
        changeDescription
      ).catch((error) => {
        logger.warn('UPDATE_PACKAGE', 'Failed to save version history', { error: error.message });
        // Continue with update even if version history fails
      });
    }

    // Update package with version increment and sanitized data
    const updatedPackage = await SuperOfferPackage.findByIdAndUpdate(
      params.id,
      {
        ...validation.data,
        version: existingPackage.version + 1,
        lastModifiedBy: session?.user?.id,
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .catch((error) => {
        throw new PackageDatabaseError('update package', error);
      });

    logger.success('UPDATE_PACKAGE', `Package updated: ${updatedPackage?.name}`, {
      packageId: params.id,
      version: updatedPackage?.version,
    });

    const duration = Date.now() - startTime;
    logApiResponse('PUT', `/api/admin/super-packages/${params.id}`, 200, duration);

    return successResponse({
      package: updatedPackage,
      message: 'Package updated successfully',
    });
  } catch (error) {
    return handleApiError(error, 'UPDATE_PACKAGE', {
      userId: (await getServerSession(authOptions))?.user?.id,
      packageId: params.id,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    logApiRequest('DELETE', `/api/admin/super-packages/${params.id}`, session?.user?.id);

    validateAuthorization(session?.user?.role);

    // Apply rate limiting
    const rateLimitResult = await standardRateLimiter(request, session?.user?.id);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      throw new PackageValidationError('id', 'Invalid package ID format', 'INVALID_ID');
    }

    logger.debug('DELETE_PACKAGE', 'Attempting to delete package', { packageId: params.id });

    const packageData = await SuperOfferPackage.findById(params.id).catch((error) => {
      throw new PackageDatabaseError('fetch package for deletion', error);
    });

    if (!packageData) {
      throw new PackageNotFoundError(params.id);
    }

    // Check for linked quotes with detailed information
    const linkedQuotesCount = await Quote.countDocuments({
      'linkedPackage.packageId': params.id,
    }).catch((error) => {
      throw new PackageDatabaseError('count linked quotes', error);
    });

    // Get sample quote references for display
    const linkedQuotes = await Quote.find({
      'linkedPackage.packageId': params.id,
    })
      .select('quoteNumber destination createdAt status')
      .limit(5)
      .lean()
      .catch((error) => {
        throw new PackageDatabaseError('fetch linked quotes', error);
      });

    if (linkedQuotesCount > 0) {
      logger.warn('DELETE_PACKAGE', 'Package has linked quotes, performing soft delete', {
        packageId: params.id,
        linkedQuotesCount,
      });

      // Soft delete - mark as deleted
      const updatedPackage = await SuperOfferPackage.findByIdAndUpdate(
        params.id,
        {
          status: 'deleted',
          lastModifiedBy: session?.user?.id,
        },
        { new: true }
      ).catch((error) => {
        throw new PackageDatabaseError('soft delete package', error);
      });

      const duration = Date.now() - startTime;
      logApiResponse('DELETE', `/api/admin/super-packages/${params.id}`, 200, duration);

      return successResponse({
        message: `Package marked as deleted. ${linkedQuotesCount} quote(s) are linked to this package.`,
        softDelete: true,
        linkedQuotesCount,
        linkedQuotes: linkedQuotes.map((q) => ({
          quoteNumber: q.quoteNumber,
          destination: q.destination,
          createdAt: q.createdAt,
          status: q.status,
        })),
        package: updatedPackage,
      });
    } else {
      logger.info('DELETE_PACKAGE', 'No linked quotes, performing hard delete', {
        packageId: params.id,
      });

      // Hard delete - no quotes linked
      await SuperOfferPackage.findByIdAndDelete(params.id).catch((error) => {
        throw new PackageDatabaseError('hard delete package', error);
      });

      logger.success('DELETE_PACKAGE', `Package permanently deleted: ${packageData.name}`, {
        packageId: params.id,
      });

      const duration = Date.now() - startTime;
      logApiResponse('DELETE', `/api/admin/super-packages/${params.id}`, 200, duration);

      return successResponse({
        message: 'Package permanently deleted',
        softDelete: false,
        linkedQuotesCount: 0,
      });
    }
  } catch (error) {
    return handleApiError(error, 'DELETE_PACKAGE', {
      userId: (await getServerSession(authOptions))?.user?.id,
      packageId: params.id,
    });
  }
}
