# Reparto con las skills de diseño instaladas

Este marketplace sabe de **técnica y de assets**: qué medio usa cada elemento, cuánto cuesta, cómo se pide a la IA, los
motores que lo mueven, los componentes y la verificación con capturas. **No** es un sistema de diseño ni una guía de
tipografía, de color o de microinteracciones: de eso ya hay skills mejores. Si están instaladas, **se cargan**; si no,
se usan los mínimos de [direccion.md](direccion.md) y [base-tecnica.md](base-tecnica.md).

Comprueba qué hay instalado mirando la lista de skills disponibles en la sesión (no supongas). Delegar es **cargar la skill
con la herramienta `Skill`** y darle el contexto del `BRIEF.md`. No vale copiar sus instrucciones aquí ni «aplicar lo que
se recuerda de ella»: una web hecha sin cargarlas sale sin dirección, que es justo lo que se nota como genérico. Cada
carga se apunta en el `BRIEF.md` y la entrega lista las que se cargaron de verdad. Delegar el diseño no es soltarlo: la
dirección de estilo, la idea y la firma se deciden aquí (direcciones-de-estilo.md) **con** esas skills, y los mínimos de
direccion.md valen siempre como suelo.

## Quién manda en cada tema
| Tema | Manda | Apoyo | Este marketplace aporta |
|---|---|---|---|
| Dirección estética (que no parezca plantilla) | `frontend-design:frontend-design` | `impeccable:impeccable` (`shape`, `bolder`, `quieter`) | El momento estrella y qué técnica lo hace posible |
| Sistema de diseño y tokens | `impeccable:impeccable` (`init`, `document`, `extract`: PRODUCT.md y DESIGN.md) | `ui-ux-pro-max:ui-ux-pro-max --design-system` (datos: estilos, paletas, pares de fuentes), `ui-ux-pro-max:design-system` (tokens en 3 capas con validador) | Solo los tokens de la plantilla (`--fondo`, `--texto`, `--acento`), que se rellenan con lo que decida el sistema |
| Tipografía | `impeccable:impeccable` (`typeset`) | `ui-ux-pro-max` (pares), `apple-design` (tracking, tamaño óptico) | Titulares que suben por líneas y texto entre capas (el efecto, no la elección de la fuente) |
| Color | `impeccable:impeccable` (`colorize`) | `ui-ux-pro-max` (paletas por tipo de producto) | Una regla propia: el fondo de la sección = el fondo del vídeo o de la foto, para que el lienzo desaparezca |
| Maquetación y jerarquía | `impeccable:impeccable` (`layout`, `shape`) | `frontend-design:frontend-design` | La maqueta de las escenas fijadas (sticky, `svh`, capas sobre el canvas) |
| Textos de interfaz | `impeccable:impeccable` (`clarify`) | `ui-ux-pro-max:brand` (voz) | Nada: no se escriben reglas de copy aquí |
| Microinteracciones (botón, menú, modal, aviso, hover) | `animate` | `emil-design-eng`, `apple-design` (muelles, gestos); `ecc:motion-patterns` solo si el proyecto usa motion/react | Nada: los componentes de este marketplace traen su movimiento, pero un botón o un modal se animan con `animate` |
| Movimiento ligado al scroll | **Este marketplace** (`scroll-frames`, `parallax-capas`, `revelados-y-transiciones`, `mapa-zoom-ubicacion`) | `gsap-skills:gsap-scrolltrigger`, `gsap-timeline` y `gsap-plugins` para la API cuando se escribe una línea de tiempo a medida | Los motores, la plantilla con Lenis + ScrollTrigger en un solo bucle y la verificación por posiciones |
| Assets de IA (imagen y vídeo), alfa, capas, sombras | **Este marketplace** (`pedir-assets-ia`, `recursos-imagen-ia`, `fotos-producto-ia`, `video-ia-para-scroll`, `capas-alfa`) | — | Todo: medio por elemento, presupuesto, prompts, revisión |
| 3D de producto con glTF | **Este marketplace** (`escena-3d-gltf`) | `webgl-animation-skills:threejs-animation` (mezcla de animaciones, instancias, R3F, liberar memoria) | El motor de producto, la optimización del modelo y el respaldo sin WebGL |
| Shaders y partículas | `webgl-animation-skills:shader-glsl`, `webgl-animation-skills:particle-system` | — | Cuándo compensa y cuándo es mejor un vídeo (catálogo, sección E) |
| Componentes (tarjeta con volteo, carrusel orbital, reseñas 3D) | **Este marketplace** (`componentes-interactivos`) | `emil-design-eng` para el pulido; `animate` si hay que cambiar curvas | Los motores, la accesibilidad y la prueba |
| Piezas de interfaz de catálogos (fondos animados, textos, botones, bentos, heros de Magic UI, Origin UI y similares) y escenas de Spline | **Este marketplace** (`biblioteca-componentes`: buscar, elegir por licencia y peso, adaptar) | La skill de diseño para los tokens que se aplican al adaptarlo; `emil-design-eng` para el pulido | El buscador, las reglas de licencia y la tabla de cambios para que no se reconozca el original |
| Vídeo de la propia web (hero, tramo de scroll, producto) para redes; fondos en bucle, capas con alfa y secuencias para scroll hechas por código | **Este marketplace** (`video-desde-html`, sobre HyperFrames) | Las skills oficiales de HyperFrames (`hyperframes`, `hyperframes-cli`) para el contrato completo y composiciones de muchas escenas; `gsap-skills:gsap-timeline` para la línea de tiempo | El lanzador seguro, las plantillas, el patrón para WebGL y canvas, la medida del bucle. En la web, el resultado entra por `scroll-frames` o `capas-alfa` |
| Pieza de vídeo editada (voz, subtítulos, música, cortes; episodios y promos largas) | Remotion, si el proyecto ya lo tiene (`ecc:remotion-video-creation`) | `video-desde-html` para los planos de la web, que entran como un `.mp4` más | Nada más: no se montan dos motores de render para la misma pieza |
| Móvil táctil (hover pegado, `100vh`, zoom en campos, muesca) | `mobile-native` | `impeccable:impeccable` (`adapt`) | El encuadre propio del momento estrella en vertical y los pesos por dispositivo |
| Accesibilidad | `impeccable:impeccable` (`audit`) | `ecc:accessibility` (WCAG 2.2), `ecc:frontend-a11y` (React) | reduced-motion en todos los motores, texto real en el DOM, foco en las escenas fijadas |
| Rendimiento de animaciones | `animation-performance` | `gsap-skills:gsap-performance` | Los presupuestos de peso de frames, vídeo, alfa y glTF (base-tecnica.md) |
| Datos extremos y casos límite | `break-ui` | `impeccable:impeccable` (`harden`) | — |
| Crítica y repaso final | `impeccable:impeccable` (`critique`, `audit`, `polish`) | `improve-animations` | `verificar-scroll.mjs`: capturas por posición, consola y reduced-motion. Va **antes** de la crítica: no se critica una página con errores |
| API de librerías y frameworks (Next.js, React, Tailwind, GSAP, three.js, MapLibre, Prisma…) | `find-docs` (en la versión exacta del `package.json`) | `gsap-skills`, `webgl-animation-skills` para patrones; la documentación manda sobre ellas y sobre lo que se recuerde | Los motores ya probados: no hace falta consultarlos; sí la librería cuando se escribe código propio con ella |
| Plataforma web: Core Web Vitals, imágenes, fuentes, accesibilidad nativa, View Transitions, animación ligada al scroll en CSS, diálogos, formularios, CSS moderno, PWA | `modern-web-guidance:modern-web-guidance` | `impeccable:impeccable` (`audit`), `animation-performance` | Los presupuestos de peso y la verificación por posiciones; la decisión motor contra nativo en las escenas ([codigo-y-plataforma.md](codigo-y-plataforma.md)) |
| SEO | `claude-seo:seo` | `ecc:seo` | Lo mínimo de base-tecnica.md (título, descripción, `og:image`, HTML con contenido real) |

