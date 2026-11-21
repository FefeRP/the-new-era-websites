# Otros modelos de vídeo de Higgsfield y sus herramientas de cámara

## Cinema Studio (Higgsfield)
- **Cinema Studio 4.0** va sobre Seedance 2.5: 4-30 s, **solo 480p / 720p**, referencias 30 imágenes, 10 vídeos y 10
  audios. Controles: `camera_model_id` (cuerpo), `camera_lens_id` (Clean Sharp, Anamorphic, Vintage),
  `camera_aperture_id` (f/1.4-f/11), `pacing_id` (incluido toma única), luces a medida y 30+ movimientos de cámara
  (dolly-in, drone-orbit, arc, crane-up, slider, static-shot, bullet-time…).
  «The specific move still comes from the prompt, and the preset sets the register it runs in» [1]: el preset da el
  estilo; el movimiento exacto sigue saliendo del prompt.
- **Cinema Studio 3.5:** `camera_style` (one_take, silent_machine, classic_static, dreamy_flow, impossible_camera…),
  `light_scheme`, `color_grading`. **Video v2:** `speedramp` con opción `linear` (la que quieres para scroll).
- **Para webs:** útil para fijar el registro (cuerpo, lente, luz) igual en todos los clips de un proyecto. 720p se
  queda corto para un hero de escritorio a pantalla completa: reescala (`../flujos.md`) o úsalo en planos medianos.
- La imagen equivalente, `cinematic_studio_image`, sí controla la **focal** (ver `imagen-clave.md`).

## DoP y los presets de cámara (Higgsfield «Standard»)
- 66 presets en https://higgsfield.ai/camera-controls, que corren en DoP (Lite / Standard / Turbo): **720p, 3 o 5 s**,
  imagen a vídeo. «Pick the move first and write the scene second — the preset is the star» [2]. Mix: combinar dos
  movimientos (mejor uno grande y uno pequeño).
- **Para planos largos a velocidad constante, el movimiento escrito en Seedance o Kling funciona mejor que un preset
  de DoP** (720p y 5 s se quedan cortos). Los presets sirven para probar un movimiento rápido y barato. Cuáles sirven
  para webs: `../modelos-y-camaras.md`.

## MiniMax H3 y Hailuo 2.3
- **MiniMax H3:** «2K» fijo, 5-15 s, con fotograma final, marca de agua de IA (`aigc_watermark`). API: H3 lite 6 s a
  768p 0,24 $ y a 480p 0,15 $. Web: H3 a 2K, 10 créditos.
- **Hailuo 2.3:** 768p fijo, 6 o 10 s, `prompt_optimizer` (apágalo), buena física, solo inicio. Desde 0,047 $/s.
- **Para webs:** física barata (líquidos, telas) para probar; no para el hero principal.

## Grok Imagine Video 1.5 (xAI)
- Imagen de inicio obligatoria, 1-15 s, 480p / 720p / 1080p (1080p no con referencias), 8 proporciones. O una imagen,
  o hasta 7 imágenes más audio. **Sin fin.**
- API 5 s 720p: 0,71 $; web 1080p: 40 créditos. Caro para lo que da en webs: no lo uses por defecto.

## LTX-2.5 pro y Happy Horse 1.1
- LTX-2.5 pro: 6 s a 1080p, 1,02 $. Happy Horse 1.1: 5 s a 1080p, 0,90 $. Sin ventaja clara para scroll frente a
  Kling o Wan al mismo precio; sin guías publicadas para webs.

## Herramientas de vídeo (créditos de la web)
| Herramienta | Créditos | Para qué |
|---|---|---|
| `video_deflicker` | 2 | Parpadeo de luz entre fotogramas |
| `video_upscale` | 2 | Reescalado general |
| `bytedance_video_upscale` (preset AIGC, 1080p) | 1 | El reescalado más barato y fiel para vídeo de IA |
| `topaz_video` (Starlight, Proteus…; interpolación) | sin estimación sin vídeo | Reescalado de máxima calidad |
| `fps_boost` | sin estimación sin vídeo | Interpolar fotogramas |
| `reframe`, `video_background_remover`, `sam_3_video`, `depth_anything_video` | — | Reencuadre, quitar fondo, máscaras y profundidad (útil para `capas-alfa` y `parallax-capas`) |

Detalle de upscale y deflicker: `../flujos.md`.

## Fuentes
1. Dreamdrive, guía de presets de cámara de Higgsfield [leída entera]: https://dreamdrive.ai/learn/higgsfield/higgsfield-camera-presets-guide/
2. Higgsfield Help Center, cómo usar DoP [leída entera]: https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-dop
3. Aliteq, movimientos de cámara de Higgsfield [leída entera]: https://aliteq.com/higgsfield-camera-moves
4. Documentación de la API de Higgsfield, MiniMax H3, Hailuo 2.3, Grok video 1.5, Cinema Studio 4 [leída entera]: https://docs.higgsfield.ai
