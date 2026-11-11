# Recetas: de la web al vídeo y del código a la web

Todas se lanzan con `node <skill>/scripts/hf.mjs …` desde la carpeta de la composición. Las medidas son de una máquina
de 3 núcleos sin GPU (ver «Lo que cuesta» en la skill). Probadas: 1, 2, 3 y 5. Las recetas 4 y 6 son el mismo patrón
aplicado a otros motores y se indica qué falta por probar.

## 1. Hero de una web con WebGL a vídeo 9:16
Caso real: hero de una web de bebida con el líquido movido por un shader, la lata en three.js (torno con la etiqueta),
seis frutas recortadas en capas y un titular gigante. La web lo anima con su propio reloj; el vídeo sale de una
composición nueva que **reutiliza sus piezas**.

**No se graba la página entera.** Se copian a la carpeta de la composición:
- los assets del sabor elegido, las fuentes (`.woff2`) y las librerías (`three.module.min.js`, `gsap.min.js`);
- el motor del líquido **sin tocar** y el de la lata **adaptado**;
- del CSS, solo los colores y la tipografía. La maquetación se rehace para 1080×1920.

**Adaptar un motor con reloj propio** (lo que cambia, y nada más):
| En la web | En la composición |
|---|---|
| `requestAnimationFrame(cuadro)` que suma `dt` | Se quita. Queda una función `pintar(t)` que dibuja el segundo `t` |
| `performance.now()` para una animación de entrada | `k = clamp((t·1000 − retraso) / ms)` y la **misma curva** que usaba la web |
| Ratón o giroscopio | Se quitan (o se sustituyen por una función de `t` si el movimiento importa) |
| `devicePixelRatio`, `ResizeObserver` | Tamaño fijo: `renderer.setPixelRatio(1)`, `setSize(ancho, alto, false)` |
| `matchMedia('(prefers-reduced-motion)')` | Se quita: aquí siempre hay movimiento |
| Respaldo si falla WebGL (la foto) | Se quita: si falla, que falle el render y se vea |

Un motor que ya expone su tiempo y su `pintar()` no hay que tocarlo: se le pone el tiempo y se le manda pintar.
```js
const liquido = LiquidoFlujo.crear(lienzoLiquido, "assets/liquido-foto.webp"); liquido.cargar();
let lata = null;
const pintar = (t) => { liquido.tiempo = t; liquido.pintar(); lata?.pintar(t); };
window.addEventListener("hf-seek", (e) => pintar(e.detail.time));
(window.__hf ??= {}).buildReady ??= {};
window.__hf.buildReady.hero = Promise.all([
  crearLata(lienzoLata, { perfilUrl, etiquetaUrl }).then((l) => { lata = l; }),
  fotoCargada, document.fonts.ready,
]).then(() => pintar(0));
```
Lo que es DOM (titular por líneas, frutas que entran y flotan, texto y botón) va en la línea de tiempo de GSAP. El
flotar es un vaivén **finito**: `yoyo: true, repeat: 3` con una duración que quepa.

**Recomponer para vertical** (lo que se hizo): titular arriba en dos líneas, lata centrada un poco por debajo del
titular para que lo pise (da profundidad), frutas con las posiciones de móvil de la web (`% × 10,8` y `% × 19,2` px),
frase y botón abajo, y fuera flechas, puntos y contador. Los avisos legales de la web («maqueta no oficial») **se
mantienen** en el vídeo.

**Guion de 8 s:** 0-2,2 s entrada (titular sube, la lata sube girando 2 vueltas y frena, frutas desde fuera con
rebote); 2,2-8 s reposo vivo (líquido que fluye, balanceo de la lata, frutas flotando). Para un reel con varios
sabores: una composición por sabor y unirlas en el editor, o una sola con cada sabor como `clip`.

**Medido:** 1080×1920, 240 fotogramas, 234 s de render, 8,8 MB, 0 fotogramas repetidos. El fotograma 0 es el fondo sin
nada: el póster se saca de más adelante (`snapshot --at 3`).

## 2. Fondo en bucle sin corte, por código
Plantilla: [plantillas/bucle](../plantillas/bucle/index.html) (manchas de color desenfocadas en órbita y motas que
suben). El bucle es exacto **por construcción**, no por fundido:
- Una sola variable, la fase `f` de 0 a 1, interpolada en línea recta durante toda la duración.
- Todo lo que se mueve es periódico en `f` con un número **entero** de vueltas: `sin(2π·n·f + desfase)`, órbitas
  cerradas, y lo que avanza (motas, rayas, ruido) recorre un número entero de «pantallas» y se envuelve con `%`.
- Ruido: usa ruido periódico o muévete en círculo por el ruido (`ruido(cos 2πf, sin 2πf)`), nunca `ruido(t)`.
- El azar, con semilla. Sin curvas de entrada ni salida: un bucle no «empieza».
- Con 6 s a 30 fps se renderizan los fotogramas 0 a 179; el 180 sería igual al 0, y por eso no se nota la vuelta.

```bash
node hf.mjs preparar .                       # vendor/gsap.min.js
node hf.mjs render --workers 1 --fps 30 -o salida/bucle.mp4
node <skill>/scripts/medir-bucle.mjs salida/bucle.mp4
# {"fotogramas":180,"saltoMediano":0.928,"saltoMayor":1.215,"costura":1.012,"relacion":1.09,"repetidos":0,"sinCorte":true}
```
`costura` es la diferencia entre el último fotograma y el primero; tiene que parecerse al salto normal entre dos
fotogramas seguidos (`relacion` ≤ 1,5). Un vídeo que no es bucle da decenas (el hero de la receta 1: 86).

