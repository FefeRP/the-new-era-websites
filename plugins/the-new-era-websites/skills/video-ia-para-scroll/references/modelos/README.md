# Guía por modelo (Higgsfield, noviembre de 2026)

Una ficha por modelo, todas con la misma estructura: para qué sirve en una web, parámetros reales (API y web), precio
medido, fallos conocidos y un prompt de partida. Los precios en **$** son de la API de Higgsfield (`POST /estimate`,
gratis, medidos el 21-11-2026 con `scripts/estimar-higgsfield.mjs`). Los precios en **créditos** son de la web y el
MCP (`estimate_video_cost`, también gratis). Son dos tarifas distintas: no conviertas una en otra.

| Ficha | Modelos | Lo que mejor hace en una web |
|---|---|---|
| [seedance-2-5.md](seedance-2-5.md) | Seedance 2.5, 2.5 Flash, borrador | Intro larga de una sola toma, recorrido con paralaje real, hasta 30 s |
| [seedance-2-0.md](seedance-2-0.md) | Seedance 2.0, Fast, Mini | Revelado de logo que termina en una imagen final, hero de 5 s, pruebas baratas (Mini) |
| [kling-3-y-o3.md](kling-3-y-o3.md) | Kling 3.0 std/pro/4k, 3.0 Turbo, O3, O1, 2.6, 2.5 Turbo | Inicio + fin barato, transiciones, giros de producto, bucles |
| [kling-4.md](kling-4.md) | Kling 4.0, 4.0 Flash | Recorrido guiado con fotogramas intermedios (hasta 10), 30 s, HDR |
| [veo-3-1.md](veo-3-1.md) | Veo 3.1, Fast, Lite, Gemini Omni Flash | Luz y materiales de máxima calidad en 8 s, transiciones A→B con dos fotogramas |
| [wan.md](wan.md) | Wan 2.6, 2.7, 3.0, 3.0 Prime | Lo más barato a 1080p y la única familia con semilla + prompt negativo (repetible) |
| [otros-video.md](otros-video.md) | MiniMax H3 / Hailuo 2.3, Grok Video 1.5, LTX-2.5, Happy Horse, Cinema Studio, DoP | Casos puntuales; Cinema Studio para registro de cámara y lente |
| [imagen-clave.md](imagen-clave.md) | Nano Banana, Seedream, GPT Image, Cinema Studio Image, Soul, Flux, Qwen, Recraft | La imagen de inicio y la de fin: aquí se fija el FOV, la luz y la marca |

## Tabla rápida

Precio por segundo en la API (sin audio). Entre paréntesis, créditos de la web por 5 s.

| Modelo | Duración | 480p | 720p | 1080p | 4K | Inicio + fin |
|---|---|---|---|---|---|---|
| Seedance 2.5 | 4-30 s | 0,118 (15) | 0,265 (35) | 0,652 (80) | — | Sí (el fin se recorta a la proporción del inicio) |
| Seedance 2.0 | 4-15 s | 0,080 | 0,174 (22,5) | 0,429 (60) | 0,891 | Sí |
| Seedance 2.0 Mini | 4-15 s | — | (5) | — | — | Sí |
| Kling 3.0 std / pro / 4k | 3-15 s | — | 0,071 (7,5) | 0,096 (8,75) | 0,315 (30) | Sí |
| Kling 3.0 Turbo | 3-15 s | — | 0,084 | 0,105 | — | **No** (solo inicio) |
| Kling O3 (FLF) | 3-15 s | — | 0,068 | 0,086 (6,25) | — | Sí |
| Kling 2.5 Turbo pro | 5/10 s | — | 0,032 | 0,053 | — | No |
| Kling 4.0 | 3-30 s | — | 0,126 | 0,188 (18,75) | 0,549 | Sí + intermedios |
| Kling 4.0 Flash | 3-20 s | — | 0,094 (7,5) | — | — | No |
| Veo 3.1 / Fast / Lite | 4/6/8 s | solo web: 8 s Fast 32 cr, High 80 cr, Lite 12 cr | | | | Lite y web (ver ficha) |
| Wan 3.0 | 2-30 s | 0,038 | 0,075 | 0,150 (15) | — | Sí |
| Wan 3.0 Prime | 2-30 s | 0,051 | 0,105 | 0,210 (27,5) | — | Sí |
| Wan 2.7 | 2-15 s | — | 0,075 | 0,113 (12,5) | — | Sí |

