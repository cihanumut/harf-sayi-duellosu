// Bilgisayarın hamlelerini üretir.
import { findLongestWords, solveNumbers } from '@bkbi/shared';
import { WORDS } from './dictionary.js';

// Zorluğa göre bir kelime seçer. hard: en uzun; normal/easy: kademeli olarak kısaltır.
export function cpuWord(letters, difficulty = 'normal') {
  const found = findLongestWords(letters, WORDS, 40);
  if (found.length === 0) return '';
  const bestLen = found[0].length;
  const offset = difficulty === 'hard' ? 0 : difficulty === 'normal' ? 2 : 4;
  const targetLen = Math.max(2, bestLen - offset);
  const pool = found.filter((w) => w.length <= targetLen);
  const use = pool.length ? pool : found;
  const maxLen = Math.max(...use.map((w) => w.length));
  const top = use.filter((w) => w.length === maxLen);
  return top[Math.floor(Math.random() * top.length)];
}

// Sayı turu: hard tam çözer; normal/easy'de bazen bilerek daha uzağa "nişan alır".
export function cpuNumbers(numbers, target, difficulty = 'normal') {
  const best = solveNumbers(numbers, target);
  if (difficulty === 'hard') return best;

  // normal/easy: rastgele biraz sapmalı bir hedefe yönel, böylece oyuncunun şansı olur.
  const spread = difficulty === 'easy' ? 15 : 8;
  const missChance = difficulty === 'easy' ? 0.6 : 0.4;
  if (Math.random() > missChance) return best; // yine de bazen tam vurur

  const off = (1 + Math.floor(Math.random() * spread));
  const altTarget = target + (Math.random() < 0.5 ? -off : off);
  const alt = solveNumbers(numbers, altTarget);
  return alt; // gerçek bir ifade; hedefe göre puanı düşük olabilir
}
