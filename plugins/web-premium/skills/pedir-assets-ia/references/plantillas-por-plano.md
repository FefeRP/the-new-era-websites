# Plantillas de prompt por tipo de plano (imagen clave + vídeo)

Prompts en inglés (los modelos rinden mejor). `[corchetes]` = rellenar. Cada plano trae: **imagen clave** (inicio), **imagen
final** si hace falta, **vídeo** entre ambas, qué va **por código** y el **coste** orientativo de una tirada
(precios en [proveedores.md](proveedores.md); cálculo con `scripts/presupuesto.mjs`).

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
- 5 s, Kling O3 pro ~0,56 $ (prueba de 3 s: ~0,34 $). Para 360° en bucle, imagen de inicio = fin.
- Para scroll: un giro de 90-180° en 5 s se ve mejor que 360° (menos fotogramas por grado = más nitidez al arrastrar).

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
3. **Sombra:** la del producto real sobre la escena (`parallax-capas/scripts/capas-sombra.mjs`) o pedida en la edición
   "place the product on the counter" y separada después.
4. **Primer plano** (hojas, ingredientes, migas) en 2-3 tamaños, recortados.
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
- **Cortina** cuando no hay puente: tarjeta de texto sobre el color de la sección, fundido a blanco o niebla, barrido con
  desenfoque. Gratis y por código.
- Detalle en [continuidad.md](continuidad.md).

## 8. Descenso aéreo (nubes → ciudad → edificio)
- Ubicación real → `mapa-zoom-ubicacion` (ortofoto, gratis y exacto). La IA solo para nubes o el final cercano.
- ```
  Aerial drone shot descending slowly through a sea of morning clouds, the clouds part to reveal [a coastal town with
  whitewashed houses] seen obliquely from 300 m, soft haze, constant slow descent, no rotation. [Estabilidad].
  ```
- 5-8 s, ~0,56-0,90 $. Por tramos encadenados mejor que uno largo.

## 9. Interior o arquitectura fija (el más barato y el más creíble)
- **Imagen** (no vídeo): verticales rectas, hora dorada o día suave, 24mm, cámara a 1,5 m.
- El movimiento lo pone el código: zoom lento, máscara en arco, parallax entre 2-3 capas (`parallax-capas`), cambio día/noche por fundido.
- 0,04-0,15 $ por imagen. Úsalo para todo lo que no necesite que la cámara se mueva de verdad.

## Adaptar al modelo
- **Kling:** sin negative prompt → la estabilidad va en positivo. Inicio y fin (`first/last frame`). Respeta muy bien el final.
- **Veo:** prompts largos y descriptivos; el final solo en clips de 8 s (y no en todos los modos). Muy bueno con luz y materiales.
- **Seedance:** movimiento de cámara más "de cine" y paralaje real; más caro a 1080p; texto y finos "hierven" a 480-720p.
- **Runway / Luma:** describen bien la cámara; Luma tiene modo bucle.
- **Wan:** barato, admite negativo; a veces ignora la trayectoria y rompe el texto; revisa fps (puede salir a 30) y audio.
- **Imagen (Midjourney, Flux, Nano Banana, GPT Image, Qwen, Seedream):** la misma descripción; para editar manteniendo encuadre
  (finales, día/noche, variantes) usa los que editan con referencia (Nano Banana, Flux Kontext, Qwen Edit, GPT Image, Seedream).
  Midjourney da estética pero edita peor y no tiene API oficial.
