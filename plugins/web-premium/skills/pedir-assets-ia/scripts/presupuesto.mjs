#!/usr/bin/env node
// presupuesto.mjs: estima lo que cuesta un plan de assets de IA ANTES de generar nada, lo ordena por fases (de lo barato a lo
// caro: imágenes clave → prueba corta de vídeo → finales) y avisa si no cabe en el presupuesto del usuario.
// Precios en precios.json (orientativos, con fecha y fuente: confírmalos en el proveedor antes de pedir el vale).
//
//   node presupuesto.mjs plan.json [--presupuesto 10] [--precios precios.json]
//   node presupuesto.mjs --ejemplo > plan.json      (plan de ejemplo: zoom a la pantalla de un portátil, día y noche)
//   node presupuesto.mjs --modelos                   (lista de modelos y precios conocidos)
//
// plan.json: { "proyecto": "...", "presupuesto_usd": 10, "piezas": [
//   { "id": "clave", "tipo": "imagen", "modelo": "qwen-image-3", "resolucion": "2k", "cantidad": 3, "fase": "1-claves" },
//   { "id": "prueba", "tipo": "video", "modelo": "kling-o3-pro", "resolucion": "1080p", "segundos": 3, "fase": "2-prueba" },
//   { "id": "zoom", "tipo": "video", "modelo": "kling-o3-pro", "resolucion": "1080p", "segundos": 5, "tiradas": 2, "fase": "3-final" },
//   { "id": "qa", "tipo": "revision", "cantidad": 4, "fase": "3-final" } ] }
// "cantidad" = piezas distintas; "tiradas" = intentos que esperas por pieza en el peor caso (por defecto 1 imagen clave: 3, resto: 2).
// "gastado_usd" (opcional, por pieza) = lo ya cobrado, para llevar la cuenta.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const op = (k, def) => { const i = argv.indexOf(`--${k}`); return i !== -1 ? argv[i + 1] : def; };
const aqui = dirname(fileURLToPath(import.meta.url));
const precios = JSON.parse(readFileSync(op('precios', join(aqui, 'precios.json')), 'utf8'));

if (argv.includes('--ejemplo')) {
  console.log(JSON.stringify({
    proyecto: 'Zoom a la pantalla de un portátil (día y noche)',
    presupuesto_usd: 5,
    piezas: [
      { id: 'clave-dia', tipo: 'imagen', modelo: 'qwen-image-3', resolucion: '2k', cantidad: 3, tiradas: 1, fase: '1-claves', nota: '3 variantes para elegir' },
      { id: 'final-dia', tipo: 'imagen', modelo: 'qwen-image-3', resolucion: '2k', cantidad: 1, fase: '1-claves', nota: 'otra toma, cámara más cerca (edición)' },
      { id: 'claves-noche', tipo: 'imagen', modelo: 'qwen-image-3', resolucion: '2k', cantidad: 2, fase: '1-claves', nota: 'relight de clave y final' },
      { id: 'prueba-zoom', tipo: 'video', modelo: 'kling-o3-pro', resolucion: '1080p', segundos: 3, cantidad: 1, tiradas: 1, fase: '2-prueba' },
      { id: 'zoom-dia', tipo: 'video', modelo: 'kling-o3-pro', resolucion: '1080p', segundos: 5, cantidad: 1, fase: '3-final' },
      { id: 'zoom-noche', tipo: 'video', modelo: 'kling-o3-pro', resolucion: '1080p', segundos: 5, cantidad: 1, fase: '3-final' },
      { id: 'qa', tipo: 'revision', cantidad: 4, tiradas: 1, fase: '3-final' },
    ],
  }, null, 2));
  process.exit(0);
}
if (argv.includes('--modelos')) {
  console.log(`Precios orientativos (${precios.actualizado}). ${precios.nota}\n`);
  for (const [tipo, lista] of Object.entries({ video: precios.video, imagen: precios.imagen })) {
    console.log(tipo.toUpperCase());
    for (const [id, m] of Object.entries(lista)) {
      const tarifa = tipo === 'video' ? m.usd_por_segundo : m.usd_por_imagen;
      const t = Object.entries(tarifa).map(([r, v]) => `${r} ${v} $`).join(' · ');
      console.log(`  ${id.padEnd(22)} ${t.padEnd(38)} ${m.via}${m.inicio_fin ? ' · inicio+fin' : ''}${m.edita ? ' · edita' : ''}${m.confirmado === false ? ' · SIN CONFIRMAR' : ''}`);
    }
  }
  process.exit(0);
}

const rutaPlan = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
if (!rutaPlan || !existsSync(rutaPlan)) {
  console.error('Uso: node presupuesto.mjs plan.json [--presupuesto 10]   ·   --ejemplo   ·   --modelos');
  process.exit(2);
}
const plan = JSON.parse(readFileSync(rutaPlan, 'utf8'));
const presupuesto = Number(op('presupuesto', plan.presupuesto_usd ?? NaN));

