import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { connectToDatabase } from '@/lib/mongodb';
import { eventService } from '@/lib/services/event-service';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/events/[id]/status
 * Toggle event active status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const token = await requireAdmin(request);

    await connectToDatabase();

    const { id } = params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid event ID format',
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate isActive field
    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'isActive must be a boolean value',
            details: [
              {
                field: 'isActive',
                message: 'isActive must be a boolean value',
              },
            ],
          },
        },
        { status: 400 }
      );
    }

    // Update event status
    const event = await eventService.updateEvent(id, {
      isActive: body.isActive,
      updatedBy: new mongoose.Types.ObjectId(token.sub),
    });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Event not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
      message: `Event ${body.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    console.error('Error updating event status:', error);

    // Handle authentication/authorization errors
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.status }
      );
    }

    // Handle validation errors
    if (error.message.includes('category') || error.message.includes('destination')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update event status',
        },
      },
      { status: 500 }
    );
  }
}
