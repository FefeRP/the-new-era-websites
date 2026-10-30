#!/usr/bin/env node
// Baja los niveles de imagen de la prueba de mapa-imagen.js: ortofoto real del PNOA (IGN, CC BY 4.0) por WMS en Web
// Mercator, ya recortada a cada caja, y escribe niveles.json con las cajas y los puntos en coordenadas 0..1 de la base.
//   node descargar-niveles.mjs [carpeta=activos]       (necesita red y ffmpeg en FFMPEG o en el PATH)
// Es el mismo método que para una web real: elige los centros y tamaños, pide cada caja al WMS y convierte a WebP.
// Atribución obligatoria: "PNOA cedido por © Instituto Geográfico Nacional (CC BY 4.0)".
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FF = process.env.FFMPEG || 'ffmpeg';
const dir = resolve(process.argv[2] || 'activos');
rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });

const R = 6378137;
const merc = (lng, lat) => [R * (lng * Math.PI) / 180, R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))];
// dos sitios a 1,3 km: la zona A (destino) y la B (la cámara pasa de una a otra)
const puntos = {
  torre: { nombre: 'Torre Glòries', lng: 2.1896, lat: 41.40353 },
  templo: { nombre: 'Sagrada Família', lng: 2.17436, lat: 41.40363 },
};
const [ax, ay] = merc(puntos.torre.lng, puntos.torre.lat), [bx, by] = merc(puntos.templo.lng, puntos.templo.lat);
const medio = [(ax + bx) / 2, (ay + by) / 2];
// ciudad y barrio en 16:9; los niveles de calle, MÁS ALTOS QUE ANCHOS (4:5): en un móvil vertical la vista final es más
// alta que ancha y un nivel 16:9 no la cubre (arriba y abajo asomaría el nivel anterior ampliado y borroso)
const niveles = [
  { id: 'ciudad', centro: medio, ancho: 8000, px: [2400, 1350] },                // 3,3 m/px
  { id: 'barrio', centro: medio, ancho: 2800, px: [2400, 1350] },                // 1,2 m/px
  { id: 'calle-torre', centro: [ax, ay], ancho: 400, px: [2048, 2560], padre: 1 }, // 0,2 m/px, 400×500 m
  { id: 'calle-templo', centro: [bx, by], ancho: 400, px: [2048, 2560], padre: 1 },
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
  const jpg = Buffer.from(await r.arrayBuffer());
  const f = join(dir, `${n.id}.webp`);
  const c = spawnSync(FF, ['-v', 'error', '-y', '-i', '-', '-c:v', 'libwebp', '-quality', '80', f], { input: jpg, maxBuffer: 1 << 28 });
  if (c.status !== 0) throw new Error(String(c.stderr));
  const a = aNormal([x0, y1]), b = aNormal([x1, y0]);
  const nivel = { src: `${n.id}.webp`, kb: Math.round(statSync(f).size / 1024), mPorPx: +(n.ancho / n.px[0]).toFixed(3) };
  if (n !== niveles[0]) nivel.caja = { x: +a.x.toFixed(6), y: +a.y.toFixed(6), ancho: +(b.x - a.x).toFixed(6), alto: +(b.y - a.y).toFixed(6) };
  if (n.padre !== undefined) nivel.padre = n.padre;
  salida.niveles.push(nivel);
  console.log(`${n.id}: ${nivel.kb} KB, ${nivel.mPorPx} m/px`);
}
for (const [k, p] of Object.entries(puntos)) { const q = aNormal(merc(p.lng, p.lat)); salida.puntos[k] = { nombre: p.nombre, x: +q.x.toFixed(6), y: +q.y.toFixed(6) }; }
writeFileSync(join(dir, 'niveles.json'), JSON.stringify(salida, null, 2));
console.log('Niveles en ' + dir);
