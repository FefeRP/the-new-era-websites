// revelados.js: revelados y transiciones sin dependencias, todos con la misma interfaz:
//   const r = crearX(el, opciones);   r.progreso(p)  (0..1, p. ej. desde ScrollTrigger con scrub)
//                                     r.reproducir({ duracion })  (por tiempo, devuelve una promesa)
//                                     r.destruir()  (quita lo que añadió y deja el elemento como estaba)
// Con prefers-reduced-motion no animan: rejilla y líneas quedan visibles; la cortina cambia la escena a mitad sin enseñar el
// panel; el zoom pasa por corte (sin interpolar) en la mitad del recorrido.
// Solo animan transform, opacity y clip-path (sin layout).
//
//   crearRejilla(el, { filas, columnas, orden, color })   la imagen aparece por bloques (escalera, centro, azar)    ref13-7
//   crearCortina(el, { direccion, color, alCubrir })      un panel cubre y descubre: cambio de escena a mitad       ref16
//   crearZoomA(el, { objetivo, margen, relevo })          zoom 2D con origen en un punto de una imagen grande       ref14
//   crearLineas(el, { retardo })                          el texto sube línea a línea desde detrás de una máscara  ref12

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const lim = (v) => Math.min(1, Math.max(0, v));
const suave = (t) => t * t * (3 - 2 * t);
const facil = (t) => 1 - Math.pow(1 - t, 3); // salida suave

function reproductor(progreso) {
  let raf = 0;
  return ({ duracion = 1200, desde = 0, hasta = 1 } = {}) => new Promise((ok) => {
    cancelAnimationFrame(raf);
    if (reducido()) { progreso(hasta); return ok(); }
    const t0 = performance.now();
    const paso = (t) => {
      const k = lim((t - t0) / duracion);
      progreso(desde + (hasta - desde) * k);
      if (k < 1) raf = requestAnimationFrame(paso); else ok();
    };
    raf = requestAnimationFrame(paso);
  });
}

// ---------- rejilla: una capa de celdas del color del fondo que se abren por orden ----------
export function crearRejilla(el, { filas = 4, columnas = 6, orden = 'escalera', color = null, solape = 0.6, forma = 'persiana' } = {}) {
  const capa = document.createElement('div');
  capa.setAttribute('aria-hidden', 'true');
  Object.assign(capa.style, { position: 'absolute', inset: '0', display: 'grid', pointerEvents: 'none', zIndex: '2',
    gridTemplateColumns: `repeat(${columnas}, 1fr)`, gridTemplateRows: `repeat(${filas}, 1fr)` });
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  const fondo = color ?? (getComputedStyle(el.parentElement || document.body).backgroundColor || '#fff');
  const n = filas * columnas;
  // retraso relativo (0..1) de cada celda según el orden
  const azar = Array.from({ length: n }, (_, i) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1);
  const celdas = [];
  for (let f = 0; f < filas; f++) for (let c = 0; c < columnas; c++) {
    const d = document.createElement('div');
    d.style.background = fondo;
    d.style.marginRight = d.style.marginBottom = '-1px'; // sin rendijas entre celdas
    let r;
    if (orden === 'escalera') r = (f + c) / Math.max(1, filas + columnas - 2);
    else if (orden === 'centro') r = Math.hypot(f - (filas - 1) / 2, c - (columnas - 1) / 2) / Math.hypot((filas - 1) / 2, (columnas - 1) / 2);
    else if (orden === 'filas') r = f / Math.max(1, filas - 1);
    else r = azar[f * columnas + c];
    celdas.push({ d, r });
    capa.appendChild(d);
  }
  el.appendChild(capa);
  const progreso = (p) => {
    for (const { d, r } of celdas) {
      const k = suave(lim((p - r * (1 - solape)) / solape)); // cada celda tarda "solape" del total
      // persiana: la celda se recoge hacia arriba; escala: encoge hacia su centro
      d.style.clipPath = forma === 'escala' ? `inset(${k * 50}% ${k * 50}% ${k * 50}% ${k * 50}%)` : `inset(0 0 ${k * 100}% 0)`;
    }
    capa.style.visibility = p >= 1 ? 'hidden' : '';
  };
  if (reducido()) { progreso(1); return { progreso() {}, reproducir: async () => {}, destruir() { capa.remove(); } }; }
  progreso(0);
  return { progreso, reproducir: reproductor(progreso), destruir() { capa.remove(); } };
}

