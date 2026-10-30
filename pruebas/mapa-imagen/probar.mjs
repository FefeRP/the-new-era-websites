// Prueba en Chrome de mapa-imagen.js sobre index.html (niveles de descargar-niveles.mjs).
// Uso (desde demos/reloj, donde está playwright-core), con el servidor de pruebas sirviendo la raíz del repo:
//   node ../../pruebas/mapa-imagen/probar.mjs http://127.0.0.1:5193/pruebas/mapa-imagen/ ../../capturas/prueba-mapa-imagen
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [url, salidaArg] = process.argv.slice(2);
const salida = resolve(salidaArg || 'capturas-mapa-imagen'); mkdirSync(salida, { recursive: true });
const pw = await import(pathToFileURL(resolve('node_modules/playwright-core/index.mjs')).href);
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
const nav = await pw.chromium.launch({ executablePath: chrome });
const FF = process.env.FFMPEG || 'ffmpeg';
const fallos = [];
const ok = (c, m) => { console.log(`${c ? 'OK ' : 'MAL'} ${m}`); if (!c) fallos.push(m); };

const px = (png) => spawnSync(FF, ['-v', 'error', '-i', png, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 28 }).stdout;
// nitidez: energía media del laplaciano en el recuadro central (mitad de la ventana)
function nitidez(g, w, h) {
  let s = 0, n = 0;
  for (let y = Math.floor(h / 4); y < (3 * h) / 4; y++) for (let x = Math.floor(w / 4); x < (3 * w) / 4; x++) {
    const i = y * w + x; s += Math.abs(4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w]); n++;
  }
  return s / n;
}
// diferencia media entre dos capturas reducidas a 1/8 (mide alineación, no nitidez)
function diferenciaGruesa(a, b, w, h) {
  const red = (g) => { const W = w >> 3, H = h >> 3, o = new Float64Array(W * H);
    for (let y = 0; y < H * 8; y++) for (let x = 0; x < W * 8; x++) o[(y >> 3) * W + (x >> 3)] += g[y * w + x] / 64; return o; };
  const ra = red(a), rb = red(b); let s = 0; for (let i = 0; i < ra.length; i++) s += Math.abs(ra[i] - rb[i]); return s / ra.length;
}

async function pagina(sufijo = '', opciones = {}) {
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 800 }, ...opciones });
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', (e) => errores.push(String(e)));
  await page.goto(url + sufijo, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__prueba?.listo, null, { timeout: 60000 });
  const vp = page.viewportSize();
  const ir = async (p) => { await page.evaluate((p) => window.__prueba.irA(p), p); await page.waitForTimeout(150); };
  const foto = async (nombre) => { const f = join(salida, nombre + '.png'); await page.screenshot({ path: f }); return px(f); };
  const vista = (p) => page.evaluate((p) => window.__prueba.m.vista(p), p);
  const caja = (sel) => page.evaluate((s) => { const e = document.querySelector(s), r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return { x: r.left + r.width / 2, abajo: r.bottom, arriba: r.top, visible: cs.visibility !== 'hidden' && Number(cs.opacity) > 0.5 }; }, sel);
  return { ctx, page, errores, vp, ir, foto, vista, caja };
}
const datos = await (await fetch(url + 'activos/niveles.json')).json();
const { torre, templo } = datos.puntos;
const centroDe = (v) => ({ x: v.x + v.ancho / 2, y: v.y + v.alto / 2 });

