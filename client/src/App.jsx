import { useState } from 'react';
import MainMenu from './screens/MainMenu.jsx';
import OfflineSetup from './screens/OfflineSetup.jsx';
import OfflineGame from './game/OfflineGame.jsx';
import OnlineGame from './game/OnlineGame.jsx';
import HeaderBar from './components/HeaderBar.jsx';
import { useCoins } from './hooks/useCoins.js';

export default function App() {
  const [screen, setScreen] = useState('menu'); // menu | offlineSetup | offline | online
  const [config, setConfig] = useState(null);
  const { coins, addCoins } = useCoins();
  const [lastReward, setLastReward] = useState(0);

  const handleAwardCoins = (amount) => {
    addCoins(amount);
    setLastReward(amount);
  };

  const toMenu = () => setScreen('menu');

  return (
    <div className="app-container">
      <HeaderBar coins={coins} lastReward={lastReward} />

      <main className="app-content">
        {screen === 'menu' && (
          <MainMenu
            coins={coins}
            onOffline={() => setScreen('offlineSetup')}
            onOnline={() => setScreen('online')}
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
          />
        )}
        {screen === 'online' && (
          <OnlineGame onExit={toMenu} onAwardCoins={handleAwardCoins} />
        )}
      </main>
    </div>
  );
}
