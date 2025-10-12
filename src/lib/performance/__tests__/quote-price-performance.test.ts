/**
 * Tests for Quote Price Performance Monitoring
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  performanceMonitor,
  startTiming,
  getPerformanceSummary,
  withPerformanceMonitoring,
} from '../quote-price-performance';

describe('QuotePricePerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    performanceMonitor.setEnabled(true);
  });

  describe('startTiming', () => {
    it('should record timing for an operation', () => {
      const endTiming = startTiming('test-operation');
      
      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Wait 10ms
      }
      
      const duration = endTiming();
      
      expect(duration).toBeGreaterThanOrEqual(10);
      
      const metrics = performanceMonitor.getMetrics('test-operation');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].operation).toBe('test-operation');
      expect(metrics[0].duration).toBeGreaterThanOrEqual(10);
    });

    it('should record metadata with timing', () => {
      const endTiming = startTiming('test-with-metadata');
      
      endTiming({ packageId: '123', success: true });
      
      const metrics = performanceMonitor.getMetrics('test-with-metadata');
      expect(metrics[0].metadata).toEqual({ packageId: '123', success: true });
    });

    it('should not record when disabled', () => {
      performanceMonitor.setEnabled(false);
      
      const endTiming = startTiming('disabled-operation');
      endTiming();
      
      const metrics = performanceMonitor.getMetrics('disabled-operation');
      expect(metrics).toHaveLength(0);
    });
  });

  describe('getPerformanceSummary', () => {
    it('should calculate summary statistics', () => {
      // Record multiple operations
      const end1 = startTiming('operation-a');
      end1();
      
      const end2 = startTiming('operation-a');
      end2();
      
      const end3 = startTiming('operation-b');
      end3();
      
      const summary = getPerformanceSummary();
      
      expect(summary['operation-a']).toBeDefined();
      expect(summary['operation-a'].count).toBe(2);
      expect(summary['operation-b']).toBeDefined();
      expect(summary['operation-b'].count).toBe(1);
    });

    it('should calculate average, min, and max', () => {
      // Manually set durations for testing
      const end1 = startTiming('test-stats');
      setTimeout(() => {}, 10);
      end1();
      
      const end2 = startTiming('test-stats');
      setTimeout(() => {}, 20);
      end2();
      
      const end3 = startTiming('test-stats');
      setTimeout(() => {}, 30);
      end3();
      
      const summary = getPerformanceSummary();
      const stats = summary['test-stats'];
      
      expect(stats.count).toBe(3);
      expect(stats.min).toBeGreaterThanOrEqual(0);
      expect(stats.max).toBeGreaterThanOrEqual(stats.min);
      expect(stats.avg).toBeGreaterThanOrEqual(stats.min);
      expect(stats.avg).toBeLessThanOrEqual(stats.max);
    });
  });

  describe('withPerformanceMonitoring', () => {
    it('should wrap async function with monitoring', async () => {
      const mockFn = vi.fn(async (x: number) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return x * 2;
      });
      
      const wrappedFn = withPerformanceMonitoring('wrapped-operation', mockFn);
      
      const result = await wrappedFn(5);
      
      expect(result).toBe(10);
      expect(mockFn).toHaveBeenCalledWith(5);
      
      const metrics = performanceMonitor.getMetrics('wrapped-operation');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].metadata?.success).toBe(true);
    });

    it('should record errors in wrapped function', async () => {
      const mockFn = vi.fn(async () => {
        throw new Error('Test error');
      });
      
      const wrappedFn = withPerformanceMonitoring('error-operation', mockFn);
      
      await expect(wrappedFn()).rejects.toThrow('Test error');
      
      const metrics = performanceMonitor.getMetrics('error-operation');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].metadata?.success).toBe(false);
      expect(metrics[0].metadata?.error).toBe('Test error');
    });
  });

  describe('getAverageDuration', () => {
    it('should return 0 for operations with no metrics', () => {
      const avg = performanceMonitor.getAverageDuration('non-existent');
      expect(avg).toBe(0);
    });

    it('should calculate average duration correctly', () => {
      // Record operations with known durations
      const end1 = startTiming('avg-test');
      end1();
      
      const end2 = startTiming('avg-test');
      end2();
      
      const avg = performanceMonitor.getAverageDuration('avg-test');
      expect(avg).toBeGreaterThan(0);
    });
  });

  describe('metric retention', () => {
    it('should keep only last 100 metrics', () => {
      // Record 150 metrics
      for (let i = 0; i < 150; i++) {
        const end = startTiming(`operation-${i % 10}`);
        end();
      }
      
      const allMetrics = performanceMonitor.getMetrics();
      expect(allMetrics.length).toBeLessThanOrEqual(100);
    });
  });

  describe('threshold warnings', () => {
    it('should warn about slow price calculations', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const end = startTiming('price-calculation-api');
      
      // Simulate slow operation (> 200ms threshold)
      const start = Date.now();
      while (Date.now() - start < 250) {
        // Wait 250ms
      }
      
      end();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow operation: price-calculation-api'),
        undefined
      );
      
      consoleSpy.mockRestore();
    });
  });
});
