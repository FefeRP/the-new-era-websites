# Física y fluidez de interfaz

Guía destilada de un estudio de unos 90 componentes de movimiento (desplegables, islas dinámicas, docks, carruseles,
menús, transiciones de página, efectos gooey y magnéticos). Aquí no hay código copiado de ellos: van los valores que usan,
lo que funciona, por qué funciona y cómo construirlo desde cero. El código de este documento es propio.

Regla de fondo: lo que se siente «caro» no es el efecto, sino tres propiedades. **Responde en el primer fotograma**,
**se puede interrumpir sin saltos** y **se detiene como un objeto con masa**. Todo lo demás es decoración.

---

## 1. Muelles

### 1.1 La única fórmula que hace falta

Un muelle amortiguado: `a = (-k·(x - objetivo) - c·v) / m`.

- `k` (stiffness, rigidez): cuánto tira. Más rigidez, más rápido.
- `c` (damping, amortiguación): cuánto frena. Decide si rebota.
- `m` (mass, masa): inercia. Bajarla hace lo mismo que subir `k` y `c` a la vez.

Las dos magnitudes que de verdad importan:

- **Frecuencia propia** `ω = √(k/m)` (rad/s). Fija la velocidad. Un muelle crítico llega a ~99 % en unos `6,6/ω` s.
- **Proporción de amortiguación** `ζ = c / (2·√(k·m))`. Fija el carácter:
  `ζ < 1` rebota (0,5 rebota claramente; 0,7 deja un pellizco; 0,85 apenas se nota), `ζ = 1` crítico (llega lo antes posible
  sin pasarse), `ζ > 1` sobreamortiguado (llega despacio al final, sensación «pesada» o «pegajosa»).

Para pasar de uno a otro: `c = 2·ζ·√(k·m)` y `k = m·ω²`.

**Motion (framer-motion) con `bounce` y `visualDuration`** (comprobado en el código de motion-dom actual):
`ζ = 1 - bounce` (con suelo de 0,05; bounce negativo sobreamortigua), masa 1,
`ω = 2π / (1,2 · visualDuration)`, `k = ω²`, `c = 2·ζ·√k`. Con `duration` (sin `visual`) resuelve la rigidez numéricamente para que
el muelle termine en ese tiempo. Si pasas `stiffness`/`damping`/`mass`, se ignoran `duration` y `bounce`.

Equivalencias útiles:

| visualDuration / bounce | k | c | ζ |
|---|---|---|---|
| 0,26 s / 0,12 | 406 | 35 | 0,88 |
| 0,40 s / 0 | 171 | 26 | 1,00 |
| 0,42 s / 0,16 | 155 | 21 | 0,84 |
| 0,60 s / 0,22 | 76 | 13,6 | 0,78 |

### 1.2 Valores reales encontrados (ordenados por uso)

| Uso | k / c / m (o bounce / duración) | ζ | Notas |
|---|---|---|---|
| Pulsación de botón, toggles, pulgares | 500 / 30 / 0,6 | 0,87 | rápido, sin rebote visible |
| Botón «globo» (rAF propio) | 520, `c = 2√k·(1-bounce)` | variable | pulsación mínima de 140 ms para que un clic rápido se vea |
| Pulsación con «vida» | vd 0,26 / bounce 0,12 | 0,88 | |
| Panel de desplegable | spring 0,34 s / bounce 0,16 | 0,84 | salida: 0,13 s con curva, no muelle |
| Botón que se convierte en menú | 380 / 34 / 0,8 | 0,97 | crece desde su esquina |
| Panel o barra lateral | 420 / 40 / 0,5 | 1,38 | sobreamortiguado a propósito: un panel no rebota |
| Barra lateral (ancho) | 320 / 34 / 0,7 | 1,14 | |
| Cambios de layout / FLIP | 360 / 32 / 0,6 o vd 0,40 / bounce 0 | 1,0-1,1 | layout nunca rebota |
| Morph de forma / resaltado compartido | vd 0,42 / bounce 0,16 | 0,84 | |
| Indicador de pestañas / resaltado de menú | 520 / 30 / 0,8 · 300 / 25 · spring 0,28 / bounce 0,2 | 0,72-0,8 | aquí sí un pellizco de rebote |
| Indicador de pestañas «barato» | 400 / 20 | 0,5 | demasiado rebote para una pestaña |
| Isla dinámica (carcasa) | spring 0,8 s / bounce 0,2 | 0,8 | |
| Isla dinámica (contenido) | spring 0,8 s / bounce 0,35 | 0,65 | el contenido rebota más que la carcasa |
| Isla dinámica (morph) | spring 0,6 s / bounce 0,22 | 0,78 | |
| Dock: escala por icono | 420 / 26 | 0,63 | |
| Dock: elevación | 360 / 22 | 0,58 | |
| Dock: deriva lateral | 300 / 20 | 0,58 | |
| Dock: etiqueta que sigue | 340 / 26 | 0,70 | |
| Dock 3D | 460 / 36 + umbrales 0,0005 / 0,002 | 0,84 | |
| Seguimiento del ratón | 200 / 15 / 0,3 | 0,97 | masa baja: sigue sin arrastrar |
| Botón magnético | 200 / 20 | 0,71 | |
| Iconos magnéticos | 180 / 14 / 0,6 | 0,67 | |
| Botón magnético «líquido» | 220 / 18 / 0,1 | 1,9 | sobreamortiguado: se pega, no oscila |
| Elevar plato en una cinta | 330 / 23 | 0,63 | |
| Carrusel que recibe la velocidad del gesto | 40 / 20 / 3 | 0,91 | muy lento y pesado: rueda y se posa |
| Carrusel con snap (crítico) | ω = 11 (k 121, c 22) | 1,0 | |
| Cinta que busca un plato | ω = 5,6 crítico | 1,0 | |
| Cuerpo delantero de una gota | 210 / 25 / 1 | 0,86 | |
| Cuerpo trasero de una gota | 72 / 13 / 1 | 0,77 | y al 8 % de fuerza los primeros 70 ms |
| Aplastamiento (escala Y) de la gota | 280 / 9 | 0,27 | muy vivo: es un detalle secundario |

