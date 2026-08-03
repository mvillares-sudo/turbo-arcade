import { createRef } from 'react';

export interface GameCanvasRefs {
  canvas: React.RefObject<HTMLCanvasElement>;
}

export function makeCanvasRef() {
  return createRef<HTMLCanvasElement>();
}

export function setupCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.scale(dpr, dpr);
  return ctx;
}

export function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

export function drawCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  facing: 'up' | 'down' | 'left' | 'right' = 'up',
) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  if (facing === 'down') ctx.rotate(Math.PI);
  if (facing === 'left') ctx.rotate(-Math.PI / 2);
  if (facing === 'right') ctx.rotate(Math.PI / 2);
  const hw = w / 2;
  const hh = h / 2;
  ctx.fillStyle = color;
  roundRect(ctx, -hw, -hh, w, h, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(180,220,255,0.7)';
  roundRect(ctx, -hw + 4, -hh + 6, w - 8, h * 0.22, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(180,220,255,0.5)';
  roundRect(ctx, -hw + 4, hh - h * 0.22 - 4, w - 8, h * 0.2, 3);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-hw - 2, -hh + 4, 4, 8);
  ctx.fillRect(hw - 2, -hh + 4, 4, 8);
  ctx.fillRect(-hw - 2, hh - 12, 4, 8);
  ctx.fillRect(hw - 2, hh - 12, 4, 8);
  ctx.restore();
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function aabb(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
