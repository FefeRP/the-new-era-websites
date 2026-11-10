// mapa-imagen.js: "del mapa al edificio" con imágenes en vez de un mapa vivo. Niveles de imagen anidados (ciudad →
// barrio → calle), cámara pegada al scroll, marcadores HTML y rutas que se trazan, todo en coordenadas 0..1 de la imagen
// base. Sirve para ortofoto real descargada (PNOA, USGS…), para una ilustración o un mapa estilizado con IA sobre esa
// ortofoto, y para enlazar con un clip de vídeo IA entre dos vistas (vista() y fotograma() dan los encuadres de inicio y fin).
// Sin dependencias. Alternativa al mapa vivo de mapa-scroll.js: sin teselas, sin WebGL, peso fijo y conocido.
//
//   import { crearMapaImagen } from './mapa-imagen.js';
//   const m = crearMapaImagen({
//     contenedor: document.querySelector('.escenario'),          // position: relative; el canvas va dentro
//     niveles: [                                                 // el primero es la base; cada uno, DENTRO de su padre
//       { src: '/mapa/ciudad.webp' },                            // (por defecto, el anterior; `padre: i` para hermanos)
//       { src: '/mapa/barrio.webp', caja: { x: 0.4, y: 0.4, ancho: 0.2, alto: 0.2 } },
//       { src: '/mapa/calle.webp',  caja: { x: 0.48, y: 0.48, ancho: 0.04, alto: 0.04 } },
//     ],                                                         // cajas en fracciones de la base; misma proporción que su imagen
//     paradas: [                                                 // la cámara en cada punto del recorrido
//                                                                // (o ({ ancho, alto }) => [...] para encuadrar distinto en móvil)
//       { en: 0, caja: { x: 0, y: 0, ancho: 1, alto: 1 }, cubrir: true }, // encuadra esa caja (cover; sin cubrir: contain con margen)
//       { en: 0.5, x: 0.5, y: 0.5, zoom: 6 },                    // o centro + zoom (1 = la base cubre el contenedor)
//       { en: 1, caja: { x: 0.49, y: 0.49, ancho: 0.02, alto: 0.02 }, arco: 0 },
//     ],
//     marcadores: [{ el: document.querySelector('.pin'), x: 0.5, y: 0.5, desde: 0.6, hasta: 1, ancla: 'abajo' }],
//     rutas: [{ puntos: [[0.3, 0.7], [0.45, 0.55], [0.5, 0.5]], desde: 0.2, hasta: 0.6, color: '#ff6a3d', ancho: 4 }],
//   });
//   await m.listo;                       // imágenes cargadas y decodificadas
//   m.progreso(p);                       // 0..1 (p. ej. desde ScrollTrigger con scrub)
//   m.vista(p)                           // { x, y, ancho, alto } de la base que se ve en p (para pedir un clip IA)
//   m.fotograma(p, 1920, 1080)           // canvas con la vista en p, sin marcadores (fotograma de inicio/fin del clip)
//   m.destruir();
//
// - Se dibuja en canvas: cada nivel con drawImage a su resolución real, así se ve nítido a cualquier escala (un div con
//   transform: scale se rasteriza una vez y se emborrona al ampliar).
// - Un nivel aparece (fundido) cuando el anterior empieza a ampliarse por encima de su resolución; uno que cubre toda la
//   vista tapa a los de debajo y estos no se dibujan.
// - La cámara interpola el zoom en logaritmo y ancla el destino (el punto al que vas no patina). Con `arco` (0..1) entre
//   dos paradas, la cámara se aleja a mitad de tramo: para pasar de una zona a otra sin un barrido plano.
// - Con prefers-reduced-motion: sin interpolar, salta de parada en parada (corte a mitad de cada tramo).
// - Solo pinta cuando cambia el progreso o el tamaño (no hay bucle propio).

const lim = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const suave = (t) => t * t * (3 - 2 * t);

// De lat/lng a coordenadas 0..1 de una imagen en Web Mercator (EPSG:3857) con esos límites en grados: la que da un WMS
// con CRS=EPSG:3857 o una captura de teselas. const aXY = proyeccion({ oeste, sur, este, norte }); aXY(lng, lat) → { x, y }
export function proyeccion({ oeste, sur, este, norte }) {
  const mx = (lng) => (lng * Math.PI) / 180;
  const my = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  return (lng, lat) => ({ x: (mx(lng) - mx(oeste)) / (mx(este) - mx(oeste)), y: (my(norte) - my(lat)) / (my(norte) - my(sur)) });
}

