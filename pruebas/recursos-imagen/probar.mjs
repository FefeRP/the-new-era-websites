// Prueba de lote-imagenes.mjs con entradas sintéticas de verdad conocida (se generan aquí, sin IA ni ficheros externos).
// Uso (desde la raíz del repo):  node pruebas/recursos-imagen/probar.mjs [carpeta-de-capturas]
// Deja las entradas en pruebas/recursos-imagen/entrada/ y las salidas en pruebas/recursos-imagen/salida/ (no van al repo).
import { mkdirSync, rmSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { escribir, hacerHoja, coherencia, cortarIconos, revisarMosaico, leer } from '../../plugins/the-new-era-websites/skills/recursos-imagen-ia/scripts/lote-imagenes.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const entrada = join(aqui, 'entrada'), salida = join(aqui, 'salida');
for (const d of [entrada, salida]) { rmSync(d, { recursive: true, force: true }); mkdirSync(d, { recursive: true }); }
const capturas = process.argv[2] ? resolve(process.argv[2]) : null;
const fallos = [];
const ok = (c, m) => { console.log(`${c ? 'OK ' : 'MAL'} ${m}`); if (!c) fallos.push(m); };

// generador pseudoaleatorio con semilla (la prueba da siempre lo mismo)
let semilla = 12345;
const azar = () => { semilla = (semilla * 1664525 + 1013904223) >>> 0; return semilla / 4294967296; };

// ---------- 1. piezas con alfa ----------
// Esfera de color iluminada desde (lx, ly). cx, cy y radio en fracción del lienzo.
function esfera(nombre, { color, lx = -0.6, ly = -0.6, cx = 0.5, cy = 0.5, radio = 0.32, brillo = 1, lado = 320 }) {
  const px = Buffer.alloc(lado * lado * 4);
  const ln = Math.hypot(lx, ly, 0.6), L = [lx / ln, ly / ln, 0.6 / ln];
  for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) {
    const nx = (x / lado - cx) / radio, ny = (y / lado - cy) / radio, d2 = nx * nx + ny * ny, i = (y * lado + x) * 4;
    if (d2 > 1) continue;
    const nz = Math.sqrt(1 - d2), luz = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]) * 0.85 + 0.15;
    const borde = Math.min(1, (1 - Math.sqrt(d2)) * radio * lado); // antialias de 1 px
    for (let c = 0; c < 3; c++) px[i + c] = Math.min(255, Math.round(color[c] * luz * brillo));
    px[i + 3] = Math.round(255 * borde);
  }
  const f = join(entrada, 'piezas', nombre + '.png');
  escribir(px, lado, lado, f);
  return f;
}
mkdirSync(join(entrada, 'piezas'), { recursive: true });
const buenas = [
  esfera('01-naranja', { color: [240, 140, 30] }), esfera('02-frambuesa', { color: [200, 40, 80] }),
  esfera('03-lima', { color: [150, 200, 60] }), esfera('04-ciruela', { color: [120, 60, 150], radio: 0.26 }),
];
{
  const r = coherencia(buenas);
  ok(r.bien, `piezas con la misma luz: el lote casa (${r.avisos.length} avisos)`);
  ok(r.piezas.every((p) => p.luzX < -0.03 && p.luzY < -0.03), `la luz se detecta arriba a la izquierda en las cuatro (x ${r.piezas.map((p) => p.luzX).join(', ')})`);
}
const luzContraria = esfera('05-luz-derecha', { color: [230, 180, 40], lx: 0.7, ly: -0.6 });
const cortada = esfera('06-cortada', { color: [220, 90, 40], cx: 0.82 });
const oscura = esfera('07-oscura', { color: [200, 120, 40], brillo: 0.22 });
{
  const r = coherencia([...buenas, luzContraria, cortada, oscura]);
  ok(r.avisos.some((a) => a.startsWith('05-luz-derecha') && a.includes('derecha')), 'detecta la pieza con la luz del otro lado');
  ok(r.avisos.some((a) => a.startsWith('06-cortada') && a.includes('borde')), 'detecta la pieza que toca el borde');
  ok(r.avisos.some((a) => a.startsWith('07-oscura') && a.includes('oscura')), 'detecta la pieza mucho más oscura');
  ok(!r.avisos.some((a) => /^0[1-4]-/.test(a)), 'no señala ninguna de las cuatro buenas');
}
{
  // una foto sin recortar (todo opaco)
  const lado = 64, px = Buffer.alloc(lado * lado * 4, 200); for (let i = 3; i < px.length; i += 4) px[i] = 255;
  const f = join(entrada, 'sin-alfa.png'); escribir(px, lado, lado, f);
  ok(coherencia([f]).avisos.some((a) => a.includes('no tiene alfa')), 'detecta una imagen sin recortar');
}
const hoja = hacerHoja([...buenas, luzContraria, cortada, oscura], join(salida, 'hoja-piezas.png'), { lado: 160, fondo: 'todos' });
{
  const h = leer(hoja.salida);
  ok(h.w === hoja.ancho && h.h === hoja.alto && hoja.fondos.length === 3, `hoja de conjunto sobre tres fondos (${hoja.ancho}×${hoja.alto})`);
  // centro de la primera pieza: naranja sobre cualquier fondo
  const sep = Math.round(160 * 0.08), i = ((sep + 80) * h.w + sep + 80) * 4;
  ok(h.px[i] > 150 && h.px[i + 2] < 90, 'la primera pieza está en su sitio en la hoja');
}

