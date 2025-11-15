import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import Quote from '@/models/Quote';
import Enquiry from '@/models/Enquiry';
import { z } from 'zod';
import {
  quoteFormValidationSchema,
  QuoteFormData,
} from '@/lib/validation/quote-validation';


export const dynamic = 'force-dynamic';
// Use the enhanced validation schema
const createQuoteSchema = quoteFormValidationSchema;

async function postHandler(request: NextRequest) {
  try {
    // Simple authentication check
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (token.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required',
          },
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const quoteData = quoteFormValidationSchema.parse(body);

    // Connect to database
    await connectDB();

    // Validate enquiry exists
    const enquiry = await Enquiry.findById(quoteData.enquiryId);
    if (!enquiry) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Enquiry not found',
          },
        },
        { status: 404 }
      );
    }

    // Prepare quote data with proper type conversions
    const quotePayload: any = {
      ...quoteData,
      arrivalDate: new Date(quoteData.arrivalDate),
      createdBy: token.sub,
      status: 'draft',
    };

    // Handle linkedPackage with proper date conversion
    if (quoteData.linkedPackage) {
      quotePayload.linkedPackage = {
        ...quoteData.linkedPackage,
        lastRecalculatedAt: quoteData.linkedPackage.lastRecalculatedAt
          ? new Date(quoteData.linkedPackage.lastRecalculatedAt)
          : undefined,
      };
    }

    // Handle selectedEvents with validation and proper date conversion
    if (quoteData.selectedEvents && quoteData.selectedEvents.length > 0) {
      // Validate events exist and are active
      const Event = (await import('@/models/Event')).default;
      const eventIds = quoteData.selectedEvents.map((e) => e.eventId);
      const events = await Event.find({
        _id: { $in: eventIds },
      });

      // Check if all events exist
      const foundEventIds = events.map((e) => e._id.toString());
      const missingEvents = quoteData.selectedEvents.filter(
        (e) => !foundEventIds.includes(e.eventId)
      );

      if (missingEvents.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_EVENTS',
              message: 'Some selected events do not exist',
              details: missingEvents.map((e) => ({
                eventId: e.eventId,
                eventName: e.eventName,
              })),
            },
          },
          { status: 400 }
        );
      }

      // Check for inactive events and provide warning
      const inactiveEvents = events.filter((e) => !e.isActive);
      const warnings: string[] = [];
      
      if (inactiveEvents.length > 0) {
        warnings.push(
          `Warning: ${inactiveEvents.length} event(s) are currently inactive and may not be available: ${inactiveEvents.map((e) => e.name).join(', ')}`
        );
      }

      // Check for event price changes and provide warnings
      const eventPriceWarnings = quoteData.selectedEvents
        .map((selectedEvent) => {
          const event = events.find((e) => e._id.toString() === selectedEvent.eventId);
          if (event && event.pricing?.estimatedCost !== undefined) {
            if (event.pricing.estimatedCost !== selectedEvent.eventPrice) {
              return {
                eventName: selectedEvent.eventName,
                storedPrice: selectedEvent.eventPrice,
                currentPrice: event.pricing.estimatedCost,
              };
            }
          }
          return null;
        })
        .filter((change) => change !== null);

      if (eventPriceWarnings.length > 0) {
        warnings.push(
          `Note: ${eventPriceWarnings.length} event(s) have different current prices than the prices being saved. The quote will use the prices you specified.`
        );
      }

      // Store warnings in payload context (will be added to response later)
      (quotePayload as any)._warnings = warnings;

      // Convert selectedEvents with proper date handling
      quotePayload.selectedEvents = quoteData.selectedEvents.map((event) => ({
        ...event,
        addedAt: event.addedAt ? new Date(event.addedAt) : new Date(),
      }));
    }

    // Handle priceHistory with proper date conversion and user ID
    if (quoteData.priceHistory && quoteData.priceHistory.length > 0) {
      quotePayload.priceHistory = quoteData.priceHistory.map((entry) => ({
        ...entry,
        timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
        userId: entry.userId,
      }));
    } else if (quoteData.linkedPackage && typeof quoteData.linkedPackage.calculatedPrice === 'number') {
      // Initialize price history with package selection if not provided
      quotePayload.priceHistory = [
        {
          price: quoteData.totalPrice,
          reason: 'package_selection',
          timestamp: new Date(),
          userId: token.sub,
        },
      ];
    }

    // Create the quote
    const quote = new Quote(quotePayload);

    await quote.save();

    // Update the enquiry
    if (!enquiry.quotes) {
      enquiry.quotes = [];
    }
    enquiry.quotes.push(quote._id);
    enquiry.hasQuotes = true;
    enquiry.latestQuoteDate = new Date();
    enquiry.quotesCount = enquiry.quotes.length;
    await enquiry.save();

    // Populate the quote with related data
    await quote.populate([
      { path: 'enquiryId', select: 'leadName agentEmail resort' },
      { path: 'createdBy', select: 'name email' },
      { path: 'selectedEvents.eventId', select: 'name isActive pricing destinations' },
    ]);

    // Extract warnings if any
    const warnings = (quotePayload as any)._warnings;

    const response: any = {
      success: true,
      data: quote,
    };

    if (warnings && warnings.length > 0) {
      response.warnings = warnings;
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating quote:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create quote',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

async function getHandler(request: NextRequest) {
  try {
    // Simple authentication check
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (token.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required',
          },
        },
        { status: 403 }
      );
    }

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const enquiryId = searchParams.get('enquiryId');

    // Build query
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { leadName: { $regex: search, $options: 'i' } },
        { hotelName: { $regex: search, $options: 'i' } },
        { internalNotes: { $regex: search, $options: 'i' } },
      ];
    }

    if (enquiryId) {
      query.enquiryId = enquiryId;
    }

    // Get quotes with pagination
    const skip = (page - 1) * limit;
    const [quotes, totalQuotes] = await Promise.all([
      Quote.find(query)
        .populate('enquiryId', 'leadName agentEmail resort')
        .populate('createdBy', 'name email')
        .populate('selectedEvents.eventId', 'name isActive pricing')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Quote.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalQuotes / limit);

    return NextResponse.json({
      success: true,
      data: {
        quotes,
        pagination: {
          currentPage: page,
          totalPages,
          totalQuotes,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching quotes:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch quotes',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

// Export handlers
export const POST = postHandler;
export const GET = getHandler;
