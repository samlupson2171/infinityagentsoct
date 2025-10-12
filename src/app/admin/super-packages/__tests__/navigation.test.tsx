import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { useSession } from 'next-auth/react';
import SuperPackagesPage from '../page';

// Mock dependencies
vi.mock('next-auth/react');
vi.mock('@/components/auth/ProtectedRoute', () => {
  return {
    default: function MockProtectedRoute({ children }: { children: React.ReactNode }) {
      return <div>{children}</div>;
    },
  };
});
vi.mock('@/components/admin/SuperPackageManager', () => {
  return {
    default: function MockSuperPackageManager() {
      return <div data-testid="super-package-manager">Super Package Manager</div>;
    },
  };
});

describe('SuperPackagesPage Navigation', () => {
  beforeEach(() => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'admin',
        },
      },
      status: 'authenticated',
      update: vi.fn(),
    });
  });

  it('renders the super packages page with proper heading', () => {
    render(<SuperPackagesPage />);
    
    expect(screen.getByText('Super Offer Packages')).toBeInTheDocument();
    expect(screen.getByText('Manage pre-configured destination packages with pricing matrices')).toBeInTheDocument();
  });

  it('renders the SuperPackageManager component', () => {
    render(<SuperPackagesPage />);
    
    expect(screen.getByTestId('super-package-manager')).toBeInTheDocument();
  });

  it('wraps content in ProtectedRoute', () => {
    const { container } = render(<SuperPackagesPage />);
    
    // The component should render without errors when wrapped in ProtectedRoute
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
  });
});
