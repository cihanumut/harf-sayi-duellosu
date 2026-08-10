import { useState } from 'react';

const MARKET_ITEMS = [
  {
    id: 'hint',
    title: 'Kelime İpucu',
    icon: '💡',
    cost: 30,
    desc: 'Harflerden türetilebilecek en uzun kelimenin uzunluğunu ve ilk harfini gösterir.',
  },
  {
    id: 'extraTime',
    title: 'Ek Süre (+15sn)',
    icon: '⏱️',
    cost: 20,
    desc: 'Düşünme ve yanıt verme sürenize anında +15 saniye ekler.',
  },
  {
    id: 'targetHint',
    title: 'İşlem İpucu',
    icon: '🎯',
    cost: 25,
    desc: 'Sayı turunda hedefe yaklaşmak için ilk işlem adımını tavsiye eder.',
  },
];

export default function MarketModal({ coins, jokers, onBuy, onClose }) {
  const [feedback, setFeedback] = useState(null);

  const handleBuy = (item) => {
    const success = onBuy(item.id, item.cost);
    if (success) {
      setFeedback({ type: 'success', text: `1 adet ${item.title} alındı! 🎉` });
    } else {
      setFeedback({ type: 'error', text: 'Yetersiz Coin! 🪙 Galibiyet kazanarak coin biriktirebilirsiniz.' });
    }

    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card market-modal" onClick={(e) => e.stopPropagation()}>
        <div className="market-modal__header">
          <div className="market-modal__title-group">
            <h2 className="market-modal__title">🛒 Joker Mağazası</h2>
            <p className="market-modal__sub">Oyunlarda avantaj kazanmak için joker stoklayın!</p>
          </div>
          <div className="market-modal__coins">
            <span className="market-modal__coin-icon">🪙</span>
            <span className="market-modal__coin-val">{coins}</span>
          </div>
        </div>

        {feedback && (
          <div className={`market-feedback market-feedback--${feedback.type}`}>
            {feedback.text}
          </div>
        )}

        <div className="market-items stack">
          {MARKET_ITEMS.map((item) => {
            const owned = jokers[item.id] || 0;
            const canAfford = coins >= item.cost;
            return (
              <div key={item.id} className="market-item">
                <div className="market-item__icon">{item.icon}</div>
                <div className="market-item__info">
                  <div className="market-item__title-row">
                    <strong className="market-item__name">{item.title}</strong>
                    <span className="market-item__owned">Stok: {owned}</span>
                  </div>
                  <p className="market-item__desc">{item.desc}</p>
                </div>
                <button
                  className={`btn ${canAfford ? 'btn--primary' : 'btn--ghost'} market-item__buy-btn`}
                  disabled={!canAfford}
                  onClick={() => handleBuy(item)}
                >
                  {item.cost} 🪙 Al
                </button>
              </div>
            );
          })}
        </div>

        <div className="market-modal__footer">
          <button className="btn btn--big" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
