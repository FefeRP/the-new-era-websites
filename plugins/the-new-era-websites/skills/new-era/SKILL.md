---
name: new-era
description: Skill maestra del marketplace the-new-era-websites para construir o mejorar cualquier web con carácter propio y sin resultados genéricos - corporativa, despacho, editorial, inmobiliaria, tienda o e-commerce, restaurante u hotel, estudio o portfolio, landing de producto, inmersiva o cinematográfica - palabra clave de activación "NEW ERA" o /new-era (siguen valiendo "WEB PREMIUM" y /web-premium, el nombre anterior). Tiene una base común que se usa siempre (brief, dirección de estilo con DESIGN.md, idea, hilo y firma, estructura, tipografía, ritmo y movimiento, carga obligatoria con la herramienta Skill de las skills de diseño instaladas, código contra la documentación actual con find-docs en la versión del proyecto y Modern Web Guidance en las decisiones de plataforma, verificación con capturas y revisión independiente por rondas) y módulos opcionales que activa solo si el proyecto los pide y deja escritos en el BRIEF con el motivo - 3D y WebGL (three.js con glTF, shaders, Spline), vídeo con IA (Higgsfield con Seedance, Kling, Veo y Wan, guía por modelo, plantillas, árbol de decisión, montaje medido), scroll inmersivo y frames, assets de IA (fotos de producto, alfa, capas, parallax, lente de rayos X, envase que gira sin 3D), biblioteca de componentes y lugar y mapa (de la ciudad al edificio). Planifica los activos y su coste, monta la web con la plantilla base (Vite + GSAP + Lenis), la verifica y la revisa antes de darla por terminada. Úsala SIEMPRE que el pedido diga "NEW ERA", "new era website", "WEB PREMIUM", "web premium", "hazme la web de", "mejora esta web", "que no parezca genérica", "web corporativa premium", "web para una inmobiliaria", "web de tienda", "web editorial", "web inmersiva", "web de las que parecen imposibles", "web con 3D y scroll", "web tipo Apple/Awwwards", "web cinematográfica", "landing con efectos", "premium website", "immersive website", "awwwards style site", "cinematic scroll website", "3D scrolling website", "build a website with scroll effects", "premium corporate website", "real estate website".
license: MIT
version: 1.2.0
---

# NEW ERA: de un pedido a una web con carácter propio

Esta skill **dirige**: elige la dirección, decide qué hacer y en qué orden, y delega el *cómo*. Sirve para cualquier
web y cualquier estilo; lo único que no puede salir de aquí es una web **genérica**: la que valdría para otro negocio
cambiando el logo.

Se organiza en dos capas:
- **Base común**, que se usa siempre: reglas, brief, dirección de estilo, idea, recorrido, tipografía, ritmo,
  movimiento por código, skills de diseño y de código, construcción, verificación y revisión por rondas.
- **Módulos**, que se activan solo si el proyecto los pide (paso 4): **3D y WebGL**, **vídeo con IA**, **scroll
  inmersivo y frames**, **assets de IA** (foto, alfa y capas), **biblioteca de componentes** y **lugar y mapa**.
  Cada uno vive en [references/modulos/](references/modulos/README.md) con sus señales, sus skills, sus técnicas, sus
  activos y sus comprobaciones. Una web que no los necesita no arrastra ni el 3D ni el vídeo.

## Ocho reglas que no se saltan
1. **Se elige dirección antes de construir** (paso 2). Una web sale genérica cuando nadie decide: secciones correctas,
   tipografía neutra, tarjetas, entradas suaves y un efecto suelto. Estilo e intensidad se eligen según el cliente y quedan
   escritos.
2. **Las skills se cargan, no se recuerdan.** En cada fase se invocan con la herramienta `Skill` las skills de la tabla de
   abajo que estén instaladas, y las de cada módulo activo. «Aplicar lo que ya sé de esa skill» no cuenta: sus
   instrucciones cambian y es lo que separa un resultado con oficio de uno del montón. Cada carga se apunta en `BRIEF.md`
   (sección «Skills cargadas») en el momento.
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
7. **Los módulos se deciden por el proyecto y quedan escritos** (paso 4): cada uno, activado o no, con el motivo
   sacado del pedido. Ni se activa el 3D por costumbre ni se deja una web sin imagen propia por no activar módulos: la
   base sola ya exige dirección, firma, imagen y revisión.
