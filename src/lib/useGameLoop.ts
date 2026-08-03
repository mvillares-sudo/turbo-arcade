import { useEffect, useRef } from 'react';

export function useGameLoop(callback: (dt: number) => void, active: boolean) {
  const cbRef = useRef(callback);
  cbRef.current = callback;
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    lastRef.current = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      cbRef.current(dt);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);
}
