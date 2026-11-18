---
name: new-era
description: Skill maestra del marketplace the-new-era-websites para construir o mejorar webs con carácter propio en cualquier estilo (inmersiva, cinematográfica, editorial, corporativa, minimal, juguetona…) y sin resultados genéricos - palabra clave de activación "NEW ERA" o /new-era (siguen valiendo "WEB PREMIUM" y /web-premium, el nombre anterior). Entiende el pedido, elige una dirección de estilo y una intensidad según el cliente (con varias direcciones distintas donde elegir), obliga a cargar con la herramienta Skill las skills de diseño instaladas en cada fase (dirección, componentes, movimiento, código, revisión), consulta la documentación actual de cada librería en la versión del proyecto con find-docs (Next.js, React, Tailwind, GSAP, three.js…) y sigue Modern Web Guidance en las decisiones de plataforma (Core Web Vitals, imágenes, fuentes, accesibilidad, View Transitions, CSS moderno), define la idea propia y el hilo conductor de la web, elige y combina técnicas (scroll con vídeo en frames, capas con alfa y profundidad, revelados y transiciones, recursos de imagen con IA, componentes, 3D real con glTF, shaders, mapa que baja hasta el edificio, lente de rayos X, envase que gira sin 3D), planifica los activos y su coste, monta la web con la plantilla base (Vite + GSAP + Lenis), la verifica con capturas y la pasa por una revisión independiente en rondas antes de darla por terminada. Úsala SIEMPRE que el pedido diga "NEW ERA", "new era website", "WEB PREMIUM", "web premium", "web inmersiva", "web de las que parecen imposibles", "web con 3D y scroll", "web tipo Apple/Awwwards", "web cinematográfica", "landing con efectos", "hazme la web de", "mejora esta web", "que no parezca genérica", "premium website", "immersive website", "awwwards style site", "cinematic scroll website", "3D scrolling website", "build a website with scroll effects".
license: MIT
version: 1.0.0-beta.10
---

# NEW ERA: de un pedido a una web con carácter propio

Esta skill **dirige**: elige la dirección, decide qué hacer y en qué orden, y delega el *cómo*. Sirve para cualquier
estilo; lo único que no puede salir de aquí es una web **genérica**: la que valdría para otro negocio cambiando el logo.

## Seis reglas que no se saltan
1. **Se elige dirección antes de construir** (paso 2). Una web sale genérica cuando nadie decide: secciones correctas,
   tipografía neutra, tarjetas, entradas suaves y un efecto suelto. Estilo e intensidad se eligen según el cliente y quedan
   escritos.
2. **Las skills se cargan, no se recuerdan.** En cada fase se invocan con la herramienta `Skill` las skills de la tabla de
   abajo que estén instaladas. «Aplicar lo que ya sé de esa skill» no cuenta: sus instrucciones cambian y es lo que separa
   un resultado con oficio de uno del montón. Cada carga se apunta en `BRIEF.md` (sección «Skills cargadas») en el momento.
3. **Toda web lleva una idea propia y una firma** (paso 3), sea cual sea la intensidad. Si el pedido llega como NEW ERA,
   «inmersiva», «3D» o «que impresione», la intensidad por defecto es la **alta**: la web es un recorrido, no una lista de
   secciones. Contenida solo si el pedido lo dice.
4. **No se entrega sin revisión independiente** (paso 7): capturas, crítica con la skill de diseño y un revisor que no ha
   construido la web. Pasar las comprobaciones técnicas (sin errores, buen rendimiento) es el mínimo, no el final.
5. **No se cierra pronto.** Mientras el revisor encuentre mejoras claras y quede tiempo o presupuesto del encargo, se hace
   otra ronda. Terminar con la mitad del tiempo sin usar y mejoras a la vista es un encargo a medias.
