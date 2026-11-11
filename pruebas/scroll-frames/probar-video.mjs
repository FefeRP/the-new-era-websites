// Prueba en Chrome de video-scrubber.js (modo vídeo) con verdad conocida: el MP4 de --video-scrub sale de un vídeo
// sintético en el que cada fotograma tiene un gris único. Comprueba que cada progreso pinta el fotograma esperado y que
// las búsquedas se paran cuando el scroll se para (sin bucle de seeks).
// Uso, desde demos/reloj (playwright-core): node ../../pruebas/scroll-frames/probar-video.mjs
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const SAL = join(AQUI, 'salida');
const FF = process.env.FFMPEG || 'ffmpeg';
const FPS = 30, PUERTO = 5198;
const r = (c, a) => { const p = spawnSync(c, a, { encoding: 'utf8' }); if (p.status) { console.log(p.stderr.slice(-800)); process.exit(1); } return p.stdout; };

mkdirSync(SAL, { recursive: true });
const fuente = join(SAL, 'v30-video.mp4');
r(FF, ['-hide_banner', '-y', '-f', 'lavfi', '-i', `color=c=black:s=320x180:r=${FPS}:d=2`, '-vf', "geq=lum='20+3.5*N':cb=128:cr=128",
  '-c:v', 'libx264', '-qp', '0', '-pix_fmt', 'yuv444p', fuente]);
rmSync(join(SAL, 'video'), { recursive: true, force: true });
r('node', [join(RAIZ, 'plugins/the-new-era-websites/skills/scroll-frames/scripts/extraer-frames.mjs'), fuente, join(SAL, 'video'), '--ancho-movil', '0', '--frames', '60', '--video-scrub']);
// tabla gris → fotograma, leída del MP4 que se sirve (así el códec no cuenta)
const raw = spawnSync(FF, ['-v', 'error', '-i', join(SAL, 'video', 'scrub-escritorio.mp4'), '-vf', 'crop=8:8:156:86,format=rgb24', '-f', 'rawvideo', '-'], { encoding: 'buffer', maxBuffer: 1e8 }).stdout;
const tabla = []; for (let i = 0; i < raw.length; i += 192) { let s = 0; for (let j = 0; j < 192; j += 3) s += raw[i + j]; tabla.push(s / 64); }
const indice = (g) => tabla.reduce((b, v, i) => (Math.abs(v - g) < Math.abs(tabla[b] - g) ? i : b), 0);

const servidor = spawn('node', [join(RAIZ, 'pruebas', 'servidor-estatico.mjs'), RAIZ, String(PUERTO)], { stdio: 'ignore' });
await new Promise((ok) => setTimeout(ok, 800));
const fallos = [];
const ok = (c, m) => { console.log(`${c ? 'OK ' : 'MAL'} ${m}`); if (!c) fallos.push(m); };
try {
  const pw = await import(pathToFileURL(resolve('node_modules/playwright-core/index.mjs')).href);
  const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
  const nav = await pw.chromium.launch({ executablePath: chrome, args: ['--autoplay-policy=no-user-gesture-required'] });
  const pag = await nav.newPage();
  const errores = []; pag.on('pageerror', (e) => errores.push(e.message));
  await pag.goto(`http://127.0.0.1:${PUERTO}/pruebas/scroll-frames/video.html`);
  await pag.waitForFunction(() => document.title === 'lista', null, { timeout: 20000 });
  const info = await pag.evaluate(() => ({ ok: prueba.ok, fotogramas: prueba.fotogramas, fps: prueba.fps }));
  ok(info.ok && info.fotogramas === tabla.length && info.fps === FPS, `motor listo: ${info.fotogramas} fotogramas a ${info.fps} fps (MP4: ${tabla.length})`);
  const ultimo = tabla.length - 1;
  for (const p of [0, 0.1, 0.25, 0.5, 0.73, 0.9, 1, 0.4]) {
    const { gris } = await pag.evaluate((p) => prueba.ir(p), p);
    const esperado = Math.round(p * ultimo), visto = indice(gris);
    ok(visto === esperado, `progreso ${p}: fotograma ${visto} (esperado ${esperado})`);
  }
  // barrido rápido como un scroll real y parada: las búsquedas tienen que acabar
  await pag.evaluate(() => prueba.barrido(0, 1, 60));
  const { gris } = await pag.evaluate(() => prueba.ir(1));
  ok(indice(gris) === ultimo, `tras un barrido rápido acaba en el último fotograma (${indice(gris)})`);
  const extra = await pag.evaluate(() => prueba.esperar(1500));
  ok(extra === 0, `parado 1,5 s: ${extra} búsquedas de más (sin bucle de seeks)`);
  ok(!errores.length, `sin errores en la página${errores.length ? ': ' + errores.join(' | ') : ''}`);
  await nav.close();
} finally {
  servidor.kill();
}
console.log(fallos.length ? `${fallos.length} fallos` : 'Todo bien');
process.exit(fallos.length ? 1 : 0);
