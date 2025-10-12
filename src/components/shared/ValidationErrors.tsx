'use client';

/**
 * Component for displaying validation errors in forms
 */

import React from 'react';

export interface ValidationError {
  field: string;
  message: string;
}

interface ValidationErrorsProps {
  errors: ValidationError[] | Record<string, string>;
  className?: string;
}

export function ValidationErrors({
  errors,
  className = '',
}: ValidationErrorsProps) {
  // Convert errors to array format
  const errorArray: ValidationError[] = Array.isArray(errors)
    ? errors
    : Object.entries(errors).map(([field, message]) => ({ field, message }));

  if (errorArray.length === 0) return null;

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {errorArray.length === 1
              ? 'Please fix the following error:'
              : `Please fix the following ${errorArray.length} errors:`}
          </h3>
          <ul className="mt-2 text-sm text-red-700 space-y-1">
            {errorArray.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong className="font-medium">{error.field}:</strong>{' '}
                  {error.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p className={`text-sm text-red-600 mt-1 ${className}`} role="alert">
      {error}
    </p>
  );
}

interface FieldWrapperProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldWrapper({
  label,
  error,
  required,
  children,
  className = '',
}: FieldWrapperProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {children}
      <FieldError error={error} />
    </div>
  );
}