6. **El código se escribe contra la documentación actual, no de memoria.** Antes de usar o cambiar la API de una librería
   (Next.js, React, Tailwind, GSAP, three.js, Prisma…) se consulta con `find-docs` en la versión exacta del proyecto, y
   antes de cada decisión de plataforma (rendimiento, imágenes, fuentes, accesibilidad, transiciones, CSS moderno) se
   sigue `modern-web-guidance`. Cada consulta se apunta en `BRIEF.md` («Documentación consultada»). Protocolo en
   [references/codigo-y-plataforma.md](references/codigo-y-plataforma.md).

## Skills que se cargan en cada fase (obligatorio si están instaladas)
Mira la lista de skills disponibles en la sesión, no supongas. Las de este marketplace van siempre; de las demás, las que
existan. Si falta alguna, se sigue con los mínimos de [references/direccion.md](references/direccion.md) y se dice en la
entrega.

| Fase | Se cargan con `Skill` | Qué sale de ahí |
|---|---|---|
| **Dirección** (paso 2) | `frontend-design:frontend-design` (dirección estética) · `impeccable:impeccable` (`shape`, y `init`/`document` para `DESIGN.md`) · `ui-ux-pro-max:ui-ux-pro-max` (paletas y pares de fuentes por sector) | Dirección elegida, tipografía, paleta y tokens en `DESIGN.md` |
| **Componentes** (pasos 4 y 6) | `biblioteca-componentes` (catálogo: buscar antes de escribir) · `componentes-interactivos` · `emil-design-eng` (detalle de cada pieza) | Piezas adaptadas a la marca, no de catálogo tal cual |
| **Movimiento** (pasos 4 y 6) | Las skills de técnica de este marketplace que toquen · `gsap-skills:gsap-scrolltrigger` y `gsap-skills:gsap-timeline` (líneas de tiempo a medida) · `webgl-animation-skills:shader-glsl` / `threejs-animation` / `particle-system` (si hay canvas) · `animate` y `apple-design` (microinteracciones, gestos, muelles) | Escenas, transiciones y estados con intención |
| **Código** (pasos 1, 4, 6 y 7) | `find-docs` (API de cada librería en la versión del `package.json`) · `modern-web-guidance:modern-web-guidance` (plataforma: Core Web Vitals, imágenes, fuentes, accesibilidad, View Transitions, CSS moderno, formularios, PWA) | Código que funciona con la versión instalada y decisiones de plataforma con su guía, apuntadas en `BRIEF.md` |
| **Revisión** (paso 7) | `impeccable:impeccable` (`critique`, `audit`, `polish`) · `animation-performance` · `mobile-native` · `break-ui` · el agente revisor `impeccable-finish-reviewer` (y `impeccable-motion-reviewer` si hay movimiento) | Lista ordenada de arreglos, aplicada por rondas |

Quién manda cuando dos skills opinan distinto: [references/reparto-skills-diseno.md](references/reparto-skills-diseno.md).

## Técnica y activos (lo que vive aquí)
| Sección | Skills |
|---|---|
| Dirección de activos y coste | `pedir-assets-ia` (qué medio lleva cada elemento, presupuesto antes de generar, prompts por plano, revisión «¿se nota falso?») |
| Recursos de imagen con IA | `recursos-imagen-ia` (piezas sueltas con alfa, iconos de marca, texturas, fondos, variantes de un objeto; revisión del lote) · `fotos-producto-ia` (el producto real en otra escena) |
| Transparencia y capas | `capas-alfa` (alfa sin Python, vídeo con alfa en todos los navegadores, texto entre capas) · `parallax-capas` (profundidad sin 3D, sombra como capa) |
| Scroll con vídeo | `video-ia-para-scroll` (cómo pedirlo) · `scroll-frames` (frames ligados al scroll) · `seguir-pantalla` (la web o el logo reales sobre una pantalla del vídeo) |
| Revelados y transiciones | `revelados-y-transiciones` (rejilla, cortina, zoom 2D, titulares por líneas, View Transitions) · `rastro-cursor` · `lente-revelado` (rayos X, antes/después) |
| Componentes | `componentes-interactivos` (tarjeta con volteo y capas, carrusel en órbita o anillo 3D, reseñas en columnas 3D) · `biblioteca-componentes` (catálogo propio de componentes UI con licencia y prompt, para adaptar; recetas de Spline) |
| 3D y producto | `escena-3d-gltf` (three.js con glTF) · `envase-giratorio` (lata o bote que gira sin 3D) |
| Mapas | `mapa-zoom-ubicacion` (de la ciudad al edificio: mapa vivo o por niveles de imagen) |
| Vídeo por código | `video-desde-html` (HyperFrames: el hero o un tramo de scroll a vídeo para redes; bucles sin corte, capas con alfa y secuencias para scroll sin modelo de IA) |
| Oficio | [references/reglas-de-webs-reales.md](references/reglas-de-webs-reales.md): lo aprendido en webs entregadas |

