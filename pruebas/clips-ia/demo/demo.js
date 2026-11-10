// Banco de pruebas: monta una página con scroll alrededor de UN clip o imagen ya procesados (procesar-clips.mjs), para
// juzgarlos donde van a vivir y no sueltos en un reproductor. Sin dependencias; usa los motores del plugin tal cual.
//   /pruebas/clips-ia/demo/?d=/ruta/a/procesado/<nombre>/      una pieza
//   /pruebas/clips-ia/demo/?c=<id-de-prueba>&base=/ruta/a/procesado/   todas las piezas de una prueba juntas (coherencia)
import { crearFrameScrubber } from '../../../plugins/the-new-era-websites/skills/scroll-frames/scripts/frame-scrubber.js';
import { crearVideoAlfa } from '../../../plugins/the-new-era-websites/skills/capas-alfa/scripts/video-alfa.js';

const q = new URLSearchParams(location.search);
const app = document.getElementById('app');
const hud = document.getElementById('hud');
const barra = document.getElementById('barra');
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const sinHud = q.has('limpio'); if (sinHud) hud.style.display = 'none';
const al = []; // funciones a llamar en cada scroll
const estado = { tipo: '', lineas: [] };
window.__demo = estado;

function progresoDe(pista) {
  const r = pista.getBoundingClientRect(); const total = r.height - innerHeight;
  return total <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / total));
}
function alScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  barra.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  estado.lineas = [];
  for (const f of al) f();
  hud.textContent = [estado.cabecera, ...estado.lineas].filter(Boolean).join('\n');
}
// luminancia media de una zona del canvas/imagen, para elegir texto claro u oscuro
const TEXTOS = [
  ['Titular de prueba', 'Dos líneas de texto real encima del clip, para ver si se lee.'],
  ['Segundo mensaje', 'A media altura del recorrido: aquí suele estar el fotograma más movido.'],
  ['Cierre', 'El último tramo: ¿frena, acelera, cambia la luz?'],
];

async function montarScrub(base, f) {
  const colorSec = f.medidas?.fondo?.colorInicial ?? '#101114';
  document.documentElement.style.setProperty('--seccion', colorSec);
  const [r, g, b] = [1, 3, 5].map((k) => parseInt(colorSec.slice(k, k + 2), 16));
  const tinta = 0.299 * r + 0.587 * g + 0.114 * b < 128 ? '#f4f2ee' : '#14161a'; // texto legible sobre el color del clip
  app.append(el(`<section class="bloque" style="color:${tinta}"><div><h1>Antes del clip</h1><p>La sección anterior usa el color de las esquinas del primer fotograma (${f.medidas?.fondo?.colorInicial ?? 's/d'}): si se ve la raya al entrar, el fondo del clip no casa.</p></div></section>`));
  const pista = el(`<section class="pista" id="secuencia"><div class="fija"><canvas></canvas>
    ${TEXTOS.map((t, i) => `<div class="rotulo ${i % 2 ? 'derecha' : ''}" data-i="${i}"><h2>${t[0]}</h2><p>${t[1]}</p></div>`).join('')}</div></section>`);
  app.append(pista);
  app.append(el('<section class="bloque" style="color:${tinta}"><div><h2>Después del clip</h2><p>Salida a una sección normal.</p></div></section>'));
  const t0 = performance.now(); let cargados = 0, total = 0;
  const seq = await crearFrameScrubber({ canvas: pista.querySelector('canvas'), base: base + f.salidas.frames, alCargar: (c, t) => { cargados = c; total = t; },
    alDibujar: ({ i }) => { estado.frame = i; requestAnimationFrame(alScroll); } }); // el HUD enseña el fotograma ya pintado, no el pedido
  estado.primerFrameMs = Math.round(performance.now() - t0);
  seq.listo?.then?.(() => { estado.todoMs = Math.round(performance.now() - t0); alScroll(); });
  const rot = [...pista.querySelectorAll('.rotulo')];
  al.push(() => {
    const p = progresoDe(pista); seq.progreso(p);
    rot.forEach((r, i) => r.classList.toggle('visible', p > 0.08 + i * 0.3 && p < 0.3 + i * 0.3));
    estado.progreso = p;
    estado.lineas.push(`fotograma ${String(estado.frame ?? '-').padStart(3)} · progreso ${(p * 100).toFixed(0)} %`,
      `frames ${cargados}/${total}${estado.todoMs ? ` · primer frame ${estado.primerFrameMs} ms · todo ${estado.todoMs} ms` : ''}`);
  });
  estado.seq = seq;
}

