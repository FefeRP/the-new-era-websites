// capa-pantalla.js: pone contenido REAL (la web del cliente, un logo, un texto, un vídeo) encima de una pantalla, cartel o
// etiqueta de un vídeo pintado con frame-scrubber.js, siguiendo su perspectiva fotograma a fotograma con la pista que saca
// seguir-pantalla.mjs. Así la IA genera la escena y la pantalla en blanco o con lo que sea, y lo que tiene que leerse
// (logo, texto, interfaz) lo pone el código: nítido, con su proporción real y sin las letras inventadas de la IA.
// Sin dependencias.
//
//   import { crearCapaPantalla } from './capa-pantalla.js';
//   import { crearFrameScrubber } from './frame-scrubber.js';
//   const pista = await (await fetch('/frames/intro/pista.json')).json();
//   const capa = crearCapaPantalla({ contenedor: escena, pista, contenido: '/img/web-cliente.webp', aspecto: 16 / 10 });
//   const seq = await crearFrameScrubber({ canvas, base: '/frames/intro/', alDibujar: capa.actualizar });
//   // varias capas (pantalla + cartel): alDibujar: (d) => { capa.actualizar(d); cartel.actualizar(d); }
//
// Reglas (ver references/integrar-pantallas-y-logos.md):
// - NUNCA se estira: el elemento tiene el aspecto REAL de la superficie (16:10 un MacBook, 16:9 un monitor, el del cartel)
//   y la perspectiva la pone la homografía. El contenido va dentro con 'contain' (cabe entero) o 'cover' (recorta).
// - La pista está en píxeles del vídeo original; se pasa a coordenadas del canvas con el manifest de extraer-frames.mjs
//   (inicio, fps, original y el recorte de la variante móvil), así que vale igual en escritorio, móvil, cover o contain.
// - Entre dos fotogramas de la pista interpola: sirve aunque se extrajeran menos frames que los del vídeo.

export function crearCapaPantalla({
  contenedor,              // elemento que contiene el canvas (se le pone position: relative si no la tiene)
  pista,                   // objeto de pista.json (seguir-pantalla.mjs)
  contenido,               // Element (img, video, iframe, div...) o URL de imagen
  aspecto = null,          // ancho/alto REAL de la superficie (16/10, 16/9, 1...). Si falta, se estima de la pista (peor)
  ajuste = 'contain',      // 'contain' | 'cover' (nunca 'fill': deforma)
  resolucion = 1280,       // ancho en px CSS del elemento antes de la perspectiva (más = más nítido, más memoria)
  expandir = 1,            // px del vídeo original que crece el cuadrilátero hacia fuera (tapa el borde de la pantalla original)
  radio = 0,               // radio de las esquinas, en px del elemento (pantallas modernas: ~1 % del ancho)
  fondo = '#000',          // color bajo el contenido (lo que se ve en las bandas de 'contain')
  filtro = '',             // CSS filter para casarlo con el vídeo, p. ej. 'blur(0.4px) brightness(0.96) contrast(0.95)'
  brillo = null,           // CSS background del reflejo encima (p. ej. 'linear-gradient(115deg, #fff2 0%, #fff0 40%)')
  zIndex = 1,
} = {}) {
  if (!contenedor) throw new Error('capa-pantalla: falta contenedor');
  if (!pista?.esquinas?.length) throw new Error('capa-pantalla: pista vacía (genera pista.json con seguir-pantalla.mjs)');
  if (getComputedStyle(contenedor).position === 'static') contenedor.style.position = 'relative';

  const asp = aspecto ?? estimarAspecto(pista);
  const W = resolucion, H = Math.round(resolucion / asp);

  const capa = document.createElement('div');
  capa.className = 'capa-pantalla';
  Object.assign(capa.style, {
    position: 'absolute', left: '0', top: '0', width: `${W}px`, height: `${H}px`,
    transformOrigin: '0 0', overflow: 'hidden', background: fondo, borderRadius: `${radio}px`,
    pointerEvents: 'none', zIndex: String(zIndex), visibility: 'hidden', willChange: 'transform',
    filter: filtro || '', backfaceVisibility: 'hidden',
  });
  let el = contenido;
  if (typeof contenido === 'string') {
    el = document.createElement('img');
    el.src = contenido;
    el.alt = '';
    el.decoding = 'async';
  }
  if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement || el instanceof HTMLCanvasElement) {
    Object.assign(el.style, { width: '100%', height: '100%', objectFit: ajuste === 'cover' ? 'cover' : 'contain', display: 'block' });
  } else if (el) {
    // HTML propio (una maqueta de la web): se diseña para el aspecto de la superficie, a W x H
    Object.assign(el.style, { width: '100%', height: '100%', boxSizing: 'border-box' });
  }
  if (el) capa.appendChild(el);
  if (brillo) {
    const reflejo = document.createElement('div');
    Object.assign(reflejo.style, { position: 'absolute', inset: '0', background: brillo, pointerEvents: 'none' });
    capa.appendChild(reflejo);
  }
  contenedor.appendChild(capa);

  const N = pista.esquinas.length;
  function esquinasEn(t) {
    // t en segundos del vídeo original → esquinas interpoladas (px del original), o null si está fuera de la pista
    const f = t * pista.fps;
    if (f < -0.5 || f > N - 0.5) return null;
    const a = Math.max(0, Math.min(N - 1, Math.floor(f))), b = Math.min(N - 1, a + 1), w = Math.max(0, Math.min(1, f - a));
    return pista.esquinas[a].map(([x, y], j) => [x + (pista.esquinas[b][j][0] - x) * w, y + (pista.esquinas[b][j][1] - y) * w]);
  }

  /** Pásala tal cual como alDibujar de crearFrameScrubber (o llámala con esos datos). */
  function actualizar({ i, x, y, w, h, escala, canvas, manifest, variante }) {
    const fps = manifest?.fps ?? pista.fps;
    const t = (manifest?.inicio ?? 0) + i / fps;
    let q = esquinasEn(t);
    if (!q) { capa.style.visibility = 'hidden'; return; }
    q = expandirQuad(q, expandir);
    const oAncho = manifest?.original?.ancho ?? pista.ancho, oAlto = manifest?.original?.alto ?? pista.alto;
    const rec = variante?.recorte ?? { x: 0, ancho: 1 };
    // offset del canvas dentro del contenedor (px CSS)
    let ox = 0, oy = 0;
    if (canvas) {
      const rc = canvas.getBoundingClientRect(), rp = contenedor.getBoundingClientRect();
      ox = rc.left - rp.left - contenedor.clientLeft + contenedor.scrollLeft;
      oy = rc.top - rp.top - contenedor.clientTop + contenedor.scrollTop;
    }
    const css = q.map(([px, py]) => {
      const u = (px / oAncho - rec.x) / rec.ancho, v = py / oAlto;
      return [ox + (x + u * w) / escala, oy + (y + v * h) / escala];
    });
    const m = homografia(css, W, H);
    if (!m) { capa.style.visibility = 'hidden'; return; }
    capa.style.transform = `matrix3d(${m.join(',')})`;
    capa.style.visibility = 'visible';
  }

  return {
    elemento: capa,
    actualizar,
    aspecto: asp,
    ocultar() { capa.style.visibility = 'hidden'; },
    destruir() { capa.remove(); },
  };
}

