# Módulo: assets de IA (foto, alfa y capas)

Imagen propia que no existe todavía: fotos de producto en escenas nuevas desde las reales, piezas sueltas con alfa,
iconos de marca, texturas y fondos, capas con profundidad, la sombra como capa, lentes que miran dentro y envases que
giran sin 3D.

## Se activa cuando
- El cliente **no tiene la imagen que la idea necesita** (el producto en otra escena, el ingrediente en el aire, la
  fachada en capas, los iconos de sus servicios).
- La web pide **profundidad sin 3D**: el titular entre el fondo y el sujeto, elementos que flotan, parallax por capas,
  el producto que levita sobre su sombra.
- Hay que **mirar dentro o comparar**: rayos X, térmica, antes/después.
- Bebidas o envases cilíndricos con variantes: la lata que gira al cambiar de sabor.
- Cualquier web con fotos del cliente que haya que **tratar** (recortar, igualar la luz, sacar el alfa).

## No hace falta cuando
- El cliente tiene fotos buenas de todo y la idea se cuenta con ellas tal cual (se tratan con lo de la base: encuadre,
  revelados, tipografía encima).
- Lo que hace falta es movimiento real de cámara o de materia: módulo Vídeo con IA.

## Skills que se cargan
`pedir-assets-ia` (qué medio lleva cada elemento, presupuesto antes de generar, plantillas por plano, revisión «¿se nota
falso?») · `recursos-imagen-ia` (lotes de piezas, iconos, texturas, fondos) · `fotos-producto-ia` (el producto real en
otra escena) · `capas-alfa` (alfa sin Python, vídeo con alfa, texto entre capas) · `parallax-capas` (profundidad,
sombra como capa) · `lente-revelado` y `envase-giratorio` cuando toquen.

Por qué `lente-revelado` y `envase-giratorio` están aquí y no en 3D: funcionan con imágenes (dos alineadas, una
etiqueta plana) y dan la sensación de objeto sin three.js.

## Técnicas
| Quiero… | Técnica | Skill |
|---|---|---|
| Profundidad, "3D" barato, ingredientes o elementos flotando | Fotos aisladas con alfa + capas + parallax | `capas-alfa` + `parallax-capas` |
| El titular entre el fondo y el sujeto (el texto pasa por detrás del producto) | Capas con alfa y el texto en medio | `capas-alfa` (componer capas) |
| Splash o ingrediente quieto en el aire | Foto aislada con alfa (momento congelado) | `pedir-assets-ia` (`references/plantillas-por-plano.md`, §11) + `capas-alfa` |
| El producto "levita" sobre su sombra, o cambia de fondo sin perder la sombra | Capas con la sombra como capa propia | `parallax-capas` (sombras.md) |
| Fotos del producto real en escenas que no existen | Edición por referencia con IA + revisión | `fotos-producto-ia` |
| Que el visitante "mire dentro" con el cursor (rayos X, térmica) o compare antes/después | Dos imágenes alineadas + máscara | `lente-revelado` |
| Bebidas o envases cilíndricos con varios sabores: la lata gira al cambiar | Etiqueta plana enrollada en canvas + slider | `envase-giratorio` (+ `parallax-capas` para las frutas) |
| Los ingredientes o piezas de la marca flotando alrededor del producto | Lote de piezas con alfa, revisado junto | `recursos-imagen-ia` + `capas-alfa` + `parallax-capas` |
| Iconos propios de la marca (servicios, ventajas, pasos) | Lámina única generada, cortada y medida | `recursos-imagen-ia` (iconos) |
| Textura de papel, tela o metal de fondo; fondo con sitio para el titular | Textura medida para mosaico; fondo pedido con el hueco | `recursos-imagen-ia` |

Catálogo: sección **C** (profundidad 2.5D) de [../catalogo-tecnicas.md](../catalogo-tecnicas.md).

## Activos y coste
- **Sigue `pedir-assets-ia`**: guion de tramos → medio de cada asset (imagen IA, código, foto del cliente) →
  `presupuesto.mjs` con el presupuesto del usuario → la primera imagen aprobada antes del resto → revisión.
- Lotes de imagen (piezas con alfa, iconos, texturas, fondos): `recursos-imagen-ia`, con la primera imagen aprobada antes
  del resto y el lote revisado junto (`lote-imagenes.mjs`).
- Fotos de producto con IA (hero, imagen clave del vídeo, escenas): `fotos-producto-ia` (desde fotos reales, revisión
  contra la referencia, presupuesto).
- Recortes y transparencia: `capas-alfa` (`alfa.mjs`: pedir el elemento sobre fondo liso, negro o la pareja
  negro/blanco y sacar el alfa sin Python).
- Capas: `parallax-capas` (por separado, clean plate, o código). La sombra, como capa propia con `capas-sombra.mjs`.
- **No generes nada de pago sin el vale de quien paga, con el precio estimado delante.**

## Construir
- Plantilla: `--con alfa,capas` y, según toque, `lente`, `envase`.
- Las fotos con alfa se sirven en WebP/AVIF con su tamaño exacto; la imagen del hero lleva prioridad alta (LCP).

## Verificar (además de la base)
- Revisión «¿se nota falso?» de `pedir-assets-ia` en cada imagen generada, contrastada con la referencia real.
- Halos del alfa sobre fondos claros y oscuros; el parallax no deja ver los bordes de las capas en móvil.
- Licencia y origen de cada asset en la entrega.
