---
name: biblioteca-componentes
description: Buscar, elegir y adaptar componentes UI de un catálogo propio (índice JSON con código, dependencias, demo, licencia y un prompt de integración por componente, sacado de registros abiertos tipo shadcn como Magic UI, SmoothUI, Origin UI, Cult UI, Motion Primitives, Animata y similares, más recetas de Spline). Es la librería común de recursos para todas las skills (webs, motion graphics, vídeo desde HTML): los recursos (componentes, fondos y elementos de decoración, shaders y similares) se copian tal cual y se modifican solo si hace falta; los iconos y lo propio de cada proyecto los genera cada usuario. Incluye el buscador sin dependencias (scripts/buscar.mjs), el acceso por carpeta local o por la API con token personal, cómo leer licencias, cómo integrarlos y ajustarlos, cómo integrar escenas de Spline y qué hacer con catálogos de pago o con clave (21st.dev, versiones Pro). Úsala cuando pidan "un shader de fondo", "elemento de decoración", "recurso de la librería", "librería de recursos", "busca un componente", "¿hay algún componente de…?", "usa la biblioteca de componentes", "catálogo de componentes", "un fondo animado", "un hero con efecto", "botón con brillo", "texto que se escribe solo", "marquesina de logos", "Magic UI", "Aceternity", "React Bits", "shadcn blocks", "21st.dev", "Spline", "component library", "find a component", "UI component catalog", "animated background component", "hero section component", "Spline scene in React".
license: MIT
version: 1.2.1
---

# Biblioteca de componentes

> **En NEW ERA:** módulo **Biblioteca de componentes** (`new-era/references/modulos/biblioteca.md`): la maestra la carga cuando ese módulo está activo en el brief. Usada sola, funciona igual.

Un catálogo propio de recursos de interfaz (fondos y shaders, textos animados, botones, tarjetas, heros, carruseles,
elementos de decoración, 3D…) con el código completo, sus dependencias, una demo, la licencia y el autor de cada uno y
un **prompt de integración**.

**Regla de uso:** los recursos de la librería **se copian tal cual** y, si hace falta, se modifican: rehechos «con la
idea» rara vez quedan igual de bien. Lo que **no** sale de la librería y genera cada usuario para su proyecto son los
**iconos** y lo propio de su marca (logo, ilustraciones, fotos, textos). A la librería tampoco se suben recursos
generados para un proyecto ni nada con marca.

## Quién la usa
Es la librería común de recursos de todas las skills, no solo de las webs:
- **`new-era`** y sus skills de técnica (módulo Biblioteca): piezas de interfaz, fondos, decoración.
- **Motion graphics y vídeo** (`video-desde-html`, plugins de motion graphics): fondos animados, shaders, texturas y
  textos animados que se graban en el vídeo. Se usan igual: se buscan con `buscar.mjs`, se copian y se montan en la
  composición.
- Cualquier otra skill que necesite una pieza visual: busca primero aquí antes de programarla desde cero.

## Dónde está el catálogo
El catálogo no viaja con el plugin (es código de terceros, cada pieza con su licencia). Se genera aparte con un
sincronizador propio y se apunta con variables de entorno (en el entorno del equipo, nunca en ficheros del proyecto):

```bash
# 1) carpeta local con indice.json y c/<fuente>/<slug>.json (quien mantiene el catálogo)
export BIBLIOTECA_COMPONENTES=/ruta/al/catalogo/datos

# 2) la API del catálogo con un token personal (lo que usan los demás: se recibe con una invitación)
export BIBLIOTECA_COMPONENTES=https://catalogo.ejemplo.com/api
export BIBLIOTECA_TOKEN=ne_…          # o BIBLIOTECA_TOKEN_FILE=/ruta/fuera/del/proyecto/token.txt

# 3) una web con usuario y contraseña (forma antigua; se sigue admitiendo)
export BIBLIOTECA_COMPONENTES=https://catalogo.ejemplo.com/datos
export BIBLIOTECA_AUTH_FILE=/ruta/fuera/del/proyecto/acceso.txt   # «usuario:clave», o BIBLIOTECA_AUTH en el entorno
```

Con la API, el índice (nombres, descripciones, técnica, licencia, enlace) se lee entero y cada componente se pide
cuando se va a usar (`ver <id>`), con un límite diario por persona. Los de licencia «no redistribuir» llegan sin código,
solo con su enlace: se copian de su web original. El token es personal: no se comparte ni se escribe en el proyecto.

Si no hay catálogo, el paso 1 se hace a mano en las webs de las fuentes (tabla del final) y el resto de la skill vale igual.

Formato que espera el buscador (por si se monta uno nuevo):
- `indice.json`: `{ generado, categorias:[{id,nombre}], fuentes:[{id,nombre}], recuento, componentes:[{ id:"fuente/slug", fuente, nombre, descripcion, categoria, etiquetas, deps, autor, licencia, url, tipo:"importado"|"referencia", preview:"ok"|…, motivoSinPreview }] }`
- `c/<fuente>/<slug>.json`: `{ ficheros:[{ruta,codigo}], demo, prompt, promptOrigen:"fuente"|"propio", deps, regDeps, css }`

