import mongoose from 'mongoose';
import Category, { ICategory } from '@/models/Category';
import Event from '@/models/Event';
import { EventCache } from './event-cache';

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder?: number;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export class CategoryService {
  private cache: EventCache;

  constructor() {
    this.cache = new EventCache();
  }

  /**
   * Get all categories
   */
  async getCategories(activeOnly: boolean = false): Promise<ICategory[]> {
    const cacheKey = activeOnly ? 'categories:active' : 'categories:all';
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const query = activeOnly ? { isActive: true } : {};
    const categories = await Category.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    await this.cache.set(cacheKey, categories);
    return categories as any as ICategory[];
  }

  /**
   * Get active categories
   */
  async getActiveCategories(): Promise<ICategory[]> {
    return this.getCategories(true);
  }

  /**
   * Get system categories
   */
  async getSystemCategories(): Promise<ICategory[]> {
    const cacheKey = 'categories:system';
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const categories = await Category.find({ isSystem: true, isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    await this.cache.set(cacheKey, categories);
    return categories as any as ICategory[];
  }

  /**
   * Get custom categories
   */
  async getCustomCategories(): Promise<ICategory[]> {
    const cacheKey = 'categories:custom';
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const categories = await Category.find({ isSystem: false, isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    await this.cache.set(cacheKey, categories);
    return categories as any as ICategory[];
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<ICategory | null> {
    const category = await Category.findById(id).lean();
    return category as ICategory | null;
  }

  /**
   * Get a category by slug
   */
  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    const cacheKey = `category:slug:${slug}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const category = await Category.findOne({ slug, isActive: true }).lean();

    if (category) {
      await this.cache.set(cacheKey, category);
    }

    return category as ICategory | null;
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryData): Promise<ICategory> {
    // Validate unique slug
    await this.validateUniqueSlug(data.slug);

    // Create category
    const category = new Category({
      ...data,
      isSystem: false,
      isActive: true,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await category.save();

    // Invalidate cache
    await this.cache.invalidate('categories:*');

    return category;
  }

  /**
   * Update an existing category
   */
  async updateCategory(
    id: string,
    data: UpdateCategoryData
  ): Promise<ICategory | null> {
    const category = await Category.findById(id);

    if (!category) {
      return null;
    }

    // Prevent updating system categories' core properties
    if (category.isSystem) {
      // Only allow updating display order and active status for system categories
      if (data.displayOrder !== undefined) {
        category.displayOrder = data.displayOrder;
      }
      if (data.isActive !== undefined) {
        category.isActive = data.isActive;
      }
    } else {
      // Validate unique slug if changed
      if (data.slug && data.slug !== category.slug) {
        await this.validateUniqueSlug(data.slug);
        category.slug = data.slug;
      }

      // Update other fields
      if (data.name) category.name = data.name;
      if (data.description !== undefined) category.description = data.description;
      if (data.icon !== undefined) category.icon = data.icon;
      if (data.color !== undefined) category.color = data.color;
      if (data.displayOrder !== undefined) category.displayOrder = data.displayOrder;
      if (data.isActive !== undefined) category.isActive = data.isActive;
    }

    category.metadata.updatedAt = new Date();
    await category.save();

    // Invalidate cache
    await this.cache.invalidate('categories:*');
    await this.cache.invalidate('events:*'); // Events cache includes category data

    return category;
  }

  /**
   * Toggle category active status
   */
  async toggleCategoryStatus(id: string): Promise<ICategory | null> {
    const category = await Category.findById(id);

    if (!category) {
      return null;
    }

    category.isActive = !category.isActive;
    category.metadata.updatedAt = new Date();

    await category.save();

    // Invalidate cache
    await this.cache.invalidate('categories:*');
    await this.cache.invalidate('events:*');

    return category;
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<boolean> {
    const category = await Category.findById(id);

    if (!category) {
      return false;
    }

    // Prevent deletion of system categories
    if (category.isSystem) {
      throw new Error('System categories cannot be deleted');
    }

    // Check if category is in use by events
    const isInUse = await this.isCategoryInUse(id);

    if (isInUse) {
      throw new Error('Cannot delete category that is in use by events');
    }

    await Category.findByIdAndDelete(id);

    // Invalidate cache
    await this.cache.invalidate('categories:*');

    return true;
  }

  /**
   * Update display order for multiple categories
   */
  async updateDisplayOrder(
    updates: Array<{ id: string; displayOrder: number }>
  ): Promise<void> {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(update.id) },
        update: {
          $set: {
            displayOrder: update.displayOrder,
            'metadata.updatedAt': new Date(),
          },
        },
      },
    }));

    await Category.bulkWrite(bulkOps);

    // Invalidate cache
    await this.cache.invalidate('categories:*');
  }

  /**
   * Get event count for each category
   */
  async getCategoriesWithEventCount(): Promise<
    Array<any>
  > {
    const categories = await this.getActiveCategories();

    const categoriesWithCount = await Promise.all(
      categories.map(async (category: any) => {
        const eventCount = await Event.countDocuments({
          isActive: true,
          categories: category._id,
        });

        return {
          ...category,
          eventCount,
        };
      })
    );

    return categoriesWithCount;
  }

  /**
   * Validate that slug is unique
   */
  private async validateUniqueSlug(
    slug: string,
    excludeId?: string
  ): Promise<void> {
    const query: any = { slug };
    if (excludeId) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const existing = await Category.findOne(query);

    if (existing) {
      throw new Error('Category slug already exists');
    }
  }

  /**
   * Check if category is in use by events
   */
  private async isCategoryInUse(categoryId: string): Promise<boolean> {
    const count = await Event.countDocuments({
      categories: new mongoose.Types.ObjectId(categoryId),
    });

    return count > 0;
  }

  /**
   * Seed predefined system categories
   */
  async seedSystemCategories(): Promise<void> {
    const systemCategories = [
      {
        name: 'Day',
        slug: 'day',
        description: 'Daytime activities and events',
        icon: 'sun',
        color: '#FDB813',
        displayOrder: 1,
      },
      {
        name: 'Night',
        slug: 'night',
        description: 'Nighttime activities and events',
        icon: 'moon',
        color: '#1E3A8A',
        displayOrder: 2,
      },
      {
        name: 'Adult',
        slug: 'adult',
        description: 'Adult-oriented activities',
        icon: 'users',
        color: '#DC2626',
        displayOrder: 3,
      },
      {
        name: 'Stag',
        slug: 'stag',
        description: 'Stag party activities',
        icon: 'male',
        color: '#059669',
        displayOrder: 4,
      },
      {
        name: 'Hen',
        slug: 'hen',
        description: 'Hen party activities',
        icon: 'female',
        color: '#EC4899',
        displayOrder: 5,
      },
    ];

    for (const categoryData of systemCategories) {
      const existing = await Category.findOne({ slug: categoryData.slug });

      if (!existing) {
        const category = new Category({
          ...categoryData,
          isSystem: true,
          isActive: true,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        await category.save();
      }
    }

    // Invalidate cache
    await this.cache.invalidate('categories:*');
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
