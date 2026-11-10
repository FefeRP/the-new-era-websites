// rastro-cursor.js: al mover el ratón por una zona van apareciendo fotos en el cursor que se apilan y se desvanecen
// ("image trail"). Sin dependencias; idea clásica de Codrops (ImageTrailEffects, MIT), reescrita con Web Animations.
//
//   import { crearRastro } from './rastro-cursor.js';
//   const r = crearRastro(document.querySelector('.zona-rastro'), {
//     imagenes: ['/rastro/1.webp', '/rastro/2.webp', …],   // 6-12 fotos del mismo tamaño y tratamiento
//   });
//   // al desmontar: r.destruir();
//
// - Un pool fijo de <img> reutilizados (no crea nodos al mover): cada `distancia` px recorridos, el siguiente aparece en el
//   cursor, crece un poco, sigue la inercia del movimiento y se apaga.
// - Solo con ratón (hover + puntero fino). En táctil y con prefers-reduced-motion no hace nada: deja el contenido estático
//   de la zona (pon ahí una composición de 2-3 fotos para esos casos).
// - Las imágenes se precargan y decodifican antes de usarlas (sin parpadeos).

export function crearRastro(zona, {
  imagenes = [],
  distancia = 90,        // px de recorrido del ratón entre foto y foto (más = menos fotos)
  ancho = 'clamp(140px, 16vw, 240px)', // tamaño de cada foto (CSS)
  vida = 900,            // ms que tarda una foto en desaparecer
  pool = null,           // nº de <img> (por defecto, 2 × el nº de fotos, máx. 16)
  inercia = 0.35,        // fracción del último desplazamiento que la foto sigue moviéndose
  rotacion = 6,          // grados máximos de giro aleatorio (0 = rectas)
  radio = '4px',
} = {}) {
  const sinEfecto = !imagenes.length || matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (sinEfecto) return { destruir() {}, activo: false };

  if (getComputedStyle(zona).position === 'static') zona.style.position = 'relative';
  const capa = document.createElement('div');
  capa.setAttribute('aria-hidden', 'true');
  Object.assign(capa.style, { position: 'absolute', inset: '0', overflow: 'clip', pointerEvents: 'none', zIndex: '5' });
  zona.appendChild(capa);

  // precarga y decodificación
  const listas = imagenes.map((src) => { const i = new Image(); i.src = src; i.decode?.().catch(() => {}); return i; });
  const n = pool ?? Math.min(16, imagenes.length * 2);
  const nodos = Array.from({ length: n }, () => {
    const img = document.createElement('img');
    img.alt = ''; img.decoding = 'async'; img.draggable = false;
    Object.assign(img.style, { position: 'absolute', left: '0', top: '0', width: ancho, height: 'auto', opacity: '0',
      borderRadius: radio, willChange: 'transform, opacity', transform: 'translate3d(-50%, -50%, 0)', userSelect: 'none' });
    capa.appendChild(img);
    return img;
  });

  let ultimo = null, acumulado = 0, siguiente = 0, foto = 0, z = 1, dx = 0, dy = 0;
  const alMover = (e) => {
    const r = zona.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (ultimo) {
      dx = x - ultimo.x; dy = y - ultimo.y;
      acumulado += Math.hypot(dx, dy);
    }
    ultimo = { x, y };
    if (acumulado < distancia) return;
    acumulado = 0;
    const img = nodos[siguiente];
    siguiente = (siguiente + 1) % n;
    if (!listas[foto].complete) { foto = (foto + 1) % listas.length; return; }
    img.src = listas[foto].src;
    foto = (foto + 1) % listas.length;
    img.style.zIndex = String(z++);
    img.getAnimations().forEach((a) => a.cancel());
    const giro = (Math.random() * 2 - 1) * rotacion;
    const fx = x + dx * inercia * 6, fy = y + dy * inercia * 6;
    img.animate([
      { transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(.6) rotate(${giro}deg)`, opacity: 1, offset: 0 },
      { transform: `translate3d(${(x + fx) / 2}px, ${(y + fy) / 2}px, 0) translate(-50%, -50%) scale(1) rotate(${giro}deg)`, opacity: 1, offset: 0.35 },
      { transform: `translate3d(${fx}px, ${fy}px, 0) translate(-50%, -50%) scale(.85) rotate(${giro}deg)`, opacity: 0, offset: 1 },
    ], { duration: vida, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
  };
  const alSalir = () => { ultimo = null; acumulado = 0; };
  zona.addEventListener('pointermove', alMover, { passive: true });
  zona.addEventListener('pointerleave', alSalir);

  return {
    activo: true,
    destruir() {
      zona.removeEventListener('pointermove', alMover);
      zona.removeEventListener('pointerleave', alSalir);
      capa.remove();
    },
  };
}
