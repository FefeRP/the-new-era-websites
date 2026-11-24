# Flujos: imagen clave → vídeo, encadenar, bucles, extender, upscale, deflicker y marca

## 1. Imagen clave → vídeo
1. **Inicio** con un modelo de imagen en el formato del vídeo (16:9 o 9:16), con la focal fijada (`modelos/imagen-clave.md`).
2. **Fin editando el inicio**, nunca desde cero: «Make the end frame by editing the start frame» [1]. Google lo hace
   igual: Nano Banana para el antes y el después, y Veo con los dos fotogramas [2].
3. **Fin alcanzable:** si la geometría entre los dos no es compatible, el modelo lo tapa con un fundido, un morph o un
   corte [3]. Inicio = fin solo para bucles; un recorte ampliado del inicio da un zoom plano. Los modelos no clavan
   el final al píxel (±4-6 px): mide pantallas y anclas en el vídeo, no en la imagen que diste.
4. **Prueba barata** (borrador de Seedance a 480p, Kling 2.5 Turbo o 3.0 std) y **final con el bueno**.
5. El modelo **retoca un poco el primer fotograma**: para encadenar, saca el último fotograma del vídeo generado, no
   uses tu imagen original.

## 2. Encadenar clips
- **Último fotograma en PNG**, nunca JPEG:
  ```bash
  ffmpeg -sseof -1 -i a.mp4 -update 1 ultimo.png      # se queda con el último decodificado
  ```
  No uses `-sseof -0.1` ni `-vframes 1`: pueden darte el penúltimo o ninguno [4]. Exacto: cuenta los fotogramas con
  `ffprobe -count_frames -show_entries stream=nb_read_frames` y usa `select=eq(n\,N-1)`.
  Seedance (BytePlus) también lo devuelve con `return_last_frame` [5].
- **Unir sin el fotograma repetido**: quita el primero del segundo clip y normaliza antes de unir (nunca `-c copy`):
  ```bash
  ffmpeg -i a.mp4 -i b.mp4 -filter_complex \
   "[0:v]fps=24,scale=1920:1080,setsar=1,format=yuv420p[a];[1:v]trim=start_frame=1,setpts=PTS-STARTPTS,fps=24,scale=1920:1080,setsar=1,format=yuv420p[b];[a][b]concat=n=2:v=1[v]" \
   -map "[v]" -c:v libx264 -crf 16 unido.mp4
  ```
  BytePlus, para Seedance, quita 6 fotogramas del final del primero y 1 del principio del segundo [5].
- **Deriva de color**: cada eslabón se aleja un poco; a unos 40 s se nota. Vuelve a la imagen de referencia original
  en cada eslabón e iguala el color (`colorbalance`/`eq`, o una LUT con `haldclut`) [4].
- **La costura**: si los dos lados ya casan, interpola solo la unión (RIFE); si no, genera un **puente** con inicio =
  último de A y fin = primero de B [6]. `xfade` de 0,25 s tapa el color pero deja fantasmas al arrastrar el scroll.
- **No mezcles modelos** dentro de una cadena [7] (ni resoluciones). Comprueba la unión con `revisar-video.mjs` sobre
  el vídeo unido y, ya en la web, con `verificar-scroll.mjs` de `new-era` (el último frame de A y el primero de B se
  pintan seguidos).
- **Sujeto ancla (match cut)** entre dos lugares distintos: un objeto en el mismo sitio y tamaño del encuadre hace de
  puente (la gota que pasa del líquido a la piel, la semilla siempre en el centro). Último fotograma de A → edición
  «keep [the drop] exactly in the same position and size; replace everything around it with [skin]» → inicio de B.
  Comprueba superponiendo al 50 % que el ancla no se movió.

## 3. Extender
- **Seedance 2.5 / 2.0:** `video-extend` / `video_extension`, 4-15 s por extensión, `extension_mode` backward o
  forward. En el prompt llama al vídeo «@Video 1» (no «reference @Video 1») y describe **solo lo nuevo** [8]. Se paga
  solo lo añadido (2.5: 0,33 $/s a 720p).
- **Veo 3.1:** +7 s desde el último segundo, hasta 20 veces (148 s), solo 720p y solo vídeos de Veo de menos de 2 días [9].
- Para scroll, una toma larga de Seedance 2.5 (hasta 30 s) suele quedar mejor que extender.

## 4. Bucles
1. **Mismo PNG de inicio y fin** + «the camera's position and height are identical in the first and last frame» (o
   «seamless loop»). Kling 3.0 std es lo más fiable y barato.
2. **Ida y vuelta** (solo si el movimiento no tiene dirección clara):
   `ffmpeg -i v.mp4 -filter_complex "[0]reverse[r];[0][r]concat=n=2:v=1" bucle.mp4`.
3. **Fundido de la cola sobre el principio** (D = duración, F = duración del fundido):
   `ffmpeg -i v.mp4 -filter_complex "[0]split[a][b];[a]trim=start=F,setpts=PTS-STARTPTS[x];[b]trim=0:F,setpts=PTS-STARTPTS[y];[x][y]xfade=transition=fade:duration=F:offset=D-2*F" bucle.mp4` [10].
