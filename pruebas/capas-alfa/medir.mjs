#!/usr/bin/env node
// Compara la salida de alfa.mjs con la verdad.
//   node medir.mjs <verdad.png | carpeta-verdad> <salida.png | carpeta png/ de alfa.mjs> [--fondo 3a5a78]
// Mide: error medio del alfa (0..1), error del alfa en el borde (donde la verdad está entre 2 % y 98 %), y la
// recomposición sobre un fondo de prueba (PSNR en dB: > 35 es indistinguible a la vista; > 30, bueno).
import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FF = process.env.FFMPEG || 'ffmpeg', FP = process.env.FFPROBE || 'ffprobe';
const [verdadArg, salidaArg] = process.argv.slice(2);
const iFondo = process.argv.indexOf('--fondo');
const fondoHex = iFondo > 0 ? process.argv[iFondo + 1] : '3a5a78';
const fondo = [0, 2, 4].map((k) => parseInt(fondoHex.slice(k, k + 2), 16));
if (!verdadArg || !salidaArg) { console.log('Uso: node medir.mjs <verdad> <salida> [--fondo rrggbb]'); process.exit(1); }

function tam(f) {
  const r = spawnSync(FP, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f], { encoding: 'utf8' });
  return r.stdout.trim().split(',').map(Number);
}
function leer(f, w, h) {
  const r = spawnSync(FF, ['-v', 'error', '-i', f, '-vf', `scale=${w}:${h},format=rgba`, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(String(r.stderr));
  return r.stdout;
}
const lista = (p) => (statSync(p).isDirectory() ? readdirSync(p).filter((f) => f.endsWith('.png')).sort().map((f) => join(p, f)) : [p]);
const V = lista(verdadArg), S = lista(salidaArg);
const n = Math.min(V.length, S.length);
if (V.length !== S.length) console.warn(`Aviso: ${V.length} verdades y ${S.length} salidas; comparo ${n}.`);

let errA = 0, cntA = 0, errB = 0, cntB = 0, mse = 0, cntM = 0;
const paso = Math.max(1, Math.floor(n / 12));
for (let f = 0; f < n; f += paso) {
  const [w, h] = tam(V[f]);
  const v = leer(V[f], w, h), s = leer(S[f], w, h);
  for (let i = 0; i < v.length; i += 4) {
    const av = v[i + 3] / 255, as = s[i + 3] / 255;
    const e = Math.abs(av - as);
    errA += e; cntA++;
    if (av > 0.02 && av < 0.98) { errB += e; cntB++; }
    for (let k = 0; k < 3; k++) {
      const cv = (v[i + k] / 255) * av + (fondo[k] / 255) * (1 - av);
      const cs = (s[i + k] / 255) * as + (fondo[k] / 255) * (1 - as);
      mse += (cv - cs) ** 2; cntM++;
    }
  }
}
const psnr = 10 * Math.log10(1 / Math.max(1e-10, mse / cntM));
const res = { fotogramas: Math.ceil(n / paso), error_alfa_medio: +(errA / cntA).toFixed(4), error_alfa_borde: cntB ? +(errB / cntB).toFixed(4) : null, psnr_recomposicion_db: +psnr.toFixed(1) };
console.log(JSON.stringify(res));
