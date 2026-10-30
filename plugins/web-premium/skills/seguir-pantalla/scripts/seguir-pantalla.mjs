#!/usr/bin/env node
// seguir-pantalla.mjs: sigue fotograma a fotograma las 4 esquinas de una pantalla, un cartel, una etiqueta o cualquier
// rectángulo plano de un vídeo (generado con IA o grabado), para que el código ponga encima el contenido REAL
// (la web, el logo, un texto) con su perspectiva y sin estirarlo (capa-pantalla.js). Sin dependencias: Node + ffmpeg.
//
//   node seguir-pantalla.mjs video.mp4 --esquinas "x,y x,y x,y x,y" [--en 0]
//        [--clave "3.5=x,y x,y x,y x,y"]... [--salida pista.json] [--revision carpeta] [--ancho-analisis 960]
//
// - Esquinas en píxeles del vídeo ORIGINAL y en este orden: arriba-izquierda, arriba-derecha, abajo-derecha, abajo-izquierda
//   (las del rectángulo visible de la pantalla, sin el marco). Se miden en un fotograma: --en <segundos> (por defecto 0).
//   Para sacar ese fotograma con una rejilla y leer las coordenadas:  node seguir-pantalla.mjs video.mp4 --rejilla 0 --revision dir
//   y, para medir al píxel, la zona ampliada:  ... --rejilla 0 --zona x,y,ancho,alto --revision dir
// - --clave añade más fotogramas medidos a mano (p. ej. el último). El seguimiento va hacia delante y hacia atrás entre
//   claves y mezcla las dos pasadas: la deriva se anula en cada clave. Con 2 claves (inicio y fin) basta casi siempre.
// - Método: cada esquina se busca en el fotograma siguiente comparando un parche de imagen (correlación normalizada, que
//   aguanta cambios de luz) con búsqueda subpíxel. Funciona con empujes, arcos y zooms suaves (los de un vídeo para scroll).
//   Si la esquina se tapa o sale de cuadro, la marca como "perdida" y la rellena interpolando.
// - --revision: vídeo y hoja con el cuadrilátero dibujado para comprobarlo a ojo ANTES de montarlo en la web.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const argv = process.argv.slice(2);
const video = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--'))); // todas las opciones llevan valor
const op = (k, def) => { const i = argv.indexOf(`--${k}`); return i !== -1 ? argv[i + 1] : def; };
const todos = (k) => argv.flatMap((a, i) => (a === `--${k}` ? [argv[i + 1]] : []));
if (!video || !existsSync(video)) {
  console.error('Uso: node seguir-pantalla.mjs video.mp4 --esquinas "x,y x,y x,y x,y" [--en s] [--clave "s=x,y x,y x,y x,y"] [--salida pista.json] [--revision dir]\n' +
    '     node seguir-pantalla.mjs video.mp4 --rejilla <segundos> --revision dir   (fotograma con rejilla para medir las esquinas)');
  process.exit(2);
}

// --- ffmpeg: variable FFMPEG/FFPROBE → PATH → carpetas habituales ---
function buscar(nombre) {
  const env = process.env[nombre.toUpperCase()];
  if (env && existsSync(env)) return env;
  const r = spawnSync(nombre, ['-version'], { encoding: 'utf8' });
  if (!r.error) return nombre;
  const exe = process.platform === 'win32' ? `${nombre}.exe` : nombre;
  const h = ['C:\\ffmpeg\\bin', 'C:\\Program Files\\ffmpeg\\bin', '/usr/local/bin', '/opt/homebrew/bin'].map((d) => join(d, exe)).find(existsSync);
  if (!h) { console.error(`No encuentro ${nombre}: instálalo, ponlo en el PATH o pon su ruta en la variable ${nombre.toUpperCase()}.`); process.exit(1); }
  return h;
}
const FFMPEG = buscar('ffmpeg');
const FFPROBE = buscar('ffprobe');

const p = JSON.parse(spawnSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries',
  'stream=width,height,r_frame_rate,nb_read_packets:format=duration', '-of', 'json', video], { encoding: 'utf8' }).stdout);
const st = p.streams[0];
const [fn, fd] = st.r_frame_rate.split('/').map(Number);
const W0 = st.width, H0 = st.height, FPS = fn / (fd || 1);
const N = Number(st.nb_read_packets) || Math.round(Number(p.format.duration) * FPS);
const revision = op('revision') ? resolve(op('revision')) : null;
if (revision) mkdirSync(revision, { recursive: true });