Por clip: Kling 4.0 Flash 5 s 0,47 $; MiniMax H3 lite 6 s 0,24 $ (768p); Grok Video 1.5 5 s 720p 0,71 $; LTX-2.5 pro
6 s 1080p 1,02 $; Happy Horse 1.1 5 s 1080p 0,90 $.

Herramientas (créditos de la web): deflicker 2, upscale 2, ByteDance upscale a 1080p (preset AIGC) 1. Topaz y
fps_boost no se pueden estimar sin el vídeo.

**Lo que no está:** Sora 2 no aparece en Higgsfield (ni web, ni API, ni skills oficiales). Veo, Nano Banana, GPT
Image y Flux no están en la API de pago por uso; sí en la web y el MCP (Seedream 5 Pro sí está en la API: 0,108 $). Seedance 2.5 Flash existe en BytePlus
y en el MCP de Higgsfield (25 créditos 5 s a 720p), no en la API.

## Lo común a todos (léelo una vez)
- **Imagen a vídeo**, nunca texto a vídeo, para todo lo que tenga producto o marca. La imagen manda: encuadre, lente,
  luz y proporción salen de ella. El prompt describe **solo el movimiento** [1][2].
- **Un movimiento de cámara por plano.** Lo dicen BytePlus («Try to specify only 1 type of camera movement in a single
  shot»), Kling («one main move per shot is usually better») y Wan («Generate single shot») [3][4][5].
- **Restricciones en positivo.** Casi ninguno tiene campo negativo (solo Wan y Kling 2.5 Turbo en la API). Escribe lo
  que sí: «one continuous take, locked exposure, clean background» [1][3].
- **Menos de ~200 tokens** por prompt: con prompts muy largos el resultado se deforma [1].
- **Sin audio** (`generate_audio: false`): en Seedance el audio no cambia el precio en la web, pero añade una pista que
  no vas a usar; en Kling 3.0 y 4.0 sí encarece.
- Lo que entrega Higgsfield **no sirve tal cual para scroll**: los clips llegan con **un solo fotograma clave en todo
  el clip** (medido: 121 fotogramas, 1 clave, Kling 1080p a ~24 Mb/s, Seedance 720p a ~15 Mb/s). Recodifica siempre
  (`../montaje-web.md`).

## Fuentes
1. higgsfield-ai/skills, `higgsfield-generate/references/prompt-engineering.md` [leída entera]: https://github.com/higgsfield-ai/skills
2. Alibaba Cloud, guía de prompts de Wan («The image defines the entity, scene, and style») [leída entera]: https://www.alibabacloud.com/help/en/model-studio/text-to-video-prompt
3. BytePlus, guía de prompts de Seedance 2.0 [leída entera]: https://ai.byteplus.com/ark/region:ap-southeast-1/docs/seedance-2-0-prompt-guide
4. Kling, guía de control de cámara [leída entera]: https://kling.ai/blog/kling-ai-camera-control-video-guide
5. Alibaba Cloud, guía de prompts de Wan 3.0 [parcial]: https://www.alibabacloud.com/help/en/model-studio/wan3-video-generation-prompt-guide
6. Higgsfield, documentación de modelos de la API [leída entera, por modelo]: https://docs.higgsfield.ai
7. Higgsfield, precios de la web [leída entera]: https://higgsfield.ai/pricing
