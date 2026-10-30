// Prueba en Chrome de revelados.js y rastro-cursor.js sobre index.html (activos de hacer-activos.mjs).
// Uso (desde demos/reloj, donde está playwright-core), con el servidor de pruebas sirviendo la raíz del repo:
//   node ../../pruebas/revelados-rastro/probar.mjs http://127.0.0.1:5193/pruebas/revelados-rastro/ ../../capturas/prueba-revelados
import { mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [url, salidaArg] = process.argv.slice(2);
const salida = resolve(salidaArg || 'capturas-revelados'); mkdirSync(salida, { recursive: true });
const pw = await import(pathToFileURL(resolve('node_modules/playwright-core/index.mjs')).href);
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
const nav = await pw.chromium.launch({ executablePath: chrome });
const FF = process.env.FFMPEG || 'ffmpeg';
const fallos = [];
const ok = (c, m) => { console.log(`${c ? 'OK ' : 'MAL'} ${m}`); if (!c) fallos.push(m); };
const VW = 1280, VH = 800;

function px(png) { return spawnSync(FF, ['-v', 'error', '-i', png, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 }).stdout; }
const en = (buf, x, y) => { const i = (Math.round(y) * VW + Math.round(x)) * 3; return [buf[i], buf[i + 1], buf[i + 2]]; };
const cerca = (a, b, t = 40) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) <= t;
// fracción de píxeles de la ventana iguales al color dado
function fraccion(buf, color, t = 30) {
  let n = 0; for (let i = 0; i < buf.length; i += 3) if (cerca([buf[i], buf[i + 1], buf[i + 2]], color, t)) n++;
  return n / (buf.length / 3);
}

async function pagina(opciones = {}) {
  const ctx = await nav.newContext({ viewport: { width: VW, height: VH }, ...opciones });
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', (e) => errores.push(String(e)));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__prueba?.listo, null, { timeout: 30000 });
  const foto = async (sel, nombre) => {
    await page.evaluate((s) => document.querySelector(s).scrollIntoView(), sel);
    await page.waitForTimeout(200);
    const f = join(salida, nombre + '.png');
    await page.screenshot({ path: f });
    return px(f);
  };
  return { ctx, page, errores, foto };
}

