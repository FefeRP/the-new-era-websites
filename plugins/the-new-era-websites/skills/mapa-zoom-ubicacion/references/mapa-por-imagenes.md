# Mapa por niveles de imagen (y con IA)

El segundo camino de esta skill: en vez de un mapa vivo (MapLibre + teselas), **unas pocas imágenes anidadas**
(ciudad → barrio → calle) que la cámara recorre con el scroll, con marcadores, rutas y textos por código. Motor:
`scripts/mapa-imagen.js`. Prueba de referencia con ortofoto real: `pruebas/mapa-imagen/` del repositorio (22 comprobaciones).

## Cuándo este camino y cuándo el mapa vivo
| | Mapa vivo (`mapa-scroll.js`) | Niveles de imagen (`mapa-imagen.js`) |
|---|---|---|
| Aspecto | Ortofoto + calles + edificios 3D, inclinación y giro | Lo que sea la imagen: ortofoto, ilustración, mapa estilizado con IA |
| Peso | 25-60 MB de teselas por recorrido, variable | Fijo y conocido: 3-5 imágenes, 2-4 MB en total |
| Dependencias | MapLibre (~300 KB gzip), WebGL, red a dos servidores | Ninguna (canvas 2D) |
| Cámara | 3D (pitch, bearing) | 2D cenital (zoom y desplazamiento) |
| Lo que no hace | Estilo propio fuerte, ilustración | Inclinación real; vuelos largos sin preparar niveles |
| Elígelo si | La ubicación en 3D es el argumento (promoción, parcela) | Quieres un estilo propio, peso controlado, o pasar de una zona a otra contándolo como un plano |

## 1. Sacar los niveles (ortofoto real)
- **Fuente:** la ortofoto abierta del sitio (PNOA en España, USGS en EE. UU., la oficial del país si su licencia lo
  permite; ver `fuentes-mapa.md`). Nunca capturas de Google Earth/Maps ni de servicios que prohíben cachear.
- **Cómo:** pide cada caja al WMS en Web Mercator con el tamaño exacto en píxeles. Es lo que hace
  `pruebas/mapa-imagen/descargar-niveles.mjs` del repositorio (cópialo y cambia centros y tamaños):
  `https://www.ign.es/wms-inspire/pnoa-ma?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OI.OrthoimageCoverage&STYLES=&CRS=EPSG:3857&BBOX=<x0,y0,x1,y1>&WIDTH=<px>&HEIGHT=<px>&FORMAT=image/jpeg`
  El script calcula también las cajas de cada nivel y los puntos de interés en coordenadas 0..1 de la base
  (`niveles.json`), que es lo que recibe el motor. En el navegador, `proyeccion({ oeste, sur, este, norte })` hace la
  misma cuenta desde lat/lng.
- **Reglas de los niveles:**
  - cada nivel, **dentro de su padre** (el anterior, o `padre: i` para niveles hermanos: dos calles en el mismo barrio);
  - entre niveles, un salto de ~3-7× en metros por píxel (en la prueba: 3,3 → 1,2 → 0,2 m/px);
  - la caja del nivel con **la misma proporción que su imagen**;
  - los niveles profundos, **más altos que anchos o cuadrados** (4:5 en la prueba): en un móvil vertical la vista final
    es alta y estrecha, y un nivel 16:9 no la cubre (asoma el padre ampliado y borroso; nos pasó);
  - ~1 px de imagen por px de pantalla en la parada más cercana (con `dprMax` 2, 2048-2560 px por nivel bastan).
- **Peso:** WebP calidad 70-80. En la prueba, 4 niveles = 4 MB (calidad 80); con 70 y 2048 px de ancho bajan a ~2,5 MB.
  Precarga la base con `<link rel="preload" as="image">` y deja el resto para cuando la sección se acerque.
- **Atribución** en la propia escena y en el pie ("PNOA cedido por © Instituto Geográfico Nacional", CC BY 4.0).

