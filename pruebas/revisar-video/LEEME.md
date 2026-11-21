# Prueba de `revisar-video.mjs`

Comprueba el control de calidad de `video-ia-para-scroll/scripts/revisar-video.mjs` con vídeos sintéticos de verdad
conocida (sin IA, sin red, 0 $). Genera dos "escenas" con el filtro `mandelbrot` de ffmpeg y monta con `zoompan`:

| Caso | Qué tiene | Qué debe decir el informe |
|---|---|---|
| acercamiento constante | ×2,5 en 5 s a ritmo fijo (×1,096 cada 0,5 s) | apto, sin paradas, saltos, tirones ni cortes; escala ≈ 1,096 |
| cámara que se para | igual hasta 3,5 s y luego ×1,01 cada 0,5 s | paradas solo desde 3,5 s |
| recorrido corto | constante, ×1,03 cada 0,5 s | apto, con el aviso «Recorrido CORTO» y ×1,35 en total |
| salto sin corte | a 1,5 s pasa a otra escena con un fundido de 3 fotogramas | no apto, salto hacia 1,5 s |
| corte seco | corte a los 2 s | no apto, corte de escena (scdet) en 2 s |
| salto disimulado | de 1,0 a 1,5 s la cámara va al triple y la escena cambia con un fundido de 0,4 s | no apto, tirón entre 1,0 y 1,5 s |
| paneo lateral | desplazamiento sin acercamiento | apto, «sin acercamiento», sin falsas paradas |

```bash
node pruebas/revisar-video/probar.mjs     # ~1 min; necesita ffmpeg (variable FFMPEG o PATH)
```

Los vídeos se dejan en `salida/` (en `.gitignore`). Además se probó a mano con clips reales de Kling O3 y Seedance 2.5
con fallos conocidos: el script encontró el tirón con cambio de luz de un Seedance con primer y último fotograma muy
distintos (1,0-1,5 s), su frenazo final (×1,04 y ×1,02 por medio segundo), el salto de contenido de un Kling O3 (s 3,9)
y el recorrido corto de otro (×1,5 en 5 s).
