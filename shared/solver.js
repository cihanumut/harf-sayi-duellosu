// Çözücüler: sayı turu için en iyi ifade, kelime turu için en uzun kelimeler.

import { canFormWord, trLower } from './words.js';

// ---- Sayı turu çözücü ----
// Countdown tarzı özyinelemeli birleştirme. Kurallar:
//  - işlemler + - × ÷
//  - ara sonuçlar pozitif tamsayı olmalı
//  - çıkarma pozitif kalmalı (a > b)
//  - bölme tam olmalı (a % b === 0)
// Hedefe tam ulaşılamazsa en yakın değer döndürülür.

function combine(a, b) {
  // a, b: { value, expr }
  const results = [];
  results.push({ value: a.value + b.value, expr: `(${a.expr} + ${b.expr})` });
  results.push({ value: a.value * b.value, expr: `(${a.expr} × ${b.expr})` });
  if (a.value > b.value) {
    results.push({ value: a.value - b.value, expr: `(${a.expr} - ${b.expr})` });
  } else if (b.value > a.value) {
    results.push({ value: b.value - a.value, expr: `(${b.expr} - ${a.expr})` });
  }
  if (b.value !== 0 && a.value % b.value === 0) {
    results.push({ value: a.value / b.value, expr: `(${a.expr} ÷ ${b.expr})` });
  } else if (a.value !== 0 && b.value % a.value === 0) {
    results.push({ value: b.value / a.value, expr: `(${b.expr} ÷ ${a.expr})` });
  }
  return results;
}

export function solveNumbers(nums, target) {
  let best = null; // { value, expr, diff }

  const consider = (item) => {
    const diff = Math.abs(item.value - target);
    if (best === null || diff < best.diff ||
        (diff === best.diff && item.expr.length < best.expr.length)) {
      best = { value: item.value, expr: item.expr, diff };
    }
  };

  const items = nums.map((n) => ({ value: n, expr: String(n) }));
  items.forEach(consider);

  const search = (list) => {
    if (best && best.diff === 0) return; // tam çözüm bulundu
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const rest = list.filter((_, k) => k !== i && k !== j);
        for (const combined of combine(list[i], list[j])) {
          consider(combined);
          if (best && best.diff === 0) return;
          if (rest.length > 0) search([...rest, combined]);
          if (best && best.diff === 0) return;
        }
      }
    }
  };

  search(items);
  return { value: best.value, expr: best.expr, exact: best.diff === 0, diff: best.diff };
}

// Bir kullanıcı ifadesini güvenli biçimde değerlendirir ve kuralları kontrol eder.
// Sadece verilen sayılar (birer kez) ve + - × * ÷ / ( ) izinlidir.
export function evaluateExpression(expr, allowedNumbers) {
  const normalized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
  if (!/^[0-9+\-*/()]+$/.test(normalized)) {
    return { ok: false, error: 'Geçersiz karakter' };
  }
  // İfadedeki sayıları çıkar ve izinli havuzla karşılaştır (multiset).
  const used = normalized.match(/\d+/g)?.map(Number) ?? [];
  const pool = new Map();
  for (const n of allowedNumbers) pool.set(n, (pool.get(n) || 0) + 1);
  for (const n of used) {
    const rem = pool.get(n);
    if (!rem) return { ok: false, error: `${n} sayısı kullanılamaz` };
    pool.set(n, rem - 1);
  }
  let value;
  try {
    // eslint-disable-next-line no-new-func
    value = Function(`"use strict"; return (${normalized});`)();
  } catch {
    return { ok: false, error: 'İfade değerlendirilemedi' };
  }
  if (!Number.isFinite(value)) return { ok: false, error: 'Sonuç geçersiz' };
  return { ok: true, value };
}

// ---- Kelime turu çözücü ----
// words: kelime dizisi (iterable). Harflerden kurulabilen en uzun kelimeleri döndürür.
export function findLongestWords(letters, words, limit = 5) {
  if (!letters || letters.length === 0 || !words) return [];

  const maxLen = letters.length;
  const poolCounts = {};
  for (let i = 0; i < letters.length; i++) {
    const ch = trLower(letters[i]);
    poolCounts[ch] = (poolCounts[ch] || 0) + 1;
  }

  const found = [];
  for (const w of words) {
    const len = w.length;
    if (len < 2 || len > maxLen) continue;

    let canForm = true;
    const tempCounts = { ...poolCounts };
    for (let i = 0; i < len; i++) {
      const ch = w[i];
      if (!tempCounts[ch]) {
        canForm = false;
        break;
      }
      tempCounts[ch]--;
    }

    if (canForm) {
      found.push(w);
    }
  }

  found.sort((a, b) => b.length - a.length || trLower(a).localeCompare(trLower(b), 'tr'));
  return found.slice(0, limit);
}

