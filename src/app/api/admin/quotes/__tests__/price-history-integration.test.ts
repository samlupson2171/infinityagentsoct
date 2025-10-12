import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies at the top level
vi.mock('next-auth/jwt');
vi.mock('@/lib/mongodb');
vi.mock('@/models/Quote');
vi.mock('@/models/Enquiry');
vi.mock('@/lib/middleware/quote-auth-middleware');
vi.mock('@/lib/validation/quote-server-validation');
vi.mock('@/lib/audit/quote-audit-logger');

describe('Quote API - Price History Integration', () => {
  const mockToken = {
    sub: '507f1f77bcf86cd799439011',
    role: 'admin',
    email: 'admin@test.com',
  };

  const mockEnquiry = {
    _id: '507f1f77bcf86cd799439012',
    leadName: 'John Doe',
    agentEmail: 'agent@test.com',
    resort: 'Benidorm',
    quotes: [],
    save: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { getToken } = await import('next-auth/jwt');
    const { connectDB } = await import('@/lib/mongodb');
    
    (getToken as any).mockResolvedValue(mockToken);
    (connectDB as any).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/admin/quotes - Create with linkedPackage', () => {
    it('should create quote with linkedPackage and initialize price history', async () => {
      const { default: Quote } = await import('@/models/Quote');
      const { default: Enquiry } = await import('@/models/Enquiry');
      const { POST } = await import('../route');

      const mockQuote = {
        _id: '507f1f77bcf86cd799439013',
        enquiryId: mockEnquiry._id,
        leadName: 'John Doe',
        totalPrice: 1500,
        linkedPackage: {
          packageId: '507f1f77bcf86cd799439014',
          packageName: 'Benidorm Super Package',
          packageVersion: 1,
          selectedTier: { tierIndex: 0, tierLabel: '10-15 people' },
          selectedNights: 3,
          selectedPeriod: 'Peak Season',
          calculatedPrice: 1500,
          priceWasOnRequest: false,
          customPriceApplied: false,
        },
        priceHistory: [
          {
            price: 1500,
            reason: 'package_selection',
            timestamp: new Date(),
            userId: mockToken.sub,
          },
        ],
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockReturnThis(),
      };

      (Enquiry.findById as any).mockResolvedValue(mockEnquiry);
      (Quote as any).mockImplementation(() => mockQuote);

      const requestBody = {
        enquiryId: mockEnquiry._id,
        leadName: 'John Doe',
        hotelName: 'Test Hotel',
        numberOfPeople: 12,
        numberOfRooms: 6,
        numberOfNights: 3,
        arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isSuperPackage: true,
        whatsIncluded: 'Accommodation, breakfast, activities',
        transferIncluded: true,
        totalPrice: 1500,
        currency: 'GBP',
        linkedPackage: {
          packageId: '507f1f77bcf86cd799439014',
          packageName: 'Benidorm Super Package',
          packageVersion: 1,
          selectedTier: { tierIndex: 0, tierLabel: '10-15 people' },
          selectedNights: 3,
          selectedPeriod: 'Peak Season',
          calculatedPrice: 1500,
          priceWasOnRequest: false,
        },
      };

      const request = new NextRequest('http://localhost:3000/api/admin/quotes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(mockQuote.save).toHaveBeenCalled();
      expect(mockEnquiry.save).toHaveBeenCalled();
    });

    it('should handle customPriceApplied flag correctly', async () => {
      const { default: Quote } = await import('@/models/Quote');
      const { default: Enquiry } = await import('@/models/Enquiry');
      const { POST } = await import('../route');

      const mockQuote = {
        _id: '507f1f77bcf86cd799439013',
        linkedPackage: {
          packageId: '507f1f77bcf86cd799439014',
          calculatedPrice: 1500,
          customPriceApplied: true,
        },
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockReturnThis(),
      };

      (Enquiry.findById as any).mockResolvedValue(mockEnquiry);
      (Quote as any).mockImplementation(() => mockQuote);

      const requestBody = {
        enquiryId: mockEnquiry._id,
        leadName: 'John Doe',
        hotelName: 'Test Hotel',
        numberOfPeople: 12,
        numberOfRooms: 6,
        numberOfNights: 3,
        arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isSuperPackage: true,
        whatsIncluded: 'Accommodation, breakfast, activities',
        transferIncluded: true,
        totalPrice: 1600, // Different from calculated price
        currency: 'GBP',
        linkedPackage: {
          packageId: '507f1f77bcf86cd799439014',
          packageName: 'Benidorm Super Package',
          packageVersion: 1,
          selectedTier: { tierIndex: 0, tierLabel: '10-15 people' },
          selectedNights: 3,
          selectedPeriod: 'Peak Season',
          calculatedPrice: 1500,
          priceWasOnRequest: false,
          customPriceApplied: true,
        },
      };

      const request = new NextRequest('http://localhost:3000/api/admin/quotes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should handle ON_REQUEST pricing correctly', async () => {
      const { default: Quote } = await import('@/models/Quote');
      const { default: Enquiry } = await import('@/models/Enquiry');
      const { POST } = await import('../route');

      const mockQuote = {
        _id: '507f1f77bcf86cd799439013',
        linkedPackage: {
          calculatedPrice: 'ON_REQUEST',
          priceWasOnRequest: true,
        },
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockReturnThis(),
      };

      (Enquiry.findById as any).mockResolvedValue(mockEnquiry);
      (Quote as any).mockImplementation(() => mockQuote);

      const requestBody = {
        enquiryId: mockEnquiry._id,
        leadName: 'John Doe',
        hotelName: 'Test Hotel',
        numberOfPeople: 12,
        numberOfRooms: 6,
        numberOfNights: 3,
        arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isSuperPackage: true,
        whatsIncluded: 'Accommodation, breakfast, activities',
        transferIncluded: true,
        totalPrice: 1500,
        currency: 'GBP',
        linkedPackage: {
          packageId: '507f1f77bcf86cd799439014',
          packageName: 'Benidorm Super Package',
          packageVersion: 1,
          selectedTier: { tierIndex: 0, tierLabel: '10-15 people' },
          selectedNights: 3,
          selectedPeriod: 'Peak Season',
          calculatedPrice: 'ON_REQUEST',
          priceWasOnRequest: true,
        },
      };

      const request = new NextRequest('http://localhost:3000/api/admin/quotes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should create quote without linkedPackage (backward compatibility)', async () => {
      const { default: Quote } = await import('@/models/Quote');
      const { default: Enquiry } = await import('@/models/Enquiry');
      const { POST } = await import('../route');

      const mockQuote = {
        _id: '507f1f77bcf86cd799439013',
        enquiryId: mockEnquiry._id,
        leadName: 'John Doe',
        totalPrice: 1500,
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockReturnThis(),
      };

      (Enquiry.findById as any).mockResolvedValue(mockEnquiry);
      (Quote as any).mockImplementation(() => mockQuote);

      const requestBody = {
        enquiryId: mockEnquiry._id,
        leadName: 'John Doe',
        hotelName: 'Test Hotel',
        numberOfPeople: 12,
        numberOfRooms: 6,
        numberOfNights: 3,
        arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isSuperPackage: false,
        whatsIncluded: 'Accommodation, breakfast, activities',
        transferIncluded: true,
        totalPrice: 1500,
        currency: 'GBP',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/quotes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should reject invalid linkedPackage data', async () => {
      const { POST } = await import('../route');

      const requestBody = {
        enquiryId: mockEnquiry._id,
        leadName: 'John Doe',
        hotelName: 'Test Hotel',
        numberOfPeople: 12,
        numberOfRooms: 6,
        numberOfNights: 3,
        arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isSuperPackage: true,
        whatsIncluded: 'Accommodation, breakfast, activities',
        transferIncluded: true,
        totalPrice: 1500,
        currency: 'GBP',
        linkedPackage: {
          packageId: '', // Invalid: empty string
          packageName: 'Benidorm Super Package',
          packageVersion: 1,
        },
      };

      const request = new NextRequest('http://localhost:3000/api/admin/quotes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Validation Edge Cases', () => {
    it('should reject invalid priceHistory entries', async () => {
      const { POST } = await import('../route');

      const requestBody = {
        enquiryId: mockEnquiry._id,
        leadName: 'John Doe',
        hotelName: 'Test Hotel',
        numberOfPeople: 12,
        numberOfRooms: 6,
        numberOfNights: 3,
        arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isSuperPackage: true,
        whatsIncluded: 'Accommodation, breakfast, activities',
        transferIncluded: true,
        totalPrice: 1500,
        currency: 'GBP',
        priceHistory: [
          {
            price: -100, // Invalid: negative price
            reason: 'manual_override',
            userId: mockToken.sub,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/admin/quotes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid reason in priceHistory', async () => {
      const { POST } = await import('../route');

      const requestBody = {
        enquiryId: mockEnquiry._id,
        leadName: 'John Doe',
        hotelName: 'Test Hotel',
        numberOfPeople: 12,
        numberOfRooms: 6,
        numberOfNights: 3,
        arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isSuperPackage: true,
        whatsIncluded: 'Accommodation, breakfast, activities',
        transferIncluded: true,
        totalPrice: 1500,
        currency: 'GBP',
        priceHistory: [
          {
            price: 1500,
            reason: 'invalid_reason', // Invalid reason
            userId: mockToken.sub,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/admin/quotes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
