# Recetas: enseñar el producto y vender el servicio (base)

Seis recetas de la sección J del [catálogo](catalogo-tecnicas.md). No piden ningún módulo: HTML, CSS y unas decenas de
líneas de JS. Los activos (modelos, platos, fotos sucias y limpias) salen del cliente o del módulo
[Assets de IA](modulos/assets-ia.md). Cada receta dice **cuándo usarla**, **qué activos pide**, **cómo** (con el código
base, probado en Chrome) y **en qué falla**. Antes de escribir el código de la web, sigue
[codigo-y-plataforma.md](codigo-y-plataforma.md) (`find-docs` y `modern-web-guidance`).

Todas comparten tres reglas:
- **El activo manda la composición.** Las seis recetas funcionan porque todas las piezas tienen la misma luz, cámara,
  escala y fondo. Si los activos no casan, ninguna animación lo arregla: pídelos con una sola plantilla (misma altura
  de cámara, mismo suelo, mismo fondo liso, mismo margen alrededor de la figura).
- **Cifras reales.** Precios, tiempos y rangos los da el cliente. Si faltan, se marcan como pendientes en el BRIEF,
  nunca se inventan (regla «No inventar» de la skill).
- **Siempre hay una vía sin gesto**: flechas y teclado en la pasarela, un botón «Limpiarlo todo» en la de pintar, una
  lista normal debajo de los puntos. Y con `prefers-reduced-motion` todo cambia sin desplazamientos (solo fundidos).

---

## 1. Pasarela con foco (moda por looks, carta, gama corta)

**Cuándo:** de 3 a 12 productos que se entienden mejor de cuerpo entero o en su plato y que se eligen uno a uno (looks,
platos, modelos de bici, gafas). No para un catálogo de 200 referencias: ahí va una rejilla con filtro.

**Activos:** una figura por producto, **todas con el mismo fondo liso** (hueso, gris claro), la misma altura de cámara
y los pies (o la base del plato) en la misma línea. Con IA: una plantilla de prompt fija y solo cambia la ropa
(`pedir-assets-ia`, «continuidad»). Para cada figura, una **copia ya desenfocada** (8-12 px a 1x) hecha al exportar:
animar `filter: blur()` en 5 imágenes grandes cuesta fotogramas.

**Cómo:**
- 5 huecos visibles; el del centro es el activo. Cada hueco tiene su escala, opacidad y posición fija; lo que cambia
  es **qué figura ocupa cada hueco**. Así la animación es siempre la misma y no depende de cuántos productos haya.
- La figura nítida y la desenfocada están apiladas; la del hueco central muestra la nítida y las de los lados la
  desenfocada (se cruzan por opacidad).
- Fondo sin recortar: al exportar, lleva el fondo liso de cada foto a **blanco puro `#fff`** (curvas o niveles; con
  ffmpeg, `colorlevels=rimax=0.94:gimax=0.94:bimax=0.94` si el fondo mide ~240) y pon las figuras con
  `mix-blend-mode: multiply` sobre la página del color que quieras (hueso, arena). Blanco × color de la página = color
  de la página: el fondo de la foto desaparece sin alfa y sin halos. **Ojo:** si el fondo de la foto no es blanco puro
  (p. ej. hueso sobre hueso), el multiply lo oscurece y se ven los rectángulos (medido en Chrome). Con la web oscura
  esto no vale: figuras con alfa (`capas-alfa`).
- Panel lateral «En este look» con `aria-live="polite"`: al cambiar, las filas salen y entran escalonadas.

```html
<section class="pasarela" aria-roledescription="carrusel" aria-label="Looks">
  <div class="pista">
    <!-- una .figura por producto; data-i = su índice -->
    <figure class="figura" data-i="0">
      <img class="nitida" src="look-1.webp" alt="Look 1: abrigo camel y pantalón gris" width="600" height="1000">
      <img class="borrosa" src="look-1-blur.webp" alt="" aria-hidden="true" width="600" height="1000">
    </figure>
    <!-- … -->
  </div>
  <button class="anterior" aria-label="Look anterior">‹</button>
  <button class="siguiente" aria-label="Look siguiente">›</button>
  <aside class="panel" aria-live="polite"><!-- piezas del look activo --></aside>
</section>
```

