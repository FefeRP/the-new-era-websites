# Módulo: biblioteca de componentes

Catálogo propio de componentes UI (registros abiertos tipo shadcn: Magic UI, SmoothUI, Origin UI, Cult UI, Motion
Primitives, Animata y similares; las recetas de Spline van en la skill), con código, dependencias, demo, licencia y un prompt de
integración por componente. Es la librería común de recursos de todas las skills. Sus recursos (componentes, fondos,
elementos de decoración, shaders y similares) se copian tal cual y se modifican solo si hace falta; los iconos y lo
propio de la marca los genera el proyecto.

## Se activa cuando
- La web tiene **piezas de interfaz** que pueden existir ya en un catálogo: fondos animados, texto que se escribe,
  marquesinas de logos, botones con brillo, bentos, filtros, galerías, pestañas, acordeones, formularios, menús. Es
  decir, **casi siempre**: una web sobria también tiene filtros, fichas y formularios.
- El catálogo está disponible en la sesión (variable `BIBLIOTECA_COMPONENTES`, ver la skill). Si no lo está, el
  módulo queda fuera y se dice en la entrega; las piezas se hacen con `componentes-interactivos` y
  `emil-design-eng`, que son de la base.
- Hay una escena de Spline (la sección Spline de la skill; si es 3D de verdad, activa también el módulo 3D y WebGL).

## No hace falta cuando
- No hay catálogo disponible. Compruébalo (la variable `BIBLIOTECA_COMPONENTES` o la ruta que diga la skill) antes de
  decidir: «no lo he podido comprobar» no es motivo para dejarlo fuera.

## Skills que se cargan
`biblioteca-componentes` (buscador `scripts/buscar.mjs`, acceso por carpeta o por API con token, cómo leer licencias,
qué se ajusta al copiar un recurso, recetas de Spline). Antes de integrar, `find-docs` de las dependencias del componente en la versión del
proyecto.

## Técnicas
| Quiero… | Técnica | Skill |
|---|---|---|
| Una pieza de interfaz que ya existe en algún catálogo (fondo animado, texto que se escribe, marquesina de logos, botón con brillo, bento, hero con efecto) | Recurso de la librería copiado tal cual, con el contenido real y ajustado solo si hace falta | `biblioteca-componentes` |
| Escena 3D hecha en Spline (hero, objeto que sigue al ratón, configurador ligero) | Escena exportada + runtime de Spline con carga diferida | `biblioteca-componentes` (sección Spline) + módulo 3D y WebGL |

## Construir
Para cada pieza de interfaz, fondo o decoración, busca antes en la librería y copia el recurso que encaje; ajústalo solo
en lo que pida el proyecto (contenido real y, si chocan con `DESIGN.md`, color y tipografía). Si la pila es otra, se
pasa a la del proyecto conservando el efecto exacto. Los iconos y lo propio de la marca se generan para el proyecto.
Licencia de cada componente apuntada en la entrega.

## Verificar (además de la base)
- Cada recurso de la librería funciona igual que en su vista previa, con el contenido real del proyecto.
- Ningún icono, logo ni ilustración sale de la librería: son del proyecto.
- Dependencias añadidas justificadas y dentro del peso; accesibilidad del componente (teclado, foco, lector).
