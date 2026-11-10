#!/usr/bin/env node
// Prueba del banco con resultado conocido, sin generar nada de pago: fabrica entradas por código (el clip de la demo del
// reloj y dibujos de ffmpeg), las pasa por procesar-clips.mjs como si acabaran de descargarse y comprueba lo que sale.
//   cd demos/reloj && node ../../pruebas/clips-ia/hacer-prueba.mjs        (desde ahí encuentra playwright-core)
// Deja todo en pruebas/clips-ia/prueba/ (fuera del repo: se regenera).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buscarBinario } from './medir-clip.mjs';

const aqui = dirname(fileURLToPath(import.meta.url)); const raiz = resolve(aqui, '..', '..');
const datos = join(aqui, 'prueba'); const entrada = join(datos, 'entrada');
const ffmpeg = buscarBinario('ffmpeg');
const ff = (a) => { const r = spawnSync(ffmpeg, ['-hide_banner', '-v', 'error', '-y', ...a], { encoding: 'utf8' }); if (r.status !== 0) throw new Error(r.stderr.slice(-400)); };
const banco = (a) => { const r = spawnSync(process.execPath, [join(aqui, 'procesar-clips.mjs'), ...a, '--datos', datos], { encoding: 'utf8' }); process.stdout.write(r.stdout); if (r.status !== 0) throw new Error(r.stderr); return r.stdout; };

rmSync(datos, { recursive: true, force: true }); mkdirSync(entrada, { recursive: true });
const P = (id, tipo, titulo, extra = {}) => ({ id, bloque: 'prueba', prioridad: 1, tecnica: titulo, tipo, titulo, objetivo: 'comprobar el banco', modelo: 'hecho por código', ajustes: '720p', prompt: '(sin prompt: entrada sintética)', variantes: 2, ...extra });
writeFileSync(join(datos, 'bateria.json'), JSON.stringify({ pruebas: [
  P('giro-p01', 'scrub', 'Giro de producto para scroll'), P('bucle-p01', 'bucle', 'Héroe en bucle'),
  P('alfa-p01', 'alfa-video', 'Elemento en vídeo sobre croma', { alfa: 'croma' }), P('pieza-p01', 'imagen-alfa', 'Elemento suelto sobre croma'),
  P('textura-p01', 'imagen', 'Textura para mosaico', { mosaico: true }),
] }, null, 2));

