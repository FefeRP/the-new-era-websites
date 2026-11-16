#!/usr/bin/env node
// Busca en un catálogo propio de componentes UI (índice JSON) y muestra el código y el prompt de uno.
//
//   node buscar.mjs "fondo de partículas" [--categoria fondos] [--fuente magicui] [--con-vista] [--limite 15] [--json]
//   node buscar.mjs ver <id> [--codigo | --prompt | --demo | --todo]
//   node buscar.mjs fuentes            recuento por fuente y licencias
//   node buscar.mjs categorias         categorías con recuento
//
// Dónde está el catálogo: variable BIBLIOTECA_COMPONENTES =
//   - una carpeta con indice.json y c/<fuente>/<slug>.json, o
//   - una URL base (https://…/datos). Si pide usuario y contraseña, ponlos en BIBLIOTECA_AUTH="usuario:clave"
//     (en el entorno, nunca en ficheros del proyecto).
// Sin dependencias: Node 18+.
import fs from 'node:fs';
import path from 'node:path';

const ORIGEN = process.env.BIBLIOTECA_COMPONENTES;
if (!ORIGEN) {
  console.error('Falta BIBLIOTECA_COMPONENTES (carpeta o URL del catálogo con indice.json). Ver SKILL.md, «Dónde está el catálogo».');
  process.exit(2);
}
const esURL = /^https?:\/\//.test(ORIGEN);

async function leer(rel) {
  if (!esURL) return JSON.parse(fs.readFileSync(path.join(ORIGEN, rel), 'utf8'));
  const cab = {};
  if (process.env.BIBLIOTECA_AUTH) cab.authorization = 'Basic ' + Buffer.from(process.env.BIBLIOTECA_AUTH).toString('base64');
  const r = await fetch(ORIGEN.replace(/\/$/, '') + '/' + rel, { headers: cab });
  if (r.status === 401) throw new Error('El catálogo pide usuario y contraseña: define BIBLIOTECA_AUTH="usuario:clave".');
  if (!r.ok) throw new Error(`HTTP ${r.status} al leer ${rel}`);
  return r.json();
}

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// Español -> inglés (los componentes vienen descritos en inglés)
const SIN = {
  fondo: 'background', fondos: 'background', boton: 'button', botones: 'button', tarjeta: 'card', tarjetas: 'card', texto: 'text',
  titulo: 'heading', titular: 'heading', carrusel: 'carousel', galeria: 'gallery', imagen: 'image', menu: 'menu', navegacion: 'nav',
  barra: 'bar', pie: 'footer', cabecera: 'header', precio: 'pricing', precios: 'pricing', testimonio: 'testimonial', testimonios: 'testimonial',
  resenas: 'review', particulas: 'particle', estrellas: 'star', degradado: 'gradient', brillo: 'glow', luz: 'light', haz: 'beam',
  rejilla: 'grid', puntos: 'dot', ondas: 'wave', desplazamiento: 'scroll', raton: 'mouse', globo: 'globe', mapa: 'map', cubo: 'cube',
  formulario: 'form', buscador: 'search', ventana: 'dialog', aviso: 'toast', cargando: 'loader', carga: 'loader', esqueleto: 'skeleton',
  cronologia: 'timeline', acordeon: 'accordion', preguntas: 'faq', pestanas: 'tabs', interruptor: 'switch', deslizador: 'slider',
  contador: 'counter', numero: 'number', maquina: 'typewriter', revelar: 'reveal', aparecer: 'fade', difuminar: 'blur', vidrio: 'glass',
  cristal: 'glass', magnetico: 'magnetic', movil: 'phone', telefono: 'iphone', navegador: 'browser', codigo: 'code', icono: 'icon',
  borde: 'border', sombra: 'shadow', ruido: 'noise', grano: 'grain', meteoros: 'meteor', confeti: 'confetti', marquesina: 'marquee',
  cinta: 'marquee', infinito: 'infinite', apilado: 'stack', pila: 'stack', volteo: 'flip', girar: 'rotate', inclinar: 'tilt', logos: 'logo',
};

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const tiene = (k) => args.includes(k);
const libres = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--categoria', '--fuente', '--limite'].includes(args[i - 1])));

const indice = await leer('indice.json');
const orden = libres[0];

