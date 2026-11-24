# Biblioteca de plantillas de prompt por tipo de plano

Cada plantilla trae: cuándo se usa en una web, la imagen clave que necesita, el modelo y los parámetros recomendados,
el prompt (en inglés) y de dónde sale. **Estado** dice cuánto te puedes fiar:
- **Publicada:** el prompt o su estructura salen literal de una guía oficial o de una fuente con resultados (enlace).
- **Medida:** se generó en un proyecto real y se midió con `revisar-video.mjs`.
- **Por reglas:** sigue las reglas comprobadas, pero nadie ha publicado el resultado: el primer clip es la prueba.

> Esta es la única biblioteca de prompts de **vídeo**. Las imágenes clave y finales de las escenas realistas (zoom a
> una pantalla, entrar en un lugar, día/noche), el bloque de realismo, lo que delata a la IA y los assets para componer
> están en [plantillas-por-plano.md](../../pedir-assets-ia/references/plantillas-por-plano.md) de `pedir-assets-ia`.
> Para elegir el modelo: `arbol-decision.md`. Para cada modelo: `modelos/`.

## Estructura de todas
```
[PREÁMBULO DE ESTILO: idéntico en todas las tomas del proyecto]
[MOVIMIENTO: qué hace la cámara (uno solo) y qué hace el sujeto, de principio a fin, a velocidad constante]
[ESTABILIDAD: qué no cambia (forma, luz, exposición)]
[LO QUE LA CÁMARA NO HACE, en frases: no cuts, no zoom, no shake… y "clean image without text"]
```
- Con imagen a vídeo, **describe el movimiento, no el aspecto** (ya está en la imagen).
- Menos de ~200 tokens. Un movimiento. Como mucho dos fases en 5 s.
- Velocidad: «constant speed», «one constant angular speed», «no speed changes, no steps, no drift». No escribas
  «settling into a static hold» si no quieres que frene [1].
- Campo negativo solo en Wan y Kling 2.5 Turbo (ver la ficha del modelo). Lista de partida para ese campo:
  `cuts, scene change, camera shake, handheld, jitter, speed ramp, zoom pumping, morphing, warping, melting edges, shape
  change, flicker, light changes, new objects, text, garbled letters, logo distortion, people, hands`.

**Bloque de estabilidad** (el `[Estabilidad]` de las plantillas; va al final de todo prompt de vídeo con producto o
escena):
```
Everything stays rigid and physically stable: [the furniture, the laptop, the product] keep their exact shape, size, position
and colors. Constant speed from the first frame to the last, no cuts, no rotation beyond the described move, no camera shake.
```

## Preámbulos de estilo (elige uno por proyecto y no lo toques)
- **Estudio oscuro cálido** (lujo, relojería, perfume): `Premium product film, seamless warm charcoal studio background (#171412), soft large softbox key light from upper left, subtle cool rim light from behind right, gentle contact shadow, product in sharp focus from front to back, photoreal, 24 fps, clean and calm.`
- **Estudio claro** (tecnología, cosmética): `Premium product film, seamless light warm-grey studio background, soft diffused key light from upper left, gentle fill from the right, soft contact shadow beneath, razor sharp focus, neutral colour, photoreal, 24 fps.`
- **Color de marca** (helados, bebidas): `Premium product film on a seamless solid [pastel pink #F4C6D0] background, soft even top light, tiny soft shadow, vivid but natural colours, photoreal food photography, 24 fps.`
- **Natural** (café, artesanía): `Premium editorial film, warm morning window light from the left, seamless soft beige background, natural textures, gentle shadows, photoreal, 24 fps.`
- **Lugar real** (intro, inmobiliaria): `Documentary cinematography, real light and materials, locked exposure and white balance, deep depth of field, photoreal, 24 fps.`

---

## 1. Intro hacia delante (entrar, atravesar, llegar)
**En la web:** el hero que avanza con el scroll. **Imagen clave:** inicio gran angular (18-24 mm, fijado en la imagen),
con primer plano, plano medio y fondo claros. **Fin:** ninguno, o uno alcanzable hecho editando el inicio.
**Modelo:** Seedance 2.5 (480p de prueba, 720p/1080p final, 5-10 s); barato: Wan 3.0; con paradas: Kling 4.0.
**Estado:** Publicada (estructura de Higgsfield [1]) + Medida (las lecciones de una intro real).
```
One continuous long take. The camera dollies forward on straight rails at a constant speed along the centre of the
[passage], at a locked height of [1.5] metres, passing the [foreground element] and the [midground element] so they
sweep out past the frame edges with strong parallax, toward the [background element], which fills the frame by
[4.5] seconds. The field of view never changes, no zoom: the perspective shifts because the camera physically
approaches. No pan, no tilt, no crane, no handheld drift, no cuts. Locked exposure, consistent light from the first
image. Clean image without text.
```
La frase del FOV y del paralaje sale literal de la plantilla de dolly de Cinema Studio [1]. Riesgos: frena al final
(pide el fin a 4,5 s, no «hold»), se salta tramos con un fin lejano.