**Nunca por plantillas** («plantilla de heladería»): direcciones y técnicas que se combinan según el negocio, la historia y
el presupuesto.

**Lo realista sale de la IA, no del 3D, y no todo es vídeo.** Lo que está quieto es **foto** (aislada, con alfa o en capas)
y lo mueve el código; **vídeo IA** solo donde la cámara viaja o algo cambia físicamente; **frames** para el scrub. El 3D en
tiempo real es para lo que el vídeo no sabe hacer (girar libre, configurar, tocar) y los **shaders y el canvas por código**
para lo abstracto (luz, materia, ondas, partículas): cuestan 0 en generación y dan una imagen que no tiene nadie más. Logos,
pantallas y textos, siempre por código. La tabla por elemento está en `pedir-assets-ia` (matriz-medio-por-elemento.md).

## Paso 1 · Entender el pedido (brief)
Saca del pedido (y pregunta **solo** lo que falte y cambie la decisión, en una tanda):
1. **Negocio y protagonista**: qué se vende y cuál es *el objeto*, el lugar o la idea estrella.
2. **Objetivo**: la acción que debe hacer el visitante (comprar, reservar, contactar) → el CTA.
3. **Activos disponibles**: fotos, vídeo, modelo 3D, logo, textos. Si no hay: qué se genera con IA (cuesta dinero →
   presupuesto y vale) y qué se hace por código.
4. **Destino técnico**: HTML estático (Vite, por defecto) o React/Next u otro CMS. Si el proyecto ya existe, lee su
   `package.json` y apunta las versiones exactas (next, react, tailwindcss, gsap, three…) y, en Next.js, si es App Router o
   Pages Router: de ahí sale qué documentación se consulta (regla 6).
5. **Público y dispositivos**: si es sobre todo móvil (comercio local: casi siempre), manda el móvil.
6. **Marca**: colores, tipografía, tono, y si existe `DESIGN.md` o `PRODUCT.md` (se leen y se respetan). Busca primero el
   logo y los colores en el propio proyecto antes de pedirlos.
7. **Qué es verdad**: reseñas, cifras y datos que se pueden enseñar. Lo que no esté comprobado no se pone (se lista como
   «por confirmar»).
8. **Tiempo y alcance del encargo**: cuánto hay. Marca el número de rondas de mejora (regla 5).
9. **Si es una mejora de una web que ya existe**: capturas del estado actual y qué se rechazó de ella. Ver «Mejoras».

Escribe el brief en `BRIEF.md` del proyecto: un brief propio de esta web y de este encargo (no vale reutilizar un documento
comercial anterior), con las secciones de la plantilla de [references/direccion.md](references/direccion.md).

## Paso 2 · Dirección de estilo (obligatorio)
Lee [references/direcciones-de-estilo.md](references/direcciones-de-estilo.md) y carga las skills de la fase **Dirección**.
1. **Lee al cliente** y decide los dos ejes: **estilo** (cinematográfica, producto protagonista, lugar y recorrido,
   editorial, corporativa de precisión, minimal de galería, juguetona, artesana, cruda y tipográfica, técnica…) e
   **intensidad** (3 inmersiva · 2 con escenas · 1 contenida).
