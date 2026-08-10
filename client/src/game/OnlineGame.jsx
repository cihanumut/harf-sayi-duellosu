import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../net/socket.js';
import WordPlay from './WordPlay.jsx';
import NumberPlay from './NumberPlay.jsx';
import { LetterTiles, NumberTiles, Panel, Scoreboard } from '../components/GameBits.jsx';

export default function OnlineGame({ onExit, onAwardCoins }) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [playerId, setPlayerId] = useState(null);
  const [room, setRoom] = useState(null); // {code, phase, players, settings, currentRound, totalRounds}
  const [round, setRound] = useState(null); // {type, letters|numbers, target?, endsAt, roundIndex, totalRounds}
  const [result, setResult] = useState(null);
  const [over, setOver] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [oppSubmitted, setOppSubmitted] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const roomRef = useRef(room);
  roomRef.current = room;
  const playerIdRef = useRef(playerId);
  playerIdRef.current = playerId;

  useEffect(() => {
    const socket = getSocket();
    setConnected(socket.connected);

    const onConnect = () => {
      setConnected(true);
      setError('');
      if (roomRef.current?.code && playerIdRef.current) {
        socket.emit('rejoinRoom', { code: roomRef.current.code, playerId: playerIdRef.current });
      }
    };
    const onConnectError = () => setError('Sunucuya bağlanılamadı. Sunucu çalışıyor mu?');
    const onRoomUpdate = (r) => {
      setRoom(r);
      if (r?.round) {
        setRound(r.round);
      }
    };
    const onWordRound = (d) => { setRound({ type: 'word', ...d }); setResult(null); setSubmitted(false); setOppSubmitted(false); };
    const onWordResult = (d) => setResult({ type: 'word', ...d });
    const onNumberRound = (d) => { setRound({ type: 'number', ...d }); setResult(null); setSubmitted(false); setOppSubmitted(false); };
    const onNumberResult = (d) => setResult({ type: 'number', ...d });
    const onGameOver = (d) => setOver(d);
    const onOpponentSubmitted = () => setOppSubmitted(true);
    const onPlayerLeft = () => setNotice('Rakip ayrıldı. Lobiye dönülüyor…');

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('roomUpdate', onRoomUpdate);
    socket.on('wordRound', onWordRound);
    socket.on('wordResult', onWordResult);
    socket.on('numberRound', onNumberRound);
    socket.on('numberResult', onNumberResult);
    socket.on('gameOver', onGameOver);
    socket.on('opponentSubmitted', onOpponentSubmitted);
    socket.on('playerLeft', onPlayerLeft);

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('roomUpdate', onRoomUpdate);
      socket.off('wordRound', onWordRound);
      socket.off('wordResult', onWordResult);
      socket.off('numberRound', onNumberRound);
      socket.off('numberResult', onNumberResult);
      socket.off('gameOver', onGameOver);
      socket.off('opponentSubmitted', onOpponentSubmitted);
      socket.off('playerLeft', onPlayerLeft);
    };
  }, []);

  // Lobiye dönünce eski tur/sonuç verisini temizle.
  useEffect(() => {
    if (room?.phase === 'lobby') { setRound(null); setResult(null); setOver(null); }
    if (room?.phase && room.phase !== 'over') setOver(null);
    if (room?.phase === 'lobby') setNotice('');
  }, [room?.phase]);

  function leave() {
    getSocket().emit('leaveRoom');
    onExit();
  }

  function createRoom() {
    setError('');
    getSocket().emit('createRoom', { name: name.trim() }, (res) => {
      if (res?.ok) {
        setPlayerId(res.playerId);
        setRoom({
          code: res.code,
          phase: res.phase,
          players: res.players,
          settings: res.settings,
        });
      } else {
        setError(res?.error || 'Oda oluşturulamadı');
      }
    });
  }

  function joinRoom() {
    setError('');
    getSocket().emit('joinRoom', { code: joinCode.trim(), name: name.trim() }, (res) => {
      if (res?.ok) {
        setPlayerId(res.playerId);
        setRoom({
          code: res.code,
          phase: res.phase,
          players: res.players,
          settings: res.settings,
        });
      } else {
        setError(res?.error || 'Odaya katılınamadı');
      }
    });
  }

  function updateRoomSettings(newSettings) {
    getSocket().emit('updateSettings', { settings: newSettings, code: room?.code, playerId }, (res) => {
      if (!res?.ok) {
        setError(res?.error || 'Ayarlar güncellenemedi');
      }
    });
  }

  const startGame = () => {
    setError('');
    getSocket().emit('startGame', { code: room?.code, playerId }, (res) => {
      if (res?.error) setError(res.error);
    });
  };

  const playAgain = () => {
    setOver(null);
    getSocket().emit('playAgain', { code: room?.code, playerId });
  };

  const submitWord = (word) => {
    setSubmitted(true);
    getSocket().emit('submitWord', { word, code: room?.code, playerId });
  };

  const submitExpr = (expr) => {
    setSubmitted(true);
    getSocket().emit('submitExpression', { expr, code: room?.code, playerId });
  };

  const me = room?.players?.find((p) => p.id === playerId);
  const isHost = !!me?.isHost;
  const maxPlayers = room?.settings?.maxPlayers || 2;

  // ---- Giriş ekranı (odaya katılmadan önce) ----
  if (!room) {
    return (
      <div className="game">
        <div className="game__top">
          <button className="btn btn--ghost" onClick={onExit}>← Menü</button>
          <span className={`conn ${connected ? 'conn--ok' : 'conn--bad'}`}>
            {connected ? '🟢 Sunucu Hazır' : '🟡 Sunucu Uyanıyor…'}
          </span>
        </div>
        <Panel title="Çevrimiçi Düello Lobisi">
          <div className="stack">
            {!connected && (
              <div className="notice notice--warning" style={{ fontSize: '0.88rem', padding: '10px 14px' }}>
                ⏳ <strong>Canlı sunucu uykudan uyanıyor.</strong> İlk bağlantı ~20-30 saniye sürebilir, lütfen bekleyin…
              </div>
            )}
            <input
              className="text-input"
              placeholder="Adınız"
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="btn btn--primary" disabled={!connected} onClick={createRoom}>
              {connected ? 'Oda Kur' : 'Sunucu Bağlanıyor…'}
            </button>
            <div className="divider">veya</div>
            <div className="btn-row">
              <input
                className="text-input text-input--code"
                placeholder="ODA KODU"
                value={joinCode}
                maxLength={4}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
              <button className="btn" disabled={!connected || joinCode.length < 4} onClick={joinRoom}>
                Katıl
              </button>
            </div>
            {error && <p className="hint hint--bad">{error}</p>}
          </div>
        </Panel>
      </div>
    );
  }

  // ---- Oda içi ----
  return (
    <div className="game">
      <div className="game__top">
        <button className="btn btn--ghost" onClick={leave}>← Ayrıl</button>
        <span className="room-code">Oda: {room.code}</span>
        <Scoreboard players={room.players} />
      </div>

      {notice && <p className="hint hint--bad">{notice}</p>}

      {room.phase === 'lobby' && (
        <Panel title="Bekleme Odası">
          <div className="stack stack--center">
            <p className="hint">Arkadaşına bu kodu ver:</p>
            <div className="big-code">{room.code}</div>

            {/* Oda Ayarları Kartı */}
            <div className="settings-card">
              <div className="settings-card__header">⚙️ Oda Ayarları & Kurallar</div>
              <div className="room-settings-badges">
                <span className="setting-badge">⏱️ Kelime: {room.settings?.wordTimeMs / 1000} sn</span>
                <span className="setting-badge">🔢 Sayı: {room.settings?.numberTimeMs / 1000} sn</span>
                <span className="setting-badge">👥 Kapasite: {room.players?.length}/{maxPlayers} Oyuncu</span>
                <span className="setting-badge">🔄 Toplam {room.settings?.totalRounds} Tur</span>
                <span className="setting-badge">
                  🎲 Büyük Sayı: {room.settings?.bigCountMode === 'random' ? 'Rastgele (1-3)' : `${room.settings?.bigCountMode} Adet`}
                </span>
              </div>
              {isHost && (
                <button className="btn btn--ghost" style={{ marginTop: '4px', fontSize: '0.9rem' }} onClick={() => setShowSettings(true)}>
                  ⚙️ Ayarları Düzenle
                </button>
              )}
            </div>

            <div className="lobby-players">
              {room.players.map((p) => (
                <span key={p.id} className="lobby-player">
                  {p.name}{p.isHost ? ' (kurucu)' : ''}
                </span>
              ))}
              {room.players.length < maxPlayers && (
                <span className="lobby-player lobby-player--empty">oyuncu bekleniyor… ({room.players.length}/{maxPlayers})</span>
              )}
            </div>

            {isHost ? (
              <button className="btn btn--primary btn--big" disabled={room.players.length < 2} onClick={startGame}>
                Oyunu Başlat
              </button>
            ) : (
              <p className="hint">Kurucunun oyunu başlatması bekleniyor…</p>
            )}
          </div>
        </Panel>
      )}

      {/* Oda Ayarları Modalı */}
      {showSettings && isHost && room.phase === 'lobby' && (
        <RoomSettingsModal
          settings={room.settings}
          onSave={(newSettings) => {
            updateRoomSettings(newSettings);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {room.phase === 'word' && (
        round?.type === 'word' ? (
          <Panel title={`${round.roundIndex || room.currentRound || 1}/${round.totalRounds || room.totalRounds || 2}. Tur — Kelime`}>
            {!submitted ? (
              <WordPlay
                key={round.endsAt}
                letters={round.letters || []}
                playerName={me?.name || 'Sen'}
                deadline={round.endsAt}
                onSubmit={submitWord}
                jokers={jokers}
                onConsumeJoker={onConsumeJoker}
              />
            ) : (
              <Waiting oppSubmitted={oppSubmitted} />
            )}
          </Panel>
        ) : (
          <Panel title="Kelime Turu Başlıyor">
            <div className="stack stack--center" style={{ padding: '20px 0' }}>
              <div className="spinner"></div>
              <p className="hint">Harfler çekiliyor, oyun başlayacak…</p>
            </div>
          </Panel>
        )
      )}

      {room.phase === 'number' && (
        round?.type === 'number' ? (
          <Panel title={`${round.roundIndex || room.currentRound || 2}/${round.totalRounds || room.totalRounds || 2}. Tur — Sayı`}>
            {!submitted ? (
              <NumberPlay
                key={round.endsAt}
                numbers={round.numbers || []}
                target={round.target || 0}
                playerName={me?.name || 'Sen'}
                deadline={round.endsAt}
                onSubmit={submitExpr}
                jokers={jokers}
                onConsumeJoker={onConsumeJoker}
              />
            ) : (
              <Waiting oppSubmitted={oppSubmitted} />
            )}
          </Panel>
        ) : (
          <Panel title="Sayı Turu Başlıyor">
            <div className="stack stack--center" style={{ padding: '20px 0' }}>
              <div className="spinner"></div>
              <p className="hint">Sayılar hazırlanıyor, oyun başlayacak…</p>
            </div>
          </Panel>
        )
      )}

      {room.phase === 'wordResult' && (
        result?.type === 'word' ? (
          <Panel title={`Kelime Turu Sonucu (${result.roundIndex || room.currentRound || 1}/${result.totalRounds || room.totalRounds || 2})`}>
            <LetterTiles letters={result.letters || []} />
            <div className="results">
              {(result.results || []).map((r) => (
                <ResultRow key={r.playerId} name={r.name} main={r.word || '—'} valid={r.valid} points={r.points} />
              ))}
            </div>
            <p className="hint">En uzunlardan: {(result.best || []).map((w) => w.toLocaleUpperCase('tr-TR')).join(', ') || '—'}</p>
            <p className="hint">
              {(result.roundIndex || 1) < (result.totalRounds || 2) ? 'Sonraki tur birazdan başlıyor…' : 'Sonuçlar hesaplanıyor…'}
            </p>
          </Panel>
        ) : (
          <Panel title="Kelime Turu Sonucu">
            <div className="stack stack--center" style={{ padding: '20px 0' }}>
              <div className="spinner"></div>
              <p className="hint">Puanlar hesaplanıyor…</p>
            </div>
          </Panel>
        )
      )}

      {room.phase === 'numberResult' && (
        result?.type === 'number' ? (
          <Panel title={`Sayı Turu Sonucu (${result.roundIndex || room.currentRound || 2}/${result.totalRounds || room.totalRounds || 2})`}>
            <div className="target">Hedef: <strong>{result.target}</strong></div>
            <NumberTiles numbers={result.numbers || []} />
            <div className="results">
              {(result.results || []).map((r) => (
                <ResultRow key={r.playerId} name={r.name} main={r.value != null ? `${r.value}` : '—'} sub={r.expr} valid={r.valid} points={r.points} />
              ))}
            </div>
            <p className="hint">En iyi: {result.best ? `${result.best.value} = ${result.best.expr}` : '—'}</p>
            <p className="hint">
              {(result.roundIndex || 2) < (result.totalRounds || 2) ? 'Sonraki tur birazdan başlıyor…' : 'Oyun tamamlanıyor…'}
            </p>
          </Panel>
        ) : (
          <Panel title="Sayı Turu Sonucu">
            <div className="stack stack--center" style={{ padding: '20px 0' }}>
              <div className="spinner"></div>
              <p className="hint">Sonuçlar yükleniyor…</p>
            </div>
          </Panel>
        )
      )}

      {room.phase === 'over' && over && (
        <OnlineGameOver over={over} isHost={isHost} playAgain={playAgain} leave={leave} me={me} onAwardCoins={onAwardCoins} />
      )}
    </div>
  );
}

function OnlineGameOver({ over, isHost, playAgain, leave, me, onAwardCoins }) {
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [rewardCoins, setRewardCoins] = useState(0);

  const isWinner = over.winner && me && over.winner.id === me.id;
  const isTie = !over.winner;

  useEffect(() => {
    if (!rewardClaimed && onAwardCoins) {
      let earned = 10;
      if (isWinner) earned = 50;
      else if (isTie) earned = 25;
      
      setRewardCoins(earned);
      onAwardCoins(earned);
      setRewardClaimed(true);
    }
  }, [rewardClaimed, isWinner, isTie, onAwardCoins]);

  return (
    <Panel title="Oyun Bitti">
      <div className="stack stack--center">
        <h2 className="winner">
          {over.winner ? `${over.winner.name} kazandı! 🏆` : 'Berabere! 🤝'}
        </h2>

        {rewardCoins > 0 && (
          <div className="coin-reward-banner">
            <span className="coin-reward-banner__icon">🪙</span>
            <span className="coin-reward-banner__text"> Harika! <strong>+{rewardCoins} Coin</strong> kazandın!</span>
          </div>
        )}

        <Scoreboard players={over.scores} />
        <div className="btn-row">
          {isHost && <button className="btn btn--primary" onClick={playAgain}>Tekrar Oyna</button>}
          <button className="btn btn--ghost" onClick={leave}>Ayrıl</button>
        </div>
        {!isHost && <p className="hint">Kurucu yeni oyun başlatabilir.</p>}
      </div>
    </Panel>
  );
}

function RoomSettingsModal({ settings, onSave, onClose }) {
  const [wordTimeMs, setWordTimeMs] = useState(settings?.wordTimeMs || 30000);
  const [numberTimeMs, setNumberTimeMs] = useState(settings?.numberTimeMs || 45000);
  const [maxPlayers, setMaxPlayers] = useState(settings?.maxPlayers || 2);
  const [totalRounds, setTotalRounds] = useState(settings?.totalRounds || 2);
  const [bigCountMode, setBigCountMode] = useState(settings?.bigCountMode || 'random');

  function handleSave() {
    onSave({ wordTimeMs, numberTimeMs, maxPlayers, totalRounds, bigCountMode });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">⚙️ Oda Ayarlarını Özelleştir</h3>
        <div className="stack" style={{ gap: '10px' }}>
          <div className="settings-group-card">
            <label className="field-label">⏱️ Kelime Turu Süresi</label>
            <div className="pill-group">
              {[20000, 30000, 45000, 60000].map((ms) => (
                <button
                  key={ms}
                  className={`pill-btn ${wordTimeMs === ms ? 'pill-btn--active' : ''}`}
                  onClick={() => setWordTimeMs(ms)}
                >
                  {ms / 1000} sn
                </button>
              ))}
            </div>
          </div>

          <div className="settings-group-card">
            <label className="field-label">🔢 Sayı Turu Süresi</label>
            <div className="pill-group">
              {[30000, 45000, 60000, 90000].map((ms) => (
                <button
                  key={ms}
                  className={`pill-btn ${numberTimeMs === ms ? 'pill-btn--active' : ''}`}
                  onClick={() => setNumberTimeMs(ms)}
                >
                  {ms / 1000} sn
                </button>
              ))}
            </div>
          </div>

          <div className="settings-group-card">
            <label className="field-label">👥 Maksimum Oyuncu Kapasitesi</label>
            <div className="pill-group">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  className={`pill-btn ${maxPlayers === count ? 'pill-btn--active' : ''}`}
                  onClick={() => setMaxPlayers(count)}
                >
                  {count} Oyuncu
                </button>
              ))}
            </div>
          </div>

          <div className="settings-group-card">
            <label className="field-label">🔄 Toplam Tur Sayısı</label>
            <div className="pill-group">
              {[2, 4, 6].map((count) => (
                <button
                  key={count}
                  className={`pill-btn ${totalRounds === count ? 'pill-btn--active' : ''}`}
                  onClick={() => setTotalRounds(count)}
                >
                  {count} Tur ({count / 2}K + {count / 2}S)
                </button>
              ))}
            </div>
          </div>

          <div className="settings-group-card">
            <label className="field-label">🎲 Büyük Sayı Seçim Kuralı</label>
            <div className="pill-group">
              {[
                { val: 'random', label: 'Rastgele (1-3)' },
                { val: 1, label: '1 Adet' },
                { val: 2, label: '2 Adet' },
                { val: 3, label: '3 Adet' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  className={`pill-btn ${bigCountMode === opt.val ? 'pill-btn--active' : ''}`}
                  onClick={() => setBigCountMode(opt.val)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="btn-row" style={{ marginTop: '14px' }}>
            <button className="btn btn--primary btn--big" style={{ minWidth: '140px' }} onClick={handleSave}>
              Kaydet & Uygula
            </button>
            <button className="btn btn--ghost" onClick={onClose}>Vazgeç</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Waiting({ oppSubmitted }) {
  return (
    <div className="stack stack--center">
      <div className="spinner" />
      <p className="hint">Cevabın alındı. {oppSubmitted ? 'Sonuçlar hesaplanıyor…' : 'Rakip bekleniyor…'}</p>
    </div>
  );
}

function ResultRow({ name, main, sub, valid, points }) {
  return (
    <div className={`result-row ${valid ? '' : 'result-row--invalid'}`}>
      <span className="result-row__name">{name}</span>
      <span className="result-row__main">
        {String(main).toLocaleUpperCase('tr-TR')}
        {sub && <span className="result-row__sub">{sub}</span>}
      </span>
      <span className="result-row__pts">+{points}</span>
    </div>
  );
}

