// cristal-lente.js: refracción de lente para una capa de cristal, sin dependencias.
// Pinta en un canvas un mapa de desplazamiento con la forma exacta de la capa (caja redondeada por SDF: el centro
// queda nítido y solo el canto dobla la luz), lo mete en un filtro SVG y lo aplica con backdrop-filter: url(#id).
// Solo Chromium lo dibuja; en Safari y Firefox la capa se queda con el esmerilado que le pongas en CSS, y con
// transparencia reducida, contraste alto o colores forzados no se toca nada (tu CSS pone el sólido).
// Guía con el porqué de cada valor: ../references/cristal-liquido.md
//
//   <nav class="barra"><span class="barra__lente" aria-hidden="true"></span>…</nav>
//   .barra__lente { position:absolute; inset:0; z-index:-1; border-radius:inherit;
//     backdrop-filter: blur(14px) saturate(1.4); -webkit-backdrop-filter: blur(14px) saturate(1.4); }   ← respaldo
//   import { crearLente } from './cristal-lente.js';
//   const lente = crearLente(document.querySelector('.barra__lente'), { escala: 44 });
//   …lente.destruir();
//
// Mientras refracta, la capa lleva data-refracta (para bajar el tinte en CSS si quieres).

const NS = 'http://www.w3.org/2000/svg';
let defs = null, contador = 0;

export function refraccionDisponible() {
  const marcas = navigator.userAgentData?.brands;
  const chromium = marcas?.length
    ? marcas.some((m) => /Chromium|Google Chrome|Microsoft Edge/.test(m.brand))
    : /(Chrome|Chromium|Edg|SamsungBrowser)\/\d+/.test(navigator.userAgent) && !/Firefox\/|CriOS/.test(navigator.userAgent);
  return chromium && CSS.supports('backdrop-filter', 'url(#a)');
}

function contenedorDefs() {
  if (defs?.isConnected) return defs;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  defs = document.createElementNS(NS, 'defs');
  svg.append(defs);
  document.body.append(svg);
  return defs;
}

const sdCaja = (x, y, hw, hh, r) => {
  const qx = Math.abs(x) - hw + r, qy = Math.abs(y) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};

