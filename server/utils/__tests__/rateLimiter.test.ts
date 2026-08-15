import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from '../rateLimiter.js';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter(0); // disable automatic interval in tests
  });

  afterEach(() => {
    limiter.destroy();
  });

  it('allows actions within the limit', () => {
    const key = 'user1';
    expect(limiter.consume(key, 3, 1000, 1000)).toBe(true);
    expect(limiter.consume(key, 3, 1000, 1100)).toBe(true);
    expect(limiter.consume(key, 3, 1000, 1200)).toBe(true);
  });

  it('blocks actions exceeding the limit', () => {
    const key = 'user1';
    expect(limiter.consume(key, 2, 1000, 1000)).toBe(true);
    expect(limiter.consume(key, 2, 1000, 1100)).toBe(true);
    expect(limiter.consume(key, 2, 1000, 1200)).toBe(false);
  });

  it('allows actions again after window expires', () => {
    const key = 'user1';
    expect(limiter.consume(key, 2, 1000, 1000)).toBe(true);
    expect(limiter.consume(key, 2, 1000, 1500)).toBe(true);
    expect(limiter.consume(key, 2, 1000, 1600)).toBe(false);

    // After 1000ms window from first hit (t=2001), first hit has expired
    expect(limiter.consume(key, 2, 1000, 2001)).toBe(true);
  });

  it('handles multiple separate keys independently', () => {
    expect(limiter.consume('keyA', 1, 1000, 1000)).toBe(true);
    expect(limiter.consume('keyA', 1, 1000, 1000)).toBe(false);

    expect(limiter.consume('keyB', 1, 1000, 1000)).toBe(true);
  });

  it('resets a key properly', () => {
    limiter.consume('keyA', 1, 1000, 1000);
    expect(limiter.consume('keyA', 1, 1000, 1000)).toBe(false);

    limiter.reset('keyA');
    expect(limiter.consume('keyA', 1, 1000, 1000)).toBe(true);
  });

  it('cleans up old records', () => {
    limiter.consume('oldKey', 1, 1000, 1000);
    limiter.cleanup(5000, 2000); // 5000 - 2000 = cutoff 3000 -> 1000 gets purged
    expect(limiter.consume('oldKey', 1, 1000, 5000)).toBe(true);
  });
});
