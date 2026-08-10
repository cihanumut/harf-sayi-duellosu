// Sunucu tarafı sözlük: shared/data/words.json dosyasını okur.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const wordsPath = require.resolve('@bkbi/shared/data/words.json');

export const WORDS = JSON.parse(readFileSync(wordsPath, 'utf8'));
export const WORD_SET = new Set(WORDS);
