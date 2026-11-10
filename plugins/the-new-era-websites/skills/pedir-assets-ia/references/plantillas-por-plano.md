# Plantillas de prompt por tipo de plano (imagen clave + vídeo)

Prompts en inglés (los modelos rinden mejor). `[corchetes]` = rellenar. Cada plano trae: **imagen clave** (inicio), **imagen
final** si hace falta, **vídeo** entre ambas, qué va **por código** y el **coste** orientativo de una tirada
(precios en [proveedores.md](proveedores.md); cálculo con `scripts/presupuesto.mjs`).

Estado de validación: las plantillas siguen reglas comprobadas, pero no todas se han validado con una generación real modelo
a modelo. Trata el primer clip como la prueba.

## 0. Bloques comunes

### Realismo (añádelo a toda imagen clave de escena)
```
Real editorial photograph, shot on a full-frame camera with a [35mm] lens at [f/4], natural perspective, [eye level / slightly
above]. Composition off-center on the rule of thirds, [foreground element] softly out of focus at the edge of the frame.
Every light has a visible or logical source: [window daylight from the left / a warm table lamp]. Real materials with small
imperfections: subtle dust, faint fingerprints on glass, slight wear on edges, fabric wrinkles. Faint natural reflections of
the room on glass and screens. True-to-life colors, mild film grain, no people.
```
Producto aislado en estudio: usa los preámbulos de estudio de `video-ia-para-scroll/references/plantillas-prompt.md`.

### Lo que hace que se note IA, y cómo pedirlo en positivo
| Delator | No pidas | Pide |
|---|---|---|
| Brillo de IA, HDR, halo | "hyperrealistic, 8k, ultra detailed, masterpiece, perfect, stunning" | cámara, objetivo, diafragma y "mild film grain, natural contrast" |
| Cristal perfecto | ni "perfect glass" ni "no reflections" (sin reflejo parece un fondo pintado) | "faint natural reflections on the glass, slight haze" |
| Composición de stock | "symmetrical, centered, perfectly horizontal, facing the camera head-on" | "off-center, three-quarter view, slightly above" |
| Todo nuevo y limpio | "clean, spotless, pristine" | "lived-in, small imperfections, used" |
| Luz sin fuente | "glowing, magical light, from an unseen lamp" | la fuente concreta y visible |
| Escena-cliché | adjetivos sociales ("successful 19-year-old", "luxury", "humble") | referencias de interiorismo y materiales ("travertine, walnut, bronze, 3.5 m ceilings, Architectural Digest editorial") |
| Manos y caras | manos en primer plano, gente | fuera de cuadro; si hace falta, un plano corto y de lejos |
| Texto inventado | letras, logos, pantallas con contenido | superficies "plain, blank, empty" y el texto por código (`seguir-pantalla`) |
| Cámara caótica | "dynamic, epic, fast, cinematic camera" | UN movimiento, "slow, steady, constant speed" |
| Fondo que hierve | ciudad entera en movimiento, follaje denso a contraluz | exterior quieto o desenfocado; la vida del exterior por código (capa de vídeo o partículas) |

### Negativos (en modelos que los aceptan: Wan, Seedance, Qwen, Flux; Kling y Veo no: pon "Keep…" en el prompt)
```
Negative (imagen): text, letters, words, logo, watermark, brand names, people, hands, CGI, 3d render look, plastic, oversaturated,
HDR halo, bloom, lens flare, fisheye, warped perspective, bent lines, melted objects, extra objects, clutter
Negative (vídeo): cuts, scene change, camera shake, handheld, jitter, speed ramp, zoom pumping, morphing, warping, melting edges,
shape change, flicker, light changes, new objects, text, garbled letters, logo distortion, people, hands
```

### Estabilidad (al final de todo prompt de vídeo)
```
Everything stays rigid and physically stable: [the furniture, the laptop, the product] keep their exact shape, size, position
and colors. Constant speed from the first frame to the last, no cuts, no rotation beyond the described move, no camera shake.
```