```css
.pasarela { --fondo: #efebe4; background: var(--fondo); position: relative; overflow: clip; }
.pista { position: relative; height: min(78svh, 900px); }
.figura { position: absolute; left: 50%; bottom: 0; height: 100%; aspect-ratio: 3 / 5; margin: 0;
  translate: calc(-50% + var(--x, 0%)) 0; scale: var(--s, 1); opacity: var(--o, 1);
  transform-origin: 50% 100%; mix-blend-mode: multiply;
  transition: translate .45s cubic-bezier(.2,.7,.2,1), scale .45s cubic-bezier(.2,.7,.2,1), opacity .35s; }
.figura img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; transition: opacity .35s; }
.figura .borrosa { opacity: var(--b, 0); }
.figura .nitida { opacity: calc(1 - var(--b, 0)); }
@media (prefers-reduced-motion: reduce) { .figura { transition: opacity .2s; } }
```

```js
// pasarela.js — los huecos son fijos; cada figura recibe las variables del hueco que ocupa.
const HUECOS = { '-2': [-150, .78, .45, 1], '-1': [-80, .9, .8, 1], '0': [0, 1, 1, 0],
                 '1': [80, .9, .8, 1], '2': [150, .78, .45, 1] }; // [x %, escala, opacidad, borrosa]
export function crearPasarela(raiz, { alCambiar } = {}) {
  const figuras = [...raiz.querySelectorAll('.figura')];
  const n = figuras.length;
  let activo = 0;
  function pintar() {
    figuras.forEach((f, i) => {
      let d = i - activo;
      if (d > n / 2) d -= n; if (d < -n / 2) d += n;          // la fila da la vuelta
      const h = HUECOS[d];
      f.hidden = !h;
      if (!h) return;
      const [x, s, o, b] = h;
      f.style.setProperty('--x', x + '%'); f.style.setProperty('--s', s);
      f.style.setProperty('--o', o); f.style.setProperty('--b', b);
      f.style.zIndex = 10 - Math.abs(d);
      f.inert = d !== 0;                                        // solo el del centro recibe foco
    });
    alCambiar?.(activo);
  }
  const ir = (paso) => { activo = (activo + paso + n) % n; pintar(); };
  const ant = raiz.querySelector('.anterior'), sig = raiz.querySelector('.siguiente');
  ant.addEventListener('click', () => ir(-1));
  sig.addEventListener('click', () => ir(1));
  const tecla = (e) => { if (e.key === 'ArrowLeft') ir(-1); if (e.key === 'ArrowRight') ir(1); };
  raiz.addEventListener('keydown', tecla);
  pintar();
  return { ir, get activo() { return activo; }, destruir() { raiz.removeEventListener('keydown', tecla); } };
}
```

Con 4 o menos productos, deja los huecos ±2 vacíos (la figura queda `hidden`). El arrastre se añade con Pointer
Events sobre `.pista` (umbral de 40 px → `ir(±1)`), sin librería.

**Falla si:** las figuras tienen distinta escala o suelo (la fila «baila»), el fondo de las fotos no es blanco puro
(con multiply se ven rectángulos más oscuros), o se anima `filter: blur()` en vez de cruzar con la copia ya desenfocada.

---

## 2. Puntos sobre el producto enlazados con la lista

**Cuándo:** el producto se compone de piezas que se compran o se explican sueltas (las prendas de un look, los
ingredientes de un plato, las partes de una máquina).

**Cómo:**
- Cada pieza tiene una clave; el punto (`<button>` sobre la imagen) y la fila de la lista llevan la misma
  `data-pieza`. Pasar o enfocar cualquiera de los dos marca los dos.
- Los puntos se colocan **en % de la imagen** (`left: 42%; top: 31%`) dentro de un contenedor con el mismo
  `aspect-ratio` que la imagen, así no se mueven al cambiar el tamaño.
- Entrada en la vista de detalle: las demás figuras se funden (300 ms), la activa se queda y los puntos aparecen
  escalonados (60 ms). Escape vuelve a la pasarela.