2. **Tablero de referencias**: 5-8 webs reales y variadas del nivel que se busca, capturadas. Fijan el listón, no el
   diseño: no se copia ninguna y no se usa siempre la misma.
3. **Dos o tres direcciones distintas de verdad** para este cliente (cambian tipografía, paleta, primera pantalla y técnica
   estrella). En encargos de peso, con capturas antes de construir; si no, por escrito. Se elige una y se anota por qué.
4. **Sistema**: tipografía (display con carácter + texto, con un salto de escala grande), paleta, retícula, radios y
   movimiento, decididos con la skill de diseño y escritos en `DESIGN.md`. Sin `DESIGN.md` no se pasa al paso 3.
5. **Que no se repita**: si hay otras webs del mismo proyecto o cartera, cambia al menos tipografía, paleta y técnica
   estrella respecto a ellas.

## Paso 3 · Idea, hilo conductor y recorrido
De [references/direccion.md](references/direccion.md) lee el guion y las reglas de dirección, y de
[references/reglas-de-webs-reales.md](references/reglas-de-webs-reales.md), §1-§3. Decide y escribe en el brief:
- **La idea** en una frase: la metáfora o el relato que ordena la web y solo sirve para este negocio (la web es una noche
  de club, de la primera hora al amanecer; la web baja del mapa a la puerta de la casa; la web desmonta el producto pieza a
  pieza). Sin idea solo hay secciones.
- **El hilo conductor**: algo que persiste y se transforma de principio a fin (un objeto, una cámara, una línea, una luz,
  un reloj, un color que cambia con el relato). En intensidad 3 es obligatorio.
- **El momento estrella**: la escena que la gente recordará. Intensidad 3: uno principal y 1-2 escenas más; intensidad 2:
  uno; intensidad 1: no hay escena fijada, pero sí una **firma** (la pieza que solo tiene esta web).
- **Algo que tocar**: una interacción con sentido para el negocio (arrastrar, girar, elegir y que la escena responda).
- **El recorrido** en 5-8 secciones: primera pantalla que ya es la idea → momento estrella → apoyo (detalle, prueba,
  oferta) → cierre con CTA. Cada sección cambia algo respecto a la anterior (fondo, composición, escala o técnica).
- **Ritmo, no contención**: alterna tensión y respiro. Lo que se evita es el ruido (efectos que no cuentan nada), no la
  intensidad.

