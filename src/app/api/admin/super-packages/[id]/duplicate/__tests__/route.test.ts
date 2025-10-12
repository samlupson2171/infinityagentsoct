import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';

// Mock dependencies
vi.mock('next-auth');
vi.mock('@/lib/mongodb');
vi.mock('@/models/SuperOfferPackage');

const mockGetServerSession = getServerSession as any;
const mockConnectToDatabase = connectToDatabase as any;

describe('POST /api/admin/super-packages/[id]/duplicate', () => {
  const mockAdminSession = {
    user: {
      id: 'admin-user-id',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    },
  };

  const mockOriginalPackage = {
    _id: 'original-package-id',
    name: 'Original Package',
    destination: 'Benidorm',
    resort: 'Test Resort',
    currency: 'EUR',
    groupSizeTiers: [
      { label: '6-11 People', minPeople: 6, maxPeople: 11 },
      { label: '12+ People', minPeople: 12, maxPeople: 999 },
    ],
    durationOptions: [2, 3, 4],
    pricingMatrix: [
      {
        period: 'January',
        periodType: 'month',
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 100 },
          { groupSizeTierIndex: 1, nights: 2, price: 90 },
        ],
      },
    ],
    inclusions: [{ text: 'Airport transfers', category: 'transfer' }],
    accommodationExamples: ['Hotel Example'],
    salesNotes: 'Test sales notes',
    status: 'active',
    version: 5,
    createdBy: 'original-creator-id',
    lastModifiedBy: 'original-modifier-id',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectToDatabase.mockResolvedValue(undefined);
  });

  it('should duplicate a package successfully with default name', async () => {
    mockGetServerSession.mockResolvedValue(mockAdminSession);

    const mockFindById = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockOriginalPackage),
    });
    (SuperOfferPackage.findById as any) = mockFindById;

    const mockSave = vi.fn().mockResolvedValue(undefined);
    const mockPopulate = vi.fn().mockReturnThis();
    const mockDuplicatePackage = {
      _id: 'new-package-id',
      name: 'Original Package (Copy)',
      destination: mockOriginalPackage.destination,
      resort: mockOriginalPackage.resort,
      currency: mockOriginalPackage.currency,
      groupSizeTiers: mockOriginalPackage.groupSizeTiers,
      durationOptions: mockOriginalPackage.durationOptions,
      pricingMatrix: mockOriginalPackage.pricingMatrix,
      inclusions: mockOriginalPackage.inclusions,
      accommodationExamples: mockOriginalPackage.accommodationExamples,
      salesNotes: mockOriginalPackage.salesNotes,
      status: 'inactive',
      version: 1,
      createdBy: mockAdminSession.user.id,
      lastModifiedBy: mockAdminSession.user.id,
      save: mockSave,
      populate: mockPopulate,
    };

    (SuperOfferPackage as any).mockImplementation(() => mockDuplicatePackage);

    const request = new NextRequest(
      'http://localhost:3000/api/admin/super-packages/original-package-id/duplicate',
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    );

    const response = await POST(request, {
      params: { id: 'original-package-id' },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.package.name).toBe('Original Package (Copy)');
    expect(data.package.status).toBe('inactive');
    expect(data.package.version).toBe(1);
    expect(data.message).toBe('Package duplicated successfully');
    expect(mockSave).toHaveBeenCalled();
    expect(mockPopulate).toHaveBeenCalledWith('createdBy', 'name email');
    expect(mockPopulate).toHaveBeenCalledWith('lastModifiedBy', 'name email');
  });

  it('should duplicate a package with custom name', async () => {
    mockGetServerSession.mockResolvedValue(mockAdminSession);

    const mockFindById = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockOriginalPackage),
    });
    (SuperOfferPackage.findById as any) = mockFindById;

    const mockSave = vi.fn().mockResolvedValue(undefined);
    const mockPopulate = vi.fn().mockReturnThis();
    const mockDuplicatePackage = {
      _id: 'new-package-id',
      name: 'Custom Package Name',
      destination: mockOriginalPackage.destination,
      status: 'inactive',
      version: 1,
      save: mockSave,
      populate: mockPopulate,
    };

    (SuperOfferPackage as any).mockImplementation(() => mockDuplicatePackage);

    const request = new NextRequest(
      'http://localhost:3000/api/admin/super-packages/original-package-id/duplicate',
      {
        method: 'POST',
        body: JSON.stringify({ name: 'Custom Package Name' }),
      }
    );

    const response = await POST(request, {
      params: { id: 'original-package-id' },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.package.name).toBe('Custom Package Name');
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/admin/super-packages/original-package-id/duplicate',
      {
        method: 'POST',
      }
    );

    const response = await POST(request, {
      params: { id: 'original-package-id' },
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.message).toBe('Unauthorized');
  });

  it('should return 401 if user is not an admin', async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: 'user-id',
        email: 'user@example.com',
        role: 'user',
      },
    });

    const request = new NextRequest(
      'http://localhost:3000/api/admin/super-packages/original-package-id/duplicate',
      {
        method: 'POST',
      }
    );

    const response = await POST(request, {
      params: { id: 'original-package-id' },
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.message).toBe('Unauthorized');
  });

  it('should return 404 if package not found', async () => {
    mockGetServerSession.mockResolvedValue(mockAdminSession);

    const mockFindById = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });
    (SuperOfferPackage.findById as any) = mockFindById;

    const request = new NextRequest(
      'http://localhost:3000/api/admin/super-packages/non-existent-id/duplicate',
      {
        method: 'POST',
      }
    );

    const response = await POST(request, {
      params: { id: 'non-existent-id' },
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error.message).toBe('Package not found');
  });

  it('should handle database errors gracefully', async () => {
    mockGetServerSession.mockResolvedValue(mockAdminSession);

    const mockFindById = vi.fn().mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error('Database error')),
    });
    (SuperOfferPackage.findById as any) = mockFindById;

    const request = new NextRequest(
      'http://localhost:3000/api/admin/super-packages/original-package-id/duplicate',
      {
        method: 'POST',
      }
    );

    const response = await POST(request, {
      params: { id: 'original-package-id' },
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error.message).toBe('Database error');
  });

  it('should preserve all package data in duplicate', async () => {
    mockGetServerSession.mockResolvedValue(mockAdminSession);

    const mockFindById = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockOriginalPackage),
    });
    (SuperOfferPackage.findById as any) = mockFindById;

    let capturedData: any = null;
    (SuperOfferPackage as any).mockImplementation((data: any) => {
      capturedData = data;
      return {
        _id: 'new-package-id',
        ...data,
        save: vi.fn().mockResolvedValue(undefined),
        populate: vi.fn().mockReturnThis(),
      };
    });

    const request = new NextRequest(
      'http://localhost:3000/api/admin/super-packages/original-package-id/duplicate',
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    );

    await POST(request, { params: { id: 'original-package-id' } });

    expect(capturedData).toMatchObject({
      destination: mockOriginalPackage.destination,
      resort: mockOriginalPackage.resort,
      currency: mockOriginalPackage.currency,
      groupSizeTiers: mockOriginalPackage.groupSizeTiers,
      durationOptions: mockOriginalPackage.durationOptions,
      pricingMatrix: mockOriginalPackage.pricingMatrix,
      inclusions: mockOriginalPackage.inclusions,
      accommodationExamples: mockOriginalPackage.accommodationExamples,
      salesNotes: mockOriginalPackage.salesNotes,
      status: 'inactive',
      version: 1,
      createdBy: mockAdminSession.user.id,
      lastModifiedBy: mockAdminSession.user.id,
      importSource: 'manual',
    });
  });
});
