import { useEffect, useRef, useState } from 'react';
import { setupCanvas, drawCar } from '@/lib/canvasUtils';
import { useGameLoop } from '@/lib/useGameLoop';
import { useKeyboard } from '@/lib/useKeyboard';
import type { GameProps } from '@/lib/gameLoader';

const W = 480; const H = 600; const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308']; const LANE_COUNT = 4; const LANE_W = W / LANE_COUNT; const SELECTOR_Y = H - 80;

interface FallingCar { lane: number; y: number; colorIndex: number; speed: number; }

export default function ColorMatchCars({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const stateRef = useRef({ selectorLane: 0, cars: [] as FallingCar[], score: 0, speed: 140, spawnTimer: 1, lives: 3, flashCorrect: 0, flashWrong: 0 });

  useKeyboard(['arrowleft', 'arrowright', 'a', 'd'], (k, down) => {
    if (!down) return;
    const s = stateRef.current;
    if (k === 'arrowleft' || k === 'a') s.selectorLane = Math.max(0, s.selectorLane - 1);
    if (k === 'arrowright' || k === 'd') s.selectorLane = Math.min(LANE_COUNT - 1, s.selectorLane + 1);
  });

  useEffect(() => { setupCanvas(canvasRef.current!, W, H); }, []);

  useGameLoop((dt) => {
    if (!running) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;
    s.speed = 140 + s.score * 0.2;
    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      s.cars.push({ lane: Math.floor(Math.random() * LANE_COUNT), y: -70, colorIndex: Math.floor(Math.random() * COLORS.length), speed: s.speed });
      s.spawnTimer = Math.max(0.45, 1.3 - s.score * 0.002);
    }
    s.cars.forEach((c) => (c.y += c.speed * dt));
    s.cars = s.cars.filter((c) => {
      if (c.y > SELECTOR_Y - 20 && c.y < SELECTOR_Y + 40) {
        if (c.lane === s.selectorLane) {
          if (c.colorIndex === s.selectorLane) { s.score += 30; s.flashCorrect = 1; } else { s.score += 10; s.flashCorrect = 0.5; }
          return false;
        }
        return true;
      }
      if (c.y > H) { s.lives -= 1; s.flashWrong = 1; return false; }
      return true;
    });
    s.flashCorrect *= 0.9; s.flashWrong *= 0.9;
    onScore(Math.floor(s.score));
    if (s.lives <= 0) { setRunning(false); onGameOver(Math.floor(s.score)); return; }
    draw(ctx, s);
  }, running);

  function draw(ctx: CanvasRenderingContext2D, s: typeof stateRef.current) {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H);
    COLORS.forEach((color, i) => { ctx.fillStyle = color + '12'; ctx.fillRect(i * LANE_W, 0, LANE_W, H); });
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    for (let i = 1; i < LANE_COUNT; i++) { ctx.beginPath(); ctx.moveTo(i * LANE_W, 0); ctx.lineTo(i * LANE_W, H); ctx.stroke(); }
    if (s.flashCorrect > 0.05) { ctx.fillStyle = `rgba(34,197,94,${s.flashCorrect * 0.3})`; ctx.fillRect(s.selectorLane * LANE_W, 0, LANE_W, H); }
    if (s.flashWrong > 0.05) { ctx.fillStyle = `rgba(239,68,68,${s.flashWrong * 0.3})`; ctx.fillRect(0, 0, W, H); }
    s.cars.forEach((c) => { const x = c.lane * LANE_W + LANE_W / 2 - 25; drawCar(ctx, x, c.y, 50, 60, COLORS[c.colorIndex], 'down'); });
    ctx.strokeStyle = COLORS[s.selectorLane]; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.strokeRect(s.selectorLane * LANE_W + 4, SELECTOR_Y - 10, LANE_W - 8, 74); ctx.setLineDash([]);
    const sx = s.selectorLane * LANE_W + LANE_W / 2 - 25; drawCar(ctx, sx, SELECTOR_Y, 50, 60, COLORS[s.selectorLane], 'up');
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(10, 10, 110, 26);
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'left'; ctx.fillText(`Lives: ${'♥'.repeat(s.lives)}`, 16, 28);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(W - 100, 10, 90, 26);
    ctx.fillStyle = '#fbbf24'; ctx.textAlign = 'right'; ctx.fillText(`${Math.floor(s.score)}`, W - 16, 28);
  }

  return <canvas ref={canvasRef} className="rounded-xl" />;
}
