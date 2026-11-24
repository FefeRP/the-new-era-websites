# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versiones: [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

## [1.3.1] - 2026-11-24
Arreglos de la revisión de código de los motores nuevos de la 1.3.0. Todas las skills pasan a `1.3.1`.

### Corregido
- `marea.js`: una pulsación nueva anula los temporizadores de la anterior (la cabeza ya no se queda con el muelle de
  la cola), el chapoteo vuelve a arrancar el bucle si el agua estaba parada, el bucle se para de verdad al quedar
  quieto, un grupo sin opciones no rompe, y redimensionar a mitad de viaje no corta el viaje. Las variables de su
  hoja van en `:where()` para que la página pueda cambiarlas.
- `nivel-burbuja.js`: con movimiento reducido la burbuja va pegada al arrastrar, y tras redimensionar ya no se queda
  estirada.
- `marea.js` y `nivel-burbuja.js`: `destruir()` quita todos los listeners (`AbortController`) y deja el elemento como
  estaba (clase, `role`, `tabindex`, `aria-*`, `data-*`).
- `cristal-lente.js`: el retorno sin refracción (otros navegadores) trae también `reconstruir()`, el radio en
  porcentaje (`border-radius: 50%`) se pasa a píxeles, y si el lienzo no da imagen la capa se queda sin refracción
  en vez de lanzar un error.

## [1.3.0] - 2026-11-24
Oficio de interfaz: el plugin aprende a construir componentes de cristal y física de primer nivel desde cero y a
adaptar los de una librería, trae los dos primeros componentes «NEW ERA original» y se reordena para que cada pedido
cargue la skill que le toca. Todas las skills pasan a `1.3.0`.

### Añadido
- `componentes-interactivos/references/cristal-liquido.md`: anatomía del cristal por capas (lente, tinte, luz de cara,
  canto asimétrico, especular, bisel, grano, sombra de contacto y sombra con el color del fondo), refracción real con
  un mapa de desplazamiento por SDF en `backdrop-filter: url(#id)` (solo Chromium) y sus respaldos, errores típicos
  y una receta mínima.
- `componentes-interactivos/references/fisica-y-fluidez.md`: muelles (k, c, ζ), muelle convertido a `linear()` de
  CSS, interrupción y velocidad, la gota de dos cuerpos (cabeza y cola con distinto muelle), aplastamiento con la
  velocidad, desplegable con rebote (entrada con muelle, salida corta, ítems escalonados) y recetas.
- `componentes-interactivos/references/adaptar-componentes.md`: receta para modificar cualquier componente
  (paleta, tipo, radios, tamaños, tiempos y curvas, de React a HTML o three.js, combinar dos, quitar lo genérico).
- Motores nuevos: `muelle.js` (muelle con paso fijo, `muelleLinear()` para CSS y muelles con nombre) y
  `cristal-lente.js` (lente de refracción con mapa SDF, `refraccionDisponible()`, respeta la transparencia reducida).
- Dos componentes **NEW ERA original**, con ficha en `references/originales.md`: `nivel-burbuja.js` (indicador de
  scroll como un nivel de obra: la burbuja se estira si vas deprisa, se arrastra y responde al teclado) y `marea.js`
  (control segmentado líquido: la superficie se inclina con la aceleración y chapotea al llegar).
- Prueba `pruebas/componentes-propios`: dos páginas hechas desde cero con las guías (barra de cristal con gota,
  desplegable con rebote y fondo por capas; los dos originales). 32 comprobaciones en Chrome.
- Regla 8 ampliada (`direcciones-de-estilo.md` §6): tabla de piezas de interfaz que delatan una librería copiada
  sin adaptar (nav en píldora de cristal blanco, cristal sobre fondo liso, dock que se magnifica, sidebar de admin,
  todo rebotando igual, brillo en bucle, bento con gráficos falsos) y qué hacer en su lugar.
- `biblioteca-componentes`: cómo tratar un catálogo de pago con condiciones de uso propio (solo en local, sin
  redistribuir).

### Cambiado
- Descripciones de todas las skills reescritas: cortas (de 190 a 575 caracteres, antes hasta 2061), con el pedido
  típico al principio y un «NO para» que manda a la skill correcta.
- Un único mapa de enrutado en `new-era` (antes repartido en cinco sitios) y la tabla de capas en los README.
- Referencias duplicadas fusionadas: 11 temas con un solo fichero de referencia cada uno.
- `/web-premium` queda como alias obsoleto de `/new-era` (se quitará en la 2.0).

### Corregido
- Prompt negativo: ya no se dice que un modelo lo admite si no lo admite (`video-ia-para-scroll` paso 6 y
  `prompts-foto.md`).

## [1.2.1] - 2026-11-24
### Corregido
- `learn-taste` sale de la fase Revisión de la tabla de carga: su autor la marcó con `disable-model-invocation` y la
  herramienta `Skill` la rechaza (comprobado en una sesión de prueba). La maestra explica qué hacer con esas skills: la
  corrección pasa igual a regla de `DESIGN.md` y en la entrega se recuerda `/learn-taste`. Todas las skills pasan a `1.2.1`.

## [1.2.0] - 2026-11-24
Fondos generados por capas como recurso fijo de la base, regla contra las distribuciones típicas de IA y más skills de
diseño en la carga obligatoria. Todas las skills pasan a `1.2.0`.

### Añadido
- **Fondos generados por capas** (`new-era/references/fondos-por-capas.md`): un fondo hecho de planos separados con
  una versión por escena. Dos formas: un shader detrás con nubes o niebla en el suelo del hero que cambian con el
  producto o el modelo, o un paisaje fotográfico (cielo, fondo lejano, suelo) cuyas capas se mueven y se relevan entre sí,
  con varias animaciones hechas solo con fotos (parallax, relevo escalonado, deriva, el suelo como cortina, dolly y
  texto entre capas). Está en la tabla de técnicas de la base, en el catálogo (sección C) y en `parallax-capas`.
- Motor `parallax-capas/scripts/fondo-capas.js` (`crearFondoCapas`): relevo capa a capa con retraso y sentido por capa,
  interrumpible, llevado por botones o por el scroll (`pasos`), con reduced-motion y `destruir()`. Se combina con
  `crearParallax` sobre la misma raíz. En `nueva-web.mjs`: `--con fondo`.
- Prueba `pruebas/fondo-capas` (capas SVG generadas con `hacer-capas.mjs`): 16 comprobaciones en Chrome (estado
  inicial, escalonado medido con las animaciones pausadas, final limpio, sin animaciones acumuladas, capa fija intacta,
  interrupción a medias, reduced-motion y pasos por scroll).
- **Regla 8 de `new-era`: nada de distribuciones típicas de IA** (hero centrado, hero mitad y mitad, fila de 3
  tarjetas iguales, estadísticas en fila, zigzag repetido, FAQ en acordeón + CTA en caja con degradado, píldoras sobre
  cada titular, malla morado-azul). Tabla con qué hacer en su lugar en `direcciones-de-estilo.md` (§6) y pregunta 8 en
  la prueba del genérico.

