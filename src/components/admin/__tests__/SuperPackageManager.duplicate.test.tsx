import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SuperPackageManager from '../SuperPackageManager';
import { useToast } from '@/components/shared/Toast';
import { useConfirmDialog } from '@/components/shared/ConfirmDialog';

// Mock dependencies
vi.mock('@/components/shared/Toast');
vi.mock('@/components/shared/ConfirmDialog');

const mockUseToast = useToast as any;
const mockUseConfirmDialog = useConfirmDialog as any;

describe('SuperPackageManager - Duplicate Feature', () => {
  const mockShowSuccess = vi.fn();
  const mockShowError = vi.fn();
  const mockShowWarning = vi.fn();
  const mockConfirm = vi.fn();

  const mockPackages = [
    {
      _id: 'package-1',
      name: 'Test Package',
      destination: 'Benidorm',
      resort: 'Test Resort',
      currency: 'EUR',
      status: 'active',
      groupSizeTiers: [
        { label: '6-11 People', minPeople: 6, maxPeople: 11 },
      ],
      durationOptions: [2, 3, 4],
      pricingMatrix: [
        {
          period: 'January',
          prices: [{ groupSizeTierIndex: 0, nights: 2, price: 100 }],
        },
      ],
      version: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseToast.mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      showWarning: mockShowWarning,
      showInfo: vi.fn(),
    });

    mockUseConfirmDialog.mockReturnValue({
      confirm: mockConfirm,
      dialog: null,
    });

    // Mock fetch for initial package list
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/admin/super-packages?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              totalPages: 1,
              hasMore: false,
            },
          }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show duplicate button for each package', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Package')).toBeInTheDocument();
    });

    const duplicateButtons = screen.getAllByText('Duplicate');
    expect(duplicateButtons.length).toBeGreaterThan(0);
  });

  it('should show confirmation dialog when duplicate is clicked', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Package')).toBeInTheDocument();
    });

    const duplicateButton = screen.getAllByText('Duplicate')[0];
    fireEvent.click(duplicateButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Duplicate Package',
        message: 'Create a copy of "Test Package"?',
        confirmLabel: 'Duplicate',
        variant: 'info',
        details: expect.arrayContaining([
          expect.stringContaining('(Copy)'),
          expect.stringContaining('inactive'),
        ]),
      }),
      expect.any(Function)
    );
  });

  it('should duplicate package successfully', async () => {
    const mockDuplicatedPackage = {
      _id: 'package-2',
      name: 'Test Package (Copy)',
      destination: 'Benidorm',
      resort: 'Test Resort',
      status: 'inactive',
      version: 1,
    };

    // Mock the duplicate API call
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/admin/super-packages?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              totalPages: 1,
              hasMore: false,
            },
          }),
        });
      }
      if (url.includes('/duplicate')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            package: mockDuplicatedPackage,
            message: 'Package duplicated successfully',
          }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as any;

    // Mock window.location.href
    delete (window as any).location;
    (window as any).location = { href: '' };

    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Package')).toBeInTheDocument();
    });

    const duplicateButton = screen.getAllByText('Duplicate')[0];
    fireEvent.click(duplicateButton);

    // Get the confirm callback and execute it
    const confirmCallback = mockConfirm.mock.calls[0][1];
    await confirmCallback();

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Package Duplicated',
        expect.stringContaining('duplicated')
      );
    });

    // Wait for redirect
    await waitFor(
      () => {
        expect(window.location.href).toBe(
          '/admin/super-packages/package-2/edit'
        );
      },
      { timeout: 2000 }
    );
  });

  it('should handle duplicate API errors', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/admin/super-packages?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              totalPages: 1,
              hasMore: false,
            },
          }),
        });
      }
      if (url.includes('/duplicate')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({
            error: { message: 'Failed to duplicate package' },
          }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as any;

    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Package')).toBeInTheDocument();
    });

    const duplicateButton = screen.getAllByText('Duplicate')[0];
    fireEvent.click(duplicateButton);

    // Get the confirm callback and execute it
    const confirmCallback = mockConfirm.mock.calls[0][1];
    await confirmCallback();

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Failed to Duplicate Package',
        'Failed to duplicate package'
      );
    });
  });

  it('should disable duplicate button while action is loading', async () => {
    // Mock a slow duplicate API call
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/admin/super-packages?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              totalPages: 1,
              hasMore: false,
            },
          }),
        });
      }
      if (url.includes('/duplicate')) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                package: { _id: 'new-id', name: 'Test Package (Copy)' },
                message: 'Package duplicated successfully',
              }),
            });
          }, 100);
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as any;

    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Package')).toBeInTheDocument();
    });

    const duplicateButton = screen.getAllByText('Duplicate')[0];
    fireEvent.click(duplicateButton);

    // Get the confirm callback and execute it
    const confirmCallback = mockConfirm.mock.calls[0][1];
    confirmCallback();

    // Button should be disabled during the API call
    await waitFor(() => {
      expect(duplicateButton).toBeDisabled();
    });
  });

  it('should include helpful details in confirmation dialog', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Package')).toBeInTheDocument();
    });

    const duplicateButton = screen.getAllByText('Duplicate')[0];
    fireEvent.click(duplicateButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.arrayContaining([
          expect.stringContaining('(Copy)'),
          expect.stringContaining('inactive'),
          expect.stringContaining('edit'),
        ]),
      }),
      expect.any(Function)
    );
  });

  it('should handle network errors gracefully', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/admin/super-packages?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              totalPages: 1,
              hasMore: false,
            },
          }),
        });
      }
      if (url.includes('/duplicate')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as any;

    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Package')).toBeInTheDocument();
    });

    const duplicateButton = screen.getAllByText('Duplicate')[0];
    fireEvent.click(duplicateButton);

    // Get the confirm callback and execute it
    const confirmCallback = mockConfirm.mock.calls[0][1];
    await confirmCallback();

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Failed to Duplicate Package',
        'Network error'
      );
    });
  });
});
