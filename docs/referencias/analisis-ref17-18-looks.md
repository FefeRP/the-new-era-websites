# ref17 y ref18 · «Try the Look» y «Shop the Look» (moda por looks)

Dos vídeos verticales (15,8 s y 22,6 s, 1080×1920) grabados con el móvil sobre un portátil: la misma idea de tienda
de moda deportiva hecha por dos autores (@JERRYTHEWEBDEV, rotulado «Opus 5.5 + Higgsfield», y @DROPSTUDIOS.CO).
Análisis: fotogramas cada 0,5 s y detalles ampliados revisados a mano el 23-11-2026, contrastados con un informe de
Gemini (flash-lite) de ref17; para ref18 Gemini no tenía cuota.

## Qué se ve
| Tramo | Qué pasa | Técnica (lo que se ve) | Fiabilidad |
|---|---|---|---|
| ref17 0:00-0:07 | Fila de 5 modelos de cuerpo entero sobre un fondo hueso sin costuras; el del centro grande y nítido, los de los lados más pequeños, desenfocados y transparentes. Panel a la derecha «In this look» con las prendas (miniatura, nombre, precio) | Pasarela con huecos fijos (escala, opacidad y desenfoque por hueso); las figuras comparten fondo, cámara y suelo | Confirmado |
| ref17 0:02-0:06 | Al cambiar de look, los vecinos se relevan **en su sitio** (se ven dobles un instante) y las filas del panel cambian escalonadas | Fundido cruzado entre la figura que sale y la que entra, no un desplazamiento de toda la fila | Confirmado (fantasmas en los fotogramas) |
| ref17 0:07-0:10 | Clic en el del centro: los demás se funden, queda él (vista «Studio Day») con puntos blancos sobre cada prenda y su etiqueta al pasar | Vista de detalle con puntos de prenda enlazados con la lista; Gemini lo describe como «zoom + fundido de ~0,5 s» | Confirmado |
| ref17 y ref18 | Los modelos se mueven poco (respiran, la tela se mece) | Bucle corto de vídeo IA de cámara fija por modelo (Gemini coincide: «vídeo generado en capas 2.5D, sin WebGL») | Probable |
| ref18 | La misma estructura con otra marca, botón «Add full look to bag» con el total | Mismo patrón; confirma que es una receta repetible, no un truco de una web | Confirmado |

## Qué sacamos (receta)
- **El activo manda:** todos los modelos con el mismo fondo liso, la misma altura de cámara y los pies en la misma
  línea. Si no, la fila «baila». Con IA: una plantilla de prompt fija donde solo cambia la ropa.
- **Sin recortar:** fondo de las fotos llevado a blanco puro y `mix-blend-mode: multiply` sobre el color de la página
  (medido en Chrome: con fondo hueso sobre hueso se ven los rectángulos; con blanco puro desaparecen).
- **Desenfoque con copias ya desenfocadas**, cruzadas por opacidad; no `filter: blur()` animado en cinco imágenes.
- Panel sincronizado con `aria-live`, puntos sobre la prenda como `<button>` en % de la imagen, «añadir el look
  entero».
- Receta completa: `new-era/references/recetas-producto-y-servicio.md` (1 y 2) · catálogo, sección J.

## Lo trillado o mejorable
- Sin la vista de rejilla («ver todos los looks») el visitante solo puede ir de uno en uno: añadirla.
- Los bucles de vídeo IA en los cinco huecos pesan mucho; basta con el del centro.
