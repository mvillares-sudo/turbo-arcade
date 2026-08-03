import { useEffect, useRef, useState } from 'react';
import { setupCanvas, drawCar, rand, aabb, clamp } from '@/lib/canvasUtils';
import { useGameLoop } from '@/lib/useGameLoop';
import { useKeyboard } from '@/lib/useKeyboard';
import type { GameProps } from '@/lib/gameLoader';

const W = 480; const H = 600; const LANES = [100, 200, 280, 380]; const CAR_W = 50; const CAR_H = 76;

interface Traffic { x: number; y: number; speed: number; color: string; }

export default function Overtake({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const stateRef = useRef({
    px: 240, py: H - 130, targetX: 240, traffic: [] as Traffic[],
    score: 0, overtakes: 0, speed: 300, spawnTimer: 0, roadOffset: 0, keys: { left: 0, right: 0 },
  });

  useKeyboard(['arrowleft', 'arrowright', 'a', 'd'], (k, down) => {
    const s = stateRef.current;
    if (k === 'arrowleft' || k === 'a') s.keys.left = down ? 1 : 0;
    if (k === 'arrowright' || k === 'd') s.keys.right = down ? 1 : 0;
  });

  useEffect(() => { setupCanvas(canvasRef.current!, W, H); }, []);

  useGameLoop((dt) => {
    if (!running) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;
    if (s.keys.left && !s.keys.right) s.targetX = Math.max(60, s.targetX - 250 * dt);
    if (s.keys.right && !s.keys.left) s.targetX = Math.min(W - 60 - CAR_W, s.targetX + 250 * dt);
    s.px += (s.targetX - s.px) * Math.min(1, dt * 15);
    s.px = clamp(s.px, 60, W - 60 - CAR_W);
    s.speed = 300 + s.score * 0.2;
    s.roadOffset = (s.roadOffset + s.speed * dt) % 60;
    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      const lane = LANES[Math.floor(Math.random() * LANES.length)];
      s.traffic.push({ x: lane, y: -CAR_H, speed: s.speed * rand(0.3, 0.55), color: ['#94a3b8','#64748b','#475569','#cbd5e1'][Math.floor(Math.random()*4)] });
      s.spawnTimer = rand(0.6, 1.4);
    }
    s.traffic.forEach((t) => { t.y += (s.speed - t.speed) * dt; });
    s.traffic = s.traffic.filter((t) => {
      if (t.y > s.py + CAR_H && t.y < s.py + CAR_H + 20) { s.overtakes += 1; s.score += 20; }
      return t.y < H + 100;
    });
    s.score += dt * 5; onScore(Math.floor(s.score));
    for (const t of s.traffic) {
      if (aabb(s.px, s.py, CAR_W, CAR_H, t.x, t.y, CAR_W, CAR_H)) { setRunning(false); onGameOver(Math.floor(s.score)); return; }
    }
    draw(ctx, s);
  }, running);

  function draw(ctx: CanvasRenderingContext2D, s: typeof stateRef.current) {
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#166534'; ctx.fillRect(0, 0, 50, H); ctx.fillRect(W - 50, 0, 50, H);
    ctx.fillStyle = '#fbbf24';
    for (const lane of [175, 325]) { for (let y = -60 + s.roadOffset; y < H; y += 60) ctx.fillRect(lane - 2, y, 4, 30); }
    s.traffic.forEach((t) => drawCar(ctx, t.x, t.y, CAR_W, CAR_H, t.color, 'down'));
    drawCar(ctx, s.px, s.py, CAR_W, CAR_H, '#06b6d4', 'up');
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(W - 110, 10, 100, 28);
    ctx.fillStyle = '#22c55e'; ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'right';
    ctx.fillText(`Overtakes: ${s.overtakes}`, W - 14, 28);
  }

  return <canvas ref={canvasRef} className="rounded-xl" />;
}
