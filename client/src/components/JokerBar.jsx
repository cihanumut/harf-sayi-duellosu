export default function JokerBar({ jokers, mode, onUseHint, onAddExtraTime, onUseTargetHint }) {
  const isWordMode = mode === 'word';
  const isNumberMode = mode === 'number';

  return (
    <div className="joker-bar">
      <span className="joker-bar__title">⚡ Jokerlerin:</span>
      <div className="joker-bar__items">
        {isWordMode && (
          <button
            className="joker-btn"
            disabled={!jokers.hint || jokers.hint <= 0}
            onClick={onUseHint}
            title="Kelime İpucu Kullan"
          >
            <span className="joker-btn__icon">💡</span>
            <span className="joker-btn__label">İpucu</span>
            <span className="joker-btn__badge">{jokers.hint || 0}</span>
          </button>
        )}

        {isNumberMode && (
          <button
            className="joker-btn"
            disabled={!jokers.targetHint || jokers.targetHint <= 0}
            onClick={onUseTargetHint}
            title="İşlem İpucu Kullan"
          >
            <span className="joker-btn__icon">🎯</span>
            <span className="joker-btn__label">İşlem İpucu</span>
            <span className="joker-btn__badge">{jokers.targetHint || 0}</span>
          </button>
        )}

        <button
          className="joker-btn"
          disabled={!jokers.extraTime || jokers.extraTime <= 0}
          onClick={onAddExtraTime}
          title="+15 Saniye Ekle"
        >
          <span className="joker-btn__icon">⏱️</span>
          <span className="joker-btn__label">+15sn</span>
          <span className="joker-btn__badge">{jokers.extraTime || 0}</span>
        </button>
      </div>
    </div>
  );
}