// --- Modo rejilla: un fotograma con rejilla cada 100 px y coordenadas, para leer las esquinas a ojo ---
if (op('rejilla') != null) {
  if (!revision) { console.error('--rejilla necesita --revision <carpeta>'); process.exit(2); }
  const t = Number(op('rejilla'));
  if (op('zona')) {
    // recorte ampliado: líneas cada 10 px del original (más claras cada 50), para medir con precisión
    const [zx, zy, zw, zh] = op('zona').split(',').map(Number);
    const esc = Math.max(1, Math.floor(1400 / zw));
    const w = zw * esc, h = zh * esc;
    const r = spawnSync(FFMPEG, ['-v', 'error', '-ss', String(t), '-i', video, '-frames:v', '1', '-vf',
      `crop=${zw}:${zh}:${zx}:${zy},scale=${w}:${h}:flags=neighbor,format=rgb24`, '-f', 'rawvideo', '-'], { maxBuffer: 256 * 1024 * 1024 });
    const datos = Buffer.from(r.stdout);
    for (let x = Math.ceil(zx / 10) * 10; x < zx + zw; x += 10) linea(datos, w, h, (x - zx) * esc, 0, (x - zx) * esc, h - 1, x % 50 === 0 ? [255, 0, 255] : [110, 0, 110]);
    for (let y = Math.ceil(zy / 10) * 10; y < zy + zh; y += 10) linea(datos, w, h, 0, (y - zy) * esc, w - 1, (y - zy) * esc, y % 50 === 0 ? [255, 0, 255] : [110, 0, 110]);
    const png = join(revision, `rejilla-${t}s-zona-${zx}-${zy}.png`);
    escribirPNG(datos, w, h, png);
    console.log(`${png} (zona ${zx},${zy} ${zw}x${zh} ampliada x${esc}; líneas cada 10 px del original, más claras cada 50; la de arriba-izquierda es x=${Math.ceil(zx / 10) * 10}, y=${Math.ceil(zy / 10) * 10}).`);
    process.exit(0);
  }
  const { w, h, datos } = leerFotogramaRGB(t, W0);
  for (let x = 0; x < w; x += 50) linea(datos, w, h, x, 0, x, h - 1, x % 100 === 0 ? [255, 0, 255] : [120, 0, 120]);
  for (let y = 0; y < h; y += 50) linea(datos, w, h, 0, y, w - 1, y, y % 100 === 0 ? [255, 0, 255] : [120, 0, 120]);
  const png = join(revision, `rejilla-${t}s.png`);
  escribirPNG(datos, w, h, png);
  console.log(`${png} (${w}x${h}; líneas cada 50 px, más claras cada 100). Ábrela, lee las 4 esquinas aproximadas y, si la pantalla es pequeña,\n` +
    `amplía esa zona con --zona x,y,ancho,alto (p. ej. --zona 1300,430,260,140) para medirlas al píxel. Luego vuelve con --esquinas.`);
  process.exit(0);
}

// --- Entradas ---
const leerQuad = (s) => {
  const pts = String(s).trim().split(/\s+/).map((par) => par.split(',').map(Number));
  if (pts.length !== 4 || pts.some((q) => q.length !== 2 || q.some((v) => !Number.isFinite(v))))
    throw new Error(`Esquinas no válidas: "${s}" (4 pares x,y separados por espacios)`);
  return pts;
};
if (!op('esquinas')) { console.error('Falta --esquinas "x,y x,y x,y x,y" (o usa --rejilla para medirlas)'); process.exit(2); }
const claves = [{ f: Math.round(Number(op('en', 0)) * FPS), q: leerQuad(op('esquinas')) }];
for (const c of todos('clave')) {
  const [t, q] = c.split('=');
  claves.push({ f: Math.round(Number(t) * FPS), q: leerQuad(q) });
}
for (const c of claves) c.f = Math.min(N - 1, Math.max(0, c.f));
claves.sort((a, b) => a.f - b.f);

