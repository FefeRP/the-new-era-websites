#!/usr/bin/env node
// Prueba de revisar-video.mjs con vídeos sintéticos de verdad conocida (sin IA, sin red, 0 $).
// Genera con ffmpeg un acercamiento constante, uno que se para al final, uno con salto de contenido
// sin corte (fundido de 3 fotogramas a otra escena), uno con corte seco y un paneo lateral, y comprueba
// que el informe dice lo que tiene que decir.
// Uso (desde la raíz del repo o desde aquí): node pruebas/revisar-video/probar.mjs
// Necesita ffmpeg (variable FFMPEG o en el PATH).

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const salida = join(aqui, 'salida');
mkdirSync(salida, { recursive: true });
const script = join(aqui, '..', '..', 'plugins', 'the-new-era-websites', 'skills', 'video-ia-para-scroll', 'scripts', 'revisar-video.mjs');
const ffmpeg = process.env.FFMPEG && existsSync(process.env.FFMPEG) ? process.env.FFMPEG : 'ffmpeg';

function ff(args) {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-v', 'error', '-y', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr);
}
// dos "escenas" con textura fina y parecida (así el salto no es un simple cambio de brillo)
const escenaA = join(salida, 'escena-a.png'), escenaB = join(salida, 'escena-b.png');
if (!existsSync(escenaA)) ff(['-f', 'lavfi', '-i', 'mandelbrot=size=2560x1440:start_x=-0.743643887:start_y=0.131825904:start_scale=0.02:maxiter=400', '-frames:v', '1', escenaA]);
if (!existsSync(escenaB)) ff(['-f', 'lavfi', '-i', 'mandelbrot=size=2560x1440:start_x=-0.1011:start_y=0.9563:start_scale=0.02:maxiter=400', '-frames:v', '1', escenaB]);

// acercamiento hacia el centro con zoompan: z(on) en cada fotograma de salida, 24 fps, 1280x720
const zoom = (img, expr, frames, out) => ff(['-loop', '1', '-i', img, '-vf',
  `zoompan=z='${expr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1280x720:fps=24,format=yuv420p`,
  '-frames:v', String(frames), '-c:v', 'libx264', '-crf', '16', out]);

