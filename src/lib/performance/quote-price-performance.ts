/**
 * Performance Monitoring for Quote Price Integration
 * Tracks key operations and provides metrics for optimization
 */

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  priceCalculation: number; // Target: < 200ms
  uiUpdate: number; // Target: < 100ms
  packageSelection: number; // Target: < 300ms
}

class QuotePricePerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100; // Keep last 100 metrics
  private enabled = process.env.NODE_ENV === 'development';

  private thresholds: PerformanceThresholds = {
    priceCalculation: 200,
    uiUpdate: 100,
    packageSelection: 300,
  };

  /**
   * Start timing an operation
   */
  startTiming(operation: string): (metadata?: Record<string, any>) => number {
    if (!this.enabled) return () => 0;

    const startTime = performance.now();
    const startMark = `${operation}-start-${Date.now()}`;
    
    if (typeof performance.mark === 'function') {
      performance.mark(startMark);
    }

    return (metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      
      this.recordMetric({
        operation,
        duration,
        timestamp: Date.now(),
        metadata,
      });

      // Log slow operations
      const threshold = this.getThreshold(operation);
      if (threshold && duration > threshold) {
        console.warn(
          `[Performance] Slow operation: ${operation} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`,
          metadata
        );
      }

      return duration;
    };
  }

  /**
   * Record a metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get threshold for an operation
   */
  private getThreshold(operation: string): number | undefined {
    if (operation.includes('price-calculation')) {
      return this.thresholds.priceCalculation;
    }
    if (operation.includes('ui-update')) {
      return this.thresholds.uiUpdate;
    }
    if (operation.includes('package-selection')) {
      return this.thresholds.packageSelection;
    }
    return undefined;
  }

  /**
   * Get metrics for an operation
   */
  getMetrics(operation?: string): PerformanceMetric[] {
    if (operation) {
      return this.metrics.filter((m) => m.operation === operation);
    }
    return [...this.metrics];
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(operation: string): number {
    const operationMetrics = this.getMetrics(operation);
    if (operationMetrics.length === 0) return 0;

    const total = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / operationMetrics.length;
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; avg: number; max: number; min: number }> {
    const summary: Record<string, { count: number; avg: number; max: number; min: number }> = {};

    // Group by operation
    const grouped = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.operation]) {
        acc[metric.operation] = [];
      }
      acc[metric.operation].push(metric.duration);
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate stats
    Object.entries(grouped).forEach(([operation, durations]) => {
      summary[operation] = {
        count: durations.length,
        avg: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        max: Math.max(...durations),
        min: Math.min(...durations),
      };
    });

    return summary;
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    if (!this.enabled) return;

    const summary = this.getSummary();
    console.group('[Performance] Quote Price Integration Summary');
    
    Object.entries(summary).forEach(([operation, stats]) => {
      const threshold = this.getThreshold(operation);
      const status = threshold && stats.avg > threshold ? '⚠️' : '✅';
      
      console.log(
        `${status} ${operation}:`,
        `avg=${stats.avg.toFixed(2)}ms`,
        `min=${stats.min.toFixed(2)}ms`,
        `max=${stats.max.toFixed(2)}ms`,
        `count=${stats.count}`,
        threshold ? `(threshold: ${threshold}ms)` : ''
      );
    });
    
    console.groupEnd();
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Singleton instance
export const performanceMonitor = new QuotePricePerformanceMonitor();

// Convenience functions
export const startTiming = (operation: string) => performanceMonitor.startTiming(operation);
export const getPerformanceSummary = () => performanceMonitor.getSummary();
export const logPerformanceSummary = () => performanceMonitor.logSummary();

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitoring(operation: string) {
  return {
    startTiming: () => startTiming(operation),
    getMetrics: () => performanceMonitor.getMetrics(operation),
    getAverageDuration: () => performanceMonitor.getAverageDuration(operation),
  };
}

/**
 * Higher-order function to wrap async functions with performance monitoring
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  operation: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    const endTiming = startTiming(operation);
    try {
      const result = await fn(...args);
      endTiming({ success: true });
      return result;
    } catch (error) {
      endTiming({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }) as T;
}
