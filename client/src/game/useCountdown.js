import { useEffect, useRef, useState } from 'react';

// Geri sayım kancası. active olduğunda saniyede bir azalır, 0'a inince onDone çağrılır.
// key değiştiğinde sayaç seconds değerine sıfırlanır (yeni tur için).
export function useCountdown(seconds, active, onDone, key) {
  const [remaining, setRemaining] = useState(seconds);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds, key]);

  useEffect(() => {
    if (!active) return;
    if (remaining <= 0) {
      onDoneRef.current?.();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [active, remaining, key]);

  return remaining;
}

// Hedef zaman damgasına (endsAt) göre geri sayım — online mod için (sunucu senkronu).
export function useDeadline(endsAt, onDone) {
  const [remaining, setRemaining] = useState(() =>
    endsAt ? Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)) : 0
  );
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!endsAt) return;
    let done = false;
    const tick = () => {
      const secs = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0 && !done) {
        done = true;
        onDoneRef.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endsAt]);

  return remaining;
}
