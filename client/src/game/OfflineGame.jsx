import { useState, useEffect } from 'react';
import {
  canFormWord,
  trLower,
  evaluateExpression,
  findLongestWords,
  solveNumbers,
  calculateWordRoundScores,
  calculateNumberRoundScores,
} from '@bkbi/shared';
import { WORDS, WORD_SET } from './dictionary.js';
import { cpuWord, cpuNumbers } from './cpu.js';
import LetterPicker from './LetterPicker.jsx';
import NumberPicker from './NumberPicker.jsx';
import WordPlay from './WordPlay.jsx';
import NumberPlay from './NumberPlay.jsx';
import { LetterTiles, NumberTiles, Panel, Scoreboard } from '../components/GameBits.jsx';

// mode: 'cpu' | '2p'
export default function OfflineGame({ mode, names, difficulty, onExit, onAwardCoins, jokers, onConsumeJoker }) {
  const humans = mode === 'cpu' ? [0] : [0, 1];
  const [players, setPlayers] = useState([
    { name: names[0], score: 0 },
    { name: names[1], score: 0 },
  ]);
  const [phase, setPhase] = useState('wordSelect');
  const [letters, setLetters] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [target, setTarget] = useState(0);
  const [turnIdx, setTurnIdx] = useState(0);
  const [armed, setArmed] = useState(mode !== '2p');
  const [answers, setAnswers] = useState({}); // playerIndex -> raw answer
  const [wordResults, setWordResults] = useState(null);
  const [numberResults, setNumberResults] = useState(null);
  const [bestWords, setBestWords] = useState([]);
  const [bestNumber, setBestNumber] = useState(null);

  const addScores = (delta) =>
    setPlayers((prev) => prev.map((p, i) => ({ ...p, score: p.score + (delta[i] || 0) })));

  function startTurn(idx) {
    setTurnIdx(idx);
    setArmed(mode !== '2p');
  }

  // ---- Kelime turu ----
  function onLettersReady(ls) {
    setLetters(ls);
    setAnswers({});
    setPhase('wordPlay');
    startTurn(0);
  }

  function submitWord(wordRaw) {
    const pIdx = humans[turnIdx];
    const newAnswers = { ...answers, [pIdx]: wordRaw };
    setAnswers(newAnswers);

    if (turnIdx + 1 < humans.length) {
      startTurn(turnIdx + 1);
      return;
    }

    if (mode === 'cpu') {
      const cpuAns = cpuWord(letters, difficulty);
      newAnswers[1] = cpuAns;
    }

    const scoredWords = calculateWordRoundScores([
      { word: newAnswers[0], letters, wordSet: WORD_SET },
      { word: newAnswers[1], letters, wordSet: WORD_SET },
    ]);

    addScores([scoredWords[0].points, scoredWords[1].points]);

    setWordResults([
      { name: players[0].name, ...scoredWords[0] },
      { name: players[1].name, ...scoredWords[1] },
    ]);
    setBestWords(findLongestWords(letters, WORDS));
    setPhase('wordResult');
  }

  // ---- Sayı turu ----
  function onNumbersReady({ numbers: ns, target: t }) {
    setNumbers(ns);
    setTarget(t);
    setAnswers({});
    setPhase('numberPlay');
    startTurn(0);
  }

  function submitExpr(exprRaw) {
    const pIdx = humans[turnIdx];
    const newAnswers = { ...answers, [pIdx]: exprRaw };
    setAnswers(newAnswers);

    if (turnIdx + 1 < humans.length) {
      startTurn(turnIdx + 1);
      return;
    }

    if (mode === 'cpu') {
      const cpuAns = cpuNumbers(numbers, target, difficulty);
      newAnswers[1] = cpuAns;
    }

    const scoredNumbers = calculateNumberRoundScores([
      { expr: newAnswers[0], numbers, target },
      { expr: newAnswers[1], numbers, target },
    ]);

    addScores([scoredNumbers[0].points, scoredNumbers[1].points]);

    setNumberResults([
      { name: players[0].name, ...scoredNumbers[0] },
      { name: players[1].name, ...scoredNumbers[1] },
    ]);
    setBestNumber(solveNumbers(numbers, target));
    setPhase('numberResult');
  }

  // ---- Render ----
  const chooserName = players[0].name; // kelime turunu 1. oyuncu seçer
  const numberChooser = mode === '2p' ? players[1].name : players[0].name;

  return (
    <div className="game">
      <div className="game__top">
        <button className="btn btn--ghost" onClick={onExit}>← Menü</button>
        <Scoreboard players={players} />
      </div>

      {phase === 'wordSelect' && (
        <Panel title="1. Tur — Kelime">
          <LetterPicker chooserName={chooserName} onComplete={onLettersReady} />
        </Panel>
      )}

      {phase === 'wordPlay' && !armed && (
        <Panel title="1. Tur — Kelime">
          <TurnGate name={players[humans[turnIdx]].name} onStart={() => setArmed(true)} />
        </Panel>
      )}
      {phase === 'wordPlay' && armed && (
        <Panel title="1. Tur — Kelime">
          <WordPlay
            key={`w-${turnIdx}`}
            letters={letters}
            playerName={players[humans[turnIdx]].name}
            onSubmit={submitWord}
            jokers={jokers}
            onConsumeJoker={onConsumeJoker}
          />
        </Panel>
      )}

      {phase === 'wordResult' && (
        <Panel
          title="Kelime Turu Sonucu"
          footer={<button className="btn btn--primary" onClick={() => setPhase('numberSelect')}>Sayı Turuna Geç →</button>}
        >
          <LetterTiles letters={letters} />
          <div className="results">
            {wordResults.map((r, i) => (
              <ResultRow key={i} name={r.name} main={r.word || '—'} valid={r.valid} points={r.points} />
            ))}
          </div>
          <p className="hint">
            En uzunlardan: {bestWords.map((w) => w.toLocaleUpperCase('tr-TR')).join(', ') || '—'}
          </p>
        </Panel>
      )}

      {phase === 'numberSelect' && (
        <Panel title="2. Tur — Sayı">
          <NumberPicker chooserName={numberChooser} onComplete={onNumbersReady} />
        </Panel>
      )}

      {phase === 'numberPlay' && !armed && (
        <Panel title="2. Tur — Sayı">
          <TurnGate name={players[humans[turnIdx]].name} onStart={() => setArmed(true)} />
        </Panel>
      )}
      {phase === 'numberPlay' && armed && (
        <Panel title="2. Tur — Sayı">
          <NumberPlay
            key={`n-${turnIdx}`}
            numbers={numbers}
            target={target}
            playerName={players[humans[turnIdx]].name}
            onSubmit={submitExpr}
            jokers={jokers}
            onConsumeJoker={onConsumeJoker}
          />
        </Panel>
      )}

      {phase === 'numberResult' && (
        <Panel
          title="Sayı Turu Sonucu"
          footer={<button className="btn btn--primary" onClick={() => setPhase('gameOver')}>Sonuçlar →</button>}
        >
          <div className="target">Hedef: <strong>{target}</strong></div>
          <NumberTiles numbers={numbers} />
          <div className="results">
            {numberResults.map((r, i) => (
              <ResultRow
                key={i}
                name={r.name}
                main={r.value != null ? `${r.value}` : '—'}
                sub={r.expr}
                valid={r.valid}
                points={r.points}
              />
            ))}
          </div>
          <p className="hint">
            En iyi: {bestNumber ? `${bestNumber.value} = ${bestNumber.expr}` : '—'}
          </p>
        </Panel>
      )}

      {phase === 'gameOver' && (
        <GameOver players={players} onExit={onExit} onReplay={replay} onAwardCoins={onAwardCoins} />
      )}
    </div>
  );

  function replay() {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
    setAnswers({});
    setWordResults(null);
    setNumberResults(null);
    setPhase('wordSelect');
    startTurn(0);
  }
}

