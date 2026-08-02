import { describe, expect, it, vi, afterEach } from 'vitest';
import { shuffleArray, pickWords } from '../pictionaryWords.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('shuffleArray', () => {
  it('returns a new array with the same elements', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffleArray(input);
    expect(out).not.toBe(input);
    expect([...out].sort()).toEqual([...input].sort());
  });

  it('does not mutate the input', () => {
    const input = [1, 2, 3];
    shuffleArray(input);
    expect(input).toEqual([1, 2, 3]);
  });
});

describe('pickWords', () => {
  it('returns the requested number of unique words', () => {
    const words = pickWords(3, []);
    expect(words).toHaveLength(3);
    expect(new Set(words).size).toBe(3);
  });

  it('excludes words that were already used when possible', () => {
    // Mock randomness to be deterministic: keep the natural order.
    const words = pickWords(2, ['cat', 'dog']);
    expect(words).not.toContain('cat');
    expect(words).not.toContain('dog');
  });
});
