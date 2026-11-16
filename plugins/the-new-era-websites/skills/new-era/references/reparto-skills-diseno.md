# Reparto con las skills de diseño instaladas

Este marketplace sabe de **técnica y de assets**: qué medio usa cada elemento, cuánto cuesta, cómo se pide a la IA, los
motores que lo mueven, los componentes y la verificación con capturas. **No** es un sistema de diseño ni una guía de
tipografía, de color o de microinteracciones: de eso ya hay skills mejores. Si están instaladas, se delega en ellas; si no,
se usan los mínimos de [direccion.md](direccion.md) y [base-tecnica.md](base-tecnica.md).

Comprueba qué hay instalado mirando la lista de skills disponibles en la sesión (no supongas). Delegar es **invocar la skill**
con el contexto del `BRIEF.md`, no copiar sus instrucciones aquí.

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
| SEO | `claude-seo:seo` | `ecc:seo` | Lo mínimo de base-tecnica.md (título, descripción, `og:image`, HTML con contenido real) |

## Orden de trabajo cuando hay skills de diseño
1. **Brief** (esta skill) → `BRIEF.md`.
2. **Dirección y sistema** (skill de diseño): estética, tipografía, color, tokens. Si existe `DESIGN.md` o `PRODUCT.md`, se
   leen y se respetan; el `BRIEF.md` los enlaza y **no repite** sus tokens.
3. **Momento estrella, técnicas y plan de assets** (esta skill y sus skills de técnica).
4. **Construir**: plantilla y motores de aquí; estilos y componentes de interfaz con el sistema del paso 2.
5. **Movimiento fino** (skill de animación) en lo que no es scroll: botones, menús, estados.
6. **Verificar** con `verificar-scroll.mjs` (aquí) → **crítica y auditoría** (skill de diseño) → corregir → volver a verificar.

## Cuando dos skills dicen cosas distintas
- **Una sola fuente para los tokens.** No se crean dos `DESIGN.md` ni dos juegos de variables. Si la skill de diseño ya
  generó el suyo, la plantilla lee de ahí.
- **Un solo sistema de scroll por página.** `gsap-scrolltrigger` se recomienda a sí misma para todo lo que sea scroll y
  `nateherk-design:scroll-craft` trae su propio motor: no se mezclan con la plantilla de aquí en la misma página. Si el
  pedido llegó con NEW ERA, se usa la plantilla (Lenis + ScrollTrigger) y los motores de este marketplace; `gsap-skills` se
  consulta para la API. Si el pedido llegó por `scroll-craft`, manda su motor y de aquí se toman solo los assets y los
  componentes.
- **"Un solo momento de movimiento"** (lo piden `frontend-design` y la dirección de aquí): coinciden. El momento estrella es
  ese momento; el resto, sobrio.
- **Scroll con sentido** (`impeccable animate`: solo si la relación con el scroll significa algo): es el filtro para decidir
  si una sección se fija. Si el scroll no cuenta nada (no gira, no avanza, no descubre), la sección no se fija.
- **Animar o no una interacción**: decide `animate` (frecuencia de uso, propósito). Lo que se usa cien veces al día no se
  anima, por muy premium que sea la web.
- **Accesibilidad contra efecto**: gana la accesibilidad. Con reduced-motion se enseña el estado final o el póster.

## Si no hay ninguna skill de diseño instalada
Se sigue con los mínimos de [direccion.md](direccion.md) (dos familias, un fondo, un texto y un acento, lo que huele a
plantilla) y la checklist de [base-tecnica.md](base-tecnica.md), y se avisa en la entrega de que la dirección visual se ha
hecho con valores sobrios por defecto. Se pueden recomendar: `impeccable`, `frontend-design`, `ui-ux-pro-max`, las skills de
animación (`animate`, `emil-design-eng`, `apple-design`, `mobile-native`), `gsap-skills` y `webgl-animation-skills`.

## Lo que no se delega nunca
- El **coste**: ninguna generación de pago sin precio estimado y sin el sí de quien paga.
- La **verificación con capturas** antes de enseñar nada.
- Las **pantallas, logos y textos** dentro de una escena generada: siempre por código.
