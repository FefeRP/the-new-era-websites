# Banco de pruebas de clips e imágenes de IA

Para probar generaciones de IA (vídeo e imagen) **donde van a vivir**: en una página con scroll, no en un reproductor.
Cada fichero que se descarga pasa solo por todo el camino: nombre, medidas, preparación para la web, demo con scroll,
capturas y una entrada en el registro con el modelo, el prompt, los ajustes y el resultado.

Sirve con cualquier proveedor: el banco no genera nada, solo recibe lo descargado.

## Piezas
- `procesar-clips.mjs`: las órdenes (ver abajo).
- `medir-clip.mjs`: medidas fotograma a fotograma pensadas para el scroll. También suelto:
  `node medir-clip.mjs clip.mp4 [--tipo bucle] [--json]` y `node medir-clip.mjs --costura a.mp4 b.mp4`.
- `demo/`: la página que monta cada pieza según su tipo, con los motores del plugin tal cual.
- `hacer-prueba.mjs`: prueba del banco con resultado conocido (entradas hechas por código).

## Carpeta de datos
Por defecto `./banco-clips` (o `--datos <carpeta>`; tiene que estar dentro del repo para que la demo la vea). No va al
repo: son tus clips y tus prompts.

```
entrada/       aquí caen las descargas
clips/         los originales, ya con nombre
referencias/   imágenes de inicio, de fin y de producto
procesado/<nombre>/   ficha.json, frames/, bucle, alfa/, hojas y capturas de la demo
procesado/index.html  comparador de todo lo procesado
bateria.json   las pruebas previstas (prompt, modelo, ajustes, variantes, cómo se evalúa)
cola.json      lo lanzado que aún no ha llegado
registro.md    una entrada por pieza, lo más reciente arriba (se rehace desde registro.json)
```

## Uso
```
node pruebas/clips-ia/procesar-clips.mjs iniciar
node pruebas/clips-ia/procesar-clips.mjs siguiente 3              # qué toca, con el prompt para copiar
node pruebas/clips-ia/procesar-clips.mjs lanzada giro-p01 kling30 --ajustes "720p · 5 s" --cambio "solo imagen de inicio"
#   …descargas el resultado a entrada/ (con el nombre que traiga)…
cd demos/reloj && node ../../pruebas/clips-ia/procesar-clips.mjs procesar --datos ../../banco-clips   # o --vigilar
node pruebas/clips-ia/procesar-clips.mjs nota giro-p01-kling30-v1 REGULAR "frena al final" --leccion "pedir el final en movimiento"
node pruebas/clips-ia/procesar-clips.mjs costura arco-p01-kling30-v1 zoom-p01-kling30-v1   # empalme entre dos clips
```
Las capturas necesitan `playwright-core` y Chrome: lanza `procesar` desde una carpeta que lo tenga (`demos/reloj`) o
usa `--sin-demo`.

**Nombres.** `<id>-<modelo>-v<N>.<ext>`, con `id = <pieza>-p<NN>`. Un fichero con otro nombre se asigna a la generación
más antigua apuntada con `lanzada` que siga pendiente (vídeo con vídeo, imagen con imagen): si generas de una en una, el
orden no falla.

## Qué hace con cada tipo
| `tipo` en la batería | Preparación | Demo |
|---|---|---|
| `scrub`, `transicion` | `extraer-frames.mjs` con tantos fotogramas como tiene de verdad el clip (sin remuestrear) + MP4 para buscar; primer y último fotograma en PNG (para encadenar) | canvas fijo ligado al scroll, tres textos encima, sección antes y después con el color del fondo del clip |
| `bucle`, `fondo` | MP4 para web; si la costura salta, además `bucle-fundido.mp4` (el final se funde 0,5 s sobre el principio) | héroe a pantalla completa con titular |
| `alfa-video` | `alfa.mjs` (croma o negro) → vídeo con alfa apilado | el vídeo sobre fondo claro, oscuro, de color y de cuadros |
| `imagen-alfa` | `alfa.mjs --recortar` (croma, blanco o alfa nativo; detecta el alfa "falso") | la pieza flotando a cuatro profundidades con un titular en medio |
| `imagen` | WebP; con `mosaico: true` mide si casa al repetirse | fondo con titular y zoom lento, o mosaico a dos tamaños |

Varias piezas de una misma prueba juntas (coherencia de un lote o de un juego de iconos):
`/pruebas/clips-ia/demo/?c=<id>&base=/<datos>/procesado/`.

## Qué mide `medir-clip.mjs`
| Medida | Qué delata |
|---|---|
| cortes | saltos de plano dentro del clip |
| repetidos (exactos y casi) y fps real | clip ralentizado o a menos fps de los que declara: el scroll va a escalones; de ahí sale cuántos fotogramas extraer |
| variación, perfil, arranque y final, tercios | el modelo frena al empezar o al acabar, o cambia de ritmo |
| nitidez mínima y fotogramas blandos | desenfoque de movimiento: al parar el scroll ahí se ve borroso |
| parpadeo y hervor | luz que oscila; textura que cambia de un fotograma a otro sin moverse |
| color inicial y deriva del fondo, deriva de luz | fondo que no casa con la sección, croma que no es liso |
| costura de bucle; `--costura a b` | salto al repetir; salto y cambio de nitidez al encadenar dos clips |

**Límite.** La velocidad se mide por lo que cambia la imagen, no por el ángulo real de la cámara: un objeto de canto
cambia menos que de frente. Por eso el arranque y el final se comparan con el tramo de al lado, no con el centro. Los
umbrales salen de un render y de fallos sembrados; hay que reajustarlos con los primeros clips reales de cada modelo.

## Prueba
```
cd demos/reloj && node ../../pruebas/clips-ia/hacer-prueba.mjs
```
Fabrica seis entradas (giro limpio que llega sin nombre, el mismo a 12 fps reales, bucle que salta, disco sobre croma,
pieza sobre croma, textura que no casa), las procesa y comprueba 21 cosas: asignación por la cola, medidas, salidas,
registro y demos capturadas sin errores. Lo generado queda en `prueba/` (fuera del repo).
