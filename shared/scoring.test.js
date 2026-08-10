import { describe, it, expect } from 'vitest';
import {
  scoreWord,
  scoreNumbers,
  evaluateWordResult,
  evaluateNumberResult,
  calculateWordRoundScores,
  calculateNumberRoundScores,
} from './scoring.js';

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

describe('calculateWordRoundScores', () => {
  const dummySet = new Set(['kalem', 'masa']);
  const letters = ['K', 'A', 'L', 'E', 'M', 'S', 'A', 'B', 'C'];

  it('gives points to the player with the longest valid word', () => {
    const res = calculateWordRoundScores([
      { word: 'KALEM', letters, wordSet: dummySet }, // 5 letters
      { word: 'MASA', letters, wordSet: dummySet },  // 4 letters
    ]);

    expect(res[0].valid).toBe(true);
    expect(res[0].points).toBe(5);
    expect(res[1].valid).toBe(true);
    expect(res[1].points).toBe(0); // Shorter word gets 0 in competitive rule
  });

  it('gives points to both players if they form valid words of equal length', () => {
    const res = calculateWordRoundScores([
      { word: 'KALEM', letters, wordSet: dummySet },
      { word: 'KALEM', letters, wordSet: dummySet },
    ]);

    expect(res[0].points).toBe(5);
    expect(res[1].points).toBe(5);
  });
});

describe('calculateNumberRoundScores', () => {
  const numbers = [100, 50, 25, 10, 5, 2];
  const target = 527;

  it('gives points to the player closest to the target', () => {
    const res = calculateNumberRoundScores([
      { expr: '100 * 5 + 25 + 2', numbers, target }, // 527 (exact)
      { expr: '100 * 5 + 25', numbers, target },     // 525 (diff 2 -> 7 pts)
    ]);

    expect(res[0].valid).toBe(true);
    expect(res[0].points).toBe(10);
    expect(res[1].valid).toBe(true);
    expect(res[1].points).toBe(0); // Player 1 was exact, so player 2 gets 0
  });
});
