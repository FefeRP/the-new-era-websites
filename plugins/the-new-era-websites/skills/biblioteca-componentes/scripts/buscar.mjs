#!/usr/bin/env node
// Busca en un catálogo propio de componentes UI (índice JSON) y muestra el código y el prompt de uno.
//
//   node buscar.mjs "fondo de partículas" [--categoria fondos] [--fuente magicui] [--con-vista] [--sin motion,tailwind]
//                   [--limite 15] [--json] [--con-referencias]
//   node buscar.mjs ver <id> [--codigo | --prompt | --demo | --todo]
//   node buscar.mjs fuentes            recuento por fuente y licencias
//   node buscar.mjs categorias         categorías con recuento
//
// La búsqueda admite frases en español o en inglés: puntúa por palabras que coinciden (no exige todas) y entiende
// sinónimos (revelar → reveal, cifra → number…).
//
// Dónde está el catálogo: variable BIBLIOTECA_COMPONENTES =
//   - una carpeta con indice.json y c/<fuente>/<slug>.json, o
//   - una URL base (https://…/datos). Si pide usuario y contraseña, sin escribirlos en el proyecto ni en el comando:
//       BIBLIOTECA_AUTH_FILE=/ruta/fuera/del/proyecto/acceso.txt   fichero con «usuario:clave» en una línea, o con
//                                                                 líneas «Usuario: …» y «Contraseña: …»
//       BIBLIOTECA_AUTH="usuario:clave"                            ya puesta en el entorno de la sesión
// Sin dependencias: Node 18+.
import fs from 'node:fs';
import path from 'node:path';

const ORIGEN = process.env.BIBLIOTECA_COMPONENTES;
if (!ORIGEN) {
  console.error('Falta BIBLIOTECA_COMPONENTES (carpeta o URL del catálogo con indice.json). Ver SKILL.md, «Dónde está el catálogo».');
  process.exit(2);
}
const esURL = /^https?:\/\//.test(ORIGEN);
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// usuario:clave desde el entorno o desde un fichero de fuera del proyecto (nunca se imprime)
function credenciales() {
  if (process.env.BIBLIOTECA_AUTH) return process.env.BIBLIOTECA_AUTH;
  const f = process.env.BIBLIOTECA_AUTH_FILE;
  if (!f) return null;
  let txt;
  try { txt = fs.readFileSync(f, 'utf8'); } catch { throw new Error('No se puede leer BIBLIOTECA_AUTH_FILE.'); }
  const lineas = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const campo = (re) => { const l = lineas.find((x) => re.test(norm(x))); return l ? l.replace(/^[^:=]*[:=]\s*/, '').trim() : null; };
  const usuario = campo(/^(usuario|user|username)\s*[:=]/);
  const clave = campo(/^(contrasena|clave|password|pass)\s*[:=]/);
  if (usuario && clave) return `${usuario}:${clave}`;
  const directa = lineas.find((l) => /^[^\s:]+:\S+$/.test(l) && !/^https?:/.test(l));
  if (directa) return directa;
  throw new Error('BIBLIOTECA_AUTH_FILE no tiene «usuario:clave» ni líneas «Usuario: …» y «Contraseña: …».');
}

async function leer(rel) {
  if (!esURL) return JSON.parse(fs.readFileSync(path.join(ORIGEN, rel), 'utf8'));
  const cab = {};
  const cred = credenciales();
  if (cred) cab.authorization = 'Basic ' + Buffer.from(cred).toString('base64');
  const r = await fetch(ORIGEN.replace(/\/$/, '') + '/' + rel, { headers: cab });
  if (r.status === 401) throw new Error('El catálogo pide usuario y contraseña: define BIBLIOTECA_AUTH_FILE (fichero fuera del proyecto) o BIBLIOTECA_AUTH en el entorno.');
  if (!r.ok) throw new Error(`HTTP ${r.status} al leer ${rel}`);
  return r.json();
}

