import { useEffect, useRef, useState } from 'react';
import { useGameLoop } from '@/lib/useGameLoop';
import { useKeyboard } from '@/lib/useKeyboard';
import { setupCanvas, drawCar, rand, aabb } from '@/lib/canvasUtils';
import type { GameProps } from '@/lib/gameLoader';

const W = 480;
const H = 640;
const LANES = [120, 240, 360];
const CAR_W = 50;
const CAR_H = 80;

interface Enemy {
  x: number;
  y: number;
  lane: number;
  speed: number;
  color: string;
}

export default function HighwayRush({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);

  const stateRef = useRef({
    playerLane: 1,
    playerX: LANES[1],
    enemies: [] as Enemy[],
    score: 0,
    speed: 200,
    spawnTimer: 0,
    roadOffset: 0,
    keys: { left: false, right: false },
    targetLane: 1,
  });

  const state = stateRef.current;

  useKeyboard(['arrowleft', 'arrowright', 'a', 'd'], (k, down) => {
    if (down) {
      if (k === 'arrowleft' || k === 'a') {
        state.targetLane = Math.max(0, state.targetLane - 1);
      }
      if (k === 'arrowright' || k === 'd') {
        state.targetLane = Math.min(2, state.targetLane + 1);
      }
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    if (!ctx) return;
  }, []);

  useGameLoop((dt) => {
    if (!running) return;
    const s = stateRef.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    s.playerX += (LANES[s.targetLane] - s.playerX) * Math.min(1, dt * 12);
    s.playerLane = s.targetLane;
    s.roadOffset = (s.roadOffset + s.speed * dt) % 60;

    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      const lane = randInt(0, 2);
      s.enemies.push({
        x: LANES[lane], y: -CAR_H, lane,
        speed: s.speed * rand(0.3, 0.6),
        color: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ec4899'][randInt(0, 4)],
      });
      s.spawnTimer = rand(0.5, 1.2) * (300 / s.speed);
    }

    s.enemies.forEach((e) => (e.y += (s.speed + e.speed) * dt));
    s.enemies = s.enemies.filter((e) => e.y < H + 100);

    s.score += dt * 10 * (s.speed / 200);
    s.speed = 200 + Math.min(400, s.score * 0.3);
    onScore(Math.floor(s.score));

    const px = s.playerX - CAR_W / 2;
    const py = H - 120;
    for (const e of s.enemies) {
      if (aabb(px, py, CAR_W, CAR_H, e.x - CAR_W / 2, e.y, CAR_W, CAR_H)) {
        setRunning(false);
        onGameOver(Math.floor(s.score));
        return;
      }
    }

    drawScene(ctx, s);
  }, running);

  function drawScene(ctx: CanvasRenderingContext2D, s: typeof state) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#166534';
    ctx.fillRect(0, 0, 60, H);
    ctx.fillRect(W - 60, 0, 60, H);
    ctx.fillStyle = '#fbbf24';
    for (let lane = 1; lane < 3; lane++) {
      const x = lane * 120;
      for (let y = -60 + s.roadOffset; y < H; y += 60) {
        ctx.fillRect(x - 3, y, 6, 30);
      }
    }
    s.enemies.forEach((e) => drawCar(ctx, e.x - CAR_W / 2, e.y, CAR_W, CAR_H, e.color, 'down'));
    drawCar(ctx, s.playerX - CAR_W / 2, H - 120, CAR_W, CAR_H, '#f97316', 'up');
  }

  return <canvas ref={canvasRef} className="rounded-xl" />;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
