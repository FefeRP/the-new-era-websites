#!/usr/bin/env node
// Prueba de la skill video-desde-html: renderiza sus plantillas con HyperFrames y comprueba lo que sale.
//   node probar.mjs [bucle] [capa-alfa] [scroll-a-video]      (sin argumentos: las tres; ~10 min sin GPU)
// Necesita: npm install --ignore-scripts (aquí), ffmpeg (FFMPEG/FFPROBE o PATH) y, para scroll-a-video, los frames de
// la demo del reloj (demos/reloj/public/frames/reloj).
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, '..', '..');
const skill = join(raiz, 'plugins', 'the-new-era-websites', 'skills', 'video-desde-html');
const HF = join(skill, 'scripts', 'hf.mjs');
const MEDIR = join(skill, 'scripts', 'medir-bucle.mjs');
const FFPROBE = process.env.FFPROBE || 'ffprobe';
const trabajo = join(aqui, 'salida', 'trabajo');
const salida = join(aqui, 'salida');
mkdirSync(trabajo, { recursive: true });

let bien = 0, mal = 0;
const medidas = {};
const ok = (c, texto) => { c ? bien++ : mal++; console.log(`${c ? 'OK ' : 'MAL'} ${texto}`); };
const node = (args, cwd) => spawnSync(process.execPath, args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28 });
const sonda = (fichero, extra = []) => {
  const r = spawnSync(FFPROBE, ['-v', 'error', ...extra, '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=codec_name,width,height,pix_fmt,r_frame_rate,nb_read_frames', '-of', 'json', fichero], { encoding: 'utf8' });
  try { return JSON.parse(r.stdout).streams[0]; } catch { return {}; }
};
function preparar(nombre) {
  const d = join(trabajo, nombre);
  rmSync(d, { recursive: true, force: true });
  cpSync(join(skill, 'plantillas', nombre), d, { recursive: true });
  const r = node([HF, 'preparar', d]);
  if (r.status !== 0) { console.error(r.stderr || r.stdout); process.exit(2); }
  return d;
}
function render(nombre, d, args, destino) {
  const lint = node([HF, 'lint'], d);
  ok(/0 errors?/.test(lint.stdout + lint.stderr), `${nombre}: lint sin errores`);
  const t0 = Date.now();
  const r = node([HF, 'render', '--workers', '1', '--quiet', ...args, '-o', destino], d);
  const s = Math.round((Date.now() - t0) / 1000);
  medidas[nombre] = { ...(medidas[nombre] || {}), [args.includes('png-sequence') ? 'renderPngS' : 'renderS']: s };
  ok(r.status === 0 && existsSync(destino), `${nombre}: render terminado en ${s} s`);
  if (r.status !== 0) console.log((r.stdout + r.stderr).split('\n').filter((l) => !/GL Driver/.test(l)).slice(-12).join('\n'));
}
const medir = (fichero) => { try { return JSON.parse(node([MEDIR, fichero]).stdout.trim().split('\n').pop()); } catch { return {}; } };

const cuales = process.argv.slice(2).length ? process.argv.slice(2) : ['bucle', 'capa-alfa', 'scroll-a-video'];

if (cuales.includes('bucle')) {
  const d = preparar('bucle'), f = join(salida, 'bucle.mp4');
  render('bucle', d, ['--fps', '30'], f);
  const s = sonda(f);
  ok(s.width === 1920 && s.height === 1080 && s.r_frame_rate === '30/1' && Number(s.nb_read_frames) === 180, `bucle: 1920x1080 a 30 fps y 180 fotogramas (${s.width}x${s.height}, ${s.nb_read_frames})`);
  const m = medir(f);
  medidas.bucle.costura = m;
  ok(m.sinCorte === true && m.relacion <= 1.5, `bucle: cierra sin corte (costura ${m.costura}, salto normal ${m.saltoMediano}, relación ${m.relacion})`);
  ok(m.repetidos === 0 && m.saltoMediano > 0.2, 'bucle: se mueve en todos los fotogramas, sin repetidos');
}

if (cuales.includes('capa-alfa')) {
  const d = preparar('capa-alfa'), f = join(salida, 'capa.webm'), png = join(salida, 'capa-png');
  rmSync(png, { recursive: true, force: true });
  render('capa-alfa', d, ['--format', 'webm'], f);
  const s = sonda(f, ['-c:v', 'libvpx-vp9']);
  ok(s.pix_fmt === 'yuva420p' && Number(s.nb_read_frames) === 30, `capa-alfa: WebM VP9 con alfa y 30 fotogramas (${s.pix_fmt}, ${s.nb_read_frames})`);
  render('capa-alfa', d, ['--format', 'png-sequence'], png);
  const lista = existsSync(png) ? readdirSync(png).filter((n) => n.endsWith('.png')).sort() : [];
  const p = lista.length ? sonda(join(png, lista[0])) : {};
  ok(lista.length === 30 && p.pix_fmt === 'rgba', `capa-alfa: 30 PNG con alfa (${lista.length}, ${p.pix_fmt})`);
  // la esquina tiene que ser transparente de verdad
  const FF = process.env.FFMPEG || 'ffmpeg';
  const px = lista.length ? spawnSync(FF, ['-v', 'error', '-i', join(png, lista[0]), '-vf', 'crop=1:1:5:5,format=rgba', '-f', 'rawvideo', '-']).stdout : Buffer.alloc(4, 255);
  ok(px[3] === 0, `capa-alfa: la esquina del primer PNG es transparente (alfa ${px[3]})`);
}

if (cuales.includes('scroll-a-video')) {
  const frames = join(raiz, 'demos', 'reloj', 'public', 'frames', 'reloj');
  if (!existsSync(join(frames, 'manifest.json'))) {
    console.log('SALTADA scroll-a-video: faltan los frames de demos/reloj (ver su LEEME)');
  } else {
    const d = preparar('scroll-a-video'), f = join(salida, 'scroll-a-video.mp4');
    cpSync(frames, join(d, 'frames'), { recursive: true, filter: (o) => !/\.mp4$/.test(o) });
    cpSync(join(raiz, 'plugins', 'the-new-era-websites', 'skills', 'scroll-frames', 'scripts', 'frame-scrubber.js'), join(d, 'frame-scrubber.js'));
    render('scroll-a-video', d, ['--fps', '30'], f);
    const s = sonda(f);
    ok(s.width === 1080 && s.height === 1920 && Number(s.nb_read_frames) === 180, `scroll-a-video: 1080x1920 y 180 fotogramas (${s.width}x${s.height}, ${s.nb_read_frames})`);
    const m = medir(f);
    medidas['scroll-a-video'].movimiento = m;
    // con curva suave el principio y el final van despacio: se admite algún fotograma casi igual, pero no un vídeo parado
    ok(m.saltoMediano > 0.15 && m.repetidos <= 30, `scroll-a-video: la secuencia avanza con el tiempo (salto normal ${m.saltoMediano}, casi iguales ${m.repetidos})`);
    ok(m.costura > m.saltoMediano * 5, `scroll-a-video: acaba lejos de donde empieza, se recorrió la secuencia (costura ${m.costura})`);
  }
}

for (const n of Object.keys(medidas)) { const f = join(salida, n === 'capa-alfa' ? 'capa.webm' : `${n}.mp4`); if (existsSync(f)) medidas[n].MB = +(statSync(f).size / 1048576).toFixed(2); }
writeFileSync(join(salida, 'medidas.json'), JSON.stringify(medidas, null, 2));
console.log(`\n${bien} bien, ${mal} fallan · medidas en salida/medidas.json`);
process.exit(mal ? 1 : 0);
