# Direcciones de estilo: elegir una y ejecutarla a buen nivel

El marketplace no tiene un estilo: tiene que saber hacer **cualquiera** con oficio. Lo que no puede salir es una web
genérica (la que valdría para cualquier negocio cambiando el logo). Una web sale genérica cuando nadie elige dirección:
se montan secciones correctas con una tipografía neutra, tarjetas, entradas suaves y un efecto suelto.

Este paso es obligatorio y deja rastro escrito (`DESIGN.md` y la sección «Dirección» del `BRIEF.md`).

## 1. Dos ejes: estilo e intensidad
- **Estilo**: el lenguaje visual (tabla de abajo). Sale del negocio, de su público y de lo que tiene para enseñar.
- **Intensidad** (independiente del estilo): cuánto manda la experiencia sobre la lectura.
  - **3 · Inmersiva**: la web es un recorrido. Primera pantalla a sangre, 2-3 escenas ligadas al scroll, transiciones entre
    secciones, un hilo que persiste (objeto, cámara, color, sonido opcional). Es el **valor por defecto** cuando el pedido
    llega como NEW ERA, «inmersiva», «3D», «que impresione» o es una demo para captar a un cliente.
  - **2 · Con escenas**: web de lectura con un momento estrella fuerte y 1-2 de apoyo.
  - **1 · Contenida**: sin escenas fijadas. Solo cuando el pedido lo dice («sobria», «rápida», panel, documentación) o el
    contenido es de consulta. Contenida **no es genérica**: la firma pasa a la tipografía, la retícula, la imagen y el
    detalle (ver §4).
- Si dudas entre dos intensidades, elige la alta: bajar un efecto es una tarde; subir una web plana es rehacerla.

## 2. Las direcciones
Son puntos de partida, no plantillas: se mezclan dos como mucho y se adaptan al negocio. Para cada una, lo que la define,
cómo se ejecuta bien con este marketplace y qué la convierte en genérica.

| Dirección | Encaja con | La definen | Cómo se ejecuta a buen nivel | Se vuelve genérica cuando… |
|---|---|---|---|---|
| **Cinematográfica** | Ocio, música, eventos, hostelería con ambiente, producto con historia, lanzamientos | Imagen o vídeo a sangre, fondo oscuro o de color pleno, titulares enormes (12-20 vw), cámara que viaja, cambios de escena | `scroll-frames` o `video-ia-para-scroll` para el viaje; `capas-alfa` (texto entre capas, humo, luz); `revelados-y-transiciones` entre escenas; cursor y sonido opcionales; `video-desde-html` para bucles | La imagen es de banco o es un degradado; el titular mide lo mismo que en cualquier landing; solo hay un fundido |
| **Producto protagonista** | Bebida, cosmética, relojería, electrónica, alimentación | El objeto ocupa la pantalla y hace algo: gira, se abre, se despieza, cambia de sabor | `envase-giratorio`, `escena-3d-gltf`, frames de un giro, `parallax-capas` con ingredientes, `lente-revelado` para ver dentro, `fotos-producto-ia` | El producto es una foto en una caja con texto al lado |
| **Lugar y recorrido** | Inmobiliaria, hotel, restaurante, turismo, comercio local | El sitio real: de la ciudad a la puerta, del plano a la estancia; fotos grandes del lugar | `mapa-zoom-ubicacion` (del mapa al edificio), zoom a punto, tarjetas con volteo para fichas, vídeo que entra en el local, `seguir-pantalla` | Un mapa incrustado al final y una rejilla de fichas iguales |
| **Editorial** | Despacho, estudio, marca personal, medio, restaurante de autor, moda | Tipografía con carácter (serif o display de contraste) en escala extrema, retícula asimétrica, texto largo bien compuesto, foto de reportaje, numeración y filetes | Titulares por líneas (`crearLineas`), imágenes que entran con máscara, índice fijo que avanza, cambio de fondo por capítulo, citas a pantalla completa | Serif genérica centrada sobre crema y tres tarjetas |
| **Corporativa de precisión** | Software, finanzas, industria, servicios B2B, salud | Retícula estricta, un acento, datos reales, demos del producto hechas por código, detalle fino (bordes de 1 px, brillos sutiles, números tabulares) | Demo que se usa en el hero, diagramas que se dibujan al bajar, bento con piezas vivas (`biblioteca-componentes` adaptadas), microinteracciones con la skill de animación | Capturas inventadas, iconos de banco, «tres ventajas» y degradado morado |
| **Minimal de galería** | Arquitectura, arte, fotografía, joyería, interiorismo | Mucho aire, una imagen por pantalla, tipografía pequeña y exacta, transiciones lentas y limpias | Transiciones de imagen (cortina, rejilla), `rastro-cursor`, zoom 2D con relevo, View Transitions entre páginas, cursor propio | El aire es vacío (faltan fotos buenas) y no hay ni una transición cuidada |
| **Juguetona** | Infantil, heladería, ocio familiar, marcas jóvenes, apps de consumo | Color saturado en bloques, formas e ilustración propias, física y rebote, sorpresa al tocar | Piezas con alfa que flotan (`recursos-imagen-ia` + `parallax-capas`), iconos de marca en lámina, muelles, objetos que se arrastran, marquesinas, pegatinas | Pastel blando con emojis; rebote en todo sin una pieza propia |
| **Artesana y de materia** | Bodega, obrador, taller, cosmética natural, restaurante tradicional | Materiales reales (papel, madera, piedra, tela), luz cálida, tipografía con historia, proceso paso a paso | Texturas medidas para mosaico, sombra como capa, fotos de proceso en secuencia, vídeo corto con alfa (vapor, polvo), lente antes/después | Textura de banco de fondo y fotos de stock |
| **Cruda y tipográfica** | Cultura, festivales, estudios creativos, moda urbana | Tipografía enorme como imagen, retícula visible, contraste duro, movimiento seco | Texto cinético ligado al scroll, marquesinas, texto como máscara de vídeo, cambios de color bruscos por sección | Solo es «negro con una fuente grande» sin composición |
| **Técnica y de datos** | Ingeniería, energía, movilidad, hardware, laboratorio | Planos, despieces, medidas, HUD, cifras reales animadas | Despiece por frames con HUD, `lente-revelado` (rayos X, térmica), 3D con anotaciones, diagramas por código | Iconos de engranajes y cifras inventadas |

