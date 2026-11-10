#!/usr/bin/env node
// medir-clip.mjs: mide un clip de vídeo (generado con IA o no) pensando en el scroll, fotograma a fotograma.
// Sin dependencias: Node + ffmpeg/ffprobe (variables FFMPEG / FFPROBE o el PATH).
//
//   node medir-clip.mjs <video> [--json] [--tipo scrub|bucle|fondo|transicion|alfa-video]
//   node medir-clip.mjs --costura a.mp4 b.mp4      (último fotograma de A contra el primero de B)
//
// Complementa a revisar-video.mjs (skill video-ia-para-scroll). Lo que añade:
//   - paso real entre fotogramas (no solo el brillo medio): perfil de velocidad, arranque y final "con freno";
//   - casi-duplicados (no solo los exactos), típicos de un clip ralentizado o a menos fps de los que dice;
//   - nitidez por fotograma (varianza del laplaciano): fotogramas blandos por desenfoque de movimiento;
//   - "hervor": parpadeo local por bloques (detalle fino que cambia de un fotograma a otro sin moverse);
//   - deriva de luz y de color del fondo a lo largo del clip (esquinas): el croma o el color de sección que se va;
//   - costura del bucle (último contra primero) y costura entre dos clips encadenados;
//   - cuántos fotogramas conviene extraer para no remuestrear a saltos.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';

export function buscarBinario(nombre) {
  const env = process.env[nombre.toUpperCase()];
  if (env && existsSync(env)) return env;
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [nombre], { encoding: 'utf8' });
  if (r.status === 0) return r.stdout.split(/\r?\n/)[0].trim();
  throw new Error(`No encuentro ${nombre}. Instálalo o pon su ruta en la variable ${nombre.toUpperCase()}.`);
}

const AN = 320, AL = 180;        // tamaño de análisis (gris)
const CN = 32, CL = 18;          // tamaño de análisis del color
const media = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const mediana = (a) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const red = (x, d = 3) => +Number(x).toFixed(d);

export function sondear(video, ffprobe = buscarBinario('ffprobe')) {
  const r = spawnSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,r_frame_rate,avg_frame_rate,nb_frames,codec_name,pix_fmt:format=duration,size', '-of', 'json', video], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error('ffprobe no pudo leer ' + video + ': ' + r.stderr);
  const j = JSON.parse(r.stdout); const s = j.streams?.[0];
  if (!s) throw new Error('Sin pista de vídeo: ' + video);
  const [n, d] = String(s.avg_frame_rate && s.avg_frame_rate !== '0/0' ? s.avg_frame_rate : s.r_frame_rate).split('/').map(Number);
  return { ancho: s.width, alto: s.height, fps: red(n / (d || 1)), duracion: red(Number(j.format.duration)), codec: s.codec_name,
    pix: s.pix_fmt, bytes: Number(j.format.size) };
}

function crudo(ffmpeg, video, filtro, pix, extra = []) {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-v', 'error', ...extra, '-i', video, '-an', '-vf', filtro, '-pix_fmt', pix, '-f', 'rawvideo', '-'],
    { maxBuffer: 1024 * 1024 * 1024 });
  if (r.status !== 0) throw new Error('ffmpeg falló al leer ' + video + ': ' + String(r.stderr).slice(-600));
  return r.stdout;
}

// diferencia media absoluta entre dos fotogramas grises
function dif(buf, a, b, tam) {
  let s = 0; const oa = a * tam, ob = b * tam;
  for (let i = 0; i < tam; i++) s += Math.abs(buf[oa + i] - buf[ob + i]);
  return s / tam;
}
// nitidez: varianza del laplaciano (4 vecinos)
function nitidez(buf, f) {
  const o = f * AN * AL; let s = 0, s2 = 0, n = 0;
  for (let y = 1; y < AL - 1; y++) for (let x = 1; x < AN - 1; x++) {
    const p = o + y * AN + x;
    const l = 4 * buf[p] - buf[p - 1] - buf[p + 1] - buf[p - AN] - buf[p + AN];
    s += l; s2 += l * l; n++;
  }
  const m = s / n; return s2 / n - m * m;
}
// brillo medio por bloques de 20x20 px (16x9 bloques)
function bloques(buf, f) {
  const o = f * AN * AL, B = 20, nx = AN / B, ny = AL / B, out = new Float32Array(nx * ny);
  for (let by = 0; by < ny; by++) for (let bx = 0; bx < nx; bx++) {
    let s = 0;
    for (let y = 0; y < B; y++) { const p = o + (by * B + y) * AN + bx * B; for (let x = 0; x < B; x++) s += buf[p + x]; }
    out[by * nx + bx] = s / (B * B);
  }
  return out;
}

