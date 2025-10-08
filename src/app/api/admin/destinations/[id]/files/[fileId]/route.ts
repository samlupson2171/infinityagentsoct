import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Destination from '@/models/Destination';
import { unlink } from 'fs/promises';
import { join } from 'path';


export const dynamic = 'force-dynamic';
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    console.log('DELETE file - params:', params);
    console.log('DELETE file - destinationId:', params.id, 'fileId:', params.fileId);

    const destination = await Destination.findById(params.id);
    if (!destination) {
      console.error('Destination not found:', params.id);
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }

    console.log('Destination found, files count:', destination.files?.length);
    console.log('Looking for fileId:', params.fileId);
    console.log('Available file IDs:', destination.files?.map((f: any) => f.id));

    const fileIndex = destination.files.findIndex(
      (f: any) => f.id === params.fileId
    );
    
    if (fileIndex === -1) {
      console.error('File not found in destination. FileId:', params.fileId);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = destination.files[fileIndex];
    console.log('File found at index:', fileIndex, 'file:', file);

    // Delete physical file
    try {
      const filePath = join(process.cwd(), 'public', file.url);
      console.log('Attempting to delete physical file:', filePath);
      await unlink(filePath);
      console.log('Physical file deleted successfully');
    } catch (error) {
      console.warn('Could not delete physical file:', error);
    }

    // Remove file from destination
    destination.files.splice(fileIndex, 1);
    destination.lastModifiedBy = session.user.id;
    await destination.save();

    console.log('File removed from destination and saved');
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to delete file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const destination = await Destination.findById(params.id);
    if (!destination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }

    const fileIndex = destination.files.findIndex(
      (f: any) => f.id === params.fileId
    );
    if (fileIndex === -1) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const { description, isPublic } = await request.json();

    // Update file metadata
    if (description !== undefined) {
      destination.files[fileIndex].description = description;
    }
    if (isPublic !== undefined) {
      destination.files[fileIndex].isPublic = isPublic;
    }

    destination.lastModifiedBy = session.user.id;
    await destination.save();

    return NextResponse.json({
      message: 'File updated successfully',
      file: destination.files[fileIndex],
    });
  } catch (error) {
    console.error('Update file error:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}
