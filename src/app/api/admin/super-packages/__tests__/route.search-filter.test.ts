import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock('@/models/SuperOfferPackage', () => ({
  default: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

import { getServerSession } from 'next-auth';
import SuperOfferPackage from '@/models/SuperOfferPackage';

describe('GET /api/admin/super-packages - Search and Filtering', () => {
  const mockSession = {
    user: {
      id: 'user123',
      role: 'admin',
      email: 'admin@test.com',
    },
  };

  const mockPackages = [
    {
      _id: '1',
      name: 'Benidorm Beach Package',
      destination: 'Benidorm',
      resort: 'Beach Resort',
      status: 'active',
    },
    {
      _id: '2',
      name: 'Albufeira Adventure',
      destination: 'Albufeira',
      resort: 'Mountain Resort',
      status: 'inactive',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession);
  });

  it('should filter by search term using regex', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([mockPackages[0]]),
    });

    (SuperOfferPackage.find as any) = mockFind;
    (SuperOfferPackage.countDocuments as any) = vi.fn().mockResolvedValue(1);

    const url = new URL('http://localhost/api/admin/super-packages?search=Beach');
    const request = new NextRequest(url);

    await GET(request);

    // Verify the query includes regex search
    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.arrayContaining([
          { name: { $regex: 'Beach', $options: 'i' } },
          { destination: { $regex: 'Beach', $options: 'i' } },
          { resort: { $regex: 'Beach', $options: 'i' } },
        ]),
      })
    );
  });

  it('should filter by status', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([mockPackages[0]]),
    });

    (SuperOfferPackage.find as any) = mockFind;
    (SuperOfferPackage.countDocuments as any) = vi.fn().mockResolvedValue(1);

    const url = new URL('http://localhost/api/admin/super-packages?status=active');
    const request = new NextRequest(url);

    await GET(request);

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'active',
      })
    );
  });

  it('should filter by destination', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([mockPackages[0]]),
    });

    (SuperOfferPackage.find as any) = mockFind;
    (SuperOfferPackage.countDocuments as any) = vi.fn().mockResolvedValue(1);

    const url = new URL('http://localhost/api/admin/super-packages?destination=Benidorm');
    const request = new NextRequest(url);

    await GET(request);

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: 'Benidorm',
      })
    );
  });

  it('should filter by resort', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([mockPackages[0]]),
    });

    (SuperOfferPackage.find as any) = mockFind;
    (SuperOfferPackage.countDocuments as any) = vi.fn().mockResolvedValue(1);

    const url = new URL('http://localhost/api/admin/super-packages?resort=Beach%20Resort');
    const request = new NextRequest(url);

    await GET(request);

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        resort: 'Beach Resort',
      })
    );
  });

  it('should combine multiple filters', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([mockPackages[0]]),
    });

    (SuperOfferPackage.find as any) = mockFind;
    (SuperOfferPackage.countDocuments as any) = vi.fn().mockResolvedValue(1);

    const url = new URL(
      'http://localhost/api/admin/super-packages?search=Beach&status=active&destination=Benidorm&resort=Beach%20Resort'
    );
    const request = new NextRequest(url);

    await GET(request);

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'active',
        destination: 'Benidorm',
        resort: 'Beach Resort',
        $or: expect.arrayContaining([
          { name: { $regex: 'Beach', $options: 'i' } },
          { destination: { $regex: 'Beach', $options: 'i' } },
          { resort: { $regex: 'Beach', $options: 'i' } },
        ]),
      })
    );
  });

  it('should not filter when status is "all"', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockPackages),
    });

    (SuperOfferPackage.find as any) = mockFind;
    (SuperOfferPackage.countDocuments as any) = vi.fn().mockResolvedValue(2);

    const url = new URL('http://localhost/api/admin/super-packages?status=all');
    const request = new NextRequest(url);

    await GET(request);

    // Should not include status in query when it's "all"
    expect(mockFind).toHaveBeenCalledWith(
      expect.not.objectContaining({
        status: expect.anything(),
      })
    );
  });

  it('should handle pagination with filters', async () => {
    const mockFind = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([mockPackages[0]]),
    });

    (SuperOfferPackage.find as any) = mockFind;
    (SuperOfferPackage.countDocuments as any) = vi.fn().mockResolvedValue(1);

    const url = new URL(
      'http://localhost/api/admin/super-packages?page=2&limit=10&search=Beach'
    );
    const request = new NextRequest(url);

    const response = await GET(request);
    const data = await response.json();

    expect(data.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasMore: false,
    });
  });
});
