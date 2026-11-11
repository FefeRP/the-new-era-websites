# Prueba de `video-desde-html` (HyperFrames)

Renderiza las tres plantillas de la skill con HyperFrames y comprueba lo que sale con ffprobe y `medir-bucle.mjs`.

## Preparar
```bash
cd pruebas/hyperframes
npm install --ignore-scripts     # hyperframes 0.9.34 y gsap, versiones fijadas en package.json
npm audit signatures             # firmas y procedencia de los paquetes
```
Hace falta Node 22 o superior, Chrome instalado y ffmpeg (en el PATH o en las variables `FFMPEG` / `FFPROBE`). El
lanzador de la skill (`scripts/hf.mjs`) apaga la telemetría, no instala skills en global y no descarga navegador.

## Lanzar
```bash
node probar.mjs                         # las tres; unos 10 minutos sin GPU
node probar.mjs bucle                   # una sola: bucle | capa-alfa | scroll-a-video
```
`scroll-a-video` usa los frames de la demo del reloj (`demos/reloj/public/frames/reloj`); si no están, se salta.

## Qué comprueba
| Plantilla | Comprobaciones |
|---|---|
| `bucle` | lint sin errores; 1920×1080, 30 fps, 180 fotogramas; costura ≤ 1,5 veces el salto normal; ningún fotograma repetido |
| `capa-alfa` | WebM VP9 `yuva420p` de 30 fotogramas; 30 PNG RGBA; la esquina del primer PNG es transparente |
| `scroll-a-video` | 1080×1920 y 180 fotogramas; la secuencia avanza con el tiempo y acaba lejos de donde empieza |

Deja los vídeos y `medidas.json` (segundos de render, peso, costura) en `salida/`, que no se sube al repositorio.
No lances esta prueba a la vez que otro render: se reparten la CPU y los tiempos no valen.

## Medidas de referencia
Máquina de 3 núcleos, 12 GB, sin GPU (WebGL por software), `--workers 1`, 30 fps:

| Composición | Render | Peso | Notas |
|---|---|---|---|
| `bucle` 1920×1080, 6 s | 231 s | 3,5 MB | costura 1,012 frente a un salto normal de 0,928 (relación 1,09) |
| `capa-alfa` 600×600, 1 s | 38 s (WebM), 34 s (PNG) | — | casi todo es arranque del navegador |