---

## 1. Zoom a una pantalla (estudio, agencia, app, SaaS)
**Assets:** imagen clave (escena con el dispositivo en pantalla blanca), imagen final (otra toma más cerca), vídeo entre ambas.
**Por código:** la web/app real en la pantalla (`seguir-pantalla`), la entrada final a pantalla completa (≤ 1 s), textos.

Imagen clave:
```
[Realismo]. A [modern design studio in a Chelsea loft, 3.5 m ceilings, steel windows, oak floor]. A [walnut] desk in the right
third of the frame, seen at a three-quarter angle from slightly above; on it an open [14-inch silver laptop] with real
proportions, thin black bezels, the screen tilted back about 105°, the display flat, evenly lit plain white and empty. All four
corners of the screen fully visible. [Next to it: a ceramic mug, a closed notebook]. [City/garden] visible through the window,
slightly out of focus.
```
Imagen final (edición de la clave, misma semilla):
```
Show this exact same scene from a camera that has physically moved [1.5 m] forward and slightly to the right, now at desk height,
[50mm] lens at f/2.8: the laptop fills about [60]% of the frame width, all four screen corners still visible, the background
falls out of focus with real parallax (window frame and plants shift relative to the laptop). Keep every object, material,
color and the blank white screen exactly the same.
```
Vídeo (inicio y fin):
```
A slow, steady dolly-in toward the laptop on the desk, the camera physically travels forward through the room with natural
parallax: foreground objects pass the frame edge, the background gently defocuses. Ends exactly on the last frame. The screen
stays plain white. [Estabilidad].
```
- 4-5 s. Kling O3 pro (inicio+fin) ~0,45-0,56 $; prueba de 3 s ~0,34 $.
- **Nunca** pidas como final un recorte ampliado de la misma foto: interpola un zoom plano, sin paralaje, y se nota.
- La pantalla blanca (o del color de fondo de la web) facilita seguirla y que la captura tape todo.

## 2. Producto que gira (o arco alrededor)
**Antes de pedirlo:** si el producto lleva **texto o etiqueta que se tiene que leer al girar**, el vídeo IA lo deformará:
usa `envase-giratorio` (lata/botella, canvas) o `escena-3d-gltf` (modelo 3D). El vídeo sirve para productos sin texto o con la
marca pequeña que se pueda tapar o seguir por código, y para arcos cortos (≤ 90°).

Imagen clave (producto real como referencia, edición):
```
Studio product photograph of [the product in the reference image], exact same shape, proportions, colors and label as the
reference. Centered, occupying [45]% of the frame height, [three-quarter front view], on a seamless [warm grey] background
that matches hex [#cfc8bd], soft key light from the upper left, gentle rim light, soft contact shadow under the product.
85mm lens, f/8, everything sharp.
```
Vídeo:
```
The camera orbits [90] degrees to the right around the [product] at a slow constant speed, the product stays centered and
the same size, the background stays plain [warm grey]. Studio light fixed in the room, so highlights glide naturally across
the [glass/metal]. [Estabilidad].
```
- 5 s, Kling O3 pro ~0,56 $ (prueba de 3 s: ~0,34 $). Para 360° en bucle, imagen de inicio = fin (sección 14); algunos
  modelos devuelven entonces un clip casi quieto: comprueba que el giro existe.
- Para scroll: un giro de 90-180° en 5 s se ve mejor que 360° (más fotogramas por grado = más nitidez al arrastrar).

## 3. Entrada a una escena (por una puerta, ventana, entre árboles, "dentro" del producto)
**Assets:** imagen clave (fuera), imagen final (dentro, generada como edición manteniendo estilo), vídeo de entrada.
**Por código:** título que se abre al cruzar el umbral, textos por fase; el interior final puede ser imagen fija con movimiento por código.

