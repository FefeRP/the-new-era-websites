// Prueba en Chrome de tarjeta-volteo.js, carrusel-orbital.js (órbita y anillo) y resenas-3d.js sobre index.html.
// Uso (desde demos/reloj, donde está playwright-core), con el servidor de pruebas sirviendo la raíz del repo:
//   node ../../pruebas/componentes/probar.mjs http://127.0.0.1:5193/pruebas/componentes/ ../../capturas/prueba-componentes
import { mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const [url, salidaArg] = process.argv.slice(2);
if (!url) { console.error('Falta la URL de la página de prueba'); process.exit(2); }
const salida = resolve(salidaArg || 'capturas-componentes'); mkdirSync(salida, { recursive: true });
const pw = await import(pathToFileURL(resolve('node_modules/playwright-core/index.mjs')).href);
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
const nav = await pw.chromium.launch({ executablePath: chrome });
const FF = process.env.FFMPEG || 'ffmpeg';
const fallos = [], todosLosErrores = [];
const ok = (c, m) => { console.log(`${c ? 'OK ' : 'MAL'} ${m}`); if (!c) fallos.push(m); };
const cerca = (a, b, t = 45) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) <= t;
const AZUL = [31, 58, 138], MAGENTA = [200, 30, 120];

async function pagina({ ancho = 1280, alto = 800, consulta = '', ...opciones } = {}) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, reducedMotion: 'no-preference', ...opciones });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') todosLosErrores.push(m.text()); });
  page.on('pageerror', (e) => todosLosErrores.push(String(e)));
  await page.goto(url + consulta, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__prueba?.listo, null, { timeout: 30000 });
  // color del píxel en el centro de un elemento (captura recortada a 1 px, leída con ffmpeg)
  const color = async (sel, dx = 0, dy = 0) => {
    const r = await page.locator(sel).boundingBox();
    const buf = await page.screenshot({ clip: { x: Math.round(r.x + r.width / 2 + dx), y: Math.round(r.y + r.height / 2 + dy), width: 2, height: 2 } });
    const px = spawnSync(FF, ['-v', 'error', '-f', 'image2pipe', '-i', '-', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { input: buf }).stdout;
    return [px[0], px[1], px[2]];
  };
  const ver = async (sel) => { await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await page.waitForTimeout(150); };
  const foto = async (sel, nombre) => { await ver(sel); const f = join(salida, nombre + '.png'); await page.locator(sel).screenshot({ path: f }); return f; };
  return { ctx, page, color, ver, foto };
}
const fotos = [];

