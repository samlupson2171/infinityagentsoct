import { NextRequest, NextResponse } from 'next/server';
import { requireQuoteAdmin } from '@/lib/middleware/quote-auth-middleware';
import { QuoteAuditLogger } from '@/lib/audit/quote-audit-logger';
import { connectDB } from '@/lib/mongodb';
import Quote from '@/models/Quote';
import Enquiry from '@/models/Enquiry';
import { z } from 'zod';
import {
  quoteUpdateValidationSchema,
  QuoteUpdateData,
} from '@/lib/validation/quote-validation';
import { QuoteServerValidator } from '@/lib/validation/quote-server-validation';


export const dynamic = 'force-dynamic';
// Use the enhanced validation schema
const updateQuoteSchema = quoteUpdateValidationSchema;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let auditContext;

  try {
    // Verify admin authorization with quote permissions
    const { user, auditContext: audit } = await requireQuoteAdmin(request);
    auditContext = audit;

    // Connect to database
    await connectDB();

    // Find the quote
    const quote = await Quote.findById(params.id).populate([
      { path: 'enquiryId', select: 'leadName agentEmail resort departureDate' },
      { path: 'createdBy', select: 'name email' },
      { path: 'selectedEvents.eventId', select: 'name isActive pricing destinations' },
    ]);

    if (!quote) {
      await QuoteAuditLogger.logQuoteView(
        auditContext,
        params.id,
        false,
        'Quote not found'
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'QUOTE_NOT_FOUND',
            message: 'Quote not found',
          },
        },
        { status: 404 }
      );
    }

    // Log successful quote view
    await QuoteAuditLogger.logQuoteView(auditContext, params.id, true);

    return NextResponse.json({
      success: true,
      data: quote,
    });
  } catch (error: any) {
    console.error('Error fetching quote:', error);

    // Log failed quote view if we have audit context
    if (auditContext) {
      await QuoteAuditLogger.logQuoteView(
        auditContext,
        params.id,
        false,
        error.message
      );
    }

    // Handle auth errors
    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch quote',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let auditContext;
  let originalQuoteData: any = {};

  try {
    // Verify admin authorization with quote permissions
    const { user, auditContext: audit } = await requireQuoteAdmin(request);
    auditContext = audit;

    // Parse and validate request body
    const body = await request.json();
    const updateData = updateQuoteSchema.parse(body);

    // Connect to database
    await connectDB();

    // Comprehensive server-side validation for updates
    const validationResult = await QuoteServerValidator.validateQuoteUpdate(
      params.id,
      updateData,
      user.id
    );

    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Quote update validation failed',
            details: validationResult.errors,
          },
          warnings: validationResult.warnings,
        },
        { status: 400 }
      );
    }

    const quote = validationResult.data?.existingQuote;

    // Store original data for audit logging
    originalQuoteData = {
      leadName: quote.leadName,
      hotelName: quote.hotelName,
      totalPrice: quote.totalPrice,
      status: quote.status,
      version: quote.version,
    };

    // Store original version for version history
    const originalVersion = quote.version;

    // Track if price changed for price history
    const priceChanged = updateData.totalPrice !== undefined && 
                        updateData.totalPrice !== quote.totalPrice;
    const oldPrice = quote.totalPrice;

    // Handle selectedEvents with validation
    if (updateData.selectedEvents !== undefined) {
      if (updateData.selectedEvents && updateData.selectedEvents.length > 0) {
        // Validate events exist and are active
        const Event = (await import('@/models/Event')).default;
        const eventIds = updateData.selectedEvents.map((e) => e.eventId);
        const events = await Event.find({
          _id: { $in: eventIds },
        });

        // Check if all events exist
        const foundEventIds = events.map((e) => e._id.toString());
        const missingEvents = updateData.selectedEvents.filter(
          (e) => !foundEventIds.includes(e.eventId)
        );

        if (missingEvents.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INVALID_EVENTS',
                message: 'Some selected events are not available',
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
            `Warning: ${inactiveEvents.length} event(s) are currently inactive: ${inactiveEvents.map((e) => e.name).join(', ')}`
          );
        }

        // Check for event price changes
        const eventPriceChanges = updateData.selectedEvents
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

        if (eventPriceChanges.length > 0) {
          warnings.push(
            `Note: ${eventPriceChanges.length} event(s) have different current prices than stored prices`
          );
        }

        // Store warnings in response context (will be added to response later)
        (quote as any)._warnings = warnings;
      }
    }

    // Update quote fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        if (key === 'arrivalDate') {
          quote[key] = new Date(updateData[key] as string);
        } else if (key === 'linkedPackage' && updateData.linkedPackage) {
          // Handle linkedPackage with proper date conversion
          quote.linkedPackage = {
            ...updateData.linkedPackage,
            lastRecalculatedAt: updateData.linkedPackage.lastRecalculatedAt
              ? new Date(updateData.linkedPackage.lastRecalculatedAt)
              : quote.linkedPackage?.lastRecalculatedAt,
          } as any;
        } else if (key === 'priceHistory' && updateData.priceHistory) {
          // Handle priceHistory with proper date conversion
          quote.priceHistory = updateData.priceHistory.map((entry) => ({
            ...entry,
            timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
            userId: entry.userId,
          })) as any;
        } else if (key === 'selectedEvents' && updateData.selectedEvents) {
          // Handle selectedEvents with proper date conversion
          quote.selectedEvents = updateData.selectedEvents.map((event) => ({
            ...event,
            addedAt: event.addedAt ? new Date(event.addedAt) : new Date(),
          })) as any;
        } else if (key !== 'linkedPackage' && key !== 'priceHistory' && key !== 'selectedEvents') {
          (quote as any)[key] = updateData[key as keyof typeof updateData];
        }
      }
    });

    // Add price change to history if price was updated
    if (priceChanged && updateData.totalPrice !== undefined) {
      if (!quote.priceHistory) {
        quote.priceHistory = [];
      }

      // Determine the reason for price change
      let reason: 'package_selection' | 'recalculation' | 'manual_override' | 'event_added' | 'event_removed' = 'manual_override';
      
      // Check if this is from a recalculation (linkedPackage updated with new lastRecalculatedAt)
      if (updateData.linkedPackage?.lastRecalculatedAt) {
        reason = 'recalculation';
      } else if (updateData.linkedPackage && !quote.linkedPackage) {
        // New package selection
        reason = 'package_selection';
      } else if (updateData.selectedEvents !== undefined) {
        // Events were added or removed
        const oldEventCount = quote.selectedEvents?.length || 0;
        const newEventCount = updateData.selectedEvents?.length || 0;
        
        if (newEventCount > oldEventCount) {
          reason = 'event_added';
        } else if (newEventCount < oldEventCount) {
          reason = 'event_removed';
        }
      } else if (quote.linkedPackage?.customPriceApplied) {
        // Manual override when custom price is applied
        reason = 'manual_override';
      }

      quote.priceHistory.push({
        price: updateData.totalPrice,
        reason,
        timestamp: new Date(),
        userId: user.id,
      } as any);
    }

    // Increment version if this is a significant update
    const significantFields = [
      'totalPrice',
      'whatsIncluded',
      'hotelName',
      'arrivalDate',
    ];
    const hasSignificantChanges = significantFields.some(
      (field) => updateData[field as keyof typeof updateData] !== undefined
    );

    if (hasSignificantChanges) {
      quote.version = originalVersion + 1;
      // Update status to 'updated' if it was previously 'sent'
      if (quote.status === 'sent') {
        quote.status = 'updated';
      }
    }

    quote.updatedAt = new Date();
    await quote.save();

    // Log successful quote update
    await QuoteAuditLogger.logQuoteUpdate(
      auditContext,
      params.id,
      {
        originalData: originalQuoteData,
        updatedFields: updateData,
        versionChanged: hasSignificantChanges,
        newVersion: quote.version,
      },
      true
    );

    // Return updated quote with populated fields
    await quote.populate([
      { path: 'enquiryId', select: 'leadName agentEmail resort departureDate' },
      { path: 'createdBy', select: 'name email' },
      { path: 'selectedEvents.eventId', select: 'name isActive pricing destinations' },
    ]);

    // Extract warnings if any
    const warnings = (quote as any)._warnings;
    delete (quote as any)._warnings;

    const response: any = {
      success: true,
      data: quote,
    };

    if (warnings && warnings.length > 0) {
      response.warnings = warnings;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error updating quote:', error);

    // Log failed quote update if we have audit context
    if (auditContext) {
      await QuoteAuditLogger.logQuoteUpdate(
        auditContext,
        params.id,
        {
          originalData: originalQuoteData,
          attemptedChanges: 'unknown',
        },
        false,
        error.message
      );
    }

    // Handle auth errors
    if (error instanceof NextResponse) {
      return error;
    }

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
          message: 'Failed to update quote',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let auditContext;

  try {
    // Verify admin authorization with quote permissions
    const { user, auditContext: audit } = await requireQuoteAdmin(request);
    auditContext = audit;

    // Connect to database
    await connectDB();

    // Find the quote to delete
    const quote = await Quote.findById(params.id);
    if (!quote) {
      await QuoteAuditLogger.logQuoteDeletion(
        auditContext,
        params.id,
        false,
        'Quote not found'
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'QUOTE_NOT_FOUND',
            message: 'Quote not found',
          },
        },
        { status: 404 }
      );
    }

    // Store quote info for audit log before deletion
    const quoteInfo = {
      leadName: quote.leadName,
      hotelName: quote.hotelName,
      enquiryId: quote.enquiryId.toString(),
    };

    // Soft delete by marking as deleted (you could also hard delete)
    await Quote.findByIdAndDelete(params.id);

    // TODO: Remove quote reference from enquiry
    // This would be handled in a more complete implementation

    // Log successful quote deletion
    await QuoteAuditLogger.logAction(auditContext, {
      action: 'DELETE_QUOTE',
      resource: 'quote',
      resourceId: params.id,
      details: {
        deletedQuote: quoteInfo,
        operation: 'delete',
      },
      success: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Quote deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting quote:', error);

    // Log failed quote deletion if we have audit context
    if (auditContext) {
      await QuoteAuditLogger.logQuoteDeletion(
        auditContext,
        params.id,
        false,
        error.message
      );
    }

    // Handle auth errors
    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete quote',
        },
      },
      { status: 500 }
    );
  }
}
