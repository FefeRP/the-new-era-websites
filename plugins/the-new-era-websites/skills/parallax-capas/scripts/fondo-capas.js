// fondo-capas.js: fondos generados por capas que cambian entre escenas, capa a capa, sin dependencias.
// Un fondo se parte en planos (cielo, montañas, suelo; o un shader detrás y nubes en el suelo del hero) y cada plano
// tiene una versión por escena (producto, modelo, hora del día, capítulo). Al cambiar de escena, cada capa hace su
// relevo con su propio retraso y sentido, así que varias animaciones salen solo de fotos. Una capa sin versión para la
// escena pedida se queda como está (útil para un shader o un degradado que no cambia).
//
//   <div class="fondo" data-fondo-capas>
//     <canvas class="capa" data-capa="shader"></canvas>                      <!-- fija: no tiene data-escena -->
//     <div class="capa" data-capa="cielo" data-profundidad="-0.8">
//       <img data-escena="dia" src="cielo-dia.webp" alt=""> <img data-escena="noche" src="cielo-noche.webp" alt="">
//     </div>
//     <div class="capa" data-capa="montanas" data-profundidad="-0.3"> …un <img data-escena> por escena… </div>
//     <div class="capa" data-capa="suelo" data-profundidad="0.4"> …nubes o suelo con alfa por escena… </div>
//   </div>
//   import { crearFondoCapas } from './fondo-capas.js';
//   const fondo = crearFondoCapas(document.querySelector('[data-fondo-capas]'), { inicial: 'dia' });
//   fondo.irA('noche');                       // desde un botón, un slider de producto o ScrollTrigger
//   crearFondoCapas(raiz, { pasos: document.querySelectorAll('[data-paso-escena]') });  // o que lo lleve el scroll
//
// Para la profundidad con scroll y puntero, combínalo con crearParallax (capas-parallax.js) sobre la misma raíz: el
// parallax mueve la capa (data-profundidad) y este motor mueve lo que hay dentro, así no se pisan los transform.
// Solo anima opacity y transform (compone en GPU). Con prefers-reduced-motion el relevo es un fundido corto sin
// desplazamiento. Devuelve destruir().

export function crearFondoCapas(raiz, {
  inicial = null,          // escena del principio (por defecto, la primera que aparezca)
  duracion = 1100,         // ms del relevo de cada capa
  escalonado = 160,        // ms entre una capa y la siguiente
  orden = 'detras-primero',// 'detras-primero' (el cielo cambia antes que el suelo) | 'delante-primero'
  desplazamiento = 6,      // % del alto que viaja la versión que entra (positivo: sube desde abajo)
  escalaEntrada = 1.06,    // la versión que entra llega un poco grande y se asienta (0 o 1 = sin zoom)
  desenfoque = 0,          // px de blur en el relevo (caro en móviles grandes: déjalo en 0 salvo capas pequeñas)
  sentidoPorCapa = null,   // { suelo: -1 } invierte el viaje de una capa (las nubes bajan mientras el cielo sube)
  pasos = null,            // NodeList de elementos con data-paso-escena: cambian la escena al entrar en pantalla
  curva = 'cubic-bezier(.22,.8,.2,1)',
  alCambiar = null,        // (escena) => {} tras pedir el cambio
} = {}) {
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const capas = [...raiz.querySelectorAll('[data-capa]')].map((el) => {
    const versiones = new Map();
    for (const v of el.querySelectorAll(':scope > [data-escena]')) {
      Object.assign(v.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover',
        opacity: '0', willChange: 'opacity, transform', pointerEvents: 'none' });
      v.setAttribute('aria-hidden', 'true');
      versiones.set(v.dataset.escena, v);
    }
    return { el, nombre: el.dataset.capa, versiones, visible: null, animaciones: [] };
  });
  if (orden === 'delante-primero') capas.reverse();

  const escenas = [...new Set(capas.flatMap((c) => [...c.versiones.keys()]))];
  let actual = null;

  function relevo(capa, escena, retraso, inmediato) {
    const entra = capa.versiones.get(escena);
    if (!entra || entra === capa.visible) return;           // capa fija o ya en esa escena
    const sale = capa.visible;
    capa.animaciones.forEach((a) => a.finish());            // interrumpible: lo que estaba a medias se cierra
    capa.animaciones = [];
    capa.visible = entra;
    entra.style.zIndex = '1';
    if (sale) sale.style.zIndex = '0';
    if (inmediato) {
      entra.style.opacity = '1';
      if (sale) sale.style.opacity = '0';
      return;
    }
    const s = (sentidoPorCapa && sentidoPorCapa[capa.nombre]) || 1;
    const d = reducido ? 0 : desplazamiento * s;
    const e = reducido || !escalaEntrada ? 1 : escalaEntrada;
    const b = reducido ? 0 : desenfoque;
    const t = reducido ? Math.min(duracion, 300) : duracion;
    const opciones = { duration: t, delay: reducido ? 0 : retraso, easing: curva, fill: 'forwards' };
    capa.animaciones.push(entra.animate([
      { opacity: 0, transform: `translate3d(0, ${d}%, 0) scale(${e})`, filter: `blur(${b}px)` },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)', filter: 'blur(0px)' },
    ], opciones));
    if (sale) {
      capa.animaciones.push(sale.animate([
        { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)', filter: 'blur(0px)' },
        { opacity: 0, transform: `translate3d(0, ${-d * 0.6}%, 0) scale(1)`, filter: `blur(${b}px)` },
      ], { ...opciones, duration: t * 0.9 }));
    }
    // Al acabar, el estado final pasa al style y la animación se suelta (no se acumulan animaciones con fill).
    for (const a of capa.animaciones) {
      a.finished.then(() => { try { a.commitStyles(); } catch (_) { /* elemento fuera del DOM */ } a.cancel(); }, () => {});
    }
  }

  function irA(escena, { inmediato = false } = {}) {
    if (escena === actual || !escenas.includes(escena)) return;
    actual = escena;
    raiz.dataset.escenaActual = escena;
    capas.forEach((c, i) => relevo(c, escena, i * escalonado, inmediato));
    if (alCambiar) alCambiar(escena);
  }

  irA(inicial ?? escenas[0], { inmediato: true });

  let observador = null;
  if (pasos && pasos.length) {
    observador = new IntersectionObserver((entradas) => {
      const vista = entradas.filter((x) => x.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (vista) irA(vista.target.dataset.pasoEscena);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.01] });
    pasos.forEach((p) => observador.observe(p));
  }

  return {
    irA,
    get actual() { return actual; },
    escenas,
    destruir() {
      observador?.disconnect();
      capas.forEach((c) => { c.animaciones.forEach((a) => a.cancel()); c.animaciones = []; });
    },
  };
}
