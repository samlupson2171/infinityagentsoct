'use client';

import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isSystem: boolean;
  isActive: boolean;
  displayOrder: number;
  eventCount?: number;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/events/categories?includeEventCount=true');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.slug.trim()) errors.slug = 'Slug is required';
    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    if (formData.color && !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      errors.color = 'Color must be a valid hex code (e.g., #FF5733)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const url = editingCategory
        ? `/api/admin/events/categories/${editingCategory._id}`
        : '/api/admin/events/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          message: editingCategory ? 'Category updated successfully' : 'Category created successfully',
          type: 'success',
        });
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ name: '', slug: '', description: '', icon: '', color: '' });
        setFormErrors({});
        fetchCategories();
      } else {
        setFormErrors({ general: data.error?.message || 'Failed to save category' });
      }
    } catch (error) {
      setFormErrors({ general: 'Failed to save category' });
    }
  };

  // Handle edit
  const handleEdit = (category: Category) => {
    if (category.isSystem) {
      setToast({ message: 'System categories cannot be edited', type: 'error' });
      return;
    }

    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '',
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (category: Category) => {
    if (category.isSystem) {
      setToast({ message: 'System categories cannot be deleted', type: 'error' });
      return;
    }

    if (category.eventCount && category.eventCount > 0) {
      setToast({
        message: `Cannot delete category with ${category.eventCount} events`,
        type: 'error',
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/categories/${category._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: 'Category deleted successfully', type: 'success' });
        fetchCategories();
      } else {
        setToast({ message: data.error?.message || 'Failed to delete category', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to delete category', type: 'error' });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', icon: '', color: '' });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Categories</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Category
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {editingCategory ? 'Edit Category' : 'New Category'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {formErrors.general}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                  className={`w-full px-3 py-2 border rounded ${
                    formErrors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.slug && <p className="mt-1 text-sm text-red-600">{formErrors.slug}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="e.g., sun, moon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className={`w-full px-3 py-2 border rounded ${
                    formErrors.color ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="#FF5733"
                />
                {formErrors.color && <p className="mt-1 text-sm text-red-600">{formErrors.color}</p>}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingCategory ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Events
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category._id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded text-sm font-medium"
                      style={{
                        backgroundColor: category.color ? `${category.color}20` : '#e5e7eb',
                        color: category.color || '#374151',
                      }}
                    >
                      {category.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{category.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {category.eventCount || 0} events
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      category.isSystem
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {category.isSystem ? 'System' : 'Custom'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-2">
                  {!category.isSystem && (
                    <>
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="text-red-600 hover:text-red-900"
                        disabled={category.eventCount && category.eventCount > 0}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {category.isSystem && (
                    <span className="text-gray-400">Protected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                  className="text-lg opacity-60 hover:opacity-100"
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
