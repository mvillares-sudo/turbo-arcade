import { useEffect, useRef, useState } from 'react';
import { setupCanvas } from '@/lib/canvasUtils';
import type { GameProps } from '@/lib/gameLoader';

const W = 480;
const H = 600;
type Phase = 'waiting' | 'red' | 'green' | 'early' | 'result';

export default function ReflexLights({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [reaction, setReaction] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const phaseRef = useRef<Phase>('waiting');
  const startTimeRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPhaseSync = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  const startRound = () => {
    if (phaseRef.current === 'result' || phaseRef.current === 'early') setAttempts([]);
    setPhaseSync('red');
    const delay = 1500 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setPhaseSync('green');
    }, delay);
  };

  const handleClick = () => {
    const p = phaseRef.current;
    if (p === 'waiting' || p === 'result' || p === 'early') { startRound(); }
    else if (p === 'red') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhaseSync('early');
    } else if (p === 'green') {
      const rt = performance.now() - startTimeRef.current;
      setReaction(rt);
      const newAttempts = [...attempts, rt].slice(-5);
      setAttempts(newAttempts);
      const scoreVal = Math.max(0, Math.round(500 - rt));
      onScore(scoreVal);
      setPhaseSync('result');
      if (newAttempts.length >= 5) {
        const total = newAttempts.reduce((a, b) => a + Math.max(0, Math.round(500 - b)), 0);
        onGameOver(total);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    if (!ctx) return;
    const draw = () => {
      const p = phaseRef.current;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#1e293b';
      roundRectFill(ctx, W / 2 - 60, 80, 120, 280, 16); ctx.fill();
      const lights = [
        { color: '#ef4444', on: p === 'red' || p === 'waiting', glow: 'rgba(239,68,68,0.6)' },
        { color: '#fbbf24', on: false, glow: 'rgba(251,191,36,0.5)' },
        { color: '#22c55e', on: p === 'green', glow: 'rgba(34,197,94,0.6)' },
      ];
      lights.forEach((l, i) => {
        const cy = 120 + i * 90;
        if (l.on) { ctx.shadowColor = l.glow; ctx.shadowBlur = 30; ctx.fillStyle = l.color; }
        else { ctx.shadowBlur = 0; ctx.fillStyle = '#334155'; }
        ctx.beginPath(); ctx.arc(W / 2, cy, 30, 0, Math.PI * 2); ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center'; ctx.font = 'bold 22px Outfit, sans-serif'; ctx.fillStyle = '#e2e8f0';
      const msg = p === 'waiting' ? 'Click to start' : p === 'red' ? 'Wait for green...' : p === 'green' ? 'GO! Click now!' : p === 'early' ? 'Too early! Click to retry' : reaction !== null ? `${Math.round(reaction)} ms — click for next` : '';
      ctx.fillText(msg, W / 2, 430);
      if (attempts.length > 0) {
        ctx.font = '14px Outfit, sans-serif'; ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Attempts: ${attempts.map((a) => Math.round(a) + 'ms').join('  ·  ')}`, W / 2, 480);
        ctx.fillText(`Round ${attempts.length}/5`, W / 2, 510);
      }
    };
    let raf = requestAnimationFrame(function loop() { draw(); raf = requestAnimationFrame(loop); });
    return () => cancelAnimationFrame(raf);
  }, [reaction, attempts]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); handleClick(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return <canvas ref={canvasRef} className="rounded-xl cursor-pointer" onClick={handleClick} />;
}

function roundRectFill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
