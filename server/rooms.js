// Online oyun oda yönetimi ve tur akışı.
// Sunucu turları üretir, cevapları toplar ve puanlar (istemciye güvenmez).

import {
  generateLetters,
  pickNumbers,
  randomTarget,
  solveNumbers,
  evaluateExpression,
  findLongestWords,
  scoreWord,
  scoreNumbers,
  canFormWord,
} from '@bkbi/shared';
import { WORDS, WORD_SET } from './dictionary.js';

const WORD_TIME_MS = 30_000;
const NUMBER_TIME_MS = 45_000;
const RESULT_TIME_MS = 6_000;
const EMPTY_ROOM_TTL_MS = 60_000;

const DEFAULT_SETTINGS = {
  wordTimeMs: 30000,
  numberTimeMs: 45000,
  maxPlayers: 2,
  totalRounds: 2,
  bigCountMode: 'random', // 'random', 1, 2, 3
};

function sanitizeSettings(settings = {}) {
  const wordTimeMs = [20000, 30000, 45000, 60000].includes(settings.wordTimeMs)
    ? settings.wordTimeMs
    : DEFAULT_SETTINGS.wordTimeMs;
  const numberTimeMs = [30000, 45000, 60000, 90000].includes(settings.numberTimeMs)
    ? settings.numberTimeMs
    : DEFAULT_SETTINGS.numberTimeMs;
  const maxPlayers = [2, 3, 4].includes(settings.maxPlayers)
    ? settings.maxPlayers
    : DEFAULT_SETTINGS.maxPlayers;
  const totalRounds = [2, 4, 6].includes(settings.totalRounds)
    ? settings.totalRounds
    : DEFAULT_SETTINGS.totalRounds;
  const bigCountMode = ['random', 1, 2, 3].includes(settings.bigCountMode)
    ? settings.bigCountMode
    : DEFAULT_SETTINGS.bigCountMode;

  return { wordTimeMs, numberTimeMs, maxPlayers, totalRounds, bigCountMode };
}

const rooms = new Map(); // code -> room

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // I,O,0,1 hariç
  let code;
  do {
    code = Array.from({ length: 4 }, () =>
      alphabet[Math.floor(Math.random() * alphabet.length)]
    ).join('');
  } while (rooms.has(code));
  return code;
}

function makePlayerId() {
  return Math.random().toString(36).slice(2, 10);
}

function publicPlayers(room) {
  return [...room.players.values()].map((p) => ({
    id: p.id,
    name: p.name,
    score: p.score,
    connected: p.connected,
    isHost: p.id === room.hostId,
  }));
}