const casos = [];
// 1) bueno: ×2,5 en 5 s a ritmo constante (×1,096 cada medio segundo)
const bueno = join(salida, 'bueno.mp4');
zoom(escenaA, 'pow(2.5,on/120)', 120, bueno);
casos.push({ nombre: 'acercamiento constante', video: bueno, espera: (r) => r.apto && r.tipoMovimiento === 'acercamiento' && !r.tramosParados.length && !r.saltos.length && !r.tirones.length && !r.escenas.length && Math.abs(r.escalaCadaMedioSegundo - 1.096) < 0.03 });
// 2) se para: igual hasta 3,5 s y luego casi quieta (×1,01 cada medio segundo)
const parado = join(salida, 'parado.mp4');
zoom(escenaA, 'if(lt(on,84),pow(2.5,on/120),pow(2.5,84/120)*pow(1.01,(on-84)/12))', 120, parado);
casos.push({ nombre: 'cámara que se para a los 3,5 s', video: parado, espera: (r) => r.tipoMovimiento === 'acercamiento' && r.tramosParados.length >= 2 && r.tramosParados.every((t) => t >= 3.4) && !r.tirones.length });
// 2b) recorrido corto: constante pero solo ×1,03 cada medio segundo (la cámara "apenas avanza")
const corto = join(salida, 'corto.mp4');
zoom(escenaA, 'pow(1.35,on/120)', 120, corto);
casos.push({ nombre: 'recorrido corto (×1,03 cada 0,5 s)', video: corto, espera: (r) => r.apto && r.veredictos.some((v) => v.startsWith('Recorrido CORTO')) && Math.abs(r.escalaTotal - 1.35) < 0.08 });
// 3) salto sin corte: a los 1,5 s pasa a otra escena con un fundido de 3 fotogramas, sin dejar de acercarse
const a = join(salida, 'tramo-a.mp4'), b = join(salida, 'tramo-b.mp4'), salto = join(salida, 'salto.mp4');
zoom(escenaA, 'pow(2.5,on/120)', 40, a);
zoom(escenaB, 'pow(2.5,(on+36)/120)', 84, b);
ff(['-i', a, '-i', b, '-filter_complex', '[0][1]xfade=transition=fade:duration=0.125:offset=1.5,format=yuv420p', '-c:v', 'libx264', '-crf', '16', salto]);
casos.push({ nombre: 'salto de contenido sin corte (s 1,5)', video: salto, espera: (r) => !r.apto && (r.saltos.some((s) => Math.abs(s.t - 1.55) < 0.3) || r.escenas.some((e) => Math.abs(e.t - 1.55) < 0.3)) });
// 4) corte seco a los 2 s
const ca = join(salida, 'corte-a.mp4'), cb = join(salida, 'corte-b.mp4'), corte = join(salida, 'corte.mp4');
zoom(escenaA, 'pow(2.5,on/120)', 48, ca);
zoom(escenaB, 'pow(2.5,(on+48)/120)', 72, cb);
ff(['-i', ca, '-i', cb, '-filter_complex', '[0][1]concat=n=2:v=1,format=yuv420p', '-c:v', 'libx264', '-crf', '16', corte]);
casos.push({ nombre: 'corte seco (s 2)', video: corte, espera: (r) => !r.apto && r.escenas.some((e) => Math.abs(e.t - 2) < 0.1) });
// 4b) salto disimulado (como el de un clip real con primer y último fotograma muy distintos): de 1,0 a 1,5 s
// la cámara se lanza al triple de su ritmo y la escena pasa a otra con un fundido largo de 0,4 s
const ta = join(salida, 'tiron-a.mp4'), tb = join(salida, 'tiron-b.mp4'), tiron = join(salida, 'tiron.mp4');
zoom(escenaA, 'if(lt(on,24),pow(2.5,on/120),pow(2.5,(24+3*(on-24))/120))', 40, ta);
zoom(escenaB, 'pow(2.5,(84+on)/120)', 84, tb);
ff(['-i', ta, '-i', tb, '-filter_complex', '[0][1]xfade=transition=fade:duration=0.4:offset=1.15,format=yuv420p', '-c:v', 'libx264', '-crf', '16', tiron]);
casos.push({ nombre: 'salto disimulado: tirón y fundido largo (1,0-1,6 s)', video: tiron, espera: (r) => !r.apto && r.tirones.some((x) => x.desde <= 1.5 && x.hasta >= 1.0) });
// 5) paneo lateral sin acercamiento: no debe inventarse paradas ni saltos
const paneo = join(salida, 'paneo.mp4');
ff(['-loop', '1', '-i', escenaA, '-vf', "scale=2560:1440,crop=1280:720:'200+t*160':360,format=yuv420p", '-t', '5', '-r', '24', '-c:v', 'libx264', '-crf', '16', paneo]);
casos.push({ nombre: 'paneo lateral', video: paneo, espera: (r) => r.tipoMovimiento === 'sin acercamiento' && !r.tramosParados.length && !r.saltos.length && !r.tirones.length && !r.escenas.length });

let fallos = 0;
for (const c of casos) {
  const r = spawnSync(process.execPath, [script, c.video, '--json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) { console.log(`FALLA  ${c.nombre}: el script salió con ${r.status}\n${r.stderr}`); fallos++; continue; }
  const inf = JSON.parse(r.stdout);
  const ok = c.espera(inf);
  if (!ok) fallos++;
  console.log(`${ok ? 'OK    ' : 'FALLA '} ${c.nombre}: apto=${inf.apto} movimiento=${inf.tipoMovimiento} ×${inf.escalaCadaMedioSegundo}/0,5 s · parados=[${inf.tramosParados}] · saltos=[${inf.saltos.map((s) => s.t)}] · tirones=[${inf.tirones.map((x) => x.desde + '-' + x.hasta)}] · escenas=[${inf.escenas.map((e) => e.t)}]`);
  if (!ok) console.log('   ' + JSON.stringify({ avance: inf.avance, saltos: inf.saltos, escenas: inf.escenas, veredictos: inf.veredictos }));
}
console.log(fallos ? `${fallos} de ${casos.length} casos fallan` : `${casos.length} de ${casos.length} casos bien`);
process.exit(fallos ? 1 : 0);
