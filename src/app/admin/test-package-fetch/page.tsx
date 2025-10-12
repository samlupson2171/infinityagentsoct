'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function TestPackageFetch() {
  const { data: session, status } = useSession();
  const [packages, setPackages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<string>('');

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    setRawResponse('');

    try {
      console.log('Fetching packages...');
      const response = await fetch('/api/admin/super-packages?status=active');
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      setRawResponse(text);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = JSON.parse(text);
      console.log('Parsed data:', data);
      
      setPackages(data.data?.packages || data.packages || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Package Fetch Diagnostic</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Session Info:</h2>
        <p>Status: {status}</p>
        <p>User: {session?.user?.name || 'Not logged in'}</p>
        <p>Email: {session?.user?.email || 'N/A'}</p>
        <p>Role: {(session?.user as any)?.role || 'N/A'}</p>
      </div>

      <button
        onClick={fetchPackages}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Fetching...' : 'Fetch Packages'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="font-bold text-red-800">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {rawResponse && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Raw Response:</h3>
          <pre className="text-xs overflow-auto">{rawResponse}</pre>
        </div>
      )}

      {packages.length > 0 && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <h3 className="font-bold text-green-800 mb-2">
            Found {packages.length} package(s):
          </h3>
          {packages.map((pkg: any) => (
            <div key={pkg._id} className="mb-2 p-2 bg-white rounded">
              <p className="font-medium">{pkg.name}</p>
              <p className="text-sm text-gray-600">
                {pkg.destination} - {pkg.resort}
              </p>
              <p className="text-sm text-gray-600">Status: {pkg.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
