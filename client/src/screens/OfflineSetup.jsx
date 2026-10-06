import { useState } from 'react';
import { Panel } from '../components/GameBits.jsx';

const MIXED_ROUND_OPTIONS = [2, 4, 6, 8, 10];
const SINGLE_ROUND_OPTIONS = [1, 2, 3, 4, 5];

export default function OfflineSetup({ onStart, onBack }) {
  const [mode, setMode] = useState('cpu');
  const [difficulty, setDifficulty] = useState('normal');
  const [roundMode, setRoundMode] = useState('mixed');
  const [totalRounds, setTotalRounds] = useState(2);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');

  const roundOptions = roundMode === 'mixed' ? MIXED_ROUND_OPTIONS : SINGLE_ROUND_OPTIONS;

  function selectRoundMode(m) {
    setRoundMode(m);
    setTotalRounds(m === 'mixed' ? 2 : 1);
  }

  function start() {
    const name1 = p1.trim() || 'Oyuncu 1';
    const name2 = mode === 'cpu' ? 'Bilgisayar' : (p2.trim() || 'Oyuncu 2');
    onStart({ mode, difficulty, roundMode, totalRounds, names: [name1, name2] });
  }

  return (
    <div className="menu">
      <Panel title="Offline Kurulum">
        <div className="stack">
          <label className="field-label">Rakip</label>
          <div className="btn-row">
            <button className={`btn ${mode === 'cpu' ? 'btn--primary' : ''}`} onClick={() => setMode('cpu')}>
              Bilgisayar
            </button>
            <button className={`btn ${mode === '2p' ? 'btn--primary' : ''}`} onClick={() => setMode('2p')}>
              2 Kişi (aynı ekran)
            </button>
          </div>

          {mode === 'cpu' && (
            <>
              <label className="field-label">Zorluk</label>
              <div className="btn-row">
                {['easy', 'normal', 'hard'].map((d) => (
                  <button
                    key={d}
                    className={`btn ${difficulty === d ? 'btn--primary' : ''}`}
                    onClick={() => setDifficulty(d)}
                  >
                    {d === 'easy' ? 'Kolay' : d === 'normal' ? 'Normal' : 'Zor'}
                  </button>
                ))}
              </div>
            </>
          )}

          <label className="field-label">Oyun Türü</label>
          <div className="btn-row">
            <button className={`btn ${roundMode === 'mixed' ? 'btn--primary' : ''}`} onClick={() => selectRoundMode('mixed')}>
              Standart (Kelime + Sayı)
            </button>
            <button className={`btn ${roundMode === 'word' ? 'btn--primary' : ''}`} onClick={() => selectRoundMode('word')}>
              Sadece Kelime
            </button>
            <button className={`btn ${roundMode === 'number' ? 'btn--primary' : ''}`} onClick={() => selectRoundMode('number')}>
              Sadece Sayı
            </button>
          </div>

          <label className="field-label">Raunt Sayısı</label>
          <div className="btn-row">
            {roundOptions.map((count) => (
              <button
                key={count}
                className={`btn ${totalRounds === count ? 'btn--primary' : ''}`}
                onClick={() => setTotalRounds(count)}
              >
                {roundMode === 'mixed' ? `${count} Tur (${count / 2}K + ${count / 2}S)` : `${count} Tur`}
              </button>
            ))}
          </div>

          <label className="field-label">İsimler</label>
          <input className="text-input" placeholder="Oyuncu 1" value={p1} maxLength={20} onChange={(e) => setP1(e.target.value)} />
          {mode === '2p' && (
            <input className="text-input" placeholder="Oyuncu 2" value={p2} maxLength={20} onChange={(e) => setP2(e.target.value)} />
          )}

          <div className="btn-row">
            <button className="btn btn--primary btn--big" onClick={start}>Başla</button>
            <button className="btn btn--ghost" onClick={onBack}>← Geri</button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
