'use client';

import React, { useState, useEffect } from 'react';

export default function SuperPackagesDebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/super-packages?status=all&limit=1000');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const json = await response.json();
        setData(json);
        console.log('Super Packages Data:', json);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching super packages:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Super Packages Debug Page</h1>
        
        {loading && (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <h2 className="text-red-800 font-semibold mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {data && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Success</p>
                  <p className="text-2xl font-bold">{data.success ? '✓' : '✗'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Packages</p>
                  <p className="text-2xl font-bold">{data.pagination?.total || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Returned</p>
                  <p className="text-2xl font-bold">{data.packages?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Page</p>
                  <p className="text-2xl font-bold">{data.pagination?.page || 0}</p>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            {data.packages && data.packages.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Status Breakdown</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {data.packages.filter((p: any) => p.status === 'active').length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Inactive</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {data.packages.filter((p: any) => p.status === 'inactive').length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Deleted</p>
                    <p className="text-2xl font-bold text-red-600">
                      {data.packages.filter((p: any) => p.status === 'deleted').length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Package List */}
            {data.packages && data.packages.length > 0 ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Packages</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Destination</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Resort</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Version</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.packages.map((pkg: any, index: number) => (
                        <tr key={pkg._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium">{pkg.name}</td>
                          <td className="px-4 py-3 text-sm">{pkg.destination}</td>
                          <td className="px-4 py-3 text-sm">{pkg.resort}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pkg.status === 'active' ? 'bg-green-100 text-green-800' :
                              pkg.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {pkg.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{pkg.version}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">{pkg._id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-600">No packages found</p>
              </div>
            )}

            {/* Raw JSON */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Raw JSON Response</h2>
              <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-xs">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
