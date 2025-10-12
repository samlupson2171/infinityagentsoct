import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SuperPackageCSVParser } from '@/lib/super-package-csv-parser';
import {
  handleApiError,
  validateAuthorization,
  successResponse,
  PackageValidationError,
  CSVImportError,
} from '@/lib/errors/super-package-error-handler';
import { logger, logApiRequest, logApiResponse } from '@/lib/logging/super-package-logger';
import { importRateLimiter } from '@/lib/middleware/rate-limiter';
import { validateFileUpload } from '@/lib/validation/super-package-validation';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    logApiRequest('POST', '/api/admin/super-packages/import', session?.user?.id);

    validateAuthorization(session?.user?.role);

    // Apply strict rate limiting for imports
    const rateLimitResult = await importRateLimiter(request, session?.user?.id);
    if (!rateLimitResult.allowed) {
      logger.warn('IMPORT_CSV', 'Rate limit exceeded', {
        userId: session?.user?.id,
      });
      return rateLimitResult.response!;
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new PackageValidationError('file', 'No file provided', 'MISSING_FILE');
    }

    logger.debug('IMPORT_CSV', 'Processing CSV file', {
      filename: file.name,
      size: file.size,
      type: file.type,
    });

    // Validate file upload with comprehensive checks
    const fileValidation = validateFileUpload(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['text/csv', 'application/vnd.ms-excel'],
      allowedExtensions: ['.csv'],
    });

    if (!fileValidation.valid) {
      throw new PackageValidationError(
        'file',
        fileValidation.error!,
        'INVALID_FILE',
        { filename: file.name, type: file.type, size: file.size }
      );
    }

    // Read file content
    const csvContent = await file.text().catch((error) => {
      throw new CSVImportError(
        undefined,
        undefined,
        'Failed to read file content',
        { originalError: error.message }
      );
    });

    // Parse CSV
    try {
      const parsedPackage = SuperPackageCSVParser.parseCSV(csvContent);

      logger.success('IMPORT_CSV', 'CSV parsed successfully', {
        filename: file.name,
        packageName: parsedPackage.name,
        destination: parsedPackage.destination,
      });

      const duration = Date.now() - startTime;
      logApiResponse('POST', '/api/admin/super-packages/import', 200, duration);

      return successResponse({
        preview: parsedPackage,
        filename: file.name,
        message: 'CSV parsed successfully. Review and confirm to create package.',
      });
    } catch (parseError) {
      // Re-throw as CSVImportError if not already
      if (parseError instanceof CSVImportError) {
        throw parseError;
      }
      
      throw new CSVImportError(
        undefined,
        undefined,
        parseError instanceof Error ? parseError.message : 'Failed to parse CSV',
        { originalError: parseError }
      );
    }
  } catch (error) {
    return handleApiError(error, 'IMPORT_CSV', {
      userId: (await getServerSession(authOptions))?.user?.id,
    });
  }
}
