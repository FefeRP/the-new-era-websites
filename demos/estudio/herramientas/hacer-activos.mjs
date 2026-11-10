// Activos de la demo «Taller Arce», hechos por código y pasados por el mismo control que un lote generado con IA
// (skill recursos-imagen-ia, lote-imagenes.mjs). No hay generación de pago: la lámina de iconos y las texturas en bruto
// las dibuja este script con los defectos típicos de un modelo (luz desigual, bordes que no casan) para que el control
// tenga algo que medir y arreglar.
// Uso (desde demos/reloj, donde está playwright-core; ffmpeg en FFMPEG o en el PATH):
//   node ../estudio/herramientas/hacer-activos.mjs
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const demo = resolve(aqui, '..'), repo = resolve(demo, '..', '..');
const lote = await import(pathToFileURL(join(repo, 'plugins/the-new-era-websites/skills/recursos-imagen-ia/scripts/lote-imagenes.mjs')).href);
const bruto = join(aqui, 'bruto'), publico = join(demo, 'public');
rmSync(bruto, { recursive: true, force: true }); mkdirSync(bruto, { recursive: true });
mkdirSync(join(publico, 'texturas'), { recursive: true });
const informe = { texturas: [], iconos: null };

// ---------- texturas ----------
const hash = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const suave = (t) => t * t * (3 - 2 * t);
function ruido(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), tx = suave(x - xi), ty = suave(y - yi);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
}
const fbm = (x, y, s, oct = 4) => { let v = 0, amp = 0.5, f = 1; for (let o = 0; o < oct; o++) { v += amp * ruido(x * f, y * f, s + o); amp *= 0.5; f *= 2; } return v; };

const L = 512;
const recetas = {
  // cada receta devuelve [r, g, b] para el píxel (x, y)
  papel: (x, y) => { const n = (hash(x, y, 1) - 0.5) * 9 + (fbm(x / 40, y / 40, 2) - 0.5) * 10; return [238 + n, 234 + n, 226 + n]; },
  lino: (x, y) => {
    const hx = Math.sin((x + ruido(y / 9, x / 90, 3) * 2.2) * 1.57) * 0.5 + 0.5, hy = Math.sin((y + ruido(x / 9, y / 90, 4) * 2.2) * 1.57) * 0.5 + 0.5;
    const n = (hx * 0.55 + hy * 0.45 - 0.5) * 26 + (hash(x, y, 5) - 0.5) * 8; return [203 + n, 196 + n, 183 + n];
  },
  piedra: (x, y) => { const n = (fbm(x / 26, y / 26, 6, 5) - 0.5) * 46 + (hash(x, y, 7) - 0.5) * 10; return [166 + n, 163 + n, 157 + n]; },
  nogal: (x, y) => {
    // Veta marcada: el cruce de bordes deja fantasmas en un dibujo grande (lo avisa la skill), así que se dibuja ya
    // repetible: número entero de vetas en el alto y una ondulación periódica en las dos direcciones.
    const T = (2 * Math.PI) / L, onda = 13 * Math.sin(T * x) + 7 * Math.sin(T * 3 * y + 1.3) + 4 * Math.sin(T * 2 * x + T * 5 * y);
    const veta = Math.sin(T * 34 * (y + onda)) * 0.5 + 0.5, poro = (ruido(x / 3, y, 9) - 0.5) * 12;
    const k = 0.72 + veta * 0.34; return [98 * k + poro, 66 * k + poro, 44 * k + poro * 0.7];
  },
};
for (const [nombre, f] of Object.entries(recetas)) {
  const px = Buffer.alloc(L * L * 4);
  for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
    const luz = 0.88 + 0.2 * (x / L) + 0.06 * (y / L); // la luz desigual que suele traer una textura generada
    const [r, g, b] = f(x, y), i = (y * L + x) * 4;
    px[i] = Math.max(0, Math.min(255, r * luz)); px[i + 1] = Math.max(0, Math.min(255, g * luz)); px[i + 2] = Math.max(0, Math.min(255, b * luz)); px[i + 3] = 255;
  }
  const crudo = join(bruto, `${nombre}.png`), arreglado = join(bruto, `${nombre}-mosaico.png`), final = join(publico, 'texturas', `${nombre}.webp`);
  lote.escribir(px, L, L, crudo);
  const r = lote.revisarMosaico(crudo, { arreglar: arreglado, igualar: true });
  const { px: listo } = lote.leer(arreglado);
  lote.escribir(listo, L, L, final);
  informe.texturas.push({ nombre, antes: r.antes, despues: r.despues, bien: r.bien });
  console.log(`${r.bien ? 'OK ' : 'MAL'} textura ${nombre}: juntas ${r.antes.juntaVertical}×/${r.antes.juntaHorizontal}× → ${r.despues.juntaVertical}×/${r.despues.juntaHorizontal}×, desigualdad ${r.antes.desigualdad} % → ${r.despues.desigualdad} %`);
}