## 2. Revelado de logo o de portada
**En la web:** el cierre de la intro o la sección de marca. **Imagen clave:** el **fin** es la portada o el logo
terminado (compuesto desde el SVG real); el inicio, la misma escena sin logo o con las formas sueltas.
**Modelo:** Seedance 2.0 con imagen final, 5 s, 1080p, sin audio (receta oficial [2]); alternativa: Veo 3.1 Lite
con dos fotogramas. **Estado:** Publicada.
```
Subtle light moves across the surface and the forms assemble into the logo with precise alignment, no extra
symbols. The camera holds almost still with a slow push in. The shot ends exactly on the provided end frame, holding
still. Clean edges, centred, high contrast, no distortion, no flicker, no extra text, no new objects.
```
Combina la receta de Higgsfield [2] y la de Veo para logos [3]. Mantén el final quieto para que la web pase a la
imagen estática sin salto. Si el logo tiene letras, que lleguen por código (ver `flujos.md`, «Marca»).

## 3. Fondo en bucle (hero, contacto)
**En la web:** vídeo de fondo con autoplay, sin scroll. **Imagen clave:** inicio = fin (el mismo PNG).
**Modelo:** Kling 3.0 std, 5 s (7,5 créditos); con semilla para repetir: Wan 2.7. **Estado:** Medida (bucles de Kling
sin costura) + Publicada (cámara bloqueada [1]).
```
Locked tripod bolted in place, zero rotation, zero travel. Only [steam rises slowly from the cup / the curtain moves
gently / light shifts softly across the wall]. The camera's position and height are identical in the first and last
frame, so the clip loops seamlessly. Constant, calm motion, no flicker.
```
Si no cierra: ida y vuelta o fundido de la cola sobre el principio (`flujos.md`, «Bucles»). En el motor de nsfw de
producto, evita «seamless loop feel», «ambient» e «intimate» [2].
Variante de fondo de ambiente (cielo, agua, niebla, luz que entra), con el color de la sección:
```
Locked-off camera, [soft morning clouds drifting slowly from left to right over a pale sky], very slow, calm, continuous
motion, no camera move, no birds, no planes, no sun flare. Low contrast, muted colors that match [#e9e4da]. Seamless loop:
the last frame matches the first. [Estabilidad].
```
Antes de pedirlo, mira si es código (degradado animado, ruido en un shader, grano, foto con zoom lento): vídeo solo si
el movimiento natural es el protagonista. Un fondo de vídeo por web; si hay dos, el segundo por código. 5 s, 0,25-0,56 $.

## 4. Transición entre secciones (A → B)
**En la web:** el vídeo que une dos secciones al hacer scroll. **Imagen clave:** inicio = imagen de la sección A,
fin = imagen de B; los dos tienen que compartir un **portador** (la luz, la posición de la cámara, un objeto).
**Modelo:** Kling O3 (el más barato con fin) o Veo 3.1 si el cambio es grande; Seedance 2.5 si hay recorrido.
**Estado:** Publicada (ejemplo oficial de Google [3]).
```
The camera performs one smooth [180-degree arc / slow push forward], starting on [view of section A] and continuing
around the [shared subject] to seamlessly end on [view of section B]. One continuous move at constant speed, the
[shared subject] stays the same, no cuts, no fades.
```
Si A y B no comparten nada, no hay prompt que lo salve: transición por código (`revelados-y-transiciones`) o un
puente generado con inicio = último fotograma de A y fin = primero de B (`flujos.md`).
**Transición física dentro del plano** (otra forma de portador): A acaba con algo saliendo por un borde (granos que
caen) y B empieza con eso entrando por el opuesto; o, al final de A, «a wave of coffee sweeps across and fills the
whole frame». Si B cambia de lugar con un objeto fijo en el encuadre, sujeto ancla (`flujos.md`, «Encadenar»).

