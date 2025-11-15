import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { connectToDatabase } from '@/lib/mongodb';
import Event from '@/models/Event';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/quotes/calculate-events-price
 * Calculate total price for selected events
 * 
 * Request body:
 * {
 *   eventIds: string[];
 *   numberOfPeople?: number; // For future per-person pricing if needed
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   data: {
 *     events: Array<{
 *       eventId: string;
 *       eventName: string;
 *       price: number;
 *       currency: string;
 *       isActive: boolean;
 *     }>;
 *     total: number;
 *     currency: string;
 *     warnings?: string[];
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    await requireAdmin(request);

    await connectToDatabase();

    const body = await request.json();

    // Validate request body
    if (!body.eventIds || !Array.isArray(body.eventIds)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'eventIds must be an array',
            details: [
              {
                field: 'eventIds',
                message: 'eventIds is required and must be an array',
              },
            ],
          },
        },
        { status: 400 }
      );
    }

    // Validate eventIds array is not empty
    if (body.eventIds.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: {
            events: [],
            total: 0,
            currency: 'GBP',
          },
        }
      );
    }

    // Validate maximum events limit (20)
    if (body.eventIds.length > 20) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Maximum 20 events allowed per quote',
            details: [
              {
                field: 'eventIds',
                message: 'Cannot select more than 20 events',
              },
            ],
          },
        },
        { status: 400 }
      );
    }

    // Validate all eventIds are valid ObjectIds
    const invalidIds = body.eventIds.filter(
      (id: string) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid event IDs provided',
            details: [
              {
                field: 'eventIds',
                message: `Invalid event IDs: ${invalidIds.join(', ')}`,
              },
            ],
          },
        },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    const eventObjectIds = body.eventIds.map(
      (id: string) => new mongoose.Types.ObjectId(id)
    );

    // Fetch events from database
    const events = await Event.find({
      _id: { $in: eventObjectIds },
    }).select('_id name isActive pricing');

    // Check for missing events
    const foundEventIds = events.map((e) => e._id.toString());
    const missingEventIds = body.eventIds.filter(
      (id: string) => !foundEventIds.includes(id)
    );

    if (missingEventIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EVENTS_NOT_FOUND',
            message: 'Some events were not found',
            details: missingEventIds.map((id: string) => ({
              field: 'eventIds',
              message: `Event with ID ${id} not found`,
            })),
          },
        },
        { status: 404 }
      );
    }

    // Process events and calculate total
    const warnings: string[] = [];
    let total = 0;
    let primaryCurrency = 'GBP';
    const eventDetails = [];

    for (const event of events) {
      const eventPrice = event.pricing?.estimatedCost || 0;
      const eventCurrency = event.pricing?.currency || 'GBP';

      // Set primary currency from first event with pricing
      if (eventDetails.length === 0 && eventPrice > 0) {
        primaryCurrency = eventCurrency;
      }

      // Warn about inactive events
      if (!event.isActive) {
        warnings.push(
          `Event "${event.name}" is currently inactive and may not be available`
        );
      }

      // Warn about currency mismatch
      if (eventPrice > 0 && eventCurrency !== primaryCurrency) {
        warnings.push(
          `Event "${event.name}" uses ${eventCurrency} while other events use ${primaryCurrency}. Manual price adjustment may be needed.`
        );
      }

      // Warn about missing pricing
      if (!event.pricing?.estimatedCost) {
        warnings.push(
          `Event "${event.name}" does not have pricing information. Price is set to 0.`
        );
      }

      // Add to total (only if same currency as primary)
      if (eventCurrency === primaryCurrency) {
        total += eventPrice;
      }

      eventDetails.push({
        eventId: event._id.toString(),
        eventName: event.name,
        price: eventPrice,
        currency: eventCurrency,
        isActive: event.isActive,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        events: eventDetails,
        total,
        currency: primaryCurrency,
        ...(warnings.length > 0 && { warnings }),
      },
    });
  } catch (error: any) {
    console.error('Error calculating event prices:', error);

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
          message: 'Failed to calculate event prices',
        },
      },
      { status: 500 }
    );
  }
}
