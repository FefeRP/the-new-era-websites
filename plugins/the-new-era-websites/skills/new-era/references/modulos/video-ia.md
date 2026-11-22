# Módulo: vídeo con IA

Vídeo generado (Higgsfield y sus modelos: Seedance 2.5 y 2.0, Kling 3.0/O3/4.0, Veo 3.1, Wan…) para intros por scroll,
fondos en bucle, transiciones, productos que se transforman y procesos que se cuentan al bajar.

## Se activa cuando
- **La cámara viaja** por un sitio real o realista: entrar en el local, atravesar la bodega, del exterior al salón.
- **Algo cambia físicamente** y tiene que verse real: un líquido que cae, un producto que se abre o se despieza, un
  plato que se compone, una casa que se levanta.
- El relato es **un proceso**: cómo se hace, cómo se construye, de la materia prima al producto (plantilla 14, «la
  obra al revés», para constructoras, arquitectura, cosmética o cualquier objeto central).
- Hace falta un **fondo en movimiento** realista que una foto no da (agua, humo, gente, luz que cambia).
- El cliente tiene presupuesto para generar, o acepta ver las opciones de coste del paso 5.

## No hace falta cuando
- El momento puede estar **congelado**: un splash en el aire, el producto quieto, un marco. Foto con alfa y movimiento
  por código (módulo Assets de IA).
- Es **logo, texto, interfaz o precio**: siempre por código (o compuesto en la imagen final del vídeo).
- El visitante tiene que **girarlo a su gusto**: 3D real (módulo 3D y WebGL).
- Lo que se mueve se puede **dibujar por código** (formas, tipografía, shader): `video-desde-html` o un shader, a 0 $.

## Skills que se cargan
`video-ia-para-scroll` (y su mapa de lectura en `references/higgsfield-para-webs.md`) · `pedir-assets-ia` (medio de
cada elemento, presupuesto, plantillas de escenas realistas, «¿se nota falso?») · `seguir-pantalla` si hay una
pantalla o un cartel dentro del vídeo · `capas-alfa` si hay humo, chispas o polvo sobre negro que pasar a vídeo con
alfa · y siempre `scroll-frames` para montarlo (módulo Scroll inmersivo; si el vídeo
es solo un bucle de fondo con autoplay, basta la receta de `montaje-web.md`).

## Lo que hay dentro de `video-ia-para-scroll`
- `references/higgsfield-para-webs.md`: modelo y medio por pieza, checklist, primer y último fotograma sin saltos,
  lecciones de intros reales, precios.
- `references/arbol-decision.md`: ¿hace falta vídeo?, tipo de plano → modelo y precio, resolución, presupuestos por
  tipo de web.
- `references/modelos/`: una ficha por modelo (parámetros reales, precio medido, fallos, prompt de partida).
- `references/plantillas-prompt.md`: 14 plantillas por tipo de plano (intro, revelado de logo, bucle, transición,
  producto 360, giro, dolly, grúa, despiece, ingredientes, líquido, FPV, hero sutil, la obra al revés).
- `references/checklists.md` (antes de generar y al recibir), `references/flujos.md` (imagen clave, encadenar,
  extender, bucles, upscale, deflicker, marca sin deformar), `references/montaje-web.md` (GOP 8 sin B-frames, frames,
  móvil, póster, movimiento reducido), `references/modelos-y-camaras.md` (lente y FOV, dolly frente a zoom).
- `scripts/estimar-higgsfield.mjs` (precio gratis antes de generar) y `scripts/revisar-video.mjs` (cortes, saltos,
  tirones y avance real de la cámara).

## El método de Seedance 2.5 para webs
Lo que hace premium una web con vídeo IA es **una sola idea visual fuerte atada al scroll**, no el efecto:
1. Se diseña la web y se fija la imagen final (la que verá el visitante al acabar).
2. En Seedance 2.5, modo References, se sube esa imagen y se pide el proceso que lleva hasta ella; si es una
   construcción, **hacia atrás** («generate the entire construction process backwards») y luego se invierte.
