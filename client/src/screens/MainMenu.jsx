import { Panel } from '../components/GameBits.jsx';

export default function MainMenu({ onOffline, onOnline, onOpenMarket, onOpenHowToPlay, coins }) {
  return (
    <div className="menu">
      <div className="menu__hero">
        <div className="menu__badge-row">
          <span className="menu__badge">🏆 YENİ SEZON</span>
          <span className="menu__badge menu__badge--gold">✨ ONLİNE LOBİ AÇIK</span>
        </div>
        <h1 className="title">
          <span className="title__letters">HARF</span> &amp; <span className="title__numbers">SAYI</span>
          <br />
          <span className="title__sub">DÜELLOSU</span>
        </h1>
        <p className="subtitle">9 harften en uzun kelimeyi türet, 6 sayı ile hedefe ulaş!</p>
      </div>

      <Panel>
        <div className="menu__options stack">
          <button className="mode-card mode-card--primary" onClick={onOffline}>
            <div className="mode-card__icon">🤖</div>
            <div className="mode-card__info">
              <span className="mode-card__title">Tek Oyunculu &amp; Yerel</span>
              <span className="mode-card__desc">Yapay zekaya karşı veya aynı cihazda 2 kişi oyna</span>
            </div>
            <div className="mode-card__badge">Ücretsiz</div>
          </button>

          <button className="mode-card mode-card--accent" onClick={onOnline}>
            <div className="mode-card__icon">🌐</div>
            <div className="mode-card__info">
              <span className="mode-card__title">Çevrimiçi (Online) Düello</span>
              <span className="mode-card__desc">Canlı rakiplerle yarış, oda oluştur veya odaya katıl</span>
            </div>
            <div className="mode-card__badge mode-card__badge--gold">+50 🪙 Ödül</div>
          </button>

          <button className="mode-card mode-card--gold" onClick={onOpenMarket}>
            <div className="mode-card__icon">🛒</div>
            <div className="mode-card__info">
              <span className="mode-card__title">Joker Mağazası</span>
              <span className="mode-card__desc">İpucu, ek süre ve işlem yardımcısı satın al</span>
            </div>
            <div className="mode-card__badge mode-card__badge--gold">Mağaza</div>
          </button>

          <button className="mode-card mode-card--info" onClick={onOpenHowToPlay}>
            <div className="mode-card__icon">📖</div>
            <div className="mode-card__info">
              <span className="mode-card__title">Nasıl Oynanır &amp; Puanlama</span>
              <span className="mode-card__desc">Oyun kurallarını, tur mantığını ve puan tablosunu öğren</span>
            </div>
            <div className="mode-card__badge">Rehber</div>
          </button>
        </div>
      </Panel>

      <div className="menu__stats">
        <div className="stat-pill" onClick={onOpenMarket} style={{ cursor: 'pointer' }}>
          <span className="stat-pill__icon">🪙</span>
          <span className="stat-pill__label">Mevcut Bakiyeniz:</span>
          <strong className="stat-pill__val">{coins} Coin</strong>
          <span className="stat-pill__action">🛒 Mağaza</span>
        </div>
      </div>

      <p className="foot">📱 Telefon, tablet ve bilgisayarda tam uyumlu oynanabilir.</p>
    </div>
  );
}