**Dejarlo en peso web** (el MP4 que sale es de calidad alta, 3,5 MB para 6 s):
```bash
ffmpeg -i bucle.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart bucle-web.mp4
ffmpeg -i bucle.mp4 -an -vf scale=1280:-2 -c:v libvpx-vp9 -crf 36 -b:v 0 bucle-web.webm
```
En la web: `<video autoplay muted loop playsinline poster="…">` con el primer fotograma de póster, pausado fuera de
vista y sustituido por el póster con reduced-motion (reglas de `base-tecnica.md` de la maestra). Los fondos suaves
(desenfoques, degradados) aguantan mucha compresión; si aparecen bandas, añade un grano fino en la composición.

**Cuándo no:** si el fondo se puede hacer con CSS o un shader ligero en la propia web y no pesa en el móvil, es mejor
que un vídeo (se adapta a cualquier pantalla y no pesa). El vídeo gana cuando el efecto es caro de calcular (muchos
desenfoques, partículas, 3D) o tiene que verse idéntico en todos los dispositivos.

## 3. Un tramo de scroll por fotogramas, a vídeo
Plantilla: [plantillas/scroll-a-video](../plantillas/scroll-a-video/index.html). La sección de la web que avanza con el
scroll (skill `scroll-frames`) se convierte en vídeo haciendo que **el tiempo haga de scroll**.
- Copia al lado `frame-scrubber.js` y la carpeta de frames con su `manifest.json` (la misma que usa la web).
- `progresoEn(t)` convierte el segundo en progreso 0..1 con una curva (`power1.inOut` da un arranque y una llegada
  suaves, como un dedo). En cada `hf-seek` se llama a `seq.fijar(p)`, que espera a que ese frame esté decodificado y lo
  pinta en el momento; `e.detail.waitUntil()` hace que el render espere.
- Los textos que en la web van en la timeline del pin se copian a la línea de tiempo con sus mismos puntos.
- Variante fija (`variante: 'movil'` para 9:16, `'escritorio'` para 16:9) y `dprMax: 1`.

Calidad: el vídeo no puede ser mejor que los frames. Los de móvil suelen medir 720-900 px de ancho; para un 1080×1920
limpio, vuelve a extraer del vídeo original con `--ancho-movil 1080`. Y si la secuencia tiene 90 frames y el vídeo pide
180 fotogramas, cada frame se repite dos veces: ajusta la duración a `frames / fps` o extrae más frames.

## 4. Producto girando
Tres caminos, según lo que ya tenga la web:
- **Secuencia de frames del giro** (vídeo de IA o render ya hecho): receta 3 con curva `none` (giro constante). Para
  que el giro sea bucle, la secuencia tiene que ser de 360° sin repetir el último frame.
- **`envase-giratorio`** (etiqueta plana enrollada en un canvas): el motor recibe el ángulo; se le pasa
  `ángulo = 360 · vueltas · f` desde `hf-seek`. Con vueltas enteras cierra en bucle.
- **`escena-3d-gltf`** (modelo glTF con three.js): el patrón de la lata de la receta 1 (tiempo como entrada,
  `preserveDrawingBuffer: true`, carga en `buildReady`).

Sin probar todavía con estos dos motores: mira si exponen el ángulo o el tiempo antes de adaptarlos, y aplica la tabla
de la receta 1.

## 5. Capa animada con transparencia
Plantilla: [plantillas/capa-alfa](../plantillas/capa-alfa/index.html). `html`, `body` y la raíz **sin fondo**.
```bash
node hf.mjs render --workers 1 --format webm -o salida/capa.webm           # VP9 con alfa (yuva420p)
node hf.mjs render --workers 1 --format png-sequence -o salida/capa-png    # frame_000001.png… RGBA
```
En la web **no** se pone el WebM a pelo: Safari no reproduce WebM con alfa. Pasa los PNG por `alfa.mjs` de `capas-alfa`
para sacar el MP4 de alfa apilado, el WebM y los frames WebP, y usa su `video-alfa.js`:
```bash
node <capas-alfa>/scripts/alfa.mjs --entrada salida/capa-png/frame_%06d.png --modo ya-alfa --fps 30 --salida public/alfa/capa
```
Usos: sellos, destellos, un contador, una flecha dibujándose, humo o confeti generativo encima de una foto.

## 6. Secuencia para scroll hecha por código
Cuando el momento estrella se puede dibujar (despiece de un objeto hecho con capas, un plano que se construye, un
gráfico, tipografía, un producto en three.js) no hace falta un modelo de IA de vídeo:
1. Composición con el movimiento **lineal** en el tiempo (curva `none`): el scroll ya pone su propia curva.
2. `render -o momento.mp4` a la resolución final.
3. `node <scroll-frames>/scripts/extraer-frames.mjs momento.mp4 public/frames/momento --frames 120` (y
   `--video-scrub` si se quiere el modo vídeo). Probado con el bucle de la receta 2: 90 frames de 1280×720 en 0,5 MB.
4. En la web, `frame-scrubber.js` como siempre.

Ventajas sobre el vídeo de IA: gratis, repetible, sin cosas que «hierven», texto y logos exactos, y se puede cambiar un
color y volver a sacar. Límite: lo que no se sabe dibujar por código (materiales reales, luz filmada).
Si se quiere el momento vivo en la web y no en frames, quizá sobra el vídeo: valora la animación directa con
`gsap-scrolltrigger`. Los frames ganan cuando es caro de pintar en un móvil.