// ---------- cortina: un panel entra, cubre (alCubrir: cambia la escena) y sale por el otro lado ----------
export function crearCortina(el, { direccion = 'arriba', color = '#f4efe6', alCubrir = null, alDescubrir = null } = {}) {
  const panel = document.createElement('div');
  panel.setAttribute('aria-hidden', 'true');
  Object.assign(panel.style, { position: 'absolute', inset: '0', background: color, zIndex: '20', pointerEvents: 'none', willChange: 'clip-path' });
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.appendChild(panel);
  // clip-path por lado: entra desde un borde y sale por el opuesto
  const lados = { arriba: ['bottom', 'top'], abajo: ['top', 'bottom'], izquierda: ['right', 'left'], derecha: ['left', 'right'] }[direccion] || ['bottom', 'top'];
  const inset = (lado, v) => { const o = { top: 0, right: 0, bottom: 0, left: 0 }; o[lado] = v; return `inset(${o.top}% ${o.right}% ${o.bottom}% ${o.left}%)`; };
  let cubierto = false;
  const sinPanel = reducido(); // con reduced-motion: cambia la escena a mitad, sin enseñar el panel
  const progreso = (p) => {
    if (sinPanel) panel.style.visibility = 'hidden';
    else if (p < 0.5) panel.style.clipPath = inset(lados[0], (1 - facil(p * 2)) * 100);       // entra
    else panel.style.clipPath = inset(lados[1], facil((p - 0.5) * 2) * 100);             // sale
    if (!sinPanel) panel.style.visibility = p <= 0 || p >= 1 ? 'hidden' : '';
    const ahora = p >= 0.5;
    if (ahora !== cubierto) { cubierto = ahora; (ahora ? alCubrir : alDescubrir)?.(); }
  };
  progreso(0);
  return { progreso, reproducir: reproductor(progreso), destruir() { panel.remove(); } };
}

// ---------- zoom a un punto de una imagen grande (el contenido escala con origen en el objetivo) ----------
// objetivo: { x, y, ancho, alto } en fracciones (0..1) del elemento, o un elemento hijo. Al final, el objetivo llena el marco
// (con margen) y, si hay relevo (un elemento con la imagen de detalle), este entra con un fundido.
export function crearZoomA(el, { objetivo, margen = 0.08, relevo = null, inicioRelevo = 0.85, marco = null } = {}) {
  const contenido = el.firstElementChild;
  if (!contenido) throw new Error('crearZoomA: el elemento necesita un hijo (la imagen o el bloque que escala)');
  const caja = marco ?? el;
  contenido.style.transformOrigin = '0 0';
  contenido.style.willChange = 'transform';
  if (relevo) { relevo.style.opacity = '0'; relevo.style.pointerEvents = 'none'; }
  const medirObjetivo = () => {
    const rc = contenido.getBoundingClientRect(), base = { w: contenido.offsetWidth, h: contenido.offsetHeight };
    if (objetivo instanceof Element) {
      const ro = objetivo.getBoundingClientRect(), s = rc.width / base.w || 1;
      return { x: (ro.left - rc.left) / s, y: (ro.top - rc.top) / s, w: ro.width / s, h: ro.height / s };
    }
    return { x: objetivo.x * base.w, y: objetivo.y * base.h, w: objetivo.ancho * base.w, h: objetivo.alto * base.h };
  };
  // se mide al empezar y al cambiar el tamaño (nunca en cada fotograma: forzaría el layout)
  let o = null, W = 0, H = 0, ultimo = 0;
  const medir = () => {
    contenido.style.transform = 'none';
    o = medirObjetivo(); W = caja.clientWidth; H = caja.clientHeight;
  };
  const progreso = (pEntrada) => {
    ultimo = pEntrada;
    const p = reducido() ? (pEntrada < 0.5 ? 0 : 1) : pEntrada; // reduced-motion: corte, sin animación
    const sFin = Math.min(W / (o.w * (1 + 2 * margen)), H / (o.h * (1 + 2 * margen)));
    const k = suave(lim(p));
    // escala lineal en el logaritmo: el acercamiento se percibe a velocidad constante
    const s = Math.exp(Math.log(sFin) * k);
    const kt = sFin === 1 ? k : (s - 1) / (sFin - 1);
    // traslación: el centro del objetivo va de donde está al centro del marco
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    const tx = (W / 2 - cx * sFin) * kt, ty = (H / 2 - cy * sFin) * kt;
    contenido.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
    if (relevo) relevo.style.opacity = String(suave(lim((p - inicioRelevo) / (1 - inicioRelevo))));
  };
  medir(); progreso(0);
  const alRedimensionar = () => { medir(); progreso(ultimo); };
  const prog = progreso;
  addEventListener('resize', alRedimensionar);
  return {
    progreso: prog, reproducir: reproductor(prog), objetivo: () => o,
    destruir() { removeEventListener('resize', alRedimensionar); contenido.style.transform = ''; contenido.style.willChange = ''; if (relevo) relevo.style.opacity = ''; },
  };
}

