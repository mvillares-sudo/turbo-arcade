import { useEffect, useRef, useState } from 'react';
import { setupCanvas } from '@/lib/canvasUtils';
import type { GameProps } from '@/lib/gameLoader';

const W = 480; const H = 600;
type Phase = 'idle' | 'counting' | 'result' | 'perfect';

export default function RallyCountdown({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [target, setTarget] = useState(10); const [current, setCurrent] = useState(0);
  const [round, setRound] = useState(0); const [total, setTotal] = useState(0);
  const [lastResult, setLastResult] = useState<string>('');
  const phaseRef = useRef<Phase>('idle'); const countRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRound = () => {
    const t = 7 + Math.floor(Math.random() * 8); setTarget(t); countRef.current = t + 1; setCurrent(t + 1);
    setPhase('counting'); phaseRef.current = 'counting';
    intervalRef.current = setInterval(() => { countRef.current -= 1; setCurrent(countRef.current); if (countRef.current < 0) { if (intervalRef.current) clearInterval(intervalRef.current); finishRound('late'); } }, 700);
  };

  const finishRound = (reason: 'early' | 'perfect' | 'late') => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const c = countRef.current; let pts = 0; let msg = '';
    if (reason === 'early') { pts = 0; msg = `Too early at ${c}!`; }
    else if (c === 0) { pts = 300; msg = 'PERFECT! +300'; }
    else if (c < 0) { pts = 0; msg = 'Too late!'; }
    else { pts = Math.max(0, 150 - c * 30); msg = `+${pts} (off by ${c})`; }
    const newTotal = total + pts; const newRound = round + 1; setTotal(newTotal); setRound(newRound); setLastResult(msg); onScore(newTotal);
    setPhase('result'); phaseRef.current = 'result';
    if (newRound >= 5) setTimeout(() => onGameOver(newTotal), 1000);
  };

  const handle = () => {
    const p = phaseRef.current;
    if (p === 'idle' || p === 'result') startRound();
    else if (p === 'counting') finishRound(countRef.current === 0 ? 'perfect' : 'early');
  };

  useEffect(() => {
    const ctx = setupCanvas(canvasRef.current!, W, H); if (!ctx) return;
    let raf = requestAnimationFrame(function loop() { draw(ctx, phaseRef.current, target, current, round, total, lastResult); raf = requestAnimationFrame(loop); });
    return () => cancelAnimationFrame(raf);
  }, [target, current, round, total, lastResult]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); handle(); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  function draw(ctx: CanvasRenderingContext2D, p: Phase, tgt: number, cur: number, r: number, tot: number, msg: string) {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1e293b'; ctx.fillRect(40, 100, W - 80, 300); ctx.strokeStyle = '#334155'; ctx.lineWidth = 3; ctx.strokeRect(40, 100, W - 80, 300);
    ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 16px Outfit'; ctx.textAlign = 'center'; ctx.fillText('COUNT DOWN TO ZERO', W / 2, 140);
    ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 20px Outfit'; ctx.fillText(`Target: 0  (from ${tgt})`, W / 2, 170);
    const showNum = p === 'counting' || p === 'perfect' ? cur : p === 'result' ? cur : '?';
    ctx.fillStyle = p === 'counting' && cur === 0 ? '#22c55e' : p === 'counting' && cur > 0 ? '#fff' : '#475569';
    ctx.font = 'bold 120px Space Grotesk'; ctx.fillText(String(showNum), W / 2, 290);
    if (p === 'counting') { const pct = 1 - cur / (tgt + 1); ctx.fillStyle = '#334155'; ctx.fillRect(60, 330, W - 120, 12); ctx.fillStyle = '#f97316'; ctx.fillRect(60, 330, (W - 120) * pct, 12); }
    if (msg) { ctx.fillStyle = msg.includes('PERFECT') ? '#22c55e' : msg.includes('Too') ? '#ef4444' : '#fbbf24'; ctx.font = 'bold 22px Outfit'; ctx.fillText(msg, W / 2, 390); }
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, 36); ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'left'; ctx.fillText(`Round ${r}/5`, 12, 24); ctx.textAlign = 'right'; ctx.fillText(`Total: ${tot}`, W - 12, 24);
    ctx.textAlign = 'center'; ctx.fillStyle = '#94a3b8'; ctx.font = '14px Outfit';
    const cta = p === 'idle' ? 'Click / Space to start' : p === 'counting' ? 'Click / Space at ZERO!' : p === 'result' ? 'Click / Space for next' : '';
    ctx.fillText(cta, W / 2, H - 30);
  }

  return <canvas ref={canvasRef} className="rounded-xl cursor-pointer" onClick={handle} />;
}
