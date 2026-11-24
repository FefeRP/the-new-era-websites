// marea.js · NEW ERA original
// Control segmentado (pestañas, filtros, selector de plan) donde la opción elegida está llena de líquido. Al cambiar,
// el líquido viaja de una opción a otra como agua en un canal: el borde que va delante tira, el de atrás se queda,
// la superficie se inclina con la aceleración y, al llegar, chapotea (oleaje que se amortigua) hasta quedar plana.
// La superficie es un path SVG que se recalcula solo mientras algo se mueve. Usa muelle.js; sin más dependencias.
//
//   <div class="mi-marea" role="tablist" aria-label="Plan">
//     <button role="tab" aria-selected="true">Mensual</button> <button role="tab">Anual</button> …
//   </div>
//   import { crearMarea } from './marea.js';
//   const marea = crearMarea(document.querySelector('.mi-marea'), { alCambiar: (i) => … });
//
// Variables CSS: --marea-liquido (color), --marea-espuma (línea de la superficie), --marea-nivel (0-1, altura del
// agua dentro de la opción; 0.86 por defecto), --marea-texto-activo. Teclado: flechas, Inicio y Fin (tablist).
// Con prefers-reduced-motion el líquido aparece en la opción nueva sin viaje ni oleaje.
import { crearMuelle } from './muelle.js';

// todo en :where() (especificidad 0): esta hoja se mete al final del <head>, y así la página siempre puede cambiarla
const CSS_BASE = `
:where(.marea){--marea-liquido:#2f7dd1;--marea-espuma:rgb(255 255 255 / .7);--marea-nivel:.86;--marea-texto-activo:#fff;
  position:relative;display:inline-flex;isolation:isolate}
:where(.marea>[role=tab],.marea>button){position:relative;z-index:1;transition:color .18s ease}
.marea>[aria-selected=true]{color:var(--marea-texto-activo)}
.marea__agua{position:absolute;inset:0;z-index:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.marea__agua path:first-child{fill:var(--marea-liquido)}
.marea__agua path:last-child{fill:none;stroke:var(--marea-espuma);stroke-width:1.5;stroke-linecap:round}
@media (forced-colors:active){.marea__agua path:first-child{fill:Highlight}.marea>[aria-selected=true]{color:HighlightText}}
`;

