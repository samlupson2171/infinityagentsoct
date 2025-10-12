import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PackageSelector from '../PackageSelector';
import { ISuperOfferPackage } from '@/models/SuperOfferPackage';

// Mock fetch
global.fetch = vi.fn();

const mockPackages: ISuperOfferPackage[] = [
  {
    _id: '1' as any,
    name: 'Benidorm Super Package',
    destination: 'Benidorm',
    resort: 'Hotel Sol',
    currency: 'EUR',
    status: 'active',
    groupSizeTiers: [
      { label: '6-11 People', minPeople: 6, maxPeople: 11 },
      { label: '12+ People', minPeople: 12, maxPeople: 100 },
    ],
    durationOptions: [2, 3, 4],
    inclusions: [
      { text: 'Airport transfers', category: 'transfer' },
      { text: '3-star accommodation', category: 'accommodation' },
    ],
    pricingMatrix: [],
    accommodationExamples: [],
    salesNotes: '',
    version: 1,
  } as unknown as ISuperOfferPackage,
  {
    _id: '2' as any,
    name: 'Albufeira Beach Package',
    destination: 'Albufeira',
    resort: 'Beach Resort',
    currency: 'EUR',
    status: 'active',
    groupSizeTiers: [
      { label: '6-11 People', minPeople: 6, maxPeople: 11 },
    ],
    durationOptions: [3, 4],
    inclusions: [
      { text: 'Beach activities', category: 'activity' },
    ],
    pricingMatrix: [],
    accommodationExamples: [],
    salesNotes: '',
    version: 1,
  } as unknown as ISuperOfferPackage,
];