## 3. Cómo se elige
1. **Lee al cliente**: sector, público (edad, dispositivo), precio de lo que vende, tono con el que habla y qué tiene de
   verdad para enseñar (un producto, un lugar, un proceso, personas, datos). La dirección sale de ahí, no del gusto de quien
   construye ni de la última web hecha.
2. **Tablero de referencias**: 5-8 webs reales **variadas** del nivel que se busca (no del mismo sector solamente),
   capturadas a 1440×900 y 390×844. De cada una, una línea: qué se toma (escala, ritmo, una técnica). Las referencias fijan
   el **listón**, no el diseño: no se copia ninguna.
3. **Dos o tres direcciones distintas de verdad** para el mismo cliente: cambian a la vez la tipografía, la paleta, la
   composición de la primera pantalla y la técnica estrella. Si dos propuestas comparten tres de esas cuatro cosas, son la
   misma. En encargos de peso se enseñan con capturas de la primera pantalla y del momento estrella (escritorio y móvil)
   antes de construir; en encargos rápidos se escriben, se elige una y se anota por qué se descartan las otras.
4. **Más o menos formal**: la misma dirección admite grados. Un despacho y un club pueden ser los dos inmersivos; cambian
   la velocidad (lenta y continua frente a cortes y golpes), la paleta, el tamaño del gesto y cuánto se interrumpe la
   lectura. Formal no significa plano.
5. **No repetir**: si hay otras webs hechas en el mismo proyecto o cartera, mira sus `DESIGN.md` y cambia al menos
   tipografía, paleta y técnica estrella. Dos clientes del mismo sector no reciben la misma web.

## 4. La firma: lo que toda web lleva, sea cual sea la intensidad
- **Una idea propia que no valdría para otro negocio** (dicha en una frase en el brief). En intensidad 3 y 2 es el momento
  estrella; en intensidad 1 es una pieza: la demo que se usa, la tipografía en escala extrema, una retícula con regla
  propia, una transición de imagen que solo tiene esta web.
