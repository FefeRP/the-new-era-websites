#!/usr/bin/env node
// Precio y catálogo de la API de Higgsfield SIN GENERAR NADA (solo GET /models y POST /estimate/<ruta>, que son
// gratis). Sirve para presupuestar un lote antes de pedir el vale y para comprobar qué rutas existen hoy.
//
//   node estimar-higgsfield.mjs modelos [filtro]              -> rutas de la API (slug, título, tipo)
//   node estimar-higgsfield.mjs precio <ruta> [segundos] [res] -> precio por segundo y total de una ruta
//   node estimar-higgsfield.mjs lote <lote.json>               -> [{ "ruta", "cuerpo" }] -> precio de cada pieza y total
//   node estimar-higgsfield.mjs tabla                          -> precios de las rutas de vídeo útiles para webs
//
// Clave: variables de entorno HF_API_KEY_ID y HF_API_KEY_SECRET (la clave de la API de pago por uso de
// https://cloud.higgsfield.ai). Nunca se imprime. Sin clave, usa el MCP de Higgsfield (`estimate_video_cost`), que
// también es gratis y da el precio en créditos de la web.
//
// /estimate no comprueba que la petición esté lista para generar; las URL de imagen pueden ser de ejemplo.
// El precio en $ de la API y los créditos de la web son tarifas distintas: no los conviertas uno en otro.
import { readFileSync } from 'node:fs';

const BASE = 'https://api.higgsfield.ai';
const id = process.env.HF_API_KEY_ID, secreto = process.env.HF_API_KEY_SECRET;
if (!id || !secreto) {
  console.error('Faltan HF_API_KEY_ID y HF_API_KEY_SECRET en el entorno (clave de la API de Higgsfield).');
  process.exit(2);
}
const cab = { Authorization: `Key ${id}:${secreto}`, Accept: 'application/json' };

