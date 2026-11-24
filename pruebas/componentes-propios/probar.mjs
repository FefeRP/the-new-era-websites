#!/usr/bin/env node
// Prueba en Chrome de las piezas propias (index.html) y los originales NEW ERA (originales.html).
//   node pruebas/servidor-estatico.mjs . 5193          (desde la raíz del repo)
//   cd demos/reloj && node ../../pruebas/componentes-propios/probar.mjs http://127.0.0.1:5193/pruebas/componentes-propios/ ../../capturas/componentes-propios
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(pathToFileURL(path.resolve('node_modules/playwright-core/index.mjs')).href);

const [base = 'http://127.0.0.1:5193/pruebas/componentes-propios/', salida = '../../capturas/componentes-propios'] = process.argv.slice(2);
fs.mkdirSync(salida, { recursive: true });
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const navegador = await chromium.launch({ executablePath: CHROME, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let bien = 0, mal = 0;
const ok = (c, txt, extra = '') => { c ? bien++ : mal++; console.log(`${c ? 'OK ' : 'MAL'} ${txt}${extra ? ' · ' + extra : ''}`); };
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const foto = (p, n, opc = {}) => p.screenshot({ path: path.join(salida, n + '.png'), ...opc });

async function pagina(url, opciones = {}) {
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, ...opciones });
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await esperar(1200);
  return { p, ctx, errores };
}

