import { Panel } from '../components/GameBits.jsx';

export default function MainMenu({ onOffline, onOnline }) {
  return (
    <div className="menu">
      <h1 className="title">Harf &amp; Sayı<br />Düellosu</h1>
      <p className="subtitle">9 harften en uzun kelime, 6 sayıdan hedefe!</p>
      <Panel>
        <div className="stack stack--center">
          <button className="btn btn--big btn--primary" onClick={onOffline}>
            🎮 Offline Oyna
          </button>
          <button className="btn btn--big" onClick={onOnline}>
            🌐 Online Oyna
          </button>
        </div>
      </Panel>
      <p className="foot">Bilgisayara karşı, aynı ekranda 2 kişi veya oda koduyla uzaktan.</p>
    </div>
  );
}