### Cambiado
- Carga obligatoria de skills (tabla de la base y reparto): `taste-skill:design-taste-frontend` en Dirección y su
  puerta en Revisión; `learn-taste` en Revisión (cada corrección pasa a regla de `DESIGN.md`); `choreograph` y `gestures`
  en Movimiento; fase nueva **Activos** con `pedir-assets-ia` y `creative-architect:direccion-de-arte`; y
  `founder-skill:founder-brand` cuando la marca no tiene nombre o voz. Las variantes de `taste-skill-classics` solo si
  el pedido nombra ese estilo.

## [1.1.0] - 2026-11-24
La biblioteca de componentes pasa a ser la librería común de recursos de todas las skills, con una regla de uso nueva
y acceso por API con un token personal. Todas las skills pasan a `1.1.0`.

### Cambiado
- **Regla de uso de la librería** (`biblioteca-componentes`, `new-era`, `modulos/biblioteca.md`, reparto y README):
  los recursos (componentes, fondos y elementos de decoración, shaders y similares) **se copian tal cual** y se
  modifican solo si hace falta, porque rehechos rara vez quedan igual de bien. Lo que genera cada usuario para su
  proyecto son los **iconos** y lo propio de su marca. Desaparecen la «tabla de cambios obligatoria» y la prueba de
  «que no se reconozca el original». Si la pila es otra, el recurso se pasa conservando el efecto exacto.
- `biblioteca-componentes` explica quién la usa: `new-era`, motion graphics y vídeo desde HTML, y cualquier skill que
  necesite una pieza visual.

### Añadido
- `buscar.mjs` lee la **API del catálogo con un token personal** (`BIBLIOTECA_COMPONENTES=https://…/api` +
  `BIBLIOTECA_TOKEN` o `BIBLIOTECA_TOKEN_FILE`). El índice se lee entero; cada componente se pide al usarlo, con
  límite diario. Los de licencia «no redistribuir» llegan sin código, con su enlace. Usuario y contraseña siguen
  admitidos.

## [1.0.1] - 2026-11-23
Ocho referencias nuevas (ref17-ref24) convertidas en recetas de la base de NEW ERA. No hay scripts nuevos y todas las skills pasan a `1.0.1`.

### Añadido
- `new-era/references/recetas-producto-y-servicio.md`, con seis recetas con código probado en Chrome:
  - pasarela con foco;
  - puntos sobre el producto enlazados con la lista;
  - producto en escenario;
  - «límpialo tú», pintando sobre un canvas;
  - instrumento que explica;
  - presupuesto al instante con barra fija.
- Catálogo de técnicas, sección **J. Enseñar el producto y vender el servicio**. También estas filas nuevas:
  - trabajo por zonas con anillo de avance (B);
  - maqueta ilustrada de un concepto (D);
  - titular volumétrico (F);
  - anillo de fotos que pasa a cuadrícula (G).
- Combinaciones nuevas: «Moda y tiendas por looks» y «Servicios a domicilio y oficios», tanto en el catálogo como en `modulos/README.md`. Además, dos filas en la tabla de técnicas de la base de `new-era/SKILL.md`.
- Análisis de las referencias en `docs/referencias/` y sus filas en el índice.
- Regla medida por píxeles para las fotos de estudio sin recortar: `mix-blend-mode: multiply` solo hace desaparecer el fondo de la foto si es **blanco puro**. Con hueso sobre hueso, el fondo se oscurece y se ven los rectángulos.

## [1.0.0] - 2026-11-22
Primera versión estable. Es la 1.0.0-beta.13 sin cambios de contenido: NEW ERA con una base común y seis módulos
opcionales, y las 18 skills. Todas las skills pasan a `1.0.0`.

### Pendiente para la 1.1
- Construir una web real entera, de principio a fin, con NEW ERA y revisar lo que entrega.
- Validar con clips reales las plantillas de vídeo que aún van «por reglas», incluida la 14.
- Medir el montaje de vídeo y frames en un móvil real (iPhone y Android).
- Quitar las repeticiones entre la maestra, los módulos y las skills.
- Recuperar los componentes del catálogo que no tienen vista previa.

## [1.0.0-beta.13] - 2026-11-22
Todas las skills pasan a `1.0.0-beta.13`. NEW ERA se reorganiza en una **base común** para cualquier web con carácter
(corporativa, editorial, inmobiliaria, tienda, restaurante, producto, inmersiva) y **seis módulos opcionales** que la
maestra activa solo si el proyecto los pide. El 3D pasa a ser un módulo más. No se quita nada: se reordena y se conecta.

### Añadido
- `new-era/references/modulos/`: índice (qué es la base, cómo se decide cada módulo, combinaciones por tipo de web y
  por qué cada skill está en su módulo) y un fichero por módulo con sus señales («se activa cuando», «no hace falta
  cuando»), skills que se cargan, técnicas, activos y coste, construir y verificar: **3D y WebGL**, **vídeo con IA**
  (todo Higgsfield y el método de Seedance 2.5), **scroll inmersivo y frames**, **assets de IA** (foto, alfa, capas,
  lente, envase), **biblioteca de componentes** y **lugar y mapa**.
- `video-ia-para-scroll`: plantilla 14, «la obra al revés» (Seedance 2.5 References con la imagen final de la web, el
  proceso pedido hacia atrás, invertido y atado al scroll), también en el árbol de decisión.
- `nueva-web.mjs --modulos 3d,video-ia,scroll,assets,biblioteca,mapa`: copia los motores típicos de cada módulo activo.
- Cada skill del marketplace dice bajo su título a qué módulo pertenece o si es de la base.

### Cambiado
- `new-era`: regla 7 (los módulos se deciden por el proyecto y quedan escritos); paso 1 con las señales para los
  módulos; **paso 4 «Módulos y técnicas»**: decidir cada módulo con su motivo en `BRIEF.md` antes de cargar nada,
  contraste con la intensidad (en la 3, un módulo de escena da el momento estrella) y tabla de técnicas de la base; las
  técnicas de cada módulo pasan a su fichero; pasos 5, 6 y 7 con lo propio de cada módulo activo; la entrega lista los
  módulos activados y no activados. Descripción con más tipos de web y frases de activación.
- Plantilla de `BRIEF.md` con la sección «Módulos» y «Skills cargadas → Módulos»; el catálogo de técnicas marca cada
  sección como base o módulo; `reparto-skills-diseno.md` y los comandos `/new-era` y `/web-premium` incluyen el paso.
- README en español e inglés con la base común y la tabla de módulos.

## [1.0.0-beta.12] - 2026-11-21
Todas las skills pasan a `1.0.0-beta.12`. Segunda pasada sobre Higgsfield para webs: guía por modelo, plantillas por
tipo de plano, árbol de decisión, checklists, flujos y una receta de montaje medida en Chrome.

### Añadido
- `video-ia-para-scroll/references/modelos/`: una ficha por modelo (Seedance 2.5 y 2.0, Kling 3.0/O3, Kling 4.0, Veo
  3.1, Wan, otros e imagen clave) con parámetros reales de la API y la web, precio medido, fallos conocidos y prompt de
  partida; índice con tabla rápida y lo que no está en Higgsfield.