## Orden de trabajo y qué se carga en cada fase
1. **Brief** (esta skill) → `BRIEF.md`.
2. **Dirección de estilo y sistema**: se cargan `frontend-design:frontend-design`, `impeccable:impeccable` (`shape`; `init`
   o `document` para el `DESIGN.md`) y `ui-ux-pro-max:ui-ux-pro-max` (paletas y pares de fuentes del sector). Sale la
   dirección elegida entre dos o tres y el `DESIGN.md`. Si ya existe `DESIGN.md` o `PRODUCT.md`, se leen y se respetan; el
   `BRIEF.md` los enlaza y **no repite** sus tokens.
3. **Idea, hilo conductor, momento estrella, técnicas y plan de assets** (esta skill y sus skills de técnica, cargadas).
4. **Construir**: antes de cada API de librería, `find-docs` en la versión del proyecto; antes de cada decisión de plataforma, `modern-web-guidance` (ver [codigo-y-plataforma.md](codigo-y-plataforma.md)). Plantilla y motores de aquí; componentes con `biblioteca-componentes`, `componentes-interactivos` y
   `emil-design-eng`; líneas de tiempo a medida con `gsap-skills`; canvas y shaders con `webgl-animation-skills`.
5. **Movimiento fino** en lo que no es scroll (botones, menús, estados): `animate`, `apple-design`.
6. **Verificar** con `verificar-scroll.mjs` (aquí) y el código contra las consultas y guías apuntadas → **crítica y auditoría** (`impeccable`: `critique`, `audit`, `polish`;
   `animation-performance`, `mobile-native`, `break-ui`) → **revisor independiente** (agente `impeccable-finish-reviewer`
   y, si hay movimiento, `impeccable-motion-reviewer`) → corregir → otra ronda mientras haya mejoras claras y tiempo.