Clave exterior:
```
[Realismo]. [Facade of a whitewashed Mediterranean house at golden hour], a [wooden double door] half open in the center-left
third, warm interior light visible through the gap, [olive tree] in the foreground right slightly out of focus. 24mm lens, eye level.
```
Final interior (edición de la clave):
```
Show the interior space behind that door in the same light and style: [a vaulted living room with lime-washed walls, linen
sofa, terracotta floor], camera at eye level just past the threshold, 24mm, the door frame edges still visible at the left and
right borders of the frame. Same color grade, same time of day.
```
Vídeo:
```
One continuous slow dolly-in through the half-open door into the room, constant speed, the door frame passes the edges of
the frame, the light changes naturally from outdoor golden hour to the warm interior. Ends exactly on the last frame. [Estabilidad].
```
- 5-6 s. Kling O3 pro ~0,56-0,67 $. Las líneas rectas de arquitectura tiemblan en vídeo: corto, cámara lenta, 1080p.

## 4. Capas con fondo separado (parallax de verdad, producto que flota)
No es un vídeo: son **imágenes** que el código mueve a distinta velocidad (`parallax-capas`). Orden "plate-first":
1. **Fondo / escena vacía** (lo que se ve detrás):
   ```
   [Realismo]. [Empty marble kitchen counter by a window, morning light from the left], nothing on the counter, the center of the
   counter empty and in focus, background softly out of focus. Leave clear empty space in the [center] for a product.
   ```
2. **Producto aislado** (edición con la referencia real, fondo liso del color del fondo o verde/blanco para recortar):
   ```
   [The product in the reference], same shape, label and colors, photographed in the same light as the scene: soft daylight
   from the left, same color temperature, same camera height and angle ([slightly above, 35mm]). Plain [white] background.
   ```
   Recorte con `capas-alfa` (`alfa.mjs --modo croma --recortar`, o `--modo blanco` sobre blanco; sin Python), o con
   alfa nativo del modelo (sección 10).
3. **Sombra:** la del producto real sobre la escena (`parallax-capas/scripts/capas-sombra.mjs`) o pedida en la edición
   "place the product on the counter" y separada después.
4. **Primer plano** (hojas, ingredientes, migas) en 2-3 tamaños, recortados con `capas-alfa`.
- Coste: 4-6 imágenes × 0,04-0,15 $ ≈ 0,3-0,9 $. Lo más barato y lo que mejor aguanta el scroll.

## 5. Mismo encuadre, cambio de estado (día → noche, crudo → dorado, obra → terminado, antes → después)
- **Primero la imagen A, luego B como edición de A** con "keep the composition, camera and every object exactly in place".
  Las ediciones mueven píxeles (hasta ~30 px): compruébalo superponiendo al 50 % y re-mide esquinas si hay pantalla.
- Si el cambio es **solo de luz o color**, no hagas vídeo: fundido por código entre A y B (gratis, sin artefactos).
- Si hay cambio físico (se dora, florece), vídeo con inicio A y fin B, cámara fija:
  ```
  Locked-off camera, nothing moves except [the croissant slowly turning from pale to deep golden brown as it bakes]. Same
  framing from first to last frame. [Estabilidad].
  ```
Noche como edición (lo que funcionó):
```
Relight this exact photograph as if it was taken at [1 a.m.] on a clear night. Keep the composition, the camera, the
perspective and every object exactly in place with the same shapes. No sunlight anywhere. [Sky deep navy; city as dark
silhouettes dotted with lit windows]. Inside, light only from [the desk lamp and the floor lamp] (visible, switched on). The
screen stays a flat evenly glowing plain white rectangle. Faint reflections of the lamps on the window glass. Natural,
low-contrast night photograph, subtle grain, no HDR.
```
(Si no se dice la hora de noche cerrada, sale un atardecer HDR. Comprueba que las lámparas encendidas/apagadas cumplen.)

