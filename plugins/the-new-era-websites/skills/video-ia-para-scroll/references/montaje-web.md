# Montaje en la web: la receta técnica (medida)

Cómo pasar el clip de la IA a una web que se arrastra con el scroll sin tirones, en escritorio y en móvil. El código
de los motores está en `scroll-frames` (`frame-scrubber.js`, `video-scrubber.js`, `extraer-frames.mjs`); aquí van las
decisiones y sus números.

## 0. Lo primero: el clip de Higgsfield no se monta tal cual
Medido en seis clips reales (Kling 1080p y Seedance 720p, 5 s): 121 fotogramas a 24 fps, **un solo fotograma clave
en todo el clip**, 15-24 Mb/s, 9,6-15 MB. Con un solo fotograma clave, cada posición del scroll decodifica desde el
principio: **160-220 ms por búsqueda** a 1280 px (medido abajo), así que el scroll va a 5 imágenes por segundo.
Siempre se recodifica o se pasa a frames. Comprueba lo que te llega:
```bash
ffprobe -v error -select_streams v -show_entries stream=codec_name,profile,pix_fmt,width,height,r_frame_rate,bit_rate,nb_frames clip.mp4
ffprobe -v error -select_streams v -skip_frame nokey -show_entries frame=pts_time -of csv=p=0 clip.mp4 | wc -l   # fotogramas clave
```
Si llega H.265 o 10 bits (BytePlus da así Seedance a 1080p), pásalo a H.264 8 bits 4:2:0: es lo único que va en todos
los navegadores.

## 1. Medidas propias (21-11-2026)
Clip: intro de Seedance 2.5, 720p, 5 s, 121 fotogramas. Escritorio a 1280 px de ancho; móvil, recorte central 9:16 a
540×960. Chrome 157 de escritorio sin GPU (decodificación por software); 30 búsquedas al azar y 60 pasos hacia
delante y hacia atrás por variante; tiempo de poner `currentTime` hasta `seeked` y pintar el fotograma en un canvas.
El freno de CPU ×4 de Chrome **no cambia nada** (el vídeo se decodifica en otro proceso), así que las cifras sirven
para comparar variantes entre sí, no como tiempos de un móvil real. Prueba repetible: `pruebas/montaje-web/` del repo.

| Variante | Escritorio MB | Búsqueda (mediana / p95, ms) | Móvil MB | Búsqueda móvil (ms) |
|---|---|---|---|---|
| H.264 todo intra (`-g 1`) | 5,18 | 17 / 20 | 2,81 | 11 / 15 |
| H.264 `-g 4 -bf 0` | 3,76 | 28 / 34 | 1,91 | 15 / 21 |
| **H.264 `-g 8 -bf 0`** | **2,94** | **28 / 41** | 1,48 | 16 / 23 |
| H.264 `-g 8` con B-frames | 2,69 | 34 / 44 | 1,36 | 21 / 27 |
| H.264 `-g 12` | 2,42 | 32 / 53 | 1,22 | 19 / 31 |
| H.264 un solo clave (como llega) | 1,82 | **221 / 274** | 0,90 | 121 / 158 |
| VP9 `-g 1` | 11,51 | 39 / 55 | 5,86 | 17 / 25 |
| VP9 `-g 12` | 1,96 | 26 / 39 | 1,00 | 13 / 22 |
| AV1 `-g 12` (SVT) | 1,13 | 26 / 42 | 0,60 | 16 / 27 |

| Frames sueltos (121) | Escritorio MB | Decodificar (mediana / p95, ms) | Móvil MB | Decodificar móvil |
|---|---|---|---|---|
| **WebP q72** | 6,68 (54 KB/frame) | 10 / 12 | 3,58 (29 KB) | 6 / 7 |
| AVIF crf 32 | 6,44 (52 KB) | 17 / 21 | 3,48 (28 KB) | 9 / 12 |
| JPEG q4 | 10,74 (87 KB) | 6 / 7 | 5,73 (46 KB) | 3 / 4 |
Pintar el bitmap ya decodificado en el canvas: menos de 1 ms.

**Lo que dicen los números:**
- **Un fotograma clave cada 8 y sin B-frames** es el equilibrio en H.264: busca igual que `-g 4` (28 ms) y pesa un
  22 % menos. Quitar los B-frames cuesta un 8 % de peso y ahorra ~6 ms por búsqueda. Coincide con lo que sirven Apple
  y el motor de Higgsfield (GOP ~8) [1][2] y con la skill oficial (escritorio GOP 8, móvil GOP 4) [3].
- Todo intra solo compensa si cada milisegundo cuenta: pesa 1,8 veces lo de `-g 8`.
- **VP9 y AV1 buscan bien y pesan menos** (AV1 g12 = 38 % de H.264 g8), pero **AV1 no se decodifica en iPhone sin
  hardware** (solo A17 Pro / M3 o posteriores) [4], y VP9 en Safari no es fiable para esto. Como formato único, H.264;
  como extra, AV1 con `<source type>` y H.264 de reserva.
