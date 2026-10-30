# ref14 · Tienda de zapatillas en estantes (Last Dept, @ASCENTA.STUDIO)

Vídeo de 23 s (9:16): un monitor curvo con la web y un móvil en la mano que la controla. Análisis: fotogramas a 2 y 10 fps
revisados a mano el 30-10-2026, contrastados con un informe de Gemini (flash-lite), que lo da por three.js.

## Qué se ve
| Tramo | Qué pasa | Técnica real | Fiabilidad |
|---|---|---|---|
| 0:00-0:02 | Pared oscura con 10 zapatillas en dos baldas de metacrilato; una luz naranja bajo la balda seleccionada | Una imagen (o render) de la estantería completa | Confirmado que es una imagen fotorrealista |
| 0:02-0:03 | Al elegir "Hangar 03", la vista se acerca a esa zapatilla; las vecinas se abren por los lados | En los fotogramas intermedios las zapatillas vecinas crecen y se desplazan **sin cambiar de perspectiva** (no hay paralaje entre balda, pared y zapatilla): es un **zoom 2D** sobre una imagen grande hacia el punto de la zapatilla, más un cambio a una imagen de detalle más nítida al final | Suposición fuerte (falta de paralaje) |
| 0:03-0:05 | Primer plano de la zapatilla con la ficha (nombre, precio, tallas) en HTML a la derecha | UI HTML sobre la imagen | Confirmado |
| 0:05-0:12 | Vuelta a la estantería (zoom inverso) y el mismo gesto con otras dos zapatillas | Misma técnica, con el origen del zoom en cada zapatilla | Confirmado |

## De qué assets se compone
- **Una imagen de la estantería completa** en alta resolución (o un mosaico), con huecos y luz coherentes.
- **Una imagen de detalle por producto** con el mismo encuadre que tendría el zoom (misma pared, misma balda, misma luz), para
  que el relevo no se note.
- La luz naranja de la balda puede ser una capa aparte (brillo por código) o una variante de la imagen.

## Cómo pedirlo a la IA (o hacerlo barato)
1. Imagen clave de la estantería (16:9, 4K si se puede) con todos los productos reales como referencia.
2. Por cada producto, una **edición** de la clave: "same shot, camera moved closer to the third sneaker on the top shelf" (otra
   toma más cerca, no un recorte).
3. Si se quiere paralaje real en el acercamiento: vídeo con la clave como inicio y la de detalle como fin (Kling O3 pro, 3-5 s).
4. En código: `crearZoomA` de `revelados-y-transiciones` (zoom 2D con escala logarítmica hacia el rectángulo de la
   zapatilla y relevo a la imagen de detalle), por tiempo con `reproducir({ duracion })` (0,8-1,2 s) o ligado al scroll
   con `progreso(p)`. A mano: `transform-origin` en la zapatilla + `scale` con GSAP y fundido a la imagen de detalle.

## Lección para el marketplace
"Zoom de cámara a un producto" no exige 3D: imagen grande + zoom con origen en el producto + imagen de detalle. El vídeo solo
añade paralaje, y el 3D solo compensa si el usuario va a girar la zapatilla.
