# Continuidad: que varios assets parezcan una sola toma

Las webs de referencia que parecen reales encadenan 4-6 clips cortos (4-6 s de origen, 5 por defecto; 8 s solo en Veo cuando
hace falta el fotograma final, y se recorta; 1-3 s de scroll cada uno) sin que se note el corte.

**En vídeo** (inicio y fin dentro de un clip, encadenar por el último fotograma, sujeto ancla, deriva de color, bucles):
la fuente es [flujos.md](../../video-ia-para-scroll/references/flujos.md) de `video-ia-para-scroll`, con los comandos
de ffmpeg comprobados. La velocidad desigual (todos frenan al principio y aceleran al final) se remapea por código, no
se regenera: [higgsfield-para-webs.md](../../video-ia-para-scroll/references/higgsfield-para-webs.md), §7, y
`revisar-video.mjs` lo mide. Aquí queda lo que se resuelve en las **imágenes** y en el código de la web.

## 1. Imagen de inicio y de fin
- Genera **antes** las dos imágenes, la de fin como **edición** de la de inicio, y pide el vídeo entre ambas.
- La de fin tiene que ser **físicamente posible** desde la de inicio: otra posición de cámara, otro estado. Un recorte
  ampliado de la misma foto produce un zoom plano sin paralaje; una cámara imposible produce "morphing".

## 2. Mismo encuadre, otra luz u otro estado (día/noche, antes/después)
- Una sola imagen base y las demás como **edición** ("relight this exact photograph…", "same shot, only change…").
- Las ediciones mueven píxeles (hasta ~30 px): si hay pantalla o logo, vuelve a medir sus esquinas en cada versión; los
  vídeos de día y de noche no son intercambiables fotograma a fotograma.
- Si solo cambia la luz: **fundido por código** entre las dos imágenes o entre dos secuencias del mismo movimiento (genera el
  vídeo de noche con inicio y fin = versiones nocturnas de los de día).

## 3. Fondo del color de la sección
- Pide el fondo liso con el **hex exacto** de la sección y corrige después por código (la IA se desvía un poco): así el canvas
  y el CSS casan sin costura y los cortes entre secciones son limpios.

## 4. Cortinas cuando no hay puente
Por código con `revelados-y-transiciones`: `crearCortina` entra, cubre y sale, y la escena se cambia en `alCubrir` (con el
panel tapándolo todo, nunca a la vista). Ref16 encadena así sus escenas (cortinas blanca y de arena).
- Tarjeta de texto a pantalla completa sobre el color de fondo (ref11 "Built in layers…", ref8 "READY TO RISE.").
- Fundido a blanco, a negro o a niebla (ref2, ref6).
- Barrido con desenfoque de movimiento (whip): los últimos 4-6 frames de A y los primeros de B con `boxblur` horizontal
  creciente; o, en la web, fundido a una versión ya desenfocada de la imagen (exportada así), nunca `filter: blur()`
  animado a pantalla completa.
- El salto de escala sin puente se nota (ref11, del túnel al horno): o puente, o cortina.

## 5. Móvil
- Un recorte 9:16 del vídeo 16:9 funciona si el sujeto está en el centro y hay margen. Si no, genera la toma vertical con la
  **misma imagen clave** recompuesta en 9:16 (edición "extend the canvas to 9:16, keep everything") y el mismo prompt.