8. **Nada de distribuciones típicas de IA.** Prohibidas salvo que el pedido las exija con un motivo: el hero centrado
   (titular, subtítulo y dos botones en el centro sobre un degradado), el hero partido «texto a la izquierda, imagen a la
   derecha», la fila de 3 (o 4) tarjetas iguales con icono, título y dos líneas, los bloques de estadísticas en fila, el
   zigzag imagen-texto que se repite, el FAQ en acordeón y el CTA final en una caja con degradado, las píldoras de
   «etiqueta» encima de cada titular y el fondo de malla de degradados morado-azul. En su lugar: composición asimétrica
   con la retícula de `DESIGN.md`, escala tipográfica extrema, una pieza que rompe la retícula, contenido de distinto
   peso en cada sección y la imagen como protagonista. La lista completa y la prueba están en
   [references/direcciones-de-estilo.md](references/direcciones-de-estilo.md) (§5 y §6); se pasa antes de construir y
   antes de entregar.

## Base · skills que se cargan en cada fase (obligatorio si están instaladas)
Mira la lista de skills disponibles en la sesión, no supongas. Las de este marketplace que pida la fase van siempre; de
las demás, las que existan. Si falta alguna, se sigue con los mínimos de [references/direccion.md](references/direccion.md)
y se dice en la entrega.

| Fase | Se cargan con `Skill` | Qué sale de ahí |
|---|---|---|
| **Dirección** (paso 2) | `frontend-design:frontend-design` (dirección estética) · `taste-skill:design-taste-frontend` (criterio anti-genérico: un sistema, una sección por pantalla, fotos y UI reales, y su puerta de revisión) · `impeccable:impeccable` (`shape`, y `init`/`document` para `DESIGN.md`) · `ui-ux-pro-max:ui-ux-pro-max` (paletas y pares de fuentes por sector) · y, si la marca no tiene nombre o voz, `founder-skill:founder-brand` | Dirección elegida, tipografía, paleta y tokens en `DESIGN.md` |
| **Componentes** (pasos 4 y 6) | `componentes-interactivos` · `emil-design-eng` (detalle de cada pieza) · y `biblioteca-componentes` si el módulo Biblioteca está activo | Recursos de la librería copiados tal cual (ajustados solo si hace falta); iconos y marca, del proyecto |
| **Movimiento** (pasos 4 y 6) | `revelados-y-transiciones` (y `rastro-cursor` si toca) · `parallax-capas` si hay fondo por capas · `gsap-skills:gsap-scrolltrigger` y `gsap-skills:gsap-timeline` (líneas de tiempo a medida) · `animate`, `choreograph` (varios elementos a la vez), `gestures` y `apple-design` (microinteracciones, gestos, muelles) · y las skills de los módulos activos | Escenas, transiciones y estados con intención |
| **Activos** (paso 5) | `pedir-assets-ia` y, si están instaladas, `creative-architect:direccion-de-arte` (criterio de estilo y prompts de imagen que no parecen IA) | Lista de activos con medio, prompt y coste |
| **Módulos** (paso 4) | Las de cada módulo activo, según su fichero en [references/modulos/](references/modulos/README.md) | Técnicas, activos y comprobaciones propias del módulo |
| **Código** (pasos 1, 4, 6 y 7) | `find-docs` (API de cada librería en la versión del `package.json`) · `modern-web-guidance:modern-web-guidance` (plataforma: Core Web Vitals, imágenes, fuentes, accesibilidad, View Transitions, CSS moderno, formularios, PWA) | Código que funciona con la versión instalada y decisiones de plataforma con su guía, apuntadas en `BRIEF.md` |
| **Revisión** (paso 7) | `impeccable:impeccable` (`critique`, `audit`, `polish`) · la puerta de revisión de `taste-skill:design-taste-frontend` · `learn-taste` (cada corrección del cliente o del revisor pasa a regla de `DESIGN.md`) · `animation-performance` · `mobile-native` · `break-ui` · el agente revisor `impeccable-finish-reviewer` (y `impeccable-motion-reviewer` si hay movimiento) | Lista ordenada de arreglos, aplicada por rondas |

Quién manda cuando dos skills opinan distinto: [references/reparto-skills-diseno.md](references/reparto-skills-diseno.md).

