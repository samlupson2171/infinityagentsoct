import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SelectedEventsList from '../SelectedEventsList';

describe('SelectedEventsList', () => {
  const mockEvents = [
    {
      eventId: 'event1',
      eventName: 'Jet Skiing',
      eventPrice: 50,
      eventCurrency: 'GBP',
      addedAt: new Date('2025-01-01'),
    },
    {
      eventId: 'event2',
      eventName: 'Parasailing',
      eventPrice: 75,
      eventCurrency: 'GBP',
      addedAt: new Date('2025-01-02'),
    },
  ];

  describe('Event Display', () => {
    it('should display all selected events', () => {
      render(
        <SelectedEventsList
          events={mockEvents}
          onRemove={vi.fn()}
          currency="GBP"
        />
      );

      expect(screen.getByText('Jet Skiing')).toBeInTheDocument();
      expect(screen.getByText('Parasailing')).toBeInTheDocument();
    });

    it('should show empty state when no events', () => {
      render(
        <SelectedEventsList
          events={[]}
          onRemove={vi.fn()}
          currency="GBP"
        />
      );

      expect(screen.getByText('No events selected')).toBeInTheDocument();
    });

    it('should display event count', () => {
      render(
        <SelectedEventsList
          events={mockEvents}
          onRemove={vi.fn()}
          currency="GBP"
        />
      );

      expect(screen.getByText(/Selected Events \(2\)/i)).toBeInTheDocument();
    });
  });

  describe('Price Calculation', () => {
    it('should calculate total events cost correctly', () => {
      render(
        <SelectedEventsList
          events={mockEvents}
          onRemove={vi.fn()}
          currency="GBP"
        />
      );

      expect(screen.getByText(/£ 125\.00/)).toBeInTheDocument();
    });

    it('should only include events with matching currency in total', () => {
      const mixedCurrencyEvents = [
        {
          eventId: 'event1',
          eventName: 'Jet Skiing',
          eventPrice: 50,
          eventCurrency: 'GBP',
          addedAt: new Date(),
        },
        {
          eventId: 'event2',
          eventName: 'Parasailing',
          eventPrice: 75,
          eventCurrency: 'EUR',
          addedAt: new Date(),
        },
      ];

      render(
        <SelectedEventsList
          events={mixedCurrencyEvents}
          onRemove={vi.fn()}
          currency="GBP"
        />
      );

      // Only GBP event should be included - check the total
      const total = screen.getByText('Events Total:').nextElementSibling;
      expect(total).toHaveTextContent('£ 50.00');
    });

    it('should handle zero-price events', () => {
      const freeEvents = [
        {
          eventId: 'event1',
          eventName: 'Free Event',
          eventPrice: 0,
          eventCurrency: 'GBP',
          addedAt: new Date(),
        },
      ];

      render(
        <SelectedEventsList
          events={freeEvents}
          onRemove={vi.fn()}
          currency="GBP"
        />
      );

      const total = screen.getByText('Events Total:').nextElementSibling;
      expect(total).toHaveTextContent('£ 0.00');
    });
  });

  describe('Currency Handling', () => {
    it('should show warning for currency mismatch', () => {
      const mixedCurrencyEvents = [
        {
          eventId: 'event1',
          eventName: 'Jet Skiing',
          eventPrice: 50,
          eventCurrency: 'EUR',
          addedAt: new Date(),
        },
      ];

      render(
        <SelectedEventsList
          events={mixedCurrencyEvents}
          onRemove={vi.fn()}
          currency="GBP"
        />
      );

      expect(screen.getByText(/Currency mismatch/i)).toBeInTheDocument();
      expect(screen.getByText(/Event uses EUR, quote uses GBP/i)).toBeInTheDocument();
    });

    it('should show total warning when some events have different currency', () => {
      const mixedCurrencyEvents = [
        {
          eventId: 'event1',
          eventName: 'Jet Skiing',
          eventPrice: 50,
          eventCurrency: 'GBP',
          addedAt: new Date(),
        },
        {
          eventId: 'event2',
          eventName: 'Parasailing',
          eventPrice: 75,
          eventCurrency: 'EUR',
          addedAt: new Date(),
        },
      ];

      render(
        <SelectedEventsList
          events={mixedCurrencyEvents}
          onRemove={vi.fn()}
          currency="GBP"
        />
      );

      expect(
        screen.getByText(/Some events use different currencies/i)
      ).toBeInTheDocument();
    });

    it('should format currency correctly for different currencies', () => {
      const eurEvents = [
        {
          eventId: 'event1',
          eventName: 'Event',
          eventPrice: 100,
          eventCurrency: 'EUR',
          addedAt: new Date(),
        },
      ];

      render(
        <SelectedEventsList
          events={eurEvents}
          onRemove={vi.fn()}
          currency="EUR"
        />
      );

      const total = screen.getByText('Events Total:').nextElementSibling;
      expect(total).toHaveTextContent('€ 100.00');
    });
  });

  describe('Event Removal', () => {
    it('should call onRemove when remove button is clicked', () => {
      const onRemove = vi.fn();

      render(
        <SelectedEventsList
          events={mockEvents}
          onRemove={onRemove}
          currency="GBP"
        />
      );

      const removeButtons = screen.getAllByLabelText(/Remove/);
      fireEvent.click(removeButtons[0]);

      expect(onRemove).toHaveBeenCalledWith('event1');
    });

    it('should call onRemove with correct event ID', () => {
      const onRemove = vi.fn();

      render(
        <SelectedEventsList
          events={mockEvents}
          onRemove={onRemove}
          currency="GBP"
        />
      );

      const removeButtons = screen.getAllByLabelText(/Remove/);
      fireEvent.click(removeButtons[1]);

      expect(onRemove).toHaveBeenCalledWith('event2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle events with very long names', () => {
      const longNameEvents = [
        {
          eventId: 'event1',
          eventName: 'This is a very long event name that should be truncated properly',
          eventPrice: 50,
          eventCurrency: 'GBP',
          addedAt: new Date(),
        },
      ];

      render(
        <SelectedEventsList
          events={longNameEvents}
          onRemove={vi.fn()}
          currency="GBP"
        />
      );

      expect(
        screen.getByText(/This is a very long event name/)
      ).toBeInTheDocument();
    });

    it('should handle large number of events', () => {
      const manyEvents = Array.from({ length: 20 }, (_, i) => ({
        eventId: `event${i}`,
        eventName: `Event ${i}`,
        eventPrice: 50,
        eventCurrency: 'GBP',
        addedAt: new Date(),
      }));

      render(
        <SelectedEventsList
          events={manyEvents}
          onRemove={vi.fn()}
          currency="GBP"
        />
      );

      expect(screen.getByText(/Selected Events \(20\)/i)).toBeInTheDocument();
      expect(screen.getByText(/£ 1,000\.00/)).toBeInTheDocument();
    });

    it('should handle events with decimal prices', () => {
      const decimalPriceEvents = [
        {
          eventId: 'event1',
          eventName: 'Event',
          eventPrice: 49.99,
          eventCurrency: 'GBP',
          addedAt: new Date(),
        },
      ];

      render(
        <SelectedEventsList
          events={decimalPriceEvents}
          onRemove={vi.fn()}
          currency="GBP"
        />
      );

      const total = screen.getByText('Events Total:').nextElementSibling;
      expect(total).toHaveTextContent('£ 49.99');
    });
  });
});
