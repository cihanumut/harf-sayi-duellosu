import { useRef, useState } from 'react';
import { canFormWord, trLower } from '@bkbi/shared';
import { WORD_SET } from './dictionary.js';
import { useCountdown, useDeadline } from './useCountdown.js';
import { LetterTiles, Timer } from '../components/GameBits.jsx';

const SECONDS = 30;

export default function WordPlay({ letters, playerName, onSubmit, deadline }) {
  const [word, setWord] = useState('');
  const done = useRef(false);

  // Online modda sunucu zaman damgasına (deadline), offline'da yerel sayaca göre.
  const localRemaining = useCountdown(SECONDS, !deadline, finish, letters.join(''));
  const deadlineRemaining = useDeadline(deadline, finish);
  const remaining = deadline ? deadlineRemaining : localRemaining;

  function finish() {
    if (done.current) return;
    done.current = true;
    onSubmit(word.trim());
  }

  const w = trLower(word.trim());
  const formable = word ? canFormWord(word.trim(), letters) : true;
  const inDict = word ? WORD_SET.has(w) : false;
  const valid = word && formable && inDict;

  let hint = 'En uzun geçerli kelimeyi bul';
  let hintClass = 'hint';
  if (word) {
    if (!formable) {
      hint = 'Bu harflerle kurulamaz';
      hintClass = 'hint hint--bad';
    } else if (!inDict) {
      hint = 'Sözlükte bulunamadı';
      hintClass = 'hint hint--bad';
    } else {
      hint = `Geçerli! ${[...w].length} harf`;
      hintClass = 'hint hint--good';
    }
  }

  return (
    <div className="stack">
      <p className="turn-label">Sıra: <strong>{playerName}</strong></p>
      <Timer remaining={remaining} total={SECONDS} />
      <LetterTiles letters={letters} />
      <input
        className="text-input"
        autoFocus
        value={word}
        placeholder="kelimeni yaz…"
        onChange={(e) => setWord(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && finish()}
      />
      <p className={hintClass}>{hint}</p>
      <button className="btn btn--primary" onClick={finish}>Onayla</button>
    </div>
  );
}
