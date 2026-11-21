# Vídeo IA para webs con Higgsfield (Seedance, Kling, Veo): de la idea al vídeo montado, a la primera

Para intros por scroll, fondos, transiciones entre secciones, marcos y objetos de cristal o 3D. Junta lo que publica
quien lo hace (fuentes al final, con enlace) y lo aprendido generando intros reales (sección «Lecciones»).
Estado: noviembre de 2026. Los modelos y precios cambian cada mes: comprueba con `estimate` (API) o el MCP antes de
presupuestar.

> **La regla que más dinero ahorra:** el vídeo se planifica entero antes de generar (coreografía, imágenes clave,
> prompt, coste) y se comprueba con `scripts/revisar-video.mjs` antes de montarlo. Casi todos los fallos de una
> intro se ven en la planificación (fin demasiado distinto del inicio, encuadre cerrado, demasiadas fases en
> 5 s) y casi todos los que se escapan se arreglan por código sin volver a generar.

## 1. Qué pieza, qué medio y qué modelo

| Pieza de la web | Medio | Modelo y modo | Por qué |
|---|---|---|---|
| **Intro por scroll** (entrar en un sitio, atravesar algo, llegar a la marca) | Vídeo, imagen a vídeo | **Seedance 2.5** con imagen de inicio (y fin solo si cumple el §4) | Una sola toma continua con paralaje real; es lo que Higgsfield recomienda por defecto para imagen a vídeo [6]. Frena al final y se salta tramos si el fin está lejos (§4, §8) |
| **Producto o interior con recorrido corto** (acercarse a una pantalla, entrar en una sala) | Vídeo con inicio + fin | **Kling O3 / Kling 3.0** | Geometría estable y respeta bien inicio y fin. Puede «no moverse» y saltar al fin al final (§8): mide el avance |
| **Fondo en bucle** (hero, contacto) | Vídeo corto | **Kling 3.0 std** con inicio = fin, cámara fija | Bucle sin costura y barato [12]. Luma Ray tiene bucle nativo, pero no admite a la vez fotograma final [12] |
| **Transición entre secciones** | Vídeo con inicio = imagen de la sección A, fin = imagen de B | Kling 3.0 / Veo 3.1 / Seedance 2.5 | Funciona si A y B comparten un «portador» (§4). Si no, una transición por código (`revelados-y-transiciones`) |
| **Marco** (ventana, pantalla, portal con contenido dentro) | Imagen + código | Imagen (Nano Banana, Seedream, GPT Image) con el hueco recortado por `capas-alfa`; lo de dentro, por código o con `seguir-pantalla` si la cámara se mueve | La IA deforma lo que va dentro (texto, interfaz) y un marco quieto no necesita vídeo |
| **Objeto de cristal o 3D suelto** | Imagen o vídeo sobre fondo liso + alfa; o 3D real | Imagen/vídeo sobre negro y blanco → `capas-alfa` (alfa por diferencia); si el usuario lo mueve, `escena-3d-gltf` | Ningún modelo de vídeo da alfa. No hay guía publicada específica para cristal: trátalo como producto (§3) con fondo liso |
| **Logo, texto, interfaz** | **Código siempre** (o compuesto en la imagen final, §4) | — | Ningún modelo mantiene un logo o un texto concretos; el consejo general es «plate first, logo in post» [16][17] |

Otras observaciones publicadas:
- En pruebas de anuncios de producto, Veo 3.1 y Seedance dieron el plano más de cine, pero se inventaron elementos;
  Kling fue el más fiel al producto y el que menos se movía; algunos modelos ya se han retirado [7].
- Para un recorrido largo (12-20 s) Seedance 2.5 mantiene la continuidad mejor que encadenar clips; Kling controla
  mejor cada plano [1][13].

