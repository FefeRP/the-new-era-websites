# Adaptar un componente sin romperlo

Un componente bueno de la librería funciona por un puñado de valores que se sostienen entre sí: el radio que va con
el grosor del borde de luz, la curva que va con la distancia que recorre, el blur que va con el tamaño de la pieza. Se
rompe cuando se cambia uno sin los que dependen de él. Esta guía dice qué se puede tocar, con qué se toca a la vez y
cómo se comprueba que el efecto sigue igual.

Regla de partida (la de `biblioteca-componentes`): **se copia tal cual y se cambia solo lo que el proyecto pide**. Pero
copiar tal cual no es entregar tal cual: un componente sin adaptar delata la librería de la que sale. El objetivo es
que nadie que conozca el original lo reconozca a primera vista y que el efecto siga siendo igual de bueno.

## 0. Antes de tocar nada: leer el componente
Haz una ficha de 10 líneas (en un comentario o en `BRIEF.md`) con:
1. **El efecto en una frase** («una gota de cristal que se estira hacia el elemento activo y se separa en gotas»).
2. **Los valores que lo sostienen**: radios, blur, alfas, grosor del borde, curvas y duraciones, constantes de muelle,
   tamaños en px. Búscalos todos: suelen estar repartidos entre clases de Tailwind, estilos en línea, constantes al
   principio del fichero y uniforms de shader.
3. **Las proporciones**: qué valores dependen de otros (el radio interior = radio exterior − relleno; el blur crece con
   el tamaño; la amplitud del rebote con la distancia).
4. **Lo que es contenido** (textos, iconos, imágenes, datos) y **lo que es sistema** (color, tipo, espacio, movimiento).
5. **Las dependencias** reales (motion, gsap, three, ogl) y qué hace cada una.
6. **Captura o grabación del original** antes de cambiar nada: es la vara de medir del final.

## 1. Paleta
- **Pasa los colores a variables** primero (`--superficie`, `--tinta`, `--acento`, `--borde-luz`, `--sombra`) y cambia
  después solo las variables. Los colores sueltos en clases (`bg-white/10`, `text-zinc-400`) se convierten todos.
- **Conserva la relación, no el color.** Lo que hace funcionar un efecto es el contraste entre capas: un tinte de cristal
  al 8 % sobre fondo oscuro se convierte en un 55-70 % sobre fondo claro. Mide el alfa resultante, no copies el número.
- **Oscuro y claro no son inversos.** En oscuro la luz entra por los bordes (borde de luz claro, sombra casi invisible);
  en claro la profundidad la da la sombra (borde sutil, sombra de contacto marcada). Si la marca es oscura y el componente
  claro, reconstruye las sombras, no las inviertas.
- **Acento con moderación**: un componente con 3 acentos se queda en 1 de la marca más neutros. El brillo, los degradados
  y los reflejos se tiñen ligeramente del acento (5-15 %), nunca del todo.
- En shaders, los colores son `vec3` lineales: pasa el hex de la marca a lineal (`pow(c, 2.2)`) o el tono sale lavado.
- Comprueba contraste de texto (4,5:1) sobre el fondo **más claro** que pueda haber detrás de un cristal.

## 2. Tipografía
- Sustituye la fuente por las de `DESIGN.md` y **reajusta el espaciado**: una fuente más ancha necesita más relleno
  lateral en píldoras y botones; una con altura de x grande, menos interlineado.
- Las etiquetas pequeñas de UI (menús, botones) suelen ir a 13-15 px con tracking 0 a +0,01 em; los titulares grandes
  con tracking negativo (−0,02 a −0,04 em). No copies el tracking del original si cambias de fuente.
- Si la animación depende del texto (letras que se separan, palabras que suben), revisa los cortes de línea en móvil y
  los idiomas con palabras largas (alemán, catalán).
- Números en tablas y contadores: `font-variant-numeric: tabular-nums` o bailan al animarse.

## 3. Radios y forma
- **Radios concéntricos**: radio interior = radio exterior − separación. Si cambias el exterior de 24 a 12, cambias todos
  los interiores. Un radio interior mayor que el exterior es lo primero que se ve mal.
- **El borde de luz depende del radio**: un `inset 0 1px 0` en una píldora se lee como reflejo; en una esquina recta de
  2 px, como una línea dibujada. Con radios pequeños, baja el borde de luz al 50 % de opacidad.
- **Brutalismo con esquinas suaves** (un caso frecuente): bloques grandes, bordes de 1,5-2 px visibles, sombras duras
  desplazadas (`6px 6px 0`), pero radios de 14-22 px. Mantén el material (cristal, metal) y cambia la geometría: la forma
  es lo que da la identidad, el material lo que da la calidad.
