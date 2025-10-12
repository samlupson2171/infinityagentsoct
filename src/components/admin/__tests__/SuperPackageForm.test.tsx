import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import SuperPackageForm from '../SuperPackageForm';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

describe('SuperPackageForm', () => {
  it('renders form with all sections', () => {
    render(<SuperPackageForm />);
    
    expect(screen.getByText('Create Super Package')).toBeInTheDocument();
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Group Size Tiers')).toBeInTheDocument();
    expect(screen.getByText('Duration Options')).toBeInTheDocument();
    expect(screen.getByText('Inclusions')).toBeInTheDocument();
    expect(screen.getByText('Accommodation Examples')).toBeInTheDocument();
    expect(screen.getByText('Sales Notes')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<SuperPackageForm />);
    
    const submitButton = screen.getByText('Create Package');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fix the validation errors before submitting')).toBeInTheDocument();
    });
  });

  it('shows validation errors on blur', async () => {
    render(<SuperPackageForm />);
    
    const nameInput = screen.getByPlaceholderText('e.g., Benidorm Super Package 2025');
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('Package name is required')).toBeInTheDocument();
    });
  });

  it('allows adding and removing group size tiers', () => {
    render(<SuperPackageForm />);
    
    const addTierButton = screen.getByText('+ Add Tier');
    fireEvent.click(addTierButton);

    const tierInputs = screen.getAllByPlaceholderText('e.g., 6-11 People');
    expect(tierInputs.length).toBe(3); // 2 default + 1 added
  });

  it('allows adding and removing duration options', () => {
    render(<SuperPackageForm />);
    
    const addDurationButton = screen.getByText('+ Add Duration');
    fireEvent.click(addDurationButton);

    const nightsLabels = screen.getAllByText('nights');
    expect(nightsLabels.length).toBe(4); // 3 default + 1 added
  });

  it('allows adding inclusions', () => {
    render(<SuperPackageForm />);
    
    const addInclusionButton = screen.getByText('+ Add Inclusion');
    fireEvent.click(addInclusionButton);

    expect(screen.getByPlaceholderText('e.g., Return airport transfers')).toBeInTheDocument();
  });

  it('allows adding accommodation examples', () => {
    render(<SuperPackageForm />);
    
    const addAccommodationButton = screen.getByText('+ Add Example');
    fireEvent.click(addAccommodationButton);

    expect(screen.getByPlaceholderText('e.g., Hotel Servigroup Pueblo Benidorm')).toBeInTheDocument();
  });

  it('populates form when editing', () => {
    const mockPackage = {
      _id: '123',
      name: 'Test Package',
      destination: 'Benidorm',
      resort: 'Costa Blanca',
      currency: 'EUR' as const,
      status: 'active' as const,
      groupSizeTiers: [
        { label: '6-11 People', minPeople: 6, maxPeople: 11 },
      ],
      durationOptions: [2, 3],
      inclusions: [{ text: 'Airport transfers', category: 'transfer' as const }],
      accommodationExamples: ['Hotel Example'],
      salesNotes: 'Test notes',
    };

    render(<SuperPackageForm package={mockPackage} isEditing />);
    
    expect(screen.getByText('Edit Super Package')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Package')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Benidorm')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Costa Blanca')).toBeInTheDocument();
  });
});
