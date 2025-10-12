'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAutoSave, useUnsavedChanges } from '@/lib/hooks/useAutoSave';
import {
  quoteFormValidationSchema,
  QuoteFormData,
  QUOTE_BUSINESS_RULES,
  quoteValidationHelpers,
} from '@/lib/validation/quote-validation';
import PackageSelector from './PackageSelector';
import PriceSyncIndicator from './PriceSyncIndicator';
import PriceRecalculationModal from './PriceRecalculationModal';
import { useQuotePrice } from '@/lib/hooks/useQuotePrice';
import { PackageSelection, LinkedPackageInfo } from '@/types/quote-price-sync';

interface QuoteFormProps {
  enquiryId?: string;
  initialData?: Partial<QuoteFormData>;
  onSubmit: (data: QuoteFormData) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
  className?: string;
}

export default function QuoteForm({
  enquiryId,
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  className = '',
}: QuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPackageSelectorOpen, setIsPackageSelectorOpen] = useState(false);
  const [isRecalculationModalOpen, setIsRecalculationModalOpen] = useState(false);
  const [linkedPackageInfo, setLinkedPackageInfo] = useState<LinkedPackageInfo | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form setup with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty, isValidating },
    reset,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormValidationSchema),
    defaultValues: {
      enquiryId: enquiryId || initialData?.enquiryId || '',
      leadName: initialData?.leadName || '',
      hotelName: initialData?.hotelName || '',
      numberOfPeople: initialData?.numberOfPeople || 1,
      numberOfRooms: initialData?.numberOfRooms || 1,
      numberOfNights: initialData?.numberOfNights || 3,
      arrivalDate: initialData?.arrivalDate || '',
      isSuperPackage: initialData?.isSuperPackage || false,
      whatsIncluded: initialData?.whatsIncluded || '',
      transferIncluded: initialData?.transferIncluded || false,
      activitiesIncluded: initialData?.activitiesIncluded || '',
      totalPrice: initialData?.totalPrice || 0,
      currency: initialData?.currency || 'GBP',
      internalNotes: initialData?.internalNotes || '',
    },
  });

  // Watch form data for auto-save and validation
  const formData = watch();
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isValidatingServer, setIsValidatingServer] = useState(false);

  // Integrate useQuotePrice hook for price synchronization
  const {
    syncStatus,
    calculatedPrice,
    priceBreakdown,
    error: priceError,
    recalculatePrice,
    markAsCustomPrice,
    resetToCalculated,
    validationWarnings: priceValidationWarnings,
  } = useQuotePrice({
    linkedPackage: linkedPackageInfo,
    numberOfPeople: watch('numberOfPeople'),
    numberOfNights: watch('numberOfNights'),
    arrivalDate: watch('arrivalDate'),
    currentPrice: watch('totalPrice'),
    onPriceUpdate: (price) => {
      setValue('totalPrice', price);
    },
    autoRecalculate: true,
  });

  // Load linked package info from initialData when editing
  useEffect(() => {
    if (initialData && (initialData as any).linkedPackage) {
      const linkedPkg = (initialData as any).linkedPackage;
      setLinkedPackageInfo({
        packageId: linkedPkg.packageId?.toString() || '',
        packageName: linkedPkg.packageName || '',
        packageVersion: linkedPkg.packageVersion || 1,
        tierLabel: linkedPkg.selectedTier?.tierLabel || '',
        periodUsed: linkedPkg.selectedPeriod || '',
        tierIndex: linkedPkg.selectedTier?.tierIndex || 0,
        originalPrice: linkedPkg.calculatedPrice || linkedPkg.originalPrice || 0,
      });
    }
  }, [initialData]);

  // Watch specific fields instead of entire formData object
  const numberOfPeople = watch('numberOfPeople');
  const numberOfRooms = watch('numberOfRooms');
  const numberOfNights = watch('numberOfNights');
  const totalPrice = watch('totalPrice');
  const currency = watch('currency');
  const arrivalDate = watch('arrivalDate');
  const whatsIncluded = watch('whatsIncluded');
  const transferIncluded = watch('transferIncluded');

  // Real-time validation warnings with specific dependencies
  useEffect(() => {
    const warnings: string[] = [];

    if (numberOfPeople && numberOfRooms) {
      if (
        !quoteValidationHelpers.isReasonableRoomRatio(
          numberOfPeople,
          numberOfRooms
        )
      ) {
        warnings.push(
          'Room to people ratio seems unusual. Consider adjusting.'
        );
      }
    }

    if (totalPrice && numberOfPeople) {
      if (
        !quoteValidationHelpers.isReasonablePricePerPerson(
          totalPrice,
          numberOfPeople
        )
      ) {
        warnings.push(
          `Price per person (${formatCurrency(totalPrice / numberOfPeople, currency)}) seems unusual.`
        );
      }
    }

    if (arrivalDate) {
      const arrivalDateObj = new Date(arrivalDate);
      const today = new Date();
      const daysDifference = Math.ceil(
        (arrivalDateObj.getTime() - today.getTime()) / (1000 * 3600 * 24)
      );

      if (daysDifference < 7 && daysDifference > 0) {
        warnings.push(
          'Short notice booking - less than 7 days advance notice.'
        );
      } else if (daysDifference > 365) {
        warnings.push('Long advance booking - more than 1 year in advance.');
      }
    }

    if (whatsIncluded && whatsIncluded.length < 50) {
      warnings.push(
        'Consider adding more details to "What\'s included" for better customer understanding.'
      );
    }

    if (
      transferIncluded &&
      whatsIncluded &&
      !whatsIncluded.toLowerCase().includes('transfer')
    ) {
      warnings.push(
        'Transfer is marked as included but not mentioned in the description.'
      );
    }

    // Merge with price validation warnings from useQuotePrice hook
    const allWarnings = [...warnings, ...priceValidationWarnings];
    setValidationWarnings(allWarnings);
  }, [
    numberOfPeople,
    numberOfRooms,
    totalPrice,
    currency,
    arrivalDate,
    whatsIncluded,
    transferIncluded,
    priceValidationWarnings,
  ]);

  // Simplified validation - remove server-side validation for now
  const validateServerSide = async (field: string, value: any) => {
    // Disabled to prevent infinite loops
    return;
  };

  // Auto-save functionality - disabled to prevent issues
  const autoSaveStatus = {
    isSaving: false,
    lastSaved: null,
    error: null,
  };

  // Warn about unsaved changes - disabled for now
  // useUnsavedChanges(isDirty && !autoSaveStatus.isSaving);

  // Currency formatting
  const formatCurrency = (amount: number, currency: string) => {
    const symbols = { GBP: '£', EUR: '€', USD: '$' };
    return `${symbols[currency as keyof typeof symbols] || currency} ${amount.toLocaleString()}`;
  };

  // Get tomorrow's date for minimum arrival date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Handle form submission
  const onFormSubmit = async (data: QuoteFormData) => {
    // If there are validation warnings, require confirmation
    if (validationWarnings.length > 0) {
      const confirmed = window.confirm(
        `There are ${validationWarnings.length} validation warning(s):\n\n` +
        validationWarnings.map((w, i) => `${i + 1}. ${w}`).join('\n') +
        '\n\nDo you want to proceed anyway?'
      );
      
      if (!confirmed) {
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Include linkedPackage data if available
      const submitData = {
        ...data,
        ...(linkedPackageInfo && {
          linkedPackage: {
            packageId: linkedPackageInfo.packageId,
            packageName: linkedPackageInfo.packageName,
            packageVersion: linkedPackageInfo.packageVersion,
            selectedTier: {
              tierIndex: linkedPackageInfo.tierIndex,
              tierLabel: linkedPackageInfo.tierLabel,
            },
            selectedNights: data.numberOfNights,
            selectedPeriod: linkedPackageInfo.periodUsed,
            calculatedPrice: typeof linkedPackageInfo.originalPrice === 'number' ? linkedPackageInfo.originalPrice : data.totalPrice,
            priceWasOnRequest: linkedPackageInfo.originalPrice === 'ON_REQUEST',
          },
        }),
      };
      
      await onSubmit(submitData as QuoteFormData);
      reset(data); // Reset form state to mark as clean
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to save quote'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate estimated rooms based on people
  const estimatedRooms = Math.ceil(numberOfPeople / 2);
  // Removed auto-update of rooms to prevent infinite loop
  // Users can manually adjust rooms as needed

  // Handle package selection with atomic updates
  const handlePackageSelect = (selection: PackageSelection) => {
    // Use startTransition for atomic, non-urgent state updates
    startTransition(() => {
      try {
        // Update all form fields atomically
        setValue('numberOfPeople', selection.numberOfPeople);
        setValue('numberOfNights', selection.numberOfNights);
        setValue('arrivalDate', selection.arrivalDate);
        setValue('numberOfRooms', Math.ceil(selection.numberOfPeople / 2));
        // Only set currency if it's a valid option
        const validCurrency = ['GBP', 'EUR', 'USD'].includes(selection.priceCalculation.currency);
        if (validCurrency) {
          setValue('currency', selection.priceCalculation.currency as 'GBP' | 'EUR' | 'USD');
        }
        setValue('isSuperPackage', true);
        
        // Build inclusions text from package
        if (selection.inclusions && selection.inclusions.length > 0) {
          const inclusionsText = selection.inclusions
            .map((inc) => `• ${inc.text}`)
            .join('\n');
          setValue('whatsIncluded', inclusionsText);
        }
        
        // Set price if calculated (not ON_REQUEST)
        if (selection.priceCalculation.price !== 'ON_REQUEST') {
          setValue('totalPrice', selection.priceCalculation.price);
        }
        
        // Add accommodation examples to internal notes
        if (selection.accommodationExamples && selection.accommodationExamples.length > 0) {
          const notesText = `Accommodation Examples:\n${selection.accommodationExamples.map((ex) => `• ${ex}`).join('\n')}`;
          setValue('internalNotes', notesText);
        }

        // Store linked package info for price synchronization
        setLinkedPackageInfo({
          packageId: selection.packageId,
          packageName: selection.packageName,
          packageVersion: selection.packageVersion,
          tierIndex: selection.priceCalculation.tierIndex,
          tierLabel: selection.priceCalculation.tierUsed,
          periodUsed: selection.priceCalculation.periodUsed,
          originalPrice: selection.priceCalculation.price,
        });
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to apply package'
        );
      }
    });
  };

  // Handle unlinking package with confirmation and data preservation
  const handleUnlinkPackage = () => {
    const confirmed = window.confirm(
      'Are you sure you want to unlink this package?\n\n' +
      'All current field values will be preserved, but automatic price recalculation will stop.\n\n' +
      'You can manually edit all fields after unlinking.'
    );
    
    if (!confirmed) {
      return;
    }

    // Preserve all current field values - they remain unchanged
    // Only remove the package link and stop auto-recalculation
    setLinkedPackageInfo(null);
    setValue('isSuperPackage', false);
    
    // Note: All form fields (price, people, nights, date, inclusions, etc.) 
    // remain exactly as they are - we only remove the package relationship
  };

  // Handle manual price changes to detect custom prices
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value) || 0;
    setValue('totalPrice', newPrice);
    
    // If there's a linked package and price differs from calculated, mark as custom
    if (linkedPackageInfo && calculatedPrice && calculatedPrice !== 'ON_REQUEST') {
      if (Math.abs(newPrice - calculatedPrice) > 0.01) {
        markAsCustomPrice();
      }
    }
  };

  return (
    <div className={className}>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Quote' : 'Create New Quote'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isEditing
                ? 'Update the quote details below'
                : 'Complete the form below to create a new quote'}
            </p>

            {/* Auto-save disabled for stability */}
          </div>

          {/* Error Display */}
          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
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
                  <p className="text-sm text-red-700 mt-1">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Warnings */}
          {validationWarnings.length > 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Validation Warnings
                  </h3>
                  <div className="text-sm text-amber-700 mt-1">
                    <ul className="list-disc list-inside space-y-1">
                      {validationWarnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Server Validation Indicator */}
          {isValidatingServer && (
            <div className="mb-4 flex items-center text-sm text-blue-600">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
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
              Validating...
            </div>
          )}

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Lead Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Lead Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="leadName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Lead Name *
                  </label>
                  <input
                    type="text"
                    id="leadName"
                    {...register('leadName')}
                    onBlur={(e) =>
                      validateServerSide('leadName', e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.leadName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter lead's name"
                  />
                  {errors.leadName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.leadName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="hotelName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    id="hotelName"
                    {...register('hotelName')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.hotelName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter hotel name"
                  />
                  {errors.hotelName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.hotelName.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Trip Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="numberOfPeople"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Number of People *
                  </label>
                  <input
                    type="number"
                    id="numberOfPeople"
                    {...register('numberOfPeople', { valueAsNumber: true })}
                    min="1"
                    max="100"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.numberOfPeople
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.numberOfPeople && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.numberOfPeople.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="numberOfRooms"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Number of Rooms *
                  </label>
                  <input
                    type="number"
                    id="numberOfRooms"
                    {...register('numberOfRooms', { valueAsNumber: true })}
                    min="1"
                    max="50"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.numberOfRooms
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.numberOfRooms && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.numberOfRooms.message}
                    </p>
                  )}
                  {numberOfRooms < estimatedRooms && (
                    <p className="text-amber-600 text-sm mt-1">
                      Suggested: {estimatedRooms} rooms for {numberOfPeople}{' '}
                      people
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="numberOfNights"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Number of Nights *
                  </label>
                  <input
                    type="number"
                    id="numberOfNights"
                    {...register('numberOfNights', { valueAsNumber: true })}
                    min="1"
                    max="30"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.numberOfNights
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.numberOfNights && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.numberOfNights.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="arrivalDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Arrival Date *
                  </label>
                  <input
                    type="date"
                    id="arrivalDate"
                    {...register('arrivalDate')}
                    onBlur={(e) =>
                      validateServerSide('arrivalDate', e.target.value)
                    }
                    min={getTomorrowDate()}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.arrivalDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.arrivalDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.arrivalDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Package Details
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPackageSelectorOpen(true)}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Select Super Package
                </button>
              </div>

              {/* Linked Package Info */}
              {linkedPackageInfo && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-blue-600 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-blue-900">
                          Linked to Super Package
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-blue-900">
                            {linkedPackageInfo.packageName}
                          </span>
                          {linkedPackageInfo.packageVersion && (
                            <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                              v{linkedPackageInfo.packageVersion}
                            </span>
                          )}
                        </div>
                        {linkedPackageInfo.tierLabel && (
                          <div className="text-xs text-blue-700">
                            <span className="font-medium">Tier:</span> {linkedPackageInfo.tierLabel}
                            {linkedPackageInfo.periodUsed && (
                              <>
                                {' • '}
                                <span className="font-medium">Period:</span> {linkedPackageInfo.periodUsed}
                              </>
                            )}
                          </div>
                        )}
                        {linkedPackageInfo.originalPrice === 'ON_REQUEST' && (
                          <div className="text-xs text-amber-700 flex items-center mt-1">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            Price was "ON REQUEST" - manually entered
                          </div>
                        )}
                        <div className="mt-2">
                          <a
                            href={`/admin/super-packages/${linkedPackageInfo.packageId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center"
                          >
                            View package details
                            <svg
                              className="w-3 h-3 ml-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleUnlinkPackage}
                      className="ml-3 text-blue-600 hover:text-blue-800 flex-shrink-0"
                      title="Unlink package"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {isEditing && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <button
                        type="button"
                        onClick={() => setIsRecalculationModalOpen(true)}
                        className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Recalculate Price
                      </button>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-700">
                      <svg
                        className="w-3 h-3 inline mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Quote fields have been populated from the package. You can still make manual adjustments.
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isSuperPackage')}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Super Package
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Check if this is a premium/super package
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="whatsIncluded"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  What's Included *
                </label>
                <textarea
                  id="whatsIncluded"
                  {...register('whatsIncluded')}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.whatsIncluded ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe what's included in this quote..."
                />
                {errors.whatsIncluded && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.whatsIncluded.message}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {whatsIncluded?.length || 0}/2000 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('transferIncluded')}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Transfer Included
                    </span>
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="activitiesIncluded"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Activities Included
                  </label>
                  <textarea
                    id="activitiesIncluded"
                    {...register('activitiesIncluded')}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.activitiesIncluded
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="List any activities included..."
                  />
                  {errors.activitiesIncluded && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.activitiesIncluded.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="totalPrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Total Price *
                    </label>
                    {linkedPackageInfo && (
                      <PriceSyncIndicator
                        status={syncStatus}
                        priceBreakdown={priceBreakdown || undefined}
                        error={priceError || undefined}
                        onRecalculate={recalculatePrice}
                        onResetToCalculated={resetToCalculated}
                      />
                    )}
                  </div>
                  <input
                    type="number"
                    id="totalPrice"
                    {...register('totalPrice', { valueAsNumber: true })}
                    onChange={handlePriceChange}
                    min="0"
                    max="1000000"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.totalPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.totalPrice && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.totalPrice.message}
                    </p>
                  )}
                  {priceError && (
                    <p className="text-red-600 text-sm mt-1">
                      {priceError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Currency *
                  </label>
                  <select
                    id="currency"
                    {...register('currency')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.currency ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                  {errors.currency && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.currency.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Price Summary */}
              {totalPrice > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm">
                    <p>
                      <span className="font-medium">Total Price:</span>{' '}
                      {formatCurrency(totalPrice, currency)}
                    </p>
                    <p>
                      <span className="font-medium">Price per Person:</span>{' '}
                      {formatCurrency(totalPrice / numberOfPeople, currency)}
                    </p>
                    <p>
                      <span className="font-medium">Price per Room:</span>{' '}
                      {formatCurrency(totalPrice / numberOfRooms, currency)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Internal Notes */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Internal Notes
              </h3>
              <div>
                <label
                  htmlFor="internalNotes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Internal Notes (Optional)
                </label>
                <textarea
                  id="internalNotes"
                  {...register('internalNotes')}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.internalNotes ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Add any internal notes or comments..."
                />
                {errors.internalNotes && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.internalNotes.message}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {watch('internalNotes')?.length || 0}/1000 characters
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </div>
                ) : isEditing ? (
                  'Update Quote'
                ) : (
                  'Create Quote'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Package Selector Modal */}
      <PackageSelector
        isOpen={isPackageSelectorOpen}
        onClose={() => setIsPackageSelectorOpen(false)}
        onSelect={handlePackageSelect}
        initialPeople={numberOfPeople}
        initialNights={numberOfNights}
        initialDate={arrivalDate}
      />

      {/* Price Recalculation Modal */}
      {isEditing && linkedPackageInfo && (initialData as any)?._id && (
        <PriceRecalculationModal
          isOpen={isRecalculationModalOpen}
          onClose={() => setIsRecalculationModalOpen(false)}
          quoteId={(initialData as any)._id}
          onSuccess={() => {
            // Refresh the form or trigger a refetch
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
