import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { connectToDatabase } from '@/lib/mongodb';
import { categoryService } from '@/lib/services/category-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/events/categories
 * Retrieve all categories with optional event counts
 * 
 * Public Access: When activeOnly=true, this endpoint allows unauthenticated access
 * to support the public enquiry form. This is safe because:
 * - Only returns active (published) categories
 * - No sensitive data is exposed
 * - Read-only operation
 * 
 * Admin Access: All other operations require authentication
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const includeEventCount = searchParams.get('includeEventCount') === 'true';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // Only require authentication if NOT requesting active categories only
    // This allows the public enquiry form to fetch active categories
    // while keeping admin operations (includeEventCount, all categories) protected
    if (!activeOnly) {
      await requireAdmin(request);
    }

    let categories;

    if (includeEventCount) {
      categories = await categoryService.getCategoriesWithEventCount();
    } else if (activeOnly) {
      categories = await categoryService.getActiveCategories();
    } else {
      categories = await categoryService.getCategories(false);
    }

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);

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
          message: 'Failed to fetch categories',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events/categories
 * Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    await requireAdmin(request);

    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'slug'];
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

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid slug format',
            details: [
              {
                field: 'slug',
                message: 'Slug can only contain lowercase letters, numbers, and hyphens',
              },
            ],
          },
        },
        { status: 400 }
      );
    }

    // Validate color format if provided
    if (body.color && !/^#[0-9A-Fa-f]{6}$/.test(body.color)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid color format',
            details: [
              {
                field: 'color',
                message: 'Color must be a valid hex color code (e.g., #FF5733)',
              },
            ],
          },
        },
        { status: 400 }
      );
    }

    // Create category
    const categoryData = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      icon: body.icon,
      color: body.color,
      displayOrder: body.displayOrder || 0,
    };

    const category = await categoryService.createCategory(categoryData);

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: 'Category created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating category:', error);

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
            code: 'DUPLICATE_SLUG',
            message: error.message,
            details: [
              {
                field: 'slug',
                message: error.message,
              },
            ],
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create category',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/events/categories
 * Update display order for multiple categories
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate and authorize
    await requireAdmin(request);

    await connectToDatabase();

    const body = await request.json();

    // Validate request body
    if (!Array.isArray(body.updates)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Updates must be an array',
          },
        },
        { status: 400 }
      );
    }

    // Validate each update
    for (const update of body.updates) {
      if (!update.id || typeof update.displayOrder !== 'number') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Each update must have id and displayOrder',
            },
          },
          { status: 400 }
        );
      }
    }

    await categoryService.updateDisplayOrder(body.updates);

    return NextResponse.json({
      success: true,
      message: 'Display order updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating display order:', error);

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
          message: 'Failed to update display order',
        },
      },
      { status: 500 }
    );
  }
}
