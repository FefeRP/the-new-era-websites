# Base técnica transversal: rendimiento, accesibilidad, SEO

## Presupuestos (página completa)
| | Escritorio | Móvil |
|---|---|---|
| Primera vista (HTML+CSS+JS crítico+póster) | ≤ 400 KB | ≤ 250 KB |
| JS total (gzip) | ≤ 250 KB (sin three) · ≤ 450 KB (con three) | igual, three cargado en diferido |
| Secuencia de frames | ≤ 8 MB, 90-150 frames | ≤ 4 MB, los mismos frames a 900 px (60-90 si se extrae aparte) |
| Modelo glTF | ≤ 3 MB | ≤ 1,5 MB |
| LCP | < 2,5 s | < 2,5 s (4G) |
| CLS | < 0,05 | < 0,05 |
| Memoria de imágenes decodificadas | ≤ 400 MB | ≤ 200 MB |

## Rendimiento
- **Un solo bucle**: Lenis y todos los motores al ticker de GSAP o render bajo demanda; nada de varios `requestAnimationFrame` sueltos.
- Animar solo `transform`, `opacity`, `filter` (ligero) y `clip-path`. Nunca `top/left/width/height`.
- `will-change` solo mientras se anima. Pausar todo lo que no se ve (IntersectionObserver) y cuando la pestaña está oculta.
- Lo pesado (three, frames) se carga **cuando la sección se acerca** (`IntersectionObserver` con `rootMargin: '100% 0px'`) con un **póster** en su lugar.
- DPR del canvas limitado a 2 (1,5 en 3D en móvil).
- Imágenes: AVIF/WebP con `srcset`/`sizes`, `loading="lazy"` salvo la del hero (`fetchpriority="high"`).
- Fuentes: WOFF2, `font-display: swap`, subset, preload solo de la display del hero.
- `ScrollTrigger.refresh()` tras cargar fuentes e imágenes (la plantilla ya lo hace).
- **Un canvas no cuenta para el LCP:** si el hero es un canvas (frames, 3D, vídeo con alfa), pon debajo un `<img>` del
  fotograma 0 (o del póster) con `fetchpriority="high"`, que es lo que mide el navegador y lo que se ve mientras carga.
- **Lenis + ScrollTrigger en un bucle** (la plantilla): `lenis.on('scroll', ScrollTrigger.update)`,
  `gsap.ticker.add((t) => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`. GSAP 3.13+ es gratis con todos sus
  plugins (SplitText, ScrollSmoother, Flip, MorphSVG); su licencia solo excluye herramientas visuales sin código.
- **Peso de la transparencia:** vídeo con alfa como stacked alpha (`capas-alfa`), ~0,4-1 MB por 3-5 s; frames WebP con
  alfa pesan ~1,5-2× los opacos: resolución contenida (≤ 1280 px) y menos frames.

## Maquetación de escenas fijadas
- **`position: sticky` deja de funcionar si un antepasado tiene `overflow: hidden`** (síntoma: capturas vacías). Para
  recortar lo que sobresale usa `overflow: clip`, que no crea contenedor de scroll.
- Panel fijado a `100lvh` con la composición interior en `svh` (no `100vh`, que en móvil salta con la barra de direcciones;
  un panel a `100svh` deja una franja cuando la barra se esconde) y
  `ScrollTrigger.config({ ignoreMobileResize: true })` (la plantilla lo pone).
- **Interfaz encima del canvas:** el texto, botones y marcadores van en HTML en una capa por encima
  (`position: absolute; inset: 0; pointer-events: none` en la capa y `pointer-events: auto` solo en lo clicable). El canvas
  con `aria-hidden`. Así se lee, se traduce, se selecciona y lo indexan los buscadores.
- Animaciones sencillas ligadas al scroll sin JS (`animation-timeline: view()`): solo dentro de
  `@supports (animation-timeline: view())`, con el estado final como estilo base (Firefox aún no las tiene sin opción).

## Móvil y conexiones lentas
| Elemento | Escritorio | Móvil | Ahorro de datos o sin WebGL |
|---|---|---|---|
| Frames de scroll | 1600 px, 90-150 frames | 900 px, mismos frames (60-90 en extracción aparte), toma 9:16 si el sujeto no cabe | Póster + texto |
| Vídeo en bucle | 1080p | 720p o póster | Póster |
| Vídeo con alfa | stacked alpha | igual a menor resolución | Póster con alfa (WebP) |
| 3D | escena completa | DPR 1,5, sin sombras en tiempo real | Póster renderizado |
| Mapa vivo | MapLibre | paradas más abiertas, menos precarga | Mapa por niveles de imagen o vista final fija |
| Rastro del cursor, lente | sí | no (sin hover): composición estática | — |
`navigator.connection.saveData` (la plantilla pone la clase `ahorro-datos`) y `prefers-reduced-data` cuando exista.

## Accesibilidad
Mínimos que se cumplen siempre; la skill de diseño puede subirlos, nunca bajarlos (ver reparto-skills-diseno.md).
- `prefers-reduced-motion: reduce` → sin Lenis, sin scrub ni parallax: se muestra el póster y los textos en orden (la plantilla pone la clase `menos-movimiento`). Con GSAP, `gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', …)`: crea las animaciones solo sin la preferencia y las deshace si cambia. Los motores del marketplace ya lo respetan (revelados por corte, mapa de parada en parada, rastro desactivado, vídeo con alfa en póster).
- Todo el texto en el DOM real (no dentro del canvas ni de imágenes). El canvas lleva `aria-hidden="true"` o `role="img"` + `aria-label` si aporta información.
- Enlace "saltar al contenido", foco visible, orden de tabulación lógico; los elementos fijados no atrapan el foco.
- Contraste AA (4,5:1 texto normal) en **todas** las posiciones del scroll.
- Sonido nunca automático; interruptor accesible con `aria-pressed`.
- Arrastrar (3D) no debe bloquear el scroll vertical en táctil (`touch-action: pan-y`).

## SEO y compartir
Solo si no hay skill de SEO instalada (ver reparto-skills-diseno.md); si está `claude-seo`, manda la suya.
- `<title>`, `meta description`, `og:image` (usa el póster), `lang`, un `h1`.
- Contenido real en HTML (no generado solo por JS) para que se indexe.
- Datos estructurados (Product, LocalBusiness) cuando aplique.

## Robustez
- Sin WebGL2 → póster + texto (la escena 3D lo detecta con `hayWebGL2()`).
- `webglcontextlost` gestionado (los motores lo hacen).
- Error al cargar frames → se queda el póster, sin pantalla en blanco.
- iOS en ahorro de energía bloquea `<video>`: por eso los frames son el modo por defecto.

## Checklist final (antes de entregar)
- [ ] `verificar-scroll.mjs` sin errores de consola ni peticiones fallidas (escritorio, móvil y reduced-motion).
- [ ] Hojas de contactos revisadas: sin huecos, texto legible, momento estrella visible en móvil.
- [ ] `npm run build` limpio; pesos dentro del presupuesto (mira `dist/` y los frames).
- [ ] Con reduced-motion la página se lee completa y en orden.
- [ ] Teclado: Tab recorre todo; el foco se ve.
- [ ] Ningún antepasado de un elemento `sticky` con `overflow: hidden`; panel fijado a `100lvh` y composición interior en `svh`.
- [ ] Si el hero es un canvas, hay un `<img>` debajo para el LCP.
- [ ] Créditos y licencias de todos los activos en el pie o en CREDITOS.md.
- [ ] Revisión visual externa (Gemini) leída y sus fallos corregidos o descartados con motivo.
