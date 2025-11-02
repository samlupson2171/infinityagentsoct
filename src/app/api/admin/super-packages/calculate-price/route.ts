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

/**
 * POST /api/admin/super-packages/calculate-price
 * 
 * Calculate the price for a super package based on parameters.
 * 
 * Request Body:
 * - packageId: string - ID of the package
 * - numberOfPeople: number - Number of people in the booking
 * - numberOfNights: number - Number of nights
 * - arrivalDate: string - Arrival date in ISO format
 * 
 * Response:
 * - calculation.pricePerPerson: number | 'ON_REQUEST' - Per-person price from database (base rate)
 * - calculation.totalPrice: number | 'ON_REQUEST' - Total price for entire group (pricePerPerson × numberOfPeople)
 * - calculation.price: number | 'ON_REQUEST' - @deprecated Use totalPrice instead. Kept for backward compatibility.
 * - calculation.numberOfPeople: number - Number of people used in calculation
 * - calculation.tier: object - Pricing tier information
 * - calculation.period: object - Pricing period information
 * - calculation.nights: number - Number of nights
 * - calculation.currency: string - Currency code
 * - calculation.packageName: string - Package name
 * - calculation.packageId: string - Package ID
 * - calculation.packageVersion: number - Package version
 * 
 * @returns {Promise<NextResponse>} Price calculation result with new structure
 */
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
      pricePerPerson: result.pricePerPerson,
      totalPrice: result.totalPrice,
      numberOfPeople: result.numberOfPeople,
      numberOfNights,
    });

    const duration = Date.now() - startTime;
    logApiResponse('POST', '/api/admin/super-packages/calculate-price', 200, duration);

    // Return calculation result with new price structure:
    // - pricePerPerson: per-person price from database (base rate)
    // - totalPrice: total price for entire group (pricePerPerson × numberOfPeople)
    // - price: deprecated, equals totalPrice (for backward compatibility)
    // - numberOfPeople: number of people used in calculation
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
