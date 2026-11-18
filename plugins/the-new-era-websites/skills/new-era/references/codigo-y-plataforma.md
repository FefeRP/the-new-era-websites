# Código al día y plataforma web: `find-docs` y Modern Web Guidance

NEW ERA no solo diseña: también programa (Vite, React, Next.js, Tailwind, GSAP, three.js, MapLibre, Prisma…). El código
de una web **no se escribe de memoria**. Las APIs cambian entre versiones (App Router, Server Components, metadata,
`next/image`, Tailwind 4, addons de three.js…) y la plataforma web gana piezas nativas cada año (View Transitions,
animaciones ligadas al scroll, popover, anchor positioning, prioridad de recursos). Lo que se recuerda suele ser de una
versión anterior.

Dos skills lo resuelven y **se cargan con la herramienta `Skill`** como las de diseño:

| Skill | Para qué | Cuándo |
|---|---|---|
| `find-docs` (Context7, CLI `ctx7`) | Documentación oficial y al día de una librería **en la versión del proyecto** | Antes de usar o cambiar la API de una librería o framework |
| `modern-web-guidance:modern-web-guidance` (Chrome) | Buenas prácticas actuales de la plataforma web, con su compatibilidad y sus alternativas | Antes de decidir algo de plataforma: rendimiento y Core Web Vitals, imágenes, fuentes, accesibilidad, View Transitions, CSS moderno, formularios, diálogos, PWA |

## Cuándo entra cada una en NEW ERA
| Paso | `find-docs` | Modern Web Guidance |
|---|---|---|
| 1 · Brief | Lee las versiones exactas del `package.json` (y el lockfile si hay rangos) y apúntalas. En Next.js, mira si es App Router (`app/`) o Pages Router (`pages/`). Si la versión mayor es reciente, consulta su guía de actualización antes de nada | — |
| 2 · Dirección | — | Fuentes (carga, `font-display`, saltos de maqueta), color y modo oscuro, si el sistema los toca |
| 4 · Técnicas | La API de la librería de cada técnica elegida (GSAP, three.js, MapLibre, Lenis, motion) | Si la plataforma ya lo hace sin librería: animación ligada al scroll, View Transitions, popover y diálogo nativos, container queries |
| 6 · Construir | **Antes de cada API de librería que se escribe o cambia** | **Antes de cada decisión de plataforma**: imagen del hero (LCP), imágenes y vídeo diferidos, fuentes, CLS de escenas fijadas, INP de las interacciones, formularios, diálogos, menús, accesibilidad, PWA si se pide |
| 7 · Verificar | Que cada API usada tenga su consulta (o venga de un motor de este marketplace) | Repasar el código contra las guías recuperadas: alternativas para lo que no es Baseline, prioridad de la imagen LCP, tamaños, accesibilidad |
| 8 · Entregar | Lista de consultas (librería, versión, pregunta) | Lista de guías aplicadas (id y qué cambió) |

## `find-docs` paso a paso
1. **Versión primero.** Mira la versión instalada en `package.json`, no la que recuerdes. Si no hay proyecto todavía, la
   versión que vas a instalar.
2. **Resolver la librería:** `npx ctx7@latest library "Next.js" "<lo que quieres hacer>"` (nombre oficial con su
   puntuación: «Next.js», «Three.js»). Elige el ID que coincida, con la versión del proyecto si aparece en la lista
   (`/org/proyecto/vX.Y.Z`).
3. **Consultar:** `npx ctx7@latest docs /org/proyecto/vX.Y.Z "<pregunta concreta>"`. Como mucho tres llamadas por pregunta.
4. **Escribir el código según lo leído.** Si contradice lo que recordabas, manda la documentación.
5. **Apuntarlo** en `BRIEF.md` → «Documentación consultada».

Preguntas que en Next.js se consultan siempre, no se suponen: cómo se declara la metadata (estática y generada), los props
de `next/image` para la imagen principal y los tamaños, `next/font`, qué es componente de servidor y qué de cliente y
dónde se monta un motor que usa `window` o `canvas`, caché y obtención de datos, middleware o proxy, y la configuración
en `next.config`. En React, el desmontaje de efectos (los motores de aquí devuelven `destruir()`). En Tailwind, la
versión mayor (cambia dónde vive la configuración). En GSAP, three.js, MapLibre, Lenis y motion, la API de la versión
instalada.

**Privacidad:** en la pregunta van la librería y la duda técnica, nunca datos del cliente, claves ni código propio.
Si no hay red o se acaba la cuota, se usa la documentación oficial de la web de la librería y se dice en la entrega.

## Modern Web Guidance paso a paso
Carga la skill con `Skill` y sigue **su** SKILL.md (lleva los argumentos exactos de la versión instalada). En resumen:
1. **Buscar** una capacidad cada vez, en 2-5 palabras en inglés y sin nombres de framework («optimize LCP image», «view
   transitions between pages», «light dismiss dialog»). Una búsqueda por tema.
2. **Recuperar** la guía concreta y la de su disciplina (`performance`, `accessibility`, `css`, `html`, `forms`).
3. **Aplicarla** adaptada al framework, sin quitar la pieza moderna. Lo que no es *Baseline widely available* lleva la
   alternativa que diga la guía.
4. **Apuntarla** en `BRIEF.md` y en la entrega (id de la guía y qué cambió).

Temas que casi toda web NEW ERA toca: la imagen o el póster de la primera pantalla (LCP), fuentes, CLS de las escenas
fijadas y de los medios, INP de lo que se toca, vídeo y audio diferidos, View Transitions, animaciones ligadas al scroll,
diálogos y menús, formularios, accesibilidad y `content-visibility` en páginas largas. Para modernizar una web existente
entera (no una pieza), su `legacy-scan`.

**Plataforma contra motor:** si la guía propone lo nativo (por ejemplo, animación ligada al scroll en CSS) y la escena
necesita ir sincronizada con Lenis y ScrollTrigger o con un canvas, el motor se queda para la escena y lo nativo se usa
en lo demás (entradas sencillas, transiciones entre páginas, diálogos). Se anota por qué.

## Lo que se apunta (`BRIEF.md` → «Documentación consultada»)
```
## Documentación consultada
Versiones (package.json): next X.Y · react X.Y · tailwindcss X.Y · gsap X.Y · three 0.X
find-docs: /org/proyecto/vX.Y.Z · «pregunta» · qué decidió en el código
Modern Web Guidance: <id de la guía> · qué se aplicó (y la alternativa, si la hay)
```

## Cómo se comprueba (paso 7) y qué falta si no se hizo
- Cada API de librería escrita o cambiada tiene su línea de `find-docs`, o sale de un motor de este marketplace sin tocar.
- Cada decisión de plataforma (imagen principal, fuentes, transiciones, diálogos, formularios) tiene su guía.
- La entrega lista las dos cosas. Sin esa lista, el paso de código no está hecho, igual que sin la lista de skills
  cargadas.

## Si no están instaladas
- `find-docs`: el CLI funciona sin la skill (`npx ctx7@latest …`, sin clave y con límite de uso). Se instala desde el repo
  `upstash/context7` (carpeta `skills/find-docs`).
- Modern Web Guidance: plugin oficial de Chrome, `/plugin marketplace add GoogleChrome/modern-web-guidance` y
  `/plugin install modern-web-guidance@googlechrome`.
- En Windows, si `npx` falla desde Git Bash, lánzalo desde PowerShell.
- Si no se pudo instalar ninguna, se consulta la documentación oficial a mano y se dice en la entrega.
