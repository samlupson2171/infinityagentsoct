import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { connectToDatabase } from '@/lib/mongodb';
import { eventService } from '@/lib/services/event-service';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/events
 * Retrieve all events with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const token = await requireAdmin(request);

    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const filters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      destination: searchParams.get('destination') || undefined,
      status: (searchParams.get('status') as 'all' | 'active' | 'inactive') || 'all',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      sort: searchParams.get('sort') || 'displayOrder',
    };

    // Get events
    const result = await eventService.getEvents(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error fetching events:', error);

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
          message: 'Failed to fetch events',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events
 * Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const token = await requireAdmin(request);

    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'categories'];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            details: missingFields.map((field) => ({
              field,
              message: `${field} is required`,
            })),
          },
        },
        { status: 400 }
      );
    }

    // Validate categories array
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

    // Validate destinations if not available in all destinations
    if (
      !body.availableInAllDestinations &&
      (!body.destinations || body.destinations.length === 0)
    ) {
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

    // Create event
    const eventData = {
      name: body.name,
      description: body.description,
      categories: body.categories,
      destinations: body.destinations || [],
      availableInAllDestinations: body.availableInAllDestinations || false,
      displayOrder: body.displayOrder || 0,
      pricing: body.pricing,
      createdBy: new mongoose.Types.ObjectId(token.sub),
    };

    const event = await eventService.createEvent(eventData);

    return NextResponse.json(
      {
        success: true,
        data: event,
        message: 'Event created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating event:', error);

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
          message: 'Failed to create event',
        },
      },
      { status: 500 }
    );
  }
}
