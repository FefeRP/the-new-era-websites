# Continuidad: que varios assets parezcan una sola toma

Las webs de referencia que parecen reales encadenan 4-6 clips cortos (4-8 s de origen, 1-3 s de scroll cada uno) sin que se
note el corte. Estas son las técnicas, de más a menos fiable.

## 1. Imagen de inicio y de fin (dentro de un clip)
- Genera **antes** las dos imágenes (la de fin como edición de la de inicio) y pide el vídeo entre ambas. El modelo solo
  interpola: menos sorpresas, y sabes dónde acaba cada clip (para medir pantallas o encadenar).
- La imagen de fin tiene que ser **físicamente posible** desde la de inicio: otra posición de cámara, otro estado. Un recorte
  ampliado de la misma foto produce un zoom plano sin paralaje; una cámara imposible produce "morphing".
- Los modelos no clavan el final al píxel (±4-6 px): mide en el vídeo, no en la imagen que diste.
- Parámetros: Kling `first_frame_url` / `last_frame_url`; Seedance y Wan `image_url` / `end_image_url`; Veo, imagen final solo
  en algunos modos y duraciones (8 s); Luma, fotogramas clave y bucle. Detalle en [proveedores.md](proveedores.md).

## 2. Encadenar clips por el último fotograma
```
ffmpeg -sseof -0.05 -i clip-a.mp4 -frames:v 1 a-ultimo.png      # el último fotograma REAL del vídeo
```
- Usa ese PNG (no tu imagen de fin) como inicio del clip B: el vídeo devuelto es un poco más blando que la imagen que diste,
  y si B arranca de la imagen nítida se ve un salto de nitidez.
- Mismo modelo, misma resolución y mismo grado de color en todo el tramo. Si cambias de modelo, iguala color por código
  (`ffmpeg -vf eq=...` o un LUT) antes de extraer frames.
- En el scroll, el último frame de A y el primero de B se pintan seguidos: comprueba la unión con `verificar-scroll.mjs`.

## 3. Sujeto ancla (match cut)
- Entre dos lugares distintos, un objeto **en el mismo sitio y tamaño** del encuadre hace de puente (la gota que pasa del
  líquido a la piel, la concha fija mientras cambia el fondo, la semilla siempre en el centro).
- Receta: último fotograma de A → **edición** "keep [the drop] exactly in the same position and size; replace everything
  around it with [skin]" → inicio de B. Comprueba superponiendo al 50 % que el ancla no se movió.

## 4. Mismo encuadre, otra luz u otro estado (día/noche, antes/después)
- Una sola imagen base y las demás como **edición** ("relight this exact photograph…", "same shot, only change…").
- Las ediciones mueven píxeles (hasta ~30 px): si hay pantalla o logo, vuelve a medir sus esquinas en cada versión; los
  vídeos de día y de noche no son intercambiables fotograma a fotograma.
- Si solo cambia la luz: **fundido por código** entre las dos imágenes o entre dos secuencias del mismo movimiento (genera el
  vídeo de noche con inicio y fin = versiones nocturnas de los de día).

## 5. Fondo del color de la sección
- Pide el fondo liso con el **hex exacto** de la sección y corrige después por código (la IA se desvía un poco): así el canvas
  y el CSS casan sin costura y los cortes entre secciones son limpios.

## 6. Cortinas cuando no hay puente
- Tarjeta de texto a pantalla completa sobre el color de fondo (ref11 "Built in layers…", ref8 "READY TO RISE.").
- Fundido a blanco, a negro o a niebla (ref2, ref6).
- Barrido con desenfoque de movimiento (whip): los últimos 4-6 frames de A y los primeros de B con `boxblur` horizontal
  creciente; o por CSS `filter: blur()` durante el cambio.
- El salto de escala sin puente se nota (ref11, del túnel al horno): o puente, o cortina.

## 7. Velocidad
- Todos los modelos frenan al principio y aceleran al final. No regeneres: remapea por código (reparte los frames a pasos
  iguales del movimiento) o compensa con la curva del scroll. `video-ia-para-scroll/scripts/revisar-video.mjs` lo mide.

## 8. Móvil
- Un recorte 9:16 del vídeo 16:9 funciona si el sujeto está en el centro y hay margen. Si no, genera la toma vertical con la
  **misma imagen clave** recompuesta en 9:16 (edición "extend the canvas to 9:16, keep everything") y el mismo prompt.
