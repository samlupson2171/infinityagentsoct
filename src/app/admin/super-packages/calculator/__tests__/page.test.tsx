import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PackageCalculatorPage from '../page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock PackagePriceCalculator component
vi.mock('@/components/admin/PackagePriceCalculator', () => ({
  default: function MockPackagePriceCalculator() {
    return <div data-testid="package-price-calculator">Package Price Calculator Component</div>;
  },
}));

describe('PackageCalculatorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page with title and description', () => {
    render(<PackageCalculatorPage />);

    expect(screen.getByText('Package Price Calculator')).toBeInTheDocument();
    expect(
      screen.getByText(/Test price calculations for super offer packages/i)
    ).toBeInTheDocument();
  });

  it('should render the PackagePriceCalculator component', () => {
    render(<PackageCalculatorPage />);

    expect(screen.getByTestId('package-price-calculator')).toBeInTheDocument();
  });

  it('should have a back button that navigates to packages list', () => {
    render(<PackageCalculatorPage />);

    const backButton = screen.getByText('Back to Packages');
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/admin/super-packages');
  });

  it('should display help section with instructions', () => {
    render(<PackageCalculatorPage />);

    expect(screen.getByText('How to Use')).toBeInTheDocument();
    expect(screen.getByText(/Select a super offer package from the dropdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Review the package details and available options/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter the number of people/i)).toBeInTheDocument();
    expect(screen.getByText(/Click "Calculate Price"/i)).toBeInTheDocument();
  });

  it('should display note about testing purposes', () => {
    render(<PackageCalculatorPage />);

    expect(
      screen.getByText(/This calculator is for testing and preview purposes only/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/To create an actual quote with a package/i)
    ).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = render(<PackageCalculatorPage />);

    // Check for main container classes
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
    expect(container.querySelector('.bg-gray-50')).toBeInTheDocument();
  });
});
