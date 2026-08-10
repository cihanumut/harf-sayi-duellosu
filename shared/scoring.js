// Puanlama kuralları.

// Kelime turu: geçerli kelime puanı = harf sayısı. Geçersiz = 0.
export function scoreWord(word, { valid }) {
  if (!valid) return 0;
  return [...word].length;
}

// Sayı turu: hedefe uzaklığa göre puan.
//  tam isabet -> 10, ±5 -> 7, ±10 -> 5, aksi halde 0.
export function scoreNumbers(value, target) {
  const diff = Math.abs(value - target);
  if (diff === 0) return 10;
  if (diff <= 5) return 7;
  if (diff <= 10) return 5;
  return 0;
}
