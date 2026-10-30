#!/usr/bin/env node
// Vídeo de prueba con verdad conocida para seguir-pantalla.mjs y capa-pantalla.js: una "escena" plana generada por código
// (fondo con textura, muebles y un portátil con la pantalla en blanco 16:10) a la que se aplica, fotograma a fotograma,
// un empuje de cámara con giro y perspectiva (filtro perspective de ffmpeg). Como la transformación la elegimos
// nosotros, sabemos dónde está cada esquina de la pantalla en cada fotograma: verdad.json.
//
//   node hacer-video-prueba.mjs <carpeta-salida>        → prueba.mp4, verdad.json, escena.png
//   node hacer-video-prueba.mjs --medir <pista.json> <verdad.json>   → error del seguimiento en px
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FFMPEG = process.env.FFMPEG && existsSync(process.env.FFMPEG) ? process.env.FFMPEG : 'ffmpeg';
const W = 1280, H = 720, FPS = 24, N = 96;
// pantalla (zona en blanco) en la escena, 16:10, y su marco
const PANT = { x: 520, y: 260, w: 280, h: 175 };
const c = [PANT.x + PANT.w / 2, PANT.y + PANT.h / 2];

if (process.argv[2] === '--medir') {
  const pista = JSON.parse(readFileSync(process.argv[3], 'utf8'));
  const verdad = JSON.parse(readFileSync(process.argv[4], 'utf8'));
  let max = 0, suma = 0, n = 0;
  verdad.esquinas.forEach((q, f) => q.forEach(([x, y], j) => {
    const [px, py] = pista.esquinas[f][j];
    const e = Math.hypot(px - x, py - y); max = Math.max(max, e); suma += e; n++;
  }));
  console.log(`error medio ${(suma / n).toFixed(2)} px · máximo ${max.toFixed(2)} px (${n / 4} fotogramas)`);
  process.exit(max < 4 ? 0 : 1);
}

const salida = resolve(process.argv[2] ?? '.');
mkdirSync(salida, { recursive: true });

// Movimiento de cámara: zoom 1x → 2,2x hacia la pantalla, giro de 2°, paneo y la parte derecha que se encoge (perspectiva)
// t = n / (N - 1). Esquinas destino del fotograma completo; el mismo cálculo en JS (verdad) y en expresión de ffmpeg.
const esquinasFuente = [[0, 0], [W, 0], [0, H], [W, H]]; // orden del filtro perspective: TL, TR, BL, BR
function destino(t, [px, py]) {
  const s = 1 + 1.2 * t, r = 0.035 * t, dx = px - c[0], dy = (py - c[1]) * (px > c[0] ? 1 - 0.08 * t : 1);
  return [c[0] + s * (dx * Math.cos(r) - dy * Math.sin(r)) - 40 * t, c[1] + s * (dx * Math.sin(r) + dy * Math.cos(r)) + 20 * t];
}
function expr([px, py], eje) {
  const T = `(in/${N - 1})`, s = `(1+1.2*${T})`, r = `(0.035*${T})`, dx = px - c[0];
  const dy = `(${py - c[1]}*${px > c[0] ? `(1-0.08*${T})` : '1'})`;
  return eje === 'x' ? `${c[0]}+${s}*(${dx}*cos(${r})-${dy}*sin(${r}))-40*${T}` : `${c[1]}+${s}*(${dx}*sin(${r})+${dy}*cos(${r}))+20*${T}`;
}

// Homografía de 4 puntos (cuadrado unidad → cuadrilátero, Heckbert) para calcular la verdad
function homografia(q) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q; // TL, TR, BR, BL
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den, h = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
  return (u, v) => { const z = g * u + h * v + 1; return [(a * u + b * v + x0) / z, (d * u + e * v + y0) / z]; };
}

const verdad = { video: 'prueba.mp4', ancho: W, alto: H, fps: FPS, orden: ['arriba-izquierda', 'arriba-derecha', 'abajo-derecha', 'abajo-izquierda'], esquinas: [] };
for (let n = 0; n < N; n++) {
  const t = n / (N - 1);
  const [tl, tr, bl, br] = esquinasFuente.map((p) => destino(t, p));
  const m = homografia([tl, tr, br, bl]);
  const pant = [[PANT.x, PANT.y], [PANT.x + PANT.w, PANT.y], [PANT.x + PANT.w, PANT.y + PANT.h], [PANT.x, PANT.y + PANT.h]];
  verdad.esquinas.push(pant.map(([x, y]) => m(x / W, y / H).map((v) => Math.round(v * 100) / 100)));
}
writeFileSync(join(salida, 'verdad.json'), JSON.stringify(verdad));

// Escena: fondo con grano y bloques (pared, ventana, mesa), portátil con marco oscuro y pantalla en blanco
const caja = (x, y, w, h, col) => `drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=${col}:t=fill`;
const escena = join(salida, 'escena.png');
const vf = [
  'noise=alls=28:allf=u',
  caja(0, 0, 360, 720, '0x7d6e5c'), caja(860, 40, 380, 420, '0x9fb4c8'), caja(880, 60, 160, 180, '0xb9c9d8'), caja(1060, 60, 160, 180, '0xb3c4d4'),
  caja(80, 120, 120, 160, '0xc0603a'), caja(240, 300, 70, 70, '0x2f5d3a'),
  caja(300, 470, 900, 26, '0xd9cdb8'), caja(340, 496, 18, 224, '0x222222'), caja(1140, 496, 18, 224, '0x222222'),
  caja(PANT.x - 12, PANT.y - 12, PANT.w + 24, PANT.h + 24, '0x141414'),
  caja(PANT.x - 40, PANT.y + PANT.h + 12, PANT.w + 80, 14, '0x8d8f94'),
  caja(PANT.x, PANT.y, PANT.w, PANT.h, '0xf2efe9'),
  caja(980, 400, 60, 70, '0xb5562e'),
].join(',');
let r = spawnSync(FFMPEG, ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=0xe8dccb:s=${W}x${H}`, '-vf', vf, '-frames:v', '1', escena]);
if (r.status !== 0) { console.error(String(r.stderr)); process.exit(1); }

const nombres = ['x0', 'y0', 'x1', 'y1', 'x2', 'y2', 'x3', 'y3'];
const per = esquinasFuente.flatMap((p, k) => [`${nombres[2 * k]}='${expr(p, 'x')}'`, `${nombres[2 * k + 1]}='${expr(p, 'y')}'`]).join(':');
r = spawnSync(FFMPEG, ['-v', 'error', '-y', '-loop', '1', '-framerate', String(FPS), '-i', escena, '-frames:v', String(N),
  '-vf', `perspective=${per}:sense=destination:eval=frame:interpolation=cubic,format=yuv420p`, '-c:v', 'libx264', '-crf', '16', join(salida, 'prueba.mp4')]);
if (r.status !== 0) { console.error(String(r.stderr)); process.exit(1); }
const v0 = verdad.esquinas[0], vN = verdad.esquinas[N - 1];
const fmt = (q) => q.map(([x, y]) => `${Math.round(x)},${Math.round(y)}`).join(' ');
console.log(`${join(salida, 'prueba.mp4')} (${W}x${H}, ${N} fotogramas a ${FPS} fps) y verdad.json`);
console.log(`esquinas fotograma 0:  --esquinas "${fmt(v0)}"`);
console.log(`esquinas último:       --clave "${((N - 1) / FPS).toFixed(4)}=${fmt(vN)}"`);
