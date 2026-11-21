# Kling 3.0, 3.0 Turbo, O3 (Omni) y los Kling baratos (2.6, 2.5 Turbo, O1)

**Para qué en una web:** el inicio + fin **más barato** (transiciones entre secciones, acercarse a algo concreto),
giros y arcos de producto, bucles de fondo con inicio = fin, y pruebas. Es el más fiel al producto y el que menos
inventa, pero también el que menos se mueve [1].

## Parámetros reales
| Modelo | Duración | Resolución | Inicio + fin | Otros |
|---|---|---|---|---|
| **Kling 3.0** std / pro / 4k | 3-15 s | 720p / 1080p / 4K | Sí (`last_image_url`) | `cfg_scale` 0-1 (0,5), `elements`, `multi_shots`, `multi_prompt` (1-6 planos, 512 car. cada uno), sonido activado por defecto, prompt hasta 2500 car. |
| **Kling 3.0 Turbo** | 3-15 s | 720p / 1080p | **No**, solo inicio | sin sonido |
| **Kling O3** (Omni 3) | 3-15 s | std / pro / 4k | Sí (`first_frame_url` + `last_frame_url`) | sonido **desactivado** por defecto, `multi_shots`; también referencia de imágenes, de vídeo (3-10 s) y edición |
| Kling O1 (Omni) | 5/10 s | — | Sí | — |
| Kling 2.6 pro | 5/10 s | 1080p | No | sonido, `cfg_scale` |
| Kling 2.5 Turbo | 5/10 s | 720p / 1080p | No | **`negative_prompt`** (el único Kling con campo negativo) |

Ninguno tiene semilla. Proporción: en imagen a vídeo la marca la imagen.

**Ojo:** en la API oficial de Kling `multi_shot` viene **activado por defecto**: para una toma continua ponlo a
`false` (en Higgsfield viene desactivado, pero compruébalo) [2].

## Precio (21-11-2026)
- **API, $/s:** 3.0 std 720p 0,0714 · 3.0 pro 1080p 0,0962 · 3.0 4K 0,3151 · 3.0 Turbo 0,0839 / 0,1049 ·
  **O3 0,0683 / 0,0860** (igual en std, pro y 4k para FLF) · O1 0,0632 / 0,0837 · 2.6 pro 0,0666 ·
  2.5 Turbo 0,0315 / 0,0525.
- La tabla de la consola muestra también 0,107 (std) y 0,144 (pro): casi seguro es **con sonido** (la tarifa oficial
  de Kling sube un 50 % con audio). Apaga el sonido.
- **Web, créditos por 5 s:** 3.0 std 7,5 · pro 8,75 · 4k 30 · O3 FLF pro 6,25 · 2.5 Turbo ~4-6.
- Un clip de 5 s a 1080p con O3: 0,43 $. Es el inicio + fin más barato de la API.

## Qué hace bien
- Geometría estable y fidelidad al producto (forma, color, etiqueta) [1].
- Respeta bien inicio y fin cuando el camino entre ellos es corto y plausible.
- Bucles sin costura con inicio = fin y cámara fija (medido: bucles de fondo de ~30 KB codificados).
- 3.0 multiplano: hasta 6 planos en 15 s con `[Shot 1: Wide shot] …` cuando sí quieres cortes (no para scroll) [3].

## Fallos conocidos
- **«No se mueve»**: con inicio + fin puede quedarse casi quieto y saltar al fin al final. Medido en una intro: ×1,5
  de escala en todo el clip, y en otra tirada nada hasta un salto a la pared en el s 3,9. Mide con
  `revisar-video.mjs` [lección propia].
- «If the prompt describes motion that can't reach the end frame… the result drifts» [4].
- Reescribe letras pequeñas y, con un fin generado, dibujó el símbolo girado.
- **Turbo no tiene fin**: «Turbo has no end frame, so destination shots stay on 3.0» [5].
- Mezclar movimientos («Static camera with fast push-in and orbit») da resultados incoherentes [6].

## Prompt de partida (vocabulario de Kling: push in, pull back, pan, tilt, track forward, orbit slowly, static camera) [6]
Giro de producto:
```
The camera orbits slowly around the [product] in one 90-degree arc, constant velocity, no drift, no reframing,
precision-slider smoothness, not handheld. The product remains static, only the camera moves. Lighting stays
constant. One continuous shot.
```
Revelado: «Start with [close/wide view], then [camera movement] to reveal [final view]» [6].
Acercamiento: «CAMERA Slow hypnotic dolly-in along the lens axis toward [subject], constant velocity, no drift, no
reframing; precision-slider smoothness, not handheld.» [7]

## Cuándo usar cuál
- Prueba barata del movimiento → 2.5 Turbo (0,03-0,05 $/s) o 3.0 std.
- Inicio + fin final → O3 (más barato) o 3.0 pro.
- Bucle de fondo → 3.0 std con inicio = fin.
- Solo inicio y algo más rápido → 3.0 Turbo.

## Fuentes
1. Masonry, mejor modelo para anuncios de producto [parcial]: https://masonry.so/blog/best-ai-video-model-for-product-ads
2. Kling, API de imagen a vídeo [parcial]: https://app.klingai.com/global/dev/document-api/apiReference/model/imageToVideo
3. Kling, guía multiplano de 3.0 [parcial]: https://kling.ai/blog/kling-video-3-multi-shot-guide
4. Higgsfield, guía de Kling 3.0 [parcial]: https://higgsfield.ai/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation
5. Higgsfield, inicio y fin en Kling Turbo [leída entera]: https://higgsfield.ai/blog/A-Guide-to-Kling-Turbo-Start-End-Frame
6. Kling, guía de prompts [leída entera]: https://kling.ai/blog/kling-ai-prompt-guide y control de cámara [leída entera]: https://kling.ai/blog/kling-ai-camera-control-video-guide
7. Higgsfield, control de cámara en vídeo IA [leída entera]: https://higgsfield.ai/blog/ai-video-camera-control
8. Kling, facturación de la API [leída entera]: https://app.klingai.com/global/dev/document-api/productBilling/billingMethod
9. Documentación de la API de Higgsfield, Kling 2.5 Turbo, 2.6, 3, O3 y Omni [leída entera]: https://docs.higgsfield.ai
