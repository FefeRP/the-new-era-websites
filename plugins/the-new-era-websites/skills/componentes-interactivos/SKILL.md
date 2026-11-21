---
name: componentes-interactivos
description: Componentes reutilizables para webs, sin dependencias y con la accesibilidad resuelta - tarjeta con volteo 3D y capas en profundidad (tarjeta-volteo.js), carrusel circular en órbita o anillo 3D que gira con arrastre, teclado, autoplay o el scroll (carrusel-orbital.js) y muro de reseñas en columnas inclinadas en 3D en movimiento continuo (resenas-3d.js). Cada uno con su versión para táctil, para reduced-motion y su destruir(). Úsala cuando pidan "tarjeta que se da la vuelta", "tarjeta con volteo", "flip card", "carrusel circular", "carrusel orbital", "anillo 3D", "galería circular", "carrusel 3D que gira con el scroll", "reseñas en 3D", "muro de testimonios", "testimonios en columnas", "componente reutilizable", "3D flip card", "circular gallery", "orbital carousel", "3D carousel on scroll", "3D testimonials", "testimonial marquee", "reusable component".
license: MIT
version: 1.0.0-beta.12
---

# Componentes interactivos

Tres piezas que se repiten en webs reales (listados, destacados, prueba social), escritas en JavaScript sin dependencias
para que sirvan igual en HTML estático, Vite, Astro o dentro de un componente de React o Vue. Cada motor recibe el HTML
que ya existe, devuelve `destruir()` y trae resuelto lo que suele quedar a medias: teclado, lectores de pantalla, táctil,
reduced-motion y pausa fuera de pantalla.

El aspecto (colores, tipografía, radios, sombras) **no** lo pone esta skill: sale del sistema de diseño del proyecto. Si
hay skills de diseño instaladas, el pulido de curvas y tiempos se consulta con `animate` o `emil-design-eng`.

| Quiero… | Motor | Cuándo sí | Cuándo no |
|---|---|---|---|
| Una ficha con más datos por detrás | `tarjeta-volteo.js` | Listados (inmuebles, productos, equipo) donde el dorso amplía sin navegar | Si el dorso lleva lo imprescindible para decidir: eso va delante |
| Destacados que giran alrededor de un centro | `carrusel-orbital.js` (`modo: 'orbita'`) | 5-9 elementos de igual peso, uno protagonista cada vez | Más de 12 elementos o comparación lado a lado: rejilla |
| Un anillo de tarjetas que gira al bajar | `carrusel-orbital.js` (`modo: 'anillo'` + `desplazar`) | Sección fijada de destacados con foto | Sin fotos buenas: el anillo las enseña grandes y en escorzo |
| Prueba social con movimiento | `resenas-3d.js` | 5 o más reseñas reales | Menos de 5, o reseñas inventadas: no se usa |

## Antes de programar (obligatorio)
El código de esta skill se monta dentro de un proyecto: no se escribe de memoria (regla 6 de `new-era`; protocolo en
`new-era/references/codigo-y-plataforma.md`).
- **`find-docs`** (cárgala con `Skill`): lee la versión en el `package.json` y consulta en esa versión GSAP y el framework del proyecto (React, Next.js…) antes de
  usar o cambiar su API. En Next.js, además, cómo se monta en un componente de cliente y se desmonta con `destruir()`.
- **`modern-web-guidance:modern-web-guidance`** (con `Skill`): busca y aplica las guías de botones y foco, accesibilidad de carruseles, popover o diálogo nativos si la pieza abre algo, INP, reduced-motion.
- Apunta cada consulta en `BRIEF.md` («Documentación consultada»).

## Pasos
1. **Escribe primero el HTML con el contenido real** (lista de reseñas, artículos del carrusel, las dos caras). La página
   tiene que leerse sin JavaScript.
2. **Copia el motor** que toque de `scripts/` a `src/lib/` del proyecto (con la plantilla de la skill maestra:
   `nueva-web.mjs … --con componentes`).
