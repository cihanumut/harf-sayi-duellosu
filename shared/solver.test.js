import { describe, it, expect } from 'vitest';
import { solveNumbers, evaluateExpression, findLongestWords } from './solver.js';
import { canFormWord } from './words.js';

describe('solveNumbers', () => {
  it('finds an exact solution when one is trivially reachable', () => {
    const res = solveNumbers([100, 5, 2], 105);
    expect(res.exact).toBe(true);
    expect(res.value).toBe(105);
  });

  it('reaches a hard target exactly (Countdown-style)', () => {
    const res = solveNumbers([100, 75, 3, 6, 8, 2], 952);
    expect(res.value).toBe(952);
    expect(res.exact).toBe(true);
  });

  it('returns the closest value when target is unreachable', () => {
    const res = solveNumbers([2, 4], 999);
    expect(res.exact).toBe(false);
    expect(res.diff).toBeGreaterThan(0);
    // en yakın ulaşılabilir: 2*4=8, 2+4=6, 4-2=2 ... en büyüğü 8
    expect(res.value).toBe(8);
  });

  it('never uses negative intermediate results', () => {
    const res = solveNumbers([1, 2, 3], 100);
    expect(res.value).toBeGreaterThan(0);
  });
});

describe('evaluateExpression', () => {
  it('accepts a valid expression using allowed numbers', () => {
    const res = evaluateExpression('100 × 8 + 75 × 2 + 3', [100, 75, 3, 6, 8, 2]);
    expect(res.ok).toBe(true);
    expect(res.value).toBe(953);
  });

  it('rejects using a number not in the pool', () => {
    const res = evaluateExpression('100 + 99', [100, 75, 3]);
    expect(res.ok).toBe(false);
  });

  it('rejects reusing a number more times than available', () => {
    const res = evaluateExpression('3 + 3', [3, 100]);
    expect(res.ok).toBe(false);
  });

  it('rejects invalid characters', () => {
    const res = evaluateExpression('alert(1)', [1]);
    expect(res.ok).toBe(false);
  });
});

describe('canFormWord', () => {
  it('accepts a word formable from the letters', () => {
    expect(canFormWord('kalem', ['k', 'a', 'l', 'e', 'm', 'i', 't'])).toBe(true);
  });

  it('rejects a word needing a repeated letter that is not available', () => {
    expect(canFormWord('elma', ['e', 'l', 'm', 'i'])).toBe(false); // ikinci 'a' yok
  });

  it('handles Turkish uppercase I/İ correctly', () => {
    expect(canFormWord('Işık', ['ı', 'ş', 'ı', 'k'])).toBe(true);
  });
});

describe('findLongestWords', () => {
  const dict = ['el', 'kel', 'kale', 'kalem', 'melek', 'xyz', 'kalemlik'];
  it('returns valid words sorted by length, longest first', () => {
    const res = findLongestWords(['k', 'a', 'l', 'e', 'm'], dict, 5);
    expect(res[0]).toBe('kalem');
    expect(res).not.toContain('kalemlik'); // harf yetmez
    expect(res).not.toContain('xyz');
  });
});
