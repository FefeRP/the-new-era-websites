#!/usr/bin/env node
// lote-imagenes.mjs: revisa y prepara lotes de imágenes generadas con IA para una web.
// Sin dependencias: Node + ffmpeg (lo busca en FFMPEG/FFPROBE, rutas típicas o el PATH).
//
// Órdenes:
//   hoja <carpeta|ficheros…> --salida hoja.png [--lado 256] [--columnas N] [--fondo cuadros|claro|oscuro|#rrggbb|todos]
//       Vista de conjunto del lote, todas las piezas al mismo tamaño. Con --fondo todos repite el lote sobre cuadros,
//       claro y oscuro (los halos y los restos de fondo solo se ven sobre el fondo contrario).
//   coherencia <carpeta|ficheros…> [--json]
//       Piezas con alfa (frutas, hielo, hojas, objetos): por pieza, de dónde le viene la luz, luminancia, saturación,
//       cuánto ocupa y si toca el borde. Señala las que no casan con el resto del lote.
//   iconos <lamina.png> --columnas 3 --filas 2 --salida <carpeta> [--lado 256] [--margen 0.1] [--color #111111] [--json]
//       Corta una lámina de iconos (trazo oscuro sobre blanco) en celdas, pasa el blanco a transparente, iguala el tamaño
//       visual, mide el grosor del trazo de cada uno y señala los que desentonan. Deja un PNG con alfa por icono.
//   mosaico <textura> [--arreglar salida.png] [--franja 0.18] [--igualar] [--json]
//       Mide si una textura casa al repetirse (la junta frente al interior) y si tiene zonas más claras u oscuras que
//       delatan el patrón. Con --arreglar la deja repetible (cruza los bordes) y, con --igualar, aplana la luz.
//
// Devuelve código 1 si la revisión encuentra algo que no casa (útil en un script de lote).

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- ffmpeg ----------
function buscar(nombre) {
  const env = process.env[nombre.toUpperCase()];
  const exe = process.platform === 'win32' ? `${nombre}.exe` : nombre;
  const cand = [env, `C:/ffmpeg/bin/${exe}`, `C:/Program Files/ffmpeg/bin/${exe}`, '/usr/bin/' + nombre, '/usr/local/bin/' + nombre, '/opt/homebrew/bin/' + nombre].filter(Boolean);
  return cand.find((c) => existsSync(c)) || nombre;
}
const FFMPEG = buscar('ffmpeg');
const FFPROBE = buscar('ffprobe');
const ES_IMAGEN = /\.(png|jpe?g|webp|avif|bmp)$/i;

const faltaFfmpeg = (r) => { if (r.error?.code === 'ENOENT') throw new Error('No se encuentra ffmpeg/ffprobe: instálalo o pon su ruta en las variables FFMPEG y FFPROBE'); };

export function medidas(fichero) {
  const r = spawnSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', fichero], { encoding: 'utf8' });
  faltaFfmpeg(r);
  if (r.status !== 0) throw new Error(`ffprobe no pudo leer ${fichero}: ${r.stderr}`);
  const [ancho, alto] = r.stdout.trim().split(/[,\r\n]+/).map(Number);
  return { ancho, alto };
}

// Lee una imagen como RGBA crudo. `tope` limita el lado mayor (para medir no hace falta más).
export function leer(fichero, { tope = 0, ancho = 0, alto = 0 } = {}) {
  const m = medidas(fichero);
  let w = ancho || m.ancho, h = alto || m.alto;
  if (tope && Math.max(w, h) > tope) { const k = tope / Math.max(w, h); w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k)); }
  const r = spawnSync(FFMPEG, ['-hide_banner', '-v', 'error', '-i', fichero, '-frames:v', '1', '-vf', `scale=${w}:${h}:flags=lanczos`,
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 1 << 30 });
  faltaFfmpeg(r);
  if (r.status !== 0 || r.stdout.length !== w * h * 4) throw new Error(`ffmpeg no pudo leer ${fichero}: ${String(r.stderr).slice(-400)}`);
  return { w, h, px: r.stdout, original: m };
}

