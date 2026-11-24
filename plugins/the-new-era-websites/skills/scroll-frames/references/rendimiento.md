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

¿Frames o vídeo, y con qué códec? El vídeo pesa ~5 veces menos; los frames son más fiables (iOS en ahorro de batería
bloquea `<video>`) y precisos. Las medidas (pesos, tiempos de búsqueda y decodificación por códec y formato) y la
decisión están en [montaje-web.md](../../video-ia-para-scroll/references/montaje-web.md) de `video-ia-para-scroll`.

## Memoria (lo que tumba móviles)
- Decodificado, un frame ocupa ancho × alto × 4 bytes: 1920×1080 = 8,3 MB; 1600×900 = 5,8 MB; 900×1600 = 5,8 MB.
- 120 frames de 1600 px decodificados de golpe = 690 MB, y 90 de 900 px en móvil = 520 MB. Safari iOS limita la memoria de canvas (≈384 MB medidos en iOS 15) y recarga o mata la pestaña.
- Por eso `frame-scrubber.js` guarda los frames **comprimidos** (Blob) y solo decodifica una ventana LRU (48 / 24) alrededor del frame actual, con `createImageBitmap` (fuera del hilo principal) y `close()` al salir de la ventana.
- No crees un canvas por sección si no se ven a la vez; destruye al desmontar.

## Formatos
WebP por defecto. AVIF (`--formato ambos`) solo si el peso aprieta mucho: en fotos ahorra un 20-35 %, pero en frames de
vídeo de IA medidos solo un 4 % y decodifica casi el doble de lento; el motor lo elige solo si el navegador lo soporta.
Medidas, JPEG, PNG y transparencia: [montaje-web.md](../../video-ia-para-scroll/references/montaje-web.md) §1 y §3.

## Carga
- El primer frame va antes que nada (es el póster vivo) y luego orden progresivo: último, cada 16, 8, 4, 2, 1. La secuencia se puede recorrer a "baja resolución temporal" en cuanto llegan ~10 frames.
- Si la secuencia está más abajo de la página, crea el scrubber al acercarse (IntersectionObserver con `rootMargin: '200% 0px'`), no al cargar.
- Descargas en paralelo, caché y póster: [montaje-web.md](../../video-ia-para-scroll/references/montaje-web.md) §4.

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
`alfa: true`). Revisa la `hoja.png` y los avisos de `alfa.json` (halos, parpadeo del recorte). Pesos y formatos con
alfa: [formatos-alfa.md](../../capas-alfa/references/formatos-alfa.md) de `capas-alfa`.

## Modo vídeo: codificación
`extraer-frames.mjs --video-scrub` ya recodifica con `-g 8 -bf 0` (móvil `-g 4`): el clip tal como sale del generador
(un solo fotograma clave) tarda ~220 ms por búsqueda. Receta ffmpeg, tabla medida (H.264, VP9, AV1) y cómo contar los
fotogramas clave: [montaje-web.md](../../video-ia-para-scroll/references/montaje-web.md) §0, §1 y §3.
