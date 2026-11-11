// tarjeta-volteo.js: tarjeta de dos caras que se da la vuelta (flip) con clic, teclado u hover. Sin dependencias.
//
//   <article class="volteo">
//     <div data-cara="frente"> … </div>
//     <div data-cara="dorso"> … </div>
//   </article>
//
//   import { crearTarjetaVolteo } from './tarjeta-volteo.js';
//   const t = crearTarjetaVolteo(document.querySelector('.volteo'), { eje: 'y', disparo: 'clic' });
//   // t.voltear() · t.voltear(true|false) · t.volteada · t.destruir()
//
// - Las dos caras ocupan la misma celda de una rejilla: la tarjeta mide lo que mide la cara más alta y no salta al girar.
// - La cara oculta queda `inert` y `aria-hidden`: ni el teclado ni el lector de pantalla entran en lo que no se ve.
// - Los enlaces, botones y campos de dentro siguen funcionando: un clic sobre ellos no da la vuelta.
// - Capas en profundidad: un hijo con data-z="60" flota 60 px por delante de su cara (foto 50, datos 60, insignia 80…) y
//   al girar se ve el relieve. Tienen que ser hijos directos de la cara, y las caras no pueden llevar overflow: hidden
//   (aplana las capas): el recorte y el fondo van en un hijo.
// - Con prefers-reduced-motion no gira ni hay relieve: cambia de cara con un fundido corto.
// - `disparo: 'hover'` solo se activa con ratón (hover + puntero fino); en táctil pasa a clic, porque el hover se queda pegado.
// - Accesibilidad: la tarjeta NO es un botón (con role="button" los enlaces de dentro dejan de anunciarse y la etiqueta
//   tapa todo el contenido). El control es un <button> de verdad, fuera de las caras: el tuyo si hay un hijo directo con
//   [data-volteo-boton], o uno que se crea, oculto a la vista hasta que recibe el foco del teclado. Con ratón o dedo
//   se puede pulsar en cualquier parte de la tarjeta. Escape vuelve al frente y deja el foco en el botón.

const INTERACTIVOS = 'a[href], button, input, select, textarea, label, summary, [contenteditable], [data-sin-volteo]';
const OCULTO = { position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden',
  clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: '0' };
const VISIBLE = { position: 'absolute', top: '12px', right: '12px', zIndex: '2', width: 'auto', height: 'auto', padding: '8px 12px',
  margin: '0', overflow: 'visible', clip: 'auto', clipPath: 'none', whiteSpace: 'nowrap', border: '0', borderRadius: '6px',
  background: '#fff', color: '#111', font: '600 14px/1.2 system-ui, sans-serif', minHeight: '44px' };

