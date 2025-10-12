'use client';

import { useEffect, useState } from 'react';

export default function TestAPI() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testAPI() {
      try {
        console.log('Fetching from /api/admin/super-packages...');
        const response = await fetch('/api/admin/super-packages?page=1&limit=10&status=all');
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
          setError(`API Error: ${response.status} - ${JSON.stringify(data)}`);
        } else {
          setResult(data);
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(`Fetch Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    testAPI();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Results</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success!</strong> Found {result.packages?.length || 0} packages
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Full Response:</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(result || error, null, 2)}
        </pre>
      </div>
    </div>
  );
}
