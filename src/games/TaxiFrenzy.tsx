import { useEffect, useRef, useState } from 'react';
import { setupCanvas, drawCar, clamp, aabb, rand } from '@/lib/canvasUtils';
import { useGameLoop } from '@/lib/useGameLoop';
import { useKeyboard } from '@/lib/useKeyboard';
import type { GameProps } from '@/lib/gameLoader';

const W = 480; const H = 600; const CELL = 60; const GRID_W = 8; const GRID_H = 10;

export default function TaxiFrenzy({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const stateRef = useRef({
    taxi: { gx: 4, gy: 5, px: 4 * CELL, py: 5 * CELL },
    passenger: { gx: 1, gy: 1 }, dest: { gx: 6, gy: 1 },
    hasPassenger: false, score: 0, time: 60, delivered: 0,
    keys: { up: 0, down: 0, left: 0, right: 0 }, moveCooldown: 0,
  });

  useKeyboard(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'], (k, down) => {
    const s = stateRef.current;
    if (k === 'arrowup' || k === 'w') s.keys.up = down ? 1 : 0;
    if (k === 'arrowdown' || k === 's') s.keys.down = down ? 1 : 0;
    if (k === 'arrowleft' || k === 'a') s.keys.left = down ? 1 : 0;
    if (k === 'arrowright' || k === 'd') s.keys.right = down ? 1 : 0;
  });

  useEffect(() => { setupCanvas(canvasRef.current!, W, H); }, []);

  const newPassenger = () => {
    const s = stateRef.current;
    s.passenger = { gx: randInt(0, GRID_W - 1), gy: randInt(0, GRID_H - 1) };
    s.dest = { gx: randInt(0, GRID_W - 1), gy: randInt(0, GRID_H - 1) };
    while (s.passenger.gx === s.taxi.gx && s.passenger.gy === s.taxi.gy) s.passenger.gx = randInt(0, GRID_W - 1);
  };

  useEffect(() => { newPassenger(); }, []);

  useGameLoop((dt) => {
    if (!running) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;
    s.moveCooldown -= dt;
    if (s.moveCooldown <= 0) {
      let moved = false;
      if (s.keys.up) { s.taxi.gy = Math.max(0, s.taxi.gy - 1); moved = true; }
      else if (s.keys.down) { s.taxi.gy = Math.min(GRID_H - 1, s.taxi.gy + 1); moved = true; }
      else if (s.keys.left) { s.taxi.gx = Math.max(0, s.taxi.gx - 1); moved = true; }
      else if (s.keys.right) { s.taxi.gx = Math.min(GRID_W - 1, s.taxi.gx + 1); moved = true; }
      if (moved) s.moveCooldown = 0.15;
    }
    const targetX = s.taxi.gx * CELL; const targetY = s.taxi.gy * CELL;
    s.taxi.px += (targetX - s.taxi.px) * Math.min(1, dt * 15);
    s.taxi.py += (targetY - s.taxi.py) * Math.min(1, dt * 15);
    const atPassenger = s.taxi.gx === s.passenger.gx && s.taxi.gy === s.passenger.gy;
    const atDest = s.taxi.gx === s.dest.gx && s.taxi.gy === s.dest.gy;
    if (!s.hasPassenger && atPassenger) { s.hasPassenger = true; s.score += 50; }
    if (s.hasPassenger && atDest) { s.hasPassenger = false; s.delivered += 1; s.score += 150; s.time = Math.min(60, s.time + 5); newPassenger(); }
    s.time -= dt; s.score += dt * 2; onScore(Math.floor(s.score));
    if (s.time <= 0) { setRunning(false); onGameOver(Math.floor(s.score)); return; }
    draw(ctx, s);
  }, running);

  function draw(ctx: CanvasRenderingContext2D, s: typeof stateRef.current) {
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#334155';
    for (let x = 0; x < GRID_W; x++) for (let y = 0; y < GRID_H; y++) ctx.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i <= GRID_W; i++) { ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke(); }
    for (let i = 0; i <= GRID_H; i++) { ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke(); }
    if (!s.hasPassenger) {
      ctx.fillStyle = '#22c55e'; ctx.beginPath();
      ctx.arc(s.passenger.gx * CELL + CELL / 2, s.passenger.gy * CELL + CELL / 2, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'center';
      ctx.fillText('P', s.passenger.gx * CELL + CELL / 2, s.passenger.gy * CELL + CELL / 2 + 5);
    }
    ctx.fillStyle = s.hasPassenger ? '#ef4444' : 'rgba(239,68,68,0.3)';
    ctx.fillRect(s.dest.gx * CELL + 6, s.dest.gy * CELL + 6, CELL - 12, CELL - 12);
    if (s.hasPassenger) { ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'center'; ctx.fillText('D', s.dest.gx * CELL + CELL / 2, s.dest.gy * CELL + CELL / 2 + 5); }
    drawCar(ctx, s.taxi.px + 5, s.taxi.py + 3, CELL - 16, CELL - 8, '#facc15', 'up');
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, 32);
    ctx.fillStyle = s.time < 10 ? '#ef4444' : '#fff'; ctx.font = 'bold 16px Outfit'; ctx.textAlign = 'left';
    ctx.fillText(`Time: ${Math.ceil(s.time)}s`, 10, 21);
    ctx.fillStyle = '#fbbf24'; ctx.fillText(`Delivered: ${s.delivered}`, 180, 21);
  }

  return <canvas ref={canvasRef} className="rounded-xl" />;
}

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