// ---------- tarjeta con volteo ----------
{
  const { ctx, page, color, ver, foto } = await pagina();
  await ver('#tarjetas');
  ok(cerca(await color('#t1', 0, -60), AZUL), 't1 al empezar enseña el frente');
  ok(await page.evaluate(() => { const t = document.getElementById('t1'), b = t.querySelector(':scope > button[data-volteo-boton]'); return !t.hasAttribute('role') && !t.hasAttribute('tabindex') && !t.hasAttribute('aria-label') && b && b.getAttribute('aria-pressed') === 'false' && t.querySelector('[data-cara="dorso"]').inert && !t.querySelector('[data-cara="frente"]').inert; }),
    't1: la tarjeta no es un botón; el control es un <button> fuera de las caras (aria-pressed=false) y el dorso inerte');
  ok(await page.locator('#t1').getByRole('button', { name: 'Dar la vuelta a la tarjeta' }).count() === 1,
    't1: el botón se encuentra por su rol y su nombre');
  await page.locator('#t1').click({ position: { x: 150, y: 60 } });
  await page.waitForTimeout(450);
  ok(cerca(await color('#t1', 0, -60), MAGENTA), 't1 tras el clic enseña el dorso');
  ok(await page.evaluate(() => { const t = document.getElementById('t1'); return window.__prueba.t1.volteada && t.querySelector('[data-volteo-boton]').getAttribute('aria-pressed') === 'true' && t.querySelector('[data-cara="frente"]').inert && !t.querySelector('[data-cara="dorso"]').inert; }),
    't1 volteada: aria-pressed=true, el frente inerte y el dorso accesible');
  ok(await page.locator('#t1').getByRole('link').count() >= 1, 't1: el enlace del dorso se anuncia como enlace (no queda aplanado dentro de un botón)');
  await page.evaluate(() => document.getElementById('t1-enlace').addEventListener('click', (e) => e.preventDefault()));
  await page.locator('#t1-enlace').click();
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.__prueba.t1.volteada), 'el clic en un enlace de dentro no da la vuelta');
  // con el tabulador, como una persona con teclado
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  let alBoton = false;
  for (let i = 0; i < 40 && !alBoton; i++) { await page.keyboard.press('Tab'); alBoton = await page.evaluate(() => document.activeElement === document.querySelector('#t1 [data-volteo-boton]')); }
  ok(alBoton && await page.evaluate(() => document.querySelector('#t1 [data-volteo-boton]').getBoundingClientRect().width > 40),
    'teclado: se llega al botón con el tabulador y se ve al tener el foco');
  await page.keyboard.press('Enter'); await page.waitForTimeout(100);
  const trasEnter = await page.evaluate(() => window.__prueba.t1.volteada);
  await page.keyboard.press('Space'); await page.waitForTimeout(100);
  const trasEspacio = await page.evaluate(() => window.__prueba.t1.volteada);
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  const trasEscape = await page.evaluate(() => window.__prueba.t1.volteada);
  ok(!trasEnter && trasEspacio && !trasEscape, 'teclado: Enter y espacio giran, Escape devuelve al frente');
  // Escape con el foco en un enlace del dorso: vuelve al frente y el foco pasa al botón (no se pierde en la cara inerte)
  await page.evaluate(() => window.__prueba.t1.voltear(true)); await page.locator('#t1-enlace').focus();
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  ok(await page.evaluate(() => !window.__prueba.t1.volteada && document.activeElement === document.querySelector('#t1 [data-volteo-boton]')),
    'Escape desde un enlace del dorso: frente y foco en el botón');
  await page.keyboard.press('Tab'); await page.waitForTimeout(50);
  ok(await page.evaluate(() => document.querySelector('#t1 [data-volteo-boton]').getBoundingClientRect().width <= 1),
    'el botón vuelve a ocultarse al perder el foco');
  ok(await page.evaluate(() => document.activeElement === document.querySelector('#t2 [data-volteo-boton]') && window.__prueba.t2.volteada),
    't2 (hover): el foco del teclado en su botón la gira, como el ratón encima');
  await page.evaluate(() => document.activeElement?.blur()); await page.mouse.move(0, 0); await page.waitForTimeout(450);

  ok(cerca(await color('#t2', 0, -60), AZUL), 't2 (hover) al empezar enseña el frente');
  await page.locator('#t2').hover({ position: { x: 150, y: 100 } });
  await page.waitForTimeout(450);
  ok(await page.evaluate(() => window.__prueba.t2.volteada) && cerca(await color('#t2', 0, -60), MAGENTA), 't2 gira con el ratón encima y no se transparenta el frente');
  ok(await page.evaluate(() => { const m = new DOMMatrix(getComputedStyle(document.querySelector('#t2 [data-cara="dorso"] h3')).transform); return Math.round(m.m43); }) === 80,
    'las capas con data-z salen en profundidad (translateZ 80 px)');
  fotos.push(await foto('#tarjetas', 'tarjetas'));
  await page.mouse.move(5, 5); await page.waitForTimeout(450);
  ok(!(await page.evaluate(() => window.__prueba.t2.volteada)), 't2 vuelve al frente al salir el ratón');
  ok(await page.evaluate(() => { const t = document.getElementById('t1'); window.__prueba.t1.destruir(); return !t.hasAttribute('style') && !t.querySelector('[data-volteo-boton]') && !t.querySelector('[data-volteo-interior]') && !t.querySelector('[inert]') && t.children.length === 2; }),
    'destruir() deja la tarjeta como estaba');
  await ctx.close();
}
{
  const { ctx, page, ver } = await pagina({ reducedMotion: 'reduce' });
  await ver('#tarjetas');
  await page.locator('#t1').click({ position: { x: 150, y: 60 } });
  await page.waitForTimeout(350);
  ok(await page.evaluate(() => { const t = document.getElementById('t1'), cs = (s) => getComputedStyle(t.querySelector(s)); return cs('[data-volteo-interior]').transform === 'none' && cs('[data-cara="frente"]').opacity === '0' && cs('[data-cara="dorso"]').opacity === '1'; }),
    'reduced-motion: cambia de cara por fundido, sin giro');
  await ctx.close();
}
{
  const { ctx, page, ver } = await pagina({ ancho: 390, alto: 844, hasTouch: true, isMobile: true });
  await ver('#t2');
  await page.locator('#t2').tap({ position: { x: 120, y: 80 } });
  await page.waitForTimeout(450);
  ok(await page.evaluate(() => window.__prueba.t2.volteada), 'táctil: la tarjeta de hover pasa a girar con un toque');
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'móvil: sin desplazamiento lateral');
  await ctx.close();
}

