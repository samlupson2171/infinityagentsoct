import { GET } from '../route';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';
import { NextRequest } from 'next/server';
import { vi } from 'vitest';

vi.mock('next-auth');
vi.mock('@/lib/mongodb');
vi.mock('@/models/SuperOfferPackage');

describe('GET /api/admin/super-packages/export', () => {
  const mockSession = {
    user: {
      id: 'admin-id',
      email: 'admin@test.com',
      role: 'admin',
    },
  };

  const mockPackage = {
    _id: 'pkg-1',
    name: 'Test Package',
    destination: 'Benidorm',
    resort: 'Costa Blanca',
    currency: 'EUR',
    groupSizeTiers: [
      { label: '6-11 People', minPeople: 6, maxPeople: 11 },
    ],
    durationOptions: [2, 3],
    pricingMatrix: [
      {
        period: 'January',
        periodType: 'month',
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 150 },
          { groupSizeTierIndex: 0, nights: 3, price: 200 },
        ],
      },
    ],
    inclusions: [{ text: 'Airport transfers', category: 'transfer' }],
    accommodationExamples: ['Hotel Test'],
    salesNotes: 'Test notes',
    status: 'active',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
    vi.mocked(connectDB).mockResolvedValue(undefined);
  });

  it('should require authentication', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/admin/super-packages/export');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should require admin role', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { role: 'user' },
    } as any);

    const request = new NextRequest('http://localhost/api/admin/super-packages/export');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should export a single package by ID', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockPackage]),
      }),
    });
    SuperOfferPackage.find = mockFind as any;

    const request = new NextRequest(
      'http://localhost/api/admin/super-packages/export?ids=pkg-1'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
    expect(response.headers.get('Content-Disposition')).toContain('attachment');
    expect(response.headers.get('Content-Disposition')).toContain('.csv');

    const csvContent = await response.text();
    expect(csvContent).toContain('Test Package');
    expect(csvContent).toContain('Benidorm');
  });

  it('should export multiple packages by IDs', async () => {
    const mockPackage2 = { ...mockPackage, _id: 'pkg-2', name: 'Test Package 2' };
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockPackage, mockPackage2]),
      }),
    });
    SuperOfferPackage.find = mockFind as any;

    const request = new NextRequest(
      'http://localhost/api/admin/super-packages/export?ids=pkg-1,pkg-2'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const csvContent = await response.text();
    expect(csvContent).toContain('Test Package');
    expect(csvContent).toContain('Test Package 2');
  });

  it('should export all packages when no IDs provided', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockPackage]),
      }),
    });
    SuperOfferPackage.find = mockFind as any;

    const request = new NextRequest('http://localhost/api/admin/super-packages/export');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockFind).toHaveBeenCalledWith({ status: { $ne: 'deleted' } });
  });

  it('should filter by destination', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockPackage]),
      }),
    });
    SuperOfferPackage.find = mockFind as any;

    const request = new NextRequest(
      'http://localhost/api/admin/super-packages/export?destination=Benidorm'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockFind).toHaveBeenCalledWith({
      destination: 'Benidorm',
      status: { $ne: 'deleted' },
    });
  });

  it('should filter by status', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockPackage]),
      }),
    });
    SuperOfferPackage.find = mockFind as any;

    const request = new NextRequest(
      'http://localhost/api/admin/super-packages/export?status=active'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockFind).toHaveBeenCalledWith({ status: 'active' });
  });

  it('should return 404 when no packages found', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      }),
    });
    SuperOfferPackage.find = mockFind as any;

    const request = new NextRequest('http://localhost/api/admin/super-packages/export');
    const response = await GET(request);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('No packages found to export');
  });

  it('should handle errors gracefully', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error('Database error')),
      }),
    });
    SuperOfferPackage.find = mockFind as any;

    const request = new NextRequest('http://localhost/api/admin/super-packages/export');
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to export packages');
  });
});
