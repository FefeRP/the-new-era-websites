// carrusel-orbital.js: carrusel circular, en dos modos. Sin dependencias.
//   'orbita' (por defecto): los elementos giran en una órbita plana: el de delante, grande y nítido; los de los lados, más
//             pequeños y atenuados; los de detrás, ocultos. Cada uno se coloca con translate + scale (sin perspectiva):
//             el texto de dentro no se deforma.
//   'anillo': anillo 3D de verdad: las tarjetas miran hacia fuera de un cilindro y las laterales se ven en escorzo
//             (perspectiva en el contenedor, cada tarjeta con translate3d + rotateY; no hace falta `preserve-3d`).
// Se mueve con arrastre, teclado, botones, autoplay o ligado al scroll (`desplazar`).
//
//   <div class="orbita" aria-label="Proyectos">
//     <article> … </article>
//     <article> … </article>
//     …
//   </div>
//
//   import { crearCarruselOrbital } from './carrusel-orbital.js';
//   const c = crearCarruselOrbital(document.querySelector('.orbita'), { autoplay: 4000 });
//   // c.ir(2) · c.siguiente() · c.anterior() · c.indice · c.destruir()
//
//   // ligado al scroll (con ScrollTrigger u otro): el giro sigue al progreso y, al parar, encaja en la tarjeta más cercana
//   ScrollTrigger.create({ trigger: seccion, start: 'top 80%', end: 'bottom 20%',
//     onUpdate: (st) => c.desplazar(st.progress * (c.total - 1)) });
//
// - En modo 'anillo' la sombra de las tarjetas va en un ::after con degradado, nunca con box-shadow: Chrome recorta la
//   sombra de una cara 3D que sale a medias del contenedor. Cada tarjeta recibe la variable --velo (0 delante, 0.8 de
//   lado) para oscurecer las laterales con un ::after del color del fondo.
// - Arrastre con ratón o dedo (con inercia y encaje en el elemento más cercano), flechas del teclado y clic en un lateral
//   para traerlo delante. El scroll vertical de la página sigue funcionando sobre el carrusel (`touch-action: pan-y`).
// - Solo el elemento de delante es alcanzable con teclado y lector de pantalla; el resto queda `inert`.
// - El bucle de animación solo corre mientras algo se mueve. El autoplay se para fuera de pantalla, con la pestaña oculta,
//   con el puntero encima, con el foco dentro y con prefers-reduced-motion.
// - Con prefers-reduced-motion los cambios son inmediatos (sin giro).

