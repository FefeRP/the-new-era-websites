# Contrato de la composición y límites (HyperFrames 0.9.34, comprobado en 11-2026)

Documentación oficial: https://hyperframes.heygen.com (índice para máquinas en `/llms.txt`). En local, sin red:
`node hf.mjs docs data-attributes | gsap | compositions | rendering | troubleshooting`.

## La raíz
```html
<div id="x" data-composition-id="x" data-start="0" data-duration="8" data-width="1080" data-height="1920" data-fps="30">
```
- `data-duration` en segundos. Ponla **siempre**: con three.js o canvas no se puede deducir.
- Tamaños habituales: 1080×1920 (9:16, reels), 1080×1350 (4:5), 1080×1080, 1920×1080.
- `--fps` en la orden manda sobre `data-fps`. 30 para redes y fondos; 60 duplica el tiempo de render.

## Elementos con tiempo (opcional)
`class="clip"` + `data-start` + `data-duration` hacen que un elemento solo exista en su tramo. Para un hero o un bucle
no hace falta: basta la línea de tiempo. `data-track-index` es solo el carril del editor; quién tapa a quién lo decide
`z-index`.

## Quién mueve cada cosa
| Tipo de animación | Cómo se registra |
|---|---|
| GSAP | `gsap.timeline({ paused: true })` → `window.__timelines["<id>"] = tl`, después de añadir los tweens |
| CSS `@keyframes` | Iteraciones finitas y `animation-fill-mode: both` |
| Web Animations API | `fill: "both"` y `pause()` |
| three.js, WebGL, canvas 2D, p5 | Pintar dentro de `window.addEventListener("hf-seek", e => …)` con `e.detail.time` |
| Carga pesada (texturas, modelos, frames) | Promesa en `window.__hf.buildReady.<clave>`: el render espera **hasta 45 s**; si no se resuelve a tiempo o se rechaza, falla con el motivo. En una máquina cargada, deja ahí solo lo imprescindible para el primer fotograma y el resto espéralo en cada `hf-seek` con `waitUntil` |
| Esperas durante la carga | Durante el render el reloj está parado y los `requestAnimationFrame` no corren hasta el primer fotograma: nada de la carga puede esperar a un rAF ni a un temporizador |
| Pintado asíncrono en un fotograma | `e.detail.waitUntil(promesa)`, llamado en el mismo momento del evento (no después de un `await`) |
| Sin línea de tiempo | `data-no-timeline` en la raíz; si no, el render espera 45 s a que aparezca una |

## Lo que rompe el render (y a veces sin avisar)
- **Reloj del navegador**: `requestAnimationFrame`, `performance.now()`, `Date.now()`, `setTimeout`/`setInterval` para
  animar. El `lint` solo detecta algunos (`requestAnimationFrame`, `Math.random`, `repeat: -1`): `performance.now` y
  los temporizadores **pasan el lint y salen mal**.
- **El `lint` busca el texto**: un motor copiado que contiene `requestAnimationFrame` da error aunque ese camino no se
  use (también lo da un comentario que lo nombre). Es un aviso a revisar, no un fallo del vídeo: comprueba con
  `snapshot` que el lienzo cambia entre instantes.
- **Azar sin semilla**: cada fotograma lo puede capturar un proceso distinto; con `Math.random()` las partículas saltan.
  Usa un generador con semilla (hay uno de 2 líneas en la plantilla del bucle).
- **`repeat: -1`**: prohibido. Repeticiones finitas que quepan en la duración.
- **Transiciones CSS** (`transition:`): dependen del reloj. Todo cambio va en la línea de tiempo.
- **Red durante el render**: fuentes de Google, GSAP de un CDN, imágenes remotas. Todo en local dentro de la carpeta.
- **Unidades de ventana** (`vw`, `vh`, `svh`, `vmin`): conviértelas a px del lienzo (en 1080×1920, 1 vmin = 10,8 px).
- **Consultas de medios** (`prefers-reduced-motion`, `pointer`, anchos): un motor de web puede elegir su camino
  "quieto" o de móvil. Fuerza la variante en el código de la composición.
- **Medios**: no llames a `play()`, `pause()` ni toques `currentTime` de un `<video>`; se declaran con `data-start` y los
  mueve el render. No animes `width`/`top` del `<video>`: anima un envoltorio.
- **Escala de imágenes** con tweens: hay un fallo abierto en el que no sale en el render; escala un envoltorio.
- **`preserveDrawingBuffer`**: en un `WebGLRenderer` propio ponlo a `true` para que la captura no encuentre el lienzo vacío.

## Salidas
| Formato | Orden | Notas |
|---|---|---|
| MP4 H.264 | `render -o x.mp4` | `--quality draft\|looks\|delivery`, `--crf N`, `--start/--end`, `--chroma-subsampling 444` para texto fino de color |
| WebM VP9 con alfa | `render --format webm` | `html`, `body` y la raíz sin fondo. Comprobado: `yuva420p` |
| MOV ProRes 4444 con alfa | `render --format mov` | Para edición. En Windows hay un fallo abierto con la captura segmentada |
| Secuencia PNG | `render --format png-sequence -o carpeta` | `frame_000001.png`…, RGBA. Comprobado |
| GIF | `render --format gif --gif-loop 0` | Tope 30 fps; mejor 15. Solo para documentación |
| Capturas sueltas | `snapshot --at 1,3,5` | PNG + hoja de contactos en `.hyperframes/artifacts/snapshots/` |

## Rendimiento y máquina
- `--workers N`: un Chrome por proceso (~256 MB cada uno, más con WebGL). Con poca memoria o sin GPU, **`--workers 1`**.
  Con varios procesos los fotogramas pueden diferir un poco entre sí (fallo abierto): para un bucle exacto, uno solo.
- Sin GPU usa WebGL por software: funciona (shaders y three.js salen bien) pero a ~1 s por fotograma en 1080p.
- No lances dos renders a la vez: se quitan la CPU y la memoria. El CLI espera su turno (`--wait`, por defecto) con otros
  renders de HyperFrames, pero no sabe nada de otros programas (otro Chrome, otro motor de vídeo).
- Windows: funciona. A veces el cierre del navegador se queda colgado unos segundos al acabar («Timed out closing
  browser»); el vídeo ya está escrito. Fallos abiertos conocidos: `EBUSY` al lanzar ffmpeg (reintentar) y MOV segmentado.
- Disco: los fotogramas intermedios van a la carpeta temporal; con poco espacio libre el render puede negarse a empezar.
- La carpeta `.hyperframes/` (estado y capturas) y `renders/` no se suben al repositorio.

## Lo que no hace
- No genera imagen realista ni entiende una foto: solo graba lo que el navegador dibuja.
- No graba una web "tal cual" navegando por ella: hay que darle una composición que obedezca al tiempo. Para grabar la
  web real con su scroll y sus clics (un recorrido), se usa la grabación por capturas del navegador, que es otra cosa.
- No hay guía oficial de bucles: el bucle se cierra por construcción (receta 2) y se mide.
- Lo que pide cuenta o plan de pago de HeyGen (nube, `reverse-any-video`, `style-sampling`, MCP alojado) queda fuera.
