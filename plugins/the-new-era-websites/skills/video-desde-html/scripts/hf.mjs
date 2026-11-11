#!/usr/bin/env node
// hf.mjs: lanza el CLI de HyperFrames (HeyGen, Apache-2.0) con un entorno seguro y repetible.
//   node hf.mjs <orden de hyperframes> [opciones]     p. ej.  node hf.mjs render --workers 1 -o salida/hero.mp4
//   node hf.mjs preparar <carpeta>                     copia gsap.min.js a <carpeta>/vendor (las plantillas lo cargan de ahí)
//
// Qué hace distinto de `npx hyperframes`:
// - NO descarga nada: usa el `hyperframes` ya instalado (node_modules más cercano, o HYPERFRAMES_BIN). Si no está,
//   explica cómo instalarlo con versión fijada y sin scripts de instalación, y sale.
// - Telemetría apagada (HYPERFRAMES_NO_TELEMETRY, DO_NOT_TRACK) y sin instalar skills en global (HYPERFRAMES_SKIP_SKILLS).
// - Usa el Chrome del sistema si lo encuentra (HYPERFRAMES_BROWSER_PATH), para que no baje su propio navegador.
// - Si la variable FFMPEG apunta a un ffmpeg, pone su carpeta en el PATH (HyperFrames lo busca ahí).
// Sin dependencias.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';

const VERSION_PROBADA = '0.9.34';
const args = process.argv.slice(2);

function subir(desde, relativo) {
  let d = resolve(desde);
  for (;;) {
    const c = join(d, relativo);
    if (existsSync(c)) return c;
    const p = dirname(d);
    if (p === d) return null;
    d = p;
  }
}
const aqui = dirname(fileURLToPath(import.meta.url));
const REL = join('node_modules', 'hyperframes', 'bin', 'hyperframes.mjs');
const bin = process.env.HYPERFRAMES_BIN || subir(process.cwd(), REL) || subir(aqui, REL);

if (!bin || !existsSync(bin)) {
  console.error(`No encuentro HyperFrames instalado (busqué node_modules/hyperframes desde ${process.cwd()}).
Instálalo en la carpeta de trabajo de los vídeos, con la versión fijada y sin scripts de instalación:

  npm init -y
  npm install --save-dev --save-exact --ignore-scripts hyperframes@${VERSION_PROBADA} gsap
  npm audit signatures        # firmas y procedencia de los paquetes

Necesita Node 22 o superior, ffmpeg en el PATH (o la variable FFMPEG) y Chrome.
Solo son oficiales el paquete "hyperframes" y los "@hyperframes/*" (repo heygen-com/hyperframes).`);
  process.exit(2);
}

if (args[0] === 'preparar') {
  const destino = resolve(args[1] || '.');
  const gsap = join(dirname(dirname(dirname(bin))), 'gsap', 'dist', 'gsap.min.js');
  if (!existsSync(gsap)) { console.error('Falta gsap junto a hyperframes: npm install --save-dev --ignore-scripts gsap'); process.exit(2); }
  mkdirSync(join(destino, 'vendor'), { recursive: true });
  copyFileSync(gsap, join(destino, 'vendor', 'gsap.min.js'));
  console.log('gsap.min.js copiado a', join(destino, 'vendor'));
  process.exit(0);
}

const env = { ...process.env };
env.HYPERFRAMES_NO_TELEMETRY ??= '1';
env.DO_NOT_TRACK ??= '1';
env.HYPERFRAMES_SKIP_SKILLS ??= '1';
if (!env.HYPERFRAMES_BROWSER_PATH) {
  const candidatos = process.platform === 'win32'
    ? [env.PROGRAMFILES, env['PROGRAMFILES(X86)'], env.LOCALAPPDATA].filter(Boolean).map((b) => join(b, 'Google', 'Chrome', 'Application', 'chrome.exe'))
    : process.platform === 'darwin'
      ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
      : ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  const chrome = candidatos.find((c) => existsSync(c));
  if (chrome) env.HYPERFRAMES_BROWSER_PATH = chrome;
}
if (env.FFMPEG && existsSync(env.FFMPEG)) {
  const clave = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') || 'PATH';
  env[clave] = dirname(resolve(env.FFMPEG)) + delimiter + (env[clave] || '');
}

const r = spawnSync(process.execPath, [bin, ...args], { stdio: 'inherit', env });
process.exit(r.status ?? 1);
