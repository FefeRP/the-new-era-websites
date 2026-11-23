# ref22, ref23 y ref24 · Tres capturas fijas

Tres imágenes WebP (capturas de webs o de maquetas). Análisis a mano el 23-11-2026; sin movimiento, solo composición.

## ref22 · Tres latas en abanico (@deis.motion)
- Tres latas de bebida en abanico, frutas flotando alrededor, título condensado en cursiva y fondo en degradado.
- Ya estaba en la base: **ingredientes flotando** (catálogo C) y `envase-giratorio`. Se añade como referencia de esas
  filas; no hay patrón nuevo.

## ref23 · Fotos en órbita alrededor del titular (barbería)
- Un anillo o esfera de fotos de cortes alrededor del titular («El corte que te define»), partículas y un botón «Ver
  en cuadrícula».
- Lo que se saca: el **cambio de vista anillo ↔ cuadrícula** (catálogo G): `carrusel-orbital.js` para el anillo y
  View Transitions (un `view-transition-name` por foto) o GSAP Flip para que cada foto viaje a su celda. La
  cuadrícula es la vista accesible y la de móvil y movimiento reducido.

## ref24 · Hamburguesa en escenario (carta)
- Fondo oscuro, foco cenital en cono sobre la hamburguesa, reflejo en el suelo, el nombre en letras de contorno
  gigantes detrás, las vecinas pequeñas y desenfocadas a los lados; ficha a la izquierda (categoría, 02/03, nombre en
  serif, descripción, precio, flechas) y «Toda la carta».
- Contrastado con Gemini (flash-lite), que coincide en todo esto. Añade que el cambio es probablemente un
  desplazamiento con escala y fundido de 0,5-0,7 s; que las fotos parecen reales y no de IA; y que las flechas están
  demasiado pegadas al borde inferior.
- Lo que se saca: **producto en escenario** (catálogo J; código en `recetas-producto-y-servicio.md`, receta 3) y la
  misma pasarela de ref17-18 en versión oscura (aquí sí hace falta alfa: `capas-alfa`).
