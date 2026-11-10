#!/usr/bin/env node
// Genera todos los activos del ejemplo de punta a punta en pruebas/extremo-a-extremo/activos/ (no van al repo):
//   a) foto del reloj sobre fondo liso renderizada con three.js → recorte con alfa (alfa.mjs --modo croma --recortar)
//   b) frames del giro: copia de los de demos/reloj (ya renderizados; no se regeneran) + una foto de detalle (un frame)
//   c) mapa por niveles del entorno del taller en Sabadell: ortofoto PNOA por WMS (3 niveles) + niveles.json
// Uso (desde la raíz del repo; necesita red, Chrome, ffmpeg y `npm install` hecho en demos/reloj):
//   node pruebas/extremo-a-extremo/preparar.mjs [--solo producto,frames,mapa]
// ffmpeg y ffprobe: variables FFMPEG / FFPROBE o el PATH. Chrome: CHROME o rutas típicas.
// Coste: 0 $ (todo es render propio, activos CC-BY y ortofoto con licencia abierta).
import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
import { cpSync, createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '../..');
const activos = join(aqui, 'activos');
const FF = process.env.FFMPEG || 'ffmpeg';
const argv = process.argv.slice(2);
const solo = (argv[argv.indexOf('--solo') + 1] && argv.includes('--solo')) ? argv[argv.indexOf('--solo') + 1].split(',') : ['producto', 'frames', 'mapa'];
mkdirSync(activos, { recursive: true });
const kb = (f) => Math.round(statSync(f).size / 1024);
const ff = (args, etiqueta) => {
  const r = spawnSync(FF, ['-hide_banner', '-v', 'error', '-y', ...args], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg (${etiqueta}): ${r.stderr}`);
};

// ---------- a) producto: render sobre fondo liso + recorte con alfa ----------
async function producto() {
  // servidor estático mínimo y efímero sobre la raíz del repo (el render importa three de demos/reloj/node_modules)
  const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };
  const srv = createServer((req, res) => {
    const f = normalize(join(raiz, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
    if (!f.startsWith(raiz) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': tipos[extname(f)] || 'application/octet-stream' });
    createReadStream(f).pipe(res);
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  const puerto = srv.address().port;

  const pwRuta = join(raiz, 'demos/reloj/node_modules/playwright-core/index.mjs');
  if (!existsSync(pwRuta)) throw new Error('Falta playwright-core: cd demos/reloj && npm install');
  const pw = await import(pathToFileURL(pwRuta).href);
  const chrome = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean).find(existsSync);
  // WebGL sin GPU: swiftshader (en una máquina con GPU no hace falta, pero no estorba)
  const nav = await pw.chromium.launch({ executablePath: chrome, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await nav.newPage({ viewport: { width: 800, height: 800 } });
  page.on('pageerror', (e) => console.log('[error en el render]', e.message));
  await page.goto(`http://127.0.0.1:${puerto}/pruebas/extremo-a-extremo/render-producto.html?w=1600&h=1600&fondo=ff00ff`);
  await page.waitForFunction(() => window.listo === true, null, { timeout: 180000 });
  const url = await page.evaluate(() => window.foto());
  await nav.close(); srv.close();

  const dir = join(activos, 'producto');
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const fuente = join(dir, 'fondo-liso.png');
  writeFileSync(fuente, Buffer.from(url.split(',')[1], 'base64'));
  console.log(`producto: render 1600×1600 sobre magenta liso (${kb(fuente)} KB)`);

  // el recorte, exactamente como lo haría quien monta la web
  const alfa = join(raiz, 'plugins/the-new-era-websites/skills/capas-alfa/scripts/alfa.mjs');
  const r = spawnSync(process.execPath, [alfa, '--entrada', fuente, '--modo', 'croma', '--recortar', '--calidad', '84', '--salida', join(dir, 'alfa')], { encoding: 'utf8' });
  process.stdout.write(r.stdout); process.stderr.write(r.stderr);
  if (r.status !== 0) throw new Error('alfa.mjs falló');
  const info = JSON.parse(readFileSync(join(dir, 'alfa', 'alfa.json'), 'utf8'));
  console.log('producto: métricas de alfa.json', JSON.stringify({ color_clave: info.color_clave, caja: info.caja?.pct, recorte: info.recorte, pesos_kb: info.pesos_kb, metricas: info.metricas, avisos: info.avisos }));
  return info;
}

// ---------- b) frames del giro (copia) + foto de detalle (un frame recortado a la esfera) ----------
function frames() {
  const origen = join(raiz, 'demos/reloj/public/frames/reloj');
  if (!existsSync(join(origen, 'manifest.json'))) throw new Error('No están los frames de demos/reloj/public/frames/reloj');
  const dir = join(activos, 'frames');
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const man = JSON.parse(readFileSync(join(origen, 'manifest.json'), 'utf8'));
  let bytes = 0;
  for (const v of Object.keys(man.variantes)) {
    mkdirSync(join(dir, v));
    for (const f of readdirSync(join(origen, v)).filter((f) => f.endsWith('.webp'))) { cpSync(join(origen, v, f), join(dir, v, f)); if (v === 'escritorio') bytes += statSync(join(origen, v, f)).size; }
    cpSync(join(origen, man.variantes[v].poster), join(dir, man.variantes[v].poster));
  }
  // solo WebP (el AVIF no hace falta para el ejemplo): el manifest dice qué formatos hay
  man.formatos = ['webp'];
  delete man.videoScrub;
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(man, null, 2));
  console.log(`frames: ${man.frames} × 2 variantes copiadas (escritorio ${Math.round(bytes / 1024)} KB en WebP)`);

  // detalle: el frame de frente (60 de 120), recortado a la esfera; es una foto, el código solo la descubre
  const det = join(activos, 'detalle.webp');
  ff(['-i', join(origen, 'escritorio', '0060.webp'), '-vf', 'crop=860:860:530:115', '-c:v', 'libwebp', '-quality', '82', det], 'detalle');
  console.log(`detalle: frame 60 recortado a 860×860 (${kb(det)} KB)`);
}