3. **Actívalo** con el código de abajo y dale estilo con los tokens del proyecto.
4. **Comprueba** con teclado (Tab, Enter, espacio, flechas, Escape), en táctil y con reduced-motion, y pasa
   `verificar-scroll.mjs` de la skill maestra. La prueba de referencia está en `pruebas/componentes/` del repositorio
   (42 comprobaciones en Chrome).

## Tarjeta con volteo
```html
<article class="ficha">
  <div data-cara="frente"> <div class="ficha__fondo"></div> <span data-z="80">Nuevo</span> <h3 data-z="60">…</h3> </div>
  <div data-cara="dorso">  <div class="ficha__fondo"></div> <p data-z="40">…</p> <a href="/ficha">Ver ficha</a> </div>
</article>
```
```js
import { crearTarjetaVolteo } from './lib/tarjeta-volteo.js';
const tarjeta = crearTarjetaVolteo(document.querySelector('.ficha'), {
  disparo: 'clic',     // 'clic' | 'hover' | 'ambos'. 'hover' solo con ratón: en táctil pasa a clic
  eje: 'y', duracion: 600, perspectiva: 1200,
  etiqueta: 'Ver los datos de la obra',   // nombre del botón que gira (por defecto «Dar la vuelta a la tarjeta»)
  alVoltear: (volteada) => {},
});
// tarjeta.voltear() · tarjeta.voltear(false) · tarjeta.volteada · tarjeta.boton · tarjeta.destruir()
```
- **El control es un `<button>` aparte, no la tarjeta.** Una tarjeta con `role="button"` vuelve «presentacional» todo lo
  de dentro: los enlaces del dorso dejan de anunciarse como enlaces y el lector de pantalla lee un botón con todo el
  texto pegado. Por eso el motor crea `<button data-volteo-boton aria-pressed>` como primer hijo de la tarjeta, fuera de
  las caras, oculto a la vista y visible al llegar con el tabulador. Si quieres un botón visible tuyo («Ver detalles»),
  ponlo como hijo directo con `data-volteo-boton` (o pásalo en `boton`); dentro de una cara no vale (da error).
- Las dos caras comparten celda: la tarjeta mide lo que la cara más alta, o lo que diga su `aspect-ratio`.
- **Capas en profundidad:** los hijos directos de una cara con `data-z="N"` flotan N px por delante (insignia 80, título
  60, datos 40) y al girar se ve el relieve. Las caras **no** pueden llevar `overflow: hidden` (aplana las capas): el fondo
  y el recorte van en un hijo (`.ficha__fondo` con `position: absolute; inset: 0`).
- La cara oculta queda `inert`; un clic en un enlace o botón de dentro no gira; con texto seleccionado tampoco.
- Teclado: Enter o espacio en el botón giran; Escape vuelve al frente y deja el foco en el botón (no se pierde en la
  cara que queda inerte). Con `disparo: 'hover'`, el foco en el botón o dentro enseña el dorso.
- Reduced-motion: fundido entre caras, sin giro ni relieve.
- Dentro de un carrusel con recorte, deja aire vertical (`padding-block: 28px; margin-block: -28px`) o el giro se corta.

## Carrusel en órbita y anillo 3D
```html
<div class="orbita" aria-label="Proyectos destacados">
  <article>…</article> <article>…</article> <article>…</article> <article>…</article> <article>…</article>
</div>
<button id="ant">Anterior</button> <button id="sig">Siguiente</button>
```
```js
import { crearCarruselOrbital } from './lib/carrusel-orbital.js';
const carrusel = crearCarruselOrbital(document.querySelector('.orbita'), {
  modo: 'orbita',            // 'orbita': plano, con escala · 'anillo': 3D, tarjetas en escorzo
  autoplay: 4000,            // 0 = sin autoplay
  botonAnterior: '#ant', botonSiguiente: '#sig',
  alCambiar: (indice) => {},
});
// carrusel.ir(2) · siguiente() · anterior() · desplazar(pasos) · indice · total · destruir()
```
- El contenedor necesita **alto** y los elementos **ancho** (p. ej. `height: 380px` y `width: min(60vw, 260px)`).
- Arrastre con inercia y encaje, flechas, Inicio y Fin, clic en un lateral para traerlo delante. El scroll vertical de la
  página sigue funcionando encima (`touch-action: pan-y`).
