// resenas-3d.js: muro de reseñas en columnas verticales inclinadas en 3D, en movimiento continuo. Sin dependencias.
//
//   <section class="opiniones">
//     <ul class="opiniones__lista">            <!-- la lista real, con las reseñas reales: es lo que leen buscadores y lectores -->
//       <li> <blockquote>…</blockquote> <footer>Nombre</footer> </li>
//       …
//     </ul>
//   </section>
//
//   import { crearResenas3D } from './resenas-3d.js';
//   const r = crearResenas3D(document.querySelector('.opiniones__lista'), { columnas: { 0: 1, 600: 2, 1100: 4 } });
//   if (!r.activo) { /* reduced-motion: queda la lista tal cual, maquetada como rejilla */ }
//   // al desmontar: r.destruir();
//
// - Mejora progresiva: el HTML lleva la lista real. El motor crea al lado una escena decorativa (`aria-hidden`, `inert`) con
//   las fichas repartidas en columnas y deja la lista real visible solo para lectores de pantalla. Si el motor no arranca
//   (sin JS, reduced-motion), se ve la lista.
// - Cada columna repite sus fichas tres veces y se desplaza una repetición exacta: el bucle no tiene salto. Las columnas
//   alternan el sentido y llevan duraciones distintas para que no se sincronicen.
// - Nunca se para con el hover (un muro que se frena al pasar el ratón parece roto); solo fuera de pantalla y con la pestaña
//   oculta.
// - La inclinación cambia con el ancho: suave en móvil, marcada en escritorio. Los bordes se funden con el color de la
//   sección mediante una máscara.
// - Solo reseñas reales. Sin foto: iniciales. Nunca un nombre con la cara de otra persona.

const OCULTO = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0';

