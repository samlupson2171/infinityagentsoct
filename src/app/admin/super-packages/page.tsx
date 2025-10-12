'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SuperPackageManager from '@/components/admin/SuperPackageManager';

export default function SuperPackagesPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Super Offer Packages</h1>
            <p className="text-gray-600 mt-2">Manage pre-configured destination packages with pricing matrices</p>
          </div>
          <SuperPackageManager />
        </div>
      </div>
    </ProtectedRoute>
  );
}
