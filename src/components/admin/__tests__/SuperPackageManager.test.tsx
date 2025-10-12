import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuperPackageManager from '../SuperPackageManager';

// Mock the hooks
vi.mock('@/lib/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

// Mock fetch
global.fetch = vi.fn();

describe('SuperPackageManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as any).mockImplementation(() =>
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<SuperPackageManager />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders package list when data is loaded', async () => {
    const mockPackages = [
      {
        _id: '1',
        name: 'Benidorm Super Package',
        destination: 'Benidorm',
        resort: 'Hotel Sol',
        currency: 'EUR',
        status: 'active',
        groupSizeTiers: [
          { label: '6-11 People', minPeople: 6, maxPeople: 11 },
        ],
        durationOptions: [2, 3, 4],
        pricingMatrix: [
          {
            period: 'January',
            prices: [
              { groupSizeTierIndex: 0, nights: 2, price: 150 },
              { groupSizeTierIndex: 0, nights: 3, price: 200 },
            ],
          },
        ],
        version: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
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

    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    expect(screen.getByText('Benidorm')).toBeInTheDocument();
    expect(screen.getByText('Hotel Sol')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch packages' }),
    });

    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch packages/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no packages exist', async () => {
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
      expect(screen.getByText(/No packages found/i)).toBeInTheDocument();
    });
  });

  it('filters packages by status', async () => {
    const mockPackages = [
      {
        _id: '1',
        name: 'Active Package',
        destination: 'Benidorm',
        resort: 'Hotel Sol',
        currency: 'EUR',
        status: 'active',
        groupSizeTiers: [],
        durationOptions: [],
        pricingMatrix: [],
        version: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    (global.fetch as any).mockResolvedValue({
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

    const user = userEvent.setup();
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Active Package')).toBeInTheDocument();
    });

    const statusFilter = screen.getByLabelText(/Status/i);
    await user.selectOptions(statusFilter, 'active');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=active')
      );
    });
  });

  it('searches packages by name', async () => {
    const mockPackages = [
      {
        _id: '1',
        name: 'Benidorm Package',
        destination: 'Benidorm',
        resort: 'Hotel Sol',
        currency: 'EUR',
        status: 'active',
        groupSizeTiers: [],
        durationOptions: [],
        pricingMatrix: [],
        version: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    (global.fetch as any).mockResolvedValue({
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

    const user = userEvent.setup();
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Benidorm Package')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search packages/i);
    await user.type(searchInput, 'Benidorm');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=Benidorm')
      );
    });
  });

  it('handles pagination correctly', async () => {
    const mockPackages = Array.from({ length: 10 }, (_, i) => ({
      _id: `${i + 1}`,
      name: `Package ${i + 1}`,
      destination: 'Benidorm',
      resort: 'Hotel Sol',
      currency: 'EUR',
      status: 'active',
      groupSizeTiers: [],
      durationOptions: [],
      pricingMatrix: [],
      version: 1,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    }));

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        packages: mockPackages,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasMore: true,
        },
      }),
    });

    const user = userEvent.setup();
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Package 1')).toBeInTheDocument();
    });

    const nextButton = screen.getAllByText('Next')[0];
    await user.click(nextButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });
  });

  it('calculates price range correctly', async () => {
    const mockPackages = [
      {
        _id: '1',
        name: 'Test Package',
        destination: 'Benidorm',
        resort: 'Hotel Sol',
        currency: 'EUR',
        status: 'active',
        groupSizeTiers: [],
        durationOptions: [],
        pricingMatrix: [
          {
            period: 'January',
            prices: [
              { groupSizeTierIndex: 0, nights: 2, price: 100 },
              { groupSizeTierIndex: 0, nights: 3, price: 300 },
            ],
          },
        ],
        version: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    (global.fetch as any).mockResolvedValue({
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

    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('€100 - €300')).toBeInTheDocument();
    });
  });

  it('displays ON REQUEST when no numeric prices exist', async () => {
    const mockPackages = [
      {
        _id: '1',
        name: 'Test Package',
        destination: 'Benidorm',
        resort: 'Hotel Sol',
        currency: 'EUR',
        status: 'active',
        groupSizeTiers: [],
        durationOptions: [],
        pricingMatrix: [
          {
            period: 'January',
            prices: [
              { groupSizeTierIndex: 0, nights: 2, price: 'ON_REQUEST' },
            ],
          },
        ],
        version: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    (global.fetch as any).mockResolvedValue({
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

    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('ON REQUEST')).toBeInTheDocument();
    });
  });
});