Lecturas de la tabla:
- Lo que **ocupa espacio** (paneles, layout, barras) va crítico o sobreamortiguado. Lo que **señala** (indicadores,
  resaltados, pulgares) lleva ζ 0,7-0,85. Lo que es **secundario** (aplastamiento, gotitas, contenido dentro de una isla)
  puede rebotar mucho (ζ 0,3-0,65) porque no carga con la lectura.
- Los buenos tienen **3-5 muelles con nombre** (press, swap, panel, layout, mouse) y no inventan uno por componente.
- La masa baja (0,3-0,6) junto con una rigidez alta da respuesta inmediata sin la sensación de látigo.

### 1.3 Integrador propio (JS plano)

Euler semi-implícito (primero velocidad, luego posición: estable con muelles rígidos), paso fijo con acumulador para que
el resultado no dependa de los Hz de la pantalla, tope de `dt` para las pestañas que vuelven del fondo, y umbral de reposo
que apaga el bucle.

```js
// muelle.js — un valor que persigue un objetivo; se puede reorientar a mitad sin saltos
export function crearMuelle({ k = 300, c = 26, m = 1, valor = 0, reposo = 0.01, alPintar }) {
  const H = 1 / 120;                    // paso fijo de física
  let x = valor, v = 0, objetivo = valor, acum = 0, ultimo = 0, raf = 0;
  function tic(ahora) {
    acum += Math.min((ahora - ultimo) / 1000, 0.064); // tope: no saltar al volver de otra pestaña
    ultimo = ahora;
    while (acum >= H) {
      v += ((-k * (x - objetivo) - c * v) / m) * H;   // semi-implícito: v primero
      x += v * H;
      acum -= H;
    }
    const quieto = Math.abs(x - objetivo) < reposo && Math.abs(v) < reposo * 10;
    if (quieto) { x = objetivo; v = 0; }
    alPintar(x, v);
    raf = quieto ? 0 : requestAnimationFrame(tic);
  }
  return {
    ir(nuevo, velocidad) {               // reorientar: conserva x y v actuales
      objetivo = nuevo;
      if (velocidad !== undefined) v = velocidad; // p. ej. la del dedo al soltar
      if (!raf) { ultimo = performance.now(); acum = 0; raf = requestAnimationFrame(tic); }
    },
    fijar(n) { cancelAnimationFrame(raf); raf = 0; x = objetivo = n; v = 0; alPintar(x, 0); },
    get valor() { return x; }, get velocidad() { return v; },
    destruir() { cancelAnimationFrame(raf); raf = 0; },
  };
}
```

Notas: el umbral `reposo` va en las unidades del valor (0,01 para escalas, 0,1-0,5 para píxeles). Con `prefers-reduced-motion`
se llama a `fijar()` en vez de `ir()`. Una alternativa equivalente que se vio en la cinta es dividir el `dt` real en
subpasos de ≤ 17 ms en vez de acumulador. Para un valor que «persigue» sin velocidad propia (scrub, seguimiento suave)
basta un filtro exponencial independiente de los fotogramas: `x += (objetivo - x) · (1 - exp(-dt / τ))`, con τ ≈ 110 ms
en el carrusel de arco y `1 - exp(-dt·7)` a `exp(-dt·12)` para opacidades y anchos auxiliares.

---

## 2. Muelles en CSS puro con `linear()`

`linear()` acepta una lista de puntos equiespaciados: si se muestrea la respuesta de un muelle de 0 a 1, se obtiene una
curva de easing que el navegador interpola sin JS y sin hilo principal (va al compositor si animas `transform`/`opacity`).