// ---------- líneas con máscara: el texto sube línea a línea ----------
// Para titulares de texto plano (se pierde el marcado interior: <em>, enlaces). Con marcado, usa SplitText de GSAP.
export function crearLineas(el, { retardo = 0.12 } = {}) {
  const original = el.innerHTML;
  const texto = el.textContent.trim().replace(/\s+/g, ' ');
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const oculto = `<span style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap">${esc(texto)}</span>`;
  let interiores = [], ultimo = reducido() ? 1 : 0, ancho = 0;
  const partir = () => {
    ancho = el.clientWidth;
    // 1) palabras sueltas para medir en qué línea cae cada una
    el.innerHTML = texto.split(' ').map((w) => `<span class="rv-p" style="display:inline-block">${esc(w)}</span>`).join(' ');
    const lineas = [];
    let top = null;
    for (const p of el.querySelectorAll('.rv-p')) {
      if (top === null || Math.abs(p.offsetTop - top) > 2) { lineas.push([]); top = p.offsetTop; }
      lineas[lineas.length - 1].push(esc(p.textContent));
    }
    // 2) cada línea en una máscara (overflow: clip) con su interior que sube; el texto para lectores de pantalla, aparte
    el.innerHTML = oculto + lineas.map((l) => `<span class="rv-linea" aria-hidden="true" style="display:block;overflow:clip;padding-bottom:.1em;margin-bottom:-.1em"><span class="rv-in" style="display:block;will-change:transform">${l.join(' ')}</span></span>`).join('');
    interiores = [...el.querySelectorAll('.rv-in')];
  };
  const progreso = (pEntrada) => {
    const p = reducido() ? 1 : pEntrada; // reduced-motion: el texto siempre visible
    ultimo = p;
    const n = interiores.length;
    const paso = n > 1 ? Math.min(retardo, 0.6 / (n - 1)) : 0;
    const dur = 1 - paso * (n - 1);
    interiores.forEach((s, i) => {
      const k = facil(lim((p - i * paso) / dur));
      s.style.transform = `translate3d(0, ${(1 - k) * 110}%, 0)`;
    });
  };
  partir(); progreso(ultimo);
  const ro = new ResizeObserver(() => { if (Math.abs(el.clientWidth - ancho) > 1) { partir(); progreso(ultimo); } });
  ro.observe(el);
  return {
    progreso, reproducir: reproductor(progreso), lineas: () => interiores.length,
    destruir() { ro.disconnect(); el.innerHTML = original; },
  };
}

// Atajo: lanza un revelado por tiempo cuando el elemento entra en pantalla (sin GSAP).
export function alEntrar(el, revelado, { umbral = 0.35, duracion = 1100 } = {}) {
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { io.disconnect(); revelado.reproducir({ duracion }); }
  }, { threshold: umbral });
  io.observe(el);
  return () => io.disconnect();
}
