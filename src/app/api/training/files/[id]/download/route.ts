import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { DownloadTracker } from '@/lib/download-tracker';
import { FileManager } from '@/lib/file-manager';
import { promises as fs } from 'fs';
import mongoose from 'mongoose';
import {
  FileErrorCode,
  createFileErrorResponse,
  FileOperationLogger,
} from '@/lib/errors/file-operation-errors';

export const dynamic = 'force-dynamic';
interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  let downloadSuccess = false;
  let errorMessage: string | undefined;

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.UNAUTHORIZED,
          'Authentication required',
          { fileId: params.id }
        ),
        { status: 401 }
      );
    }

    FileOperationLogger.logDownloadStart(
      params.id,
      session.user.id,
      session.user.role || 'user'
    );
    
    await connectToDatabase();

    const { FileStorage } = await import('@/models');
    const file = await FileStorage.findOne({ id: params.id });

    if (!file) {
      errorMessage = 'File not found in database';
      FileOperationLogger.logDownloadError(params.id, errorMessage);
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.FILE_NOT_FOUND_IN_DATABASE,
          errorMessage,
          { fileId: params.id }
        ),
        { status: 404 }
      );
    }

    // Check download permissions
    const permissionCheck = await DownloadTracker.checkDownloadPermission(
      session.user.id,
      session.user.role || 'user',
      params.id
    );

    if (!permissionCheck.allowed) {
      errorMessage = permissionCheck.reason || 'Access denied';
      FileOperationLogger.logDownloadError(params.id, errorMessage, {
        userId: session.user.id,
        userRole: session.user.role,
      });
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.FORBIDDEN,
          errorMessage,
          { fileId: params.id }
        ),
        { status: 403 }
      );
    }

    // Check rate limiting
    const rateLimit = DownloadTracker.checkRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      errorMessage = 'Rate limit exceeded';
      FileOperationLogger.logDownloadError(params.id, errorMessage, {
        userId: session.user.id,
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime.toISOString(),
      });
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.RATE_LIMIT_EXCEEDED,
          errorMessage,
          {
            fileId: params.id,
            details: {
              retryAfter: rateLimit.resetTime.toISOString(),
              remaining: rateLimit.remaining,
            },
          }
        ),
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(
              (rateLimit.resetTime.getTime() - Date.now()) / 1000
            ).toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toISOString(),
          },
        }
      );
    }

    // Use FileManager helper to get consistent full path
    const fullPath = FileManager.getFileFullPath(file.filePath);

    // Verify file exists before attempting to read
    const fileExists = await FileManager.verifyFileExists(file.filePath);
    if (!fileExists) {
      errorMessage = 'File not found on filesystem';
      FileOperationLogger.logDownloadError(params.id, errorMessage, {
        filePath: file.filePath,
        fullPath,
      });
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.FILE_NOT_FOUND_ON_FILESYSTEM,
          errorMessage,
          {
            fileId: params.id,
            filePath: file.filePath,
          }
        ),
        { status: 404 }
      );
    }

    try {
      const fileBuffer = await fs.readFile(fullPath);

      // Mark download as successful
      downloadSuccess = true;

      // Set appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', file.mimeType);
      headers.set('Content-Length', file.size.toString());
      headers.set(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.originalName)}"`
      );
      headers.set('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour

      // Security headers
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('X-Download-Options', 'noopen');
      headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      );

      // Rate limit headers
      headers.set(
        'X-RateLimit-Remaining',
        (rateLimit.remaining - 1).toString()
      );
      headers.set('X-RateLimit-Reset', rateLimit.resetTime.toISOString());

      const downloadTime = Date.now() - startTime;
      FileOperationLogger.logDownloadSuccess(
        params.id,
        file.originalName,
        downloadTime,
        file.size
      );

      return new NextResponse(fileBuffer as any, {
        status: 200,
        headers,
      });
    } catch (fileError) {
      errorMessage = 'Failed to read file from filesystem';
      FileOperationLogger.logDownloadError(params.id, errorMessage, {
        filePath: file.filePath,
        fullPath,
        error: fileError instanceof Error ? fileError.message : 'Unknown error',
      });
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.FILE_READ_FAILED,
          errorMessage,
          {
            fileId: params.id,
            filePath: file.filePath,
            details: fileError instanceof Error ? fileError.message : 'Unknown error',
          }
        ),
        { status: 404 }
      );
    }
  } catch (error) {
    errorMessage = 'Internal server error';
    FileOperationLogger.logDownloadError(params.id, errorMessage, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      createFileErrorResponse(
        FileErrorCode.INTERNAL_ERROR,
        errorMessage,
        {
          fileId: params.id,
          details: error instanceof Error ? error.message : 'Unknown error',
        }
      ),
      { status: 500 }
    );
  } finally {
    // Log the download attempt
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        await connectToDatabase();
        const { FileStorage } = await import('@/models');
        const file = await FileStorage.findOne({ id: params.id });

        if (file) {
          await DownloadTracker.logDownload({
            fileId: params.id,
            userId: session.user.id,
            userRole: session.user.role || 'user',
            downloadedAt: new Date(),
            ipAddress: DownloadTracker.getClientIp(request),
            userAgent: request.headers.get('user-agent') || undefined,
            fileSize: file.size,
            success: downloadSuccess,
            errorMessage,
          });
          console.log(`Download logged for file ${params.id} - success: ${downloadSuccess}`);
        }
      }
    } catch (logError) {
      console.error(`Failed to log download for file ${params.id}:`, logError);
      // Don't fail the request if logging fails
    }
  }
}

// HEAD request for file metadata (useful for checking file existence without downloading)
export async function HEAD(request: NextRequest, { params }: RouteParams) {
  try {
    console.log(`HEAD request for file ID: ${params.id}`);
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.warn(`Unauthorized HEAD request for file ID: ${params.id}`);
      return new NextResponse(null, { status: 401 });
    }

    await connectToDatabase();

    const { FileStorage } = await import('@/models');
    const file = await FileStorage.findOne({ id: params.id });

    if (!file || file.isOrphaned) {
      console.warn(`File not found or orphaned for HEAD request: ${params.id}`);
      return new NextResponse(null, { status: 404 });
    }

    // Check if user has access
    const isAdmin = session.user.role === 'admin';
    const isAgent = session.user.role === 'agent';

    if (!isAdmin && !isAgent) {
      console.warn(`Access denied for HEAD request - user ${session.user.id}, file ${params.id}`);
      return new NextResponse(null, { status: 403 });
    }

    // Use FileManager helper to verify file exists
    const fileExists = await FileManager.verifyFileExists(file.filePath);
    
    if (!fileExists) {
      console.error(`File not found on filesystem for HEAD request: ${params.id}`);
      console.error(`Database filePath: ${file.filePath}`);
      return new NextResponse(null, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', file.mimeType);
    headers.set('Content-Length', file.size.toString());
    headers.set('Last-Modified', file.updatedAt.toUTCString());

    console.log(`HEAD request successful for file ${params.id}`);
    
    return new NextResponse(null, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error(`File HEAD error for file ${params.id}:`, error);
    return new NextResponse(null, { status: 500 });
  }
}