// --- Fotogramas en gris a resolución de análisis ---
const WA = Math.min(W0, Number(op('ancho-analisis', 960)));
const k = WA / W0;                           // de píxeles originales a píxeles de análisis
const HA = Math.round(H0 * k / 2) * 2;
console.log(`${basename(video)}: ${W0}x${H0}, ${N} fotogramas a ${FPS.toFixed(2)} fps · análisis a ${WA}x${HA}`);
const crudo = spawnSync(FFMPEG, ['-v', 'error', '-i', video, '-vf', `scale=${WA}:${HA}:flags=area,format=gray`, '-f', 'rawvideo', '-'],
  { maxBuffer: 1024 * 1024 * 1024 });
if (crudo.status !== 0) { console.error(String(crudo.stderr)); process.exit(1); }
const tam = WA * HA;
const frames = [];
for (let o = 0; o + tam <= crudo.stdout.length; o += tam) frames.push(crudo.stdout.subarray(o, o + tam));
const NF = frames.length;

// --- Seguimiento de un punto entre dos fotogramas: correlación normalizada (ZNCC) + subpíxel ---
const R = Math.max(6, Math.round(WA / 80));   // radio del parche (12 px a 960)
const S = Math.max(8, Math.round(WA / 50));   // radio de búsqueda
function muestra(img, x, y) {                // bilineal
  const x0 = Math.floor(x), y0 = Math.floor(y);
  if (x0 < 0 || y0 < 0 || x0 >= WA - 1 || y0 >= HA - 1) return NaN;
  const fx = x - x0, fy = y - y0, i = y0 * WA + x0;
  return img[i] * (1 - fx) * (1 - fy) + img[i + 1] * fx * (1 - fy) + img[i + WA] * (1 - fx) * fy + img[i + WA + 1] * fx * fy;
}
function parche(img, x, y) {
  const n = (2 * R + 1) ** 2, v = new Float32Array(n);
  let s = 0, j = 0;
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const m = muestra(img, x + dx, y + dy); if (Number.isNaN(m)) return null; v[j++] = m; s += m; }
  const media = s / n; let q = 0;
  for (let i = 0; i < n; i++) { v[i] -= media; q += v[i] * v[i]; }
  return { v, norma: Math.sqrt(q) || 1 };
}
function zncc(t, img, cx, cy) {             // cx, cy enteros
  if (cx - R < 0 || cy - R < 0 || cx + R >= WA || cy + R >= HA) return -1;
  let s = 0, s2 = 0, sc = 0, j = 0;
  const n = (2 * R + 1) ** 2;
  for (let dy = -R; dy <= R; dy++) {
    let i = (cy + dy) * WA + cx - R;
    for (let dx = -R; dx <= R; dx++, i++, j++) { const m = img[i]; s += m; s2 += m * m; sc += m * t.v[j]; }
  }
  const varI = s2 - (s * s) / n;
  return varI <= 1e-6 ? -1 : sc / (Math.sqrt(varI) * t.norma);
}
function seguir(desde, hasta, x, y) {
  const t = parche(frames[desde], x, y);
  if (!t) return { x, y, c: 0 };
  const bx = Math.round(x), by = Math.round(y);
  let mejor = -2, mx = bx, my = by;
  const tabla = new Map();
  for (let dy = -S; dy <= S; dy++) for (let dx = -S; dx <= S; dx++) {
    const c = zncc(t, frames[hasta], bx + dx, by + dy);
    tabla.set(`${dx},${dy}`, c);
    if (c > mejor) { mejor = c; mx = bx + dx; my = by + dy; }
  }
  // subpíxel: parábola en cada eje alrededor del máximo
  const g = (dx, dy) => tabla.get(`${mx - bx + dx},${my - by + dy}`) ?? mejor;
  const sub = (a, b, c) => { const d = a - 2 * b + c; return Math.abs(d) < 1e-9 ? 0 : Math.max(-0.5, Math.min(0.5, (a - c) / (2 * d))); };
  return { x: mx + sub(g(-1, 0), mejor, g(1, 0)), y: my + sub(g(0, -1), mejor, g(0, 1)), c: mejor };
}

// Pasada en una dirección desde un fotograma clave; devuelve [f] = {q, c}
function pasada(clave, fin, paso) {
  const res = new Map();
  let q = clave.q.map(([x, y]) => [x * k, y * k]);
  res.set(clave.f, { q, c: 1 });
  for (let f = clave.f; f !== fin; f += paso) {
    const sig = f + paso;
    const nq = [], cs = [];
    for (const [x, y] of q) { const r = seguir(f, sig, x, y); nq.push([r.x, r.y]); cs.push(r.c); }
    q = nq;
    res.set(sig, { q, c: Math.min(...cs) });
  }
  return res;
}

