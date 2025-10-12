import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';
import Quote from '@/models/Quote';

// Mock dependencies
vi.mock('next-auth');
vi.mock('@/lib/mongodb');
vi.mock('@/models/SuperOfferPackage');
vi.mock('@/models/Quote');

const mockGetServerSession = getServerSession as Mock;
const mockDbConnect = dbConnect as Mock;

describe('/api/admin/super-packages/statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/statistics'
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.message).toBe('Unauthorized');
    });

    it('should return 401 if user is not an admin', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user123', role: 'agent' },
      } as any);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/statistics'
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.message).toBe('Unauthorized');
    });

    it('should return package statistics for admin users', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin123', role: 'admin' },
      } as any);
      mockDbConnect.mockResolvedValue(undefined);

      const mockPackages = [
        {
          _id: 'pkg1',
          name: 'Benidorm Package',
          destination: 'Benidorm',
          resort: 'Resort A',
          status: 'active',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-20'),
        },
        {
          _id: 'pkg2',
          name: 'Albufeira Package',
          destination: 'Albufeira',
          resort: 'Resort B',
          status: 'active',
          createdAt: new Date('2024-02-10'),
          updatedAt: new Date('2024-02-10'),
        },
        {
          _id: 'pkg3',
          name: 'Benidorm Package 2',
          destination: 'Benidorm',
          resort: 'Resort C',
          status: 'inactive',
          createdAt: new Date('2024-03-05'),
          updatedAt: new Date('2024-03-05'),
        },
      ];

      const mockQuoteCounts = [
        {
          _id: 'pkg1',
          count: 5,
          lastUsed: new Date('2024-03-01'),
        },
        {
          _id: 'pkg2',
          count: 3,
          lastUsed: new Date('2024-02-25'),
        },
      ];

      const mockCreationTimeline = [
        { _id: { year: 2024, month: 1 }, created: 1 },
        { _id: { year: 2024, month: 2 }, created: 1 },
        { _id: { year: 2024, month: 3 }, created: 1 },
      ];

      const mockUpdateTimeline = [
        { _id: { year: 2024, month: 2 }, updated: 1 },
      ];

      (SuperOfferPackage.find as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockPackages),
        }),
      });

      (Quote.aggregate as Mock)
        .mockResolvedValueOnce(mockQuoteCounts)
        .mockResolvedValueOnce(mockCreationTimeline)
        .mockResolvedValueOnce(mockUpdateTimeline);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/statistics'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.statistics).toBeDefined();
      expect(data.statistics.overview).toBeDefined();
      expect(data.statistics.overview.totalPackages).toBe(3);
      expect(data.statistics.overview.activePackages).toBe(2);
      expect(data.statistics.overview.inactivePackages).toBe(1);
      expect(data.statistics.overview.totalLinkedQuotes).toBe(8);
      expect(data.statistics.overview.packagesWithQuotes).toBe(2);
      expect(data.statistics.overview.unusedPackages).toBe(1);
    });

    it('should return most used packages sorted by usage', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin123', role: 'admin' },
      } as any);
      mockDbConnect.mockResolvedValue(undefined);

      const pkg1Id = { toString: () => 'pkg1' };
      const pkg2Id = { toString: () => 'pkg2' };

      const mockPackages = [
        {
          _id: pkg1Id,
          name: 'Package 1',
          destination: 'Dest 1',
          resort: 'Resort 1',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: pkg2Id,
          name: 'Package 2',
          destination: 'Dest 2',
          resort: 'Resort 2',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuoteCounts = [
        { _id: pkg1Id, count: 10, lastUsed: new Date() },
        { _id: pkg2Id, count: 5, lastUsed: new Date() },
      ];

      (SuperOfferPackage.find as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockPackages),
        }),
      });

      (Quote.aggregate as Mock)
        .mockResolvedValueOnce(mockQuoteCounts)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/statistics'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.statistics.mostUsedPackages).toHaveLength(2);
      // The packages should be sorted by usage (most used first)
      expect(data.statistics.mostUsedPackages[0].linkedQuotesCount).toBeGreaterThanOrEqual(
        data.statistics.mostUsedPackages[1].linkedQuotesCount
      );
    });

    it('should return destination-based counts', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin123', role: 'admin' },
      } as any);
      mockDbConnect.mockResolvedValue(undefined);

      const mockPackages = [
        {
          _id: 'pkg1',
          name: 'Package 1',
          destination: 'Benidorm',
          resort: 'Resort 1',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: 'pkg2',
          name: 'Package 2',
          destination: 'Benidorm',
          resort: 'Resort 2',
          status: 'inactive',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: 'pkg3',
          name: 'Package 3',
          destination: 'Albufeira',
          resort: 'Resort 3',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (SuperOfferPackage.find as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockPackages),
        }),
      });

      (Quote.aggregate as Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/statistics'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.statistics.destinationCounts).toBeDefined();
      expect(data.statistics.destinationCounts['Benidorm']).toEqual({
        total: 2,
        active: 1,
        inactive: 1,
      });
      expect(data.statistics.destinationCounts['Albufeira']).toEqual({
        total: 1,
        active: 1,
        inactive: 0,
      });
    });

    it('should handle errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin123', role: 'admin' },
      } as any);
      mockDbConnect.mockResolvedValue(undefined);

      (SuperOfferPackage.find as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/statistics'
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error.message).toBe('Failed to fetch package statistics');
    });
  });
});
