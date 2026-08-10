// Türkçe kelime listesini indirir, oyun için normalize edip
// client/src/data/words.json olarak yazar.
//
// Kaynak: https://github.com/CanNuhlar/Turkce-Kelime-Listesi (TDK imla kılavuzu)
//
// Kurallar:
//  - Türkçe locale ile küçük harfe çevir
//  - sadece tek kelime, yalnızca Türkçe harfler (boşluk/kesme/tire içerenleri ele)
//  - uzunluk 2..15
//  - tekilleştir, alfabetik sırala (tr)

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAW_URL =
  'https://raw.githubusercontent.com/CanNuhlar/Turkce-Kelime-Listesi/master/turkce_kelime_listesi.txt';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../shared/data/words.json');

const TR_LETTERS = /^[abcçdefgğhıijklmnoöprsştuüvyz]+$/;

function trLower(str) {
  return str.replace(/I/g, 'ı').replace(/İ/g, 'i').toLocaleLowerCase('tr-TR');
}

async function main() {
  console.log('İndiriliyor:', RAW_URL);
  const res = await fetch(RAW_URL);
  if (!res.ok) throw new Error(`İndirme başarısız: HTTP ${res.status}`);
  const text = await res.text();

  const seen = new Set();
  for (const rawLine of text.split(/\r?\n/)) {
    const word = trLower(rawLine.trim());
    if (word.length < 2 || word.length > 15) continue;
    if (!TR_LETTERS.test(word)) continue; // boşluk, kesme, tire vb. ele
    seen.add(word);
  }

  const words = [...seen].sort((a, b) => a.localeCompare(b, 'tr'));
  console.log(`${words.length} kelime normalize edildi.`);

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(words), 'utf8');
  console.log('Yazıldı:', OUT_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
