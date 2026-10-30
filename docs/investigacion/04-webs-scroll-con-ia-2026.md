# Webs de scroll cinematográfico hechas con IA: stack, assets y lo que funciona (investigación 2026-10-30)

Resumen corto aparte: [04-resumen.md](04-resumen.md). Lo útil de aquí ya está volcado en las skills (`pedir-assets-ia`,
`capas-alfa`, `revelados-y-transiciones`, `rastro-cursor`, `mapa-zoom-ubicacion`, `scroll-frames`, `web-premium`).

Etiquetas: **[C]** confirmado en documentación oficial, código o API (`npm view`, `gh api`); **[P]** práctica publicada por un
tercero que la probó; **[O]** opinión o criterio propio; **[NE]** buscado y no encontrado. Precios del día de la consulta: cambian
cada mes, confírmalos antes de pedir un vale.

## 1. Lo que se ve en las webs de referencia (análisis de fotogramas, no de lo que dicen los vídeos)
Cinco vídeos nuevos (ref12-ref16, ver `docs/referencias/`) analizados a mano con fotogramas y contrastados con un modelo de
visión. El modelo atribuye casi todo a three.js; los fotogramas dicen otra cosa:

| Efecto | Técnica real | Fiabilidad |
|---|---|---|
| Estudio con fotos que entran por máscaras (ref12) | Fotos fijas con la misma luz, `clip-path` y líneas de texto con máscara | Confirmado |
| Transición de "café" que cubre la pantalla (ref13-1) | Forma plana de color: trazo SVG o máscara | Confirmado |
| Rastro de fotos tras el cursor (ref13-4) | Pool de `<img>` en el DOM | Confirmado |
| Paisaje con animales por delante del titular (ref13-7) | Una foto separada en capas, texto en medio; revelado en rejilla | Confirmado |
| Recorrido por una casa (ref13-5) | Vídeo realista partido en fotogramas | Confirmado (que sea IA: suposición) |
| Reloj que gira con palabras delante y detrás (ref13-6) | Secuencia de fotogramas + texto en capas | Suposición fuerte |
| Lata que gira en tres ejes (ref13-3) | 3D en tiempo real | Confirmado; es la pieza menos realista |
| Estantería de zapatillas que se acerca a un modelo (ref14) | Zoom 2D sobre una imagen grande con origen en el producto + relevo a otra foto | Suposición fuerte |
| Café en cuatro tiempos (ref15) | 3-4 clips de vídeo IA con el mismo fondo y la misma luz; texto y cifras por código | Confirmado |
| Escenas egipcias separadas por cortinas (ref16) | Vídeo IA encadenado o 3D con buenas texturas | Dudoso |

**Conclusión [O]:** la mayoría de efectos "imposibles" salen de fotos fijas, capas, máscaras, un zoom 2D o clips cortos con la
misma luz. El 3D en tiempo real solo aparece donde hay giro libre en varios ejes.

## 2. Stack recomendado

### Versiones (npm, 30-10-2026) [C]
gsap 3.15.0 · lenis 1.3.27 · three 0.187.0 · @react-three/fiber 9.8.2 · @lottiefiles/dotlottie-web 0.82.0 · @rive-app/canvas 2.49.0 · motion 14.9.0.

### GSAP y su licencia
- **[C]** Desde GSAP 3.13 (29-04-2025) todo es gratis, también en uso comercial: SplitText, MorphSVG, DrawSVG, ScrollSmoother, Flip
  van en el paquete `gsap`. https://gsap.com/blog/3-13/
- **[C]** La licencia estándar (30-05-2025) prohíbe usar GSAP en herramientas **visuales sin código** que compitan con el
  constructor de Webflow. https://gsap.com/standard-license/ — Un marketplace de skills que genera código no está en ese caso [O].
- **[C]** Skills oficiales de GSAP para agentes: `greensock/gsap-skills` (MIT, 8 skills: core, timeline, scrolltrigger, plugins,
  utils, react, performance, frameworks). Conviene recomendarlas en vez de repetir la API.

