#!/usr/bin/env node
// procesar-clips.mjs: banco de pruebas de clips e imágenes generados con IA para webs de scroll.
// Cada fichero que llega a <datos>/entrada se nombra, se mide, se prepara para la web (frames, bucle, alfa, recorte), se
// monta solo en una página con scroll, se captura y queda apuntado en un registro (modelo, prompt, ajustes, medidas, nota).
// Sin dependencias propias: Node 20+, ffmpeg/ffprobe (FFMPEG / FFPROBE o el PATH) y, para las capturas, playwright-core
// con un Chrome instalado (se busca en el directorio actual y en demos/reloj).
//
//   node pruebas/clips-ia/procesar-clips.mjs iniciar                      crea la carpeta de datos
//   node pruebas/clips-ia/procesar-clips.mjs siguiente [N]               las N pruebas siguientes de la batería, con su prompt
//   node pruebas/clips-ia/procesar-clips.mjs lanzada <id> <modelo> [--ajustes "720p 5s"] [--cambio "qué varía"]
//                                                                         apunta que acabas de lanzar esa generación
//   node pruebas/clips-ia/procesar-clips.mjs procesar [--vigilar] [--sin-demo]   procesa lo que haya en entrada/
//   node pruebas/clips-ia/procesar-clips.mjs nota <nombre> BUENO|REGULAR|MALO "qué se ve" [--leccion "…"]
//   node pruebas/clips-ia/procesar-clips.mjs costura <nombreA> <nombreB> empalme entre dos clips encadenados
//   node pruebas/clips-ia/procesar-clips.mjs indice                       rehace el registro y el comparador
// Opción común: --datos <carpeta> (por defecto ./banco-clips; tiene que estar dentro del repo para las capturas).
//
// Nombres: <id>-<modelo>-v<N>.<ext>, con id = <pieza>-p<NN> (p. ej. giro-p01-kling30-v2.mp4). Un fichero que llega con
// otro nombre (la descarga tal cual) se asigna a la generación más antigua apuntada con "lanzada" que siga pendiente.

import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import os from 'node:os';
import { buscarBinario, medirClip, medirCostura, sondear } from './medir-clip.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..', '..');
const SK = join(raiz, 'plugins', 'the-new-era-websites', 'skills');
const EXTRAER = join(SK, 'scroll-frames', 'scripts', 'extraer-frames.mjs');
const ALFA = join(SK, 'capas-alfa', 'scripts', 'alfa.mjs');
const SERVIDOR = join(raiz, 'pruebas', 'servidor-estatico.mjs');

const argv = process.argv.slice(2);
const pos = []; const op = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) { const s = argv[i + 1]; if (s === undefined || s.startsWith('--')) op[a.slice(2)] = true; else { op[a.slice(2)] = s; i++; } }
  else pos.push(a);
}
const orden = pos[0];
const DATOS = resolve(op.datos ?? 'banco-clips');
const D = { entrada: join(DATOS, 'entrada'), clips: join(DATOS, 'clips'), refs: join(DATOS, 'referencias'), proc: join(DATOS, 'procesado') };
const F = { bateria: join(DATOS, 'bateria.json'), cola: join(DATOS, 'cola.json'), reg: join(DATOS, 'registro.json'), regMd: join(DATOS, 'registro.md') };
const leer = (f, defecto) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : defecto);
const guardar = (f, o) => writeFileSync(f, JSON.stringify(o, null, 2) + '\n');
const ahora = () => { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
const VIDEO = new Set(['.mp4', '.webm', '.mov', '.mkv']); const IMAGEN = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const TIPOS_VIDEO = new Set(['scrub', 'transicion', 'bucle', 'fondo', 'alfa-video']);
const RE = /^([a-z0-9]+-p\d{2})-([a-z0-9.]+)-v(\d+)$/i;
const kb = (f) => (existsSync(f) ? Math.round(statSync(f).size / 1024) : 0);
function pesoCarpeta(c) { let t = 0; if (!existsSync(c)) return 0; for (const e of readdirSync(c, { withFileTypes: true })) { const p = join(c, e.name); t += e.isDirectory() ? pesoCarpeta(p) : statSync(p).size; } return t; }

let ffmpeg; const FF = () => (ffmpeg ??= buscarBinario('ffmpeg'));
function ff(args) { const r = spawnSync(FF(), ['-hide_banner', '-v', 'error', '-y', ...args], { encoding: 'utf8' }); if (r.status !== 0) throw new Error('ffmpeg: ' + String(r.stderr).slice(-500)); }
function nodo(script, args) { const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); if (r.status !== 0) throw new Error(basename(script) + ': ' + (r.stderr || r.stdout).slice(-700)); return r.stdout; }
function bateria() { return leer(F.bateria, { pruebas: [] }).pruebas ?? []; }
function prueba(id) { return bateria().find((p) => p.id.toLowerCase() === String(id).toLowerCase()); }