export function createRoomManager(io) {
  function emitRoom(room, event, payload) {
    io.to(room.code).emit(event, payload);
  }

  function roomUpdate(room) {
    emitRoom(room, 'roomUpdate', {
      code: room.code,
      phase: room.phase,
      players: publicPlayers(room),
      settings: room.settings,
      currentRound: room.currentRoundIndex || 1,
      totalRounds: room.settings?.totalRounds || 2,
    });
  }

  function clearRoomTimers(room) {
    if (room.round?.timer) clearTimeout(room.round.timer);
    if (room.resultTimer) clearTimeout(room.resultTimer);
  }

  function destroyRoom(room) {
    clearRoomTimers(room);
    rooms.delete(room.code);
  }

  function scheduleEmptyCleanup(room) {
    if (room.cleanupTimer) clearTimeout(room.cleanupTimer);
    room.cleanupTimer = setTimeout(() => {
      const anyConnected = [...room.players.values()].some((p) => p.connected);
      if (!anyConnected) destroyRoom(room);
    }, EMPTY_ROOM_TTL_MS);
  }

  // ---- Tur akışı ----
  function startWordRound(room) {
    room.phase = 'word';
    const duration = room.settings?.wordTimeMs || WORD_TIME_MS;
    const letters = generateLetters(9);
    room.round = {
      type: 'word',
      letters,
      endsAt: nowPlus(duration),
      answers: new Map(),
    };
    roomUpdate(room);
    emitRoom(room, 'wordRound', {
      letters,
      endsAt: room.round.endsAt,
      roundIndex: room.currentRoundIndex,
      totalRounds: room.settings.totalRounds,
    });
    room.round.timer = setTimeout(() => finishWordRound(room), duration + 500);
  }

  function finishWordRound(room) {
    if (room.phase !== 'word') return;
    clearTimeout(room.round.timer);
    const { letters } = room.round;

    const playersList = Array.from(room.players.values());
    const answersList = playersList.map((player) => ({
      word: room.round.answers.get(player.id) || '',
      letters,
      wordSet: WORD_SET,
    }));

    const scored = calculateWordRoundScores(answersList);
    const results = playersList.map((player, i) => {
      const res = scored[i];
      player.score += res.points;
      return {
        playerId: player.id,
        name: player.name,
        word: res.word,
        valid: res.valid,
        points: res.points,
      };
    });

    const best = findLongestWords(letters, WORDS, 3);
    room.phase = 'wordResult';
    roomUpdate(room);
    emitRoom(room, 'wordResult', {
      letters,
      results,
      best,
      scores: publicPlayers(room),
      roundIndex: room.currentRoundIndex,
      totalRounds: room.settings.totalRounds,
    });

    const nextRound = () => {
      if (room.currentRoundIndex < room.settings.totalRounds) {
        room.currentRoundIndex++;
        if (room.currentRoundIndex % 2 === 1) {
          startWordRound(room);
        } else {
          startNumberRound(room);
        }
      } else {
        endGame(room);
      }
    };

    room.resultTimer = setTimeout(nextRound, RESULT_TIME_MS);
  }

  function startNumberRound(room) {
    room.phase = 'number';
    const duration = room.settings?.numberTimeMs || NUMBER_TIME_MS;
    let bigCount;
    const mode = room.settings?.bigCountMode;
    if (mode === 1 || mode === 2 || mode === 3) {
      bigCount = mode;
    } else {
      bigCount = 1 + Math.floor(Math.random() * 3); // 1..3 büyük sayı
    }

    const numbers = pickNumbers(bigCount);
    const target = randomTarget();
    room.round = {
      type: 'number',
      numbers,
      target,
      endsAt: nowPlus(duration),
      answers: new Map(),
    };
    roomUpdate(room);
    emitRoom(room, 'numberRound', {
      numbers,
      target,
      endsAt: room.round.endsAt,
      roundIndex: room.currentRoundIndex,
      totalRounds: room.settings.totalRounds,
    });
    room.round.timer = setTimeout(() => finishNumberRound(room), duration + 500);
  }

  function finishNumberRound(room) {
    if (room.phase !== 'number') return;
    clearTimeout(room.round.timer);
    const { numbers, target } = room.round;

    const playersList = Array.from(room.players.values());
    const answersList = playersList.map((player) => ({
      expr: room.round.answers.get(player.id) || '',
      numbers,
      target,
    }));

    const scored = calculateNumberRoundScores(answersList);
    const results = playersList.map((player, i) => {
      const res = scored[i];
      player.score += res.points;
      return {
        playerId: player.id,
        name: player.name,
        expr: res.expr,
        value: res.value,
        valid: res.valid,
        points: res.points,
      };
    });

    const best = solveNumbers(numbers, target);
    room.phase = 'numberResult';
    roomUpdate(room);
    emitRoom(room, 'numberResult', {
      numbers,
      target,
      results,
      best,
      scores: publicPlayers(room),
      roundIndex: room.currentRoundIndex,
      totalRounds: room.settings.totalRounds,
    });

    const nextRound = () => {
      if (room.currentRoundIndex < room.settings.totalRounds) {
        room.currentRoundIndex++;
        if (room.currentRoundIndex % 2 === 1) {
          startWordRound(room);
        } else {
          startNumberRound(room);
        }
      } else {
        endGame(room);
      }
    };

    room.resultTimer = setTimeout(nextRound, RESULT_TIME_MS);
  }

  function endGame(room) {
    room.phase = 'over';
    const players = publicPlayers(room);
    const top = Math.max(...players.map((p) => p.score));
    const winners = players.filter((p) => p.score === top);
    roomUpdate(room);
    emitRoom(room, 'gameOver', {
      scores: players,
      winner: winners.length === 1 ? winners[0] : null, // beraberlik -> null
    });
  }

  function checkAllAnswered(room) {
    const answered = [...room.players.values()].every((p) =>
      room.round.answers.has(p.id)
    );
    if (!answered) return;
    if (room.phase === 'word') finishWordRound(room);
    else if (room.phase === 'number') finishNumberRound(room);
  }

  // ---- Socket bağlantı işleyicisi ----
  return function handleConnection(socket) {
    socket.data.playerId = null;
    socket.data.roomCode = null;

    socket.on('createRoom', ({ name, settings } = {}, cb) => {
      const code = makeCode();
      const playerId = makePlayerId();
      const room = {
        code,
        hostId: playerId,
        phase: 'lobby',
        players: new Map(),
        round: null,
        settings: sanitizeSettings(settings),
        currentRoundIndex: 1,
      };
      room.players.set(playerId, {
        id: playerId,
        name: (name || 'Oyuncu 1').slice(0, 20),
        socketId: socket.id,
        score: 0,
        connected: true,
      });
      rooms.set(code, room);
      socket.join(code);
      socket.data.playerId = playerId;
      socket.data.roomCode = code;
      cb?.({
        ok: true,
        code,
        playerId,
        phase: room.phase,
        players: publicPlayers(room),
        settings: room.settings,
      });
      roomUpdate(room);
    });

    socket.on('joinRoom', ({ code, name } = {}, cb) => {
      code = (code || '').toUpperCase().trim();
      const room = rooms.get(code);
      if (!room) return cb?.({ ok: false, error: 'Oda bulunamadı' });
      const maxP = room.settings?.maxPlayers || 2;
      if (room.players.size >= maxP) return cb?.({ ok: false, error: 'Oda dolu' });
      if (room.phase !== 'lobby') return cb?.({ ok: false, error: 'Oyun başlamış' });

      const playerId = makePlayerId();
      room.players.set(playerId, {
        id: playerId,
        name: (name || `Oyuncu ${room.players.size + 1}`).slice(0, 20),
        socketId: socket.id,
        score: 0,
        connected: true,
      });
      socket.join(code);
      socket.data.playerId = playerId;
      socket.data.roomCode = code;
      if (room.cleanupTimer) clearTimeout(room.cleanupTimer);
      cb?.({
        ok: true,
        code,
        playerId,
        phase: room.phase,
        players: publicPlayers(room),
        settings: room.settings,
      });
      roomUpdate(room);
    });

    socket.on('updateSettings', ({ settings } = {}, cb) => {
      const room = rooms.get(socket.data.roomCode);
      if (!room || socket.data.playerId !== room.hostId) {
        return cb?.({ ok: false, error: 'Yetkiniz yok' });
      }
      if (room.phase !== 'lobby') {
        return cb?.({ ok: false, error: 'Oyun başladıktan sonra ayarlar değiştirilemez' });
      }

      room.settings = sanitizeSettings({ ...room.settings, ...settings });
      roomUpdate(room);
      cb?.({ ok: true, settings: room.settings });
    });

    socket.on('startGame', () => {
      const room = rooms.get(socket.data.roomCode);
      if (!room || socket.data.playerId !== room.hostId) return;
      if (room.players.size < 2 || room.phase !== 'lobby') return;
      room.currentRoundIndex = 1;
      startWordRound(room);
    });

    socket.on('submitWord', ({ word } = {}) => {
      const room = rooms.get(socket.data.roomCode);
      if (!room || room.phase !== 'word') return;
      room.round.answers.set(socket.data.playerId, String(word || ''));
      socket.to(room.code).emit('opponentSubmitted');
      checkAllAnswered(room);
    });

    socket.on('submitExpression', ({ expr } = {}) => {
      const room = rooms.get(socket.data.roomCode);
      if (!room || room.phase !== 'number') return;
      room.round.answers.set(socket.data.playerId, String(expr || ''));
      socket.to(room.code).emit('opponentSubmitted');
      checkAllAnswered(room);
    });

    // Bitince tekrar oyna: skorları sıfırla, lobiye dön (host tetikler).
    socket.on('playAgain', () => {
      const room = rooms.get(socket.data.roomCode);
      if (!room || socket.data.playerId !== room.hostId || room.phase !== 'over') return;
      clearRoomTimers(room);
      for (const p of room.players.values()) p.score = 0;
      room.phase = 'lobby';
      room.round = null;
      room.currentRoundIndex = 1;
      roomUpdate(room);
    });

    socket.on('leaveRoom', () => handleLeave(socket));
    socket.on('disconnect', () => handleLeave(socket, true));

    function handleLeave(socket, disconnected = false) {
      const room = rooms.get(socket.data.roomCode);
      if (!room) return;
      const player = room.players.get(socket.data.playerId);
      if (player) {
        if (disconnected) {
          player.connected = false;
        } else {
          room.players.delete(socket.data.playerId);
        }
      }
      socket.leave(room.code);
      emitRoom(room, 'playerLeft', { playerId: socket.data.playerId });

      // Oyun sırasında biri ayrılırsa turu durdur, lobiye/bekleme durumuna dön.
      if (room.phase !== 'lobby' && room.phase !== 'over') {
        clearRoomTimers(room);
        room.phase = 'lobby';
        room.round = null;
        room.currentRoundIndex = 1;
      }
      roomUpdate(room);

      const anyConnected = [...room.players.values()].some((p) => p.connected);
      if (!anyConnected || room.players.size === 0) scheduleEmptyCleanup(room);
    }
  };
}

// Date.now sarmalayıcı (tek yerde tutmak için).
function nowPlus(ms) {
  return Date.now() + ms;
}
