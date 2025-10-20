'use client';

import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface Category {
  _id: string;
  name: string;
  slug: string;
  color?: string;
}

interface EventFormData {
  name: string;
  description: string;
  categories: string[];
  destinations: string[];
  availableInAllDestinations: boolean;
  displayOrder: number;
  isActive: boolean;
  pricing: {
    estimatedCost: number;
    currency: string;
  };
}

interface EventFormProps {
  eventId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EventForm({ eventId, onSuccess, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    categories: [],
    destinations: [],
    availableInAllDestinations: false,
    displayOrder: 0,
    isActive: true,
    pricing: {
      estimatedCost: 0,
      currency: 'GBP',
    },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [destinationInput, setDestinationInput] = useState('');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/events/categories?activeOnly=true');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch event data if editing
  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/events/${eventId}`);
        const data = await response.json();

        if (data.success) {
          const event = data.data;
          setFormData({
            name: event.name,
            description: event.description || '',
            categories: event.categories.map((c: any) => c._id),
            destinations: event.destinations || [],
            availableInAllDestinations: event.availableInAllDestinations,
            displayOrder: event.displayOrder,
            isActive: event.isActive,
            pricing: event.pricing || { estimatedCost: 0, currency: 'GBP' },
          });
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Handle input change
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
    if (errors.categories) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.categories;
        return newErrors;
      });
    }
  };

  // Handle add destination
  const handleAddDestination = () => {
    const trimmed = destinationInput.trim();
    if (trimmed && !formData.destinations.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        destinations: [...prev.destinations, trimmed],
      }));
      setDestinationInput('');
      if (errors.destinations) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.destinations;
          return newErrors;
        });
      }
    }
  };

  // Handle remove destination
  const handleRemoveDestination = (destination: string) => {
    setFormData((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((d) => d !== destination),
    }));
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }

    if (formData.categories.length === 0) {
      newErrors.categories = 'At least one category is required';
    }

    if (!formData.availableInAllDestinations && formData.destinations.length === 0) {
      newErrors.destinations = 'At least one destination is required unless event is available in all destinations';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const url = eventId
        ? `/api/admin/events/${eventId}`
        : '/api/admin/events';
      const method = eventId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/admin/events';
        }
      } else {
        // Handle API errors
        if (data.error?.details) {
          const apiErrors: Record<string, string> = {};
          data.error.details.forEach((detail: any) => {
            apiErrors[detail.field] = detail.message;
          });
          setErrors(apiErrors);
        } else {
          setErrors({ general: data.error?.message || 'Failed to save event' });
        }
      }
    } catch (error) {
      console.error('Error saving event:', error);
      setErrors({ general: 'Failed to save event' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* General error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.general}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Boat Party"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief description of the event..."
        />
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <label
              key={category._id}
              className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                formData.categories.includes(category._id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.categories.includes(category._id)}
                onChange={() => handleCategoryToggle(category._id)}
                className="mr-2"
              />
              <span
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: category.color ? `${category.color}20` : '#e5e7eb',
                  color: category.color || '#374151',
                }}
              >
                {category.name}
              </span>
            </label>
          ))}
        </div>
        {errors.categories && (
          <p className="mt-1 text-sm text-red-600">{errors.categories}</p>
        )}
      </div>

      {/* Destinations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destinations
        </label>
        
        {/* Available in all destinations checkbox */}
        <label className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={formData.availableInAllDestinations}
            onChange={(e) => handleChange('availableInAllDestinations', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Available in all destinations</span>
        </label>

        {!formData.availableInAllDestinations && (
          <>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDestination();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Benidorm"
              />
              <button
                type="button"
                onClick={handleAddDestination}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {formData.destinations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.destinations.map((destination) => (
                  <span
                    key={destination}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded"
                  >
                    {destination}
                    <button
                      type="button"
                      onClick={() => handleRemoveDestination(destination)}
                      className="ml-2 text-gray-600 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {errors.destinations && (
              <p className="mt-1 text-sm text-red-600">{errors.destinations}</p>
            )}
          </>
        )}
      </div>

      {/* Display Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Display Order
        </label>
        <input
          type="number"
          value={formData.displayOrder}
          onChange={(e) => handleChange('displayOrder', parseInt(e.target.value) || 0)}
          min="0"
          className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Lower numbers appear first
        </p>
      </div>

      {/* Pricing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estimated Cost (Optional)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={formData.pricing.estimatedCost}
            onChange={(e) =>
              handleChange('pricing', {
                ...formData.pricing,
                estimatedCost: parseFloat(e.target.value) || 0,
              })
            }
            min="0"
            step="0.01"
            className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={formData.pricing.currency}
            onChange={(e) =>
              handleChange('pricing', {
                ...formData.pricing,
                currency: e.target.value,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GBP">GBP</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      {/* Active Status */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Inactive events will not be visible to users
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : eventId ? 'Update Event' : 'Create Event'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