// ---------- 2. lámina de iconos ----------
// 3 × 2 iconos de línea: aros, cuadrados y cruces con el mismo trazo; uno con trazo doble y otro dibujado a mitad de tamaño.
function lamina(nombre, trazos, tamanos) {
  const cw = 300, ch = 300, W = cw * 3, H = ch * 2, px = Buffer.alloc(W * H * 4, 255);
  const pinta = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4; px[i] = px[i + 1] = px[i + 2] = 20; };
  for (let k = 0; k < 6; k++) {
    const ox = (k % 3) * cw + cw / 2, oy = Math.floor(k / 3) * ch + ch / 2, t = trazos[k], r = tamanos[k];
    for (let y = -r - t; y <= r + t; y++) for (let x = -r - t; x <= r + t; x++) {
      const d = Math.hypot(x, y);
      const aro = Math.abs(d - r) <= t / 2;
      const cuadrado = Math.max(Math.abs(x), Math.abs(y)) <= r + t / 2 && Math.max(Math.abs(x), Math.abs(y)) >= r - t / 2;
      const cruz = (Math.abs(x) <= t / 2 && Math.abs(y) <= r) || (Math.abs(y) <= t / 2 && Math.abs(x) <= r);
      if ([aro, cuadrado, cruz][k % 3]) pinta(Math.round(ox + x), Math.round(oy + y));
    }
  }
  const f = join(entrada, nombre + '.png'); escribir(px, W, H, f); return f;
}
{
  const buena = lamina('iconos-coherentes', [8, 8, 8, 8, 8, 8], [90, 90, 90, 90, 90, 90]);
  const r = cortarIconos(buena, { columnas: 3, filas: 2, salida: join(salida, 'iconos'), lado: 128 });
  ok(r.iconos.length === 6 && r.iconos.every((i) => !i.vacio && existsSync(i.fichero)), 'corta la lámina en 6 iconos con su PNG');
  ok(r.bien, `juego coherente: sin avisos (${r.avisos.join(' | ') || 'ninguno'})`);
  const uno = leer(r.iconos[0].fichero);
  ok(uno.px[3] === 0, 'el blanco de la lámina pasa a transparente');
  let x0 = 128, x1 = -1; for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) if (uno.px[(y * 128 + x) * 4 + 3] > 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
  ok(Math.abs((x1 - x0 + 1) - 128 * 0.8) <= 3, `el icono ocupa el 80 % del lienzo (${x1 - x0 + 1} de 128 px)`);

  const mala = lamina('iconos-desiguales', [8, 8, 8, 8, 20, 8], [90, 90, 40, 90, 90, 90]);
  const m = cortarIconos(mala, { columnas: 3, filas: 2, salida: join(salida, 'iconos-desiguales'), lado: 128 });
  ok(m.avisos.some((a) => a.startsWith('icono-05') && a.includes('grueso')), 'detecta el icono con el trazo más grueso');
  ok(m.avisos.some((a) => a.startsWith('icono-03') && a.includes('otro tamaño')), 'detecta el icono dibujado a otro tamaño');
  ok(!m.avisos.some((a) => /^icono-0[1246]/.test(a)), 'no señala los cuatro iconos buenos');
  hacerHoja(m.iconos.map((i) => i.fichero), join(salida, 'hoja-iconos.png'), { lado: 128, columnas: 6, fondo: 'claro' });
  const vacia = cortarIconos(buena, { columnas: 4, filas: 4 });
  ok(vacia.avisos.some((a) => a.includes('se sale de su celda') || a.includes('vacía')), 'avisa si las columnas y filas no corresponden a la lámina');
}