## Cuando dos skills dicen cosas distintas
- **Una sola fuente para los tokens.** No se crean dos `DESIGN.md` ni dos juegos de variables. Si la skill de diseño ya
  generó el suyo, la plantilla lee de ahí.
- **Un solo sistema de scroll por página.** `gsap-scrolltrigger` se recomienda a sí misma para todo lo que sea scroll y
  `nateherk-design:scroll-craft` trae su propio motor: no se mezclan con la plantilla de aquí en la misma página. Si el
  pedido llegó con NEW ERA, se usa la plantilla (Lenis + ScrollTrigger) y los motores de este marketplace; `gsap-skills` se
  consulta para la API. Si el pedido llegó por `scroll-craft`, manda su motor y de aquí se toman solo los assets y los
  componentes.
- **Manda la intensidad elegida.** Las skills de diseño tienden a recomendar contención («un solo momento de movimiento»,
  «menos es más»). Es un buen consejo para intensidad 1 y un freno para intensidad 3: si el brief dice inmersiva, sus
  recomendaciones se aplican al *cómo* (calidad de cada escena, curvas, legibilidad), no para quitar escenas, el hilo
  conductor o las transiciones. Sus avisos contra lo genérico (tipografías por defecto, maquetas de plantilla, degradados
  de adorno) mandan siempre.
- **Scroll con sentido** (`impeccable animate`: solo si la relación con el scroll significa algo): es el filtro para decidir
  *qué* cuenta cada escena fijada, no una razón para no tener ninguna. Si una sección fijada no cuenta nada (no gira, no
  avanza, no descubre), se cambia por otra que sí.
- **Animar o no una interacción**: decide `animate` (frecuencia de uso, propósito). En una herramienta que se usa cien
  veces al día, lo repetido no se anima; en una web de presentación que se visita una vez, la respuesta al gesto es parte
  de la experiencia.
- **Rendimiento contra escena**: el presupuesto de rendimiento se cumple optimizando la escena (menos resolución, `transform`
  en vez de `clip-path` o `filter`, pausa fuera de vista), no quitándola. Quitarla es la última opción y se dice en la entrega.
- **Documentación contra memoria o receta**: si la documentación actual (`find-docs`) o una guía de `modern-web-guidance` contradice lo que dice una skill o lo que se recuerda, manda la documentación en la API y la guía en la plataforma; se anota y, si afecta a un motor de aquí, se avisa en la entrega.
- **Accesibilidad contra efecto**: gana la accesibilidad. Con reduced-motion se enseña el estado final o el póster.

## Si no hay ninguna skill de diseño instalada
Se sigue igual con [direcciones-de-estilo.md](direcciones-de-estilo.md) (elegir dirección, idea y firma), los mínimos de
[direccion.md](direccion.md) y la checklist de [base-tecnica.md](base-tecnica.md), y se avisa en la entrega de que la
dirección visual se ha hecho sin skills de diseño. Se pueden recomendar: `impeccable`, `frontend-design`, `ui-ux-pro-max`, las skills de
animación (`animate`, `emil-design-eng`, `apple-design`, `mobile-native`), `gsap-skills` y `webgl-animation-skills`.
Para el código: `find-docs` y `modern-web-guidance` (cómo instalarlas en [codigo-y-plataforma.md](codigo-y-plataforma.md)).

## Lo que no se delega nunca
- La **dirección de estilo, la idea y la prueba del genérico**: se deciden y se responden aquí, por escrito.
- El **coste**: ninguna generación de pago sin precio estimado y sin el sí de quien paga.
- La **verificación con capturas** antes de enseñar nada.
- Las **pantallas, logos y textos** dentro de una escena generada: siempre por código.
