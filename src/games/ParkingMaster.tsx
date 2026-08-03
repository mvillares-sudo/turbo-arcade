import { useEffect, useRef, useState } from 'react';
import { setupCanvas, drawCar, clamp } from '@/lib/canvasUtils';
import { useGameLoop } from '@/lib/useGameLoop';
import { useKeyboard } from '@/lib/useKeyboard';
import type { GameProps } from '@/lib/gameLoader';

const W = 480; const H = 600; const CAR_W = 46; const CAR_H = 70;

interface Level {
  start: { x: number; y: number; angle: number };
  spot: { x: number; y: number; w: number; h: number };
  obstacles: { x: number; y: number; w: number; h: number }[];
}

const LEVELS: Level[] = [
  { start: { x: 120, y: 480, angle: -Math.PI / 2 }, spot: { x: 300, y: 120, w: 56, h: 80 }, obstacles: [{ x: 200, y: 110, w: 56, h: 80 }, { x: 120, y: 250, w: 56, h: 80 }] },
  { start: { x: 240, y: 500, angle: -Math.PI / 2 }, spot: { x: 80, y: 100, w: 56, h: 80 }, obstacles: [{ x: 180, y: 100, w: 56, h: 80 }, { x: 300, y: 100, w: 56, h: 80 }, { x: 180, y: 280, w: 56, h: 80 }] },
  { start: { x: 100, y: 480, angle: 0 }, spot: { x: 200, y: 100, w: 80, h: 56 }, obstacles: [{ x: 100, y: 200, w: 56, h: 80 }, { x: 320, y: 200, w: 56, h: 80 }, { x: 320, y: 100, w: 56, h: 80 }] },
];

export default function ParkingMaster({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const [levelIdx, setLevelIdx] = useState(0);
  const stateRef = useRef({ x: 0, y: 0, angle: 0, speed: 0, score: 0, keys: { up: 0, down: 0, left: 0, right: 0, brake: 0 }, parked: false, parkTime: 0, collisions: 0 });

  useKeyboard(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '], (k, down) => {
    const s = stateRef.current;
    if (k === 'arrowup' || k === 'w') s.keys.up = down ? 1 : 0;
    if (k === 'arrowdown' || k === 's') s.keys.down = down ? 1 : 0;
    if (k === 'arrowleft' || k === 'a') s.keys.left = down ? 1 : 0;
    if (k === 'arrowright' || k === 'd') s.keys.right = down ? 1 : 0;
    if (k === ' ') s.keys.brake = down ? 1 : 0;
  });

  useEffect(() => {
    setupCanvas(canvasRef.current!, W, H);
    const lvl = LEVELS[levelIdx];
    stateRef.current.x = lvl.start.x; stateRef.current.y = lvl.start.y; stateRef.current.angle = lvl.start.angle; stateRef.current.speed = 0; stateRef.current.parked = false;
  }, [levelIdx]);

  useGameLoop((dt) => {
    if (!running) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;
    const lvl = LEVELS[levelIdx];
    if (s.keys.brake) s.speed *= 0.85;
    else if (s.keys.up) s.speed += 200 * dt;
    else if (s.keys.down) s.speed -= 200 * dt;
    else s.speed *= 0.96;
    s.speed = clamp(s.speed, -120, 180);
    const steer = (s.keys.right - s.keys.left) * 2.5;
    if (Math.abs(s.speed) > 5) s.angle += steer * dt * (s.speed > 0 ? 1 : -1);
    s.x += Math.cos(s.angle) * s.speed * dt;
    s.y += Math.sin(s.angle) * s.speed * dt;
    s.x = clamp(s.x, 30, W - 30); s.y = clamp(s.y, 30, H - 30);
    const carBox = { x: s.x - CAR_W / 2, y: s.y - CAR_H / 2, w: CAR_W, h: CAR_H };
    let hit = false;
    for (const o of lvl.obstacles) { if (carBox.x < o.x + o.w && carBox.x + carBox.w > o.x && carBox.y < o.y + o.h && carBox.y + carBox.h > o.y) { hit = true; break; } }
    if (hit) { s.speed = -s.speed * 0.3; s.collisions += 1; s.score = Math.max(0, s.score - 50); }
    const spotCx = lvl.spot.x + lvl.spot.w / 2; const spotCy = lvl.spot.y + lvl.spot.h / 2;
    const distToSpot = Math.hypot(s.x - spotCx, s.y - spotCy);
    const angleOk = Math.abs(((s.angle % Math.PI) + Math.PI / 2) - Math.PI / 2) < 0.3;
    if (distToSpot < 30 && Math.abs(s.speed) < 20 && angleOk) {
      s.parkTime += dt;
      if (s.parkTime > 1) {
        s.score += Math.max(100, 500 - s.collisions * 50); onScore(Math.floor(s.score));
        if (levelIdx < LEVELS.length - 1) { setLevelIdx((i) => i + 1); s.parkTime = 0; s.collisions = 0; }
        else { setRunning(false); onGameOver(Math.floor(s.score)); return; }
      }
    } else s.parkTime = 0;
    onScore(Math.floor(s.score));
    draw(ctx, s, lvl);
  }, running);

  function draw(ctx: CanvasRenderingContext2D, s: typeof stateRef.current, lvl: Level) {
    ctx.fillStyle = '#334155'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.strokeRect(lvl.spot.x, lvl.spot.y, lvl.spot.w, lvl.spot.h); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(251,191,36,0.1)'; ctx.fillRect(lvl.spot.x, lvl.spot.y, lvl.spot.w, lvl.spot.h);
    lvl.obstacles.forEach((o) => { ctx.fillStyle = '#475569'; ctx.fillRect(o.x, o.y, o.w, o.h); ctx.fillStyle = 'rgba(180,220,255,0.4)'; ctx.fillRect(o.x + 4, o.y + 4, o.w - 8, 16); });
    ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.angle + Math.PI / 2); drawCar(ctx, -CAR_W / 2, -CAR_H / 2, CAR_W, CAR_H, '#3b82f6', 'up'); ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, 30);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'left'; ctx.fillText(`Level ${levelIdx + 1}/${LEVELS.length}`, 10, 20);
    if (s.parkTime > 0) { ctx.fillStyle = '#22c55e'; ctx.textAlign = 'right'; ctx.fillText(`Parking... ${Math.ceil(1 - s.parkTime)}s`, W - 10, 20); }
  }

  return <canvas ref={canvasRef} className="rounded-xl" />;
}
