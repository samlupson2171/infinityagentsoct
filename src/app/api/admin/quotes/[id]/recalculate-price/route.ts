import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireQuoteAdmin } from '@/lib/middleware/quote-auth-middleware';
import { QuoteAuditLogger } from '@/lib/audit/quote-audit-logger';
import { connectDB } from '@/lib/mongodb';
import Quote from '@/models/Quote';
import SuperOfferPackage from '@/models/SuperOfferPackage';
import { PricingCalculator } from '@/lib/pricing-calculator';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/quotes/[id]/recalculate-price
 * Recalculates the price for a quote based on its linked package
 * Returns price comparison (old vs new) without applying changes
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let auditContext;

  try {
    // Verify admin authorization
    const { user, auditContext: audit } = await requireQuoteAdmin(request);
    auditContext = audit;

    // Connect to database
    await connectDB();

    // Find the quote
    const quote = await Quote.findById(params.id);

    if (!quote) {
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

    // Check if quote has a linked package
    if (!quote.linkedPackage) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_LINKED_PACKAGE',
            message: 'This quote is not linked to a super package',
          },
        },
        { status: 400 }
      );
    }

    // Find the linked package
    const packageDoc = await SuperOfferPackage.findById(
      quote.linkedPackage.packageId
    );

    if (!packageDoc) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PACKAGE_NOT_FOUND',
            message: 'The linked package no longer exists',
            details: {
              packageId: quote.linkedPackage.packageId.toString(),
              packageName: quote.linkedPackage.packageName,
            },
          },
        },
        { status: 404 }
      );
    }

    // Check if package is active
    if (packageDoc.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PACKAGE_INACTIVE',
            message: `The linked package is ${packageDoc.status}`,
            details: {
              packageId: packageDoc._id.toString(),
              packageName: packageDoc.name,
              status: packageDoc.status,
            },
          },
        },
        { status: 400 }
      );
    }

    // Calculate new price with current parameters
    try {
      const arrivalDate = new Date(quote.arrivalDate);
      const result = PricingCalculator.calculatePrice(
        packageDoc,
        quote.numberOfPeople,
        quote.numberOfNights,
        arrivalDate
      );

      // Check for calculation error
      if ('error' in result) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CALCULATION_ERROR',
              message: result.error,
            },
          },
          { status: 400 }
        );
      }

      // Check if price is ON_REQUEST
      if (result.price === 'ON_REQUEST') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PRICE_ON_REQUEST',
              message: 'The package pricing is set to "ON REQUEST" for these parameters',
              details: {
                tierUsed: result.tier.label,
                periodUsed: result.period.period,
              },
            },
          },
          { status: 400 }
        );
      }

      // Build comparison data
      const oldPrice = quote.totalPrice;
      const newPrice = result.price;
      const priceDifference = newPrice - oldPrice;
      const percentageChange =
        oldPrice > 0 ? ((priceDifference / oldPrice) * 100).toFixed(2) : '0';

      // Check if package version changed
      const packageVersionChanged =
        packageDoc.version !== quote.linkedPackage.packageVersion;

      // Log the recalculation attempt
      await QuoteAuditLogger.logAction(auditContext, {
        action: 'RECALCULATE_PRICE',
        resource: 'quote',
        resourceId: params.id,
        details: {
          oldPrice,
          newPrice,
          priceDifference,
          percentageChange,
          packageVersionChanged,
          parameters: {
            numberOfPeople: quote.numberOfPeople,
            numberOfNights: quote.numberOfNights,
            arrivalDate: quote.arrivalDate,
          },
        },
        success: true,
      });

      return NextResponse.json({
        success: true,
        data: {
          comparison: {
            oldPrice,
            newPrice,
            priceDifference,
            percentageChange: parseFloat(percentageChange),
            currency: quote.currency,
          },
          priceCalculation: {
            price: newPrice,
            tierUsed: result.tier.label,
            tierIndex: result.tier.index,
            periodUsed: result.period.period,
            breakdown: {
              pricePerPerson: newPrice / quote.numberOfPeople,
              numberOfPeople: quote.numberOfPeople,
              totalPrice: newPrice,
            },
          },
          packageInfo: {
            packageId: packageDoc._id.toString(),
            packageName: packageDoc.name,
            currentVersion: packageDoc.version,
            linkedVersion: quote.linkedPackage.packageVersion,
            versionChanged: packageVersionChanged,
          },
          parameters: {
            numberOfPeople: quote.numberOfPeople,
            numberOfNights: quote.numberOfNights,
            arrivalDate: quote.arrivalDate.toISOString().split('T')[0],
          },
        },
      });
    } catch (calcError: any) {
      // Handle calculation errors (invalid parameters, etc.)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CALCULATION_ERROR',
            message: calcError.message || 'Failed to calculate price',
            details: {
              parameters: {
                numberOfPeople: quote.numberOfPeople,
                numberOfNights: quote.numberOfNights,
                arrivalDate: quote.arrivalDate,
              },
            },
          },
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error recalculating price:', error);

    // Log failed recalculation if we have audit context
    if (auditContext) {
      await QuoteAuditLogger.logAction(auditContext, {
        action: 'RECALCULATE_PRICE',
        resource: 'quote',
        resourceId: params.id,
        details: {
          error: error.message,
        },
        success: false,
      });
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
          message: 'Failed to recalculate price',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/quotes/[id]/recalculate-price
 * Applies the recalculated price to the quote
 * Updates the quote and logs the change in version history
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let auditContext;

  try {
    // Verify admin authorization
    const { user, auditContext: audit } = await requireQuoteAdmin(request);
    auditContext = audit;

    // Parse request body
    const body = await request.json();
    const { newPrice, priceCalculation } = body;

    if (!newPrice || typeof newPrice !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'New price is required',
          },
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the quote
    const quote = await Quote.findById(params.id);

    if (!quote) {
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

    // Store old price for history
    const oldPrice = quote.totalPrice;

    // Update the price
    quote.totalPrice = newPrice;

    // Update linked package info if provided
    if (priceCalculation && quote.linkedPackage) {
      quote.linkedPackage.calculatedPrice = newPrice;
      quote.linkedPackage.lastRecalculatedAt = new Date();
      quote.linkedPackage.customPriceApplied = false; // Reset custom price flag

      // Update tier info if provided
      if (priceCalculation.tierUsed) {
        quote.linkedPackage.selectedTier.tierLabel = priceCalculation.tierUsed;
        quote.linkedPackage.selectedTier.tierIndex = priceCalculation.tierIndex;
      }

      // Update period if provided
      if (priceCalculation.periodUsed) {
        quote.linkedPackage.selectedPeriod = priceCalculation.periodUsed;
      }
    }

    // Add to price history
    if (!quote.priceHistory) {
      quote.priceHistory = [];
    }

    quote.priceHistory.push({
      price: newPrice,
      reason: 'recalculation',
      timestamp: new Date(),
      userId: new mongoose.Types.ObjectId(user.id),
    });

    // Increment version for significant change
    quote.version += 1;

    // Update status if it was sent
    if (quote.status === 'sent') {
      quote.status = 'updated';
    }

    quote.updatedAt = new Date();

    await quote.save();

    // Log the price update
    await QuoteAuditLogger.logQuoteUpdate(
      auditContext,
      params.id,
      {
        originalData: { totalPrice: oldPrice },
        updatedFields: { totalPrice: newPrice },
        versionChanged: true,
        newVersion: quote.version,
        priceRecalculation: true,
      },
      true
    );

    // Return updated quote
    await quote.populate([
      { path: 'enquiryId', select: 'leadName agentEmail resort departureDate' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return NextResponse.json({
      success: true,
      data: quote,
      message: 'Price updated successfully',
    });
  } catch (error: any) {
    console.error('Error applying recalculated price:', error);

    // Log failed update if we have audit context
    if (auditContext) {
      await QuoteAuditLogger.logAction(auditContext, {
        action: 'APPLY_RECALCULATED_PRICE',
        resource: 'quote',
        resourceId: params.id,
        details: {
          error: error.message,
        },
        success: false,
      });
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
          message: 'Failed to apply recalculated price',
        },
      },
      { status: 500 }
    );
  }
}
