import { useState } from 'react';
import { Panel } from '../components/GameBits.jsx';

export default function OfflineSetup({ onStart, onBack }) {
  const [mode, setMode] = useState('cpu');
  const [difficulty, setDifficulty] = useState('normal');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');

  function start() {
    const name1 = p1.trim() || 'Oyuncu 1';
    const name2 = mode === 'cpu' ? 'Bilgisayar' : (p2.trim() || 'Oyuncu 2');
    onStart({ mode, difficulty, names: [name1, name2] });
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
