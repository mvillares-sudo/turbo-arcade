import { useEffect, useRef, useState } from 'react';
import { setupCanvas, drawCar, rand, aabb, clamp } from '@/lib/canvasUtils';
import { useGameLoop } from '@/lib/useGameLoop';
import { useKeyboard } from '@/lib/useKeyboard';
import type { GameProps } from '@/lib/gameLoader';

const W = 480; const H = 600; const LANES = [60, 140, 220, 300, 380]; const CAR_W = 42; const CAR_H = 64;

interface Enemy { x: number; y: number; speed: number; color: string; }

export default function LaneWeaver({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const stateRef = useRef({ targetLane: 2, playerX: LANES[2], enemies: [] as Enemy[], score: 0, speed: 250, spawnTimer: 0, roadOffset: 0 });

  useKeyboard(['arrowleft', 'arrowright', 'a', 'd'], (k, down) => {
    if (!down) return;
    const s = stateRef.current;
    if (k === 'arrowleft' || k === 'a') s.targetLane = Math.max(0, s.targetLane - 1);
    if (k === 'arrowright' || k === 'd') s.targetLane = Math.min(LANES.length - 1, s.targetLane + 1);
  });

  useEffect(() => { setupCanvas(canvasRef.current!, W, H); }, []);

  useGameLoop((dt) => {
    if (!running) return;
    const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return;
    const s = stateRef.current;
    s.playerX += (LANES[s.targetLane] - s.playerX) * Math.min(1, dt * 14);
    s.speed = 250 + s.score * 0.25; s.roadOffset = (s.roadOffset + s.speed * dt) % 50;
    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      const usedLanes = new Set(s.enemies.filter((e) => e.y < 120).map((e) => e.x));
      const freeLanes = LANES.filter((l) => !usedLanes.has(l));
      if (freeLanes.length > 1) {
        const lane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
        s.enemies.push({ x: lane, y: -CAR_H, speed: s.speed * rand(0.4, 0.7), color: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ec4899', '#a855f7'][Math.floor(Math.random() * 6)] });
      }
      s.spawnTimer = rand(0.4, 0.9) * (250 / s.speed);
    }
    s.enemies.forEach((e) => (e.y += (s.speed + e.speed) * dt));
    s.enemies = s.enemies.filter((e) => e.y < H + 80);
    s.score += dt * 15; onScore(Math.floor(s.score));
    const px = s.playerX - CAR_W / 2; const py = H - 110;
    for (const e of s.enemies) { if (aabb(px, py, CAR_W, CAR_H, e.x - CAR_W / 2, e.y, CAR_W, CAR_H)) { setRunning(false); onGameOver(Math.floor(s.score)); return; } }
    draw(ctx, s);
  }, running);

  function draw(ctx: CanvasRenderingContext2D, s: typeof stateRef.current) {
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#166534'; ctx.fillRect(0, 0, 30, H); ctx.fillRect(W - 30, 0, 30, H);
    ctx.fillStyle = '#fbbf24';
    for (let i = 1; i < 5; i++) for (let y = -50 + s.roadOffset; y < H; y += 50) ctx.fillRect(i * 80 - 2, y, 4, 24);
    s.enemies.forEach((e) => drawCar(ctx, e.x - CAR_W / 2, e.y, CAR_W, CAR_H, e.color, 'down'));
    drawCar(ctx, s.playerX - CAR_W / 2, H - 110, CAR_W, CAR_H, '#14b8a6', 'up');
  }

  return <canvas ref={canvasRef} className="rounded-xl" />;
}
