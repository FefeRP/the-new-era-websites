#!/usr/bin/env node
// Prepara las variantes de montaje de un clip para medir el scrub en la web: vídeo con distintos códecs y GOP, y
// secuencias de frames en WebP, AVIF y JPEG, en tamaño de escritorio (16:9) y de móvil (recorte 9:16).
//   node pruebas/montaje-web/preparar.mjs <clip.mp4> [salida=pruebas/montaje-web/salida/<nombre>]
// Necesita ffmpeg (variables FFMPEG / FFPROBE o en el PATH). El clip de entrada solo se lee.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const FF = process.env.FFMPEG || 'ffmpeg';
const FP = process.env.FFPROBE || 'ffprobe';
const aqui = dirname(fileURLToPath(import.meta.url));
const clip = resolve(process.argv[2] || '');
if (!process.argv[2] || !existsSync(clip)) { console.error('Uso: node preparar.mjs <clip.mp4> [salida]'); process.exit(1); }
const salida = resolve(process.argv[3] || join(aqui, 'salida', basename(clip).replace(/\.\w+$/, '')));
mkdirSync(salida, { recursive: true });

const ff = (args) => execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
const claves = (f) => execFileSync(FP, ['-v', 'error', '-select_streams', 'v', '-skip_frame', 'nokey', '-show_entries', 'frame=pts_time', '-of', 'csv=p=0', f]).toString().trim().split(/\s+/).filter(Boolean).length;
const tam = (f) => statSync(f).isDirectory() ? readdirSync(f).reduce((s, x) => s + statSync(join(f, x)).size, 0) : statSync(f).size;

// Escritorio: 1280 de ancho, 16:9. Móvil: recorte central 9:16 a 540x960.
const filtros = { escritorio: 'scale=1280:-2:flags=lanczos', movil: 'crop=ih*9/16:ih,scale=540:960:flags=lanczos' };
const videos = [
  // [nombre, args de códec, extensión]
  ['h264-g1', ['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-g', '1', '-bf', '0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], 'mp4'],
  ['h264-g4', ['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-g', '4', '-keyint_min', '4', '-sc_threshold', '0', '-bf', '0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], 'mp4'],
  // g8 con y sin B-frames: lo que usan Apple y la skill oficial de Higgsfield, y lo que sacaba extraer-frames
  ['h264-g8', ['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-g', '8', '-keyint_min', '8', '-sc_threshold', '0', '-bf', '0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], 'mp4'],
  ['h264-g8-bf', ['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-g', '8', '-keyint_min', '8', '-sc_threshold', '0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], 'mp4'],
  ['h264-g12',['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-g', '12', '-keyint_min', '12', '-sc_threshold', '0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], 'mp4'],
  ['h264-g121', ['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-g', '300', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], 'mp4'],
  ['vp9-g1', ['-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-g', '1', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p'], 'webm'],
  ['vp9-g12', ['-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-g', '12', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p'], 'webm'],
  ['av1-g12', ['-c:v', 'libsvtav1', '-crf', '36', '-preset', '6', '-g', '12', '-svtav1-params', 'keyint=12:scd=0', '-pix_fmt', 'yuv420p'], 'webm'],
  // AV1 todo intra no se prueba: libaom se queda sin memoria en -g 1 y, además, sin hardware (iPhone anterior al
  // 15 Pro) AV1 no se decodifica en Safari: no sirve como formato único de scrub.
];
const frames = [
  ['webp', 'webp', ['-c:v', 'libwebp', '-quality', '72', '-compression_level', '6']],
  ['avif', 'avif', ['-c:v', 'libaom-av1', '-crf', '32', '-b:v', '0', '-cpu-used', '6', '-still-picture', '1']],
  ['jpg', 'jpg', ['-c:v', 'mjpeg', '-q:v', '4']],
];

const informe = { clip, salida, variantes: [] };
for (const [disp, vf] of Object.entries(filtros)) {
  for (const [nombre, args, ext] of videos) {
    const f = join(salida, `${disp}-${nombre}.${ext}`);
    if (!existsSync(f)) { process.stdout.write(`${disp} ${nombre}… `); ff(['-i', clip, '-an', '-vf', vf, ...args, f]); console.log('ok'); }
    informe.variantes.push({ tipo: 'video', disp, nombre, fichero: basename(f), bytes: tam(f), claves: claves(f) });
  }
  for (const [nombre, ext, args] of frames) {
    const dir = join(salida, `${disp}-frames-${nombre}`);
    if (!existsSync(dir) || !readdirSync(dir).length) {
      mkdirSync(dir, { recursive: true });
      process.stdout.write(`${disp} frames ${nombre}… `);
      // AVIF: cada frame como imagen suelta (el muxer avif no admite el patrón %04d en todas las versiones)
      if (ext === 'avif') {
        const tmp = join(dir, '_png'); mkdirSync(tmp, { recursive: true });
        ff(['-i', clip, '-vf', vf, join(tmp, '%04d.png')]);
        for (const p of readdirSync(tmp)) ff(['-i', join(tmp, p), ...args, '-frames:v', '1', join(dir, p.replace('.png', '.avif'))]);
        execFileSync(process.platform === 'win32' ? 'cmd' : 'rm', process.platform === 'win32' ? ['/c', 'rmdir', '/s', '/q', tmp] : ['-rf', tmp]);
      } else ff(['-i', clip, '-vf', vf, ...args, join(dir, `%04d.${ext}`)]);
      console.log('ok');
    }
    const n = readdirSync(dir).length;
    informe.variantes.push({ tipo: 'frames', disp, nombre, carpeta: basename(dir), ext, frames: n, bytes: tam(dir) });
  }
}
writeFileSync(join(salida, 'variantes.json'), JSON.stringify(informe, null, 2));
console.log('\nvariante'.padEnd(34), 'MB'.padStart(7), ' claves/frames');
for (const v of informe.variantes) console.log(`${v.disp}-${v.nombre}${v.tipo === 'frames' ? ' (frames)' : ''}`.padEnd(34), (v.bytes / 1e6).toFixed(2).padStart(7), ' ', v.claves ?? v.frames);