- `arbol-decision.md` (¿hace falta vídeo?, tipo de plano → modelo y precio, resolución, presupuestos por tipo de web),
  `checklists.md` (antes de generar y al recibir), `flujos.md` (imagen clave, encadenar sin fotograma repetido,
  extender, bucles, upscale, deflicker, cinco caminos para que la marca no se deforme) y `montaje-web.md`.
- `montaje-web.md`: el clip del generador llega con un solo fotograma clave (búsqueda de ~220 ms en Chrome);
  medidas propias de GOP 1/4/8/12, B-frames, VP9, AV1 y frames WebP/AVIF/JPEG en escritorio y móvil; recetas de ffmpeg;
  carga, póster, bucle de scroll, móvil y movimiento reducido.
- `scripts/estimar-higgsfield.mjs`: precios gratis con `POST /estimate` de la API (tabla de rutas útiles o un pedido).
- `pruebas/montaje-web/`: prepara las variantes de un clip y mide la búsqueda en Chrome (`seeked` + pintar en canvas).

### Cambiado
- `plantillas-prompt.md`: biblioteca de 13 plantillas por tipo de plano, cada una con su estado (publicada, medida o
  por reglas). `modelos-y-camaras.md`: control de cámara, lente y FOV, dolly frente a zoom, presets que sirven.
- `higgsfield-para-webs.md`: mapa de lectura, tabla de 7 modelos con precios medidos, nuevas lecciones y montaje que
  remite a `montaje-web.md` (GOP 8 sin B-frames en vez de todo intra).
- `scroll-frames`: `extraer-frames.mjs --video-scrub` codifica sin B-frames (`-bf 0`, +6 ms por búsqueda medidos con
  ellos); `rendimiento.md` con las medidas y AVIF solo si el peso aprieta.
- `pedir-assets-ia`: `precios.json` y `proveedores.md` al día (Kling 4/Flash/Turbo, Seedance 2.0 Mini, Wan 3.0,
  MiniMax, Grok, LTX, herramientas); `presupuesto.mjs` admite modelos con precio solo en créditos.
- `new-era`: la fila y el bloque de vídeo con Higgsfield remiten al árbol, las fichas, las checklists y el montaje.

## [1.0.0-beta.11] - 2026-11-21
Todas las skills pasan a `1.0.0-beta.11`. NEW ERA sabe usar Higgsfield (Seedance, Kling, Veo) para webs: el vídeo se
planifica entero antes de generar y se mide antes de montarlo.

### Añadido
- `video-ia-para-scroll/references/higgsfield-para-webs.md`: qué modelo y qué medio para cada pieza (intro por scroll,
  fondo en bucle, transición, marco, objeto de cristal o 3D, logo y texto); checklist antes de generar (coreografía,
  una toma, máximo dos fases, encuadre abierto desde la imagen clave, estimación con tope, prueba a 480p); plantilla de
  prompt con lente, avance de cámara y llegada al último fotograma; cuándo usar primer y último fotograma y cuándo no
  (fin alcanzable, dos pasadas con un «portador», encadenar); resolución, duración y letras; arreglos por código sin
  regenerar; montaje (frames o vídeo all-intra); precios medidos en noviembre de 2026; lecciones de intros reales y
  32 fuentes enlazadas.
- `revisar-video.mjs` mide más cosas: cortes de escena con `scdet`, **saltos de contenido** sin corte, **tirones** (la
  cámara se lanza y emborrona para llegar al fin, con el cambio de luz), **avance real de la cámara** en acercamientos
  (escala cada medio segundo y total, con traslación compensada), tramos donde la cámara se para, recorrido corto y
  clips casi quietos. El informe da el segundo de cada viñeta de la hoja; `--centro` y `--detalle`.
- `pruebas/revisar-video/`: 7 vídeos sintéticos de verdad conocida (acercamiento constante, frenazo, recorrido corto,
  salto, corte seco, salto disimulado, paneo). Comprobado además con clips reales de Kling O3 y Seedance 2.5 con fallos
  conocidos.

### Cambiado
- `video-ia-para-scroll`: reglas 10-12 (último fotograma alcanzable, encuadre abierto, medir antes de montar), elección
  de modelo por pieza y checklist de aceptación con saltos, tirones y avance.
- `new-era`: fila de intro/fondo/transición en vídeo con Higgsfield en la tabla de técnicas, checklist de vídeo en el
  plan de activos y comprobación de `revisar-video.mjs` en la verificación.
- Precios de vídeo de Higgsfield de noviembre (bajaron): Seedance 2.5 0,118 / 0,265 / 0,652 $/s, Kling O3 pro 0,068 /
  0,086 $/s, Kling 3.0 std 0,071 y pro 0,096 $/s, en `precios.json`, `proveedores.md` y `modelos-y-camaras.md`.

## [1.0.0-beta.10] - 2026-11-18
Todas las skills pasan a `1.0.0-beta.10`. NEW ERA también programa (Vite, React, Next.js, Tailwind, GSAP, three.js), y
ese código ya no se escribe de memoria.

### Añadido
- **Regla 6 de `new-era`**: antes de usar o cambiar la API de una librería se consulta su documentación actual con
  `find-docs` (Context7) en la versión exacta del `package.json`; antes de cada decisión de plataforma (Core Web Vitals,
  imágenes, fuentes, accesibilidad, View Transitions, CSS moderno, formularios, PWA) se sigue `modern-web-guidance`
  (la skill oficial de Chrome). Fase **Código** en la tabla de skills que se cargan.
- Pasos concretos: versiones y App Router o Pages Router en el brief (paso 1), consulta antes de cada API y guía antes de
  cada decisión de plataforma al construir (paso 6), comprobación «Código al día» en la verificación (paso 7) y lista de
  documentación consultada en la entrega (paso 8). Sección «Documentación consultada» en la plantilla de `BRIEF.md`.
- `new-era/references/codigo-y-plataforma.md`: cuándo entra cada una, cómo se usan, qué se apunta, cómo se comprueba,
  la decisión motor contra nativo y cómo instalarlas.
- Bloque «Antes de programar» en las 13 skills que escriben código, con sus librerías y sus temas de plataforma.
- Reparto, checklist final de `base-tecnica.md` y README con las dos skills.

## [1.0.0-beta.9] - 2026-11-17
Todas las skills pasan a `1.0.0-beta.9`. Versión de corrección: las webs hechas con las betas 6 a 8 salían correctas
pero genéricas.

### Qué fallaba
- Desde la beta.6 la skill maestra frenaba: «no toda web necesita un momento estrella», «uno, o ninguno», «solo
  componentes y entradas discretas si la web es sobria», y los mínimos de tipografía, color y anti-plantilla valían
  «solo si no hay skill de diseño instalada». Con esas salidas, lo más barato era siempre una web plana.
- Las skills de diseño se «tenían en cuenta» de memoria en vez de cargarse, no se escribía ninguna dirección
  (`DESIGN.md`) y el trabajo se cerraba en cuanto pasaban las comprobaciones técnicas.