## 5. Producto 360 / arco alrededor del producto
**En la web:** el producto que gira con el scroll. **Imagen clave:** producto centrado a 3/4, con aire a los lados,
fondo liso. **Modelo:** Kling 3.0 / O3 (el más fiel al producto); 360 completo solo en objetos sin texto (la etiqueta
se destroza). Arco < 45° en Wan [4]. **Estado:** Publicada (literal de Higgsfield [1] y Kling [5]).
Arco (lo seguro):
```
The camera orbits slowly around the [product] in one [90]-degree arc, at a locked constant radius and height,
constant velocity, no drift, no reframing, precision-slider smoothness. The product remains static, only the camera
moves. Every part keeps its exact shape, colour and label. Lighting stays constant. One continuous shot.
```
360 completo (literal de Higgsfield, recortado):
```
One continuous 360-degree orbit, the camera travels a full circle around the subject on a locked constant radius of
[2.5] metres at a locked constant height, panning continuously to keep the subject dead-center at constant size, one
full revolution in ONE direction at one constant angular speed, returning exactly to the opening framing at the end.
The subject stays planted, facing one fixed direction in the world the entire time, it is the camera that circles
them. No radius drift, no height drift, no speed changes, no reversal, no turntable effect where the subject spins
in place.
```
Aviso publicado: pedir pocos grados a veces da más giro del pedido; mide.
- **Antes de pedirlo:** si el producto lleva texto o etiqueta que se tiene que leer al girar, el vídeo la deformará:
  `envase-giratorio` (lata o botella, canvas) o `escena-3d-gltf`. El vídeo, para productos sin texto o con la marca
  pequeña que se pueda tapar o seguir por código.
- Para scroll, un arco de 90-180° en 5 s se ve mejor que 360° (más fotogramas por grado = más nitidez al arrastrar). Con
  luz fija en la sala, los brillos se deslizan solos por el cristal o el metal.
- Imagen clave del producto (edición con la foto real) y coste: `pedir-assets-ia`, plantillas por plano §2.

## 6. Producto que gira sobre sí mismo (cámara fija)
**Modelo:** Kling 3.0 std. **Estado:** Por reglas.
```
Static locked-off camera. The [product] rotates smoothly on a hidden turntable, exactly [90-180] degrees at one
constant angular speed, starting immediately and never pausing. Every part keeps its exact shape, colour and
material. Background and lighting never change.
```
Con inicio = fin para un bucle de 360° algunos modelos devuelven un clip casi quieto: comprueba el giro.
Variante de 360° en bucle para pasar a frames (objetos sin texto; **nunca giro y zoom a la vez**):
```
The [product] rotates 360 degrees on its vertical axis at a perfectly constant speed on a turntable, camera locked-off,
same distance and height, the product stays centered and the same size. Plain [warm grey #cfc8bd] background, studio light
fixed in the room. Seamless loop: the last frame matches the first. [Estabilidad].
```
La cara trasera la inventa el modelo: si hay foto de la trasera, dásela como referencia (Kling Elements) o descarta el
vídeo. Salida en frames y alternativa 3D generada: `pedir-assets-ia`, plantillas por plano §14.

## 7. Dolly de revelado (de un detalle al producto entero)
**Modelo:** Kling 3.0 / Seedance 2.0. **Estado:** Por reglas (vocabulario de Kling [5]).
```
Start with an extreme close-up on the [texture / label area], then pull back in one slow, continuous dolly out at
constant speed to reveal the whole [product], centred, with empty space on both sides. No other movement, no zoom.
```

## 8. Grúa de revelado (sube y descubre el sitio)
**En la web:** de un detalle al lugar entero (hotel, finca, paisaje). **Modelo:** Veo 3.1 o Seedance 2.5.
**Estado:** Publicada (ejemplo de Google [3]).
```
Crane shot starting low on [the subject] and ascending high above, revealing [the place] at [time of day], one
continuous rise at constant speed, steady horizon, consistent light.
```

## 9. Despiece (exploded view) y montaje
**Imagen clave:** producto montado a ~80 % del alto; nombra cada pieza. **Modelo:** Veo 3.1 8 s con fin, o Kling con
inicio + fin. **Estado:** Por reglas. **Montaje** = despiece al revés (`ffmpeg -vf reverse`).
```
The disassembly begins in the very first frame and continues without pause until the final frame. The [product]
separates into a clean exploded view: the [part A] lifts straight up, the [part B] slides forward, the [part C]
floats free. Each component drifts slowly along its own axis and stays suspended, evenly spaced by the last frame.
The camera holds still. Every component keeps its exact shape, colour and material.
```

