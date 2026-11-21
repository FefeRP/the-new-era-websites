# Wan 2.6, 2.7, 3.0 y 3.0 Prime (Alibaba)

**Para qué en una web:** lo **más barato a 1080p** con inicio + fin y hasta 30 s, y la única familia con **semilla y
prompt negativo** a la vez: puedes repetir un resultado y cambiar una sola cosa. Buena para fondos, recorridos largos
de prueba y bucles.

## Parámetros reales
| Modelo | Duración | Resolución | Inicio + fin | Semilla | Negativo | Otros |
|---|---|---|---|---|---|---|
| Wan 2.6 | 5/10/15 s | 480p-1080p | **No** | Sí | Sí (imagen a vídeo) | `audio_url`, `multi_shots`, `prompt_extend` |
| Wan 2.7 | 2-15 s | 720p / 1080p | Sí (`end_image_url`) | Sí | Sí | 30 fps; referencias hasta 5 (2-10 s, solo 16:9/9:16) |
| Wan 3.0 / 3.0 Prime | 2-30 s | 480p-1080p | Sí | Sí (solo si no es 0) | — | 6 proporciones + adaptativa; referencias 10 imágenes y 5 vídeos; H.264 a 30 fps; en «preview» en Alibaba |

Inicio/fin y referencias «are mutually exclusive» [1]. Sale a **30 fps**: no pasa nada para scroll (extraes a 24 o
usas todos), pero recuerda que 5 s son 150 fotogramas.

## Precio (21-11-2026)
- **API, $/s:** Wan 3.0 480p 0,0375 · 720p 0,075 · 1080p 0,15 · Prime 0,051 / 0,105 / 0,21 · Wan 2.7 720p 0,075 ·
  1080p 0,1125 · Wan 2.6 0,075-0,113 (480p cuesta más que 720p).
- **Web, créditos por 5 s a 1080p:** Wan 3.0 15 · Prime 27,5 · 2.7 12,5.
- 5 s a 1080p con Wan 3.0: 0,75 $, frente a 3,26 $ con Seedance 2.5.

## Qué hace bien
- Prompt negativo real: «No large camera movements», «No frequent shot cuts» [1].
- Imagen a vídeo bien separado: «The image defines the entity, scene, and style. Your prompt should focus on motion
  and camera movements» [2].
- Wan 3.0 entiende tiempos: «Shot N (start-end seconds): Subject + Scene + Motion + Aesthetic control» [1].
- Recorridos dibujados: una guía publicada guía un FPV con una línea roja numerada pintada sobre la imagen [1].

## Fallos conocidos
- Órbitas amplias deforman: «Keep the arc under 45 degrees — wider orbits risk spatial distortion» [2].
- En texto a vídeo sí hace caso de la lente en mm (Wan 3.0); en imagen a vídeo manda la imagen.
- Calidad de material y luz por debajo de Seedance y Veo: prueba antes de usarlo en el hero principal.

## Prompt de partida
Imagen a vídeo, «Prompt = Motion + Camera movement» [2]:
```
Generate single shot. The camera moves slowly forward at a constant speed toward the [subject], steady horizon,
consistent light. Fixed exposure.
```
Negativo: `cuts, shot changes, large camera movements, shake, flicker, warping, text, watermark`.

FPV con ruta dibujada (Wan 3.0, literal de Alibaba) [1]: «First-person FPV drone-perspective, single take, one
uninterrupted continuous motion throughout, flying along the complete path of red line 1→2→3→4→5→6, skipping no
segment…» + «No cuts throughout, no shot splits, no transition breaks». Para scroll, quita la parte de «speed-layered
cadence» y pide velocidad constante.

## Fuentes
1. Alibaba Cloud, guía de prompts de Wan 3.0 [parcial]: https://www.alibabacloud.com/help/en/model-studio/wan3-video-generation-prompt-guide
2. Alibaba Cloud, guía de prompts de vídeo de Wan [leída entera]: https://www.alibabacloud.com/help/en/model-studio/text-to-video-prompt
3. Alibaba Cloud, referencia de la API de Wan 3.0 [parcial]: https://www.alibabacloud.com/help/en/model-studio/wan3-video-generation-api-reference
4. Documentación de la API de Higgsfield, Wan 2.6, 2.7, 3 y 3 Prime [leída entera]: https://docs.higgsfield.ai
