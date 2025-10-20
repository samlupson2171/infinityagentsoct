import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { eventService } from '@/lib/services/event-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/events
 * Public endpoint to retrieve events with optional destination filtering
 * Optimized with caching for performance
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');
    const category = searchParams.get('category');

    let events;

    if (destination && category) {
      // Get events by both destination and category
      events = await eventService.getEventsByDestinationAndCategory(
        destination,
        category
      );
    } else if (destination) {
      // Get events by destination (cached)
      events = await eventService.getEventsByDestination(destination);
    } else if (category) {
      // Get events by category (cached)
      events = await eventService.getEventsByCategory(category);
    } else {
      // Get all active events (cached)
      events = await eventService.getActiveEvents();
    }

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    console.error('Error fetching events:', error);

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
