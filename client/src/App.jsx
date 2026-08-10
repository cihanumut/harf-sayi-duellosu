import { useState } from 'react';
import MainMenu from './screens/MainMenu.jsx';
import OfflineSetup from './screens/OfflineSetup.jsx';
import OfflineGame from './game/OfflineGame.jsx';
import OnlineGame from './game/OnlineGame.jsx';

export default function App() {
  const [screen, setScreen] = useState('menu'); // menu | offlineSetup | offline | online
  const [config, setConfig] = useState(null);

  const toMenu = () => setScreen('menu');

  return (
    <div className="app">
      {screen === 'menu' && (
        <MainMenu onOffline={() => setScreen('offlineSetup')} onOnline={() => setScreen('online')} />
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
        />
      )}
      {screen === 'online' && <OnlineGame onExit={toMenu} />}
    </div>
  );
}
