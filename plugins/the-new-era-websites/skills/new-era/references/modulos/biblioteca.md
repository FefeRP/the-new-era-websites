# Módulo: biblioteca de componentes

Catálogo propio de componentes UI (registros abiertos tipo shadcn: Magic UI, SmoothUI, Origin UI, Cult UI, Motion
Primitives, Animata y similares, más recetas de Spline), con código, dependencias, demo, licencia y un prompt de
integración por componente. Nunca se pega un componente tal cual: se adapta hasta que no se parezca al original.

## Se activa cuando
- La web tiene **piezas de interfaz** que pueden existir ya en un catálogo: fondos animados, texto que se escribe,
  marquesinas de logos, botones con brillo, bentos, filtros, galerías, pestañas, acordeones, formularios, menús. Es
  decir, **casi siempre**: una web sobria también tiene filtros, fichas y formularios.
- El catálogo está disponible en la sesión (variable `BIBLIOTECA_COMPONENTES`, ver la skill). Si no lo está, el
  módulo queda fuera y se dice en la entrega; las piezas se hacen con `componentes-interactivos` y
  `emil-design-eng`, que son de la base.
- Hay una escena de Spline (sus recetas `spline/*`; si es 3D de verdad, activa también el módulo 3D y WebGL).

## No hace falta cuando
- No hay catálogo disponible. Compruébalo (la variable `BIBLIOTECA_COMPONENTES` o la ruta que diga la skill) antes de
  decidir: «no lo he podido comprobar» no es motivo para dejarlo fuera.

## Skills que se cargan
`biblioteca-componentes` (buscador `scripts/buscar.mjs`, cómo leer licencias, cómo cambiar un componente hasta que no
se parezca, recetas de Spline). Antes de integrar, `find-docs` de las dependencias del componente en la versión del
proyecto.

## Técnicas
| Quiero… | Técnica | Skill |
|---|---|---|
| Una pieza de interfaz que ya existe en algún catálogo (fondo animado, texto que se escribe, marquesina de logos, botón con brillo, bento, hero con efecto) | Componente del catálogo propio, adaptado (nunca tal cual) | `biblioteca-componentes` |
| Escena 3D hecha en Spline (hero, objeto que sigue al ratón, configurador ligero) | Escena exportada + runtime de Spline con carga diferida | `biblioteca-componentes` (recetas `spline/*`) + módulo 3D y WebGL |

## Construir
Para cada pieza de interfaz, busca antes en el catálogo y adapta lo que encaje con su tabla de cambios (tipografía,
color, radios, movimiento e interacción de `DESIGN.md`); lo que el catálogo no tenga con la pila del proyecto, se
rehace con la idea. Licencia de cada componente apuntada en la entrega.

## Verificar (además de la base)
- Ningún componente se reconoce a simple vista como el del catálogo (prueba del genérico).
- Dependencias añadidas justificadas y dentro del peso; accesibilidad del componente (teclado, foco, lector).