function TurnGate({ name, onStart }) {
  return (
    <div className="stack stack--center">
      <p className="turn-label">Sıra sende, <strong>{name}</strong></p>
      <p className="hint">Hazır olduğunda başlat. Rakibin ekrana bakmasın!</p>
      <button className="btn btn--big btn--primary" onClick={onStart}>Başla</button>
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

function GameOver({ players, onExit, onReplay, onAwardCoins }) {
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [rewardCoins, setRewardCoins] = useState(0);

  const top = Math.max(...players.map((p) => p.score));
  const winners = players.filter((p) => p.score === top);
  const isHumanWinner = winners.some((w) => w.name === players[0].name);
  const isTie = winners.length > 1 && isHumanWinner;

  useEffect(() => {
    if (!rewardClaimed && onAwardCoins) {
      let earned = 5;
      if (isHumanWinner && !isTie) earned = 50;
      else if (isTie) earned = 20;
      
      setRewardCoins(earned);
      onAwardCoins(earned);
      setRewardClaimed(true);
    }
  }, [rewardClaimed, isHumanWinner, isTie, onAwardCoins]);

  const msg = winners.length === 1 ? `${winners[0].name} kazandı! 🏆` : 'Berabere! 🤝';
  return (
    <Panel title="Oyun Bitti">
      <div className="stack stack--center">
        <h2 className="winner">{msg}</h2>
        
        {rewardCoins > 0 && (
          <div className="coin-reward-banner">
            <span className="coin-reward-banner__icon">🪙</span>
            <span className="coin-reward-banner__text"> Tebrikler! <strong>+{rewardCoins} Coin</strong> kazandın!</span>
          </div>
        )}

        <Scoreboard players={players} />
        <div className="btn-row">
          <button className="btn btn--primary" onClick={onReplay}>Tekrar Oyna</button>
          <button className="btn btn--ghost" onClick={onExit}>Ana Menü</button>
        </div>
      </div>
    </Panel>
  );
}
