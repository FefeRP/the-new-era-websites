#!/usr/bin/env node
// Revisa si un vídeo (de Higgsfield, Kling, Veo, Luma… o del cliente) sirve para scroll-scrubbing.
// Mide la diferencia entre frames consecutivos (YDIF de ffmpeg signalstats) y detecta:
//  - cortes / saltos (picos aislados)       → el scrub "teletransporta"
//  - velocidad no constante                 → el scroll se siente a tirones o "se para"
//  - tramos muertos al principio o al final → recorta con --inicio/--fin al extraer
//  - parpadeo de luz (YAVG que oscila)      → flicker visible al arrastrar
//  - cortes de escena con el filtro scdet de ffmpeg (segunda opinión, con su segundo exacto)
//  - avance real de la cámara en acercamientos (dolly in / out): la escala que mejor encaja entre
//    fotogramas separados medio segundo (×1,10 = avanza bien; ×1,02 = casi parada). Mide, no adivines:
//    los revisores con IA dan por quieto un acercamiento lento y no ven un frenazo al final.
//  - saltos de contenido: tras compensar el acercamiento, el fotograma ya no se parece al anterior
//    (la escena cambia sin corte limpio: "parecen dos vídeos unidos", típico con primer y último
//    fotograma demasiado distintos).
// Además deja una hoja de contactos (PNG) para mirarla, con el segundo de cada fotograma en el nombre del informe.
//
// Uso: node revisar-video.mjs <video> [--hoja hoja.png] [--json] [--centro 0.5,0.5] [--umbral-scdet 10]
//   --centro: punto hacia el que avanza la cámara (fracción del ancho y del alto), si no es el centro.
// Sin dependencias: Node >= 18 + ffmpeg/ffprobe.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve, dirname, basename, extname } from 'node:path';

function buscar(nombre) {
  const env = process.env[nombre.toUpperCase()];
  if (env && existsSync(env)) return env;
  const exe = process.platform === 'win32' ? `${nombre}.exe` : nombre;
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [nombre], { encoding: 'utf8' });
  if (r.status === 0) return r.stdout.split(/\r?\n/)[0].trim();
  for (const c of ['C:\\ffmpeg\\bin', 'C:\\Program Files\\ffmpeg\\bin', '/usr/bin', '/usr/local/bin', '/opt/homebrew/bin'])
    if (existsSync(join(c, exe))) return join(c, exe);
  throw new Error(`No encuentro ${nombre} (ponlo en PATH o en la variable ${nombre.toUpperCase()})`);
}

const argv = process.argv.slice(2);
const video = argv.find((a) => !a.startsWith('--'));
if (!video) { console.error('Uso: node revisar-video.mjs <video> [--hoja hoja.png] [--json]'); process.exit(2); }
const iHoja = argv.indexOf('--hoja');
const hoja = iHoja !== -1 ? resolve(argv[iHoja + 1]) : join(dirname(resolve(video)), basename(video, extname(video)) + '-hoja.png');
const comoJson = argv.includes('--json');
const iCentro = argv.indexOf('--centro');
const [centroX, centroY] = iCentro !== -1 ? argv[iCentro + 1].split(',').map(Number) : [0.5, 0.5];
const iUmbral = argv.indexOf('--umbral-scdet');
const umbralScdet = iUmbral !== -1 ? Number(argv[iUmbral + 1]) : 10;
const ffmpeg = buscar('ffmpeg');
const ffprobe = buscar('ffprobe');

const p = JSON.parse(spawnSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
  'stream=width,height,r_frame_rate:format=duration', '-of', 'json', video], { encoding: 'utf8' }).stdout);
const [fn, fd] = p.streams[0].r_frame_rate.split('/').map(Number);
const info = { ancho: p.streams[0].width, alto: p.streams[0].height, fps: +(fn / (fd || 1)).toFixed(3), duracion: +Number(p.format.duration).toFixed(3) };