- `corner-shape: squircle` (o un `clip-path`/SVG con superelipse) da esquinas continuas de estilo Apple; donde no hay
  soporte, el `border-radius` normal es la alternativa.
- Los SDF de un shader llevan el radio en píxeles: si cambias el tamaño del componente, cambia el radio en la misma
  proporción y vuelve a ajustar el suavizado (`smoothstep` de ±1 px de pantalla).

## 4. Tamaños y densidad
- Escala con **una sola variable** (`--u: 4px` o `em`) y deriva de ella rellenos, separaciones e iconos. Si el
  componente usa px sueltos, conviértelos antes de redimensionar.
- **El blur no escala lineal**: un panel el doble de grande necesita ~1,4× de blur (raíz del área), no 2×.
- **Las distancias de animación sí escalan**: si la pieza crece, crece el recorrido; mantén la duración y deja que el
  muelle absorba la diferencia (los muelles se definen por rigidez, no por tiempo).
- Objetivos táctiles de 44 px como mínimo aunque el diseño pida algo más pequeño: el área de toque puede ser mayor que
  lo que se ve (`::before` con `inset: -8px`).
- Prueba a 390, 768, 1280 y 1440 px. Un dock o una barra que en escritorio son una fila, en móvil se convierten en barra
  inferior o en menú: decide la versión móvil, no la encojas.

## 5. Tiempos y curvas
- **Identifica el tipo de movimiento antes de tocarlo**:
  - curva fija (`cubic-bezier`, `ease`): acompaña y avisa (entradas, salidas, hover);
  - muelle (rigidez/amortiguación o `bounce`/`duration`): responde a la mano y se interrumpe;
  - físico propio (integración en un bucle): gotas, ondas, inercia.
- **Cambiar la duración sin cambiar el carácter**: con muelles, cambia la rigidez y la amortiguación a la vez para
  mantener la proporción de amortiguación `ζ = c / (2·√(k·m))`. Más rápido y con el mismo rebote: multiplica `k` por
  `f²` y `c` por `f` (con `f` > 1). Con curvas fijas, conserva la curva y cambia solo la duración.
- **Valores de referencia** (de las mejores piezas estudiadas): hover y pulsado 120-180 ms `ease-out`; paneles y
  desplegables 220-320 ms o muelle con poco rebote (`ζ` 0,7-0,85); cambios de escena 500-900 ms `cubic-bezier(.7,0,.2,1)`;
  rebote juguetón `cubic-bezier(.3,1.6,.5,1)` solo en piezas pequeñas (iconos, insignias).
- **Más marca, no más rebote**: una marca seria (banca, legal) pide `ζ` ≥ 0,9 y recorridos cortos; una juguetona, `ζ`
  0,5-0,7. Es el ajuste que más cambia la personalidad con menos riesgo.
- Lo que se toca se interrumpe: si cambias un muelle por una transición CSS en algo que se arrastra o se pulsa rápido,
  has roto el componente aunque se vea igual en la grabación.
- `prefers-reduced-motion`: cambia movimiento por fundido corto (150-200 ms), nunca quita el estado final.

## 6. Pasar de una pila a otra
### React/TSX → HTML + JS plano
1. **Estado → atributos.** `useState` del tipo «abierto», «activo», «índice» pasa a `data-estado`, `aria-expanded`,
   `aria-current`; el CSS reacciona a los atributos.
2. **Efectos → funciones con limpieza.** Cada `useEffect` se convierte en una función que devuelve su limpieza; el
   componente entero exporta `crearX(raiz, opciones) → { destruir }`.
3. **`useRef` de valores animados → variables locales** dentro del cierre (nunca en el DOM entre fotogramas).
4. **framer-motion/motion** → `motion` sin React (`animate(el, {...}, { type: 'spring', ... })`, misma API de muelle) o
   WAAPI (`el.animate`) para curvas fijas. `AnimatePresence` → animar la salida y quitar el nodo en `finished`.
   `layoutId` → técnica FLIP: medir antes, cambiar, medir después, animar el `transform` de la diferencia.
5. **Tailwind → CSS con variables.** Pasa las clases a una hoja con las variables de la paleta; los `group-hover` a
   selectores `:hover` dentro de `@media (hover: hover)`.
6. **Contexto y props → opciones** con valores por defecto, documentadas al principio del fichero.
7. Comprueba con la grabación del original: mismas curvas y mismos tiempos (cuenta fotogramas).

