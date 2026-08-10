import { useState, useEffect } from 'react';

const STORAGE_KEY = 'harf_sayi_coins';
const INITIAL_COINS = 100;

export function useCoins() {
  const [coins, setCoins] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? parseInt(saved, 10) : INITIAL_COINS;
    } catch {
      return INITIAL_COINS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, coins.toString());
    } catch (e) {
      console.error('Failed to save coins to localStorage', e);
    }
  }, [coins]);

  const addCoins = (amount) => {
    if (amount <= 0) return;
    setCoins((prev) => prev + amount);
  };

  const spendCoins = (amount) => {
    if (coins < amount) return false;
    setCoins((prev) => prev - amount);
    return true;
  };

  return { coins, addCoins, spendCoins };
}
