import { useEffect, useRef, useState } from 'react';
import { setupCanvas, drawCar } from '@/lib/canvasUtils';
import type { GameProps } from '@/lib/gameLoader';

const W = 480; const H = 540; const CELL = 80; const COLS = 6; const ROWS = 6;

interface Piece { id: number; x: number; y: number; w: number; h: number; color: string; isTarget?: boolean; }

const LEVELS: Piece[][] = [
  [{ id: 1, x: 1, y: 2, w: 2, h: 1, color: '#ef4444', isTarget: true }, { id: 2, x: 4, y: 0, w: 1, h: 3, color: '#3b82f6' }, { id: 3, x: 0, y: 3, w: 3, h: 1, color: '#22c55e' }, { id: 4, x: 3, y: 4, w: 1, h: 2, color: '#eab308' }],
  [{ id: 1, x: 0, y: 2, w: 2, h: 1, color: '#ef4444', isTarget: true }, { id: 2, x: 2, y: 0, w: 1, h: 2, color: '#3b82f6' }, { id: 3, x: 3, y: 1, w: 2, h: 1, color: '#22c55e' }, { id: 4, x: 5, y: 0, w: 1, h: 3, color: '#eab308' }, { id: 5, x: 1, y: 4, w: 3, h: 1, color: '#a855f7' }, { id: 6, x: 0, y: 5, w: 1, h: 1, color: '#06b6d4' }],
  [{ id: 1, x: 0, y: 2, w: 2, h: 1, color: '#ef4444', isTarget: true }, { id: 2, x: 2, y: 0, w: 1, h: 3, color: '#3b82f6' }, { id: 3, x: 3, y: 0, w: 1, h: 2, color: '#22c55e' }, { id: 4, x: 4, y: 1, w: 2, h: 1, color: '#eab308' }, { id: 5, x: 4, y: 2, w: 1, h: 3, color: '#a855f7' }, { id: 6, x: 0, y: 3, w: 1, h: 2, color: '#06b6d4' }, { id: 7, x: 2, y: 4, w: 2, h: 1, color: '#ec4899' }, { id: 8, x: 1, y: 5, w: 2, h: 1, color: '#f97316' }],
];

