# Prueba de `extraer-frames.mjs`: intervalo uniforme entre frames

Comprueba que los frames que salen para el scroll están todos a la misma distancia en el vídeo de origen. Si no lo
están, el scroll da tirones aunque el vídeo sea perfecto. Pasaba antes de la 1.0.0-beta.7: con `--frames` o `--fps`
que no dividían al fps del vídeo, el filtro `fps` de ffmpeg elegía fotogramas a intervalos 1-1-1-2, y además duplicaba
fotogramas al bajar a la mitad.

Cómo: un vídeo sintético de 30 fps y 4 s en el que cada fotograma tiene un gris distinto. Se casa cada frame extraído
con su fotograma de origen y se exige un salto único, igual al `paso` del manifest. Se prueba con `--frames`,
`--fps`, `--inicio`, WebP y AVIF, y con la variante móvil.

```bash
node pruebas/scroll-frames/probar-paso.mjs   # ffmpeg en FFMPEG o en el PATH; ~1 min
```

## Modo vídeo: `video-scrubber.js`

`probar-video.mjs` saca el MP4 de `--video-scrub` del mismo tipo de vídeo sintético (60 fotogramas, grises bien
separados) y lo mueve en Chrome con `video.html`: para cada progreso mira qué fotograma se pinta, hace un barrido rápido
como un scroll real y comprueba que, parado, no se hacen más búsquedas.

```bash
cd demos/reloj && node ../../pruebas/scroll-frames/probar-video.mjs   # playwright-core está en demos/reloj; puerto 5198
```

Resultado (11-11-2026): el motor nuevo da 11/11. El de la beta.6 (buscaba en segundos y comparaba con `currentTime`)
pintaba siempre un fotograma de menos y al final del scroll no llegaba al último. En Chrome no llegó a hacer el bucle de
búsquedas que se vio en otras webs, pero la regla de la nota de trampas (índice pedido + centro del fotograma) cubre
los dos fallos.

`salida/` se regenera en cada pasada (va en `.gitignore`).