## 10. Ingredientes flotando
**Modelo:** Kling 3.0 / Seedance 2.0. **Estado:** Por reglas. Si puede ser interactivo, mejor `parallax-capas`.
```
Static camera. The [product] stays centred and still. Around it, [three raspberries and two mint leaves] drift
slowly in mid-air, each along its own gentle path at constant speed, never touching the product, never leaving the
frame. No new objects appear.
```

## 11. Caída, líquido, salpicadura
**Modelo:** Veo 3.1 o Kling (prueba los dos barato); física barata: Hailuo 2.3. **Estado:** Por reglas.
```
Static camera. [Coffee beans] fall from the top of frame into the [grinder] in one continuous slow-motion stream at
constant speed, from the first frame to the last. The [grinder] stays perfectly still. No splashes leave the frame.
```
Si el momento puede estar congelado, es una foto (`pedir-assets-ia`) y el movimiento lo pone el código.

## 12. Vuelo FPV a través de un lugar
**Modelo:** Seedance 2.5 o Wan 3.0 (con ruta dibujada). Los presets FPV de DoP inventan y no van a velocidad
constante. **Estado:** Publicada (Wan [4], adaptada a velocidad constante).
```
First-person FPV drone perspective, single take, one uninterrupted continuous motion, flying forward through the
[arch] and into the [interior] at one constant speed, stabilised horizon, no sharp turns. No cuts throughout, no
shot splits, no transition breaks.
```

## 13. Hero con poco movimiento (parallax de cámara)
**En la web:** el hero que solo «respira» con el scroll. **Modelo:** Seedance 2.0 (5 s, «slow, gentle, continuous
small movements» [6]) o Kling 3.0 std. **Estado:** Publicada (vocabulario BytePlus).
```
Slow, gentle, continuous small camera movement: a slight push in toward the [subject] with subtle parallax between
the foreground and the background. Fixed exposure, no cuts, no zoom.
```

## 14. La obra al revés: del resultado final a su construcción
**En la web:** el scroll cuenta cómo se hizo lo que vende la marca (una casa que se levanta desde el solar, un producto
que se monta, un plato que se compone). Funciona en constructoras, arquitectura, interiorismo, cosmética y SaaS con un
objeto central. Lo que lo hace premium es **una sola idea visual atada al scroll**, no el efecto.
**Modelo:** Seedance 2.5 en modo References, con el **render final** de la web (la villa terminada, el producto
acabado) como imagen de referencia. **Estado:** Publicada (método visto en un vídeo de un creador, noviembre de
2026; sin datos técnicos de duración, resolución ni peso, que se resuelven con este marketplace).
**Método:**
1. Primero se diseña la web y se fija la imagen final (la que verá el visitante al terminar el scroll).
2. Se pide el proceso **hacia atrás** desde esa imagen: al modelo le sale más fácil deshacer que construir desde la
   nada, y la imagen final queda exacta porque es la referencia.
3. En la web se invierte (`ffmpeg -i obra.mp4 -vf reverse construccion.mp4`), se recodifica según
   [montaje-web.md](montaje-web.md) y se ata al scroll con `scroll-frames`: al bajar se construye y al final llega
   la imagen del diseño.
```
Using the reference image, generate the entire construction process backwards: the finished [house / product /
dish] is taken apart step by step until only [the empty plot / the raw materials / the empty plate] remains.
Locked camera, same framing and light as the reference, one continuous take, no cuts.
```
Variante con cámara: añade un movimiento lento y constante («slow steady orbit to the left»), nunca dos. Antes de
generar, pasa [checklists.md](checklists.md) y estima con `estimar-higgsfield.mjs`. Audio apagado si no se usa.

Las plantillas 15-18 son escenas realistas: sus imágenes clave y finales (con el bloque de realismo) y lo que va por
código están en `pedir-assets-ia`, plantillas por plano §1, §3, §5-§6 y §8. Aquí solo el vídeo entre ellas.

## 15. Zoom a una pantalla (estudio, agencia, app, SaaS)
**En la web:** la cámara se acerca al portátil o al móvil y la web real del cliente aparece en la pantalla
(`seguir-pantalla`). **Imagen clave:** la escena con la pantalla en blanco liso; **fin:** otra toma de verdad, con la
cámara movida (nunca un recorte ampliado: da un zoom plano, sin paralaje, y se nota). **Modelo:** Kling O3 pro con
inicio + fin, 4-5 s (~0,45-0,56 $; prueba de 3 s ~0,34 $). **Estado:** Por reglas.
```
A slow, steady dolly-in toward the laptop on the desk, the camera physically travels forward through the room with natural
parallax: foreground objects pass the frame edge, the background gently defocuses. Ends exactly on the last frame. The screen
stays plain white. [Estabilidad].
```
La pantalla blanca (o del color de fondo de la web) facilita seguirla y que la captura la tape entera.