## Paso 1 · Buscar
```bash
node scripts/buscar.mjs "fondo de partículas"              # en español o en inglés
node scripts/buscar.mjs "marquee logo" --categoria texto --con-vista
node scripts/buscar.mjs "hero con vídeo de fondo" --sin three,gsap   # deja fuera lo que dependa de esas librerías
node scripts/buscar.mjs categorias                          # hero, fondos, texto, botones, tarjetas, 3d, scroll…
node scripts/buscar.mjs fuentes                             # recuento y licencia de cada fuente
node scripts/buscar.mjs ver magicui/magic-card --todo       # código, demo, CSS y prompt
```
Busca por **lo que hace** (glow, beam, marquee, tilt, reveal, spotlight…), no por el nombre comercial. Saca 3-5
candidatos de fuentes distintas y míralos en su vista previa (la web del catálogo) antes de elegir.

La búsqueda **puntúa**, no exige: no hace falta que aparezcan todas las palabras. Mira el nombre, las etiquetas, la
categoría y la descripción, con sinónimos en español e inglés, y ordena por cuántas palabras acierta y dónde (el nombre
pesa más). Si sale poco, quita palabras o cambia la más rara por lo que hace el efecto. Cada resultado dice de qué
depende (`usa`) y, si el índice la trae, la técnica en una línea. Los componentes marcados «sin vista previa fiable» se
pueden usar igual, pero hay que probarlos antes de elegirlos: `--con-vista` los deja fuera.

## Paso 2 · Elegir (filtro rápido)
1. **¿Cuenta algo de la marca?** Un efecto que no refuerza el mensaje sobra; cuántas piezas vistosas caben lo marca la
   intensidad elegida en `new-era` (en una web inmersiva, varias; en una contenida, una firma). Todas con el mismo sistema
   (tipografía, color, curvas) para que parezcan de la misma web.
2. **Licencia.** `MIT`/`Apache`: se puede usar y modificar; conserva el aviso de copyright en el fichero. Licencias con
   «no redistribuir» o *Commons Clause*: se pueden usar dentro de un producto o web, pero no publicar el componente
   suelto (ni en un repo público de componentes ni en una plantilla que se venda). Las **referencias** (de pago o tras
   login) no tienen código: se abren en su web y, si se quieren, se compran o se pide acceso.
3. **Peso y rendimiento.** `ver <id>` avisa si el componente anima `clip-path` o `filter` (blur, etc.): eso repinta en
   cada fotograma y en móviles modestos se nota; en piezas grandes o que se repiten, cámbialo por `transform` y
   `opacity` o limítalo a un elemento pequeño. Mira `deps`: `three`, `ogl`, `@react-three/*`, `matter-js` o `gsap` añaden peso. Si la web ya usa uno de
   ellos, mejor un componente que use el mismo. Nada de dos librerías de animación para lo mismo.
4. **Pila.** Casi todos son React + Tailwind (estructura de shadcn/ui). En HTML estático, Astro sin React o una
   composición de vídeo: pásalo a JS sin dependencias **conservando el efecto exacto** (mismo shader, mismos valores,
   curvas y duraciones; solo cambia el envoltorio de React) en vez de meter React por un efecto.
5. **Accesibilidad y móvil.** Prefiere los que ya respetan `prefers-reduced-motion` (etiqueta `reduced-motion` en el
   índice) y no dependen solo del hover.

## Antes de programar (obligatorio)
El código de esta skill se monta dentro de un proyecto: no se escribe de memoria (regla 6 de `new-era`; protocolo en
`new-era/references/codigo-y-plataforma.md`).
- **`find-docs`** (cárgala con `Skill`): lee la versión en el `package.json` y consulta en esa versión las que use el componente (motion, Tailwind, Radix, React, Next.js…): la versión del catálogo y la del proyecto pueden no coincidir (Tailwind 3 contra 4, framer-motion contra motion) antes de
  usar o cambiar su API. En Next.js, además, cómo se monta en un componente de cliente y se desmonta con `destruir()`.
- **`modern-web-guidance:modern-web-guidance`** (con `Skill`): busca y aplica las guías de si el componente reimplementa algo que la plataforma ya da (diálogo, popover, anchor positioning, animación ligada al scroll, View Transitions, `<select>` personalizable), la guía decide si se adapta con la pieza nativa.
- Apunta cada consulta en `BRIEF.md` («Documentación consultada»).

## Paso 3 · Integrar
Usa el **prompt** de la ficha (`ver <id> --prompt`): trae dependencias, ficheros, CSS y la lista de adaptación. Ajusta:
- alias `@/` del proyecto y `cn()` en `@/lib/utils` (`clsx` + `tailwind-merge`);
- `regDeps`: componentes base de shadcn/ui (`button`, `input`…) que use; si el proyecto no tiene shadcn, sustitúyelos por
  los del proyecto;