export function escribir(px, w, h, salida) {
  mkdirSync(dirname(resolve(salida)), { recursive: true });
  const r = spawnSync(FFMPEG, ['-hide_banner', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${w}x${h}`, '-i', '-',
    '-frames:v', '1', ...(/\.webp$/i.test(salida) ? ['-c:v', 'libwebp', '-q:v', '88'] : []), salida], { input: px, maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`ffmpeg no pudo escribir ${salida}: ${String(r.stderr).slice(-400)}`);
}

function listar(rutas) {
  const lista = [];
  for (const r of rutas) {
    if (!existsSync(r)) throw new Error(`No existe ${r}`);
    if (statSync(r).isDirectory()) lista.push(...readdirSync(r).filter((f) => ES_IMAGEN.test(f) && !/^hoja[-_.]/i.test(f)).sort().map((f) => join(r, f)));
    else lista.push(r);
  }
  if (!lista.length) throw new Error('No hay imágenes que revisar');
  return lista;
}

const mediana = (v) => { const o = [...v].sort((a, b) => a - b); const m = o.length >> 1; return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2; };
const r2 = (x, d = 2) => Number(x.toFixed(d));
const hex = (s) => { const m = /^#?([0-9a-f]{6})$/i.exec(s || ''); if (!m) return null; const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; };

// ---------- hoja ----------
function fondoEn(tipo, x, y) {
  if (tipo === 'claro') return [244, 242, 238];
  if (tipo === 'oscuro') return [16, 17, 20];
  if (tipo === 'cuadros') return ((x >> 4) + (y >> 4)) % 2 ? [217, 217, 217] : [255, 255, 255];
  return hex(tipo) || [255, 255, 255];
}

export function hacerHoja(ficheros, salida, { lado = 256, columnas = 0, fondo = 'cuadros' } = {}) {
  const fondos = fondo === 'todos' ? ['cuadros', 'claro', 'oscuro'] : [fondo];
  const n = ficheros.length;
  const cols = columnas || Math.min(n, Math.ceil(Math.sqrt(n * 1.6)));
  const filas = Math.ceil(n / cols);
  const sep = Math.round(lado * 0.08);
  const W = cols * lado + (cols + 1) * sep, hBloque = filas * lado + (filas + 1) * sep, H = hBloque * fondos.length;
  const out = Buffer.alloc(W * H * 4);
  fondos.forEach((tipo, b) => {
    for (let y = 0; y < hBloque; y++) for (let x = 0; x < W; x++) {
      const [r, g, bl] = fondoEn(tipo, x, y); const i = ((b * hBloque + y) * W + x) * 4;
      out[i] = r; out[i + 1] = g; out[i + 2] = bl; out[i + 3] = 255;
    }
  });
  ficheros.forEach((f, k) => {
    const m = medidas(f); const esc = Math.min(lado / m.ancho, lado / m.alto);
    const w = Math.max(1, Math.round(m.ancho * esc)), h = Math.max(1, Math.round(m.alto * esc));
    const { px } = leer(f, { ancho: w, alto: h });
    const cx = sep + (k % cols) * (lado + sep) + ((lado - w) >> 1), cy = sep + Math.floor(k / cols) * (lado + sep) + ((lado - h) >> 1);
    fondos.forEach((_, b) => {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const s = (y * w + x) * 4, d = ((b * hBloque + cy + y) * W + cx + x) * 4, a = px[s + 3] / 255;
        out[d] = Math.round(px[s] * a + out[d] * (1 - a)); out[d + 1] = Math.round(px[s + 1] * a + out[d + 1] * (1 - a));
        out[d + 2] = Math.round(px[s + 2] * a + out[d + 2] * (1 - a));
      }
    });
  });
  escribir(out, W, H, salida);
  return { salida, ancho: W, alto: H, piezas: n, columnas: cols, fondos };
}

// ---------- coherencia de piezas con alfa ----------
export function medirPieza(fichero) {
  const { w, h, px } = leer(fichero, { tope: 384 });
  let n = 0, sx = 0, sy = 0, sl = 0, ss = 0, sv = 0, x0 = w, y0 = h, x1 = -1, y1 = -1, borde = 0, semi = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, a = px[i + 3];
    if (a > 8 && a < 247) semi++;
    if (a < 128) continue;
    n++; sx += x; sy += y;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) borde++;
    const r = px[i], g = px[i + 1], b = px[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    sl += 0.2126 * r + 0.7152 * g + 0.0722 * b; ss += mx ? (mx - mn) / mx : 0; sv += mx;
  }
  if (!n) return { fichero, vacia: true };
  const cx = sx / n, cy = sy / n, lum = sl / n;
  // dirección de la luz: centro de masas de la luminancia respecto al centro de la figura, normalizado por su tamaño
  let lx = 0, ly = 0, lt = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = (y * w + x) * 4; if (px[i + 3] < 128) continue;
    const l = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
    lx += (x - cx) * l; ly += (y - cy) * l; lt += l;
  }
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  return {
    fichero, ancho: w, alto: h,
    luzX: lt ? r2((lx / lt) / (bw / 2), 3) : 0,            // >0: más luz a la derecha; <0: a la izquierda
    luzY: lt ? r2((ly / lt) / (bh / 2), 3) : 0,            // >0: más luz abajo; <0: arriba
    luminancia: r2(lum / 255, 3), saturacion: r2(ss / n, 3),
    valor: r2(sv / n / 255, 3),                   // claridad sin depender del tono (media del canal más alto)
    ocupa: r2(Math.max(bw / w, bh / h), 3),       // fracción del lado que ocupa la figura
    tocaBorde: borde > 0,
    sinAlfa: n === w * h,                         // todo opaco: no está recortada
    semitransparente: r2(semi / n, 3),
  };
}

export function coherencia(ficheros) {
  const piezas = ficheros.map(medirPieza);
  const validas = piezas.filter((p) => !p.vacia && !p.sinAlfa);
  const avisos = [];
  for (const p of piezas) {
    const nombre = basename(p.fichero);
    if (p.vacia) { avisos.push(`${nombre}: no tiene nada opaco`); continue; }
    if (p.sinAlfa) { avisos.push(`${nombre}: no tiene alfa (sin recortar)`); continue; }
    if (p.tocaBorde) avisos.push(`${nombre}: la figura toca el borde (se cortará al moverla o girarla)`);
  }
  if (validas.length >= 3) {
    const mVal = mediana(validas.map((p) => p.valor)), mSat = mediana(validas.map((p) => p.saturacion));
    const mLx = mediana(validas.map((p) => p.luzX)), mLy = mediana(validas.map((p) => p.luzY));
    for (const p of validas) {
      const nombre = basename(p.fichero);
      // la luz viene del otro lado: signo contrario al del lote y con diferencia clara
      if (Math.abs(mLx) > 0.02 && Math.sign(p.luzX) !== Math.sign(mLx) && Math.abs(p.luzX - mLx) > 0.06) {
        avisos.push(`${nombre}: la luz le viene de ${p.luzX > 0 ? 'la derecha' : 'la izquierda'} y al resto de ${mLx > 0 ? 'la derecha' : 'la izquierda'}`);
      }
      if (Math.abs(mLy) > 0.02 && Math.sign(p.luzY) !== Math.sign(mLy) && Math.abs(p.luzY - mLy) > 0.06) {
        avisos.push(`${nombre}: la luz le viene de ${p.luzY > 0 ? 'abajo' : 'arriba'} y al resto de ${mLy > 0 ? 'abajo' : 'arriba'}`);
      }
      if (p.valor < mVal * 0.55 || p.valor > mVal * 1.8) avisos.push(`${nombre}: mucho más ${p.valor > mVal ? 'clara' : 'oscura'} que el lote (claridad ${p.valor} frente a ${r2(mVal)})`);
      if (Math.abs(p.saturacion - mSat) > 0.35) avisos.push(`${nombre}: saturación fuera del lote (${p.saturacion} frente a ${r2(mSat)})`);
    }
  }
  return { piezas, avisos, bien: avisos.length === 0 };
}

// ---------- iconos de una lámina ----------
export function cortarIconos(lamina, { columnas, filas, salida, lado = 256, margen = 0.1, color = '#111111', umbral = 0.35 } = {}) {
  const { w, h, px } = leer(lamina);
  const tinta = new Float32Array(w * h); // 0 papel, 1 trazo
  for (let i = 0, p = 0; p < w * h; i += 4, p++) tinta[p] = (1 - Math.min(px[i], px[i + 1], px[i + 2]) / 255) * (px[i + 3] / 255);
  const [cr, cg, cb] = hex(color) || [17, 17, 17];
  const cw = w / columnas, ch = h / filas, iconos = [];
  if (salida) mkdirSync(salida, { recursive: true });
  for (let f = 0; f < filas; f++) for (let c = 0; c < columnas; c++) {
    const ax = Math.round(c * cw), ay = Math.round(f * ch), bx = Math.round((c + 1) * cw), by = Math.round((f + 1) * ch);
    let x0 = bx, y0 = by, x1 = -1, y1 = -1, area = 0, perimetro = 0, tocaCelda = false;
    const dura = (x, y) => x >= ax && x < bx && y >= ay && y < by && tinta[y * w + x] > umbral;
    for (let y = ay; y < by; y++) for (let x = ax; x < bx; x++) {
      if (!dura(x, y)) continue;
      area++;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (!dura(x - 1, y) || !dura(x + 1, y) || !dura(x, y - 1) || !dura(x, y + 1)) perimetro++;
      if (x === ax || y === ay || x === bx - 1 || y === by - 1) tocaCelda = true;
    }
    const k = f * columnas + c + 1, nombre = `icono-${String(k).padStart(2, '0')}`;
    if (!area) { iconos.push({ nombre, vacio: true }); continue; }
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1, mayor = Math.max(bw, bh);
    const grosorPx = (2 * area) / Math.max(1, perimetro);          // trazo medio ≈ 2·área / contorno
    const info = { nombre, celda: [c + 1, f + 1], tamano: r2(mayor / Math.min(cw, ch), 3), grosor: r2(grosorPx / mayor, 4),
      relleno: r2(area / (bw * bh), 3), tocaCelda };
    if (salida) {
      // se reescala la caja del icono para que el lado mayor ocupe (1 - 2·margen) del lienzo: mismo tamaño visual en todos
      const util = Math.round(lado * (1 - 2 * margen)), esc = util / mayor;
      const dw = Math.max(1, Math.round(bw * esc)), dh = Math.max(1, Math.round(bh * esc));
      const ox = (lado - dw) >> 1, oy = (lado - dh) >> 1, out = Buffer.alloc(lado * lado * 4);
      for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
        // muestreo por área (promedio de los píxeles de origen que caen en el de destino)
        const sx0 = x0 + x / esc, sx1 = x0 + (x + 1) / esc, sy0 = y0 + y / esc, sy1 = y0 + (y + 1) / esc;
        let s = 0, nn = 0;
        for (let yy = Math.floor(sy0); yy < Math.max(Math.floor(sy0) + 1, Math.ceil(sy1)); yy++) {
          for (let xx = Math.floor(sx0); xx < Math.max(Math.floor(sx0) + 1, Math.ceil(sx1)); xx++) {
            if (xx >= ax && xx < bx && yy >= ay && yy < by) s += tinta[yy * w + xx];
            nn++;
          }
        }
        const d = ((oy + y) * lado + ox + x) * 4;
        out[d] = cr; out[d + 1] = cg; out[d + 2] = cb; out[d + 3] = Math.round(255 * Math.min(1, s / nn));
      }
      info.fichero = join(salida, nombre + '.png');
      escribir(out, lado, lado, info.fichero);
    }
    iconos.push(info);
  }
  const buenos = iconos.filter((i) => !i.vacio), avisos = [];
  for (const i of iconos) if (i.vacio) avisos.push(`${i.nombre}: la celda está vacía (¿columnas y filas correctas?)`);
  for (const i of buenos) if (i.tocaCelda) avisos.push(`${i.nombre}: se sale de su celda (pegado al vecino o lámina mal repartida)`);
  if (buenos.length >= 3) {
    const mG = mediana(buenos.map((i) => i.grosor)), mT = mediana(buenos.map((i) => i.tamano));
    for (const i of buenos) {
      if (Math.abs(i.grosor / mG - 1) > 0.3) avisos.push(`${i.nombre}: trazo ${i.grosor > mG ? 'más grueso' : 'más fino'} que el juego (${r2((i.grosor / mG) * 100, 0)} % de la mediana tras igualar el tamaño)`);
      if (Math.abs(i.tamano / mT - 1) > 0.3) avisos.push(`${i.nombre}: dibujado a otro tamaño en la lámina (${r2((i.tamano / mT) * 100, 0)} % de la mediana): al igualarlo cambia su trazo`);
    }
  }
  return { iconos, avisos, bien: avisos.length === 0 };
}

// ---------- texturas en mosaico ----------
function medirJuntas(px, w, h) {
  const dif = (ia, ib) => Math.abs(px[ia] - px[ib]) + Math.abs(px[ia + 1] - px[ib + 1]) + Math.abs(px[ia + 2] - px[ib + 2]);
  let jv = 0, jh = 0, iv = 0, ih = 0, nv = 0, nh = 0;
  for (let y = 0; y < h; y++) {
    jv += dif((y * w) * 4, (y * w + w - 1) * 4);                            // junta vertical: columna 0 contra la última
    for (let x = 1; x < w; x += 7) { iv += dif((y * w + x) * 4, (y * w + x - 1) * 4); nv++; }
  }
  for (let x = 0; x < w; x++) {
    jh += dif(x * 4, ((h - 1) * w + x) * 4);                                // junta horizontal: fila 0 contra la última
    for (let y = 1; y < h; y += 7) { ih += dif((y * w + x) * 4, ((y - 1) * w + x) * 4); nh++; }
  }
  const interiorV = iv / nv, interiorH = ih / nh;
  // desigualdad: cuánto se aparta la luminancia media de cada bloque (rejilla 4×4) de la media global
  let total = 0; const bloques = new Float64Array(16), cuenta = new Float64Array(16);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, l = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
    const b = Math.min(3, Math.floor((y * 4) / h)) * 4 + Math.min(3, Math.floor((x * 4) / w));
    bloques[b] += l; cuenta[b]++; total += l;
  }
  const media = total / (w * h); let peor = 0;
  for (let b = 0; b < 16; b++) peor = Math.max(peor, Math.abs(bloques[b] / cuenta[b] - media));
  return { juntaVertical: r2((jv / h) / Math.max(0.5, interiorV)), juntaHorizontal: r2((jh / w) / Math.max(0.5, interiorH)),
    desigualdad: r2((peor / Math.max(1, media)) * 100, 1) };
}

export function revisarMosaico(fichero, { arreglar = null, franja = 0.18, igualar = false } = {}) {
  const img = leer(fichero, arreglar ? {} : { tope: 1024 });
  const { w, h } = img; let px = img.px;
  const juzgar = (m) => {
    const avisos = [];
    if (m.juntaVertical > 1.6) avisos.push(`se ve la raya vertical al repetir (la junta cambia ${m.juntaVertical}× lo que el interior)`);
    if (m.juntaHorizontal > 1.6) avisos.push(`se ve la raya horizontal al repetir (la junta cambia ${m.juntaHorizontal}× lo que el interior)`);
    if (m.desigualdad > 6) avisos.push(`luz desigual (${m.desigualdad} % entre zonas): de lejos se verá el patrón repetido`);
    return avisos;
  };
  const antes = medirJuntas(px, w, h);
  const res = { fichero, ancho: w, alto: h, antes, avisos: juzgar(antes) };
  if (arreglar) {
    if (igualar) {
      // aplana la luz: ganancia por bloque (rejilla 8×8, interpolada) para llevar cada zona a la media global
      const G = 8, suma = new Float64Array(G * G * 3), cuenta = new Float64Array(G * G), global = [0, 0, 0];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4, b = Math.min(G - 1, Math.floor((y * G) / h)) * G + Math.min(G - 1, Math.floor((x * G) / w));
        for (let c = 0; c < 3; c++) { suma[b * 3 + c] += px[i + c]; global[c] += px[i + c]; }
        cuenta[b]++;
      }
      for (let c = 0; c < 3; c++) global[c] /= w * h;
      const out = Buffer.from(px);
      const local = (gx, gy, c) => { const X = ((gx % G) + G) % G, Y = ((gy % G) + G) % G; return suma[(Y * G + X) * 3 + c] / cuenta[Y * G + X]; };
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const fx = (x / w) * G - 0.5, fy = (y / h) * G - 0.5, gx = Math.floor(fx), gy = Math.floor(fy), tx = fx - gx, ty = fy - gy, i = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          const m = local(gx, gy, c) * (1 - tx) * (1 - ty) + local(gx + 1, gy, c) * tx * (1 - ty) + local(gx, gy + 1, c) * (1 - tx) * ty + local(gx + 1, gy + 1, c) * tx * ty;
          out[i + c] = Math.max(0, Math.min(255, Math.round(px[i + c] * (global[c] / Math.max(1, m)))));
        }
      }
      px = out;
    }
    // repetible: en una franja junto a cada borde se funde con la misma imagen desplazada media anchura y media altura.
    // La desplazada es continua justo donde la original tiene la junta, y su propia junta cae en el centro, donde no se usa.
    // Se hace por ejes separados (primero en horizontal, luego en vertical sobre el resultado): desplazando en los dos
    // ejes a la vez, la junta de la desplazada cruzaría las franjas y dejaría una costura corta en el centro de cada lado.
    const fw = Math.max(2, Math.round(w * franja)), fh = Math.max(2, Math.round(h * franja));
    const suave = (t) => t * t * (3 - 2 * t);
    const horizontal = Buffer.from(px);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = Math.min(x, w - 1 - x);
      if (dx >= fw) continue;
      const m = suave(dx / fw), i = (y * w + x) * 4, j = (y * w + ((x + (w >> 1)) % w)) * 4; // 1 = original, 0 = desplazada
      for (let c = 0; c < 3; c++) horizontal[i + c] = Math.round(px[i + c] * m + px[j + c] * (1 - m));
    }
    const out = Buffer.from(horizontal);
    for (let y = 0; y < h; y++) {
      const dy = Math.min(y, h - 1 - y);
      if (dy >= fh) continue;
      const m = suave(dy / fh), yy = (y + (h >> 1)) % h;
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4, j = (yy * w + x) * 4;
        for (let c = 0; c < 3; c++) out[i + c] = Math.round(horizontal[i + c] * m + horizontal[j + c] * (1 - m));
      }
    }
    escribir(out, w, h, arreglar);
    res.arreglada = arreglar; res.despues = medirJuntas(out, w, h); res.avisos = juzgar(res.despues);
  }
  res.bien = res.avisos.length === 0;
  return res;
}

// ---------- CLI ----------
function argumentos(argv) {
  const pos = [], op = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); const v = argv[i + 1]; if (v === undefined || v.startsWith('--')) op[k] = true; else { op[k] = v; i++; } }
    else pos.push(a);
  }
  return { pos, op };
}

function principal() {
  const [orden, ...resto] = process.argv.slice(2);
  const { pos, op } = argumentos(resto);
  const num = (k, d) => (op[k] === undefined ? d : Number(op[k]));
  if (orden === 'hoja') {
    if (!op.salida) throw new Error('Falta --salida hoja.png');
    const r = hacerHoja(listar(pos), op.salida, { lado: num('lado', 256), columnas: num('columnas', 0), fondo: op.fondo || 'cuadros' });
    console.log(`Hoja de ${r.piezas} piezas (${r.ancho}×${r.alto}, fondos: ${r.fondos.join(', ')}): ${r.salida}`);
    return 0;
  }
  if (orden === 'coherencia') {
    const r = coherencia(listar(pos));
    if (op.json) console.log(JSON.stringify(r, null, 2));
    else {
      for (const p of r.piezas) console.log(p.vacia ? `${basename(p.fichero)}: vacía` : `${basename(p.fichero).padEnd(28)} luz x ${String(p.luzX).padStart(7)} y ${String(p.luzY).padStart(7)} · claridad ${p.valor} · sat ${p.saturacion} · ocupa ${p.ocupa}${p.tocaBorde ? ' · TOCA EL BORDE' : ''}`);
      console.log(r.bien ? 'El lote casa.' : 'No casa:\n- ' + r.avisos.join('\n- '));
    }
    return r.bien ? 0 : 1;
  }
  if (orden === 'iconos') {
    if (!pos[0] || !(num('columnas') >= 1) || !(num('filas') >= 1)) throw new Error('Uso: iconos <lamina> --columnas N --filas M [--salida carpeta] (N y M, enteros de 1 en adelante)');
    const r = cortarIconos(pos[0], { columnas: num('columnas'), filas: num('filas'), salida: op.salida || null, lado: num('lado', 256),
      margen: num('margen', 0.1), color: op.color || '#111111' });
    if (op.salida) writeFileSync(join(op.salida, 'iconos.json'), JSON.stringify(r, null, 2));
    if (op.json) console.log(JSON.stringify(r, null, 2));
    else {
      for (const i of r.iconos) console.log(i.vacio ? `${i.nombre}: vacío` : `${i.nombre} · tamaño en la lámina ${i.tamano} · grosor ${i.grosor} · relleno ${i.relleno}`);
      console.log(r.bien ? 'El juego es coherente.' : 'Revisar:\n- ' + r.avisos.join('\n- '));
    }
    return r.bien ? 0 : 1;
  }
  if (orden === 'mosaico') {
    if (!pos[0]) throw new Error('Uso: mosaico <textura> [--arreglar salida.png] [--igualar]');
    if (op.arreglar === true) throw new Error('--arreglar necesita el fichero de salida: --arreglar textura-mosaico.png');
    if (op.igualar && !op.arreglar) throw new Error('--igualar solo actúa junto a --arreglar salida.png');
    const r = revisarMosaico(pos[0], { arreglar: typeof op.arreglar === 'string' ? op.arreglar : null, franja: num('franja', 0.18), igualar: !!op.igualar });
    if (op.json) console.log(JSON.stringify(r, null, 2));
    else {
      console.log(`${basename(r.fichero)} (${r.ancho}×${r.alto}) · junta vertical ${r.antes.juntaVertical}× · horizontal ${r.antes.juntaHorizontal}× · desigualdad ${r.antes.desigualdad} %`);
      if (r.despues) console.log(`Arreglada en ${r.arreglada} · junta vertical ${r.despues.juntaVertical}× · horizontal ${r.despues.juntaHorizontal}× · desigualdad ${r.despues.desigualdad} %`);
      console.log(r.bien ? 'Casa al repetirse.' : 'No casa:\n- ' + r.avisos.join('\n- '));
    }
    return r.bien ? 0 : 1;
  }
  console.log('Uso: node lote-imagenes.mjs hoja|coherencia|iconos|mosaico … (ver la cabecera del fichero)');
  return orden ? 2 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  try { process.exitCode = principal(); } catch (e) { console.error(String(e.message || e)); process.exitCode = 2; }
}