## Los módulos
| Módulo | Se activa cuando… (resumen; señales completas en su fichero) | Fichero |
|---|---|---|
| **3D y WebGL** | El visitante gira, configura o toca el objeto; el mismo objeto vuelve en varias secciones; la idea es abstracta o de materia (luz, partículas, fondo vivo por shader); el cliente ya tiene un modelo 3D o una escena de Spline | [modulos/3d-y-webgl.md](references/modulos/3d-y-webgl.md) |
| **Vídeo con IA** | La cámara viaja por un sitio; algo cambia físicamente y tiene que verse real; el relato es un proceso (cómo se hace, la obra al revés); hace falta un fondo realista en movimiento | [modulos/video-ia.md](references/modulos/video-ia.md) |
| **Scroll inmersivo y frames** | La idea es un recorrido que el visitante controla; hay una secuencia que avanza y retrocede con el scroll; el momento estrella es una escena fijada que dura varias pantallas | [modulos/scroll-inmersivo.md](references/modulos/scroll-inmersivo.md) |
| **Assets de IA: foto, alfa y capas** | Falta la imagen que la idea necesita; se pide profundidad sin 3D; hay que mirar dentro o comparar; envases con variantes; fotos del cliente que tratar | [modulos/assets-ia.md](references/modulos/assets-ia.md) |
| **Biblioteca de componentes** | Hay piezas de interfaz que pueden existir en el catálogo (casi siempre) y el catálogo está disponible | [modulos/biblioteca.md](references/modulos/biblioteca.md) |
| **Lugar y mapa** | La ubicación vende (inmobiliaria, hotel, restaurante, tienda física) o hay que contar un viaje | [modulos/lugar-y-mapa.md](references/modulos/lugar-y-mapa.md) |

Combinaciones típicas por tipo de web (corporativa, editorial, inmobiliaria, tienda, lugar, producto, inmersiva,
constructora) y por qué cada skill está en su módulo: [references/modulos/README.md](references/modulos/README.md).
Oficio de webs entregadas, para todas: [references/reglas-de-webs-reales.md](references/reglas-de-webs-reales.md).

**Nunca por plantillas** («plantilla de heladería»): direcciones, técnicas y módulos que se combinan según el negocio, la
historia y el presupuesto.

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
10. **Señales para los módulos**: si algo se gira o se configura, si hay un sitio que recorrer o un proceso que contar,
    si falta imagen, si la ubicación vende, qué piezas de interfaz hay y qué presupuesto de generación existe. Se
    apuntan aquí y se deciden en el paso 4.

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

## Paso 4 · Módulos y técnicas
**A. Decidir los módulos** (regla 7). Lee [references/modulos/README.md](references/modulos/README.md) y, con las
señales del paso 1 y la idea del paso 3, decide cada módulo por separado:
1. Activado o no, con una frase que cite la señal del pedido («vende la ubicación → Lugar y mapa»; «nada se gira ni se
   configura → sin 3D»).
2. Contrasta con la intensidad: en la **3**, al menos un módulo de escena (3D y WebGL, Vídeo con IA o Scroll
   inmersivo) da el momento estrella; si ninguno encaja con la idea, se vuelve al paso 3 a buscar otra, sin bajar la
   intensidad a escondidas. En la **2**, un módulo de escena o de assets suele dar la técnica fuerte. En la **1**, la
   firma puede salir solo de la base.
3. Escríbelo en `BRIEF.md`, sección «Módulos», **antes** de cargar nada del módulo.
4. Carga con `Skill` las skills de cada módulo activo y lee su fichero (técnicas, activos, construir, verificar).
5. Si a mitad del trabajo aparece una necesidad nueva (el cliente manda un modelo 3D, pide un vídeo), se activa el
   módulo entonces y se apunta con el motivo.

**B. Elegir técnicas.** Usa la matriz de [references/catalogo-tecnicas.md](references/catalogo-tecnicas.md), la tabla de
la base de abajo y la tabla de cada módulo activo, y carga la skill de cada técnica elegida.

