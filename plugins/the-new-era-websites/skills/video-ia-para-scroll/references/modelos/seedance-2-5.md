# Seedance 2.5 (ByteDance) · también 2.5 Flash y el modo borrador

**Para qué en una web:** la intro por scroll de una sola toma (entrar en un sitio, atravesar algo, llegar a un
producto), los recorridos largos (hasta 30 s en una llamada) y cualquier plano que necesite **paralaje real**. Es el
modelo por defecto de Higgsfield para imagen a vídeo y el que su skill oficial de webs usa para el vídeo de scroll [1].

## Parámetros reales
| | API de Higgsfield (`/bytedance/seedance-2.5/…`) | Web / MCP (`seedance_2_5`) |
|---|---|---|
| Modos | `image-to-video`, `reference-to-video`, `text-to-video`, `video-edit`, `video-extend`, `finalize-draft` | `mode`: t2v, omni_reference, video_edit, video_extension |
| Imagen de inicio / fin | `image_url` (obligatoria) + `end_image_url` | `start_image` y `end_image`, **solo en omni_reference** |
| Duración | 4-30 s (5 por defecto) | 4-30 s |
| Resolución | 480p, 720p, 1080p (720p por defecto) | 480p, 720p, 1080p, 4k |
| Proporción | la marca la imagen de inicio | 16:9, 4:3, 1:1, 3:4, 9:16, 21:9 |
| Referencias | hasta 30 imágenes, 10 vídeos, 10 audios (50 en total) | igual |
| Calidad | `bitrate_mode` standard / high (**high por defecto**) | igual; high **no cuesta más** (medido) |
| Audio | `generate_audio` (**activado por defecto**: apágalo) | el audio no cambia el precio |
| Borrador | `draft: true` → `finalize-draft` con `draft_id` | `draft` + `draft_job_id`, finalizable 7 días |
| Extender | `video-extend` (se paga solo lo añadido) | `extension_mode` backward / forward |
| Lo que no tiene | semilla, prompt negativo, `camera_fixed` | — |

Detalles de BytePlus (el proveedor original) que importan [2][3]:
- Sale a **24 fps**.
- Con inicio y fin, **manda la proporción del primer fotograma y el último se recorta** para encajar. Si tu fin tiene
  otra proporción, perderás bordes.
- Inicio + fin, solo inicio y referencias **no se mezclan** en la misma petición.
- A 1080p y 4K BytePlus entrega **H.265 de 10 bits** (no confirmado si Higgsfield lo recodifica: compruébalo con
  ffprobe; para la web hay que pasarlo a H.264 8 bits de todas formas).
- `return_last_frame` devuelve el último fotograma real, útil para encadenar.

## Precio (medido el 21-11-2026)
- **API, $/s:** 480p 0,1177 · 720p 0,2647 · 1080p 0,6518. Extender: 0,1387 / 0,3264 / 0,7858 por segundo añadido.
  Finalizar un borrador: 0,6518 $/s (tarifa de 1080p).
- **Web, créditos por 5 s:** 480p 15 · 720p 35 · 1080p 80. 10 s a 720p: 70. Borrador: 15 (y la final se cobra
  aparte). Extender 5 s: 35. **Flash** a 720p: 25.
- 5 s a 720p en la API = 1,32 $. 1080p cuesta 2,5 veces más que 720p: la prueba siempre a 480p.

## Qué hace bien
- Una toma continua larga sin cortes, con paralaje de verdad (los objetos cercanos salen por los bordes).
- Mantiene la escena mejor que encadenar clips en recorridos de 12-20 s [4].
- Respeta un símbolo o logo **pequeño** si va en la imagen final (se comprobó contra el contorno del SVG), aunque a
  720p las letras no se leen [5].

## Fallos conocidos y cómo evitarlos
- **Corta entre ángulos si no se le prohíbe:** «Be explicit about what the camera is NOT doing… No cuts, no zoom…
  Without it Seedance will default to cutting between angles» [6]. Escribe siempre «one continuous shot, no cuts».