### Cambiado
- **`new-era`, reescrita.** Cinco reglas que no se saltan: se elige dirección antes de construir; las skills se cargan
  con la herramienta `Skill` y se apuntan; toda web lleva idea propia y firma; no se entrega sin revisión
  independiente; no se cierra pronto si quedan mejoras claras y tiempo.
  - **Paso nuevo de dirección de estilo**, obligatorio: estilo e intensidad (3 inmersiva, 2 con carácter, 1 contenida),
    leídos del cliente, con un tablero de referencias variadas y dos o tres opciones bien distintas. Sin `DESIGN.md`
    no se construye.
  - Tabla de **qué skills se cargan en cada fase** (dirección, componentes, movimiento, revisión) y qué agentes
    revisan al final.
  - Idea, hilo conductor, firma, algo que tocar y recorrido antes de elegir técnicas; mínimos de técnica por intensidad.
  - Verificación en dos partes: que funciona y **que tiene nivel** (prueba del genérico, crítica, revisor
    independiente), por rondas.
  - Apartado para mejorar una web que ya existe: si no cambia la primera pantalla y al menos dos de estructura,
    tipografía, paleta o técnica, no es una mejora.
  - El informe final lista las skills cargadas de verdad, las rondas y el tiempo usado.
- `references/direccion.md`, reescrita: idea e hilo conductor, interfaz que cuenta la idea, paleta que acompaña el
  relato, tensión y descarga, voz propia. Los mínimos de tipografía y color ya no dependen de que falte una skill de
  diseño: la skill de diseño puede subirlos, nunca bajarlos. Plantilla nueva de `BRIEF.md`.
- `references/reparto-skills-diseno.md`: cargar las skills es obligatorio; manda la intensidad elegida; la dirección
  de estilo, la idea y la prueba del genérico no se delegan.
- `references/reglas-de-webs-reales.md`: el rechazo «genérica, plana, igual que la anterior» y sus causas.
- `biblioteca-componentes`: cuántas piezas vistosas caben lo marca la intensidad, no una cifra fija.

### Añadido
- **`references/direcciones-de-estilo.md`**: diez direcciones (cinematográfica, producto protagonista, lugar y
  recorrido, editorial, corporativa de precisión, minimal de galería, juguetona, artesana y de materia, cruda y
  tipográfica, técnica y de datos), cada una con a quién le encaja, qué la define, cómo se ejecuta a buen nivel y cuándo
  se vuelve genérica; cómo elegir; la firma; y la prueba del genérico, de siete preguntas.
- `biblioteca-componentes/scripts/buscar.mjs`: la búsqueda puntúa en vez de exigir todas las palabras, con más
  sinónimos y mirando la descripción; `--sin a,b` deja fuera lo que dependa de una librería; `BIBLIOTECA_AUTH_FILE`
  lee el acceso de un fichero para que la clave no pase por la línea de órdenes; `ver` avisa si el componente anima
  `clip-path` o `filter`.

## [1.0.0-beta.8] - 2026-11-16
Todas las skills pasan a `1.0.0-beta.8`.

### Añadido
- **Skill `biblioteca-componentes`** (la número 18): buscar, elegir y adaptar componentes de interfaz de un catálogo
  propio, con un índice JSON que guarda por cada componente el código, las dependencias, la demo, la licencia, el autor
  y un prompt de integración. `scripts/buscar.mjs`, sin dependencias, busca en español o en inglés (con sinónimos), filtra
  por categoría, fuente y vista previa, y saca el código, la demo, el CSS y el prompt. Lee el catálogo de una carpeta o de
  una URL privada (`BIBLIOTECA_COMPONENTES`, `BIBLIOTECA_AUTH`).
  - Reglas de licencia: MIT, «no redistribuir» o Commons Clause, y de pago.
  - Una tabla de cambios obligatoria para que ningún componente salga tal cual.
  - Recetas de Spline: escena con póster, objeto que mira al ratón, scroll, eventos, variables, carga diferida y versión
    sin React.
  - Qué hacer con los catálogos de pago o con clave.

  El catálogo no viaja con el plugin.
- `new-era` y el reparto con las skills de diseño enlazan la skill nueva: antes de escribir una pieza de interfaz desde
  cero, se busca en el catálogo y se adapta.

## [1.0.0-beta.7] - 2026-11-16
Primera versión publicada con el nombre nuevo: incluye también la 1.0.0-beta.4, la beta.5 y la beta.6, que solo
estaban en local. Todas las skills pasan a `1.0.0-beta.7`.

### Añadido
- **Skill `video-desde-html`** (la número 17): vídeo a partir de HTML, CSS y JS con HyperFrames (Apache-2.0), sin
  modelos de IA de vídeo. De la web al vídeo (hero, tramo de scroll, producto girando → MP4 9:16 o 16:9) y del código
  a la web (bucle sin corte, capa con alfa en WebM VP9 o PNG, secuencia para scroll). Lanzador `hf.mjs` (versión
  fijada 0.9.34, sin telemetría, sin skills globales, sin descargas, Chrome del sistema), `medir-bucle.mjs` (costura y
  fotogramas repetidos), tres plantillas (`bucle`, `capa-alfa`, `scroll-a-video`), contrato y límites, seis recetas y
  tiempos de render medidos sin GPU. Reparto con `scroll-frames`, `capas-alfa`, Remotion y las skills oficiales de
  HyperFrames en la tabla de quién hace qué. Prueba: `pruebas/hyperframes`.
- **`frame-scrubber.js`: `fijar(p)`**. Coloca la secuencia en un progreso 0..1, espera a que ese frame esté
  decodificado y lo pinta en el momento; devuelve el índice dibujado. Para capturas y renders fotograma a fotograma.

### Corregido
- **`extraer-frames.mjs`: tirones en el scroll por frames desiguales.** Con `--frames`/`--fps` que no dividían al fps del
  vídeo, el filtro `fps` de ffmpeg tomaba fotogramas a intervalos 1-1-1-2 y, al bajar a la mitad, duplicaba
  fotogramas (60 pedidos → 119 servidos). Ahora toma 1 de cada k fotogramas (k entero, `--paso K` a mano), avisa si el
  total se aleja de lo pedido y guarda `paso` en el manifest. Prueba nueva con verdad conocida: `pruebas/scroll-frames`.
- **`video-scrubber.js` (modo vídeo):** buscaba en segundos y decidía comparando con `currentTime`, en contra de la
  regla de la propia skill. Se quedaba un fotograma por detrás y no llegaba al último. Ahora busca por índice de
  fotograma, al centro de cada uno (`(i + 0.5) / fps`), con una sola búsqueda en curso. Nueva opción `fps`
  (`manifest.videoScrub.fps`, que escribe `extraer-frames.mjs --video-scrub`) y `fotogramas` en la API. Prueba en
  Chrome: `pruebas/scroll-frames/probar-video.mjs`.
- **`alfa.mjs`:** la misma cadencia por paso entero con `--fps`. Un vídeo de 60 fps sin `--fps` sacaba todos los
  fotogramas etiquetados a 30 fps (iba a media velocidad); ahora saca 1 de cada 2. Las métricas de la prueba de alfa no
  cambian.
