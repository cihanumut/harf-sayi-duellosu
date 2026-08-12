import { useRef, useState } from 'react';
import { canFormWord, trLower, findLongestWords } from '@bkbi/shared';
import { WORD_SET, WORDS } from './dictionary.js';
import { useCountdown, useDeadline } from './useCountdown.js';
import { LetterTiles, Timer } from '../components/GameBits.jsx';
import JokerBar from '../components/JokerBar.jsx';

const SECONDS = 30;

export default function WordPlay({ letters = [], playerName, onSubmit, deadline, jokers, onConsumeJoker, onExtraTime }) {
  const [word, setWord] = useState('');
  const [jokerHintText, setJokerHintText] = useState(null);
  const done = useRef(false);

  const safeLetters = Array.isArray(letters) ? letters : [];

  // Online modda sunucu zaman damgasına (deadline), offline'da yerel sayaca göre.
  const [localRemaining, addLocalTime] = useCountdown(SECONDS, !deadline, finish, safeLetters.join(''));
  const [deadlineRemaining, addDeadlineTime] = useDeadline(deadline, finish);
  const remaining = deadline ? deadlineRemaining : localRemaining;

  function finish(e) {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    if (done.current) return;
    done.current = true;
    onSubmit(word.trim());
  }

  const handleUseHint = () => {
    if (onConsumeJoker && onConsumeJoker('hint')) {
      const best = findLongestWords(letters, WORDS);
      if (best && best.length > 0) {
        const topWord = best[0].toLocaleUpperCase('tr-TR');
        const firstTwo = topWord.slice(0, 2);
        setJokerHintText(`💡 En az ${topWord.length} harfli bir kelime var! İlk harfleri: "${firstTwo}..."`);
      } else {
        setJokerHintText('💡 Bu harflerle en az 4 harfli kelimeler türetilebilir.');
      }
    }
  };

  const handleAddExtraTime = () => {
    if (onConsumeJoker && onConsumeJoker('extraTime')) {
      if (deadline) {
        addDeadlineTime(15);
        onExtraTime?.();
      } else {
        addLocalTime(15);
      }
    }
  };

  const w = trLower(word.trim());
  const formable = word ? canFormWord(word.trim(), letters) : true;
  const inDict = word ? WORD_SET.has(w) : false;

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
      
      {jokers && (
        <JokerBar
          mode="word"
          jokers={jokers}
          onUseHint={handleUseHint}
          onAddExtraTime={handleAddExtraTime}
        />
      )}

      {jokerHintText && (
        <div className="joker-hint-box">
          {jokerHintText}
        </div>
      )}

      <LetterTiles letters={letters} />
      <input
        className="text-input"
        autoFocus
        value={word}
        placeholder="kelimeni yaz…"
        onChange={(e) => setWord(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            finish(e);
          }
        }}
      />
      <p className={hintClass}>{hint}</p>
      <button className="btn btn--primary" disabled={done.current} onClick={finish}>Onayla</button>
    </div>
  );
}