- **Frames WebP: 2,3 veces el peso del vídeo `-g 8`**, pero cada fotograma es independiente (10 ms) y no dependen
  del decodificador de vídeo: es lo más fiable en móvil. AVIF ahorra un 4 % y decodifica casi el doble de lento: no
  compensa. JPEG decodifica más rápido pero pesa un 60 % más.

## 2. ¿Frames o vídeo?
| Caso | Elige | Por qué |
|---|---|---|
| Hero principal, el visitante arrastra adelante y atrás, iOS importa | **Frames WebP en canvas** (`frame-scrubber.js`) | Cada posición es exacta; no depende del modo de ahorro de batería ni del decodificador [5][6] |
| Peso muy justo, escritorio sobre todo | **`<video>` H.264 `-g 8 -bf 0`** (`video-scrubber.js`) | 2,3 veces menos peso; empata en escritorio [7] |
| Clip largo (más de 10 s) o varios por página | Vídeo, uno a la vez | 300+ frames por clip no caben en memoria de móvil |
| Bucle de fondo con autoplay (no scroll) | `<video autoplay muted loop playsinline>` normal | No hace falta GOP corto |
Medición publicada en un móvil emulado (CPU ×4): frames WebP 4 MB, 193 peticiones, primer pintado 585 ms; vídeo
`-g 8` 0,85 MB, 2 peticiones, primer pintado 117 ms; en escritorio, empate [7]. Un estudio que empezó con
`currentTime` y ScrollTrigger lo cambió por frames WebP en canvas por tirones en móvil, el autoplay y la calidad [5].
Lo que no hace nadie bien: **WebCodecs** (`VideoDecoder`) decodifica todo el clip al cargar y no está en Firefox de
Android [8]; para un hero no compensa.

## 3. Receta de codificación
**Vídeo para scrub** (lo hace `extraer-frames.mjs --video-scrub`):
```bash
# escritorio: 1280-1600 px, un clave cada 8, sin B-frames
ffmpeg -i clip.mp4 -an -vf "scale=1600:-2:flags=lanczos,format=yuv420p" -c:v libx264 -profile:v high -preset slow \
  -crf 20 -g 8 -keyint_min 8 -sc_threshold 0 -bf 0 -movflags +faststart scrub-escritorio.mp4
# móvil: recorte 9:16, 720 px de alto o menos, un clave cada 4
ffmpeg -i clip.mp4 -an -vf "crop=ih*9/16:ih,scale=540:960:flags=lanczos,format=yuv420p" -c:v libx264 -profile:v high \
  -preset slow -crf 24 -g 4 -keyint_min 4 -sc_threshold 0 -bf 0 -movflags +faststart scrub-movil.mp4
```
**Frames:** `extraer-frames.mjs` (WebP q72, 1600 px escritorio y 900 px móvil, 90-150 frames; `--frames` toma 1 de
cada k fotogramas a intervalo fijo). Referencias publicadas: 30 KB por frame WebP q80 en una web de estudio con
secuencias por dispositivo (1440×832, 1024×1366 y 393×852 vertical a 1x) [5].

## 4. Carga progresiva y póster
- **Póster** como `<img fetchpriority="high">` con el primer fotograma (WebP de 30-80 KB), no el PNG del generador
  (una web de demostración del propio Higgsfield sirve pósters PNG de 0,5-2 MB: malo para el LCP) [1]. En un caso
  medido, el póster con prioridad alta bajó el LCP de 690 a 460 ms; Chrome no precarga el vídeo y, desde Chrome 116,
  el primer fotograma del vídeo puede contar como LCP [9].
- **Frames:** el primero, después el último, luego cada 16, 8, 4, 2, 1 (el motor ya lo hace). Una web publicada carga
  10, pinta 1 y precarga 5 en la dirección del scroll [5].
- **Vídeo:** bájalo entero como Blob (`fetch` → `URL.createObjectURL`) antes de arrastrar: evita que `seekable` se
  quede en [0,0] si el servidor no responde 206 a las peticiones Range [10]. Una web de estudio con vídeo de Kling lo
  pasó de 14,7 a 6,5 MB solo recodificando con `-g 6` [11].
- La sección que está más abajo se crea al acercarse (IntersectionObserver con margen) y fuera de vista no se carga.

## 5. El bucle del scroll
- Lee el scroll en `requestAnimationFrame`; suaviza con lerp de 0,12 a 0,20 [11][12].
- **Una sola búsqueda pendiente:** no pidas otra posición hasta `seeked`; pide la siguiente si la diferencia supera
  ~40 ms [10]. Para frames, decodifica una ventana LRU alrededor del actual y cierra los bitmaps que salen.