## 2. Antes de generar (checklist; no se lanza nada sin esto)
- [ ] **Coreografía en una frase**, de 0 a 100 % del scroll: qué ve el visitante y dónde aparecen los textos.
- [ ] **Una toma, un movimiento, un eje.** Mezclar órbita, paneo, zoom y grúa deja el encuadre «sin regla estable» [3].
- [ ] **Como mucho dos fases en 5 s** (p. ej. «avanza» y «llega»). Muchos momentos en poco tiempo provocan cortes [11].
- [ ] **Imágenes clave aprobadas** (inicio y, si va, fin) con la **misma proporción** y el **mismo encuadre de lente**;
      en Seedance 2.5 la proporción la manda la imagen de inicio [5].
- [ ] **Encuadre abierto en la imagen de inicio** (gran angular, 18-24 mm, mucho aire). El ángulo lo fija la imagen, no
      el prompt: ninguna fuente demuestra que escribir «24mm» en el prompt del vídeo abra el plano. Y si vas a añadir
      un acercamiento por código, cuenta con él: +20 % de zoom a 720p deja 600 líneas útiles.
- [ ] **Estimación** con el coste real (`estimate` en la API, `estimate_video_cost` en el MCP, o el botón de la web)
      y **tope** del lote. Apunta modelo, resolución, segundos y precio.
- [ ] **Prueba barata** si el presupuesto lo deja: el mismo prompt a 480p y 4-5 s para ver la estructura (¿avanza?,
      ¿salta?), y el bueno a 720p o 1080p [1][11]. En Kling, la prueba en std o turbo [6].
- [ ] **Una sola variable por reintento** [14]. Compara el coste por clip aceptado, no el precio de lista [7].
- [ ] **Audio apagado** (`generate_audio: false`) y sin «prompt enhancer» si la herramienta lo tiene [15].

## 3. Plantilla de prompt (inglés; restricciones en positivo al final)

Sin campo de prompt negativo en estos modelos: lo que no quieres va al final, en frases.

```
One single continuous shot of [5] seconds with no cuts, no jump cuts and no scene change.
[Si hay fin:] Begin exactly from the first image and arrive naturally at the last image; the camera reaches the last
framing at [4.5] s and holds it steady to the end.

Camera: [a real camera on a smooth gimbal / a stabilised FPV cinewhoop], [wide-angle lens, deep depth of field],
at [eye level / low height], moving [forward along the centre of the passage] at a constant, steady speed from the
first frame to the last, with no acceleration, no pause and no last-second reframing. The camera physically travels
past the [foreground element], the [midground element] and toward the [background element], so they slide past the
lens with real parallax (a dolly, not a zoom).

0 to [3] s: [lo que se ve mientras avanza].
[3] to [5] s: [la llegada: qué llena el plano al final].

Look: [real light and materials, documentary cinematography, colour palette].

Keep one continuous take with the camera always moving forward. Keep every surface and the lighting consistent with
the first image. Clean image: no text, no letters, no logos, no people, no rotation, no roll, no camera shake,
no flicker, no morphing.
```

Por qué cada parte:
- «One continuous shot / no cuts»: sin decirlo, Seedance puede cortar [4]; las guías de FPV usan «continuous one-take
  with no cuts or splices» [9].
- Nombrar primer plano, plano medio y fondo, y que la cámara **pasa entre ellos**, es lo que convierte un zoom en un
  dolly; «smooth constant speed, no sudden acceleration» [8]. Fórmula: «Camera [movement] [direction] toward
  [subject] at [speed]» [10].
- «Arrive naturally at the last image… hold the endpoint for the final 1-2 s» es la plantilla publicada para inicio
  y fin en Seedance 2.5 [1]. En una intro de 5 s, medio segundo basta: más, y la cámara «se para».
- Con imagen a vídeo se describe el **movimiento**, no el aspecto: el aspecto ya lo da la imagen [18].
- Para FPV: «FPV cinewhoop, ultrawide, fly-through» [19].
- Plantillas por tipo de plano (giro, despiece, bucle, transición…): `plantillas-prompt.md`; escenas realistas:
  `pedir-assets-ia/references/plantillas-por-plano.md`.

