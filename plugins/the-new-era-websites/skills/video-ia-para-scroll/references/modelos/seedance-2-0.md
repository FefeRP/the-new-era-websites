# Seedance 2.0 (ByteDance) · Fast y Mini

**Para qué en una web:** el **revelado de logo o de portada** que termina exactamente en una imagen final, el hero de
unos 5 s con imagen de inicio y las **pruebas baratas** (Mini). Es lo que la skill oficial de Higgsfield usa para
animar una portada: la portada terminada va como **imagen final**, no como inicio [1].

## Parámetros reales
| | API (`/bytedance/seedance-2.0/…`) | Web / MCP (`seedance_2_0`, `seedance_2_0_mini`) |
|---|---|---|
| Duración | 4-15 s | 4-15 s |
| Resolución | 480p, 720p, 1080p, **4K** | igual; Fast solo 480p/720p |
| Inicio / fin | `image_url` + `end_image_url` | `start_image` / `end_image` |
| Referencias | hasta 9 imágenes, 3 vídeos, 3 audios; **no** con inicio/fin | igual |
| Proporción | auto, 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 | igual |
| Otros | `bitrate_mode`, audio (activado por defecto), sin semilla | Fast, Mini |

En fal el mismo modelo admite elegir `codec` H264/H265 [3].

## Precio (21-11-2026)
- **API, $/s:** 480p 0,0804 · 720p 0,1735 · 1080p 0,4293 · 4K 0,8907. Con referencias, desde 0,0991.
- **Web, créditos por 5 s:** 720p 22,5 · 1080p 60 · 4K ~110 · Fast 720p ~12 · **Mini 720p 5**.
- Es más barato que 2.5 a igual resolución (720p: 0,17 frente a 0,26 $/s) y llega a 4K.

## Qué hace bien
- Terminar **exactamente** en el fotograma final dado y quedarse quieto: perfecto para que la web pase del vídeo a la
  imagen estática de la marca sin salto.
- Movimiento lento y continuo («slow, gentle, continuous small movements» es la forma que recomienda BytePlus) [2].
- Coherencia con referencias (personaje o producto en varios planos).

## Fallos conocidos
- Corta entre ángulos si no se le dice «one continuous shot, no cuts» (igual que 2.5).
- Varios movimientos de cámara a la vez «will increase image instability» [2].
- 0-3 s inestables: para dos fases, «Shot 1 (0-3 s) … Shot 2 (3-5 s) …» [2].
- Para empalmar dos clips, BytePlus quita **6 fotogramas del final del primero y 1 del principio del segundo** [2].
- Para copiar el movimiento de un vídeo de referencia: «Refer to the [Camera Movement Description] from [Video 1]» [2].

## Prompt de partida: revelado de logo (fin = la portada o el logo terminados)
De la receta oficial de Higgsfield [1], sin audio, 5 s, 1080p:
```
Subtle light moves across the surface and the forms settle into place. The camera holds almost still with a
slow, gentle push in. The shot ends exactly on the provided end frame, holding still for the last half second.
One continuous shot, no cuts, no flicker, no extra text, no new objects.
```
Para un bucle, la misma receta con movimiento sutil y sin entrada aparatosa. Más tipos en `../plantillas-prompt.md`.

## Fórmula de BytePlus para 2.0
«precise subject + action details + scene/environment + lighting & color tone + camera movement + visual style +
image quality + constraints». Vocabulario: medium shot, close-up, wide shot, slow push-in, smooth lateral tracking,
fixed shot [2].

## Fuentes
1. higgsfield-ai/skills, `higgsfield-websites/references/cover-animator.md` [leída entera]: https://github.com/higgsfield-ai/skills
2. BytePlus, guía de prompts de Seedance 2.0 [leída entera]: https://ai.byteplus.com/ark/region:ap-southeast-1/docs/seedance-2-0-prompt-guide
3. fal, Seedance 2.0 imagen a vídeo (esquema y precio) [parcial]: https://fal.ai/models
4. Runway, guía de prompts de Seedance 2.0 [leída entera]: https://runway.com/resources/seedance-2-0-prompt-guide
5. Documentación de la API de Higgsfield, Seedance 2 [leída entera]: https://docs.higgsfield.ai
