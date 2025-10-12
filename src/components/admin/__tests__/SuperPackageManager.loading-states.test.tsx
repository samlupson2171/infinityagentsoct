/**
 * Tests for SuperPackageManager loading states and optimistic updates
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SuperPackageManager } from '../SuperPackageManager';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/admin/super-packages',
}));

// Mock the hooks and components
vi.mock('@/lib/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

vi.mock('@/components/shared/Toast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn(),
  }),
}));

vi.mock('@/components/shared/ConfirmDialog', () => ({
  useConfirmDialog: () => ({
    confirm: (config: any, callback: () => void) => callback(),
    dialog: null,
  }),
}));

// Mock fetch
global.fetch = vi.fn() as any;

const mockPackages = [
  {
    _id: '1',
    name: 'Test Package 1',
    destination: 'Benidorm',
    resort: 'Test Resort',
    currency: 'EUR',
    status: 'active',
    groupSizeTiers: [{ label: '6-11 People', minPeople: 6, maxPeople: 11 }],
    durationOptions: [2, 3, 4],
    pricingMatrix: [
      {
        period: 'January',
        prices: [{ groupSizeTierIndex: 0, nights: 2, price: 100 }],
      },
    ],
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: '2',
    name: 'Test Package 2',
    destination: 'Albufeira',
    resort: 'Test Resort 2',
    currency: 'GBP',
    status: 'inactive',
    groupSizeTiers: [{ label: '12+ People', minPeople: 12, maxPeople: 999 }],
    durationOptions: [3, 4],
    pricingMatrix: [
      {
        period: 'February',
        prices: [{ groupSizeTierIndex: 0, nights: 3, price: 200 }],
      },
    ],
    version: 2,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

describe('SuperPackageManager - Loading States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Loading', () => {
    it('should show skeleton loader while fetching packages', async () => {
      // Mock a delayed response
      (global.fetch as any).mockImplementation(() =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  packages: mockPackages,
                  pagination: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    totalPages: 1,
                    hasMore: false,
                  },
                }),
              }),
            100
          )
        )
      );

      render(<SuperPackageManager />);

      // Should show skeleton loader initially
      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Test Package 1')).toBeInTheDocument();
      });

      // Skeleton should be gone
      expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();
    });

    it('should show multiple skeleton rows', async () => {
      (global.fetch as any).mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 1000))
      );

      render(<SuperPackageManager />);

      // Should show multiple skeleton rows (default is 10)
      const skeletons = screen.getAllByLabelText(/loading/i);
      expect(skeletons.length).toBeGreaterThan(1);
    });
  });

  describe('Action Loading States', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          packages: mockPackages,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            hasMore: false,
          },
        }),
      });
    });

    it('should show spinner on status toggle button', async () => {
      const user = userEvent.setup();

      // Mock status update with delay
      (global.fetch as any).mockImplementation((url) => {
        if (url.includes('/status')) {
          return new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    package: { ...mockPackages[0], status: 'inactive' },
                  }),
                }),
              100
            )
          );
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              totalPages: 1,
              hasMore: false,
            },
          }),
        });
      });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Package 1')).toBeInTheDocument();
      });

      // Find and click deactivate button
      const deactivateButton = screen.getByRole('button', { name: /deactivate/i });
      await user.click(deactivateButton);

      // Should show spinner while loading
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /deactivate/i })).toBeDisabled();
      });
    });

    it('should show spinner on duplicate button', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockImplementation((url) => {
        if (url.includes('/duplicate')) {
          return new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    package: { ...mockPackages[0], _id: '3', name: 'Test Package 1 (Copy)' },
                  }),
                }),
              100
            )
          );
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              totalPages: 1,
              hasMore: false,
            },
          }),
        });
      });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Package 1')).toBeInTheDocument();
      });

      // Find and click duplicate button
      const duplicateButtons = screen.getAllByRole('button', { name: /duplicate/i });
      await user.click(duplicateButtons[0]);

      // Should show spinner
      await waitFor(() => {
        expect(duplicateButtons[0]).toBeDisabled();
      });
    });

    it('should show spinner on export button', async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockImplementation((url) => {
        if (url.includes('/export')) {
          return new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  headers: new Headers({
                    'Content-Disposition': 'attachment; filename="export.csv"',
                  }),
                  blob: async () => new Blob(['test'], { type: 'text/csv' }),
                }),
              100
            )
          );
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              totalPages: 1,
              hasMore: false,
            },
          }),
        });
      });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Package 1')).toBeInTheDocument();
      });

      // Find and click export button
      const exportButtons = screen.getAllByRole('button', { name: /export/i });
      await user.click(exportButtons[0]);

      // Should show spinner
      await waitFor(() => {
        expect(exportButtons[0]).toBeDisabled();
      });
    });
  });

  describe('Optimistic Updates', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          packages: mockPackages,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            hasMore: false,
          },
        }),
      });
    });

    it('should optimistically update status before server response', async () => {
      const user = userEvent.setup();

      // Mock delayed status update
      (global.fetch as any).mockImplementation((url) => {
        if (url.includes('/status')) {
          return new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    package: { ...mockPackages[0], status: 'inactive' },
                  }),
                }),
              500
            )
          );
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              totalPages: 1,
              hasMore: false,
            },
          }),
        });
      });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Package 1')).toBeInTheDocument();
      });

      // Initial status should be active
      const row = screen.getByText('Test Package 1').closest('tr');
      expect(within(row!).getByText('Active')).toBeInTheDocument();

      // Click deactivate
      const deactivateButton = within(row!).getByRole('button', { name: /deactivate/i });
      await user.click(deactivateButton);

      // Status should update optimistically (before server response)
      await waitFor(
        () => {
          expect(within(row!).getByText('Inactive')).toBeInTheDocument();
        },
        { timeout: 100 }
      );
    });

    it('should rollback optimistic update on error', async () => {
      const user = userEvent.setup();

      // Mock failed status update
      (global.fetch as any).mockImplementation((url) => {
        if (url.includes('/status')) {
          return Promise.resolve({
            ok: false,
            json: async () => ({
              error: { message: 'Failed to update status' },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              totalPages: 1,
              hasMore: false,
            },
          }),
        });
      });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Package 1')).toBeInTheDocument();
      });

      const row = screen.getByText('Test Package 1').closest('tr');
      
      // Initial status should be active
      expect(within(row!).getByText('Active')).toBeInTheDocument();

      // Click deactivate
      const deactivateButton = within(row!).getByRole('button', { name: /deactivate/i });
      await user.click(deactivateButton);

      // Should rollback to active on error
      await waitFor(() => {
        expect(within(row!).getByText('Active')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no packages exist', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          packages: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
        }),
      });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText(/no packages found/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/get started by creating/i)).toBeInTheDocument();
    });

    it('should show empty state with search message when search returns no results', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          packages: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
        }),
      });

      render(<SuperPackageManager />);

      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
      });

      // Type in search
      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText(/no packages found matching "nonexistent"/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should show error message when fetch fails', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({
          error: { message: 'Failed to fetch packages' },
        }),
      });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText(/failed to fetch packages/i)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      const user = userEvent.setup();

      // First call fails
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { message: 'Network error' },
        }),
      });

      // Second call succeeds
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          packages: mockPackages,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            hasMore: false,
          },
        }),
      });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      // Should show packages after retry
      await waitFor(() => {
        expect(screen.getByText('Test Package 1')).toBeInTheDocument();
      });
    });
  });
});