- **La primera pantalla decide**: algo ocurre en el primer segundo y en el primer gesto de scroll. Si la primera pantalla es
  «titular, subtítulo, dos botones y una imagen a la derecha», no hay dirección.
- **Imagen propia**: fotos o vídeo del negocio, generados con criterio o hechos por código. Sin imagen propia no hay
  carácter; el presupuesto de activos se presenta siempre (aunque la respuesta sea «con lo que hay»).
- **Tipografía elegida**: una familia display con carácter y otra de texto, con una escala que tenga un salto grande de
  verdad (el titular principal al menos 5-6 veces el cuerpo en escritorio). Las familias por defecto del sistema o las más
  usadas en plantillas no cuentan como elección.
- **Ritmo**: cada sección cambia algo respecto a la anterior (fondo, composición, escala o técnica). Tres secciones
  seguidas con la misma maqueta son una plantilla.
- **Detalle**: estados de hover y foco con intención, cursor o transiciones entre páginas cuando la dirección lo pide,
  carga cuidada (nada aparece de golpe sin querer).

## 5. Prueba del genérico (antes de construir y antes de entregar)
Responde por escrito; con un «no» se vuelve a la dirección:
1. Tapando el logo y los textos, ¿se distingue de las otras webs del sector y de la anterior versión de esta?
2. ¿Hay una idea que solo sirve para este negocio?
3. ¿Las tres primeras pantallas tienen algo que no está en ninguna plantilla?
4. ¿La tipografía y la paleta se eligieron (con su porqué) o salieron por defecto?
5. ¿Cada sección cambia algo respecto a la anterior?
6. ¿Aguanta al lado del tablero de referencias (mismas capturas, lado a lado)?
7. En una mejora de una web existente: ¿se nota el cambio a primera vista en la captura de antes y después?
8. ¿Hay alguna de las distribuciones típicas de IA del §6? Si la hay, ¿la pide el pedido con un motivo escrito?

## 6. Distribuciones típicas de IA (no se usan)
Son las maquetas que salen de un generador cuando nadie decide. Se notan aunque cambien los colores, y hacen que la web
parezca hecha en cinco minutos. Solo se aceptan si el pedido las exige con un motivo, y entonces se apunta en `BRIEF.md`.

| Distribución | Por qué delata | Qué hacer en su lugar |
|---|---|---|
| Hero centrado: titular, subtítulo y dos botones en el centro sobre un degradado o una malla de color | Es la primera pantalla por defecto de cualquier generador | Composición asimétrica con la retícula, titular a escala extrema anclado a un borde, la imagen o el fondo por capas como protagonista |
| Hero partido: texto a la izquierda, imagen a la derecha, mitad y mitad | Plantilla de landing de SaaS | La imagen a sangre y el texto entre capas o encima; o una pieza que cruza las dos columnas |
| Fila de 3 (o 4) tarjetas iguales con icono, título y dos líneas | La sección «features» de plantilla | Pesos distintos (una pieza grande y dos pequeñas), lista editorial numerada, un instrumento interactivo o un recorrido fijado |
| Fila de estadísticas («+500 clientes · 98 % · 24/7») | Relleno sin prueba | Una sola cifra verdadera a escala de titular, con su fuente |
| Zigzag imagen-texto que se repite tres o más veces | Ritmo cero | Cada sección cambia composición, escala o técnica (§4, ritmo) |
| Logos de clientes en gris en una marquesina | Prueba social vacía | Un caso real con imagen o una cita a pantalla completa |
| Testimonios en 3 tarjetas con avatar y estrellas | Plantilla | Reseñas reales en un formato propio (muro 3D, cita grande, vídeo) |
| FAQ en acordeón + CTA final en caja con degradado y botón | Cierre de plantilla | Cierre que retoma la idea y el hilo conductor; preguntas dentro del recorrido donde surgen |
| Píldora de «etiqueta» encima de cada titular, emojis o iconos de línea genéricos | Muletilla visual | Numeración, filetes, tipografía secundaria propia, iconos hechos para la marca |
| Malla o degradado morado-azul, glassmorphism por todas partes, sombras suaves en cada tarjeta | Estética por defecto | La paleta de `DESIGN.md`; profundidad con capas reales, no con sombras genéricas |