function iniciar() {
  for (const d of Object.values(D)) mkdirSync(d, { recursive: true });
  if (!existsSync(F.bateria)) guardar(F.bateria, { nota: 'Una entrada por prueba: id (<pieza>-p<NN>), bloque, prioridad, tecnica, tipo (scrub | transicion | bucle | fondo | alfa-video | imagen | imagen-alfa), titulo, objetivo, modelo, ajustes, prompt, referencias, variantes, evaluar. Opcionales: alfa (croma | negro | blanco | ya-alfa), mosaico (true), extraer ({inicio, fin}), porVariante ({"<N>": {campos que cambian en esa variante}}).', pruebas: [] });
  if (!existsSync(F.cola)) guardar(F.cola, []);
  if (!existsSync(F.reg)) guardar(F.reg, []);
}

// ---------- siguiente / lanzada ----------
function hechasDe(id, reg) { return reg.filter((r) => r.prueba === id).length; }
function siguiente(n = 1) {
  const reg = leer(F.reg, []); const cola = leer(F.cola, []);
  const pend = bateria().filter((p) => hechasDe(p.id, reg) + cola.filter((c) => c.id === p.id).length < (p.variantes ?? 2))
    .sort((a, b) => (a.prioridad ?? 9) - (b.prioridad ?? 9));
  if (!pend.length) return console.log('No quedan pruebas pendientes en la batería.');
  for (const p of pend.slice(0, n)) {
    const v = hechasDe(p.id, reg) + cola.filter((c) => c.id === p.id).length + 1;
    console.log(`\n=== ${p.id} · ${p.titulo} (prioridad ${p.prioridad ?? '-'}, variante ${v} de ${p.variantes ?? 2}) ===`);
    console.log(`Técnica: ${p.tecnica} · tipo ${p.tipo}`);
    console.log(`Modelo: ${p.modelo} · ${p.ajustes ?? ''}`);
    if (p.referencias?.length) console.log('Referencias: ' + p.referencias.join(' | '));
    console.log('Prompt:\n' + p.prompt);
    if (p.cambios?.[v - 1]) console.log(`En esta variante: ${p.cambios[v - 1]}`);
    console.log(`Al lanzarla: node pruebas/clips-ia/procesar-clips.mjs lanzada ${p.id} <modelo> --datos ${relative(process.cwd(), DATOS) || '.'}`);
  }
  console.log(`\nQuedan ${pend.length} pruebas con variantes pendientes.`);
}
function lanzada(id, modelo) {
  const p = prueba(id); if (!p) throw new Error(`No existe la prueba ${id} en bateria.json`);
  if (!modelo || !/^[a-z0-9.]+$/i.test(modelo)) throw new Error('Falta el modelo en forma corta (kling30, seedance20, veo3, nanobanana…)');
  const reg = leer(F.reg, []); const cola = leer(F.cola, []);
  const usados = [...reg.filter((r) => r.prueba === p.id && r.modeloCorto === modelo).map((r) => r.variante), ...cola.filter((c) => c.id === p.id && c.modelo === modelo).map((c) => c.variante)];
  const variante = Math.max(0, ...usados) + 1;
  cola.push({ id: p.id, modelo, variante, video: TIPOS_VIDEO.has(p.tipo), lanzada: ahora(), ajustes: op.ajustes ?? p.ajustes ?? '', cambio: op.cambio ?? '', prompt: op.prompt ?? p.prompt });
  guardar(F.cola, cola);
  console.log(`Apuntada: ${p.id}-${modelo}-v${variante} (${cola.length} en cola). El siguiente ${TIPOS_VIDEO.has(p.tipo) ? 'vídeo' : 'imagen'} sin nombre que llegue a entrada/ será este.`);
}

// ---------- procesar ----------
function asignar(fichero) {
  const ext = extname(fichero).toLowerCase(); const esVideo = VIDEO.has(ext); const base = basename(fichero, extname(fichero));
  const m = RE.exec(base); const cola = leer(F.cola, []);
  if (m) {
    const [, id, modelo, v] = m; const i = cola.findIndex((c) => c.id.toLowerCase() === id.toLowerCase() && c.modelo === modelo && c.variante === Number(v));
    const c = i >= 0 ? cola.splice(i, 1)[0] : null; if (c) guardar(F.cola, cola);
    return { id: id.toLowerCase(), modelo, variante: Number(v), cola: c };
  }
  const i = cola.findIndex((c) => c.video === esVideo);
  if (i < 0) return null;
  const c = cola.splice(i, 1)[0]; guardar(F.cola, cola);
  return { id: c.id, modelo: c.modelo, variante: c.variante, cola: c };
}