- **`tarjeta-volteo.js`: accesibilidad.** La tarjeta llevaba `role="button"`, y eso volvía presentacional todo lo de
  dentro: los enlaces del dorso no se anunciaban como enlaces y el nombre del botón era todo el texto. Ahora el control
  es un `<button data-volteo-boton aria-pressed>` aparte, fuera de las caras, oculto y visible con el foco del teclado
  (o el tuyo, con `boton` o `[data-volteo-boton]`). Escape vuelve al frente y deja el foco en el botón. API: `boton`.
  Prueba `pruebas/componentes/probar.mjs`: 48 comprobaciones (antes 42).

### Cambiado
- Skills: rutas «del repositorio» iguales en todas las guías y nombres de modelo alineados con `proveedores.md`
  (Luma Ray 3.2, Nano Banana 2.1 / Pro, GPT Image 2 / 2.5 / 2.6, Seedream 5, Flux 3, Qwen Image 3; fila de Seedance 2.0
  en `modelos-y-camaras.md`; coste de ejemplo de `mapa-por-imagenes.md` recalculado). `fotos-producto-ia`: también
  en el cuerpo y en `modelos-y-precios.md`, con la opción de producto con fondo transparente en un paso.
- `pedir-assets-ia/references/proveedores.md`: catálogo del MCP de Higgsfield (Nano Banana 2/Pro, Seedream 5 Pro con
  `remove_bg`, GPT Image 2.6 con fondo transparente y SVG, Seedance 2.0/2.5 con sus parámetros, `get_cost`).
- Banco de clips (`pruebas/clips-ia`): `porVariante` en la batería, para que cada variante de una prueba lleve su
  prompt, sus ajustes, su modo de alfa o su tipo (una imagen clave dentro de una prueba de vídeo).

## [1.0.0-beta.6] - 2026-11-10
**Cambio de nombre: `webs-premium` pasa a ser `the-new-era-websites`.** Y cambio de alcance: deja de ser solo «webs con
scroll y 3D» y pasa a recoger todo lo que se aprende haciendo webs, ordenado por secciones de técnica. Todas las skills
pasan a `1.0.0-beta.6`.

### Migración
- Marketplace `webs-premium` y plugin `web-premium` → los dos se llaman `the-new-era-websites`. Carpeta
  `plugins/web-premium` → `plugins/the-new-era-websites`.
- Skill maestra `web-premium` → `new-era`. Palabra clave **NEW ERA:** y comando `/new-era`.
- **Siguen funcionando** la palabra clave «WEB PREMIUM:» y el comando `/web-premium`, como alias.
- Las demás skills conservan su nombre; se invocan como `the-new-era-websites:<skill>`.
- Quien lo tenía instalado: `/plugin uninstall web-premium@webs-premium`, `/plugin marketplace remove webs-premium`,
  `/plugin marketplace add FefeRP/the-new-era-websites` y `/plugin install the-new-era-websites@the-new-era-websites`.

### Añadido
- Skill **`recursos-imagen-ia`**: recursos de imagen con IA como lotes coherentes.
  - Objetos sueltos con alfa (lo que flota o rodea al producto), juegos de iconos de marca a partir de una sola lámina,
    texturas repetibles, fondos de sección con hueco para el titular y su pareja día/noche, el mismo objeto en otros
    ángulos o materiales.
  - `references/recetas-de-imagen.md`: prompts por tipo de recurso, bloque de estilo del lote y tabla de fallos.
  - `lote-imagenes.mjs` (sin Python; usa ffmpeg): `hoja` (conjunto sobre varios fondos), `coherencia` (luz, claridad,
    saturación, margen), `iconos` (corta la lámina, iguala el tamaño y mide el grosor del trazo) y `mosaico` (mide la
    junta y la desigualdad de luz de una textura; `--arreglar`, `--igualar`).
  - `pruebas/recursos-imagen/`: entradas de verdad conocida dibujadas por código, 23/23.
- Skill **`componentes-interactivos`**: componentes reutilizables sin dependencias, con teclado, lectores de pantalla,
  táctil, reduced-motion, pausa fuera de pantalla y `destruir()`.
  - `tarjeta-volteo.js`: tarjeta con volteo 3D y capas en profundidad (`data-z`).
  - `carrusel-orbital.js`: carrusel circular en órbita o anillo 3D; arrastre con inercia, teclado, autoplay o ligado al
    scroll (`desplazar()`).
  - `resenas-3d.js`: muro de reseñas en columnas inclinadas en movimiento continuo; la lista real se queda en el DOM.
  - `pruebas/componentes/`: 42/42 en Chrome (escritorio, móvil, táctil y reduced-motion).
- Skill maestra, `references/reparto-skills-diseno.md`: **quién manda en cada tema** entre este marketplace y las skills
  de diseño instaladas (dirección, sistema de diseño, tipografía, color, microinteracciones, accesibilidad, crítica),
  orden de trabajo, qué hacer cuando dos skills dicen cosas distintas y qué hacer si no hay ninguna. Resumen en los README.
- Skill maestra, `references/reglas-de-webs-reales.md`: reglas y recetas sacadas de webs entregadas, con cifras medidas:
  dirección (lo que se rechaza por «parecer de IA»), no inventar, qué se genera y qué no, cuándo se carga lo pesado,
  scroll y móvil, trampas de CSS, 3D que no parece de juguete, cómo se comprueba y logos por código.
- `pruebas/clips-ia/`: banco para juzgar clips de IA pensados para el scroll (medidas del clip, frames, costura entre
  clips, notas por clip y página de revisión), con su prueba sintética.
- `nueva-web.mjs --con componentes` (o `tarjeta`, `carrusel`, `resenas` por separado).
- `demos/estudio/`: demo de extremo a extremo de una web de servicio **sin momento estrella** (marca inventada). Iconos de
  una sola lámina y texturas pasados por `lote-imagenes.mjs`, fichas con volteo, materiales en órbita, muro de opiniones
  y titular por líneas; sin secciones fijadas, vídeo ni 3D. `verificar-scroll` con 0 errores en escritorio, móvil y
  movimiento reducido.

### Cambiado
- Skill maestra: brief con «qué es verdad» (reseñas y cifras comprobables) y lectura de `DESIGN.md`/`PRODUCT.md`; paso de
  dirección con el reparto y, en encargos de peso, dos direcciones con capturas antes de construir; **no toda web necesita
  un momento estrella**; filas nuevas en «Quiero…» (piezas con alfa, iconos de marca, texturas y fondos, componentes,
  microinteracciones delegadas); verificación en 390×844, 360×740 y 844×390, y crítica con la skill de diseño al final.
- Descripciones de las skills sin el nombre anterior. Versión y metadatos del plugin y del marketplace (descripción y
  palabras clave nuevas, `homepage` en la dirección nueva del repositorio).

