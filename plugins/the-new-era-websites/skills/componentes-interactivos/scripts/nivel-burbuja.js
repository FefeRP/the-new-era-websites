// nivel-burbuja.js · NEW ERA original
// Indicador de progreso de scroll con forma de nivel de burbuja: un tubo de cristal con líquido y una burbuja que
// marca dónde estás. La burbuja persigue al scroll con un muelle, se estira en el sentido del movimiento conservando
// volumen (más rápido, más alargada), se aplasta contra los tapones al llegar a los extremos y se puede arrastrar o
// mover con el teclado para desplazarte. Sin dependencias; solo transform. Usa muelle.js.
//
//   <div class="mi-nivel"></div>
//   import { crearNivelBurbuja } from './nivel-burbuja.js';
//   const nivel = crearNivelBurbuja(document.querySelector('.mi-nivel'), { orientacion: 'vertical' });
//   …nivel.destruir();
//
// Estilo por variables CSS en el contenedor: --nivel-largo (240px), --nivel-grosor (26px), --nivel-liquido
// (color del líquido), --nivel-cristal, --nivel-burbuja. El tubo lleva las dos marcas del centro, como un nivel real.
// Accesible: role="slider" con aria-valuenow en %; flechas, Re Pág/Av Pág, Inicio y Fin desplazan la página.
// Con prefers-reduced-motion la burbuja va al sitio sin muelle ni estiramiento.
import { crearMuelle } from './muelle.js';

// las variables van en :where() (especificidad 0): esta hoja se mete al final del <head> y la página tiene que poder cambiarlas
const CSS_BASE = `
:where(.nivel-burbuja){--nivel-largo:240px;--nivel-grosor:26px;--nivel-liquido:rgb(196 236 120 / .55);
  --nivel-cristal:rgb(255 255 255 / .16);--nivel-burbuja:rgb(255 255 255 / .9);
  position:relative;display:inline-block;touch-action:none;-webkit-tap-highlight-color:transparent;cursor:grab}
.nivel-burbuja[data-orientacion=vertical]{width:var(--nivel-grosor);height:var(--nivel-largo)}
.nivel-burbuja[data-orientacion=horizontal]{width:var(--nivel-largo);height:var(--nivel-grosor)}
.nivel-burbuja:focus-visible{outline:2px solid currentColor;outline-offset:4px;border-radius:calc(var(--nivel-grosor) / 2)}
.nivel-burbuja__tubo{position:absolute;inset:0;border-radius:calc(var(--nivel-grosor) / 2);overflow:hidden;isolation:isolate;
  background:linear-gradient(var(--_eje),rgb(255 255 255 / .28),transparent 45%,rgb(0 0 0 / .08)),var(--nivel-liquido);
  -webkit-backdrop-filter:blur(6px) saturate(1.3);backdrop-filter:blur(6px) saturate(1.3);
  box-shadow:inset 0 0 0 1px rgb(255 255 255 / .35),inset var(--_luz) rgb(255 255 255 / .75),
    inset var(--_sombra) rgb(0 0 0 / .14),0 6px 18px -8px rgb(0 0 0 / .35)}
.nivel-burbuja[data-orientacion=vertical] .nivel-burbuja__tubo{--_eje:90deg;--_luz:2px 0 2px;--_sombra:-3px 0 6px -2px}
.nivel-burbuja[data-orientacion=horizontal] .nivel-burbuja__tubo{--_eje:180deg;--_luz:0 2px 2px;--_sombra:0 -3px 6px -2px}
.nivel-burbuja__marca{position:absolute;background:rgb(0 0 0 / .32);pointer-events:none;z-index:2}
.nivel-burbuja[data-orientacion=vertical] .nivel-burbuja__marca{left:0;right:0;height:1.5px}
.nivel-burbuja[data-orientacion=horizontal] .nivel-burbuja__marca{top:0;bottom:0;width:1.5px}
.nivel-burbuja__burbuja{position:absolute;z-index:1;border-radius:50%;pointer-events:none;will-change:transform;
  background:radial-gradient(60% 55% at 35% 30%,#fff,var(--nivel-burbuja) 40%,rgb(255 255 255 / .35) 75%,rgb(255 255 255 / .1));
  box-shadow:inset 0 0 0 1px rgb(255 255 255 / .8),inset 0 -2px 4px rgb(0 0 0 / .12),0 0 0 1px rgb(0 0 0 / .06)}
.nivel-burbuja[data-arrastrando]{cursor:grabbing}
@media (prefers-reduced-transparency:reduce),(prefers-contrast:more){.nivel-burbuja__tubo{-webkit-backdrop-filter:none;backdrop-filter:none;background:var(--nivel-liquido);box-shadow:inset 0 0 0 1px currentColor}}
@media (forced-colors:active){.nivel-burbuja__tubo{border:1px solid CanvasText;box-shadow:none}.nivel-burbuja__burbuja{background:Highlight;box-shadow:none}}
`;

