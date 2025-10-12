import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../route';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import SuperOfferPackage from '@/models/SuperOfferPackage';
import Quote from '@/models/Quote';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('next-auth');
vi.mock('@/lib/mongodb');
vi.mock('@/models/SuperOfferPackage');
vi.mock('@/models/Quote');

const mockGetServerSession = vi.mocked(getServerSession);
const mockConnectToDatabase = vi.mocked(connectToDatabase);

describe('/api/admin/super-packages/[id]/check-deletion', () => {
  const mockAdminSession = {
    user: { id: 'admin123', role: 'admin', email: 'admin@test.com' },
  };

  const mockPackage = {
    _id: 'package123',
    name: 'Test Package',
    destination: 'Benidorm',
    resort: 'Test Resort',
    status: 'active',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectToDatabase.mockResolvedValue(undefined as any);
  });

  describe('Authorization', () => {
    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/package123/check-deletion'
      );
      const response = await GET(request, { params: { id: 'package123' } });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 if not admin', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user123', role: 'agent', email: 'agent@test.com' },
      } as any);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/package123/check-deletion'
      );
      const response = await GET(request, { params: { id: 'package123' } });

      expect(response.status).toBe(401);
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockAdminSession as any);
    });

    it('should return 400 for invalid package ID', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/invalid-id/check-deletion'
      );
      const response = await GET(request, { params: { id: 'invalid-id' } });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid package ID');
    });

    it('should return 404 if package not found', async () => {
      vi.mocked(SuperOfferPackage.findById).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/507f1f77bcf86cd799439011/check-deletion'
      );
      const response = await GET(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Package not found');
    });
  });

  describe('Deletion Check - No Linked Quotes', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockAdminSession as any);
      vi.mocked(SuperOfferPackage.findById).mockResolvedValue(mockPackage as any);
    });

    it('should indicate hard delete is possible when no quotes linked', async () => {
      vi.mocked(Quote.countDocuments).mockResolvedValue(0 as any);
      vi.mocked(Quote.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.mocked(Quote.aggregate).mockResolvedValue([] as any);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/507f1f77bcf86cd799439011/check-deletion'
      );
      const response = await GET(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.canHardDelete).toBe(true);
      expect(data.linkedQuotesCount).toBe(0);
      expect(data.linkedQuotes).toEqual([]);
    });
  });

  describe('Deletion Check - With Linked Quotes', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockAdminSession as any);
      vi.mocked(SuperOfferPackage.findById).mockResolvedValue(mockPackage as any);
    });

    it('should indicate soft delete required when quotes are linked', async () => {
      const mockQuotes = [
        {
          quoteNumber: 'Q-001',
          destination: 'Benidorm',
          customerName: 'John Doe',
          createdAt: new Date('2025-01-01'),
          status: 'sent',
        },
        {
          quoteNumber: 'Q-002',
          destination: 'Benidorm',
          customerName: 'Jane Smith',
          createdAt: new Date('2025-01-02'),
          status: 'draft',
        },
      ];

      vi.mocked(Quote.countDocuments).mockResolvedValue(2 as any);
      vi.mocked(Quote.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockQuotes),
      } as any);
      vi.mocked(Quote.aggregate).mockResolvedValue([
        { _id: 'sent', count: 1 },
        { _id: 'draft', count: 1 },
      ] as any);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/507f1f77bcf86cd799439011/check-deletion'
      );
      const response = await GET(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.canHardDelete).toBe(false);
      expect(data.linkedQuotesCount).toBe(2);
      expect(data.linkedQuotes).toHaveLength(2);
      expect(data.linkedQuotes[0].quoteNumber).toBe('Q-001');
      expect(data.statusBreakdown).toEqual({
        sent: 1,
        draft: 1,
      });
    });

    it('should limit linked quotes to 10 in response', async () => {
      const mockQuotes = Array.from({ length: 15 }, (_, i) => ({
        quoteNumber: `Q-${String(i + 1).padStart(3, '0')}`,
        destination: 'Benidorm',
        customerName: `Customer ${i + 1}`,
        createdAt: new Date(),
        status: 'sent',
      }));

      vi.mocked(Quote.countDocuments).mockResolvedValue(15 as any);
      vi.mocked(Quote.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockQuotes.slice(0, 10)),
      } as any);
      vi.mocked(Quote.aggregate).mockResolvedValue([
        { _id: 'sent', count: 15 },
      ] as any);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/507f1f77bcf86cd799439011/check-deletion'
      );
      const response = await GET(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.linkedQuotesCount).toBe(15);
      expect(data.linkedQuotes).toHaveLength(10);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockAdminSession as any);
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(SuperOfferPackage.findById).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/admin/super-packages/507f1f77bcf86cd799439011/check-deletion'
      );
      const response = await GET(request, {
        params: { id: '507f1f77bcf86cd799439011' },
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to check package deletion status');
    });
  });
});
