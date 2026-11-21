---
name: video-desde-html
description: Convierte en vídeo las animaciones hechas con HTML, CSS y JS usando HyperFrames (framework open source de HeyGen, Apache-2.0), sin modelos de IA de vídeo. Dos sentidos. De la web al vídeo, el hero, un tramo de scroll o el producto girando pasan a MP4 9:16 o 16:9 para promos y redes. Del código a la web, fondos en bucle sin corte, capas con transparencia (WebM con alfa, secuencia PNG) y secuencias para scroll por fotogramas, generados por código y repetibles. Trae un lanzador seguro (versión fijada, sin telemetría, sin descargas), plantillas probadas (bucle, capa con alfa, scroll a vídeo), el patrón para motores con WebGL o canvas, un medidor de bucles y el reparto con scroll-frames, capas-alfa, Remotion y los modelos de IA. Úsala cuando pidan "pasa el hero a vídeo", "vídeo de la web para redes", "reel de la web", "fondo en bucle sin IA", "vídeo en bucle por código", "render de HTML a vídeo", "HyperFrames", "frames para scroll sin IA", "capa animada con transparencia", "HTML to video", "render website animation to MP4", "seamless loop background video", "code-generated video", "hyperframes render".
license: MIT
version: 1.0.0-beta.12
---

# Vídeo desde HTML (HyperFrames)

