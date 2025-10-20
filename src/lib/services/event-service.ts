import mongoose from 'mongoose';
import Event, { IEvent } from '@/models/Event';
import Category from '@/models/Category';
import { EventCache } from './event-cache';

export interface EventFilters {
  search?: string;
  category?: string;
  destination?: string;
  status?: 'all' | 'active' | 'inactive';
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedEvents {
  events: IEvent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateEventData {
  name: string;
  description?: string;
  categories: string[];
  destinations: string[];
  availableInAllDestinations: boolean;
  displayOrder?: number;
  pricing?: {
    estimatedCost?: number;
    currency?: string;
  };
  createdBy: mongoose.Types.ObjectId;
}

export interface UpdateEventData {
  name?: string;
  description?: string;
  categories?: string[];
  destinations?: string[];
  availableInAllDestinations?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  pricing?: {
    estimatedCost?: number;
    currency?: string;
  };
  updatedBy: mongoose.Types.ObjectId;
}

export class EventService {
  private cache: EventCache;

  constructor() {
    this.cache = new EventCache();
  }

  /**
   * Get all events with optional filtering and pagination
   */
  async getEvents(filters: EventFilters = {}): Promise<PaginatedEvents> {
    const {
      search,
      category,
      destination,
      status = 'all',
      page = 1,
      limit = 50,
      sort = 'displayOrder',
    } = filters;

    // Build query
    const query: any = {};

    // Status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Search filter
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Category filter
    if (category) {
      query.categories = new mongoose.Types.ObjectId(category);
    }

    // Destination filter
    if (destination) {
      query.$or = [
        { availableInAllDestinations: true },
        { destinations: destination },
      ];
    }

    // Build sort
    const sortOptions: any = {};
    if (sort.startsWith('-')) {
      sortOptions[sort.substring(1)] = -1;
    } else {
      sortOptions[sort] = 1;
    }
    sortOptions.name = 1; // Secondary sort by name

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('categories')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(query),
    ]);

    return {
      events: events as any as IEvent[],
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get events by destination (cached)
   */
  async getEventsByDestination(destination: string): Promise<IEvent[]> {
    const cacheKey = `events:destination:${destination}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const events = await Event.find({
      isActive: true,
      $or: [
        { availableInAllDestinations: true },
        { destinations: destination },
      ],
    })
      .populate('categories')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    await this.cache.set(cacheKey, events);
    return events as any as IEvent[];
  }

  /**
   * Get events by category
   */
  async getEventsByCategory(categoryId: string): Promise<IEvent[]> {
    const cacheKey = `events:category:${categoryId}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const events = await Event.find({
      isActive: true,
      categories: new mongoose.Types.ObjectId(categoryId),
    })
      .populate('categories')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    await this.cache.set(cacheKey, events);
    return events as any as IEvent[];
  }

  /**
   * Get events by destination and category
   */
  async getEventsByDestinationAndCategory(
    destination: string,
    categoryId: string
  ): Promise<IEvent[]> {
    const events = await Event.find({
      isActive: true,
      categories: new mongoose.Types.ObjectId(categoryId),
      $or: [
        { availableInAllDestinations: true },
        { destinations: destination },
      ],
    })
      .populate('categories')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    return events as any as IEvent[];
  }

  /**
   * Get a single event by ID
   */
  async getEventById(id: string): Promise<IEvent | null> {
    const event = await Event.findById(id).populate('categories').lean();
    return event as IEvent | null;
  }

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventData): Promise<IEvent> {
    // Validate categories exist
    await this.validateCategories(data.categories);

    // Validate unique name
    await this.validateUniqueName(data.name);

    // Create event
    const event = new Event({
      ...data,
      categories: data.categories.map((id) => new mongoose.Types.ObjectId(id)),
      metadata: {
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await event.save();

    // Invalidate cache
    await this.cache.invalidate('events:*');

    return event.populate('categories');
  }

  /**
   * Update an existing event
   */
  async updateEvent(id: string, data: UpdateEventData): Promise<IEvent | null> {
    const event = await Event.findById(id);

    if (!event) {
      return null;
    }

    // Validate categories if provided
    if (data.categories) {
      await this.validateCategories(data.categories);
      event.categories = data.categories.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    // Validate unique name if changed
    if (data.name && data.name !== event.name) {
      await this.validateUniqueName(data.name);
      event.name = data.name;
    }

    // Update other fields
    if (data.description !== undefined) event.description = data.description;
    if (data.destinations) event.destinations = data.destinations;
    if (data.availableInAllDestinations !== undefined) {
      event.availableInAllDestinations = data.availableInAllDestinations;
    }
    if (data.displayOrder !== undefined) event.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) event.isActive = data.isActive;
    if (data.pricing) event.pricing = data.pricing;

    event.metadata.updatedBy = data.updatedBy;
    event.metadata.updatedAt = new Date();

    await event.save();

    // Invalidate cache
    await this.cache.invalidate('events:*');

    return event.populate('categories');
  }

  /**
   * Toggle event active status
   */
  async toggleEventStatus(
    id: string,
    updatedBy: mongoose.Types.ObjectId
  ): Promise<IEvent | null> {
    const event = await Event.findById(id);

    if (!event) {
      return null;
    }

    event.isActive = !event.isActive;
    event.metadata.updatedBy = updatedBy;
    event.metadata.updatedAt = new Date();

    await event.save();

    // Invalidate cache
    await this.cache.invalidate('events:*');

    return event.populate('categories');
  }

  /**
   * Soft delete an event (set isActive to false)
   */
  async softDeleteEvent(
    id: string,
    updatedBy: mongoose.Types.ObjectId
  ): Promise<IEvent | null> {
    const event = await Event.findById(id);

    if (!event) {
      return null;
    }

    event.isActive = false;
    event.metadata.updatedBy = updatedBy;
    event.metadata.updatedAt = new Date();

    await event.save();

    // Invalidate cache
    await this.cache.invalidate('events:*');

    return event.populate('categories');
  }

  /**
   * Hard delete an event (only if not referenced in enquiries)
   */
  async hardDeleteEvent(id: string): Promise<boolean> {
    // Check if event is referenced in enquiries
    const isReferenced = await this.isEventReferenced(id);

    if (isReferenced) {
      throw new Error(
        'Cannot delete event that is referenced in existing enquiries'
      );
    }

    const result = await Event.findByIdAndDelete(id);

    if (result) {
      // Invalidate cache
      await this.cache.invalidate('events:*');
      return true;
    }

    return false;
  }

  /**
   * Bulk activate events
   */
  async bulkActivate(
    ids: string[],
    updatedBy: mongoose.Types.ObjectId
  ): Promise<number> {
    const result = await Event.updateMany(
      { _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } },
      {
        $set: {
          isActive: true,
          'metadata.updatedBy': updatedBy,
          'metadata.updatedAt': new Date(),
        },
      }
    );

    // Invalidate cache
    await this.cache.invalidate('events:*');

    return result.modifiedCount;
  }

  /**
   * Bulk deactivate events
   */
  async bulkDeactivate(
    ids: string[],
    updatedBy: mongoose.Types.ObjectId
  ): Promise<number> {
    const result = await Event.updateMany(
      { _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } },
      {
        $set: {
          isActive: false,
          'metadata.updatedBy': updatedBy,
          'metadata.updatedAt': new Date(),
        },
      }
    );

    // Invalidate cache
    await this.cache.invalidate('events:*');

    return result.modifiedCount;
  }

  /**
   * Bulk delete events
   */
  async bulkDelete(ids: string[]): Promise<number> {
    // Check if any events are referenced
    for (const id of ids) {
      const isReferenced = await this.isEventReferenced(id);
      if (isReferenced) {
        throw new Error(
          `Cannot delete event ${id} that is referenced in existing enquiries`
        );
      }
    }

    const result = await Event.deleteMany({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    // Invalidate cache
    await this.cache.invalidate('events:*');

    return result.deletedCount;
  }

  /**
   * Validate that categories exist
   */
  private async validateCategories(categoryIds: string[]): Promise<void> {
    const categories = await Category.find({
      _id: { $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    if (categories.length !== categoryIds.length) {
      throw new Error('One or more categories do not exist');
    }
  }

  /**
   * Validate that event name is unique
   */
  private async validateUniqueName(name: string, excludeId?: string): Promise<void> {
    const query: any = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
    if (excludeId) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const existing = await Event.findOne(query);

    if (existing) {
      throw new Error('Event name already exists');
    }
  }

  /**
   * Check if event is referenced in enquiries
   */
  private async isEventReferenced(eventId: string): Promise<boolean> {
    const Enquiry = mongoose.models.Enquiry;
    if (!Enquiry) {
      return false;
    }

    const count = await Enquiry.countDocuments({
      eventsRequested: new mongoose.Types.ObjectId(eventId),
    });

    return count > 0;
  }

  /**
   * Get all active events (cached)
   */
  async getActiveEvents(): Promise<IEvent[]> {
    const cacheKey = 'events:all:active';
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const events = await Event.find({ isActive: true })
      .populate('categories')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    await this.cache.set(cacheKey, events);
    return events as any as IEvent[];
  }
}

// Export singleton instance
export const eventService = new EventService();