- Solo el elemento de delante es alcanzable con teclado y lector; el resto queda `inert`.
- El bucle de animación solo corre mientras algo se mueve. El autoplay se para fuera de pantalla, con la pestaña oculta,
  con el puntero encima, con el foco dentro y con reduced-motion (los cambios pasan a ser inmediatos).
- **Anillo ligado al scroll:** sección alta con el anillo en un contenedor fijado y
  ```js
  ScrollTrigger.create({ trigger: seccion, start: 'top 80%', end: 'bottom 20%',
    onUpdate: (st) => anillo.desplazar(st.progress * (anillo.total - 1)) });
  ```
  Al dejar de moverse, encaja solo en la tarjeta más cercana (`reposo`, 220 ms).
- **Anillo: cuántas tarjetas.** Con menos de 8-10 quedan huecos: duplica los elementos (las copias, con `aria-hidden` y
  `tabindex="-1"`). El radio sale del ancho de la tarjeta: `R = ancho · separacion / (2 · tan(π / n))`.
- **Anillo: sombras.** Con un `::after` y degradado, nunca con `box-shadow`: Chrome recorta la sombra de una cara 3D que
  sale a medias. Cada tarjeta recibe `--velo` (0 delante, 0,8 de lado) para oscurecer las laterales:
  ```css
  .anillo > article { position: relative; }
  .anillo > article::after { content: ""; position: absolute; inset: 0; border-radius: inherit;
    background: var(--fondo); opacity: var(--velo, 0); pointer-events: none; }
  ```
- **Apaisado bajo en móvil** (844×390): con poco alto las tarjetas se quedan en una tira. Dales otra proporción con
  `@media (max-height: 540px)`.
- Reduced-motion o gama baja con anillo: plantéate no crear el carrusel y dejar una rejilla o una fila con
  `scroll-snap`; es una versión diseñada, no un recorte.

## Reseñas en columnas 3D
```html
<ul class="opiniones">
  <li class="resena"><blockquote>…</blockquote><footer><span class="iniciales">AB</span> A. B.</footer></li>
  …
</ul>
```
```js
import { crearResenas3D } from './lib/resenas-3d.js';
const muro = crearResenas3D(document.querySelector('.opiniones'), {
  columnas: { 0: 1, 600: 2, 1100: 4 },   // ancho mínimo → columnas
  duraciones: [52, 60, 56, 48],          // segundos por vuelta, distintos para que no se sincronicen
});
if (!muro.activo) { /* reduced-motion: queda la lista, maquetada como rejilla */ }
```
- **Mejora progresiva:** la lista real se queda en el DOM para buscadores y lectores; el motor crea al lado una escena
  decorativa (`aria-hidden`, `inert`) con las fichas clonadas. Da estilo a la lista como rejilla: es lo que se ve sin JS y
  con reduced-motion.
- Cada columna repite sus fichas tres veces y se desplaza una repetición exacta: el bucle no salta. Las columnas alternan
  el sentido.
- **No se para con el hover**: un muro que se frena al pasar el ratón parece roto. Solo fuera de pantalla y con la pestaña
  oculta.
- La inclinación (`giro`) cambia con el ancho: suave en móvil, marcada en escritorio. Los bordes se funden con una máscara.
- **Solo reseñas reales.** Sin foto, iniciales. Nunca una cara de banco de imágenes con un nombre real, ni cifras («+200
  clientes») que no se puedan enseñar.

## Rendimiento
- [ ] Solo `transform` y `opacity`; nada de animar `box-shadow`, `filter` o tamaños.
- [ ] Sombras de hover con un pseudo-elemento que cambia de opacidad.
- [ ] Imágenes de las tarjetas con `srcset`, `sizes` y `loading="lazy"`; las del anillo, al tamaño al que se ven.
- [ ] Nada se mueve fuera de pantalla (los motores lo hacen; compruébalo si añades animaciones propias).
- [ ] Zonas táctiles de 44-48 px en botones y controles.
- [ ] Probado a 390×844, 360×740, 844×390, 932×430 y escritorio; sin desplazamiento lateral.
