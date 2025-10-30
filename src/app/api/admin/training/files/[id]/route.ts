import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FileManager } from '@/lib/file-manager';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import {
  FileErrorCode,
  createFileErrorResponse,
  createFileSuccessResponse,
} from '@/lib/errors/file-operation-errors';

export const dynamic = 'force-dynamic';
interface RouteParams {
  params: {
    id: string;
  };
}

// Delete a file
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.FORBIDDEN,
          'Admin access required',
          { fileId: params.id }
        ),
        { status: 403 }
      );
    }

    await connectToDatabase();

    const fileId = params.id;
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const success = await FileManager.deleteFile(fileId, userId);

    if (!success) {
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.FILE_NOT_FOUND,
          'File not found or permission denied',
          { fileId: params.id }
        ),
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      fileId: params.id,
    });
  } catch (error) {
    return NextResponse.json(
      createFileErrorResponse(
        FileErrorCode.INTERNAL_ERROR,
        'Failed to delete file',
        {
          fileId: params.id,
          details: error instanceof Error ? error.message : 'Unknown error',
        }
      ),
      { status: 500 }
    );
  }
}

// Get file information
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    await connectToDatabase();

    const { FileStorage } = await import('@/models');
    const file = await FileStorage.findOne({ id: params.id });

    if (!file) {
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.FILE_NOT_FOUND,
          'File not found',
          { fileId: params.id }
        ),
        { status: 404 }
      );
    }

    // Check if user has access to this file
    const isOwner = file.uploadedBy.equals(
      new mongoose.Types.ObjectId(session.user.id)
    );
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        createFileErrorResponse(
          FileErrorCode.FORBIDDEN,
          'Access denied',
          { fileId: params.id }
        ),
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      file: {
        id: file.id,
        originalName: file.originalName,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        uploadedAt: file.createdAt,
        isOrphaned: file.isOrphaned,
        associatedMaterial: file.associatedMaterial,
      },
    });
  } catch (error) {
    return NextResponse.json(
      createFileErrorResponse(
        FileErrorCode.INTERNAL_ERROR,
        'Failed to retrieve file information',
        {
          fileId: params.id,
          details: error instanceof Error ? error.message : 'Unknown error',
        }
      ),
      { status: 500 }
    );
  }
}