## 16. Entrada a una escena por un umbral (puerta, ventana, entre árboles)
**Imagen clave:** fuera; **fin:** el interior generado como edición de la clave, con el marco aún visible en los
bordes. **Modelo:** Kling O3 pro con inicio + fin, 5-6 s (~0,56-0,67 $). **Estado:** Por reglas.
```
One continuous slow dolly-in through the half-open door into the room, constant speed, the door frame passes the edges of
the frame, the light changes naturally from outdoor golden hour to the warm interior. Ends exactly on the last frame. [Estabilidad].
```
Las rectas de arquitectura tiemblan en vídeo: clip corto, cámara lenta, 1080p.

## 17. Cambio de estado con cámara fija (se dora, florece, se abre, se parte)
**Imagen clave:** el estado inicial; **fin:** el estado final generado antes como foto (edición de la clave), así el
modelo solo interpola. Si solo cambia la luz o el color, no hay vídeo: fundido por código entre las dos imágenes.
**Modelo:** Kling O3 pro, 5 s (~0,56 $). **Estado:** Por reglas.
```
Locked-off camera, [the peony] centered occupying [50]% of the frame, plain [blush pink] background matching hex [#f3dede].
[The closed bud slowly opens petal by petal, revealing the jar inside]. Slow, continuous, constant pace, ends exactly on the last frame.
[Estabilidad].
```
Con un fondo de escena en vez de liso: «Locked-off camera, nothing moves except [the croissant slowly turning from pale
to deep golden brown as it bakes]. Same framing from first to last frame. [Estabilidad].» Partículas, migas o líquidos
que se congelan delatan: «every crumb keeps falling with gravity», o quítalas. Despiece: plantilla 9.

## 18. Descenso aéreo (nubes → ciudad → edificio)
**Antes de pedirlo:** una ubicación real va con `mapa-zoom-ubicacion` (ortofoto, gratis y exacta, o niveles de imagen);
la IA, solo para las nubes o el final cercano. 4-6 s (5 por defecto, ~0,45-0,67 $); 8 s solo en Veo cuando hace falta
el fotograma final, y se recorta. Por tramos encadenados mejor que uno largo. **Estado:** Por reglas.
```
Aerial drone shot descending slowly through a sea of morning clouds, the clouds part to reveal [a coastal town with
whitewashed houses] seen obliquely from 300 m, soft haze, constant slow descent, no rotation. [Estabilidad].
```

---

## Plantilla de pedido para dejar por escrito
```
Proyecto: …  Sección: hero / sección 2…
Coreografía (0→100 % del scroll): …
Textos y dónde: …   Lado libre para texto: izquierda / derecha / los dos
Tipo de plano (nº de esta biblioteca): …   Estado de la plantilla: publicada / medida / por reglas
Imagen clave: archivo (aprobada el …), focal: …   Fin: sí/no (cómo se hizo)
Modelo: …   Duración: … s   Resolución: …   Audio: no   Borrador: sí/no
Prompt: …
Precio estimado (estimar-higgsfield.mjs o estimate_video_cost): …   Tope: …   Vale de: …
Resultado: archivo + informe de revisar-video (cortes, saltos, avance, variación)
```

## Fuentes
1. Higgsfield, control de cámara en vídeo IA (plantillas de dolly, órbita, cámara fija) [leída entera]: https://higgsfield.ai/blog/ai-video-camera-control
2. higgsfield-ai/skills, `higgsfield-websites/references/cover-animator.md` y `asset-system.md` [leída entera / parcial]: https://github.com/higgsfield-ai/skills
3. Google Cloud, guía definitiva de prompts de Veo 3.1 [leída entera]: https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
4. Alibaba Cloud, guías de prompts de Wan y Wan 3.0 [leída entera / parcial]: https://www.alibabacloud.com/help/en/model-studio/text-to-video-prompt
5. Kling, guía de control de cámara [leída entera]: https://kling.ai/blog/kling-ai-camera-control-video-guide
6. BytePlus, guía de prompts de Seedance 2.0 [leída entera]: https://ai.byteplus.com/ark/region:ap-southeast-1/docs/seedance-2-0-prompt-guide