{ // escritorio
  const { ctx, page, errores, vp, ir, foto, vista, caja } = await pagina();
  const W = vp.width, H = vp.height;
  await ir(0);
  const g0 = await foto('p000');
  let oscuro = 0; for (const v of g0) if (v < 24) oscuro++;
  ok(oscuro / g0.length < 0.05, `p=0: la ciudad llena la vista (${(oscuro / g0.length * 100).toFixed(1)} % oscuro)`);
  const at = await caja('#atribucion');
  ok(at.visible && at.abajo <= H, 'atribución visible');

  // destino de cada parada centrado (cámara) y marcador en su sitio (pantalla)
  for (const [p, punto, pin, nombre] of [[0.5, templo, '#pin-templo', 'templo'], [1, torre, '#pin-torre', 'torre']]) {
    const c = centroDe(await vista(p));
    await ir(p);
    const b = await caja(pin);
    ok(Math.abs(c.x - punto.x) < 0.001 && Math.abs(c.y - punto.y) < 0.001, `p=${p}: cámara centrada en ${nombre} (Δ ${(c.x - punto.x).toFixed(5)}, ${(c.y - punto.y).toFixed(5)})`);
    ok(b.visible && Math.abs(b.x - W / 2) < 3 && Math.abs(b.abajo - H / 2) < 3, `p=${p}: marcador de ${nombre} sobre el punto (${b.x.toFixed(1)}, ${b.abajo.toFixed(1)})`);
  }
  ok(!(await caja('#pin-templo')).visible, 'p=1: el marcador del templo ya no está');

  // nitidez y alineación de niveles: con y sin los niveles de calle
  await ir(0.5);
  const gCon = await foto('p050');
  const sinCalle = await pagina('?sin=2,3');
  await sinCalle.ir(0.5);
  const gSin = await sinCalle.foto('p050-sin-calle');
  const nCon = nitidez(gCon, W, H), nSin = nitidez(gSin, W, H);
  ok(nCon > nSin * 1.4, `nivel de calle más nítido que ampliar el barrio (${nCon.toFixed(1)} frente a ${nSin.toFixed(1)})`);
  const dif = diferenciaGruesa(gCon, gSin, W, H);
  ok(dif < 10, `niveles alineados (diferencia gruesa ${dif.toFixed(1)} de 255)`);
  await sinCalle.ctx.close();

  // transición entre zonas: a mitad de tramo la cámara se aleja (arco) y se traza la ruta
  const v50 = await vista(0.5), v66 = await vista(0.66), v82 = await vista(0.82);
  ok(v66.ancho > v50.ancho * 1.5 && v66.ancho > v82.ancho * 1.5, `arco: a mitad del cambio de zona se ve más (${(v66.ancho / v50.ancho).toFixed(2)}× el ancho)`);
  await ir(0.66);
  await foto('p066');
  const hayRuta = await page.evaluate(() => { // píxeles naranjas en el canvas, cerca del punto medio entre los dos sitios
    const m = window.__prueba.m, d = window.__prueba.datos.puntos, c = m.canvas, v = m.vista(0.66);
    const sx = c.width / v.ancho, sy = c.height / v.alto;
    const cx = ((d.torre.x + d.templo.x) / 2 - v.x) * sx, cy = ((d.torre.y + d.templo.y) / 2 - v.y) * sy;
    const img = c.getContext('2d').getImageData(Math.round(cx - 60), Math.round(cy - 20), 120, 40).data;
    let n = 0; for (let i = 0; i < img.length; i += 4) if (img[i] > 230 && img[i + 1] > 80 && img[i + 1] < 130 && img[i + 2] < 90) n++;
    return n;
  });
  ok(hayRuta > 20, `ruta trazada entre los dos sitios (${hayRuta} px naranjas)`);
  const dist = await caja('#distancia');
  ok(dist.visible, 'etiqueta de distancia visible a mitad del cambio');

  // recorrido continuo (sin saltos) y anclado (el destino se acerca al centro sin pasarse)
  let maxSalto = 0, anclado = true, prevD = Infinity;
  const vs = await page.evaluate(() => Array.from({ length: 201 }, (_, i) => window.__prueba.m.vista(i / 200)));
  for (let i = 1; i < vs.length; i++) {
    const a = centroDe(vs[i - 1]), b = centroDe(vs[i]);
    maxSalto = Math.max(maxSalto, Math.hypot(b.x - a.x, b.y - a.y) / vs[i].ancho);
    const p = i / 200;
    if (p > 0.25 && p <= 0.5) { // tramo sin arco: distancia del templo al centro de la vista (en vistas) no crece
      const d = Math.hypot((templo.x - b.x) / vs[i].ancho, (templo.y - b.y) / vs[i].alto);
      if (d > prevD + 1e-6) anclado = false; prevD = d;
    }
  }
  ok(maxSalto < 0.08, `sin saltos de cámara (máx. ${(maxSalto * 100).toFixed(1)} % de la vista por paso de 0,5 %)`);
  ok(anclado, 'el destino se acerca al centro sin pasarse (cámara anclada)');

  // fotogramas de inicio y fin para pedir un clip IA entre las dos zonas
  for (const [p, n] of [[0.5, 'inicio'], [0.82, 'fin']]) {
    const data = await page.evaluate((p) => window.__prueba.fotogramaPNG(p, 1280, 720), p);
    const f = join(salida, `fotograma-${n}.png`); writeFileSync(f, Buffer.from(data.split(',')[1], 'base64'));
    const g = px(f); let m = 0; for (const v of g) m += v; m /= g.length;
    ok(g.length === 1280 * 720 && m > 40, `fotograma de ${n} exportado (1280×720, brillo medio ${m.toFixed(0)})`);
  }
  ok(errores.length === 0, `0 errores (${errores.join(' | ')})`);
  await ctx.close();
}
{ // reduced-motion: salta de parada en parada
  const { ctx, vista, errores } = await pagina('', { reducedMotion: 'reduce' });
  const igual = (a, b) => Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.ancho - b.ancho) < 1e-9;
  ok(igual(await vista(0.3), await vista(0.25)) && igual(await vista(0.45), await vista(0.5)), 'reduced-motion: corte a mitad de tramo, sin interpolar');
  ok(errores.length === 0, 'reduced-motion: 0 errores');
  await ctx.close();
}
{ // móvil vertical
  const { ctx, page, vp, ir, foto, caja, errores } = await pagina('', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ir(1);
  await foto('movil-p100');
  const b = await caja('#pin-torre');
  ok(b.visible && Math.abs(b.x - vp.width / 2) < 3 && Math.abs(b.abajo - vp.height / 2) < 3, `móvil: marcador de la torre centrado (${b.x.toFixed(1)}, ${b.abajo.toFixed(1)})`);
  // la vista final cabe entera dentro del nivel de calle (si no, asoma el nivel anterior ampliado y borroso)
  const cubre = await page.evaluate(() => { const v = window.__prueba.m.vista(1), c = window.__prueba.datos.niveles[2].caja;
    return v.x >= c.x && v.y >= c.y && v.x + v.ancho <= c.x + c.ancho && v.y + v.alto <= c.y + c.alto; });
  ok(cubre, 'móvil: el nivel de calle cubre toda la vista final');
  ok(errores.length === 0, 'móvil: 0 errores');
  await ctx.close();
}
await nav.close();
console.log(fallos.length ? `\n${fallos.length} fallo(s)` : '\nTodo bien');
process.exit(fallos.length ? 1 : 0);