3. Se monta con `scroll-frames` para que la reproducción siga al scroll del visitante.
Lo que el método no dice (duración, resolución, peso, móvil) lo resuelven el árbol de decisión, las checklists y
`montaje-web.md`. Plantilla completa: la 14 de `plantillas-prompt.md`.

## Técnicas
| Quiero… | Técnica | Skill |
|---|---|---|
| Que el producto gire / se abra / se transforme al hacer scroll, sin interacción | Vídeo → frames | `pedir-assets-ia` + `video-ia-para-scroll` + `scroll-frames` |
| Que la cámara entre en una escena real (un estudio, una tienda, una casa) y acabe en la pantalla con la web del cliente | Vídeo IA con imagen de inicio y fin → frames + la web real encima | `pedir-assets-ia` + `scroll-frames` + `seguir-pantalla` |
| Una intro en vídeo por scroll (entrar, atravesar, llegar a la marca), un fondo en bucle o una transición en vídeo con Higgsfield (Seedance, Kling, Veo) | Vídeo IA planificado entero antes de generar → medido → frames o vídeo recodificado | `video-ia-para-scroll` (lee **`references/higgsfield-para-webs.md`** y su mapa: `arbol-decision.md`, guía por modelo en `modelos/`, plantillas por plano, `checklists.md`, `montaje-web.md`, `revisar-video.mjs`) + `scroll-frames` |
| Contar cómo se hizo o se construyó (de lo terminado al proceso) | Seedance 2.5 References con la imagen final, al revés → frames | `video-ia-para-scroll` (plantilla 14) + `scroll-frames` |
| Fluidos que cambian, comida que se hace, tela que se mueve, paisajes con cámara | Vídeo (IA) → frames; nunca 3D en tiempo real | `video-ia-para-scroll` + `scroll-frames` |
| Contar el producto por dentro con imagen realista (se parte, capas, entrar dentro, horneado) | Tramos de vídeo IA encadenados → frames + HUD de datos | `video-ia-para-scroll` (receta "por dentro") + `scroll-frames` |
| Humo, chispas, polvo con luz sobre la página | Vídeo sobre negro → vídeo con alfa | `capas-alfa --modo negro` |

Catálogo: sección **B** (vídeo y secuencias de frames) de [../catalogo-tecnicas.md](../catalogo-tecnicas.md).

## Activos y coste
- Detalles de movimiento y trucos en `video-ia-para-scroll`. Con Higgsfield (intros, fondos, transiciones, marcos,
  cristal), antes de presupuestar lee su `references/higgsfield-para-webs.md`, decide con `arbol-decision.md`, estima
  gratis con `scripts/estimar-higgsfield.mjs` y pasa `checklists.md`: una toma, máximo dos fases, último fotograma
  solo si es alcanzable (si no, dos pasadas o lo exacto por código), encuadre abierto desde la imagen clave,
  estimación con tope y prueba a 480p.
- Imágenes clave (baratas) elegidas antes de ningún vídeo; la lente y el FOV se fijan en ellas.
- Pantallas, logos y textos dentro de la escena: nunca generados; por código con `seguir-pantalla`.
- **No generes nada de pago sin el vale de quien paga, con el precio estimado delante.**

## Construir
- Plantilla: `--con frames` (y `pantalla` si hay `seguir-pantalla`, `video` para el scrubber de vídeo, `alfa` si
  hay vídeo con alfa).
- El clip del generador **llega con un solo fotograma clave**: se recodifica siempre según `montaje-web.md` (escritorio
  GOP 8 sin B-frames; móvil recorte 9:16 y GOP 4) o se pasa a frames WebP con `extraer-frames.mjs`.

## Verificar (además de la base)
- Cada clip recibido pasa por `revisar-video.mjs` antes de montarlo: sin cortes, saltos ni tirones y con la cámara
  avanzando hasta el final.
- Póster del primer fotograma como LCP; móvil con su toma vertical o recorte; movimiento reducido con la imagen final.
- Aviso de contenido generado con IA si las escenas son realistas y la normativa del país lo pide.
