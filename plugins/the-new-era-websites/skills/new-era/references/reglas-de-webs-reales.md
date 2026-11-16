# Reglas y recetas sacadas de webs reales

Lo que sigue no viene de leer: son fallos y arreglos de webs construidas y entregadas. Cada regla lleva el porqué; las
cifras son medidas reales de esos proyectos.

## 1. Dirección: lo que se rechaza y lo que pasa
- **«Genérica», «plana», «la veo igual que la anterior» es el otro gran rechazo**, y llega cuando se construye sin elegir
  dirección. En las webs rechazadas por esto se repetía lo mismo: no se cargaron las skills de diseño (se «aplicó lo que
  se recordaba»), no había `DESIGN.md`, el brief no decía ni idea ni momento estrella, se decidió presupuesto 0 sin
  enseñar opciones, se escribió un motor de scroll a medias en vez de usar los del marketplace, y se cerró en una cuarta
  parte del tiempo disponible en cuanto pasaron las comprobaciones técnicas. La versión «mejorada» conservaba maqueta,
  tipografía y paleta: añadir seis componentes sobre la misma base no se ve. Lo que sí pasó el filtro: una idea que
  ordena toda la web, un hilo conductor, tipografía como imagen y paleta que cambia con el relato, aunque no llevara ni
  una imagen de pago.
- **Celebrar los fps no es el objetivo.** Una web a 64 fps con fotos de tamaño moderado y sin escena no ha ganado nada. El
  rendimiento se cumple optimizando la escena, no quitándola.
- **«Parece de IA» es el rechazo más repetido.** Lo provocan: paletas pastel y formas blandas (el 3D parece plastilina),
  carteles muy coloridos con muchos efectos a la vez, un vídeo generado como intro, degradados sin motivo. Lo que pasa el
  filtro: **un acento claro** (no cinco colores compitiendo), materiales reales (madera oscura, piedra, metal, luz cálida), referencias reales delante y
  texto, logo y pantallas compuestos por código.
- **Dos direcciones con capturas antes de construir.** Dos propuestas distintas de verdad, sobre referencias reales, en
  escritorio y móvil (y claro y oscuro si aplica). Se elige una y se afina. Enseñar pronto una muestra ahorra rondas.
- **Para referencias, un tablero de 10-12 webs reales** capturadas a 1440×900 y 390×844, con los avisos de cookies
  ocultos, mejor que descripciones.
- **Contenedores anchos y contenido real.** Una web «estrecha, comprimida y vacía» se arregla con un contenedor que crece
  (alrededor del 95 % a 1440 px, con tope cerca de 1760 px) y con más contenido de verdad (capturas del producto, datos,
  pasos), no con relleno. Un hueco de 300 px entre dos piezas que van juntas es el mismo fallo: agrúpalas y dimensiona con
  `clamp()`.
- **El texto al lado de la escena, no encima.** En móvil, la escena arriba y el texto debajo. Nunca una línea o un
  indicador cruzando un texto.
- **Maquetas rectas.** Un móvil o un navegador en fila y de frente se lee mejor que inclinado en perspectiva.
- **Una demo que se puede usar vale más que un titular.** Un hero con una interacción con historia (elegir, reservar, pasar
  la tarjeta) explica el producto mejor que tres frases.
- **Cada explicación, una pieza hecha por código**: barras, línea de tiempo que se dibuja al bajar, contador, hilo de
  mensajes. Cuestan 0 en generación y no parecen plantilla.
- **Radios y aire coherentes.** Un radio pequeño y único (4-6 px) en toda la web; en las tarjetas de producto, 10-15 % de
  aire alrededor y el mismo encuadre en todas.
- **Color con intención.** Blanco roto antes que crema amarillenta; dos o tres tonos a la vez como mucho; sin degradados
  de adorno. En modo oscuro, grises puros: crema sobre negro da marrones.
- **Títulos con fundido, no con máscara** cuando la tipografía tiene trazos finos: la máscara deja las letras «rotas» a
  media animación.

## 2. No inventar
- **Reseñas solo reales**, con iniciales si no hay foto. Nunca una cara con el nombre de otra persona.
- **Sin cifras que no se puedan enseñar** («99,9 %», «+200 clientes»). Lo que no esté comprobado no se pone y se lista
  aparte como «por confirmar».
