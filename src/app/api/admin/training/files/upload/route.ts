import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FileManager } from '@/lib/file-manager';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import {
  FileErrorCode,
  createFileErrorResponse,
  createFileSuccessResponse,
  FileOperationLogger,
} from '@/lib/errors/file-operation-errors';

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let uploadedFileId: string | undefined;

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.UNAUTHORIZED,
          'Authentication required'
        ),
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.FORBIDDEN,
          'Admin access required'
        ),
        { status: 403 }
      );
    }

    await connectDB();

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.NO_FILE,
          'No file provided in request'
        ),
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload file using FileManager
    const result = await FileManager.uploadFile(
      buffer,
      file.name,
      file.type,
      new mongoose.Types.ObjectId(session.user.id)
    );

    if (!result.success) {
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.UPLOAD_FAILED,
          result.error || 'File upload failed',
          { details: result.error }
        ),
        { status: 400 }
      );
    }

    uploadedFileId = result.file!.id;

    // CRITICAL: Verify file exists on filesystem after upload
    const fileExists = await FileManager.verifyFileExists(result.file!.filePath);
    
    if (!fileExists) {
      // Rollback: Delete FileStorage document
      FileOperationLogger.logRollback(
        'File Upload',
        'File verification failed',
        { fileId: result.file!.id, filePath: result.file!.filePath }
      );
      
      try {
        const { FileStorage } = await import('@/models');
        await FileStorage.deleteOne({ id: result.file!.id });
      } catch (rollbackError) {
        FileOperationLogger.logRollback(
          'File Upload',
          'Rollback failed',
          {
            fileId: result.file!.id,
            error: rollbackError instanceof Error ? rollbackError.message : 'Unknown error',
          }
        );
      }

      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.FILE_VERIFICATION_FAILED,
          'File upload verification failed - file not found after write',
          {
            fileId: result.file!.id,
            filePath: result.file!.filePath,
          }
        ),
        { status: 500 }
      );
    }

    const uploadDuration = Date.now() - startTime;
    FileOperationLogger.logUploadSuccess(
      result.file!.id,
      result.file!.originalName,
      uploadDuration
    );

    // Return complete file information (backward compatible format)
    return NextResponse.json({
      success: true,
      file: {
        id: result.file!.id,
        originalName: result.file!.originalName,
        fileName: result.file!.fileName,
        filePath: result.file!.filePath,
        mimeType: result.file!.mimeType,
        size: result.file!.size,
        uploadedAt: result.file!.createdAt,
      },
    });
  } catch (error) {
    const uploadDuration = Date.now() - startTime;
    
    // Attempt rollback if we have a file ID
    if (uploadedFileId) {
      FileOperationLogger.logRollback(
        'File Upload',
        'Emergency rollback due to critical error',
        { fileId: uploadedFileId, durationMs: uploadDuration }
      );
      
      try {
        const { FileStorage } = await import('@/models');
        await FileStorage.deleteOne({ id: uploadedFileId });
      } catch (rollbackError) {
        FileOperationLogger.logRollback(
          'File Upload',
          'Emergency rollback failed',
          {
            fileId: uploadedFileId,
            error: rollbackError instanceof Error ? rollbackError.message : 'Unknown error',
          }
        );
      }
    }

    return NextResponse.json(
      createFileErrorResponse(
        FileErrorCode.INTERNAL_ERROR,
        'Internal server error during file upload',
        {
          details: error instanceof Error ? error.message : 'Unknown error',
        }
      ),
      { status: 500 }
    );
  }
}

// Get user's uploaded files
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.UNAUTHORIZED,
          'Authentication required'
        ),
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.FORBIDDEN,
          'Admin access required'
        ),
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('materialId');

    let files;
    if (materialId) {
      // Get files for specific material
      const { FileStorage } = await import('@/models');
      files = await (FileStorage as any).findByMaterial(
        new mongoose.Types.ObjectId(materialId)
      );
    } else {
      // Get all files uploaded by user
      const { FileStorage } = await import('@/models');
      files = await (FileStorage as any).findByUploader(
        new mongoose.Types.ObjectId(session.user.id)
      );
    }

    return NextResponse.json({
      success: true,
      files: files.map((file: any) => ({
        id: file.id,
        originalName: file.originalName,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        uploadedAt: file.createdAt,
        isOrphaned: file.isOrphaned,
        associatedMaterial: file.associatedMaterial,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      createFileErrorResponse(
        FileErrorCode.INTERNAL_ERROR,
        'Failed to retrieve file list',
        {
          details: error instanceof Error ? error.message : 'Unknown error',
        }
      ),
      { status: 500 }
    );
  }
}
