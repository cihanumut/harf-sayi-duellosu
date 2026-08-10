import { useState } from 'react';
import MainMenu from './screens/MainMenu.jsx';
import OfflineSetup from './screens/OfflineSetup.jsx';
import OfflineGame from './game/OfflineGame.jsx';
import OnlineGame from './game/OnlineGame.jsx';
import HeaderBar from './components/HeaderBar.jsx';
import MarketModal from './components/MarketModal.jsx';
import { useCoins } from './hooks/useCoins.js';
import { useJokers } from './hooks/useJokers.js';

export default function App() {
  const [screen, setScreen] = useState('menu'); // menu | offlineSetup | offline | online
  const [config, setConfig] = useState(null);
  const [showMarket, setShowMarket] = useState(false);
  
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
      />

      <main className="app-content">
        {screen === 'menu' && (
          <MainMenu
            coins={coins}
            onOffline={() => setScreen('offlineSetup')}
            onOnline={() => setScreen('online')}
            onOpenMarket={() => setShowMarket(true)}
          />
        )}
        {screen === 'offlineSetup' && (
          <OfflineSetup
            onBack={toMenu}
            onStart={(cfg) => { setConfig(cfg); setScreen('offline'); }}
          />
        )}
        {screen === 'offline' && config && (
          <OfflineGame
            mode={config.mode}
            names={config.names}
            difficulty={config.difficulty}
            onExit={toMenu}
            onAwardCoins={handleAwardCoins}
            jokers={jokers}
            onConsumeJoker={consumeJoker}
          />
        )}
        {screen === 'online' && (
          <OnlineGame
            onExit={toMenu}
            onAwardCoins={handleAwardCoins}
            jokers={jokers}
            onConsumeJoker={consumeJoker}
          />
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
    </div>
  );
}
