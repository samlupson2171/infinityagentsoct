import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import PriceSyncIndicator from '../PriceSyncIndicator';
import { PriceBreakdown, SyncStatus } from '@/types/quote-price-sync';

describe('PriceSyncIndicator', () => {
  const mockPriceBreakdown: PriceBreakdown = {
    pricePerPerson: 500,
    numberOfPeople: 4,
    totalPrice: 2000,
    tierUsed: 'Tier 2 (4-6 people)',
    periodUsed: 'Peak Season',
    currency: 'GBP',
  };

  describe('Visual States', () => {
    it('should render synced state correctly', () => {
      render(
        <PriceSyncIndicator
          status="synced"
          priceBreakdown={mockPriceBreakdown}
        />
      );

      expect(screen.getByText('Price synced with package')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-green-50', 'border-green-200');
    });

    it('should render calculating state with spinner', () => {
      render(<PriceSyncIndicator status="calculating" />);

      expect(screen.getByText('Calculating price...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-blue-50', 'border-blue-200');
      
      // Check for spinner animation
      const spinner = screen.getByRole('status').querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render custom state correctly', () => {
      render(
        <PriceSyncIndicator
          status="custom"
          priceBreakdown={mockPriceBreakdown}
        />
      );

      expect(screen.getByText('Custom price (not synced)')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-orange-50', 'border-orange-200');
    });

    it('should render error state with error message', () => {
      const errorMessage = 'Package not found';
      render(
        <PriceSyncIndicator
          status="error"
          error={errorMessage}
        />
      );

      expect(screen.getByText('Price calculation error')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-red-50', 'border-red-200');
    });

    it('should render out-of-sync state correctly', () => {
      render(<PriceSyncIndicator status="out-of-sync" />);

      expect(screen.getByText('Parameters changed')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-yellow-50', 'border-yellow-200');
    });
  });

  describe('Tooltip Functionality', () => {
    it('should show tooltip on hover with price breakdown', async () => {
      render(
        <PriceSyncIndicator
          status="synced"
          priceBreakdown={mockPriceBreakdown}
        />
      );

      const indicator = screen.getByRole('status');
      
      // Tooltip should not be visible initially
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Hover over indicator
      fireEvent.mouseEnter(indicator);

      // Tooltip should appear
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Check tooltip content
      expect(screen.getByText('Price Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Tier 2 (4-6 people)')).toBeInTheDocument();
      expect(screen.getByText('Peak Season')).toBeInTheDocument();
      expect(screen.getByText('£500.00')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('£2,000.00')).toBeInTheDocument();
    });

    it('should hide tooltip on mouse leave', async () => {
      render(
        <PriceSyncIndicator
          status="synced"
          priceBreakdown={mockPriceBreakdown}
        />
      );

      const indicator = screen.getByRole('status');

      // Show tooltip
      fireEvent.mouseEnter(indicator);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Hide tooltip
      fireEvent.mouseLeave(indicator);
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should show error details in tooltip for error state', async () => {
      const errorMessage = 'Network connection failed';
      render(
        <PriceSyncIndicator
          status="error"
          error={errorMessage}
        />
      );

      const indicator = screen.getByRole('status');
      fireEvent.mouseEnter(indicator);

      await waitFor(() => {
        expect(screen.getByText('Error Details')).toBeInTheDocument();
        // Use getAllByText since error message appears in both description and details
        const errorTexts = screen.getAllByText(errorMessage);
        expect(errorTexts.length).toBeGreaterThan(0);
      });
    });

    it('should show action hints for custom state', async () => {
      render(
        <PriceSyncIndicator
          status="custom"
          priceBreakdown={mockPriceBreakdown}
          onRecalculate={vi.fn()}
          onResetToCalculated={vi.fn()}
        />
      );

      const indicator = screen.getByRole('status');
      fireEvent.mouseEnter(indicator);

      await waitFor(() => {
        expect(screen.getByText(/Click the refresh icon to recalculate/)).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('should show recalculate button for custom state', () => {
      const onRecalculate = vi.fn();
      render(
        <PriceSyncIndicator
          status="custom"
          onRecalculate={onRecalculate}
        />
      );

      const recalculateButton = screen.getByLabelText('Recalculate price from package');
      expect(recalculateButton).toBeInTheDocument();
    });

    it('should show recalculate button for error state', () => {
      const onRecalculate = vi.fn();
      render(
        <PriceSyncIndicator
          status="error"
          error="Test error"
          onRecalculate={onRecalculate}
        />
      );

      const recalculateButton = screen.getByLabelText('Recalculate price from package');
      expect(recalculateButton).toBeInTheDocument();
    });

    it('should show recalculate button for out-of-sync state', () => {
      const onRecalculate = vi.fn();
      render(
        <PriceSyncIndicator
          status="out-of-sync"
          onRecalculate={onRecalculate}
        />
      );

      const recalculateButton = screen.getByLabelText('Recalculate price from package');
      expect(recalculateButton).toBeInTheDocument();
    });

    it('should call onRecalculate when recalculate button is clicked', () => {
      const onRecalculate = vi.fn();
      render(
        <PriceSyncIndicator
          status="custom"
          onRecalculate={onRecalculate}
        />
      );

      const recalculateButton = screen.getByLabelText('Recalculate price from package');
      fireEvent.click(recalculateButton);

      expect(onRecalculate).toHaveBeenCalledTimes(1);
    });

    it('should show reset button only for custom state', () => {
      const onResetToCalculated = vi.fn();
      
      // Custom state - should show reset button
      const { rerender } = render(
        <PriceSyncIndicator
          status="custom"
          onResetToCalculated={onResetToCalculated}
        />
      );
      expect(screen.getByLabelText('Reset to calculated price')).toBeInTheDocument();

      // Error state - should not show reset button
      rerender(
        <PriceSyncIndicator
          status="error"
          error="Test error"
          onResetToCalculated={onResetToCalculated}
        />
      );
      expect(screen.queryByLabelText('Reset to calculated price')).not.toBeInTheDocument();

      // Out-of-sync state - should not show reset button
      rerender(
        <PriceSyncIndicator
          status="out-of-sync"
          onResetToCalculated={onResetToCalculated}
        />
      );
      expect(screen.queryByLabelText('Reset to calculated price')).not.toBeInTheDocument();
    });

    it('should call onResetToCalculated when reset button is clicked', () => {
      const onResetToCalculated = vi.fn();
      render(
        <PriceSyncIndicator
          status="custom"
          onResetToCalculated={onResetToCalculated}
        />
      );

      const resetButton = screen.getByLabelText('Reset to calculated price');
      fireEvent.click(resetButton);

      expect(onResetToCalculated).toHaveBeenCalledTimes(1);
    });

    it('should not show action buttons for synced state', () => {
      render(
        <PriceSyncIndicator
          status="synced"
          priceBreakdown={mockPriceBreakdown}
          onRecalculate={vi.fn()}
          onResetToCalculated={vi.fn()}
        />
      );

      expect(screen.queryByLabelText('Recalculate price from package')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Reset to calculated price')).not.toBeInTheDocument();
    });

    it('should not show action buttons for calculating state', () => {
      render(
        <PriceSyncIndicator
          status="calculating"
          onRecalculate={vi.fn()}
          onResetToCalculated={vi.fn()}
        />
      );

      expect(screen.queryByLabelText('Recalculate price from package')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Reset to calculated price')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <PriceSyncIndicator
          status="synced"
          priceBreakdown={mockPriceBreakdown}
        />
      );

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-label', 'Price synced with package');
      expect(indicator).toHaveAttribute('aria-live', 'polite');
    });

    it('should have accessible button labels', () => {
      render(
        <PriceSyncIndicator
          status="custom"
          onRecalculate={vi.fn()}
          onResetToCalculated={vi.fn()}
        />
      );

      expect(screen.getByLabelText('Recalculate price from package')).toBeInTheDocument();
      expect(screen.getByLabelText('Reset to calculated price')).toBeInTheDocument();
    });

    it('should hide decorative icons from screen readers', () => {
      render(<PriceSyncIndicator status="synced" />);

      const icons = screen.getByRole('status').querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should render with proper responsive classes', () => {
      render(
        <PriceSyncIndicator
          status="synced"
          priceBreakdown={mockPriceBreakdown}
        />
      );

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('flex', 'items-center', 'gap-2', 'px-3', 'py-2', 'rounded-lg');
    });

    it('should have fixed width tooltip for consistent display', async () => {
      render(
        <PriceSyncIndicator
          status="synced"
          priceBreakdown={mockPriceBreakdown}
        />
      );

      const indicator = screen.getByRole('status');
      fireEvent.mouseEnter(indicator);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('w-80');
      });
    });
  });

  describe('Currency Formatting', () => {
    it('should format GBP currency correctly', async () => {
      render(
        <PriceSyncIndicator
          status="synced"
          priceBreakdown={mockPriceBreakdown}
        />
      );

      const indicator = screen.getByRole('status');
      fireEvent.mouseEnter(indicator);

      await waitFor(() => {
        expect(screen.getByText('£500.00')).toBeInTheDocument();
        expect(screen.getByText('£2,000.00')).toBeInTheDocument();
      });
    });

    it('should format EUR currency correctly', async () => {
      const eurBreakdown: PriceBreakdown = {
        ...mockPriceBreakdown,
        currency: 'EUR',
      };

      render(
        <PriceSyncIndicator
          status="synced"
          priceBreakdown={eurBreakdown}
        />
      );

      const indicator = screen.getByRole('status');
      fireEvent.mouseEnter(indicator);

      await waitFor(() => {
        expect(screen.getByText('€500.00')).toBeInTheDocument();
        expect(screen.getByText('€2,000.00')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing priceBreakdown gracefully', () => {
      render(<PriceSyncIndicator status="synced" />);

      expect(screen.getByText('Price synced with package')).toBeInTheDocument();
    });

    it('should handle missing error message', () => {
      render(<PriceSyncIndicator status="error" />);

      expect(screen.getByText('Price calculation error')).toBeInTheDocument();
    });

    it('should handle missing callback functions', () => {
      render(<PriceSyncIndicator status="custom" />);

      expect(screen.queryByLabelText('Recalculate price from package')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Reset to calculated price')).not.toBeInTheDocument();
    });

    it('should not show price breakdown for error state', async () => {
      render(
        <PriceSyncIndicator
          status="error"
          error="Test error"
          priceBreakdown={mockPriceBreakdown}
        />
      );

      const indicator = screen.getByRole('status');
      fireEvent.mouseEnter(indicator);

      await waitFor(() => {
        expect(screen.queryByText('Price Breakdown')).not.toBeInTheDocument();
        expect(screen.getByText('Error Details')).toBeInTheDocument();
      });
    });
  });
});
