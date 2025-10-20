import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { connectToDatabase } from '@/lib/mongodb';
import { eventService } from '@/lib/services/event-service';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/events/[id]
 * Get a single event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    await requireAdmin(request);

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

    const event = await eventService.getEventById(id);

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
    });
  } catch (error: any) {
    console.error('Error fetching event:', error);

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

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch event',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/events/[id]
 * Update an existing event
 */
export async function PUT(
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

    // Validate categories array if provided
    if (body.categories !== undefined) {
      if (!Array.isArray(body.categories) || body.categories.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'At least one category is required',
              details: [
                {
                  field: 'categories',
                  message: 'At least one category is required',
                },
              ],
            },
          },
          { status: 400 }
        );
      }
    }

    // Validate destinations if not available in all destinations
    if (body.availableInAllDestinations === false) {
      if (!body.destinations || body.destinations.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'At least one destination is required unless event is available in all destinations',
              details: [
                {
                  field: 'destinations',
                  message: 'At least one destination is required',
                },
              ],
            },
          },
          { status: 400 }
        );
      }
    }

    // Update event
    const updateData = {
      ...body,
      updatedBy: new mongoose.Types.ObjectId(token.sub),
    };

    const event = await eventService.updateEvent(id, updateData);

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
      message: 'Event updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating event:', error);

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
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_NAME',
            message: error.message,
            details: [
              {
                field: 'name',
                message: error.message,
              },
            ],
          },
        },
        { status: 409 }
      );
    }

    if (error.message.includes('categories')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
            details: [
              {
                field: 'categories',
                message: error.message,
              },
            ],
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
          message: 'Failed to update event',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Soft delete an event (or hard delete with force=true)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const token = await requireAdmin(request);

    await connectToDatabase();

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

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

    if (force) {
      // Hard delete
      try {
        const deleted = await eventService.hardDeleteEvent(id);

        if (!deleted) {
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
          message: 'Event permanently deleted',
        });
      } catch (error: any) {
        if (error.message.includes('referenced')) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'IN_USE',
                message: error.message,
              },
            },
            { status: 409 }
          );
        }
        throw error;
      }
    } else {
      // Soft delete
      const event = await eventService.softDeleteEvent(
        id,
        new mongoose.Types.ObjectId(token.sub)
      );

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
        message: 'Event deactivated successfully',
      });
    }
  } catch (error: any) {
    console.error('Error deleting event:', error);

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

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to delete event',
        },
      },
      { status: 500 }
    );
  }
}
