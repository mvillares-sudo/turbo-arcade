import { useEffect, useRef, useState } from 'react';
import { setupCanvas, drawCar, rand, aabb, clamp } from '@/lib/canvasUtils';
import { useGameLoop } from '@/lib/useGameLoop';
import { useKeyboard } from '@/lib/useKeyboard';
import type { GameProps } from '@/lib/gameLoader';

const W = 480; const H = 600; const CAR_W = 46; const CAR_H = 70; const FUEL_CAN = 28;

interface FuelCan { x: number; y: number; }
interface Cone { x: number; y: number; }

export default function FuelRun({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const stateRef = useRef({
    px: W / 2, py: H - 100, fuel: 100, score: 0,
    fuels: [] as FuelCan[], cones: [] as ConesArr,
    spawnTimer: 0, speed: 200, roadOffset: 0, keys: { left: 0, right: 0 },
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
    s.px += (s.keys.right - s.keys.left) * 300 * dt;
    s.px = clamp(s.px, 40, W - 40 - CAR_W);
    s.fuel -= dt * 8;
    s.speed = 200 + s.score * 0.1;
    s.roadOffset = (s.roadOffset + s.speed * dt) % 60;
    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      if (Math.random() < 0.45) s.fuels.push({ x: rand(40, W - 60), y: -FUEL_CAN });
      else s.cones.push({ x: rand(40, W - 60), y: -40 });
      s.spawnTimer = rand(0.4, 0.9);
    }
    s.fuels.forEach((f) => (f.y += s.speed * dt));
    s.cones.forEach((c) => (c.y += s.speed * dt));
    s.fuels = s.fuels.filter((f) => f.y < H + 50);
    s.cones = s.cones.filter((c) => c.y < H + 50);
    s.fuels = s.fuels.filter((f) => {
      if (aabb(s.px, s.py, CAR_W, CAR_H, f.x, f.y, FUEL_CAN, FUEL_CAN)) {
        s.fuel = Math.min(100, s.fuel + 25); s.score += 10; return false;
      } return true;
    });
    for (const c of s.cones) {
      if (aabb(s.px, s.py, CAR_W, CAR_H, c.x, c.y, 30, 30)) {
        setRunning(false); onGameOver(Math.floor(s.score)); return;
      }
    }
    s.score += dt * 5;
    onScore(Math.floor(s.score));
    if (s.fuel <= 0) { setRunning(false); onGameOver(Math.floor(s.score)); return; }
    draw(ctx, s);
  }, running);

  function draw(ctx: CanvasRenderingContext2D, s: typeof stateRef.current) {
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#15803d'; ctx.fillRect(0, 0, 40, H); ctx.fillRect(W - 40, 0, 40, H);
    ctx.fillStyle = '#fbbf24';
    for (let y = -60 + s.roadOffset; y < H; y += 60) ctx.fillRect(W / 2 - 3, y, 6, 30);
    s.fuels.forEach((f) => {
      ctx.fillStyle = '#06b6d4'; ctx.fillRect(f.x, f.y, FUEL_CAN, FUEL_CAN);
      ctx.fillStyle = '#e0f2fe'; ctx.font = 'bold 16px Outfit'; ctx.textAlign = 'center';
      ctx.fillText('F', f.x + FUEL_CAN / 2, f.y + 20);
    });
    s.cones.forEach((c) => {
      ctx.fillStyle = '#f97316';
      ctx.beginPath(); ctx.moveTo(c.x + 15, c.y); ctx.lineTo(c.x + 30, c.y + 30); ctx.lineTo(c.x, c.y + 30); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(c.x + 5, c.y + 14, 20, 4);
    });
    drawCar(ctx, s.px, s.py, CAR_W, CAR_H, '#3b82f6', 'up');
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(10, 10, 120, 20);
    ctx.fillStyle = s.fuel > 30 ? '#22c55e' : '#ef4444';
    ctx.fillRect(12, 12, (s.fuel / 100) * 116, 16);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Outfit'; ctx.textAlign = 'left'; ctx.fillText('FUEL', 14, 25);
  }

  return <canvas ref={canvasRef} className="rounded-xl" />;
}

type ConesArr = Cone[];
