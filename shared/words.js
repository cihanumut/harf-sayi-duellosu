// Kelime doğrulama yardımcıları — bir kelimenin verilen harflerden
// (çokküme / multiset olarak) türetilip türetilemeyeceğini kontrol eder.

// Türkçe küçük harfe çevirme. 'I' -> 'ı', 'İ' -> 'i' doğru davransın diye
// önce özel durumları ele alıp sonra locale-aware toLocaleLowerCase kullanıyoruz.
export function trLower(str) {
  return str
    .replace(/I/g, 'ı')
    .replace(/İ/g, 'i')
    .toLocaleLowerCase('tr-TR');
}

function letterCounts(letters) {
  const counts = new Map();
  for (const ch of letters) {
    counts.set(ch, (counts.get(ch) || 0) + 1);
  }
  return counts;
}

// word, verilen harf dizisinden (her harf en fazla bulunduğu kadar) kurulabilir mi?
export function canFormWord(word, letters) {
  const chars = [...trLower(word)];
  const pool = letterCounts(letters.map(trLower));
  for (const ch of chars) {
    const remaining = pool.get(ch);
    if (!remaining) return false;
    pool.set(ch, remaining - 1);
  }
  return true;
}
