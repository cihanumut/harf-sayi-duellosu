import { useState } from 'react';
import MainMenu from './screens/MainMenu.jsx';
import OfflineSetup from './screens/OfflineSetup.jsx';
import OfflineGame from './game/OfflineGame.jsx';
import OnlineGame from './game/OnlineGame.jsx';
import HeaderBar from './components/HeaderBar.jsx';
import MarketModal from './components/MarketModal.jsx';
import HowToPlayModal from './components/HowToPlayModal.jsx';
import { useCoins } from './hooks/useCoins.js';
import { useJokers } from './hooks/useJokers.js';

import { ErrorBoundary } from './components/ErrorBoundary.jsx';

export default function App() {
  const [screen, setScreen] = useState('menu'); // menu | offlineSetup | offline | online
  const [config, setConfig] = useState(null);
  const [showMarket, setShowMarket] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const { coins, addCoins, spendCoins } = useCoins();
  const { jokers, buyJoker, consumeJoker } = useJokers();
  const [lastReward, setLastReward] = useState(0);

  const handleAwardCoins = (amount) => {
    addCoins(amount);
    setLastReward(amount);
  };

  const handleBuyJoker = (type, cost) => {
    return buyJoker(type, cost, spendCoins);
  };

  const toMenu = () => setScreen('menu');

  return (
    <div className="app-container">
      <HeaderBar
        coins={coins}
        lastReward={lastReward}
        onOpenMarket={() => setShowMarket(true)}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
      />

      <main className="app-content">
        {screen === 'menu' && (
          <MainMenu
            coins={coins}
            onOffline={() => setScreen('offlineSetup')}
            onOnline={() => setScreen('online')}
            onOpenMarket={() => setShowMarket(true)}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
          />
        )}
        {screen === 'offlineSetup' && (
          <OfflineSetup
            onBack={toMenu}
            onStart={(cfg) => { setConfig(cfg); setScreen('offline'); }}
          />
        )}
        {screen === 'offline' && config && (
          <ErrorBoundary onReset={toMenu}>
            <OfflineGame
              mode={config.mode}
              names={config.names}
              difficulty={config.difficulty}
              onExit={toMenu}
              onAwardCoins={handleAwardCoins}
              jokers={jokers}
              onConsumeJoker={consumeJoker}
            />
          </ErrorBoundary>
        )}
        {screen === 'online' && (
          <ErrorBoundary onReset={toMenu}>
            <OnlineGame
              onExit={toMenu}
              onAwardCoins={handleAwardCoins}
              jokers={jokers}
              onConsumeJoker={consumeJoker}
            />
          </ErrorBoundary>
        )}
      </main>

      {showMarket && (
        <MarketModal
          coins={coins}
          jokers={jokers}
          onBuy={handleBuyJoker}
          onClose={() => setShowMarket(false)}
        />
      )}

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}
