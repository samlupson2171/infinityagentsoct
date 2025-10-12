/**
 * Tests for QuotePriceErrorDisplay Component
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuotePriceErrorDisplay from '../QuotePriceErrorDisplay';
import type { ErrorHandlingResult } from '@/lib/errors/quote-price-error-handler';

describe('QuotePriceErrorDisplay', () => {
  const mockOnActionClick = vi.fn();

  beforeEach(() => {
    mockOnActionClick.mockClear();
  });

  it('should render error message and title', () => {
    const errorResult: ErrorHandlingResult = {
      message: 'Test error message',
      title: 'Test Error',
      severity: 'error',
      actions: [],
      shouldLog: true,
      logLevel: 'error',
    };

    render(<QuotePriceErrorDisplay errorResult={errorResult} />);

    expect(screen.getByText('Test Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render with error severity styling', () => {
    const errorResult: ErrorHandlingResult = {
      message: 'Error message',
      title: 'Error',
      severity: 'error',
      actions: [],
      shouldLog: true,
      logLevel: 'error',
    };

    const { container } = render(<QuotePriceErrorDisplay errorResult={errorResult} />);
    const alertDiv = container.querySelector('[role="alert"]');

    expect(alertDiv).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('should render with warning severity styling', () => {
    const errorResult: ErrorHandlingResult = {
      message: 'Warning message',
      title: 'Warning',
      severity: 'warning',
      actions: [],
      shouldLog: true,
      logLevel: 'warn',
    };

    const { container } = render(<QuotePriceErrorDisplay errorResult={errorResult} />);
    const alertDiv = container.querySelector('[role="alert"]');

    expect(alertDiv).toHaveClass('bg-yellow-50', 'border-yellow-200');
  });

  it('should render with info severity styling', () => {
    const errorResult: ErrorHandlingResult = {
      message: 'Info message',
      title: 'Info',
      severity: 'info',
      actions: [],
      shouldLog: true,
      logLevel: 'info',
    };

    const { container } = render(<QuotePriceErrorDisplay errorResult={errorResult} />);
    const alertDiv = container.querySelector('[role="alert"]');

    expect(alertDiv).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('should render action buttons', () => {
    const mockHandler = vi.fn();
    const errorResult: ErrorHandlingResult = {
      message: 'Error message',
      title: 'Error',
      severity: 'error',
      actions: [
        { type: 'retry', label: 'Retry', handler: mockHandler },
        { type: 'manual_price', label: 'Manual Price', handler: mockHandler },
      ],
      shouldLog: true,
      logLevel: 'error',
    };

    render(<QuotePriceErrorDisplay errorResult={errorResult} />);

    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Manual Price')).toBeInTheDocument();
  });

  it('should call action handler when button is clicked', () => {
    const mockHandler = vi.fn();
    const action = { type: 'retry' as const, label: 'Retry', handler: mockHandler };
    const errorResult: ErrorHandlingResult = {
      message: 'Error message',
      title: 'Error',
      severity: 'error',
      actions: [action],
      shouldLog: true,
      logLevel: 'error',
    };

    render(
      <QuotePriceErrorDisplay
        errorResult={errorResult}
        onActionClick={mockOnActionClick}
      />
    );

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(mockHandler).toHaveBeenCalled();
    expect(mockOnActionClick).toHaveBeenCalledWith(action);
  });

  it('should render context information when available', () => {
    const errorResult: ErrorHandlingResult = {
      message: 'Error message',
      title: 'Error',
      severity: 'error',
      actions: [],
      shouldLog: true,
      logLevel: 'error',
      context: {
        packageId: 'pkg-123',
        requestedNights: 5,
      },
    };

    render(<QuotePriceErrorDisplay errorResult={errorResult} />);

    expect(screen.getByText('Technical details')).toBeInTheDocument();
  });

  it('should apply correct button styling for different action types', () => {
    const errorResult: ErrorHandlingResult = {
      message: 'Error message',
      title: 'Error',
      severity: 'error',
      actions: [
        { type: 'retry', label: 'Retry', handler: vi.fn() },
        { type: 'manual_price', label: 'Manual Price', handler: vi.fn() },
        { type: 'unlink_package', label: 'Unlink', handler: vi.fn() },
        { type: 'dismiss', label: 'Dismiss', handler: vi.fn() },
      ],
      shouldLog: true,
      logLevel: 'error',
    };

    render(<QuotePriceErrorDisplay errorResult={errorResult} />);

    const retryButton = screen.getByText('Retry');
    const manualPriceButton = screen.getByText('Manual Price');
    const unlinkButton = screen.getByText('Unlink');
    const dismissButton = screen.getByText('Dismiss');

    expect(retryButton).toHaveClass('bg-blue-600');
    expect(manualPriceButton).toHaveClass('bg-orange-600');
    expect(unlinkButton).toHaveClass('bg-red-600');
    expect(dismissButton).toHaveClass('bg-gray-200');
  });

  it('should not render action buttons when actions array is empty', () => {
    const errorResult: ErrorHandlingResult = {
      message: 'Error message',
      title: 'Error',
      severity: 'error',
      actions: [],
      shouldLog: true,
      logLevel: 'error',
    };

    const { container } = render(<QuotePriceErrorDisplay errorResult={errorResult} />);
    const buttons = container.querySelectorAll('button');

    expect(buttons).toHaveLength(0);
  });

  it('should have proper accessibility attributes', () => {
    const errorResult: ErrorHandlingResult = {
      message: 'Error message',
      title: 'Error',
      severity: 'error',
      actions: [],
      shouldLog: true,
      logLevel: 'error',
    };

    const { container } = render(<QuotePriceErrorDisplay errorResult={errorResult} />);
    const alertDiv = container.querySelector('[role="alert"]');

    expect(alertDiv).toHaveAttribute('role', 'alert');
    expect(alertDiv).toHaveAttribute('aria-live', 'assertive');
  });
});
