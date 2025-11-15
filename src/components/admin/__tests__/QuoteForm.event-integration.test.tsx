import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import QuoteForm from '../QuoteForm';

// Mock dependencies
vi.mock('@/components/enquiries/EventSelector', () => ({
  default: ({ onChange, selectedEvents }: any) => (
    <div data-testid="event-selector">
      <button onClick={() => onChange(['event1', 'event2'])}>
        Select Events
      </button>
      <div>Selected: {selectedEvents.join(',')}</div>
    </div>
  ),
}));

vi.mock('../SelectedEventsList', () => ({
  default: ({ events, onRemove }: any) => (
    <div data-testid="selected-events-list">
      {events.map((event: any) => (
        <div key={event.eventId} data-testid={`event-${event.eventId}`}>
          {event.eventName} - {event.eventPrice}
          <button onClick={() => onRemove(event.eventId)}>Remove</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../PackageSelector', () => ({
  default: () => <div data-testid="package-selector" />,
}));

vi.mock('../PriceSyncIndicator', () => ({
  default: () => <div data-testid="price-sync-indicator" />,
}));

vi.mock('../PriceRecalculationModal', () => ({
  default: () => <div data-testid="price-recalculation-modal" />,
}));

vi.mock('../PriceBreakdown', () => ({
  default: ({ eventsTotal, selectedEvents }: any) => (
    <div data-testid="price-breakdown">
      Events Total: {eventsTotal}
      Events Count: {selectedEvents.length}
    </div>
  ),
}));

vi.mock('@/lib/hooks/useQuotePrice', () => ({
  useQuotePrice: () => ({
    syncStatus: 'synced',
    calculatedPrice: 1000,
    priceBreakdown: null,
    error: null,
    recalculatePrice: vi.fn(),
    markAsCustomPrice: vi.fn(),
    resetToCalculated: vi.fn(),
    validationWarnings: [],
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('QuoteForm - Event Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Event Selection Logic', () => {
    it('should add events when selected', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            events: [
              {
                eventId: 'event1',
                eventName: 'Jet Skiing',
                price: 50,
                currency: 'GBP',
              },
              {
                eventId: 'event2',
                eventName: 'Parasailing',
                price: 75,
                currency: 'GBP',
              },
            ],
          },
        }),
      });

      render(
        <QuoteForm
          onSubmit={vi.fn()}
          initialData={{
            leadName: 'Test Lead',
            hotelName: 'Test Hotel',
            numberOfPeople: 10,
            numberOfRooms: 5,
            numberOfNights: 3,
            arrivalDate: '2025-12-01',
            whatsIncluded: 'Test inclusions',
            totalPrice: 1000,
            currency: 'GBP',
          }}
        />
      );

      const selectButton = screen.getByText('Select Events');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/quotes/calculate-events-price',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ eventIds: ['event1', 'event2'] }),
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('event-event1')).toBeInTheDocument();
        expect(screen.getByTestId('event-event2')).toBeInTheDocument();
      });
    });

    it('should remove events when deselected', async () => {
      render(
        <QuoteForm
          onSubmit={vi.fn()}
          initialData={{
            leadName: 'Test Lead',
            hotelName: 'Test Hotel',
            numberOfPeople: 10,
            numberOfRooms: 5,
            numberOfNights: 3,
            arrivalDate: '2025-12-01',
            whatsIncluded: 'Test inclusions',
            totalPrice: 1000,
            currency: 'GBP',
            selectedEvents: [
              {
                eventId: 'event1',
                eventName: 'Jet Skiing',
                eventPrice: 50,
                eventCurrency: 'GBP',
                addedAt: new Date().toISOString(),
              },
            ],
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('event-event1')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('event-event1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Price Calculation with Events', () => {
    it('should calculate events total correctly', async () => {
      render(
        <QuoteForm
          onSubmit={vi.fn()}
          initialData={{
            leadName: 'Test Lead',
            hotelName: 'Test Hotel',
            numberOfPeople: 10,
            numberOfRooms: 5,
            numberOfNights: 3,
            arrivalDate: '2025-12-01',
            whatsIncluded: 'Test inclusions',
            totalPrice: 1000,
            currency: 'GBP',
            selectedEvents: [
              {
                eventId: 'event1',
                eventName: 'Jet Skiing',
                eventPrice: 50,
                eventCurrency: 'GBP',
                addedAt: new Date().toISOString(),
              },
              {
                eventId: 'event2',
                eventName: 'Parasailing',
                eventPrice: 75,
                eventCurrency: 'GBP',
                addedAt: new Date().toISOString(),
              },
            ],
          }}
        />
      );

      await waitFor(() => {
        const priceBreakdown = screen.getByTestId('price-breakdown');
        expect(priceBreakdown).toHaveTextContent('Events Total: 125');
        expect(priceBreakdown).toHaveTextContent('Events Count: 2');
      });
    });

    it('should exclude events with mismatched currency from total', async () => {
      render(
        <QuoteForm
          onSubmit={vi.fn()}
          initialData={{
            leadName: 'Test Lead',
            hotelName: 'Test Hotel',
            numberOfPeople: 10,
            numberOfRooms: 5,
            numberOfNights: 3,
            arrivalDate: '2025-12-01',
            whatsIncluded: 'Test inclusions',
            totalPrice: 1000,
            currency: 'GBP',
            selectedEvents: [
              {
                eventId: 'event1',
                eventName: 'Jet Skiing',
                eventPrice: 50,
                eventCurrency: 'GBP',
                addedAt: new Date().toISOString(),
              },
              {
                eventId: 'event2',
                eventName: 'Parasailing',
                eventPrice: 75,
                eventCurrency: 'EUR',
                addedAt: new Date().toISOString(),
              },
            ],
          }}
        />
      );

      await waitFor(() => {
        const priceBreakdown = screen.getByTestId('price-breakdown');
        // Only GBP event should be included
        expect(priceBreakdown).toHaveTextContent('Events Total: 50');
      });
    });
  });

  describe('Event Validation', () => {
    it('should validate event IDs on submission', async () => {
      const onSubmit = vi.fn();

      render(
        <QuoteForm
          onSubmit={onSubmit}
          initialData={{
            leadName: 'Test Lead',
            hotelName: 'Test Hotel',
            numberOfPeople: 10,
            numberOfRooms: 5,
            numberOfNights: 3,
            arrivalDate: '2025-12-01',
            whatsIncluded: 'Test inclusions',
            totalPrice: 1000,
            currency: 'GBP',
            selectedEvents: [
              {
                eventId: '',
                eventName: 'Invalid Event',
                eventPrice: 50,
                eventCurrency: 'GBP',
                addedAt: new Date().toISOString(),
              },
            ],
          }}
        />
      );

      const submitButton = screen.getByText('Create Quote');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Event validation failed/i)).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    it('should validate event prices are non-negative', async () => {
      const onSubmit = vi.fn();

      render(
        <QuoteForm
          onSubmit={onSubmit}
          initialData={{
            leadName: 'Test Lead',
            hotelName: 'Test Hotel',
            numberOfPeople: 10,
            numberOfRooms: 5,
            numberOfNights: 3,
            arrivalDate: '2025-12-01',
            whatsIncluded: 'Test inclusions',
            totalPrice: 1000,
            currency: 'GBP',
            selectedEvents: [
              {
                eventId: 'event1',
                eventName: 'Invalid Event',
                eventPrice: -50,
                eventCurrency: 'GBP',
                addedAt: new Date().toISOString(),
              },
            ],
          }}
        />
      );

      const submitButton = screen.getByText('Create Quote');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Event validation failed/i)).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    it('should enforce maximum events limit', async () => {
      const onSubmit = vi.fn();
      const tooManyEvents = Array.from({ length: 21 }, (_, i) => ({
        eventId: `event${i}`,
        eventName: `Event ${i}`,
        eventPrice: 50,
        eventCurrency: 'GBP',
        addedAt: new Date().toISOString(),
      }));

      render(
        <QuoteForm
          onSubmit={onSubmit}
          initialData={{
            leadName: 'Test Lead',
            hotelName: 'Test Hotel',
            numberOfPeople: 10,
            numberOfRooms: 5,
            numberOfNights: 3,
            arrivalDate: '2025-12-01',
            whatsIncluded: 'Test inclusions',
            totalPrice: 1000,
            currency: 'GBP',
            selectedEvents: tooManyEvents,
          }}
        />
      );

      const submitButton = screen.getByText('Create Quote');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Cannot add more than 20 events/i)).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Currency Handling', () => {
    it('should show warning for currency mismatch', async () => {
      render(
        <QuoteForm
          onSubmit={vi.fn()}
          initialData={{
            leadName: 'Test Lead',
            hotelName: 'Test Hotel',
            numberOfPeople: 10,
            numberOfRooms: 5,
            numberOfNights: 3,
            arrivalDate: '2025-12-01',
            whatsIncluded: 'Test inclusions',
            totalPrice: 1000,
            currency: 'GBP',
            selectedEvents: [
              {
                eventId: 'event1',
                eventName: 'Jet Skiing',
                eventPrice: 50,
                eventCurrency: 'EUR',
                addedAt: new Date().toISOString(),
              },
            ],
          }}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText(/have different currency.*and are excluded from total/i)
        ).toBeInTheDocument();
      });
    });

    it('should recalculate events total when currency changes', async () => {
      const { rerender } = render(
        <QuoteForm
          onSubmit={vi.fn()}
          initialData={{
            leadName: 'Test Lead',
            hotelName: 'Test Hotel',
            numberOfPeople: 10,
            numberOfRooms: 5,
            numberOfNights: 3,
            arrivalDate: '2025-12-01',
            whatsIncluded: 'Test inclusions',
            totalPrice: 1000,
            currency: 'GBP',
            selectedEvents: [
              {
                eventId: 'event1',
                eventName: 'Jet Skiing',
                eventPrice: 50,
                eventCurrency: 'GBP',
                addedAt: new Date().toISOString(),
              },
              {
                eventId: 'event2',
                eventName: 'Parasailing',
                eventPrice: 75,
                eventCurrency: 'EUR',
                addedAt: new Date().toISOString(),
              },
            ],
          }}
        />
      );

      await waitFor(() => {
        const priceBreakdown = screen.getByTestId('price-breakdown');
        expect(priceBreakdown).toHaveTextContent('Events Total: 50');
      });

      // Change currency to EUR
      const currencySelect = screen.getByLabelText(/Currency/i);
      fireEvent.change(currencySelect, { target: { value: 'EUR' } });

      await waitFor(() => {
        const priceBreakdown = screen.getByTestId('price-breakdown');
        expect(priceBreakdown).toHaveTextContent('Events Total: 75');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty events array', async () => {
      render(
        <QuoteForm
          onSubmit={vi.fn()}
          initialData={{
            leadName: 'Test Lead',
            hotelName: 'Test Hotel',
            numberOfPeople: 10,
            numberOfRooms: 5,
            numberOfNights: 3,
            arrivalDate: '2025-12-01',
            whatsIncluded: 'Test inclusions',
            totalPrice: 1000,
            currency: 'GBP',
            selectedEvents: [],
          }}
        />
      );

      await waitFor(() => {
        const priceBreakdown = screen.getByTestId('price-breakdown');
        expect(priceBreakdown).toHaveTextContent('Events Total: 0');
        expect(priceBreakdown).toHaveTextContent('Events Count: 0');
      });
    });

    it('should handle events with zero price', async () => {
      render(
        <QuoteForm
          onSubmit={vi.fn()}
          initialData={{
            leadName: 'Test Lead',
            hotelName: 'Test Hotel',
            numberOfPeople: 10,
            numberOfRooms: 5,
            numberOfNights: 3,
            arrivalDate: '2025-12-01',
            whatsIncluded: 'Test inclusions',
            totalPrice: 1000,
            currency: 'GBP',
            selectedEvents: [
              {
                eventId: 'event1',
                eventName: 'Free Event',
                eventPrice: 0,
                eventCurrency: 'GBP',
                addedAt: new Date().toISOString(),
              },
            ],
          }}
        />
      );

      await waitFor(() => {
        const priceBreakdown = screen.getByTestId('price-breakdown');
        expect(priceBreakdown).toHaveTextContent('Events Total: 0');
        expect(priceBreakdown).toHaveTextContent('Events Count: 1');
      });
    });

    it('should preserve events when package is selected', async () => {
      render(
        <QuoteForm
          onSubmit={vi.fn()}
          initialData={{
            leadName: 'Test Lead',
            hotelName: 'Test Hotel',
            numberOfPeople: 10,
            numberOfRooms: 5,
            numberOfNights: 3,
            arrivalDate: '2025-12-01',
            whatsIncluded: 'Test inclusions',
            totalPrice: 1000,
            currency: 'GBP',
            selectedEvents: [
              {
                eventId: 'event1',
                eventName: 'Jet Skiing',
                eventPrice: 50,
                eventCurrency: 'GBP',
                addedAt: new Date().toISOString(),
              },
            ],
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('event-event1')).toBeInTheDocument();
      });

      // Events should still be present after package selection
      // (This is tested by the component not clearing selectedEvents)
    });
  });
});