function tarifa(p) {
  if (p.tipo === 'revision') {
    const r = precios.revision[p.modelo ?? 'gemini-flash'];
    if (!r) throw new Error(`Modelo de revisión desconocido "${p.modelo}" en la pieza ${p.id} (hay: ${Object.keys(precios.revision).join(', ')}).`);
    return { unidad: r.usd_por_clip, texto: `${r.usd_por_clip} $/clip`, m: r }; }
  const lista = p.tipo === 'video' ? precios.video : precios.imagen;
  const m = lista[p.modelo];
  if (!m) throw new Error(`Modelo desconocido "${p.modelo}" en la pieza ${p.id}. Usa --modelos para ver los que hay o añádelo a precios.json.`);
  const t = p.tipo === 'video' ? m.usd_por_segundo : m.usd_por_imagen;
  const res = p.resolucion ?? Object.keys(t)[0];
  if (t[res] == null) throw new Error(`${p.modelo} no tiene precio para "${res}" (hay: ${Object.keys(t).join(', ')})`);
  if (p.tipo === 'video') return { unidad: t[res] * (p.segundos ?? 5), texto: `${t[res]} $/s × ${p.segundos ?? 5} s`, m, res };
  return { unidad: t[res], texto: `${t[res]} $/img`, m, res };
}

const filas = [];
let esperado = 0, peor = 0, gastado = 0;
const fases = new Map();
for (const p of plan.piezas) {
  const { unidad, texto, m, res } = tarifa(p);
  const cantidad = p.cantidad ?? 1;
  const tiradas = p.tiradas ?? (p.tipo === 'imagen' ? 3 : p.tipo === 'video' ? 2 : 1);
  const e = unidad * cantidad, w = unidad * cantidad * tiradas;
  esperado += e; peor += w; gastado += p.gastado_usd ?? 0;
  const f = p.fase ?? '-';
  const acc = fases.get(f) ?? { e: 0, w: 0 }; acc.e += e; acc.w += w; fases.set(f, acc);
  filas.push({ f, id: p.id, modelo: `${p.modelo ?? p.tipo}${res ? ' ' + res : ''}`, texto, cantidad, tiradas, e, w, m, p });
}
const $ = (v) => `${v.toFixed(2)} $`;
console.log(`\n${plan.proyecto ?? 'Plan'} · precios de ${precios.actualizado} (orientativos)\n`);
console.log('fase       pieza              modelo                    tarifa                 n × tir.   esperado   peor caso');
for (const r of filas.sort((a, b) => a.f.localeCompare(b.f))) {
  console.log(`${r.f.padEnd(10)} ${r.id.padEnd(18)} ${r.modelo.padEnd(25)} ${r.texto.padEnd(22)} ${String(r.cantidad).padStart(2)} × ${r.tiradas}   ${$(r.e).padStart(8)}   ${$(r.w).padStart(8)}${r.m.confirmado === false ? '  (precio sin confirmar)' : ''}`);
}
console.log('\nPor fases (para y enseña el resultado al acabar cada una):');
let acumulado = 0;
for (const [f, v] of [...fases].sort()) { acumulado += v.e; console.log(`  ${f.padEnd(10)} esperado ${$(v.e).padStart(8)} · peor ${$(v.w).padStart(8)} · acumulado esperado ${$(acumulado)}`); }
console.log(`\nTOTAL esperado ${$(esperado)} · peor caso ${$(peor)}${gastado ? ` · ya gastado ${$(gastado)}` : ''}`);

// alternativas más baratas para cada vídeo (mismo requisito de inicio+fin si el modelo elegido lo tiene)
const sugerencias = [];
for (const r of filas.filter((x) => x.p.tipo === 'video')) {
  const actual = r.e / (r.cantidad || 1) / (r.p.segundos ?? 5);
  const esPrueba = /prueba|test/i.test(r.f) || /prueba|test/i.test(r.id);
  const resOk = (res) => res === (r.p.resolucion ?? '1080p') || (esPrueba && res === '720p'); // en finales, misma resolución
  const opciones = Object.entries(precios.video)
    .filter(([id, m]) => id !== r.p.modelo && (!r.m.inicio_fin || m.inicio_fin))
    .flatMap(([id, m]) => Object.entries(m.usd_por_segundo).filter(([res]) => resOk(res)).map(([res, v]) => ({ id, res, v })))
    .filter((o) => o.v < actual * 0.75).sort((a, b) => a.v - b.v).slice(0, 2);
  if (opciones.length) sugerencias.push(`  ${r.id}: ${opciones.map((o) => `${o.id} ${o.res} (${o.v} $/s)`).join(', ')} — más barato; pruébalo en la fase de prueba antes de cambiar`);
}
if (sugerencias.length) console.log('\nAlternativas más baratas para probar:\n' + sugerencias.join('\n'));

if (Number.isFinite(presupuesto)) {
  const restante = presupuesto - gastado;
  if (esperado > restante) {
    console.log(`\nNO CABE: el esperado (${$(esperado)}) pasa del presupuesto disponible (${$(restante)}). Quita piezas, baja duración o resolución, o usa imagen + movimiento por código donde no haga falta vídeo.`);
    process.exit(1);
  }
  if (peor > restante) console.log(`\nCabe el esperado, pero el peor caso (${$(peor)}) pasa del presupuesto (${$(restante)}): para tras la fase de prueba y vuelve a estimar.`);
  else console.log(`\nCabe en el presupuesto (${$(restante)} disponibles) incluso en el peor caso.`);
}
console.log('Antes de generar: enseña este presupuesto y espera el vale. Confirma el precio en el proveedor (muchos tienen un "estimate" gratis).');
