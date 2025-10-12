import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  createRateLimiter,
  standardRateLimiter,
  uploadRateLimiter,
  importRateLimiter,
  calculationRateLimiter,
  clearAllRateLimits,
} from '../rate-limiter';

// Helper to create mock NextRequest
function createMockRequest(pathname: string, ip: string = '127.0.0.1'): NextRequest {
  const url = `http://localhost${pathname}`;
  const request = new NextRequest(url);
  
  // Mock headers
  Object.defineProperty(request, 'headers', {
    value: new Map([
      ['x-forwarded-for', ip],
    ]),
    writable: true,
  });
  
  return request;
}

describe('Rate Limiter', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  afterEach(() => {
    clearAllRateLimits();
  });

  describe('createRateLimiter', () => {
    it('should allow requests within limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      });

      const request = createMockRequest('/test');

      // First 5 requests should be allowed
      for (let i = 0; i < 5; i++) {
        const result = await limiter(request);
        expect(result.allowed).toBe(true);
      }
    });

    it('should block requests exceeding limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 3,
      });

      const request = createMockRequest('/test');

      // First 3 requests allowed
      for (let i = 0; i < 3; i++) {
        await limiter(request);
      }

      // 4th request should be blocked
      const result = await limiter(request);
      expect(result.allowed).toBe(false);
      expect(result.response).toBeDefined();
    });

    it('should return 429 status when rate limited', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
      });

      const request = createMockRequest('/test');

      await limiter(request);
      const result = await limiter(request);

      expect(result.allowed).toBe(false);
      expect(result.response?.status).toBe(429);
    });

    it('should include retry-after header', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
      });

      const request = createMockRequest('/test');

      await limiter(request);
      const result = await limiter(request);

      const retryAfter = result.response?.headers.get('Retry-After');
      expect(retryAfter).toBeDefined();
      expect(parseInt(retryAfter!)).toBeGreaterThan(0);
    });

    it('should reset after time window', async () => {
      const limiter = createRateLimiter({
        windowMs: 100, // 100ms window
        maxRequests: 2,
      });

      const request = createMockRequest('/test');

      // Use up the limit
      await limiter(request);
      await limiter(request);

      // Should be blocked
      let result = await limiter(request);
      expect(result.allowed).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be allowed again
      result = await limiter(request);
      expect(result.allowed).toBe(true);
    });

    it('should use custom error message', async () => {
      const customMessage = 'Custom rate limit message';
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
        message: customMessage,
      });

      const request = createMockRequest('/test');

      await limiter(request);
      const result = await limiter(request);

      const responseData = await result.response?.json();
      expect(responseData.error).toBe(customMessage);
    });
  });

  describe('User-based rate limiting', () => {
    it('should track limits per user', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      });

      const request = createMockRequest('/test');

      // User 1 uses their limit
      await limiter(request, 'user1');
      await limiter(request, 'user1');
      const user1Result = await limiter(request, 'user1');
      expect(user1Result.allowed).toBe(false);

      // User 2 should still have their limit
      const user2Result = await limiter(request, 'user2');
      expect(user2Result.allowed).toBe(true);
    });

    it('should prefer user ID over IP', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      });

      const request1 = createMockRequest('/test', '1.1.1.1');
      const request2 = createMockRequest('/test', '2.2.2.2');

      // Same user, different IPs
      await limiter(request1, 'user1');
      await limiter(request2, 'user1');
      const result = await limiter(request1, 'user1');
      
      expect(result.allowed).toBe(false);
    });
  });

  describe('IP-based rate limiting', () => {
    it('should track limits per IP when no user ID', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      });

      const request1 = createMockRequest('/test', '1.1.1.1');
      const request2 = createMockRequest('/test', '2.2.2.2');

      // IP 1 uses their limit
      await limiter(request1);
      await limiter(request1);
      const ip1Result = await limiter(request1);
      expect(ip1Result.allowed).toBe(false);

      // IP 2 should still have their limit
      const ip2Result = await limiter(request2);
      expect(ip2Result.allowed).toBe(true);
    });
  });

  describe('Path-based rate limiting', () => {
    it('should track limits per path', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      });

      const request1 = createMockRequest('/path1');
      const request2 = createMockRequest('/path2');

      // Use limit on path1
      await limiter(request1, 'user1');
      await limiter(request1, 'user1');
      const path1Result = await limiter(request1, 'user1');
      expect(path1Result.allowed).toBe(false);

      // Path2 should have separate limit
      const path2Result = await limiter(request2, 'user1');
      expect(path2Result.allowed).toBe(true);
    });
  });

  describe('Pre-configured rate limiters', () => {
    it('standardRateLimiter should allow 100 requests', async () => {
      const request = createMockRequest('/test');

      for (let i = 0; i < 100; i++) {
        const result = await standardRateLimiter(request);
        expect(result.allowed).toBe(true);
      }

      const result = await standardRateLimiter(request);
      expect(result.allowed).toBe(false);
    });

    it('uploadRateLimiter should allow 10 requests', async () => {
      const request = createMockRequest('/upload');

      for (let i = 0; i < 10; i++) {
        const result = await uploadRateLimiter(request);
        expect(result.allowed).toBe(true);
      }

      const result = await uploadRateLimiter(request);
      expect(result.allowed).toBe(false);
    });

    it('importRateLimiter should allow 5 requests', async () => {
      const request = createMockRequest('/import');

      for (let i = 0; i < 5; i++) {
        const result = await importRateLimiter(request);
        expect(result.allowed).toBe(true);
      }

      const result = await importRateLimiter(request);
      expect(result.allowed).toBe(false);
    });

    it('calculationRateLimiter should allow 50 requests per minute', async () => {
      const request = createMockRequest('/calculate');

      for (let i = 0; i < 50; i++) {
        const result = await calculationRateLimiter(request);
        expect(result.allowed).toBe(true);
      }

      const result = await calculationRateLimiter(request);
      expect(result.allowed).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle missing IP address', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      });

      const request = createMockRequest('/test');
      // Remove IP headers
      Object.defineProperty(request, 'headers', {
        value: new Map(),
        writable: true,
      });

      const result = await limiter(request);
      expect(result.allowed).toBe(true);
    });

    it('should handle concurrent requests', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 10,
      });

      const request = createMockRequest('/test');

      // Make 10 concurrent requests
      const promises = Array(10)
        .fill(null)
        .map(() => limiter(request, 'user1'));

      const results = await Promise.all(promises);
      const allowedCount = results.filter((r) => r.allowed).length;

      // All 10 should be allowed
      expect(allowedCount).toBe(10);

      // 11th should be blocked
      const result = await limiter(request, 'user1');
      expect(result.allowed).toBe(false);
    });
  });
});
