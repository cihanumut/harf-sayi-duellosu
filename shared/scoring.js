import { trLower, canFormWord } from './words.js';
import { evaluateExpression } from './solver.js';

// Kelime turu: geçerli kelime puanı = harf sayısı. Geçersiz = 0.
export function scoreWord(word, { valid } = {}) {
  if (!valid || !word) return 0;
  return [...word].length;
}

// Sayı turu: hedefe uzaklığa göre puan.
export function scoreNumbers(value, target) {
  if (value == null || target == null) return 0;
  const diff = Math.abs(value - target);
  if (diff === 0) return 10;
  if (diff <= 5) return 7;
  if (diff <= 10) return 5;
  return 0;
}

// Tekil Kelime Değerlendirmesi
export function evaluateWordResult(rawWord, letters, wordSet) {
  const word = (rawWord || '').trim();
  const cleanWord = trLower(word);
  const valid =
    cleanWord.length >= 2 &&
    wordSet.has(cleanWord) &&
    canFormWord(cleanWord, letters);
  const points = valid ? [...cleanWord].length : 0;
  return { word, cleanWord, valid, points };
}

// Tekil Sayı Değerlendirmesi
export function evaluateNumberResult(rawExpr, numbers, target) {
  const expr = (rawExpr || '').trim();
  if (!expr) {
    return { expr: '', value: null, valid: false, points: 0, diff: Infinity };
  }
  const evalRes = evaluateExpression(expr, numbers);
  if (!evalRes.ok || evalRes.value == null) {
    return { expr, value: null, valid: false, points: 0, diff: Infinity };
  }
  const value = evalRes.value;
  const diff = Math.abs(value - target);
  const points = scoreNumbers(value, target);
  return { expr, value, valid: true, points, diff };
}

// Kelime Turu Karşılaştırmalı Puanlama (En uzun kelimeyi yazan/yazanlar puan alır)
export function calculateWordRoundScores(answersList) {
  const evaluated = answersList.map((a) =>
    evaluateWordResult(a.word, a.letters, a.wordSet)
  );
  const maxPoints = Math.max(0, ...evaluated.map((e) => (e.valid ? e.points : 0)));

  return evaluated.map((e) => ({
    ...e,
    points: e.valid && e.points === maxPoints && maxPoints > 0 ? e.points : 0,
  }));
}

// Sayı Turu Karşılaştırmalı Puanlama (Hedefe en yakın sonucu bulan/bulanlar puan alır)
export function calculateNumberRoundScores(answersList) {
  const evaluated = answersList.map((a) =>
    evaluateNumberResult(a.expr, a.numbers, a.target)
  );
  const validDiffs = evaluated.filter((e) => e.valid && e.points > 0).map((e) => e.diff);
  const minDiff = validDiffs.length > 0 ? Math.min(...validDiffs) : Infinity;

  return evaluated.map((e) => ({
    ...e,
    points: e.valid && e.diff === minDiff && minDiff !== Infinity ? e.points : 0,
  }));
}