// Homografía que lleva el rectángulo (0,0)-(W,H) al cuadrilátero q = [TL, TR, BR, BL], como matrix3d de CSS
// (Heckbert, "Fundamentals of Texture Mapping", 1989: cuadrado unidad → cuadrilátero).
export function homografia(q, W, H) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  let a, b, c, d, e, f, g, h;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) {
    a = x1 - x0; b = x3 - x0; c = x0; d = y1 - y0; e = y3 - y0; f = y0; g = 0; h = 0;
  } else {
    const den = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(den) < 1e-12) return null;
    g = (dx3 * dy2 - dx2 * dy3) / den;
    h = (dx1 * dy3 - dx3 * dy1) / den;
    a = x1 - x0 + g * x1; b = x3 - x0 + h * x3; c = x0;
    d = y1 - y0 + g * y1; e = y3 - y0 + h * y3; f = y0;
  }
  // de px del elemento a unidad: u = X/W, v = Y/H
  a /= W; d /= W; g /= W; b /= H; e /= H; h /= H;
  // matrix3d en orden de columnas
  return [a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1].map((n) => +n.toFixed(10));
}

function expandirQuad(q, px) {
  if (!px) return q;
  const cx = q.reduce((s, p) => s + p[0], 0) / 4, cy = q.reduce((s, p) => s + p[1], 0) / 4;
  return q.map(([x, y]) => { const l = Math.hypot(x - cx, y - cy) || 1; return [x + ((x - cx) / l) * px * Math.SQRT2, y + ((y - cy) / l) * px * Math.SQRT2]; });
}

// Aspecto aproximado sacado de la pista (el fotograma donde la superficie se ve más grande, que suele ser el más frontal).
// Es solo un respaldo: la perspectiva lo falsea. Pasa siempre el aspecto real del objeto si lo sabes.
function estimarAspecto(pista) {
  let mejor = null, area = 0;
  for (const q of pista.esquinas) {
    const s = Math.abs(q.reduce((acc, [x, y], j) => { const [nx, ny] = q[(j + 1) % 4]; return acc + x * ny - nx * y; }, 0)) / 2;
    if (s > area) { area = s; mejor = q; }
  }
  const dist = (p, r) => Math.hypot(p[0] - r[0], p[1] - r[1]);
  const [tl, tr, br, bl] = mejor;
  return ((dist(tl, tr) + dist(bl, br)) / 2) / ((dist(tl, bl) + dist(tr, br)) / 2);
}