// ---------- carrusel en órbita ----------
const asentado = (page, nombre) => page.waitForFunction((n) => !window.__prueba[n].moviendose, nombre, { timeout: 5000 });
{
  const { ctx, page, color, ver, foto } = await pagina();
  await ver('#orbita');
  ok(await page.evaluate(() => { const n = [...document.querySelectorAll('#orbita > article')]; return window.__prueba.orbita.indice === 0 && n[0].getAttribute('aria-current') === 'true' && !n[0].inert && n.slice(1).every((e) => e.inert && e.getAttribute('aria-hidden') === 'true'); }),
    'órbita: el primero delante, con aria-current, y el resto inerte');
  ok(cerca(await color('#orbita', 0, -40), AZUL), 'órbita: el de delante está en el centro');
  fotos.push(await foto('#carrusel', 'orbita'));
  await page.click('#sig'); await page.waitForTimeout(80); await asentado(page, 'orbita');
  ok(await page.evaluate(() => window.__prueba.orbita.indice === 1 && window.__prueba.cambios.join() === '1') && cerca(await color('#orbita', 0, -40), MAGENTA), 'botón Siguiente: pasa al segundo y avisa con alCambiar');
  await page.locator('#orbita').focus();
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(80); await asentado(page, 'orbita');
  const trasIzq = await page.evaluate(() => window.__prueba.orbita.indice);
  await page.keyboard.press('End'); await page.waitForTimeout(80); await asentado(page, 'orbita');
  ok(trasIzq === 0 && await page.evaluate(() => window.__prueba.orbita.indice) === 5, 'teclado: flecha izquierda vuelve al primero y Fin va al último');
  // arrastre hacia la izquierda: avanza y encaja en un elemento exacto
  const caja = await page.locator('#orbita').boundingBox(), cx = caja.x + caja.width / 2, cy = caja.y + caja.height / 2;
  const antes = await page.evaluate(() => window.__prueba.orbita.indice);
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let i = 1; i <= 12; i++) { await page.mouse.move(cx - i * 22, cy); await page.waitForTimeout(16); }
  await page.mouse.up(); await page.waitForTimeout(80); await asentado(page, 'orbita');
  const tras = await page.evaluate(() => { const i = window.__prueba.orbita.indice, e = document.querySelectorAll('#orbita > article')[i]; return { i, x: new DOMMatrix(getComputedStyle(e).transform).m41 }; });
  ok(tras.i !== antes && Math.abs(tras.x) < 0.5, `arrastre: avanza (de ${antes} a ${tras.i}) y encaja centrado (x = ${tras.x.toFixed(2)} px)`);
  // clic en un lateral lo trae delante
  const lateral = await page.evaluate(() => { const o = window.__prueba.orbita, n = document.querySelectorAll('#orbita > article'), j = (o.indice + 1) % n.length, r = n[j].getBoundingClientRect(); return { j, x: r.right - 12, y: r.top + r.height / 2 }; });
  await page.mouse.click(lateral.x, lateral.y); await page.waitForTimeout(80); await asentado(page, 'orbita');
  ok(await page.evaluate(() => window.__prueba.orbita.indice) === lateral.j, 'clic en un lateral: lo trae delante');
  ok(await page.evaluate(() => !window.__prueba.orbita.moviendose), 'en reposo el bucle de animación está parado');
  ok(await page.evaluate(() => { const c = document.getElementById('orbita'); window.__prueba.orbita.destruir(); return !c.hasAttribute('aria-roledescription') && !c.querySelector('[inert]') && [...c.children].every((e) => !e.style.transform); }),
    'destruir() limpia el carrusel');
  await ctx.close();
}
{
  const { ctx, page, ver } = await pagina({ consulta: '?autoplay=500' });
  await ver('#orbita'); await page.mouse.move(5, 5);
  await page.waitForTimeout(1500);
  const conAutoplay = await page.evaluate(() => window.__prueba.orbita.indice);
  const c = await page.locator('#orbita').boundingBox();
  await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2); await page.waitForTimeout(700);
  const alEntrar = await page.evaluate(() => window.__prueba.orbita.indice);
  await page.waitForTimeout(1300);
  const trasEspera = await page.evaluate(() => window.__prueba.orbita.indice);
  ok(conAutoplay >= 1, `autoplay: avanza solo (índice ${conAutoplay} tras 1,5 s)`);
  ok(alEntrar === trasEspera, 'autoplay: se para con el puntero encima');
  await page.mouse.move(5, 5);
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400);
  const fuera = await page.evaluate(() => window.__prueba.orbita.indice); await page.waitForTimeout(1300);
  ok(await page.evaluate(() => window.__prueba.orbita.indice) === fuera, 'autoplay: se para fuera de pantalla');
  await ctx.close();
}
{
  const { ctx, page, ver } = await pagina({ reducedMotion: 'reduce', consulta: '?autoplay=400' });
  await ver('#orbita'); await page.mouse.move(5, 5);
  await page.waitForTimeout(1000);
  ok(await page.evaluate(() => window.__prueba.orbita.indice) === 0, 'reduced-motion: sin autoplay');
  await page.click('#sig'); await page.waitForTimeout(60);
  ok(await page.evaluate(() => { const o = window.__prueba.orbita; return o.indice === 1 && !o.moviendose && Math.abs(new DOMMatrix(getComputedStyle(document.querySelectorAll('#orbita > article')[1]).transform).m41) < 0.5; }),
    'reduced-motion: el cambio es inmediato');
  await ctx.close();
}

