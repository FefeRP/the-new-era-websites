# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versiones: [SemVer](https://semver.org/lang/es/).

## [Sin publicar]
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
  en `modelos-y-camaras.md`; coste de ejemplo de `mapa-por-imagenes.md` recalculado).
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