export default function TrafficJam({ onScore, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [levelIdx, setLevelIdx] = useState(0);
  const [pieces, setPieces] = useState<Piece[]>(() => LEVELS[0].map((p) => ({ ...p })));
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const dragRef = useRef<{ id: number; axis: 'x' | 'y'; startGrid: number; startMouse: number } | null>(null);

  const occupancy = (excludeId?: number) => {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    pieces.forEach((p) => { if (p.id === excludeId) return; for (let dy = 0; dy < p.h; dy++) for (let dx = 0; dx < p.w; dx++) if (p.y + dy < ROWS && p.x + dx < COLS) grid[p.y + dy][p.x + dx] = 1; });
    return grid;
  };

  const tryMove = (id: number, newX: number, newY: number) => {
    const piece = pieces.find((p) => p.id === id); if (!piece) return;
    const grid = occupancy(id); const horiz = piece.h === 1;
    if (horiz) {
      const y = piece.y; const clampedX = Math.max(0, Math.min(COLS - piece.w, newX));
      for (let cx = Math.min(piece.x, clampedX); cx <= Math.max(piece.x, clampedX) + piece.w - 1; cx++) {
        if (cx >= 0 && cx < COLS && grid[y]?.[cx]) {
          let farX = piece.x;
          if (clampedX > piece.x) { for (let tx = piece.x + 1; tx <= clampedX; tx++) { let b = false; for (let dx = 0; dx < piece.w; dx++) if (grid[y]?.[tx + dx]) { b = true; break; } if (b) break; farX = tx; } }
          else { for (let tx = piece.x - 1; tx >= clampedX; tx--) { let b = false; for (let dx = 0; dx < piece.w; dx++) if (grid[y]?.[tx + dx]) { b = true; break; } if (b) break; farX = tx; } }
          setPieces((ps) => ps.map((p) => (p.id === id ? { ...p, x: farX } : p))); setMoves((m) => m + 1); return;
        }
      }
      setPieces((ps) => ps.map((p) => (p.id === id ? { ...p, x: clampedX } : p))); setMoves((m) => m + 1);
    } else {
      const x = piece.x; const clampedY = Math.max(0, Math.min(ROWS - piece.h, newY));
      for (let cy = Math.min(piece.y, clampedY); cy <= Math.max(piece.y, clampedY) + piece.h - 1; cy++) {
        if (cy >= 0 && cy < ROWS && grid[cy]?.[x]) {
          let farY = piece.y;
          if (clampedY > piece.y) { for (let ty = piece.y + 1; ty <= clampedY; ty++) { let b = false; for (let dy = 0; dy < piece.h; dy++) if (grid[ty + dy]?.[x]) { b = true; break; } if (b) break; farY = ty; } }
          else { for (let ty = piece.y - 1; ty >= clampedY; ty--) { let b = false; for (let dy = 0; dy < piece.h; dy++) if (grid[ty + dy]?.[x]) { b = true; break; } if (b) break; farY = ty; } }
          setPieces((ps) => ps.map((p) => (p.id === id ? { ...p, y: farY } : p))); setMoves((m) => m + 1); return;
        }
      }
      setPieces((ps) => ps.map((p) => (p.id === id ? { ...p, y: clampedY } : p))); setMoves((m) => m + 1);
    }
  };

  useEffect(() => {
    const target = pieces.find((p) => p.isTarget);
    if (target && target.x + target.w >= COLS && !solved) {
      setSolved(true);
      const levelScore = Math.max(100, 1000 - moves * 30);
      const totalScore = levelIdx * 1000 + levelScore;
      onScore(totalScore);
      if (levelIdx < LEVELS.length - 1) { setTimeout(() => { setLevelIdx((i) => i + 1); setPieces(LEVELS[levelIdx + 1].map((p) => ({ ...p }))); setMoves(0); setSolved(false); }, 1200); }
      else onGameOver(totalScore);
    }
  }, [pieces, solved, levelIdx, moves]);

  useEffect(() => {
    const ctx = setupCanvas(canvasRef.current!, W, H); if (!ctx) return;
    let raf = requestAnimationFrame(function loop() { draw(ctx, pieces, levelIdx, moves); raf = requestAnimationFrame(loop); });
    return () => cancelAnimationFrame(raf);
  }, [pieces, levelIdx, moves]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const getPiece = (mx: number, my: number) => { const gx = Math.floor(mx / CELL); const gy = Math.floor(my / CELL); return pieces.find((p) => gx >= p.x && gx < p.x + p.w && gy >= p.y && gy < p.y + p.h); };
    const onDown = (e: PointerEvent) => { const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) * (W / rect.width); const my = (e.clientY - rect.top) * (H / rect.height); const p = getPiece(mx, my); if (p) { const horiz = p.h === 1; dragRef.current = { id: p.id, axis: horiz ? 'x' : 'y', startGrid: horiz ? p.x : p.y, startMouse: horiz ? mx : my }; } };
    const onMove = (e: PointerEvent) => { if (!dragRef.current) return; const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) * (W / rect.width); const my = (e.clientY - rect.top) * (H / rect.height); const d = dragRef.current; if (d.axis === 'x') { const delta = Math.round((mx - d.startMouse) / CELL); tryMove(d.id, d.startGrid + delta, pieces.find((p) => p.id === d.id)!.y); } else { const delta = Math.round((my - d.startMouse) / CELL); tryMove(d.id, pieces.find((p) => p.id === d.id)!.x, d.startGrid + delta); } };
    const onUp = () => { dragRef.current = null; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
    return () => { canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [pieces]);

  function draw(ctx: CanvasRenderingContext2D, ps: Piece[], li: number, m: number) {
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, ROWS * CELL); ctx.stroke(); }
    for (let i = 0; i <= ROWS; i++) { ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(COLS * CELL, i * CELL); ctx.stroke(); }
    ctx.fillStyle = '#22c55e'; ctx.font = 'bold 24px Outfit'; ctx.textAlign = 'center'; ctx.fillText('→', W - 20, 2 * CELL + CELL / 2 + 8);
    ps.forEach((p) => { const px = p.x * CELL + 4; const py = p.y * CELL + 4; const pw = p.w * CELL - 8; const ph = p.h * CELL - 8; drawCar(ctx, px, py, pw, ph, p.color, p.h === 1 ? 'right' : 'down'); if (p.isTarget) { ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3; ctx.strokeRect(px - 2, py - 2, pw + 4, ph + 4); } });
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, ROWS * CELL + 4, W, H - ROWS * CELL - 4);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'left'; ctx.fillText(`Level ${li + 1}/${LEVELS.length}  ·  Moves: ${m}`, 10, ROWS * CELL + 24);
    if (solved) { ctx.fillStyle = '#22c55e'; ctx.textAlign = 'right'; ctx.fillText('Solved!', W - 10, ROWS * CELL + 24); }
  }

  return <canvas ref={canvasRef} className="rounded-xl touch-none cursor-grab active:cursor-grabbing" />;
}
