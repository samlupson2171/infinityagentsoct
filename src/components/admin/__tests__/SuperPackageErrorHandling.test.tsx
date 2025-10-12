/**
 * Tests for Super Package error handling and user feedback
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SuperPackageErrorBoundary } from '../SuperPackageErrorBoundary';
import { ConfirmDialog, useConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ValidationErrors, FieldError } from '@/components/shared/ValidationErrors';
import { useSuperPackageOperations } from '@/lib/hooks/useSuperPackageOperations';
import { ToastProvider } from '@/components/shared/Toast';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

describe('SuperPackageErrorBoundary', () => {
  it('should catch and display errors', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <SuperPackageErrorBoundary context="list">
        <ThrowError />
      </SuperPackageErrorBoundary>
    );

    expect(screen.getByText(/Unable to load packages/i)).toBeInTheDocument();
    expect(screen.getByText(/There was a problem loading the super packages list/i)).toBeInTheDocument();
  });

  it('should provide context-specific error messages', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { rerender } = render(
      <SuperPackageErrorBoundary context="form">
        <ThrowError />
      </SuperPackageErrorBoundary>
    );

    expect(screen.getByText(/Form error occurred/i)).toBeInTheDocument();

    rerender(
      <SuperPackageErrorBoundary context="import">
        <ThrowError />
      </SuperPackageErrorBoundary>
    );

    expect(screen.getByText(/Import error occurred/i)).toBeInTheDocument();
  });

  it('should allow page refresh', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });

    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <SuperPackageErrorBoundary context="list">
        <ThrowError />
      </SuperPackageErrorBoundary>
    );

    const refreshButton = screen.getByText(/Refresh Page/i);
    fireEvent.click(refreshButton);

    expect(reloadSpy).toHaveBeenCalled();
  });
});

describe('ConfirmDialog', () => {
  it('should display confirmation dialog', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Delete Package"
        message="Are you sure?"
        variant="danger"
      />
    );

    expect(screen.getByText('Delete Package')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should call onConfirm when confirmed', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Delete Package"
        message="Are you sure?"
        confirmLabel="Delete"
      />
    );

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
  });

  it('should call onClose when cancelled', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Delete Package"
        message="Are you sure?"
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('should display details when provided', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Package"
        message="Are you sure?"
        details={['Detail 1', 'Detail 2']}
      />
    );

    expect(screen.getByText('Detail 1')).toBeInTheDocument();
    expect(screen.getByText('Detail 2')).toBeInTheDocument();
  });

  it('should show loading state during async operation', async () => {
    const onConfirm = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <ConfirmDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Delete Package"
        message="Are you sure?"
        confirmLabel="Delete"
      />
    );

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    });
  });
});

describe('ValidationErrors', () => {
  it('should display validation errors as array', () => {
    const errors = [
      { field: 'name', message: 'Name is required' },
      { field: 'destination', message: 'Destination is required' },
    ];

    render(<ValidationErrors errors={errors} />);

    expect(screen.getByText(/name:/i)).toBeInTheDocument();
    expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/destination:/i)).toBeInTheDocument();
    expect(screen.getByText(/Destination is required/i)).toBeInTheDocument();
  });

  it('should display validation errors as object', () => {
    const errors = {
      name: 'Name is required',
      destination: 'Destination is required',
    };

    render(<ValidationErrors errors={errors} />);

    expect(screen.getByText(/name:/i)).toBeInTheDocument();
    expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
  });

  it('should not render when no errors', () => {
    const { container } = render(<ValidationErrors errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should display correct count of errors', () => {
    const errors = [
      { field: 'name', message: 'Name is required' },
      { field: 'destination', message: 'Destination is required' },
      { field: 'resort', message: 'Resort is required' },
    ];

    render(<ValidationErrors errors={errors} />);

    expect(screen.getByText(/fix the following 3 errors/i)).toBeInTheDocument();
  });
});

describe('FieldError', () => {
  it('should display field error', () => {
    render(<FieldError error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should not render when no error', () => {
    const { container } = render(<FieldError />);
    expect(container.firstChild).toBeNull();
  });
});

describe('useSuperPackageOperations', () => {
  beforeEach(() => {
    global.fetch = vi.fn() as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle successful package creation', async () => {
    const mockResponse = {
      success: true,
      package: { _id: '123', name: 'Test Package' },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const TestComponent = () => {
      const { createPackage } = useSuperPackageOperations();
      
      return (
        <button onClick={() => createPackage({ name: 'Test' })}>
          Create
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Create');
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/super-packages',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should handle package creation error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { message: 'Creation failed' },
      }),
    });

    const TestComponent = () => {
      const { createPackage } = useSuperPackageOperations();
      
      return (
        <button onClick={() => createPackage({ name: 'Test' })}>
          Create
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Create');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Operation Failed/i)).toBeInTheDocument();
    });
  });
});