```js
// Devuelve { easing, duracion } para usar en CSS: transition: transform <duracion>ms <easing>
export function muelleLinear({ k = 300, c = 20, m = 1, puntos = 48 } = {}) {
  const dt = 1 / 240; let x = 0, v = 0, t = 0; const m_ = [];
  while (t < 4) {
    v += ((-k * (x - 1) - c * v) / m) * dt; x += v * dt; t += dt; m_.push(x);
    if (Math.abs(x - 1) < 0.0005 && Math.abs(v) < 0.005) break;
  }
  const paso = Math.max(1, Math.floor(m_.length / puntos));
  const lista = [0];
  for (let i = paso; i < m_.length - 1; i += paso) lista.push(+m_[i].toFixed(4));
  lista.push(1);
  return { easing: `linear(${lista.join(', ')})`, duracion: Math.round(t * 1000) };
}
```

Generarlo una vez (en build o en una herramienta) y pegar la cadena en una variable CSS: `--muelle-panel: linear(...)`.
40-60 puntos bastan; con rebotes fuertes, subir a 80.

**Cuándo vale:** hover, foco, toggles, aperturas de popover y panel declaradas con `transition` (no con `@keyframes`). Una
`transition` CSS sí es interrumpible: si el estado cambia a mitad, arranca desde el valor actual. Ideal con
`@starting-style` y `transition-behavior: allow-discrete` para entradas y salidas de `display: none`/`[popover]` sin JS.

**Cuándo no:** la curva es un muelle **que parte de reposo**. Al interrumpir, CSS reinicia la curva desde el valor actual
con velocidad cero: se pierde la continuidad de velocidad (el gesto «se para y vuelve a arrancar»). Tampoco sirve para
recibir la velocidad de un arrastre, para muelles cuyo objetivo cambia a cada fotograma (seguir el ratón, dock) ni para
física acoplada (dos cuerpos, gotas). Y con rebotes grandes en `scale`, el texto vibra al pasar por el 1. En esos casos,
integrador JS.

---

## 3. Interrupción y continuidad

### 3.1 Reorientar, nunca reiniciar
- Un estado nuevo cambia el **objetivo**; la posición y la velocidad se conservan (eso hace el integrador de arriba y lo que
  hace motion con `animate` sobre un valor en marcha). Nunca `from: 0` en algo que el usuario puede volver a pulsar.
- Al soltar un arrastre se pasa la velocidad del dedo al muelle (`velocity` en motion, `ir(destino, v)` en el propio). Así
  «la tarjeta sale del dedo a la velocidad del dedo».
- Con tweens por tiempo, la duración se escala con lo que falta: un telón de 750 ms que está al 40 % vuelve en
  `750 · 0,4` ms, no en 750. Y mientras transiciona bloquea clics (`pointer-events: auto` en la capa) para que no se
  apilen navegaciones.
- `@keyframes` no se reorientan: solo para cosas que no se interrumpen (un aviso que aparece una vez, un icono que celebra).

### 3.2 FLIP (lo que hace `layout`/`layoutId`)
First (medir), Last (aplicar el cambio y medir), Invert (transform que devuelve al sitio viejo), Play (animar el transform a
`none`). Ventaja: el layout se calcula una vez y se anima solo `transform`.
- Medir con `getBoundingClientRect()` **antes** del cambio y **después**, en el mismo fotograma (sin `await` en medio).
- La escala deforma hijos y esquinas. Motion corrige `border-radius` y aplica escala inversa a los hijos con `layout`. A mano:
  animar el contenedor con `clip-path: inset(... round R)` en vez de `scale`, o separar «fondo que escala» y «contenido
  que solo se traslada y hace fundido».
- Si te interrumpen a mitad, mide desde el rect **actual en pantalla** (que incluye el transform en curso) y vuelve a invertir:
  así no hay salto.
- Variación que da mucho: el plato de la cinta no viaja recto; el fotograma clave intermedio (50 %) lo sube
  `min(120, |dy|·0,3 + 40)` px, lo agranda un 5 % y lo gira ±6° según el sentido. Apertura 680 ms
  `cubic-bezier(.22,.85,.3,1)`, vuelta 540 ms `cubic-bezier(.45,0,.55,1)`. Un arco vende el peso mejor que una recta.

### 3.3 Elemento compartido
- React: el mismo `layoutId` en dos sitios; motion hace FLIP entre ellos. Para indicadores (pestaña activa, resaltado de
  menú), un único elemento con `layoutId` que salta entre ítems con un muelle de ζ ≈ 0,75.
- Sin React: **View Transitions** de mismo documento (`document.startViewTransition` + `view-transition-name` único en los
  dos estados). Va en el compositor, se ajusta con `::view-transition-group(nombre) { animation-timing-function: var(--muelle) }`.
  Comprobar soporte con `modern-web-guidance` y dejar el cambio sin animación como respaldo. No es interrumpible a mitad (una
  nueva transición salta al final de la anterior): para indicadores que el usuario recorre rápido, mejor FLIP con muelle.

### 3.4 Salidas (AnimatePresence) y `popLayout`
- Lo que sale necesita seguir en el DOM hasta acabar: `AnimatePresence` lo retiene. Sin React: marcar `inert` y
  `aria-hidden`, animar, y quitar en `animation.finished` (o con `@starting-style` + `allow-discrete` en CSS).
