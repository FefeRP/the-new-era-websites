#!/usr/bin/env node
// Crea una web nueva a partir de la plantilla base y copia los motores de las técnicas elegidas.
// Uso: node nueva-web.mjs <carpeta-destino> [--con frames,pantalla,video,alfa,capas,fondo,revelados,rastro,3d,mapa,mapa-imagen,lente,envase,componentes,tarjeta,carrusel,resenas]
//        [--modulos 3d,video-ia,scroll,assets,biblioteca,mapa]  (copia los motores típicos de cada módulo activo; se suma a --con)
//        [--titulo "…"] [--descripcion "…"] [--marca "…"]
//        [--fondo "#171412"] [--texto "#efe9e1"] [--acento "#c9a46a"] [--fuente "Inter"] [--fuente-display "…"]
// No instala nada: al terminar te dice el npm install que toca.

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const skills = resolve(aqui, '..', '..');            // .../skills
const plantilla = resolve(aqui, '..', 'plantilla');

const argv = process.argv.slice(2);
const destino = argv.find((a) => !a.startsWith('--') && !argv[argv.indexOf(a) - 1]?.startsWith('--'));
const op = (k, def) => { const i = argv.indexOf(`--${k}`); return i !== -1 ? argv[i + 1] : def; };
if (!destino) { console.error('Uso: node nueva-web.mjs <destino> [--con frames,pantalla,video,alfa,capas,fondo,revelados,rastro,3d,mapa,mapa-imagen,lente,envase,componentes,tarjeta,carrusel,resenas] [--titulo …] [--descripcion …] [--marca …] [--fondo …] [--texto …] [--acento …] [--fuente …] [--fuente-display …]'); process.exit(2); }
const dst = resolve(destino);
const vars = {
  '{{TITULO}}': op('titulo', 'Web nueva'), '{{DESCRIPCION}}': op('descripcion', ''), '{{MARCA}}': op('marca', 'Marca'),
  '{{COLOR_FONDO}}': op('fondo', '#141210'), '{{COLOR_TEXTO}}': op('texto', '#efe9e1'), '{{COLOR_ACENTO}}': op('acento', '#c9a46a'),
  '{{FUENTE}}': op('fuente', 'Inter'), '{{FUENTE_DISPLAY}}': op('fuente-display', op('fuente', 'Inter')),
};
// Copia la plantilla fichero a fichero sin pisar nada que ya exista (sirve para webs nuevas y para carpetas con activos).
const copiar = (rel = '') => {
  for (const nombre of readdirSync(join(plantilla, rel))) {
    const r = join(rel, nombre), origen = join(plantilla, r), fin = join(dst, r);
    if (statSync(origen).isDirectory()) { mkdirSync(fin, { recursive: true }); copiar(r); continue; }
    if (existsSync(fin)) { console.log(`ya existe, no lo toco: ${r}`); continue; }
    if (/\.(html|css|js|json|md)$/.test(nombre)) {
      let t = readFileSync(origen, 'utf8');
      for (const [k, v] of Object.entries(vars)) t = t.split(k).join(v);
      writeFileSync(fin, t);
    } else copyFileSync(origen, fin);
  }
};
mkdirSync(dst, { recursive: true });
copiar();

