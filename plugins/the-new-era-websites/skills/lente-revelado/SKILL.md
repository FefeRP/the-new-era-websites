---
name: lente-revelado
description: "Dos imágenes alineadas: una lente que sigue al cursor (rayos X, térmica, interior) o un comparador antes y después con cortina. «ver por dentro con el ratón», «rayos X al pasar», «antes y después», «x-ray hover», «before after slider». NO para transiciones entre secciones (revelados-y-transiciones)."
license: MIT
version: 1.3.0
---

# Lente de revelado (rayos X, térmica, antes/después)

> **En NEW ERA:** módulo **Assets de IA (foto, alfa y capas)** (`new-era/references/modulos/assets-ia.md`): la maestra la carga cuando ese módulo está activo en el brief. Usada sola, funciona igual.

Dos imágenes **idénticas en encuadre** apiladas. La de arriba solo se ve dentro de una máscara (`mask-image`): un círculo que sigue
al cursor (lente) o un corte que avanza con el scroll (cortina). Es barato (solo CSS en GPU), funciona en cualquier móvil y, bien
hecho, es de los efectos que la gente toca una y otra vez. Visto en ref11 (cruasán: "X-ray vision. No crumbs.", con X-ray / Thermal).

## Cuándo sí y cuándo no
- **Sí:** producto con un interior que vende (miga, mecanismo, capas, relleno, materiales), "lo que no se ve" (térmica de un
  aislante, estructura de una zapatilla), antes/después (reforma, limpieza, retoque, cosmética).
- **No:** si el interior debe **moverse** (entrar dentro, despiece) → `video-ia-para-scroll` + `scroll-frames`. Si la imagen base
  es un vídeo o frames que cambian, la variante tendría que cambiar igual: mejor una imagen fija al final del tramo.

## Antes de programar (obligatorio)
El código de esta skill se monta dentro de un proyecto: no se escribe de memoria (regla 6 de `new-era`; protocolo en
`new-era/references/codigo-y-plataforma.md`).
- **`find-docs`** (cárgala con `Skill`): lee la versión en el `package.json` y consulta en esa versión GSAP si se usa antes de
  usar o cambiar su API. En Next.js, además, cómo se monta en un componente de cliente y se desmonta con `destruir()`.
- **`modern-web-guidance:modern-web-guidance`** (con `Skill`): busca y aplica las guías de formatos y densidades de las dos imágenes, eventos de puntero y táctil, alternativa accesible a la comparación, reduced-motion.
- Apunta cada consulta en `BRIEF.md` («Documentación consultada»).

## Pasos
1. **Imagen base:** la imagen clave del producto (o el último frame del tramo anterior, para que el paso sea invisible).
   Mejor con alfa o sobre fondo liso.
2. **Variante alineada** (el 90 % del resultado):
   - **Estilo, sin coste:** `node scripts/variantes-revelado.mjs --entrada base.png --salida public/revelado [--modos rayosx,termica] [--invertir]`.
     - Saca `rayosx.webp`, `termica.webp` y `base.webp` del mismo tamaño; si la entrada tiene alfa, lo conservan.
     - Da un rayos X "de estilo": bordes y densidad de lo que ya se ve.
   - **Interior real que no se ve por fuera** (alvéolos, mecanismo): edición con IA **sobre la misma imagen**. Prompts y coste en
     [references/activos-ia.md](references/activos-ia.md).
     - Después: `node scripts/variantes-revelado.mjs --comprobar base.png variante.png`. Debe salir ≤ 0,5 % de silueta distinta; > 2 % es inservible: se nota el "salto" bajo la lente.
3. **Maqueta y motor** ([references/patrones-codigo.md](references/patrones-codigo.md)):
   - `crearLenteRevelado(raiz, { radio })` y botones de modo con `aria-pressed`.
   - Para antes/después: `lente.cortina(progreso)` desde el scroll. Esta cortina descubre **otra versión alineada de la
     misma imagen** (antes/después, rayos X); para cambiar de escena o de capítulo con un panel que tapa el cambio, usa
     `crearCortina` de `revelados-y-transiciones`.
4. **Encima, la "mira"** (`.revelado__anillo`): un anillo fino con marcas y, si cuadra, un rótulo de datos pequeño. Es lo que la hace
   parecer un instrumento y no un truco.
5. **Verifica:**
   - `../new-era/scripts/verificar-scroll.mjs`: errores 0, la cortina en sus tramos.
   - Prueba de interacción con Playwright: la lente se abre bajo el cursor, cambia de modo y se cierra al salir; en móvil pasea sola. Hay un ejemplo en `pruebas/lente-envase/probar-interaccion.mjs` del repositorio.

## Reglas
- **Alineación perfecta o nada.** Mismo tamaño, encuadre y silueta. Las dos capas, con el mismo `object-fit` y el mismo contenedor.
- **Radio:** 90-140 px en escritorio (el motor lo limita al 30 % del lado menor) y borde fundido de 12-24 px.
- **Que se descubra:** dilo en el texto ("Pasa el cursor por encima…"). En móvil, la lente pasea sola hasta que el dedo la toca (`paseo`) y se arrastra con el dedo en horizontal sin bloquear el scroll (`touch-action: pan-y`).
- **Accesibilidad:** la base lleva el `alt`; las variantes, `alt=""` y `aria-hidden`. Si el interior cuenta algo importante, ponlo también en texto.
- **Menos movimiento:** lente quieta en el centro, sin paseo; con la cortina, enseña la mitad.

## Checklist de rendimiento
- [ ] Variantes en WebP/AVIF del mismo tamaño que la base (~50-150 KB cada una a 1200 px).
- [ ] El motor solo cambia `mask-image` y `transform` del anillo, sin layout. Render bajo demanda y parado fuera de pantalla.
- [ ] `loading="lazy"` en las variantes si la sección está lejos del principio.

## Referencias
- [references/patrones-codigo.md](references/patrones-codigo.md): maqueta, CSS del anillo, interruptor, cortina con ScrollTrigger y trampas.
- [references/activos-ia.md](references/activos-ia.md): cómo pedir la variante interior a Higgsfield (Nano Banana Pro / GPT Image), con su coste y revisión.