- `mode="popLayout"`: el que sale pasa a `position: absolute` en el acto, así los hermanos ocupan su hueco **a la vez**
  (con FLIP) en lugar de esperar. Es el modo de las islas, menús con submenús y listas que cambian. `mode="wait"`
  serializa (sale, luego entra) y añade la duración de la salida a la espera: se nota lento.
- `initial={false}` en el primer render: lo que ya está en la página al cargar no se anima.
- Salida más corta que la entrada, siempre (ver 5a).

---

## 4. Técnicas

### 4.1 Aplastar y estirar (squash and stretch)
- Ligado a la velocidad, no a tiempos: `escalaY_objetivo = 1 - 0,2 · min(|v| / 1500 px/s, 1)` y un muelle vivo (280 / 9)
  que persigue ese objetivo. Así aplasta al acelerar y rebota al pararse solo.
- Al chocar con un tope: velocidad × -0,25 (rebote pequeño) y un empujón a la escala proporcional al impacto
  (`min(|v|, 900) · 0,0016`).
- En keyframes de icono (gota que cae): `scale(.88, 1.12)` en el aire, `(1.3, .68)` al tocar, `(.92, 1.08)`, `(1.04, .97)`,
  reposo; origen abajo. Mantener `sx·sy` cerca de 1 (conservar volumen) para que no parezca que se infla.
- Con moderación: aplastamiento en el elemento que se mueve, nunca en el texto.

### 4.2 Segundo cuerpo con retraso (la «gota»)
Dos muelles sobre la misma coordenada: el **delantero** (el que está más cerca del destino) rígido (210 / 25) y el
**trasero** blando (72 / 13), que además arranca con el 8 % de fuerza durante 70 ms. Se dibuja una cápsula entre ambos: al
saltar se estira, al llegar se recoge. Si la separación supera el tamaño de la pieza, se «rompe el cuello»: se sueltan 3
gotitas a 0,3 / 0,5 / 0,72 del tramo, con la velocidad media de los dos cuerpos × 0,45, rigidez aleatoria 70-160 hacia el
destino y un muelle vertical 90 / 7; se encogen 26 px/s al alcanzar la pieza. Al quedar quieto, una onda en el sitio
(amplitud mayor si hubo rotura). Es la versión física del indicador «gooey»: el retraso se nota, no se calcula a ojo.

### 4.3 Gooey con filtro SVG
`feGaussianBlur` (difumina el alfa de formas cercanas hasta que se solapan) + `feColorMatrix` que solo toca la fila del
alfa: `α' = A·α + B`. La última fila de la matriz es `0 0 0 A B`.
- El borde aparece donde `α' = 0`, en `α = -B/A`; el ancho del borde de transición es `1/A`.
- Valores vistos: `18 -7` (umbral 0,39), `20 -10` (0,50), `22 -10` (0,45), `20 -5` (0,25: formas más gordas, se unen antes).
  `stdDeviation` entre 3 y 10: es el alcance del pegado (se tocan a unas 2-3 σ de distancia). Pequeño (3-4) para
  toggles y paginación; 6-10 para docks y botones que se separan.
- Más A = borde más nítido pero más dentado; umbral más bajo = blobs más gruesos que la forma original (compensar
  dibujando las formas algo menores).
- Límites: difumina también el color (las mezclas de dos colores se ensucian), se carga el texto y los iconos (aplicar el
  filtro **solo a una capa de formas monocromas** y poner encima el contenido nítido, o recomponer con
  `feComposite operator="atop"` contra el original), la región del filtro recorta (ampliarla: `x="-100%" width="300%"`,
  y más en vertical si hay rebote), se repinta entero en cada fotograma (CPU; caro en Safari y en áreas grandes) y no
  convive con `backdrop-filter`. Con reduced-motion se quita el filtro y quedan formas limpias.

### 4.4 Metaballs con SDF (sustituto serio del gooey)
En un shader, la distancia a cada forma (`sdCapsule`, `sdRoundBox`) se combina con **smooth-min**
`smin(a, b, k) = mix(b, a, h) - k·h·(1-h)` con `h = clamp(0,5 + 0,5·(b-a)/k, 0, 1)`. `k` en píxeles es el radio del puente
(13 px en la barra de navegación de agua). Borde perfecto a cualquier escala, color sin ensuciar, iluminación posible
(la misma distancia sirve de altura para refracción y brillo). Precio: WebGL, un canvas y un respaldo CSS (la gota
como un `span` con `translateX` + `width` + `scaleY` del mismo estado físico).

### 4.5 Magnetismo
Desplazamiento = dirección al puntero × fuerza × caída(d / radio), suavizado con un muelle.
- Caídas vistas: lineal `1 - d/R` (R 120 px, fuerza 0,45 del vector: la más común y la más mecánica), **smoothstep**
  `1 - smoothstep(0, R, d)` (R = 0,42 del contenedor, fuerza 0,18: sin esquina al entrar en el radio) y gaussiana para docks.