[HyperFrames](https://github.com/heygen-com/hyperframes) abre una página HTML en Chrome sin ventana, la **para** en cada
fotograma (segundo 0, 1/30, 2/30…), la captura y la une con ffmpeg. No graba la pantalla: por eso el vídeo sale sin
saltos aunque la máquina sea lenta, y dos renders dan los mismos fotogramas. A cambio, la página tiene que saber
dibujarse **en cualquier instante que le pidan**: el tiempo es una entrada, no el reloj del navegador.

Sirve para dos cosas:

| Sentido | Qué sale | Para qué |
|---|---|---|
| **Web → vídeo** | MP4 9:16, 1:1 o 16:9 del hero, de un tramo de scroll o del producto girando | Promos, reels, anuncios, la `og:video`, el caso en el portfolio |
| **Código → web** | Bucle sin corte (MP4/WebM), capa con alfa (WebM VP9, PNG), secuencia para scroll | Fondos de hero, capas animadas, frames para `scroll-frames`, sin pagar ni esperar a un modelo de IA |

No sustituye a los modelos de IA de vídeo: no inventa imagen realista (humo, líquido, una órbita de un producto del que
solo hay una foto). Mueve **lo que ya se puede dibujar en el navegador**: tipografía, capas, formas, shaders, 3D con
three.js, secuencias de frames que ya existen. Lo realista se sigue pidiendo con `pedir-assets-ia` y
`video-ia-para-scroll`.

## Antes de instalar: seguridad
Es código de terceros que arranca un navegador y ffmpeg. Lo comprobado en la versión **0.9.34** (11-2026):
- Solo son oficiales el paquete `hyperframes` y los `@hyperframes/*` (repo `heygen-com/hyperframes`, Apache-2.0,
  publicados con procedencia firmada). En npm hay decenas de paquetes con nombre parecido de terceros: no los instales.
- **Telemetría activada por defecto** (PostHog: orden, versión, sistema, CPU; no rutas ni contenido). Se apaga con
  `HYPERFRAMES_NO_TELEMETRY=1` o `DO_NOT_TRACK=1`.
- `hyperframes init` **instala skills en global** (`~/.claude/skills`) y `npx hyperframes` baja la última versión cada
  vez. Si no hay Chrome, descarga un `chrome-headless-shell`.
- Las órdenes `auth`, `cloud`, `lambda`, `cloudrun`, `share`, `publish` y el MCP alojado suben el proyecto a la nube de
  HeyGen con una cuenta: **no se usan** sin el sí de quien responde del proyecto.
- `npm audit` avisa de `undici` (cliente HTTP que el CLI usa para sus descargas). El render local no necesita red si todo está en la carpeta (no se ha auditado conexión a conexión: si
  importa, renderiza sin red).

Por eso se instala **fijado, sin scripts de instalación y en la carpeta de trabajo**, y se lanza con
[scripts/hf.mjs](scripts/hf.mjs), que apaga la telemetría, no instala skills, usa el Chrome del sistema y no descarga nada:

```bash
npm init -y
npm install --save-dev --save-exact --ignore-scripts hyperframes@0.9.34 gsap
npm audit signatures                      # firmas y procedencia
node <skill>/scripts/hf.mjs doctor        # Node >= 22, ffmpeg, Chrome, memoria y disco
```
ffmpeg tiene que estar en el PATH o en la variable `FFMPEG`. Para subir de versión: lee las notas de la versión, cambia
el número, repite `npm audit signatures` y vuelve a pasar la prueba (`pruebas/hyperframes/` del repositorio).

## El contrato de una composición (lo mínimo)
Una composición es una carpeta con un `index.html`. Reglas completas y las que fallan en silencio:
[references/contrato-y-limites.md](references/contrato-y-limites.md).

```html
<div id="hero" data-composition-id="hero" data-start="0" data-duration="8"
     data-width="1080" data-height="1920" data-fps="30"> … </div>
<script src="vendor/gsap.min.js"></script>   <!-- local, no de un CDN: durante el render no hay que depender de la red -->
<script>
  const tl = gsap.timeline({ paused: true });      // pausada: la mueve el render
  tl.from("#titulo", { yPercent: 105, duration: 0.9, ease: "power4.out" }, 0.1);
  tl.set({}, {}, 8);                               // la línea de tiempo dura lo mismo que data-duration
  window.__timelines = window.__timelines || {};
  window.__timelines["hero"] = tl;                 // la misma clave que data-composition-id
</script>
```
- `html` y `body` con el tamaño exacto en px y `overflow: hidden`. Sin unidades de ventana (`vw`, `svh`): aquí no hay ventana.
- **Prohibido** dentro de la composición: `requestAnimationFrame`, `Date.now()`, `performance.now()`, temporizadores
  para animar, `Math.random()` sin semilla, `repeat: -1`, transiciones CSS, pedir cosas a la red.
- Fuentes con `@font-face` y fichero local (`font-display: block`).

## Los tres patrones (probados)
1. **Todo DOM con GSAP**: lo de arriba. Títulos, capas, tarjetas, parallax.
2. **Una fase que lo mueve todo** (bucles, generativo): una sola interpolación lineal de `f` de 0 a 1 y una función
   `pintar(f)` que coloca cada cosa. Plantilla [plantillas/bucle](plantillas/bucle/index.html).
3. **Lienzos (WebGL, three.js, canvas 2D, secuencias de frames)**: se pintan en el evento `hf-seek`, con el tiempo que
   trae, y la carga se anuncia en `window.__hf.buildReady`:
   ```js
   window.addEventListener("hf-seek", (e) => {
     const t = e.detail.time;                       // segundos
     liquido.tiempo = t; liquido.pintar();          // shader: el uniforme de tiempo es t
     lata.pintar(t);                                // three.js: rotación = función de t, y renderer.render()
     e.detail.waitUntil?.(secuencia.fijar(p(t)));   // si pintar es asíncrono, que el render espere
   });
   (window.__hf ??= {}).buildReady ??= {};
   window.__hf.buildReady.hero = Promise.all([texturas, document.fonts.ready]);
   ```
   Plantilla [plantillas/scroll-a-video](plantillas/scroll-a-video/index.html). Cómo adaptar un motor que tiene su propio
   reloj: [references/recetas.md](references/recetas.md), receta 1.

## Antes de programar (obligatorio)
El código de esta skill se monta dentro de un proyecto: no se escribe de memoria (regla 6 de `new-era`; protocolo en
`new-era/references/codigo-y-plataforma.md`).
- **`find-docs`** (cárgala con `Skill`): lee la versión en el `package.json` y consulta en esa versión GSAP, three.js o la librería que use la composición (la versión que fija la composición) antes de
  usar o cambiar su API.
- **`modern-web-guidance:modern-web-guidance`** (con `Skill`): busca y aplica las guías de solo si la pieza vuelve a la web: vídeo diferido, póster y formatos.
- Apunta cada consulta en `BRIEF.md` («Documentación consultada»).

## Pasos
1. **Decide el sentido y el formato** con la tabla de arriba y la de [reparto](#reparto-quién-hace-qué). Apunta en el
   `BRIEF.md` el tamaño, la duración, los fps y a dónde va (reel, fondo de hero, frames de scroll).
2. **Copia la plantilla** más cercana a una carpeta de trabajo (una por vídeo) y `node hf.mjs preparar <carpeta>` (deja
   `vendor/gsap.min.js`). Para un hero de una web que ya existe: copia sus assets, sus fuentes y sus motores, **no la
   página entera** (receta 1).
3. **Recompón para el formato**: 9:16 no es el hero de escritorio recortado. Sujeto al centro, titular arriba, la
   llamada a la acción abajo, y fuera lo que solo tiene sentido con ratón (flechas, puntos, menú).
4. **Mira antes de renderizar**: `node hf.mjs lint` y `node hf.mjs snapshot --at 0.5,2,5` (capturas PNG y una hoja de
   contactos). Corrige ahí: una captura tarda segundos, un render tarda minutos.
5. **Render**: `node hf.mjs render --workers 1 --fps 30 -o salida/hero-9x16.mp4`. Formatos en la tabla de abajo.
6. **Comprueba el resultado** (checklist) y, si es un bucle, `node scripts/medir-bucle.mjs salida/bucle.mp4`.
7. **Llévalo a su sitio**: a redes tal cual; a la web, por la skill que toca (reparto).

| Quiero | Orden | Sale |
|---|---|---|
| Vídeo para redes | `render -o x.mp4` (H.264, `--quality looks` por defecto, CRF 16) | MP4 |
| Fondo en bucle para la web | `render -o bucle.mp4` y luego recomprimir a peso web (receta 2) | MP4 (+ WebM) |
| Capa con transparencia | `render --format webm -o capa.webm` (`html` y `body` sin fondo) | WebM VP9 con alfa |
| Frames con alfa o para montar fuera | `render --format png-sequence -o carpeta` | `frame_000001.png`… RGBA |
| Frames para scroll | `render -o x.mp4` y `extraer-frames.mjs` de `scroll-frames` | manifest + WebP |
| Solo un trozo | `--start 2 --end 5` (MP4) | — |

## Recetas
En [references/recetas.md](references/recetas.md), con el código y las medidas de cada una:
1. **Hero de una web con WebGL a vídeo 9:16** (líquido por shader, lata en three.js, frutas en capas, titular).
2. **Fondo en bucle sin corte** por código, y cómo dejarlo en peso web.
3. **Un tramo de scroll por fotogramas a vídeo** (el tiempo hace de scroll).
4. **Producto girando**: con `envase-giratorio`, con `escena-3d-gltf` o con una secuencia de frames.
5. **Capa animada con transparencia** para poner encima de la web.
6. **Secuencia para scroll hecha por código** (sin modelo de IA de vídeo).

## Reparto: quién hace qué
| Necesidad | Manda | Esta skill aporta |
|---|---|---|
| Vídeo realista de un producto o de una escena (órbita, despiece, humo, líquido filmado) | `pedir-assets-ia`, `video-ia-para-scroll` | Nada. Si ya existe el clip, lo monta con textos y marca encima (receta 3) |
| Vídeo de la propia web para redes o portfolio (hero, scroll, producto) | **Esta skill** | Composición, render y comprobación |
| Fondo en bucle abstracto o tipográfico, generativo, shader | **Esta skill** | El bucle exacto por construcción y su medida |
| Bucle de un material real (agua, tela, fuego) | `video-ia-para-scroll` (receta de bucle) | Solo `medir-bucle.mjs` para comprobar la costura |
| Mover frames con el scroll en la web | `scroll-frames` (`extraer-frames.mjs`, `frame-scrubber.js`, `video-scrubber.js`) | El vídeo de origen cuando se hace por código; nunca el motor de la web |
| Vídeo o imagen con alfa en la web | `capas-alfa` (`alfa.mjs`, `video-alfa.js`: Safari no reproduce WebM con alfa) | El WebM o los PNG con alfa nativo, sin croma |
| Movimiento de la interfaz dentro de la web (botón, menú, hover) | `animate`, `emil-design-eng` | Nada |
| Curvas, timelines y plugins de GSAP | `gsap-skills:gsap-timeline`, `gsap-core` | Las reglas que cambian al renderizar (pausada, sin `repeat: -1`) |
| Shaders y 3D | `webgl-animation-skills`, `escena-3d-gltf`, `envase-giratorio` | El patrón `hf-seek`: el motor recibe el tiempo |
| Pieza editada con voz, subtítulos, cortes de cámara, música (episodio, promo larga) | **Remotion**, si el proyecto ya lo tiene montado (React) | Solo los planos sueltos de la web, que se importan como vídeo |
| Composición nueva con muchas escenas de vídeo sin Remotion | Las skills oficiales de HyperFrames (`/hyperframes`, `/hyperframes-cli`), si están instaladas | El lanzador seguro y las recetas de web |

**Con Remotion no se pisa:** los dos renderizan con Chrome y ffmpeg. Remotion es React y manda en la edición (voz,
subtítulos, secuencias largas). HyperFrames es HTML tal cual: gana cuando lo que hay que grabar **ya es una web** (sus
CSS, sus motores, sus fuentes) y cuando el resultado vuelve a la web. No montes los dos motores para la misma pieza: el
plano de la web se renderiza aquí y entra en Remotion como un `.mp4` más.

**Con las skills oficiales de HyperFrames:** si están instaladas, llevan el contrato completo, el catálogo de bloques y
el estilo de vídeo. Esta skill no las repite: pone lo específico de webs y el lanzador. No las instales en global sin
permiso (lo hace `init` por su cuenta: por eso el lanzador lo desactiva).

## Lo que cuesta (medido)
Máquina de 3 núcleos, 12 GB, **sin GPU** (WebGL por software), un solo proceso de render, 30 fps:

| Composición | Tamaño | Duración | Render | Por fotograma | Peso |
|---|---|---|---|---|---|
| Hero con shader + three.js + 6 capas | 1080×1920 | 8 s (240) | 234 s | ~1,0 s | 8,8 MB |
| Bucle: 5 manchas con desenfoque grande + 70 motas | 1920×1080 | 6 s (180) | 231 s | ~1,3 s | 3,5 MB |
| Capa con alfa, DOM sencillo | 600×600 | 1 s (30) | 34-38 s | fijo ~30 s de arranque | — |

Regla para presupuestar sin GPU: **30 s de arranque + 1 a 1,5 s por fotograma** a 1080p. Con GPU baja mucho (no medido
aquí). Lo que más pesa son los `filter: blur()` grandes y el WebGL por software. Prueba a media resolución o con
`--start/--end` y deja el render completo para el final.

## Checklist
- [ ] `lint` sin errores y hoja de `snapshot` revisada antes del render.
- [ ] `ffprobe`: tamaño, fps, duración y número de fotogramas son los pedidos (duración × fps).
- [ ] Ningún fotograma repetido ni salto (`medir-bucle.mjs` da `repetidos: 0` y `saltoMayor` razonable).
- [ ] Bucle: `sinCorte: true` (la costura no supera 1,5 veces el salto normal). Y se ve en un `<video loop>` real.
- [ ] El primer fotograma sirve de póster (o se elige otro con `snapshot --at`): que no sea una pantalla vacía.
- [ ] Texto dentro de la zona segura de la red social (en 9:16, fuera de los ~250 px de arriba y ~350 px de abajo).
- [ ] Peso para la web: fondo de hero ≤ 1,5-3 MB tras recomprimir, con póster y sin sonido.
- [ ] En la web, el vídeo o los frames entran por su skill (`scroll-frames`, `capas-alfa`) con reduced-motion resuelto.
- [ ] Nada subido a la nube de HeyGen; telemetría apagada; versión fijada en `package.json`.
