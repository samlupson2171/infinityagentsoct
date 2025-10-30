import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { connectDB } from '@/lib/mongodb';
import { FileManager } from '@/lib/file-manager';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/training/files/cleanup
 * Clean up orphaned files older than specified days
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    await requireAdmin(request);

    // Connect to database
    await connectDB();

    // Parse request body for optional parameters
    const body = await request.json().catch(() => ({}));
    const olderThanDays = body.olderThanDays || 7;

    // Validate olderThanDays parameter
    if (typeof olderThanDays !== 'number' || olderThanDays < 1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETER',
            message: 'olderThanDays must be a positive number',
          },
        },
        { status: 400 }
      );
    }

    console.log(`Starting orphaned file cleanup (older than ${olderThanDays} days)`);
    const startTime = Date.now();

    // Run cleanup
    const deletedCount = await FileManager.cleanupOrphanedFiles(olderThanDays);

    const duration = Date.now() - startTime;
    console.log(`Cleanup completed in ${duration}ms: ${deletedCount} files deleted`);

    return NextResponse.json({
      success: true,
      data: {
        deletedCount,
        olderThanDays,
        duration,
        message: `Successfully cleaned up ${deletedCount} orphaned file(s)`,
      },
    });
  } catch (error: any) {
    console.error('Error during orphaned file cleanup:', error);

    // Handle auth errors
    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CLEANUP_ERROR',
          message: 'Failed to clean up orphaned files',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/training/files/cleanup
 * Get information about orphaned files without deleting them
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization
    await requireAdmin(request);

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '7');

    // Validate parameter
    if (isNaN(olderThanDays) || olderThanDays < 1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETER',
            message: 'olderThanDays must be a positive number',
          },
        },
        { status: 400 }
      );
    }

    // Import FileStorage model
    const { FileStorage } = await import('@/models');

    // Find orphaned files
    const orphanedFiles = await FileStorage.findOrphanedFiles(olderThanDays);

    // Calculate total size
    const totalSize = orphanedFiles.reduce((sum, file) => sum + file.size, 0);

    return NextResponse.json({
      success: true,
      data: {
        count: orphanedFiles.length,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        olderThanDays,
        files: orphanedFiles.map((file) => ({
          id: file.id,
          originalName: file.originalName,
          filePath: file.filePath,
          size: file.size,
          createdAt: file.createdAt,
          uploadedBy: file.uploadedBy,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching orphaned files:', error);

    // Handle auth errors
    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch orphaned files',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
