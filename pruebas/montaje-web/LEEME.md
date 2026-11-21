# Prueba de montaje: códec, GOP y frames para scroll

Mide cuánto pesa y cuánto tarda cada forma de montar un clip de IA en una web que se arrastra con el scroll: vídeo
H.264 con un fotograma clave cada 1, 4, 8 (con y sin B-frames), 12 o uno solo (como llega del generador), VP9, AV1 y
frames sueltos WebP, AVIF y JPEG, en escritorio (1280 px) y en móvil (recorte 9:16 a 540×960).

```bash
# 1. variantes (ffmpeg en FFMPEG/FFPROBE o en el PATH; el clip solo se lee)
node pruebas/montaje-web/preparar.mjs <clip.mp4> [salida=pruebas/montaje-web/salida/<nombre>]
# 2. medida en Chrome (desde demos/reloj, donde está playwright-core; levanta su servidor en el puerto 5199)
cd demos/reloj && node ../../pruebas/montaje-web/medir.mjs ../../pruebas/montaje-web/salida/<nombre> [--freno 1,4] [--solo regex]
```

Qué mide `medir.html`:
- vídeo: 30 búsquedas al azar y 60 pasos hacia delante y hacia atrás; tiempo desde poner `currentTime` hasta `seeked`
  y pintar el fotograma en un canvas (con tope de 1,5 s, que cuenta como «sin fotograma»). El fichero se baja antes
  como Blob para que no cuente la red;
- frames: 40 `createImageBitmap` al azar y su `drawImage`.
Escribe `medidas.json` en la carpeta de salida y una tabla con mediana, p95 y máximo.

Avisos:
- Sin GPU todo se decodifica por software y el freno de CPU de Chrome no afecta al decodificador de vídeo (va en otro
  proceso): las cifras sirven para comparar variantes entre sí, no como tiempos de un móvil real. Prueba en un móvil
  de verdad antes de decidir.
- `requestVideoFrameCallback` casi no se dispara en Chrome sin ventana: por eso se mide con `seeked` + canvas.
- Con VP9 de libvpx, `ffprobe -skip_frame nokey` cuenta todos los fotogramas como clave: el recuento no es fiable.
- AV1 todo intra no se prepara (libaom se queda sin memoria y AV1 no va en iPhone sin hardware).

Resultados del 21-11-2026 (Seedance 2.5, 720p, 5 s): `plugins/the-new-era-websites/skills/video-ia-para-scroll/references/montaje-web.md`.
`salida/` se regenera y está en `.gitignore`.
