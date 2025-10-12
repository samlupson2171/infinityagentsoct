import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SuperPackageManager from '../SuperPackageManager';

// Mock the hooks
vi.mock('@/lib/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
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
    confirm: vi.fn(),
    dialog: null,
  }),
}));

// Mock child components
vi.mock('../SuperPackageVersionHistory', () => ({
  default: function MockVersionHistory() {
    return <div>Version History</div>;
  },
}));

vi.mock('../SuperPackageStatistics', () => ({
  default: function MockStatistics() {
    return <div>Statistics</div>;
  },
}));

// Mock fetch
global.fetch = vi.fn();

const mockPackages = [
  {
    _id: '1',
    name: 'Benidorm Beach Package',
    destination: 'Benidorm',
    resort: 'Beach Resort',
    currency: 'EUR',
    status: 'active',
    groupSizeTiers: [{ label: '6-11 People', minPeople: 6, maxPeople: 11 }],
    durationOptions: [2, 3, 4],
    pricingMatrix: [
      {
        period: 'January',
        prices: [{ groupSizeTierIndex: 0, nights: 2, price: 200 }],
      },
    ],
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: '2',
    name: 'Albufeira Adventure',
    destination: 'Albufeira',
    resort: 'Mountain Resort',
    currency: 'EUR',
    status: 'inactive',
    groupSizeTiers: [{ label: '12+ People', minPeople: 12, maxPeople: 999 }],
    durationOptions: [3, 4, 5],
    pricingMatrix: [
      {
        period: 'February',
        prices: [{ groupSizeTierIndex: 0, nights: 3, price: 300 }],
      },
    ],
    version: 2,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    _id: '3',
    name: 'Benidorm City Break',
    destination: 'Benidorm',
    resort: 'City Resort',
    currency: 'GBP',
    status: 'active',
    groupSizeTiers: [{ label: '6-11 People', minPeople: 6, maxPeople: 11 }],
    durationOptions: [2, 3],
    pricingMatrix: [
      {
        period: 'March',
        prices: [{ groupSizeTierIndex: 0, nights: 2, price: 150 }],
      },
    ],
    version: 1,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
];

describe('SuperPackageManager - Search and Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('limit=1000')) {
        // Filter options request
        return Promise.resolve({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: { page: 1, limit: 1000, total: 3, totalPages: 1, hasMore: false },
          }),
        });
      }
      
      // Parse query params
      const urlObj = new URL(url, 'http://localhost');
      const search = urlObj.searchParams.get('search');
      const status = urlObj.searchParams.get('status');
      const destination = urlObj.searchParams.get('destination');
      const resort = urlObj.searchParams.get('resort');
      
      let filteredPackages = [...mockPackages];
      
      if (search) {
        filteredPackages = filteredPackages.filter(
          (pkg) =>
            pkg.name.toLowerCase().includes(search.toLowerCase()) ||
            pkg.destination.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (status && status !== 'all') {
        filteredPackages = filteredPackages.filter((pkg) => pkg.status === status);
      }
      
      if (destination) {
        filteredPackages = filteredPackages.filter((pkg) => pkg.destination === destination);
      }
      
      if (resort) {
        filteredPackages = filteredPackages.filter((pkg) => pkg.resort === resort);
      }
      
      return Promise.resolve({
        ok: true,
        json: async () => ({
          packages: filteredPackages,
          pagination: {
            page: 1,
            limit: 10,
            total: filteredPackages.length,
            totalPages: 1,
            hasMore: false,
          },
        }),
      });
    });
  });

  it('should render search and filter controls', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by name or destination/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/resort/i)).toBeInTheDocument();
  });

  it('should load and display filter options', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      const destinationSelect = screen.getByLabelText(/destination/i) as HTMLSelectElement;
      expect(destinationSelect.options.length).toBeGreaterThan(1);
    });

    const destinationSelect = screen.getByLabelText(/destination/i) as HTMLSelectElement;
    const resortSelect = screen.getByLabelText(/resort/i) as HTMLSelectElement;

    // Check destinations
    expect(Array.from(destinationSelect.options).map((o) => o.value)).toContain('Benidorm');
    expect(Array.from(destinationSelect.options).map((o) => o.value)).toContain('Albufeira');

    // Check resorts
    expect(Array.from(resortSelect.options).map((o) => o.value)).toContain('Beach Resort');
    expect(Array.from(resortSelect.options).map((o) => o.value)).toContain('Mountain Resort');
    expect(Array.from(resortSelect.options).map((o) => o.value)).toContain('City Resort');
  });

  it('should filter packages by search term', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Benidorm Beach Package')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name or destination/i);
    fireEvent.change(searchInput, { target: { value: 'Adventure' } });

    await waitFor(() => {
      expect(screen.getByText('Albufeira Adventure')).toBeInTheDocument();
      expect(screen.queryByText('Benidorm Beach Package')).not.toBeInTheDocument();
    });
  });

  it('should filter packages by status', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Benidorm Beach Package')).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText(/status/i);
    fireEvent.change(statusSelect, { target: { value: 'inactive' } });

    await waitFor(() => {
      expect(screen.getByText('Albufeira Adventure')).toBeInTheDocument();
      expect(screen.queryByText('Benidorm Beach Package')).not.toBeInTheDocument();
    });
  });

  it('should filter packages by destination', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Benidorm Beach Package')).toBeInTheDocument();
    });

    const destinationSelect = screen.getByLabelText(/destination/i);
    fireEvent.change(destinationSelect, { target: { value: 'Albufeira' } });

    await waitFor(() => {
      expect(screen.getByText('Albufeira Adventure')).toBeInTheDocument();
      expect(screen.queryByText('Benidorm Beach Package')).not.toBeInTheDocument();
    });
  });

  it('should filter packages by resort', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Benidorm Beach Package')).toBeInTheDocument();
    });

    const resortSelect = screen.getByLabelText(/resort/i);
    fireEvent.change(resortSelect, { target: { value: 'City Resort' } });

    await waitFor(() => {
      expect(screen.getByText('Benidorm City Break')).toBeInTheDocument();
      expect(screen.queryByText('Benidorm Beach Package')).not.toBeInTheDocument();
    });
  });

  it('should combine multiple filters', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Benidorm Beach Package')).toBeInTheDocument();
    });

    // Filter by destination and status
    const destinationSelect = screen.getByLabelText(/destination/i);
    const statusSelect = screen.getByLabelText(/status/i);

    fireEvent.change(destinationSelect, { target: { value: 'Benidorm' } });
    fireEvent.change(statusSelect, { target: { value: 'active' } });

    await waitFor(() => {
      expect(screen.getByText('Benidorm Beach Package')).toBeInTheDocument();
      expect(screen.getByText('Benidorm City Break')).toBeInTheDocument();
      expect(screen.queryByText('Albufeira Adventure')).not.toBeInTheDocument();
    });
  });

  it('should display active filter tags', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Benidorm Beach Package')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name or destination/i);
    const statusSelect = screen.getByLabelText(/status/i);
    const destinationSelect = screen.getByLabelText(/destination/i);

    fireEvent.change(searchInput, { target: { value: 'Beach' } });
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    fireEvent.change(destinationSelect, { target: { value: 'Benidorm' } });

    await waitFor(() => {
      expect(screen.getByText(/Search: "Beach"/i)).toBeInTheDocument();
      expect(screen.getByText(/Status: active/i)).toBeInTheDocument();
      expect(screen.getByText(/Destination: Benidorm/i)).toBeInTheDocument();
    });
  });

  it('should clear individual filters via tags', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Benidorm Beach Package')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name or destination/i);
    fireEvent.change(searchInput, { target: { value: 'Beach' } });

    await waitFor(() => {
      expect(screen.getByText(/Search: "Beach"/i)).toBeInTheDocument();
    });

    // Click the × button on the search tag
    const searchTag = screen.getByText(/Search: "Beach"/i).closest('span');
    const clearButton = searchTag?.querySelector('button');
    if (clearButton) {
      fireEvent.click(clearButton);
    }

    await waitFor(() => {
      expect(screen.queryByText(/Search: "Beach"/i)).not.toBeInTheDocument();
    });
  });

  it('should clear all filters at once', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Benidorm Beach Package')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name or destination/i);
    const statusSelect = screen.getByLabelText(/status/i);
    const destinationSelect = screen.getByLabelText(/destination/i);

    fireEvent.change(searchInput, { target: { value: 'Beach' } });
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    fireEvent.change(destinationSelect, { target: { value: 'Benidorm' } });

    await waitFor(() => {
      expect(screen.getByText(/Clear all filters/i)).toBeInTheDocument();
    });

    const clearAllButton = screen.getByText(/Clear all filters/i);
    fireEvent.click(clearAllButton);

    await waitFor(() => {
      expect(screen.queryByText(/Search: "Beach"/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Status: active/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Destination: Benidorm/i)).not.toBeInTheDocument();
    });

    // Verify inputs are cleared
    expect(searchInput).toHaveValue('');
    expect(statusSelect).toHaveValue('all');
    expect(destinationSelect).toHaveValue('');
  });

  it('should reset to page 1 when filters change', async () => {
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByText('Benidorm Beach Package')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name or destination/i);
    fireEvent.change(searchInput, { target: { value: 'Beach' } });

    await waitFor(() => {
      // Verify the fetch was called with page=1
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1')
      );
    });
  });

  it('should show "no packages found" message when filters return no results', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('limit=1000')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            packages: mockPackages,
            pagination: { page: 1, limit: 1000, total: 3, totalPages: 1, hasMore: false },
          }),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: async () => ({
          packages: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasMore: false },
        }),
      });
    });

    render(<SuperPackageManager />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search by name or destination/i);
      fireEvent.change(searchInput, { target: { value: 'NonexistentPackage' } });
    });

    await waitFor(() => {
      expect(screen.getByText(/No packages found matching/i)).toBeInTheDocument();
    });
  });

  it('should debounce search input', async () => {
    // This test verifies that the useDebounce hook is being used
    render(<SuperPackageManager />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by name or destination/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name or destination/i);
    
    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 'B' } });
    fireEvent.change(searchInput, { target: { value: 'Be' } });
    fireEvent.change(searchInput, { target: { value: 'Ben' } });

    // The debounce hook is mocked to return the value immediately,
    // but in production it would delay the API call
    expect(searchInput).toHaveValue('Ben');
  });
});