### Lenis + ScrollTrigger con un solo bucle [C]
Del README de Lenis 1.3.27 (https://github.com/darkroomengineering/lenis):
```js
const lenis = new Lenis();               // sin autoRaf
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
- Cargar `lenis/dist/lenis.css`; `data-lenis-prevent` para modales y zonas con scroll propio.
- `syncTouch` "can be unstable on iOS<16": dejar el táctil nativo (por defecto).

### CSS scroll-driven animations
- **[F/P]** Chrome/Edge 115+, Safari 26+ (probar en 26.5 o superior); Firefox 152 solo con flag (prioridad de Interop 2026).
  https://developer.chrome.com/docs/css-ui/scroll-driven-animations
- Uso [O]: revelados por elemento, barras de progreso y parallax suave, siempre dentro de `@supports (animation-timeline: view())`
  y con el estado final por defecto. Para pins y coreografía, GSAP.

### View Transitions
- **[C]** Dentro del mismo documento: disponible en todos los navegadores desde Firefox 144 (14-10-2025).
  https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available
- **[C]** Entre páginas (`@view-transition { navigation: auto }`): Chrome/Edge 126+ y Safari 18.2+; Firefox no.
- Uso [O]: mejora progresiva en webs multipágina; en Firefox navega sin animación.

### Three.js, Rive, Lottie, shaders
- **[F]** `three/webgpu` cae solo a WebGL2 desde r171. Para producto 3D real, cámaras y partículas. R3F solo si el proyecto ya es React.
- **[C]** Un repo público de webs con IA lo dice tal cual: "isn't Three.js — it's a canvas image-sequence scrub".
- **[F]** dotLottie ocupa ~80 % menos que el JSON de Lottie; Rive es binario y con máquina de estados. Para microinteracciones de
  UI, no para el plano estrella.
- Shaders: transiciones de imagen, ruido, distorsión con la velocidad. Tutorial MIT de Codrops (19-11-2025):
  https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/

**Regla [O]:** CSS scroll-driven para lo sencillo → GSAP + ScrollTrigger (+ Lenis) para pins y coreografía → canvas de frames o
vídeo para el plano fotorrealista → three.js solo si hay interacción 3D real → Rive/dotLottie para la UI.

## 3. Secuencias de fotogramas y vídeo ligado al scroll
- **[C]** El ejemplo clásico (CSS-Tricks, 22-05-2020) usa 148 JPG (~56 MB) para unos auriculares.
  https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/
- **[F]** Memoria en iOS: cada frame decodificado ocupa ancho × alto × 4 bytes (1920×1080 ≈ 8 MB). 150 frames decodificados son
  ~1,2 GB e iOS cierra la pestaña. Por eso, ventana de frames decodificados y `ImageBitmap.close()` en los que salen.
- **[O]** WebP calidad 70-80 (AVIF pesa menos pero decodifica más lento: peor para el scrub). Entre 60 y 150 frames; en móvil la mitad.
- **[C]** El canvas **no cuenta para el LCP**: el hero necesita un `<img>` del primer frame con `fetchpriority="high"`.
  https://web.dev/lcp
- **Vídeo con `currentTime`** en lugar de frames:
  - **[F]** Con keyframes cada 2-10 s el scrub da saltos; con `-g 1` cada seek es exacto (a 1280 px, ~8 MB MP4 frente a 1-2 MB
    normal). https://www.hontran.dev/blog/scroll-scrubbed-video-stutters-fix (09-07-2026)
  - **[P]** Con `-g 8 -keyint_min 8 -sc_threshold 0 -crf 28` la búsqueda baja de 57 a 14 ms y, en un móvil limitado, el vídeo
    pesa 4,7 veces menos que la secuencia de imágenes. https://learnwithhasan.com/guide/ai-video-scroll-animation-page/ (31-07-2026)
  - **[F]** Safari es el que mejor hace scrub de vídeo; Firefox va mejor con WebM. iOS en ahorro de energía bloquea `<video>`:
    los frames siguen siendo el modo seguro.

## 4. Transparencia: imagen y vídeo con alfa

### Imagen con alfa al generar
| Modelo | Alfa | Precio y fuente |
|---|---|---|
| gpt-image-1 / 1.5 | Sí (`background="transparent"`) [C] | https://developers.openai.com/api/docs/guides/image-prompting |
| gpt-image-2 | **Ya no**: la vista previa se retiró el 30-09-2026 [C] | https://community.openai.com/t/is-transparent-background-support-broken-in-gpt-image-2/1402707 |
| gpt-image-2.5 | Sí [C]; precio oficial no comprobado | Mismo enlace de OpenAI |
| Ideogram 3 Transparent | Sí [C] | 0,03-0,09 $ en fal |
| Seedream 5 Flash | Sí, `background: "transparent"` [C] | 0,0193 $ en Runware |
| Qwen-Image-Layered | Parte una imagen en 1-10 capas RGBA [C] | 0,05 $ en fal |
| Nano Banana, Kling Image, Seedream 4.x, Recraft | No [C/NE] | Generar sobre fondo liso y recortar |

- **[C]** Generar con alfa da mejor borde que recortar después en cristal y fibras finas, y funciona mejor **si el prompt no
  describe ningún fondo**. https://the-decoder.com/openais-gpt-image-2-can-now-generate-images-without-a-background/
- Recorte de imagen aparte (fal, 05-07-2026) [C]: Rembg Enhance 0,006 $ · Ideogram Remove BG 0,01 $ · Recraft 0,011 $ ·
  Pixelcut 0,016 $ · Bria RMBG 2.0 0,018 $. https://fal.ai/learn/tools/best-background-remover-apis-2026

### Vídeo con alfa
- **Generado ya con alfa** [C]: Wan-Alpha (832×480, 81 fotogramas, Apache 2.0, solo texto a vídeo; precio alojado [NE])
  https://huggingface.co/htdong/Wan-Alpha · Adobe Firefly Video con "Transparent background" (devuelve color y máscara aparte).
  Kling, Veo, Seedance, Runway y Luma **no** lo dan.
- **Recorte por fotograma** (fal) [C]: BiRefNet v2 vídeo 0,0008 $ por segundo de cómputo (ProRes 4444 y WebM con alfa) · BEN v2
  0,001 $/MP · VEED 0,015-0,0225 $ por 30 fotogramas · Bria v3 0,05 $/s. SAM 3 solo da máscaras duras. MatAnyone no es comercial.
- **Líquidos, humo, chispas sobre negro** [P]: pedir "pure black, no grey lift, no vignette" y comprobar que la esquina es 0,0,0
  antes de mezclar con `screen`/`add`: cualquier gris se ve como un rectángulo. https://morphic.com/es/resources/videos/ink-splatter-stock-footage
  La luminancia como alfa solo sirve para lo claro o luminoso; un líquido oscuro necesita mate de verdad [O].

### Cómo se reproduce con alfa en la web
| Opción | Navegadores | Peso del ejemplo |
|---|---|---|
| WebM VP9 + alfa | Chrome, Edge, Firefox | 1,1 MB |
| HEVC + alfa (`hvc1`) | Safari | 3,4 MB (solo se codifica en Mac) |
| **"Stacked alpha"**: color arriba, alfa abajo, compuesto en WebGL | Todos | 460 kB (AV1) |
| AVIF animado | Todos | 504 kB |

Fuente: https://jakearchibald.com/2024/video-with-transparency/ (05-08-2024) [C]. No hay ninguna fuente que diga que Safari
respete el alfa de VP9 [F]. **Conclusión [O]:** sin un Mac, el stacked alpha (H.264 normal que ffmpeg codifica en cualquier
sistema) más un shader es la única vía universal; para scrub con alfa, frames WebP con alfa a resolución contenida.

## 5. Recetas de vídeo IA publicadas
- **Plate primero** [P] (LearnWithHasan, 31-07-2026): foto fija del producto como primer fotograma; de texto a vídeo **se inventó
  otro producto**. Con el producto al 86 % del alto las piezas se separan más que al 53 %. El aspecto se fija en el ajuste, no en
  el prompt. 18 clips y 4 imágenes: 11,74 $ (1,24-1,96 $ por hero).
- **Despiece** [P] (Masonry, actualizado 17-08-2026): fotograma final despiezado con un editor de imagen; vídeo con inicio y fin y
  cámara fija (1 s quieto, 3 s separando, 1 s quieto). "If the static exploded view is incoherent, video generation will animate
  the incoherence." https://masonry.so/blog/exploded-view-animation-guide-nanobananapro-kling
- **Bucle 360** [P]: misma imagen de inicio y fin, "360° roll to original frame; seamless loop". La cara trasera la inventa el
  modelo; **nunca giro y zoom a la vez**. Para etiquetas rígidas, mejor 3D generado y renderizado: TRELLIS 2 (0,25-0,35 $) o
  Hunyuan3D v3 (desde 0,225 $) en fal [C].
- **Seedance** [P]: giros cortos (≤ 15°), "lock logo center", "do not bend, liquify, or redraw label", prompts cortos; no para un 360.
- **Parámetros en fal** [C]: Kling v3 Pro 3-15 s, `end_image`, `cfg_scale`, `elements` (@Element1), 0,112 $/s sin audio; Veo 3.1
  inicio-fin 4/6/8 s con `seed`, desde 0,20 $/s sin audio; Wan FLF2V solo 720p.
- **Consistencia** [C/P]: Kling Element Library (referencias del mismo objeto desde varios ángulos); Nano Banana Pro admite 14
  referencias pero rinde mejor con ~6; dar a cada referencia un papel (sujeto, estilo, fondo). En todas las fuentes: el mismo
  fotograma base como inicio de todas las tomas, el mismo prompt base y solo cambia la acción.
- **[NE]** No hay recetas publicadas y medidas de splash de líquido en vídeo de producto ni de zoom a pantalla.

## 6. Mapas con IA
- **[C]** Un vídeo "earth zoom" generado inventa cada capa entre la foto y la órbita (lo dicen sus propias páginas).
- **[P]** Un mapa isométrico de una ciudad entera hecho con un modelo de edición afinado (~40 pares, ~12 $) siguió necesitando
  correcciones a mano y la prensa encontró lugares inventados. Su entrada eran teselas 3D de Google, que no se pueden usar así en
  comercial. https://cannoneyed.com/projects/isometric-nyc
- **[C]** Licencias: Google Earth no se puede usar en publicidad; Google Maps Platform prohíbe usar su contenido en ML/IA (según
  un resumen; texto literal [NE]). Abiertas: PNOA (CC BY 4.0, "PNOA cedido por © Instituto Geográfico Nacional"), USGS (dominio
  público), Copernicus Sentinel ("Contains modified Copernicus Sentinel data [año]").
- **Lo seguro [O]:** los niveles de zoom salen de ortofoto real (o de una ilustración hecha sobre ella) y la IA solo estiliza o
  anima entre fotogramas reales. Los marcadores, nombres y rutas, siempre por código.

## 7. Webs de scroll hechas con agentes (Claude Code y similares)
Repos comprobados con `gh api` el 30-10-2026 [C]:

| Repo | Estrellas | Qué hace |
|---|---|---|
| greensock/gsap-skills (MIT) | 17 560 | Skills oficiales de GSAP |
| darkroomengineering/lenis (MIT) | 16 978 | Scroll suave |
| oso95/scroll-world (MIT) | 10 674 | "Mundo" isométrico con escenas IA encadenadas por el último fotograma |
| nateherkai/scroll-craft (MIT) | 4 240 | Brief → gramática de página → movimiento estrella → motor fijo → capturas; activos con kie.ai |
| zubair-trabzada/scroll-cinematic-claude | 83 | Claude Code + Higgsfield MCP: imagen hero → clips → frames → canvas + Lenis (~1-2 $ por web) |

- Prompt packs publicados: "Look → Shot → Site → Binding" (imagen de estilo, vídeo de 15 s en tres tiempos, maqueta, una pantalla
  de scroll por cada 5 s) https://3d-scroll-prompts.vikataylor.com/ ; otro de pago con borrador del scroll a 480p antes de la calidad final.
- **Patrón común [O]:** imagen fija de estilo → vídeo de imagen a vídeo → ffmpeg a frames → canvas con Lenis + GSAP → capturas.
  **Lo que nadie resuelve bien en público:** el presupuesto antes de generar, la continuidad entre clips y el móvil. Ahí es donde
  este marketplace pone el foco.

## 8. Efectos concretos
- **Rastro de imágenes del cursor** [C]: pool de N `<img>` reutilizados; cada X px recorridos aparece el siguiente y se apaga.
  https://github.com/codrops/ImageTrailEffects (usa TweenMax antiguo: pasar a gsap 3).
- **Revelado en rejilla con clip-path** [C]: https://tympanus.net/codrops/2025/05/27/animated-product-grid-preview-with-gsap-clip-path/
- **Demos con los plugins gratuitos** (SplitText, MorphSVG…) [C]: https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/
- **Transiciones entre secciones** [O]: sección pinneada con `clip-path: inset(100% 0 0 0)` → `inset(0)`; cortinas con `scaleY`;
  máscaras SVG; entre páginas, View Transitions.
- **Tarjeta a pantalla completa** [O]: `Flip.fit` o escala calculada con `getBoundingClientRect`, el `border-radius` baja a 0 y el
  contenido hace un contra-zoom.
- **UI HTML sobre canvas** [O]: canvas fijo con `pointer-events: none`, HTML encima con los mismos `start`/`end`. Nunca el texto
  dentro del canvas (SEO, accesibilidad, LCP).

## 9. Accesibilidad y móvil
- `gsap.matchMedia()` con `(prefers-reduced-motion: no-preference)` para crear las animaciones (se revierten solas) [C].
  https://gsap.com/blog/3-10/ En modo reducido: sin Lenis, sin pins largos, frame clave como imagen y texto visible.
- `ScrollTrigger.config({ ignoreMobileResize: true })` para la barra de direcciones de iOS [C]. Alturas con `100svh` [O].
- Presupuesto [O]: hero ≤ 2-3 MB en móvil antes de interactuar; secuencia ≤ 8-12 MB en escritorio y la mitad en móvil.
  Respetar `navigator.connection.saveData`.
- Animar solo `transform` y `opacity` (también en CSS scroll-driven) [F].

## 10. Lo que cambia en el marketplace por esta investigación
1. Matriz de medio por elemento (foto, vídeo, capas con alfa, frames, 3D) en `pedir-assets-ia`: lo quieto es foto.
2. Skill `capas-alfa`: pedir el asset aislado, sacar el alfa (croma, luma, diferencia negro/blanco, máscara externa), stacked
   alpha + WebM VP9 + frames WebP con alfa, y un motor WebGL para reproducirlo.
3. Skill `revelados-y-transiciones` (rejilla, cortinas, zoom a producto, texto entre capas, View Transitions) y `rastro-cursor`.
4. Modo "mapa de imágenes" en `mapa-zoom-ubicacion`: niveles de zoom de imagen (ortofoto real o ilustración sobre ella) con
   marcadores por código; MapLibre sigue como alternativa en vivo.
5. Base técnica: bloque oficial Lenis + GSAP, `<img>` del frame 0 para el LCP, `gsap.matchMedia`, `ignoreMobileResize`, `saveData`.