export function medirClip(video, { ffmpeg = buscarBinario('ffmpeg'), ffprobe = buscarBinario('ffprobe'), tipo = 'scrub' } = {}) {
  const info = sondear(video, ffprobe);
  const gris = crudo(ffmpeg, video, `scale=${AN}:${AL}:flags=area`, 'gray');
  const color = crudo(ffmpeg, video, `scale=${CN}:${CL}:flags=area`, 'rgb24');
  const tam = AN * AL; const n = Math.floor(gris.length / tam);
  if (n < 3) throw new Error('El clip tiene menos de 3 fotogramas: ' + video);

  // ---- movimiento
  const mov = []; for (let i = 1; i < n; i++) mov.push(dif(gris, i - 1, i, tam));
  const conMov = mov.filter((v) => v > 0.05);
  const med = mediana(conMov);
  const quieto = med < 0.15;                                   // clip casi estático (un fondo ambiental puede serlo)
  // cortes: pico muy por encima de sus vecinos
  // (los fotogramas repetidos no cuentan como vecinos: en un clip a 12 fps reales cada paso parecería un salto)
  const cortes = [];
  const vivos = mov.map((v, i) => ({ v, i })).filter((x) => x.v >= 0.05);
  vivos.forEach((x, k) => {
    const vec = vivos.slice(Math.max(0, k - 4), k).concat(vivos.slice(k + 1, k + 5)).map((y) => y.v);
    if (vec.length < 3) return;
    const mv = mediana(vec);
    if (x.v > 4 * Math.max(mv, 0.2) && x.v - mv > 4) cortes.push(x.i + 1);
  });
  // duplicados exactos y casi-duplicados (en mitad del movimiento)
  const exactos = quieto ? 0 : mov.filter((v) => v < 0.05).length;
  const casi = quieto ? 0 : mov.filter((v) => v >= 0.05 && v < 0.25 * med).length;
  // patrón de duplicados: si se repite cada k fotogramas, el clip real va a fps/k
  let fpsReal = info.fps;
  if (!quieto && (exactos + casi) / mov.length > 0.2) fpsReal = red(info.fps * (1 - (exactos + casi) / mov.length), 1);
  // tramos quietos al principio y al final
  let quietoIni = 0; while (quietoIni < mov.length && mov[quietoIni] < 0.25 * med) quietoIni++;
  let quietoFin = 0; while (quietoFin < mov.length && mov[mov.length - 1 - quietoFin] < 0.25 * med) quietoFin++;
  if (quieto) { quietoIni = 0; quietoFin = 0; }
  // perfil de velocidad suavizado, sin cortes
  const esCorte = new Set(cortes.map((c) => c - 1));
  const util = mov.filter((v, i) => !esCorte.has(i));
  const suav = util.map((_, i) => media(util.slice(Math.max(0, i - 2), i + 3)));
  const ms = media(suav);
  const variacion = suav.length > 2 && ms > 0 ? Math.sqrt(media(suav.map((x) => (x - ms) ** 2))) / ms : 0;
  const d10 = Math.max(2, Math.round(suav.length * 0.1));
  const centro = media(suav.slice(Math.round(suav.length * 0.2), Math.round(suav.length * 0.8))) || 1e-6;
  // Arranque y final: los 6 % de los extremos contra el tramo de al lado (6-18 %). Se compara con el vecino y no con el
  // centro porque la diferencia entre fotogramas también depende de lo que se ve (un objeto de canto cambia menos que de
  // frente): un freno real es una rampa corta pegada al extremo; lo otro cambia despacio a lo largo del clip.
  const d6 = Math.max(2, Math.round(suav.length * 0.06)); const d18 = Math.max(d6 + 2, Math.round(suav.length * 0.18));
  const arranque = media(suav.slice(0, d6)) / (media(suav.slice(d6, d18)) || 1e-6);          // < 1: empieza frenado
  const final = media(suav.slice(-d6)) / (media(suav.slice(-d18, -d6)) || 1e-6);             // < 1: acaba frenando; > 1: acelera
  const t3 = Math.max(1, Math.floor(suav.length / 3));
  const tercios = media(suav.slice(-t3)) / (media(suav.slice(0, t3)) || 1e-6);   // último tercio contra el primero
  const perfil = []; for (let k = 0; k < 20; k++) {
    const a = Math.floor((k * suav.length) / 20), b = Math.max(a + 1, Math.floor(((k + 1) * suav.length) / 20));
    perfil.push(red(media(suav.slice(a, b)) / (ms || 1), 2));
  }

  // ---- nitidez
  const nit = []; for (let i = 0; i < n; i++) nit.push(nitidez(gris, i));
  const nitMed = mediana(nit); const nitMin = Math.min(...nit);
  const blandos = nit.map((v, i) => (v < 0.6 * nitMed ? i + 1 : 0)).filter(Boolean);

  // ---- parpadeo global y local ("hervor"): segunda diferencia (un movimiento suave casi no la tiene)
  const bl = []; for (let i = 0; i < n; i++) bl.push(bloques(gris, i));
  const yavg = bl.map((b) => media(Array.from(b)));
  const parp = []; const herv = [];
  for (let i = 1; i < n - 1; i++) {
    if (esCorte.has(i - 1) || esCorte.has(i)) continue;
    parp.push(Math.abs(yavg[i] - (yavg[i - 1] + yavg[i + 1]) / 2));
    // Píxel a píxel: cuánto se sale el valor del intervalo que forman el fotograma anterior y el siguiente. Un borde que
    // se mueve pasa de un valor a otro sin salirse (da 0); la textura que "hierve" cambia y vuelve (se sale).
    let s = 0; const o = i * tam;
    for (let k = 0; k < tam; k++) {
      const a = gris[o - tam + k], b = gris[o + tam + k], v = gris[o + k];
      const lo = a < b ? a : b, hi = a < b ? b : a;
      if (v < lo) s += lo - v; else if (v > hi) s += v - hi;
    }
    herv.push(s / tam);
  }
  const parpadeo = mediana(parp); const hervor = mediana(herv); const hervorRel = hervor / (med || 1e-6);

  // ---- deriva de luz y color del fondo (esquinas de 4x4 px en la versión pequeña)
  const tc = CN * CL * 3; const nc = Math.floor(color.length / tc);
  const esquinas = (f) => {
    const o = f * tc; const acc = [0, 0, 0]; let k = 0;
    for (const [x0, y0] of [[0, 0], [CN - 4, 0], [0, CL - 4], [CN - 4, CL - 4]])
      for (let y = y0; y < y0 + 4; y++) for (let x = x0; x < x0 + 4; x++) { const p = o + (y * CN + x) * 3; acc[0] += color[p]; acc[1] += color[p + 1]; acc[2] += color[p + 2]; k++; }
    return acc.map((v) => v / k);
  };
  const esq = []; for (let i = 0; i < nc; i++) esq.push(esquinas(i));
  const dRGB = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
  const fondoIni = esq[0]; let derivaFondo = 0; for (const e of esq) derivaFondo = Math.max(derivaFondo, dRGB(e, fondoIni));
  const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const k10 = Math.max(1, Math.round(n * 0.1));
  const derivaLuz = media(yavg.slice(-k10)) - media(yavg.slice(0, k10));

  // ---- costura del bucle
  const costura = dif(gris, n - 1, 0, tam);
  const costuraRel = costura / (med || 1e-6);

  // ---- cuántos fotogramas extraer sin remuestrear a saltos
  const reales = Math.max(2, Math.round(n * (fpsReal / info.fps)));
  let recomendados = reales; let k = 1; while (recomendados > 150) { k++; recomendados = Math.round(reales / k); }

  // ---- veredictos
  const av = []; let nota = 0; // nota: 0 bien, 1 regular, 2 mal
  const pon = (nivel, texto) => { av.push(texto); nota = Math.max(nota, nivel); };
  const paraScrub = tipo === 'scrub' || tipo === 'transicion' || tipo === 'alfa-video';
  if (cortes.length) pon(2, `Corte o salto en los fotogramas ${cortes.join(', ')}.`);
  if (!quieto && (exactos + casi) / mov.length > 0.1) pon(paraScrub ? 2 : 1, `Fotogramas repetidos: ${exactos} exactos y ${casi} casi iguales de ${mov.length} (el clip va a ~${fpsReal} fps reales, no a ${info.fps}). Extrae ${recomendados} fotogramas, no más.`);
  if (paraScrub) {
    if (variacion > 0.7) pon(2, `Velocidad muy irregular (variación ${red(variacion, 2)}): el scroll irá a tirones.`);
    else if (variacion > 0.45) pon(1, `Velocidad algo irregular (variación ${red(variacion, 2)}).`);
    if (arranque < 0.6) pon(1, `Arranca frenado (primer 6 % al ${Math.round(arranque * 100)} % de la velocidad del tramo siguiente): recorta el inicio o remapea.`);
    if (arranque > 1.6) pon(1, `Arranca más rápido que el resto (${Math.round(arranque * 100)} %).`);
    if (final < 0.6) pon(1, `Acaba frenando (último 6 % al ${Math.round(final * 100)} % del tramo anterior): recorta el final o remapea.`);
    if (final > 1.6) pon(1, `Acelera al final (último 6 % al ${Math.round(final * 100)} % del tramo anterior).`);
    if (tercios > 3 || tercios < 0.33) pon(1, `La velocidad cambia mucho a lo largo del clip (el último tercio va al ${Math.round(tercios * 100)} % del primero): mira el perfil; si es el modelo y no el encuadre, remapea el tiempo.`);
    if (quietoIni > 2 || quietoFin > 2) pon(1, `Tramos quietos: ${quietoIni} fotogramas al inicio y ${quietoFin} al final (extrae con --inicio ${red(quietoIni / info.fps, 2)} --fin ${red((n - quietoFin) / info.fps, 2)}).`);
    if (blandos.length > n * 0.15) pon(1, `${blandos.length} fotogramas blandos (nitidez por debajo del 60 % de la mediana): desenfoque de movimiento; al parar el scroll ahí se ve borroso.`);
  }
  if (parpadeo > 1.2) pon(1, `Parpadeo de luz global (${red(parpadeo, 2)} por fotograma).`);
  if (hervor > 2.5) pon(2, `Hervor fuerte en el detalle (${red(hervor, 2)}): la textura cambia de un fotograma a otro.`);
  else if (hervor > 1.4) pon(1, `Algo de hervor en el detalle (${red(hervor, 2)}).`);
  if (derivaFondo > 24) pon(1, `El fondo cambia de color durante el clip (hasta ${Math.round(derivaFondo)} niveles en las esquinas; empieza en ${hex(fondoIni)}): costura visible con la sección o croma que no es liso.`);
  if (Math.abs(derivaLuz) > 12) pon(1, `La luz deriva ${derivaLuz > 0 ? '+' : ''}${red(derivaLuz, 1)} niveles entre el principio y el final.`);
  if (tipo === 'bucle' || tipo === 'fondo') {
    if (costuraRel > 6 && costura > 3) pon(2, `El bucle salta: el último fotograma se parece poco al primero (${red(costuraRel, 1)} veces un paso normal). Hace falta fundido o ida y vuelta.`);
    else if (costuraRel > 2.5 && costura > 1.5) pon(1, `Costura del bucle visible (${red(costuraRel, 1)} veces un paso normal): fundido cruzado de 0,5 s.`);
  }
  if (info.ancho < 1280 && info.alto < 1280) pon(0, `Resolución ${info.ancho}x${info.alto}: vale para probar; para escritorio hace falta 1080p o reescalar.`);

  return {
    video: basename(video), ...info, frames: n, tipo,
    movimiento: { mediano: red(med, 2), variacion: red(variacion), arranque: red(arranque, 2), final: red(final, 2), tercios: red(tercios, 2), perfil, quietoInicio: quietoIni, quietoFinal: quietoFin, casiEstatico: quieto },
    cortes, duplicados: { exactos, casi, fpsReal },
    nitidez: { mediana: red(nitMed, 1), minima: red(nitMin, 1), relMinima: red(nitMin / (nitMed || 1), 2), blandos: blandos.length },
    parpadeo: red(parpadeo, 2), hervor: red(hervor, 2), hervorRel: red(hervorRel, 2),
    fondo: { colorInicial: hex(fondoIni), derivaMax: red(derivaFondo, 1), derivaLuz: red(derivaLuz, 1) },
    bucle: { costura: red(costura, 2), relativa: red(costuraRel, 2) },
    extraer: { framesReales: reales, recomendados },
    automatico: ['BIEN', 'REGULAR', 'MAL'][nota], avisos: av,
  };
}

