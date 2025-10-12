import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRouter } from 'next/navigation';
import CSVImporter from '../CSVImporter';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn() as any;

describe('CSVImporter', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (global.fetch as any).mockClear();
  });

  describe('File Upload Interface', () => {
    it('renders upload interface initially', () => {
      render(<CSVImporter />);

      expect(screen.getByText(/Import Super Package from CSV/i)).toBeInTheDocument();
      expect(screen.getByText(/Drag and drop your CSV file here/i)).toBeInTheDocument();
      expect(screen.getByText(/Select File/i)).toBeInTheDocument();
    });

    it('shows file type validation error for non-CSV files', async () => {
      render(<CSVImporter />);

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByRole('button', { name: /Select File/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
      });
    });

    it('shows file size validation error for large files', async () => {
      render(<CSVImporter />);

      // Create a file larger than 5MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.csv', {
        type: 'text/csv',
      });
      const input = screen.getByRole('button', { name: /Select File/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/File too large/i)).toBeInTheDocument();
      });
    });

    it('uploads valid CSV file and shows progress', async () => {
      const mockParsedData = {
        name: 'Test Package',
        destination: 'Test Destination',
        resort: 'Test Resort',
        currency: 'EUR' as const,
        groupSizeTiers: [{ label: '6-11 People', minPeople: 6, maxPeople: 11 }],
        durationOptions: [2, 3],
        pricingMatrix: [],
        inclusions: [],
        accommodationExamples: [],
        salesNotes: '',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          preview: mockParsedData,
          filename: 'test.csv',
        }),
      });

      render(<CSVImporter />);

      const file = new File(['csv,content'], 'test.csv', { type: 'text/csv' });
      const input = screen.getByRole('button', { name: /Select File/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/Review Imported Package/i)).toBeInTheDocument();
      });
    });

    it('handles upload errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Failed to parse CSV',
          details: 'Invalid format',
        }),
      });

      render(<CSVImporter />);

      const file = new File(['csv,content'], 'test.csv', { type: 'text/csv' });
      const input = screen.getByRole('button', { name: /Select File/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/Invalid format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Preview Interface', () => {
    const mockParsedData = {
      name: 'Test Package',
      destination: 'Test Destination',
      resort: 'Test Resort',
      currency: 'EUR' as const,
      groupSizeTiers: [
        { label: '6-11 People', minPeople: 6, maxPeople: 11 },
        { label: '12+ People', minPeople: 12, maxPeople: 999 },
      ],
      durationOptions: [2, 3, 4],
      pricingMatrix: [
        {
          period: 'January',
          periodType: 'month' as const,
          prices: [
            { groupSizeTierIndex: 0, nights: 2, price: 100 },
            { groupSizeTierIndex: 0, nights: 3, price: 150 },
          ],
        },
      ],
      inclusions: [
        { text: 'Airport transfers', category: 'transfer' as const },
        { text: 'Hotel accommodation', category: 'accommodation' as const },
      ],
      accommodationExamples: ['Hotel A', 'Hotel B'],
      salesNotes: 'Test sales notes',
    };

    beforeEach(async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          preview: mockParsedData,
          filename: 'test.csv',
        }),
      });

      render(<CSVImporter />);

      const file = new File(['csv,content'], 'test.csv', { type: 'text/csv' });
      const input = screen.getByRole('button', { name: /Select File/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/Review Imported Package/i)).toBeInTheDocument();
      });
    });

    it('displays parsed package data', () => {
      expect(screen.getByText('Test Package')).toBeInTheDocument();
      expect(screen.getByText('Test Destination')).toBeInTheDocument();
      expect(screen.getByText('Test Resort')).toBeInTheDocument();
      expect(screen.getByText('EUR')).toBeInTheDocument();
    });

    it('displays group size tiers', () => {
      expect(screen.getByText('6-11 People')).toBeInTheDocument();
      expect(screen.getByText('12+ People')).toBeInTheDocument();
    });

    it('displays duration options', () => {
      expect(screen.getByText('2 nights')).toBeInTheDocument();
      expect(screen.getByText('3 nights')).toBeInTheDocument();
      expect(screen.getByText('4 nights')).toBeInTheDocument();
    });

    it('displays pricing matrix', () => {
      expect(screen.getByText('January')).toBeInTheDocument();
      expect(screen.getByText('EUR 100')).toBeInTheDocument();
      expect(screen.getByText('EUR 150')).toBeInTheDocument();
    });

    it('displays inclusions', () => {
      expect(screen.getByText('Airport transfers')).toBeInTheDocument();
      expect(screen.getByText('Hotel accommodation')).toBeInTheDocument();
    });

    it('displays accommodation examples', () => {
      expect(screen.getByText('Hotel A')).toBeInTheDocument();
      expect(screen.getByText('Hotel B')).toBeInTheDocument();
    });

    it('displays sales notes', () => {
      expect(screen.getByText('Test sales notes')).toBeInTheDocument();
    });

    it('toggles edit mode', () => {
      const editButton = screen.getByText('Edit Mode');
      fireEvent.click(editButton);

      expect(screen.getByText('View Mode')).toBeInTheDocument();
      
      // Check that input fields are now visible
      const nameInput = screen.getByDisplayValue('Test Package');
      expect(nameInput).toBeInTheDocument();
      expect(nameInput.tagName).toBe('INPUT');
    });

    it('allows editing fields in edit mode', () => {
      const editButton = screen.getByText('Edit Mode');
      fireEvent.click(editButton);

      const nameInput = screen.getByDisplayValue('Test Package') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Updated Package' } });

      expect(nameInput.value).toBe('Updated Package');
    });
  });

  describe('Confirmation Flow', () => {
    const mockParsedData = {
      name: 'Test Package',
      destination: 'Test Destination',
      resort: 'Test Resort',
      currency: 'EUR' as const,
      groupSizeTiers: [{ label: '6-11 People', minPeople: 6, maxPeople: 11 }],
      durationOptions: [2, 3],
      pricingMatrix: [],
      inclusions: [],
      accommodationExamples: [],
      salesNotes: '',
    };

    beforeEach(async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          preview: mockParsedData,
          filename: 'test.csv',
        }),
      });

      render(<CSVImporter />);

      const file = new File(['csv,content'], 'test.csv', { type: 'text/csv' });
      const input = screen.getByRole('button', { name: /Select File/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/Review Imported Package/i)).toBeInTheDocument();
      });
    });

    it('confirms and creates package successfully', async () => {
      const mockPackageId = '123456789';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          package: { _id: mockPackageId },
          message: 'Package imported successfully',
        }),
      });

      const confirmButton = screen.getByText('Confirm and Create Package');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(
          `/admin/super-packages/${mockPackageId}/edit`
        );
      });
    });

    it('handles confirmation errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Failed to create package',
          details: 'Validation error',
        }),
      });

      const confirmButton = screen.getByText('Confirm and Create Package');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Validation error/i)).toBeInTheDocument();
      });
    });

    it('calls onSuccess callback when provided', async () => {
      const mockPackageId = '123456789';
      const onSuccess = vi.fn();

      (global.fetch as any).mockClear();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          preview: mockParsedData,
          filename: 'test.csv',
        }),
      });

      render(<CSVImporter onSuccess={onSuccess} />);

      const file = new File(['csv,content'], 'test.csv', { type: 'text/csv' });
      const input = screen.getByRole('button', { name: /Select File/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/Review Imported Package/i)).toBeInTheDocument();
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          package: { _id: mockPackageId },
          message: 'Package imported successfully',
        }),
      });

      const confirmButton = screen.getByText('Confirm and Create Package');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockPackageId);
      });
    });

    it('allows canceling the import', () => {
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/admin/super-packages');
    });

    it('allows uploading a different file', () => {
      const uploadDifferentButton = screen.getByText('Upload Different File');
      fireEvent.click(uploadDifferentButton);

      expect(screen.getByText(/Drag and drop your CSV file here/i)).toBeInTheDocument();
    });
  });
});