## Paso 4 · Elegir técnicas
Usa la matriz de [references/catalogo-tecnicas.md](references/catalogo-tecnicas.md) y carga la skill de cada técnica
elegida (fase **Movimiento** y **Componentes**). Regla rápida:
| Quiero… | Técnica | Skill |
|---|---|---|
| Que el producto gire / se abra / se transforme al hacer scroll, sin interacción | Vídeo → frames | `pedir-assets-ia` + `video-ia-para-scroll` + `scroll-frames` |
| Que la cámara entre en una escena real (un estudio, una tienda, una casa) y acabe en la pantalla con la web del cliente | Vídeo IA con imagen de inicio y fin → frames + la web real encima | `pedir-assets-ia` + `scroll-frames` + `seguir-pantalla` |
| Profundidad, "3D" barato, ingredientes o elementos flotando | Fotos aisladas con alfa + capas + parallax | `capas-alfa` + `parallax-capas` |
| El titular entre el fondo y el sujeto (el texto pasa por detrás del producto) | Capas con alfa y el texto en medio | `capas-alfa` (componer capas) |
| Que el visitante gire/configure el objeto, o 3D en varias secciones | 3D real glTF | `escena-3d-gltf` |
| Un fondo vivo que persiste toda la web y cambia con el relato (luz, materia, ondas, un objeto dibujado por código) | Canvas fijo a pantalla completa con shader o 2D, con el avance del scroll como parámetro | `webgl-animation-skills:shader-glsl` + catálogo (E) |
| Tipografía como imagen (titulares de 12-36 vw, letras que se ensanchan o engordan al bajar) | Fuente variable (ejes de ancho y peso) ligada al scroll | catálogo (F) + `revelados-y-transiciones` |
| Una barra o un indicador que acompaña todo el recorrido (capítulo, progreso, reloj, plano) | Elemento fijo que lee el avance del scroll | plantilla + `gsap-skills:gsap-scrolltrigger` |
| Sonido de ambiente o de respuesta | Audio generado o cargado, **apagado por defecto** y con botón visible | catálogo (H) |
| Splash o ingrediente quieto en el aire | Foto aislada con alfa (momento congelado) | `pedir-assets-ia` (§11) + `capas-alfa` |
| Humo, chispas, polvo con luz sobre la página | Vídeo sobre negro → vídeo con alfa | `capas-alfa --modo negro` |
| Fluidos que cambian, comida que se hace, tela que se mueve, paisajes con cámara | Vídeo (IA) → frames; nunca 3D en tiempo real | `scroll-frames` |
| Una foto que se descubre (rejilla, máscara) o una cortina que cambia de escena | Revelados por código | `revelados-y-transiciones` |
| Acercarse a un producto dentro de una imagen grande (estantería, plano, cartel) | Zoom 2D a un punto con relevo a una foto de detalle | `revelados-y-transiciones` (`crearZoomA`) |
| Fotos que aparecen al mover el ratón | Rastro de imágenes | `rastro-cursor` |
| El producto "levita" sobre su sombra, o cambia de fondo sin perder la sombra | Capas con la sombra como capa propia | `parallax-capas` (sombras.md) |
| Fotos del producto real en escenas que no existen | Edición por referencia con IA + revisión | `fotos-producto-ia` |
| Enseñar dónde está (inmobiliaria, hotel, tienda): de la ciudad al edificio | Mapa vivo (MapLibre) o por niveles de imagen, cámara ligada al scroll + relevo a la foto | `mapa-zoom-ubicacion` |
| Mapa ilustrado o con estilo propio, o el viaje de un sitio a otro | Niveles de imagen (ortofoto estilizada con IA), marcadores y ruta por código | `mapa-zoom-ubicacion` (`mapa-imagen.js`) |
| Contar el producto por dentro con imagen realista (se parte, capas, entrar dentro, horneado) | Tramos de vídeo IA encadenados → frames + HUD de datos | `video-ia-para-scroll` (receta "por dentro") + `scroll-frames` |
| Que el visitante "mire dentro" con el cursor (rayos X, térmica) o compare antes/después | Dos imágenes alineadas + máscara | `lente-revelado` |
| Bebidas o envases cilíndricos con varios sabores: la lata gira al cambiar | Etiqueta plana enrollada en canvas + slider | `envase-giratorio` (+ `parallax-capas` para las frutas) |
| Los ingredientes o piezas de la marca flotando alrededor del producto | Lote de piezas con alfa, revisado junto | `recursos-imagen-ia` + `capas-alfa` + `parallax-capas` |
| Iconos propios de la marca (servicios, ventajas, pasos) | Lámina única generada, cortada y medida | `recursos-imagen-ia` (iconos) |
| Textura de papel, tela o metal de fondo; fondo con sitio para el titular | Textura medida para mosaico; fondo pedido con el hueco | `recursos-imagen-ia` |
| Fichas con más datos por detrás (inmuebles, productos, equipo) | Tarjeta con volteo y capas en profundidad | `componentes-interactivos` (`tarjeta-volteo.js`) |
| Destacados que giran alrededor de un centro, o un anillo que gira al bajar | Carrusel en órbita o anillo 3D | `componentes-interactivos` (`carrusel-orbital.js`) |
| Prueba social con movimiento (con reseñas reales) | Muro de reseñas en columnas 3D | `componentes-interactivos` (`resenas-3d.js`) |
| Botones, menús, modales, avisos, estados de hover | Microinteracciones | skill de animación instalada (`animate`, `emil-design-eng`) |
| Una pieza de interfaz que ya existe en algún catálogo (fondo animado, texto que se escribe, marquesina de logos, botón con brillo, bento, hero con efecto) | Componente del catálogo propio, adaptado (nunca tal cual) | `biblioteca-componentes` |
| Escena 3D hecha en Spline (hero, objeto que sigue al ratón, configurador ligero) | Escena exportada + runtime de Spline con carga diferida | `biblioteca-componentes` (recetas `spline/*`) |
| Textos con presencia | Titulares que suben por líneas, máscaras, texto entre capas | `revelados-y-transiciones` (`crearLineas`) + `capas-alfa` |
| Un vídeo de la web para redes o el portfolio (el hero, el momento estrella en vertical) | Composición HTML renderizada fotograma a fotograma | `video-desde-html` |
| Fondo en movimiento o secuencia de scroll que se puede dibujar por código (formas, tipografía, shader, 3D) | Bucle sin corte o secuencia renderizada, sin modelo de IA | `video-desde-html` → `scroll-frames` / `capas-alfa` |
| Partículas que forman figuras, distorsiones, portales | Shaders/GPGPU | catálogo (E) + `webgl-animation-skills` |