- **Tirones con un fin lejano:** si el fin está en otro sitio u otra luz, se lanza al doble de velocidad medio segundo
  y aparece el fin (el «salto disimulado»). Medido en una intro real: de 1,0 a 1,5 s la cámara fue al doble, la luz
  cayó un 36 % y apareció otro túnel. Fin alcanzable o sin fin (`../flujos.md`).
- **Frena al final:** con «arrive at the last image and hold» se para en el último tramo (×1,02 por medio segundo
  medido). En intros de 5 s pide el fin a 4,5 s, no «hold for 1-2 s».
- **Los primeros 0-3 s son los más inestables** según BytePlus; para varias fases usa «Shot 1 / Shot 2» con tiempos [3].
- **Detalles finos que «hierven» a 720p** (hojas, texto, rejillas): o 1080p, o un fondo con menos detalle, o
  deflicker (`../flujos.md`).
- **Falso nsfw en producto:** quita palabras de ambiente («seamless loop feel», «ambient», «intimate») [1].
- **Más de una fase en 5 s provoca cortes:** como mucho dos («avanza» y «llega»).

## Prompt de partida (imagen a vídeo, intro hacia delante)
Estructura de Higgsfield para Seedance: sujeto → escenario y luz → cámara → estilo → lo que la cámara **no** hace [6].
Vocabulario que entiende 2.5: push in, pull out, pan, track, follow, orbit, dive, pull back, tilt up; «one-shot / long
take», «aerial perspective», «FPV» [7].
```
One continuous long take of 5 seconds. The camera pushes in at a constant speed along the centre of the
[passage], at eye level, passing the [foreground element] and the [midground element] so they slide out past the
frame edges with real parallax, toward the [background element], which fills the frame by 4.5 seconds.
Locked exposure and white balance, consistent light from the first image.
The camera does not cut, does not zoom, does not pan, does not tilt and does not shake. Clean image without text.
```
Si hace falta un fin, mira antes `../flujos.md` («Fin editando el inicio»). Plantillas por tipo de plano:
`../plantillas-prompt.md`.

## Flujo barato recomendado
1. Borrador a 480p (15 créditos o 0,59 $ por 5 s) para ver la estructura: ¿avanza?, ¿corta?, ¿salta?
2. Si sirve, `finalize-draft` / `draft_job_id` (se cobra la final aparte) o relanza a 720p con el mismo prompt.
3. `revisar-video.mjs` en cada clip antes de seguir.

Lote medido con `estimar-higgsfield.mjs lote`: borrador 480p 5 s 0,59 $ + final 720p 5 s 1,32 $ = 1,91 $.

## Fuentes
1. higgsfield-ai/skills, `higgsfield-websites/references/scroll-scrub.md` y `asset-system.md` [leída entera / parcial]: https://github.com/higgsfield-ai/skills
2. BytePlus, API de creación de tareas de vídeo [parcial]: https://ai.byteplus.com/ark/region:ap-southeast-1/docs/create-video-generation-task-api
3. BytePlus, guía de prompts de Seedance 2.0 [leída entera] y 2.5 [parcial]: https://ai.byteplus.com/ark/region:ap-southeast-1/docs/seedance-2-0-prompt-guide
4. Eachlabs, Kling frente a Seedance [parcial]: https://www.eachlabs.ai/blog/kling-vs-seedance-which-model-for-which-shot
5. Masonry, mejor modelo para anuncios de producto [parcial]: https://masonry.so/blog/best-ai-video-model-for-product-ads
6. Higgsfield, guía de prompts de Seedance [leída entera]: https://higgsfield.ai/blog/seedance-prompting-guide
7. Higgsfield Help Center, cómo usar Seedance [leída entera]: https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-seedance
8. Documentación de la API de Higgsfield, Seedance 2.5 [leída entera]: https://docs.higgsfield.ai
