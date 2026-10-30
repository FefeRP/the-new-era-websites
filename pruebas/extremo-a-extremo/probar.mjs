// Prueba en Chrome del ejemplo de punta a punta (index.html con los activos de preparar.mjs), con números.
// Uso (desde demos/reloj, donde está playwright-core), con un servidor estático sirviendo la raíz del repo:
//   node ../../pruebas/extremo-a-extremo/probar.mjs http://127.0.0.1:5193/pruebas/extremo-a-extremo/ ../../capturas/prueba-extremo-a-extremo
// ffmpeg (para leer las capturas): variable FFMPEG o el PATH.
import { mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [url = 'http://127.0.0.1:5193/pruebas/extremo-a-extremo/', salidaArg] = process.argv.slice(2);
const salida = resolve(salidaArg || 'capturas-extremo-a-extremo'); mkdirSync(salida, { recursive: true });
const pw = await import(pathToFileURL(resolve('node_modules/playwright-core/index.mjs')).href);
const chrome = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean).find(existsSync);
const nav = await pw.chromium.launch({ executablePath: chrome }); // sin WebGL: la página no lo usa
const FF = process.env.FFMPEG || 'ffmpeg';
const fallos = [];
let total = 0;
const ok = (c, m) => { total++; console.log(`${c ? 'OK ' : 'MAL'} ${m}`); if (!c) fallos.push(m); };

