import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { connectToDatabase } from '@/lib/mongodb';
import { categoryService } from '@/lib/services/category-service';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/events/categories/[id]
 * Get a single category by ID
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
            message: 'Invalid category ID format',
          },
        },
        { status: 400 }
      );
    }

    const category = await categoryService.getCategoryById(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    console.error('Error fetching category:', error);

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
          message: 'Failed to fetch category',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/events/categories/[id]
 * Update an existing category
 */
export async function PUT(
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
            message: 'Invalid category ID format',
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate slug format if provided
    if (body.slug && !/^[a-z0-9-]+$/.test(body.slug)) {
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

    // Update category
    const category = await categoryService.updateCategory(id, body);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating category:', error);

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

    if (error.message.includes('System categories')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SYSTEM_CATEGORY',
            message: error.message,
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update category',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/categories/[id]
 * Delete a category (with usage validation)
 */
export async function DELETE(
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
            message: 'Invalid category ID format',
          },
        },
        { status: 400 }
      );
    }

    try {
      const deleted = await categoryService.deleteCategory(id);

      if (!deleted) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Category not found',
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error: any) {
      if (error.message.includes('System categories')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'SYSTEM_CATEGORY',
              message: error.message,
            },
          },
          { status: 403 }
        );
      }

      if (error.message.includes('in use')) {
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
  } catch (error: any) {
    console.error('Error deleting category:', error);

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
          message: 'Failed to delete category',
        },
      },
      { status: 500 }
    );
  }
}
