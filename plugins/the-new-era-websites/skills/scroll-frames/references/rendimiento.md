# Rendimiento: scroll-frames

## Presupuestos (punto de partida, ajusta por proyecto)
| | Escritorio | Móvil |
|---|---|---|
| Frames por secuencia | 90-150 | 60-90 (ver nota) |
| Ancho del frame | 1600 (menos si el canvas no es a pantalla completa); el máster puede ser 1920 | 900, vertical 9:16 si el sujeto no cabe |
| Peso por frame WebP q70 | 40-80 KB | 20-40 KB |
| Peso total de la secuencia | ≤ 8 MB | ≤ 4 MB |
| Secuencias por página | 1-2 | 1-2 |

Nota: en un mismo `manifest.json` las variantes escritorio y móvil llevan los mismos frames (el motor usa un único total).
Para servir menos frames en móvil, extrae la secuencia móvil aparte en su carpeta (`--frames 80 --ancho 900
--ancho-movil 0`, desde la toma vertical si la hay) y elige la `base` del scrubber con `matchMedia('(max-width: 767px)')`.
El progreso es una fracción 0..1, así que los textos y el HUD siguen cuadrando.

Datos medidos por terceros (8 s, 192 frames 1280×720): JPEG q85 11,1 MB · WebP q60 4,0 MB · MP4 H.264 GOP 8: 0,85 MB.
El vídeo pesa ~5× menos; los frames son más fiables (iOS en ahorro de batería bloquea `<video>`) y precisos.

## Memoria (lo que tumba móviles)
- Decodificado, un frame ocupa ancho × alto × 4 bytes: 1920×1080 = 8,3 MB; 1600×900 = 5,8 MB; 900×1600 = 5,8 MB.
- 120 frames de 1600 px decodificados de golpe = 690 MB, y 90 de 900 px en móvil = 520 MB. Safari iOS limita la memoria de canvas (≈384 MB medidos en iOS 15) y recarga o mata la pestaña.
- Por eso `frame-scrubber.js` guarda los frames **comprimidos** (Blob) y solo decodifica una ventana LRU (48 / 24) alrededor del frame actual, con `createImageBitmap` (fuera del hilo principal) y `close()` al salir de la ventana.
- No crees un canvas por sección si no se ven a la vez; destruye al desmontar.

## Formatos
- **WebP**: el comodín. Decodifica rápido. Por defecto.
- **AVIF**: ~20-35 % menos peso con la misma calidad, decodificación algo más lenta. Úsalo (`--formato ambos`) cuando el peso apriete; el motor elige AVIF solo si el navegador lo soporta.
- **JPEG**: solo como reserva antigua. **PNG**: nunca para secuencias (salvo intermedio).
- Transparencia: WebP y AVIF admiten alfa. Mejor evitarla: pide al generador un fondo liso y pon ese color de fondo en la sección (más ligero y sin halos).

## Carga
- El primer frame va antes que nada (es el póster vivo) y luego orden progresivo: último, cada 16, 8, 4, 2, 1. La secuencia se puede recorrer a "baja resolución temporal" en cuanto llegan ~10 frames.
- 6 descargas en paralelo con HTTP/2. Cabecera de caché larga + carpeta versionada (`/frames/reloj-v2/`).
- Si la secuencia está más abajo de la página, crea el scrubber al acercarse (IntersectionObserver con `rootMargin: '200% 0px'`), no al cargar.

## Frames intermedios (si el vídeo va a tirones)
- Generar a más fps no ayuda si el generador da 24 fps con tirones. Primero remapea la velocidad o recorta; interpolar
  antes de extraer es el último recurso.
- ffmpeg, solo como último recurso (`minterpolate` mezcla fotogramas: frames blandos y artefactos en bordes finos, y el scrub los pide nítidos): `ffmpeg -i in.mp4 -vf "minterpolate=fps=48:mi_mode=mci:mc_mode=obmc" out.mp4`
- RIFE (mejor calidad, GPU): `rife-ncnn-vulkan -i frames_in -o frames_out` y recomponer con `ffmpeg -framerate 48`.
- Velocidad no constante (el generador acelera al final): recorta con `--inicio/--fin` o remapea el tiempo con `setpts` por tramos.

## Fondo transparente (si de verdad hace falta)
Con el vídeo pedido sobre fondo liso o negro (skill `capas-alfa`):
`node ../capas-alfa/scripts/alfa.mjs --entrada clip.mp4 --modo croma --formatos frames --salida public/frames/splash`
(sin Python; `--modo negro` para humo o chispas; los frames quedan en `<salida>/frames/` con su manifest) y en la web
`crearFrameScrubber({ canvas, base: '/frames/splash/frames/', transparente: true })` (el manifest de `alfa.mjs` ya lleva
`alfa: true`). Revisa la `hoja.png` y los avisos de `alfa.json` (halos, parpadeo del recorte). Los
frames con alfa pesan ~1,5-2× los opacos: ≤ 1280 px y menos frames.

## Modo vídeo: codificación
`-c:v libx264 -crf 20 -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart -an` (móvil: 720 p, crf 24, `-g 4`).
`-g 1` (todo intra) = scrub perfecto pero ~3× peso. Comprueba fotogramas clave:
`ffprobe -v error -select_streams v -show_entries frame=key_frame -of csv=p=0 v.mp4 | find /c "1"`.
