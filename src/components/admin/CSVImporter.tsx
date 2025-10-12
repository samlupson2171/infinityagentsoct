'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ParsedSuperPackage } from '@/lib/super-package-csv-parser';

interface CSVImporterProps {
  onSuccess?: (packageId: string) => void;
  onCancel?: () => void;
}

type ImportStep = 'upload' | 'preview' | 'importing';

export default function CSVImporter({ onSuccess, onCancel }: CSVImporterProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ImportStep>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedSuperPackage | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  // File upload handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setError(null);

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Invalid file type. Please select a CSV file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setSelectedFile(file);
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress with more granular updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 5;
        });
      }, 150);

      const response = await fetch('/api/admin/super-packages/import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      
      // Show parsing progress
      setUploadProgress(95);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('CSV Import Error:', errorData);
        const errorMessage = errorData.details || errorData.error || errorData.message || 'Failed to parse CSV';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Complete progress
      setUploadProgress(100);
      
      // Small delay to show 100% before transitioning
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setParsedData(data.preview);
      setOriginalFilename(data.filename);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setUploadProgress(0);
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setStep('upload');
    setSelectedFile(null);
    setParsedData(null);
    setOriginalFilename('');
    setUploadProgress(0);
    setError(null);
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Preview and editing handlers
  const handleEditField = (field: keyof ParsedSuperPackage, value: any) => {
    if (parsedData) {
      setParsedData({
        ...parsedData,
        [field]: value,
      });
    }
  };

  const handleEditInclusion = (index: number, text: string) => {
    if (parsedData) {
      const newInclusions = [...parsedData.inclusions];
      newInclusions[index] = { ...newInclusions[index], text };
      setParsedData({ ...parsedData, inclusions: newInclusions });
    }
  };

  const handleRemoveInclusion = (index: number) => {
    if (parsedData) {
      const newInclusions = parsedData.inclusions.filter((_, i) => i !== index);
      setParsedData({ ...parsedData, inclusions: newInclusions });
    }
  };

  const handleAddInclusion = () => {
    if (parsedData) {
      setParsedData({
        ...parsedData,
        inclusions: [...parsedData.inclusions, { text: '', category: 'other' }],
      });
    }
  };

  const handleEditAccommodation = (index: number, value: string) => {
    if (parsedData) {
      const newAccommodation = [...parsedData.accommodationExamples];
      newAccommodation[index] = value;
      setParsedData({ ...parsedData, accommodationExamples: newAccommodation });
    }
  };

  const handleRemoveAccommodation = (index: number) => {
    if (parsedData) {
      const newAccommodation = parsedData.accommodationExamples.filter((_, i) => i !== index);
      setParsedData({ ...parsedData, accommodationExamples: newAccommodation });
    }
  };

  const handleAddAccommodation = () => {
    if (parsedData) {
      setParsedData({
        ...parsedData,
        accommodationExamples: [...parsedData.accommodationExamples, ''],
      });
    }
  };

  // Confirmation handlers
  const handleConfirm = async () => {
    if (!parsedData) return;

    setStep('importing');
    setError(null);

    try {
      const response = await fetch('/api/admin/super-packages/import/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageData: parsedData,
          originalFilename,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to create package');
      }

      const data = await response.json();

      // Show success message briefly before redirect
      setStep('upload');
      
      if (onSuccess) {
        onSuccess(data.package._id);
      } else {
        // Redirect to the package edit page
        router.push(`/admin/super-packages/${data.package._id}/edit`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import package');
      setStep('preview');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/admin/super-packages');
    }
  };

  // Render upload interface
  const renderUploadInterface = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Super Package from CSV</h2>
        <p className="text-gray-600">
          Upload a CSV file containing super package data. The file will be parsed and you can
          review the data before creating the package.
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900">
            {isDragging ? 'Drop file here' : 'Drag and drop your CSV file here'}
          </p>
          <p className="mt-1 text-sm text-gray-500">or</p>
          <button
            type="button"
            onClick={handleSelectFile}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Select File
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">CSV files only, max 5MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {selectedFile && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{selectedFile.name}</span>
            <span className="text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
              role="progressbar"
              aria-valuenow={uploadProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">
            {uploadProgress < 50 
              ? 'Uploading file...' 
              : uploadProgress < 85 
              ? 'Parsing CSV structure...' 
              : uploadProgress < 95
              ? 'Extracting pricing data...'
              : 'Finalizing...'}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // Render preview interface
  const renderPreviewInterface = () => {
    if (!parsedData) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Imported Package</h2>
            <p className="text-gray-600 mt-1">
              Review and edit the parsed data before creating the package.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {isEditing ? 'View Mode' : 'Edit Mode'}
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {/* Basic Information */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={parsedData.name}
                    onChange={(e) => handleEditField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{parsedData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={parsedData.destination}
                    onChange={(e) => handleEditField('destination', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{parsedData.destination}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resort</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={parsedData.resort}
                    onChange={(e) => handleEditField('resort', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{parsedData.resort}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                {isEditing ? (
                  <select
                    value={parsedData.currency}
                    onChange={(e) => handleEditField('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{parsedData.currency}</p>
                )}
              </div>
            </div>
          </div>

          {/* Group Size Tiers */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Group Size Tiers</h3>
            <div className="space-y-2">
              {parsedData.groupSizeTiers.map((tier, index) => (
                <div key={index} className="flex items-center space-x-4 text-sm">
                  <span className="font-medium text-gray-700">Tier {index + 1}:</span>
                  <span className="text-gray-900">{tier.label}</span>
                  <span className="text-gray-500">
                    ({tier.minPeople} - {tier.maxPeople} people)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Duration Options */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Duration Options</h3>
            <div className="flex flex-wrap gap-2">
              {parsedData.durationOptions.map((nights, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing Matrix Preview */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Matrix</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    {parsedData.groupSizeTiers.map((tier, tierIndex) =>
                      parsedData.durationOptions.map((nights) => (
                        <th
                          key={`${tierIndex}-${nights}`}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {tier.label.split(' ')[0]} - {nights}N
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedData.pricingMatrix.map((entry, entryIndex) => (
                    <tr key={entryIndex}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.period}
                      </td>
                      {parsedData.groupSizeTiers.map((_, tierIndex) =>
                        parsedData.durationOptions.map((nights) => {
                          const pricePoint = entry.prices.find(
                            (p) => p.groupSizeTierIndex === tierIndex && p.nights === nights
                          );
                          return (
                            <td
                              key={`${tierIndex}-${nights}`}
                              className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                            >
                              {pricePoint
                                ? pricePoint.price === 'ON_REQUEST'
                                  ? 'On Request'
                                  : `${parsedData.currency} ${pricePoint.price}`
                                : '-'}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {parsedData.pricingMatrix.length} pricing periods found
            </p>
          </div>

          {/* Inclusions */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Inclusions</h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddInclusion}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Inclusion
                </button>
              )}
            </div>
            <div className="space-y-2">
              {parsedData.inclusions.map((inclusion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-gray-400 mt-1">•</span>
                  {isEditing ? (
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={inclusion.text}
                        onChange={(e) => handleEditInclusion(index, e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveInclusion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-900">{inclusion.text}</span>
                  )}
                </div>
              ))}
            </div>
            {parsedData.inclusions.length === 0 && (
              <p className="text-sm text-gray-500 italic">No inclusions found</p>
            )}
          </div>

          {/* Accommodation Examples */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Accommodation Examples</h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddAccommodation}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Accommodation
                </button>
              )}
            </div>
            <div className="space-y-2">
              {parsedData.accommodationExamples.map((example, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-gray-400 mt-1">•</span>
                  {isEditing ? (
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={example}
                        onChange={(e) => handleEditAccommodation(index, e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAccommodation(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-900">{example}</span>
                  )}
                </div>
              ))}
            </div>
            {parsedData.accommodationExamples.length === 0 && (
              <p className="text-sm text-gray-500 italic">No accommodation examples found</p>
            )}
          </div>

          {/* Sales Notes */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Notes</h3>
            {isEditing ? (
              <textarea
                value={parsedData.salesNotes}
                onChange={(e) => handleEditField('salesNotes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">
                {parsedData.salesNotes || (
                  <span className="text-gray-500 italic">No sales notes</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload Different File
          </button>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Confirm and Create Package
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render importing state with animated progress
  const renderImportingState = () => {
    const [importProgress, setImportProgress] = React.useState(0);
    const [importStage, setImportStage] = React.useState('Validating package data...');

    React.useEffect(() => {
      const stages = [
        { progress: 20, message: 'Validating package data...' },
        { progress: 40, message: 'Creating pricing matrix...' },
        { progress: 60, message: 'Processing inclusions...' },
        { progress: 80, message: 'Saving to database...' },
        { progress: 95, message: 'Finalizing...' },
      ];

      let currentStage = 0;
      const interval = setInterval(() => {
        if (currentStage < stages.length) {
          setImportProgress(stages[currentStage].progress);
          setImportStage(stages[currentStage].message);
          currentStage++;
        } else {
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-900">Creating package...</p>
        <p className="mt-2 text-sm text-gray-600">{importStage}</p>
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Progress</span>
            <span className="text-gray-700 font-medium">{importProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${importProgress}%` }}
              role="progressbar"
              aria-valuenow={importProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500">Please do not close this window</p>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {step === 'upload' && renderUploadInterface()}
      {step === 'preview' && renderPreviewInterface()}
      {step === 'importing' && renderImportingState()}
    </div>
  );
}
