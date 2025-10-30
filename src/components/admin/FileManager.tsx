'use client';

import React, { useState, useEffect } from 'react';
import FileUpload, { type UploadedFile } from './FileUpload';
import FilePreview from './FilePreview';
import { Folder, Search, Filter, Grid, List, AlertCircle, X, RefreshCw } from 'lucide-react';

interface FileManagerProps {
  materialId?: string;
  onFilesChange?: (files: UploadedFile[]) => void;
  initialFiles?: UploadedFile[];
  maxFiles?: number;
  allowUpload?: boolean;
  showSearch?: boolean;
  viewMode?: 'grid' | 'list';
  className?: string;
}

interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info';
  action?: {
    label: string;
    handler: () => void;
  };
}

export default function FileManager({
  materialId,
  onFilesChange,
  initialFiles = [],
  maxFiles = 10,
  allowUpload = true,
  showSearch = true,
  viewMode: initialViewMode = 'list',
  className = '',
}: FileManagerProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});

  // Load files when materialId changes
  useEffect(() => {
    if (materialId) {
      loadFiles();
    }
  }, [materialId]);

  // Notify parent when files change
  useEffect(() => {
    console.log('FileManager: Notifying parent of files change:', files);
    onFilesChange?.(files);
  }, [files]); // Remove onFilesChange from deps to prevent multiple calls

  // Load files from API
  const loadFiles = async () => {
    if (!materialId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/training/files/upload?materialId=${materialId}`
      );
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError({
          message: errorData.error || 'Failed to load files',
          type: 'error',
          action: {
            label: 'Retry',
            handler: loadFiles,
          },
        });
      }
    } catch (error) {
      console.error('Failed to load files:', error);
      setError({
        message: error instanceof Error ? error.message : 'Network error while loading files',
        type: 'error',
        action: {
          label: 'Retry',
          handler: loadFiles,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new file uploads
  const handleFilesUploaded = (newFiles: UploadedFile[]) => {
    console.log('FileManager: Received new files:', newFiles);
    console.log('FileManager: Current files before update:', files);

    setFiles((prev) => {
      // Deduplicate files by ID to prevent duplicates
      const existingIds = new Set(prev.map((f) => f.id));
      const uniqueNewFiles = newFiles.filter((f) => !existingIds.has(f.id));

      console.log('FileManager: Existing IDs:', Array.from(existingIds));
      console.log('FileManager: Unique new files:', uniqueNewFiles);

      if (uniqueNewFiles.length === 0) {
        console.log('FileManager: No new unique files to add');
        return prev;
      }

      const updated = [...prev, ...uniqueNewFiles];
      console.log('FileManager: Updated files list:', updated);
      return updated;
    });
  };

  // Handle file removal with retry mechanism
  const handleFileRemoved = async (fileId: string, isRetry: boolean = false) => {
    const currentRetries = retryCount[fileId] || 0;
    const maxRetries = 3;

    setDeletingFileId(fileId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/training/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles((prev) => prev.filter((file) => file.id !== fileId));
        // Clear retry count on success
        setRetryCount((prev) => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });
        setError({
          message: 'File deleted successfully',
          type: 'info',
        });
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setError(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to delete file';
        
        if (currentRetries < maxRetries) {
          setError({
            message: `${errorMessage}. Attempt ${currentRetries + 1} of ${maxRetries}`,
            type: 'warning',
            action: {
              label: 'Retry',
              handler: () => {
                setRetryCount((prev) => ({ ...prev, [fileId]: currentRetries + 1 }));
                handleFileRemoved(fileId, true);
              },
            },
          });
        } else {
          setError({
            message: `${errorMessage}. Maximum retry attempts reached.`,
            type: 'error',
          });
          // Reset retry count after max attempts
          setRetryCount((prev) => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error while deleting file';
      
      if (currentRetries < maxRetries) {
        setError({
          message: `${errorMessage}. Attempt ${currentRetries + 1} of ${maxRetries}`,
          type: 'warning',
          action: {
            label: 'Retry',
            handler: () => {
              setRetryCount((prev) => ({ ...prev, [fileId]: currentRetries + 1 }));
              handleFileRemoved(fileId, true);
            },
          },
        });
      } else {
        setError({
          message: `${errorMessage}. Maximum retry attempts reached.`,
          type: 'error',
        });
        // Reset retry count after max attempts
        setRetryCount((prev) => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });
      }
    } finally {
      setDeletingFileId(null);
    }
  };

  // Filter files based on search and type
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.originalName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (filterType === 'all') return matchesSearch;

    const fileType = getFileCategory(file.mimeType);
    return matchesSearch && fileType === filterType;
  });

  // Get file category for filtering
  const getFileCategory = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.includes('pdf')) return 'documents';
    if (
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('powerpoint')
    )
      return 'documents';
    return 'other';
  };

  // Get unique file types for filter options
  const getFileTypes = () => {
    const types = new Set(files.map((file) => getFileCategory(file.mimeType)));
    return Array.from(types);
  };

  return (
    <div className={`file-manager ${className}`}>
      {/* Error Display */}
      {error && (
        <div
          className={`mb-4 p-4 rounded-md border ${
            error.type === 'error'
              ? 'bg-red-50 border-red-200'
              : error.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-start">
            <AlertCircle
              className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${
                error.type === 'error'
                  ? 'text-red-600'
                  : error.type === 'warning'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
              }`}
            />
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  error.type === 'error'
                    ? 'text-red-800'
                    : error.type === 'warning'
                      ? 'text-yellow-800'
                      : 'text-blue-800'
                }`}
              >
                {error.message}
              </p>
              {error.action && (
                <button
                  onClick={error.action.handler}
                  className={`mt-2 text-sm font-medium underline ${
                    error.type === 'error'
                      ? 'text-red-700 hover:text-red-800'
                      : error.type === 'warning'
                        ? 'text-yellow-700 hover:text-yellow-800'
                        : 'text-blue-700 hover:text-blue-800'
                  }`}
                >
                  {error.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => setError(null)}
              className={`ml-3 flex-shrink-0 ${
                error.type === 'error'
                  ? 'text-red-600 hover:text-red-800'
                  : error.type === 'warning'
                    ? 'text-yellow-600 hover:text-yellow-800'
                    : 'text-blue-600 hover:text-blue-800'
              }`}
              title="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Folder className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">
            File Manager ({files.length}/{maxFiles})
          </h3>
          {isLoading && (
            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
              title="List view"
              disabled={isLoading}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
              title="Grid view"
              disabled={isLoading}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      {showSearch && files.length > 0 && (
        <div className="flex items-center space-x-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Files</option>
              {getFileTypes().map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {allowUpload && files.length < maxFiles && (
        <div className="mb-6">
          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            onFileRemoved={handleFileRemoved}
            existingFiles={files}
            maxFiles={maxFiles}
            disabled={isLoading || deletingFileId !== null}
          />
        </div>
      )}

      {/* Files Display */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading files...</p>
        </div>
      ) : filteredFiles.length > 0 ? (
        <div
          className={`
          ${
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        `}
        >
          {filteredFiles.map((file) => (
            <div key={file.id} className="relative">
              {deletingFileId === file.id && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-md">
                  <div className="flex flex-col items-center">
                    <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                    <p className="mt-2 text-xs text-gray-600">Deleting...</p>
                  </div>
                </div>
              )}
              <FilePreview
                file={file}
                onRemove={allowUpload && deletingFileId !== file.id ? handleFileRemoved : undefined}
                compact={viewMode === 'list'}
                className={viewMode === 'grid' ? 'h-full' : ''}
              />
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-8">
          <Folder className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            {allowUpload ? 'No files uploaded yet' : 'No files available'}
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            No files match your search criteria
          </p>
        </div>
      )}
    </div>
  );
}