if (orden === 'fuentes') {
  const lic = new Map();
  for (const c of indice.componentes) if (!lic.has(c.fuente)) lic.set(c.fuente, c.licencia);
  for (const f of indice.fuentes) {
    const r = indice.recuento?.[f.id] || {};
    console.log(`${f.id.padEnd(18)} ${String(r.componentes ?? 0).padStart(4)} comp. ${String(r.conVista ?? 0).padStart(4)} con vista ${String(r.referencias ?? 0).padStart(4)} ref.  ${lic.get(f.id) || ''}`);
  }
  process.exit(0);
}
if (orden === 'categorias') {
  const n = new Map();
  for (const c of indice.componentes) if (c.tipo === 'importado') n.set(c.categoria, (n.get(c.categoria) || 0) + 1);
  for (const c of indice.categorias) if (n.get(c.id)) console.log(`${c.id.padEnd(14)} ${String(n.get(c.id)).padStart(4)}  ${c.nombre}`);
  process.exit(0);
}
if (orden === 'ver') {
  const id = libres[1];
  const c = indice.componentes.find((x) => x.id === id);
  if (!c) { console.error('No existe', id, '(usa el id que da la búsqueda, p. ej. magicui/magic-card)'); process.exit(1); }
  console.log(`# ${c.nombre}  (${c.id})\n${c.descripcion}\nFuente: ${c.fuenteNombre} · Autor: ${c.autor || '-'} · Licencia: ${c.licencia || '-'}\nOriginal: ${c.url || '-'}`);
  if (c.tipo === 'referencia') { console.log('\nSolo referencia (de pago, tras login o descartada): no hay código. Ábrelo en su web.'); process.exit(0); }
  const d = await leer(`c/${c.id}.json`);
  console.log(`Dependencias: ${(d.deps || []).join(' ') || 'ninguna'}${d.regDeps?.length ? `\nBase de shadcn/ui u otros del registro: ${d.regDeps.join(', ')}` : ''}`);
  if (c.preview !== 'ok' && c.motivoSinPreview) console.log(`Sin vista previa: ${c.motivoSinPreview}`);
  const todo = tiene('--todo');
  if (tiene('--prompt') || todo) console.log('\n---------- PROMPT ----------\n' + d.prompt);
  if (tiene('--codigo') || todo || (!tiene('--prompt') && !tiene('--demo'))) for (const f of d.ficheros || []) console.log(`\n---------- ${f.ruta} ----------\n${f.codigo}`);
  if ((tiene('--demo') || todo) && d.demo?.length) for (const f of d.demo) console.log(`\n---------- demo: ${f.ruta} ----------\n${f.codigo}`);
  if ((todo || tiene('--codigo')) && d.css) console.log(`\n---------- CSS extra ----------\n${d.css}`);
  process.exit(0);
}

// búsqueda
const q = libres.join(' ');
const terminos = norm(q).split(/\s+/).filter(Boolean).map((t) => ({ t, alt: SIN[t] }));
const cat = opt('--categoria');
const fuente = opt('--fuente');
const limite = Number(opt('--limite') || 15);
let lista = indice.componentes.filter((c) =>
  (tiene('--con-referencias') || c.tipo !== 'referencia') && (!cat || c.categoria === cat) && (!fuente || c.fuente === fuente) && (!tiene('--con-vista') || c.preview === 'ok'));
const puntos = (c) => {
  const todo = norm([c.nombre, c.slug, c.descripcion, c.categoriaNombre, ...(c.etiquetas || []), ...(c.deps || [])].join(' '));
  const nombre = norm(c.nombre);
  let p = 0;
  for (const { t, alt } of terminos) {
    const en = (s) => s.includes(t) || (alt && s.includes(alt));
    if (!en(todo)) return -1;
    p += en(nombre) ? 10 : en(norm((c.etiquetas || []).join(' '))) ? 4 : 1;
  }
  return p + (c.preview === 'ok' ? 1 : 0);
};
if (terminos.length) lista = lista.map((c) => [c, puntos(c)]).filter(([, p]) => p >= 0).sort((a, b) => b[1] - a[1]).map(([c]) => c);
if (tiene('--json')) { console.log(JSON.stringify(lista.slice(0, limite), null, 2)); process.exit(0); }
console.log(`${lista.length} resultado(s)${q ? ` para «${q}»` : ''}${lista.length > limite ? `; muestro ${limite}` : ''}:`);
for (const c of lista.slice(0, limite)) {
  console.log(`- ${c.id}  ·  ${c.nombre}  [${c.categoriaNombre}${c.preview === 'ok' ? ', con vista' : ''}${c.tipo === 'referencia' ? ', solo referencia' : ''}]`);
  if (c.descripcion) console.log(`    ${c.descripcion.slice(0, 150)}`);
  if (c.deps?.length) console.log(`    deps: ${c.deps.slice(0, 8).join(' ')}${c.deps.length > 8 ? ' …' : ''}  ·  ${c.licencia}`);
}