// Mapa R/G (128 = neutro) a media resolución. perfil: 'circulo' (canto redondo, el natural) o 'cordon' (máximo a mitad).
async function hacerMapa(w, h, r, bisel, perfil) {
  const k = 0.5, W = Math.max(2, Math.ceil(w * k)), H = Math.max(2, Math.ceil(h * k));
  const lienzo = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const ctx = lienzo.getContext('2d'), img = ctx.createImageData(W, H), px = img.data;
  const d = (x, y) => sdCaja(x, y, w / 2, h / 2, r);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const x = (i + 0.5) / k - w / 2, y = (j + 0.5) / k - h / 2, s = d(x, y), o = (j * W + i) * 4;
    let dx = 0, dy = 0;
    if (s < 0 && s > -bisel) {
      const t = -s / bisel;
      const f = perfil === 'cordon' ? Math.sin(t * Math.PI) : 1 - Math.sqrt((2 - t) * t);
      const nx = d(x + 1, y) - d(x - 1, y), ny = d(x, y + 1) - d(x, y - 1), L = Math.hypot(nx, ny) || 1;
      dx = (-nx / L) * f; dy = (-ny / L) * f;               // muestrea hacia dentro: amplía el canto
    }
    px[o] = 128 + dx * 127; px[o + 1] = 128 + dy * 127; px[o + 2] = 128; px[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const blob = await new Promise((res) => lienzo.toBlob(res, 'image/png'));
  if (!blob) throw new Error('cristal-lente: el lienzo no dio imagen');
  return URL.createObjectURL(blob);                         // blob y no data: (WebKit rechaza data: en feImage)
}

export function crearLente(capa, {
  escala = 40,          // fuerza: 20-36 botones, 40-60 barras y paneles; negativa invierte la lente
  bisel = null,         // px del canto que dobla (por defecto min(20, alto/3))
  perfil = 'circulo',
  desenfoque = 1.5,     // blur después de refractar: bajo, o se come la lente
  saturacion = 1.5,
  brillo = 1.05,
  aberracion = 0,       // 0 = una pasada; 0.05-0.1 = tres pasadas por canal (más caro)
} = {}) {
  const sinTransparencia = matchMedia('(prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)');
  if (!refraccionDisponible()) return { reconstruir() {}, destruir() {}, activa: false };
  let url = null, firma = '', filtro = null, pendiente = 0, vivo = true;

  function quitar() {
    capa.style.removeProperty('backdrop-filter');
    delete capa.dataset.refracta;
    filtro?.remove(); filtro = null; firma = '';
  }

  async function construir() {
    pendiente = 0;
    if (!vivo) return;
    if (sinTransparencia.matches) return quitar();
    const w = Math.round(capa.offsetWidth), h = Math.round(capa.offsetHeight);   // offset*: ignora transforms
    // el radio puede venir en % (border-radius: 50%): se pasa a px sobre el lado menor
    const radioCss = getComputedStyle(capa).borderTopLeftRadius.split(' ')[0];
    const rPx = radioCss.endsWith('%') ? (parseFloat(radioCss) / 100) * Math.min(w, h) : parseFloat(radioCss) || 0;
    const r = Math.min(rPx, w / 2, h / 2);
    const f = `${w}:${h}:${r}`;
    if (w < 4 || h < 4 || f === firma) return;
    firma = f;
    const b = bisel ?? Math.min(20, h / 3);
    let nuevo;
    try { nuevo = await hacerMapa(w, h, r, b, perfil); }
    catch { firma = ''; return; }                            // sin mapa se queda el cristal sin refracción; se reintenta al cambiar

    if (!vivo || firma !== f) { URL.revokeObjectURL(nuevo); return; }
    const id = `cristal-lente-${++contador}`;                // id nuevo: el navegador cachea por id
    const el = document.createElementNS(NS, 'filter');
    for (const [a, v] of Object.entries({ id, x: 0, y: 0, width: w, height: h, filterUnits: 'userSpaceOnUse',
      'color-interpolation-filters': 'sRGB' })) el.setAttribute(a, v);
    const img = `<feImage href="${nuevo}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="m"/>`;
    if (aberracion > 0) {
      const canal = (s, fila, n) => `<feDisplacementMap in="SourceGraphic" in2="m" scale="${s}" xChannelSelector="R" yChannelSelector="G" result="d${n}"/>` +
        `<feColorMatrix in="d${n}" type="matrix" values="${fila}" result="c${n}"/>`;
      el.innerHTML = img +
        canal(escala * (1 + aberracion), '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', 0) +
        canal(escala, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', 1) +
        canal(escala * (1 - aberracion), '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', 2) +
        '<feBlend in="c0" in2="c1" mode="screen" result="rg"/><feBlend in="rg" in2="c2" mode="screen"/>';
    } else {
      el.innerHTML = img + `<feDisplacementMap in="SourceGraphic" in2="m" scale="${escala}" xChannelSelector="R" yChannelSelector="G"/>`;
    }
    contenedorDefs().append(el);
    capa.style.backdropFilter = `url(#${id}) blur(${desenfoque}px) saturate(${saturacion}) brightness(${brillo})`;
    filtro?.remove(); filtro = el;
    if (url) URL.revokeObjectURL(url);
    url = nuevo;
    capa.dataset.refracta = '';
  }

  const programar = () => { if (!pendiente) pendiente = requestAnimationFrame(construir); };
  const ro = new ResizeObserver(programar);
  ro.observe(capa);
  sinTransparencia.addEventListener('change', programar);
  programar();

  return {
    activa: true,
    reconstruir() { firma = ''; programar(); },
    destruir() {
      vivo = false; ro.disconnect(); cancelAnimationFrame(pendiente);
      sinTransparencia.removeEventListener('change', programar);
      quitar(); if (url) URL.revokeObjectURL(url);
    },
  };
}
