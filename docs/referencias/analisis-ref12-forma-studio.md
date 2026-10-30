# ref12 · FORMA STUDIO (interiorismo, @DESIGNWITHARIAN)

Grabación con el móvil de un monitor (27 s, 9:16) con la web de un estudio de interiorismo ficticio. Análisis: fotogramas
extraídos a 2-3 fps y revisados a mano el 30-10-2026, contrastados con un primer informe de Gemini (flash-lite).

## Qué se ve
| Tramo | Qué pasa | Técnica | Fiabilidad |
|---|---|---|---|
| 0:02-0:05 | Foto de un interior (lámpara de mimbre gigante sobre un restaurante en penumbra) a pantalla completa. El título "FORMA STUDIO" en serif grande se parte: "FORMA" se va a la esquina izquierda y "STUDIO" a la derecha, encogiendo | Foto fija + dos palabras animadas con `scale`/`x` ligadas al scroll | Confirmado (la foto no se mueve por dentro) |
| 0:05-0:08 | "HAMPSTEAD HOUSE" sube desde abajo sobre la foto, con un rótulo pequeño encima ("Explore latest project") | Texto HTML con máscara de línea (cada línea dentro de un contenedor con `overflow: hidden`) | Confirmado |
| 0:08-0:14 | Entra una segunda foto (pantalla de lámpara verde con estampado) recortada en óvalo/arco, y "LONDON 2026" encima | Foto con `clip-path` que crece; texto por encima | Confirmado |
| 0:14-0:23 | Fondo negro, fotos pequeñas de personas en el bar que entran desde los lados; bloque "WE CREATE SPACES WITH A SENSE OF PERMANENCE" y párrafo largo "Our work begins…" que se revela por líneas | Fotos en capas con parallax suave + texto por líneas | Confirmado |

## De qué assets se compone
- **Solo fotografías fijas** (4-6), de interior real o generadas, todas con la misma luz cálida y en penumbra. **Ningún vídeo** y nada de 3D.
- Todo el "efecto" es tipografía (serif de alto contraste, mayúsculas, interlineado apretado) y máscaras sobre fotos.

## Lección para el marketplace
Una web de lujo convincente puede no tener ni un fotograma de vídeo: buenas fotos (o imágenes IA bien pedidas, con la misma luz),
tipografía grande y máscaras. Es la receta más barata (0,05-0,10 $ por imagen) y la que menos riesgo tiene de "parecer IA".
Técnicas: `revelados-y-transiciones` (reveals por líneas con `crearLineas`, fotos que crecen con `clip-path`),
`parallax-capas` (fotos en capas con parallax suave) y `pedir-assets-ia` (serie de interiores con la misma luz; receta
"web solo con fotos"). La máscara de línea, mejor con `overflow: clip` que con `hidden`.

## Lo que dijo Gemini y no cuadra
Gemini habla de "vídeo de fondo texturizado"; en los fotogramas el fondo es una foto quieta que solo se desplaza y escala.
