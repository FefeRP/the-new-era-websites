#!/usr/bin/env node
// Mide en Chrome el scrub de las variantes que deja preparar.mjs: búsquedas en <video> por códec y GOP, y
// decodificación de frames sueltos, con la CPU normal y frenada ×4 (aproximación a un móvil de gama media).
// Uso, desde demos/reloj (playwright-core):
//   node ../../pruebas/montaje-web/medir.mjs ../../pruebas/montaje-web/salida/<clip> [--freno 1,4] [--solo regex]
// Escribe <salida>/medidas.json y una tabla. Sin GPU (servidor) todo se decodifica por software: las cifras sirven para
// comparar variantes entre sí, no como tiempos absolutos de un móvil real.
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const args = process.argv.slice(2);
const dir = resolve(args[0] || '');
if (!args[0] || !existsSync(join(dir, 'variantes.json'))) { console.error('Uso: node medir.mjs <carpeta con variantes.json> [--freno 1,4] [--solo regex]'); process.exit(1); }
const opt = (n, d) => { const i = args.indexOf(n); return i > 0 ? args[i + 1] : d; };
const frenos = opt('--freno', '1,4').split(',').map(Number);
const solo = opt('--solo', '');
const PUERTO = 5199;

const servidor = spawn('node', [join(RAIZ, 'pruebas', 'servidor-estatico.mjs'), RAIZ, String(PUERTO)], { stdio: 'ignore' });
await new Promise((ok) => setTimeout(ok, 800));
const todo = {};
try {
  const pw = await import(pathToFileURL(resolve('node_modules/playwright-core/index.mjs')).href);
  const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
  const nav = await pw.chromium.launch({ executablePath: chrome });
  for (const freno of frenos) {
    const pag = await nav.newPage();
    pag.on('console', (msg) => console.log(`[x${freno}] ${msg.text()}`));
    const cdp = await pag.context().newCDPSession(pag);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: freno });
    const base = '/' + relative(RAIZ, dir).replaceAll('\\', '/');
    await pag.goto(`http://127.0.0.1:${PUERTO}/pruebas/montaje-web/medir.html?base=${encodeURIComponent(base)}${solo ? '&solo=' + encodeURIComponent(solo) : ''}`);
    await pag.waitForFunction(() => document.title === 'listo', null, { timeout: 30 * 60 * 1000, polling: 1000 });
    todo['x' + freno] = await pag.evaluate(() => window.resultado);
    await pag.close();
  }
  await nav.close();
} finally { servidor.kill(); }
writeFileSync(join(dir, 'medidas.json'), JSON.stringify(todo, null, 2));
for (const [freno, filas] of Object.entries(todo)) {
  console.log(`\nCPU ${freno}   (ms: mediana / p95 / máx)`);
  console.log('variante'.padEnd(30), 'MB'.padStart(6), ' claves  azar              delante           atrás');
  for (const f of filas) {
    const n = `${f.disp}-${f.nombre}${f.tipo === 'frames' ? ' frames' : ''}`.padEnd(30);
    const mb = (f.bytes / 1e6).toFixed(2).padStart(6);
    if (f.error) { console.log(n, mb, ' ERROR', f.error); continue; }
    const m = f.medida, t = (e) => `${e.med}/${e.p95}/${e.max}`.padEnd(18);
    if (f.tipo === 'video') console.log(n, mb, ' ', String(f.claves).padEnd(6), t(m.azar), t(m.delante), t(m.atras), m.agotadas ? `${m.agotadas} sin fotograma` : '');
    else console.log(n, mb, ' ', `${f.frames}f`.padEnd(6), 'decodificar', t(m.decodificar), 'dibujar', t(m.dibujar), `${Math.round(m.bytesMedio / 1024)} KB/frame`);
  }
}