const r = spawnSync(ffmpeg, ['-hide_banner', '-i', video, '-vf', `scale=320:-2,signalstats,scdet=threshold=${umbralScdet},metadata=print:file=-`, '-an', '-f', 'null', '-'],
  { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const ydif = []; const yavg = []; const escenas = []; let ultimaPuntuacion = 0;
for (const l of r.stdout.split(/\r?\n/)) {
  let m = l.match(/lavfi\.signalstats\.YDIF=([\d.]+)/); if (m) ydif.push(Number(m[1]));
  m = l.match(/lavfi\.signalstats\.YAVG=([\d.]+)/); if (m) yavg.push(Number(m[1]));
  m = l.match(/lavfi\.scd\.score=([\d.]+)/); if (m) ultimaPuntuacion = Number(m[1]);
  m = l.match(/lavfi\.scd\.time=([\d.]+)/); if (m) escenas.push({ t: +Number(m[1]).toFixed(2), puntuacion: +ultimaPuntuacion.toFixed(1) });
}
if (ydif.length < 3) { console.error('No pude medir el vídeo:', r.stderr.slice(-800)); process.exit(1); }
const d = ydif.slice(1); // el primero siempre es 0

const media = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const mediana = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
// frames duplicados (diferencia ~0 en mitad del movimiento): el scrub avanza "a escalones"
const conMovimiento = d.filter((v) => v >= 0.1);
const med = conMovimiento.length ? mediana(conMovimiento) : 0;
const duplicados = med > 0.5 ? d.filter((v) => v < 0.1).length : 0;
const pctDuplicados = duplicados / d.length;
// cortes: pico local (≥3× la mediana de sus vecinos y claramente por encima)
const cortes = [];
d.forEach((v, i) => {
  const vec = d.slice(Math.max(0, i - 4), i).concat(d.slice(i + 1, i + 5)).filter((x) => x >= 0.1);
  if (!vec.length) return;
  const mv = mediana(vec);
  if (v > 3 * mv && v - mv > 5) cortes.push({ frame: i + 1, v });
});
// tramos muertos: frames con movimiento < 25 % de la mediana al principio/final
let muertoIni = 0; while (muertoIni < d.length && d[muertoIni] < 0.25 * med) muertoIni++;
let muertoFin = 0; while (muertoFin < d.length && d[d.length - 1 - muertoFin] < 0.25 * med) muertoFin++;
// constancia: coef. de variación del movimiento suavizado (ventana 5), sin tramos muertos, cortes ni duplicados
const esCorte = new Set(cortes.map((c) => c.frame - 1));
const util = d.slice(muertoIni, d.length - muertoFin).filter((v, k) => v >= 0.1 && !esCorte.has(k + muertoIni));
const suav = util.map((_, i) => media(util.slice(Math.max(0, i - 2), i + 3)));
const cv = suav.length > 2 ? Math.sqrt(media(suav.map((x) => (x - media(suav)) ** 2))) / (media(suav) || 1) : 0;
// acelerones: la velocidad suavizada se duplica (o se divide por 2) en ~6 frames
const acelerones = [];
for (let i = 3; i < suav.length - 3; i++) {
  const r = suav[i + 3] / (suav[i - 3] || 1e-6);
  if ((r > 2 || r < 0.5) && !acelerones.some((a) => Math.abs(a - (i + muertoIni)) < 8)) acelerones.push(i + muertoIni);
}
// parpadeo: oscilación de brillo frame a frame (no tendencia)
const dy = yavg.slice(1).map((v, i) => Math.abs(v - yavg[i]));
const parpadeo = mediana(dy);

// --- avance de la cámara y saltos de contenido ---
// Fotogramas en gris a 12 fps y 192 px de ancho. Para cada par seguido se busca la escala (hacia --centro)
// con la que el primero, ampliado, mejor encaja con el segundo; el error que queda tras compensarla es el
// "residuo". Un residuo que se dispara = la escena cambia aunque no haya corte.
const FPS_M = 12, AN = 192;
const AL = Math.max(2, Math.round((AN * info.alto) / info.ancho / 2) * 2);
const crudo = spawnSync(ffmpeg, ['-hide_banner', '-v', 'error', '-i', video, '-vf', `fps=${FPS_M},scale=${AN}:${AL}:flags=area,format=gray`,
  '-f', 'rawvideo', '-'], { maxBuffer: 1024 * 1024 * 1024 });
const tam = AN * AL;
const nf = Math.floor((crudo.stdout?.length || 0) / tam);
const fot = (i) => crudo.stdout.subarray(i * tam, (i + 1) * tam);
const cx = centroX * (AN - 1), cy = centroY * (AL - 1);
const x0 = Math.round(AN * 0.15), x1 = Math.round(AN * 0.85), y0 = Math.round(AL * 0.15), y1 = Math.round(AL * 0.85);
const difs = new Float32Array(Math.ceil((x1 - x0) / 2) * Math.ceil((y1 - y0) / 2) + 8);
function residuo(A, B, s, dx = 0, dy = 0) {
  let n = 0, suma = 0;
  for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
    const sx = Math.min(AN - 1.001, Math.max(0, cx + (x - cx) / s - dx)), sy = Math.min(AL - 1.001, Math.max(0, cy + (y - cy) / s - dy));
    const ix = sx | 0, iy = sy | 0, fx = sx - ix, fy = sy - iy, k = iy * AN + ix;
    const a = (A[k] * (1 - fx) + A[k + 1] * fx) * (1 - fy) + (A[k + AN] * (1 - fx) + A[k + AN + 1] * fx) * fy;
    const d = B[y * AN + x] - a; difs[n++] = d; suma += d;
  }
  const m = suma / n; let e = 0; // se descuenta el cambio de brillo general
  for (let i = 0; i < n; i++) e += Math.abs(difs[i] - m);
  return e / n;
}
const escalas = [], residuos = [], desplazamientos = [];
for (let i = 0; i + 1 < nf; i++) {
  const r = ajustar(fot(i), fot(i + 1), 0.9, 1.15);
  escalas.push(r.escala); residuos.push(r.residuo); desplazamientos.push([r.dx, r.dy]);
}
// desplazamiento (paneo, travelling lateral) y escala (acercamiento) se buscan por turnos para no confundirlos
function ajustar(A, B, sMin, sMax, dx0 = 0, dy0 = 0) {
  let mejor = 1, dx = dx0, dy = dy0, menor = Infinity;
  const paso = (sMax - sMin) / 50;
  const buscarDesplazamiento = (s, paso, radio) => {
    const bx = dx, by = dy;
    for (let ox = -radio; ox <= radio; ox += paso) for (let oy = -radio; oy <= radio; oy += paso) {
      const e = residuo(A, B, s, bx + ox, by + oy); if (e < menor) { menor = e; dx = bx + ox; dy = by + oy; }
    }
  };
  const buscarEscala = (desde, hasta, paso) => {
    for (let s = desde; s <= hasta; s += paso) { const e = residuo(A, B, s, dx, dy); if (e < menor) { menor = e; mejor = s; } }
  };
  mejor = sMin <= 1 && sMax >= 1 ? 1 : (sMin + sMax) / 2;
  buscarDesplazamiento(mejor, 1, 8);
  menor = Infinity;
  buscarEscala(sMin, sMax, paso);
  buscarDesplazamiento(mejor, 0.25, 1.5);
  buscarEscala(mejor - paso, mejor + paso, paso / 10);
  buscarDesplazamiento(mejor, 0.25, 0.5);
  return { escala: mejor, residuo: menor, dx, dy };
}
// escala de cada medio segundo, medida directamente entre los dos fotogramas (la de los pasos sueltos solo da
// el punto de partida: al multiplicar 6 pasos pequeños el error se acumula)
const avance = [];
for (let i = 0; i + FPS_M / 2 <= escalas.length; i += FPS_M / 2) {
  const guia = escalas.slice(i, i + FPS_M / 2).reduce((p, x) => p * x, 1);
  const tramo = desplazamientos.slice(i, i + FPS_M / 2);
  const r = ajustar(fot(i), fot(i + FPS_M / 2), guia * 0.9, guia * 1.1,
    tramo.reduce((s, d) => s + d[0], 0), tramo.reduce((s, d) => s + d[1], 0));
  avance.push({ t: +(i / FPS_M).toFixed(2), escala: +r.escala.toFixed(3) });
}
const escalaMediana = avance.length ? mediana(avance.map((a) => a.escala)) : 1;
const tipoMovimiento = escalaMediana > 1.015 ? 'acercamiento' : escalaMediana < 1 / 1.015 ? 'alejamiento' : 'sin acercamiento';
const escalaTotal = avance.reduce((p, a) => p * a.escala, 1) * escalas.slice(avance.length * (FPS_M / 2)).reduce((p, x) => p * x, 1);
const fuerza = (e) => (tipoMovimiento === 'alejamiento' ? 1 / e : e) - 1;
const tramosParados = tipoMovimiento === 'sin acercamiento' ? []
  : avance.filter((a) => fuerza(a.escala) < 0.35 * fuerza(escalaMediana)).map((a) => a.t);
// saltos: residuo muy por encima de sus vecinos y del nivel normal del vídeo
const resMed = residuos.length ? mediana(residuos) : 0;
const saltos = [];
residuos.forEach((v, i) => {
  const vec = residuos.slice(Math.max(0, i - 6), i).concat(residuos.slice(i + 1, i + 7));
  if (!vec.length) return;
  const mv = mediana(vec);
  if (v > 2.5 * mv && v > 2 * resMed && v - mv > 3 && !saltos.some((s) => Math.abs(s.t - (i + 1) / FPS_M) < 0.4))
    saltos.push({ t: +((i + 1) / FPS_M).toFixed(2), residuo: +v.toFixed(1), normal: +mv.toFixed(1) });
});
// tirones: durante ~0,4 s la cámara se lanza (más del doble de avance que antes y después) y la imagen
// cambia más de lo que explica el movimiento. Es el salto "disimulado" con desenfoque de movimiento:
// la IA se salta un tramo de camino para llegar al último fotograma.
const ln = escalas.map((e) => Math.log(e));
const tirones = [];
for (let i = 2; i < ln.length - 2; i++) {
  const local = media(ln.slice(i - 2, i + 3)), resLocal = media(residuos.slice(i - 2, i + 3));
  const ref = ln.slice(Math.max(0, i - 12), Math.max(0, i - 4)).concat(ln.slice(i + 5, i + 13));
  const refRes = residuos.slice(Math.max(0, i - 12), Math.max(0, i - 4)).concat(residuos.slice(i + 5, i + 13));
  if (ref.length < 6) continue;
  const base = mediana(ref), baseRes = mediana(refRes);
  if (local > 0.012 && local > 1.6 * Math.max(base, 0.004) && local - base > 0.02 && resLocal > 1.5 * baseRes) {
    const t = +((i + 1) / FPS_M).toFixed(2);
    const previo = tirones.find((x) => t - x.hasta <= 0.25);
    if (previo) previo.hasta = t; else tirones.push({ desde: t, hasta: t });
  }
}
// si en ese tramo ya hay un corte o un salto, es el mismo fallo: no se cuenta dos veces
for (let k = tirones.length - 1; k >= 0; k--) {
  const x = tirones[k], dentro = (t) => t >= x.desde - 0.35 && t <= x.hasta + 0.35;
  if (escenas.some((e) => dentro(e.t)) || saltos.some((s) => dentro(s.t))) tirones.splice(k, 1);
}
const brillo = (t) => yavg[Math.min(yavg.length - 1, Math.max(0, Math.round(t * info.fps)))] || 0;
for (const x of tirones) {
  const antes = brillo(x.desde - 0.25), despues = brillo(x.hasta + 0.25);
  x.cambioLuz = antes ? +(((despues - antes) / antes) * 100).toFixed(0) : 0;
}

const veredictos = [];
for (const x of tirones) veredictos.push(`TIRÓN de ${x.desde} a ${x.hasta} s: la cámara se lanza (más del doble de avance que antes y después) y la imagen cambia más de lo que explica el movimiento${Math.abs(x.cambioLuz) >= 15 ? `, con la luz cambiando un ${x.cambioLuz} %` : ''}. Es un salto disimulado con desenfoque: la IA se salta un tramo para llegar al último fotograma y parecerán dos vídeos unidos. Suele venir de un fin demasiado distinto del inicio o de demasiadas fases en el prompt. Mira la hoja en esos segundos.`);
if (escenas.length) veredictos.push(`CORTES DE ESCENA (scdet) en los segundos ${escenas.map((e) => `${e.t} (puntuación ${e.puntuacion})`).join(', ')}: es otro plano. Usa solo un tramo o regenera.`);
for (const s of saltos) if (!escenas.some((e) => Math.abs(e.t - s.t) < 0.3))
  veredictos.push(`SALTO DE CONTENIDO hacia el s ${s.t}: sin corte limpio, pero la escena cambia de golpe (error ${s.residuo} frente a ${s.normal} normal); parecerán dos vídeos unidos. Suele venir de un último fotograma demasiado distinto del primero. Mira la hoja en ese segundo; regenera con un fin más cercano, recorta o tapa la costura.`);
if (tipoMovimiento !== 'sin acercamiento' && fuerza(escalaMediana) < 0.05) veredictos.push(`Recorrido CORTO: ×${escalaMediana.toFixed(3)} cada 0,5 s (×${escalaTotal.toFixed(2)} en todo el clip). Se verá como un zoom lento, no como entrar en el sitio. Si buscabas recorrido, el inicio y el fin estaban demasiado cerca o el modelo no se movió; se puede reforzar por código con un acercamiento sobre el vídeo ampliado.`);
if (tramosParados.length) veredictos.push(`La cámara CASI SE PARA (o va mucho más lenta que el resto) en los medios segundos que empiezan en ${tramosParados.join(', ')} s (escala típica ×${escalaMediana.toFixed(3)} cada 0,5 s). Arréglalo por código (acercamiento suave sobre el vídeo ampliado, o repartir los fotogramas para que la escala crezca a pasos iguales) o recorta; no hace falta regenerar.`);
if (cortes.length) veredictos.push(`CORTES o saltos en frames ${cortes.map((c) => c.frame).join(', ')}: el scrub saltará. Regenera o usa solo el tramo sin cortes.`);
if (pctDuplicados > 0.1) veredictos.push(`FRAMES DUPLICADOS: ${(pctDuplicados * 100).toFixed(0)} % (vídeo ralentizado o a menos fps de los que dice): el scrub irá a escalones. Quítalos antes de extraer: ffmpeg -i v.mp4 -vf "mpdecimate,setpts=N/24/TB" -r 24 limpio.mp4 (o interpola).`);
if (acelerones.length) veredictos.push(`Cambios bruscos de velocidad hacia los frames ${acelerones.join(', ')}: el scroll "acelera" ahí. Recorta ese tramo, remapea el tiempo o regenera con "constant speed".`);
if (cv > 0.7) veredictos.push(`Velocidad MUY irregular (variación ${cv.toFixed(2)}): el scroll irá a tirones. Regenera pidiendo "constant speed" o remapea el tiempo.`);
else if (cv > 0.45) veredictos.push(`Velocidad algo irregular (variación ${cv.toFixed(2)}): aceptable; mejor si recortas los extremos.`);
if (muertoIni > 2 || muertoFin > 2) veredictos.push(`Tramos casi quietos: ${muertoIni} frames al inicio y ${muertoFin} al final → extrae con --inicio ${(muertoIni / info.fps).toFixed(2)} --fin ${((ydif.length - muertoFin) / info.fps).toFixed(2)}.`);
if (parpadeo > 1.2) veredictos.push(`Posible PARPADEO de luz (variación media de brillo ${parpadeo.toFixed(2)}/frame). Revisa la hoja; prueba ffmpeg -vf deflicker o regenera.`);
if (med < 1) veredictos.push(`CASI SIN MOVIMIENTO (movimiento mediano ${med.toFixed(2)}): bien para un bucle de fondo; si pedías un recorrido, la cámara no se ha movido${saltos.length ? ' y el cambio se concentra en el salto' : ''}.`);
if (info.ancho < 1280 && info.alto < 1280) veredictos.push(`Resolución baja (${info.ancho}x${info.alto}): en escritorio se verá blando. Pide 1080p o reescala con IA antes.`);
const saltosSinCorte = saltos.filter((s) => !escenas.some((e) => Math.abs(e.t - s.t) < 0.3));
const apto = !cortes.length && !escenas.length && !saltosSinCorte.length && !tirones.length && !acelerones.length && pctDuplicados <= 0.1 && cv <= 0.7;

// hoja de contactos: 12 frames repartidos
const n = ydif.length;
const pasoHoja = Math.max(1, Math.floor(n / 12));
spawnSync(ffmpeg, ['-hide_banner', '-v', 'error', '-y', '-i', video, '-vf',
  `select='not(mod(n\\,${pasoHoja}))',scale=400:-2,tile=4x3:padding=4:color=white`, '-frames:v', '1', '-fps_mode', 'vfr', hoja]);
const segundosHoja = Array.from({ length: 12 }, (_, k) => +((k * pasoHoja) / info.fps).toFixed(2)).filter((t) => t < info.duracion);

const res = { video: basename(video), ...info, frames: n, movimientoMediano: +med.toFixed(2), variacionVelocidad: +cv.toFixed(3),
  cortes: cortes.map((c) => c.frame), escenas, saltos: saltosSinCorte, tirones, tipoMovimiento, escalaCadaMedioSegundo: +escalaMediana.toFixed(3), escalaTotal: +escalaTotal.toFixed(2), avance, tramosParados,
  acelerones, framesDuplicados: duplicados, quietoInicio: muertoIni, quietoFinal: muertoFin, parpadeo: +parpadeo.toFixed(2), apto, veredictos, hoja, segundosHoja };
if (argv.includes('--detalle')) res.detalle = escalas.map((e, i) => ({ t: +((i + 1) / FPS_M).toFixed(2), escala: +e.toFixed(4), residuo: +residuos[i].toFixed(2), brillo: +(yavg[Math.min(yavg.length - 1, Math.round(((i + 1) / FPS_M) * info.fps))] ?? 0).toFixed(1) }));
if (comoJson) console.log(JSON.stringify(res, null, 2));
else {
  console.log(`${res.video}: ${info.ancho}x${info.alto}, ${info.fps} fps, ${info.duracion} s, ${n} frames`);
  console.log(`movimiento mediano ${res.movimientoMediano} · variación de velocidad ${res.variacionVelocidad} · parpadeo ${res.parpadeo}`);
  if (tipoMovimiento !== 'sin acercamiento') console.log(`${tipoMovimiento} (×${escalaTotal.toFixed(2)} en total): escala cada 0,5 s →${avance.map((a) => `${a.t}s ×${a.escala}`).join(' · ')}`);
  console.log(apto ? 'APTO para scroll-scrubbing.' : 'NO APTO tal cual.');
  for (const v of veredictos) console.log(' - ' + v);
  console.log(`hoja de contactos: ${hoja} (segundos: ${segundosHoja.join(', ')})`);
}