### Corregido
Tras una auditoría de las 16 skills:
- Contradicciones entre skills unificadas: precios y nombres de modelos (fuente única: `pedir-assets-ia`,
  `proveedores.md` y `precios.json`), prompt negativo solo en los modelos que lo admiten, duración de clip (4-6 s),
  giro de producto (90-180° por defecto), profundidad de campo (producto y piezas siempre nítidos), panel fijado a
  `100lvh`, proporción de la etiqueta del envase y prueba barata con Veo.
- Rutas de scripts de otras skills escritas completas, y avisos de qué carpetas solo existen en el repositorio.
- Las guías de diseño genérico de la maestra (tipografía, color, accesibilidad, SEO) quedan marcadas como «solo si no hay
  skill de diseño instalada».
- Las plantillas de prompt dicen qué está validado con una generación real y qué no.
- `lote-imagenes.mjs mosaico --arreglar`: el cruce de bordes se hace por ejes separados; antes dejaba una costura corta
  en el centro de cada lado que la medida no veía (se vio al usar las texturas en la demo). Además: error claro si falta
  ffmpeg, las hojas guardadas en la carpeta no cuentan como piezas, una pieza negra pura ya no anula los avisos de luz,
  el icono que se sale de su celda se avisa también en láminas pequeñas y se validan los argumentos.
- `tarjeta-volteo.js`: con `disparo: 'hover'` el teclado ya llega al dorso; una selección de texto en otra parte de la
  página no bloquea el clic; `destruir()` deja las caras en su sitio y devuelve los estilos en línea que hubiera.
- `carrusel-orbital.js`: velocidad de giro independiente de los hercios de la pantalla; un clic a mitad de giro ya no lo
  deja entre dos tarjetas; soltar el puntero fuera termina el arrastre; con `desplazar()` el elemento de delante cambia
  durante el giro.
- `resenas-3d.js`: con pocas reseñas se añaden las copias necesarias para que no se vea el hueco; las columnas no salen
  iguales con 2 o 4 fichas; los clones son el mismo elemento que el original, para que el CSS del autor les llegue.

## [1.0.0-beta.5] - 2026-10-30
Todas las skills pasan a `1.0.0-beta.5`. Idea central: **no todo es vídeo ni 3D**. Lo quieto es foto (aislada, con alfa o en capas) y el código la mueve; el vídeo, solo donde la cámara viaja o algo cambia físicamente; el 3D, solo cuando es imprescindible. Sale de analizar cinco referencias nuevas fotograma a fotograma (ref12-ref16) y de una investigación con fuentes y fechas.

### Añadido
- Investigación `docs/investigacion/04-webs-scroll-con-ia-2026.md` y su resumen `04-resumen.md`: lo que se ve de verdad en las referencias (confirmado frente a supuesto), stack actual, frames, alfa, recetas de vídeo IA publicadas, mapas, repos de agentes, accesibilidad y móvil.
- `pedir-assets-ia/references/matriz-medio-por-elemento.md`: foto, foto con alfa o capas, vídeo, vídeo con alfa, frames o 3D para cada tipo de elemento, con coste, peso, riesgo, cuándo subir de categoría y formatos de salida.
- Skill **`capas-alfa`**: elementos con fondo transparente sin Python ni GPU.
  - `alfa.mjs`: saca el alfa de un fondo de color (clave lineal con desmezcla del color), de negro, de blanco, de un par negro/blanco (alfa exacto en cristal y líquidos), de la máscara del proveedor o de un WebM que ya lo trae. Salidas: stacked alpha MP4, WebM VP9, frames WebP con alfa compatibles con `frame-scrubber`, PNG, póster, recorte de imagen, hoja de revisión y `alfa.json` con métricas y avisos (fondo residual, halo, desalineación del par).
  - `video-alfa.js`: reproduce el stacked alpha en WebGL en todos los navegadores (bucle, una vez o ligado al scroll), con póster, pausa fuera de vista y reduced-motion.
  - references: cómo pedir el asset aislado, formatos con alfa por navegador y peso, y cómo componer capas (texto entre capas, parallax, sombra, móvil).
  - `pruebas/capas-alfa/`: entradas con alfa conocido. Croma 39,8 dB (el chromakey de ffmpeg daba 28,2), negro 40,1, par negro/blanco 59,4, imagen 49,8; página de prueba 20/20.
- Skill **`revelados-y-transiciones`**: `revelados.js` sin dependencias (rejilla, cortina con cambio de escena, zoom 2D a un punto con relevo a una imagen de detalle, titular línea a línea con máscara), misma interfaz para scroll o tiempo; patrones de tarjeta a pantalla completa, View Transitions y CSS ligado al scroll. Prueba `pruebas/revelados-rastro/` 23/23.
- Skill **`rastro-cursor`**: fotos que siguen al ratón con un pool fijo de imágenes; desactivado en táctil y con reduced-motion.
- `mapa-zoom-ubicacion`: segundo camino, **mapa por niveles de imagen** (`mapa-imagen.js`): niveles anidados de ortofoto real o estilizada con IA sobre ella, cámara anclada, paso de una zona a otra con arco, marcadores y rutas por código, fotogramas exactos de inicio y fin para pedir un clip IA entre dos vistas. Guía `references/mapa-por-imagenes.md`. Prueba `pruebas/mapa-imagen/` con ortofoto PNOA real (22/22).
- `pedir-assets-ia`: plantillas 10-16 (foto aislada, splash quieto, objeto en capas, vídeo para recortar, 360 por frames, mapa cenital o isométrico, fondos de ambiente), coherencia de un lote y formato de salida; proveedores de alfa, recorte y 3D generado; `presupuesto.mjs` con piezas de tipo `composicion`.
- `pruebas/servidor-estatico.mjs`: servidor de pruebas con Range (para buscar en vídeo).
- `pruebas/extremo-a-extremo/`: ejemplo completo sin gasto, una boutique del reloj de la demo con su taller en Sabadell.
  - `PLAN.md`: brief, guion de 5 tramos, el medio de cada elemento según la matriz y el presupuesto si se hiciera con IA de pago (1,29 $ esperado, 2,52 $ peor caso).
  - `preparar.mjs`: hace los activos:
    - el reloj sobre magenta, recortado con `alfa.mjs`;
    - los frames del giro;
    - los niveles de mapa de la ortofoto PNOA.
  - La página combina:
    - un titular detrás del reloj;
    - el giro con el scroll;
    - una rejilla que descubre el detalle;
    - un mapa por niveles hasta el taller.
  - `probar.mjs`: 31/31, y `verificar-scroll` sin errores en escritorio, móvil y movimiento reducido.

### Cambiado
- `frame-scrubber.js`: opción `transparente` (y `alfa: true` en el manifest) para frames con alfa sobre la página. El
  lienzo queda oculto hasta pintar el primer frame: antes salía negro y tapaba el póster puesto debajo para el LCP.
- Guías: paradas apaisadas del mapa por niveles con `cubrir` en móvil vertical, la rejilla tapa con un color (no con
  transparencia), frames comparados con ±1 en las pruebas. `presupuesto.mjs` dice qué modelo cobra cada revisión.
