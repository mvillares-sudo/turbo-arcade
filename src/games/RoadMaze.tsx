import { useEffect, useRef, useState } from 'react';
import { setupCanvas, drawCar, clamp } from '@/lib/canvasUtils';
import { useGameLoop } from '@/lib/useGameLoop';
import { useKeyboard } from '@/lib/useKeyboard';
import type { GameProps } from '@/lib/gameLoader';

const W = 480; const H = 480; const CELL = 24; const COLS = 20; const ROWS = 20;
type Grid = number[][];

function genMaze(): Grid {
  const g: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
  const stack: [number, number][] = [];
  const sx = 1; const sy = 1; g[sy][sx] = 0; stack.push([sx, sy]);
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => Math.random() - 0.5);
    let moved = false;
    for (const [dx, dy] of dirs) { const nx = cx + dx; const ny = cy + dy; if (nx > 0 && nx < COLS - 1 && ny > 0 && ny < ROWS - 1 && g[ny][nx] === 1) { g[ny][nx] = 0; g[cy + dy / 2][cx + dx / 2] = 0; stack.push([nx, ny]); moved = true; break; } }
    if (!moved) stack.pop();
  }
  return g;
}

export default function RoadMaze({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const mazeRef = useRef<Grid>(genMaze());
  const stateRef = useRef({ px: CELL * 1.5, py: CELL * 1.5, gx: 1, gy: 1, time: 60, score: 0, keys: { up: 0, down: 0, left: 0, right: 0 }, won: false });

  useKeyboard(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'], (k, down) => {
    const s = stateRef.current;
    if (k === 'arrowup' || k === 'w') s.keys.up = down ? 1 : 0;
    if (k === 'arrowdown' || k === 's') s.keys.down = down ? 1 : 0;
    if (k === 'arrowleft' || k === 'a') s.keys.left = down ? 1 : 0;
    if (k === 'arrowright' || k === 'd') s.keys.right = down ? 1 : 0;
  });

  useEffect(() => { setupCanvas(canvasRef.current!, W, H); }, []);

  const canMove = (px: number, py: number) => {
    const r = 9; const corners = [[px - r, py - r], [px + r, py - r], [px - r, py + r], [px + r, py + r]];
    for (const [cx, cy] of corners) { const gx = Math.floor(cx / CELL); const gy = Math.floor(cy / CELL); if (gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS) return false; if (mazeRef.current[gy][gx] === 1) return false; }
    return true;
  };

  useGameLoop((dt) => {
    if (!running) return;
    const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return;
    const s = stateRef.current;
    const speed = 90; let dx = (s.keys.right - s.keys.left); let dy = (s.keys.down - s.keys.up);
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
    const nx = s.px + dx * speed * dt; const ny = s.py + dy * speed * dt;
    if (canMove(nx, s.py)) s.px = nx; if (canMove(s.px, ny)) s.py = ny;
    s.gx = Math.floor(s.px / CELL); s.gy = Math.floor(s.py / CELL);
    s.time -= dt; s.score = Math.max(0, Math.floor(s.time * 10 + 100)); onScore(s.score);
    if (s.time <= 0 && !s.won) { setRunning(false); onGameOver(0); return; }
    const exitX = COLS - 2; const exitY = ROWS - 2;
    if (s.gx === exitX && s.gy === exitY && !s.won) { s.won = true; const winScore = Math.floor(s.time * 20 + 200); onScore(winScore); setRunning(false); onGameOver(winScore); return; }
    draw(ctx, s);
  }, running);

  function draw(ctx: CanvasRenderingContext2D, s: typeof stateRef.current) {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (mazeRef.current[y][x] === 0) { ctx.fillStyle = '#334155'; ctx.fillRect(x * CELL, y * CELL, CELL, CELL); }
    ctx.fillStyle = '#22c55e'; ctx.fillRect((COLS - 2) * CELL + 4, (ROWS - 2) * CELL + 4, CELL - 8, CELL - 8);
    drawCar(ctx, s.px - 12, s.py - 16, 24, 32, '#f97316', 'up');
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, 80, 24);
    ctx.fillStyle = s.time < 10 ? '#ef4444' : '#fff'; ctx.font = 'bold 13px Outfit'; ctx.textAlign = 'left'; ctx.fillText(`${Math.ceil(s.time)}s`, 8, 17);
  }

  return <canvas ref={canvasRef} className="rounded-xl" />;
}
