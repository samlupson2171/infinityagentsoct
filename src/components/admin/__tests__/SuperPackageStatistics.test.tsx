import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SuperPackageStatistics from '../SuperPackageStatistics';

// Mock fetch
global.fetch = vi.fn();

const mockStatistics = {
  overview: {
    totalPackages: 10,
    activePackages: 8,
    inactivePackages: 2,
    totalLinkedQuotes: 25,
    packagesWithQuotes: 6,
    unusedPackages: 4,
    averageQuotesPerPackage: '2.50',
  },
  mostUsedPackages: [
    {
      _id: 'pkg1',
      name: 'Benidorm Super Package',
      destination: 'Benidorm',
      resort: 'Resort A',
      status: 'active',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-02-20T00:00:00.000Z',
      linkedQuotesCount: 10,
      lastUsedAt: '2024-03-01T00:00:00.000Z',
    },
    {
      _id: 'pkg2',
      name: 'Albufeira Package',
      destination: 'Albufeira',
      resort: 'Resort B',
      status: 'active',
      createdAt: '2024-02-10T00:00:00.000Z',
      updatedAt: '2024-02-10T00:00:00.000Z',
      linkedQuotesCount: 8,
      lastUsedAt: '2024-02-25T00:00:00.000Z',
    },
    {
      _id: 'pkg3',
      name: 'Marbella Package',
      destination: 'Marbella',
      resort: 'Resort C',
      status: 'active',
      createdAt: '2024-03-05T00:00:00.000Z',
      updatedAt: '2024-03-05T00:00:00.000Z',
      linkedQuotesCount: 5,
      lastUsedAt: '2024-03-10T00:00:00.000Z',
    },
  ],
  destinationCounts: {
    Benidorm: { total: 4, active: 3, inactive: 1 },
    Albufeira: { total: 3, active: 2, inactive: 1 },
    Marbella: { total: 3, active: 3, inactive: 0 },
  },
  timeline: {
    creation: [
      { _id: { year: 2024, month: 1 }, created: 2 },
      { _id: { year: 2024, month: 2 }, created: 3 },
      { _id: { year: 2024, month: 3 }, created: 5 },
    ],
    updates: [
      { _id: { year: 2024, month: 2 }, updated: 4 },
      { _id: { year: 2024, month: 3 }, updated: 6 },
    ],
  },
  allPackageStats: [],
};