export function crearResenas3D(lista, {
  columnas = { 0: 1, 600: 2, 1100: 4 },   // ancho mínimo del contenedor → nº de columnas
  duraciones = [52, 60, 56, 48],          // s por vuelta de cada columna (se repiten si hay más columnas)
  hueco = 20,                             // px entre fichas y entre columnas
  alto = 'clamp(420px, 70vh, 720px)',     // alto de la escena (CSS)
  perspectiva = { 0: 900, 600: 1000, 1100: 1100 },
  // inclinación del plano según el ancho del contenedor
  giro = {
    0: 'rotateX(12deg) rotateY(-3deg) rotateZ(4deg)',
    600: 'translateZ(-60px) rotateX(16deg) rotateY(-7deg) rotateZ(12deg)',
    1100: 'translateX(-40px) translateZ(-80px) rotateX(20deg) rotateY(-10deg) rotateZ(18deg)',
  },
  fundido = 14,                           // % de cada borde que se desvanece
} = {}) {
  const fichas = Array.from(lista.children);
  const reducido = matchMedia('(prefers-reduced-motion: reduce)');
  if (!fichas.length || reducido.matches) return { activo: false, destruir() {} };

  const seccion = lista.parentElement;
  const estiloLista = lista.getAttribute('style');
  const porAncho = (tabla, ancho) => { let v; for (const k of Object.keys(tabla).map(Number).sort((a, b) => a - b)) if (ancho >= k) v = tabla[k]; return v; };

  const escena = document.createElement('div');
  escena.setAttribute('aria-hidden', 'true');
  escena.inert = true;
  escena.dataset.resenasEscena = '';
  Object.assign(escena.style, { position: 'relative', height: alto, overflow: 'clip', pointerEvents: 'none',
    maskImage: `linear-gradient(to bottom, transparent, #000 ${fundido}%, #000 ${100 - fundido}%, transparent), linear-gradient(to right, transparent, #000 ${fundido}%, #000 ${100 - fundido}%, transparent)`,
    maskComposite: 'intersect' });
  escena.style.setProperty('-webkit-mask-image', escena.style.maskImage);
  escena.style.setProperty('-webkit-mask-composite', 'source-in');
  const plano = document.createElement('div');
  Object.assign(plano.style, { position: 'absolute', left: '50%', top: '50%', width: '100%', height: '190%', display: 'grid', gap: hueco + 'px', willChange: 'transform' });
  escena.appendChild(plano);
  lista.insertAdjacentElement('afterend', escena);
  lista.setAttribute('style', (estiloLista ? estiloLista + ';' : '') + OCULTO);

  let animaciones = [], nCols = 0, visible = true;

  const montar = () => {
    const ancho = seccion.clientWidth;
    const n = Math.max(1, porAncho(columnas, ancho) || 1);
    escena.style.perspective = (porAncho(perspectiva, ancho) || 1000) + 'px';
    plano.style.transform = `translate(-50%, -50%) ${porAncho(giro, ancho) || ''}`;
    if (n === nCols) return;
    nCols = n;
    animaciones.forEach((a) => a.cancel()); animaciones = [];
    plano.replaceChildren();
    plano.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
    for (let c = 0; c < n; c++) {
      const col = document.createElement('div');
      Object.assign(col.style, { display: 'flex', flexDirection: 'column', gap: hueco + 'px', willChange: 'transform' });
      // cada columna empieza por una ficha distinta (repartidas a lo largo de la lista), para que no queden filas iguales
      const salto = Math.max(1, Math.round((c * fichas.length) / n));
      const orden = fichas.map((_, i) => fichas[(i + c * salto) % fichas.length]);
      const hacerGrupo = () => {
        // los clones son el mismo elemento que el original (li dentro de ul), para que el CSS del autor les llegue igual
        const grupo = document.createElement(lista.tagName === 'OL' || lista.tagName === 'UL' ? 'ul' : 'div');
        grupo.setAttribute('role', 'presentation');
        Object.assign(grupo.style, { display: 'flex', flexDirection: 'column', gap: hueco + 'px', listStyle: 'none', margin: '0', padding: '0' });
        for (const f of orden) {
          const clon = f.cloneNode(true);
          clon.removeAttribute('id');
          clon.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
          grupo.appendChild(clon);
        }
        return grupo;
      };
      plano.appendChild(col);
      const primero = col.appendChild(hacerGrupo());
      // copias necesarias para que la columna tape siempre el plano: con pocas reseñas, tres no bastan y se vería el hueco
      const altoGrupo = primero.offsetHeight + hueco;
      const copias = Math.max(3, Math.min(12, Math.ceil(plano.offsetHeight / Math.max(1, altoGrupo)) + 2));
      for (let copia = 1; copia < copias; copia++) col.appendChild(hacerGrupo());
      const baja = c % 2 === 1;
      // se desplaza exactamente una repetición (alto del grupo + hueco): al volver al inicio no hay salto
      const anim = col.animate([{ transform: 'translateY(0)' }, { transform: `translateY(calc(${-100 / copias}% - ${hueco / copias}px))` }],
        { duration: duraciones[c % duraciones.length] * 1000, iterations: Infinity, easing: 'linear', direction: baja ? 'reverse' : 'normal' });
      animaciones.push(anim);
    }
    pausar();
  };

  const pausar = () => { const parar = !visible || document.hidden; for (const a of animaciones) (parar ? a.pause() : a.play()); };
  const tamano = new ResizeObserver(montar);
  tamano.observe(seccion);
  const vista = new IntersectionObserver(([e]) => { visible = e.isIntersecting; pausar(); }, { rootMargin: '80px' });
  vista.observe(escena);
  document.addEventListener('visibilitychange', pausar);
  // Si se activa reduced-motion con la página abierta, se desmonta y queda la lista. No se vuelve a montar sola al
  // desactivarlo: quien lo necesite, que llame de nuevo a crearResenas3D en el evento change.
  const alReducido = () => { if (reducido.matches) api.destruir(); };
  reducido.addEventListener('change', alReducido);
  montar();

  const api = {
    activo: true,
    escena,
    get columnas() { return nCols; },
    get enMarcha() { return animaciones.some((a) => a.playState === 'running'); },
    destruir() {
      if (!api.activo) return;
      api.activo = false;
      animaciones.forEach((a) => a.cancel()); animaciones = [];
      tamano.disconnect(); vista.disconnect();
      document.removeEventListener('visibilitychange', pausar);
      reducido.removeEventListener('change', alReducido);
      escena.remove();
      if (estiloLista === null) lista.removeAttribute('style'); else lista.setAttribute('style', estiloLista);
    },
  };
  return api;
}
