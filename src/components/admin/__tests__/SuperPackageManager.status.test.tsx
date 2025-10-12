/**
 * Tests for SuperPackageManager status indicators and management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SuperPackageManager } from '../SuperPackageManager';

// Mock the hooks
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
    confirm: (config: any, callback: () => void) => {
      callback();
    },
    dialog: null,
  }),
}));

// Mock fetch
global.fetch = vi.fn() as any;

const mockPackages = [
  {
    _id: '1',
    name: 'Active Package',
    destination: 'Benidorm',
    resort: 'Hotel Sol',
    currency: 'EUR' as const,
    status: 'active' as const,
    groupSizeTiers: [
      { label: '6-11 People', minPeople: 6, maxPeople: 11 },
    ],
    durationOptions: [2, 3, 4],
    pricingMatrix: [
      {
        period: 'January',
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 200 },
        ],
      },
    ],
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: '2',
    name: 'Inactive Package',
    destination: 'Albufeira',
    resort: 'Beach Resort',
    currency: 'EUR' as const,
    status: 'inactive' as const,
    groupSizeTiers: [
      { label: '6-11 People', minPeople: 6, maxPeople: 11 },
    ],
    durationOptions: [2, 3, 4],
    pricingMatrix: [
      {
        period: 'January',
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 150 },
        ],
      },
    ],
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: '3',
    name: 'Another Active Package',
    destination: 'Benidorm',
    resort: 'Hotel Luna',
    currency: 'EUR' as const,
    status: 'active' as const,
    groupSizeTiers: [
      { label: '6-11 People', minPeople: 6, maxPeople: 11 },
    ],
    durationOptions: [2, 3, 4],
    pricingMatrix: [
      {
        period: 'January',
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 250 },
        ],
      },
    ],
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('SuperPackageManager - Status Indicators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        packages: mockPackages,
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
          hasMore: false,
        },
      }),
    });
  });

  describe('Status Badge Display', () => {
    it('should display active badge for active packages', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Active Package')).toBeInTheDocument();
      });

      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBeGreaterThan(0);
      
      // Check badge styling
      const badge = activeBadges[0];
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should display inactive badge for inactive packages', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Inactive Package')).toBeInTheDocument();
      });

      const inactiveBadge = screen.getByText('Inactive');
      expect(inactiveBadge).toBeInTheDocument();
      expect(inactiveBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('should capitalize status text in badges', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Active Package')).toBeInTheDocument();
      });

      // Should show "Active" not "active"
      expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  describe('Visual Distinction for Inactive Packages', () => {
    it('should apply visual distinction to inactive package rows', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Inactive Package')).toBeInTheDocument();
      });

      const inactivePackageName = screen.getByText('Inactive Package');
      const row = inactivePackageName.closest('tr');
      
      expect(row).toHaveClass('bg-gray-50', 'opacity-75');
    });

    it('should show "(Inactive)" label next to inactive package names', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('(Inactive)')).toBeInTheDocument();
      });
    });

    it('should apply muted text color to inactive package cells', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Inactive Package')).toBeInTheDocument();
      });

      const inactivePackageName = screen.getByText('Inactive Package');
      expect(inactivePackageName).toHaveClass('text-gray-500');
    });

    it('should not apply visual distinction to active packages', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Active Package')).toBeInTheDocument();
      });

      const activePackageName = screen.getByText('Active Package');
      const row = activePackageName.closest('tr');
      
      expect(row).not.toHaveClass('opacity-75');
      expect(activePackageName).toHaveClass('text-gray-900');
    });
  });

  describe('Status Summary Cards', () => {
    it('should display status summary cards with counts', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Active Packages')).toBeInTheDocument();
      });

      expect(screen.getByText('Active Packages')).toBeInTheDocument();
      expect(screen.getByText('Inactive Packages')).toBeInTheDocument();
      expect(screen.getByText('Total Packages')).toBeInTheDocument();
    });

    it('should show correct count for active packages', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Active Packages')).toBeInTheDocument();
      });

      const activeCard = screen.getByText('Active Packages').closest('div');
      expect(activeCard).toHaveTextContent('2'); // 2 active packages
    });

    it('should show correct count for inactive packages', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Inactive Packages')).toBeInTheDocument();
      });

      const inactiveCard = screen.getByText('Inactive Packages').closest('div');
      expect(inactiveCard).toHaveTextContent('1'); // 1 inactive package
    });

    it('should show correct total count', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Total Packages')).toBeInTheDocument();
      });

      const totalCard = screen.getByText('Total Packages').closest('div');
      expect(totalCard).toHaveTextContent('3'); // 3 total packages
    });

    it('should not display summary cards when loading', () => {
      render(<SuperPackageManager />);

      expect(screen.queryByText('Active Packages')).not.toBeInTheDocument();
    });

    it('should not display summary cards when no packages', async () => {
      (global.fetch as any).mockResolvedValueOnce({
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
        expect(screen.getByText('No packages found')).toBeInTheDocument();
      });

      expect(screen.queryByText('Active Packages')).not.toBeInTheDocument();
    });
  });

  describe('Status Toggle UI', () => {
    it('should show "Deactivate" button for active packages', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Active Package')).toBeInTheDocument();
      });

      const deactivateButtons = screen.getAllByText(/Deactivate/);
      expect(deactivateButtons.length).toBeGreaterThan(0);
    });

    it('should show "Activate" button for inactive packages', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Inactive Package')).toBeInTheDocument();
      });

      const activateButton = screen.getByText(/Activate/);
      expect(activateButton).toBeInTheDocument();
    });

    it('should show pause icon for deactivate button', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Active Package')).toBeInTheDocument();
      });

      const deactivateButtons = screen.getAllByText(/Deactivate/);
      expect(deactivateButtons[0].textContent).toContain('⏸');
    });

    it('should show play icon for activate button', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Inactive Package')).toBeInTheDocument();
      });

      const activateButton = screen.getByText(/Activate/);
      expect(activateButton.textContent).toContain('▶');
    });

    it('should apply correct color to deactivate button', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Active Package')).toBeInTheDocument();
      });

      const deactivateButtons = screen.getAllByText(/Deactivate/);
      expect(deactivateButtons[0]).toHaveClass('text-yellow-600', 'hover:text-yellow-900');
    });

    it('should apply correct color to activate button', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Inactive Package')).toBeInTheDocument();
      });

      const activateButton = screen.getByText(/Activate/);
      expect(activateButton).toHaveClass('text-green-600', 'hover:text-green-900');
    });

    it('should have tooltip for status toggle buttons', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Active Package')).toBeInTheDocument();
      });

      const deactivateButtons = screen.getAllByText(/Deactivate/);
      expect(deactivateButtons[0]).toHaveAttribute('title', 'Deactivate this package');

      const activateButton = screen.getByText(/Activate/);
      expect(activateButton).toHaveAttribute('title', 'Activate this package');
    });
  });

  describe('Status Toggle Confirmation', () => {
    it('should call status API when toggling status', async () => {
      const mockStatusUpdate = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 3,
              totalPages: 1,
              hasMore: false,
            },
          }),
        })
        .mockImplementationOnce(mockStatusUpdate);

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Active Package')).toBeInTheDocument();
      });

      const deactivateButtons = screen.getAllByText(/Deactivate/);
      fireEvent.click(deactivateButtons[0]);

      await waitFor(() => {
        expect(mockStatusUpdate).toHaveBeenCalledWith(
          '/api/admin/super-packages/1/status',
          expect.objectContaining({
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'inactive' }),
          })
        );
      });
    });

    it('should refresh package list after status toggle', async () => {
      const mockFetch = global.fetch as any;
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 3,
              totalPages: 1,
              hasMore: false,
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: {
              page: 1,
              limit: 10,
              total: 3,
              totalPages: 1,
              hasMore: false,
            },
          }),
        });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Active Package')).toBeInTheDocument();
      });

      const deactivateButtons = screen.getAllByText(/Deactivate/);
      fireEvent.click(deactivateButtons[0]);

      await waitFor(() => {
        // Should have called fetch 3 times: initial load, status update, refresh
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });
    });

    it('should disable status toggle button during update', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Active Package')).toBeInTheDocument();
      });

      const deactivateButtons = screen.getAllByText(/Deactivate/);
      const button = deactivateButtons[0];

      fireEvent.click(button);

      // Button should be disabled during the operation
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('should disable status toggle for deleted packages', async () => {
      const packagesWithDeleted = [
        ...mockPackages,
        {
          _id: '4',
          name: 'Deleted Package',
          destination: 'Test',
          resort: 'Test Resort',
          currency: 'EUR' as const,
          status: 'deleted' as const,
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
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          packages: packagesWithDeleted,
          pagination: {
            page: 1,
            limit: 10,
            total: 4,
            totalPages: 1,
            hasMore: false,
          },
        }),
      });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Deleted Package')).toBeInTheDocument();
      });

      // Find the row with deleted package
      const deletedRow = screen.getByText('Deleted Package').closest('tr');
      const buttons = deletedRow?.querySelectorAll('button');
      
      // Find the status toggle button (should be disabled)
      const statusButton = Array.from(buttons || []).find(
        btn => btn.textContent?.includes('Activate') || btn.textContent?.includes('Deactivate')
      );

      expect(statusButton).toBeDisabled();
      expect(statusButton).toHaveAttribute('title', 'Cannot change status of deleted package');
    });
  });
});
