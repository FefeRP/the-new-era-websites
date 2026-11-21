# Veo 3.1 (Google) · Fast, Lite y Gemini Omni Flash

**Para qué en una web:** el plano de **máxima calidad de luz y materiales** en 8 s, y las transiciones A→B con dos
fotogramas cuando el cambio es grande (un arco de 180° de un lado al otro del sujeto). En Higgsfield **solo está en la
web y el MCP**, no en la API de pago por uso.

## Parámetros reales
- **Duración: 4, 6 u 8 s.** A 1080p, 4K o con imágenes de referencia, **solo 8 s** [1][2].
- Calidad en el MCP (`veo3_1`): basic / high / ultra. 16:9 o 9:16. 24 fps. Audio siempre activo en Google; marca de
  agua invisible SynthID.
- **Inicio + fin:** en el MCP de Higgsfield, `veo3_1` solo admite `start_image`; **`veo3_1_lite` admite `end_image`**.
  La página de Veo 3.1 en la web anuncia inicio y fin y hasta 3 referencias: contradice al MCP, compruébalo en el
  botón antes de pagar. En Google, `lastFrame` siempre va con `image` [1].
- **Referencias («ingredients»):** hasta 3 imágenes y obligan a 8 s. Lite no admite referencias [1].
- **Extender:** +7 s desde el último segundo, hasta 20 veces (148 s), solo a 720p y solo con vídeos de Veo de menos
  de 2 días [3].
- La versión preview de la Gemini API cerró el 22-10-2026; queda la definitiva en Vertex (`veo-3.1-generate-001`) y
  Gemini Omni Flash.

## Precio
- **Web / MCP, créditos por 8 s:** Fast basic 32 · Preview high 80 · **Lite 12** · Gemini Omni Flash 1.2 a 1080p 26.
- Vertex (referencia, sin confirmar la fecha): Veo 3.1 ~0,20 $/s sin audio y 0,40 con audio; Fast 0,10-0,12; Lite
  0,05-0,08.

## Qué hace bien
- Luz, reflejos y materiales: el más «de cine» en pruebas de anuncios de producto, aunque se inventa elementos [4].
- Transición con dos fotogramas que comparten sujeto: el ejemplo oficial es «The camera performs a smooth 180-degree
  arc shot, starting with the front-facing view of the singer and circling around her to seamlessly end on the POV
  shot from behind her on stage» [5].
- Revelado de logo con dos fotogramas: inicio con la superficie vacía o formas sueltas y fin con el logo (ver
  `../flujos.md`, «Marca»).

## Fallos conocidos
- Rediseñó un logo simple en pruebas (Veo 3.1 Fast) [4]. Logo y texto, por código.
- 8 s obligatorios a 1080p: para scroll suele sobrar; recórtalo y paga 8.
- La semilla ayuda poco; generar varios a la vez empeora el resultado [2].
- Algunas lentes y ángulos «are not officially supported» [6].

## Prompt de partida
Fórmula oficial: **[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]** [5]. Vocabulario:
static, pan, tilt, dolly, truck, pedestal, zoom, crane, aerial, handheld, whip pan, arc. **Sin «no» ni «don't»**:
describe lo que quieres («a desolate landscape with no buildings or roads» en lugar de «don't show buildings») [6].
```
Slow crane shot rising from low on the [subject] to high above, revealing [context] at [time of day], one
continuous movement at constant speed, steady horizon, soft natural light, photoreal.
```
Dolly frente a zoom, según Vertex: el dolly «the camera physically moves closer»; el zoom «the lens changes its focal
length» [6]. Para scroll casi siempre quieres el dolly.

## Fuentes
1. Google AI Studio, documentación de Veo [leída entera]: https://aistudio.google.com/docs/veo
2. Google, Veo 3.1 en Vertex [parcial]: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/veo/3-1-generate
3. Google Cloud, extender un vídeo de Veo [parcial]: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/extend-a-veo-video
4. Masonry, mejor modelo para anuncios de producto [parcial]: https://masonry.so/blog/best-ai-video-model-for-product-ads
5. Google Cloud, guía definitiva de prompts de Veo 3.1 [leída entera]: https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
6. Vertex AI, guía de prompts de vídeo [leída entera]: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide y buenas prácticas [leída entera]: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/best-practice
7. DeepMind, guía de prompts de Veo [leída entera]: https://deepmind.google/models/veo/prompt-guide/