### HTML + JS → React
Monta en `useEffect` (o `useLayoutEffect` si mide) llamando a `crearX(ref.current, opciones)` y devuelve `destruir`. No
reescribas el motor con estado de React: re-renderizar a 60 fps tira el rendimiento. En Next.js, `"use client"`.

### 2D (CSS/SVG/canvas) → three.js o WebGL
Tiene sentido cuando el efecto necesita luz real (refracción con normales, especular, sombras suaves) o muchas piezas.
1. La forma pasa a un **SDF** en un shader de pantalla completa (barato y nítido a cualquier tamaño) o a una geometría
   con `RoundedBoxGeometry`/`ExtrudeGeometry` si se va a mover en 3D.
2. El cristal pasa a `MeshPhysicalMaterial` (`transmission` 1, `thickness` 0,5-1,5, `roughness` 0,05-0,2, `ior` 1,4-1,5,
   `iridescence` si se busca tornasol) con un entorno (`RoomEnvironment` + `PMREMGenerator`): sin entorno el cristal sale
   negro.
3. El texto y los controles **se quedan en HTML** encima del canvas: accesibles y nítidos.
4. Alternativa sin WebGL siempre: la versión CSS de la que partías.

### three.js → 2D
Cuando el 3D no se toca ni gira libre: renderiza el estado clave a imagen (o secuencia) y móntalo con CSS. Ahorra
cientos de KB y batería.

## 7. Combinar dos componentes en uno
1. **Elige quién manda**: un componente aporta la **estructura** (comportamiento, accesibilidad, estado) y el otro el
   **material o el movimiento**. Nunca dos estructuras.
2. **Un solo sistema**: un bucle de animación (no dos `requestAnimationFrame`), una librería de animación, una paleta y
   un juego de curvas. Si cada uno trae la suya, se queda la del que manda y la otra se traduce.
3. **Une por una frontera clara**: el material entra como capa (`::before`, un canvas detrás, un filtro SVG) y lee el
   estado del que manda por variables CSS o por un evento, no tocando su lógica.
4. **Revisa la suma de costes**: dos `backdrop-filter` superpuestos, dos canvas o dos WebGL en pantalla se notan en
   móvil. Comparte el canvas o rebaja uno.
5. Ejemplo: la estructura de una sidebar que se expande (estado, teclado, foco) + la gota de cristal de una nav (material
   y física del indicador) = sidebar en la que el indicador de sección es una gota que se estira entre elementos.

## 8. Quitarle lo genérico
Señales de «sacado de una librería» y su arreglo:
| Señal | Qué hacer |
|---|---|
| Degradado morado-azul o violeta-rosa | Paleta de la marca; si hace falta degradado, de dos tonos cercanos de la marca |
| Iconos de Lucide por defecto en tamaño 16-20 | Iconos propios del proyecto o un juego con el trazo de la tipografía |
| Textos de ejemplo («Dashboard», «Analytics», avatares de stock, «Acme») | Contenido real del cliente, con su longitud real |
| Radio de 12-16 px en todo | Radio con intención (la marca: recto, muy redondo, o mezcla deliberada) |
| Sombra difusa gris por defecto | Sombra con el color del fondo, o sombra dura si la dirección lo pide |
| Cristal blanco al 10 % sobre degradado | Cristal sobre una imagen de la marca: el cristal solo luce si hay algo detrás que refractar |
| Brillo o borde animado en bucle | Que el brillo responda a algo (puntero, scroll, estado) o quitarlo |
| Todo aparece con fundido + subida de 20 px | Una entrada propia ligada a la idea de la web, o ninguna |
| Tipografía del sistema o Inter | Las fuentes de `DESIGN.md` con su escala |

Y una **firma**: un detalle que solo tiene esta marca (el indicador con la forma del logo, el sonido del clic, el color
del borde de luz, una micro-escena en el icono activo). Uno basta.

## 9. Comprobar que el efecto sigue igual
- Graba original y adaptación con el mismo guion (pasar el ratón, pulsar, abrir, cerrar) y míralas lado a lado.
- Lista de control: misma suavidad (sin tirones), mismo carácter del movimiento (rebote, inercia), material legible en el
  fondo nuevo, contraste del texto, teclado y foco, móvil, reduced-motion, reduced-transparency, rendimiento (sin bajar
  de 60 fps en un portátil normal ni pasar 4 ms por fotograma en el bucle).
- Si el original tiene una cualidad que la adaptación perdió y no sabes por qué, vuelve a la ficha del paso 0: casi
  siempre es un valor dependiente que no se cambió con su pareja.
