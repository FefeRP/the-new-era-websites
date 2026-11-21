# Cámara: presets de Higgsfield, lente y movimiento (noviembre de 2026)

Los modelos, sus parámetros y precios están ahora en `modelos/` (una ficha por modelo) y la elección en
`arbol-decision.md`. Aquí, la cámara.

## Cómo se controla la cámara en Higgsfield
- **Presets de DoP** (la galería de https://higgsfield.ai/camera-controls, 66 movimientos): corren en DoP «Standard»
  (Lite / Standard / Turbo), **720p, 3 o 5 s**, imagen a vídeo. «Pick the move first and write the scene second — the
  preset is the star» [1]. «Mix» combina dos (mejor uno grande y uno pequeño) [2].
- **Cinema Studio 4.0** (sobre Seedance 2.5, 4-30 s, 480p/720p): 30+ movimientos, cuerpo, lente (Clean Sharp,
  Anamorphic, Vintage), apertura f/1.4-f/11 y ritmo. «The specific move still comes from the prompt, and the preset
  sets the register it runs in» [3].
- **El movimiento escrito en el prompt** de Seedance, Kling, Veo o Wan: para planos largos a velocidad constante
  funciona mejor que un preset de DoP (que se queda en 720p y 5 s).
- **Fotogramas clave:** inicio + fin en Seedance 2.0/2.5, Kling 3.0, O3, Veo 3.1 Lite y Wan 2.7/3.0; intermedios
  (hasta 10) en Kling 4.0. Kling 3.0 Turbo solo inicio [4].

## La lente y el FOV
- **En imagen a vídeo, el FOV lo fija la imagen.** «24mm» en el prompt refuerza, no cambia (indicios de varias
  fuentes, sin prueba controlada) [5][6]. Para fijarlo, genera la imagen de inicio con `cinematic_studio_image` y
  `camera_focal_length_id` (`modelos/imagen-clave.md`).
- En texto a vídeo sí cuenta: Wan 3.0 usa los mm; Higgsfield escribe el zoom en grados («from [18] degrees to [84]
  degrees») y fija la lente con «The field of view never changes, no zoom» [7].
- **Dolly frente a zoom:** el dolly «the camera physically moves closer»; el zoom «the lens changes its focal length»
  (Vertex) [8]. Higgsfield: el dolly tiene «near objects sweeping out past the frame edges with strong parallax»; el
  zoom, «ZERO parallax: the far background keeps the exact same apparent size» [7]. Para scroll, casi siempre dolly.

## Presets: cuáles sirven para una web
| Preset | ¿Sirve? | Para qué / por qué |
|---|---|---|
| Dolly In / Out, Super Dolly In / Out | **Sí** | La base de una intro (3-5 s, 720p) |
| Double Dolly | No | Da un tirón a mitad |
| Zoom In / Out | Solo fondos | Sin paralaje: parece una foto ampliada |
| Crash Zoom, Rapid Zoom, YoYo Zoom, Eyes In, Mouth In, Eating Zoom | No | Cambios de velocidad |
| Dolly Zoom | Puntual | Efecto, no recorrido |
| 360 Orbit, Arc Left / Right, Lazy Susan, 3D Rotation | **Sí, producto** | Mejor un arco (90-180°) o la imagen a 3/4; 360 solo sin texto |
| Bullet Time | Posible | Producto congelado con cámara alrededor |
| Crane Up / Down, Jib Up / Down, Aerial Pullback, Overhead | **Sí** | Revelados y transiciones entre secciones |
| FPV Drone, Flying Cam, Road Rush | Sí, intro | Pero inventan y la velocidad no es constante: mide |
| Through Object In / Out | **Sí** | Transición atravesando algo |
| Pan lento | Fondos | — |
| Whip Pan | Solo como corte | — |
| Static, General | **Sí** | Fondos en bucle |
| Hyperlapse, Timelapse | Fondos | Ciudad, cielo |
| Handheld, Wiggle, Snorricam, Head Tracking, Robo Arm, Object POV, Dutch Angle, Incline, Fisheye, Low Shutter, Focus Change | No | Tiemblan, deforman o cambian el foco |
| Glam, Hero Cam, BTS, Buckle Up, Car | No | Pensados para personas y anuncios |
Fuentes de la tabla: [1][2][9][10] más las reglas de scroll (un movimiento, velocidad constante).

## Velocidad constante: cómo pedirla
- «constant speed», «one constant angular speed», «no speed changes, no steps, no drift» [7].
- Kling: «constant velocity, no drift, no reframing; precision-slider smoothness, not handheld» [7].
- No escribas «settling into a static hold» ni «hold for 1-2 s» si no quieres que frene.
- Seedance 2.0: «slow, gentle, continuous small movements» [11].
- Un solo movimiento: «Try to specify only 1 type of camera movement in a single shot» (BytePlus) [11]; «one main move
  per shot is usually better» (Kling) [12].

## Resolución y aspecto
- La prueba a 480p (Seedance) o en el modo más barato; la final a 720p o 1080p según `arbol-decision.md`.
- 16:9 con margen lateral → el recorte 9:16 para móvil sale del centro. Si el producto es alto y estrecho, genera una
  toma 9:16 con la misma imagen clave.
- 24 fps basta (Wan sale a 30): 5 s son 120-150 fotogramas, de sobra para un 300 % de scroll.

## Fuentes
1. Higgsfield Help Center, cómo usar DoP [leída entera]: https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-dop
2. Aliteq, movimientos de cámara de Higgsfield [leída entera]: https://aliteq.com/higgsfield-camera-moves
3. Dreamdrive, guía de presets de cámara de Higgsfield [leída entera]: https://dreamdrive.ai/learn/higgsfield/higgsfield-camera-presets-guide/
4. Higgsfield, inicio y fin en Kling Turbo [leída entera]: https://higgsfield.ai/blog/A-Guide-to-Kling-Turbo-Start-End-Frame
5. ScreenWeaver, prompts de lente [parcial]: https://screenweaver.ai/blog/lens-prompts-ai-video
6. Alibaba Cloud, guía de prompts de Wan [leída entera]: https://www.alibabacloud.com/help/en/model-studio/text-to-video-prompt
7. Higgsfield, control de cámara en vídeo IA [leída entera]: https://higgsfield.ai/blog/ai-video-camera-control
8. Vertex AI, guía de prompts de vídeo [leída entera]: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide
9. Higgsfield, galería de controles de cámara [parcial]: https://higgsfield.ai/camera-controls
10. Kling, guía de control de cámara [leída entera]: https://kling.ai/blog/kling-ai-camera-control-video-guide
11. BytePlus, guía de prompts de Seedance 2.0 [leída entera]: https://ai.byteplus.com/ark/region:ap-southeast-1/docs/seedance-2-0-prompt-guide
12. Kling, guía de prompts [leída entera]: https://kling.ai/blog/kling-ai-prompt-guide