**Cuánto según la intensidad** (mínimos; anota la decisión y el porqué en `BRIEF.md`):
- **3 · Inmersiva**: 1 técnica fuerte en la primera pantalla o justo después + 2 de apoyo + el hilo conductor +
  transiciones entre secciones + una interacción que se toca. Usa los motores de este marketplace antes de escribir uno
  propio a medias.
- **2 · Con escenas**: 1 técnica fuerte + 1-2 de apoyo.
- **1 · Contenida**: la firma (una pieza propia) + componentes adaptados + microinteracciones cuidadas.

## Paso 5 · Plan de activos (y su coste)
Lista cada activo: qué es, de dónde sale (cliente / libre / IA / código), formato y peso objetivo. **El presupuesto se
presenta siempre**, con dos o tres opciones (por código y libres a 0 · imágenes clave · con vídeo), aunque se acabe
eligiendo la de 0: decidir «cero» sin enseñar lo que se pierde es una de las causas de las webs planas.
- **Sigue `pedir-assets-ia`**: guion de tramos → medio de cada asset (vídeo IA, imagen IA, código, 3D) → `presupuesto.mjs` con el
  presupuesto del usuario → imágenes clave (baratas) elegidas antes de ningún vídeo → prueba corta → finales → revisión.
  **No generes nada de pago sin el vale de quien paga, con el precio estimado delante.**
- Con presupuesto 0 también hay imagen propia: canvas y shaders por código, SVG, tipografía como imagen, render con
  three.js, fotos del cliente bien tratadas, activos libres (Poly Haven, Khronos). Lo que no vale es dejar la web sin imagen.
- Vídeo con IA: detalles de movimiento y trucos en `video-ia-para-scroll`.
- Pantallas, logos y textos dentro de la escena: nunca generados; por código con `seguir-pantalla`.
- Modelos 3D: `escena-3d-gltf` (licencia, limpieza, optimización).
- Lotes de imagen (piezas con alfa, iconos, texturas, fondos): `recursos-imagen-ia`, con la primera imagen aprobada antes del resto y el lote revisado junto (`lote-imagenes.mjs`).
- Fotos de producto con IA (hero, imagen clave del vídeo, escenas): `fotos-producto-ia` (desde fotos reales, revisión contra la referencia, presupuesto).
- Recortes y transparencia: `capas-alfa` (`alfa.mjs`: pedir el elemento sobre fondo liso, negro o la pareja negro/blanco y sacar el alfa sin Python).
- Capas: `parallax-capas` (por separado, clean plate, o código). La sombra, como capa propia con `capas-sombra.mjs`.

