import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth-middleware', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock('@/models/Event', () => ({
  default: {
    find: vi.fn(),
  },
}));

import { requireAdmin } from '@/lib/auth-middleware';
import Event from '@/models/Event';

describe('POST /api/admin/quotes/calculate-events-price', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation', () => {
    it('should require eventIds array', async () => {
      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate eventIds is an array', async () => {
      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({ eventIds: 'not-an-array' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle empty eventIds array', async () => {
      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({ eventIds: [] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.events).toEqual([]);
      expect(data.data.total).toBe(0);
    });

    it('should enforce maximum events limit', async () => {
      const tooManyEvents = Array.from({ length: 21 }, (_, i) => `event${i}`);
      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({ eventIds: tooManyEvents }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Maximum 20 events');
    });

    it('should validate ObjectId format', async () => {
      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({ eventIds: ['invalid-id'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Invalid event IDs');
    });
  });

  describe('Price Calculation', () => {
    it('should calculate total price for events', async () => {
      const mockEvents = [
        {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          name: 'Jet Skiing',
          isActive: true,
          pricing: { estimatedCost: 50, currency: 'GBP' },
        },
        {
          _id: { toString: () => '507f1f77bcf86cd799439012' },
          name: 'Parasailing',
          isActive: true,
          pricing: { estimatedCost: 75, currency: 'GBP' },
        },
      ];

      (Event.find as any).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockEvents),
      });

      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({
          eventIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.total).toBe(125);
      expect(data.data.currency).toBe('GBP');
      expect(data.data.events).toHaveLength(2);
    });

    it('should handle events with zero price', async () => {
      const mockEvents = [
        {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          name: 'Free Event',
          isActive: true,
          pricing: { estimatedCost: 0, currency: 'GBP' },
        },
      ];

      (Event.find as any).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockEvents),
      });

      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({ eventIds: ['507f1f77bcf86cd799439011'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.total).toBe(0);
    });

    it('should handle events without pricing', async () => {
      const mockEvents = [
        {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          name: 'Event Without Price',
          isActive: true,
          pricing: null,
        },
      ];

      (Event.find as any).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockEvents),
      });

      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({ eventIds: ['507f1f77bcf86cd799439011'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.events[0].price).toBe(0);
      expect(data.data.warnings).toBeDefined();
      expect(data.data.warnings.length).toBeGreaterThan(0);
      expect(data.data.warnings[0]).toContain('does not have pricing information');
    });
  });

  describe('Currency Handling', () => {
    it('should warn about currency mismatch', async () => {
      const mockEvents = [
        {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          name: 'GBP Event',
          isActive: true,
          pricing: { estimatedCost: 50, currency: 'GBP' },
        },
        {
          _id: { toString: () => '507f1f77bcf86cd799439012' },
          name: 'EUR Event',
          isActive: true,
          pricing: { estimatedCost: 75, currency: 'EUR' },
        },
      ];

      (Event.find as any).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockEvents),
      });

      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({
          eventIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.warnings).toBeDefined();
      expect(data.data.warnings.length).toBeGreaterThan(0);
      const hasCurrencyWarning = data.data.warnings.some((w: string) => 
        w.includes('uses EUR') && w.includes('GBP')
      );
      expect(hasCurrencyWarning).toBe(true);
    });

    it('should only sum events with matching currency', async () => {
      const mockEvents = [
        {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          name: 'GBP Event',
          isActive: true,
          pricing: { estimatedCost: 50, currency: 'GBP' },
        },
        {
          _id: { toString: () => '507f1f77bcf86cd799439012' },
          name: 'EUR Event',
          isActive: true,
          pricing: { estimatedCost: 75, currency: 'EUR' },
        },
      ];

      (Event.find as any).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockEvents),
      });

      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({
          eventIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.total).toBe(50); // Only GBP event
      expect(data.data.currency).toBe('GBP');
    });
  });

  describe('Edge Cases', () => {
    it('should warn about inactive events', async () => {
      const mockEvents = [
        {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          name: 'Inactive Event',
          isActive: false,
          pricing: { estimatedCost: 50, currency: 'GBP' },
        },
      ];

      (Event.find as any).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockEvents),
      });

      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({ eventIds: ['507f1f77bcf86cd799439011'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.warnings).toBeDefined();
      expect(data.data.warnings.length).toBeGreaterThan(0);
      expect(data.data.warnings[0]).toContain('is currently inactive');
    });

    it('should return 404 for missing events', async () => {
      (Event.find as any).mockReturnValue({
        select: vi.fn().mockResolvedValue([]),
      });

      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({ eventIds: ['507f1f77bcf86cd799439011'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EVENTS_NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (Event.find as any).mockReturnValue({
        select: vi.fn().mockRejectedValue(new Error('Database error')),
      });

      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({ eventIds: ['507f1f77bcf86cd799439011'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
    });

    it('should handle authentication errors', async () => {
      (requireAdmin as any).mockRejectedValue({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });

      const request = new NextRequest('http://localhost/api/admin/quotes/calculate-events-price', {
        method: 'POST',
        body: JSON.stringify({ eventIds: ['507f1f77bcf86cd799439011'] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });
});
