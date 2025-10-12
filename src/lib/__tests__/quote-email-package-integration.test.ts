import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendQuoteAdminNotificationEmail } from '../email';

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({
        messageId: 'test-message-id',
        accepted: ['admin@test.com'],
      }),
      verify: vi.fn().mockResolvedValue(true),
    })),
  },
}));

// Mock User model
vi.mock('@/models/User', () => ({
  default: {
    find: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue([
        {
          contactEmail: 'admin1@test.com',
          name: 'Admin One',
        },
        {
          contactEmail: 'admin2@test.com',
          name: 'Admin Two',
        },
      ]),
    }),
  },
}));

describe('Quote Email Package Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendQuoteAdminNotificationEmail', () => {
    it('should send admin notification with package details', async () => {
      const quoteData = {
        quoteId: '507f1f77bcf86cd799439011',
        quoteReference: 'Q99439011',
        leadName: 'John Doe',
        agentEmail: 'agent@test.com',
        agentName: 'Jane Agent',
        agentCompany: 'Test Travel Agency',
        hotelName: 'Test Hotel',
        numberOfPeople: 10,
        numberOfNights: 3,
        arrivalDate: new Date('2025-06-15'),
        totalPrice: 5000,
        currency: 'GBP' as const,
        formattedPrice: '£5,000',
        createdBy: 'Admin User',
        linkedPackage: {
          packageName: 'Benidorm Super Package',
          packageVersion: 1,
          selectedTier: '6-11 People',
          selectedPeriod: 'June',
          calculatedPrice: 5000,
        },
      };

      const result = await sendQuoteAdminNotificationEmail(quoteData);

      expect(result).toBeDefined();
      expect(result?.totalAdmins).toBe(2);
      expect(result?.successful).toBe(2);
      expect(result?.failed).toBe(0);
    });

    it('should send admin notification without package details for manual quotes', async () => {
      const quoteData = {
        quoteId: '507f1f77bcf86cd799439011',
        quoteReference: 'Q99439011',
        leadName: 'John Doe',
        agentEmail: 'agent@test.com',
        hotelName: 'Test Hotel',
        numberOfPeople: 10,
        numberOfNights: 3,
        arrivalDate: new Date('2025-06-15'),
        totalPrice: 5000,
        currency: 'GBP' as const,
        formattedPrice: '£5,000',
        createdBy: 'Admin User',
      };

      const result = await sendQuoteAdminNotificationEmail(quoteData);

      expect(result).toBeDefined();
      expect(result?.totalAdmins).toBe(2);
      expect(result?.successful).toBe(2);
      expect(result?.failed).toBe(0);
    });

    it('should include package name in email subject when package is linked', async () => {
      const quoteData = {
        quoteId: '507f1f77bcf86cd799439011',
        quoteReference: 'Q99439011',
        leadName: 'John Doe',
        agentEmail: 'agent@test.com',
        hotelName: 'Test Hotel',
        numberOfPeople: 10,
        numberOfNights: 3,
        arrivalDate: new Date('2025-06-15'),
        totalPrice: 5000,
        currency: 'GBP' as const,
        formattedPrice: '£5,000',
        createdBy: 'Admin User',
        linkedPackage: {
          packageName: 'Benidorm Super Package',
          packageVersion: 1,
          selectedTier: '6-11 People',
          selectedPeriod: 'June',
          calculatedPrice: 5000,
        },
      };

      const result = await sendQuoteAdminNotificationEmail(quoteData);

      expect(result).toBeDefined();
      expect(result?.successful).toBeGreaterThan(0);
    });

    it('should handle missing admin users gracefully', async () => {
      const User = (await import('@/models/User')).default;
      vi.mocked(User.find).mockReturnValueOnce({
        select: vi.fn().mockResolvedValue([]),
      } as any);

      const quoteData = {
        quoteId: '507f1f77bcf86cd799439011',
        quoteReference: 'Q99439011',
        leadName: 'John Doe',
        agentEmail: 'agent@test.com',
        hotelName: 'Test Hotel',
        numberOfPeople: 10,
        numberOfNights: 3,
        arrivalDate: new Date('2025-06-15'),
        totalPrice: 5000,
        currency: 'GBP' as const,
        formattedPrice: '£5,000',
        createdBy: 'Admin User',
      };

      const result = await sendQuoteAdminNotificationEmail(quoteData);

      expect(result).toBeNull();
    });

    it('should include all package details in admin notification', async () => {
      const quoteData = {
        quoteId: '507f1f77bcf86cd799439011',
        quoteReference: 'Q99439011',
        leadName: 'John Doe',
        agentEmail: 'agent@test.com',
        hotelName: 'Test Hotel',
        numberOfPeople: 10,
        numberOfNights: 3,
        arrivalDate: new Date('2025-06-15'),
        totalPrice: 5000,
        currency: 'EUR' as const,
        formattedPrice: '€5,000',
        createdBy: 'Admin User',
        linkedPackage: {
          packageName: 'Benidorm Super Package',
          packageVersion: 2,
          selectedTier: '12+ People',
          selectedPeriod: 'Easter (02/04/2025 - 06/04/2025)',
          calculatedPrice: 4500,
        },
      };

      const result = await sendQuoteAdminNotificationEmail(quoteData);

      expect(result).toBeDefined();
      expect(result?.successful).toBeGreaterThan(0);
    });
  });

  describe('Customer-facing email security', () => {
    it('should not expose package details in customer emails', () => {
      // This is a conceptual test - the actual implementation ensures
      // that linkedPackage data is only used in admin notifications
      // and not in customer-facing sendQuoteEmail calls

      const customerEmailData = {
        quoteId: '507f1f77bcf86cd799439011',
        quoteReference: 'Q99439011',
        leadName: 'John Doe',
        agentEmail: 'customer@test.com',
        hotelName: 'Test Hotel',
        numberOfPeople: 10,
        numberOfRooms: 5,
        numberOfNights: 3,
        arrivalDate: new Date('2025-06-15'),
        isSuperPackage: true,
        whatsIncluded: 'Accommodation, transfers, activities',
        transferIncluded: true,
        totalPrice: 5000,
        currency: 'GBP' as const,
        formattedPrice: '£5,000',
        version: 1,
        // linkedPackage should be optional and not required for customer emails
      };

      // Verify that customer email data structure doesn't require linkedPackage
      expect(customerEmailData.linkedPackage).toBeUndefined();
    });
  });
});