// ------------------------------------------------------------------ Piezas desde cero
{
  const { p, ctx, errores } = await pagina(base + 'index.html');
  const lenteActiva = await p.evaluate(() => document.querySelector('.barra__lente').hasAttribute('data-refracta'));
  ok(lenteActiva, 'la lente refracta en Chromium (data-refracta y filtro SVG)');
  const filtro = await p.evaluate(() => getComputedStyle(document.querySelector('.barra__lente')).backdropFilter);
  ok(/url\(/.test(filtro), 'backdrop-filter con url(#…)', filtro.slice(0, 60));
  await foto(p, '01-inicial');
  await foto(p, '01b-barra', { clip: await p.evaluate(() => { const r = document.querySelector('.barra').getBoundingClientRect(); return { x: r.x - 30, y: r.y - 30, width: r.width + 60, height: r.height + 60 }; }) });

  const final = await p.evaluate(() => { const a = document.querySelectorAll('.barra a')[2]; return a.offsetWidth; });
  await p.evaluate(() => window.__prueba.activar(2));
  let maxAncho = 0, minEscY = 1;
  for (let i = 0; i < 14; i++) {
    const g = await p.evaluate(() => window.__prueba.gota());
    maxAncho = Math.max(maxAncho, g.der - g.izq); minEscY = Math.min(minEscY, g.escY);
    if (i === 3) await foto(p, '02-gota-viajando', { clip: await p.evaluate(() => { const r = document.querySelector('.barra').getBoundingClientRect(); return { x: r.x - 30, y: r.y - 30, width: r.width + 60, height: r.height + 60 }; }) });
    await esperar(25);
  }
  ok(maxAncho > final * 1.25, 'la gota se estira al viajar (cola blanda)', `máx ${Math.round(maxAncho)} px, final ${final} px`);
  ok(minEscY < 0.99, 'la gota se aplasta con la velocidad', `escala Y mín ${minEscY.toFixed(3)}`);
  await esperar(2200);
  const g = await p.evaluate(() => window.__prueba.gota());
  ok(Math.abs(g.der - g.izq - final) < 1.5 && Math.abs(g.escY - 1) < 0.01, 'la gota se posa con el ancho del enlace y sin aplastar');
  ok(await p.evaluate(() => document.querySelectorAll('.barra a')[2].getAttribute('aria-current') === 'page'), 'aria-current pasa al enlace elegido');
  ok(await p.evaluate(() => document.body.dataset.escena === 'ocaso'), 'el fondo cambia a la escena del enlace');
  await foto(p, '03-ocaso');

  // Desplegable
  const muelle = await p.evaluate(() => window.__prueba.muelle);
  ok(/^linear\(/.test(muelle.easing) && muelle.duracion > 250 && muelle.duracion < 1200, 'muelle convertido a linear()', `${muelle.duracion} ms`);
  const pico = Math.max(...muelle.easing.slice(7, -1).split(',').map(Number));
  ok(pico > 1.01 && pico < 1.12, 'la entrada rebota un poco (sobrepaso 1-12 %)', `pico ${pico}`);
  await p.click('.barra__boton');
  await esperar(90);
  await foto(p, '04-menu-entrando');
  await esperar(900);
  const abierto = await p.evaluate(() => document.getElementById('menu-tienda').matches(':popover-open'));
  ok(abierto, 'el menú se abre con commandfor');
  ok(await p.evaluate(() => document.querySelector('.barra__boton').getAttribute('aria-expanded') === 'true'), 'aria-expanded = true');
  ok(await p.evaluate(() => document.activeElement?.closest('#menu-tienda') != null), 'el foco entra en el menú');
  const pos = await p.evaluate(() => { const m = document.getElementById('menu-tienda').getBoundingClientRect(), b = document.querySelector('.barra__boton').getBoundingClientRect(); return { mAbajo: m.bottom, bArriba: b.top, mx: m.left + m.width / 2, bx: b.left + b.width / 2 }; });
  ok(pos.mAbajo <= pos.bArriba + 1, 'el menú sale encima del botón (barra abajo)', JSON.stringify(pos));
  await foto(p, '05-menu-abierto');
  await p.keyboard.press('ArrowDown');
  ok(await p.evaluate(() => document.activeElement?.textContent.startsWith('Escamas')), 'flecha abajo pasa a la siguiente opción');
  await p.keyboard.press('Escape');
  await esperar(60);
  const t0 = Date.now();
  let cerrado = false;
  while (Date.now() - t0 < 1500) { cerrado = await p.evaluate(() => getComputedStyle(document.getElementById('menu-tienda')).display === 'none'); if (cerrado) break; await esperar(30); }
  ok(cerrado, 'Esc cierra el menú', `${Date.now() - t0 + 60} ms`);
  ok(errores.length === 0, 'sin errores de consola', errores.join(' | '));
  await ctx.close();
}

// Respaldos: reduced-motion y transparencia reducida
{
  const { p, ctx, errores } = await pagina(base + 'index.html', { reducedMotion: 'reduce' });
  await p.evaluate(() => window.__prueba.activar(1));
  await esperar(50);
  const g = await p.evaluate(() => window.__prueba.gota());
  const w = await p.evaluate(() => document.querySelectorAll('.barra a')[1].offsetWidth);
  ok(Math.abs(g.der - g.izq - w) < 1, 'reduced-motion: la gota salta sin viajar');
  ok(errores.length === 0, 'reduced-motion: sin errores');
  await ctx.close();
}
{
  const { p, ctx } = await pagina(base + 'index.html', { forcedColors: 'none' });
  await p.emulateMedia({ contrast: 'more' }).catch(() => {});
  await esperar(400);
  const fondoSolido = await p.evaluate(() => getComputedStyle(document.querySelector('.barra__lente')).backgroundColor);
  const emula = await p.evaluate(() => matchMedia('(prefers-contrast: more)').matches);
  if (emula) ok(/250, 244, 247/.test(fondoSolido), 'contraste alto: fondo sólido', fondoSolido);
  else console.log('-- contraste alto: este Chrome no lo emula, solo captura');
  await foto(p, '06-contraste-alto');
  await ctx.close();
}
// Móvil
{
  const { p, ctx, errores } = await pagina(base + 'index.html', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const desborda = await p.evaluate(() => document.querySelector('.barra').getBoundingClientRect().right > innerWidth);
  ok(!desborda, 'móvil: la barra cabe en 390 px');
  await foto(p, '07-movil');
  ok(errores.length === 0, 'móvil: sin errores');
  await ctx.close();
}

// ------------------------------------------------------------------ Originales
{
  const { p, ctx, errores } = await pagina(base + 'originales.html');
  await foto(p, '10-originales-inicio');
  const e0 = await p.evaluate(() => window.__prueba.nivel.estado);
  ok(e0.pos < 1 && e0.recorrido > 100, 'nivel: la burbuja empieza arriba', JSON.stringify(e0));
  await p.evaluate(() => window.scrollTo({ top: document.scrollingElement.scrollHeight * 0.45, behavior: 'instant' }));
  let maxEstira = 1;
  for (let i = 0; i < 10; i++) { maxEstira = Math.max(maxEstira, (await p.evaluate(() => window.__prueba.nivel.estado)).estira); await esperar(30); }
  ok(maxEstira > 1.05, 'nivel: la burbuja se estira al ir deprisa', maxEstira.toFixed(3));
  await esperar(1500);
  const e1 = await p.evaluate(() => window.__prueba.nivel.estado);
  ok(Math.abs(e1.pos - e1.progreso * e1.recorrido) < 1 && Math.abs(e1.estira - 1) < 0.01, 'nivel: se posa en el progreso real', JSON.stringify(e1));
  ok(await p.evaluate(() => document.getElementById('nivel').getAttribute('aria-valuenow')) !== '0', 'nivel: aria-valuenow sigue al scroll');
  await foto(p, '11-nivel-mitad');
  await p.focus('#nivel');
  await p.keyboard.press('End');
  await esperar(1600);
  const fin = await p.evaluate(() => Math.round(window.__prueba.nivel.estado.progreso * 100));
  ok(fin >= 99, 'nivel: Fin lleva al final de la página', String(fin));

  // Marea
  await p.evaluate(() => document.getElementById('marea1').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await esperar(900);
  const antes = await p.evaluate(() => window.__prueba.m1.estado);
  await p.click('#marea1 button:nth-of-type(4)');
  let maxIncl = 0, maxOla = 0;
  for (let i = 0; i < 26; i++) {
    const e = await p.evaluate(() => window.__prueba.m1.estado);
    maxIncl = Math.max(maxIncl, Math.abs(e.inclina)); maxOla = Math.max(maxOla, Math.abs(e.ola));
    if (i === 4) await foto(p, '12-marea-viajando', { clip: await p.evaluate(() => { const r = document.getElementById('marea1').getBoundingClientRect(); return { x: r.x - 20, y: r.y - 20, width: r.width + 40, height: r.height + 40 }; }) });
    if (i === 14) await foto(p, '13-marea-chapoteo', { clip: await p.evaluate(() => { const r = document.getElementById('marea1').getBoundingClientRect(); return { x: r.x - 20, y: r.y - 20, width: r.width + 40, height: r.height + 40 }; }) });
    await esperar(30);
  }
  ok(maxIncl > 0.02, 'marea: la superficie se inclina con la aceleración', maxIncl.toFixed(3));
  ok(maxOla > 1, 'marea: chapotea al llegar', maxOla.toFixed(2));
  await esperar(2200);
  const despues = await p.evaluate(() => ({ e: window.__prueba.m1.estado, sel: document.querySelector('#marea1 [aria-selected=true]').textContent, precio: document.getElementById('precio').textContent }));
  ok(despues.sel === 'Proyecto cerrado' && despues.precio.startsWith('desde'), 'marea: cambia la selección y avisa', JSON.stringify(despues.precio));
  ok(despues.e.ola === 0 && despues.e.inclina === 0 && despues.e.izq > antes.izq, 'marea: queda plana en la opción nueva', JSON.stringify(despues.e));
  await p.focus('#marea1 [aria-selected=true]');
  await p.keyboard.press('ArrowRight');
  ok(await p.evaluate(() => document.activeElement.textContent === 'Mensual'), 'marea: las flechas recorren las opciones (y dan la vuelta)');
  await esperar(1800);
  await foto(p, '14-marea-reposo', { clip: await p.evaluate(() => { const r = document.getElementById('marea1').getBoundingClientRect(); return { x: r.x - 20, y: r.y - 120, width: Math.max(r.width + 40, 520), height: r.height + 220 }; }) });
  ok(errores.length === 0, 'originales: sin errores', errores.join(' | '));
  await ctx.close();
}
await navegador.close();
console.log(`\n${bien} bien, ${mal} mal`);
process.exit(mal ? 1 : 0);
