#!/usr/bin/env node
// revisar-ia.mjs: revisión de calidad de un vídeo o imagen generados con IA ("¿se nota falso?") antes de montarlos en la web.
// Manda el fichero a Gemini (API de Google, con TU clave en la variable GEMINI_API_KEY) con la lista de señales de
// references/se-nota-falso.md y guarda el informe. Sin clave (o con --solo-prompt) imprime el prompt para usarlo en cualquier
// modelo que vea vídeo. Sin dependencias: Node 18+ (fetch) y, para vídeos grandes, ffmpeg.
//
//   node revisar-ia.mjs clip.mp4 [--contexto "zoom a la pantalla de un portátil en un ático"] [--salida informe.md]
//        [--modelo gemini-flash-latest] [--fps 4] [--solo-prompt]
//
// Coste orientativo: 0,003-0,02 $ por clip de 5 s con un modelo "flash". Los modelos de revisión se inventan fallos:
// confirma cada uno con fotogramas ampliados (ver references/se-nota-falso.md).
import { readFileSync, writeFileSync, statSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, extname, basename } from 'node:path';
import { tmpdir } from 'node:os';

const argv = process.argv.slice(2);
const op = (k, def) => { const i = argv.indexOf(`--${k}`); return i !== -1 ? argv[i + 1] : def; };
const fichero = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && argv[i - 1] !== '--solo-prompt'));
if (!fichero || !existsSync(fichero)) {
  console.error('Uso: node revisar-ia.mjs <video|imagen> [--contexto "..."] [--salida informe.md] [--modelo id] [--fps N] [--solo-prompt]');
  process.exit(2);
}
const contexto = op('contexto', 'asset for a premium scroll-driven website');
const esImagen = /\.(png|jpe?g|webp)$/i.test(fichero);

const PROMPT_VIDEO = `You are a senior VFX supervisor reviewing an AI-generated clip that will be scrubbed frame by frame with the scroll on a premium
website. Context: ${contexto}. Be strict but do not invent problems: report only what you can point to with a timestamp, and say
"not visible" when unsure. For each item give OK / MINOR / SEVERE, the time range (s) and the exact location in the frame:
1 morphing or shape changes, 2 boiling/flickering fine textures, 3 flat zoom without parallax, 4 speed ramps or stutters,
5 frozen or impossible physics, 6 lighting changes or light without a source, 7 glass and reflections (missing or mirror-perfect),
8 plastic materials, 9 bent straight lines or warped geometry, 10 generated text, letters or logos, 11 hands or people,
12 stock-photo composition, 13 dead or generic background, 14 cuts or jumps, 15 anything else that reveals AI.
Then: overall verdict APTO / ARREGLAR POR CÓDIGO / REGENERAR, the 3 most important fixes, and if REGENERAR, which words of the
prompt likely caused it and what to write instead. Answer in Spanish.`;

const PROMPT_IMAGEN = `You are a senior photo editor reviewing an AI-generated key image that will be the first frame of a video and the base of a
premium website. Context: ${contexto}. Be strict but do not invent problems; say "not visible" when unsure. For each item give
OK / MINOR / SEVERE and the exact location: 1 stock-photo or symmetric composition, 2 light without a source or inconsistent
shadows, 3 glass and reflections (missing or mirror-perfect), 4 plastic materials without imperfections, 5 bent straight lines or
warped geometry, 6 generated text, letters or logos, 7 hands or people, 8 absurd scale between objects, 9 generic or postcard
background, 10 surfaces meant for code overlays (screens, signs): are they plain, fully visible, and what is their width/height
ratio as seen, 11 anything else that reveals AI. Then: overall verdict APTO / RETOCAR / REGENERAR and the 3 most important fixes,
with the words to add or remove from the prompt. Answer in Spanish.`;

const prompt = esImagen ? PROMPT_IMAGEN : PROMPT_VIDEO;
const clave = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (argv.includes('--solo-prompt') || !clave) {
  if (!clave && !argv.includes('--solo-prompt')) console.error('(Sin GEMINI_API_KEY: este es el prompt para pegarlo, con el fichero, en cualquier modelo que vea vídeo o imagen.)\n');
  console.log(prompt);
  process.exit(0);
}

// --- Preparar el fichero: inline hasta ~18 MB; si es más grande, una copia 720p ligera con ffmpeg ---
let ruta = fichero, temporal = null;
const LIMITE = 18 * 1024 * 1024;
if (!esImagen && statSync(fichero).size > LIMITE) {
  const ffmpeg = process.env.FFMPEG && existsSync(process.env.FFMPEG) ? process.env.FFMPEG : 'ffmpeg';
  temporal = mkdtempSync(join(tmpdir(), 'revisar-ia-'));
  ruta = join(temporal, 'ligero.mp4');
  const r = spawnSync(ffmpeg, ['-v', 'error', '-y', '-i', fichero, '-vf', 'scale=-2:720', '-an', '-c:v', 'libx264', '-crf', '28', ruta]);
  if (r.status !== 0 || !existsSync(ruta) || statSync(ruta).size > LIMITE) {
    rmSync(temporal, { recursive: true, force: true });
    console.error('El vídeo pasa de 18 MB y no se pudo aligerar con ffmpeg: recórtalo o bájale la resolución.'); process.exit(1); }
}
const mime = { '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[extname(ruta).toLowerCase()] ?? 'video/mp4';
const parteFichero = { inline_data: { mime_type: mime, data: readFileSync(ruta).toString('base64') } };
if (op('fps') && !esImagen) parteFichero.video_metadata = { fps: Number(op('fps')) };
if (temporal) rmSync(temporal, { recursive: true, force: true });

const modelo = op('modelo', process.env.GEMINI_MODEL || 'gemini-flash-latest');
const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`;
const cuerpo = { contents: [{ role: 'user', parts: [parteFichero, { text: prompt }] }], generationConfig: { temperature: 0.2 } };
let res, datos;
for (let intento = 1; intento <= 3; intento++) {
  res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': clave }, body: JSON.stringify(cuerpo) });
  datos = await res.json().catch(() => ({}));
  if (res.ok || ![429, 500, 503].includes(res.status)) break;
  console.error(`Gemini ${res.status}, reintento ${intento}/3…`);
  await new Promise((r) => setTimeout(r, 4000 * intento));
}
if (!res.ok) {
  console.error(`Gemini respondió ${res.status}: ${datos?.error?.message ?? 'sin detalle'}`);
  if (res.status === 429 || res.status === 503) console.error('Cuota o saturación: prueba más tarde o con otro modelo (--modelo).');
  process.exit(1);
}
const texto = (datos.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('').trim();
const uso = datos.usageMetadata ?? {};
const cabecera = `# Revisión IA de ${basename(fichero)}\n\nModelo: ${modelo} · tokens entrada ${uso.promptTokenCount ?? '?'} / salida ${uso.candidatesTokenCount ?? '?'} · ${new Date().toISOString().slice(0, 16)}\n` +
  `Contexto: ${contexto}\n\n> Confirma cada fallo con fotogramas ampliados antes de regenerar: los modelos de revisión se inventan algunos.\n\n`;
const salida = op('salida');
if (salida) { writeFileSync(salida, cabecera + texto + '\n'); console.log(`Informe: ${salida}`); }
console.log(texto);