// Español -> inglés (los componentes vienen descritos en inglés). Varias alternativas separadas por espacio.
const SIN = {
  fondo: 'background', fondos: 'background', boton: 'button', botones: 'button', tarjeta: 'card', tarjetas: 'card', texto: 'text',
  titulo: 'heading title', titular: 'heading headline title', carrusel: 'carousel slider', galeria: 'gallery', imagen: 'image',
  imagenes: 'image', foto: 'image photo', fotos: 'image photo', menu: 'menu', navegacion: 'nav', barra: 'bar', pie: 'footer',
  cabecera: 'header', portada: 'hero', precio: 'pricing', precios: 'pricing', testimonio: 'testimonial', testimonios: 'testimonial',
  resenas: 'review testimonial', opiniones: 'review testimonial', particulas: 'particle', estrellas: 'star', degradado: 'gradient',
  brillo: 'glow shine shimmer', luz: 'light spotlight', foco: 'spotlight', haz: 'beam', rejilla: 'grid', cuadricula: 'grid',
  mosaico: 'masonry bento', puntos: 'dot', ondas: 'wave ripple', onda: 'wave ripple', desplazamiento: 'scroll', raton: 'mouse cursor',
  puntero: 'cursor pointer', globo: 'globe', mapa: 'map', cubo: 'cube', formulario: 'form', campo: 'input field', buscador: 'search',
  ventana: 'dialog modal', modal: 'dialog modal', cajon: 'drawer sheet', lateral: 'sidebar', aviso: 'toast alert notification',
  notificacion: 'notification toast', cargando: 'loader loading spinner', carga: 'loader loading', esqueleto: 'skeleton',
  cronologia: 'timeline', pasos: 'step stepper', acordeon: 'accordion', preguntas: 'faq accordion', pestanas: 'tabs',
  interruptor: 'switch toggle', deslizador: 'slider', contador: 'counter number ticker', numero: 'number counter',
  numeros: 'number counter', cifra: 'number counter ticker', cifras: 'number counter stats', estadisticas: 'stats number',
  maquina: 'typewriter typing', escribe: 'typewriter typing', escribir: 'typewriter typing', revelar: 'reveal', revelado: 'reveal',
  revela: 'reveal', aparecer: 'fade reveal', aparece: 'fade reveal', difuminar: 'blur', desenfoque: 'blur', vidrio: 'glass',
  cristal: 'glass', magnetico: 'magnetic', iman: 'magnetic', movil: 'phone mobile', telefono: 'iphone phone', navegador: 'browser safari',
  codigo: 'code', icono: 'icon', iconos: 'icon', borde: 'border', sombra: 'shadow', ruido: 'noise', grano: 'grain noise',
  meteoros: 'meteor', confeti: 'confetti', marquesina: 'marquee', cinta: 'marquee ticker', infinito: 'infinite', apilado: 'stack',
  pila: 'stack', volteo: 'flip', voltear: 'flip', girar: 'rotate spin', gira: 'rotate spin', inclinar: 'tilt', logos: 'logo',
  logotipos: 'logo', arrastrar: 'drag', flotar: 'float', flotante: 'float floating dock', rebote: 'bounce spring', muelle: 'spring',
  orbita: 'orbit', lluvia: 'rain', nieve: 'snow', fuego: 'fire flame', humo: 'smoke', liquido: 'liquid fluid', comparar: 'compare comparison',
  antes: 'before compare', video: 'video', perfil: 'profile avatar', equipo: 'team', grafico: 'chart', progreso: 'progress',
  insignia: 'badge', etiqueta: 'tag badge', desplegable: 'dropdown select', lista: 'list', tabla: 'table', calendario: 'calendar',
  fecha: 'date calendar', subir: 'upload', archivo: 'file', valoracion: 'rating', linea: 'line', lineas: 'line', subrayado: 'underline',
  enlace: 'link', pegajoso: 'sticky', fijo: 'sticky fixed', palabras: 'word text', letras: 'letter text char', seccion: 'section block',
  llamada: 'cta', accion: 'cta', caracteristicas: 'feature', ventajas: 'feature', suave: 'smooth', animado: 'animated', animada: 'animated',
};
const VACIAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'que', 'con', 'se', 'en', 'para', 'por', 'y', 'o', 'al', 'a', 'solo',
  'como', 'the', 'of', 'with', 'and', 'for', 'to', 'in', 'on', 'that']);

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const tiene = (k) => args.includes(k);
const CON_VALOR = ['--categoria', '--fuente', '--limite', '--sin'];
const libres = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && CON_VALOR.includes(args[i - 1])));

const indice = await leer('indice.json');
const orden = libres[0];

