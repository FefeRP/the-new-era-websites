---
name: rastro-cursor
description: Rastro de imágenes que siguen al cursor (image trail) - al mover el ratón por una zona aparecen fotos en el puntero que se apilan, siguen la inercia y se desvanecen. Motor rastro-cursor.js sin dependencias (pool fijo de img, Web Animations), solo con ratón; en táctil y con reduced-motion deja una composición estática. Úsala cuando pidan "fotos que siguen al ratón", "rastro de imágenes", "estela del cursor", "galería que aparece al mover el ratón", "efecto de cursor con fotos", "image trail", "cursor trail images", "mouse trail gallery", "hover image trail".
license: MIT
version: 1.2.1
---

# Rastro de imágenes en el cursor

> **En NEW ERA:** es de la **base común** (vale para cualquier web, sin activar módulos).

Un efecto de portada o de galería: al mover el ratón por una zona van saliendo fotos en el puntero que se apilan y se
apagan. Funciona porque es inesperado y cuesta muy poco: fotos normales (de producto, del equipo, de proyectos), sin
vídeo ni 3D. La idea es la de los ImageTrailEffects de Codrops (MIT), reescrita sin dependencias.

## Antes de programar (obligatorio)
El código de esta skill se monta dentro de un proyecto: no se escribe de memoria (regla 6 de `new-era`; protocolo en
`new-era/references/codigo-y-plataforma.md`).
- **`find-docs`** (cárgala con `Skill`): lee la versión en el `package.json` y consulta en esa versión GSAP si se usa antes de
  usar o cambiar su API. En Next.js, además, cómo se monta en un componente de cliente y se desmonta con `destruir()`.
- **`modern-web-guidance:modern-web-guidance`** (con `Skill`): busca y aplica las guías de eventos de puntero, INP, imágenes decorativas optimizadas, reduced-motion.
- Apunta cada consulta en `BRIEF.md` («Documentación consultada»).

## Pasos
1. **Elige 6-12 fotos** del mismo formato y tratamiento (mismo encuadre, luz y color; si son de IA, del mismo lote con las
   reglas de coherencia de `pedir-assets-ia`). Exporta a WebP de ~400-600 px de ancho y <60 KB cada una.
2. **Monta la zona** con su contenido estático (titular y 2-3 fotos quietas): es lo que ven el móvil y quien prefiere menos
   movimiento.
3. **Activa el rastro**:
   ```js
   import { crearRastro } from './rastro-cursor.js';
   const rastro = crearRastro(document.querySelector('.portada'), {
     imagenes: ['/rastro/1.webp', '/rastro/2.webp', '/rastro/3.webp', '/rastro/4.webp', '/rastro/5.webp', '/rastro/6.webp'],
     distancia: 90,   // px de recorrido entre foto y foto
     vida: 900,       // ms hasta que se apaga
   });
   if (!rastro.activo) { /* táctil o reduced-motion: queda el contenido estático */ }
   // al desmontar: rastro.destruir();
   ```
4. **Ajusta** `distancia` (más = menos fotos), `ancho` (CSS, por defecto `clamp(140px, 16vw, 240px)`), `inercia` y
   `rotacion` (0 para un aire más sobrio).
5. **Comprueba** con la prueba de referencia `pruebas/revelados-rastro/` del repositorio (aparecen al mover, el pool no crece, se
   apagan al parar, desactivado en táctil y con reduced-motion).

## Reglas
- El rastro **decora**: nada importante puede depender de él (en móvil no existe).
- Las fotos se precargan y decodifican antes de usarse; la capa es `aria-hidden` y `pointer-events: none` (no tapa
  enlaces ni botones).
- Un rastro por página, en una zona acotada (portada o una sección), no en toda la web.

## Checklist
- [ ] 6-12 fotos coherentes, WebP <60 KB cada una.
- [ ] Contenido estático de la zona correcto sin el efecto (móvil, reduced-motion).
- [ ] Sin texto importante bajo la zona del rastro (las fotos lo tapan al pasar).
- [ ] `destruir()` al desmontar en una SPA; 0 errores de consola.