// ---------- c) mapa por niveles: ortofoto PNOA por WMS (adaptado de pruebas/mapa-imagen/descargar-niveles.mjs) ----------
async function mapa() {
  const dir = join(activos, 'mapa');
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const R = 6378137;
  const merc = (lng, lat) => [R * (lng * Math.PI) / 180, R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))];
  // el taller es inventado, pero en un sitio plausible del centro de Sabadell
  const taller = { nombre: 'Taller Orbe', lng: 2.1076, lat: 41.5463 };
  const t = merc(taller.lng, taller.lat);
  // ciudad y barrio en 16:9; la calle, 4:5 (en móvil vertical la vista final es más alta que ancha)
  const niveles = [
    { id: 'ciudad', centro: t, ancho: 6000, px: [2400, 1350] },   // 2,5 m/px
    { id: 'barrio', centro: t, ancho: 1600, px: [2400, 1350] },   // 0,67 m/px
    { id: 'calle', centro: t, ancho: 360, px: [2048, 2560] },     // 0,18 m/px, 360×450 m
  ];
  const caja3857 = (n) => { const h = (n.ancho * n.px[1]) / n.px[0]; return [n.centro[0] - n.ancho / 2, n.centro[1] - h / 2, n.centro[0] + n.ancho / 2, n.centro[1] + h / 2]; };
  const [bx0, by0, bx1, by1] = caja3857(niveles[0]);
  const aNormal = ([x, y]) => ({ x: (x - bx0) / (bx1 - bx0), y: (by1 - y) / (by1 - by0) });
  const salida = { atribucion: 'PNOA cedido por © Instituto Geográfico Nacional (CC BY 4.0)', niveles: [], puntos: {} };
  for (const n of niveles) {
    const [x0, y0, x1, y1] = caja3857(n);
    const url = 'https://www.ign.es/wms-inspire/pnoa-ma?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OI.OrthoimageCoverage&STYLES=' +
      `&CRS=EPSG:3857&BBOX=${x0},${y0},${x1},${y1}&WIDTH=${n.px[0]}&HEIGHT=${n.px[1]}&FORMAT=image/jpeg`;
    const r = await fetch(url);
    if (!r.ok || !String(r.headers.get('content-type')).startsWith('image/')) throw new Error(`WMS ${n.id}: ${r.status} ${await r.text()}`);
    const f = join(dir, `${n.id}.webp`);
    const c = spawnSync(FF, ['-v', 'error', '-y', '-i', '-', '-c:v', 'libwebp', '-quality', '72', f], { input: Buffer.from(await r.arrayBuffer()), maxBuffer: 1 << 28 });
    if (c.status !== 0) throw new Error(String(c.stderr));
    const a = aNormal([x0, y1]), b = aNormal([x1, y0]);
    const nivel = { src: `${n.id}.webp`, kb: kb(f), mPorPx: +(n.ancho / n.px[0]).toFixed(3) };
    if (n !== niveles[0]) nivel.caja = { x: +a.x.toFixed(6), y: +a.y.toFixed(6), ancho: +(b.x - a.x).toFixed(6), alto: +(b.y - a.y).toFixed(6) };
    salida.niveles.push(nivel);
    console.log(`mapa ${n.id}: ${nivel.kb} KB, ${nivel.mPorPx} m/px`);
  }
  const q = aNormal(t);
  salida.puntos.taller = { nombre: taller.nombre, x: +q.x.toFixed(6), y: +q.y.toFixed(6) };
  writeFileSync(join(dir, 'niveles.json'), JSON.stringify(salida, null, 2));
}

if (solo.includes('producto')) await producto();
if (solo.includes('frames')) frames();
if (solo.includes('mapa')) await mapa();
console.log('Activos en ' + activos);