// Último fotograma de A contra el primero de B: ¿se nota el empalme al encadenar dos clips?
export function medirCostura(a, b, { ffmpeg = buscarBinario('ffmpeg') } = {}) {
  const fa = crudo(ffmpeg, a, `scale=${AN}:${AL}:flags=area`, 'gray', ['-sseof', '-0.5']);
  const fb = crudo(ffmpeg, b, `scale=${AN}:${AL}:flags=area,trim=end_frame=3`, 'gray');
  const tam = AN * AL; const na = Math.floor(fa.length / tam); const nb = Math.floor(fb.length / tam);
  if (na < 2 || nb < 2) throw new Error('No pude leer los fotogramas de la costura.');
  const junto = Buffer.concat([fa.subarray((na - 2) * tam, na * tam), fb.subarray(0, 2 * tam)]); // A-1, A, B, B+1
  const pasoA = dif(junto, 0, 1, tam), salto = dif(junto, 1, 2, tam), pasoB = dif(junto, 2, 3, tam);
  const nA = nitidez(junto, 1), nB = nitidez(junto, 2);
  const paso = Math.max((pasoA + pasoB) / 2, 0.2);
  const res = { a: basename(a), b: basename(b), salto: red(salto, 2), pasoNormal: red(paso, 2), relativa: red(salto / paso, 2),
    nitidezA: red(nA, 1), nitidezB: red(nB, 1), saltoNitidez: red(nB / (nA || 1), 2), avisos: [] };
  if (res.relativa > 4 && salto > 2) res.avisos.push(`El empalme salta (${res.relativa} veces un paso normal): B no empieza donde acaba A.`);
  if (res.saltoNitidez > 1.4 || res.saltoNitidez < 0.7) res.avisos.push(`Salto de nitidez en el empalme (B es ${res.saltoNitidez} veces A): se nota aunque la imagen coincida.`);
  return res;
}

