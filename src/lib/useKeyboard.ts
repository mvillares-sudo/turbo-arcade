import { useEffect, useRef } from 'react';

export function useKeyboard(keys: string[], onKey: (key: string, down: boolean) => void) {
  const cbRef = useRef(onKey);
  cbRef.current = onKey;

  useEffect(() => {
    const handler = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      if (keys.includes(k)) {
        e.preventDefault();
        cbRef.current(k, down);
      }
    };
    const downH = (e: KeyboardEvent) => handler(e, true);
    const upH = (e: KeyboardEvent) => handler(e, false);
    window.addEventListener('keydown', downH);
    window.addEventListener('keyup', upH);
    return () => {
      window.removeEventListener('keydown', downH);
      window.removeEventListener('keyup', upH);
    };
  }, [keys.join(',')]);
}
