# Fondos generados por capas (recurso fijo de la base)

Un fondo que no es una foto ni un vídeo, sino **varios planos separados** que se mueven y se cambian entre sí. Se usa poco
y da mucho: con 3-4 imágenes por escena salen varias animaciones distintas sin vídeo y sin 3D, y la web tiene un mundo
propio que reacciona al producto, al modelo o al capítulo. Vale para cualquier intensidad y no necesita activar ningún
módulo (si las capas se generan con IA, su coste va al plan de activos del paso 5).

Motor: `parallax-capas/scripts/fondo-capas.js` (`crearFondoCapas`), junto con `capas-parallax.js` (`crearParallax`). En
`nueva-web.mjs`: `--con fondo`. Probado en Chrome con `pruebas/fondo-capas` (relevo escalonado, interrupción a medias,
reduced-motion y paso por scroll).

## Dos formas

### A. Shader de fondo + suelo que cambia por producto
- **Detrás**, una capa por código que no cambia de escena: un shader (degradado vivo, ruido, luz; `webgl-animation-skills:shader-glsl`
  o el fondo-shader del módulo 3D y WebGL) o, sin WebGL, un canvas 2D o un degradado CSS animado. Cuesta 0 en generación.
- **En el suelo del hero**, una capa con alfa por producto o modelo: nubes, niebla, arena, agua, hojas, polvo de color.
- **Delante**, el producto (foto con alfa, render o `envase-giratorio`) y el titular, que puede ir entre capas.
- Al cambiar de producto (slider, botones, scroll), el suelo hace el relevo (las nubes de uno se van y entran las del
  otro), el producto se cambia y, si se quiere, el shader cambia de color con un uniform: tres cosas a la vez que
  parecen una escena nueva.

### B. Paisaje fotográfico por capas
- **Cielo**, **fondo lejano** (montañas, ciudad, bosque) y **suelo** (campo, nubes bajas, agua, mesa) como fotos separadas,
  del mismo encuadre y con la misma línea de horizonte; las del medio y el suelo con alfa.
- Cada capa lleva una versión por escena (día, atardecer, noche; verano o invierno; un paisaje por modelo).
- Animaciones que salen solo de esas fotos (combina 2-3, no todas):
  1. **Parallax** con el scroll y el puntero (`crearParallax`, `data-profundidad`: cielo -0,8 · fondo -0,3 · suelo 0,4).
  2. **Relevo escalonado** entre escenas: el cielo cambia primero y el suelo el último, o al revés (`orden`), con el suelo
     viajando en sentido contrario (`sentidoPorCapa: { suelo: -1 }`).
  3. **Deriva lenta** del cielo (translate de unos px por segundo, en bucle) mientras el resto está quieto.
  4. **El suelo como cortina**: al acabar la sección, el suelo sube y tapa la pantalla, y la sección siguiente arranca
     sobre su color.
  5. **Dolly**: las capas cercanas crecen más que las lejanas al bajar (`escalaPorProfundidad` en `crearParallax`).
  6. **Texto entre capas**: el titular detrás del fondo lejano y delante del cielo (`capas-alfa`, componer capas).

## Preparar las capas
- **Mismo encuadre en todas las escenas**: misma cámara, horizonte a la misma altura y misma escala. Si el relevo salta,
  es porque el horizonte no coincide.
- Con IA: primero la escena entera de la escena principal y, de ahí, las capas (recorte con alfa, `capas-alfa`; el cielo
  como clean plate). Las demás escenas, por edición con referencia de esa misma imagen, no por prompts nuevos. Prompts y
  criterio de estilo con `pedir-assets-ia` (y con `creative-architect:direccion-de-arte` si está instalada).
- Con fotos del cliente o libres: recorta el fondo lejano y el suelo con alfa y deja el cielo como foto entera.
- **Margen sobrante**: las capas con parallax o deriva llevan `inset: -8%` (o más), o se verá el borde al moverse.
- Pesos: el cielo puede ir más pequeño o con algo de desenfoque (1600 px WebP basta); las capas con alfa en WebP o AVIF con
  alfa. Todas las escenas en la misma relación de aspecto.

## Código
```html
<section class="hero">
  <div class="fondo" data-fondo-capas>
    <canvas class="capa" data-capa="shader"></canvas>                         <!-- fija, sin data-escena -->
    <div class="capa" data-capa="cielo" data-profundidad="-0.8">
      <img data-escena="alba" src="/fondo/cielo-alba.webp" alt="" fetchpriority="high">
      <img data-escena="noche" src="/fondo/cielo-noche.webp" alt="" decoding="async">
    </div>
    <div class="capa" data-capa="suelo" data-profundidad="0.4"> …una versión con alfa por escena… </div>
  </div>
  <h1>…</h1>
</section>
```
```css
.fondo, .capa { position: absolute; inset: 0; }
.capa { overflow: hidden; }
.capa[data-profundidad] { inset: -8%; }
```
```js
import { crearFondoCapas } from './lib/fondo-capas.js';
import { crearParallax } from './lib/capas-parallax.js';
const raiz = document.querySelector('[data-fondo-capas]');
const fondo = crearFondoCapas(raiz, { inicial: 'alba', sentidoPorCapa: { suelo: -1 } });
const parallax = crearParallax(raiz);
// desde el selector de producto, un botón o ScrollTrigger: fondo.irA('noche');
// o que lo lleve el scroll: crearFondoCapas(raiz, { pasos: document.querySelectorAll('[data-paso-escena]') })
// al desmontar: fondo.destruir(); parallax.destruir();
```
El parallax mueve la capa y el motor mueve lo que hay dentro, así que no se pisan los `transform`. Solo se animan
`opacity` y `transform`; `desenfoque` es caro en capas grandes: déjalo a 0 en móvil.

## Rendimiento y accesibilidad
- 3-4 capas por escena y 2-4 escenas. En móvil, una capa menos (el suelo o el fondo lejano se funden en el cielo).
- La escena inicial es la imagen de la primera pantalla: su cielo con `fetchpriority="high"` (LCP) y el resto con
  `decoding="async"`. Si hay muchas escenas, las que no son la inicial se cargan cuando la página ya está quieta.
- Con reduced-motion, el motor hace un fundido corto sin desplazamiento ni escalonado, y el parallax no se mueve.
- Las capas son decorativas (`alt=""`). Si la escena comunica algo (el modelo elegido), dilo en el texto.

## Comprobar
- Capturas de cada escena y una a mitad de un relevo: el horizonte no salta y no se ve el borde de ninguna capa.
- Cambiar de escena dos veces seguidas muy rápido acaba limpio en la última.
- Móvil 390×844: el sujeto sigue legible sobre el suelo y no hay desplazamiento lateral.