export function crearNivelBurbuja(contenedor, {
  orientacion = 'vertical',
  desplazable = document.scrollingElement,  // lo que se mide y se mueve
  etiqueta = 'Posición en la página',
  muelle = { k: 170, c: 17, m: 1 },         // ζ≈0,65: la burbuja llega con un pellizco, como en un nivel real
  estiramientoMax = 0.55,                    // alargamiento máximo con velocidad (0 = esfera rígida)
} = {}) {
  if (!document.getElementById('nivel-burbuja-css')) {
    const s = Object.assign(document.createElement('style'), { id: 'nivel-burbuja-css', textContent: CSS_BASE });
    document.head.append(s);
  }
  const reducido = matchMedia('(prefers-reduced-motion: reduce)');
  const vertical = orientacion === 'vertical';
  contenedor.classList.add('nivel-burbuja');
  contenedor.dataset.orientacion = orientacion;
  Object.assign(contenedor, { tabIndex: 0 });
  contenedor.setAttribute('role', 'slider');
  contenedor.setAttribute('aria-label', etiqueta);
  contenedor.setAttribute('aria-orientation', orientacion);
  contenedor.setAttribute('aria-valuemin', '0');
  contenedor.setAttribute('aria-valuemax', '100');
  contenedor.innerHTML = '<span class="nivel-burbuja__tubo"></span><span class="nivel-burbuja__marca"></span>' +
    '<span class="nivel-burbuja__marca"></span><span class="nivel-burbuja__burbuja"></span>';
  const [m1, m2] = contenedor.querySelectorAll('.nivel-burbuja__marca');
  const burbuja = contenedor.querySelector('.nivel-burbuja__burbuja');

  let largo = 0, grosor = 0, diam = 0, recorrido = 0, tope = 0, golpe = 0;
  function medir() {
    largo = vertical ? contenedor.clientHeight : contenedor.clientWidth;
    grosor = vertical ? contenedor.clientWidth : contenedor.clientHeight;
    diam = Math.round(grosor * 1.5);                 // la burbuja es más larga que el tubo es ancho
    const alto = Math.round(grosor * 0.62);
    recorrido = Math.max(0, largo - diam - 6);
    Object.assign(burbuja.style, vertical
      ? { width: `${alto}px`, height: `${diam}px`, left: `${(grosor - alto) / 2}px`, top: '3px' }
      : { width: `${diam}px`, height: `${alto}px`, top: `${(grosor - alto) / 2}px`, left: '3px' });
    const centro = largo / 2, sep = diam / 2 + 3;     // las marcas abrazan la burbuja cuando está en el centro
    for (const [m, p] of [[m1, centro - sep], [m2, centro + sep]]) m.style[vertical ? 'top' : 'left'] = `${p}px`;
  }

  function progreso() {
    const max = desplazable.scrollHeight - desplazable.clientHeight;
    return max > 0 ? Math.min(1, Math.max(0, desplazable.scrollTop / max)) : 0;
  }

  let pos = 0, estira = 1;
  function pintar() {
    // volumen constante: se alarga en el eje y adelgaza en el otro
    const a = estira, b = 1 / Math.sqrt(estira);
    const t = vertical ? `translateY(${pos}px) scale(${b}, ${a})` : `translateX(${pos}px) scale(${a}, ${b})`;
    burbuja.style.transform = t;
  }
  const muelleEstira = crearMuelle({ k: 260, c: 12, m: 1, valor: 1, reposo: 0.001, alPintar: (v) => { estira = v; pintar(); } });
  const muellePos = crearMuelle({ ...muelle, reposo: 0.05, alPintar: (x, v) => {
    pos = x;
    if (!reducido.matches) {
      const choque = (x <= 0.5 && v < -40) || (x >= recorrido - 0.5 && v > 40);
      if (choque && !golpe) { golpe = 1; muelleEstira.empujar(-Math.min(Math.abs(v), 900) * 0.004); }   // se aplasta en el tapón
      if (!choque) golpe = 0;
      muelleEstira.ir(1 + Math.min(estiramientoMax, Math.abs(v) / (recorrido * 4 || 1)));
    }
    pintar();
  }, alParar: () => muelleEstira.ir(1) });

  function alScroll() {
    const p = progreso();
    contenedor.setAttribute('aria-valuenow', String(Math.round(p * 100)));
    if (arrastre) return;
    if (reducido.matches) { muellePos.fijar(p * recorrido); muelleEstira.fijar(1); } else muellePos.ir(p * recorrido);
  }

  // Arrastrar la burbuja (o pulsar el tubo) desplaza la página
  let arrastre = null;
  const desdePuntero = (e) => {
    const r = contenedor.getBoundingClientRect();
    const local = (vertical ? e.clientY - r.top : e.clientX - r.left) - 3 - diam / 2;
    return Math.min(recorrido, Math.max(0, local));
  };
  function irA(x, suave) {
    const max = desplazable.scrollHeight - desplazable.clientHeight;
    desplazable.scrollTo({ top: (x / (recorrido || 1)) * max, behavior: suave && !reducido.matches ? 'smooth' : 'instant' });
  }
  const ctl = new AbortController(), { signal } = ctl;
  // arrastrando, la burbuja sigue al dedo con muelle; con reduced-motion va pegada, sin rebote
  const mover = (x) => (reducido.matches ? muellePos.fijar(x) : muellePos.ir(x));
  contenedor.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    contenedor.setPointerCapture(e.pointerId);
    contenedor.dataset.arrastrando = '';
    const x = desdePuntero(e);
    arrastre = { ultimo: x, t: e.timeStamp };
    mover(x); irA(x, false);
  }, { signal });
  contenedor.addEventListener('pointermove', (e) => {
    if (!arrastre) return;
    const x = desdePuntero(e);
    arrastre.ultimo = x;
    mover(x); irA(x, false);
  }, { signal });
  const soltar = () => { if (!arrastre) return; arrastre = null; delete contenedor.dataset.arrastrando; alScroll(); };
  contenedor.addEventListener('pointerup', soltar, { signal });
  contenedor.addEventListener('pointercancel', soltar, { signal });
  contenedor.addEventListener('keydown', (e) => {
    const vista = desplazable.clientHeight, max = desplazable.scrollHeight - vista;
    const pasos = { ArrowDown: 80, ArrowRight: 80, ArrowUp: -80, ArrowLeft: -80, PageDown: vista * 0.9, PageUp: -vista * 0.9 };
    let destino = null;
    if (e.key in pasos) destino = desplazable.scrollTop + pasos[e.key];
    if (e.key === 'Home') destino = 0;
    if (e.key === 'End') destino = max;
    if (destino === null) return;
    e.preventDefault();
    desplazable.scrollTo({ top: destino, behavior: reducido.matches ? 'instant' : 'smooth' });
  }, { signal });

  const fuente = desplazable === document.scrollingElement ? window : desplazable;
  fuente.addEventListener('scroll', alScroll, { passive: true, signal });
  const ro = new ResizeObserver(() => { medir(); muellePos.fijar(progreso() * recorrido); muelleEstira.fijar(1); alScroll(); });
  ro.observe(contenedor);
  medir(); muellePos.fijar(progreso() * recorrido); alScroll();

  return {
    destruir() {
      ctl.abort(); ro.disconnect();
      muellePos.destruir(); muelleEstira.destruir(); contenedor.replaceChildren();
      contenedor.classList.remove('nivel-burbuja'); contenedor.removeAttribute('tabindex'); delete contenedor.dataset.orientacion;
      delete contenedor.dataset.arrastrando;
      for (const a of ['role', 'aria-label', 'aria-orientation', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow']) contenedor.removeAttribute(a);
    },
    get estado() { return { pos, estira, recorrido, progreso: progreso() }; },
  };
}
