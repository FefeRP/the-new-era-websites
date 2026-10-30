# Recetas de assets por tipo de web

Sacadas de desmontar 16 vídeos de referencia (`docs/referencias/`). Las 7 hechas con vídeo o imagen de IA (ref1, ref4-ref8,
ref11 y ref15, el café en 3-4 clips) siguen el mismo patrón: **3-6 clips cortos** (4-8 s generados, 1-3 s de scroll cada
uno), **una imagen clave** de la que sale todo, **fondo liso del color de la sección**, **un solo movimiento de cámara** por
clip, y **todo el texto, cifras y logos por código**. Tres (ref12, ref13 en su mayoría, ref14) son **fotos y código, sin
vídeo**: revelados, capas con alfa, zoom 2D a un punto, rastro de cursor. Ref16 separa sus escenas con **cortinas**; la
técnica de las escenas está sin confirmar. Las demás (ref2, ref3, ref9, ref10) son 3D en tiempo real, motion o Figma:
sirven de guion, no de receta de prompts.

Costes con Kling O3 pro 1080p (0,112 $/s) e imagen a ~0,05-0,075 $; "peor caso" con 2 tiradas por vídeo y 3 por imagen.
Calcula el tuyo con `scripts/presupuesto.mjs`. Plantillas de prompt: [plantillas-por-plano.md](plantillas-por-plano.md) (§n).

## Cómo decidir el medio de cada asset
| Si el asset… | Medio | Por qué |
|---|---|---|
| necesita que **la cámara se mueva de verdad** por un espacio real (entrar, acercarse con paralaje, rodear sin texto) | **vídeo IA** con inicio+fin | el 3D barato no llega a ese realismo |
| es un **cambio de estado físico** (se abre, se hornea, florece, se vierte) | **vídeo IA** con cámara fija | ídem |
| es un **lugar o producto quieto** (interior, fachada, packshot, ingrediente, splash congelado) | **imagen IA** (aislada con alfa si va en capas: `capas-alfa`) + movimiento por código (zoom, parallax, máscara, `revelados-y-transiciones`) | 10-20 veces más barato y las rectas no tiemblan |
| es un **cambio de escena** sin puente físico | **código**: cortina (`crearCortina`), rejilla, fundido | gratis y exacto |
| solo cambia la **luz o el color** (día/noche, antes/después) | **2 imágenes** (edición) + fundido por código | sin artefactos, gratis el movimiento |
| lleva **texto, logo, interfaz, cifras** | **código** encima (`seguir-pantalla`, HTML, SVG) | la IA inventa letras y aplasta logos |
| **gira con texto legible** o el usuario lo manipula | **3D / canvas** (`escena-3d-gltf`, `envase-giratorio`) | el vídeo deforma la etiqueta |
| es un **lugar real concreto** visto desde el aire | **mapa real** (`mapa-zoom-ubicacion`: mapa vivo, o niveles de imagen con `mapa-imagen.js` y la ortofoto estilizada) | exacto y gratis (o céntimos si se estiliza) |
| no hay presupuesto o es un borrador | **3D / código** como respaldo | 0 $; luego se sustituye por IA |

## 1. Estudio, agencia, SaaS (zoom a la pantalla con la web del cliente)
| Tramo | Asset | Medio | § | Coste |
|---|---|---|---|---|
| Hero: la escena de trabajo | imagen clave (pantalla en blanco, escorzo, materiales reales) | imagen | 1 | 0,075 $ × 3 variantes |
| Acercamiento | imagen final (otra toma más cerca) + vídeo 5 s inicio+fin | imagen + vídeo | 1 | 0,075 + 0,56 $ |
| La web en la pantalla | captura real (aspecto de la pantalla) siguiendo las esquinas | código (`seguir-pantalla`) | — | 0 |
| Entrar en la pantalla | la capa crece a pantalla completa ≤ 1 s → web real | código | — | 0 |
| Noche (opcional) | relight de clave y final + vídeo | imagen + vídeo | 5 | 0,15 + 0,56 $ |
**Total:** solo día ~1 $ (peor ~2 $); día y noche ~2 $ (peor ~3,6 $). Prueba previa de 3 s: 0,34 $.
Lecciones reales: el final como recorte ampliado de la misma foto dio un zoom plano y falso; el logo estirado a las esquinas de
una placa de otra proporción salió aplastado; "humilde" o "de lujo" salen de adjetivos: describe arquitectura y materiales.

## 2. Producto físico (cosmética, bebida, comida, objeto)
| Tramo | Asset | Medio | § | Coste |
|---|---|---|---|---|
| Hero | imagen clave del producto (edición con la foto real, fondo del color de marca) | imagen | 2 | 0,05-0,13 $ × 3 |
| Revelado | sujeto que cambia de estado (se abre, florece, se parte) | vídeo 5 s cámara fija | 6 | 0,56 $ |
| Ingredientes / origen | recortes con alfa en 2-3 tamaños para capas (`capas-alfa`), splash congelado como foto, o clip con transición física (cae, se vierte) | imagen o vídeo | 4, 11, 7 | 0,3 $ o 0,56 $ |
| Por dentro | dolly macro hacia dentro, o variante rayos X alineada (`lente-revelado`) | vídeo o imagen | 3 | 0,56 $ o 0,05 $ |
| Cambio de estado | crudo → hecho, manchas → piel limpia (inicio y fin del mismo encuadre) | vídeo | 5 | 0,56 $ |
| Ficha / compra | último fotograma como fondo fijo + packshots en serie | imagen | 2 | 0,05 × 4 |
**Total:** 3-4 clips + 8-10 imágenes ≈ 2,5-3,5 $ (peor ~6 $). Giro con etiqueta legible → `envase-giratorio`, no vídeo.

