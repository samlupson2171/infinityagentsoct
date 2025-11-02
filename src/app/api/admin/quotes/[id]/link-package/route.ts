import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Quote from '@/models/Quote';
import SuperOfferPackage from '@/models/SuperOfferPackage';
import { PricingCalculator } from '@/lib/pricing-calculator';
import { QuoteLinker } from '@/lib/quote-linker';
import mongoose from 'mongoose';

/**
 * POST /api/admin/quotes/[id]/link-package
 * 
 * Links a super package to a quote and calculates the price.
 * 
 * Request Body:
 * - packageId: string - ID of the package to link
 * - numberOfPeople: number - Number of people
 * - numberOfNights: number - Number of nights
 * - arrivalDate: string - Arrival date in ISO format
 * 
 * Response:
 * - calculation.pricePerPerson: number | 'ON_REQUEST' - Per-person price from database
 * - calculation.totalPrice: number | 'ON_REQUEST' - Total price (pricePerPerson × numberOfPeople)
 * - calculation.price: number | 'ON_REQUEST' - @deprecated Use totalPrice
 * - calculation.numberOfPeople: number - Number of people used in calculation
 * - quote: object - Updated quote with linked package
 * 
 * @returns {Promise<NextResponse>} Updated quote and price calculation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }

    const body = await request.json();
    const { packageId, numberOfPeople, numberOfNights, arrivalDate } = body;

    // Validate inputs
    if (!packageId || !numberOfPeople || !numberOfNights || !arrivalDate) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: packageId, numberOfPeople, numberOfNights, arrivalDate',
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 });
    }

    // Fetch quote
    const quote = await Quote.findById(params.id);

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Fetch package
    const packageData = await SuperOfferPackage.findById(packageId).lean();

    if (!packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    if (packageData.status !== 'active') {
      return NextResponse.json(
        { error: 'Package is not active' },
        { status: 400 }
      );
    }

    // Parse arrival date
    const arrival = new Date(arrivalDate);

    if (isNaN(arrival.getTime())) {
      return NextResponse.json(
        { error: 'Invalid arrival date format' },
        { status: 400 }
      );
    }

    // Calculate price
    const calculation = PricingCalculator.calculatePrice(
      packageData,
      parseInt(numberOfPeople),
      parseInt(numberOfNights),
      arrival
    );

    if ('error' in calculation) {
      return NextResponse.json({ error: calculation.error }, { status: 400 });
    }

    // Link package to quote
    const linkingData = {
      packageId,
      numberOfPeople: parseInt(numberOfPeople),
      numberOfNights: parseInt(numberOfNights),
      arrivalDate: arrival,
      calculation,
    };

    const updatedQuoteData = QuoteLinker.linkPackageToQuote(
      quote.toObject(),
      packageData,
      linkingData
    );

    // Update quote in database
    Object.assign(quote, updatedQuoteData);
    await quote.save();

    return NextResponse.json({
      quote,
      calculation,
      message: 'Package linked to quote successfully',
    });
  } catch (error) {
    console.error('Error linking package to quote:', error);
    return NextResponse.json(
      { error: 'Failed to link package to quote' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }

    // Fetch quote
    const quote = await Quote.findById(params.id);

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Unlink package
    const updatedQuoteData = QuoteLinker.unlinkPackageFromQuote(quote.toObject());

    Object.assign(quote, updatedQuoteData);
    await quote.save();

    return NextResponse.json({
      quote,
      message: 'Package unlinked from quote successfully',
    });
  } catch (error) {
    console.error('Error unlinking package from quote:', error);
    return NextResponse.json(
      { error: 'Failed to unlink package from quote' },
      { status: 500 }
    );
  }
}
