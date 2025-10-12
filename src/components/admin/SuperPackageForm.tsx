'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ISuperOfferPackage, IGroupSizeTier, IInclusion } from '@/models/SuperOfferPackage';
import { useToast } from '@/components/shared/Toast';
import { SuperPackageErrorBoundary } from './SuperPackageErrorBoundary';
import { ValidationErrors, FieldError, FieldWrapper } from '@/components/shared/ValidationErrors';
import { ButtonLoading, OverlayLoading } from '@/components/shared/LoadingState';
import PricingMatrixEditor from './PricingMatrixEditor';
import { IPricingEntry } from '@/models/SuperOfferPackage';

interface SuperPackageFormData {
  name: string;
  destination: string;
  resort: string;
  currency: 'EUR' | 'GBP' | 'USD';
  groupSizeTiers: IGroupSizeTier[];
  durationOptions: number[];
  pricingMatrix: IPricingEntry[];
  inclusions: IInclusion[];
  accommodationExamples: string[];
  salesNotes: string;
  status: 'active' | 'inactive';
  changeDescription?: string;
}

interface SuperPackageFormProps {
  package?: Partial<ISuperOfferPackage> & { _id?: string };
  onSubmit?: (data: SuperPackageFormData) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
  className?: string;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

export default function SuperPackageForm({
  package: pkg,
  onSubmit,
  onCancel,
  isEditing = false,
  className = '',
}: SuperPackageFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Form state
  const [formData, setFormData] = useState<SuperPackageFormData>({
    name: pkg?.name || '',
    destination: pkg?.destination || '',
    resort: pkg?.resort || '',
    currency: pkg?.currency || 'EUR',
    groupSizeTiers: pkg?.groupSizeTiers || [
      { label: '6-11 People', minPeople: 6, maxPeople: 11 },
      { label: '12+ People', minPeople: 12, maxPeople: 999 },
    ],
    durationOptions: pkg?.durationOptions || [2, 3, 4],
    pricingMatrix: pkg?.pricingMatrix || [],
    inclusions: pkg?.inclusions || [],
    accommodationExamples: pkg?.accommodationExamples || [],
    salesNotes: pkg?.salesNotes || '',
    status: pkg?.status === 'inactive' ? 'inactive' : 'active',
    changeDescription: '',
  });

  // Validation rules
  const validateField = useCallback((field: string, value: any): string | undefined => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) return 'Package name is required';
        if (value.length < 3) return 'Package name must be at least 3 characters';
        if (value.length > 100) return 'Package name must be less than 100 characters';
        break;
      case 'destination':
        if (!value || value.trim().length === 0) return 'Destination is required';
        if (value.length < 2) return 'Destination must be at least 2 characters';
        break;
      case 'resort':
        if (!value || value.trim().length === 0) return 'Resort is required';
        if (value.length < 2) return 'Resort must be at least 2 characters';
        break;
      case 'currency':
        if (!['EUR', 'GBP', 'USD'].includes(value)) return 'Invalid currency';
        break;
      case 'groupSizeTiers':
        if (!value || value.length === 0) return 'At least one group size tier is required';
        for (const tier of value) {
          if (!tier.label || tier.label.trim().length === 0) {
            return 'All group size tiers must have a label';
          }
          if (tier.minPeople < 1) return 'Minimum people must be at least 1';
          if (tier.maxPeople < tier.minPeople) {
            return 'Maximum people must be greater than or equal to minimum';
          }
        }
        break;
      case 'durationOptions':
        if (!value || value.length === 0) return 'At least one duration option is required';
        if (value.some((n: number) => n < 1)) return 'All duration options must be positive';
        break;
      case 'pricingMatrix':
        if (!value || value.length === 0) return 'At least one pricing period is required';
        break;
    }
    return undefined;
  }, []);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    const nameError = validateField('name', formData.name);
    if (nameError) errors.name = nameError;
    
    const destinationError = validateField('destination', formData.destination);
    if (destinationError) errors.destination = destinationError;
    
    const resortError = validateField('resort', formData.resort);
    if (resortError) errors.resort = resortError;
    
    const currencyError = validateField('currency', formData.currency);
    if (currencyError) errors.currency = currencyError;
    
    const groupSizeTiersError = validateField('groupSizeTiers', formData.groupSizeTiers);
    if (groupSizeTiersError) errors.groupSizeTiers = groupSizeTiersError;
    
    const durationOptionsError = validateField('durationOptions', formData.durationOptions);
    if (durationOptionsError) errors.durationOptions = durationOptionsError;
    
    const pricingMatrixError = validateField('pricingMatrix', formData.pricingMatrix);
    if (pricingMatrixError) errors.pricingMatrix = pricingMatrixError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, validateField]);

  // Handle field changes
  const handleFieldChange = useCallback((field: keyof SuperPackageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation if field has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      if (error) {
        setValidationErrors(prev => ({ ...prev, [field]: error }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  }, [touched, validateField]);

  // Handle field blur
  const handleFieldBlur = useCallback((field: keyof SuperPackageFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formData, validateField]);

  // Handle group size tier changes
  const handleTierChange = useCallback((index: number, field: keyof IGroupSizeTier, value: any) => {
    const newTiers = [...formData.groupSizeTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    handleFieldChange('groupSizeTiers', newTiers);
  }, [formData.groupSizeTiers, handleFieldChange]);

  const addTier = useCallback(() => {
    const newTiers = [...formData.groupSizeTiers, { label: '', minPeople: 1, maxPeople: 1 }];
    handleFieldChange('groupSizeTiers', newTiers);
  }, [formData.groupSizeTiers, handleFieldChange]);

  const removeTier = useCallback((index: number) => {
    if (formData.groupSizeTiers.length <= 1) {
      setError('At least one group size tier is required');
      return;
    }
    const newTiers = formData.groupSizeTiers.filter((_, i) => i !== index);
    handleFieldChange('groupSizeTiers', newTiers);
  }, [formData.groupSizeTiers, handleFieldChange]);

  // Handle duration options
  const handleDurationChange = useCallback((index: number, value: string) => {
    const newDurations = [...formData.durationOptions];
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      newDurations[index] = numValue;
      handleFieldChange('durationOptions', newDurations);
    }
  }, [formData.durationOptions, handleFieldChange]);

  const addDuration = useCallback(() => {
    const newDurations = [...formData.durationOptions, 1];
    handleFieldChange('durationOptions', newDurations);
  }, [formData.durationOptions, handleFieldChange]);

  const removeDuration = useCallback((index: number) => {
    if (formData.durationOptions.length <= 1) {
      setError('At least one duration option is required');
      return;
    }
    const newDurations = formData.durationOptions.filter((_, i) => i !== index);
    handleFieldChange('durationOptions', newDurations);
  }, [formData.durationOptions, handleFieldChange]);

  // Handle inclusions
  const handleInclusionChange = useCallback((index: number, value: string) => {
    const newInclusions = [...formData.inclusions];
    newInclusions[index] = { ...newInclusions[index], text: value };
    handleFieldChange('inclusions', newInclusions);
  }, [formData.inclusions, handleFieldChange]);

  const addInclusion = useCallback(() => {
    const newInclusions = [...formData.inclusions, { text: '', category: 'other' as const }];
    handleFieldChange('inclusions', newInclusions);
  }, [formData.inclusions, handleFieldChange]);

  const removeInclusion = useCallback((index: number) => {
    const newInclusions = formData.inclusions.filter((_, i) => i !== index);
    handleFieldChange('inclusions', newInclusions);
  }, [formData.inclusions, handleFieldChange]);

  // Handle accommodation examples
  const handleAccommodationChange = useCallback((index: number, value: string) => {
    const newAccommodations = [...formData.accommodationExamples];
    newAccommodations[index] = value;
    handleFieldChange('accommodationExamples', newAccommodations);
  }, [formData.accommodationExamples, handleFieldChange]);

  const addAccommodation = useCallback(() => {
    const newAccommodations = [...formData.accommodationExamples, ''];
    handleFieldChange('accommodationExamples', newAccommodations);
  }, [formData.accommodationExamples, handleFieldChange]);

  const removeAccommodation = useCallback((index: number) => {
    const newAccommodations = formData.accommodationExamples.filter((_, i) => i !== index);
    handleFieldChange('accommodationExamples', newAccommodations);
  }, [formData.accommodationExamples, handleFieldChange]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!validateForm()) {
      const errorMessage = 'Please fix the validation errors before submitting';
      setError(errorMessage);
      showError('Validation Failed', errorMessage);
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors).find(
        key => validationErrors[key]
      );
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
        showSuccess(
          isEditing ? 'Package Updated' : 'Package Created',
          `Package "${formData.name}" has been ${isEditing ? 'updated' : 'created'} successfully`
        );
      } else {
        // Default submission logic
        const url = isEditing && pkg?._id
          ? `/api/admin/super-packages/${pkg._id}`
          : '/api/admin/super-packages';
        
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to save package');
        }

        const result = await response.json();
        showSuccess(
          isEditing ? 'Package Updated' : 'Package Created',
          `Package "${formData.name}" has been ${isEditing ? 'updated' : 'created'} successfully`
        );
        // Handle both response formats: { package: {...} } and { data: { package: {...} } }
        const packageData = result.data?.package || result.package;
        if (packageData?._id) {
          router.push(`/admin/super-packages/${packageData._id}`);
        } else {
          router.push('/admin/super-packages');
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while saving the package';
      setError(errorMessage);
      showError('Failed to Save Package', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, validationErrors, onSubmit, isEditing, pkg, router, showSuccess, showError]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  }, [onCancel, router]);

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Super Package' : 'Create Super Package'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing
            ? 'Update the package details below'
            : 'Create a new super offer package with pricing and inclusions'}
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6">
          <ValidationErrors
            errors={Object.entries(validationErrors)
              .filter(([_, value]) => value)
              .map(([field, message]) => ({ field, message: message! }))}
          />
        </div>
      )}

      {/* Form */}
      <OverlayLoading isLoading={isLoading} message={isEditing ? 'Updating package...' : 'Creating package...'}>
        <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                placeholder="e.g., Benidorm Super Package 2025"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.name && touched.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => handleFieldChange('destination', e.target.value)}
                  onBlur={() => handleFieldBlur('destination')}
                  placeholder="e.g., Benidorm"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.destination && touched.destination ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.destination && touched.destination && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.destination}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resort <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.resort}
                  onChange={(e) => handleFieldChange('resort', e.target.value)}
                  onBlur={() => handleFieldBlur('resort')}
                  placeholder="e.g., Costa Blanca"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.resort && touched.resort ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.resort && touched.resort && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.resort}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleFieldChange('currency', e.target.value as 'EUR' | 'GBP' | 'USD')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFieldChange('status', e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Group Size Tiers Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Group Size Tiers</h2>
              <p className="text-sm text-gray-600">Define pricing tiers based on group size</p>
            </div>
            <button
              type="button"
              onClick={addTier}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add Tier
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.groupSizeTiers.map((tier, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={tier.label}
                    onChange={(e) => handleTierChange(index, 'label', e.target.value)}
                    placeholder="e.g., 6-11 People"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={tier.minPeople}
                    onChange={(e) => handleTierChange(index, 'minPeople', parseInt(e.target.value, 10))}
                    placeholder="Min"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={tier.maxPeople}
                    onChange={(e) => handleTierChange(index, 'maxPeople', parseInt(e.target.value, 10))}
                    placeholder="Max"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTier(index)}
                  disabled={formData.groupSizeTiers.length <= 1}
                  className="px-3 py-2 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {validationErrors.groupSizeTiers && touched.groupSizeTiers && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.groupSizeTiers}</p>
          )}
        </div>

        {/* Duration Options Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Duration Options</h2>
              <p className="text-sm text-gray-600">Number of nights available for this package</p>
            </div>
            <button
              type="button"
              onClick={addDuration}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add Duration
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {formData.durationOptions.map((duration, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => handleDurationChange(index, e.target.value)}
                  min="1"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">nights</span>
                <button
                  type="button"
                  onClick={() => removeDuration(index)}
                  disabled={formData.durationOptions.length <= 1}
                  className="px-2 py-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {validationErrors.durationOptions && touched.durationOptions && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.durationOptions}</p>
          )}
        </div>

        {/* Pricing Matrix Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <PricingMatrixEditor
            groupSizeTiers={formData.groupSizeTiers}
            durationOptions={formData.durationOptions}
            pricingMatrix={formData.pricingMatrix}
            currency={formData.currency}
            onChange={(pricingMatrix) => handleFieldChange('pricingMatrix', pricingMatrix)}
          />
          {validationErrors.pricingMatrix && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.pricingMatrix}</p>
          )}
        </div>

        {/* Inclusions Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Inclusions</h2>
              <p className="text-sm text-gray-600">What's included in this package</p>
            </div>
            <button
              type="button"
              onClick={addInclusion}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add Inclusion
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.inclusions.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No inclusions added yet</p>
            ) : (
              formData.inclusions.map((inclusion, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={inclusion.text}
                      onChange={(e) => handleInclusionChange(index, e.target.value)}
                      placeholder="e.g., Return airport transfers"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInclusion(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Accommodation Examples Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Accommodation Examples</h2>
              <p className="text-sm text-gray-600">Example properties included in this package</p>
            </div>
            <button
              type="button"
              onClick={addAccommodation}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add Example
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.accommodationExamples.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No accommodation examples added yet</p>
            ) : (
              formData.accommodationExamples.map((accommodation, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={accommodation}
                      onChange={(e) => handleAccommodationChange(index, e.target.value)}
                      placeholder="e.g., Hotel Servigroup Pueblo Benidorm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAccommodation(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sales Notes Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Notes</h2>
          <p className="text-sm text-gray-600 mb-3">Internal notes for sales team</p>
          <textarea
            value={formData.salesNotes}
            onChange={(e) => handleFieldChange('salesNotes', e.target.value)}
            placeholder="Add any important notes for the sales team..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Change Description Section (for edits) */}
        {isEditing && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Change Description</h2>
            <p className="text-sm text-gray-600 mb-3">
              Describe what changes you made to this package (optional but recommended for audit trail)
            </p>
            <textarea
              value={formData.changeDescription || ''}
              onChange={(e) => handleFieldChange('changeDescription', e.target.value)}
              placeholder="e.g., Updated pricing for summer season, Added new inclusions..."
              rows={3}
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ButtonLoading isLoading={isLoading} loadingText={isEditing ? 'Updating...' : 'Creating...'}>
              {isEditing ? 'Update Package' : 'Create Package'}
            </ButtonLoading>
          </button>
        </div>
      </form>
      </OverlayLoading>
    </div>
  );
}

// Wrap with error boundary
function SuperPackageFormWithErrorBoundary(props: SuperPackageFormProps) {
  return (
    <SuperPackageErrorBoundary context="form">
      <SuperPackageForm {...props} />
    </SuperPackageErrorBoundary>
  );
}

export { SuperPackageFormWithErrorBoundary as SuperPackageForm };
