// Prueba de capa-pantalla.js contra la verdad del vídeo sintético: en escritorio (cover y contain) y en móvil (variante
// recortada), en 5 puntos del scroll, mide en px CSS cuánto se separan las esquinas de la capa de las esquinas reales.
// Uso (desde demos/reloj, donde está playwright-core):
//   node ../../pruebas/seguir-pantalla/probar-capa.mjs "<url de la página con ?base=...>" <verdad.json> <carpeta-capturas>
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [url, verdadRuta, salidaArg] = process.argv.slice(2);
const verdad = JSON.parse(readFileSync(verdadRuta, 'utf8'));
const salida = resolve(salidaArg); mkdirSync(salida, { recursive: true });
const pw = await import(pathToFileURL(resolve('node_modules/playwright-core/index.mjs')).href);
const chrome = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
const nav = await pw.chromium.launch({ executablePath: chrome });
const fallos = [];
const ok = (cond, msg) => { console.log(`${cond ? 'OK ' : 'MAL'} ${msg}`); if (!cond) fallos.push(msg); };
const UMBRAL = 5; // px CSS

const casos = [
  { nombre: 'escritorio-cover', viewport: { width: 1440, height: 900 }, extra: '&ajuste=cover' },
  { nombre: 'escritorio-contain', viewport: { width: 1440, height: 1000 }, extra: '&ajuste=contain' },
  { nombre: 'movil-cover', viewport: { width: 390, height: 844 }, extra: '&ajuste=cover', movil: true },
];
for (const caso of casos) {
  const ctx = await nav.newContext({ viewport: caso.viewport, ...(caso.movil ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) });
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', (e) => errores.push(String(e)));
  await page.goto(url + caso.extra, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__prueba?.listo, null, { timeout: 30000 });
  let peor = 0;
  for (const p of [0, 0.25, 0.5, 0.75, 1]) {
    await page.evaluate((p) => window.__prueba.irA(p), p);
    const { capa, d } = await page.evaluate(() => ({ capa: window.__prueba.esquinasCapa(), d: window.__prueba.ultimo() }));
    // esperado, calculado aquí por separado: verdad (px del vídeo) → fotograma → canvas → px CSS
    const t = d.manifest.inicio + d.i / d.manifest.fps;
    const q = verdad.esquinas[Math.round(t * verdad.fps)];
    const rec = d.variante.recorte ?? { x: 0, ancho: 1 };
    const esperado = q.map(([x, y]) => [(d.x + ((x / verdad.ancho - rec.x) / rec.ancho) * d.w) / d.escala, (d.y + (y / verdad.alto) * d.h) / d.escala]);
    const err = Math.max(...capa.map(([x, y], j) => Math.hypot(x - esperado[j][0], y - esperado[j][1])));
    peor = Math.max(peor, err);
    await page.screenshot({ path: join(salida, `${caso.nombre}-p${Math.round(p * 100)}.png`) });
  }
  const variante = await page.evaluate(() => window.__prueba.seq.variante);
  const proporcion = await page.evaluate(() => { const e = document.querySelector('.capa-pantalla'); return e.offsetWidth / e.offsetHeight; });
  ok(peor < UMBRAL, `${caso.nombre} (${variante}): error máximo de las esquinas ${peor.toFixed(2)} px CSS (< ${UMBRAL})`);
  ok(Math.abs(proporcion - 1.6) < 0.01, `${caso.nombre}: la capa conserva el aspecto real 16:10 (${proporcion.toFixed(3)}) y la perspectiva la pone la homografía`);
  ok(!caso.movil || variante === 'movil', `${caso.nombre}: usa la variante ${variante}`);
  ok(errores.length === 0, `${caso.nombre}: sin errores de consola${errores.length ? ': ' + errores.join(' | ') : ''}`);
  await ctx.close();
}
await nav.close();
console.log(fallos.length ? `\n${fallos.length} fallos` : '\nTodo bien');
process.exit(fallos.length ? 1 : 0);