describe('PackageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open', () => {
    render(
      <PackageSelector
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('Select Super Package')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const { container } = render(
      <PackageSelector
        isOpen={false}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should fetch packages on open', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ packages: mockPackages }),
    });

    render(
      <PackageSelector
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/super-packages?status=active'
      );
    });
  });

  it('should display packages in list', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ packages: mockPackages }),
    });

    render(
      <PackageSelector
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
      expect(screen.getByText('Albufeira Beach Package')).toBeInTheDocument();
    });
  });

  it('should filter packages by search term', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ packages: mockPackages }),
    });

    render(
      <PackageSelector
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search packages...');
    fireEvent.change(searchInput, { target: { value: 'Benidorm' } });

    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
      expect(screen.queryByText('Albufeira Beach Package')).not.toBeInTheDocument();
    });
  });

  it('should filter packages by destination', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ packages: mockPackages }),
    });

    render(
      <PackageSelector
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    const destinationSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(destinationSelect, { target: { value: 'Albufeira' } });

    await waitFor(() => {
      expect(screen.queryByText('Benidorm Super Package')).not.toBeInTheDocument();
      expect(screen.getByText('Albufeira Beach Package')).toBeInTheDocument();
    });
  });

  it('should show package details when selected', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ packages: mockPackages }),
    });

    render(
      <PackageSelector
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    const packageButton = screen.getByText('Benidorm Super Package');
    fireEvent.click(packageButton);

    await waitFor(() => {
      expect(screen.getByText('Package Details')).toBeInTheDocument();
      expect(screen.getByText('Airport transfers')).toBeInTheDocument();
      expect(screen.getByText('3-star accommodation')).toBeInTheDocument();
    });
  });

  it('should calculate price when parameters are entered', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ packages: mockPackages }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            calculation: {
              price: 1500,
              tier: {
                index: 0,
                label: '6-11 People',
                minPeople: 6,
                maxPeople: 11,
              },
              period: {
                period: 'January',
                periodType: 'month',
              },
              currency: 'EUR',
              nights: 3,
            },
          },
        }),
      });

    render(
      <PackageSelector
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        initialPeople={10}
        initialNights={3}
        initialDate="2025-01-15"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    const packageButton = screen.getByText('Benidorm Super Package');
    fireEvent.click(packageButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/super-packages/calculate-price',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should call onSelect with complete PackageSelection when Apply Package is clicked', async () => {
    const onSelect = vi.fn();
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ packages: mockPackages }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            calculation: {
              price: 1500,
              tier: {
                index: 0,
                label: '6-11 People',
                minPeople: 6,
                maxPeople: 11,
              },
              period: {
                period: 'January',
                periodType: 'month',
              },
              currency: 'EUR',
              nights: 3,
            },
          },
        }),
      });

    render(
      <PackageSelector
        isOpen={true}
        onClose={vi.fn()}
        onSelect={onSelect}
        initialPeople={10}
        initialNights={3}
        initialDate="2025-01-15"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    const packageButton = screen.getByText('Benidorm Super Package');
    fireEvent.click(packageButton);

    await waitFor(() => {
      expect(screen.getByText('Apply Package')).toBeInTheDocument();
    });

    const applyButton = screen.getByText('Apply Package');
    fireEvent.click(applyButton);

    expect(onSelect).toHaveBeenCalledWith({
      packageId: '1',
      packageName: 'Benidorm Super Package',
      packageVersion: 1,
      numberOfPeople: 10,
      numberOfNights: 3,
      arrivalDate: '2025-01-15',
      priceCalculation: {
        price: 1500,
        tierUsed: '6-11 People',
        tierIndex: 0,
        periodUsed: 'January',
        currency: 'EUR',
        breakdown: {
          pricePerPerson: 150,
          numberOfPeople: 10,
          totalPrice: 1500,
        },
      },
      inclusions: [
        { text: 'Airport transfers', category: 'transfer' },
        { text: '3-star accommodation', category: 'accommodation' },
      ],
      accommodationExamples: [],
    });
  });

  it('should handle ON_REQUEST pricing', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ packages: mockPackages }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            calculation: {
              price: 'ON_REQUEST',
              tier: {
                index: 0,
                label: '6-11 People',
              },
              period: {
                period: 'Easter',
                periodType: 'special',
              },
              currency: 'EUR',
            },
          },
        }),
      });

    render(
      <PackageSelector
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        initialPeople={10}
        initialNights={3}
        initialDate="2025-04-15"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    const packageButton = screen.getByText('Benidorm Super Package');
    fireEvent.click(packageButton);

    await waitFor(() => {
      expect(screen.getByText('Price on Request')).toBeInTheDocument();
      expect(screen.getByText('This combination requires manual pricing')).toBeInTheDocument();
    });
  });

  it('should call onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ packages: mockPackages }),
    });

    render(
      <PackageSelector
        isOpen={true}
        onClose={onClose}
        onSelect={vi.fn()}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should display error when fetch fails', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(
      <PackageSelector
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load packages')).toBeInTheDocument();
    });
  });

  it('should disable Apply button until price calculation completes', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ packages: mockPackages }),
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    data: {
                      calculation: {
                        price: 1500,
                        tier: { index: 0, label: '6-11 People' },
                        period: { period: 'January', periodType: 'month' },
                        currency: 'EUR',
                      },
                    },
                  }),
                }),
              100
            )
          )
      );

    render(
      <PackageSelector
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        initialPeople={10}
        initialNights={3}
        initialDate="2025-01-15"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    const packageButton = screen.getByText('Benidorm Super Package');
    fireEvent.click(packageButton);

    // Button should be disabled while calculating
    const applyButton = screen.getByText('Calculating...');
    expect(applyButton).toBeDisabled();

    // Wait for calculation to complete
    await waitFor(() => {
      expect(screen.getByText('Apply Package')).toBeInTheDocument();
    });

    const enabledButton = screen.getByText('Apply Package');
    expect(enabledButton).not.toBeDisabled();
  });

  it('should include accommodationExamples in selection', async () => {
    const onSelect = vi.fn();
    const packagesWithAccommodation = [
      {
        ...mockPackages[0],
        accommodationExamples: ['Hotel Sol', 'Beach Resort', 'City Center Hotel'],
      },
    ];

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ packages: packagesWithAccommodation }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            calculation: {
              price: 1500,
              tier: { index: 0, label: '6-11 People' },
              period: { period: 'January', periodType: 'month' },
              currency: 'EUR',
            },
          },
        }),
      });

    render(
      <PackageSelector
        isOpen={true}
        onClose={vi.fn()}
        onSelect={onSelect}
        initialPeople={10}
        initialNights={3}
        initialDate="2025-01-15"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Benidorm Super Package')).toBeInTheDocument();
    });

    const packageButton = screen.getByText('Benidorm Super Package');
    fireEvent.click(packageButton);

    await waitFor(() => {
      expect(screen.getByText('Apply Package')).toBeInTheDocument();
    });

    const applyButton = screen.getByText('Apply Package');
    fireEvent.click(applyButton);

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        accommodationExamples: ['Hotel Sol', 'Beach Resort', 'City Center Hotel'],
      })
    );
  });
});
