# Módulo: 3D y WebGL

three.js con glTF, escenas de Spline, shaders, partículas y fondos vivos dibujados en la GPU.

## Se activa cuando
- El visitante tiene que **girar, configurar o tocar** el objeto (configurador, producto que se gira a mano, maqueta
  que se recorre).
- El mismo objeto 3D **vuelve en varias secciones** y cambia (cámara que lo rodea, piezas que se separan, material que
  cambia con el relato).
- La idea es **abstracta o de materia**: luz, ondas, partículas que forman figuras, distorsiones, portales, un fondo
  vivo que persiste toda la web y cambia con el scroll. Por código cuesta 0 en generación y da una imagen que no tiene
  nadie más.
- El cliente **ya tiene un modelo 3D** (CAD, glTF, USDZ) o una escena de Spline.
- Marca tecnológica, de producto digital o de diseño que se vende con una escena viva.

## No hace falta cuando
- Lo que se quiere enseñar es realista y nadie lo toca: un producto que gira solo, una casa, un plato. Eso sale mejor
  como **foto o vídeo IA** (módulos Assets de IA y Vídeo con IA) y pesa menos.
- El objeto es un envase cilíndrico con variantes: `envase-giratorio` (módulo Assets de IA) lo hace sin three.js.
- Solo se busca «profundidad»: capas con alfa y parallax (`parallax-capas`) la dan sin GPU.

## Skills que se cargan
`escena-3d-gltf` · `webgl-animation-skills:shader-glsl`, `webgl-animation-skills:threejs-animation`,
`webgl-animation-skills:particle-system` (las que toquen) · `gsap-skills:gsap-scrolltrigger` y
`gsap-skills:gsap-timeline` (cámara y escenas ligadas al scroll) · `biblioteca-componentes` solo por sus recetas
`spline/*` si la escena viene de Spline. Antes de escribir código propio con three.js, `find-docs` en la versión
del `package.json` (regla 6).

## Técnicas
| Quiero… | Técnica | Skill |
|---|---|---|
| Que el visitante gire/configure el objeto, o 3D en varias secciones | 3D real glTF | `escena-3d-gltf` |
| Un fondo vivo que persiste toda la web y cambia con el relato (luz, materia, ondas, un objeto dibujado por código) | Canvas fijo a pantalla completa con shader o 2D, con el avance del scroll como parámetro | `webgl-animation-skills:shader-glsl` + catálogo (E) |
| Escena 3D hecha en Spline (hero, objeto que sigue al ratón, configurador ligero) | Escena exportada + runtime de Spline con carga diferida | `biblioteca-componentes` (recetas `spline/*`) |
| Partículas que forman figuras, distorsiones, portales | Shaders/GPGPU | catálogo (E) + `webgl-animation-skills` |
| Gama de envases con giro libre en varios ejes (carrusel orbital → foco → line-up) | 3D real | `escena-3d-gltf` (si el giro es solo sobre su eje: `envase-giratorio`) |

Catálogo: secciones **D** (3D real) y **E** (shaders y GPU) de [../catalogo-tecnicas.md](../catalogo-tecnicas.md).

## Activos y coste
- Modelos 3D: `escena-3d-gltf` (licencia, limpieza y optimización con gltf-transform: Meshopt/Draco, texturas WebP/KTX2, versión móvil).
- Libres y con créditos: Poly Haven, Khronos glTF Sample Models; lo del cliente, con su permiso.
- Lo realista dentro de la escena (fotos, fondos) sale de los módulos de imagen, no se modela.

## Construir
- Plantilla: `node scripts/nueva-web.mjs <carpeta> --con 3d …` y `npm install three`.
- La escena se crea al acercarse (IntersectionObserver), se pausa fuera de vista y devuelve `destruir()`.
- Un único bucle de animación con Lenis + GSAP; nada de un `requestAnimationFrame` por escena.

## Verificar (además de la base)
- El 3D nunca es el LCP: póster `<img>` en su sitio y el canvas encima al estar listo.
- **Móvil**: póster o versión ligera en el pico (sin escena pesada en 360 px), fps estable y sin calentar.
- Sin GPU (con `--use-angle=swiftshader`) la página carga y se ve el póster: nunca un hueco negro.
- `prefers-reduced-motion`: la escena queda quieta en su mejor encuadre.
- Peso del modelo y de las texturas dentro del presupuesto de [../base-tecnica.md](../base-tecnica.md).
- `animation-performance` y, si hay revisor de movimiento, `impeccable-motion-reviewer`.
