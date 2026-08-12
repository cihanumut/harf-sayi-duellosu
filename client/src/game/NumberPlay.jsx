import { useEffect, useMemo, useRef, useState } from 'react';
import { evaluateExpression, solveNumbers } from '@bkbi/shared';
import { useCountdown, useDeadline } from './useCountdown.js';
import { NumberTiles, Timer } from '../components/GameBits.jsx';
import JokerBar from '../components/JokerBar.jsx';

const SECONDS = 45;

export default function NumberPlay({ numbers = [], target = 0, playerName, onSubmit, deadline, jokers, onConsumeJoker, onExtraTime }) {
  const [tokens, setTokens] = useState([]);
  const [jokerHintText, setJokerHintText] = useState(null);
  const done = useRef(false);

  const safeNumbers = Array.isArray(numbers) ? numbers : [];

  const [localRemaining, addLocalTime] = useCountdown(SECONDS, !deadline, finish, `${safeNumbers.join()}-${target}`);
  const [deadlineRemaining, addDeadlineTime] = useDeadline(deadline, finish);
  const remaining = deadline ? deadlineRemaining : localRemaining;

  function finish() {
    if (done.current) return;
    done.current = true;
    onSubmit(exprString.trim());
  }

  const handleUseTargetHint = () => {
    if (onConsumeJoker && onConsumeJoker('targetHint')) {
      const solution = solveNumbers(numbers, target);
      if (solution && solution.expr) {
        setJokerHintText(`🎯 İşlem İpucu: Çözüm var! (${solution.value} hedefine ulaşmak için "${solution.expr}" yapılabilir)`);
      } else {
        setJokerHintText('🎯 İşlem İpucu: Sayıları büyükten küçüğe doğru çarparak veya toplayarak hedefe yaklaşabilirsiniz.');
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

  // Her sayı, havuzdaki adedi kadar kullanılabilir. tokens içindeki kullanımları say.
  const usedCounts = useMemo(() => {
    const m = new Map();
    for (const t of tokens) {
      if (/^\d+$/.test(t)) m.set(t, (m.get(t) || 0) + 1);
    }
    return m;
  }, [tokens]);

  const exprString = tokens.join(' ');
  const evalRes = tokens.length ? evaluateExpression(exprString, numbers) : null;
  const value = evalRes?.ok ? evalRes.value : null;

  const add = (t) => setTokens((prev) => [...prev, t]);
  const backspace = () => setTokens((prev) => prev.slice(0, -1));
  const clear = () => setTokens([]);

  const finishRef = useRef(finish);
  finishRef.current = finish;

  // Klavye kısayolları (Enter -> Onayla, Backspace -> Sil, operatörler)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finishRef.current();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setTokens((prev) => prev.slice(0, -1));
      } else if (['+', '-', '*', '/', '(', ')'].includes(e.key)) {
        let op = e.key;
        if (op === '*') op = '×';
        if (op === '/') op = '÷';
        setTokens((prev) => [...prev, op]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sayı çipleri: her sayı örneğini ayrı buton yap, kullanılınca pasifleştir.
  const chipButtons = [];
  const seen = new Map();
  numbers.forEach((n, i) => {
    const key = String(n);
    const idx = seen.get(key) || 0;
    seen.set(key, idx + 1);
    const used = (usedCounts.get(key) || 0) > idx;
    chipButtons.push(
      <button
        key={i}
        className="chip"
        disabled={used}
        onClick={() => add(key)}
      >
        {n}
      </button>
    );
  });

  const diff = value != null ? Math.abs(value - target) : null;
  let valClass = 'value-display';
  if (diff === 0) valClass += ' value-display--exact';
  else if (diff != null && diff <= 10) valClass += ' value-display--close';

  return (
    <div className="stack">
      <p className="turn-label">Sıra: <strong>{playerName}</strong></p>
      <Timer remaining={remaining} total={SECONDS} />
      
      {jokers && (
        <JokerBar
          mode="number"
          jokers={jokers}
          onUseTargetHint={handleUseTargetHint}
          onAddExtraTime={handleAddExtraTime}
        />
      )}

      {jokerHintText && (
        <div className="joker-hint-box">
          {jokerHintText}
        </div>
      )}

      <div className="target">Hedef: <strong>{target}</strong></div>
      <NumberTiles numbers={numbers} />

      <div className="expr">{exprString || ' '}</div>
      <div className={valClass}>
        {value != null ? `= ${value}` : evalRes && !evalRes.ok ? evalRes.error : ' '}
      </div>

      <div className="chip-row">{chipButtons}</div>
      <div className="chip-row">
        {['+', '-', '×', '÷', '(', ')'].map((op) => (
          <button key={op} className="chip chip--op" onClick={() => add(op)}>
            {op}
          </button>
        ))}
        <button className="chip chip--util" onClick={backspace}>←</button>
        <button className="chip chip--util" onClick={clear}>Temizle</button>
      </div>

      <button className="btn btn--primary" onClick={finish}>Onayla</button>
    </div>
  );
}
