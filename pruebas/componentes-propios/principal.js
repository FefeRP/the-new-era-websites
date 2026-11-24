// Prueba NEW ERA: barra de cristal (lente + gota de dos cuerpos), desplegable con rebote y fondo por capas.
// Hecho desde cero con componentes-interactivos/references (cristal-liquido, fisica-y-fluidez) y sus motores.
import { crearLente } from '../../plugins/the-new-era-websites/skills/componentes-interactivos/scripts/cristal-lente.js';
import { crearMuelle, muelleLinear, MUELLES } from '../../plugins/the-new-era-websites/skills/componentes-interactivos/scripts/muelle.js';
import { crearFondoCapas } from '../../plugins/the-new-era-websites/skills/parallax-capas/scripts/fondo-capas.js';

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------- Fondo por capas (SVG generados por código)
const PALETAS = {
  alba:     { cielo: ['#9fb3d8', '#f3c7bb', '#fbe3d6'], astro: '#fff1e2', nube: '#fff6f0', monte: '#fff8f4', sombraMonte: '#d9b9c6', lejos: '#b7a6c4', balsa: ['#e79aaa', '#f1b9c2'], dique: '#f8ece9', reflejo: '#fde6dd' },
  mediodia: { cielo: ['#6fb1ea', '#a9d3f3', '#e6f2fa'], astro: '#ffffff', nube: '#ffffff', monte: '#ffffff', sombraMonte: '#bcd0e2', lejos: '#9db8cf', balsa: ['#ee93ad', '#f6b4c6'], dique: '#fbf6f4', reflejo: '#e3f1fb' },
  ocaso:    { cielo: ['#2a2350', '#7c3f6a', '#e47b5c'], astro: '#ffd3a8', nube: '#f2a68c', monte: '#f2cfc0', sombraMonte: '#6c4a6f', lejos: '#4d3963', balsa: ['#8b4769', '#b45f78'], dique: '#d9a9a8', reflejo: '#f0957a' },
};
const svg = (cuerpo) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">${cuerpo}</svg>`);