- Truco que da vida: componente tangencial (`curl` 0,3) para que el campo gire un poco en vez de tirar en línea recta.
- Muelle: 180 / 14 / 0,6 para iconos sueltos; 200 / 20 para un botón. Más allá del radio, objetivo 0.
- Medir el **centro de reposo**, no el rect del elemento ya desplazado (si no, se realimenta y tiembla). Usar `clientX`
  con `getBoundingClientRect()` (mezclar `pageX` con rects de viewport rompe en cuanto hay scroll: error visto). No hacer
  `setState` en cada `pointermove`.
- Solo con `(hover: hover) and (pointer: fine)`; en táctil, nada.

### 4.6 Magnificación de dock
Cada icono calcula su influencia a partir de la distancia horizontal al puntero:
- Gaussiana `exp(-d² / 2σ²)`: σ 62 px y escala máx. 1,85 (tipo macOS), σ 78 y 1,5 (más sobrio), σ 140 y 1,65 en demo.
- Smoothstep `s = max(0, 1 - |d|/R)`, `s²(3 - 2s)`: R 155 px y máx. 1,30.
- Lo que separa el bueno del normal: **un solo campo compartido** (los vecinos crecen en cascada), tres muelles por icono
  (escala, elevación de hasta 16-24 px, y deriva lateral `d · 0,13 · influencia` hacia el puntero, que es lo que lo hace
  parecer líquido), atenuación vertical (el campo muere a 220 px de la barra), posiciones base cacheadas con
  `offsetLeft` (que ignora transforms), el foco de teclado mueve el campo igual que el ratón, y la etiqueta salta al
  icono dominante solo si su influencia > 0,55 (o escala > 1,3).
- Para que los iconos crecidos no se pisen, empujar a los vecinos: extra de cada uno `(s - 1) · base`, desplazamiento
  acumulado de los anteriores menos la mitad del total para seguir centrado. Todo con `transform`, nunca `width`.
- Ola en reposo opcional: un puntero virtual que barre `sin(t · 0,55) · 0,34 · ancho` con amplitud 0,42. Se apaga con
  reduced-motion y fuera de pantalla.

### 4.7 Inercia y proyección al soltar
- Velocidad del gesto con media exponencial (`v = v·0,6 + nueva·0,4`, o factor 0,35) sobre `pointermove` con su
  `timeStamp`; nunca con la diferencia del último par solo.
- **Si el dedo se queda quieto antes de soltar, la velocidad se desangra**: `v · exp(-quieto_ms / 70)`. Sin esto, soltar
  tras una pausa lanza la lista.
- Tope de velocidad (±1.400 px/s en la cinta).
- Proyección del destino: `destino = pos + v · T`. Valores vistos: T = 0,18 s con máximo 3 tarjetas; 0,45 con máximo 6. La
  regla de iOS (deceleración 0,998 por ms) da T ≈ 0,5 s; «rápida» (0,99) ≈ 0,1 s.
- Con snap: redondear el destino proyectado al índice y lanzar un muelle con la velocidad de salida (crítico ω ≈ 11, o
  pesado 40 / 20 / 3 que rueda y se posa).
- Sin snap, fricción: `v *= 0,94^(dt/16)` (constante de tiempo ≈ 260 ms; recorrido restante ≈ v · 0,26 s), parar por
  debajo de 0,02 °/ms. Escribirla dependiente de `dt` para no ir el doble de rápido a 120 Hz.
- Umbral para que un gesto cuente como arrastre: 4-6 px **y** eje dominante (|dx| > |dy|): si no, se roba el scroll vertical.
  `setPointerCapture` al confirmar el arrastre, no al pulsar (si no, rompe los clics).

### 4.8 Rubber-band (resistencia en los bordes)
Pasado el límite, el desplazamiento se comprime: `f(x) = (1 - 1/(x·0,55/D + 1)) · D`, con D la dimensión del contenedor.
Al soltar, muelle crítico de vuelta al borde con la velocidad que llevaba. En carruseles infinitos no hace falta: se
envuelve el índice.

### 4.9 Cinta transportadora y órbita
- Velocidad de crucero baja (26 px/s en la cinta, 12 °/s en la órbita, 0,4 ítems/s en el cilindro). Más rápido se vuelve
  anuncio.
- Al parar (hover, foco, ítem activo, panel abierto) la velocidad cae exponencialmente: `v *= exp(-7,2·dt)` (≈ 140 ms), no
  un frenazo.
- Al reanudar, la diferencia con el crucero se reduce por dos regímenes: lejos, `exp(-2,4·dt)` más una deceleración
  constante de 90 px/s² (frena como un motor); cerca, `exp(-3,4·dt)`. Un solo exponencial se nota «elástico».
- Ir a un ítem (teclado, clic): muelle crítico ω 5,6 sobre el desplazamiento.
- El arrastre escribe el desplazamiento directamente y, al soltar, pasa la velocidad (con el desangrado de 4.7).
- Detalle de calidad: si la cinta se mueve bajo un ratón quieto, se recalcula el ítem bajo el puntero cada fotograma; tras
  soltar un arrastre con ratón, el hover se bloquea hasta que el puntero se mueva 4 px.
- Pausa por motivos acumulados (foco, oculto, hover): se reanuda solo cuando no queda ninguno. Pausa con
  `IntersectionObserver` y `visibilitychange`.
