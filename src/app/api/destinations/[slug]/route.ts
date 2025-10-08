import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Destination from '@/models/Destination';


export const dynamic = 'force-dynamic';
// GET /api/destinations/[slug] - Get individual destination by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    await connectToDatabase();

    // Find published destination by slug
    const destination = await Destination.findOne({
      slug,
      status: 'published',
    }).lean();

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }

    // Transform data for public consumption
    const dest = Array.isArray(destination) ? destination[0] : destination;
    const transformedDestination = {
      id: dest.slug,
      _id: dest._id,
      name: dest.name,
      slug: dest.slug,
      country: dest.country,
      region: dest.region,
      description: dest.description,
      heroImage: dest.heroImage,
      galleryImages: dest.galleryImages || [],
      gradientColors: dest.gradientColors,
      files: dest.files || [],
      sections: dest.sections,
      quickFacts: dest.quickFacts,
      publishedAt: dest.publishedAt,
      // Generate breadcrumb data
      breadcrumb: [
        { name: 'Destinations', href: '/destinations' },
        { name: dest.name, href: `/destinations/${dest.slug}` },
      ],
    };

    return NextResponse.json(transformedDestination);
  } catch (error) {
    console.error('Error fetching destination:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destination' },
      { status: 500 }
    );
  }
}