function cielo(p, esc) {
  const astroY = esc === 'mediodia' ? 170 : esc === 'alba' ? 470 : 430;
  const astroX = esc === 'alba' ? 360 : esc === 'mediodia' ? 1180 : 1240;
  let cirros = '';
  for (let i = 0; i < 6; i++) {                      // cirros finos: líneas que la lente tiene que curvar
    // solo en la franja libre entre el texto y los montes, y a la derecha: nunca cruzan el titular
    const y = 452 + i * 17 + (i % 2) * 5, x = 760 + ((i * 263) % 520), w = 200 + ((i * 131) % 260);
    cirros += `<rect x="${x}" y="${y}" width="${w}" height="${2 + (i % 2)}" rx="2" fill="${p.nube}" opacity="${0.3 + (i % 3) * 0.12}"/>`;
  }
  return svg(`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.cielo[0]}"/><stop offset=".62" stop-color="${p.cielo[1]}"/><stop offset="1" stop-color="${p.cielo[2]}"/></linearGradient>
    <radialGradient id="h" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${p.astro}" stop-opacity=".9"/><stop offset="1" stop-color="${p.astro}" stop-opacity="0"/></radialGradient></defs>
    <rect width="1600" height="1000" fill="url(#g)"/><circle cx="${astroX}" cy="${astroY}" r="260" fill="url(#h)"/>
    <circle cx="${astroX}" cy="${astroY}" r="${esc === 'mediodia' ? 46 : 58}" fill="${p.astro}"/>${cirros}`);
}
function montes(p) {
  let m = `<path d="M0 600 C 220 560 420 585 640 566 S 1080 548 1300 570 S 1520 560 1600 572 V 1000 H 0 Z" fill="${p.lejos}" opacity=".7"/>`;
  const pilas = [[180, 640, 150, 96], [360, 652, 110, 70], [980, 646, 190, 118], [1210, 660, 120, 74], [1420, 650, 160, 100]];
  for (const [x, base, a, h] of pilas) {               // montones de sal: cara al sol y cara en sombra
    m += `<path d="M${x - a} ${base} Q ${x - a * 0.2} ${base - h * 1.04} ${x} ${base - h} Q ${x + a * 0.2} ${base - h * 1.04} ${x + a} ${base} Z" fill="${p.monte}"/>`;
    m += `<path d="M${x} ${base - h} Q ${x + a * 0.2} ${base - h * 1.04} ${x + a} ${base} L ${x + a * 0.15} ${base} Z" fill="${p.sombraMonte}" opacity=".75"/>`;
  }
  return svg(m);
}
function balsas(p) {
  // rejilla en perspectiva: diques claros que separan balsas rosadas (las líneas duras dan qué refractar)
  let b = `<rect y="640" width="1600" height="360" fill="${p.dique}"/>`;
  const filas = [640, 676, 724, 788, 872, 1000];
  for (let f = 0; f < filas.length - 1; f++) {
    const y0 = filas[f] + 4, y1 = filas[f + 1] - 4, n = 5 + f;
    for (let i = 0; i < n; i++) {
      const fx = (t, y) => 800 + (t - 0.5) * 1600 * (1 + (y - 640) / 260);
      const ta = i / n + 0.006, tb = (i + 1) / n - 0.006;
      const pts = `${fx(ta, y0)},${y0} ${fx(tb, y0)},${y0} ${fx(tb, y1)},${y1} ${fx(ta, y1)},${y1}`;
      b += `<polygon points="${pts}" fill="${p.balsa[(i + f) % 2]}"/>`;
      b += `<polygon points="${fx(ta, y0)},${y0 + 2} ${fx(tb, y0)},${y0 + 2} ${fx(tb, y0 + (y1 - y0) * 0.28)},${y0 + (y1 - y0) * 0.28} ${fx(ta, y0 + (y1 - y0) * 0.28)},${y0 + (y1 - y0) * 0.28}" fill="${p.reflejo}" opacity=".35"/>`;
    }
  }
  return svg(b);
}
const raizFondo = document.querySelector('[data-fondo-capas]');
for (const [esc, p] of Object.entries(PALETAS)) {
  const capas = { cielo: cielo(p, esc), montes: montes(p), balsas: balsas(p) };
  for (const [nombre, src] of Object.entries(capas)) {
    const img = Object.assign(new Image(), { src, alt: '', decoding: 'async' });
    img.dataset.escena = esc;
    raizFondo.querySelector(`[data-capa="${nombre}"]`).append(img);
  }
}
const fondo = crearFondoCapas(raizFondo, { inicial: 'mediodia', duracion: 1000, escalonado: 140, desplazamiento: 4,
  sentidoPorCapa: { balsas: -1 } });
document.body.dataset.escena = 'mediodia';

// ---------------------------------------------------------------- Barra: lente + gota de dos cuerpos
const barra = document.querySelector('.barra');
const lente = crearLente(barra.querySelector('.barra__lente'), { escala: 46, desenfoque: 1.2, saturacion: 1.5 });
const gota = barra.querySelector('.barra__gota');
const lista = barra.querySelector('.barra__lista');
const enlaces = [...lista.querySelectorAll('a[data-escena]')];