## 2. Con IA: estilizar sin inventar
La IA **inventa geografía** (calles, edificios, costa) si se le pide un mapa de un sitio real. Lo seguro:
1. **Estilizar la ortofoto real** con un modelo de edición (Nano Banana 2.1 / Pro, Qwen Image 3, Seedream 5 o Flux 3):
   la ortofoto como imagen de entrada y un prompt que **solo cambia el estilo**:
   ```
   Restyle this aerial photo as [a soft architectural illustration / a clay model / a night map with warm lights],
   top-down view. Keep every street, block, building footprint, park and coastline exactly where it is.
   Do not add, remove or move anything. No text, no labels, no icons.
   ```
   Hazlo **nivel a nivel con el mismo prompt y la misma referencia de estilo** (el primer resultado aprobado como imagen de
   estilo de los siguientes), y comprueba la alineación con la prueba de `pruebas/mapa-imagen/` del repositorio (diferencia gruesa entre
   niveles < 10) o superponiendo los dos niveles al 50 %.
2. **Isométrico o de maqueta**: mejor desde un render 3D propio (MapLibre con edificios extruidos a la inclinación
   deseada, o three.js) estilizado después con el mismo método. Pedir "isometric map of Barcelona" da una ciudad que
   no existe.
3. **Rótulos, nombres, rutas y marcadores, siempre por código** (marcadores HTML y `rutas` del motor), nunca dentro de
   la imagen: la IA escribe mal y no se puede traducir ni corregir.

Coste orientativo (precios de `pedir-assets-ia/scripts/precios.json`, 10-2026): 0,03-0,08 $ por nivel estilizado;
4 niveles y dos rondas de prueba, < 1 $. Presupuesto con `presupuesto.mjs` y vale antes de generar.

## 3. Con IA: vídeo entre dos vistas
Para un tramo que tenga que **moverse por sí mismo** (nubes que se abren, luces de la ciudad que se encienden, un vuelo
rasante corto), un clip de vídeo con **fotograma de inicio y fin** sacados del propio mapa:
```js
const inicio = m.fotograma(0.5, 1920, 1080);    // canvas → toBlob → PNG de inicio
const fin = m.fotograma(0.82, 1920, 1080);      // PNG de fin
```
Pídelo con un modelo que acepte inicio y fin (Veo 3.1 Lite / Fast, con el final solo en clips de 8 s; Kling 3.0 o Kling O3 pro; Seedance 2.0 / 2.5; Wan 2.7; plantillas de
`pedir-assets-ia`), con prompt de cámara simple ("slow aerial push-in, top-down, no new buildings, no text"), y sírvelo
como frames con `scroll-frames` en una capa encima del canvas durante ese tramo (opacidad 1 solo entre los dos `en`).
Como empieza y acaba en fotogramas exactos del mapa, entra y sale sin corte. Con inicio y fin a 720p: 5 s en Kling 3.0 std ≈ 0,42 $, 8 s en Veo 3.1 Lite ≈ 0,40 $; Seedance 2.5 cuesta bastante más.
Lo que hay en medio sí lo inventa la IA: que sea corto y que no enseñe calles con nombre.

## 4. Montaje y cámara
- Sección alta (300-500 vh) con escenario `sticky` (`overflow: clip` en los antepasados, no `hidden`) y progreso desde
  ScrollTrigger con `scrub` o cálculo propio (`pruebas/mapa-imagen/index.html` del repositorio).
- Paradas con `caja` (encuadra un rectángulo) o `x, y, zoom`; la primera con `cubrir: true` para que la ciudad llene la
  pantalla sin bandas.
- Para pasar de una zona a otra: `arco: 1` en la parada de llegada. A mitad de tramo la cámara se aleja hasta ver los dos
  sitios y vuelve a acercarse; es el momento de trazar una `ruta` y una etiqueta de distancia.
- `paradas` puede ser una función `({ ancho, alto }) => [...]` para encuadrar distinto en móvil vertical. En vertical, una
  caja 16:9 encuadrada entera deja bandas arriba y abajo en **cualquier** parada, no solo en la última: pon
  `cubrir: alto > ancho` en todas las que encuadren una caja apaisada.
- Textos de cada fase en HTML encima, con un velo degradado para que se lean sobre cualquier foto.
- Reduced-motion: el motor salta de parada en parada sin interpolar; los marcadores siguen saliendo.
