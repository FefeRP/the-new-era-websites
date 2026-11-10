import { crearFrameScrubber } from '../../../plugins/the-new-era-websites/skills/scroll-frames/scripts/frame-scrubber.js';
import { crearCapaPantalla } from '../../../plugins/the-new-era-websites/skills/seguir-pantalla/scripts/capa-pantalla.js';

const q = new URLSearchParams(location.search);
let base = q.get('base') ?? '../salida/frames/';
if (!base.endsWith('/')) base += '/';
const ajuste = q.get('ajuste') ?? 'cover';

// Carta de ajuste 16:10 hecha por código: rejilla, círculo (si se estira, se ve un óvalo) y una "web" de mentira
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <rect width="1600" height="1000" fill="#f6f3ee"/>
  <rect x="0" y="0" width="1600" height="90" fill="#1d3b2f"/>
  <rect x="60" y="30" width="180" height="30" rx="6" fill="#e9c46a"/>
  ${Array.from({ length: 15 }, (_, i) => `<line x1="${(i + 1) * 100}" y1="90" x2="${(i + 1) * 100}" y2="1000" stroke="#0001" stroke-width="2"/>`).join('')}
  ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${100 + i * 100}" x2="1600" y2="${100 + i * 100}" stroke="#0001" stroke-width="2"/>`).join('')}
  <circle cx="1180" cy="545" r="300" fill="none" stroke="#c0392b" stroke-width="18"/>
  <rect x="80" y="330" width="560" height="70" rx="8" fill="#1d3b2f"/>
  <rect x="80" y="430" width="440" height="40" rx="8" fill="#1d3b2f88"/>
  <rect x="80" y="520" width="220" height="64" rx="32" fill="#c0392b"/>
  <rect x="6" y="6" width="1588" height="988" fill="none" stroke="#2a6df4" stroke-width="12"/>
</svg>`;
const contenido = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

const escena = document.getElementById('escena');
const pista = await (await fetch(base + 'pista.json')).json();
const capa = crearCapaPantalla({ contenedor: escena, pista, contenido, aspecto: 16 / 10, expandir: Number(q.get('expandir') ?? 0), radio: 4 });
let ultimo = null;
const seq = await crearFrameScrubber({
  canvas: document.getElementById('lienzo'), base, ajuste, fondo: '#111',
  alDibujar: (d) => { ultimo = d; capa.actualizar(d); document.getElementById('dato').textContent = `frame ${d.i + 1}/${d.manifest.frames}`; },
});
await seq.listo;

const rango = document.getElementById('progreso');
const dato = document.getElementById('dato');
rango.addEventListener('input', () => seq.progreso(Number(rango.value)));
const p0 = Number(q.get('p') ?? 0);
rango.value = String(p0);
seq.progreso(p0);

// Para probar-capa.mjs: esquinas de la capa en px CSS del contenedor (aplicando su matrix3d a las 4 esquinas)
window.__prueba = {
  listo: true,
  seq,
  irA(p) { rango.value = String(p); seq.progreso(p); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); },
  esquinasCapa() {
    const m = new DOMMatrix(getComputedStyle(capa.elemento).transform);
    const W = capa.elemento.offsetWidth, H = capa.elemento.offsetHeight;
    return [[0, 0], [W, 0], [W, H], [0, H]].map(([x, y]) => { const p = m.transformPoint(new DOMPoint(x, y, 0, 1)); return [p.x / p.w, p.y / p.w]; });
  },
  ultimo() { const { i, x, y, w, h, escala } = ultimo; return { i, x, y, w, h, escala, manifest: ultimo.manifest, variante: ultimo.variante }; },
};
