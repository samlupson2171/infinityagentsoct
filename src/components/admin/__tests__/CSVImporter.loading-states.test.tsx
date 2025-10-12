/**
 * Tests for CSVImporter loading states and progress indicators
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CSVImporter from '../CSVImporter';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn() as any;

const mockParsedData = {
  name: 'Test Package',
  destination: 'Benidorm',
  resort: 'Test Resort',
  currency: 'EUR' as const,
  groupSizeTiers: [{ label: '6-11 People', minPeople: 6, maxPeople: 11 }],
  durationOptions: [2, 3, 4],
  pricingMatrix: [
    {
      period: 'January',
      periodType: 'month' as const,
      prices: [{ groupSizeTierIndex: 0, nights: 2, price: 100 }],
    },
  ],
  inclusions: [{ text: 'Test inclusion', category: 'other' as const }],
  accommodationExamples: ['Test Hotel'],
  salesNotes: 'Test notes',
  status: 'active' as const,
};

describe('CSVImporter - Loading States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Upload Progress', () => {
    it('should show progress bar during file upload', async () => {
      const user = userEvent.setup();

      // Mock delayed upload
      (global.fetch as any).mockImplementation(() =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  preview: mockParsedData,
                  filename: 'test.csv',
                }),
              }),
            500
          )
        )
      );

      render(<CSVImporter />);

      // Create a file
      const file = new File(['test content'], 'test.csv', { type: 'text/csv' });

      // Get file input and upload
      const fileInput = screen.getByLabelText(/select file/i).closest('input');
      await user.upload(fileInput!, file);

      // Should show progress bar
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      // Should show filename
      expect(screen.getByText('test.csv')).toBeInTheDocument();

      // Should show percentage
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });

    it('should show different progress messages during upload', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockImplementation(() =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  preview: mockParsedData,
                  filename: 'test.csv',
                }),
              }),
            1000
          )
        )
      );

      render(<CSVImporter />);

      const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/select file/i).closest('input');
      await user.upload(fileInput!, file);

      // Should show "Uploading file..." initially
      await waitFor(() => {
        expect(screen.getByText(/uploading file/i)).toBeInTheDocument();
      });

      // Should progress to "Parsing CSV structure..."
      await waitFor(
        () => {
          expect(screen.getByText(/parsing csv structure/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('should show 100% progress before transitioning to preview', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          preview: mockParsedData,
          filename: 'test.csv',
        }),
      });

      render(<CSVImporter />);

      const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/select file/i).closest('input');
      await user.upload(fileInput!, file);

      // Wait for 100% to appear
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      // Should transition to preview
      await waitFor(() => {
        expect(screen.getByText(/review imported package/i)).toBeInTheDocument();
      });
    });

    it('should handle upload errors gracefully', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({
          error: 'Invalid CSV format',
          details: 'Missing required columns',
        }),
      });

      render(<CSVImporter />);

      const file = new File(['invalid content'], 'test.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/select file/i).closest('input');
      await user.upload(fileInput!, file);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/missing required columns/i)).toBeInTheDocument();
      });

      // Progress should be reset
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('Import Progress', () => {
    it('should show animated progress during package creation', async () => {
      const user = userEvent.setup();

      // Mock successful upload
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          preview: mockParsedData,
          filename: 'test.csv',
        }),
      });

      // Mock delayed package creation
      (global.fetch as any).mockImplementationOnce(() =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  package: { ...mockParsedData, _id: '123' },
                }),
              }),
            1000
          )
        )
      );

      render(<CSVImporter />);

      // Upload file
      const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/select file/i).closest('input');
      await user.upload(fileInput!, file);

      // Wait for preview
      await waitFor(() => {
        expect(screen.getByText(/review imported package/i)).toBeInTheDocument();
      });

      // Click confirm
      const confirmButton = screen.getByRole('button', { name: /confirm and create package/i });
      await user.click(confirmButton);

      // Should show "Creating package..." message
      await waitFor(() => {
        expect(screen.getByText(/creating package/i)).toBeInTheDocument();
      });

      // Should show progress stages
      await waitFor(() => {
        expect(screen.getByText(/validating package data/i)).toBeInTheDocument();
      });
    });

    it('should show multiple import stages', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          preview: mockParsedData,
          filename: 'test.csv',
        }),
      });

      (global.fetch as any).mockImplementationOnce(() =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  package: { ...mockParsedData, _id: '123' },
                }),
              }),
            2000
          )
        )
      );

      render(<CSVImporter />);

      const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/select file/i).closest('input');
      await user.upload(fileInput!, file);

      await waitFor(() => {
        expect(screen.getByText(/review imported package/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm and create package/i });
      await user.click(confirmButton);

      // Should show validating stage
      await waitFor(() => {
        expect(screen.getByText(/validating package data/i)).toBeInTheDocument();
      });

      // Should progress to creating pricing matrix
      await waitFor(
        () => {
          expect(screen.getByText(/creating pricing matrix/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Should progress to processing inclusions
      await waitFor(
        () => {
          expect(screen.getByText(/processing inclusions/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should show progress percentage during import', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          preview: mockParsedData,
          filename: 'test.csv',
        }),
      });

      (global.fetch as any).mockImplementationOnce(() =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  package: { ...mockParsedData, _id: '123' },
                }),
              }),
            1500
          )
        )
      );

      render(<CSVImporter />);

      const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/select file/i).closest('input');
      await user.upload(fileInput!, file);

      await waitFor(() => {
        expect(screen.getByText(/review imported package/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm and create package/i });
      await user.click(confirmButton);

      // Should show progress percentage
      await waitFor(() => {
        const progressText = screen.getByText(/progress/i);
        expect(progressText).toBeInTheDocument();
      });

      // Should show increasing percentages
      await waitFor(() => {
        expect(screen.getByText(/20%/)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/40%/)).toBeInTheDocument();
      });
    });

    it('should show warning not to close window during import', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          preview: mockParsedData,
          filename: 'test.csv',
        }),
      });

      (global.fetch as any).mockImplementationOnce(() =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  package: { ...mockParsedData, _id: '123' },
                }),
              }),
            1000
          )
        )
      );

      render(<CSVImporter />);

      const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/select file/i).closest('input');
      await user.upload(fileInput!, file);

      await waitFor(() => {
        expect(screen.getByText(/review imported package/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm and create package/i });
      await user.click(confirmButton);

      // Should show warning
      await waitFor(() => {
        expect(screen.getByText(/please do not close this window/i)).toBeInTheDocument();
      });
    });
  });

  describe('Drag and Drop States', () => {
    it('should show visual feedback during drag over', () => {
      render(<CSVImporter />);

      const dropZone = screen.getByText(/drag and drop your csv file here/i).closest('div');

      // Simulate drag enter
      fireEvent.dragEnter(dropZone!);

      // Should show highlighted state
      expect(dropZone).toHaveClass('border-blue-500');
      expect(dropZone).toHaveClass('bg-blue-50');
    });

    it('should remove visual feedback on drag leave', () => {
      render(<CSVImporter />);

      const dropZone = screen.getByText(/drag and drop your csv file here/i).closest('div');

      // Simulate drag enter then leave
      fireEvent.dragEnter(dropZone!);
      fireEvent.dragLeave(dropZone!);

      // Should remove highlighted state
      expect(dropZone).not.toHaveClass('border-blue-500');
      expect(dropZone).not.toHaveClass('bg-blue-50');
    });
  });

  describe('File Validation', () => {
    it('should show error for invalid file type', async () => {
      const user = userEvent.setup();

      render(<CSVImporter />);

      // Create invalid file
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      const fileInput = screen.getByLabelText(/select file/i).closest('input');
      await user.upload(fileInput!, file);

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
      });

      // Should not show progress
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should show error for file too large', async () => {
      const user = userEvent.setup();

      render(<CSVImporter />);

      // Create large file (> 5MB)
      const largeContent = 'x'.repeat(6 * 1024 * 1024);
      const file = new File([largeContent], 'large.csv', { type: 'text/csv' });

      // Mock file size
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 });

      const fileInput = screen.getByLabelText(/select file/i).closest('input');
      await user.upload(fileInput!, file);

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/file too large/i)).toBeInTheDocument();
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all states when uploading different file', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          preview: mockParsedData,
          filename: 'test.csv',
        }),
      });

      render(<CSVImporter />);

      // Upload first file
      const file1 = new File(['test content 1'], 'test1.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/select file/i).closest('input');
      await user.upload(fileInput!, file1);

      await waitFor(() => {
        expect(screen.getByText(/review imported package/i)).toBeInTheDocument();
      });

      // Click "Upload Different File"
      const uploadDifferentButton = screen.getByRole('button', {
        name: /upload different file/i,
      });
      await user.click(uploadDifferentButton);

      // Should return to upload interface
      expect(screen.getByText(/drag and drop your csv file here/i)).toBeInTheDocument();
      expect(screen.queryByText(/review imported package/i)).not.toBeInTheDocument();
    });
  });
});
