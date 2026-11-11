// Prueba de extraer-frames.mjs con verdad conocida: cada fotograma del vídeo sintético tiene un gris único, así que
// se puede saber de qué fotograma de origen sale cada frame extraído. Todos los saltos tienen que ser iguales
// (si no, el scroll da tirones) y el manifest tiene que coincidir con lo que hay en disco.
// Uso (ffmpeg en FFMPEG o en el PATH): node pruebas/scroll-frames/probar-paso.mjs
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const SAL = join(AQUI, 'salida');
const EXT = join(AQUI, '..', '..', 'plugins', 'the-new-era-websites', 'skills', 'scroll-frames', 'scripts', 'extraer-frames.mjs');
const FF = process.env.FFMPEG || 'ffmpeg';
const FPS = 30;
const r = (c, a) => { const p = spawnSync(c, a, { encoding: 'utf8' }); if (p.status) { console.log(p.stderr.slice(-800)); process.exit(1); } return p.stdout; };
const gris = (f) => {
  const raw = spawnSync(FF, ['-v', 'error', '-i', f, '-vf', 'crop=8:8:156:86,format=gray', '-f', 'rawvideo', '-'], { encoding: 'buffer', maxBuffer: 1e8 }).stdout;
  const o = [];
  for (let i = 0; i < raw.length; i += 64) { let s = 0; for (let j = 0; j < 64; j++) s += raw[i + j]; o.push(s / 64); }
  return o;
};

rmSync(SAL, { recursive: true, force: true });
mkdirSync(SAL, { recursive: true });
const video = join(SAL, 'v30.mp4');
r(FF, ['-hide_banner', '-y', '-f', 'lavfi', '-i', `color=c=black:s=320x180:r=${FPS}:d=4`, '-vf', "geq=lum='20+1.5*N':cb=128:cr=128",
  '-c:v', 'libx264', '-qp', '0', '-pix_fmt', 'yuv444p', video]);
const tabla = gris(video);
const indice = (g) => tabla.reduce((b, v, i) => (Math.abs(v - g) < Math.abs(tabla[b] - g) ? i : b), 0);

const CASOS = [
  ['frames60', ['--frames', '60'], 2],
  ['frames40', ['--frames', '40'], 3],
  ['frames75', ['--frames', '75'], 2], // 120/75 = 1,6 → paso 2 (con aviso), nunca intervalos 1-2-1-2
  ['fps24', ['--fps', '24'], 1],       // 24 de 30 → paso 1 (con aviso)
  ['fps10', ['--fps', '10'], 3],
  ['ambos', ['--frames', '40', '--formato', 'ambos'], 3],
  ['inicio', ['--inicio', '1', '--frames', '30'], 3],
  ['movil', ['--frames', '60', '--ancho-movil', '160'], 2],
];
let mal = 0;
for (const [nombre, args, paso] of CASOS) {
  const out = join(SAL, nombre);
  const extra = args.includes('--ancho-movil') ? [] : ['--ancho-movil', '0'];
  const log = r('node', [EXT, video, out, '--calidad', '100', ...extra, ...args]);
  const m = JSON.parse(readFileSync(join(out, 'manifest.json'), 'utf8'));
  for (const variante of Object.keys(m.variantes)) {
    for (const ext of m.formatos) {
      const fr = readdirSync(join(out, variante)).filter((f) => f.endsWith('.' + ext)).sort();
      const n = fr.map((f) => indice(gris(join(out, variante, f))[0]));
      const saltos = [...new Set(n.slice(1).map((x, i) => x - n[i]))];
      const ok = saltos.length === 1 && saltos[0] === paso && m.paso === paso && n[0] === Math.round((m.inicio || 0) * FPS)
        && m.frames === fr.length && Math.abs(m.fps - FPS / paso) < 1e-3;
      if (!ok) mal++;
      console.log(`${ok ? 'OK ' : 'MAL'} ${nombre} ${variante} ${ext} | ${fr.length} frames | paso ${m.paso} | saltos ${saltos.join(',')} | origen ${n[0]}…${n.at(-1)}${log.includes('Aviso') ? ' | con aviso' : ''}`);
    }
  }
}
console.log(mal ? `${mal} fallos` : 'Todo bien');
process.exit(mal ? 1 : 0);