Técnicas de la base (valen para cualquier web, sin activar módulos):
| Quiero… | Técnica | Skill |
|---|---|---|
| Un fondo con mundo propio que cambia con el producto, el modelo o el capítulo (shader detrás y nubes en el suelo del hero; o cielo, montañas y suelo como fotos separadas que se mueven y se relevan) | **Fondo generado por capas**: un plano por capa, una versión por escena, relevo escalonado + parallax (varias animaciones solo con fotos). Recurso fijo: plantéalo en toda web antes de descartarlo | [fondos-por-capas.md](references/fondos-por-capas.md) + `parallax-capas` (`fondo-capas.js`; `--con fondo`) |
| Tipografía como imagen (titulares de 12-36 vw, letras que se ensanchan o engordan al bajar) | Fuente variable (ejes de ancho y peso) ligada al scroll | catálogo (F) + `revelados-y-transiciones` |
| Textos con presencia | Titulares que suben por líneas, máscaras, texto entre capas | `revelados-y-transiciones` (`crearLineas`) (+ `capas-alfa` si el módulo Assets está activo) |
| Una foto que se descubre (rejilla, máscara) o una cortina que cambia de escena | Revelados por código | `revelados-y-transiciones` |
| Acercarse a un producto dentro de una imagen grande (estantería, plano, cartel) | Zoom 2D a un punto con relevo a una foto de detalle | `revelados-y-transiciones` (`crearZoomA`) |
| Una barra o un indicador que acompaña todo el recorrido (capítulo, progreso, reloj, plano) | Elemento fijo que lee el avance del scroll | plantilla + `gsap-skills:gsap-scrolltrigger` |
| Fotos que aparecen al mover el ratón | Rastro de imágenes | `rastro-cursor` |
| Fichas con más datos por detrás (inmuebles, productos, equipo) | Tarjeta con volteo y capas en profundidad | `componentes-interactivos` (`tarjeta-volteo.js`) |
| Destacados que giran alrededor de un centro, o un anillo que gira al bajar | Carrusel en órbita o anillo 3D por CSS | `componentes-interactivos` (`carrusel-orbital.js`) |
| Prueba social con movimiento (con reseñas reales) | Muro de reseñas en columnas 3D por CSS | `componentes-interactivos` (`resenas-3d.js`) |
| Botones, menús, modales, avisos, estados de hover | Microinteracciones | skill de animación instalada (`animate`, `emil-design-eng`) |
| Sonido de ambiente o de respuesta | Audio generado o cargado, **apagado por defecto** y con botón visible | catálogo (H) |
| Transiciones entre páginas o estados | View Transitions con su alternativa | `revelados-y-transiciones` + `modern-web-guidance` |
| Elegir entre pocos productos o looks de uno en uno (moda, carta, gama corta) | Pasarela con foco (centro nítido, vecinos desenfocados) + panel «en este look» + puntos sobre el producto; o el producto en escenario con foco, reflejo y el nombre en contorno detrás | catálogo (J) + [recetas-producto-y-servicio.md](references/recetas-producto-y-servicio.md) (1-3) |
| Que un servicio se venda solo (limpieza, reformas, oficios) | «Límpialo tú» (el visitante pinta el resultado), instrumento que explica el método, presupuesto al instante con rango y barra fija con la llamada | catálogo (J) + [recetas-producto-y-servicio.md](references/recetas-producto-y-servicio.md) (4-6) |

Las técnicas de 3D, vídeo IA, scroll con frames, capas con alfa, fotos IA, lente, envase, catálogo de componentes y mapa
están en la tabla de su módulo.

**Cuánto según la intensidad** (mínimos; anota la decisión y el porqué en `BRIEF.md`):
- **3 · Inmersiva**: 1 técnica fuerte en la primera pantalla o justo después + 2 de apoyo + el hilo conductor +
  transiciones entre secciones + una interacción que se toca. Usa los motores de este marketplace antes de escribir uno
  propio a medias.
- **2 · Con escenas**: 1 técnica fuerte + 1-2 de apoyo.
- **1 · Contenida**: la firma (una pieza propia) + componentes adaptados + microinteracciones cuidadas.

## Paso 5 · Plan de activos (y su coste)
Lista cada activo: qué es, de dónde sale (cliente / libre / IA / código), formato y peso objetivo. **El presupuesto se
presenta siempre**, con dos o tres opciones (por código y libres a 0 · imágenes clave · con vídeo), aunque se acabe
eligiendo la de 0: decidir «cero» sin enseñar lo que se pierde es una de las causas de las webs planas. Si una opción
necesita un módulo que no está activo, se dice qué módulo traería y qué añade.
- Con un módulo de IA activo, **sigue `pedir-assets-ia`**: guion de tramos → medio de cada asset (vídeo IA, imagen IA,
  código, 3D) → `presupuesto.mjs` con el presupuesto del usuario → imágenes clave (baratas) elegidas antes de ningún
  vídeo → prueba corta → finales → revisión. **No generes nada de pago sin el vale de quien paga, con el precio
  estimado delante.**
- Con presupuesto 0 también hay imagen propia: canvas 2D y SVG por código, tipografía como imagen, fotos del cliente bien
  tratadas, activos libres; y, activando el módulo 3D y WebGL (sin coste de generación), shaders y render con three.js
  (Poly Haven, Khronos). Lo que no vale es dejar la web sin imagen.
