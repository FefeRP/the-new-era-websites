// Prueba en Chrome de video-alfa.js y frame-scrubber transparente sobre la página web/ (salidas de alfa.mjs).
// Uso (desde demos/reloj, donde está playwright-core), con el servidor de pruebas sirviendo la raíz del repo:
//   node ../../pruebas/servidor-estatico.mjs ../.. 5193 &
//   node ../../pruebas/capas-alfa/probar-web.mjs http://127.0.0.1:5193/pruebas/capas-alfa/web/ ../../capturas/prueba-capas-alfa
// Comprueba en cada sección, sobre la captura: que no quede verde de croma ni un rectángulo negro (alfa roto), que el sujeto
// naranja se vea, que el vídeo de scroll cambie con el scroll, que con reduced-motion se quede el póster, y 0 errores.
import { mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [url, salidaArg] = process.argv.slice(2);
const salida = resolve(salidaArg || 'capturas-capas-alfa'); mkdirSync(salida, { recursive: true });
const pw = await import(pathToFileURL(resolve('node_modules/playwright-core/index.mjs')).href);
const chrome = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
const nav = await pw.chromium.launch({ executablePath: chrome, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const FF = process.env.FFMPEG || 'ffmpeg';
const fallos = [];
const ok = (c, m) => { console.log(`${c ? 'OK ' : 'MAL'} ${m}`); if (!c) fallos.push(m); };

function pixeles(png) {
  const p = spawnSync(FF, ['-v', 'error', '-i', png, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 });
  return p.stdout;
}
// cuenta píxeles por clase en una captura de la ventana
function clasificar(buf) {
  let verde = 0, naranja = 0, negro = 0;
  for (let i = 0; i < buf.length; i += 3) {
    const r = buf[i], g = buf[i + 1], b = buf[i + 2];
    if (g > 120 && g > r + 70 && g > b + 50) verde++;
    if (r > 170 && g > 60 && g < 170 && b < 90 && r > g + 50) naranja++;
    if (r < 12 && g < 12 && b < 12) negro++;
  }
  const n = buf.length / 3;
  return { verde: verde / n, naranja: naranja / n, negro: negro / n };
}

async function pasada(nombre, opciones) {
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 800 }, ...opciones });
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', (e) => errores.push(String(e)));
  page.on('requestfailed', (r) => errores.push('petición fallida: ' + r.url()));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__prueba?.listo, null, { timeout: 60000 });
  const res = {};
  const captura = async (sel, etiqueta, desplazar = 0) => {
    await page.evaluate(([s, d]) => { const e = document.querySelector(s); scrollTo(0, e.offsetTop + d * (e.offsetHeight - innerHeight)); }, [sel, desplazar]);
    await page.waitForTimeout(1500);
    const f = join(salida, `${nombre}-${etiqueta}.png`);
    await page.screenshot({ path: f, timeout: 120000 }); // con WebGL por software la captura puede tardar
    return clasificar(pixeles(f));
  };
  res.sandwich = await captura('#sandwich', 'sandwich');
  res.scroll0 = await captura('#scroll', 'scroll-0', 0.05);
  res.scroll1 = await captura('#scroll', 'scroll-1', 0.95);
  res.frames = await captura('#frames', 'frames', 0.5);
  res.chispas = await captura('#chispas', 'chispas');
  res.estado = await page.evaluate(() => ({
    posterSandwich: getComputedStyle(document.querySelector('#sandwich .poster')).visibility,
    canvasSandwich: getComputedStyle(document.querySelector('#sandwich canvas')).visibility,
    tiempoScroll: window.__prueba.motores.b.video?.currentTime ?? null,
  }));
  res.errores = errores;
  await ctx.close();
  return res;
}

const normal = await pasada('normal', {});
console.log(JSON.stringify(normal, null, 1));
for (const k of ['sandwich', 'scroll0', 'scroll1', 'frames', 'chispas']) ok(normal[k].verde < 0.0005, `${k}: sin verde de croma (${(normal[k].verde * 100).toFixed(3)} %)`);
for (const k of ['sandwich', 'scroll0', 'scroll1', 'frames']) ok(normal[k].naranja > 0.004, `${k}: el sujeto se ve (${(normal[k].naranja * 100).toFixed(2)} % naranja)`);
for (const k of ['sandwich', 'scroll0', 'scroll1', 'frames', 'chispas']) ok(normal[k].negro < 0.02, `${k}: sin rectángulo negro (${(normal[k].negro * 100).toFixed(2)} %)`);
ok(normal.estado.canvasSandwich === 'visible' && normal.estado.posterSandwich === 'hidden', 'bucle: el canvas sustituye al póster');
ok(normal.estado.tiempoScroll > 1.0, `scroll: currentTime avanza con el scroll (${normal.estado.tiempoScroll?.toFixed(2)} s al final)`);
ok(normal.errores.length === 0, `0 errores de consola (${normal.errores.join(' | ')})`);

const reducido = await pasada('reducido', { reducedMotion: 'reduce' });
ok(reducido.estado.posterSandwich !== 'hidden' && reducido.estado.canvasSandwich === 'hidden', 'reduced-motion: se queda el póster');
ok(reducido.sandwich.naranja > 0.004 && reducido.sandwich.verde < 0.0005, 'reduced-motion: el póster con alfa se ve limpio');
ok(reducido.errores.length === 0, `reduced-motion: 0 errores (${reducido.errores.join(' | ')})`);

await nav.close();
console.log(fallos.length ? `\n${fallos.length} fallo(s)` : '\nTodo bien');
process.exit(fallos.length ? 1 : 0);