const motores = {
  frames: [['scroll-frames', 'frame-scrubber.js']],
  pantalla: [['scroll-frames', 'frame-scrubber.js'], ['seguir-pantalla', 'capa-pantalla.js']], // web/logo real sobre el vídeo
  video: [['scroll-frames', 'video-scrubber.js']],
  capas: [['parallax-capas', 'capas-parallax.js']],
  fondo: [['parallax-capas', 'fondo-capas.js'], ['parallax-capas', 'capas-parallax.js']],         // fondo por capas que cambian por escena
  '3d': [['escena-3d-gltf', 'escena-producto.js']],
  mapa: [['mapa-zoom-ubicacion', 'mapa-scroll.js']],
  'mapa-imagen': [['mapa-zoom-ubicacion', 'mapa-imagen.js']],                                  // mapa por niveles de imagen
  lente: [['lente-revelado', 'lente-revelado.js']],
  envase: [['envase-giratorio', 'envase-giratorio.js']],
  alfa: [['capas-alfa', 'video-alfa.js']],                                                     // vídeo con fondo transparente
  revelados: [['revelados-y-transiciones', 'revelados.js']],
  rastro: [['rastro-cursor', 'rastro-cursor.js']],
  tarjeta: [['componentes-interactivos', 'tarjeta-volteo.js']],
  carrusel: [['componentes-interactivos', 'carrusel-orbital.js']],
  resenas: [['componentes-interactivos', 'resenas-3d.js']],
  componentes: [['componentes-interactivos', 'tarjeta-volteo.js'], ['componentes-interactivos', 'carrusel-orbital.js'], ['componentes-interactivos', 'resenas-3d.js']],
};
const extra = { '3d': 'three', mapa: 'maplibre-gl' };   // dependencias que añade cada técnica
// Módulos de new-era (references/modulos/): cada uno trae sus motores típicos. La base no copia nada por defecto.
const porModulo = { '3d': ['3d'], 'video-ia': ['frames', 'video'], scroll: ['frames', 'video'], assets: ['alfa', 'capas'], biblioteca: [], mapa: ['mapa'] };
const modulos = (op('modulos', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
for (const m of modulos) if (!porModulo[m]) console.warn(`módulo desconocido: ${m} (usa: ${Object.keys(porModulo).join(', ')})`);
const con = [...new Set([...(op('con', '') || '').split(',').map((s) => s.trim()).filter(Boolean), ...modulos.flatMap((m) => porModulo[m] || [])])];
const lib = join(dst, 'src', 'lib');
mkdirSync(lib, { recursive: true });
const deps = new Set(['gsap', 'lenis']);
for (const c of con) {
  if (!motores[c]) { console.warn(`técnica desconocida: ${c} (usa: ${Object.keys(motores).join(', ')})`); continue; }
  for (const [skill, fichero] of motores[c]) {
    copyFileSync(join(skills, skill, 'scripts', fichero), join(lib, fichero));
    console.log(`motor: src/lib/${fichero}`);
  }
  if (extra[c]) deps.add(extra[c]);
}
console.log(`\nWeb lista en ${dst}`);
if (modulos.length) console.log(`Módulos activos: ${modulos.join(', ')} (apúntalos en BRIEF.md con su motivo y lee references/modulos/ de new-era)`);
if (modulos.includes('biblioteca')) console.log('Biblioteca: busca cada pieza de interfaz con la skill biblioteca-componentes antes de escribirla');
const mas = [...deps].filter((d) => d !== 'gsap' && d !== 'lenis');
console.log(`Siguiente: cd "${dst}" && npm install${mas.length ? ` && npm install ${mas.join(' ')}` : ''} && npm run dev`);
if (con.includes('mapa'))
  console.log(`Mapa: copia el patrón de ${join(skills, 'mapa-zoom-ubicacion', 'references', 'patrones-codigo.md')} (worker de Vite, CSS, atribución)`);
if (con.includes('lente'))
  console.log(`Lente: variantes alineadas con node "${join(skills, 'lente-revelado', 'scripts', 'variantes-revelado.mjs')}" --entrada base.png --salida "${join(dst, 'public', 'revelado')}"`);
if (con.includes('pantalla'))
  console.log(`Pantalla: pista con node "${join(skills, 'seguir-pantalla', 'scripts', 'seguir-pantalla.mjs')}" video.mp4 --esquinas "x,y x,y x,y x,y" --clave "<fin>=x,y …" --salida "${join(dst, 'public', 'frames', '<nombre>', 'pista.json')}" --revision rev`);
if (con.includes('alfa'))
  console.log(`Alfa: node "${join(skills, 'capas-alfa', 'scripts', 'alfa.mjs')}" --entrada video.mp4 --modo croma --salida "${join(dst, 'public', 'alfa', '<nombre>')}"`);
if (con.includes('frames') || con.includes('video') || con.includes('pantalla'))
  console.log(`Frames: node "${join(skills, 'scroll-frames', 'scripts', 'extraer-frames.mjs')}" video.mp4 "${join(dst, 'public', 'frames', '<nombre>')}"${con.includes('video') ? ' --video-scrub' : ''}`);
