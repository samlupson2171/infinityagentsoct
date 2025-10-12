'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast';

interface VersionHistoryEntry {
  version: number;
  modifiedBy: {
    _id: string;
    name: string;
    email: string;
  };
  modifiedAt: string;
  changeDescription?: string;
  changedFields?: string[];
}

interface AuditTrail {
  totalVersions: number;
  firstCreated: string;
  lastModified: string;
  uniqueModifiers: number;
  recentChanges: VersionHistoryEntry[];
}

interface SuperPackageVersionHistoryProps {
  packageId: string;
  packageName: string;
  currentVersion: number;
  onClose: () => void;
}

export default function SuperPackageVersionHistory({
  packageId,
  packageName,
  currentVersion,
  onClose,
}: SuperPackageVersionHistoryProps) {
  const [history, setHistory] = useState<VersionHistoryEntry[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [versionData, setVersionData] = useState<any>(null);
  const [loadingVersion, setLoadingVersion] = useState(false);

  const { showError } = useToast();

  useEffect(() => {
    fetchHistory();
    fetchAuditTrail();
  }, [packageId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/super-packages/${packageId}/version-history?limit=50`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch version history');
      }

      const data = await response.json();
      setHistory(data.history);
    } catch (err: any) {
      setError(err.message);
      showError('Failed to Load History', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const response = await fetch(
        `/api/admin/super-packages/${packageId}/audit-trail`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch audit trail');
      }

      const data = await response.json();
      setAuditTrail(data);
    } catch (err: any) {
      console.error('Failed to fetch audit trail:', err);
    }
  };

  const viewVersion = async (version: number) => {
    try {
      setLoadingVersion(true);
      setSelectedVersion(version);

      const response = await fetch(
        `/api/admin/super-packages/${packageId}/versions/${version}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch version details');
      }

      const data = await response.json();
      setVersionData(data.version);
    } catch (err: any) {
      showError('Failed to Load Version', err.message);
      setSelectedVersion(null);
    } finally {
      setLoadingVersion(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFieldName = (field: string) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Version History
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {packageName} (Current: v{currentVersion})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Audit Trail Summary */}
        {auditTrail && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Versions</p>
                <p className="text-lg font-semibold text-gray-900">{auditTrail.totalVersions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Contributors</p>
                <p className="text-lg font-semibold text-gray-900">{auditTrail.uniqueModifiers}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">First Created</p>
                <p className="text-sm text-gray-900">{formatDate(auditTrail.firstCreated)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Last Modified</p>
                <p className="text-sm text-gray-900">{formatDate(auditTrail.lastModified)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchHistory}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No version history available
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {history.map((entry) => (
                <div
                  key={entry.version}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          v{entry.version}
                        </span>
                        {entry.version === currentVersion && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Current
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(entry.modifiedAt)}
                        </span>
                      </div>

                      <div className="mt-2">
                        <p className="text-sm text-gray-900">
                          Modified by{' '}
                          <span className="font-medium">{entry.modifiedBy.name}</span>
                        </p>
                        {entry.changeDescription && (
                          <p className="text-sm text-gray-600 mt-1">
                            {entry.changeDescription}
                          </p>
                        )}
                      </div>

                      {entry.changedFields && entry.changedFields.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entry.changedFields.map((field) => (
                            <span
                              key={field}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {formatFieldName(field)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => viewVersion(entry.version)}
                      className="ml-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Version Details Modal */}
      {selectedVersion !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Version {selectedVersion} Details
              </h3>
              <button
                onClick={() => {
                  setSelectedVersion(null);
                  setVersionData(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingVersion ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : versionData ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h4>
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-xs text-gray-500">Name</dt>
                        <dd className="text-sm text-gray-900">{versionData.name}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Destination</dt>
                        <dd className="text-sm text-gray-900">{versionData.destination}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Resort</dt>
                        <dd className="text-sm text-gray-900">{versionData.resort}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Currency</dt>
                        <dd className="text-sm text-gray-900">{versionData.currency}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Status</dt>
                        <dd className="text-sm text-gray-900">{versionData.status}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Group Size Tiers</h4>
                    <div className="space-y-1">
                      {versionData.groupSizeTiers.map((tier: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-900">
                          {tier.label}: {tier.minPeople}-{tier.maxPeople} people
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Duration Options</h4>
                    <div className="text-sm text-gray-900">
                      {versionData.durationOptions.join(', ')} nights
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Inclusions</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {versionData.inclusions.map((inc: any, idx: number) => (
                        <li key={idx} className="text-sm text-gray-900">
                          {inc.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