export function crearMapaImagen({
  contenedor, niveles, paradas, marcadores = [], rutas = [],
  margen = 0.06,          // margen al encuadrar una caja (fracción de la vista)
  fondo = '#0e1418',      // color fuera de la imagen base
  dprMax = 2, limitar = true, // limitar: la vista no se sale de la base
} = {}) {
  if (!contenedor || !niveles?.length || !paradas) throw new Error('crearMapaImagen: faltan contenedor, niveles o paradas');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
  if (getComputedStyle(contenedor).position === 'static') contenedor.style.position = 'relative';
  contenedor.prepend(canvas);
  const ctx = canvas.getContext('2d');

  const lista = niveles.map((n, i) => ({ ...n, caja: i === 0 ? { x: 0, y: 0, ancho: 1, alto: 1 } : n.caja, img: new Image(), ok: false }));
  // paradas: lista fija o función ({ ancho, alto }) => lista, para encuadrar distinto en móvil vertical
  let cache = { clave: '', lista: [] };
  const paradasDe = (w, h) => {
    const clave = typeof paradas === 'function' ? `${Math.round(w)}x${Math.round(h)}` : 'fija';
    if (cache.clave !== clave) cache = { clave, lista: [...(typeof paradas === 'function' ? paradas({ ancho: w, alto: h }) : paradas)].sort((a, b) => a.en - b.en) };
    return cache.lista;
  };
  for (const m of marcadores) {
    Object.assign(m.el.style, { position: 'absolute', left: '0', top: '0', zIndex: m.el.style.zIndex || '2', willChange: 'transform, opacity' });
  }

  let W = 0, H = 0, dpr = 1, ultimo = 0, pendiente = false, destruido = false;
  const base = () => lista[0].img; // la base marca las proporciones del mundo

  // zoom 1 = la base cubre la vista (cover); escala = px de pantalla por unidad normalizada de la base (en x)
  const cubrir = (w, h) => { const b = base(); return Math.max(w / b.naturalWidth, h / b.naturalHeight) * b.naturalWidth; };
  const aspecto = () => base().naturalWidth / base().naturalHeight; // ancho/alto de la base

  // cámara de una parada: { x, y, z }
  function camaraDe(par, w, h) {
    if (par.caja) {
      const c = par.caja, A = aspecto();
      const s = par.cubrir ? Math.max(w / c.ancho, h / (c.alto / A))          // la caja cubre la vista (sin bandas)
        : Math.min(w / c.ancho, h / (c.alto / A)) * (1 - 2 * margen);         // la caja entera cabe, con margen
      return { x: c.x + c.ancho / 2, y: c.y + c.alto / 2, z: s / cubrir(w, h) };
    }
    return { x: par.x, y: par.y, z: par.zoom ?? 1 };
  }

  // cámara en el progreso p
  function camara(p, w, h) {
    const ps = paradasDe(w, h);
    if (p <= ps[0].en || ps.length === 1) return camaraDe(ps[0], w, h);
    if (p >= ps.at(-1).en) return camaraDe(ps.at(-1), w, h);
    let i = 0; while (p > ps[i + 1].en) i++;
    const a = camaraDe(ps[i], w, h), b = camaraDe(ps[i + 1], w, h);
    let k = (p - ps[i].en) / (ps[i + 1].en - ps[i].en);
    if (reducido) k = k < 0.5 ? 0 : 1;
    k = suave(k);
    const arco = ps[i + 1].arco ?? 0;
    const la = Math.log(a.z), lb = Math.log(b.z);
    let z = Math.exp(la + (lb - la) * k);
    let w2;
    if (arco > 0 || Math.abs(lb - la) < 0.05) {
      w2 = k;                                            // mismo zoom o con arco: el centro avanza con k
      // con arco, a mitad de tramo se aleja hasta ver los dos puntos (arco 1) con margen
      const cu = cubrir(w, h), dx = Math.abs(b.x - a.x) * 1.5, dy = Math.abs(b.y - a.y) * 1.5;
      const zAmbos = Math.min(z, dx ? w / (cu * dx) : Infinity, dy ? (h * aspecto()) / (cu * dy) : Infinity);
      z = Math.exp(Math.log(z) + (Math.log(zAmbos) - Math.log(z)) * arco * Math.sin(Math.PI * k));
    } else {
      w2 = (1 / a.z - 1 / z) / (1 / a.z - 1 / b.z);    // ancla: el centro se mueve en proporción a 1/zoom
    }
    return { x: a.x + (b.x - a.x) * w2, y: a.y + (b.y - a.y) * w2, z };
  }

  // transformación base normalizada → px de la vista
  function transformacion(cam, w, h) {
    const s = cam.z * cubrir(w, h), A = aspecto();
    const sy = s / A; // la y normalizada se mide en altos de la base
    let cx = cam.x, cy = cam.y;
    if (limitar) {
      const vx = w / s / 2, vy = h / sy / 2;
      cx = vx >= 0.5 ? 0.5 : lim(cx, vx, 1 - vx);
      cy = vy >= 0.5 ? 0.5 : lim(cy, vy, 1 - vy);
    }
    return { s, sy, ox: w / 2 - cx * s, oy: h / 2 - cy * sy };
  }

  function dibujar(c, w, h, p, escalaPx) {
    const t = transformacion(camara(p, w, h), w, h);
    c.setTransform(escalaPx, 0, 0, escalaPx, 0, 0);
    c.fillStyle = fondo; c.fillRect(0, 0, w, h);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    // opacidad de cada nivel: entra cuando el anterior se amplía por encima de su resolución (densidad 0,6 → 1,1)
    const visibles = lista.map((n, i) => {
      const r = { x: t.ox + n.caja.x * t.s, y: t.oy + n.caja.y * t.sy, w: n.caja.ancho * t.s, h: n.caja.alto * t.sy };
      let a = 1;
      if (i > 0) {
        const prev = lista[n.padre ?? i - 1];
        const dens = prev.ok ? (prev.caja.ancho * t.s * escalaPx) / prev.img.naturalWidth : 2;
        a = suave(lim((dens - 0.6) / 0.5));
      }
      const fuera = r.x > w || r.y > h || r.x + r.w < 0 || r.y + r.h < 0;
      return { n, r, a: n.ok && !fuera ? a : 0 };
    });
    // el nivel más alto que cubre toda la vista con opacidad 1 tapa a los de debajo
    let desde = 0;
    visibles.forEach((v, i) => { if (v.a >= 1 && v.r.x <= 0 && v.r.y <= 0 && v.r.x + v.r.w >= w && v.r.y + v.r.h >= h) desde = i; });
    for (let i = desde; i < visibles.length; i++) {
      const { n, r, a } = visibles[i];
      if (a <= 0) continue;
      c.globalAlpha = a;
      c.drawImage(n.img, r.x, r.y, r.w, r.h);
    }
    c.globalAlpha = 1;
    for (const ru of rutas) {
      const k = lim((p - (ru.desde ?? 0)) / ((ru.hasta ?? 1) - (ru.desde ?? 0)));
      if (k <= 0) continue;
      const pts = ru.puntos.map(([x, y]) => [t.ox + x * t.s, t.oy + y * t.sy]);
      const tramos = pts.slice(1).map((q, j) => Math.hypot(q[0] - pts[j][0], q[1] - pts[j][1]));
      let resta = tramos.reduce((s, v) => s + v, 0) * k;
      c.beginPath(); c.moveTo(...pts[0]);
      for (let j = 0; j < tramos.length && resta > 0; j++) {
        const f = Math.min(1, resta / (tramos[j] || 1));
        c.lineTo(pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f);
        resta -= tramos[j];
      }
      c.strokeStyle = ru.color ?? '#ff6a3d'; c.lineWidth = ru.ancho ?? 4; c.lineCap = 'round'; c.lineJoin = 'round';
      c.setLineDash(ru.discontinua ? [ru.ancho * 2.5, ru.ancho * 2] : []);
      c.stroke();
    }
    return t;
  }

  function pintar() {
    pendiente = false;
    if (destruido || !lista[0].ok || !W) return;
    const t = dibujar(ctx, W, H, ultimo, dpr);
    for (const m of marcadores) {
      const d = m.desde ?? 0, h = m.hasta ?? 1, f = 0.04;
      const a = reducido ? (ultimo >= d && ultimo <= h ? 1 : 0) : Math.min(lim((ultimo - d) / f + 1), lim((h - ultimo) / f + 1));
      const x = t.ox + m.x * t.s, y = t.oy + m.y * t.sy;
      m.el.style.opacity = String(a);
      m.el.style.visibility = a > 0 ? '' : 'hidden';
      m.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, ${m.ancla === 'abajo' ? '-100%' : '-50%'})`;
    }
  }
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };

  function medir() {
    const r = contenedor.getBoundingClientRect();
    W = r.width; H = r.height;
    dpr = Math.min(dprMax, devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    pintar();
  }
  const ro = new ResizeObserver(medir);
  ro.observe(contenedor);

  const listo = Promise.all(lista.map((n) => new Promise((ok) => {
    n.img.decoding = 'async';
    n.img.onload = () => (n.img.decode ? n.img.decode() : Promise.resolve()).catch(() => {}).then(() => { n.ok = true; pedir(); ok(); });
    n.img.onerror = () => { console.warn('mapa-imagen: no carga ' + n.src); ok(); };
    n.img.src = n.src;
  })));

  return {
    listo,
    canvas,
    progreso(p) { ultimo = lim(p); pedir(); },
    pintarYa() { pintar(); },
    // rectángulo de la base (0..1) que se ve en p con el tamaño actual (o el dado)
    vista(p, w = W, h = H) {
      const t = transformacion(camara(lim(p), w, h), w, h);
      return { x: -t.ox / t.s, y: -t.oy / t.sy, ancho: w / t.s, alto: h / t.sy };
    },
    // la vista en p dibujada en un canvas aparte de ancho×alto (sin marcadores): fotograma de inicio/fin para un clip IA
    fotograma(p, ancho = 1920, alto = 1080) {
      const c = document.createElement('canvas'); c.width = ancho; c.height = alto;
      dibujar(c.getContext('2d'), ancho, alto, lim(p), 1);
      return c;
    },
    destruir() { destruido = true; ro.disconnect(); canvas.remove(); for (const m of marcadores) { m.el.style.transform = ''; m.el.style.opacity = ''; m.el.style.visibility = ''; } },
  };
}