// ---------- línea de comandos ----------
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const a = process.argv.slice(2);
  try {
    if (a[0] === '--costura') {
      console.log(JSON.stringify(medirCostura(a[1], a[2]), null, 2));
    } else {
      const video = a.find((x) => !x.startsWith('--')); const it = a.indexOf('--tipo');
      if (!video) { console.error('Uso: node medir-clip.mjs <video> [--json] [--tipo scrub|bucle|fondo|transicion|alfa-video]'); process.exit(1); }
      const m = medirClip(video, { tipo: it >= 0 ? a[it + 1] : 'scrub' });
      if (a.includes('--json')) console.log(JSON.stringify(m, null, 2));
      else {
        console.log(`${m.video}: ${m.ancho}x${m.alto}, ${m.fps} fps, ${m.duracion} s, ${m.frames} fotogramas → ${m.automatico}`);
        console.log(`velocidad: variación ${m.movimiento.variacion} · arranque ${m.movimiento.arranque} · final ${m.movimiento.final} · nitidez mínima ${m.nitidez.relMinima} · hervor ${m.hervor} · costura de bucle ${m.bucle.relativa}`);
        for (const v of m.avisos) console.log(' - ' + v);
        console.log(`extraer: ${m.extraer.recomendados} fotogramas`);
      }
    }
  } catch (e) { console.error(e.message); process.exit(1); }
}
