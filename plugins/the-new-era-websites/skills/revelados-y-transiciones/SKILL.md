---
name: revelados-y-transiciones
description: Revelados y transiciones entre secciones sin 3D ni vídeo - imagen que aparece por bloques (rejilla), cortina que cambia de escena, zoom 2D a un punto de una imagen grande con relevo a una imagen de detalle, titulares que suben línea a línea con máscara, tarjeta que crece a pantalla completa, View Transitions y animaciones CSS ligadas al scroll. Motor revelados.js sin dependencias, con la misma interfaz para scroll (GSAP scrub) o tiempo. Úsala cuando pidan "revelado por bloques", "la imagen aparece en cuadrícula", "transición entre secciones", "cortina", "cambio de escena", "zoom a un producto de la estantería", "acercarse a un punto de la imagen", "texto que sube por líneas", "titular con máscara", "tarjeta a pantalla completa", "grid reveal", "clip-path reveal", "section transition", "curtain wipe", "zoom into image", "line reveal text", "view transitions", "scroll-driven animation".
license: MIT
version: 1.0.0-beta.8
---

# Revelados y transiciones

Buena parte de lo que parece caro en una web no lleva ni 3D ni vídeo: es una imagen que se descubre bien, un
cambio de escena tapado por una cortina o un acercamiento a un punto de una foto grande. Son efectos de `clip-path`,
`transform` y `opacity` sobre fotos (o sobre fotos generadas con IA), baratos de producir y ligeros de servir. Antes de
pedir un vídeo para una transición, mira si uno de estos la resuelve (matriz de `pedir-assets-ia`,
`references/matriz-medio-por-elemento.md`, fila "Transiciones").

## Qué hay en `scripts/revelados.js`
Todos devuelven `{ progreso(p), reproducir({ duracion }), destruir() }`: `progreso` para el scroll, `reproducir` por
tiempo (promesa) y `destruir` deja el DOM como estaba. Solo animan `transform`, `opacity` y `clip-path`.

| Función | Qué hace | Para qué | Ejemplo de referencia |
|---|---|---|---|
| `crearRejilla(el, { filas, columnas, orden, color, forma })` | Una capa de celdas del color del fondo que se abren por orden (`escalera`, `centro`, `filas`, `azar`); forma `persiana` o `escala` | Entrada de una foto grande, galerías | ref13 (web 7) |
| `crearCortina(el, { direccion, color, alCubrir, alDescubrir })` | Un panel entra, cubre y sale por el lado opuesto; a mitad llama a `alCubrir` | Cambio de escena o de capítulo sin corte visible | ref16 |
| `crearZoomA(el, { objetivo, margen, relevo, inicioRelevo, marco })` | Zoom 2D con escala logarítmica a un rectángulo de una imagen grande; al final, fundido a una imagen de detalle | De la estantería al producto, del plano al edificio, de la mesa al plato | ref14 |
| `crearLineas(el, { retardo })` | Parte un titular en líneas y las sube desde detrás de una máscara; deja una copia para lectores de pantalla y se vuelve a partir al cambiar el ancho | Titulares de entrada; con tipografías de trazo muy fino, mejor fundido que máscara | ref12 |
| `alEntrar(el, revelado, { umbral, duracion })` | Lanza `reproducir` cuando el elemento entra en pantalla (sin GSAP) | Webs sin scroll pinado | |

## Pasos
1. **Elige el efecto por lo que cuenta**: aparecer (rejilla, líneas), cambiar de escena (cortina), acercarse a algo
   (zoom a un punto) o abrir un detalle (tarjeta a pantalla completa). Uno por sección; dos efectos a la vez se pisan.
2. **Prepara la imagen.** Para el zoom, una imagen grande (2400 px o más de ancho; si el objetivo acaba ocupando la
   pantalla, el objetivo necesita ~1 px de imagen por px de pantalla, así que mira su tamaño en la imagen) y, si no
   llega, una **imagen de detalle** del objetivo para el relevo. Si las dos salen de IA, pide el detalle con la imagen
   grande como referencia (plantillas de `pedir-assets-ia`) para que el relevo no salte.
3. **Monta el HTML**: el elemento a revelar con `position: relative`; para el zoom, un contenedor con un único hijo que
   tenga **la misma proporción que la imagen** (`aspect-ratio`) para que las fracciones del objetivo sean fracciones de
   la imagen. Las secciones con `overflow: clip`, no `hidden` (`hidden` en un antepasado rompe `position: sticky`).
4. **Engánchalo al scroll** (GSAP + ScrollTrigger con `scrub`, o tu propio cálculo):
   ```js
   import { crearZoomA } from './revelados.js';
   const zoom = crearZoomA(document.querySelector('.estanteria'), {
     objetivo: { x: 0.69, y: 0.38, ancho: 0.125, alto: 0.24 },   // fracciones de la imagen
     relevo: document.querySelector('.detalle'), marco: document.querySelector('#tienda'),
   });
   ScrollTrigger.create({ trigger: '#tienda', start: 'top top', end: '+=200%', pin: true, scrub: true,
     onUpdate: (st) => zoom.progreso(st.progress) });
   ```
   Sin GSAP: `alEntrar(el, crearRejilla(el), { duracion: 1100 })`.
5. **Comprueba** con `../new-era/scripts/verificar-scroll.mjs` y a mano: reduced-motion, móvil, sin saltos al
   redimensionar. La prueba de referencia es `pruebas/revelados-rastro/` del repositorio (comprueba píxeles en cada punto del recorrido).

Más patrones (tarjeta a pantalla completa, View Transitions, CSS ligado al scroll, texto entre capas) en
[references/patrones.md](references/patrones.md).

## Reglas
- **La cortina tapa el cambio, no lo hace**: cambia el contenido en `alCubrir` (cuando el panel cubre todo) y nunca a la
  vista.
- **Zoom con escala logarítmica**: lineal se percibe como un acelerón al final. El motor ya lo hace; si lo haces a mano,
  `s = sFin^k`.
- **La rejilla tapa con un color, no con transparencia**: las celdas son del `color` que le pases. Si la foto no llega al
  borde con ese mismo color (viñeta, fondo algo distinto al de la página), se ve el rectángulo mientras se abre: usa el
  color del borde de la foto o recorta la foto a su caja.
- **Nada de medir en cada fotograma**: el motor mide al empezar y al cambiar el tamaño de la ventana. No leas
  `getBoundingClientRect` dentro de `onUpdate`.
- **Titulares con marcado** (`<em>`, enlaces): `crearLineas` trabaja con texto plano; para marcado usa SplitText de GSAP
  (gratis desde 3.13) con `mask: 'lines'`.
- **Reduced-motion**: rejilla y líneas visibles desde el principio, cortina que cambia la escena sin enseñar el panel,
  zoom por corte en la mitad. No lo quites: es parte de la accesibilidad mínima.

## Checklist
- [ ] Un efecto por sección; el texto importante es HTML (no está dentro de la imagen).
- [ ] Imágenes con `width`/`height` o `aspect-ratio` (sin saltos de maquetación) y decodificadas antes de animar.
- [ ] Zoom: el objetivo cabe con margen en móvil vertical (prueba a 390×844) y el relevo no salta de color ni de encuadre.
- [ ] Solo `transform`, `opacity` y `clip-path`; nada de `width`, `top` o `filter: blur` animados en pantalla completa.
- [ ] Reduced-motion probado; 0 errores de consola; `destruir()` llamado al desmontar (SPA).
