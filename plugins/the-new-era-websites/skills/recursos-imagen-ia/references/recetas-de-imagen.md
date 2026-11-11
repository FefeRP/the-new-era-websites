# Recetas de imagen por tipo de recurso

Prompts en inglés (los modelos responden mejor) con huecos entre corchetes. Las restricciones van en positivo al final;
solo se usa prompt negativo en los modelos que lo admiten (ver `pedir-assets-ia`, plantillas por plano).

Modelos orientativos (octubre-noviembre de 2026; precios y nombres en `pedir-assets-ia/references/proveedores.md`):
edición por referencia y lotes coherentes, un modelo de edición con referencias (Nano Banana 2.1 / Pro, Seedream 5, Qwen
Image 3, GPT Image 2 / 2.5 / 2.6, Flux 3 / Flux 2 pro); texto a imagen de texturas y fondos, cualquiera de calidad media. No hace falta el
modelo más caro para ninguna de estas recetas: se elige el intermedio y se sube solo si la primera imagen no llega.

## Bloque de estilo del lote
Escríbelo una vez y pégalo igual en todos los prompts del lote:
```
[Studio photograph]. [Hard key light from the upper left with a soft fill]. [Crisp edges, high detail].
[Neutral colour temperature]. The subject is fully inside the frame with a wide margin all around it.
```
A partir de la segunda imagen añade la primera aprobada como referencia: `Match the lighting, colour and style of image one.`

## 1. Pieza suelta para recortar
```
A single [fresh orange slice with glistening pulp and a few water droplets], floating in mid air, seen at a
[slight three-quarter angle], photographed in a studio. [Bloque de estilo]. On a perfectly flat, uniform
[pure green screen] background with no shadow, no gradient and no reflections of [green] on the subject.
Nothing else in the frame, no text.
```
- Fondo: `pure green screen` · `pure magenta` (si la pieza tiene verde) · `pure white` (piezas oscuras y mates).
- Cristal, hielo, líquido: dos imágenes idénticas, `only change the background to pure black` y `…to pure white`, y alfa
  con `alfa.mjs --modo diferencia`.
- Transparente nativo: `transparent background, PNG with alpha` solo en los modelos que lo dan de verdad; se comprueba
  sobre oscuro.
- Variantes del mismo ingrediente: `the same [slice], smaller and turned [to the left]`, con la primera de referencia.

## 2. Salpicadura o momento congelado (quieto)
```
A frozen splash of [orange juice] forming a [crown with flying droplets], captured with a very short exposure,
no motion blur. [Bloque de estilo]. The liquid is opaque and [bright orange], with crisp edges. On a perfectly
flat, uniform [pure magenta] background with no shadow and no floor visible. Nothing else in the frame, no text.
```
Es foto, no vídeo: lo mueve el código (parallax, escala). Vídeo solo si el líquido tiene que cambiar ante el visitante.
Fondo según el líquido: opaco, sobre magenta; translúcido o con espuma fina, pareja negro/blanco (plantilla de `pedir-assets-ia`).

## 3. Lámina de iconos de marca
```
A single sheet with [six] icons arranged in a clean grid of [three columns and two rows], with wide equal spacing,
on a pure white background. All [six] icons are drawn by the same hand in the same style: [fine, precise black
line drawings with one consistent thin stroke weight, open shapes, no fills, no gradients, no shadows], each icon
centered in its cell and the same visual size. The icons, in order: [a …; a …; a …; a …; a …; a …].
No text, no letters, no numbers, no frame, no grid lines.
```
Estilos que se pueden cerrar en una frase: `solid rounded shapes in a single colour, no outlines` · `two-tone duotone
shapes with one accent colour [#…]` · `thick monoline with rounded caps and corners` · `fine technical line, slightly
diagrammatic`. Segunda lámina: `Same style, stroke weight and visual size as image one. The icons, in order: …`.
Corte y medida: `lote-imagenes.mjs iconos lamina.png --columnas 3 --filas 2 --salida iconos/`.

## 4. Textura repetible
```
Seamless tileable texture of [fine off-white cotton paper with subtle fibres], photographed flat from directly
above with perfectly even, shadowless light. Uniform density and brightness across the whole image, no vignette,
no gradient, no folds, no stains, no distinct features that would reveal repetition. The left edge continues
into the right edge and the top edge into the bottom edge. No text.
```
Otras: `dark brushed aluminium with fine horizontal grain` · `grey linen fabric` · `honed limestone` · `walnut veneer
with tight straight grain`. Medir siempre: `lote-imagenes.mjs mosaico textura.png [--arreglar … --igualar]`.

## 5. Fondo de sección con hueco para el texto
```
Wide atmospheric photograph of [a quiet cafe counter seen from the customer side in soft morning light]:
[a pale stone counter in the lower right with a cup, blurred shelves in the background]. The whole [left] half of
the frame is calm, plain and out of focus, [a soft neutral wall with gentle light falloff], leaving clean space
for a headline. Muted [neutral] palette, low contrast, natural light from [a window on the right].
No people, no text, no signs, no logos.
```
Pareja de noche, por edición de la anterior:
```
Keep everything in image one unchanged: the same framing, objects and positions. Change only the time to
[late evening, 1 a.m., no sunlight]: [warm lamps on, the window dark, buildings outside as silhouettes with lit
windows].
```
Decir la hora y lo que se ve por la ventana funciona mejor que «night version».

## 6. Escena vacía para componer el producto encima
```
An empty product stage: [a low round stone pedestal] in the center of the frame with nothing on it, in
[a dark room with a warm beam of light falling on the pedestal from the upper left]. [Bloque de estilo].
Empty pedestal, no product, no objects, no text.
```
El producto real va encima como foto con alfa y su sombra como capa (`parallax-capas`, `capas-sombra.mjs`). Pedir primero
la escena vacía da menos error que pedir el producto dentro y borrarlo después.

## 7. El mismo objeto desde otro ángulo
```
The exact product from image one, unchanged in every detail of shape, material, colour and markings, photographed
from a new angle: [a three-quarter view from the front left, slightly above]. [Bloque de estilo]. On a perfectly
flat, uniform [pure green screen] background with no shadow and no gradient. Nothing else in the frame, no text added.
```

## 8. El mismo objeto en otro material (encuadre clavado)
```
Keep the camera, the framing, the object's exact shape and position, the light and the background of image one
unchanged. Change only the material of [the card] to [brushed aluminium with fine horizontal grain and soft
anisotropic highlights]. Nothing else changes: same size, same angle, same shadow.
```

## Fallos habituales y qué cambiar
| Lo que sale | Qué cambiar |
|---|---|
| El fondo de recorte tiene degradado o sombra | Repetir «perfectly flat, uniform… no shadow, no gradient»; si insiste, otro color de fondo |
| Reflejos verdes en la pieza | Fondo magenta, o blanco si la pieza es oscura |
| La pieza toca el borde | «fully inside the frame with a wide margin»; formato 1:1 |
| Cada pieza con una luz | Bloque de estilo idéntico y la primera aprobada como referencia |
| Los iconos no se parecen entre sí | Lámina única en vez de uno a uno; estilo en una frase más cerrada |
| Un icono con el trazo distinto | Repetir la lámina; si es solo uno, pedirlo con la lámina como referencia |
| La textura tiene una mancha o una veta que se repite | «no distinct features»; o recortar una zona limpia y pasarla por `mosaico --arreglar` |
| La pareja día/noche no coincide | Hacerla por edición de la primera, no desde cero |
| El objeto cambia al cambiar de ángulo o material | Edición con referencia y «unchanged in every detail»; lo que deba ser exacto, compuesto por código |