- Lo propio de cada módulo (vídeo con Higgsfield, modelos 3D, lotes de imagen, fotos de producto, alfa, capas, mapas)
  está en el apartado «Activos y coste» de su fichero.
- Pantallas, logos y textos dentro de una escena: nunca generados; por código (con `seguir-pantalla` si van sobre un
  vídeo).

## Paso 6 · Construir
```bash
node scripts/nueva-web.mjs <carpeta> --modulos <módulos activos> --con <técnicas sueltas> --titulo "…" --marca "…" --fondo "#…" --texto "#…" --acento "#…"
cd <carpeta> && npm install [three] [maplibre-gl] && npm i -D playwright-core && npm run dev
```
`--modulos` acepta `3d`, `video-ia`, `scroll`, `assets`, `biblioteca` y `mapa`, y copia los motores típicos de cada
uno (el resto, con `--con`). Valores de `--con`: base `revelados,rastro,componentes` (o `tarjeta`, `carrusel`, `resenas` por separado) · 3D y WebGL
`3d` · Vídeo con IA y Scroll inmersivo `frames,video,pantalla` · Assets de IA `alfa,capas,lente,envase` · Lugar y mapa
`mapa,mapa-imagen`. Copia solo los de los módulos activos; `pantalla`, `lente`, `envase` y `mapa-imagen` van con
`--con` cuando la técnica se usa. Más opciones: `--fuente`, `--fuente-display`,
`--descripcion`.
La plantilla trae Lenis + GSAP ScrollTrigger en un único bucle, reduced-motion, tokens de diseño, enlace "saltar al contenido".
Cada técnica en su fichero `src/secciones/<seccion>.js` (la carpeta `src/secciones/` se crea: la plantilla no la trae), con la maqueta y el código de las references de su skill.
**Orden**: todo el HTML y el texto real (la página debe tener sentido sin JS) → sistema de `DESIGN.md` y móvil → la
**primera pantalla y el momento estrella primero** (son lo que decide; si no convencen, se rehacen antes de seguir) → el
hilo conductor y las transiciones → resto de secciones y componentes, uno a uno → microinteracciones con la skill de
animación.
Para cada pieza de interfaz, si el módulo Biblioteca está activo, busca antes en el catálogo (`biblioteca-componentes`) y
copia tal cual lo que encaje, ajustándolo solo si hace falta (contenido real; color y tipografía si chocan con
`DESIGN.md`); si la pila es otra, se pasa conservando el efecto exacto. Los iconos y lo propio de la marca se generan
para el proyecto, no salen de la librería.
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
3. **Las comprobaciones de cada módulo activo** (apartado «Verificar» de su fichero): por ejemplo, el informe de
   `revisar-video.mjs` de cada clip en Vídeo con IA, el póster y el móvil en 3D y WebGL, la atribución en Lugar y mapa.
4. Tamaños de móvil que fallan: 390×844, 360×740 y apaisados 844×390 y 932×430. Sin desplazamiento lateral.
5. `npm run build` sin errores; peso total dentro del presupuesto ([references/base-tecnica.md](references/base-tecnica.md)) y su checklist final. El rendimiento es una condición, no el objetivo: si para ganar fps hay que quitar la escena, primero se
   optimiza la escena (anima `transform` y `opacity`; `clip-path` y `filter` animados en cada fotograma doblan el coste).
6. **Código al día**: cada API de librería del código nuevo tiene su consulta de `find-docs` y cada decisión de
   plataforma su guía de `modern-web-guidance`, revisada contra lo escrito (prioridad de la imagen principal, tamaños,
   alternativas para lo que no es Baseline). En Next.js, `next build` sin avisos de API obsoleta. Lo que falte se consulta
   ahora y se corrige.

**B. Que tiene nivel** (con la página ya sin errores)
7. **Prueba del genérico** de [references/direcciones-de-estilo.md](references/direcciones-de-estilo.md) (§5), respondida
   por escrito con las capturas delante y al lado del tablero de referencias del paso 2.
8. **Crítica con la skill de diseño** cargada con `Skill` (p. ej. `impeccable`: `critique`, `audit`, `polish`).
9. **Revisor independiente**: lanza un subagente que no haya construido la web (si está instalado, el agente
   `impeccable-finish-reviewer`, y `impeccable-motion-reviewer` para el movimiento; si no, un subagente con las capturas, una
   grabación del scroll, el brief y la prueba del genérico). Pídele la lista ordenada de arreglos de más a menos impacto,
   y que diga si algún módulo sobra o falta para la idea.
