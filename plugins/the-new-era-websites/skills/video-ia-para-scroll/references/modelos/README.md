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

## Precios de todos los modelos
La tabla medida de Higgsfield (dólares por segundo en la API y créditos de la web por resolución, duración e inicio +
fin), lo que no está en la API y los demás proveedores están en un solo sitio:
[proveedores.md](../../../pedir-assets-ia/references/proveedores.md) de `pedir-assets-ia` («Vídeo en Higgsfield: tabla
medida»). Fuera de Higgsfield, Runway describe bien la cámara (Gen-4.5 solo con inicio; Aleph edita un vídeo hecho) y
Luma tiene modo bucle y hasta 16 fotogramas clave.

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
