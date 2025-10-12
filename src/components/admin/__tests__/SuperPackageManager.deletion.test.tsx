import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuperPackageManager from '../SuperPackageManager';

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

// Mock toast and confirm dialog hooks
jest.mock('@/components/shared/Toast', () => ({
  useToast: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showWarning: jest.fn(),
  }),
}));

jest.mock('@/components/shared/ConfirmDialog', () => ({
  useConfirmDialog: () => ({
    confirm: jest.fn((config, callback) => callback()),
    dialog: null,
  }),
}));

describe('SuperPackageManager - Deletion Safeguards', () => {
  const mockPackages = [
    {
      _id: 'pkg1',
      name: 'Package with Quotes',
      destination: 'Benidorm',
      resort: 'Test Resort',
      currency: 'EUR',
      status: 'active',
      groupSizeTiers: [{ label: '6-11', minPeople: 6, maxPeople: 11 }],
      durationOptions: [2, 3],
      pricingMatrix: [
        {
          period: 'January',
          prices: [{ groupSizeTierIndex: 0, nights: 2, price: 100 }],
        },
      ],
      version: 1,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
    {
      _id: 'pkg2',
      name: 'Package without Quotes',
      destination: 'Albufeira',
      resort: 'Test Resort 2',
      currency: 'EUR',
      status: 'active',
      groupSizeTiers: [{ label: '6-11', minPeople: 6, maxPeople: 11 }],
      durationOptions: [2, 3],
      pricingMatrix: [
        {
          period: 'January',
          prices: [{ groupSizeTierIndex: 0, nights: 2, price: 100 }],
        },
      ],
      version: 1,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
    {
      _id: 'pkg3',
      name: 'Deleted Package',
      destination: 'Benidorm',
      resort: 'Test Resort',
      currency: 'EUR',
      status: 'deleted',
      groupSizeTiers: [{ label: '6-11', minPeople: 6, maxPeople: 11 }],
      durationOptions: [2, 3],
      pricingMatrix: [
        {
          period: 'January',
          prices: [{ groupSizeTierIndex: 0, nights: 2, price: 100 }],
        },
      ],
      version: 1,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/admin/super-packages?')) {
        return Promise.resolve({
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
      }
      return Promise.resolve({ ok: false });
    });
  });

  describe('Deleted Package Display', () => {
    it('should show deleted packages with special styling', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Deleted Package')).toBeInTheDocument();
      });

      const deletedRow = screen.getByText('Deleted Package').closest('tr');
      expect(deletedRow).toHaveClass('bg-red-50');
      expect(screen.getByText('(DELETED)')).toBeInTheDocument();
    });

    it('should disable edit button for deleted packages', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Deleted Package')).toBeInTheDocument();
      });

      const deletedRow = screen.getByText('Deleted Package').closest('tr');
      const editButton = within(deletedRow!).getByText('Edit');
      expect(editButton).toBeDisabled();
    });

    it('should disable delete button for deleted packages', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Deleted Package')).toBeInTheDocument();
      });

      const deletedRow = screen.getByText('Deleted Package').closest('tr');
      const deleteButton = within(deletedRow!).getByText('Deleted');
      expect(deleteButton).toBeDisabled();
    });

    it('should disable status toggle for deleted packages', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Deleted Package')).toBeInTheDocument();
      });

      const deletedRow = screen.getByText('Deleted Package').closest('tr');
      const statusButton = within(deletedRow!).getByTitle(
        'Cannot change status of deleted package'
      );
      expect(statusButton).toBeDisabled();
    });
  });

  describe('Deleted Packages Filter', () => {
    it('should include "Deleted Only" option in status filter', async () => {
      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Package with Quotes')).toBeInTheDocument();
      });

      const statusSelect = screen.getByLabelText('Status');
      expect(within(statusSelect).getByText('Deleted Only')).toBeInTheDocument();
    });

    it('should show warning banner when viewing deleted packages', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('status=deleted')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              packages: [mockPackages[2]],
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
        return Promise.resolve({
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

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByLabelText('Status')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const statusSelect = screen.getByLabelText('Status');
      await user.selectOptions(statusSelect, 'deleted');

      await waitFor(() => {
        expect(screen.getByText('Viewing Deleted Packages')).toBeInTheDocument();
        expect(
          screen.getByText(/These packages have been soft-deleted/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Deletion with Linked Quotes Check', () => {
    it('should check for linked quotes before showing delete confirmation', async () => {
      const mockCheckDeletion = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          canHardDelete: false,
          linkedQuotesCount: 5,
          linkedQuotes: [
            {
              quoteNumber: 'Q-001',
              customerName: 'John Doe',
              status: 'sent',
            },
            {
              quoteNumber: 'Q-002',
              customerName: 'Jane Smith',
              status: 'draft',
            },
          ],
          statusBreakdown: {
            sent: 3,
            draft: 2,
          },
        }),
      });

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('check-deletion')) {
          return mockCheckDeletion();
        }
        if (url.includes('/api/admin/super-packages?')) {
          return Promise.resolve({
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
        }
        return Promise.resolve({ ok: false });
      });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Package with Quotes')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const packageRow = screen.getByText('Package with Quotes').closest('tr');
      const deleteButton = within(packageRow!).getByText('Delete');

      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockCheckDeletion).toHaveBeenCalled();
      });
    });
  });

  describe('Hard Delete vs Soft Delete', () => {
    it('should perform hard delete when no quotes are linked', async () => {
      const mockDelete = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: 'Package permanently deleted',
          softDelete: false,
          linkedQuotesCount: 0,
        }),
      });

      (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
        if (url.includes('check-deletion')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              canHardDelete: true,
              linkedQuotesCount: 0,
              linkedQuotes: [],
              statusBreakdown: {},
            }),
          });
        }
        if (options?.method === 'DELETE') {
          return mockDelete();
        }
        if (url.includes('/api/admin/super-packages?')) {
          return Promise.resolve({
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
        }
        return Promise.resolve({ ok: false });
      });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Package without Quotes')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const packageRow = screen.getByText('Package without Quotes').closest('tr');
      const deleteButton = within(packageRow!).getByText('Delete');

      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalled();
      });
    });

    it('should perform soft delete when quotes are linked', async () => {
      const mockDelete = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: 'Package marked as deleted',
          softDelete: true,
          linkedQuotesCount: 5,
        }),
      });

      (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
        if (url.includes('check-deletion')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              canHardDelete: false,
              linkedQuotesCount: 5,
              linkedQuotes: [
                { quoteNumber: 'Q-001', customerName: 'John Doe', status: 'sent' },
              ],
              statusBreakdown: { sent: 5 },
            }),
          });
        }
        if (options?.method === 'DELETE') {
          return mockDelete();
        }
        if (url.includes('/api/admin/super-packages?')) {
          return Promise.resolve({
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
        }
        return Promise.resolve({ ok: false });
      });

      render(<SuperPackageManager />);

      await waitFor(() => {
        expect(screen.getByText('Package with Quotes')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const packageRow = screen.getByText('Package with Quotes').closest('tr');
      const deleteButton = within(packageRow!).getByText('Delete');

      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalled();
      });
    });
  });
});