- `"use client"` en Next.js App Router para todo lo que use estado, efectos o `motion`;
- el CSS extra (keyframes, variables) a la hoja global; en Tailwind v3, al `tailwind.config`.

## Paso 4 · Copiar y ajustar solo lo que haga falta
El recurso se copia **tal cual**: su efecto, sus curvas y su material son lo que lo hace bueno, y rehacerlo suele
empeorarlo. Se toca solo lo que el proyecto pida:
| Qué | Cuándo se toca |
|---|---|
| Contenido | Siempre: textos, imágenes y datos reales; nada de «Lorem», avatares de stock ni logos de ejemplo |
| Iconos y marca | Siempre: los iconos, el logo y las ilustraciones los genera el proyecto, no salen de la librería |
| Color y tipografía | Si choca con `DESIGN.md`: se pasan los colores y fuentes por los tokens de la marca |
| Tamaño y ritmo | Si no encaja en la maqueta: proporciones, densidad, duraciones (sin cambiar el carácter del efecto) |
| Interacción | Si hace falta: estados de foco y teclado, alternativa al hover en móvil, `prefers-reduced-motion` |
| Rendimiento | Si repinta de más (blur, `clip-path`) o pesa: ver el punto 3 del paso 2 |

Después: prueba a 390, 768, 1280 y 1440 px, con `prefers-reduced-motion`, con teclado, y mide que no tire el
rendimiento (sin tirones al hacer scroll; pausa fuera de pantalla). Conserva la licencia y el autor en un comentario al
principio del fichero.

## Spline (escenas 3D hechas en su editor)
Las recetas de Spline van en esta sección, no en el catálogo (son código propio, y lo que hacemos nosotros no se sube a
la librería): hero con escena y póster, objeto que mira al ratón, scroll que mueve la escena, eventos conectados a la
interfaz, variables desde React, carga diferida y la versión sin React. Lo esencial:
- `@splinetool/react-spline` (`<Spline scene=… onLoad={(app) => …} />`; en Next.js, `@splinetool/react-spline/next`) o
  `@splinetool/runtime` sobre un `<canvas>` (`new Application(canvas)` + `await app.load(url)`), o el web component
  `<spline-viewer>`.
- Desde el código: `findObjectByName`, `emitEvent`/`emitEventReverse` (los eventos tienen que existir en el editor),
  `setVariable`/`setVariables`, `addEventListener('mouseDown'|'mouseHover'|'scroll'…)`, `play`/`stop`, `dispose`.
- La URL `.splinecode` sale del editor (Export > Code). Una escena de la comunidad se **remezcla** y se exporta como
  propia; no se deduce ni se inventa la URL. Deja «Made with Spline» y el crédito del autor si es de la comunidad.
- Rendimiento: póster mientras carga, montar al entrar en pantalla, una sola escena viva por página, `dispose()` al salir.
  Planes y límites: https://spline.design/pricing (no los copies a la web, cambian).
- Para 3D que el equipo controla de punta a punta (producto con glTF, configurador), mejor `escena-3d-gltf`.

## Fuentes y qué se puede sacar de cada una
| Fuente | Cómo entra | Licencia |
|---|---|---|
| Magic UI, SmoothUI, Origin UI, Cult UI, Kokonut UI (gratis), Eldora UI, Motion Primitives, Animata, Fancy Components, Cojeev UI | Registro shadcn público o repo de GitHub | MIT (comprueba cada ficha) |
| Aceternity UI (gratis) | Registro público | Propia: uso en productos, no redistribuir |
| React Bits, shadcnblocks (gratis) | Repo de GitHub | MIT + Commons Clause: uso en productos, no redistribuir ni vender |
| Versiones Pro (Aceternity, Magic UI, React Bits, Motion Primitives, Cult, Kokonut, shadcnblocks) | Solo referencia con enlace | De pago |
| 21st.dev | Solo referencia: sus términos no permiten extraerlo de forma automática y el registro y los prompts piden cuenta o clave. Para usarlo, a mano en la web o con su API oficial (`https://21st.dev/api/v1`, clave del plan que la incluya) | La de cada componente |

Al sincronizar un catálogo propio: respeta `robots.txt`, deja una pausa de al menos un segundo entre peticiones al mismo
servidor, no saques nada de pago ni tras login y guarda autor y licencia de cada pieza.

## Checklist
- [ ] 3-5 candidatos vistos en vista previa; elegido el que cuenta algo de la marca.
- [ ] Licencia leída; aviso de copyright conservado; nada de pago copiado.
- [ ] Recurso copiado tal cual y ajustado solo en lo necesario (contenido real; color y tipografía de la marca si chocaban).
- [ ] Iconos, logo e ilustraciones generados para el proyecto (no sacados de la librería).
- [ ] Dependencias justificadas y sin duplicar librerías de animación.
- [ ] Reduced-motion, teclado, móvil (390 px) y rendimiento comprobados.