- Órbita: 0,6 °/px de arrastre; snap de 250 ms al ítem más cercano.

### 4.10 Arco y curva de carrusel
Las tarjetas cuelgan del borde de una rueda cuyo eje queda fuera de pantalla:
- Para la tarjeta a `d` pasos de la central: `ángulo = -d · paso`, `x = ejeX + R·cos(ángulo)`, `y = ejeY + R·sin(ángulo)`,
  `rotate(ángulo)` (la tarjeta queda tangente). Valores: paso 14°, R = 0,71 de la altura útil, eje a la izquierda fuera de
  la pantalla (`ejeX = 0,284·u - 0,71·u`), `z-index` según la distancia.
- `d` envuelto por el camino corto: `((i - pos) mod n)` llevado a `[-n/2, n/2)`. Repetir la lista hasta ≥ 10 tarjetas para que
  la vuelta ocurra fuera de vista.
- Ligado al scroll: la posición persigue al progreso con `1 - exp(-dt/110 ms)` (un scrub con algo de peso) y, al parar, snap
  al entero con retraso 0,12 s y duración 0,5-1,4 s `power2.inOut`.
- Variantes 3D: `perspective(1400px) translate3d(x, 0, z) rotateY(...)`, ocultar las que pasan de ±1,45 rad; o cilindro con
  proyección `sinθ / (cosθ + k)` para que los ítems no se amontonen en los bordes.

---

## 5. Recetas

### (a) Desplegable con rebote que nace del disparador
- **Estructura:** botón con `aria-expanded`, panel `role="menu"`/`listbox` posicionado; `transform-origin` del lado del
  botón (`top center` si abre abajo, `bottom center` si abre arriba; esquina si es un menú de icono).
- **Entrada:** desde `opacity 0, y ∓6 px, scale 0,97` con muelle 0,34 s / bounce 0,16. Ítems: `opacity 0, y 3 px`, retraso
  `0,04 + i·0,03` s, 0,16 s `cubic-bezier(.22,1,.36,1)`. Escalonado total < 0,3 s.
- **Salida:** 0,13 s `cubic-bezier(.22,1,.36,1)` a `scale 0,98, y ∓4`; ítems sin retraso. La salida no rebota y dura ~40 % de
  la entrada: cerrar es «quitar de en medio».
- **Resaltado:** un solo elemento con `layoutId` (o FLIP) entre ítems, muelle 0,28 s / bounce 0,2. Submenús con
  `popLayout` desplazándose 4 px en x, 0,14 s.
- **Pulsación:** `scale .985-.99`, 0,12 s. **Por qué:** escala 0,97 (no 0,5 ni 0) se percibe como «crecer desde el botón»
  sin que el contenido se lea minúsculo; el origen hace el resto.
- Variante «el botón se convierte en menú»: el mismo contenedor anima de 40×40 a 220×alto real (medido) con
  380 / 34 / 0,8 y radio 12→14; el icono se va en 0,15 s a `scale .8`; el contenido entra a los 0,08 s; ítems
  `0,06 + i·0,02` s desde `x 8`. Al cerrar, todos los retrasos a 0.
- Mediocre visto: entrada y salida iguales (0,2 s easeInOut, `y -10, scale .95`): pesado al cerrar.

### (b) Indicador de navegación que se estira como una gota
- **Estructura:** fila de ítems; un único indicador absoluto detrás (`aria-hidden`); el ítem activo con `aria-current`.
- **Física:** dos muelles para los bordes izquierdo y derecho (o dos cuerpos centrales como en 4.2). El que va hacia el
  destino es el rígido (210 / 25), el de atrás blando (72 / 13) con arranque al 8 % durante 70 ms. Pintar con
  `translateX(izq) scaleX(ancho / anchoBase)` o con `width` solo si es un elemento pequeño fuera del flujo.
- **Extras:** escala Y ligada a la velocidad (4.1); filtro gooey sobre la capa del indicador si quieres puente líquido
  (stdDeviation 4-8, `20 -10`); onda al llegar.
- **Medición:** `offsetLeft/offsetWidth` de cada ítem con `ResizeObserver`; si cambia el tamaño, recolocar sin animar.
- **Por qué:** el estiramiento sale de la diferencia de rigidez, así que la gota se estira más en saltos largos y casi nada
  en contiguos, sin código para cada caso.

### (c) Tarjeta que se expande a panel (FLIP)
- **Estructura:** tarjeta con botón; panel en `<dialog>` o capa con `role="dialog"`, `aria-modal`, foco al botón de cerrar
  al abrir y de vuelta a la tarjeta al cerrar; `overflow: hidden` en `body` mientras está abierto.
- **Movimiento:** FLIP del contenedor (o `layoutId`) con muelle crítico (vd 0,40 / bounce 0) o morph con 0,42 / 0,16;
  el fondo atenúa en 0,3 s; la imagen viaja en arco (3.2) si quieres peso.
- **Contenido:** no escalar texto: fundido. Entra con `cubic-bezier(.16,1,.3,1)` 0,24 s y desenfoque 2-4 px→0 (breve);
  sale en 0,16 s. Duraciones de referencia: 0,12 instantáneo, 0,16 rápido, 0,18 salida, 0,24 estándar, 0,48 deliberado.
