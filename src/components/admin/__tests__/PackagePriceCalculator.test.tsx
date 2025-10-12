import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PackagePriceCalculator from '../PackagePriceCalculator';

// Mock fetch
global.fetch = vi.fn();

const mockPackage = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Benidorm Super Package',
  destination: 'Benidorm',
  resort: 'Costa Blanca',
  currency: 'EUR',
  status: 'active',
  groupSizeTiers: [
    { label: '6-11 People', minPeople: 6, maxPeople: 11 },
    { label: '12+ People', minPeople: 12, maxPeople: 100 },
  ],
  durationOptions: [2, 3, 4],
  pricingMatrix: [
    {
      period: 'January',
      periodType: 'month',
      prices: [
        { groupSizeTierIndex: 0, nights: 2, price: 150 },
        { groupSizeTierIndex: 0, nights: 3, price: 200 },
        { groupSizeTierIndex: 0, nights: 4, price: 250 },
        { groupSizeTierIndex: 1, nights: 2, price: 120 },
        { groupSizeTierIndex: 1, nights: 3, price: 160 },
        { groupSizeTierIndex: 1, nights: 4, price: 200 },
      ],
    },
  ],
  inclusions: [
    { text: 'Airport transfers', category: 'transfer' },
    { text: '3-star accommodation', category: 'accommodation' },
  ],
  accommodationExamples: ['Hotel Sol', 'Hotel Luna'],
  salesNotes: 'Great value package',
  version: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('PackagePriceCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Package Selection', () => {
    it('should load and display packages when no initial package provided', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ packages: [mockPackage] }),
      });

      render(<PackagePriceCalculator />);

      await waitFor(() => {
        expect(screen.getByText(/Select a package/i)).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should display package details when package is selected', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ packages: [mockPackage] }),
      });

      render(<PackagePriceCalculator />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: mockPackage._id } });

      await waitFor(() => {
        expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
        expect(screen.getByText('Benidorm')).toBeInTheDocument();
        expect(screen.getByText('Costa Blanca')).toBeInTheDocument();
      });
    });

    it('should use provided package data when initialPackageData prop is passed', () => {
      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
      expect(screen.queryByText(/Select a package/i)).not.toBeInTheDocument();
    });
  });

  describe('Price Calculation', () => {
    it('should calculate price when form is submitted', async () => {
      const calculationResult = {
        price: 150,
        tier: {
          index: 0,
          label: '6-11 People',
          minPeople: 6,
          maxPeople: 11,
        },
        period: {
          period: 'January',
          periodType: 'month',
        },
        nights: 2,
        currency: 'EUR',
        packageName: 'Benidorm Super Package',
        packageId: mockPackage._id,
        packageVersion: 1,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => calculationResult,
      });

      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      const calculateButton = screen.getByRole('button', { name: /Calculate Price/i });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText('Price Calculation')).toBeInTheDocument();
        expect(screen.getByText('6-11 People')).toBeInTheDocument();
        expect(screen.getByText('January')).toBeInTheDocument();
      });
    });

    it('should display ON_REQUEST message when price is on request', async () => {
      const calculationResult = {
        price: 'ON_REQUEST',
        tier: {
          index: 0,
          label: '6-11 People',
          minPeople: 6,
          maxPeople: 11,
        },
        period: {
          period: 'January',
          periodType: 'month',
        },
        nights: 2,
        currency: 'EUR',
        packageName: 'Benidorm Super Package',
        packageId: mockPackage._id,
        packageVersion: 1,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => calculationResult,
      });

      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      const calculateButton = screen.getByRole('button', { name: /Calculate Price/i });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText('Price On Request')).toBeInTheDocument();
      });
    });

    it('should display error message when calculation fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No pricing available for this date' }),
      });

      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      const calculateButton = screen.getByRole('button', { name: /Calculate Price/i });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText('No pricing available for this date')).toBeInTheDocument();
      });
    });

    it('should calculate total price correctly', async () => {
      const calculationResult = {
        price: 150,
        tier: {
          index: 0,
          label: '6-11 People',
          minPeople: 6,
          maxPeople: 11,
        },
        period: {
          period: 'January',
          periodType: 'month',
        },
        nights: 2,
        currency: 'EUR',
        packageName: 'Benidorm Super Package',
        packageId: mockPackage._id,
        packageVersion: 1,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => calculationResult,
      });

      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      // Set number of people to 10
      const peopleInput = screen.getByLabelText(/Number of People/i);
      fireEvent.change(peopleInput, { target: { value: '10' } });

      const calculateButton = screen.getByRole('button', { name: /Calculate Price/i });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        // Total should be 150 * 10 = 1500
        expect(screen.getByText(/€1500\.00/)).toBeInTheDocument();
      });
    });
  });

  describe('Pricing Matrix Display', () => {
    it('should display pricing matrix table', () => {
      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      expect(screen.getByText('Pricing Matrix')).toBeInTheDocument();
      expect(screen.getByText('6-11 People')).toBeInTheDocument();
      expect(screen.getByText('12+ People')).toBeInTheDocument();
    });

    it('should display prices in the matrix', () => {
      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      // Check for formatted prices
      expect(screen.getByText('€150.00')).toBeInTheDocument();
      expect(screen.getByText('€200.00')).toBeInTheDocument();
    });

    it('should display "On Request" for ON_REQUEST prices', () => {
      const packageWithOnRequest = {
        ...mockPackage,
        pricingMatrix: [
          {
            period: 'January',
            periodType: 'month',
            prices: [
              { groupSizeTierIndex: 0, nights: 2, price: 'ON_REQUEST' },
            ],
          },
        ],
      };

      render(<PackagePriceCalculator packageData={packageWithOnRequest as any} />);

      expect(screen.getByText('On Request')).toBeInTheDocument();
    });
  });

  describe('Package Details Display', () => {
    it('should display inclusions', () => {
      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      expect(screen.getByText('Package Inclusions')).toBeInTheDocument();
      expect(screen.getByText('Airport transfers')).toBeInTheDocument();
      expect(screen.getByText('3-star accommodation')).toBeInTheDocument();
    });

    it('should display accommodation examples', () => {
      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      expect(screen.getByText('Accommodation Examples')).toBeInTheDocument();
      expect(screen.getByText('Hotel Sol')).toBeInTheDocument();
      expect(screen.getByText('Hotel Luna')).toBeInTheDocument();
    });

    it('should display sales notes', () => {
      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      expect(screen.getByText('Sales Notes')).toBeInTheDocument();
      expect(screen.getByText('Great value package')).toBeInTheDocument();
    });

    it('should not display sections when data is empty', () => {
      const packageWithoutExtras = {
        ...mockPackage,
        inclusions: [],
        accommodationExamples: [],
        salesNotes: '',
      };

      render(<PackagePriceCalculator packageData={packageWithoutExtras as any} />);

      expect(screen.queryByText('Package Inclusions')).not.toBeInTheDocument();
      expect(screen.queryByText('Accommodation Examples')).not.toBeInTheDocument();
      expect(screen.queryByText('Sales Notes')).not.toBeInTheDocument();
    });
  });

  describe('Form Inputs', () => {
    it('should update number of people input', () => {
      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      const peopleInput = screen.getByLabelText(/Number of People/i) as HTMLInputElement;
      fireEvent.change(peopleInput, { target: { value: '15' } });

      expect(peopleInput.value).toBe('15');
    });

    it('should update number of nights select', () => {
      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      const nightsSelect = screen.getByLabelText(/Number of Nights/i) as HTMLSelectElement;
      fireEvent.change(nightsSelect, { target: { value: '4' } });

      expect(nightsSelect.value).toBe('4');
    });

    it('should update arrival date input', () => {
      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      const dateInput = screen.getByLabelText(/Arrival Date/i) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-06-15' } });

      expect(dateInput.value).toBe('2024-06-15');
    });

    it('should only show available duration options in select', () => {
      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      const nightsSelect = screen.getByLabelText(/Number of Nights/i);
      const options = nightsSelect.querySelectorAll('option');

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('2 nights');
      expect(options[1]).toHaveTextContent('3 nights');
      expect(options[2]).toHaveTextContent('4 nights');
    });
  });

  describe('Currency Formatting', () => {
    it('should format EUR currency correctly', () => {
      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      expect(screen.getByText('€150.00')).toBeInTheDocument();
    });

    it('should format GBP currency correctly', () => {
      const gbpPackage = { ...mockPackage, currency: 'GBP' };
      render(<PackagePriceCalculator packageData={gbpPackage as any} />);

      expect(screen.getByText('£150.00')).toBeInTheDocument();
    });

    it('should format USD currency correctly', () => {
      const usdPackage = { ...mockPackage, currency: 'USD' };
      render(<PackagePriceCalculator packageData={usdPackage as any} />);

      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state when fetching packages', () => {
      (global.fetch as any).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<PackagePriceCalculator />);

      expect(screen.getByText(/Loading packages/i)).toBeInTheDocument();
    });

    it('should show calculating state when calculating price', async () => {
      (global.fetch as any).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<PackagePriceCalculator packageData={mockPackage as any} />);

      const calculateButton = screen.getByRole('button', { name: /Calculate Price/i });
      fireEvent.click(calculateButton);

      expect(screen.getByText('Calculating...')).toBeInTheDocument();
    });
  });

  describe('Callback Props', () => {
    it('should call onPackageSelect when package is selected', async () => {
      const onPackageSelect = vi.fn();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ packages: [mockPackage] }),
      });

      render(<PackagePriceCalculator onPackageSelect={onPackageSelect} />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: mockPackage._id } });

      await waitFor(() => {
        expect(onPackageSelect).toHaveBeenCalledWith(mockPackage._id);
      });
    });
  });
});
