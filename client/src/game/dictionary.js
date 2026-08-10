// İstemci sözlüğü: build-wordlist ile üretilen JSON'ı içe aktarır.
import words from '@bkbi/shared/data/words.json';

export const WORDS = words;
export const WORD_SET = new Set(words);

export function isValidWord(word) {
  return WORD_SET.has(word);
}
