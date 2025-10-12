import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PricingMatrixEditor from '../PricingMatrixEditor';
import { IGroupSizeTier, IPricingEntry } from '@/models/SuperOfferPackage';

describe('PricingMatrixEditor', () => {
  const getMockGroupSizeTiers = (): IGroupSizeTier[] => [
    { label: '6-11 People', minPeople: 6, maxPeople: 11 },
    { label: '12+ People', minPeople: 12, maxPeople: 999 }
  ];

  const getMockDurationOptions = () => [2, 3, 4];

  const getMockPricingMatrix = (): IPricingEntry[] => [
    {
      period: 'January',
      periodType: 'month',
      prices: [
        { groupSizeTierIndex: 0, nights: 2, price: 150 },
        { groupSizeTierIndex: 0, nights: 3, price: 200 },
        { groupSizeTierIndex: 1, nights: 2, price: 120 }
      ]
    }
  ];

  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnValidationChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnValidationChange = vi.fn();
  });

  it('renders pricing matrix grid', () => {
    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={getMockPricingMatrix()}
        currency="EUR"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Pricing Matrix')).toBeInTheDocument();
    expect(screen.getAllByText('6-11 People')[0]).toBeInTheDocument();
    expect(screen.getAllByText('12+ People')[0]).toBeInTheDocument();
    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('displays prices in correct format', () => {
    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={getMockPricingMatrix()}
        currency="EUR"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('€150.00')).toBeInTheDocument();
    expect(screen.getByText('€200.00')).toBeInTheDocument();
    expect(screen.getByText('€120.00')).toBeInTheDocument();
  });

  it('displays ON REQUEST for on-request pricing', () => {
    const matrixWithOnRequest: IPricingEntry[] = [
      {
        period: 'January',
        periodType: 'month',
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 'ON_REQUEST' }
        ]
      }
    ];

    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={matrixWithOnRequest}
        currency="EUR"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('ON REQUEST')).toBeInTheDocument();
  });

  it('allows editing a cell', async () => {
    const user = userEvent.setup();
    
    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={getMockPricingMatrix()}
        currency="EUR"
        onChange={mockOnChange}
      />
    );

    const priceCell = screen.getByText('€150.00');
    await user.click(priceCell);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('150');

    await user.clear(input);
    await user.type(input, '175');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('allows entering ON REQUEST', async () => {
    const user = userEvent.setup();
    
    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={getMockPricingMatrix()}
        currency="EUR"
        onChange={mockOnChange}
      />
    );

    const emptyCell = screen.getAllByText('-')[0];
    await user.click(emptyCell);

    const input = screen.getByRole('textbox');
    await user.type(input, 'ON REQUEST');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            prices: expect.arrayContaining([
              expect.objectContaining({ price: 'ON_REQUEST' })
            ])
          })
        ])
      );
    });
  });

  it('cancels edit on Escape key', async () => {
    const user = userEvent.setup();
    
    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={getMockPricingMatrix()}
        currency="EUR"
        onChange={mockOnChange}
      />
    );

    const priceCell = screen.getByText('€150.00');
    await user.click(priceCell);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '999');
    await user.keyboard('{Escape}');

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(screen.getByText('€150.00')).toBeInTheDocument();
  });

  it('shows add period form when button clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={getMockPricingMatrix()}
        currency="EUR"
        onChange={mockOnChange}
      />
    );

    const addButton = screen.getByText('Add Period');
    await user.click(addButton);

    expect(screen.getByText('Add New Period')).toBeInTheDocument();
    expect(screen.getByLabelText('Period Type')).toBeInTheDocument();
  });

  it('adds a new month period', async () => {
    const user = userEvent.setup();
    
    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={getMockPricingMatrix()}
        currency="EUR"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('Add Period'));
    
    const monthSelect = screen.getByLabelText('Month');
    await user.selectOptions(monthSelect, 'February');

    const addPeriodButton = screen.getByRole('button', { name: /add period/i });
    await user.click(addPeriodButton);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ period: 'February', periodType: 'month' })
      ])
    );
  });

  it('adds a new special period with dates', async () => {
    const user = userEvent.setup();
    
    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={getMockPricingMatrix()}
        currency="EUR"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('Add Period'));
    
    const typeSelect = screen.getByLabelText('Period Type');
    await user.selectOptions(typeSelect, 'special');

    const nameInput = screen.getByLabelText('Period Name');
    await user.type(nameInput, 'Easter 2025');

    const startDateInput = screen.getByLabelText('Start Date');
    await user.type(startDateInput, '2025-04-18');

    const endDateInput = screen.getByLabelText('End Date');
    await user.type(endDateInput, '2025-04-21');

    const addPeriodButton = screen.getByRole('button', { name: /add period/i });
    await user.click(addPeriodButton);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          period: 'Easter 2025',
          periodType: 'special',
          startDate: expect.any(Date),
          endDate: expect.any(Date)
        })
      ])
    );
  });

  it('removes a period with confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    
    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={getMockPricingMatrix()}
        currency="EUR"
        onChange={mockOnChange}
      />
    );

    const removeButton = screen.getByText('Remove');
    await user.click(removeButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('validates matrix completeness', () => {
    const incompletePricingMatrix: IPricingEntry[] = [
      {
        period: 'January',
        periodType: 'month',
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 150 }
          // Missing other combinations
        ]
      }
    ];

    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={incompletePricingMatrix}
        currency="EUR"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    expect(mockOnValidationChange).toHaveBeenCalledWith(
      false,
      expect.arrayContaining([
        expect.stringContaining('cells are empty')
      ])
    );
  });

  it('shows validation success when matrix is complete', () => {
    const completePricingMatrix: IPricingEntry[] = [
      {
        period: 'January',
        periodType: 'month',
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 150 },
          { groupSizeTierIndex: 0, nights: 3, price: 200 },
          { groupSizeTierIndex: 0, nights: 4, price: 250 },
          { groupSizeTierIndex: 1, nights: 2, price: 120 },
          { groupSizeTierIndex: 1, nights: 3, price: 160 },
          { groupSizeTierIndex: 1, nights: 4, price: 200 }
        ]
      }
    ];

    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={completePricingMatrix}
        currency="EUR"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    expect(mockOnValidationChange).toHaveBeenCalledWith(true, []);
    expect(screen.getByText(/Pricing matrix is complete/)).toBeInTheDocument();
  });

  it('displays empty state when no periods', () => {
    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={[]}
        currency="EUR"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/No pricing periods defined/)).toBeInTheDocument();
  });

  it('uses correct currency symbol', () => {
    const { unmount } = render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={getMockPricingMatrix()}
        currency="GBP"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('£150.00')).toBeInTheDocument();
    unmount();

    render(
      <PricingMatrixEditor
        groupSizeTiers={getMockGroupSizeTiers()}
        durationOptions={getMockDurationOptions()}
        pricingMatrix={getMockPricingMatrix()}
        currency="USD"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });
});