// PNG → RGB crudo
const rgb = (png) => {
  const r = spawnSync(FF, ['-v', 'error', '-i', 'pipe:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { input: png, maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error('ffmpeg no pudo leer la captura: ' + r.stderr);
  return r.stdout;
};
// píxeles cerca de un color (distancia euclídea en RGB)
const cuentaColor = (px, [R, G, B], tol = 60) => { let n = 0; for (let i = 0; i < px.length; i += 3) if (Math.hypot(px[i] - R, px[i + 1] - G, px[i + 2] - B) < tol) n++; return n; };
const desviacion = (px) => { let s = 0, s2 = 0; const n = px.length; for (const v of px) { s += v; s2 += v * v; } const m = s / n; return Math.sqrt(s2 / n - m * m); };

async function pagina(opciones = {}) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, ...opciones });
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errores.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => errores.push(String(e)));
  page.on('requestfailed', (r) => errores.push(`[petición] ${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => { if (r.status() >= 400) errores.push(`[${r.status()}] ${r.url()}`); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__prueba?.listo, null, { timeout: 60000 });
  const vp = page.viewportSize();
  const ir = async (id, p, ms = 250) => { await page.evaluate(([id, p]) => window.__prueba.irA(id, p), [id, p]); await page.waitForTimeout(ms); };
  const foto = async (nombre, clip) => page.screenshot({ path: nombre ? join(salida, nombre + '.png') : undefined, clip });
  const caja = (sel) => page.evaluate((s) => { const e = document.querySelector(s), r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, abajo: r.bottom, z: cs.zIndex,
      visible: cs.visibility !== 'hidden' && Number(cs.opacity) > 0.5 && r.width > 0 }; }, sel);
  // espera a que el canvas del giro tenga dibujado el frame que toca
  const esperarFrame = (i) => page.waitForFunction((i) => window.__prueba.seq && Math.abs(window.__prueba.seq.frameDibujado - i) <= 1, i, { timeout: 30000 });
  return { ctx, page, errores, vp, ir, foto, caja, esperarFrame };
}

// mini-huella del canvas (64×36 en gris) para comparar dos estados
const huella = (page) => page.evaluate(() => {
  const c = document.querySelector('.giro__canvas'), m = document.createElement('canvas'); m.width = 64; m.height = 36;
  const x = m.getContext('2d'); x.drawImage(c, 0, 0, 64, 36);
  const d = x.getImageData(0, 0, 64, 36).data, o = []; for (let i = 0; i < d.length; i += 4) o.push((d[i] + d[i + 1] + d[i + 2]) / 3); return o;
});

// ¿el titular queda DETRÁS del reloj? Cuatro capturas de la zona común: las dos capas, solo reloj, solo titular, ninguna.
// Donde se pisan, la imagen con las dos capas tiene que ser igual a la de "solo reloj".
async function titularDetras(page) {
  const zona = await page.evaluate(() => {
    const a = document.querySelector('.hero__titulo').getBoundingClientRect(), b = document.querySelector('.hero__reloj').getBoundingClientRect();
    const x = Math.max(a.left, b.left), y = Math.max(a.top, b.top), x2 = Math.min(a.right, b.right), y2 = Math.min(a.bottom, b.bottom);
    return { x: Math.round(x), y: Math.round(y), width: Math.round(x2 - x), height: Math.round(y2 - y) };
  });
  if (zona.width < 10 || zona.height < 10) return { solape: 0 };
  const vis = (t, r) => page.evaluate(([t, r]) => { document.querySelector('.hero__titulo').style.visibility = t ? '' : 'hidden'; document.querySelector('.hero__reloj').style.visibility = r ? '' : 'hidden'; }, [t, r]);
  const cap = async (t, r) => { await vis(t, r); await page.waitForTimeout(80); return rgb(await page.screenshot({ clip: zona })); };
  const A = await cap(true, true), B = await cap(false, true), C = await cap(true, false), D = await cap(false, false);
  await vis(true, true);
  let comun = 0, igualReloj = 0, igualTitulo = 0;
  for (let i = 0; i < A.length; i += 3) {
    const d = (P, Q) => Math.abs(P[i] - Q[i]) + Math.abs(P[i + 1] - Q[i + 1]) + Math.abs(P[i + 2] - Q[i + 2]);
    if (d(C, D) > 60 && d(B, D) > 60 && d(B, C) > 60) { comun++; if (d(A, B) < 15) igualReloj++; if (d(A, C) < 15) igualTitulo++; }
  }
  return { solape: comun, detras: comun ? igualReloj / comun : 0, delante: comun ? igualTitulo / comun : 0 };
}

{ // ---------- escritorio 1440×900 ----------
  const { ctx, page, errores, vp, ir, foto, caja, esperarFrame } = await pagina();
  const W = vp.width, H = vp.height;

  // hero
  await ir('hero', 0, 1400); // deja acabar la entrada del titular (1,1 s)
  const pxHero = rgb(await foto('01-hero'));
  const verdes = cuentaColor(pxHero, [0, 177, 64]), magentas = cuentaColor(pxHero, [255, 0, 255]);
  ok(verdes === 0 && magentas === 0, `hero: sin restos del fondo del croma (${verdes} px verdes ~[0,177,64], ${magentas} px magenta)`);
  const zT = await caja('.hero__titulo'), zR = await caja('.hero__reloj');
  ok(Number(zR.z) > Number(zT.z), `hero: z-index del reloj (${zR.z}) por encima del titular (${zT.z})`);
  const det = await titularDetras(page);
  ok(det.solape > 500 && det.detras > 0.95 && det.delante < 0.2, `hero: el titular queda detrás del reloj (${det.solape} px solapados; ${(det.detras * 100).toFixed(1)} % iguales a "solo reloj", ${(det.delante * 100).toFixed(1)} % a "solo titular")`);
  const lin = await page.evaluate(() => { const s = [...document.querySelectorAll('.hero__titulo .rv-in')]; return { n: s.length, t: s.map((e) => e.style.transform) }; });
  ok(lin.n >= 1 && lin.t.every((t) => /translate3d\(0(px)?, 0%/.test(t)), `hero: titular partido en ${lin.n} línea(s) y ya entrado (${lin.t.join(' | ')})`);
  const accesible = await page.evaluate(() => document.querySelector('h1').textContent.replace(/\s+/g, ' ').includes('Orbe 01'));
  ok(accesible, 'hero: el h1 conserva el texto para lectores y buscadores');
  await ir('hero', 1);
  const t1 = await caja('.hero__titulo'), r1 = await caja('.hero__reloj');
  ok(zT.y - t1.y > 100 && Math.abs(zR.y - r1.y) < (zT.y - t1.y) / 2, `hero: parallax (el titular sube ${(zT.y - t1.y).toFixed(0)} px y el reloj ${(zR.y - r1.y).toFixed(0)} px)`);
  await foto('01-hero-p100');

  // giro
  await ir('giro', 0);
  await page.evaluate(() => window.__prueba.giro());
  await esperarFrame(0);
  await page.waitForTimeout(200);
  const h0 = await huella(page);
  await foto('02-giro-p000');
  const poster = await page.evaluate(() => { const i = document.querySelector('.giro__poster'), c = document.querySelector('.giro__canvas');
    return { img: i.tagName, debajo: Number(getComputedStyle(i).zIndex) < Number(getComputedStyle(c).zIndex), src: i.currentSrc.split('/').pop() }; });
  ok(poster.img === 'IMG' && poster.debajo, `giro: <img> del frame 0 (${poster.src}) debajo del canvas`);
  await ir('giro', 0.5); await esperarFrame(60); await page.waitForTimeout(150); await foto('02-giro-p050');
  await ir('giro', 1); await esperarFrame(119); await page.waitForTimeout(150);
  const h1 = await huella(page);
  await foto('02-giro-p100');
  const dif = h0.reduce((s, v, i) => s + Math.abs(v - h1[i]), 0) / h0.length;
  ok(dif > 4, `giro: el canvas cambia entre p=0 y p=1 (diferencia media ${dif.toFixed(1)} de 255; frames ${0} → ${119})`);
  const fase = await page.evaluate(() => [...document.querySelectorAll('#giro .fase')].map((f) => f.classList.contains('activa')));
  ok(fase.join() === 'false,false,true', `giro: en p=1 se ve la fase 3 (${fase.join()})`);

  // detalle
  const zonaFoto = async () => { const c = await caja('.detalle__foto'); return { x: Math.round(c.x) + 2, y: Math.round(c.y) + 2, width: Math.round(c.w) - 4, height: Math.round(c.h) - 4 }; };
  await ir('detalle', 0);
  const d0 = rgb(await foto(null, await zonaFoto()));
  await foto('03-detalle-p000');
  await ir('detalle', 0.3); await foto('03-detalle-p030');
  await ir('detalle', 1);
  const d1 = rgb(await foto(null, await zonaFoto()));
  await foto('03-detalle-p100');
  const fondoD0 = cuentaColor(d0, [23, 20, 18], 6) / (d0.length / 3);
  ok(fondoD0 > 0.99 && desviacion(d0) < 4, `detalle: revelado cerrado en p=0 (${(fondoD0 * 100).toFixed(1)} % color del fondo, desviación ${desviacion(d0).toFixed(1)})`);
  ok(desviacion(d1) > 25 && cuentaColor(d1, [23, 20, 18], 6) / (d1.length / 3) < 0.5, `detalle: abierto en p=1 (desviación ${desviacion(d1).toFixed(1)})`);

  // taller
  const { taller } = await page.evaluate(() => window.__prueba.datos.puntos);
  await ir('taller', 0); await foto('04-taller-p000');
  const at = await caja('#atribucion');
  ok(at.visible && at.abajo <= H && at.y >= 0, `taller: atribución PNOA visible (${at.x.toFixed(0)}, ${at.y.toFixed(0)})`);
  await ir('taller', 0.45); await foto('04-taller-p045');
  await ir('taller', 1); await foto('04-taller-p100');
  const v = await page.evaluate(() => window.__prueba.mapa.vista(1));
  const cx = v.x + v.ancho / 2, cy = v.y + v.alto / 2;
  ok(Math.abs(cx - taller.x) < 0.001 && Math.abs(cy - taller.y) < 0.001, `taller: cámara centrada en el taller (Δ ${(cx - taller.x).toFixed(5)}, ${(cy - taller.y).toFixed(5)})`);
  const pin = await caja('#pin-taller');
  ok(pin.visible && Math.abs(pin.cx - W / 2) <= 3 && Math.abs(pin.abajo - H / 2) <= 3, `taller: marcador sobre el punto (${pin.cx.toFixed(1)}, ${pin.abajo.toFixed(1)}; centro ${W / 2}, ${H / 2})`);
  const cubre = await page.evaluate(() => { const v = window.__prueba.mapa.vista(1), c = window.__prueba.datos.niveles[2].caja;
    return v.x >= c.x && v.y >= c.y && v.x + v.ancho <= c.x + c.ancho && v.y + v.alto <= c.y + c.alto; });
  ok(cubre, 'taller: la vista final cabe en el nivel de calle (nítido)');

  // cierre
  await ir('cierre', 0, 300); await foto('05-cierre');
  const precio = await page.evaluate(() => document.querySelector('.precio').textContent);
  const boton = await caja('#reservar');
  ok(precio.includes('1.250') && boton.visible && boton.abajo <= H, `cierre: precio (${precio}) y botón visibles`);
  const pie = await page.evaluate(() => document.querySelector('.pie').textContent);
  ok(/Chronograph Watch/.test(pie) && /CC BY 4\.0/.test(pie) && /PNOA/.test(pie), 'pie: créditos del modelo glTF y de PNOA');
  const ovf = await page.evaluate(() => [...document.querySelectorAll('.escenario')].map((e) => { const a = []; for (let p = e.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p); if ([o.overflow, o.overflowX, o.overflowY].some((x) => x === 'hidden' || x === 'auto' || x === 'scroll')) a.push(p.tagName + '#' + p.id); } return a; }).flat());
  ok(ovf.length === 0, `ningún antepasado de un sticky con overflow hidden/auto/scroll (${ovf.join(', ') || 'ninguno'})`);
  ok(errores.length === 0, `escritorio: 0 errores ni avisos de consola (${errores.join(' | ')})`);
  await ctx.close();
}

{ // ---------- reduced-motion ----------
  const { ctx, page, errores, ir, foto, esperarFrame } = await pagina({ reducedMotion: 'reduce' });
  await ir('hero', 0, 200);
  const lin = await page.evaluate(() => [...document.querySelectorAll('.hero__titulo .rv-in')].every((e) => /0%/.test(e.style.transform)));
  ok(lin, 'reduced-motion: titular visible sin animar');
  await ir('hero', 1);
  const tr = await page.evaluate(() => document.querySelector('.hero__titulo').style.transform);
  ok(!tr, 'reduced-motion: sin parallax en el hero');
  await ir('giro', 0.2); await page.evaluate(() => window.__prueba.giro()); await esperarFrame(0);
  await ir('giro', 0.5); await esperarFrame(60);
  await ir('giro', 0.6); await page.waitForTimeout(200);
  const f = await page.evaluate(() => window.__prueba.seq.frameDibujado);
  ok(f === 60 || f === 59, `reduced-motion: un frame quieto por fase, sin scrub (p=0,6 → frame ${f})`);
  await ir('detalle', 0);
  const abierto = await page.evaluate(() => getComputedStyle(document.querySelector('.detalle__foto > div[aria-hidden]')).visibility === 'hidden' || !document.querySelector('.detalle__foto > div[aria-hidden]'));
  ok(abierto, 'reduced-motion: la foto de detalle se ve entera desde el principio');
  await foto('reducido-detalle');
  ok(errores.length === 0, `reduced-motion: 0 errores (${errores.join(' | ')})`);
  await ctx.close();
}

{ // ---------- móvil 390×844 ----------
  const { ctx, page, errores, vp, ir, foto, caja, esperarFrame } = await pagina({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ir('hero', 0, 1400);
  const px = rgb(await foto('movil-01-hero'));
  ok(cuentaColor(px, [0, 177, 64]) === 0 && cuentaColor(px, [255, 0, 255]) === 0, 'móvil: hero sin restos del croma');
  const det = await titularDetras(page);
  ok(det.solape > 200 && det.detras > 0.95, `móvil: el titular queda detrás del reloj (${det.solape} px, ${(det.detras * 100).toFixed(1)} %)`);
  const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(ancho <= vp.width, `móvil: sin scroll horizontal (scrollWidth ${ancho})`);
  await ir('giro', 0.5); await page.evaluate(() => window.__prueba.giro()); await esperarFrame(60); await page.waitForTimeout(150);
  const variante = await page.evaluate(() => window.__prueba.seq.variante);
  ok(variante === 'movil', `móvil: frames de la variante ${variante}`);
  await foto('movil-02-giro-p050');
  await ir('detalle', 1); await foto('movil-03-detalle-p100');
  await ir('taller', 1); await foto('movil-04-taller-p100');
  const pin = await caja('#pin-taller');
  ok(pin.visible && Math.abs(pin.cx - vp.width / 2) <= 3 && Math.abs(pin.abajo - vp.height / 2) <= 3, `móvil: marcador del taller centrado (${pin.cx.toFixed(1)}, ${pin.abajo.toFixed(1)})`);
  const cubre = await page.evaluate(() => { const v = window.__prueba.mapa.vista(1), c = window.__prueba.datos.niveles[2].caja;
    return v.x >= c.x && v.y >= c.y && v.x + v.ancho <= c.x + c.ancho && v.y + v.alto <= c.y + c.alto; });
  ok(cubre, 'móvil: el nivel de calle cubre toda la vista final');
  await ir('cierre', 0, 300); await foto('movil-05-cierre');
  ok(errores.length === 0, `móvil: 0 errores (${errores.join(' | ')})`);
  await ctx.close();
}
await nav.close();
console.log(fallos.length ? `\n${fallos.length} fallo(s) de ${total}` : `\nTodo bien: ${total}/${total}`);
process.exit(fallos.length ? 1 : 0);
