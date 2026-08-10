import { useState, useEffect } from 'react';

export default function HeaderBar({ coins, lastReward }) {
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (lastReward && lastReward > 0) {
      setPop(true);
      const timer = setTimeout(() => setPop(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [coins, lastReward]);

  return (
    <header className="header-bar">
      <div className="header-bar__user">
        <div className="header-bar__avatar">🎮</div>
        <span className="header-bar__name">Oyuncu</span>
      </div>

      <div className={`header-bar__coin-badge ${pop ? 'header-bar__coin-badge--pop' : ''}`}>
        <span className="header-bar__coin-icon">🪙</span>
        <span className="header-bar__coin-val">{coins.toLocaleString('tr-TR')}</span>
        {pop && lastReward > 0 && (
          <span className="header-bar__reward-floater">+{lastReward}</span>
        )}
      </div>
    </header>
  );
}
