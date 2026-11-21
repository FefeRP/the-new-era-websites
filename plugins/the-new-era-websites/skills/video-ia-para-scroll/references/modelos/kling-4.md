# Kling 4.0 y 4.0 Flash

**Para qué en una web:** el recorrido de cámara **guiado** de un scroll largo. Es el único modelo con **fotogramas
intermedios** (hasta 10 fotogramas clave: inicio, intermedios y fin), así que puedes fijar por dónde pasa la cámara
en lugar de esperar que llegue. Salió el 23-10-2026; Flash, el 04-11-2026.

## Parámetros reales (API oficial de Kling y MCP de Higgsfield `kling4_0`)
- Fotogramas clave de inicio, intermedios y fin: hasta 10.
- Referencias: hasta 10 imágenes, 5 vídeos (3-30 s), 7 `elements`, 15 recursos en total.
- 720p / 1080p (por defecto) / 4K; rango dinámico SDR o **HDR**.
- Proporción: 21:9, 16:9, 9:16, 1:1, 4:3, 3:4 o adaptativa.
- **3-30 s** (10 por defecto: si quieres 5, dilo), 24 fps. Multiplano automático: apágalo para scroll.
- **Flash:** hasta 20 s, 720p, sin inicio + fin y sin fotogramas intermedios.

## Precio (21-11-2026)
- **API, $/s:** 720p 0,1257 · 1080p 0,1879 · 4K 0,549. HDR: +0,047 $/s a 1080p y +0,078 $/s en 4K. Con
  referencias, desde 0,0772. Flash: 0,094 $/s (5 s = 0,47 $).
- **Web, créditos por 5 s:** 720p 12,5 · 1080p 18,75 · Flash 7,5.
- Cuidado con la duración por defecto de 10 s: duplica el precio si no la cambias.

## Qué hace bien
- Que la cámara pase por puntos concretos (útil cuando el recorrido tiene paradas que coinciden con secciones de la
  web: cada fotograma clave es una sección).
- Planos largos y bucles controlados.
- Dice admitir texto, emojis y logos en pantalla: **sin pruebas publicadas**; sigue poniendo la marca por código.

## Fallos conocidos
- No hay fallos documentados todavía (modelo de un mes). Trátalo como Kling 3.0: puede quedarse quieto entre
  fotogramas clave muy separados y saltar. Fotogramas clave **alcanzables** entre sí (misma lente, altura y luz).
- Una guía de terceros dice que la lente escrita en el prompt cambia el plano en Kling 4; no lo demuestra con una
  prueba controlada [3]. Fija la lente en la imagen.

## Prompt de partida (recorrido con paradas)
```
One continuous camera move with no cuts. The camera travels forward at a constant speed, passing exactly through
each keyframe in order, keeping the same lens, the same height and the same light. Constant velocity, no drift,
no reframing, no speed changes between keyframes. Clean image without text.
```
Atlas Cloud resume el control en Kling 4: «constant velocity» + nombrar el destino + rehacer el fin si tiene otra
lente o escala [2].

## Fuentes
1. Kling, documentación de la API 4.0 [parcial]: https://kling.ai/document-api/api/video/4-0
2. Atlas Cloud, movimiento de cámara controlado en Kling 4 [parcial]: https://www.atlascloud.ai/blog/tips/kling-4-controlled-camera-movement
3. YouArt, guía de prompts de Kling 4.0 [parcial]: https://youart.ai/blog/kling-4-0-prompt-guide
4. Consola de Higgsfield, precios por modelo [leída entera]: https://console.higgsfield.ai/pricing