## 4. Primer y último fotograma: cuándo sí y cuándo no

El modelo interpola entre las dos imágenes. Si el camino entre ellas no es físicamente plausible en los segundos que
le das, **se lo salta**: acelera de golpe, emborrona y aparece el fin (un salto o «dos vídeos unidos»). Si el fin
está demasiado cerca, casi no hay recorrido.

| Fin respecto al inicio | Qué pasa | Qué hacer |
|---|---|---|
| Lo que la cámara vería de verdad tras avanzar unos metros: misma lente, altura, luz y lugar | Funciona | Genera el fin **a partir del inicio** (edición de imagen: «same scene, same lens, camera N metres forward») |
| Recorte ampliado de la misma imagen | Zoom plano o recorrido casi nulo | No; el fin tiene que ser otra toma de verdad |
| Otro lugar, otra luz u otra escala (túnel → pared iluminada) | Tirón o salto hacia el primer tercio o al final | Partirlo (abajo) o quitar el fin |
| Igual que el inicio | Bucle o clip casi quieto | Solo para bucles |

Si los dos fotogramas no casan en identidad, escala, luz o entorno, la llegada se vuelve brusca [1]. Las fuentes
coinciden en tres arreglos:
1. **Quitar el fin** y generar una sola continuidad con imagen de inicio y prompt de recorrido. Lo que tiene que ser
   exacto (el logo) va por código encima.
2. **Partir el caso difícil en dos pasadas** con un punto intermedio estable y un «portador» que no cambia (una luz,
   la posición de la cámara, un objeto) [2]. Ejemplo de intro con logo:
   - Pasada 1 (solo inicio): avanzar por el sitio hasta quedar frente a la pared, sin logo.
   - Se toma su último fotograma, se compone encima el logo real (por código, desde el SVG, recibiendo la luz de la
     escena).
   - Pasada 2 (inicio = último fotograma de la 1, fin = el mismo con el logo): cámara casi fija, la luz «dibuja» el logo.
   - La costura entre las dos se comprueba con `revisar-video.mjs` sobre el vídeo unido.
3. **Encadenar** clips: el último fotograma de uno es el primero del siguiente, repitiendo el prompt y cambiando solo
   la acción [20]. Seedance 2.5 tiene extensión nativa (hasta 60 s en cadena) y la unión queda «natural, no
   idéntica»: revísala [14]. Kling 4.0 admite fotogramas intermedios [21].

En Kling 1.5, poner un fin desactivaba los controles de cámara [22]; si el fin tiene otra lente, altura o escala, la
interpolación se rompe: rehaz el fin para que case con el inicio [8]. Insistir en el prompt no aumenta el
movimiento de forma fiable [12].

## 5. Resolución, duración y texto
- **Seedance 2.5:** 480p, 720p o 1080p, de 4 a 30 s. Guía publicada: 4 s para un gesto, 6-10 s para 2-3 momentos,
  12-20 s para un recorrido; cuanto más largo, más deriva [1]. **Kling 3.0:** 3-15 s [23]. **Veo 3.1:** 4, 6 u 8 s [7].
- Para scroll, 3-8 s por clip, con la cámara o el sujeto fijos, no los dos [24].
- **Letras:** a 720p la IA deforma las palabras de un logo. El símbolo sin letras, compuesto por código en la imagen
  final, sí sale exacto (§8). Cualquier texto legible va en HTML.
- 1080p blando en pantalla grande: reescala antes de extraer frames o limita el tamaño en pantalla [15].

## 6. Comprobar antes de montar (obligatorio)
```bash
node scripts/revisar-video.mjs clip.mp4            # + --json, --centro 0.5,0.45 si la cámara no avanza al centro
```
Mide y avisa de:
- **cortes de escena** (filtro `scdet` de ffmpeg, con su segundo);
- **saltos de contenido**: la imagen cambia más de lo que explica el movimiento, sin corte;
- **tirones**: la cámara se lanza durante medio segundo, emborronando, para llegar al fin (el salto disimulado), con
  el cambio de luz;
