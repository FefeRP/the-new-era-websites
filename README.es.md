# webs-premium · marketplace de Claude Code

**v1.0.0-beta.5** · [Read in English](README.md)

Skills para construir webs que parecen imposibles: scroll cinematográfico, vídeo convertido en frames, el producto contado por dentro con imagen realista, capas con fondo transparente (el texto entre el producto y el fondo, un splash sobre la página), imágenes que se revelan y transiciones entre escenas, profundidad por capas (con la sombra como capa propia), 3D real, lata que gira sin 3D, lente de rayos X bajo el cursor, fotos de producto con IA y un mapa que baja hasta el edificio (mapa vivo o por niveles de imagen). Se organizan **por técnicas que se combinan**, no por estilos.

**Lo realista sale de la IA, no del 3D.** Las webs que parecen imposibles usan fotos y vídeos generados con IA, en planos cortos y bien pensados, y el código solo los mueve con el scroll y pone el texto encima. `pedir-assets-ia` decide qué assets van con vídeo IA, imagen IA, código o 3D, estima el coste antes de generar, escribe los prompts para cualquier proveedor y revisa el resultado; el 3D real queda como respaldo barato. **Y no todo es vídeo:** lo que está quieto es una foto (aislada, con alfa o en capas) que mueve el código; vídeo solo donde la cámara viaja o algo cambia físicamente.

## Instalar
Requisitos:
- Claude Code reciente, con `/plugin`.
- Para los scripts: Node 20+ y ffmpeg en el PATH (o su ruta en las variables `FFMPEG` / `FFPROBE`).
- Para las webs que salen: npm.

**Desde GitHub:**
```
/plugin marketplace add FefeRP/webs-premium
/plugin install web-premium@webs-premium
```

**Desde una copia local:**
```
git clone https://github.com/FefeRP/webs-premium.git
/plugin marketplace add ./webs-premium
/plugin install web-premium@webs-premium
```

Reinicia Claude Code (o `/reload-plugins`) y comprueba con `/plugin` que `web-premium` está activo.

- **Actualizar:** `/plugin marketplace update webs-premium`.
- **Probar sin instalar:** `claude --plugin-dir plugins/web-premium`.

## Usar
Escribe **WEB PREMIUM: …** (o `/web-premium …`) con el negocio, el producto y los activos que tienes. La skill maestra:
1. Hace el brief.
2. Elige el momento estrella y las técnicas.
3. Planifica los activos con su coste.
4. Monta la web con la plantilla (Vite + GSAP + Lenis).
5. La verifica con capturas en escritorio, móvil y modo de movimiento reducido.

Ejemplo: `WEB PREMIUM: landing para un reloj de edición limitada; tengo 4 fotos del producto y el logo; quiero que gire al hacer scroll`.

> Las skills nunca gastan en servicios de pago (Higgsfield, APIs de vídeo o imagen) sin dar antes un presupuesto y esperar tu sí.

## Skills
| Skill | Para qué |
|---|---|
| `web-premium` | Maestra: dirige todo el proceso; plantilla Vite + GSAP + Lenis; `nueva-web.mjs` y `verificar-scroll.mjs` |
| `pedir-assets-ia` | Director de assets de IA: medio de cada elemento con una matriz de decisión (foto, foto con alfa o en capas, vídeo, vídeo con alfa, frames, código o 3D, con coste, peso y riesgo), coste antes de generar (`presupuesto.mjs`, la prueba más barata primero, tu presupuesto), plantillas de prompt por tipo de plano para Higgsfield, Kling, Veo, Seedance, Wan, Runway, Midjourney, Flux…, continuidad con imagen de inicio y fin, recetas por tipo de web y revisión "¿se nota falso?" (`revisar-ia.mjs` con Gemini + señales) |
| `scroll-frames` | Vídeo → frames WebP/AVIF (escritorio y móvil) → canvas ligado al scroll, cada frame nítido y sin mezclar; modo vídeo alternativo |
| `seguir-pantalla` | La web, el logo o un texto reales sobre una pantalla o cartel del vídeo IA: `seguir-pantalla.mjs` sigue sus 4 esquinas fotograma a fotograma (subpíxel, ida y vuelta) y `capa-pantalla.js` pega ahí una capa HTML con `matrix3d`, con su proporción (nunca estirada) |
| `video-ia-para-scroll` | Cómo pedir el vídeo a Higgsfield, Kling, Veo, Luma… (cámara, fondo, bucle, consistencia, prompts) y revisarlo automáticamente; receta "producto por dentro" en tramos encadenados con presupuesto |
| `fotos-producto-ia` | Fotos del producto real en otras escenas con IA: referencias, prompts por encuadre y luz, consistencia entre tomas, capas, detección y arreglo de deformaciones, precios |
| `capas-alfa` | Elementos con fondo transparente sin Python ni GPU: cómo pedir a la IA el elemento aislado; `alfa.mjs` lo recorta de un color liso, negro, blanco o una pareja negro/blanco (alfa exacto en cristal y líquidos) y saca MP4 con alfa apilado (todos los navegadores, lo reproduce `video-alfa.js` en WebGL), WebM VP9, frames WebP con alfa para el scroll, PNG y una hoja de revisión con métricas; composición de capas con el texto en medio |
| `revelados-y-transiciones` | `revelados.js`: imagen que se descubre en rejilla, cortina que cambia de escena, zoom 2D a un punto de una imagen grande con relevo a una foto de detalle, titular que sube por líneas; tarjeta a pantalla completa, View Transitions, animaciones CSS ligadas al scroll |
| `rastro-cursor` | Fotos que siguen al cursor y se desvanecen (grupo fijo de imágenes, solo ratón; composición estática en táctil y con movimiento reducido) |
| `parallax-capas` | Profundidad 2.5D: capas con scroll y puntero, CSS scroll-driven; `capas-sombra.mjs` saca la sombra como capa semitransparente (producto que levita, cambio de fondo) |
| `escena-3d-gltf` | three.js con glTF optimizado (meshopt), entorno PBR, arrastre y scroll, rendimiento móvil, cancelación de carga |
| `lente-revelado` | Lente que sigue al cursor (o al dedo) y enseña otra versión alineada: rayos X, térmica, interior; interruptor de modos; cortina antes/después con el scroll; `variantes-revelado.mjs` saca rayos X y térmica de una foto con ffmpeg y comprueba la alineación |
| `envase-giratorio` | Lata, bote o tarro que gira sin 3D: etiqueta plana enrollada en canvas con sombreado y tapa; giro con scroll, arrastre o slider de sabores (fondo, título y frutas que cambian a la vez) |
| `mapa-zoom-ubicacion` | Del mapa al edificio: MapLibre con ortofoto real (PNOA en España, gratis) y edificios 3D de OSM; cámara por paradas ligada al scroll, edificio resaltado, relevo a la foto; fuentes de mapa con licencias y precios. Segundo camino, `mapa-imagen.js`: niveles de imagen anidados (ortofoto real, o estilizada con IA sobre ella sin inventar geografía), cámara anclada, viaje de un sitio a otro, marcadores y rutas por código, fotogramas exactos de inicio y fin para pedir un clip IA entre dos vistas |

