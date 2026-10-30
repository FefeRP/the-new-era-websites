# Recetas de assets por tipo de web

Sacadas de desmontar 11 webs de referencia (`docs/referencias/`): solo 6 están hechas con imagen o vídeo de IA, y todas siguen el
mismo patrón: **4-6 clips cortos** (4-8 s generados, 1-3 s de scroll cada uno), **una imagen clave** de la que sale todo,
**fondo liso del color de la sección**, **un solo movimiento de cámara** por clip, y **todo el texto, cifras y logos por código**.
Las otras 5 son 3D en tiempo real: sirven de guion, no de receta de prompts.

Costes con Kling O3 pro 1080p (0,112 $/s) e imagen a ~0,05-0,075 $; "peor caso" con 2 tiradas por vídeo y 3 por imagen.
Calcula el tuyo con `scripts/presupuesto.mjs`. Plantillas de prompt: [plantillas-por-plano.md](plantillas-por-plano.md) (§n).

## Cómo decidir el medio de cada asset
| Si el asset… | Medio | Por qué |
|---|---|---|
| necesita que **la cámara se mueva de verdad** por un espacio real (entrar, acercarse con paralaje, rodear sin texto) | **vídeo IA** con inicio+fin | el 3D barato no llega a ese realismo |
| es un **cambio de estado físico** (se abre, se hornea, florece, se vierte) | **vídeo IA** con cámara fija | ídem |
| es un **lugar o producto quieto** (interior, fachada, packshot, ingrediente) | **imagen IA** + movimiento por código (zoom, parallax, máscara) | 10-20 veces más barato y las rectas no tiemblan |
| solo cambia la **luz o el color** (día/noche, antes/después) | **2 imágenes** (edición) + fundido por código | sin artefactos, gratis el movimiento |
| lleva **texto, logo, interfaz, cifras** | **código** encima (`seguir-pantalla`, HTML, SVG) | la IA inventa letras y aplasta logos |
| **gira con texto legible** o el usuario lo manipula | **3D / canvas** (`escena-3d-gltf`, `envase-giratorio`) | el vídeo deforma la etiqueta |
| es un **lugar real concreto** visto desde el aire | **mapa real** (`mapa-zoom-ubicacion`) | exacto y gratis |
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
| Ingredientes / origen | recortes en 2-3 tamaños para capas, o clip con transición física (cae, se vierte) | imagen o vídeo | 4, 7 | 0,3 $ o 0,56 $ |
| Por dentro | dolly macro hacia dentro, o variante rayos X alineada (`lente-revelado`) | vídeo o imagen | 3 | 0,56 $ o 0,05 $ |
| Cambio de estado | crudo → hecho, manchas → piel limpia (inicio y fin del mismo encuadre) | vídeo | 5 | 0,56 $ |
| Ficha / compra | último fotograma como fondo fijo + packshots en serie | imagen | 2 | 0,05 × 4 |
**Total:** 3-4 clips + 8-10 imágenes ≈ 2,5-3,5 $ (peor ~6 $). Giro con etiqueta legible → `envase-giratorio`, no vídeo.

## 3. Inmobiliaria, arquitectura, hotel
| Tramo | Asset | Medio | § | Coste |
|---|---|---|---|---|
| Llegada | descenso por nubes o aéreo (o mapa real si es una ubicación concreta) | vídeo o mapa | 8 | 0,56-0,90 $ o 0 |
| Fachada | imagen de fachada a hora dorada; tilt por código o vídeo corto | imagen (+ vídeo) | 9 | 0,075 $ (+0,56) |
| Entrada | dolly a través de la puerta hasta el vestíbulo | vídeo inicio+fin | 3 | 0,075 + 0,67 $ |
| Interiores | 4-6 imágenes (salón, cocina, baño, terraza) con máscaras y parallax | imagen | 9, 4 | 0,075 × 6 |
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
| Ubicación | mapa real | código | — | 0 |
**Total:** ~1,6-2 $ (peor ~3,5 $).

## 5. Gama de sabores o variantes (slider)
| Asset | Medio | Coste |
|---|---|---|
| Packshot base aislado (la primera variante) | imagen | 0,05-0,13 $ × 3 |
| Resto de variantes **como edición de la primera** ("same angle, same lighting, change flavor to…") | imagen | 0,05 × N |
| Etiquetas planas (≈3:1) para enrollar en canvas | imagen o diseño | 0,05 × N |
| Ingredientes recortados en 2 tamaños por variante | imagen | 0,05 × 2N |
| Fondo de patrón por variante | imagen o CSS | 0-0,05 × N |
**Total (4 sabores):** ~1-1,5 $. Sin vídeo: el movimiento es de código (`envase-giratorio`, `parallax-capas`).

## 6. App o producto digital (móvil o portátil en mano)
- Igual que la receta 1 con el dispositivo que toque (móvil: aspecto ~0,46, esquinas muy redondeadas, `radio` grande).
- Manos: si el móvil va en mano, la mano fuera de foco y quieta; mejor el dispositivo sobre una superficie.
- La interfaz siempre por código: captura real o la propia app en HTML dentro de la capa.

## Orden de trabajo y gasto
1. **Bocetos** de dirección (opcional): 6-10 imágenes baratas (0,006-0,03 $) para elegir estilo con el cliente.
2. **Imágenes clave** buenas (2-3 variantes por plano) → elegir → **imágenes finales** y versiones (noche, estados).
   Fase barata (< 1 $): enseñarla y no pasar al vídeo sin un "sí".
3. **Prueba de vídeo** del plano más difícil: 3 s, el modelo elegido o el más barato que lo haga (Veo Lite, Kling std).
4. **Vídeos finales** de 4-6 s, una tirada; la segunda solo si la revisión dice REGENERAR.
5. **Revisión** (`se-nota-falso.md`) de cada asset antes de montarlo.
6. **Montaje** y verificación del scroll; los arreglos por código (velocidad, color, capas) antes de pensar en regenerar.
