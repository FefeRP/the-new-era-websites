// Taller Arce: componentes y entradas discretas. No hay secciones fijadas: aquí el scroll no cuenta nada
// (nada gira, avanza ni se descubre), así que la página se desplaza normal.
import '../taller.css';
import { crearLineas, alEntrar } from '../lib/revelados.js';
import { crearTarjetaVolteo } from '../lib/tarjeta-volteo.js';
import { crearCarruselOrbital } from '../lib/carrusel-orbital.js';
import { crearResenas3D } from '../lib/resenas-3d.js';

const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Titular que sube por líneas, una vez, al cargar.
const titular = document.getElementById('titular');
if (titular) alEntrar(titular, crearLineas(titular, { retardo: 0.14 }), { umbral: 0.2, duracion: 900 });

// Fichas de proyecto: clic o teclado (en un listado, el hover molesta al recorrerlo con el ratón).
document.querySelectorAll('.ficha').forEach((ficha) => crearTarjetaVolteo(ficha, { disparo: 'clic', duracion: 600 }));

// Materiales en órbita. Sin autoplay: lo mueve quien mira.
const orbita = document.getElementById('orbita');
if (orbita) crearCarruselOrbital(orbita, { modo: 'orbita', botonAnterior: '#ant', botonSiguiente: '#sig' });

// Reseñas en columnas. Con reduced-motion el motor no crea la escena y queda la lista en rejilla.
const lista = document.getElementById('opiniones-lista');
if (lista) crearResenas3D(lista, { columnas: { 0: 1, 620: 2, 1000: 3, 1400: 4 } });

// Entradas al hacer scroll sin esconder nada en el CSS: si el JS falla, el contenido está.
if (!menosMovimiento && 'IntersectionObserver' in window) {
  let primero = true;
  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      if (primero) continue; // lo que ya se ve al cargar no se anima (no retrasa el LCP)
      e.target.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
        { duration: 600, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'backwards' });
    }
    primero = false;
  }, { threshold: 0.15 });
  document.querySelectorAll('.bloque__cabecera, .servicios li, .cierre > *').forEach((el) => io.observe(el));
}
