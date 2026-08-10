import { useState } from 'react';
import { drawLetter, VOWELS } from '@bkbi/shared';
import { LetterTiles } from '../components/GameBits.jsx';

// Seçici oyuncu tek tek "Sesli/Sessiz" seçer, harfler tek tek açılır.
// Kural: 9 harf; en az 2 sesli, en az 3 sessiz.
const COUNT = 9;
const MIN_VOWELS = 2;
const MIN_CONSONANTS = 3;

export default function LetterPicker({ chooserName, onComplete }) {
  const [letters, setLetters] = useState([]);
  const vowelCount = letters.filter((l) => VOWELS.includes(l)).length;
  const consonantCount = letters.length - vowelCount;
  const remaining = COUNT - letters.length;

  // Kalan harf sayısı, minimumları karşılamaya yetecek kadar kısıtlar.
  const mustBeVowel = MIN_VOWELS - vowelCount >= remaining;
  const mustBeConsonant = MIN_CONSONANTS - consonantCount >= remaining;
  const canVowel = remaining > 0 && !mustBeConsonant;
  const canConsonant = remaining > 0 && !mustBeVowel;

  function pick(type) {
    const next = [...letters, drawLetter(type)];
    setLetters(next);
    if (next.length === COUNT) {
      setTimeout(() => onComplete(next), 600);
    }
  }

  return (
    <div className="stack">
      <p className="hint">
        <strong>{chooserName}</strong> harfleri seçiyor — kalan {remaining}
      </p>
      <LetterTiles
        letters={letters.length ? letters : Array(COUNT).fill('')}
        revealCount={letters.length}
      />
      <div className="btn-row">
        <button className="btn btn--big" disabled={!canVowel} onClick={() => pick('vowel')}>
          Sesli
        </button>
        <button
          className="btn btn--big"
          disabled={!canConsonant}
          onClick={() => pick('consonant')}
        >
          Sessiz
        </button>
      </div>
    </div>
  );
}
