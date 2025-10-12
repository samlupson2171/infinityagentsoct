import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';
import { PricingCalculator } from '@/lib/pricing-calculator';
import mongoose from 'mongoose';
import {
  handleApiError,
  validateAuthorization,
  validateRequiredFields,
  successResponse,
  PackageNotFoundError,
  PackageValidationError,
  PriceCalculationError,
  PackageDatabaseError,
} from '@/lib/errors/super-package-error-handler';
import { logger, logApiRequest, logApiResponse } from '@/lib/logging/super-package-logger';
import { calculationRateLimiter } from '@/lib/middleware/rate-limiter';
import { calculatePriceSchema } from '@/lib/validation/super-package-validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    logApiRequest('POST', '/api/admin/super-packages/calculate-price', session?.user?.id);

    validateAuthorization(session?.user?.role);

    // Apply rate limiting for calculations
    const rateLimitResult = await calculationRateLimiter(request, session?.user?.id);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    await connectToDatabase();

    const body = await request.json();

    // Validate and sanitize input using Zod schema
    let validatedData;
    try {
      validatedData = calculatePriceSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new PackageValidationError(
          firstError.path.join('.'),
          firstError.message,
          'VALIDATION_ERROR',
          { errors: error.errors }
        );
      }
      throw error;
    }

    const { packageId, numberOfPeople, numberOfNights, arrivalDate } = validatedData;

    logger.debug('CALCULATE_PRICE', 'Calculating price', {
      packageId,
      numberOfPeople,
      numberOfNights,
      arrivalDate,
    });

    // Fetch package
    const packageData = await SuperOfferPackage.findById(packageId)
      .lean()
      .catch((error) => {
        throw new PackageDatabaseError('fetch package for calculation', error);
      });

    if (!packageData) {
      throw new PackageNotFoundError(packageId);
    }

    if (packageData.status !== 'active') {
      throw new PackageValidationError(
        'status',
        'Package is not active and cannot be used for calculations',
        'INACTIVE_PACKAGE'
      );
    }

    // Parse arrival date
    const arrival = new Date(arrivalDate);

    // Calculate price
    const result = PricingCalculator.calculatePrice(
      packageData,
      numberOfPeople,
      numberOfNights,
      arrival
    );

    if ('error' in result) {
      throw new PriceCalculationError(result.error, {
        packageId,
        numberOfPeople,
        numberOfNights,
        arrivalDate,
      });
    }

    logger.success('CALCULATE_PRICE', 'Price calculated successfully', {
      packageId,
      totalPrice: result.totalPrice,
      isOnRequest: result.isOnRequest,
      numberOfPeople,
      numberOfNights,
    });

    const duration = Date.now() - startTime;
    logApiResponse('POST', '/api/admin/super-packages/calculate-price', 200, duration);

    return successResponse({
      calculation: result,
      message: 'Price calculated successfully',
    });
  } catch (error) {
    return handleApiError(error, 'CALCULATE_PRICE', {
      userId: (await getServerSession(authOptions))?.user?.id,
    });
  }
}