- **avance de la cámara** en acercamientos: escala cada medio segundo y total. Avanzar bien en una intro es ×1,1 o
  más por medio segundo; ×1,02 es casi parada. Sirve para comparar tramos del mismo clip; con paralaje fuerte el
  número exacto sube;
- **recorrido corto**, frenazos, acelerones, fotogramas duplicados, parpadeo y tramos quietos.

Luego mira la **hoja de contactos** (el informe da el segundo de cada viñeta) en los segundos señalados. No te fíes
solo de un revisor con IA: en un caso real dio por «quieta» una cámara que la medida mostraba avanzando y no vio el
salto. Las fuentes recomiendan mirar fotogramas sueltos (0, 30, 60, 90, 120) [7]; para cortes a mano:
`ffmpeg -i clip.mp4 -vf "select='gt(scene,0.3)',showinfo" -an -f null -` (sale por stderr) [25].

## 7. Arreglos por código (sin volver a generar)
- **La cámara frena al final:** amplía el vídeo (p. ej. a 3840 de ancho) y aplica un acercamiento suave con `zoompan`
  desde donde frena, centrado en el punto de llegada (expresión con smoothstep del tiempo). Vuelve a medir: tiene que
  seguir avanzando hasta el último medio segundo.
- **Velocidad desigual** (arranca lento y acelera): reparte los fotogramas para que la escala crezca a pasos iguales
  de log(escala) (remapeo de tiempo), en vez de regenerar.
- **Salto que no se puede quitar:** tápalo con un destello del color de la escena (`blend` con una campana gaussiana de
  ~0,15 s) o recorta el tramo. Un salto tapado sigue notándose al arrastrar el scroll despacio: mejor evitarlo (§4).
- **Móvil:** recorte central 9:16 del mismo vídeo si se generó con aire lateral (0 $). Un cuadrado nítido sobre el
  mismo vídeo desenfocado parece una caja: mejor el recorte vertical entero.
- **Bucle:** si no cierra, ida y vuelta (`reverse` + `concat`).

## 8. Lecciones de intros reales (como lecciones, no como estilo a copiar)
Intro de una web: la cámara entra por un túnel de cristal y al fondo aparece el logo en una pared. Muchas tiradas en
tres semanas, la última tanda con un tope de 6 $:
- **Kling O3 con inicio y fin (5 s, 1080p, 0,43 $):** la cámara apenas avanzó (×1,5 en todo el clip; medido) y en otra
  tirada no se movió nada hasta pasar a la pared de golpe en el s 3,9. Los fines generados repetían la boca del túnel
  (nada que recorrer) o dibujaban el símbolo girado.
- **Seedance 2.5 con inicio = boca del túnel y fin = pared con el símbolo real compuesto (5 s, 720p, 1,32 $):** el
  símbolo llegó **exacto** (comprobado con el contorno del SVG). Pero de 1,0 a 1,5 s la cámara se lanzó al doble, la
  luz cayó un 36 % y apareció otro túnel (el salto); de 3,5 a 5 s casi se paró (×1,04 y ×1,02 por medio segundo). El
  fin estaba demasiado lejos para 5 s y con tres fases en el prompt.
- **FOV:** la imagen de inicio se hizo con «35mm lens» y simetría central; el plano salió cerrado y el acercamiento de
  +20 % por código para tapar el frenazo lo cerró más.
- **Letras:** a 720p y en Kling 1080p las letras del logo salen deformadas. El símbolo real compuesto como fin, sí.
- **Velocidad:** un clip que acelera al final (+4 %, +4 %, +10 %, +35 %, +60 % por sextos) se igualó repartiendo los
  fotogramas a pasos iguales de log(escala).