- GSAP: `scrub: 0.5` y, si hay `snap`, por índice de fotograma. Con Lenis, `autoRaf: false` y su `raf` desde
  `gsap.ticker`, con `lagSmoothing(0)` [6].
- `animation-timeline: scroll()` de CSS no mueve `currentTime`: solo sirve para sprites con `steps()`.

## 6. Móvil
- **Clip vertical aparte** o recorte central 9:16 del 16:9 si se generó con aire lateral. Lo hacen así las webs
  medidas [2][5].
- iOS: `muted playsinline`, y `play().then(() => pause())` en el primer `touchstart`/`pointerdown` para desbloquear el
  vídeo. En modo de ahorro de batería `<video>` puede no moverse: muestra el póster (el motor lo detecta) [13].
- **Memoria de canvas en Safari iOS:** 224 MB en iOS 12 y 16 anterior a 16.3, 384 MB en iOS 15 y 16.3+; al pasarse,
  `getContext` devuelve null. Libera los canvas que no uses con `width = height = 1` [14].
- Decodificación: Safari decodifica más rápido con `HTMLImageElement` que con `createImageBitmap`; Chrome, al revés [15].
- Mide la altura del scroll una vez y vuelve a medir solo si cambia el ancho o el alto más de ~140 px (la barra de
  direcciones de iOS cambia el alto al hacer scroll) [12].
- `navigator.connection.saveData` solo existe en Chromium; `prefers-reduced-data` no lo implementa nadie.

## 7. Movimiento reducido
Mira `prefers-reduced-motion` **antes de cargar nada**: si está activo, enseña el póster (o el último fotograma, si
cuenta mejor la historia) y no descargues ni frames ni vídeo [10]. Los motores de `scroll-frames` ya lo respetan.

## 8. Checklist de montaje
- [ ] Recodificado (nunca el clip tal cual): `-g 8 -bf 0` escritorio, `-g 4` móvil, H.264 8 bits; o frames WebP.
- [ ] Versión móvil (vertical o recorte) y póster ligero con `fetchpriority="high"`.
- [ ] Blob antes de arrastrar (vídeo) o carga progresiva (frames); fuera de vista, sin cargar.
- [ ] Una búsqueda pendiente; lerp; LRU de frames.
- [ ] Movimiento reducido: póster, sin descarga.
- [ ] Probado en un iPhone real, en modo de ahorro de batería y con la red lenta.

## Fuentes
1. stacked-burger.higgsfield.app, web de demostración del motor de scroll de Higgsfield (medida: H.264 High 1920×1080 24 fps, 73 fotogramas, 10 claves, ~4,7 Mb/s, 1,8 MB) [analizada]: https://stacked-burger.higgsfield.app
2. apple.com/airpods-pro (medida: 16 `<video>`, hero H.264 30 fps 225 fotogramas, 28 claves, 2,9-6,1 MB según tamaño) [analizada]: https://www.apple.com/airpods-pro/
3. higgsfield-ai/skills, `higgsfield-websites/references/scroll-scrub.md` [leída entera]: https://github.com/higgsfield-ai/skills
4. Bitmovin, soporte de AV1 en Apple [parcial]: https://bitmovin.com/blog/apple-av1-support/
5. Codrops, animación sincronizada con el scroll para Optikka: del vídeo HTML5 a secuencias de frames [leída entera]: https://tympanus.net/codrops/2025/10/16/creating-smooth-scroll-synchronized-animation-for-optikka-from-html5-video-to-frame-sequences/
6. GSAP Vault, tutorial de secuencia de imágenes con scroll [parcial]: https://gsapvault.com
7. LearnWithHasan, página de animación por scroll con vídeo IA [leída entera]: https://learnwithhasan.com/guide/ai-video-scroll-animation-page/
8. diffusionstudio/webcodecs-scroll-sync [leída entera]: https://github.com/diffusionstudio/webcodecs-scroll-sync · scrolly-video [leída entera]: https://scrollyvideo.js.org
9. DebugBear, optimizar el LCP con vídeo [parcial]: https://www.debugbear.com/blog/optimize-video-lcp
10. Futr Agency, vídeo guiado por el scroll [leída entera]: https://futragency.com/insights/scroll-driven-video
11. Tarasovs, cómo funciona el vídeo con scrub en Framer [leída entera]: https://tarasovs.me/how-scroll-scrubbed-video-works-in-framer/
12. Akoum, vídeo guiado por el scroll [leída entera]: https://akoum.me/scroll-driven-video
13. Kaev, animación por scroll sin matar el rendimiento [leída entera]: https://kaev.ai/blog/scroll-driven-animation-without-killing-performance
14. PQINA, memoria total de canvas en iOS [parcial]: https://pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/ · WebKit bug 195325 [parcial]: https://bugs.webkit.org/show_bug.cgi?id=195325
15. Ludicon, carga de imágenes en la web (2026) [leída entera]: https://www.ludicon.com/castano/blog/2026/05/image-loading-on-the-web/
