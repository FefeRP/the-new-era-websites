// Genera las capas SVG de la prueba de fondo-capas.js: cielo, montañas y nubes del suelo para tres escenas.
// Uso: node pruebas/fondo-capas/hacer-capas.mjs [carpeta]   (por defecto pruebas/fondo-capas/capas)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const destino = resolve(process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), 'capas'));
mkdirSync(destino, { recursive: true });

// Colores puros y distintos por capa y escena: la prueba los busca por píxel.
const ESCENAS = {
  dia:       { cielo: ['#2f7dd1', '#9fd3ff'], montes: '#2e5e3a', nubes: '#ffffff' },
  atardecer: { cielo: ['#c2410c', '#fbbf24'], montes: '#5b2a3a', nubes: '#ffd7a8' },
  noche:     { cielo: ['#020617', '#1e1b4b'], montes: '#0f172a', nubes: '#94a3b8' },
};
const W = 1600, H = 900;
const svg = (cuerpo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${cuerpo}</svg>`;

for (const [n, c] of Object.entries(ESCENAS)) {
  writeFileSync(join(destino, `cielo-${n}.svg`), svg(
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.cielo[0]}"/><stop offset="1" stop-color="${c.cielo[1]}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/>`));
  writeFileSync(join(destino, `montes-${n}.svg`), svg(
    `<path d="M0 620 L220 430 L380 540 L620 330 L860 560 L1060 400 L1300 580 L1600 380 L1600 900 L0 900 Z" fill="${c.montes}"/>`));
  writeFileSync(join(destino, `nubes-${n}.svg`), svg(
    `<g fill="${c.nubes}" opacity=".95"><ellipse cx="260" cy="840" rx="380" ry="90"/><ellipse cx="760" cy="870" rx="460" ry="80"/><ellipse cx="1320" cy="830" rx="400" ry="100"/></g>`));
}
console.log('capas en', destino);