- **Bucles de fondo** con Kling 3.0 std, cámara fija e inicio = fin: sin costura y de ~30 KB codificados.
- **Lo que habría salido a la primera:** imagen de inicio gran angular; pasada 1 de Seedance solo con inicio, recorrido
  sin logo, 5 s; su último fotograma con el logo compuesto; pasada 2 corta con cámara casi fija; `revisar-video` en
  cada una antes de seguir. Unos 2,4 $ a 720p (5 s + 4 s), o 3 $ con una prueba previa a 480p, frente a los 5,4 $ de
esa última tanda.

## 9. Montaje en la web
Dos caminos (detalle y código en `scroll-frames`):
- **Secuencia de imágenes en canvas** (lo más fiable en móvil): 60-150 frames para un hero, 15-40 KB por WebP,
  5-15 MB en total, ~1600-1920 px en escritorio y ~960 px en móvil, calidad 75-80 [26][27]. Extrae a 24 fps, nunca
  por encima de los del clip; `decode()` de los primeros ~20 antes de dibujar y DPR limitado a 2 [24].
- **`<video>` con `currentTime`** (pesa menos): codifica todo intra para que cada posición sea un fotograma clave:
  ```bash
  ffmpeg -i clip.mp4 -vf "fps=24,scale=1280:-2" -c:v libx264 -g 1 -keyint_min 1 -bf 0 -x264-params scenecut=0 \
    -pix_fmt yuv420p -crf 23 -an -movflags +faststart scrub.mp4
  ```
  Ocupa ~2 veces más que el normal [28]. El servidor tiene que responder 206 a las peticiones Range; no pidas otra
  posición hasta el evento `seeked` (con tope de ~250 ms) [29]. x264 se arrastra mejor que x265; evita HEVC y 10 bits
  [29][30]. En táctiles hay quien cambia el scrub por un bucle porque en iOS no es fiable [29]: decide con
  `scroll-frames` y pruébalo en un móvil real. VP9 y AV1 para scrub: sin medidas publicadas.

## 10. Presupuesto (precios medidos en la API de Higgsfield, noviembre de 2026)

| Modelo | 480p | 720p | 1080p | 5 s a 720p |
|---|---|---|---|---|
| Seedance 2.5 | 0,118 $/s | 0,265 $/s | 0,652 $/s | 1,32 $ |
| Kling O3 pro | — | 0,068 $/s | 0,086 $/s | 0,34 $ |
| Kling 3.0 std / pro | — | 0,071 $/s (std) | 0,096 $/s (pro) | 0,36 $ |

En la web de Higgsfield va por créditos (~0,049 $ el crédito en el plan Plus, según terceros): Seedance 2.5 unos
15 créditos por 5 s a 480p y 35 a 720p; Kling 3.0 unos 7,5-10 por 5 s a 720p; Veo 3.1 unos 40 por 4 s [31][32].
Precios por segundo y tabla completa: `pedir-assets-ia/scripts/precios.json` y `references/proveedores.md`; cálculo
con `presupuesto.mjs`. Intro típica bien planificada: 1 prueba a 480p + 2 pasadas a 720p ≈ 3 $ con Seedance 2.5, o
menos de 1 $ con Kling.