function fundidoBucle(entrada, salida, dur, f = 0.5) {
  // El final se funde sobre el principio: el clip resultante dura dur - f y su último fotograma enlaza con el primero.
  ff(['-i', entrada, '-filter_complex',
    `[0:v]split[x][y];[x]trim=start=${f}:end=${dur},setpts=PTS-STARTPTS[a];[y]trim=start=0:end=${f},setpts=PTS-STARTPTS[b];[a][b]xfade=transition=fade:duration=${f}:offset=${(dur - 2 * f).toFixed(3)},scale='min(1920,iw)':-2[v]`,
    '-map', '[v]', '-an', '-c:v', 'libx264', '-crf', '24', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', salida]);
}

function medirMosaico(imagen) {
  // ¿La textura casa consigo misma al repetirse? Borde izquierdo contra derecho y superior contra inferior, frente al paso normal.
  const n = 128; const r = spawnSync(FF(), ['-hide_banner', '-v', 'error', '-i', imagen, '-vf', `scale=${n}:${n}:flags=area`, '-pix_fmt', 'gray', '-f', 'rawvideo', '-frames:v', '1', '-'], { maxBuffer: 1 << 24 });
  const b = r.stdout; if (!b || b.length < n * n) return null;
  let h = 0, v = 0, ph = 0, pv = 0;
  for (let y = 0; y < n; y++) { h += Math.abs(b[y * n] - b[y * n + n - 1]); for (let x = 1; x < n; x++) ph += Math.abs(b[y * n + x] - b[y * n + x - 1]); }
  for (let x = 0; x < n; x++) { v += Math.abs(b[x] - b[(n - 1) * n + x]); for (let y = 1; y < n; y++) pv += Math.abs(b[y * n + x] - b[(y - 1) * n + x]); }
  h /= n; v /= n; ph /= n * (n - 1); pv /= n * (n - 1);
  return { juntaHorizontal: +(h / Math.max(ph, 0.5)).toFixed(2), juntaVertical: +(v / Math.max(pv, 0.5)).toFixed(2) };
}

function procesarUno(fichero) {
  const ext = extname(fichero).toLowerCase(); const esVideo = VIDEO.has(ext);
  const a = asignar(fichero);
  if (!a) { console.log(`  ${basename(fichero)}: sin nombre de prueba y sin nada en la cola → se queda en entrada/. Renómbralo <id>-<modelo>-v<N>${ext} o apúntalo con "lanzada".`); return null; }
  const base = prueba(a.id) ?? { id: a.id, titulo: '(prueba fuera de la batería)', tipo: esVideo ? 'scrub' : 'imagen', tecnica: '', modelo: a.modelo, prompt: '' };
  // porVariante: {"2": {tipo, alfa, prompt, ajustes, ...}} pisa los campos de la prueba para esa variante concreta
  const p = { ...base, ...(base.porVariante?.[String(a.variante)] ?? {}) };
  if (!esVideo && TIPOS_VIDEO.has(p.tipo)) p.tipo = 'imagen'; // una imagen clave dentro de una prueba de vídeo
  const reg = leer(F.reg, []);
  let variante = a.variante; while (reg.some((r) => r.nombre === `${p.id}-${a.modelo}-v${variante}`)) variante++;
  const nombre = `${p.id}-${a.modelo}-v${variante}`;
  const destino = join(D.clips, nombre + ext); renameSync(fichero, destino);
  const sal = join(D.proc, nombre); rmSync(sal, { recursive: true, force: true }); mkdirSync(sal, { recursive: true });
  console.log(`  ${basename(fichero)} → ${nombre} (${p.tipo})`);
  const tipo = p.tipo; const salidas = {}; const avisos = []; let medidas = null; let automatico = 'BIEN'; const pesos = { original_kb: kb(destino) };
  const peor = (x) => { const o = ['BIEN', 'REGULAR', 'MAL']; if (o.indexOf(x) > o.indexOf(automatico)) automatico = x; };

  if (esVideo) {
    medidas = medirClip(destino, { ffmpeg: FF(), tipo }); automatico = medidas.automatico; avisos.push(...medidas.avisos);
    ff(['-i', destino, '-frames:v', '1', join(sal, 'primer.png')]);
    ff(['-sseof', '-0.25', '-i', destino, '-update', '1', join(sal, 'ultimo.png')]);
    ff(['-i', destino, '-vf', `select='not(mod(n\\,${Math.max(1, Math.floor(medidas.frames / 12))}))',scale=400:-2,tile=4x3:padding=4:color=white`, '-frames:v', '1', '-fps_mode', 'vfr', join(sal, 'hoja-clip.png')]);
    salidas.primer = 'primer.png'; salidas.ultimo = 'ultimo.png'; salidas.hojaClip = 'hoja-clip.png';
    if (tipo === 'scrub' || tipo === 'transicion') {
      const ex = ['--frames', String(medidas.extraer.recomendados), '--video-scrub'];
      const ini = p.extraer?.inicio ?? 0; const fin = p.extraer?.fin; if (ini) ex.push('--inicio', String(ini)); if (fin) ex.push('--fin', String(fin));
      nodo(EXTRAER, [destino, join(sal, 'frames'), ...ex]);
      salidas.frames = 'frames/'; const man = JSON.parse(readFileSync(join(sal, 'frames', 'manifest.json'), 'utf8'));
      pesos.frames_escritorio_kb = Math.round((man.variantes.escritorio?.bytes ?? 0) / 1024); pesos.frames_movil_kb = Math.round((man.variantes.movil?.bytes ?? 0) / 1024);
      pesos.frames = man.frames; pesos.scrub_mp4_kb = kb(join(sal, 'frames', man.videoScrub?.escritorio ?? '_'));
      if (pesos.frames_escritorio_kb > 12000) { avisos.push(`La secuencia de escritorio pesa ${(pesos.frames_escritorio_kb / 1024).toFixed(1)} MB: baja fotogramas, ancho o calidad.`); peor('REGULAR'); }
    } else if (tipo === 'bucle' || tipo === 'fondo') {
      ff(['-i', destino, '-an', '-vf', "scale='min(1920,iw)':-2", '-c:v', 'libx264', '-crf', '24', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(sal, 'bucle-directo.mp4')]);
      ff(['-i', destino, '-frames:v', '1', '-vf', "scale='min(1600,iw)':-2", '-quality', '78', join(sal, 'poster.webp')]);
      salidas.bucleDirecto = 'bucle-directo.mp4'; salidas.poster = 'poster.webp'; salidas.bucle = 'bucle-directo.mp4'; pesos.bucle_kb = kb(join(sal, 'bucle-directo.mp4'));
      if (medidas.bucle.relativa > 2.5 && medidas.bucle.costura > 1.5 && medidas.duracion > 2) {
        fundidoBucle(destino, join(sal, 'bucle-fundido.mp4'), medidas.duracion);
        const m2 = medirClip(join(sal, 'bucle-fundido.mp4'), { ffmpeg: FF(), tipo });
        salidas.bucleFundido = 'bucle-fundido.mp4'; salidas.bucle = 'bucle-fundido.mp4'; pesos.bucle_kb = kb(join(sal, 'bucle-fundido.mp4'));
        medidas.bucleFundido = m2.bucle; avisos.push(`Bucle con fundido de 0,5 s generado: la costura pasa de ${medidas.bucle.relativa} a ${m2.bucle.relativa} veces un paso normal (mira si el fundido se nota como "fantasma").`);
      }
      if (pesos.bucle_kb > 4000) { avisos.push(`El bucle pesa ${(pesos.bucle_kb / 1024).toFixed(1)} MB: para un héroe conviene menos de 4 MB (acorta, baja a 1280 px o sube el CRF).`); peor('REGULAR'); }
    } else if (tipo === 'alfa-video') {
      nodo(ALFA, ['--entrada', destino, '--modo', p.alfa ?? 'croma', '--salida', join(sal, 'alfa')]);
      const aj = JSON.parse(readFileSync(join(sal, 'alfa', 'alfa.json'), 'utf8'));
      salidas.alfa = 'alfa/'; salidas.hojaAlfa = 'alfa/hoja.png'; medidas.alfa = { modo: aj.modo, color: aj.color_clave, ...aj.metricas }; pesos.apilado_kb = aj.pesos_kb?.apilado;
      for (const x of aj.avisos ?? []) { avisos.push('Alfa: ' + x); peor('REGULAR'); }
    }
  } else {
    const info = sondear(destino, buscarBinario('ffprobe')); medidas = { ancho: info.ancho, alto: info.alto, pix: info.pix };
    if (tipo === 'imagen-alfa') {
      const conAlfa = /^(rgba|bgra|argb|abgr|ya8|ya16|gbrap|rgba64|pal8)/.test(info.pix ?? '');
      let modo = p.alfa ?? (conAlfa ? 'ya-alfa' : 'croma');
      let aj; const hacer = (m) => { rmSync(join(sal, 'alfa'), { recursive: true, force: true }); nodo(ALFA, ['--entrada', destino, '--modo', m, '--salida', join(sal, 'alfa'), '--recortar']); return JSON.parse(readFileSync(join(sal, 'alfa', 'alfa.json'), 'utf8')); };
      aj = hacer(modo);
      if (modo === 'ya-alfa' && aj.metricas?.cobertura_media > 0.97) { avisos.push('El fichero traía canal alfa pero opaco (transparencia "falsa"): se ha recortado por croma.'); modo = 'croma'; aj = hacer(modo); peor('REGULAR'); }
      salidas.alfa = 'alfa/'; salidas.recorte = 'alfa/' + (aj.ficheros?.recorte ?? 'recorte.webp'); salidas.hojaAlfa = 'alfa/hoja.png';
      medidas.alfa = { modo: aj.modo, color: aj.color_clave, caja: aj.caja?.pct, ...aj.metricas }; pesos.recorte_kb = aj.pesos_kb?.recorte;
      for (const x of aj.avisos ?? []) { avisos.push('Alfa: ' + x); peor('REGULAR'); }
      if (aj.caja?.pct && (aj.caja.pct.x < 1 || aj.caja.pct.y < 1 || aj.caja.pct.x + aj.caja.pct.ancho > 99 || aj.caja.pct.y + aj.caja.pct.alto > 99)) { avisos.push('El elemento toca el borde del encuadre: saldrá cortado. Pide "fully inside the frame with margin".'); peor('REGULAR'); }
    } else {
      ff(['-i', destino, '-vf', "scale='min(2400,iw)':-2", '-quality', '82', join(sal, 'imagen.webp')]);
      salidas.imagen = 'imagen.webp'; pesos.imagen_kb = kb(join(sal, 'imagen.webp'));
      if (p.mosaico) { medidas.mosaico = medirMosaico(destino); if (medidas.mosaico && Math.max(medidas.mosaico.juntaHorizontal, medidas.mosaico.juntaVertical) > 3) { avisos.push(`La textura no es continua: la junta es ${Math.max(medidas.mosaico.juntaHorizontal, medidas.mosaico.juntaVertical)} veces un paso normal (se verá la raya al repetir).`); peor('REGULAR'); } }
      if (pesos.imagen_kb > 600) avisos.push(`La imagen pesa ${pesos.imagen_kb} KB en WebP: para fondo, menos de 400-600 KB.`);
    }
  }

  const ficha = { nombre, prueba: p.id, titulo: p.titulo, tecnica: p.tecnica, tipo, modelo: p.modelo, modeloCorto: a.modelo, variante, fecha: ahora(),
    ajustes: a.cola?.ajustes || p.ajustes || '', cambio: a.cola?.cambio || p.cambios?.[variante - 1] || '', referencias: p.referencias ?? [], prompt: a.cola?.prompt || p.prompt || '',
    original: 'clips/' + nombre + ext, salidas, pesos, medidas, automatico, avisos, resultado: 'pendiente de mirar', nota: '', leccion: '' };
  guardar(join(sal, 'ficha.json'), { ...ficha, prueba: { id: p.id, mosaico: !!p.mosaico } , pruebaId: p.id });
  reg.unshift(ficha); guardar(F.reg, reg);
  return ficha;
}

// ---------- capturas de la demo ----------
function cargarPlaywright() {
  for (const base of [process.cwd(), join(raiz, 'demos', 'reloj'), raiz]) {
    try { const req = createRequire(join(base, 'package.json')); for (const m of ['playwright-core', 'playwright']) { try { return req(m).chromium; } catch {} } } catch {}
  }
  return null;
}
function chromeInstalado() {
  return [op.chrome, process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find((c) => existsSync(c));
}
async function conServidor(fn) {
  const puerto = Number(op.puerto ?? 5197);
  const srv = spawn(process.execPath, [SERVIDOR, raiz, String(puerto)], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 40; i++) { try { const r = await fetch(`http://127.0.0.1:${puerto}/pruebas/clips-ia/demo/index.html`); if (r.ok) break; } catch {} await new Promise((r) => setTimeout(r, 150)); }
    return await fn(`http://127.0.0.1:${puerto}`);
  } finally { srv.kill(); }
}
const rutaWeb = (abs) => '/' + relative(raiz, abs).split('\\').join('/');

async function capturar(fichas, origen) {
  const chromium = cargarPlaywright(); const exe = chromeInstalado();
  if (!chromium || !exe) { console.log('  (sin capturas: falta playwright-core o Chrome; ejecútalo desde una carpeta que lo tenga, p. ej. demos/reloj)'); return; }
  if (relative(raiz, DATOS).startsWith('..')) { console.log('  (sin capturas: la carpeta de datos está fuera del repo y el servidor no la ve)'); return; }
  const nav = await chromium.launch({ executablePath: exe, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const tmp = join(os.tmpdir(), 'clips-ia-' + process.pid); mkdirSync(tmp, { recursive: true });
  try {
    for (const f of fichas) {
      const sal = join(D.proc, f.nombre); const url = `${origen}/pruebas/clips-ia/demo/index.html?d=${encodeURIComponent(rutaWeb(sal) + '/')}`;
      const demo = { url: url.replace(origen, ''), errores: [] };
      for (const [modo, vp, n, cols] of [['escritorio', { width: 1280, height: 720 }, 9, 3], ['movil', { width: 390, height: 844 }, 4, 4]]) {
        const ctx = await nav.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: modo === 'movil', hasTouch: modo === 'movil' });
        const pag = await ctx.newPage();
        pag.on('console', (m) => { if (m.type() === 'error') demo.errores.push(m.text().slice(0, 200)); });
        pag.on('pageerror', (e) => demo.errores.push(String(e).slice(0, 200)));
        await pag.goto(url, { waitUntil: 'load' });
        await pag.waitForFunction(() => window.__demo?.montado, null, { timeout: 60000 });
        const err = await pag.evaluate(() => window.__demo.error ?? null); if (err) demo.errores.push(err);
        const esScrub = f.tipo === 'scrub' || f.tipo === 'transicion';
        if (esScrub) await pag.waitForFunction(() => window.__demo.todoMs > 0, null, { timeout: 120000 }).catch(() => demo.errores.push('los fotogramas no terminaron de cargar en 120 s'));
        else await pag.waitForTimeout(1500);
        const alto = await pag.evaluate(() => document.documentElement.scrollHeight - innerHeight);
        const saltos = [];
        for (let i = 0; i < n; i++) {
          if ((f.tipo === 'bucle' || f.tipo === 'fondo') && i < 4 && modo === 'escritorio') {
            // los cuatro primeros: el vídeo al principio, a un tercio, a dos tercios y en su último fotograma (la costura)
            await pag.evaluate((k) => { const v = window.__demo.video; v.pause(); v.currentTime = [0, v.duration / 3, (2 * v.duration) / 3, Math.max(0, v.duration - 0.05)][k]; return new Promise((r) => { v.addEventListener('seeked', r, { once: true }); setTimeout(r, 1500); }); }, i);
          } else await pag.evaluate((y) => scrollTo(0, y), Math.round((alto * i) / (n - 1)));
          await pag.waitForTimeout(450);
          if (esScrub && modo === 'escritorio') saltos.push(await pag.evaluate(() => ({ p: window.__demo.progreso, f: window.__demo.frame, total: window.__demo.seq.total })));
          await pag.screenshot({ path: join(tmp, `${modo}-${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 82 });
        }
        if (esScrub && modo === 'escritorio') {
          demo.primerFrameMs = await pag.evaluate(() => window.__demo.primerFrameMs); demo.todoMs = await pag.evaluate(() => window.__demo.todoMs);
          const mal = saltos.filter((s) => s.p != null && Math.abs(s.f - Math.round(s.p * (s.total - 1))) > 1);
          demo.scrubSigue = mal.length === 0; if (mal.length) demo.errores.push(`el fotograma dibujado no sigue al scroll en ${mal.length} de ${saltos.length} posiciones`);
        }
        await ctx.close();
        const hoja = join(sal, modo === 'escritorio' ? 'hoja-demo.png' : 'hoja-demo-movil.png');
        ff(['-framerate', '1', '-i', join(tmp, `${modo}-%02d.jpg`), '-vf', `scale=${modo === 'escritorio' ? 640 : 260}:-2,tile=${cols}x${Math.ceil(n / cols)}:padding=6:color=white`, '-frames:v', '1', hoja]);
        for (const x of readdirSync(tmp)) rmSync(join(tmp, x));
      }
      demo.errores = [...new Set(demo.errores)];
      f.demo = demo; f.salidas.hojaDemo = 'hoja-demo.png'; f.salidas.hojaDemoMovil = 'hoja-demo-movil.png';
      if (demo.errores.length) { f.avisos.push('Demo: ' + demo.errores.join(' · ')); if (f.automatico === 'BIEN') f.automatico = 'REGULAR'; }
      const fj = join(sal, 'ficha.json'); const ant = JSON.parse(readFileSync(fj, 'utf8')); guardar(fj, { ...ant, demo, salidas: f.salidas, avisos: f.avisos, automatico: f.automatico });
      console.log(`  demo de ${f.nombre}: ${demo.errores.length ? 'con errores: ' + demo.errores.join(' · ') : 'sin errores'}${demo.todoMs ? ` · todos los fotogramas en ${demo.todoMs} ms` : ''}`);
    }
  } finally { await nav.close(); rmSync(tmp, { recursive: true, force: true }); }
}

// ---------- registro e índice ----------
function resumenMedidas(r) {
  const m = r.medidas; if (!m) return '';
  if (m.movimiento) {
    const t = [`${m.ancho}x${m.alto} · ${m.fps} fps · ${m.duracion} s · ${m.frames} fotogramas`, `velocidad: variación ${m.movimiento.variacion}, arranque ${m.movimiento.arranque}, final ${m.movimiento.final}`,
      `repetidos ${m.duplicados.exactos}+${m.duplicados.casi}`, `nitidez mínima ${m.nitidez.relMinima}`, `parpadeo ${m.parpadeo}, hervor ${m.hervor}`, `fondo ${m.fondo.colorInicial} (deriva ${m.fondo.derivaMax})`];
    if (r.tipo === 'bucle' || r.tipo === 'fondo') t.push(`costura de bucle ${m.bucle.relativa}${m.bucleFundido ? ` → ${m.bucleFundido.relativa} con fundido` : ''}`);
    if (m.alfa) t.push(`alfa ${m.alfa.modo}: halo ${m.alfa.halo_medio}, fondo residual ${m.alfa.fondo_residual_medio}`);
    return t.join(' · ');
  }
  const t = [`${m.ancho}x${m.alto}`];
  if (m.alfa) t.push(`alfa ${m.alfa.modo} (${m.alfa.color ?? 's/c'}): cobertura ${m.alfa.cobertura_media}, halo ${m.alfa.halo_medio}, fondo residual ${m.alfa.fondo_residual_medio}`);
  if (m.mosaico) t.push(`juntas del mosaico ${m.mosaico.juntaHorizontal} / ${m.mosaico.juntaVertical}`);
  return t.join(' · ');
}
function pesosTexto(r) { return Object.entries(r.pesos ?? {}).filter(([, v]) => v != null).map(([k, v]) => `${k.replace(/_kb$/, '')} ${k.endsWith('_kb') ? v + ' KB' : v}`).join(' · '); }
function indice() {
  const reg = leer(F.reg, []);
  const md = ['# Registro de clips e imágenes', '', 'Lo más reciente arriba. Lo escribe `procesar-clips.mjs`; el resultado y la lección se apuntan con la orden `nota`.', ''];
  for (const r of reg) {
    md.push(`### ${r.nombre} · ${r.fecha}`, `- Plano: ${r.titulo}${r.tecnica ? ` (${r.tecnica})` : ''}`, `- Modelo / modo: ${r.modelo}${r.ajustes ? ' · ' + r.ajustes : ''}${r.cambio ? ` · en esta variante: ${r.cambio}` : ''}`,
      `- Referencias: ${r.referencias?.length ? r.referencias.join(', ') : 'ninguna'}`, `- Prompt: ${r.prompt || '(sin apuntar)'}`, `- Medidas: ${resumenMedidas(r)}`, `- Pesos: ${pesosTexto(r)}`,
      `- Automático: ${r.automatico}${r.avisos?.length ? ' · ' + r.avisos.join(' · ') : ''}`, `- Demo: procesado/${r.nombre}/hoja-demo.png${r.demo?.errores?.length ? ' (con errores)' : ''}`,
      `- Resultado: ${r.resultado}${r.nota ? ' · ' + r.nota : ''}`, `- Lección: ${r.leccion || ''}`, '');
  }
  writeFileSync(F.regMd, md.join('\n'));
  guardar(join(D.proc, 'indice.json'), { generado: ahora(), piezas: reg.map((r) => ({ nombre: r.nombre, prueba: r.prueba, tipo: r.tipo, modelo: r.modelo, automatico: r.automatico, resultado: r.resultado, salidas: r.salidas })) });
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const demoRel = relative(D.proc, join(aqui, 'demo', 'index.html')).split('\\').join('/');
  const filas = reg.map((r) => `<tr class="${esc(r.automatico)}"><td><b>${esc(r.nombre)}</b><br>${esc(r.titulo)}<br><small>${esc(r.modelo)} · ${esc(r.ajustes)}</small></td>
<td><a href="${demoRel}?d=${encodeURIComponent(rutaWeb(join(D.proc, r.nombre)) + '/')}">abrir demo</a><br><a href="${esc(r.nombre)}/${esc(r.salidas.hojaClip ?? r.salidas.hojaAlfa ?? r.salidas.imagen ?? '')}">hoja</a></td>
<td>${r.salidas.hojaDemo ? `<a href="${esc(r.nombre)}/hoja-demo.png"><img loading="lazy" src="${esc(r.nombre)}/hoja-demo.png" width="420"></a>` : ''}</td>
<td><b>${esc(r.automatico)}</b> · ${esc(r.resultado)}<br><small>${esc(resumenMedidas(r))}</small><ul>${(r.avisos ?? []).map((a) => `<li>${esc(a)}</li>`).join('')}</ul>${r.nota ? `<p>${esc(r.nota)}</p>` : ''}</td></tr>`).join('\n');
  writeFileSync(join(D.proc, 'index.html'), `<!doctype html><html lang="es"><meta charset="utf-8"><title>Comparador de clips</title>
<style>body{font:14px/1.45 system-ui,sans-serif;margin:24px;color:#14161a}table{border-collapse:collapse;width:100%}td{border-top:1px solid #ddd;padding:10px;vertical-align:top}small{color:#555}ul{margin:.4em 0;padding-left:1.2em}tr.MAL td:first-child{border-left:4px solid #b3261e}tr.REGULAR td:first-child{border-left:4px solid #c98a00}tr.BIEN td:first-child{border-left:4px solid #2e7d32}</style>
<h1>Comparador de clips (${reg.length})</h1><p>Se abre con el servidor de pruebas en la raíz del repo. Generado ${ahora()}.</p><table>${filas}</table></html>`);
}

function nota(nombre, resultado, texto) {
  const reg = leer(F.reg, []); const r = reg.find((x) => x.nombre === nombre); if (!r) throw new Error('No está en el registro: ' + nombre);
  if (!['BUENO', 'REGULAR', 'MALO'].includes(String(resultado).toUpperCase())) throw new Error('El resultado es BUENO, REGULAR o MALO');
  r.resultado = resultado.toUpperCase(); r.nota = texto ?? ''; if (op.leccion) r.leccion = op.leccion;
  guardar(F.reg, reg); indice(); console.log(`Apuntado: ${nombre} → ${r.resultado}`);
}

async function procesar() {
  iniciar();
  const estable = async (f) => { const a = statSync(f).size; await new Promise((r) => setTimeout(r, 1500)); return existsSync(f) && statSync(f).size === a && a > 0; };
  const pasada = async () => {
    const fich = readdirSync(D.entrada).filter((n) => VIDEO.has(extname(n).toLowerCase()) || IMAGEN.has(extname(n).toLowerCase()))
      .map((n) => join(D.entrada, n)).sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs);
    const hechas = [];
    for (const f of fich) {
      if (op.vigilar && !(await estable(f))) continue; // aún se está descargando
      try { const r = procesarUno(f); if (r) hechas.push(r); } catch (e) { console.error(`  ERROR con ${basename(f)}: ${e.message}`); }
    }
    if (hechas.length) {
      if (!op['sin-demo']) await conServidor((origen) => capturar(hechas, origen));
      const reg = leer(F.reg, []); for (const h of hechas) { const i = reg.findIndex((r) => r.nombre === h.nombre); if (i >= 0) reg[i] = h; } guardar(F.reg, reg);
      indice();
      for (const h of hechas) console.log(`  ${h.nombre}: ${h.automatico}${h.avisos.length ? '\n     - ' + h.avisos.join('\n     - ') : ''}`);
    }
    return hechas.length;
  };
  if (!op.vigilar) { const n = await pasada(); console.log(n ? `Procesados: ${n}. Registro: ${F.regMd}` : 'Nada que procesar en ' + D.entrada); return; }
  console.log('Vigilando ' + D.entrada + ' (Ctrl+C para parar)…');
  for (;;) { await pasada(); await new Promise((r) => setTimeout(r, 4000)); }
}

try {
  if (orden === 'iniciar') { iniciar(); console.log('Carpeta de datos lista: ' + DATOS); }
  else if (orden === 'siguiente') siguiente(Number(pos[1] ?? 1));
  else if (orden === 'lanzada') { iniciar(); lanzada(pos[1], pos[2]); }
  else if (orden === 'procesar') await procesar();
  else if (orden === 'nota') nota(pos[1], pos[2], pos[3]);
  else if (orden === 'indice') { indice(); console.log('Registro e índice rehechos.'); }
  else if (orden === 'costura') {
    const busca = (n) => { const f = readdirSync(D.clips).find((x) => basename(x, extname(x)) === n); if (!f) throw new Error('No está en clips/: ' + n); return join(D.clips, f); };
    console.log(JSON.stringify(medirCostura(busca(pos[1]), busca(pos[2]), { ffmpeg: FF() }), null, 2));
  } else { console.log('Órdenes: iniciar | siguiente [N] | lanzada <id> <modelo> | procesar [--vigilar] [--sin-demo] | nota <nombre> BUENO|REGULAR|MALO "texto" | costura <a> <b> | indice   (--datos <carpeta>)'); process.exit(orden ? 1 : 0); }
} catch (e) { console.error('ERROR: ' + e.message); process.exit(1); }