// Dos bordes: el que va hacia el destino es la cabeza (rígido), el de atrás la cola (blando, arranca al 8 % 70 ms).
let izq = 0, der = 0, escY = 1;
const pintar = () => {
  gota.style.width = `${Math.max(der - izq, 24)}px`;
  gota.style.transform = `translateX(${izq}px) scaleY(${escY})`;
};
const bordeIzq = crearMuelle({ ...MUELLES.cabeza, reposo: 0.2, alPintar: (x) => { izq = x; pintar(); } });
const bordeDer = crearMuelle({ ...MUELLES.cabeza, reposo: 0.2, alPintar: (x) => { der = x; pintar(); } });
const aplastado = crearMuelle({ ...MUELLES.aplastar, valor: 1, reposo: 0.002, alPintar: (y) => { escY = y; pintar(); } });
let vigilando = 0;
function vigilarVelocidad() {                         // aplasta según la velocidad media de los bordes
  const v = (Math.abs(bordeIzq.velocidad) + Math.abs(bordeDer.velocidad)) / 2;
  aplastado.ir(1 - 0.2 * Math.min(v / 1500, 1));
  vigilando = (bordeIzq.enMarcha || bordeDer.enMarcha) ? requestAnimationFrame(vigilarVelocidad) : (aplastado.ir(1), 0);
}
function medir(el) { return { x: el.offsetLeft, w: el.offsetWidth }; }
let actual = enlaces[0];
function moverGota(destino, animar = true) {
  const { x, w } = medir(destino);
  if (!animar || reducido) { bordeIzq.fijar(x); bordeDer.fijar(x + w); return; }
  const haciaDerecha = x > izq;
  const [cabeza, cola] = haciaDerecha ? [bordeDer, bordeIzq] : [bordeIzq, bordeDer];
  cabeza.ajustar(MUELLES.cabeza); cola.ajustar({ k: MUELLES.cola.k * 0.08, c: MUELLES.cola.c });
  bordeIzq.ir(x); bordeDer.ir(x + w);
  setTimeout(() => cola.ajustar(MUELLES.cola), 70);
  if (!vigilando) vigilando = requestAnimationFrame(vigilarVelocidad);
}
function activar(enlace) {
  if (enlace === actual) return;
  actual.removeAttribute('aria-current');
  enlace.setAttribute('aria-current', 'page');
  actual = enlace;
  moverGota(enlace);
  fondo.irA(enlace.dataset.escena);
  document.body.dataset.escena = enlace.dataset.escena;
}
for (const a of enlaces) a.addEventListener('click', (e) => { e.preventDefault(); activar(a); });
new ResizeObserver(() => moverGota(actual, false)).observe(lista);
moverGota(actual, false);

// ---------------------------------------------------------------- Desplegable: muelle en linear() + respaldo
const { easing, duracion } = muelleLinear(MUELLES.panelVivo);
document.documentElement.style.setProperty('--muelle-entrada', easing);
document.documentElement.style.setProperty('--muelle-duracion', `${duracion}ms`);

const boton = barra.querySelector('.barra__boton');
const menu = document.getElementById('menu-tienda');
menu.querySelectorAll('a').forEach((a, i) => a.style.setProperty('--i', i));
if (!('commandForElement' in HTMLButtonElement.prototype)) {   // navegadores sin invocadores
  boton.addEventListener('click', () => menu.togglePopover({ source: boton }));
}
// Sin anchor positioning: se coloca a mano encima del botón
const anclaNativa = CSS.supports('position-area: block-start');
function colocar() {
  if (anclaNativa) return;
  const r = boton.getBoundingClientRect();
  menu.style.left = `${Math.max(8, Math.min(r.left + r.width / 2 - menu.offsetWidth / 2, innerWidth - menu.offsetWidth - 8))}px`;
  menu.style.top = `${r.top - menu.offsetHeight - 12}px`;
}
menu.addEventListener('beforetoggle', (e) => {
  boton.setAttribute('aria-expanded', String(e.newState === 'open'));
  if (e.newState === 'open') requestAnimationFrame(colocar);
});
menu.addEventListener('toggle', (e) => {
  if (e.newState === 'open') menu.querySelector('a').focus({ preventScroll: true });
});
menu.addEventListener('keydown', (e) => {                      // flechas entre opciones
  const items = [...menu.querySelectorAll('a')], i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
  }
});
menu.addEventListener('click', (e) => { if (e.target.closest('a')) { e.preventDefault(); menu.hidePopover(); boton.focus(); } });
boton.setAttribute('aria-expanded', 'false');

// Para las pruebas automáticas
window.__prueba = { activar: (i) => activar(enlaces[i]), lente, fondo, gota: () => ({ izq, der, escY }), muelle: { easing, duracion } };
