import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';
import {
  handleApiError,
  validateAuthorization,
  validateRequiredFields,
  successResponse,
  PackageDatabaseError,
  PackageValidationError,
} from '@/lib/errors/super-package-error-handler';
import { logger, logApiRequest, logApiResponse } from '@/lib/logging/super-package-logger';
import { standardRateLimiter } from '@/lib/middleware/rate-limiter';
import {
  validateAndSanitizeSuperPackage,
  formatValidationErrors,
} from '@/lib/validation/super-package-validation';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    logApiRequest('GET', '/api/admin/super-packages', session?.user?.id);

    validateAuthorization(session?.user?.role);

    // Apply rate limiting
    const rateLimitResult = await standardRateLimiter(request, session?.user?.id);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const destination = searchParams.get('destination');
    const resort = searchParams.get('resort');
    const search = searchParams.get('search');

    logger.debug('LIST_PACKAGES', 'Fetching packages with filters', {
      page,
      limit,
      status,
      destination,
      resort,
      search,
    });

    // Build query
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (destination) {
      query.destination = destination;
    }

    if (resort) {
      query.resort = resort;
    }

    if (search) {
      // Use regex for more flexible search instead of text index
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { resort: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [packages, total] = await Promise.all([
      SuperOfferPackage.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('lastModifiedBy', 'name email')
        .lean(),
      SuperOfferPackage.countDocuments(query),
    ]).catch((error: any) => {
      throw new PackageDatabaseError('fetch packages', error);
    });

    logger.success('LIST_PACKAGES', `Retrieved ${packages.length} packages`, {
      total,
      page,
    });

    const duration = Date.now() - startTime;
    logApiResponse('GET', '/api/admin/super-packages', 200, duration);

    return successResponse({
      packages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + packages.length < total,
      },
    });
  } catch (error) {
    return handleApiError(error, 'LIST_PACKAGES', {
      userId: (await getServerSession(authOptions))?.user?.id,
    });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    logApiRequest('POST', '/api/admin/super-packages', session?.user?.id);

    validateAuthorization(session?.user?.role);

    // Apply rate limiting
    const rateLimitResult = await standardRateLimiter(request, session?.user?.id);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    await connectToDatabase();

    const body = await request.json();

    logger.debug('CREATE_PACKAGE', 'Creating new package', {
      name: body.name,
      destination: body.destination,
    });

    // Validate and sanitize input data
    const validation = validateAndSanitizeSuperPackage(body, false);
    if (!validation.valid) {
      const errors = formatValidationErrors(validation.errors!);
      throw new PackageValidationError(
        errors[0].field,
        errors[0].message,
        'VALIDATION_ERROR',
        { errors }
      );
    }

    // Create new package with sanitized data
    const newPackage = new SuperOfferPackage({
      ...validation.data,
      createdBy: session!.user.id,
      lastModifiedBy: session!.user.id,
      version: 1,
    });

    await newPackage.save().catch((error: any) => {
      throw new PackageDatabaseError('create package', error);
    });

    // Populate creator information
    await newPackage.populate('createdBy', 'name email');
    await newPackage.populate('lastModifiedBy', 'name email');

    logger.success('CREATE_PACKAGE', `Package created: ${newPackage.name}`, {
      packageId: newPackage._id.toString(),
    });

    const duration = Date.now() - startTime;
    logApiResponse('POST', '/api/admin/super-packages', 201, duration);

    return successResponse(
      { package: newPackage, message: 'Package created successfully' },
      201
    );
  } catch (error) {
    return handleApiError(error, 'CREATE_PACKAGE', {
      userId: (await getServerSession(authOptions))?.user?.id,
    });
  }
}
