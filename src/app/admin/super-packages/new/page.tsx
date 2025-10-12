'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SuperPackageForm from '@/components/admin/SuperPackageForm';
import Link from 'next/link';

export default function NewSuperPackagePage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link 
              href="/admin/super-packages" 
              className="text-orange-500 hover:text-orange-600 mb-4 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Super Packages
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Create New Super Package</h1>
            <p className="text-gray-600 mt-2">Configure a new destination package with pricing matrix</p>
          </div>
          <SuperPackageForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