```css
.detalle { position: relative; aspect-ratio: 3 / 5; }
.punto { position: absolute; left: var(--px); top: var(--py); translate: -50% -50%; width: 28px; height: 28px;
  border-radius: 50%; border: 0; background: #fff; box-shadow: 0 0 0 6px rgb(255 255 255 / .35); }
.punto[data-activo], .fila[data-activo] { outline: 2px solid currentColor; outline-offset: 3px; }
```

```js
export function enlazarPiezas(raiz) {
  const marcar = (clave) => raiz.querySelectorAll('[data-pieza]').forEach((el) =>
    el.toggleAttribute('data-activo', el.dataset.pieza === clave));
  for (const ev of ['pointerover', 'focusin'])
    raiz.addEventListener(ev, (e) => { const el = e.target.closest('[data-pieza]'); if (el) marcar(el.dataset.pieza); });
  raiz.addEventListener('pointerleave', () => marcar(null));
}
```

**Falla si:** los puntos tapan la cara o la pieza que nombran (ponlos sobre el borde de la prenda), o si en móvil
solo se puede ver la etiqueta pasando el ratón (en táctil, el punto abre la etiqueta al pulsar).

---

## 3. Producto en escenario (carta, producto estrella)

**Cuándo:** un producto por pantalla con carácter de «plato del día» o «modelo del año», con pocas variantes (2-6).

**Composición:** fondo oscuro, **foco cenital** en cono sobre el producto, **reflejo** en el suelo, el **nombre en
letras de contorno gigantes detrás** del producto (cortado por él), los vecinos pequeños y desenfocados a los lados, y
una ficha a la izquierda: categoría, contador `02 / 03`, nombre en serif, dos líneas de descripción, precio y flechas.

```css
.escenario { position: relative; background: #0d0c0b; isolation: isolate; overflow: clip; }
.foco { position: absolute; inset: 0 25%; pointer-events: none; mix-blend-mode: screen;
  background: linear-gradient(to bottom, rgb(255 236 210 / .28), rgb(255 236 210 / 0) 75%);
  clip-path: polygon(42% 0, 58% 0, 100% 100%, 0 100%); }
.titulo-fondo { position: absolute; inset-inline: 0; top: 18%; text-align: center; z-index: -1;
  font: 900 clamp(5rem, 18vw, 16rem)/.85 var(--condensada); text-transform: uppercase;
  color: transparent; -webkit-text-stroke: 1.5px rgb(255 255 255 / .35); }
.producto { position: relative; width: min(46vw, 640px); margin-inline: auto; }
.producto img { display: block; width: 100%; height: auto; }          /* PNG/WebP con alfa */
.producto .reflejo { position: absolute; inset-inline: 0; top: 100%; scale: 1 -1; opacity: .3;
  mask-image: linear-gradient(to top, #000, transparent 35%); }
.contador { font-variant-numeric: tabular-nums; }
```

- El producto necesita alfa (recorte limpio, con su sombra de contacto aparte): `capas-alfa` o la foto del cliente
  recortada. El reflejo es la misma imagen con `scale: 1 -1` y una máscara; no se genera aparte.
- Al cambiar: el título de contorno sale por arriba con `clip-path: inset(0 0 100% 0)` y entra el nuevo; el producto
  hace un fundido con 20-30 px de desplazamiento; la ficha cambia con un escalonado corto. Total 500-700 ms.
- «Toda la carta» (o «todos los modelos») lleva a la vista normal en lista: es la vía accesible y la de móvil
  estrecho.

**Falla si:** el contorno es tan fino que desaparece en móvil (sube a 2 px por debajo de 600 px de ancho), el foco
tiene borde duro (usa el degradado, no un color plano) o el reflejo se ve más que el producto (opacidad ≤ 0,35).

---

## 4. «Límpialo tú»: el visitante prueba el resultado

**Cuándo:** servicios cuyo resultado es visual (limpieza, pintura, restauración, pulido, jardinería). Convence porque
el visitante «hace» el trabajo en 5 segundos.