// ---------- lámina de iconos ----------
// Seis iconos de línea en una rejilla 3×2 sobre blanco: lo mismo que se le pide a un modelo de imagen en una sola lámina.
const trazo = 'fill="none" stroke="#000" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"';
const dibujos = [
  '<path d="M-120 10 L0 -105 L120 10"/><path d="M-88 -12 V112 H88 V-12"/><path d="M-24 112 V40 H24 V112"/>',                    // casa
  '<path d="M-110 112 V-112 L112 112 Z"/><path d="M-62 64 V-4 L6 64 Z"/>',                                                        // escuadra
  '<rect x="-112" y="-112" width="224" height="224" rx="10"/><path d="M0 -112 V112 M-112 0 H112"/>',                              // ventana
  '<rect x="-112" y="-92" width="224" height="204" rx="14"/><path d="M-112 -32 H112 M-56 -124 V-66 M56 -124 V-66"/><path d="M-44 44 L-12 74 L48 14"/>', // plazo
  '<path d="M0 -118 L104 -80 V4 C104 70 54 104 0 122 C-54 104 -104 70 -104 4 V-80 Z"/><path d="M-44 4 L-10 38 L48 -24"/>',       // garantía
  '<path d="M-112 96 H112"/><path d="M-84 96 V-20 M0 96 V-88 M84 96 V20"/><path d="M-84 -20 L0 -88 L84 20"/>',                    // presupuesto
];
const W = 1536, H = 1024, cw = W / 3, ch = H / 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff"/>` +
  dibujos.map((d, k) => `<g transform="translate(${(k % 3 + 0.5) * cw} ${(Math.floor(k / 3) + 0.5) * ch})" ${trazo}>${d}</g>`).join('') + '</svg>';
const pwRuta = [resolve('node_modules/playwright-core/index.mjs'), join(repo, 'demos/reloj/node_modules/playwright-core/index.mjs')].find(existsSync);
if (!pwRuta) throw new Error('Falta playwright-core: lanza este script desde demos/reloj tras npm install');
const pw = await import(pathToFileURL(pwRuta).href);
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
const nav = await pw.chromium.launch({ executablePath: chrome });
const pagina = await nav.newPage({ viewport: { width: W, height: H } });
await pagina.setContent(`<style>html,body{margin:0}</style>${svg}`);
const lamina = join(bruto, 'lamina-iconos.png');
await pagina.screenshot({ path: lamina });
await nav.close();

const ic = lote.cortarIconos(lamina, { columnas: 3, filas: 2, salida: join(publico, 'iconos'), lado: 128, color: '#191a1c' });
informe.iconos = { avisos: ic.avisos, iconos: ic.iconos.map(({ nombre, tamano, grosor }) => ({ nombre, tamano, grosor })) };
console.log(`${ic.bien ? 'OK ' : 'MAL'} iconos: ${ic.iconos.length} cortados, ${ic.avisos.length} avisos${ic.avisos.length ? ' → ' + ic.avisos.join(' | ') : ''}`);
lote.hacerHoja(ic.iconos.map((i) => i.fichero), join(bruto, 'hoja-iconos.png'), { lado: 128, fondo: 'todos' });

writeFileSync(join(aqui, 'informe-activos.json'), JSON.stringify(informe, null, 2));
process.exit(informe.texturas.every((t) => t.bien) && ic.bien ? 0 : 1);
