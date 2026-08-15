interface RateLimitRecord {
  timestamps: number[];
}

export class RateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(cleanupIntervalMs: number = 60000) {
    if (cleanupIntervalMs > 0) {
      this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Checks whether the given key is within the rate limit.
   * If allowed, records the hit and returns true.
   * If exceeded, returns false.
   */
  public consume(key: string, limit: number, windowMs: number, now: number = Date.now()): boolean {
    const record = this.records.get(key) || { timestamps: [] };
    const cutoff = now - windowMs;

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

    if (record.timestamps.length >= limit) {
      this.records.set(key, record);
      return false;
    }

    record.timestamps.push(now);
    this.records.set(key, record);
    return true;
  }

  /**
   * Resets records for a specific key (useful on disconnect).
   */
  public reset(key: string): void {
    this.records.delete(key);
  }

  /**
   * Cleans up keys with no active timestamps.
   */
  public cleanup(now: number = Date.now(), maxAgeMs: number = 120000): void {
    const cutoff = now - maxAgeMs;
    for (const [key, record] of this.records.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > cutoff);
      if (record.timestamps.length === 0) {
        this.records.delete(key);
      }
    }
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.records.clear();
  }
}

export const globalRateLimiter = new RateLimiter();