const pista = new Array(NF).fill(null);
const confianza = new Array(NF).fill(0);
const UMBRAL = Number(op('umbral', 0.55));
// tramos: antes de la 1ª clave (solo hacia atrás), entre claves (ida y vuelta mezcladas), tras la última (solo hacia delante)
const primera = claves[0], ultima = claves[claves.length - 1];
for (const [f, r] of pasada(primera, 0, -1)) { pista[f] = r.q; confianza[f] = r.c; }
for (const [f, r] of pasada(ultima, NF - 1, 1)) { pista[f] = r.q; confianza[f] = r.c; }
for (let i = 0; i < claves.length - 1; i++) {
  const a = claves[i], b = claves[i + 1];
  if (a.f === b.f) continue;
  const ida = pasada(a, b.f, 1), vuelta = pasada(b, a.f, -1);
  for (let f = a.f; f <= b.f; f++) {
    const w = (f - a.f) / (b.f - a.f);           // 0 en a (manda la ida), 1 en b (manda la vuelta)
    const qi = ida.get(f).q, qv = vuelta.get(f).q;
    pista[f] = qi.map(([x, y], j) => [x * (1 - w) + qv[j][0] * w, y * (1 - w) + qv[j][1] * w]);
    confianza[f] = Math.max(ida.get(f).c * (1 - w), 0) + Math.max(vuelta.get(f).c * w, 0);
    // si las dos pasadas discrepan mucho, la esquina se ha perdido en algún punto
    const dif = Math.max(...qi.map(([x, y], j) => Math.hypot(x - qv[j][0], y - qv[j][1])));
    if (dif > R) confianza[f] = Math.min(confianza[f], 0.3);
  }
}
// rellena los fotogramas dudosos interpolando entre los buenos más cercanos
const bueno = (f) => confianza[f] >= UMBRAL && convexo(pista[f]);
const perdidos = [];
for (let f = 0; f < NF; f++) {
  if (bueno(f)) continue;
  perdidos.push(f);
  let a = f - 1; while (a >= 0 && !bueno(a)) a--;
  let b = f + 1; while (b < NF && !bueno(b)) b++;
  if (a >= 0 && b < NF) { const w = (f - a) / (b - a); pista[f] = pista[a].map(([x, y], j) => [x + (pista[b][j][0] - x) * w, y + (pista[b][j][1] - y) * w]); }
  else if (a >= 0) pista[f] = pista[a]; else if (b < NF) pista[f] = pista[b];
}
// suavizado temporal ligero (media de 3), sin tocar las claves
const clavesF = new Set(claves.map((c) => c.f));
const suave = pista.map((q, f) => (clavesF.has(f) || f === 0 || f === NF - 1) ? q
  : q.map(([x, y], j) => [(pista[f - 1][j][0] + x + pista[f + 1][j][0]) / 3, (pista[f - 1][j][1] + y + pista[f + 1][j][1]) / 3]));

function convexo(q) {
  let signo = 0;
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = q[i], [bx, by] = q[(i + 1) % 4], [cx, cy] = q[(i + 2) % 4];
    const z = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
    if (Math.abs(z) < 1e-6) return false;
    if (signo === 0) signo = Math.sign(z); else if (Math.sign(z) !== signo) return false;
  }
  return true;
}

// --- Salida: coordenadas en píxeles del vídeo original ---
const salida = resolve(op('salida', join(revision ?? '.', 'pista.json')));
const redondear = (v) => Math.round((v / k) * 10) / 10;
const datos = {
  version: 1,
  herramienta: 'seguir-pantalla.mjs',
  video: basename(video),
  ancho: W0, alto: H0, fps: Number(FPS.toFixed(4)), fotogramas: NF,
  orden: ['arriba-izquierda', 'arriba-derecha', 'abajo-derecha', 'abajo-izquierda'],
  claves: claves.map((c) => ({ fotograma: c.f, esquinas: c.q })),
  perdidos,
  esquinas: suave.map((q) => q.map(([x, y]) => [redondear(x), redondear(y)])),
};
writeFileSync(salida, JSON.stringify(datos));
const conf = confianza.filter((_, f) => !clavesF.has(f));
const media = conf.reduce((a, b) => a + b, 0) / Math.max(1, conf.length);
console.log(`pista: ${salida}`);
console.log(`  ${NF} fotogramas · confianza media ${media.toFixed(2)} · ${perdidos.length} rellenados por interpolación${perdidos.length ? ` (${resumirTramos(perdidos)})` : ''}`);
if (perdidos.length > NF * 0.15) console.log('  AVISO: muchos fotogramas dudosos. Añade más --clave (mide las esquinas en 1-2 fotogramas intermedios) o usa un parche mayor (--ancho-analisis más alto).');

