import { useEffect, useRef, useState } from 'react';
import { setupCanvas } from '@/lib/canvasUtils';
import type { GameProps } from '@/lib/gameLoader';

const W = 480; const H = 600;
type Phase = 'idle' | 'ready' | 'go' | 'false' | 'result';

export default function DragReaction({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const phaseRef = useRef<Phase>('idle');
  const goTimeRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setP = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  const arm = () => {
    if (phaseRef.current === 'result' || phaseRef.current === 'false') { setRound(0); setTotalScore(0); }
    setP('ready');
    const delay = 1000 + Math.random() * 4000;
    timeoutRef.current = setTimeout(() => { goTimeRef.current = performance.now(); setP('go'); }, delay);
  };

  const handle = () => {
    const p = phaseRef.current;
    if (p === 'idle' || p === 'result' || p === 'false') arm();
    else if (p === 'ready') { if (timeoutRef.current) clearTimeout(timeoutRef.current); setP('false'); }
    else if (p === 'go') {
      const rt = performance.now() - goTimeRef.current;
      setResult(rt);
      const scoreVal = Math.max(0, Math.round(400 - rt));
      const newTotal = totalScore + scoreVal;
      const newRound = round + 1;
      setTotalScore(newTotal); setRound(newRound); onScore(newTotal); setP('result');
      if (newRound >= 3) onGameOver(newTotal);
    }
  };

  useEffect(() => {
    const ctx = setupCanvas(canvasRef.current!, W, H);
    if (!ctx) return;
    let raf = requestAnimationFrame(function loop() {
      draw(ctx, phaseRef.current, result, round);
      raf = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(raf);
  }, [result, round]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); handle(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  function draw(ctx: CanvasRenderingContext2D, p: Phase, res: number | null, r: number) {
    const colors: Record<Phase, string> = { idle:'#1e293b', ready:'#dc2626', go:'#16a34a', false:'#7c2d12', result:'#0f172a' };
    ctx.fillStyle = colors[p]; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(60, 0, W - 120, H);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#fff' : 'rgba(30,41,59,0.5)';
      ctx.fillRect(60, H - 120 + i * 15, W - 120, 15);
    }
    ctx.textAlign = 'center'; ctx.font = 'bold 28px Space Grotesk, sans-serif'; ctx.fillStyle = '#fff';
    const msg = p==='idle'?'Click to arm':p==='ready'?'Wait for GO...':p==='go'?'GO!':p==='false'?'False start! Click to retry':res!==null?`${Math.round(res)} ms`:'';
    ctx.fillText(msg, W / 2, 80);
    const carY = p === 'go' || p === 'result' ? 160 : 300;
    ctx.fillStyle = '#f97316'; ctx.fillRect(W / 2 - 22, carY, 44, 70);
    ctx.fillStyle = 'rgba(180,220,255,0.6)'; ctx.fillRect(W / 2 - 18, carY + 8, 36, 16);
    if (r > 0) { ctx.font = '14px Outfit'; ctx.fillStyle = '#94a3b8'; ctx.fillText(`Round ${r}/3`, W / 2, H - 20); }
  }

  return <canvas ref={canvasRef} className="rounded-xl cursor-pointer" onClick={handle} />;
}
