// Prueba en Chrome de fondo-capas.js (relevo capa a capa) sobre index.html con las capas de hacer-capas.mjs.
// Uso (desde demos/reloj, donde está playwright-core), con el servidor de pruebas sirviendo la raíz del repo:
//   node ../../pruebas/fondo-capas/probar.mjs http://127.0.0.1:5193/pruebas/fondo-capas/ ../../capturas/prueba-fondo-capas
import { mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [url, salidaArg] = process.argv.slice(2);
const salida = resolve(salidaArg || 'capturas-fondo-capas'); mkdirSync(salida, { recursive: true });
const pw = await import(pathToFileURL(resolve('node_modules/playwright-core/index.mjs')).href);
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
const nav = await pw.chromium.launch({ executablePath: chrome });
const fallos = [];
const ok = (c, m) => { console.log(`${c ? 'OK ' : 'MAL'} ${m}`); if (!c) fallos.push(m); };

async function abrir(sufijo = '', opciones = {}) {
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 800 }, ...opciones });
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', (e) => errores.push(String(e)));
  await page.goto(url + sufijo, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__prueba?.listo, null, { timeout: 30000 });
  return { ctx, page, errores };
}
// opacidad de la versión <escena> de cada capa: { cielo: 1, montes: 0, suelo: 0 }
const opacidades = (page, escena) => page.evaluate((e) => Object.fromEntries(
  [...document.querySelectorAll('[data-capa]')].filter((c) => c.querySelector('[data-escena]')).map((c) =>
    [c.dataset.capa, Number(getComputedStyle(c.querySelector(`[data-escena="${e}"]`)).opacity)])), escena);
const todas = (o, v) => Object.values(o).every((x) => Math.abs(x - v) < 0.02);
const animacionesVivas = (page) => page.evaluate(() => document.querySelectorAll('[data-escena]').length &&
  [...document.querySelectorAll('[data-escena]')].reduce((n, el) => n + el.getAnimations().length, 0));

// 1. Estado inicial, relevo escalonado y final
{
  const { ctx, page, errores } = await abrir();
  ok(todas(await opacidades(page, 'dia'), 1), 'al cargar, las tres capas muestran la escena inicial (dia)');
  ok(todas(await opacidades(page, 'noche'), 0), 'al cargar, las demás escenas están ocultas');
  await page.screenshot({ path: join(salida, '1-dia.png') });
  // Medida determinista: se pausan las animaciones del relevo y se colocan en los 260 ms (el reloj de un Chrome
  // headless sin GPU va a saltos y no sirve para medir el escalonado con esperas).
  await page.evaluate(() => {
    window.__prueba.fondo.irA('noche');
    for (const a of document.getAnimations()) { a.pause(); a.currentTime = 260; }
  });
  const medio = await opacidades(page, 'noche');
  await page.screenshot({ path: join(salida, '2-relevo.png') });
  ok(medio.cielo > 0.05 && medio.montes < 0.02 && medio.suelo < 0.02,
    `escalonado: a 260 ms el cielo ya entra (${medio.cielo.toFixed(2)}) y montes y suelo aún no (${medio.montes.toFixed(2)}, ${medio.suelo.toFixed(2)})`);
  await page.evaluate(() => { for (const a of document.getAnimations()) a.play(); });
  await page.waitForTimeout(2200);
  ok(todas(await opacidades(page, 'noche'), 1) && todas(await opacidades(page, 'dia'), 0), 'tras el relevo, todas las capas en noche y dia oculta');
  ok(await animacionesVivas(page) === 0, 'no quedan animaciones vivas acumuladas (commitStyles + cancel)');
  ok(await page.evaluate(() => !!document.getElementById('shader') && document.getElementById('shader').width > 0), 'la capa fija (shader) sigue en su sitio');
  await page.screenshot({ path: join(salida, '3-noche.png') });
  // 2. Interrumpir a medias
  await page.click('[data-ir="dia"]'); await page.waitForTimeout(120); await page.click('[data-ir="atardecer"]');
  await page.waitForTimeout(2400);
  const at = await opacidades(page, 'atardecer'), di = await opacidades(page, 'dia'), no = await opacidades(page, 'noche');
  ok(todas(at, 1) && todas(di, 0) && todas(no, 0), 'interrumpido a medias, acaba limpio en la última escena pedida (atardecer)');
  ok(await page.evaluate(() => window.__prueba.fondo.actual) === 'atardecer', 'fondo.actual = atardecer');
  await page.screenshot({ path: join(salida, '4-atardecer.png') });
  ok(errores.length === 0, `sin errores de consola${errores.length ? ': ' + errores.join(' | ') : ''}`);
  await ctx.close();
}
// 3. Movimiento reducido: fundido corto, sin escalonado
{
  const { ctx, page, errores } = await abrir('', { reducedMotion: 'reduce' });
  await page.click('[data-ir="noche"]');
  await page.waitForTimeout(450);
  ok(todas(await opacidades(page, 'noche'), 1), 'reduced-motion: todas las capas cambian a la vez en ≤ 450 ms');
  ok(errores.length === 0, 'reduced-motion sin errores');
  await ctx.close();
}
// 4. Llevado por el scroll (pasos con data-paso-escena)
{
  const { ctx, page, errores } = await abrir('?scroll');
  const escenaEn = async (i) => {
    await page.evaluate((n) => document.querySelectorAll('[data-paso-escena]')[n].scrollIntoView({ block: 'center' }), i);
    await page.waitForTimeout(1800);
    return page.evaluate(() => document.querySelector('[data-fondo-capas]').dataset.escenaActual);
  };
  ok(await escenaEn(2) === 'noche', 'scroll al paso 3 → noche');
  ok(todas(await opacidades(page, 'noche'), 1), 'scroll: capas en noche');
  ok(await escenaEn(1) === 'atardecer', 'scroll al paso 2 → atardecer');
  ok(await escenaEn(0) === 'dia', 'scroll de vuelta al paso 1 → dia');
  ok(errores.length === 0, 'scroll sin errores');
  await ctx.close();
}
await nav.close();
console.log(fallos.length ? `\n${fallos.length} fallos` : '\nTodo bien');
process.exit(fallos.length ? 1 : 0);
