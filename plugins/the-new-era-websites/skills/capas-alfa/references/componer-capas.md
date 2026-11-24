# Componer capas con alfa en la web

## Maqueta: el orden de las capas es el orden de la profundidad
```html
<section class="escena" data-parallax>
  <img  class="capa fondo"   data-profundidad="-0.6" src="/capas/fondo.webp" alt="">          <!-- z 1 -->
  <h2   class="capa titulo"  data-profundidad="-0.2">NARANJA</h2>                             <!-- z 2: entre fondo y sujeto -->
  <img  class="capa poster"  src="/alfa/splash/poster.webp" alt="" fetchpriority="high">      <!-- z 3: respaldo y LCP -->
  <canvas class="capa sujeto" data-profundidad="0" aria-hidden="true"></canvas>               <!-- z 3: vídeo con alfa -->
  <img  class="capa frente"  data-profundidad="0.5" src="/capas/hojas.webp" alt="">          <!-- z 4: primer plano -->
</section>
```
```css
.escena { position: relative; height: 100svh; overflow: clip; isolation: isolate; }
.capa { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
.fondo { z-index: 1; object-fit: cover; inset: -10%; width: 120%; height: 120%; } /* más grande: el parallax no enseña bordes */
.titulo { z-index: 2; display: grid; place-items: center; font-size: clamp(4rem, 16vw, 15rem); }
.poster, .sujeto { z-index: 3; }
.frente { z-index: 4; }
```
```js
import { crearVideoAlfa } from './lib/video-alfa.js';
import { crearParallax } from './lib/capas-parallax.js';      // skill parallax-capas
const escena = document.querySelector('.escena');
const splash = await crearVideoAlfa({ canvas: escena.querySelector('.sujeto'), base: '/alfa/splash/', poster: escena.querySelector('.poster') });
const parallax = crearParallax(escena);
// al desmontar: splash.destruir(); parallax.destruir();
```
- **`overflow: clip`, no `hidden`**, en secciones con hijos `position: sticky`: `hidden` crea un contenedor de scroll y el
  sticky deja de funcionar.
- `isolation: isolate` en la escena: los `z-index` y las mezclas no se escapan a otras secciones.
- El título es **texto real** (SEO, accesibilidad); si es decorativo y repite otro título, `aria-hidden="true"`.

## Texto entre capas (sándwich)
Fondo → texto → sujeto recortado → primer plano. Lo que hace que funcione:
- El sujeto tapa **parte** de las letras, no todas: el texto se tiene que seguir leyendo (deja 2-3 letras limpias).
- Con una foto: hace falta el sujeto recortado **y** el fondo sin sujeto (clean plate) o la foto entera debajo; si la foto
  entera va debajo, el sujeto recortado encima coincide al píxel (misma resolución y posición: `alfa.mjs` sin `--recortar`,
  o usa la `caja` de `alfa.json` para colocarlo).
- Para que el texto "pase" por detrás al hacer scroll: el texto se mueve (parallax o `yPercent`) y el sujeto no, o al revés.

## Con el scroll (GSAP)
```js
const s = await crearVideoAlfa({ canvas, base: '/alfa/caida/', modo: 'scroll', poster });
gsap.timeline({ scrollTrigger: { trigger: escena, start: 'top top', end: '+=200%', pin: true, scrub: true,
  onUpdate: (st) => s.irA(st.progress) } })
  .fromTo('.titulo', { yPercent: 20 }, { yPercent: -20, ease: 'none' }, 0)
  .fromTo('.frente', { yPercent: 30 }, { yPercent: -40, ease: 'none' }, 0);
```
- Genera el vídeo con `--scrub` (keyframe cada 4 frames).
- Con frames con alfa: `crearFrameScrubber({ canvas, base: '/alfa/caida/frames/', transparente: true })` y `seq.progreso(p)`.

## Varias capas con alfa a la vez
- 2-3 capas con movimiento por escena; con 6 o más parece un diorama y pesa.
- Un solo vídeo con alfa por pantalla en móvil (cada uno es un decodificador y una textura).
- Las capas quietas, `<img>` con `decoding="async"` y `loading="lazy"` fuera del hero.

## Sombra
El recorte se lleva la sombra; sin ella el sujeto parece pegado. Cómo ponerla como capa propia (extraída, sintética o
con un degradado por CSS): [sombras.md](../../parallax-capas/references/sombras.md) de `parallax-capas`.

## Móvil y accesibilidad
- `prefers-reduced-motion`: `video-alfa.js` no arranca y deja el póster; `capas-parallax.js` no mueve nada.
- iOS en ahorro de energía: se queda el póster (el vídeo no se reproduce). Comprueba que la composición se entiende igual.
- Canvas y capas decorativas con `aria-hidden="true"`; las imágenes con contenido, con `alt`.
