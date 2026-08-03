import { useEffect, useRef, useState } from 'react';
import { setupCanvas, drawCar, rand, aabb, clamp } from '@/lib/canvasUtils';
import { useGameLoop } from '@/lib/useGameLoop';
import { useKeyboard } from '@/lib/useKeyboard';
import type { GameProps } from '@/lib/gameLoader';

const W = 480; const H = 600; const CAR_W = 44; const CAR_H = 68;

interface Obstacle { x: number; y: number; type: 'cone' | 'car' | 'hole'; color: string; }

export default function NightDrive({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const stateRef = useRef({ px: W / 2 - CAR_W / 2, score: 0, speed: 200, obstacles: [] as Obstacle[], spawnTimer: 0, roadOffset: 0, keys: { left: 0, right: 0 }, headlightFlicker: 0 });

  useKeyboard(['arrowleft', 'arrowright', 'a', 'd'], (k, down) => {
    const s = stateRef.current;
    if (k === 'arrowleft' || k === 'a') s.keys.left = down ? 1 : 0;
    if (k === 'arrowright' || k === 'd') s.keys.right = down ? 1 : 0;
  });

  useEffect(() => { setupCanvas(canvasRef.current!, W, H); }, []);

  useGameLoop((dt) => {
    if (!running) return;
    const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return;
    const s = stateRef.current;
    s.px += (s.keys.right - s.keys.left) * 280 * dt; s.px = clamp(s.px, 40, W - 40 - CAR_W);
    s.speed = 200 + s.score * 0.15; s.roadOffset = (s.roadOffset + s.speed * dt) % 60;
    s.headlightFlicker = Math.sin(performance.now() / 100) * 0.05;
    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      const type = (['cone', 'car', 'hole'] as const)[Math.floor(Math.random() * 3)];
      s.obstacles.push({ x: rand(40, W - 80), y: -60, type, color: type === 'car' ? '#475569' : '#f97316' });
      s.spawnTimer = rand(0.5, 1.1);
    }
    s.obstacles.forEach((o) => (o.y += s.speed * dt));
    s.obstacles = s.obstacles.filter((o) => o.y < H + 60);
    s.score += dt * 8; onScore(Math.floor(s.score));
    const py = H - 110;
    for (const o of s.obstacles) {
      const ow = o.type === 'hole' ? 40 : o.type === 'car' ? CAR_W : 26;
      const oh = o.type === 'hole' ? 30 : o.type === 'car' ? CAR_H : 30;
      if (aabb(s.px, py, CAR_W, CAR_H, o.x, o.y, ow, oh)) { setRunning(false); onGameOver(Math.floor(s.score)); return; }
    }
    draw(ctx, s);
  }, running);

  function draw(ctx: CanvasRenderingContext2D, s: typeof stateRef.current) {
    ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#111827'; ctx.fillRect(40, 0, W - 80, H);
    const py = H - 110; const carCx = s.px + CAR_W / 2;
    const grad = ctx.createRadialGradient(carCx, py, 10, carCx, py - 80, 200);
    grad.addColorStop(0, `rgba(254,240,138,${0.5 + s.headlightFlicker})`);
    grad.addColorStop(0.5, 'rgba(254,240,138,0.15)');
    grad.addColorStop(1, 'rgba(254,240,138,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(carCx - 30, py); ctx.lineTo(carCx - 120, py - 300); ctx.lineTo(carCx + 120, py - 300); ctx.lineTo(carCx + 30, py); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(251,191,36,0.4)';
    for (let y = -60 + s.roadOffset; y < H; y += 60) ctx.fillRect(W / 2 - 2, y, 4, 30);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(40, 0, 3, H); ctx.fillRect(W - 43, 0, 3, H);
    s.obstacles.forEach((o) => {
      const distToCar = Math.abs(o.y - py); const inLight = distToCar < 250 && Math.abs(o.x - carCx) < 130;
      ctx.globalAlpha = inLight ? 1 : 0.15;
      if (o.type === 'cone') {
        ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(o.x + 13, o.y); ctx.lineTo(o.x + 26, o.y + 30); ctx.lineTo(o.x, o.y + 30); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(o.x + 4, o.y + 14, 18, 4);
      } else if (o.type === 'car') drawCar(ctx, o.x, o.y, CAR_W, CAR_H, '#64748b', 'down');
      else { ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(o.x + 20, o.y + 15, 20, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.globalAlpha = 1;
    });
    drawCar(ctx, s.px, py, CAR_W, CAR_H, '#6366f1', 'up');
    ctx.fillStyle = `rgba(254,240,138,${0.8 + s.headlightFlicker})`;
    ctx.fillRect(s.px + 4, py - 2, 8, 4); ctx.fillRect(s.px + CAR_W - 12, py - 2, 8, 4);
    s.obstacles.filter((o) => o.type === 'car' && o.y < py - 100).forEach((o) => {
      ctx.fillStyle = 'rgba(239,68,68,0.7)';
      ctx.fillRect(o.x + 4, o.y + CAR_H - 4, 6, 3); ctx.fillRect(o.x + CAR_W - 10, o.y + CAR_H - 4, 6, 3);
    });
  }

  return <canvas ref={canvasRef} className="rounded-xl" />;
}
