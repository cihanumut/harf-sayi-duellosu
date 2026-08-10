import { useState, useEffect } from 'react';

const STORAGE_KEY = 'harf_sayi_jokers';
const INITIAL_JOKERS = {
  hint: 1,        // Kelime İpucu
  extraTime: 1,   // +15sn Ek Süre
  targetHint: 1,  // İşlem Adım İpucu
};

export function useJokers() {
  const [jokers, setJokers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_JOKERS;
    } catch {
      return INITIAL_JOKERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jokers));
    } catch (e) {
      console.error('Failed to save jokers to localStorage', e);
    }
  }, [jokers]);

  const buyJoker = (type, cost, spendCoinsFn) => {
    if (!spendCoinsFn(cost)) {
      return false; // Not enough coins
    }
    setJokers((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
    }));
    return true;
  };

  const consumeJoker = (type) => {
    if (!jokers[type] || jokers[type] <= 0) return false;
    setJokers((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1),
    }));
    return true;
  };

  return { jokers, buyJoker, consumeJoker };
}