## 6. Sujeto que cambia de estado con cámara fija (se abre, se parte, florece, se despieza)
```
Locked-off camera, [the peony] centered occupying [50]% of the frame, plain [blush pink] background matching hex [#f3dede].
[The closed bud slowly opens petal by petal, revealing the jar inside]. Slow, continuous, constant pace, ends exactly on the last frame.
[Estabilidad].
```
- Imagen final generada antes como foto (estado final) → el modelo solo interpola. 5 s, ~0,56 $ (Kling O3 pro).
- Física: partículas, migas o líquidos que "se congelan" delatan. Pide "every crumb keeps falling with gravity" o quítalas.

## 7. Transición entre escenas
- **Encadenar por fotograma:** el último fotograma real del clip A (`ffmpeg -sseof -0.05 -i a.mp4 -frames:v 1 a-ultimo.png`) es
  el inicio del clip B. Si B cambia de lugar, **edita** ese fotograma manteniendo el sujeto ancla en su sitio y tamaño:
  ```
  Keep [the drop of serum] exactly in the same position and size in the frame. Replace everything around it: now it rests on
  [human skin with natural pores, soft daylight]. Same camera, same focus.
  ```
- **Transición física dentro del plano:** A acaba con algo saliendo por un borde (granos que caen), B empieza con eso entrando
  por el opuesto; o "a wave of coffee sweeps across and fills the whole frame" al final de A.
- **Cortina** cuando no hay puente: tarjeta de texto sobre el color de la sección, fundido a blanco o niebla, barrido de
  color. Gratis y por código: `revelados-y-transiciones` (`crearCortina`, el cambio de escena en `alCubrir`).
- Detalle en [continuidad.md](continuidad.md).

## 8. Descenso aéreo (nubes → ciudad → edificio)
- Ubicación real → `mapa-zoom-ubicacion` (ortofoto, gratis y exacto): mapa vivo o niveles de imagen (`mapa-imagen.js`,
  sección 15). La IA solo para nubes o el final cercano.
- ```
  Aerial drone shot descending slowly through a sea of morning clouds, the clouds part to reveal [a coastal town with
  whitewashed houses] seen obliquely from 300 m, soft haze, constant slow descent, no rotation. [Estabilidad].
  ```
- 4-6 s (5 por defecto), ~0,45-0,67 $; 8 s solo en Veo cuando hace falta el fotograma final, y se recorta. Por tramos encadenados mejor que uno largo.

## 9. Interior o arquitectura fija (el más barato y el más creíble)
- **Imagen** (no vídeo): verticales rectas, hora dorada o día suave, 24mm, cámara a 1,5 m.
- El movimiento lo pone el código: zoom lento o zoom a un punto (`crearZoomA`), máscara en arco o rejilla
  (`revelados-y-transiciones`), parallax entre 2-3 capas (`parallax-capas`), cambio día/noche por fundido.
- 0,04-0,15 $ por imagen. Úsalo para todo lo que no necesite que la cámara se mueva de verdad.

---
Las secciones 10-16 son assets **para componer** (aislados, con alfa, en capas, por frames). Qué medio elegir para cada
elemento: [matriz-medio-por-elemento.md](matriz-medio-por-elemento.md). Cómo sacar el alfa y montarlos: skill `capas-alfa`.

## 10. Foto aislada sobre fondo neutro (producto, objeto, ingrediente)
**Antes de pedirlo:** si el modelo da alfa nativo (gpt-image-1.5/2.5 `background: "transparent"`, Ideogram 3 Transparent,
Seedream 5 Flash), pídelo así y **no describas ningún fondo**. Si no, fondo liso elegido para recortar: verde o magenta si el
sujeto no tiene ese color; blanco para objetos oscuros; negro para lo luminoso o metálico brillante.
```
Studio product photograph of [the product in the reference image], exact same shape, proportions, colors and label.
[Three-quarter front view, slightly above], occupying [70]% of the frame height, fully inside the frame with clear margin on
every side. Plain seamless [chroma green #00b140] background, evenly lit, no gradient, no shadow on the background, no
reflections of the background color on the product. Soft key light from the upper left, gentle rim light. 85mm, f/8,
everything sharp.
```
- **Salida:** PNG 2048 px de lado largo → `alfa.mjs --modo croma --recortar` → WebP con alfa (≤ 250 KB a 1200 px).
- **Coste:** 0,02-0,08 $ la imagen + recorte 0,006-0,018 $ si hace falta API (con `alfa.mjs`, 0 $).
- Sombra: no la pidas en el fondo de color (se pierde al recortar); hazla por código o con `capas-sombra.mjs`.