// ---------- anillo 3D ----------
{
  const { ctx, page, ver, foto } = await pagina();
  await ver('#anillo');
  const a = await page.evaluate(() => { const c = document.getElementById('anillo'), n = [...c.children]; return { persp: parseFloat(getComputedStyle(c).perspective), es3d: getComputedStyle(n[1]).transform.startsWith('matrix3d'),
    ocultos: n.filter((e) => e.style.visibility === 'hidden').length, frente: n[0].getAttribute('aria-current') === 'true', velo: parseFloat(n[1].style.getPropertyValue('--velo')), z: new DOMMatrix(getComputedStyle(n[2]).transform).m43 }; });
  ok(a.persp > 300 && a.es3d && a.z < -50, `anillo: perspectiva en el contenedor (${a.persp} px) y tarjetas giradas en 3D (la tercera a ${a.z.toFixed(0)} px de fondo)`);
  ok(a.frente && a.ocultos >= 3, `anillo: la primera delante y las de detrás ocultas (${a.ocultos} de 10)`);
  ok(a.velo > 0.1 && a.velo < 0.8, `anillo: las laterales reciben el velo (--velo ${a.velo})`);
  fotos.push(await foto('#anillo-seccion', 'anillo'));
  await page.evaluate(() => { window.__prueba.anillo.desplazar(1.2); window.__prueba.anillo.desplazar(2.4); });
  await page.waitForTimeout(120);
  const enMarcha = await page.evaluate(() => window.__prueba.anillo.indice);
  await page.waitForTimeout(400); await asentado(page, 'anillo');
  ok(enMarcha === 2 && await page.evaluate(() => window.__prueba.anillo.indice) === 2, 'anillo ligado al scroll: el de delante cambia ya durante el giro y al parar encaja en la más cercana');
  await ctx.close();
}

