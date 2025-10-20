'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface Event {
  _id: string;
  name: string;
  description?: string;
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
    color?: string;
  }>;
  destinations: string[];
  availableInAllDestinations: boolean;
  isActive: boolean;
  displayOrder: number;
  pricing?: {
    estimatedCost?: number;
    currency?: string;
  };
}

interface EventsManagerProps {
  className?: string;
  onEventSelect?: (event: Event) => void;
}

export default function EventsManager({
  className = '',
  onEventSelect,
}: EventsManagerProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    destination: '',
    status: 'all',
  });

  // Sort state
  const [sort, setSort] = useState({
    field: 'displayOrder',
    direction: 'asc' as 'asc' | 'desc',
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/events/categories?activeOnly=true');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: `${sort.direction === 'desc' ? '-' : ''}${sort.field}`,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.destination && { destination: filters.destination }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const response = await fetch(`/api/admin/events?${params}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data.events);
        setPagination((prev) => ({
          ...prev,
          total: data.data.pagination.total,
          pages: data.data.pagination.pages,
        }));
      } else {
        setError(data.error?.message || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sort, filters, debouncedSearch]);

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Handle event selection
  const handleEventSelection = (eventId: string) => {
    setSelectedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedEvents.size === events.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(events.map((e) => e._id)));
    }
  };

  // Handle bulk activate
  const handleBulkActivate = async () => {
    if (selectedEvents.size === 0) return;

    try {
      setBulkActionLoading(true);

      const promises = Array.from(selectedEvents).map((id) =>
        fetch(`/api/admin/events/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true }),
        })
      );

      await Promise.all(promises);

      setToast({ message: 'Events activated successfully', type: 'success' });
      setSelectedEvents(new Set());
      fetchEvents();
    } catch (error) {
      setToast({ message: 'Failed to activate events', type: 'error' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle bulk deactivate
  const handleBulkDeactivate = async () => {
    if (selectedEvents.size === 0) return;

    try {
      setBulkActionLoading(true);

      const promises = Array.from(selectedEvents).map((id) =>
        fetch(`/api/admin/events/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false }),
        })
      );

      await Promise.all(promises);

      setToast({ message: 'Events deactivated successfully', type: 'success' });
      setSelectedEvents(new Set());
      fetchEvents();
    } catch (error) {
      setToast({ message: 'Failed to deactivate events', type: 'error' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedEvents.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedEvents.size} events?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);

      const promises = Array.from(selectedEvents).map((id) =>
        fetch(`/api/admin/events/${id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(promises);

      setToast({ message: 'Events deleted successfully', type: 'success' });
      setSelectedEvents(new Set());
      fetchEvents();
    } catch (error) {
      setToast({ message: 'Failed to delete events', type: 'error' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (eventId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          message: `Event ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
          type: 'success',
        });
        fetchEvents();
      } else {
        setToast({ message: data.error?.message || 'Failed to update event', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to update event', type: 'error' });
    }
  };

  // Handle delete
  const handleDelete = async (eventId: string, eventName: string) => {
    if (!confirm(`Are you sure you want to delete "${eventName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: 'Event deleted successfully', type: 'success' });
        fetchEvents();
      } else {
        setToast({ message: data.error?.message || 'Failed to delete event', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to delete event', type: 'error' });
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Events Management</h1>
        <a
          href="/admin/events/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Event
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search events..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Category filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Destination filter */}
          <input
            type="text"
            placeholder="Filter by destination..."
            value={filters.destination}
            onChange={(e) => handleFilterChange('destination', e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Bulk actions */}
        {selectedEvents.size > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">
              {selectedEvents.size} selected
            </span>
            <button
              onClick={handleBulkActivate}
              disabled={bulkActionLoading}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Activate
            </button>
            <button
              onClick={handleBulkDeactivate}
              disabled={bulkActionLoading}
              className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              Deactivate
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Events table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedEvents.size === events.length && events.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('name')}
              >
                Name {sort.field === 'name' && (sort.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categories
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destinations
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('displayOrder')}
              >
                Order {sort.field === 'displayOrder' && (sort.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedEvents.has(event._id)}
                    onChange={() => handleEventSelection(event._id)}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{event.name}</div>
                  {event.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {event.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {event.categories.map((cat) => (
                      <span
                        key={cat._id}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: cat.color ? `${cat.color}20` : '#e5e7eb',
                          color: cat.color || '#374151',
                        }}
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {event.availableInAllDestinations ? (
                      <span className="text-blue-600 font-medium">All Destinations</span>
                    ) : event.destinations.length > 0 ? (
                      <span>{event.destinations.join(', ')}</span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{event.displayOrder}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(event._id, event.isActive)}
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      event.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {event.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-2">
                  <a
                    href={`/admin/events/${event._id}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => handleDelete(event._id, event.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {events.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No events found. Create your first event to get started.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} events
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border rounded ${
                  page === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-lg">{toast.type === 'success' ? '✓' : '✕'}</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setToast(null)}
                  className="text-lg opacity-60 hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