export function crearCarruselOrbital(contenedor, {
  modo = 'orbita',         // 'orbita' (plano, con escala) o 'anillo' (3D, tarjetas en escorzo)
  separacion = 1.14,       // anillo: hueco entre tarjetas (1 = se tocan)
  reposo = 220,            // ms sin llamadas a desplazar() para encajar en la tarjeta más cercana
  elementos = null,        // selector o lista de nodos (por defecto, los hijos directos)
  radio = null,            // px del radio de la órbita (por defecto, según el ancho del contenedor y del elemento)
  elevacion = 0,           // px que suben los de detrás respecto al de delante (órbita inclinada); negativo = bajan
  escalaMinima = 0.55,     // escala del elemento del fondo
  opacidadMinima = 0,      // opacidad del elemento del fondo
  visibles = null,         // cuántos se ven a cada lado del central (por defecto, todos los de la mitad delantera)
  inicio = 0,
  autoplay = 0,            // ms entre avances (0 = sin autoplay)
  arrastre = true,
  suavizado = 0.12,        // 0-1: cuánto se acerca al destino en cada fotograma (a 60 fps)
  botonAnterior = null,    // nodo o selector
  botonSiguiente = null,
  alCambiar = null,        // (indice) => {}
} = {}) {
  const nodos = Array.from(typeof elementos === 'string' ? contenedor.querySelectorAll(elementos)
    : elementos || contenedor.children).filter((n) => !n.hasAttribute('data-orbita-control'));
  const n = nodos.length;
  if (!n) return { destruir() {}, ir() {}, siguiente() {}, anterior() {}, desplazar() {}, total: 0, indice: 0 };
  const paso = (Math.PI * 2) / n;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)');
  const resolver = (x) => (typeof x === 'string' ? document.querySelector(x) : x);
  const anteriorBtn = resolver(botonAnterior), siguienteBtn = resolver(botonSiguiente);

  const previo = { contenedor: contenedor.getAttribute('style'), nodos: nodos.map((e) => e.getAttribute('style')) };
  if (getComputedStyle(contenedor).position === 'static') contenedor.style.position = 'relative';
  Object.assign(contenedor.style, { display: 'grid', placeItems: 'center', touchAction: 'pan-y', userSelect: 'none' });
  contenedor.style.setProperty('-webkit-user-select', 'none');
  if (!contenedor.hasAttribute('role')) { contenedor.setAttribute('role', 'group'); contenedor.dataset.orbitaRol = ''; }
  contenedor.setAttribute('aria-roledescription', 'carrusel');
  if (!contenedor.hasAttribute('tabindex')) { contenedor.tabIndex = 0; contenedor.dataset.orbitaFoco = ''; }
  for (const e of nodos) Object.assign(e.style, { gridArea: '1 / 1', willChange: 'transform, opacity' });

  // giro actual (en pasos, puede ser fraccionario y pasar de n) y destino (entero al encajar)
  let giro = inicio, destino = inicio, indice = ((inicio % n) + n) % n;
  let R = 0, bucle = 0, visible = true, encima = false, focoDentro = false, temporizador = 0;

  const medir = () => {
    const anchoC = contenedor.clientWidth, anchoE = nodos[0].offsetWidth || anchoC / 3;
    if (modo === 'anillo') {
      // radio del polígono de n lados de ancho anchoE·separacion (con menos de 3 no hay anillo)
      R = radio ?? (anchoE * separacion) / (2 * Math.tan(Math.PI / Math.max(3, n)));
      contenedor.style.perspective = (R * 2.4).toFixed(0) + 'px';
    } else R = radio ?? Math.max(anchoE * 0.6, (anchoC - anchoE * escalaMinima) / 2);
  };

  const pintar = () => {
    for (let i = 0; i < n; i++) {
      // ángulo del elemento respecto al frente, en (-π, π]
      let a = ((i - giro) * paso) % (Math.PI * 2);
      if (a > Math.PI) a -= Math.PI * 2; else if (a <= -Math.PI) a += Math.PI * 2;
      const prof = (1 - Math.cos(a)) / 2;                 // 0 delante, 1 detrás
      if (modo === 'anillo') {
        // cara de un cilindro de radio R visto desde fuera: se aleja al girar y se apaga entre 68° y 108°
        const grados = (Math.abs(a) * 180) / Math.PI, t = Math.max(0, Math.min(1, (grados - 68) / 40));
        let op = 1 - t * t * (3 - 2 * t);
        if (visibles !== null) op *= Math.max(0, Math.min(1, visibles + 0.5 - Math.abs(a) / paso));
        const el = nodos[i];
        el.style.transform = `translate3d(${(Math.sin(a) * R).toFixed(2)}px, ${(-prof * elevacion).toFixed(2)}px, ${((Math.cos(a) - 1) * R).toFixed(2)}px) rotateY(${a.toFixed(4)}rad)`;
        el.style.opacity = op.toFixed(3);
        el.style.zIndex = String(Math.round((1 - prof) * 100));
        el.style.visibility = op < 0.02 ? 'hidden' : 'visible';
        el.style.setProperty('--velo', (Math.max(0, Math.min(1, (grados - 10) / 80)) * 0.8).toFixed(3));
        continue;
      }
      const x = Math.sin(a) * R, y = -prof * elevacion;
      const escala = 1 - prof * (1 - escalaMinima);
      // opacos hasta pasar el lateral y apagados antes de quedar detrás: así los del fondo no se transparentan por los laterales
      const apagado = Math.max(0, Math.min(1, (prof - 0.3) / 0.45));
      let opacidad = 1 - apagado * apagado * (3 - 2 * apagado) * (1 - opacidadMinima);
      if (visibles !== null) {
        const dist = Math.abs(a) / paso;                  // a cuántos puestos del centro
        opacidad *= Math.max(0, Math.min(1, visibles + 0.5 - dist));
      }
      const e = nodos[i];
      e.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${escala.toFixed(4)})`;
      e.style.opacity = opacidad.toFixed(3);
      e.style.zIndex = String(Math.round((1 - prof) * 100));
      e.style.visibility = opacidad < 0.02 ? 'hidden' : 'visible';
    }
  };

  const marcar = () => {
    const nuevo = ((Math.round(destino) % n) + n) % n;
    nodos.forEach((e, i) => {
      const actual = i === nuevo;
      e.inert = !actual;
      e.setAttribute('aria-hidden', String(!actual));
      if (actual) e.setAttribute('aria-current', 'true'); else e.removeAttribute('aria-current');
      e.style.cursor = actual ? '' : 'pointer';
    });
    if (nuevo !== indice) { indice = nuevo; alCambiar?.(indice); }
  };

  let tAnterior = 0;
  const fotograma = (t) => {
    bucle = 0;
    const falta = destino - giro;
    if (Math.abs(falta) < 0.001 || reducido.matches) { giro = destino; tAnterior = 0; pintar(); return; }
    // el suavizado está definido por fotograma a 60 Hz: se ajusta al tiempo real para que a 120 Hz no gire al doble
    const dt = tAnterior ? Math.min(50, Math.max(1, t - tAnterior)) : 16.67;
    tAnterior = t;
    giro += falta * (1 - Math.pow(1 - suavizado, dt / 16.67));
    pintar();
    bucle = requestAnimationFrame(fotograma);
  };
  const mover = () => { if (!bucle) { tAnterior = 0; bucle = requestAnimationFrame(fotograma); } };

  const ir = (i, { relativo = false } = {}) => {
    if (relativo) destino = Math.round(destino) + i;
    else {
      // camino más corto hasta el índice i
      let d = (((i - Math.round(destino)) % n) + n) % n;
      if (d > n / 2) d -= n;
      destino = Math.round(destino) + d;
    }
    marcar(); mover(); programar();
  };
  // giro fraccionario (p. ej. desde el progreso del scroll); al dejar de llamarse, encaja en la más cercana
  let encaje = 0;
  const desplazar = (pasos) => {
    destino = pasos; marcar(); mover(); clearTimeout(temporizador); clearTimeout(encaje); // marcar: el de delante cambia ya durante el giro
    encaje = setTimeout(() => { destino = Math.round(destino); marcar(); mover(); programar(); }, reposo);
  };
  const siguiente = () => ir(1, { relativo: true });
  const anterior = () => ir(-1, { relativo: true });

  // autoplay
  const programar = () => {
    clearTimeout(temporizador);
    if (!autoplay || reducido.matches || !visible || encima || focoDentro || arrastrando || document.hidden) return;
    temporizador = setTimeout(siguiente, autoplay);
  };

  // arrastre
  let arrastrando = false, movido = false, x0 = 0, giro0 = 0, ultimoX = 0, ultimoT = 0, velocidad = 0, punteroId = null;
  const pxPorPaso = () => Math.max(60, Math.sin(paso) * R || R);
  const alBajar = (e) => {
    if (!arrastre || (e.pointerType === 'mouse' && e.button !== 0)) return;
    arrastrando = true; movido = false; punteroId = e.pointerId;
    x0 = ultimoX = e.clientX; ultimoT = performance.now(); giro0 = giro; velocidad = 0;
    cancelAnimationFrame(bucle); bucle = 0; clearTimeout(temporizador);
  };
  const alMover = (e) => {
    if (!arrastrando || e.pointerId !== punteroId) return;
    const dx = e.clientX - x0;
    if (!movido && Math.abs(dx) > 6) { movido = true; contenedor.setPointerCapture?.(punteroId); contenedor.style.cursor = 'grabbing'; }
    if (!movido) return;
    const ahora = performance.now();
    velocidad = (e.clientX - ultimoX) / Math.max(1, ahora - ultimoT); // px/ms
    ultimoX = e.clientX; ultimoT = ahora;
    giro = destino = giro0 - dx / pxPorPaso();
    pintar();
  };
  const alSoltar = (e) => {
    if (!arrastrando || (e.pointerId !== undefined && e.pointerId !== punteroId)) return;
    arrastrando = false; contenedor.style.cursor = '';
    if (movido) {
      const lanzado = giro - (velocidad * 180) / pxPorPaso(); // inercia: lo que recorrería en ~180 ms
      destino = Math.round(lanzado);
      marcar();
    }
    mover(); // también sin arrastre: al bajar el puntero se paró el bucle y hay que acabar el giro que estuviera a medias
    programar();
  };
  const alClic = (e) => {
    if (movido) { e.preventDefault(); e.stopPropagation(); movido = false; return; }
    if (nodos[indice].contains(e.target) || e.target.closest?.('button, a[href], [data-orbita-control]')) return;
    // los laterales están `inert` (no reciben el clic): se busca por posición el que queda más arriba bajo el puntero
    let elegido = -1, z = -1;
    nodos.forEach((el, i) => {
      if (i === indice || el.style.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom && +el.style.zIndex > z) {
        elegido = i; z = +el.style.zIndex;
      }
    });
    if (elegido >= 0) { e.preventDefault(); ir(elegido); }
  };
  const alTecla = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); siguiente(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); anterior(); }
    else if (e.key === 'Home') { e.preventDefault(); ir(0); }
    else if (e.key === 'End') { e.preventDefault(); ir(n - 1); }
  };
  const alEntrar = () => { encima = true; programar(); };
  const alSalir = () => { encima = false; programar(); };
  const alFocoDentro = () => { focoDentro = true; programar(); };
  const alFocoFuera = (e) => { if (!contenedor.contains(e.relatedTarget)) { focoDentro = false; programar(); } };
  const alVisibilidad = () => programar();
  const alReducido = () => { giro = destino; pintar(); programar(); };

  contenedor.addEventListener('pointerdown', alBajar);
  contenedor.addEventListener('pointermove', alMover);
  window.addEventListener('pointerup', alSoltar);
  window.addEventListener('pointercancel', alSoltar);
  contenedor.addEventListener('click', alClic, true);
  contenedor.addEventListener('keydown', alTecla);
  contenedor.addEventListener('pointerenter', alEntrar);
  contenedor.addEventListener('pointerleave', alSalir);
  contenedor.addEventListener('focusin', alFocoDentro);
  contenedor.addEventListener('focusout', alFocoFuera);
  anteriorBtn?.addEventListener('click', anterior);
  siguienteBtn?.addEventListener('click', siguiente);
  document.addEventListener('visibilitychange', alVisibilidad);
  reducido.addEventListener('change', alReducido);

  const tamano = new ResizeObserver(() => { medir(); pintar(); });
  tamano.observe(contenedor);
  const vista = new IntersectionObserver(([entrada]) => { visible = entrada.isIntersecting; programar(); });
  vista.observe(contenedor);

  medir(); marcar(); pintar(); programar();

  return {
    ir, siguiente, anterior, desplazar,
    total: n,
    get indice() { return indice; },
    get moviendose() { return !!bucle || arrastrando; },
    destruir() {
      cancelAnimationFrame(bucle); clearTimeout(temporizador); clearTimeout(encaje);
      tamano.disconnect(); vista.disconnect();
      contenedor.removeEventListener('pointerdown', alBajar);
      contenedor.removeEventListener('pointermove', alMover);
      window.removeEventListener('pointerup', alSoltar);
      window.removeEventListener('pointercancel', alSoltar);
      contenedor.removeEventListener('click', alClic, true);
      contenedor.removeEventListener('keydown', alTecla);
      contenedor.removeEventListener('pointerenter', alEntrar);
      contenedor.removeEventListener('pointerleave', alSalir);
      contenedor.removeEventListener('focusin', alFocoDentro);
      contenedor.removeEventListener('focusout', alFocoFuera);
      anteriorBtn?.removeEventListener('click', anterior);
      siguienteBtn?.removeEventListener('click', siguiente);
      document.removeEventListener('visibilitychange', alVisibilidad);
      reducido.removeEventListener('change', alReducido);
      const restaurar = (nodo, estilo) => (estilo === null ? nodo.removeAttribute('style') : nodo.setAttribute('style', estilo));
      restaurar(contenedor, previo.contenedor);
      nodos.forEach((e, i) => { restaurar(e, previo.nodos[i]); e.inert = false; e.removeAttribute('aria-hidden'); e.removeAttribute('aria-current'); });
      contenedor.removeAttribute('aria-roledescription');
      if ('orbitaRol' in contenedor.dataset) { contenedor.removeAttribute('role'); delete contenedor.dataset.orbitaRol; }
      if ('orbitaFoco' in contenedor.dataset) { contenedor.removeAttribute('tabindex'); delete contenedor.dataset.orbitaFoco; }
    },
  };
}