## 3. Inmobiliaria, arquitectura, hotel
| Tramo | Asset | Medio | § | Coste |
|---|---|---|---|---|
| Llegada | descenso por nubes o aéreo (o mapa real si es una ubicación concreta: mapa vivo o niveles de imagen) | vídeo o mapa | 8, 15 | 0,56-0,90 $ o 0-0,3 $ |
| Fachada | imagen de fachada a hora dorada; tilt por código o vídeo corto | imagen (+ vídeo) | 9 | 0,075 $ (+0,56) |
| Entrada | dolly a través de la puerta hasta el vestíbulo | vídeo inicio+fin | 3 | 0,075 + 0,67 $ |
| Interiores | 4-6 imágenes (salón, cocina, baño, terraza) con revelados (`revelados-y-transiciones`) y parallax | imagen | 9, 4 | 0,075 × 6 |
| Día / noche | relight de 1-2 imágenes + fundido | imagen | 5 | 0,15 $ |
| Plantas y planos | polígonos SVG sobre la imagen, planos vectoriales | código | — | 0 |
**Total:** ~2-3 $ (peor ~5 $). Las rectas tiemblan en vídeo: solo los tramos donde la cámara tiene que viajar.

## 4. Restaurante, café, tienda física
| Tramo | Asset | Medio | § | Coste |
|---|---|---|---|---|
| Hero | el local (imagen) con capas: sala vacía + mesa en primer plano | imagen | 4, 9 | 0,15 $ |
| Entrar | dolly por la puerta o por la barra | vídeo | 3 | 0,56 $ |
| Platos | 3-5 platos en serie (mismo ángulo y luz), recortados | imagen | 2, 4 | 0,05 × 5 |
| Momento estrella | vertido, vapor, se emplata (cámara fija, fondo del color de la sección) | vídeo | 6 | 0,56 $ |
| Ubicación | mapa real o por niveles de imagen (`mapa-zoom-ubicacion`) | código | 15 | 0 |
**Total:** ~1,6-2 $ (peor ~3,5 $). Para contar un proceso (el café del grano a la taza, ref15): 3-4 clips con el mismo fondo y
la misma luz, encadenados por fotograma, y la tienda sobre el último.

## 5. Gama de sabores o variantes (slider)
| Asset | Medio | Coste |
|---|---|---|
| Packshot base aislado (la primera variante) | imagen | 0,05-0,13 $ × 3 |
| Resto de variantes **como edición de la primera** ("same angle, same lighting, change flavor to…") | imagen | 0,05 × N |
| Etiquetas planas (≈3:1) para enrollar en canvas | imagen o diseño | 0,05 × N |
| Ingredientes recortados (con `capas-alfa`) en 2 tamaños por variante | imagen | 0,05 × 2N |
| Fondo de patrón por variante | imagen o CSS | 0-0,05 × N |
**Total (4 sabores):** ~1-1,5 $. Sin vídeo: el movimiento es de código (`envase-giratorio`, `parallax-capas`).

## 6. App o producto digital (móvil o portátil en mano)
- Igual que la receta 1 con el dispositivo que toque (móvil: aspecto ~0,46, esquinas muy redondeadas, `radio` grande).
- Manos: si el móvil va en mano, la mano fuera de foco y quieta; mejor el dispositivo sobre una superficie.
- La interfaz siempre por código: captura real o la propia app en HTML dentro de la capa.

## 7. Web solo con fotos (estudio, interiorismo, portfolio, catálogo)
Ref12, ref13 y ref14: nada de vídeo, y se ven tan premium como las de clips.
| Tramo | Asset | Medio | § | Coste |
|---|---|---|---|---|
| Serie de fotos | 6-12 fotos **con la misma luz, hora y tratamiento** (una base aprobada y el resto como edición o con ella de referencia) | imagen | 9, "Coherencia de un lote" | 0,05-0,075 × N |
| Entradas | titulares por líneas, fotos en rejilla o con `clip-path` (`revelados-y-transiciones`) | código | — | 0 |
| Profundidad | sujeto o elemento aislado con alfa y el texto entre capas (`capas-alfa`, `parallax-capas`) | imagen + recorte | 4, 10 | 0,05 $ + 0-0,018 $ |
| Catálogo | la estantería o la sala en una imagen grande + zoom a un punto con relevo a una toma de detalle (`crearZoomA`) | imagen | 9 | 0,075 × 2 por producto destacado |
| Cambios de sección | cortinas (`crearCortina`) o tarjeta que crece a pantalla completa | código | — | 0 |
**Total:** solo imágenes, ~0,5-1,5 $ para 10-20 fotos (peor ~3 $). Si las fotos son reales del cliente, 0 $ más el recorte.

## Orden de trabajo y gasto
1. **Bocetos** de dirección (opcional): 6-10 imágenes baratas (0,006-0,03 $) para elegir estilo con el cliente.
2. **Imágenes clave** buenas (2-3 variantes por plano) → elegir → **imágenes finales** y versiones (noche, estados).
   Fase barata (< 1 $): enseñarla y no pasar al vídeo sin un "sí".
3. **Prueba de vídeo** del plano más difícil: 3 s, el modelo elegido o el más barato que lo haga (Veo Lite, Kling std).
4. **Vídeos finales** de 4-6 s, una tirada; la segunda solo si la revisión dice REGENERAR.
5. **Revisión** (`se-nota-falso.md`) de cada asset antes de montarlo.
6. **Montaje** y verificación del scroll; los arreglos por código (velocidad, color, capas) antes de pensar en regenerar.
