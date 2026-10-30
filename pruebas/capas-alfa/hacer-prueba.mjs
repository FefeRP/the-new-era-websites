#!/usr/bin/env node
// Entradas sintéticas con alfa CONOCIDO para probar alfa.mjs (sin IA, sin coste).
//   node hacer-prueba.mjs [carpeta=entrada]
// Genera:
//   croma.mp4 (+ verdad-croma/NNNN.png)   esfera naranja con borde suave y un aro de "cristal" al 45 % sobre verde #00b140,
//                                          con ruido y salpicadura verde en el borde, comprimido en H.264 como un vídeo de IA.
//   negro.mp4 (+ verdad-negro/NNNN.png)   chispas y humo claros sobre negro puro.
//   splash-negro.png / splash-blanco.png  la misma salpicadura semitransparente sobre negro y sobre blanco (+ verdad-splash.png).
//   splash-blanco-movido.png              la versión blanca desplazada 6 px (como cuando el editor mueve el encuadre).
//   producto-verde.png (+ verdad-producto.png)  frasco sobre verde para el recorte de imagen.
// Las verdades son RGBA: el color del sujeto sin premultiplicar y su alfa real.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FF = process.env.FFMPEG || 'ffmpeg';
const salida = resolve(process.argv[2] || 'entrada');
rmSync(salida, { recursive: true, force: true });
mkdirSync(salida, { recursive: true });