async function api(metodo, ruta, cuerpo) {
  const r = await fetch(BASE + ruta, {
    method: metodo,
    headers: { ...cab, ...(cuerpo ? { 'Content-Type': 'application/json' } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    signal: AbortSignal.timeout(60000),
  });
  const t = await r.text();
  let d; try { d = JSON.parse(t); } catch { d = t; }
  if (!r.ok) throw new Error(`${r.status} ${ruta}: ${typeof d === 'string' ? d.slice(0, 200) : JSON.stringify(d).slice(0, 200)}`);
  return d;
}

// La API responde de dos formas: { type: "estimate", usd } o { type: "description", pricing_description:
// "…480p: $0.1177; 720p: $0.2647…" } (tarifa por segundo según resolución).
function leerPrecio(d, segundos, res) {
  if (d.usd != null) return { total: Number(d.usd), porSegundo: segundos ? Number(d.usd) / segundos : null, texto: '' };
  const texto = d.pricing_description || '';
  const tarifas = Object.fromEntries([...texto.matchAll(/(\d+p|4K|2K):\s*\$(\d+(?:\.\d+)?)/gi)].map((m) => [m[1].toLowerCase(), Number(m[2])]));
  const clave = (res || '').toLowerCase();
  const t = tarifas[clave] ?? (Object.keys(tarifas).length === 1 ? Object.values(tarifas)[0] : null);
  return { total: t != null && segundos ? +(t * segundos).toFixed(3) : null, porSegundo: t, tarifas, texto };
}

const cuerpoBase = (ruta, segundos, res) => {
  const img = 'https://example.com/inicio.png';
  const c = { prompt: 'estimate only', duration: segundos };
  if (/first-last-frame/.test(ruta)) c.first_frame_url = img;
  else if (/image-to-video|reference-to-video/.test(ruta)) c.image_url = img;
  if (/video-extend|video-edit/.test(ruta)) c.video_url = 'https://example.com/clip.mp4';
  if (res) c.resolution = res;
  if (/kling-video\/o3/.test(ruta)) c.mode = 'pro';
  if (/seedance|wan|kling-video\/v4/.test(ruta)) c.generate_audio = false;
  return c;
};

const [orden, a1, a2, a3] = process.argv.slice(2);
if (orden === 'modelos') {
  const d = await api('GET', '/models');
  const filtro = a1 ? new RegExp(a1, 'i') : null;
  for (const m of d.items || []) {
    if (filtro && !filtro.test(m.slug + ' ' + m.title)) continue;
    console.log(`${m.output_type.padEnd(6)} /${m.slug}  ·  ${m.title}  ·  ${(m.operation_type || []).join('+')}`);
  }
  console.log(`\n${d.total} rutas en total (${new Date().toISOString().slice(0, 10)}).`);
} else if (orden === 'precio') {
  if (!a1) { console.error('Uso: precio <ruta> [segundos=5] [resolución=720p]'); process.exit(1); }
  const ruta = a1.startsWith('/') ? a1 : '/' + a1, s = Number(a2 || 5), res = a3 || '720p';
  const p = leerPrecio(await api('POST', '/estimate' + ruta, cuerpoBase(ruta, s, res)), s, res);
  console.log(`${ruta}  ${s} s  ${res}:  ${p.total != null ? p.total.toFixed(2) + ' $' : '¿?'}  (${p.porSegundo != null ? p.porSegundo + ' $/s' : 'sin tarifa'})`);
  if (p.tarifas && Object.keys(p.tarifas).length) console.log('  tarifas:', Object.entries(p.tarifas).map(([k, v]) => `${k} ${v} $/s`).join(' · '));
} else if (orden === 'lote') {
  const lote = JSON.parse(readFileSync(a1, 'utf8'));
  let suma = 0;
  for (const x of lote) {
    const s = x.cuerpo?.duration, res = x.cuerpo?.resolution;
    try {
      const p = leerPrecio(await api('POST', '/estimate' + x.ruta, x.cuerpo), s, res);
      suma += p.total || 0;
      console.log(`${(x.id || x.ruta).padEnd(40)} ${p.total != null ? p.total.toFixed(2).padStart(6) + ' $' : '     ¿?'}  ${x.ruta}`);
    } catch (e) { console.log(`${(x.id || x.ruta).padEnd(40)}  ERROR ${e.message}`); }
  }
  console.log(`${'TOTAL'.padEnd(40)} ${suma.toFixed(2).padStart(6)} $   (sin las piezas con ¿?)`);
} else if (orden === 'tabla') {
  const rutas = [
    ['/bytedance/seedance-2.5/image-to-video', '720p'], ['/bytedance/seedance-2.5/video-extend', '720p'],
    ['/bytedance/seedance-2.0/image-to-video', '720p'], ['/kling-video/o3/first-last-frame', '1080p'],
    ['/kling-video/v3.0/std/image-to-video', '720p'], ['/kling-video/v3.0/pro/image-to-video', '1080p'],
    ['/kling-video/v3.0-turbo/image-to-video', '720p'], ['/kling-video/v4.0/image-to-video', '1080p'],
    ['/kling-video/v4.0-flash/image-to-video', '720p'], ['/alibaba/wan-3.0/image-to-video', '720p'],
    ['/wan/v2.7/image-to-video', '720p'], ['/minimax/h3-lite/image-to-video', '768P'],
  ];
  console.log('ruta'.padEnd(44), 'tarifas por segundo (o total de 5 s)');
  for (const [ruta, res] of rutas) {
    try {
      const p = leerPrecio(await api('POST', '/estimate' + ruta, cuerpoBase(ruta, 5, res)), 5, res);
      const t = p.tarifas && Object.keys(p.tarifas).length ? Object.entries(p.tarifas).map(([k, v]) => `${k} ${v}`).join(' · ') : `5 s = ${p.total} $`;
      console.log(ruta.padEnd(44), t);
    } catch (e) { console.log(ruta.padEnd(44), 'ERROR', e.message); }
  }
  console.log(`\nPrecios de la API (self-serve) a ${new Date().toISOString().slice(0, 10)}. Apúntalos en pedir-assets-ia/scripts/precios.json.`);
} else {
  console.log('Órdenes: modelos [filtro] · precio <ruta> [s] [res] · lote <lote.json> · tabla');
  process.exit(1);
}
