// muelle.js: muelles para interfaz, sin dependencias. Dos piezas:
//   crearMuelle()  valor que persigue un objetivo con física (k, c, m); se reorienta a mitad sin saltos y hereda la
//                  velocidad del dedo. Para indicadores, gotas, arrastres, docks: todo lo que se interrumpe.
//   muelleLinear() muestrea un muelle y devuelve una curva CSS linear() + su duración, para transiciones declaradas
//                  (popover, hover, toggles) que van al compositor sin JS por fotograma.
// Guía con valores y cuándo usar cada uno: ../references/fisica-y-fluidez.md
//
//   import { crearMuelle, muelleLinear, MUELLES } from './muelle.js';
//   const m = crearMuelle({ ...MUELLES.indicador, alPintar: (x) => el.style.transform = `translateX(${x}px)` });
//   m.ir(240);                     // nuevo objetivo: conserva posición y velocidad
//   m.ir(0, -1800);                // con la velocidad del gesto al soltar (px/s)
//   const { easing, duracion } = muelleLinear(MUELLES.panelVivo);   // → transition: transform 520ms linear(...)
//
// Con prefers-reduced-motion, usa fijar() en vez de ir(): salta al destino.

// Muelles con nombre (masa 1 salvo indicación). ζ = c / (2·√(k·m)).
export const MUELLES = {
  pulsar:      { k: 500, c: 30, m: 0.6 },   // ζ≈0,87 · botones, toggles
  indicador:   { k: 420, c: 30, m: 1 },     // ζ≈0,73 · pestaña activa, resaltado: un pellizco de rebote
  panel:       { k: 420, c: 40, m: 0.5 },   // ζ≈1,38 · lo que ocupa espacio no rebota
  panelVivo:   { k: 260, c: 22, m: 1 },     // ζ≈0,68 · desplegable con rebote (solo la entrada)
  cabeza:      { k: 210, c: 25, m: 1 },     // ζ≈0,86 · cuerpo delantero de una gota
  cola:        { k: 72,  c: 13, m: 1 },     // ζ≈0,77 · cuerpo trasero: se queda atrás y estira
  aplastar:    { k: 280, c: 9,  m: 1 },     // ζ≈0,27 · detalle secundario muy vivo (escala Y de la gota)
  seguir:      { k: 200, c: 15, m: 0.3 },   // ζ≈0,97 · seguir al puntero sin látigo
};

export function crearMuelle({ k = 300, c = 26, m = 1, valor = 0, reposo = 0.01, alPintar = () => {}, alParar = null } = {}) {
  const H = 1 / 120;                        // paso fijo: igual a 60, 120 o 144 Hz
  let x = valor, v = 0, objetivo = valor, acum = 0, ultimo = 0, raf = 0;
  function tic(ahora) {
    acum += Math.min((ahora - ultimo) / 1000, 1 / 15);   // tope: una pestaña que vuelve no explota
    ultimo = ahora;
    while (acum >= H) {
      v += ((-k * (x - objetivo) - c * v) / m) * H;     // semi-implícito: primero velocidad
      x += v * H;
      acum -= H;
    }
    const quieto = Math.abs(x - objetivo) < reposo && Math.abs(v) < reposo * 10;
    if (quieto) { x = objetivo; v = 0; }
    alPintar(x, v);
    if (quieto) { raf = 0; alParar?.(x); } else raf = requestAnimationFrame(tic);
  }
  return {
    ir(nuevo, velocidad) {
      objetivo = nuevo;
      if (velocidad !== undefined) v = velocidad;
      if (!raf) { ultimo = performance.now(); acum = 0; raf = requestAnimationFrame(tic); }
    },
    fijar(n) { cancelAnimationFrame(raf); raf = 0; x = objetivo = n; v = 0; alPintar(x, 0); },
    empujar(dv) { v += dv; if (!raf) { ultimo = performance.now(); acum = 0; raf = requestAnimationFrame(tic); } },
    ajustar(p) { if (p.k) k = p.k; if (p.c) c = p.c; if (p.m) m = p.m; },
    get valor() { return x; }, get velocidad() { return v; }, get objetivo() { return objetivo; },
    get enMarcha() { return raf !== 0; },
    destruir() { cancelAnimationFrame(raf); raf = 0; },
  };
}

// Curva linear() de un muelle que va de 0 a 1 partiendo de reposo. puntos: 40-60 (80 con rebotes fuertes).
// Ojo: una transición CSS reinicia la curva desde el valor actual con velocidad 0 al interrumpirse; para gestos y
// física acoplada, crearMuelle().
export function muelleLinear({ k = 300, c = 20, m = 1, puntos = 56, tolerancia = 0.0005 } = {}) {
  const dt = 1 / 600; let x = 0, v = 0, t = 0; const muestras = [0];
  while (t < 4) {
    v += ((-k * (x - 1) - c * v) / m) * dt; x += v * dt; t += dt; muestras.push(x);
    if (Math.abs(x - 1) < tolerancia && Math.abs(v) < tolerancia * 10) break;
  }
  const lista = [];
  for (let i = 0; i < puntos; i++) {
    const p = (i / (puntos - 1)) * (muestras.length - 1);
    const a = Math.floor(p), b = Math.min(a + 1, muestras.length - 1);
    lista.push(+(muestras[a] + (muestras[b] - muestras[a]) * (p - a)).toFixed(4));
  }
  lista[0] = 0; lista[lista.length - 1] = 1;
  return { easing: `linear(${lista.join(', ')})`, duracion: Math.round(t * 1000) };
}
