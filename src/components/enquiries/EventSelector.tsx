'use client';

import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface Category {
  _id: string;
  name: string;
  slug: string;
  color?: string;
}

interface Event {
  _id: string;
  name: string;
  description?: string;
  categories: Category[];
  minimumPeople?: number;
}

interface EventSelectorProps {
  destination?: string;
  selectedEvents: string[];
  onChange: (eventIds: string[]) => void;
  className?: string;
}

export default function EventSelector({
  destination,
  selectedEvents,
  onChange,
  className = '',
}: EventSelectorProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch categories and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/events/categories?activeOnly=true');
        const categoriesData = await categoriesResponse.json();

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }

        // Fetch events
        const params = new URLSearchParams();
        if (destination) {
          params.append('destination', destination);
        }

        const eventsResponse = await fetch(`/api/events?${params}`);
        const eventsData = await eventsResponse.json();

        if (eventsData.success) {
          setEvents(eventsData.data);
        } else {
          setError('Failed to load events');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [destination]);

  // Filter events by category
  const filteredEvents =
    selectedCategory === 'all'
      ? events
      : events.filter((event) =>
          event.categories.some((cat) => cat._id === selectedCategory)
        );

  // Get event count per category
  const getCategoryEventCount = (categoryId: string) => {
    return events.filter((event) =>
      event.categories.some((cat) => cat._id === categoryId)
    ).length;
  };

  // Handle event toggle
  const handleEventToggle = (eventId: string) => {
    const newSelected = selectedEvents.includes(eventId)
      ? selectedEvents.filter((id) => id !== eventId)
      : [...selectedEvents, eventId];
    onChange(newSelected);
  };

  // Handle select all in category
  const handleSelectAllInCategory = () => {
    const categoryEventIds = filteredEvents.map((e) => e._id);
    const allSelected = categoryEventIds.every((id) => selectedEvents.includes(id));

    if (allSelected) {
      // Deselect all in category
      onChange(selectedEvents.filter((id) => !categoryEventIds.includes(id)));
    } else {
      // Select all in category
      const combined = [...selectedEvents, ...categoryEventIds];
      const newSelected = Array.from(new Set(combined));
      onChange(newSelected);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        Please select a destination first to see available events
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded">
        No events available for this destination
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Events
          <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded text-sm">
            {events.length}
          </span>
        </button>

        {categories.map((category) => {
          const count = getCategoryEventCount(category._id);
          if (count === 0) return null;

          return (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category._id
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor:
                  selectedCategory === category._id
                    ? category.color || '#3B82F6'
                    : undefined,
              }}
            >
              {category.name}
              <span
                className={`ml-2 px-2 py-0.5 rounded text-sm ${
                  selectedCategory === category._id
                    ? 'bg-white bg-opacity-20'
                    : 'bg-gray-200'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected events summary */}
      {selectedEvents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded">
          <p className="text-sm text-blue-800">
            <strong>{selectedEvents.length}</strong> event{selectedEvents.length !== 1 ? 's' : ''}{' '}
            selected
          </p>
        </div>
      )}

      {/* Select all button */}
      {filteredEvents.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} in this category
          </p>
          <button
            onClick={handleSelectAllInCategory}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {filteredEvents.every((e) => selectedEvents.includes(e._id))
              ? 'Deselect All'
              : 'Select All'}
          </button>
        </div>
      )}

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredEvents.map((event) => {
          const isSelected = selectedEvents.includes(event._id);

          return (
            <label
              key={event._id}
              className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleEventToggle(event._id)}
                className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{event.name}</div>
                {event.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {event.description}
                  </p>
                )}
                {event.minimumPeople && (
                  <p className="mt-1 text-xs text-orange-600 font-medium">
                    Min. {event.minimumPeople} people required
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  {event.categories.map((cat) => (
                    <span
                      key={cat._id}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: cat.color ? `${cat.color}20` : '#e5e7eb',
                        color: cat.color || '#374151',
                      }}
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No events in this category
        </div>
      )}
    </div>
  );
}