const reloj = join(raiz, 'demos', 'reloj', 'fuente', 'reloj-orbita.mp4');
if (!existsSync(reloj)) throw new Error('Falta demos/reloj/fuente/reloj-orbita.mp4 (se genera con demos/reloj/herramientas/render-video.mjs)');
console.log('Fabricando entradas…');
const base = join(datos, '_base.mp4');
ff(['-i', reloj, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', base]);
// 1) llega con el nombre de la descarga: se asigna por la cola
banco(['lanzada', 'giro-p01', 'codigo', '--ajustes', '720p · 6 s']);
ff(['-i', base, '-c', 'copy', join(entrada, 'descarga_8f3a21.mp4')]);
// 2) llega ya con nombre; a 12 fps reales dentro de un contenedor de 24 (fallo sembrado: fotogramas repetidos)
ff(['-i', base, '-vf', 'fps=12,fps=24', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', join(entrada, 'giro-p01-codigo-v2.mp4')]);
// 3) bucle: el giro no da la vuelta entera, así que la costura salta y tiene que salir el fundido
ff(['-i', base, '-c', 'copy', join(entrada, 'bucle-p01-codigo-v1.mp4')]);
// 4) vídeo sobre croma: un disco claro que cruza un fondo verde
ff(['-f', 'lavfi', '-i', 'color=c=0x00b140:s=640x360:r=24:d=2', '-vf', "geq=r='if(lt(hypot(X-(120+200*T),Y-180),60),240,r(X,Y))':g='if(lt(hypot(X-(120+200*T),Y-180),60),200,g(X,Y))':b='if(lt(hypot(X-(120+200*T),Y-180),60),60,b(X,Y))'", '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', join(entrada, 'alfa-p01-codigo-v1.mp4')]);
// 5) imagen sobre croma
ff(['-f', 'lavfi', '-i', 'color=c=0x00b140:s=800x800', '-vf', "geq=r='if(lt(hypot(X-400,Y-400),220),220,r(X,Y))':g='if(lt(hypot(X-400,Y-400),220),40,g(X,Y))':b='if(lt(hypot(X-400,Y-400),220),50,b(X,Y))'", '-frames:v', '1', join(entrada, 'pieza-p01-codigo-v1.png')]);
// 6) textura que NO casa al repetirse (degradado): tiene que avisar de la junta
ff(['-f', 'lavfi', '-i', 'gradients=s=512x512:c0=0x222222:c1=0xdddddd:x0=0:y0=0:x1=512:y1=0', '-frames:v', '1', join(entrada, 'textura-p01-codigo-v1.png')]);
rmSync(base);

console.log('Procesando…');
banco(['procesar', ...(process.argv.includes('--sin-demo') ? ['--sin-demo'] : [])]);
banco(['nota', 'giro-p01-codigo-v1', 'BUENO', 'Giro limpio (es un render, no IA).', '--leccion', 'Sirve de referencia de lo que mide un clip sin fallos.']);

const reg = JSON.parse(readFileSync(join(datos, 'registro.json'), 'utf8')); const de = (n) => reg.find((r) => r.nombre === n);
let ok = 0, mal = 0; const prueba = (nombre, cond) => { if (cond) ok++; else mal++; console.log(`${cond ? '  bien ' : '  FALLA'}  ${nombre}`); };
const sinDemo = process.argv.includes('--sin-demo');
const g1 = de('giro-p01-codigo-v1'), g2 = de('giro-p01-codigo-v2'), b1 = de('bucle-p01-codigo-v1'), a1 = de('alfa-p01-codigo-v1'), i1 = de('pieza-p01-codigo-v1'), t1 = de('textura-p01-codigo-v1');
prueba('la descarga sin nombre se asignó a giro-p01-codigo-v1 por la cola', !!g1 && existsSync(join(datos, 'clips', 'giro-p01-codigo-v1.mp4')));
prueba('la cola quedó vacía', JSON.parse(readFileSync(join(datos, 'cola.json'), 'utf8')).length === 0);
prueba('el giro limpio sale BIEN y sin cortes', g1?.automatico === 'BIEN' && g1.medidas.cortes.length === 0);
prueba('se extraen tantos fotogramas como tiene el clip (144), sin remuestrear', g1?.pesos.frames === 144 && existsSync(join(datos, 'procesado', g1.nombre, 'frames', 'manifest.json')));
prueba('primer y último fotograma guardados (para encadenar)', existsSync(join(datos, 'procesado', g1.nombre, 'primer.png')) && existsSync(join(datos, 'procesado', g1.nombre, 'ultimo.png')));
prueba('el clip a 12 fps reales sale MAL por fotogramas repetidos', g2?.automatico === 'MAL' && g2.medidas.duplicados.exactos > 60 && g2.avisos.some((a) => /repetidos/.test(a)));
prueba('…y se extraen solo los fotogramas reales (~72)', g2 && Math.abs(g2.pesos.frames - 72) <= 2);
prueba('el bucle detecta la costura y genera el fundido', b1 && b1.medidas.bucle.relativa > 2.5 && existsSync(join(datos, 'procesado', b1.nombre, 'bucle-fundido.mp4')));
prueba('el fundido baja la costura a menos de la mitad', b1?.medidas.bucleFundido && b1.medidas.bucleFundido.relativa < b1.medidas.bucle.relativa / 2);
prueba('el vídeo sobre croma sale con alfa apilado', a1 && existsSync(join(datos, 'procesado', a1.nombre, 'alfa', 'apilado.mp4')) && a1.medidas.alfa.cobertura_media > 0.02);
prueba('la imagen sobre croma sale recortada con alfa', i1 && existsSync(join(datos, 'procesado', i1.nombre, i1.salidas.recorte)) && i1.medidas.alfa.cobertura_media > 0.15 && i1.medidas.alfa.cobertura_media < 0.35);
prueba('la textura que no casa avisa de la junta', t1 && t1.avisos.some((a) => /junta/.test(a)));
prueba('registro.md con prompt, medidas y la nota', (() => { const m = readFileSync(join(datos, 'registro.md'), 'utf8'); return /### giro-p01-codigo-v1/.test(m) && /Resultado: BUENO/.test(m) && /Medidas: 1280x720/.test(m); })());
prueba('comparador e índice generados', existsSync(join(datos, 'procesado', 'index.html')) && existsSync(join(datos, 'procesado', 'indice.json')));
if (!sinDemo) {
  for (const r of [g1, g2, b1, a1, i1, t1]) prueba(`demo de ${r?.nombre} capturada sin errores`, r && existsSync(join(datos, 'procesado', r.nombre, 'hoja-demo.png')) && existsSync(join(datos, 'procesado', r.nombre, 'hoja-demo-movil.png')) && !(r.demo?.errores?.length));
  prueba('en la demo, el fotograma dibujado sigue al scroll', g1?.demo?.scrubSigue === true);
}
console.log(`\n${ok} bien, ${mal} fallan`);
process.exit(mal ? 1 : 0);