async function montarBucle(base, f) {
  const s = el(`<section class="bloque oscuro" style="overflow:clip"><video class="heroe" muted loop playsinline autoplay preload="auto" poster="${base + (f.salidas.poster ?? '')}" src="${base + f.salidas.bucle}"></video>
    <div class="heroe-texto"><h1>Titular sobre el bucle</h1><p>El vídeo da vueltas sin fin: mira la costura cuando vuelve a empezar.</p></div></section>`);
  app.append(s);
  app.append(el('<section class="bloque"><div><h2>Sección siguiente</h2><p>El bucle queda arriba; aquí se comprueba el paso a una sección normal.</p></div></section>'));
  const v = s.querySelector('video'); estado.video = v;
  await new Promise((r) => { v.addEventListener('loadeddata', r, { once: true }); v.addEventListener('error', r, { once: true }); setTimeout(r, 6000); });
  al.push(() => estado.lineas.push(`t = ${v.currentTime.toFixed(2)} / ${(v.duration || 0).toFixed(2)} s`));
  setInterval(alScroll, 250);
}

async function montarAlfaVideo(base, f) {
  const clases = ['', 'oscuro', 'color', 'cuadros'];
  for (const c of clases) {
    const s = el(`<section class="bloque ${c}" style="overflow:clip"><h2 class="titular-capas" style="font-size:clamp(2.4rem,10vw,9rem)">DETRÁS</h2><canvas class="alfa-lienzo"></canvas></section>`);
    app.append(s);
    try { await crearVideoAlfa({ canvas: s.querySelector('canvas'), base: base + f.salidas.alfa, modo: 'bucle' }); }
    catch (e) { estado.error = String(e); }
  }
  al.push(() => estado.lineas.push('vídeo con alfa sobre claro, oscuro, color y cuadros: halos y restos de fondo'));
}

function montarFlotantes(urls, titulo = 'CAPAS') {
  // cada pieza varias veces, a distintas profundidades: el titular queda entre ellas
  const fondos = ['', 'oscuro', 'color'];
  fondos.forEach((c, k) => {
    const s = el(`<section class="bloque ${c}" style="overflow:clip;min-height:130svh"><h2 class="titular-capas">${titulo}</h2></section>`);
    const n = Math.max(6, urls.length * 2);
    for (let i = 0; i < n; i++) {
      const u = urls[i % urls.length]; const prof = [0.25, 0.6, 1.1, 1.7][i % 4];
      const x = [8, 70, 30, 82, 52, 14, 62, 40][i % 8], y = [14, 22, 62, 58, 8, 78, 80, 40][i % 8];
      const d = el(`<div class="flota ${prof < 0.9 ? 'detras' : prof > 1.5 ? 'muy-delante' : 'delante'}" style="left:${x}%;top:${y}%;width:${Math.round(9 + prof * 11)}vw;${prof < 0.4 ? 'filter:blur(2px);opacity:.85' : prof > 1.5 ? 'filter:blur(1.5px)' : ''}"><img src="${u}" alt=""></div>`);
      d.dataset.prof = prof; d.dataset.giro = ((i * 37) % 50) - 25; s.append(d);
    }
    app.append(s);
    const piezas = [...s.querySelectorAll('.flota')];
    al.push(() => {
      const r = s.getBoundingClientRect(); const p = (innerHeight - r.top) / (innerHeight + r.height); // 0..1 al cruzar la pantalla
      if (p < -0.2 || p > 1.2) return;
      for (const d of piezas) { const pr = Number(d.dataset.prof); d.style.transform = `translate3d(0, ${((0.5 - p) * pr * 420).toFixed(1)}px, 0) rotate(${(Number(d.dataset.giro) + (p - 0.5) * 40 * pr).toFixed(1)}deg)`; }
      if (k === 0) estado.lineas.push('piezas con alfa a 4 profundidades sobre claro, oscuro y color: bordes, halos y coherencia');
    });
  });
}