## 11. Splash o momento congelado (líquido, polvo, granos), quieto
**Antes de pedirlo:** quieto = **foto**. El movimiento lo pone el código (parallax, escala, máscara). Solo si el líquido
tiene que caer o girar de verdad, sección 13.
```
High-speed studio photograph frozen at 1/8000 s: [a crown splash of orange juice rising around the bottle], droplets sharp
and separated, realistic surface tension and thin translucent sheets of liquid, a few stray droplets. Plain pure black
background (RGB 0,0,0), no grey lift, no vignette, no smoke. Strobe light from the left and behind, so the liquid glows at
the edges. 100mm macro, f/11.
```
- Líquido transparente o cristal: **la misma imagen sobre negro y sobre blanco** (edición "only change the background to pure
  white, keep every droplet exactly in place") → `alfa.mjs --modo diferencia` da el alfa exacto de lo semitransparente.
- **Salida:** WebP/PNG con alfa de 1600-2400 px; capa encima o detrás del producto (`capas-alfa`, `componer-capas.md`).
- **Coste:** 2 imágenes (negro + blanco) 0,05-0,15 $.

## 12. Objeto en capas (despiece, partes separadas, primer plano / sujeto / fondo)
**Antes de pedirlo:** si las capas son **planos de profundidad** de una misma foto (fondo, sujeto, primer plano), pide una
sola foto y sepárala: Qwen-Image-Layered (1-10 capas RGBA, ~0,05 $) o recortes con máscara. Si son **piezas de un objeto**
(despiece), genera el estado despiezado como foto y cada pieza aislada como edición:
```
Exploded view of [the product in the reference]: the [cap, pump, bottle and inner tube] separated vertically along one axis
with [8]% of the frame height between parts, every part keeps its exact shape, color and scale, nothing new added.
Centered, plain [warm grey #d8d2c8] background, soft studio light from the upper left, 85mm, f/11.
```
Después, una edición por pieza: "Keep only the [cap], exactly as it is, same position and size; everything else becomes
plain [chroma green]".
- **Salida:** un PNG/WebP con alfa por capa, **todas con el mismo lienzo** (mismo ancho y alto, la pieza en su sitio): así el
  código las monta con `left: 0; top: 0` y las mueve con el scroll sin recolocarlas.
- **Coste:** 1 foto + 1 edición por capa: 4 capas ≈ 0,2-0,5 $.
- La coherencia del despiece se revisa en la foto (si la foto es incoherente, todo lo demás también).

## 13. Vídeo para recortar (líquido, humo, chispas, tela) con fondo de color o negro
**Antes de pedirlo:** ningún modelo comercial de vídeo (Kling, Veo, Seedance, Runway, Luma) da alfa. Opciones: Wan-Alpha
(alfa nativo, 832×480, solo texto a vídeo) o Firefly con "transparent background"; si no, fondo para recortar:
- **luminoso** (fuego, chispas, humo claro, luz): negro puro → `alfa.mjs --modo negro`;
- **opaco con bordes nítidos** (tela, objeto que cae): verde o magenta → `--modo croma`;
- **líquido o humo oscuro**: fondo de color + recorte por fotograma con API (BiRefNet vídeo ~0,0008 $/s de cómputo).
Imagen de inicio **ya sobre ese fondo** (sección 10 u 11) y:
```
Locked-off camera. [The orange juice splashes up around the bottle and falls back with gravity], slow motion, physically
plausible, the bottle stays rigid and in place. The background stays plain [pure black RGB 0,0,0 / chroma green #00b140],
evenly lit, unchanged in every frame: no gradient, no vignette, no smoke or haze on the background. [Estabilidad].
```
- **Salida:** `alfa.mjs` → `apilado.mp4` (stacked alpha, todos los navegadores, con `video-alfa.js`) para bucles; frames WebP
  con alfa para scroll. 3-5 s, 24 fps, 720-1080 px de lado largo.
- **Coste:** 4-5 s 0,25-0,56 $ (Veo 3.1 Lite a 4 s y solo con imagen de inicio, Kling 3.0, Wan 2.7) + recorte 0 $ con `alfa.mjs`.
- Revisa la esquina: si el fondo no es uniforme (gris, degradado), el recorte deja un rectángulo. `alfa.json` lo avisa.

## 14. Giro de 360° por frames
**Antes de pedirlo:** etiqueta o texto que se tenga que leer al girar → **no es vídeo**: `envase-giratorio` (lata o botella)
o 3D (`escena-3d-gltf`; el modelo se puede generar desde fotos con TRELLIS 2, 0,25-0,35 $, o Hunyuan3D v3, desde 0,225 $,
y renderizar los frames). Vídeo solo para objetos sin texto, y **nunca giro y zoom a la vez**.
```
The [product] rotates 360 degrees on its vertical axis at a perfectly constant speed on a turntable, camera locked-off,
same distance and height, the product stays centered and the same size. Plain [warm grey #cfc8bd] background, studio light
fixed in the room. Seamless loop: the last frame matches the first. [Estabilidad].
```
- Inicio = fin = la misma foto (sección 2). Aviso: con inicio = fin algunos modelos devuelven un clip casi quieto; comprueba
  el giro en la hoja de fotogramas antes de darlo por bueno. La cara trasera la inventa el modelo: si existe una foto de la trasera, dásela
  como referencia (Kling Elements) o descarta el vídeo.
- **Salida:** 90-120 frames (3-4° por frame) en escritorio y 60-90 en móvil con `scroll-frames` (`extraer-frames.mjs`),
  WebP 1600 px escritorio / 900 px móvil (menos si el objeto no ocupa la pantalla); con alfa si va
  sobre la web (sección 13 + `alfa.mjs`).
- **Coste:** 5 s ~0,42-0,56 $ (Kling 3.0); 3D generado + render: 0,25-0,35 $ y sin texto deformado.

## 15. Mapa cenital o isométrico
**Antes de pedirlo:** un mapa de un sitio real **no se genera**: la IA inventa calles. Se parte de la ortofoto real
(PNOA, USGS…) por niveles y la IA solo la estiliza. Guía completa: `mapa-zoom-ubicacion/references/mapa-por-imagenes.md`.
```
Restyle this aerial photo as [a soft architectural illustration with warm paper tones / a clay model / a night map with warm
street lights], top-down view. Keep every street, block, building footprint, park and coastline exactly where it is. Do not
add, remove or move anything. No text, no labels, no icons.
```
- Mismo prompt y la primera imagen aprobada como referencia de estilo para los demás niveles; comprueba que alinean.
- Isométrico: desde un render 3D propio (MapLibre con edificios extruidos inclinado, o three.js), estilizado igual.
- **Salida:** 3-5 niveles WebP de 2048-2560 px (los profundos, 4:5 para móvil), marcadores y nombres por código.
- **Coste:** 0,03-0,08 $ por nivel; un clip entre dos vistas (inicio y fin con `fotograma()`), 0,25-0,45 $.

## 16. Fondos de ambiente (cielo, agua, niebla, luz que entra, textura que respira)
**Antes de pedirlo:** muchos fondos son **código**: degradados animados, ruido en un shader, grano, una foto con un zoom muy
lento. Vídeo solo si el movimiento natural es el protagonista (nubes que pasan, agua, cortinas al viento).
```
Locked-off camera, [soft morning clouds drifting slowly from left to right over a pale sky], very slow, calm, continuous
motion, no camera move, no birds, no planes, no sun flare. Low contrast, muted colors that match [#e9e4da]. Seamless loop:
the last frame matches the first. [Estabilidad].
```
- Con inicio = fin (la misma foto) para que haga bucle; si el modelo no lo respeta, fundido cruzado de 0,5 s en el bucle.
- **Salida:** MP4 H.264 sin audio, 1280-1920 px, 6-10 s, crf 26-30, **≤ 1,5 MB**; `muted playsinline loop`, póster WebP, pausa
  fuera de vista. En móvil, el póster.
- **Coste:** 5 s 0,25-0,56 $. Un fondo por web; si hay dos, el segundo, por código.

## Coherencia de un lote (todas las imágenes de una web)
- **Una imagen base** aprobada (la clave del tramo principal) y todo lo demás como **edición o con ella de referencia**.
- **Un párrafo de estilo** fijo (luz, hora, cámara, color, grano) que se pega igual en todos los prompts; solo cambia la acción.
- **Referencias con papel**: hasta ~6 por petición en Nano Banana (rinde peor con más), diciendo para qué es cada una
  ("image 1: the product; image 2: the lighting and color; image 3: the background"). En Kling, Element Library con el
  objeto desde varios ángulos.
- **Mismo modelo y semilla** para variantes de una misma pieza; apúntalos en `plan.json`.
- **Comprueba el lote junto**: una hoja con todas las piezas (`lote-imagenes.mjs hoja` de la skill `recursos-imagen-ia`) antes de montar. Lo que
  desentona en la hoja, desentona en la web.

## Formato de salida (lo que se pide y lo que se sirve)
| Asset | Pedir | Servir |
|---|---|---|
| Foto de escena | 2048-2752 px de lado largo, PNG | WebP/AVIF 1600-2400 px, ≤ 300 KB; `srcset` con 1200 para móvil |
| Foto aislada / capa | PNG con alfa o fondo liso, 2048 px | WebP con alfa recortado a su caja, ≤ 250 KB |
| Vídeo para frames (scroll) | 1080p, 24 fps, sin audio, 4-6 s | WebP por frame, 1600 px y 90-150 frames escritorio / 900 px y 60-90 frames móvil |
| Vídeo en bucle | 1080p, 24 fps, sin audio | MP4 H.264 crf 26-30, ≤ 1,5 MB, póster |
| Vídeo con alfa | Fondo liso, 720-1080p | `apilado.mp4` (stacked alpha) + póster; frames WebP con alfa para scroll |
| Mapa por niveles | Ortofoto por WMS, 2048-2560 px por nivel | WebP calidad 70-80, ≤ 900 KB por nivel |

## Adaptar al modelo
- **Kling:** sin negative prompt → la estabilidad va en positivo. Inicio y fin (`first/last frame`). Respeta muy bien el final.
- **Veo:** prompts largos y descriptivos; el final solo en clips de 8 s (y no en todos los modos). Muy bueno con luz y materiales.
- **Seedance:** movimiento de cámara más "de cine" y paralaje real; más caro a 1080p; texto y finos "hierven" a 480-720p.
- **Runway / Luma:** describen bien la cámara; Luma tiene modo bucle.
- **Wan:** barato, admite negativo; a veces ignora la trayectoria y rompe el texto; revisa fps (puede salir a 30) y audio.
- **Imagen (Midjourney, Flux, Nano Banana, GPT Image, Qwen, Seedream):** la misma descripción; para editar manteniendo encuadre
  (finales, día/noche, variantes) usa los que editan con referencia (Nano Banana 2.1 / Pro, Flux 3 / Flux 2 pro, Qwen Image 3, GPT Image 2 / 2.5, Seedream 5).
  Midjourney da estética pero edita peor y no tiene API oficial.
