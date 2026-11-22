# Módulo: scroll inmersivo y frames

La web como recorrido: escenas fijadas largas, secuencias de imágenes ligadas al scroll (frames de vídeo IA, de un
render o dibujadas por código) y vídeo cuya reproducción sigue al visitante.

## Se activa cuando
- La idea es **un recorrido** que el visitante controla con el scroll: entrar, atravesar, transformar, montar.
- Hay una **secuencia** que tiene que avanzar y retroceder con el dedo (un vídeo IA, un render, una animación por
  código convertida a frames).
- La intensidad es **3** y el momento estrella es una escena fijada que dura varias pantallas.
- El módulo Vídeo con IA está activo y el vídeo va ligado al scroll (no solo en bucle).

## No hace falta cuando
- Las secciones se leen una tras otra y el movimiento es de entrada (revelados, titulares por líneas, cortinas):
  eso es la base (`revelados-y-transiciones`).
- El vídeo es solo un fondo en bucle con autoplay: basta la receta de `video-ia-para-scroll/references/montaje-web.md`.

## Skills que se cargan
`scroll-frames` (extraer frames, `frame-scrubber.js`, `video-scrubber.js`, rendimiento) · `video-desde-html`
(secuencias y bucles renderizados por código, sin modelo de IA) · `gsap-skills:gsap-scrolltrigger` y
`gsap-skills:gsap-timeline` (escenas fijadas y líneas de tiempo a medida) · `nateherk-design:scroll-craft` si está
instalada (ideas de escenas por scroll; ver CREDITOS.md del repositorio).

## Técnicas
| Quiero… | Técnica | Skill |
|---|---|---|
| Una secuencia que avanza y retrocede con el scroll (de un vídeo IA o de un render) | Frames WebP en canvas con ventana LRU, o vídeo recodificado con `currentTime` | `scroll-frames` |
| Fondo en movimiento o secuencia de scroll que se puede dibujar por código (formas, tipografía, shader, 3D) | Bucle sin corte o secuencia renderizada, sin modelo de IA | `video-desde-html` → `scroll-frames` / `capas-alfa` |
| Una escena que se queda fija varias pantallas mientras pasa algo (capítulos, HUD, datos que cambian) | Sección fijada con su línea de tiempo | `gsap-skills:gsap-scrolltrigger` + `gsap-skills:gsap-timeline` |
| Un vídeo de la web para redes o el portfolio (el hero, el momento estrella en vertical) | Composición HTML renderizada fotograma a fotograma | `video-desde-html` (vale también sin el módulo activo, en la entrega) |

Catálogo: sección **B** (vídeo y secuencias de frames) de [../catalogo-tecnicas.md](../catalogo-tecnicas.md); la
**A** (scroll y ritmo) es de la base.

## Activos y coste
- Frames de vídeo IA: del módulo Vídeo con IA. Frames por código o render (three.js, HyperFrames): 0 $ en generación.
- Presupuesto de frames y peso: `scroll-frames/references/rendimiento.md` (90-150 frames en escritorio, 60-90 en móvil,
  ≤ 8 MB / ≤ 4 MB).

## Construir
- Plantilla: `--con frames` (y `video` si se usa el scrubber de vídeo).
- Frames: `scroll-frames/scripts/extraer-frames.mjs` (WebP, manifest, variante móvil; `--video-scrub` para el
  vídeo recodificado con GOP 8 sin B-frames).
- El primer frame es el póster vivo y va antes que nada; el resto, en orden progresivo.

## Verificar (además de la base)
- Scroll rápido arriba y abajo sin huecos ni frames que se queden atrás; en móvil, con la toma o el recorte vertical.
- Memoria en móvil: la ventana de frames decodificados no pasa de lo que dice `rendimiento.md`.
- `prefers-reduced-motion`: la escena muestra su mejor fotograma y el texto sigue legible; nada fijado durante
  pantallas sin contenido.
- `verificar-scroll.mjs` con `--tramos` en las secciones fijadas.