- **Nombres de negocio en maquetas y demos: inventados y comprobados** (que no exista uno real con ese nombre en la zona).
- **Web de concepto sobre una marca ajena**: aviso visible de «no oficial» también en móvil, `noindex`, fuentes alojadas
  en local y un script para volver atrás.

## 3. Qué se genera y qué no
- **La IA pone la toma; el código pone lo que se lee.** Logos, pantallas, sellos y textos, siempre por código. Los modelos
  de vídeo deforman texto de unos 70 px de alto.
- **Un splash o un ingrediente quieto es una foto**, no un vídeo: lo mueve el código.
- **En un concepto, primero el código.** Una maqueta de idea se puede resolver sin generación de pago (el líquido que se
  mueve salió de un shader de flujo sobre la foto), pero el presupuesto se presenta igual con sus opciones: «cero» se
  decide viendo lo que se pierde, y una demo para captar a un cliente no es un sitio donde ahorrar la imagen.
- **Una intro en vídeo generado suele acabar descartada**: pesa (16 MB en un caso), su contenido envejece (la captura de
  la web de dentro deja de ser la actual) y se nota. La alternativa por código (canvas 2D sobre la portada real) salió a 0
  y dura menos de 2,5 s.
- **Imagen de inicio igual a la de fin = clip casi quieto**, salvo en bucles de ambiente, donde se busca justo eso. El fotograma final se pide como «otra toma» o se monta a mano.
- **El recorte de un 16:9 para móvil queda peor** que una toma vertical propia, que cuesta poco.
- **El dolly generado acelera al final.** Se remapea la velocidad a pasos iguales (mejor partir de un bruto largo que
  estirar uno corto) y se funde a un velo del color del fondo antes de enseñar la web real.

## 4. Lo pesado: cuándo y cómo se carga
- **Crear la escena 3D al cargar hunde la página** (Lighthouse 62, 15,8 s de bloqueo). Precargar la librería en reposo y
  crear la escena con el primer gesto, con una imagen idéntica delante: 97 y 140 ms.
- **Póster idéntico antes de todo lo pesado** (3D, frames, vídeo con alfa). El canvas no se enseña hasta tener los
  fotogramas; nada de fundidos por CSS sobre el póster (se nota el cambio).
- **Canvas en vez de DOM para secuencias y zooms grandes.** Un `drawImage` opaco por fotograma, en píxeles enteros, sin
  mezclar dos fotogramas. Un zoom ×13 con `<img>` ampliadas parpadea al volver; en canvas con `imageSmoothingQuality:
  'low'` va fluido (con `'medium'`, 117 ms por fotograma).
- **Lo caro se calcula antes.** Desenfoque animado = copias ya desenfocadas (unos 10 KB cada una) cruzadas por opacidad
  (de 20 a 36 fps). Grano = WebP con alfa, no `feTurbulence`. Sombra de hover = pseudo-elemento con opacidad, nunca animar
  `box-shadow`.
- **Modo de gama baja diseñado**, no recortado: se activa con ahorro de datos, reduced-motion, poca memoria o pocos
  núcleos, o si la mediana de 90 fotogramas pasa de 28 ms. Efecto medido: Lighthouse 84 → 96, LCP 3,7 → 2,5 s, peso
  1.283 → 750 KB. Debe poder forzarse por URL para probarlo.
- **Lo estático, en el servidor.** Un hero entero como componente de cliente pinta más tarde que el mismo hero con solo la
  parte interactiva en cliente.
- **El rótulo del logo como SVG**, no como fuente cargada para una palabra (una fuente de 89 KB menos); fotos en AVIF y
  WebP.

## 5. Scroll, sticky y móvil
- **Panel fijado en móvil**: a `100svh` deja una franja cuando se esconde la barra del navegador. El panel va a `100lvh` y
  la composición de dentro en `svh`, compensando con `calc(100lvh - 100svh)`.
- **Sticky**: no se pega dentro de un grid sin `align-self: start`, ni con un antepasado con `overflow: hidden` (usa
  `clip`). Actívalo solo dentro de `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)`.
- **Apaisado bajo** (844×390, 932×430): lo que funciona en vertical se queda en una tira. Prueba siempre 390×844, 360×740,
  844×390 y 932×430.
- **Desplazamiento lateral en móvil**: casi siempre un hijo de grid o un campo sin `min-width: 0`.
- **Reservar altura** para lo que cambia (texto bajo un lienzo 3D, bloques que se rellenan tarde): si no, cambia la escala
  de la escena o salta el diseño (CLS que solo aparece en la medición).