function escribir(fichero, d, w, h, extra = []) {
  const r = spawnSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${w}x${h}`, '-i', '-', ...extra, fichero],
    { input: Buffer.from(d.buffer), maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(String(r.stderr));
}
function video(fichero, frames, w, h, fps = 24) {
  const r = spawnSync(FF, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${w}x${h}`, '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-an', fichero], { input: Buffer.concat(frames.map((f) => Buffer.from(f.buffer))), maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(String(r.stderr));
}
const liso = (x) => Math.max(0, Math.min(1, x));
const suave = (e0, e1, x) => { const t = liso((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
// ruido determinista
let semilla = 7;
const azar = () => ((semilla = (semilla * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

// sujeto: (x, y, t) → [r, g, b, a] (0..1, sin premultiplicar)
function esfera(x, y, cx, cy) {
  const d = Math.hypot(x - cx, y - cy);
  const a = 1 - suave(66, 72, d);                        // borde suave de 6 px
  const luz = 0.55 + 0.45 * liso(1 - Math.hypot(x - cx + 25, y - cy + 25) / 90);
  let col = [1.0 * luz, 0.52 * luz, 0.12 * luz];
  // aro de cristal semitransparente alrededor
  const anillo = 1 - suave(4, 7, Math.abs(d - 95));
  const aA = 0.45 * anillo;
  const aT = a + aA * (1 - a);
  if (aT <= 0) return [0, 0, 0, 0];
  const cA = [0.75, 0.88, 1.0];
  col = col.map((c, k) => (c * a + cA[k] * aA * (1 - a)) / aT);
  return [...col, aT];
}

const W = 640, H = 360, N = 48;
const VERDE = [0, 177, 64];

// ---- clip croma ----
const dirVC = join(salida, 'verdad-croma'); mkdirSync(dirVC);
const framesC = [];
for (let f = 0; f < N; f++) {
  const cx = 150 + (340 * f) / (N - 1), cy = 180 + 30 * Math.sin(f / 7);
  const img = new Uint8Array(W * H * 4), verdad = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const [r, g, b, a] = esfera(x, y, cx, cy);
    const ruido = (azar() - 0.5) * 6;
    // salpicadura verde (spill) en el borde del sujeto: el verde rebota en el borde
    const spill = a > 0 && a < 1 ? 0.25 * (1 - a) : 0;
    const col = [r, g + spill * 0.4, b];
    for (let k = 0; k < 3; k++) img[i + k] = Math.max(0, Math.min(255, col[k] * 255 * a + VERDE[k] * (1 - a) + ruido));
    img[i + 3] = 255;
    verdad[i] = r * 255; verdad[i + 1] = g * 255; verdad[i + 2] = b * 255; verdad[i + 3] = a * 255;
  }
  framesC.push(img);
  escribir(join(dirVC, `${String(f + 1).padStart(4, '0')}.png`), verdad, W, H);
}
video(join(salida, 'croma.mp4'), framesC, W, H);

// ---- clip negro: chispas y humo claros ----
const dirVN = join(salida, 'verdad-negro'); mkdirSync(dirVN);
const chispas = Array.from({ length: 40 }, () => ({ x: azar() * W, y: H * (0.6 + azar() * 0.4), vx: (azar() - 0.5) * 3, vy: -2 - azar() * 4, r: 2 + azar() * 4 }));
const framesN = [];
for (let f = 0; f < N; f++) {
  const img = new Uint8Array(W * H * 4), verdad = new Uint8Array(W * H * 4);
  const acc = new Float32Array(W * H * 3);
  // humo: mancha grande y tenue que sube
  const hx = W * 0.5 + 40 * Math.sin(f / 9), hy = H * 0.7 - f * 2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d2 = ((x - hx) / 120) ** 2 + ((y - hy) / 80) ** 2;
    const v = 0.35 * Math.exp(-d2);
    const j = (y * W + x) * 3; acc[j] += v * 0.85; acc[j + 1] += v * 0.85; acc[j + 2] += v * 0.9;
  }
  for (const c of chispas) {
    const x0 = c.x + c.vx * f, y0 = c.y + c.vy * f;
    for (let y = Math.max(0, Math.floor(y0 - 12)); y < Math.min(H, y0 + 12); y++) for (let x = Math.max(0, Math.floor(x0 - 12)); x < Math.min(W, x0 + 12); x++) {
      const v = Math.exp(-(((x - x0) ** 2 + (y - y0) ** 2) / (c.r * c.r)));
      const j = (y * W + x) * 3; acc[j] += v; acc[j + 1] += v * 0.62; acc[j + 2] += v * 0.2;
    }
  }
  for (let p = 0; p < W * H; p++) {
    const s = [Math.min(1, acc[p * 3]), Math.min(1, acc[p * 3 + 1]), Math.min(1, acc[p * 3 + 2])];
    const a = Math.max(...s);
    img[p * 4] = s[0] * 255; img[p * 4 + 1] = s[1] * 255; img[p * 4 + 2] = s[2] * 255; img[p * 4 + 3] = 255;
    // verdad: premultiplicado = s, alfa = canal máximo → color = s / a
    if (a > 0.002) for (let k = 0; k < 3; k++) verdad[p * 4 + k] = Math.min(255, (s[k] / a) * 255);
    verdad[p * 4 + 3] = a * 255;
  }
  framesN.push(img);
  escribir(join(dirVN, `${String(f + 1).padStart(4, '0')}.png`), verdad, W, H);
}
video(join(salida, 'negro.mp4'), framesN, W, H);

// ---- salpicadura semitransparente sobre negro y sobre blanco ----
{
  const w = 800, h = 600;
  const negro = new Uint8Array(w * h * 4), blanco = new Uint8Array(w * h * 4), movido = new Uint8Array(w * h * 4), verdad = new Uint8Array(w * h * 4);
  const gotas = Array.from({ length: 26 }, (_, k) => ({ x: 400 + Math.cos(k * 0.9) * (120 + azar() * 160), y: 300 + Math.sin(k * 1.3) * (80 + azar() * 130), r: 10 + azar() * 28 }));
  const sujeto = (x, y) => {
    const dc = Math.hypot((x - 400) / 1.3, y - 320);
    let a = 0.85 * (1 - suave(110, 130, dc));                     // cuerpo del líquido (85 %)
    for (const g of gotas) a = Math.max(a, 0.55 * (1 - suave(g.r - 3, g.r, Math.hypot(x - g.x, y - g.y)))); // gotas (55 %)
    const brillo = liso(1 - Math.hypot(x - 360, y - 270) / 60) * 0.5;
    return [Math.min(1, 0.95 + brillo), Math.min(1, 0.55 + brillo), Math.min(1, 0.1 + brillo), a];
  };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const [r, g, b, a] = sujeto(x, y);
    const col = [r, g, b];
    for (let k = 0; k < 3; k++) {
      negro[i + k] = col[k] * a * 255;
      blanco[i + k] = (col[k] * a + (1 - a)) * 255;
      verdad[i + k] = col[k] * 255;
    }
    negro[i + 3] = blanco[i + 3] = 255; verdad[i + 3] = a * 255;
    const xs = Math.min(w - 1, x + 6), [r2, g2, b2, a2] = sujeto(xs, y);
    movido[i] = (r2 * a2 + 1 - a2) * 255; movido[i + 1] = (g2 * a2 + 1 - a2) * 255; movido[i + 2] = (b2 * a2 + 1 - a2) * 255; movido[i + 3] = 255;
  }
  escribir(join(salida, 'splash-negro.png'), negro, w, h);
  escribir(join(salida, 'splash-blanco.png'), blanco, w, h);
  escribir(join(salida, 'splash-blanco-movido.png'), movido, w, h);
  escribir(join(salida, 'verdad-splash.png'), verdad, w, h);
}

// ---- producto sobre verde (imagen) ----
{
  const w = 900, h = 1200;
  const img = new Uint8Array(w * h * 4), verdad = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    // frasco: rectángulo redondeado con tapón, borde suave de 2 px
    const dx = Math.max(0, Math.abs(x - 450) - 150), dy = Math.max(0, Math.abs(y - 700) - 300);
    const dCuerpo = Math.hypot(dx, dy) - 60;
    const dTapon = Math.max(Math.abs(x - 450) - 90, Math.abs(y - 330) - 60);
    const a = 1 - suave(-1, 1.5, Math.min(dCuerpo, dTapon));
    const esTapon = dTapon < dCuerpo;
    const sombreado = 0.6 + 0.4 * liso(1 - Math.abs(x - 400) / 220);
    const col = esTapon ? [0.15, 0.15, 0.17] : [0.86 * sombreado, 0.78 * sombreado, 0.62 * sombreado];
    const ruido = (azar() - 0.5) * 5;
    for (let k = 0; k < 3; k++) {
      img[i + k] = Math.max(0, Math.min(255, col[k] * 255 * a + VERDE[k] * (1 - a) + ruido));
      verdad[i + k] = col[k] * 255;
    }
    img[i + 3] = 255; verdad[i + 3] = a * 255;
  }
  escribir(join(salida, 'producto-verde.png'), img, w, h);
  escribir(join(salida, 'verdad-producto.png'), verdad, w, h);
}
console.log('Entradas de prueba en ' + salida + (existsSync(join(salida, 'croma.mp4')) ? ' (croma.mp4, negro.mp4, splash-*, producto-verde.png + verdades)' : ''));