## Fuentes
1. Clipdance, «Seedance 2.5 first & last frame prompt workflow»: https://clipdance.ai/blog/seedance-2-5-first-last-frame-prompt-workflow
2. Emily2040/seedance-2.0, guía de primer y último fotograma (fallos, «carrier», partir en dos): https://github.com/Emily2040/seedance-2.0/blob/main/references/first-last-frame-guide.md
3. MKAnime, arreglar la cámara y el final en Seedance 2.5: https://mkanime.ai/guides/fix-seedance-2-5-character-camera-ending
4. ChatCut, cómo usar Seedance 2 (por qué corta): https://chatcut.io/blog/how-to-use-seedance-2
5. osidemedia/higgsfield-ai-prompt-skill, Seedance 2.5 (modos, límites, proporción): https://github.com/osidemedia/higgsfield-ai-prompt-skill/blob/main/skills/higgsfield-seedance-2-5/SKILL.md
6. higgsfield-ai/skills (skills oficiales; solo leído el README, no instalado): https://github.com/higgsfield-ai/skills
7. Masonry, mejor modelo de vídeo IA para anuncios de producto: https://masonry.so/blog/best-ai-video-model-for-product-ads
8. Atlas Cloud, movimiento de cámara controlado en Kling 4: https://www.atlascloud.ai/blog/tips/kling-4-controlled-camera-movement
9. Leeveo, flujo de dron FPV con IA: https://leeveo.substack.com/p/the-ai-fpv-drone-workflow-turn-any
10. Leeveo, prompts de cámara en Seedance: https://leeveo.substack.com/p/master-camera-prompts-in-seedance
11. Atlas Cloud, movimiento de cámara en Seedance 2.5 Flash: https://atlascloud.ai/blog/tips/seedance-2.5-flash-cinematic-camera-movement
12. mer.vin, qué modelos aceptan de verdad primer y último fotograma: https://mer.vin/2026/09/which-ai-video-models-actually-take-a-first-and-last-frame/
13. Eachlabs, Kling frente a Seedance: https://www.eachlabs.ai/blog/kling-vs-seedance-which-model-for-which-shot
14. Seedance.tv, extender vídeo en Seedance 2.5: https://www.seedance.tv/blog/how-to-extend-video-seedance-2-5
15. Chase AI, webs con scroll 3D con Claude Code y Nano Banana 2: https://chaseai.io/blog/claude-code-nano-banana-2-3d-scroll-websites
16. AI Tools Guidebook, deformación de producto en vídeo IA: https://aitoolsguidebook.com/en/articles/ai-video-product-deformation/
17. Refvid, logos y envases fieles: https://refvid.com/how-to-keep-logos-and-packaging-accurate
18. Seedance.tv, guía de prompts de Seedance 2.0: https://www.seedance.tv/blog/seedance-2-0-prompt-guide-2026
19. Renoise, movimiento de cámara con IA: https://renoise.ai/guides/ai-camera-movement
20. imgveo, vídeos IA más largos: https://imgveo.com/blog/how-to-make-longer-ai-videos
21. Fuser, alargar vídeo IA: https://fuser.studio/articles/extend-ai-video-length
22. Pollo, movimiento de cámara en Kling: https://pollo.ai/hub/how-to-use-kling-ai-camera-movement
23. fal, Kling 3: https://fal.ai/kling-3
24. Internet Toolbox, frames para animación por scroll: https://internettoolbox.it/guides/scroll-animation-frames/
25. FFmpeg Micro, detección de escenas: https://www.ffmpeg-micro.com/blog/ffmpeg-scene-detection-auto-split-a-long-video-at-scene-changes
26. Scrollsequence, secuencias que van lentas en móvil: https://beta.scrollsequence.com/blog/image-sequence-lagging-on-mobile-9-fixes
27. AI CSS Animations, animaciones de scroll al estilo Apple: https://www.aicssanimations.com/guides/apple-style-scroll-animations
28. HermeticOrmus/scroll-scrub: https://github.com/HermeticOrmus/scroll-scrub
29. Red Eye Automations, fondos de vídeo con scrub: https://redeyeautomations.com/notes/scroll-scrub-video-backgrounds
30. ericswpark, scrub de vídeo suave: https://ericswpark.com/blog/2023/2023-08-07-smooth-scrubbing-videos-version-2/
31. Genativity, precios de Higgsfield: https://genativity.com/guides/higgsfield-pricing
32. Aliteq, qué modelo de Higgsfield usar: https://aliteq.com/which-higgsfield-model-to-use

Sin verificar o sin fuente: que «24mm» en el prompt del vídeo abra el plano; recetas específicas para cristal; VP9/AV1
para scrub; los créditos de la web de Higgsfield (de terceros). Los precios de la tabla del §10 sí están medidos.