10. Revisión visual con un modelo de visión de las hojas o de la grabación; contrasta cada aviso con la captura (da falsos
   positivos).

**C. Rondas**
11. Aplica los arreglos de más impacto y vuelve a A. Repite mientras el revisor siga encontrando mejoras claras y quede
   tiempo del encargo (regla 5). Apunta cada ronda en `BRIEF.md`: qué se cambió y qué queda.
12. Se cierra cuando el revisor ya no encuentra arreglos de peso o se acaba el tiempo, nunca solo porque «pasa las
    comprobaciones».

## Mejoras de una web que ya existe
Subir de nivel sobre la misma base no cambia lo que se ve. Para que una versión nueva se distinga de la anterior:
- Cambia la **primera pantalla** y al menos **dos** de: estructura del recorrido, tipografía, paleta, técnica estrella.
- Captura de antes y después lado a lado (primera pantalla y dos posiciones más). Si no se distinguen de un vistazo, no se
  publica como versión nueva.
- Si lo rechazado fue «no me gusta», se vuelve al paso 2 con direcciones nuevas; no se retoca la misma.
- Los módulos se deciden otra vez para la versión nueva (paso 4): puede que la anterior arrastrase uno que no hacía falta
  o que le faltase el que da la idea.
- Antes de tocar su código: versiones del `package.json` y `find-docs` para lo que se cambie. Si piden modernizarla
  entera, el `legacy-scan` de `modern-web-guidance`.

## Paso 8 · Entregar
Resumen corto con:
- Dirección elegida (estilo e intensidad), la idea en una frase y las direcciones descartadas.
- **Módulos activados y no activados**, cada uno con su motivo.
- **Skills cargadas de verdad con la herramienta `Skill`**, por fase y por módulo, y las de la tabla que no se cargaron con
  el motivo (no instalada, no aplicaba, módulo no activo). Sin esta lista la entrega no está completa.
- **Documentación consultada**: versiones del proyecto, consultas de `find-docs` (librería, versión, pregunta) y guías
  de `modern-web-guidance` aplicadas (id y qué cambió). Sin esta lista tampoco está completa.
- Técnicas y componentes usados y por qué; activos (origen, licencia, coste); pesos.
- Rondas de revisión hechas, qué dijo el revisor independiente y qué se corrigió; tiempo usado frente al disponible.
- Qué se ha comprobado (capturas), qué queda (activos definitivos, textos del cliente, datos «por confirmar», dominio) y
  si está solo en local o publicado.
- Si se quiere un vídeo de la web para redes o el portfolio: `video-desde-html`, con o sin el módulo de scroll activo.

## Referencias
- [references/modulos/](references/modulos/README.md): base común y módulos, cómo se decide cada uno, combinaciones por tipo de web y un fichero por módulo (3D y WebGL, vídeo con IA, scroll inmersivo y frames, assets de IA, biblioteca de componentes, lugar y mapa).
- [references/direcciones-de-estilo.md](references/direcciones-de-estilo.md): estilo e intensidad, las direcciones con cómo ejecutar cada una a buen nivel, cómo elegir, la firma y la prueba del genérico.
- [references/catalogo-tecnicas.md](references/catalogo-tecnicas.md): catálogo de efectos y técnicas (qué es, cómo se hace, coste, skill y módulo), organizado por técnica.
- [references/direccion.md](references/direccion.md): idea e hilo conductor, recorrido, ritmo, mínimos de tipografía y color, lo que da "aspecto de IA" y la plantilla del brief.
- [references/reparto-skills-diseno.md](references/reparto-skills-diseno.md): quién manda en cada tema entre este marketplace y las skills de diseño instaladas.
- [references/reglas-de-webs-reales.md](references/reglas-de-webs-reales.md): reglas y recetas sacadas de webs entregadas (dirección, carga, móvil, trampas de CSS, comprobación).
- [references/codigo-y-plataforma.md](references/codigo-y-plataforma.md): cuándo y cómo se usan `find-docs` (API de librerías en la versión del proyecto) y `modern-web-guidance` (plataforma web), qué se apunta y cómo se comprueba.
- [references/base-tecnica.md](references/base-tecnica.md): presupuestos globales, rendimiento, accesibilidad, SEO y checklist final.
