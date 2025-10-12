import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import QuoteForm from '../QuoteForm';

// Mock the PackageSelector component
vi.mock('../PackageSelector', () => ({
  default: function MockPackageSelector({ isOpen, onClose, onSelect }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="package-selector-modal">
        <button
          onClick={() => {
            onSelect({
              packageId: 'test-package-id',
              numberOfPeople: 10,
              numberOfNights: 3,
              arrivalDate: '2025-10-15',
            });
            onClose();
          }}
        >
          Select Package
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('QuoteForm - Package Integration', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/admin/super-packages/test-package-id')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              _id: 'test-package-id',
              name: 'Benidorm Super Package',
              version: 1,
              currency: 'EUR',
              inclusions: [
                { text: 'Airport transfers' },
                { text: '3-star accommodation' },
                { text: 'Welcome drink' },
              ],
              accommodationExamples: ['Hotel Sol', 'Hotel Luna'],
            }),
        });
      }
      if (url.includes('/api/admin/super-packages/calculate-price')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              price: 1500,
              tierUsed: '6-11 People',
              periodUsed: 'October',
              tierIndex: 0,
              breakdown: {
                pricePerPerson: 150,
                numberOfPeople: 10,
                totalPrice: 1500,
              },
            }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('should display "Select Super Package" button', () => {
    render(
      <QuoteForm
        enquiryId="507f1f77bcf86cd799439011"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Select Super Package')).toBeInTheDocument();
  });

  it('should open package selector when button is clicked', () => {
    render(
      <QuoteForm
        enquiryId="507f1f77bcf86cd799439011"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const selectButton = screen.getByText('Select Super Package');
    fireEvent.click(selectButton);

    expect(screen.getByTestId('package-selector-modal')).toBeInTheDocument();
  });

  it('should populate form fields when package is selected', async () => {
    render(
      <QuoteForm
        enquiryId="507f1f77bcf86cd799439011"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Open package selector
    const selectButton = screen.getByText('Select Super Package');
    fireEvent.click(selectButton);

    // Select a package
    const selectPackageButton = screen.getByText('Select Package');
    fireEvent.click(selectPackageButton);

    // Wait for API calls and form updates
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/super-packages/test-package-id')
      );
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/super-packages/calculate-price'),
        expect.any(Object)
      );
    });

    // Check if linked package info is displayed
    await waitFor(() => {
      expect(screen.getByText('Linked to Super Package')).toBeInTheDocument();
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });
  });

  it('should display linked package details', async () => {
    render(
      <QuoteForm
        enquiryId="507f1f77bcf86cd799439011"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Open and select package
    fireEvent.click(screen.getByText('Select Super Package'));
    fireEvent.click(screen.getByText('Select Package'));

    // Wait for package info to be displayed
    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    // Check for tier and period information
    expect(screen.getByText(/Tier:/)).toBeInTheDocument();
    expect(screen.getByText(/6-11 People/)).toBeInTheDocument();
    expect(screen.getByText(/Period:/)).toBeInTheDocument();
    expect(screen.getByText(/October/)).toBeInTheDocument();
  });

  it('should display package version badge', async () => {
    render(
      <QuoteForm
        enquiryId="507f1f77bcf86cd799439011"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Open and select package
    fireEvent.click(screen.getByText('Select Super Package'));
    fireEvent.click(screen.getByText('Select Package'));

    // Wait for version badge
    await waitFor(() => {
      expect(screen.getByText('v1')).toBeInTheDocument();
    });
  });

  it('should display link to view package details', async () => {
    render(
      <QuoteForm
        enquiryId="507f1f77bcf86cd799439011"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Open and select package
    fireEvent.click(screen.getByText('Select Super Package'));
    fireEvent.click(screen.getByText('Select Package'));

    // Wait for link to appear
    await waitFor(() => {
      const link = screen.getByText('View package details');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute(
        'href',
        '/admin/super-packages/test-package-id'
      );
    });
  });

  it('should allow unlinking package', async () => {
    render(
      <QuoteForm
        enquiryId="507f1f77bcf86cd799439011"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Open and select package
    fireEvent.click(screen.getByText('Select Super Package'));
    fireEvent.click(screen.getByText('Select Package'));

    // Wait for package to be linked
    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    // Find and click unlink button
    const unlinkButton = screen.getByTitle('Unlink package');
    fireEvent.click(unlinkButton);

    // Package info should be removed
    await waitFor(() => {
      expect(
        screen.queryByText('Benidorm Super Package')
      ).not.toBeInTheDocument();
    });
  });

  it('should load linked package info from initialData when editing', () => {
    const initialData = {
      enquiryId: '507f1f77bcf86cd799439011',
      leadName: 'John Doe',
      hotelName: 'Test Hotel',
      numberOfPeople: 10,
      numberOfRooms: 5,
      numberOfNights: 3,
      arrivalDate: '2025-10-15',
      isSuperPackage: true,
      whatsIncluded: 'Test inclusions',
      transferIncluded: true,
      activitiesIncluded: '',
      totalPrice: 1500,
      currency: 'EUR',
      internalNotes: '',
      linkedPackage: {
        packageId: 'existing-package-id',
        packageName: 'Existing Package',
        packageVersion: 2,
        selectedTier: {
          tierIndex: 1,
          tierLabel: '12+ People',
        },
        selectedNights: 3,
        selectedPeriod: 'November',
        calculatedPrice: 1500,
        priceWasOnRequest: false,
      },
    };

    render(
      <QuoteForm
        enquiryId="507f1f77bcf86cd799439011"
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={true}
      />
    );

    // Check if linked package info is displayed
    expect(screen.getByText('Linked to Super Package')).toBeInTheDocument();
    expect(screen.getByText('Existing Package')).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();
    expect(screen.getByText(/12\+ People/)).toBeInTheDocument();
    expect(screen.getByText(/November/)).toBeInTheDocument();
  });

  it('should display "ON REQUEST" indicator when price was on request', () => {
    const initialData = {
      enquiryId: '507f1f77bcf86cd799439011',
      leadName: 'John Doe',
      hotelName: 'Test Hotel',
      numberOfPeople: 10,
      numberOfRooms: 5,
      numberOfNights: 3,
      arrivalDate: '2025-10-15',
      isSuperPackage: true,
      whatsIncluded: 'Test inclusions',
      transferIncluded: true,
      activitiesIncluded: '',
      totalPrice: 1500,
      currency: 'EUR',
      internalNotes: '',
      linkedPackage: {
        packageId: 'existing-package-id',
        packageName: 'Existing Package',
        packageVersion: 1,
        selectedTier: {
          tierIndex: 0,
          tierLabel: '6-11 People',
        },
        selectedNights: 3,
        selectedPeriod: 'December',
        calculatedPrice: 1500,
        priceWasOnRequest: true,
      },
    };

    render(
      <QuoteForm
        enquiryId="507f1f77bcf86cd799439011"
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={true}
      />
    );

    // Check for ON REQUEST indicator
    expect(
      screen.getByText(/Price was "ON REQUEST" - manually entered/)
    ).toBeInTheDocument();
  });

  it('should include linkedPackage data in form submission', async () => {
    render(
      <QuoteForm
        enquiryId="507f1f77bcf86cd799439011"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Lead Name/), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Hotel Name/), {
      target: { value: 'Test Hotel' },
    });
    fireEvent.change(screen.getByLabelText(/What's Included/), {
      target: { value: 'Test inclusions for the package' },
    });

    // Open and select package
    fireEvent.click(screen.getByText('Select Super Package'));
    fireEvent.click(screen.getByText('Select Package'));

    // Wait for package to be linked
    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByText('Create Quote');
    fireEvent.click(submitButton);

    // Check if onSubmit was called with linkedPackage data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          linkedPackage: expect.objectContaining({
            packageId: 'test-package-id',
            packageName: 'Benidorm Super Package',
            packageVersion: 1,
            selectedTier: expect.objectContaining({
              tierLabel: '6-11 People',
            }),
            calculatedPrice: 1500,
            priceWasOnRequest: false,
          }),
        })
      );
    });
  });

  it('should allow manual adjustments after package selection', async () => {
    render(
      <QuoteForm
        enquiryId="507f1f77bcf86cd799439011"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Lead Name/), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Hotel Name/), {
      target: { value: 'Test Hotel' },
    });

    // Open and select package
    fireEvent.click(screen.getByText('Select Super Package'));
    fireEvent.click(screen.getByText('Select Package'));

    // Wait for package to be linked
    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    // Manually adjust the price
    const priceInput = screen.getByLabelText(/Total Price/);
    fireEvent.change(priceInput, { target: { value: '2000' } });

    // Check that the manual adjustment is reflected
    expect(priceInput).toHaveValue(2000);

    // Check that the info message is displayed
    expect(
      screen.getByText(
        /Quote fields have been populated from the package. You can still make manual adjustments./
      )
    ).toBeInTheDocument();
  });
});