// de qué depende un componente: paquetes npm + lo que el índice sepa de su pila (campo «usa»)
const dependeDe = (c) => norm([...(c.deps || []), ...(c.usa || []), ...(c.etiquetas || [])].join(' '));

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
  if (c.usa?.length) console.log(`Pila: ${c.usa.join(', ')}`);
  if (c.tecnica) console.log(`Técnica: ${c.tecnica}`);
  if (c.preview !== 'ok' && c.motivoSinPreview) console.log(`Sin vista previa fiable: ${c.motivoSinPreview}`);
  // aviso de rendimiento: clip-path y filter animados se repintan en cada fotograma
  const codigo = (d.ficheros || []).map((f) => f.codigo).join('\n') + (d.css || '');
  const caros = [];
  if (/clip-?path/i.test(codigo)) caros.push('clip-path');
  if (/(^|[^-\w])filter\s*[:=]|blur\(|backdrop-?filter|backdropFilter/i.test(codigo)) caros.push('filter/blur');
  if (caros.length && /(animate|transition|keyframes|motion\.|useScroll|gsap)/i.test(codigo)) {
    console.log(`Rendimiento: anima ${caros.join(' y ')}. Si va ligado al scroll o hay varios a la vez, cámbialo por transform + opacity (un contenedor con overflow:hidden y el contenido desplazado hace el mismo revelado) y mide.`);
  }
  const todo = tiene('--todo');
  if (tiene('--prompt') || todo) console.log('\n---------- PROMPT ----------\n' + d.prompt);
  if (tiene('--codigo') || todo || (!tiene('--prompt') && !tiene('--demo'))) for (const f of d.ficheros || []) console.log(`\n---------- ${f.ruta} ----------\n${f.codigo}`);
  if ((tiene('--demo') || todo) && d.demo?.length) for (const f of d.demo) console.log(`\n---------- demo: ${f.ruta} ----------\n${f.codigo}`);
  if ((todo || tiene('--codigo')) && d.css) console.log(`\n---------- CSS extra ----------\n${d.css}`);
  process.exit(0);
}

// búsqueda: cada palabra suma según dónde aparece; no hace falta que estén todas
const q = libres.join(' ');
const terminos = norm(q).split(/[^a-z0-9]+/).filter((t) => t && !VACIAS.has(t)).map((t) => ({ t, alt: (SIN[t] || '').split(' ').filter(Boolean) }));
const cat = opt('--categoria');
const fuente = opt('--fuente');
const sin = (opt('--sin') || '').split(',').map(norm).filter(Boolean);
const limite = Number(opt('--limite') || 15);
let lista = indice.componentes.filter((c) =>
  (tiene('--con-referencias') || c.tipo !== 'referencia') && (!cat || c.categoria === cat) && (!fuente || c.fuente === fuente) &&
  (!tiene('--con-vista') || c.preview === 'ok') && (!sin.length || !sin.some((s) => dependeDe(c).includes(s))));
const puntos = (c) => {
  const nombre = norm(`${c.nombre} ${c.slug}`);
  const etiquetas = norm([c.categoriaNombre, c.categoria, ...(c.etiquetas || [])].join(' '));
  const resto = norm([c.descripcion, c.tecnica, ...(c.deps || [])].join(' '));
  let p = 0, hallados = 0;
  for (const { t, alt } of terminos) {
    const en = (s) => s.includes(t) || alt.some((a) => s.includes(a));
    const v = en(nombre) ? 10 : en(etiquetas) ? 4 : en(resto) ? 2 : 0;
    if (v) hallados++;
    p += v;
  }
  if (!hallados) return null;
  return { p: hallados * 100 + p + (c.preview === 'ok' ? 1 : 0), hallados };
};
if (terminos.length) {
  lista = lista.map((c) => [c, puntos(c)]).filter(([, r]) => r).sort((a, b) => b[1].p - a[1].p).map(([c, r]) => ({ ...c, _hallados: r.hallados }));
}
if (tiene('--json')) { console.log(JSON.stringify(lista.slice(0, limite), null, 2)); process.exit(0); }
const completos = terminos.length > 1 ? lista.filter((c) => c._hallados === terminos.length).length : null;
console.log(`${lista.length} resultado(s)${q ? ` para «${q}»` : ''}${completos !== null ? ` (${completos} con todas las palabras)` : ''}${lista.length > limite ? `; muestro ${limite}` : ''}:`);
for (const c of lista.slice(0, limite)) {
  const parcial = terminos.length > 1 && c._hallados < terminos.length ? `, ${c._hallados} de ${terminos.length} palabras` : '';
  console.log(`- ${c.id}  ·  ${c.nombre}  [${c.categoriaNombre}${c.preview === 'ok' ? ', con vista' : ''}${c.tipo === 'referencia' ? ', solo referencia' : ''}${parcial}]`);
  const linea = c.descripcion || c.tecnica;
  if (linea) console.log(`    ${linea.slice(0, 150)}`);
  if (c.deps?.length || c.usa?.length) console.log(`    deps: ${(c.deps || []).slice(0, 8).join(' ') || '-'}${c.deps?.length > 8 ? ' …' : ''}${c.usa?.length ? `  ·  pila: ${c.usa.join(', ')}` : ''}  ·  ${c.licencia}`);
}
