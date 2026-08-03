import { useEffect, useRef, useState } from 'react';
import { useGameLoop } from '@/lib/useGameLoop';
import { useKeyboard } from '@/lib/useKeyboard';
import { setupCanvas, drawCar, clamp } from '@/lib/canvasUtils';
import type { GameProps } from '@/lib/gameLoader';

const W = 480;
const H = 600;
const CAR_W = 44;
const CAR_H = 70;

export default function DriftCircle({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);

  const stateRef = useRef({
    angle: -Math.PI / 2, radius: 180, speed: 1.5, score: 0,
    combo: 0, driftActive: false, ringPulse: 0, shake: 0,
  });

  useKeyboard([' ', 'spacebar'], (k, down) => {
    stateRef.current.driftActive = down;
  });

  useEffect(() => {
    const onDown = () => { stateRef.current.driftActive = true; };
    const onUp = () => { stateRef.current.driftActive = false; };
    const canvas = canvasRef.current;
    canvas?.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      canvas?.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setupCanvas(canvas, W, H);
  }, []);

  useGameLoop((dt) => {
    if (!running) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;

    if (s.driftActive) {
      s.radius += s.speed * 60 * dt;
      s.combo += dt * 10;
    } else {
      s.radius -= s.speed * 80 * dt;
      s.combo = Math.max(0, s.combo - dt * 5);
    }
    s.radius = clamp(s.radius, 60, 230);
    s.angle += dt * (1.2 + s.speed * 0.1);

    if (s.radius >= 228 || s.radius <= 62) {
      s.shake = 8;
      if (s.combo > 5) s.combo = 0;
    }
    s.shake *= 0.85;
    s.score += s.combo * dt * 2;
    onScore(Math.floor(s.score));

    ctx.save();
    if (s.shake > 0.5) {
      ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
    }
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H / 2;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, 180, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx, cy, 228, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 62, 0, Math.PI * 2); ctx.stroke();

    const carX = cx + Math.cos(s.angle) * s.radius;
    const carY = cy + Math.sin(s.angle) * s.radius;
    if (s.driftActive) {
      ctx.strokeStyle = `rgba(249,115,22,${Math.min(0.4, s.combo / 100)})`;
      ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(cx, cy, s.radius, s.angle - 0.3, s.angle); ctx.stroke();
    }
    drawCar(ctx, carX - CAR_W / 2, carY - CAR_H / 2, CAR_W, CAR_H, '#f97316', 'right');
    if (s.combo > 5) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 28px Space Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`x${Math.floor(s.combo)}`, cx, 50);
    }
    ctx.restore();
  }, running);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl cursor-pointer" />
      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/70">
        Hold to drift outward · Release to pull in · Stay in the safe ring
      </p>
    </div>
  );
}
