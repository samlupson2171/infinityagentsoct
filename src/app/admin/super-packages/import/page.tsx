'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CSVImporter from '@/components/admin/CSVImporter';

export default function ImportSuperPackagePage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Import Super Package from CSV</h1>
            <p className="text-gray-600 mt-2">Upload a CSV file to create a new super package</p>
          </div>
          <CSVImporter />
        </div>
      </div>
    </ProtectedRoute>
  );
}
