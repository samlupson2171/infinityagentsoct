'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SuperPackageForm from '@/components/admin/SuperPackageForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function EditSuperPackagePage() {
  const params = useParams();
  const packageId = params.id as string;
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        console.log('Fetching package:', packageId);
        const url = `/api/admin/super-packages/${packageId}`;
        console.log('URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));
        
        if (!response.ok) {
          const text = await response.text();
          console.log('Error response:', text);
          
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.error || 'Failed to fetch package');
          } catch {
            throw new Error(`Server error (${response.status}): ${text.substring(0, 200)}`);
          }
        }

        const data = await response.json();
        console.log('Success data:', data);
        setPackageData(data.data?.package || data.package);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <Link 
              href="/admin/super-packages" 
              className="text-orange-500 hover:text-orange-600 mb-4 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Super Packages
            </Link>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Edit Super Package</h1>
            <p className="text-gray-600 mt-2">Update package details and pricing matrix</p>
          </div>
          <SuperPackageForm package={packageData} isEditing />
        </div>
      </div>
    </ProtectedRoute>
  );
}
