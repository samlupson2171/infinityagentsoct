/**
 * Event Cache Manager
 * 
 * Provides in-memory caching for events and categories with TTL support
 * and pattern-based invalidation.
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export class EventCache {
  private cache: Map<string, CacheEntry>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // Default TTL: 5 minutes
    this.cache = new Map();
    this.defaultTTL = defaultTTL;

    // Start cleanup interval (every minute)
    this.startCleanupInterval();
  }

  /**
   * Get a value from cache
   */
  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set a value in cache
   */
  async set(key: string, data: any, ttl?: number): Promise<void> {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, entry);
  }

  /**
   * Delete a specific key from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Invalidate cache entries matching a pattern
   * Supports wildcards: 'events:*' will match all keys starting with 'events:'
   */
  async invalidate(pattern: string): Promise<void> {
    if (pattern === '*') {
      // Clear all cache
      this.cache.clear();
      return;
    }

    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]');

    const regex = new RegExp(`^${regexPattern}$`);

    // Find and delete matching keys
    const keysToDelete: string[] = [];
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Check if a key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get remaining TTL for a key (in milliseconds)
   */
  getTTL(key: string): number | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const elapsed = now - entry.timestamp;
    const remaining = entry.ttl - elapsed;

    return remaining > 0 ? remaining : 0;
  }

  /**
   * Update TTL for an existing key
   */
  async updateTTL(key: string, ttl: number): Promise<boolean> {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    entry.ttl = ttl;
    entry.timestamp = Date.now();
    this.cache.set(key, entry);

    return true;
  }

  /**
   * Get multiple values from cache
   */
  async getMany(keys: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        results.set(key, value);
      }
    }

    return results;
  }

  /**
   * Set multiple values in cache
   */
  async setMany(entries: Map<string, any>, ttl?: number): Promise<void> {
    const entryArray = Array.from(entries.entries());
    for (const [key, data] of entryArray) {
      await this.set(key, data, ttl);
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpired();
    }, 60 * 1000); // Run every minute
  }

  /**
   * Remove expired entries from cache
   */
  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache(
    dataLoader: () => Promise<Array<{ key: string; data: any; ttl?: number }>>
  ): Promise<void> {
    const entries = await dataLoader();

    const entryArray = Array.from(entries);
    for (const entry of entryArray) {
      await this.set(entry.key, entry.data, entry.ttl);
    }
  }
}

// Export singleton instance for shared cache
export const eventCache = new EventCache();
