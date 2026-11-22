# Módulo: lugar y mapa

De la ciudad al edificio: mapa vivo (MapLibre con ortofoto y teselas abiertas) o mapa por niveles de imagen
(ilustrado o con estilo propio), con la cámara ligada al scroll y relevo a la foto del sitio.

## Se activa cuando
- **La ubicación vende**: inmobiliaria, promoción de obra nueva, hotel, resort, restaurante, tienda física, bodega.
- Hay que contar **un viaje** de un sitio a otro (ruta, distancia, entorno) o las paradas de un recorrido.
- La marca pide un **mapa con estilo propio** (ilustrado, de arcilla, de época).

## No hace falta cuando
- La dirección cabe en un bloque de contacto con un enlace al mapa: basta un mapa estático o un enlace.
- El negocio no tiene sitio físico que enseñar.

## Skills que se cargan
`mapa-zoom-ubicacion` (`mapa-scroll.js` con MapLibre, `mapa-imagen.js` para niveles de imagen; licencias y
atribuciones de los mapas en sus references). `find-docs` de MapLibre en la versión del proyecto.

## Técnicas
| Quiero… | Técnica | Skill |
|---|---|---|
| Enseñar dónde está (inmobiliaria, hotel, tienda): de la ciudad al edificio | Mapa vivo (MapLibre) o por niveles de imagen, cámara ligada al scroll + relevo a la foto | `mapa-zoom-ubicacion` |
| Mapa ilustrado o con estilo propio, o el viaje de un sitio a otro | Niveles de imagen (ortofoto estilizada con IA), marcadores y ruta por código | `mapa-zoom-ubicacion` (`mapa-imagen.js`) |

## Activos y coste
- Mapa vivo: teselas abiertas (0 $, con su atribución). Niveles de imagen: ortofoto abierta y, si se estiliza con
  IA, el coste va por el módulo Assets de IA.

## Construir
- Plantilla: `--con mapa` (vivo, `npm install maplibre-gl`) o `--con mapa-imagen` (niveles).

## Verificar (además de la base)
- Atribución del mapa visible; carga diferida (el mapa no es el LCP); en móvil el gesto de scroll no queda atrapado
  dentro del mapa.
- `verificar-scroll.mjs` con `--espera` mayor (las teselas tardan) y `--tramos` en la sección del mapa.