describe('SuperPackageStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (global.fetch as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<SuperPackageStatistics />);

    expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
  });

  it('should fetch and display statistics', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ statistics: mockStatistics }),
    });

    render(<SuperPackageStatistics />);

    await waitFor(() => {
      expect(screen.getByText('Package Statistics & Analytics')).toBeInTheDocument();
    });

    // Check overview stats
    expect(screen.getByText('10')).toBeInTheDocument(); // Total packages
    expect(screen.getByText('8')).toBeInTheDocument(); // Active packages
    expect(screen.getByText('25')).toBeInTheDocument(); // Linked quotes
    expect(screen.getByText('2.50')).toBeInTheDocument(); // Average
  });

  it('should display error state when fetch fails', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Failed to fetch' } }),
    });

    render(<SuperPackageStatistics />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Statistics')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to fetch statistics')).toBeInTheDocument();
  });

  it('should allow retrying after error', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'Failed' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ statistics: mockStatistics }),
      });

    render(<SuperPackageStatistics />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Statistics')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Package Statistics & Analytics')).toBeInTheDocument();
    });
  });

  it('should switch between tabs', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ statistics: mockStatistics }),
    });

    render(<SuperPackageStatistics />);

    await waitFor(() => {
      expect(screen.getByText('Package Statistics & Analytics')).toBeInTheDocument();
    });

    // Initially on Overview tab
    expect(screen.getByText('Total Packages')).toBeInTheDocument();

    // Switch to Most Used Packages tab
    const usageTab = screen.getByText('Most Used Packages');
    fireEvent.click(usageTab);

    await waitFor(() => {
      expect(screen.getByText('Top 10 Most Used Packages')).toBeInTheDocument();
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    // Switch to Destinations tab
    const destinationsTab = screen.getByText('By Destination');
    fireEvent.click(destinationsTab);

    await waitFor(() => {
      expect(screen.getByText('Packages by Destination')).toBeInTheDocument();
      expect(screen.getByText('Benidorm')).toBeInTheDocument();
    });

    // Switch to Timeline tab
    const timelineTab = screen.getByText('Timeline');
    fireEvent.click(timelineTab);

    await waitFor(() => {
      expect(screen.getByText('Package Creation Timeline')).toBeInTheDocument();
      expect(screen.getByText('Package Update Timeline')).toBeInTheDocument();
    });
  });

  it('should display most used packages with rankings', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ statistics: mockStatistics }),
    });

    render(<SuperPackageStatistics />);

    await waitFor(() => {
      expect(screen.getByText('Package Statistics & Analytics')).toBeInTheDocument();
    });

    // Switch to usage tab
    const usageTab = screen.getByText('Most Used Packages');
    fireEvent.click(usageTab);

    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
      expect(screen.getByText('Albufeira Package')).toBeInTheDocument();
      expect(screen.getByText('Marbella Package')).toBeInTheDocument();
    });

    // Check rankings are displayed
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should display destination counts correctly', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ statistics: mockStatistics }),
    });

    render(<SuperPackageStatistics />);

    await waitFor(() => {
      expect(screen.getByText('Package Statistics & Analytics')).toBeInTheDocument();
    });

    // Switch to destinations tab
    const destinationsTab = screen.getByText('By Destination');
    fireEvent.click(destinationsTab);

    await waitFor(() => {
      expect(screen.getByText('Benidorm')).toBeInTheDocument();
      expect(screen.getByText('Albufeira')).toBeInTheDocument();
      expect(screen.getByText('Marbella')).toBeInTheDocument();
    });
  });

  it('should display timeline data', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ statistics: mockStatistics }),
    });

    render(<SuperPackageStatistics />);

    await waitFor(() => {
      expect(screen.getByText('Package Statistics & Analytics')).toBeInTheDocument();
    });

    // Switch to timeline tab
    const timelineTab = screen.getByText('Timeline');
    fireEvent.click(timelineTab);

    await waitFor(() => {
      expect(screen.getByText('Package Creation Timeline')).toBeInTheDocument();
      expect(screen.getByText('Package Update Timeline')).toBeInTheDocument();
    });

    // Check that timeline data is displayed (may appear multiple times)
    expect(screen.getAllByText(/Jan 2024/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Feb 2024/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mar 2024/).length).toBeGreaterThan(0);
  });

  it('should handle empty most used packages', async () => {
    const emptyStats = {
      ...mockStatistics,
      mostUsedPackages: [],
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ statistics: emptyStats }),
    });

    render(<SuperPackageStatistics />);

    await waitFor(() => {
      expect(screen.getByText('Package Statistics & Analytics')).toBeInTheDocument();
    });

    // Switch to usage tab
    const usageTab = screen.getByText('Most Used Packages');
    fireEvent.click(usageTab);

    await waitFor(() => {
      expect(screen.getByText('No packages have been used yet')).toBeInTheDocument();
    });
  });

  it('should handle empty timeline data', async () => {
    const emptyTimelineStats = {
      ...mockStatistics,
      timeline: {
        creation: [],
        updates: [],
      },
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ statistics: emptyTimelineStats }),
    });

    render(<SuperPackageStatistics />);

    await waitFor(() => {
      expect(screen.getByText('Package Statistics & Analytics')).toBeInTheDocument();
    });

    // Switch to timeline tab
    const timelineTab = screen.getByText('Timeline');
    fireEvent.click(timelineTab);

    await waitFor(() => {
      expect(
        screen.getByText('No packages created in the last 12 months')
      ).toBeInTheDocument();
      expect(
        screen.getByText('No packages updated in the last 12 months')
      ).toBeInTheDocument();
    });
  });

  it('should allow refreshing statistics', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ statistics: mockStatistics }),
    });

    render(<SuperPackageStatistics />);

    await waitFor(() => {
      expect(screen.getByText('Package Statistics & Analytics')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
