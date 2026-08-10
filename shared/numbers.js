// Sayı turu için sayı ve hedef üretimi.

export const SMALL_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const BIG_NUMBERS = [25, 50, 75, 100];

// Klasik formatta 6 sayı seçilir: bigCount kadar "büyük", gerisi "küçük".
// Küçük sayılar 1-10'dan iki kopyalı bir havuzdan, büyükler tekil çekilir.
export function pickNumbers(bigCount = 2, total = 6) {
  bigCount = Math.max(0, Math.min(BIG_NUMBERS.length, bigCount));
  const chosen = [];

  const bigPool = [...BIG_NUMBERS];
  for (let i = 0; i < bigCount; i++) {
    const idx = Math.floor(Math.random() * bigPool.length);
    chosen.push(bigPool.splice(idx, 1)[0]);
  }

  // Küçük havuz: her sayıdan iki adet.
  const smallPool = [...SMALL_NUMBERS, ...SMALL_NUMBERS];
  const smallCount = total - bigCount;
  for (let i = 0; i < smallCount; i++) {
    const idx = Math.floor(Math.random() * smallPool.length);
    chosen.push(smallPool.splice(idx, 1)[0]);
  }

  return chosen;
}

// Hedef: 100-999 arası rastgele tamsayı.
export function randomTarget() {
  return 100 + Math.floor(Math.random() * 900);
}