// ---------- 3. texturas ----------
function textura(nombre, { periodica, degradado = 0, lado = 256 }) {
  const px = Buffer.alloc(lado * lado * 4);
  // ruido de valor en una rejilla de 16 px; si es periódica, la rejilla se cierra sobre sí misma
  const G = lado / 16, rej = Array.from({ length: (G + 1) * (G + 1) }, () => azar());
  const v = (gx, gy) => (periodica ? rej[(gy % G) * (G + 1) + (gx % G)] : rej[gy * (G + 1) + gx]);
  for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) {
    const fx = x / 16, fy = y / 16, gx = Math.floor(fx), gy = Math.floor(fy), tx = fx - gx, ty = fy - gy;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const n = v(gx, gy) * (1 - sx) * (1 - sy) + v(gx + 1, gy) * sx * (1 - sy) + v(gx, gy + 1) * (1 - sx) * sy + v(gx + 1, gy + 1) * sx * sy;
    const base = 150 + (n - 0.5) * 60 + (x / lado - 0.5) * degradado + (azar() - 0.5) * 6, i = (y * lado + x) * 4;
    px[i] = Math.max(0, Math.min(255, base + 8)); px[i + 1] = Math.max(0, Math.min(255, base)); px[i + 2] = Math.max(0, Math.min(255, base - 10)); px[i + 3] = 255;
  }
  const f = join(entrada, nombre + '.png'); escribir(px, lado, lado, f); return f;
}
{
  const buena = revisarMosaico(textura('textura-repetible', { periodica: true }));
  ok(buena.bien, `textura periódica: casa (juntas ${buena.antes.juntaVertical}× y ${buena.antes.juntaHorizontal}×, desigualdad ${buena.antes.desigualdad} %)`);
  const mala = textura('textura-con-raya', { periodica: false, degradado: 90 });
  const m = revisarMosaico(mala);
  ok(m.avisos.some((a) => a.includes('raya vertical')), `textura con degradado: detecta la raya (junta ${m.antes.juntaVertical}×)`);
  ok(m.avisos.some((a) => a.includes('luz desigual')), `y la luz desigual (${m.antes.desigualdad} %)`);
  const a = revisarMosaico(mala, { arreglar: join(salida, 'textura-arreglada.png'), igualar: true });
  ok(a.bien, `arreglada con --igualar: casa (juntas ${a.despues.juntaVertical}× y ${a.despues.juntaHorizontal}×, desigualdad ${a.despues.desigualdad} %)`);
  const soloCruce = revisarMosaico(textura('textura-sin-cerrar', { periodica: false }), { arreglar: join(salida, 'textura-cruzada.png') });
  ok(soloCruce.despues.juntaVertical <= 1.6 && soloCruce.despues.juntaHorizontal <= 1.6, `cruce de bordes sin igualar: las juntas desaparecen (${soloCruce.antes.juntaVertical}× → ${soloCruce.despues.juntaVertical}×)`);
  {
    // el arreglo no debe dejar una costura nueva en el centro de cada lado (pasaba al desplazar en los dos ejes a la vez)
    const { w, h, px } = leer(join(salida, 'textura-cruzada.png'));
    const salto = (y) => { let s = 0; const n = Math.round(w * 0.1); for (let x = 0; x < n; x++) for (let c = 0; c < 3; c++) s += Math.abs(px[(y * w + x) * 4 + c] - px[((y - 1) * w + x) * 4 + c]); return s / n; };
    const centro = salto(h >> 1), interior = (salto(h >> 2) + salto((h * 3) >> 2)) / 2;
    ok(centro <= Math.max(1, interior) * 1.6, `el arreglo no deja costura en el centro de los lados (${centro.toFixed(1)} frente a ${interior.toFixed(1)} del interior)`);
  }
  // mosaico 3×3 de antes y después, para verlo
  const tres = (f, destino) => { const t = leer(f), W = t.w * 3, out = Buffer.alloc(W * W * 4);
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) t.px.copy(out, (y * W + x) * 4, ((y % t.h) * t.w + (x % t.w)) * 4, ((y % t.h) * t.w + (x % t.w)) * 4 + 4);
    escribir(out, W, W, destino); };
  tres(mala, join(salida, 'mosaico-antes.png')); tres(a.arreglada, join(salida, 'mosaico-despues.png'));
  hacerHoja([join(salida, 'mosaico-antes.png'), join(salida, 'mosaico-despues.png')], join(salida, 'hoja-mosaico.png'), { lado: 384, columnas: 2, fondo: 'oscuro' });
}

if (capturas) {
  mkdirSync(capturas, { recursive: true });
  for (const f of ['hoja-piezas.png', 'hoja-iconos.png', 'hoja-mosaico.png']) copyFileSync(join(salida, f), join(capturas, f));
}
console.log(fallos.length ? `\n${fallos.length} fallos:\n- ${fallos.join('\n- ')}` : '\nTodo bien.');
process.exitCode = fallos.length ? 1 : 0;
