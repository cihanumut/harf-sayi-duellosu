// Türkçe harf üretimi — frekans ağırlıklı çekiliş.
// Kelime turunda oyuncu tek tek "sesli" (vowel) / "sessiz" (consonant) seçer.

export const VOWELS = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
export const CONSONANTS = [
  'b', 'c', 'ç', 'd', 'f', 'g', 'ğ', 'h', 'j', 'k', 'l', 'm',
  'n', 'p', 'r', 's', 'ş', 't', 'v', 'y', 'z',
];

// Yaklaşık Türkçe metin frekansları (ağırlık olarak kullanılır).
const VOWEL_WEIGHTS = {
  a: 120, e: 90, i: 85, ı: 51, u: 35, o: 25, ü: 20, ö: 10,
};
const CONSONANT_WEIGHTS = {
  n: 72, r: 70, l: 60, k: 50, d: 48, m: 40, y: 35, t: 34,
  s: 30, b: 28, ş: 18, z: 15, h: 12, ç: 12, g: 11, ğ: 11,
  v: 10, p: 9, c: 10, f: 5, j: 1,
};

function weightedPick(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [letter, w] of entries) {
    r -= w;
    if (r < 0) return letter;
  }
  return entries[entries.length - 1][0];
}

// type: 'vowel' | 'consonant'
export function drawLetter(type) {
  return type === 'vowel'
    ? weightedPick(VOWEL_WEIGHTS)
    : weightedPick(CONSONANT_WEIGHTS);
}

export function isVowel(letter) {
  return VOWELS.includes(letter);
}

// Otomatik/dengeli 9 harf üretir (hızlı oyun ve bilgisayar için).
// vowelCount belirtilmezse 3-5 arası rastgele sesli seçilir.
export function generateLetters(count = 9, vowelCount) {
  if (vowelCount == null) {
    vowelCount = 3 + Math.floor(Math.random() * 3); // 3,4,5
  }
  vowelCount = Math.max(1, Math.min(count - 1, vowelCount));
  const letters = [];
  for (let i = 0; i < vowelCount; i++) letters.push(drawLetter('vowel'));
  for (let i = 0; i < count - vowelCount; i++) letters.push(drawLetter('consonant'));
  // Karıştır
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters;
}
