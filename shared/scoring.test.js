import { describe, it, expect } from 'vitest';
import { scoreWord, scoreNumbers } from './scoring.js';

describe('scoreWord', () => {
  it('scores a valid word by its length', () => {
    expect(scoreWord('kalem', { valid: true })).toBe(5);
  });
  it('scores an invalid word as zero', () => {
    expect(scoreWord('kalem', { valid: false })).toBe(0);
  });
  it('counts Turkish characters correctly', () => {
    expect(scoreWord('şışık', { valid: true })).toBe(5);
  });
});

describe('scoreNumbers', () => {
  it('gives 10 for an exact hit', () => {
    expect(scoreNumbers(500, 500)).toBe(10);
  });
  it('gives 7 within 5', () => {
    expect(scoreNumbers(497, 500)).toBe(7);
  });
  it('gives 5 within 10', () => {
    expect(scoreNumbers(492, 500)).toBe(5);
  });
  it('gives 0 beyond 10', () => {
    expect(scoreNumbers(480, 500)).toBe(0);
  });
});