// ---------- reseñas 3D ----------
{
  const { ctx, page, ver, foto } = await pagina();
  await ver('[data-resenas-escena]');
  const r = await page.evaluate(() => { const p = window.__prueba.resenas, l = document.getElementById('lista'), b = l.getBoundingClientRect(); return { activo: p.activo, cols: p.columnas, marcha: p.enMarcha,
    escenaOculta: p.escena.getAttribute('aria-hidden') === 'true' && p.escena.inert, lista: l.children.length, listaPx: b.width * b.height, enArbol: !l.hasAttribute('aria-hidden') && !l.hidden }; });
  ok(r.activo && r.cols === 4 && r.marcha, `reseñas: escena activa, 4 columnas a 1280 px y en marcha`);
  ok(r.escenaOculta && r.lista === 5 && r.listaPx <= 4 && r.enArbol, 'reseñas: la escena es decorativa y la lista real sigue para lectores de pantalla');
  const y1 = await page.evaluate(() => new DOMMatrix(getComputedStyle(window.__prueba.resenas.escena.firstChild.children[0]).transform).m42);
  await page.waitForTimeout(600);
  const y2 = await page.evaluate(() => new DOMMatrix(getComputedStyle(window.__prueba.resenas.escena.firstChild.children[0]).transform).m42);
  ok(y2 < y1, `reseñas: la primera columna sube (${y1.toFixed(1)} → ${y2.toFixed(1)} px)`);
  const d = await page.evaluate(() => { const cols = [...window.__prueba.resenas.escena.firstChild.children]; return cols.map((col) => { const a = col.getAnimations()[0]; a.pause(); a.currentTime = 0;
    const y0 = col.children[0].getBoundingClientRect().top; a.currentTime = a.effect.getComputedTiming().duration - 0.001; const yf = col.children[1].getBoundingClientRect().top; a.play(); return Math.abs(y0 - yf); }); });
  ok(d[0] < 0.6 && d[2] < 0.6, `reseñas: el bucle no salta (al acabar la vuelta, la segunda copia cae donde empezó la primera: ${d[0].toFixed(2)} px)`);
  const sentidos = await page.evaluate(() => [...window.__prueba.resenas.escena.firstChild.children].map((c) => c.getAnimations()[0].effect.getComputedTiming().direction));
  ok(sentidos[0] === 'normal' && sentidos[1] === 'reverse', 'reseñas: las columnas alternan el sentido');
  fotos.push(await foto('#opiniones', 'resenas'));
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400);
  ok(!(await page.evaluate(() => window.__prueba.resenas.enMarcha)), 'reseñas: se paran fuera de pantalla');
  await page.setViewportSize({ width: 760, height: 800 }); await page.waitForTimeout(300);
  ok(await page.evaluate(() => window.__prueba.resenas.columnas) === 2, 'reseñas: 2 columnas a 760 px');
  ok(await page.evaluate(() => { const l = document.getElementById('lista'); window.__prueba.resenas.destruir(); return !document.querySelector('[data-resenas-escena]') && !l.hasAttribute('style'); }), 'destruir() devuelve la lista');
  await ctx.close();
}
{
  const { ctx, page, ver } = await pagina({ ancho: 390, alto: 844, hasTouch: true, isMobile: true });
  await ver('#opiniones');
  ok(await page.evaluate(() => window.__prueba.resenas.columnas === 1 && document.documentElement.scrollWidth <= innerWidth), 'reseñas en móvil: 1 columna y sin desplazamiento lateral');
  await page.evaluate(() => document.querySelector('#carrusel').scrollIntoView()); await page.waitForTimeout(200);
  fotos.push(join(salida, 'movil.png')); await page.screenshot({ path: join(salida, 'movil.png') });
  await ctx.close();
}
{
  const { ctx, page, ver } = await pagina({ reducedMotion: 'reduce' });
  await ver('#opiniones');
  ok(await page.evaluate(() => { const l = document.getElementById('lista'); return !window.__prueba.resenas.activo && !document.querySelector('[data-resenas-escena]') && l.getBoundingClientRect().height > 100; }),
    'reduced-motion: sin escena; se ve la lista real en rejilla');
  await ctx.close();
}

ok(todosLosErrores.length === 0, `sin errores de consola (${todosLosErrores.length}${todosLosErrores.length ? ': ' + todosLosErrores.slice(0, 3).join(' | ') : ''})`);
await nav.close();

// hoja de conjunto con las capturas
try {
  const aqui = dirname(fileURLToPath(import.meta.url));
  const { hacerHoja } = await import(pathToFileURL(join(aqui, '../../plugins/the-new-era-websites/skills/recursos-imagen-ia/scripts/lote-imagenes.mjs')).href);
  hacerHoja(fotos, join(salida, 'hoja-componentes.png'), { lado: 640, columnas: 3, fondo: 'claro' });
} catch (e) { console.log('No se pudo hacer la hoja de conjunto: ' + e.message); }

console.log(fallos.length ? `\n${fallos.length} fallos:\n- ${fallos.join('\n- ')}` : '\nTodo bien.');
process.exitCode = fallos.length ? 1 : 0;
