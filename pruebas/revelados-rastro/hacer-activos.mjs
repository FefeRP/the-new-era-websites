#!/usr/bin/env node
// Activos hechos por código para probar revelados.js y rastro-cursor.js (sin IA, sin licencias):
//   node hacer-activos.mjs [carpeta=activos]
// foto.webp (degradado con formas), estanteria.webp (2400×1350, 6×3 cajas de colores; la caja objetivo, fila 2 columna 5,
// es magenta con un marco blanco y ocupa x 1650-1950, y 510-830), detalle.webp (la caja objetivo en grande) y rastro/1..6.webp (fotos de colores distintos).
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FF = process.env.FFMPEG || 'ffmpeg';
const dir = resolve(process.argv[2] || 'activos');
rmSync(dir, { recursive: true, force: true });
mkdirSync(join(dir, 'rastro'), { recursive: true });

const escribir = (f, d, w, h) => {
  const r = spawnSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${w}x${h}`, '-i', '-', '-c:v', 'libwebp', '-quality', '85', f],
    { input: Buffer.from(d.buffer), maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(String(r.stderr));
};
const pintar = (w, h, fn) => {
  const d = new Uint8Array(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) d.set(fn(x, y), (y * w + x) * 3);
  return d;
};

// foto: degradado cálido con un sol y colinas
escribir(join(dir, 'foto.webp'), pintar(1600, 900, (x, y) => {
  const sol = Math.hypot(x - 1100, y - 330) < 120;
  const colina = y > 620 + 60 * Math.sin(x / 180);
  if (sol) return [250, 214, 150];
  if (colina) return [60 + y / 20, 70 + y / 30, 52];
  return [210 - y / 8, 140 - y / 12, 110 + y / 12];
}), 1600, 900);

// estantería: 6 columnas × 3 filas de cajas; objetivo en fila 1 (0-index), columna 4 → magenta con marco blanco
export const OBJETIVO = { fila: 1, columna: 4 };
const W = 2400, H = 1350, cw = W / 6, ch = H / 3;
const colores = [[196, 92, 64], [84, 120, 160], [220, 184, 90], [90, 150, 110], [150, 96, 160], [70, 70, 80]];
escribir(join(dir, 'estanteria.webp'), pintar(W, H, (x, y) => {
  const c = Math.floor(x / cw), f = Math.floor(y / ch);
  const lx = x - c * cw, ly = y - ch * f;
  if (ly > ch - 40) return [120, 90, 60];                         // balda
  const dentro = lx > 50 && lx < cw - 50 && ly > 60 && ly < ch - 70;
  if (!dentro) return [236, 228, 214];
  if (f === OBJETIVO.fila && c === OBJETIVO.columna) {
    const marco = lx < 70 || lx > cw - 70 || ly < 80 || ly > ch - 90;
    return marco ? [255, 255, 255] : [220, 30, 160];
  }
  return colores[(c + f * 2) % colores.length];
}), W, H);

// detalle: la caja objetivo en grande, con otro tono (para distinguir el relevo)
escribir(join(dir, 'detalle.webp'), pintar(1600, 900, (x, y) => (Math.hypot(x - 800, y - 450) < 260 ? [255, 255, 255] : [150, 20, 110])), 1600, 900);

// rastro: 6 fotos de 400×500
const tonos = [[204, 120, 80], [80, 130, 170], [200, 170, 90], [100, 160, 120], [170, 110, 170], [90, 90, 100]];
tonos.forEach((t, i) => escribir(join(dir, 'rastro', `${i + 1}.webp`), pintar(400, 500, (x, y) => t.map((v) => Math.max(0, Math.min(255, v + (y - 250) / 6 - (x - 200) / 10)))), 400, 500));
console.log('Activos en ' + dir);
