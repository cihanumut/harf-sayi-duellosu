import { useState } from 'react';
import { pickNumbers, randomTarget } from '@bkbi/shared';
import { NumberTiles } from '../components/GameBits.jsx';

// Seçici, kaç "büyük" sayı istediğini seçer (0-4), gerisi küçük. Sonra hedef açılır.
export default function NumberPicker({ chooserName, onComplete }) {
  const [numbers, setNumbers] = useState(null);

  function choose(bigCount) {
    const nums = pickNumbers(bigCount);
    const target = randomTarget();
    setNumbers(nums);
    setTimeout(() => onComplete(nums, target), 700);
  }

  if (numbers) {
    return (
      <div className="stack">
        <p className="hint">Sayılar seçildi, hedef belirleniyor…</p>
        <NumberTiles numbers={numbers} />
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="hint">
        <strong>{chooserName}</strong>, kaç büyük sayı istersin? (25/50/75/100)
      </p>
      <div className="btn-row">
        {[0, 1, 2, 3, 4].map((n) => (
          <button key={n} className="btn btn--big" onClick={() => choose(n)}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
