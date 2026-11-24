---
name: scroll-frames
description: "Montar en la web una secuencia que ya existe (frames o vídeo) para que avance con el scroll, estilo Apple: extraer frames, scrubber en canvas o vídeo, rendimiento. «scroll como el de Apple», «que el vídeo avance con el scroll», «image sequence scroll», «scrub video on scroll». NO para generar el vídeo (video-ia-para-scroll) ni si el visitante gira el objeto (escena-3d-gltf)."
license: MIT
version: 1.3.0
---

# Scroll-scrubbing: vídeo → frames → scroll

> **En NEW ERA:** módulo **Scroll inmersivo y frames** y **Vídeo con IA** (`new-era/references/modulos/scroll-inmersivo.md`, `video-ia.md`): la maestra la carga cuando ese módulo está activo en el brief. Usada sola, funciona igual.

El scroll hace de cabezal de reproducción: el visitante "arrastra" un vídeo. Es fake-3D: parece 3D real
(producto que gira, se despieza, cámara que vuela) pero son imágenes. Es la técnica con mejor relación
impacto/coste: funciona en cualquier móvil y no hace falta modelo 3D.

## Cuándo sí y cuándo no
- **Sí:** producto protagonista (gira, se abre, se monta), un recorrido de cámara, una transformación (ingredientes que caen, líquido, materia). Todo lo que en 3D real sería carísimo (fluidos, humo, telas, comida) **cuando se mueve**. Si el momento puede estar quieto (un splash congelado, un plato servido), es una foto con alfa que mueve el código (`capas-alfa` + `parallax-capas`); humo y chispas que van por encima de la web, vídeo sobre negro con `capas-alfa` (`--modo negro`).
- **No:** si el visitante tiene que *interactuar* con el objeto (girarlo a su gusto, configurar colores) → `escena-3d-gltf`. Si solo quieres profundidad sin movimiento de cámara → `parallax-capas` (pesa mucho menos).

## Elegir modo (decídelo y apúntalo)
| Modo | Cuándo | Peso típico (6 s) |
|---|---|---|
| **Frames en canvas** (por defecto) | 90-150 frames en escritorio, 60-90 en móvil; hero o sección fijada. Preciso en todos los navegadores, también iOS en ahorro de batería. | 3-8 MB escritorio, 1,5-4 MB móvil |
| **Vídeo con currentTime** | Secuencias largas (>10 s o >200 frames), o el peso manda. Necesita póster de reserva (iOS en ahorro de batería no lo deja reproducir). | 0,8-3 MB |
| **CSS sprite + `animation-timeline`** | Micro-secuencias (≤24 frames, iconos, pequeños objetos). Sin JS. | <500 KB |

## Antes de programar (obligatorio)
El código de esta skill se monta dentro de un proyecto: no se escribe de memoria (regla 6 de `new-era`; protocolo en
`new-era/references/codigo-y-plataforma.md`).
- **`find-docs`** (cárgala con `Skill`): lee la versión en el `package.json` y consulta en esa versión GSAP ScrollTrigger y Lenis antes de
  usar o cambiar su API. En Next.js, además, cómo se monta en un componente de cliente y se desmonta con `destruir()`.
- **`modern-web-guidance:modern-web-guidance`** (con `Skill`): busca y aplica las guías de imagen o póster de la primera pantalla (LCP), precarga y prioridad de los primeros frames, vídeo diferido, reduced-motion.
- Apunta cada consulta en `BRIEF.md` («Documentación consultada»).

## Pasos

### 1. Conseguir el vídeo bueno
- Si hay que generarlo con IA, **usa `pedir-assets-ia`** (qué pedir, presupuesto, prompts por plano, revisión) y `video-ia-para-scroll` (movimiento). Un mal vídeo no se arregla después.
- Si viene del cliente: un solo plano, sin cortes, velocidad constante, sin texto quemado.
- Revisa antes de extraer: `ffprobe` (fps, duración, resolución) y una hoja de contactos:
  `ffmpeg -i v.mp4 -vf "fps=2,scale=480:-2,tile=6x3" -frames:v 1 hoja.png` → mira que no haya saltos, morphing ni parpadeos.

### 2. Extraer y optimizar
```bash
node scripts/extraer-frames.mjs fuente.mp4 public/frames/producto --frames 120 --ancho 1600 --ancho-movil 900
#   --ancho / --ancho-movil   por defecto 1600 / 900: el máster puede ser 1920, pero lo que se sirve es 1600 px en
#                             escritorio y 900 px en móvil (menos si el canvas no ocupa toda la pantalla)
#   --formato ambos      añade AVIF (≈30 % menos peso; el motor lo usa si el navegador lo soporta)
#   --recorte-movil x=0.45   desplaza el recorte 9:16 del móvil hacia el sujeto
#   --inicio 0.5 --fin 5.5   descarta arranque/frenada del generador
#   --video-scrub        además el MP4 con GOP denso para el modo vídeo
```
El script toma **1 de cada k fotogramas** del vídeo (k entero, o `--paso K` a mano), así que el total puede no ser
exactamente `--frames` (avisa si se aleja más de un 10 %). Es a propósito: con un fps que no divide al del vídeo
(24 de 30, por ejemplo) los frames quedan a intervalos desiguales y el scroll da tirones aunque el vídeo sea perfecto.
Si necesitas un número concreto, ajusta el tramo (`--inicio`/`--fin`) o pide el vídeo a otra duración.

Sale `escritorio/0001.webp…`, `movil/0001.webp…`, `poster-*.webp` y `manifest.json` (con `fps`, `paso`, `inicio`, el tamaño `original` del
vídeo y el `recorte` de la variante móvil: lo usa `seguir-pantalla` para casar la pista con cada frame). Lee el peso que imprime y compáralo
con el presupuesto (references/rendimiento.md). Si te pasas: menos frames (90-100 suelen bastar en escritorio, 60-90 en móvil), `--calidad 65`, o AVIF.