export function crearMarea(grupo, {
  radio = null,           // px de las esquinas del agua (por defecto, el de la opción)
  inclinacion = 0.00011,  // cuánto inclina la aceleración la superficie
  oleaje = 7,             // px de amplitud máxima del chapoteo al llegar
  alCambiar = null,
} = {}) {
  if (!document.getElementById('marea-css')) {
    document.head.append(Object.assign(document.createElement('style'), { id: 'marea-css', textContent: CSS_BASE }));
  }
  const reducido = matchMedia('(prefers-reduced-motion: reduce)');
  const opciones = [...grupo.querySelectorAll(':scope > [role=tab], :scope > button')];
  if (!opciones.length) return { elegir() {}, actual: -1, estado: {}, destruir() {} };
  grupo.classList.add('marea');
  const ctl = new AbortController(), { signal } = ctl;
  let vivo = true, tCola = 0, tChapoteo = 0;
  const rolPuesto = !grupo.getAttribute('role');
  const rolesOpcion = opciones.map((o) => !o.getAttribute('role'));
  const NS = 'http://www.w3.org/2000/svg';
  const agua = document.createElementNS(NS, 'svg');
  agua.classList.add('marea__agua');
  agua.setAttribute('aria-hidden', 'true');
  const cuerpo = document.createElementNS(NS, 'path'), espuma = document.createElementNS(NS, 'path');
  agua.append(cuerpo, espuma);
  grupo.prepend(agua);

  let actual = Math.max(0, opciones.findIndex((o) => o.getAttribute('aria-selected') === 'true'));
  let izq = 0, der = 0, alto = 0, arriba = 0, r = 0, inclina = 0, ola = 0, fase = 0, tOla = 0, vAnt = 0;

  function dibujar() {
    const w = Math.max(der - izq, 2), nivel = parseFloat(getComputedStyle(grupo).getPropertyValue('--marea-nivel')) || 0.86;
    const fondo = arriba + alto, sup = fondo - alto * nivel;
    const rr = Math.min(r, w / 2, alto * nivel / 2);
    // superficie: recta inclinada + una ola estacionaria que se amortigua
    const N = 24, puntos = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, x = izq + u * w;
      const y = sup + inclina * (u - 0.5) * w + ola * Math.sin(u * Math.PI * 2 + fase) * Math.sin(u * Math.PI);
      puntos.push([x, Math.min(y, fondo - 2)]);
    }
    const cima = puntos.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    // lados rectos y fondo con esquinas redondeadas (el vaso es la opción)
    const d = `${cima} L${der} ${fondo - rr} Q${der} ${fondo} ${der - rr} ${fondo} L${izq + rr} ${fondo} Q${izq} ${fondo} ${izq} ${fondo - rr} Z`;
    cuerpo.setAttribute('d', d);
    espuma.setAttribute('d', cima);
  }

  const bordeI = crearMuelle({ k: 210, c: 25, reposo: 0.2, alPintar: (x) => { izq = x; } });
  const bordeD = crearMuelle({ k: 210, c: 25, reposo: 0.2, alPintar: (x) => { der = x; } });
  const muelleInclina = crearMuelle({ k: 120, c: 7, reposo: 0.05, alPintar: (x) => { inclina = x; } });

  let raf = 0, ultimo = 0;
  function bucle(ahora) {
    const dt = Math.min((ahora - ultimo) / 1000, 1 / 30); ultimo = ahora;
    const v = (bordeI.velocidad + bordeD.velocidad) / 2;
    const acel = dt > 0 ? (v - vAnt) / dt : 0; vAnt = v;
    // con los bordes quietos el objetivo es 0 exacto: si no, el ruido de la velocidad lo mueve cada fotograma y nunca se para
    const bordesQuietos = !bordeI.enMarcha && !bordeD.enMarcha;
    muelleInclina.ir(bordesQuietos ? 0 : Math.max(-0.35, Math.min(0.35, -acel * inclinacion)));
    tOla += dt; fase += dt * 9; ola *= Math.exp(-dt * 2.6);           // chapoteo que se apaga en ~1 s
    if (Math.abs(ola) < 0.05) ola = 0;
    dibujar();
    const quieto = !bordeI.enMarcha && !bordeD.enMarcha && !muelleInclina.enMarcha && Math.abs(ola) < 0.05;
    if (quieto) { ola = 0; inclina = 0; dibujar(); raf = 0; } else raf = requestAnimationFrame(bucle);
  }
  const arrancar = () => { if (vivo && !raf) { ultimo = performance.now(); raf = requestAnimationFrame(bucle); } };

  function medir(el) {
    return { x: el.offsetLeft, w: el.offsetWidth, y: el.offsetTop, h: el.offsetHeight,
      r: radio ?? (parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0) };
  }
  function colocar(i, animar) {
    const m = medir(opciones[i]);
    alto = m.h; arriba = m.y; r = m.r;
    if (!animar || reducido.matches) {
      bordeI.fijar(m.x); bordeD.fijar(m.x + m.w); ola = 0; dibujar(); return;
    }
    const derecha = m.x > izq;
    const [cabeza, cola] = derecha ? [bordeD, bordeI] : [bordeI, bordeD];
    // una pulsación nueva anula los temporizadores de la anterior (si no, la cabeza de ahora se quedaba con k de cola)
    clearTimeout(tCola); clearTimeout(tChapoteo);
    cabeza.ajustar({ k: 230, c: 24 }); cola.ajustar({ k: 70 * 0.1, c: 12 });
    tCola = setTimeout(() => cola.ajustar({ k: 70, c: 12 }), 80);       // la cola sale tarde: el agua «se vacía»
    bordeI.ir(m.x); bordeD.ir(m.x + m.w);
    const distancia = Math.abs(m.x - izq);
    // el chapoteo llega tarde: si el agua ya se había parado, hay que volver a arrancar el bucle o la ola se queda puesta
    tChapoteo = setTimeout(() => { ola = (derecha ? 1 : -1) * Math.min(oleaje, 2 + distancia / 40); arrancar(); }, 260);
    arrancar();
  }

  function elegir(i, foco = false) {
    if (i === actual) return;
    opciones[actual].setAttribute('aria-selected', 'false');
    opciones[actual].tabIndex = -1;
    actual = i;
    opciones[i].setAttribute('aria-selected', 'true');
    opciones[i].tabIndex = 0;
    if (foco) opciones[i].focus();
    colocar(i, true);
    alCambiar?.(i);
  }
  opciones.forEach((o, i) => {
    if (!o.getAttribute('role')) o.setAttribute('role', 'tab');
    o.setAttribute('aria-selected', String(i === actual));
    o.tabIndex = i === actual ? 0 : -1;
    o.addEventListener('click', () => elegir(i), { signal });
  });
  if (rolPuesto) grupo.setAttribute('role', 'tablist');
  grupo.addEventListener('keydown', (e) => {
    const n = opciones.length;
    const mapa = { ArrowRight: actual + 1, ArrowDown: actual + 1, ArrowLeft: actual - 1, ArrowUp: actual - 1, Home: 0, End: n - 1 };
    if (!(e.key in mapa)) return;
    e.preventDefault();
    elegir((mapa[e.key] + n) % n, true);
  }, { signal });

  // si el grupo cambia de tamaño a mitad de viaje (p. ej. el activo cambia de peso), no se corta el viaje: se recoloca al llegar
  const ro = new ResizeObserver(() => {
    if (bordeI.enMarcha || bordeD.enMarcha) { const m = medir(opciones[actual]); alto = m.h; arriba = m.y; bordeI.ir(m.x); bordeD.ir(m.x + m.w); }
    else colocar(actual, false);
  });
  ro.observe(grupo);
  colocar(actual, false);

  return {
    elegir: (i) => elegir(i),
    get actual() { return actual; },
    get estado() { return { izq, der, inclina, ola }; },
    destruir() {
      vivo = false; ctl.abort(); clearTimeout(tCola); clearTimeout(tChapoteo);
      cancelAnimationFrame(raf); raf = 0; ro.disconnect();
      bordeI.destruir(); bordeD.destruir(); muelleInclina.destruir(); agua.remove();
      grupo.classList.remove('marea');
      if (rolPuesto) grupo.removeAttribute('role');
      opciones.forEach((o, i) => { if (rolesOpcion[i]) o.removeAttribute('role'); o.removeAttribute('aria-selected'); o.removeAttribute('tabindex'); });
    },
  };
}