## Paso 6 · Construir
```bash
node scripts/nueva-web.mjs <carpeta> --con frames,pantalla,video,alfa,capas,revelados,rastro,3d,mapa,mapa-imagen,lente,envase,componentes --titulo "…" --marca "…" --fondo "#…" --texto "#…" --acento "#…"
cd <carpeta> && npm install [three] [maplibre-gl] && npm i -D playwright-core && npm run dev
```
En `--con` también valen `tarjeta`, `carrusel` y `resenas` por separado (`componentes` copia los tres). Más opciones:
`--fuente`, `--fuente-display`, `--descripcion`.
La plantilla trae Lenis + GSAP ScrollTrigger en un único bucle, reduced-motion, tokens de diseño, enlace "saltar al contenido".
Cada técnica en su fichero `src/secciones/<seccion>.js` (la carpeta `src/secciones/` se crea: la plantilla no la trae), con la maqueta y el código de las references de su skill.
**Orden**: todo el HTML y el texto real (la página debe tener sentido sin JS) → sistema de `DESIGN.md` y móvil → la
**primera pantalla y el momento estrella primero** (son lo que decide; si no convencen, se rehacen antes de seguir) → el
hilo conductor y las transiciones → resto de secciones y componentes, uno a uno → microinteracciones con la skill de
animación.
Para cada pieza de interfaz, busca antes en el catálogo (`biblioteca-componentes`) y adapta lo que encaje con su tabla de
cambios; lo que el catálogo no tenga con la pila del proyecto, se rehace con la idea.
**Antes de escribir código** (regla 6; se carga la fase **Código**):
- Cada API de librería que se escribe o se cambia, consultada antes con `find-docs` en la versión del proyecto (en
  Next.js: metadata, `next/image`, `next/font`, componente de servidor o de cliente y dónde se monta un motor que usa
  `window`, configuración). Los motores de este marketplace no hace falta consultarlos; la librería que usan por dentro
  (GSAP, three.js, MapLibre), sí cuando se escribe código propio con ella.
- Cada decisión de plataforma, con su guía de `modern-web-guidance` antes de escribirla: imagen o póster de la primera
  pantalla (LCP), fuentes, medios diferidos, CLS de las escenas fijadas, INP de lo que se toca, transiciones entre páginas,
  diálogos, menús, formularios, accesibilidad.
- Se apunta en `BRIEF.md` («Documentación consultada») según se consulta.

Si el proyecto ya existe (React, Next, Astro…), no se usa la plantilla: se copian los motores a su carpeta de librerías y se
montan dentro de sus componentes (todos devuelven `destruir()` para el desmontaje).

## Paso 7 · Verificar y revisar por rondas (antes de enseñar nada)
**A. Que funciona**
1. `node scripts/verificar-scroll.mjs http://127.0.0.1:5173 capturas/` → capturas en 8 posiciones (escritorio y móvil) + pasada con reduced-motion + errores de consola + peticiones fallidas + hojas de contactos. Debe salir sin errores.
2. Mira las hojas: sin huecos en blanco, textos legibles sobre el fondo en todas las posiciones, el momento estrella se ve en móvil.
3. Tamaños de móvil que fallan: 390×844, 360×740 y apaisados 844×390 y 932×430. Sin desplazamiento lateral.
4. `npm run build` sin errores; peso total dentro del presupuesto ([references/base-tecnica.md](references/base-tecnica.md)) y su checklist final. El rendimiento es una condición, no el objetivo: si para ganar fps hay que quitar la escena, primero se
   optimiza la escena (anima `transform` y `opacity`; `clip-path` y `filter` animados en cada fotograma doblan el coste).
5. **Código al día**: cada API de librería del código nuevo tiene su consulta de `find-docs` y cada decisión de
   plataforma su guía de `modern-web-guidance`, revisada contra lo escrito (prioridad de la imagen principal, tamaños,
   alternativas para lo que no es Baseline). En Next.js, `next build` sin avisos de API obsoleta. Lo que falte se consulta
   ahora y se corrige.

**B. Que tiene nivel** (con la página ya sin errores)
6. **Prueba del genérico** de [references/direcciones-de-estilo.md](references/direcciones-de-estilo.md) (§5), respondida
   por escrito con las capturas delante y al lado del tablero de referencias del paso 2.