**Activos:** dos fotos del **mismo encuadre**: sucia y limpia (del cliente, o la limpia hecha a partir de la sucia
con edición de imagen IA; marcarlo como recreación si no es un trabajo real).

**Cómo:** la foto limpia es un `<img>` normal; encima, un `<canvas>` con la sucia. Al pulsar y arrastrar se borra la
capa sucia con `destination-out`. El % limpio se mide con una rejilla de muestras, no recorriendo todos los píxeles en
cada movimiento.

```js
// limpiar.js — capa sucia que se borra pintando. Devuelve destruir().
export function crearLimpieza(canvas, imgSucia, { radio = 38, alAvanzar, cada = 200 } = {}) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let ultimo = 0, pintando = false, previo = null;
  function preparar() {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(imgSucia, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = ctx.lineJoin = 'round';
  }
  function medir() {                                   // % limpio con una rejilla de 40 × 25 muestras
    const { width: w, height: h } = canvas, datos = ctx.getImageData(0, 0, w, h).data;
    let limpias = 0, total = 0;
    for (let y = 0; y < 25; y++) for (let x = 0; x < 40; x++) {
      const i = ((Math.floor((y + .5) * h / 25) * w) + Math.floor((x + .5) * w / 40)) * 4 + 3;
      total++; if (datos[i] < 128) limpias++;
    }
    return Math.round(limpias / total * 100);
  }
  function trazo(e) {
    const r = canvas.getBoundingClientRect();
    const p = { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
    ctx.lineWidth = radio * 2 * dpr;
    ctx.beginPath(); ctx.moveTo((previo ?? p).x, (previo ?? p).y); ctx.lineTo(p.x, p.y); ctx.stroke();
    previo = p;
    const t = performance.now();
    if (t - ultimo > cada) { ultimo = t; alAvanzar?.(medir()); }
  }
  const abajo = (e) => { pintando = true; previo = null; canvas.setPointerCapture(e.pointerId); trazo(e); };
  const mover = (e) => { if (pintando) trazo(e); };
  const arriba = () => { pintando = false; alAvanzar?.(medir()); };
  canvas.addEventListener('pointerdown', abajo);
  canvas.addEventListener('pointermove', mover);
  canvas.addEventListener('pointerup', arriba);
  canvas.addEventListener('pointercancel', arriba);
  preparar();
  return {
    limpiarTodo() { ctx.clearRect(0, 0, canvas.width, canvas.height); alAvanzar?.(100); },
    reiniciar() { preparar(); alAvanzar?.(0); },
    medir,
    destruir() {
      canvas.removeEventListener('pointerdown', abajo); canvas.removeEventListener('pointermove', mover);
      canvas.removeEventListener('pointerup', arriba); canvas.removeEventListener('pointercancel', arriba);
    },
  };
}
```

- `canvas { touch-action: none; }` para que en móvil pinte en vez de hacer scroll; y deja margen a los lados para
  poder seguir bajando la página.
- Dos herramientas = dos radios (boquilla ancha 60 px, lanza 22 px) o dos formas de brocha; un chip para cada una.
- Contador `NN %` con `tabular-nums` y, al pasar del 85 %, el resto se limpia solo con un fundido y aparece la llamada
  («¿La tuya también? Presupuesto gratis»).
- Botón **«Limpiarlo todo»** visible siempre: es la vía con teclado y la de movimiento reducido.

**Falla si:** las dos fotos no están alineadas al píxel (la limpieza «mueve» la imagen), el canvas se pinta a 1x en
pantallas 2x (se ve borroso) o se lee `getImageData` en cada `pointermove` (tirones en móvil).

---

## 5. Instrumento que explica el método

**Cuándo:** el servicio adapta una medida al caso (presión según la superficie, temperatura según el material,
potencia según los metros). El dial convierte «sabemos lo que hacemos» en algo que se ve.

**Cómo:** chips con los casos; un SVG con un arco de fondo, el arco del rango y la aguja. Al elegir un caso, la aguja
gira hasta el valor y el arco se rellena hasta el rango; debajo, una línea dice **por qué**.