function montarImagen(base, f) {
  const u = base + f.salidas.imagen;
  if (f.prueba?.mosaico) {
    app.append(el(`<section class="mosaico" style="background-image:url('${u}')"><div class="tarjeta"><h2>Textura en mosaico</h2><p>Repetida a 420 px: si se ven las juntas, no es continua.</p></div></section>`));
    app.append(el(`<section class="mosaico" style="background-image:url('${u}');background-size:180px auto"><div class="tarjeta"><h2>A 180 px</h2><p>De lejos se ve el patrón que se repite.</p></div></section>`));
  } else {
    const s = el(`<section class="pista" style="height:220vh"><div class="fija"><img class="lleno" src="${u}" alt="" style="transform-origin:50% 50%">
      <div class="rotulo visible"><h1>Titular sobre el fondo</h1><p>Texto real encima: ¿queda sitio limpio para leer?</p></div></div></section>`);
    app.append(s); const img = s.querySelector('img');
    al.push(() => { const p = progresoDe(s); img.style.transform = `scale(${(1 + p * 0.18).toFixed(4)})`; estado.lineas.push(`fondo con zoom lento por código: ${(100 + p * 18).toFixed(0)} %`); });
    app.append(el('<section class="bloque"><div><h2>Sección siguiente</h2><p>Paso del fondo a una sección lisa.</p></div></section>'));
  }
}

function montarConjunto(piezas, base, id) {
  // todas las piezas de una misma prueba juntas: lo que se juzga es si parecen de la misma mano
  for (const c of ['', 'oscuro']) {
    const s = el(`<section class="bloque ${c}"><div><h2 style="margin-bottom:1em">${id}: ${piezas.length} piezas juntas</h2><div class="rejilla"></div></div></section>`);
    const g = s.querySelector('.rejilla');
    for (const p of piezas) {
      const u = base + p.nombre + '/' + (p.salidas.recorte ?? p.salidas.imagen);
      g.append(el(`<figure><div class="tallas"><img src="${u}" width="96" alt=""><img src="${u}" width="48" alt=""><img src="${u}" width="24" alt=""></div><figcaption>${p.nombre}</figcaption></figure>`));
    }
    app.append(s);
  }
  montarFlotantes(piezas.map((p) => base + p.nombre + '/' + (p.salidas.recorte ?? p.salidas.imagen)), 'JUNTAS');
}

async function iniciar() {
  try {
    if (q.has('c')) {
      const base = q.get('base'); const id = q.get('c');
      const indice = await (await fetch(base + 'indice.json')).json();
      const piezas = indice.piezas.filter((p) => p.prueba === id && (p.salidas.recorte || p.salidas.imagen));
      estado.tipo = 'conjunto'; estado.cabecera = `conjunto ${id} · ${piezas.length} piezas`;
      if (!piezas.length) throw new Error('La prueba ' + id + ' no tiene imágenes procesadas (la vista de conjunto es para lotes de imagen).');
      montarConjunto(piezas, base, id);
    } else {
      let base = q.get('d'); if (!base) throw new Error('Falta ?d=/ruta/a/procesado/<nombre>/'); if (!base.endsWith('/')) base += '/';
      const f = await (await fetch(base + 'ficha.json')).json();
      estado.tipo = f.tipo; estado.cabecera = `${f.nombre} · ${f.tipo}${f.modelo ? ' · ' + f.modelo : ''}${f.automatico ? ' · ' + f.automatico : ''}`;
      if (f.tipo === 'scrub' || f.tipo === 'transicion') await montarScrub(base, f);
      else if (f.tipo === 'bucle' || f.tipo === 'fondo') await montarBucle(base, f);
      else if (f.tipo === 'alfa-video') await montarAlfaVideo(base, f);
      else if (f.tipo === 'imagen-alfa') montarFlotantes([base + f.salidas.recorte]);
      else montarImagen(base, f);
    }
  } catch (e) { estado.error = String(e?.message ?? e); hud.textContent = 'ERROR: ' + estado.error; }
  addEventListener('scroll', alScroll, { passive: true }); addEventListener('resize', alScroll);
  alScroll();
  estado.montado = true;
}
iniciar();
