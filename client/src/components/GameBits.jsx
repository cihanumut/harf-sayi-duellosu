// Küçük, tekrar kullanılan sunum bileşenleri.

export function LetterTiles({ letters, revealCount }) {
  const n = revealCount ?? letters.length;
  return (
    <div className="tiles">
      {letters.map((ch, i) => (
        <span key={i} className={`tile ${i < n ? 'tile--on' : 'tile--empty'}`}>
          {i < n ? ch.toLocaleUpperCase('tr-TR') : ''}
        </span>
      ))}
    </div>
  );
}

export function NumberTiles({ numbers }) {
  return (
    <div className="tiles">
      {numbers.map((n, i) => (
        <span key={i} className="tile tile--num">{n}</span>
      ))}
    </div>
  );
}

export function Timer({ remaining, total }) {
  const pct = total ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
  const danger = remaining <= 5;
  return (
    <div className="timer">
      <div className="timer__bar">
        <div
          className={`timer__fill ${danger ? 'timer__fill--danger' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`timer__num ${danger ? 'timer__num--danger' : ''}`}>
        {remaining}s
      </span>
    </div>
  );
}

export function Scoreboard({ players }) {
  return (
    <div className="scoreboard">
      {players.map((p, i) => (
        <div key={p.id ?? i} className="scoreboard__row">
          <span className="scoreboard__name">{p.name}</span>
          <span className="scoreboard__score">{p.score}</span>
        </div>
      ))}
    </div>
  );
}

export function Panel({ title, children, footer }) {
  return (
    <div className="panel">
      {title && <h2 className="panel__title">{title}</h2>}
      <div className="panel__body">{children}</div>
      {footer && <div className="panel__footer">{footer}</div>}
    </div>
  );
}