**Frames con alfa** (el elemento aislado avanza con el scroll sobre la página, sin fondo): sácalos con `capas-alfa`
(`alfa.mjs --formatos frames`, WebP con alfa) en vez de con `extraer-frames.mjs`, y crea el scrubber con
`transparente: true` (o deja `alfa: true` en el manifest, que `alfa.mjs` ya escribe). El lienzo se limpia en cada frame
en vez de pintar encima. Pesan ~1,5-2× los opacos: resolución contenida y menos frames.

### 3. Maquetar (HTML real primero)
El póster es un `<img>` real (cuenta como LCP y es lo que ve quien no tiene JS o pide menos movimiento); el canvas va encima.
Patrón completo en [references/patrones-codigo.md](references/patrones-codigo.md) (sección "Maqueta").

### 4. Conectar al scroll
Copia `scripts/frame-scrubber.js` al proyecto (no lo edites; se configura por opciones) y:
```js
import { crearFrameScrubber } from './frame-scrubber.js';
const seq = await crearFrameScrubber({ canvas, base: '/frames/producto/' });
ScrollTrigger.create({ trigger: '#seccion', start: 'top top', end: '+=300%', pin: true, scrub: true,
  onUpdate: (s) => seq.progreso(s.progress) });
```
- Con Lenis: `scrub: true` (sin número) para no apilar dos suavizados. Sin Lenis: `scrub: 0.5`.
- Duración del tramo: ~2,5-4 pantallas (`+=250%`…`+=400%`) para 120 frames. Más corto se siente brusco; más largo, aburrido.
- Modo vídeo: `scripts/video-scrubber.js` con el MP4 de `--video-scrub` (patrón en references).
- Textos que aparecen en momentos del vídeo: una timeline con el mismo ScrollTrigger (references, "Textos sincronizados").
- **Cada frame se pinta entero y nítido, sin mezclar dos** (nada de fundidos entre frames: en scrub se ven dobles). Si el frame
  pedido no ha llegado, pinta el más cercano cargado.
- Algo pegado a la escena (la web en una pantalla, un logo en un cartel): opción `alDibujar({ i, x, y, w, h, escala, canvas,
  manifest, variante })`, que se llama tras pintar cada frame con dónde quedó dibujado; `seguir-pantalla` la usa para su capa.
- Para capturas y renders fotograma a fotograma: `await seq.fijar(p)` coloca la secuencia en el progreso `p`, espera a
  que **ese** frame esté decodificado y lo pinta en el momento (devuelve el índice). Lo usa `video-desde-html` para
  convertir el tramo de scroll en un vídeo para redes. Y al revés: si el vídeo de origen se puede dibujar por código,
  esa skill lo renderiza sin modelo de IA y aquí se extraen los frames como siempre.

### 5. Accesibilidad y reservas (obligatorio)
- `prefers-reduced-motion: reduce` → no se crea el scrubber ni el pin: se queda el póster y el contenido fluye normal.
- Sin JS / fallo de carga → el `<img>` póster ya está en su sitio. El canvas lleva `aria-hidden="true"`.
- El texto importante, siempre en HTML encima (nunca dentro del vídeo).

### 6. Verificar (no lo des por hecho)
- Capturas en 6+ posiciones del tramo, escritorio (1440×900) y móvil (390×844): `node ../new-era/scripts/verificar-scroll.mjs <url> <carpeta>`.
- Que en la pestaña Red no haya 404 de frames y que el peso total cuadre.
- Scroll rápido arriba y abajo: nunca debe verse el canvas vacío (el motor pinta el frame cargado más cercano).
- Revisión visual con un modelo de visión (p. ej. Gemini) de las capturas o de una grabación.

## Checklist de rendimiento
- [ ] 90-150 frames de 1600 px en escritorio, 900 px en móvil (mismo número en un manifest; 60-90 si se extrae aparte); peso dentro del presupuesto (escritorio ≤8 MB, móvil ≤4 MB).
- [ ] Variante móvil propia (vertical 9:16, 900 px de ancho), no el frame de escritorio reescalado.
- [ ] Póster `<img fetchpriority="high">` y `width/height` puestos (sin CLS). El canvas va encima y el motor lo deja oculto
  hasta pintar el primer frame (un lienzo opaco sale negro y taparía el póster).
- [ ] En las pruebas, el frame de un progreso dado se compara con ±1: el scroll con fracciones de píxel (móvil a DPR 2,
  `svh`) puede dejar el 59 donde esperabas el 60.
- [ ] DPR con tope 2; el canvas no supera la resolución del frame.
- [ ] Solo se redibuja al cambiar el índice; un único bucle rAF (gsap.ticker si hay Lenis).
- [ ] Memoria acotada (ventana LRU de bitmaps: 48 escritorio / 24 móvil) y `destruir()` al desmontar (SPA/Next).
- [ ] Frames servidos con caché larga (`Cache-Control: public, max-age=31536000, immutable`) y nombre de carpeta versionado.
- [ ] reduced-motion y sin-JS comprobados con captura.

## Referencias
- [references/patrones-codigo.md](references/patrones-codigo.md): maqueta, GSAP + Lenis, sin GSAP, modo vídeo, textos sincronizados, HUD de datos ligado al progreso (contador, tiempo, temperatura, estado), React/Next.
- [references/rendimiento.md](references/rendimiento.md): presupuestos, memoria en iOS, formatos, caché, interpolación de frames, fondo transparente.
- [references/problemas.md](references/problemas.md): síntomas → causa → arreglo.
