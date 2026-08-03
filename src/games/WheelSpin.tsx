import { useEffect, useRef, useState } from 'react';
import { setupCanvas } from '@/lib/canvasUtils';
import type { GameProps } from '@/lib/gameLoader';

const W = 480; const H = 480; const SEGMENTS = 12; const JACKPOT_SEG = 0;
const PRIZES = [100, 20, 50, 10, 75, 5, 200, 15, 40, 30, 60, 25];

export default function WheelSpin({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0); const [vel, setVel] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle');
  const [result, setResult] = useState<number | null>(null);
  const [round, setRound] = useState(0); const [total, setTotal] = useState(0);
  const angleRef = useRef(0); const velRef = useRef(0); const phaseRef = useRef<'idle' | 'spinning' | 'result'>('idle');

  const spin = () => {
    if (phaseRef.current === 'spinning') return;
    if (phaseRef.current === 'result') setResult(null);
    phaseRef.current = 'spinning'; setPhase('spinning');
    velRef.current = 15 + Math.random() * 10; setVel(velRef.current);
  };

  useEffect(() => {
    const ctx = setupCanvas(canvasRef.current!, W, H); if (!ctx) return;
    let raf = requestAnimationFrame(function loop() {
      const v = velRef.current;
      if (v > 0.01) {
        angleRef.current += v * 0.025; velRef.current *= 0.985; setAngle(angleRef.current);
        if (velRef.current < 0.05) {
          velRef.current = 0; setVel(0); phaseRef.current = 'result'; setPhase('result');
          const norm = ((angleRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const segAngle = (Math.PI * 2) / SEGMENTS;
          const segIndex = Math.floor(((Math.PI * 2 - norm) % (Math.PI * 2)) / segAngle) % SEGMENTS;
          const prize = PRIZES[segIndex]; setResult(prize);
          const newTotal = total + prize; setTotal(newTotal); const newRound = round + 1; setRound(newRound); onScore(newTotal);
          if (newRound >= 5) onGameOver(newTotal);
        }
      }
      draw(ctx, angleRef.current, result, phaseRef.current, round);
      raf = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(raf);
  }, [result, round, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); spin(); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  });

  function draw(ctx: CanvasRenderingContext2D, ang: number, res: number | null, ph: string, r: number) {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H);
    const cx = W / 2; const cy = H / 2 + 10; const R = 180; const segAngle = (Math.PI * 2) / SEGMENTS;
    for (let i = 0; i < SEGMENTS; i++) {
      const a0 = ang + i * segAngle - Math.PI / 2; const a1 = a0 + segAngle;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a1); ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? '#1e293b' : '#334155'; ctx.fill();
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.stroke();
      const ta = a0 + segAngle / 2;
      ctx.save(); ctx.translate(cx + Math.cos(ta) * (R - 30), cy + Math.sin(ta) * (R - 30)); ctx.rotate(ta + Math.PI / 2);
      ctx.fillStyle = i === JACKPOT_SEG ? '#fbbf24' : '#cbd5e1'; ctx.font = 'bold 16px Outfit'; ctx.textAlign = 'center'; ctx.fillText(String(PRIZES[i]), 0, 5); ctx.restore();
    }
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, R + 4, ang - Math.PI / 2 - segAngle / 2, ang - Math.PI / 2 + segAngle / 2); ctx.stroke();
    ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(cx, cy - R - 18); ctx.lineTo(cx - 12, cy - R - 2); ctx.lineTo(cx + 12, cy - R - 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#475569'; ctx.lineWidth = 3; ctx.stroke();
    ctx.textAlign = 'center'; ctx.font = 'bold 18px Outfit';
    if (ph === 'result' && res !== null) { ctx.fillStyle = res >= 100 ? '#22c55e' : '#cbd5e1'; ctx.fillText(`+${res} pts`, cx, H - 40); ctx.font = '14px Outfit'; ctx.fillStyle = '#94a3b8'; ctx.fillText(`Round ${r}/5 — click to spin`, cx, H - 18); }
    else if (ph === 'spinning') { ctx.fillStyle = '#94a3b8'; ctx.fillText('Spinning...', cx, H - 25); }
    else { ctx.fillStyle = '#94a3b8'; ctx.fillText('Click / Space to spin', cx, H - 25); }
  }

  return <canvas ref={canvasRef} className="rounded-xl cursor-pointer" onClick={spin} />;
}