- **Anclas con cabecera fija y scroll suave**: basta `scroll-margin-top`; no dupliques el desplazamiento por JS.
- **Entradas al hacer scroll sin esconder el HTML**: nada con `opacity: 0` en el CSS. IntersectionObserver +
  `el.animate(…, { fill: 'backwards' })`, descartando el primer aviso para no retrasar el LCP.
- **Intros**: menos de 2,5 s, saltables (clic, tecla, rueda), solo en la primera visita de la sesión, con lo de debajo
  `inert` y una red de seguridad que la quita si algo falla. Antes de publicar: recargar a media intro, hacer scroll durante
  la intro, móvil y conexión lenta.

## 6. Trampas de CSS que ya costaron tiempo
- Una cara con `translateZ` en los hijos **no puede llevar `overflow: hidden`**; y una cara 3D **no lleva `box-shadow`**
  (Chrome la recorta): sombra en un `::after`.
- `backdrop-filter` convierte en relativos a él los hijos `fixed`, y se rompe con `view-transition-name`.
- Los `@keyframes` dentro de CSS anidado se descartan sin error: van en la raíz.
- El `padding` en % va contra el **ancho** del padre: los marcos de maqueta, en `cqw` con `container-type: inline-size`.
- `place-items: center` encoge los hijos con ancho en %. `[hidden]` queda pisado por un `display: grid` propio.
- `content-visibility: auto` deja en blanco las capturas de página entera.
- Un elemento solo-para-lectores (`sr-only`) absoluto dentro de una caja con scroll la desborda: `position: relative` en
  el padre.
- Barras de scroll con estilo: reglas `::-webkit-scrollbar` y las estándar solo dentro de
  `@supports not selector(::-webkit-scrollbar)`.
- Vídeo dentro de una maqueta: misma proporción que la grabación, `preload="none"` + póster + IntersectionObserver; solo
  póster con reduced-motion o ahorro de datos.

## 7. 3D que no parece de juguete
- Materiales oscuros y reales, **sombras de contacto** dobles, clones con pequeñas variaciones de giro, reflejos de un
  entorno. Posproceso mínimo: curva en S suave, viñeta ligera, bloom solo en lo muy brillante.
- Un objeto que gira en bucle: que **se pare un instante de frente** (`y = w·t − k·sin(2·w·t)`).
- Envase a partir de una foto: desenrollar la etiqueta, perfil de revolución y un balanceo de menos de ±30° para no enseñar
  la costura. Imagen de respaldo hasta el primer cuadro.
- Logo 3D que tiene que casar con el logo plano de la web: sin mapeo de tonos y con el mismo degradado calculado en el
  material; se comprueba superponiendo.

## 8. Cómo se comprueba
- **Con medidas, no a ojo**: diferencia de píxeles con `getImageData`, PSNR, fotogramas por segundo (mediana y p95), 30
  ciclos de subir y bajar, Lighthouse con varias pasadas y comparando antes y después.
- **El entorno engaña**: un Chrome sin GPU o un servidor pueden informar reduced-motion por defecto (se estaría probando
  la versión estática: fuerza `no-preference`), el WebGL por software es lento, las capturas de más de 8.192 px se repiten
  y las imágenes salen en blanco si no se espera a `img.decode()`. Las animaciones por tiempo se prueban con reloj virtual.
- **Un modelo de visión como revisor, con filtro**: acierta en parte y da avisos falsos (un «más grueso» resultó ser un
  2,8 %). Cada punto se contrasta con la captura.
- **Si un arreglo visible no convence, no se parchea**: se reproduce en bucle, se busca la causa y se reescribe limpio.
- **Confirmar dónde se ve el problema antes de un cambio amplio.** «Se ve mal» puede ser un solo componente.
- **Medir antes de tocar CSS** cuando algo «se ve cortado».
- **Decir siempre si algo está solo en local o publicado**, y publicar con copia y vuelta atrás.

## 9. Logos por código
Un logo se dibuja con geometría (rejilla, trazo en unidades de la rejilla), no escribiendo una palabra con una fuente:
4-5 conceptos, versión micro para 16-32 px, prueba en una tinta, en claro y oscuro y dentro de una cabecera real. Para
redibujar un logo existente, se mide el parecido por superposición en vez de fiarse del ojo.