## Qué hay en el repo
- `.claude-plugin/marketplace.json` → `plugins/web-premium/` (el plugin: `plugin.json`, `commands/`, `skills/`).
- `demos/reloj/`: web de demostración hecha con la skill maestra. Para verla: `cd demos/reloj && npm install && npm run dev` y abrir http://127.0.0.1:5190.
- `demos/mapa/`: del mapa al edificio (Barcelona, ubicación de ejemplo). `cd demos/mapa && npm install && npm run dev` (necesita internet: las teselas se piden en directo).
- `docs/referencias/`: análisis escritos de 16 webs y vídeos de referencia. Los vídeos no se incluyen porque son de sus autores.
- `docs/investigacion/`: ecosistema, marketplaces, vídeo IA y la investigación de 2026 sobre webs de scroll hechas con assets de IA (con fuentes y fechas).
- `pruebas/`: validación de los scripts con resultado conocido, cada una con su `LEEME.md` (se sirve la raíz del repo con `node pruebas/servidor-estatico.mjs . 5193`): `capas-alfa/` (alfa contra una verdad conocida), `revelados-rastro/`, `mapa-imagen/` (ortofoto PNOA real de Barcelona), `seguir-pantalla/`, `lente-envase/`, `capas-sombra/` y `extremo-a-extremo/`: un ejemplo completo sin generar nada de pago (plan y presupuesto según la matriz de decisión, reloj recortado con el titular detrás, giro con el scroll, revelado en rejilla y mapa por niveles hasta el taller).
- `capturas/`: hojas de capturas de la verificación.

## Estado de la beta
**Probado:**
- Validación estricta del marketplace y del plugin.
- Instalación desde cero.
- Demos (reloj y mapa) verificadas sin errores en escritorio, móvil y movimiento reducido (Chrome con WebGL por software).
- `capas-sombra` medido contra una verdad renderizada.
- Seguimiento de pantalla medido contra la verdad (error medio ~1 px, máximo < 3 px) y la capa comprobada en Chrome en escritorio y móvil; presupuesto y revisión con Gemini probados sobre vídeo generado con IA real.
- Motores probados en Chrome: cancelación de carga y reintento de frames; lata que gira, lente y cortina con prueba de interacción (cursor, clic, dedo).
- `alfa.mjs` medido con entradas de alfa conocido (croma 39,8 dB, pareja negro/blanco 59,4 dB) y la página de capas comprobada por píxeles; revelados, rastro del cursor y mapa por niveles comprobados por píxeles en escritorio, móvil y movimiento reducido.

**Sin probar:**
- Una generación de pago nueva siguiendo las plantillas de prompt nuevas (Higgsfield u otros), incluidos los modelos de imagen con alfa nativo y las APIs de recorte de vídeo.
- rembg, IC-Light y modelos de edición locales (necesitan Python o GPU; para recortar, `alfa.mjs` no los necesita).
- Vídeo HEVC con alfa (solo se codifica en un Mac).
- Mapa: relevo a foto real del edificio (la demo no tiene foto propia; el patrón está documentado) y fuentes de pago (MapTiler, Esri…).

Cambios: ver [CHANGELOG.md](CHANGELOG.md).

## Licencia y créditos
Código y textos: [MIT](LICENSE). Material de terceros (modelo 3D CC-BY de la demo, datos de mapa de OSM/OpenFreeMap/IGN, ideas adaptadas de `nateherkai/scroll-craft`): ver [CREDITOS.md](CREDITOS.md).