- `web-premium/references/base-tecnica.md`: LCP con un canvas en el hero, `overflow: clip` en vez de `hidden` con `sticky`, `svh` e `ignoreMobileResize`, interfaz HTML sobre el canvas, CSS ligado al scroll dentro de `@supports`, tabla de móvil y ahorro de datos, `gsap.matchMedia`. La plantilla configura `ignoreMobileResize` y marca el ahorro de datos.
- Skill maestra: "no todo es vídeo" en la idea central, skills nuevas en la lista, filas nuevas en "Quiero…" (texto entre capas, splash quieto, humo sobre negro, revelados, zoom 2D, rastro, mapa ilustrado o viaje entre sitios); los recortes van a `capas-alfa`.
- `nueva-web.mjs --con alfa,revelados,rastro,mapa-imagen`.
- `pedir-assets-ia`: lo que gira con texto va primero con `envase-giratorio` o frames de un render; 3D en vivo solo si se toca o se configura.
- Manifiestos y comando `/web-premium` con las técnicas nuevas y el 3D como opción, no como punto de partida.
- Revisión de todas las skills contra la matriz:
  - el catálogo de técnicas sin emojis, con las refs 12-16, filas nuevas (vídeo y frames con alfa, splash aislado, rejilla, zoom 2D, mapa por niveles) y combinaciones corregidas (bebidas con `envase-giratorio`, 3D solo si se gira);
  - el recorte pasa a `alfa.mjs` o a una API (rembg solo si hay Python);
  - `overflow: clip` en los patrones con escenas fijadas;
  - cifras de frames y pesos unificadas;
  - `mapa-zoom-ubicacion` con el criterio para elegir camino;
  - `continuidad.md` sin `filter: blur()` animado;
  - receta nueva "web solo con fotos";
  - análisis de referencias apuntando a las skills nuevas.
- `extraer-frames.mjs`: por defecto 1600 px en escritorio y 900 px en móvil (antes 1920/720), lo que dicen las guías.

## [1.0.0-beta.4] - 2026-10-30
Todas las skills pasan a `1.0.0-beta.4`. Idea central: **lo realista sale de assets de IA bien pedidos, no del 3D**. Sale de volver a desmontar las 11 webs de referencia (de qué assets se compone cada una y cómo se pidieron) y de las lecciones de un encargo real con vídeo IA (zoom a la pantalla de un portátil).

### Añadido
- Skill **`pedir-assets-ia`**: el director de assets de IA.
  - Guion de tramos → medio de cada asset (vídeo IA, imagen IA, código o 3D) → presupuesto con vale → imágenes clave primero → finales como otra toma → prueba de 3 s → revisión → entrega a las skills que montan.
  - `scripts/presupuesto.mjs` + `precios.json`: coste por fases (esperado y peor caso), lo ya gastado, alternativas más baratas para la prueba y aviso si no cabe en el presupuesto del usuario.
  - `scripts/revisar-ia.mjs`: revisión "¿se nota falso?" de una imagen o un vídeo con Gemini (REST, sin dependencias).
  - references: `plantillas-por-plano.md` (bloque de realismo, delatores de IA en positivo, prompts de imagen clave y de vídeo para zoom a pantalla, producto girando, entrada a escena, capas con fondo separado, mismo encuadre día/noche, cambio de estado, transición, aéreo e interior), `continuidad.md`, `se-nota-falso.md` (revisión en 4 capas, 18 señales y su arreglo), `proveedores.md` (Higgsfield, Kling, Veo, Seedance, Wan, Luma, MiniMax, Runway; Nano Banana, GPT Image, Qwen, Flux, Seedream, Midjourney, Ideogram, Recraft: cuándo usar cada uno y coste) y `recetas-por-tipo-de-web.md` (estudio/SaaS, producto, inmobiliaria, restaurante, sabores, app, con costes).
- Skill **`seguir-pantalla`**: la web, el logo o un texto reales encima de una pantalla o cartel del vídeo, sin generarlos ni estirarlos.
  - `seguir-pantalla.mjs`: sigue 4 esquinas fotograma a fotograma (correlación por parches con subpíxel, pasadas de ida y vuelta entre claves, marca e interpola los dudosos), modo rejilla para medir, vídeo y hoja de revisión.
  - `capa-pantalla.js`: capa HTML (img, vídeo, canvas o la propia web) pegada con `matrix3d`, con `object-fit` contain/cover, esquinas redondeadas, brillo y filtro.
  - `pruebas/seguir-pantalla/`: vídeo sintético con esquinas conocidas (error medio ~1 px, máximo < 3 px) y prueba de la capa en Chrome (escritorio y móvil, error < 3,2 px CSS).
- `nueva-web.mjs --con pantalla`.

### Cambiado
- `frame-scrubber.js`: opción `alDibujar({ i, x, y, w, h, escala, canvas, manifest, variante })` tras pintar cada frame (copiado a la demo y verificado).
- `extraer-frames.mjs`: el manifest guarda `inicio`, el tamaño `original` y el `recorte` de la variante móvil.
- Skill maestra: "lo realista sale de la IA, no del 3D"; el plan de activos sigue `pedir-assets-ia`; filas nuevas en la tabla de técnicas y en el catálogo.
- `video-ia-para-scroll` y `fotos-producto-ia`: precios y modelos al 30-10-2026 (Kling O3 pro medido, Veo solo en Vertex, Seedance al doble en Higgsfield, planes nuevos de Higgsfield, Runway solo con fotograma inicial) y enlaces a las skills nuevas.

## [1.0.0-beta.3] - 2026-10-26
Todas las skills pasan a `1.0.0-beta.3`. Sale de dos vídeos de referencia nuevos: ref10 (slider de latas en Figma) y ref11 (web del cruasán por dentro).

### Añadido
- Skill **`lente-revelado`**: una lente circular que sigue al cursor o al dedo y enseña otra versión alineada de la imagen (rayos X, térmica, interior). Tiene interruptor de modos y la misma pareja de imágenes sirve de cortina antes/después con el scroll.
  - Motor `lente-revelado.js`:
    - `mask-image` radial con lerp y anillo de mira.
    - En táctil, la lente pasea sola y se arrastra con `pan-y`.
    - Con menos movimiento, se queda quieta.
    - Métodos `modo()`, `cortina()`, `llevarA()` y `destruir()`.
  - `variantes-revelado.mjs` (ffmpeg, sin IA): saca rayos X y térmica de cualquier foto conservando el alfa. `--comprobar` mide cuánto difiere la silueta de una variante hecha con IA.
  - references: `patrones-codigo.md` y `activos-ia.md` (cómo pedir el interior a Higgsfield, con su coste y la revisión).
- Skill **`envase-giratorio`**: lata, bote o tarro que gira sin 3D.
  - Motor `envase-giratorio.js`: enrolla la etiqueta plana sobre un cilindro en canvas 2D (`u = asin(x/r)`), con sombreado, brillo y tapa metálica.
  - Métodos `girar()`, `cambiarEtiqueta()` y `proporcionEtiqueta`.
  - references: slider de sabores completo con GSAP (fondo, título en máscara, frutas, cambio a mitad de giro), arrastre, y cómo preparar o pedir la etiqueta plana (proporción, costura, prompts, coste).
