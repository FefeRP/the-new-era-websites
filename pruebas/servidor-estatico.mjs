#!/usr/bin/env node
// Servidor estático mínimo para las pruebas (sin dependencias), con peticiones Range: sin ellas Chrome no deja mover
// currentTime en un <video> y el scrub de vídeo no funciona.
//   node pruebas/servidor-estatico.mjs [raíz=.] [puerto=5193]
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const raiz = resolve(process.argv[2] || '.');
const puerto = Number(process.argv[3] || 5193);
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2' };

createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = normalize(join(raiz, ruta));
  if (!f.startsWith(raiz)) { res.writeHead(403); return res.end(); }
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end('404'); }
  const tam = statSync(f).size;
  const cab = { 'Content-Type': tipos[extname(f).toLowerCase()] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
  const rango = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (rango) {
    const ini = rango[1] ? Number(rango[1]) : Math.max(0, tam - Number(rango[2]));
    const fin = rango[1] && rango[2] ? Math.min(Number(rango[2]), tam - 1) : tam - 1;
    if (ini >= tam) { res.writeHead(416, { 'Content-Range': `bytes */${tam}` }); return res.end(); }
    res.writeHead(206, { ...cab, 'Content-Range': `bytes ${ini}-${fin}/${tam}`, 'Content-Length': fin - ini + 1 });
    return createReadStream(f, { start: ini, end: fin }).pipe(res);
  }
  res.writeHead(200, { ...cab, 'Content-Length': tam });
  createReadStream(f).pipe(res);
}).listen(puerto, '127.0.0.1', () => console.log(`Sirviendo ${raiz} en http://127.0.0.1:${puerto}`));