export function crearTarjetaVolteo(tarjeta, {
  eje = 'y',               // 'y' (gira como una puerta) o 'x' (como una tapa)
  disparo = 'clic',        // 'clic' | 'hover' | 'ambos'
  duracion = 600,          // ms
  curva = 'cubic-bezier(.2, .7, .2, 1)',
  perspectiva = 1200,      // px; menos = más deformación
  sentido = 1,             // 1 o -1: hacia qué lado gira
  etiqueta = null,         // texto del botón que se crea (por defecto, "Dar la vuelta a la tarjeta")
  boton = null,            // botón propio (por defecto, el hijo directo [data-volteo-boton]; si no hay, se crea uno)
  alVoltear = null,        // (volteada) => {}
} = {}) {
  const frente = tarjeta.querySelector('[data-cara="frente"]');
  const dorso = tarjeta.querySelector('[data-cara="dorso"]');
  if (!frente || !dorso) throw new Error('tarjeta-volteo: faltan [data-cara="frente"] y [data-cara="dorso"]');

  const reducido = matchMedia('(prefers-reduced-motion: reduce)');
  const conHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const usaHover = (disparo === 'hover' || disparo === 'ambos') && conHover;
  const usaClic = disparo !== 'hover' || !conHover;
  const girar = eje === 'x' ? 'rotateX' : 'rotateY';

  // interior: el nodo que gira (se crea si no existe)
  let interior = tarjeta.querySelector(':scope > [data-volteo-interior]');
  const creado = !interior;
  if (creado) {
    interior = document.createElement('div');
    interior.setAttribute('data-volteo-interior', '');
    tarjeta.insertBefore(interior, frente);
    interior.append(frente, dorso);
  }
  const previo = { tarjeta: tarjeta.getAttribute('style'), interior: interior.getAttribute('style'),
    frente: frente.getAttribute('style'), dorso: dorso.getAttribute('style') };

  tarjeta.style.perspective = perspectiva + 'px';
  Object.assign(interior.style, { display: 'grid', height: '100%', transformStyle: 'preserve-3d', willChange: 'transform' });
  // capas en profundidad: cualquier elemento con data-z="60" sale 60 px hacia el espectador al girar la tarjeta.
  // Las caras NO pueden llevar overflow: hidden (aplana el translateZ de los hijos): el recorte va en un hijo.
  const capas = Array.from(tarjeta.querySelectorAll('[data-z]'));
  // estilo en línea de cada nodo que se va a tocar, para devolverlo tal cual en destruir()
  const estilosPrevios = new Map();
  for (const nodo of [...capas, ...frente.children, ...dorso.children]) estilosPrevios.set(nodo, nodo.getAttribute('style'));
  // el control: un <button> fuera de las caras (las caras se vuelven inertes; el botón tiene que seguir alcanzable)
  let control = boton ?? tarjeta.querySelector(':scope > [data-volteo-boton]');
  if (control && (frente.contains(control) || dorso.contains(control))) throw new Error('tarjeta-volteo: el botón no puede ir dentro de una cara');
  const controlCreado = !control;
  const pressedPrevio = control?.getAttribute('aria-pressed') ?? null;
  if (controlCreado) {
    control = document.createElement('button');
    control.type = 'button';
    control.setAttribute('data-volteo-boton', '');
    control.textContent = etiqueta || 'Dar la vuelta a la tarjeta';
    Object.assign(control.style, OCULTO);
    tarjeta.insertBefore(control, tarjeta.firstChild); // primero en el orden del tabulador, antes que los enlaces del frente
  }
  if (getComputedStyle(tarjeta).position === 'static') tarjeta.style.position = 'relative';
  for (const cara of [frente, dorso]) {
    Object.assign(cara.style, { gridArea: '1 / 1', backfaceVisibility: 'hidden', minWidth: '0' });
    cara.style.setProperty('-webkit-backface-visibility', 'hidden');
    if (capas.length) {
      // con preserve-3d cada hijo directo decide por su cuenta si enseña el reverso: hay que ocultárselo también
      cara.style.transformStyle = 'preserve-3d';
      for (const hijo of cara.children) { hijo.style.backfaceVisibility = 'hidden'; hijo.style.setProperty('-webkit-backface-visibility', 'hidden'); }
    }
  }

  let volteada = false;
  const pintar = (animar) => {
    const sinGiro = reducido.matches;
    interior.style.transition = animar && !sinGiro ? `transform ${duracion}ms ${curva}` : 'none';
    interior.style.transform = sinGiro ? 'none' : `${girar}(${volteada ? 180 * sentido : 0}deg)`;
    dorso.style.transform = sinGiro ? 'none' : `${girar}(180deg)`;
    for (const capa of capas) capa.style.transform = sinGiro ? '' : `translateZ(${Number(capa.dataset.z) || 0}px)`;
    for (const [cara, visible] of [[frente, !volteada], [dorso, volteada]]) {
      cara.style.transition = sinGiro && animar ? 'opacity 180ms linear' : 'none';
      cara.style.opacity = sinGiro ? (visible ? '1' : '0') : '1';
      cara.style.pointerEvents = visible ? '' : 'none';
      cara.inert = !visible;
      cara.setAttribute('aria-hidden', String(!visible));
    }
    tarjeta.dataset.volteada = String(volteada);
    control.setAttribute('aria-pressed', String(volteada));
  };

  const voltear = (estado) => {
    const nuevo = typeof estado === 'boolean' ? estado : !volteada;
    if (nuevo === volteada) return;
    volteada = nuevo;
    pintar(true);
    alVoltear?.(volteada);
  };

  const alClic = (e) => {
    if (e.target.closest(INTERACTIVOS) && e.target.closest(INTERACTIVOS) !== tarjeta) return;
    const sel = getSelection();
    if (sel && !sel.isCollapsed && tarjeta.contains(sel.anchorNode)) return; // estaba seleccionando texto de la tarjeta
    voltear();
  };
  // El botón: Enter y espacio los da el propio <button>. En modo solo hover, el clic de ratón no hace nada (el ratón
  // ya la giró al entrar); el del teclado (detail 0) sí.
  const alBoton = (e) => { if (!usaClic && e.detail > 0) return; voltear(); };
  const alTecla = (e) => {
    if (e.key !== 'Escape' || !volteada) return;
    voltear(false);
    control.focus({ preventScroll: true }); // el dorso queda inerte: el foco no puede quedarse en él
  };
  const alFocoBoton = () => { if (controlCreado && control.matches(':focus-visible')) Object.assign(control.style, VISIBLE); };
  const alSalirBoton = () => { if (controlCreado) Object.assign(control.style, OCULTO, { top: '', right: '', zIndex: '', borderRadius: '', background: '', color: '', font: '', minHeight: '' }); };
  const alEntrar = () => voltear(true);
  const alSalir = () => voltear(false);
  // Con teclado en modo hover: al entrar el foco se enseña el dorso. Si el foco llega a un enlace del frente, esa cara
  // va a quedar inerte y el foco se perdería: se pasa antes al botón.
  const alEnfocar = (e) => {
    if (e.target !== control && frente.contains(e.target) && !volteada) { control.focus({ preventScroll: true }); return; }
    voltear(true);
  };
  const alDesenfocar = (e) => { if (e.relatedTarget && tarjeta.contains(e.relatedTarget)) return; voltear(false); };
  const alCambiarMovimiento = () => pintar(false);

  control.addEventListener('click', alBoton);
  control.addEventListener('focus', alFocoBoton);
  control.addEventListener('blur', alSalirBoton);
  tarjeta.addEventListener('keydown', alTecla);
  if (usaClic) {
    tarjeta.style.cursor = 'pointer';
    tarjeta.addEventListener('click', alClic);
  }
  if (usaHover) {
    tarjeta.addEventListener('pointerenter', alEntrar);
    tarjeta.addEventListener('pointerleave', alSalir);
    tarjeta.addEventListener('focusin', alEnfocar);
    tarjeta.addEventListener('focusout', alDesenfocar);
  }
  reducido.addEventListener('change', alCambiarMovimiento);
  pintar(false);

  return {
    voltear,
    boton: control,
    get volteada() { return volteada; },
    destruir() {
      control.removeEventListener('click', alBoton);
      control.removeEventListener('focus', alFocoBoton);
      control.removeEventListener('blur', alSalirBoton);
      if (controlCreado) control.remove();
      else if (pressedPrevio === null) control.removeAttribute('aria-pressed'); else control.setAttribute('aria-pressed', pressedPrevio);
      tarjeta.removeEventListener('click', alClic);
      tarjeta.removeEventListener('keydown', alTecla);
      tarjeta.removeEventListener('pointerenter', alEntrar);
      tarjeta.removeEventListener('pointerleave', alSalir);
      tarjeta.removeEventListener('focusin', alEnfocar);
      tarjeta.removeEventListener('focusout', alDesenfocar);
      reducido.removeEventListener('change', alCambiarMovimiento);
      if (creado) interior.replaceWith(frente, dorso); // en su sitio, sin cambiar el orden con otros hijos
      const restaurar = (nodo, estilo) => (estilo === null ? nodo.removeAttribute('style') : nodo.setAttribute('style', estilo));
      restaurar(tarjeta, previo.tarjeta); restaurar(frente, previo.frente); restaurar(dorso, previo.dorso);
      if (!creado) restaurar(interior, previo.interior);
      for (const cara of [frente, dorso]) { cara.inert = false; cara.removeAttribute('aria-hidden'); }
      for (const [nodo, estilo] of estilosPrevios) restaurar(nodo, estilo);
      delete tarjeta.dataset.volteada;
    },
  };
}
