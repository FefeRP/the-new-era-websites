# Modelos de imagen para la imagen clave (inicio y fin)

En imagen a vídeo, **la imagen fija el encuadre, la lente, la luz, la proporción y la marca**. Lo que no esté bien en
la imagen no lo arregla el vídeo: itera aquí (unos 2 créditos o 0,05-0,10 $ por imagen) y no en el vídeo (30-40 veces
más caro).

## El FOV y la lente se fijan en la imagen, no en el prompt del vídeo
- Wan: «The image defines the entity, scene, and style» [1]. Vertex: la imagen es «the basis for everything that
  follows» [2]. ScreenWeaver: «A start image shot wide can't become telephoto because the text says 200mm» [3].
- Escribir «24mm» en el prompt del vídeo **refuerza** la lente que ya tiene la imagen; no la cambia (por indicios de
  varias fuentes; nadie ha publicado una prueba controlada). Y «35mm lens» no es lo mismo que «shot on 35mm film» [3].
- **Cómo controlarlo de verdad:** en Higgsfield, `cinematic_studio_image` tiene `camera_focal_length_id` («Focal length
  preset id controlling field of view and perspective»), además de cuerpo (`camera_model_id`), lente
  (`camera_lens_id`) y apertura. Genera la imagen de inicio con la focal elegida (gran angular, 18-24 mm, para una
  intro que avanza). Precio: 2 créditos a 2K.
- Un acercamiento añadido por código cierra más el plano (+20 % de zoom a 720p deja 600 líneas útiles): cuenta con
  ello al elegir la focal.

## Qué modelo para qué imagen
| Modelo | Créditos (web) | API | Lo mejor | Notas |
|---|---|---|---|---|
| **GPT Image 2.6** (por defecto en Higgsfield) | 1,75-2 (high 2K) | no | Tipografía, composición exacta, hasta 16 referencias | Salida PNG, JPEG, WebP, GIF o **SVG** |
| **Nano Banana Pro / 2 / 2.1** | 2 (4K: 4) | no | Editar una imagen manteniendo el universo (**fin editando el inicio**), 14 referencias en Lite | El que la skill oficial recomienda para mantener un «universo de producto» coherente |
| **Seedream 5.0 Pro / 5.5** | 2,5 / 3,5 | 0,108 $ (5 pro) | Letra pequeña legible; 5.5 con **fondo transparente** | 10 referencias |
| **Cinema Studio Image** | 2 (2K) | no | **Focal, lente, cuerpo y apertura** controlados | La forma de fijar el FOV |
| Soul 2.0 / Cinema / Location | 0,12 | no | Semilla; Location para escenarios | Estética propia, menos neutra |
| Flux 2 Pro / Flex / Max · Kontext | 1 / 3 / 4 · 1,5 | no | Edición contextual | — |
| Qwen Image 3 | — | 0,04 $ | Semilla y **prompt negativo**; edición con 1-3 referencias | Barato para variantes |
| Kling Image 4 | — | 0,063 $ | — | — |
| Grok Image 2 | 2,5 | 0,06 $ | 10 referencias | — |
| Recraft V4.1 Vector / Ideogram Vector | — | — | **Logos en SVG** | Para la marca que luego va por código |

## Reglas de la imagen clave para scroll
1. **Proporción final** desde el principio (16:9 escritorio; con aire lateral para recortar 9:16, o una segunda imagen
   vertical). En Seedance la proporción la manda el inicio y el fin se recorta.
2. **Fondo con poco detalle y oscuro o liso** si el vídeo va detrás de texto (receta oficial de scroll) [4].
3. **Exposición y balance de blancos** que puedan mantenerse: evita luces que parpadean o reflejos que cambian.
4. **Marca:** si el logo tiene que verse en el vídeo, incrústalo aquí (que reciba la luz de la escena) y pide poco
   movimiento; mejor aún, por código encima (`../flujos.md`, «Marca»).
5. **El fin se hace editando el inicio** («same scene, same lens, same light, camera N metres forward»), nunca con un
   prompt nuevo desde cero [5].
6. El storyboard va como **referencia de estilo**, no como imagen de inicio: si no, la página arranca en una lámina
   quieta [4].

## Fuentes
1. Alibaba Cloud, guía de prompts de Wan [leída entera]: https://www.alibabacloud.com/help/en/model-studio/text-to-video-prompt
2. Vertex AI, buenas prácticas de vídeo [leída entera]: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/best-practice
3. ScreenWeaver, prompts de lente en vídeo IA [parcial]: https://screenweaver.ai/blog/lens-prompts-ai-video
4. higgsfield-ai/skills, `higgsfield-websites/references/scroll-scrub.md` [leída entera]: https://github.com/higgsfield-ai/skills
5. Google Cloud, guía definitiva de prompts de Veo 3.1 (Nano Banana antes/después + Veo con dos fotogramas) [leída entera]: https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
6. MCP de Higgsfield, `models_explore` de `cinematic_studio_image` (parámetros), consultado el 21-11-2026.
