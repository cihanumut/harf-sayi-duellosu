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
  if (!word || !letters || letters.length === 0) return false;
  const cleanWord = trLower(String(word).trim());
  const maxLen = letters.length;
  if (cleanWord.length < 2 || cleanWord.length > maxLen) return false;

  const pool = {};
  for (let i = 0; i < letters.length; i++) {
    const ch = trLower(letters[i]);
    pool[ch] = (pool[ch] || 0) + 1;
  }

  for (let i = 0; i < cleanWord.length; i++) {
    const ch = cleanWord[i];
    if (!pool[ch]) return false;
    pool[ch]--;
  }
  return true;
}