```html
<svg viewBox="0 0 200 120" class="dial" role="img" aria-labelledby="dial-texto">
  <path d="M20 100 A80 80 0 0 1 180 100" pathLength="100" class="pista"/>
  <path d="M20 100 A80 80 0 0 1 180 100" pathLength="100" class="rango"/>
  <line x1="100" y1="100" x2="100" y2="34" class="aguja"/>
</svg>
<p id="dial-texto" aria-live="polite"><strong class="valor">1500–2000 PSI</strong> · <span class="porque"></span></p>
```

```css
.dial .pista, .dial .rango { fill: none; stroke-width: 10; stroke-linecap: round; }
.dial .pista { stroke: rgb(0 0 0 / .1); }
.dial .rango { stroke: currentColor; stroke-dasharray: 100; stroke-dashoffset: calc(100 - var(--hasta, 0));
  transition: stroke-dashoffset .6s cubic-bezier(.2,.7,.2,1); }
.dial .aguja { stroke: currentColor; stroke-width: 3; transform-origin: 100px 100px;
  rotate: calc(-90deg + var(--hasta, 0) * 1.8deg); transition: rotate .6s cubic-bezier(.3,1.25,.4,1); }
.valor { font-variant-numeric: tabular-nums; }
```

```js
// casos: { madera: { hasta: 30, texto: '500–1200 PSI', porque: 'La madera se astilla con más presión.' }, … }
// dial = el contenedor que envuelve el <svg> y el <p> (la variable --hasta baja a los dos).
function elegir(dial, caso) {
  dial.style.setProperty('--hasta', caso.hasta);           // 0–100 del arco
  dial.querySelector('.valor').textContent = caso.texto;
  dial.querySelector('.porque').textContent = caso.porque;
}
```

El `pathLength="100"` hace que el arco se rellene con números de 0 a 100 sin medir su longitud. La curva de la aguja
tiene un pequeño rebote (`1.25`); sin rebote si hay `prefers-reduced-motion`.

**Falla si:** los valores no son los del oficio (pídeselos al cliente) o el dial es decoración sin la frase del porqué.

---

## 6. Presupuesto al instante y barra fija

**Cuándo:** servicios con precio por tramos que el cliente ya sabe calcular (metros, habitaciones, extras). Cambia
«pide presupuesto» por «mira cuánto es» y deja el formulario para el paso siguiente.

**Cómo:**
- Estado en un objeto (`{ tamano: 'mediana', extras: new Set() }`), chips como `<input type="radio">` y
  `<input type="checkbox">` con estilo de chip (accesibles sin JS extra).
- El precio se calcula con la tabla del cliente y se enseña **como rango** («320 – 410 €»), con lo que incluye y un
  aviso: «Precio orientativo; se confirma en la visita».
- Las cifras se animan de un valor al otro en 300-500 ms (`requestAnimationFrame` con interpolación, o la propiedad
  registrada `@property --n` con `counter-reset`), con `tabular-nums` para que no bailen.
- El botón lleva el rango a la reserva (`?desde=320&hasta=410&extras=…`) para que el formulario ya lo tenga.

**Barra fija:** una barra estrecha abajo con la llamada principal que aparece cuando el hero sale de la vista y se
oculta cuando el pie o el formulario entran (dos `IntersectionObserver`). Padding inferior con
`env(safe-area-inset-bottom)` y, en móvil, el `body` con el mismo alto de margen inferior para no tapar nada.

**Falla si:** el precio es inventado, el rango es tan amplio que no dice nada (más de ×2) o la barra aparece desde el
principio encima del hero (ya hay un botón ahí).

---

## Cómo se combinan

- **Tienda de moda por looks:** 1 + 2, y la vista de rejilla como alternativa («Ver todos los looks»).
- **Carta de restaurante o gama corta:** 3 (con la lista «Toda la carta» como vía accesible), y 1 si hay más de 6.
- **Servicio a domicilio:** trabajo por zonas con anillo (sección B del catálogo) o antes/después arrastrando → 4 → 5
  → 6 con la barra fija. Con 3 de los 4 ya está; los cuatro solo si la página es larga.