const CREMA = [244, 239, 230], MAGENTA = [220, 30, 160];
{
  const { ctx, page, errores, foto } = await pagina();
  // rejilla
  await page.evaluate(() => window.__prueba.irA('rejilla', 0));
  const r0 = fraccion(await foto('#rejilla', 'rejilla-0'), CREMA);
  await page.evaluate(() => window.__prueba.irA('rejilla', 0.5));
  const r5 = fraccion(await foto('#rejilla', 'rejilla-50'), CREMA);
  await page.evaluate(() => window.__prueba.irA('rejilla', 1));
  const r1 = fraccion(await foto('#rejilla', 'rejilla-100'), CREMA);
  ok(r0 > 0.95, `rejilla 0: cubierta (${(r0 * 100).toFixed(1)} % crema)`);
  ok(r5 > 0.1 && r5 < 0.9, `rejilla 0,5: a medias, en escalera (${(r5 * 100).toFixed(1)} %)`);
  ok(r1 < 0.03, `rejilla 1: la foto entera (${(r1 * 100).toFixed(1)} % crema)`);
  // líneas
  const nl = await page.evaluate(() => window.__prueba.lineas());
  ok(nl >= 2, `líneas: el titular se parte en ${nl} líneas`);
  await page.evaluate(() => window.__prueba.irA('lineas', 0));
  const l0 = await page.evaluate(() => [...document.querySelectorAll('#lineas .rv-in')].every((s) => s.getBoundingClientRect().top >= s.parentElement.getBoundingClientRect().bottom - 1));
  await page.evaluate(() => window.__prueba.irA('lineas', 1));
  const l1 = await page.evaluate(() => [...document.querySelectorAll('#lineas .rv-in')].every((s) => Math.abs(s.getBoundingClientRect().top - s.parentElement.getBoundingClientRect().top) < 1));
  await foto('#lineas', 'lineas-100');
  ok(l0 && l1, 'líneas: ocultas bajo su máscara al principio y en su sitio al final');
  const lector = await page.evaluate(() => document.querySelector('#lineas h2').textContent.includes('Una frase larga'));
  ok(lector, 'líneas: el texto completo sigue en el DOM para lectores de pantalla');
  // zoom: al final la caja objetivo (magenta) llena casi todo el marco; antes del relevo
  await page.evaluate(() => window.__prueba.irA('zoom', 0));
  const z0 = fraccion(await foto('#zoom', 'zoom-0'), MAGENTA);
  await page.evaluate(() => window.__prueba.irA('zoom', 0.8));
  const z8buf = await foto('#zoom', 'zoom-80');
  const z8 = fraccion(z8buf, MAGENTA);
  const centro = en(z8buf, VW / 2, VH / 2);
  // caja de los píxeles magenta (a medio camino el centro aún se está desplazando; al final, centrado)
  const cajaMagenta = (buf) => {
    let x0 = VW, x1 = 0, y0 = VH, y1 = 0;
    for (let y = 0; y < VH; y += 2) for (let x = 0; x < VW; x += 2) if (cerca(en(buf, x, y), MAGENTA, 30)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return { desvio: Math.hypot((x0 + x1) / 2 - VW / 2, (y0 + y1) / 2 - VH / 2), alto: (y1 - y0) / VH };
  };
  const c8 = cajaMagenta(z8buf);
  await page.evaluate(() => { window.__prueba.irA('zoom', 1); document.querySelector('#zoom .relevo').style.visibility = 'hidden'; });
  const cFin = cajaMagenta(await foto('#zoom', 'zoom-100-sin-relevo'));
  await page.evaluate(() => { document.querySelector('#zoom .relevo').style.visibility = ''; });
  ok(cFin.desvio < 6 && cFin.alto > 0.55, `zoom 1 (sin relevo): objetivo centrado (desvío ${cFin.desvio.toFixed(1)} px) y llenando el alto (${(cFin.alto * 100).toFixed(0)} %)`);
  const z1buf = await foto('#zoom', 'zoom-100');
  ok(z0 > 0.005 && z0 < 0.06, `zoom 0: la estantería entera, el objetivo pequeño (${(z0 * 100).toFixed(1)} %)`);
  ok(z8 > 0.12 && cerca(centro, MAGENTA, 60) && c8.desvio < 80 && c8.alto > 0.45, `zoom 0,8: el objetivo grande y casi centrado (${(z8 * 100).toFixed(1)} % magenta, desvío ${c8.desvio.toFixed(0)} px, alto ${(c8.alto * 100).toFixed(0)} %)`);
  ok(cerca(en(z1buf, VW / 2, VH / 2), [255, 255, 255], 30) && cerca(en(z1buf, 40, VH / 2), [150, 20, 110], 40), 'zoom 1: relevo a la imagen de detalle');
  // cortina
  const c = [];
  for (const p of [0, 0.25, 0.5, 0.75, 1]) {
    await page.evaluate((p) => window.__prueba.irA('cortina', p), p);
    c.push(await foto('#cortina', `cortina-${p * 100}`));
  }
  const fc = c.map((b) => fraccion(b, CREMA, 20));
  ok(fc[0] < 0.02 && fc[1] > 0.2 && fc[1] < 0.98 && fc[2] > 0.97 && fc[4] < 0.02, `cortina: entra, cubre y sale (${fc.map((v) => (v * 100).toFixed(0) + '%').join(' → ')})`);
  const escenaFinal = await page.evaluate(() => getComputedStyle(document.querySelector('#cortina .b')).visibility);
  ok(escenaFinal === 'visible', 'cortina: a mitad cambia de escena (alCubrir)');
  // rastro: mover el ratón por la zona
  await page.evaluate(() => document.querySelector('#rastro').scrollIntoView());
  for (let i = 0; i <= 30; i++) await page.mouse.move(200 + i * 30, 300 + Math.sin(i / 3) * 150, { steps: 2 });
  const vivos = await page.evaluate(() => [...document.querySelectorAll('#rastro img')].filter((i) => Number(getComputedStyle(i).opacity) > 0.05).length);
  await page.screenshot({ path: join(salida, 'rastro.png') });
  ok(vivos >= 3, `rastro: aparecen fotos al mover el ratón (${vivos} visibles a la vez)`);
  const nodos = await page.evaluate(() => document.querySelectorAll('#rastro img').length);
  ok(nodos <= 16, `rastro: pool fijo de <img> (${nodos})`);
  await page.waitForTimeout(1500);
  const quedan = await page.evaluate(() => [...document.querySelectorAll('#rastro img')].filter((i) => Number(getComputedStyle(i).opacity) > 0.05).length);
  ok(quedan === 0, `rastro: se apagan al parar (${quedan} visibles tras 1,5 s)`);
  ok(errores.length === 0, `0 errores (${errores.join(' | ')})`);
  await ctx.close();
}
{ // reduced-motion
  const { ctx, page, errores, foto } = await pagina({ reducedMotion: 'reduce' });
  await page.evaluate(() => window.__prueba.irA('rejilla', 0));
  const r = fraccion(await foto('#rejilla', 'reducido-rejilla'), CREMA);
  ok(r < 0.03, `reduced-motion: la rejilla deja ver la foto (${(r * 100).toFixed(1)} % crema)`);
  await page.evaluate(() => window.__prueba.irA('lineas', 0));
  const l = await page.evaluate(() => [...document.querySelectorAll('#lineas .rv-in')].every((s) => Math.abs(s.getBoundingClientRect().top - s.parentElement.getBoundingClientRect().top) < 1));
  ok(l, 'reduced-motion: el titular visible');
  await page.evaluate(() => window.__prueba.irA('cortina', 0.3));
  const fc = fraccion(await foto('#cortina', 'reducido-cortina'), CREMA, 20);
  ok(fc < 0.02, 'reduced-motion: la cortina no se enseña');
  const rastro = await page.evaluate(() => window.__prueba.m.rastro.activo);
  ok(rastro === false, 'reduced-motion: sin rastro');
  ok(errores.length === 0, `reduced-motion: 0 errores (${errores.join(' | ')})`);
  await ctx.close();
}
{ // táctil: sin rastro
  const { ctx, page } = await pagina({ isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } });
  const rastro = await page.evaluate(() => window.__prueba.m.rastro.activo);
  ok(rastro === false, 'táctil: sin rastro (queda el contenido estático)');
  await ctx.close();
}
await nav.close();
console.log(fallos.length ? `\n${fallos.length} fallo(s)` : '\nTodo bien');
process.exit(fallos.length ? 1 : 0);