// --- Revisión: vídeo y hoja con el cuadrilátero dibujado ---
if (revision) {
  const WR = Math.min(W0, 960), HR = Math.round(H0 * WR / W0 / 2) * 2, kr = WR / W0;
  const rgb = spawnSync(FFMPEG, ['-v', 'error', '-i', video, '-vf', `scale=${WR}:${HR},format=rgb24`, '-f', 'rawvideo', '-'], { maxBuffer: 2048 * 1024 * 1024 });
  const t3 = WR * HR * 3, salidaFr = [];
  for (let o = 0, f = 0; o + t3 <= rgb.stdout.length && f < NF; o += t3, f++) {
    const d = Buffer.from(rgb.stdout.subarray(o, o + t3));
    const q = datos.esquinas[f].map(([x, y]) => [x * kr, y * kr]);
    const color = perdidos.includes(f) ? [255, 140, 0] : [0, 255, 90];
    for (let i = 0; i < 4; i++) { const [ax, ay] = q[i], [bx, by] = q[(i + 1) % 4]; linea(d, WR, HR, ax, ay, bx, by, color, 2); }
    salidaFr.push(d);
  }
  const mp4 = join(revision, 'revision-pista.mp4');
  const enc = spawnSync(FFMPEG, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${WR}x${HR}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', mp4], { input: Buffer.concat(salidaFr), maxBuffer: 64 * 1024 * 1024 });
  if (enc.status !== 0) console.error(String(enc.stderr));
  const hoja = join(revision, 'revision-pista-hoja.png');
  const cada = Math.max(1, Math.floor(NF / 12));
  spawnSync(FFMPEG, ['-v', 'error', '-y', '-i', mp4, '-vf', `select='not(mod(n\\,${cada}))',scale=480:-2,tile=4x3:padding=4:color=white`, '-frames:v', '1', hoja]);
  console.log(`revisión: ${mp4}\n           ${hoja}  (verde = seguido; naranja = rellenado)`);
}

// --- utilidades ---
function resumirTramos(fs) {
  const t = []; let a = fs[0], b = fs[0];
  for (const f of fs.slice(1)) { if (f === b + 1) b = f; else { t.push(a === b ? `${a}` : `${a}-${b}`); a = b = f; } }
  t.push(a === b ? `${a}` : `${a}-${b}`);
  return t.slice(0, 6).join(', ') + (t.length > 6 ? '…' : '');
}
function linea(d, w, h, x0, y0, x1, y1, c, grosor = 1) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)) + 1;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n;
    for (let gy = -grosor + 1; gy < grosor; gy++) for (let gx = -grosor + 1; gx < grosor; gx++) {
      const px = Math.round(x + gx), py = Math.round(y + gy);
      if (px < 0 || py < 0 || px >= w || py >= h) continue;
      const o = (py * w + px) * 3; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2];
    }
  }
}
function leerFotogramaRGB(t, w) {
  const h = Math.round(H0 * w / W0 / 2) * 2;
  const r = spawnSync(FFMPEG, ['-v', 'error', '-ss', String(t), '-i', video, '-frames:v', '1', '-vf', `scale=${w}:${h},format=rgb24`, '-f', 'rawvideo', '-'], { maxBuffer: 256 * 1024 * 1024 });
  return { w, h, datos: Buffer.from(r.stdout) };
}
function escribirPNG(d, w, h, ruta) {
  const r = spawnSync(FFMPEG, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${w}x${h}`, '-i', '-', '-frames:v', '1', ruta], { input: d });
  if (r.status !== 0) console.error(String(r.stderr));
}