7. **Crítica con la skill de diseño** cargada con `Skill` (p. ej. `impeccable`: `critique`, `audit`, `polish`).
8. **Revisor independiente**: lanza un subagente que no haya construido la web (si está instalado, el agente
   `impeccable-finish-reviewer`, y `impeccable-motion-reviewer` para el movimiento; si no, un subagente con las capturas, una
   grabación del scroll, el brief y la prueba del genérico). Pídele la lista ordenada de arreglos de más a menos impacto.
9. Revisión visual con un modelo de visión de las hojas o de la grabación; contrasta cada aviso con la captura (da falsos
   positivos).

**C. Rondas**
10. Aplica los arreglos de más impacto y vuelve a A. Repite mientras el revisor siga encontrando mejoras claras y quede
   tiempo del encargo (regla 5). Apunta cada ronda en `BRIEF.md`: qué se cambió y qué queda.
11. Se cierra cuando el revisor ya no encuentra arreglos de peso o se acaba el tiempo, nunca solo porque «pasa las
    comprobaciones».

## Mejoras de una web que ya existe
Subir de nivel sobre la misma base no cambia lo que se ve. Para que una versión nueva se distinga de la anterior:
- Cambia la **primera pantalla** y al menos **dos** de: estructura del recorrido, tipografía, paleta, técnica estrella.
- Captura de antes y después lado a lado (primera pantalla y dos posiciones más). Si no se distinguen de un vistazo, no se
  publica como versión nueva.
- Si lo rechazado fue «no me gusta», se vuelve al paso 2 con direcciones nuevas; no se retoca la misma.
- Antes de tocar su código: versiones del `package.json` y `find-docs` para lo que se cambie. Si piden modernizarla
  entera, el `legacy-scan` de `modern-web-guidance`.

## Paso 8 · Entregar
Resumen corto con:
- Dirección elegida (estilo e intensidad), la idea en una frase y las direcciones descartadas.
- **Skills cargadas de verdad con la herramienta `Skill`**, por fase, y las de la tabla que no se cargaron con el motivo
  (no instalada, no aplicaba). Sin esta lista la entrega no está completa.
- **Documentación consultada**: versiones del proyecto, consultas de `find-docs` (librería, versión, pregunta) y guías
  de `modern-web-guidance` aplicadas (id y qué cambió). Sin esta lista tampoco está completa.
- Técnicas y componentes usados y por qué; activos (origen, licencia, coste); pesos.
- Rondas de revisión hechas, qué dijo el revisor independiente y qué se corrigió; tiempo usado frente al disponible.
- Qué se ha comprobado (capturas), qué queda (activos definitivos, textos del cliente, datos «por confirmar», dominio) y
  si está solo en local o publicado.

## Referencias
- [references/direcciones-de-estilo.md](references/direcciones-de-estilo.md): estilo e intensidad, las direcciones con cómo ejecutar cada una a buen nivel, cómo elegir, la firma y la prueba del genérico.
- [references/catalogo-tecnicas.md](references/catalogo-tecnicas.md): catálogo de efectos y técnicas (qué es, cómo se hace, coste, skill), organizado por técnica.
- [references/direccion.md](references/direccion.md): idea e hilo conductor, recorrido, ritmo, mínimos de tipografía y color, lo que da "aspecto de IA" y la plantilla del brief.
- [references/reparto-skills-diseno.md](references/reparto-skills-diseno.md): quién manda en cada tema entre este marketplace y las skills de diseño instaladas.
- [references/reglas-de-webs-reales.md](references/reglas-de-webs-reales.md): reglas y recetas sacadas de webs entregadas (dirección, carga, móvil, trampas de CSS, comprobación).
- [references/codigo-y-plataforma.md](references/codigo-y-plataforma.md): cuándo y cómo se usan `find-docs` (API de librerías en la versión del proyecto) y `modern-web-guidance` (plataforma web), qué se apunta y cómo se comprueba.
- [references/base-tecnica.md](references/base-tecnica.md): presupuestos globales, rendimiento, accesibilidad, SEO y checklist final.