- **Por qué:** la caja demuestra la continuidad espacial (de dónde viene) y el contenido no se deforma.

### (d) Isla dinámica que cambia de forma
- **Estructura:** cápsula negra en reposo 126×37 px, radio 32 (o el que corresponda a la mitad de la altura mínima);
  `role="status"` + `aria-live="polite"`; dentro, un medidor (`width: max-content`) observado con `ResizeObserver`.
- **Carcasa:** anima ancho, alto y radio hacia el tamaño medido, muelle 0,8 s / bounce 0,2 (o 0,6 / 0,22). Es de las pocas
  excepciones razonables a «no animes width/height»: un elemento pequeño, fuera del flujo, sin hijos que dependan de su
  tamaño. Para listas largas o pantallas lentas, `clip-path: inset(... round R)` sobre una caja del tamaño máximo.
- **Contenido:** `popLayout`; entra desde `opacity 0, scale 0,9, y -8, blur 5 px` con muelle 0,8 / bounce 0,35 (más vivo
  que la carcasa), o con 0,12 s de retraso y 0,35 s; sale en 0,08 s. Confirmaciones: check con `scale [0, 1.2, 1]`
  en 0,5 s y 0,15 s de retraso.
- **Versión CSS:** `transition` de ancho/alto/radio 0,6 s `cubic-bezier(.16,1,.3,1)` y, para el estado que crece mucho,
  0,8 s `cubic-bezier(.34,1.56,.64,1)` (con sobrepaso). Interrumpible, sin JS, pero sin velocidad heredada.
- **Por qué:** carcasa sobria + contenido con rebote = la forma se siente sólida y la información, viva.

### (e) Menú creativo a pantalla completa
- **Estructura:** botón con `aria-expanded` y `aria-controls`; panel que atrapa el foco (o `<dialog>`), Esc cierra, el
  resto de la página `inert`.
- **Panel:** entra de lado con 0,8 s `cubic-bezier(.76,0,.24,1)` (inOut dramático: aquí sí vale porque es un cambio de
  escena, no una respuesta). Borde curvo: un `path` SVG cuyo punto de control se abomba durante el trayecto y se aplana al
  llegar (1 s al entrar, 0,8 al salir).
- **Enlaces:** escalonado 0,075 s con 0,25 s de retraso inicial, desde `x` o desde abajo con máscara (`overflow: hidden`
  en la línea y el texto desde `translateY(100%)`).
- **Hamburguesa → X:** barras a 0,3 s, giro ±45°, la central desaparece; con curvas distintas para ida
  (`.22,1,.36,1`) y vuelta (`.65,0,.35,1`).
- **Por qué:** al ser una escena, puede durar 0,8 s; los enlaces escalonados dirigen la lectura de arriba abajo. Lo que no
  puede es bloquear: el foco y los clics funcionan desde el primer fotograma.

### (f) Carrusel con inercia y snap
- **Estructura:** región con `aria-roledescription="carrusel"`, botones anterior/siguiente, flechas del teclado, índice
  «3 / 12» vivo; las tarjetas son enlaces o botones reales.
- **Gesto:** umbral 4-6 px con eje dominante, captura de puntero al confirmar, velocidad con media exponencial,
  desangrado `exp(-quieto/70 ms)`, tope de velocidad.
- **Suelta:** destino proyectado `pos + v·0,18-0,45 s`, máximo 3-6 ítems, redondeado al índice, muelle con la velocidad de
  salida (crítico ω 11 para algo ágil; 40 / 20 / 3 para algo pesado y lujoso).
- **Envolver:** posición continua y `d` envuelto por el camino corto; nunca saltos de `scrollLeft`.
- **Alternativa sin JS:** `scroll-snap-type: x mandatory` + `scroll-snap-align: center` sobre un scroller nativo, que ya trae
  inercia del sistema. Para lo que no sea un efecto estrella, es la mejor opción (y el respaldo con reduced-motion).

### (g) Transición de página
- **Cortina o barrido:** capa fija que cubre, cambio de ruta a cubierto, capa que descubre. Valores vistos: barrido de
  600 ms `cubic-bezier(.65,0,.35,1)`, mitad y mitad; 5 columnas a 0,8 s `cubic-bezier(.76,0,.24,1)`; bloques de 5 filas con
  escalonado 0,12 s, cubrir 0,72 s y descubrir 0,68 s `power3.inOut`; telón WebGL de 750 ms easeInOutCubic.
- **Contenido debajo:** la página que sale a `scale 0,98` + blur 4 px en 0,7 s; la que entra desde 1,02 en 0,8 s
  `power2.out`.
- **Reglas:** duración proporcional a lo que queda si se interrumpe; bloquear clics mientras cubre; respaldo de fundido
  si no hay WebGL; con reduced-motion, fundido de 0,2 s. Para mismo documento, View Transitions (3.3) es la base;
  la cortina, una capa encima.
- **Fundido simple:** 0,18 s easeOut. En la mayoría de webs, suficiente.