- `video-ia-para-scroll/references/receta-producto-por-dentro.md`: el producto realista sobre negro contado en tramos (rotura → corte → entrar dentro → cambio de estado → rayos X). Recoge activos, prompts de Higgsfield, encadenado por fotograma, montaje y presupuesto (≈ 330-730 créditos, 15-35 $).
- `scroll-frames/references/patrones-codigo.md`: patrón **HUD de datos ligado al progreso** (contador, tiempo, temperatura, estado, barra).
- `nueva-web.mjs --con lente,envase`.
- `pruebas/lente-envase/`: página de prueba sin build y `probar-interaccion.mjs` (13 comprobaciones: lata, clic del slider, lente, modos, cierre, móvil y menos movimiento). Las etiquetas SVG se hacen con código.
- Referencias ref10 y ref11 con su análisis. Entran en el catálogo de técnicas y en la skill maestra.

### Cambiado
- **Primera versión pública** del repo (historial nuevo, de un solo commit).
  - README en inglés; el de español pasa a `README.es.md`.
  - Autor `FefeRP` en el marketplace, el plugin y la licencia.
  - Descripciones del marketplace y del plugin en inglés.
- Los scripts ya no buscan ffmpeg en rutas de una máquina concreta: usan las variables `FFMPEG` / `FFPROBE`, después el PATH y después carpetas habituales.
- Catálogo de técnicas: pasan a ✅ el HUD/contador, el antes/después (cortina), el slider con cambio de fondo y el título en máscara. Hay entradas nuevas para el producto por dentro, el cambio de estado, la lente y la lata.

### Arreglado (revisión de código antes de la beta)
- `envase-giratorio.js`:
  - Si se piden dos etiquetas seguidas, gana siempre la última, aunque la primera tarde más en cargar.
  - No se mide ni se pinta tras `destruir()`.
  - `proporcionEtiqueta` mide si aún no se había medido, en vez de dar NaN.
  - El trozo de etiqueta por columna nunca pasa de una vuelta.
- `lente-revelado.js`: `pintar()` no toca nada tras `destruir()`.
- `variantes-revelado.mjs --comprobar`: si faltan las dos imágenes, explica el uso y no revienta.

## [1.0.0-beta.2] - 2026-10-26
Todas las skills pasan a `1.0.0-beta.2`.

### Añadido
- Skill **`mapa-zoom-ubicacion`** (del mapa al edificio): la cámara baja con el scroll desde la ciudad hasta un edificio, con mapa real.
  - Motor `mapa-scroll.js` (MapLibre GL JS), que hace esto:
    - Paradas de cámara con el destino anclado: el centro se mueve en Mercator en proporción a 1/escala.
    - Ortofoto bajo las etiquetas.
    - Edificios OSM extruidos.
    - Edificio destino detectado y resaltado (se juntan los trozos de tesela y se descartan las manchas de zoom bajo).
    - POI ocultos, mapa no interactivo.
    - Precarga de la ruta que se puede cortar con `AbortSignal`.
    - `proyectar()` para anclar HTML.
  - `references/fuentes-mapa.md`: licencias, precios y atribución de PNOA, OpenFreeMap, OSM, Esri, MapTiler, Mapbox, Stadia, Google 3D Tiles (bloqueado en el EEE), Cesium y EOX, y cuándo tiene sentido la IA.
  - `references/patrones-codigo.md`: HTML/CSS/JS de la sección, relevo encuadrado a la foto real y etiquetas ancladas.
  - `references/ideas-ref9.md`: lo aprovechable del motion de mapas 3D.
  - Trampas vividas:
    - MapLibre 6 sin export por defecto.
    - Worker perdido con Vite.
    - Lienzo de 0 px por el CSS de MapLibre.
    - `flyTo` contra scrub.
    - Volúmenes translúcidos.
- `demos/mapa/`: Barcelona → Torre Glòries (ubicación de ejemplo) con ortofoto PNOA y OpenFreeMap. Verificada con 0 errores en escritorio, móvil y menos movimiento; capturas en `capturas/demo-mapa/`.
- `nueva-web.mjs --con mapa`: copia el motor y añade `maplibre-gl`.
- Referencias ref8 (web: zoom de satélite a la torre, Reposé) y ref9 (motion de mapas 3D), con su análisis. Las dos entran en el catálogo de técnicas y en la skill maestra.

## [1.0.0-beta.1] - 2026-10-25
Primera beta pública interna. Todas las skills pasan a `1.0.0-beta.1`.

### Añadido
- **Instalación** como marketplace de Claude Code (`/plugin marketplace add` + `/plugin install web-premium@webs-premium`), probada desde cero en una carpeta limpia.
- `LICENSE` (MIT), `CREDITOS.md` con el material de terceros y este changelog.

### Cambiado
- Los vídeos de referencia de otros creadores ya no se distribuyen: solo sus análisis escritos (`docs/referencias/analisis-ref*.md`).

## [0.2.0] - 2026-10-25
### Añadido
- Skill **`fotos-producto-ia`**: fotos del producto real con IA (Higgsfield y alternativas).
  - Fotos de referencia con el móvil.
  - Prompts por encuadre y por luz.
  - Consistencia entre tomas.
  - Detección de deformaciones (superposición, comparación lado a lado y prompt de control) y cómo arreglarlas.
  - Modelos y precios.
- `parallax-capas`: **sombra como capa propia** con `capas-sombra.mjs` (foto + plato → fondo, sombra semitransparente, producto; Node + ffmpeg, sin dependencias) y la guía `sombras.md` (producto que levita, cambio de fondo).
- Análisis de dos referencias nuevas (ref6, ref7) y sus técnicas en el catálogo:
  - aterrizaje de la secuencia en la ficha de producto
  - vuelo multiescala
  - antes/después con el scroll
  - composición 9:16 propia
  - carrusel orbital de variantes
- `pruebas/`: validación con verdad conocida (métricas de la sombra, revisión de deformaciones sembradas).

### Arreglado
- `frame-scrubber.js`: si falla el primer frame, ya no rompe la página; se reintenta.
- `escena-producto.js`: opción `senal` (AbortSignal) para cancelar durante la carga; libera el contexto WebGL también si el modelo falla.
- `video-scrubber.js`: comprueba la respuesta y limpia el listener de reintento.
- `extraer-frames.mjs`: valida `--recorte-movil` y que las variantes tengan los mismos frames.
- `verificar-scroll.mjs`: ignora el 404 del favicon.

## [0.1.0] - 2026-10-24
### Añadido
- Marketplace `webs-premium` con el plugin `web-premium`:
  - Skill maestra **WEB PREMIUM** (`/web-premium`): brief → momento estrella → técnicas → activos → plantilla Vite + GSAP + Lenis → verificación con capturas.
  - `scroll-frames`: vídeo → frames, canvas ligado al scroll.
  - `video-ia-para-scroll`: cómo pedir el vídeo a Higgsfield/Kling/Veo/Luma.
  - `parallax-capas`.
  - `escena-3d-gltf`.
- Demo `demos/reloj` (Orbe 01) y análisis de las referencias ref1-ref5.
