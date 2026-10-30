# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versiones: [SemVer](https://semver.org/lang/es/).

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
