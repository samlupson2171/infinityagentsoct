import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRouter } from 'next/navigation';
import CSVImporter from '../CSVImporter';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('CSVImporter - Basic Tests', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('renders the upload interface initially', () => {
    render(<CSVImporter />);

    expect(screen.getByText(/Import Super Package from CSV/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop your CSV file here/i)).toBeInTheDocument();
    expect(screen.getByText(/Select File/i)).toBeInTheDocument();
    expect(screen.getByText(/CSV files only, max 5MB/i)).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(<CSVImporter />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('has a hidden file input', () => {
    const { container } = render(<CSVImporter />);

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', '.csv');
  });

  it('calls onCancel callback when provided', () => {
    const onCancel = vi.fn();
    render(<CSVImporter onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    cancelButton.click();

    expect(onCancel).toHaveBeenCalled();
  });

  it('navigates to super packages page when cancel is clicked without callback', () => {
    render(<CSVImporter />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    cancelButton.click();

    expect(mockRouter.push).toHaveBeenCalledWith('/admin/super-packages');
  });
});