---

## 6. Lo que separa a los buenos

### 6.1 Lo que hacen los mejores
- **Tokens de movimiento** nombrados (duraciones 0,12 / 0,16 / 0,18 / 0,24 / 0,48; curvas `enter (.16,1,.3,1)`,
  `exit (.7,0,.84,0)`, `standard (.22,1,.36,1)`, `inOut (.65,0,.35,1)`, `drawer (.32,.72,0,1)`; escalonados por carácter 0,016,
  palabra 0,04, línea 0,08, ítem 0,035) y 3-5 muelles con nombre. Con un comentario de para qué es cada uno.
- **Curva por intención:** lo que entra, ease-out; lo que sale, más corto; lo que se mueve ya en pantalla, inOut; muelles
  para lo que el usuario toca o arrastra.
- **Un bucle rAF** por componente que se apaga en reposo y fuera de pantalla, `dt` con tope (1/30 s o 0,25 s con subpasos),
  y solo `transform`/`opacity` escritos directamente al estilo (sin estado de React por fotograma).
- **Medidas que no se realimentan:** `offsetLeft/offsetTop` para posiciones de reposo; `ResizeObserver` para recolocar.
- **Paridad de teclado:** el foco mueve el campo del dock, la cinta se para con el foco, el hover también es `:focus-visible`.
- **Estado estático diseñado** para reduced-motion (no «lo mismo sin animación», sino una versión pensada que conserva la
  señal: un `translateY(-8px) scale(1.14)` en hover del dock con 150 ms).
- **Detalles de tacto:** pulsación mínima de 140 ms visible; hover bloqueado tras arrastrar; velocidad que se desangra.

### 6.2 Errores típicos (vistos)
- `transition: all` (o `transition-all` de Tailwind) en decenas de elementos: anima lo que no querías (colores de tema,
  padding al redimensionar) y fuerza layout. Lista siempre las propiedades.
- Animar `width`/`height`/`top`/`left` en cosas grandes o con hijos: layout en cada fotograma. Usar `transform` (FLIP) o
  `clip-path`. Excepción razonable: una cápsula pequeña fuera del flujo.
- `@keyframes` en algo que se puede volver a pulsar: salta al principio. Transiciones o muelles.
- Rebote en todo (ζ 0,5 en pestañas, menús y paneles): se lee infantil y lento. Rebote solo en lo pequeño que confirma.
- Curvas «back» con anticipación (`cubic-bezier(.68,-.55,.265,1.55)`) en toggles: el primer movimiento va al revés, la
  respuesta parece tardía.
- Escalonados largos (> 0,05 s por ítem o > 0,4 s en total): la última fila llega cuando el usuario ya quería pulsar.
- Entrada y salida con la misma duración y curva.
- Dock por índice (`±18 px` a los dos vecinos) en vez de distancia continua: salta de icono en icono.
- Imán con `pageX` contra rects de viewport y `setState` en cada `mousemove`.
- Muelles en motion por valor sin `restDelta`/umbral: bucles que no se apagan nunca.
- Física por fotograma sin `dt` (`v *= 0,94` a pelo): a 120 Hz frena el doble.
- Arrastres que capturan el puntero al pulsar y se comen los clics, o sin eje dominante que roban el scroll de la página.

### 6.3 Accesibilidad
- `prefers-reduced-motion`: quitar desplazamientos, escalas grandes, rebotes, parallax, autoplay y el filtro gooey; dejar
  fundidos cortos (0,1-0,2 s) y estados finales. En física propia, `fijar()` en vez de `ir()`, o amortiguación crítica.
  Atención al SSR: no leer la preferencia hasta montar para no desajustar la hidratación.
- Pausa de todo lo automático (cinta, órbita, ola del dock) con un control visible y al recibir foco.
- Teclado completo: Tab llega a todo, flechas en menús y carruseles, Esc cierra; foco devuelto al disparador al cerrar;
  foco visible por encima de cualquier efecto (las capas `aria-hidden` encima no deben taparlo).
- Lo decorativo `aria-hidden`; lo que cambia de estado, con `aria-expanded`, `aria-current`, `aria-checked`, `aria-live`.
- Nada de información que solo exista durante la animación.
- Zonas de pulsación ≥ 44 px aunque el icono sea menor; el elemento magnificado no debe cambiar su caja de clic.

### 6.4 Rendimiento
- Solo `transform` y `opacity` en lo que se mueve cada fotograma. `filter: blur()` y `clip-path` animados repintan: breves
  (< 0,3 s) y en superficies pequeñas.
- `will-change` solo durante la animación o en los pocos elementos que se animan siempre; no en listas enteras.
- Un rAF por componente, apagado en reposo, pausado con `IntersectionObserver` y `visibilitychange`.
- Leer medidas antes de escribir estilos (nunca alternar lectura/escritura en un bucle).
- Filtros SVG y `backdrop-filter` encima de algo que se mueve: probar en Safari y en un móvil medio; tener una variante sin
  filtro.
- Canvas: `devicePixelRatio` con tope 2; redimensionar solo cuando cambia.