4. **Puente generado** del último fotograma al primero.
Normaliza antes (`fps=30,scale=1280:-2,format=yuv420p`, crf 18) [11].

## 5. Upscale
**Primero se quita el ruido temporal y después se reescala** (si no, el reescalado amplifica el parpadeo) [12].
| Opción | Precio | Para qué |
|---|---|---|
| **ByteDance Upscale** (Higgsfield, preset **AIGC**) | 1 crédito a 1080p; ~0,007 $/s | Lo más barato y fiel para vídeo de IA; 1080p-8K, 30/60 fps |
| FLUX.3 Upscale Precise / Creative (Higgsfield) | 56 / 80 créditos por 8 s a 480p | Inventa detalle; caro |
| **Topaz Starlight Precise 2.6** | ~1,20 $ / 10 s (fal) | Lo mejor contra el aspecto «plástico»; generativo |
| Topaz Starlight Fast 2 · Proteus | 0,60 · 0,10-0,20 $ / 10 s | Rápido · fiel, no generativo |
| SeedVR2 · FlashVSR | ~0,05 · ~0,025 $/s | Alternativas baratas |
| ffmpeg (sin IA) | 0 | `scale=1920:1080:flags=lanczos,unsharp=3:3:0.8` de 720p a 1080p |
Desde 480p no hay 4K real: ~95 % del detalle se inventa [13]. Nadie ha medido el parpadeo que añade cada upscaler: mide
con `revisar-video.mjs` antes y después.

## 6. Deflicker y estabilidad
- En Higgsfield: `video_deflicker`, 2 créditos.
- ffmpeg, para Kling [12]: `nlmeans=s=8:p=5:r=15,tmix=frames=5:weights='1 1 2 1 1'` (rápido: s=6, frames=3; fuerte:
  s=10, frames=7; por encima de 10 se come el detalle; otros modelos, s 4-6).
- Deriva de brillo: `deflicker=size=10:mode=am`.
- Cadena general [11]: `nlmeans=s=6:p=3:r=9,tmix=frames=3:weights='1 2 1',deshake=rx=8:ry=8,unsharp=3:3:0.6`.
- `tmix` deja fantasmas en lo que se mueve: aplícalo solo a la baja frecuencia (separa con `gblur=sigma=40`).
- Grano ligero y fondo desenfocado esconden el «hervor» de los detalles.
- Interpolar a 60 fps no hace falta para scroll; solo para cámara lenta.

## 7. Marca: logo y texto sin que se deforme
Ningún modelo mantiene un logo ni un texto concretos. Por orden: por código encima del vídeo, componer después,
incrustado en la imagen de inicio con poco movimiento, revelado con dos fotogramas o referencias. Detalle, prompts y
fuentes en [fallos-y-arreglos.md](../../fotos-producto-ia/references/fallos-y-arreglos.md), «Logo y texto en vídeo».

## Fuentes
1. ClipSpeed, guía de fotograma inicial y final [parcial]: https://clipspeed.ai
2. Google Cloud, guía definitiva de prompts de Veo 3.1 [leída entera]: https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
3. FlowVeo3, guía de primer y último fotograma de Veo 3.1 [parcial]: https://flowveo3.com/posts/veo-3-1-first-last-frame-guide
4. FFmpeg Micro, sacar el último fotograma para encadenar clips de Veo 3 [leída entera]: https://ffmpeg-micro.com/blog/extract-the-last-frame-in-ffmpeg-to-chain-veo-3-clips-cleanly
5. BytePlus, guía de prompts de Seedance 2.0 y API [leída entera / parcial]: https://ai.byteplus.com/ark/region:ap-southeast-1/docs/seedance-2-0-prompt-guide
6. jdnichollsc/seam (puente generado entre clips) [parcial]: https://github.com/jdnichollsc/seam · comfyui-WhiteRabbit (RIFE en la unión) [parcial]: https://github.com/Artificial-Sweetener/comfyui-WhiteRabbit
7. higgsfield-ai/skills, `scroll-scrub.md` [leída entera]: https://github.com/higgsfield-ai/skills
8. Luma, guía completa de Seedance 2.0 [parcial]: https://lumalabs.ai (artículo «seedance-2.0-complete-guide»)
9. Google Cloud, extender un vídeo de Veo [parcial]: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/extend-a-veo-video
10. dev.to, bucles de vídeo con ffmpeg (repetir, ida y vuelta, fundido y puente) [leída entera]: https://dev.to/jimmylee0252/making-seamless-video-loops-with-ffmpeg-repeat-ping-pong-crossfade-and-a-generated-bridge-41jm
11. ffmpeg.party, bucle de vídeo IA [leída entera]: https://ffmpeg.party/guides/ai-video-loop/
12. Renderio, posproceso de vídeo de Kling [leída entera]: https://renderio.dev/blogs/kling-video-post-processing
13. Higgsfield, mejores upscalers de vídeo de 2026 [leída entera]: https://higgsfield.ai/blog/best-ai-video-upscalers-2026 · Help Center, upscale [leída entera]: https://higgsfield.ai/creator-hub/help-center/tools/how-do-i-use-upscale
15. fal, upscalers de vídeo a vídeo [leída entera]: https://fal.ai/learn/tools/video-to-video-upscalers
