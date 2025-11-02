# Implementation Plan

## Overview

This implementation adds quote title and destination fields to the quote creation form. The tasks are organized to ensure incremental progress with each step building on the previous one.

## Tasks

- [x] 1. Update validation schema to include title and destination fields
  - Modify `src/lib/validation/quote-validation.ts` to add title and destination to the QuoteFormData interface
  - Add validation rules for title (optional, max 200 characters) and destination (optional, max 100 characters) to the quoteFormValidationSchema
  - Ensure the validation schema properly handles optional fields
  - _Requirements: 1.4, 2.4, 3.3, 4.2_

- [x] 2. Add title and destination fields to QuoteForm component
  - [x] 2.1 Add fields to form default values
    - Update the useForm defaultValues in `src/components/admin/QuoteForm.tsx` to include title and destination from initialData
    - Ensure fields default to empty string when not provided
    - _Requirements: 1.5, 2.5_
  
  - [x] 2.2 Create Quote Title input field UI
    - Add a full-width text input field for "Quote Title" in the Lead Information section
    - Position it as the first field in the section, before Lead Name
    - Add label "Quote Title (Optional)" with proper styling
    - Add placeholder text "Enter a descriptive title for this quote..."
    - Register the field with react-hook-form using {...register('title')}
    - Add character counter displaying "X/200 characters" below the field
    - Add error message display for validation errors
    - Apply consistent styling with existing form fields
    - _Requirements: 1.1, 1.2, 1.4, 3.1, 3.3_
  
  - [x] 2.3 Create Destination input field UI
    - Add a full-width text input field for "Destination" in the Lead Information section
    - Position it after Quote Title and before Lead Name
    - Add label "Destination (Optional)" with proper styling
    - Add placeholder text "e.g., Benidorm, Albufeira, Marbella..."
    - Register the field with react-hook-form using {...register('destination')}
    - Add character counter displaying "X/100 characters" below the field
    - Add error message display for validation errors
    - Apply consistent styling with existing form fields
    - _Requirements: 2.1, 2.2, 2.4, 3.2, 3.3_
  
  - [x] 2.4 Ensure form submission includes new fields
    - Verify that the onFormSubmit function includes title and destination in the submitted data
    - Ensure the fields are properly included in the submitData object
    - Verify that optional empty fields are handled correctly
    - _Requirements: 3.4, 4.1_

- [x] 3. Verify integration with existing quote system
  - [x] 3.1 Test quote creation with new fields
    - Create a new quote with title and destination populated
    - Create a new quote with title and destination empty
    - Verify data is saved correctly to the database
    - _Requirements: 3.4, 4.1, 4.3_
  
  - [x] 3.2 Test quote editing with new fields
    - Edit an existing quote and add title and destination
    - Edit an existing quote and modify existing title and destination
    - Edit an existing quote and clear title and destination
    - Verify changes are persisted correctly
    - _Requirements: 1.5, 2.5, 4.3_
  
  - [x] 3.3 Test package integration
    - Link a super package to a quote with manually entered title and destination
    - Verify that package selection does not override title and destination
    - Verify that all package-related functionality continues to work
    - _Requirements: 4.4, 4.5_
  
  - [x] 3.4 Test validation and error handling
    - Enter text exceeding 200 characters in title field
    - Enter text exceeding 100 characters in destination field
    - Verify validation error messages display correctly
    - Verify form submission is prevented when validation fails
    - Test with special characters and edge cases
    - _Requirements: 1.4, 2.4, 3.3_

- [x] 4. Update quote display views to show new fields
  - Check if QuoteManager or other quote display components need updates to show title and destination
  - Update quote list view to display title if available
  - Update quote details view to display destination if available
  - Ensure backward compatibility with quotes that don't have these fields
  - _Requirements: 3.5, 4.3_
