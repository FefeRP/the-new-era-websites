---
name: new-era
description: Skill maestra del marketplace the-new-era-websites para construir o mejorar webs - palabra clave de activación "NEW ERA" o /new-era (siguen valiendo "WEB PREMIUM" y /web-premium, el nombre anterior). Entiende el pedido, reparte el trabajo con las skills de diseño instaladas (sistema de diseño, tipografía, microinteracciones, accesibilidad), decide el momento estrella y elige y combina técnicas (scroll con vídeo en frames, capas con alfa y profundidad, revelados y transiciones, recursos de imagen con IA como piezas sueltas, iconos de marca, texturas y fondos, componentes reutilizables como tarjeta con volteo, carrusel orbital y reseñas 3D, 3D real con glTF, mapa que baja hasta el edificio, lente de rayos X, envase que gira sin 3D), planifica los activos y su coste, monta la web con la plantilla base (Vite + GSAP + Lenis) y la verifica con capturas. Aplica las reglas aprendidas en webs reales. Úsala SIEMPRE que el pedido diga "NEW ERA", "new era website", "WEB PREMIUM", "web premium", "web de las que parecen imposibles", "web con 3D y scroll", "web tipo Apple/Awwwards", "web cinematográfica", "landing con efectos", "hazme la web de", "mejora esta web", "premium website", "awwwards style site", "cinematic scroll website", "3D scrolling website", "build a website with scroll effects".
license: MIT
version: 1.0.0-beta.8
---

# NEW ERA: de un pedido a una web hecha con oficio

Esta skill **dirige**: decide qué hacer y en qué orden, y delega el *cómo*. No todas las webs necesitan scroll
cinematográfico ni 3D: el marketplace está ordenado por **secciones de técnica** y de cada web se usa lo que le toca.

**Diseño (no vive aquí).** Sistema de diseño, tipografía, color, maquetación, textos de interfaz, microinteracciones,
accesibilidad y crítica final son de las skills de diseño instaladas (`impeccable`, `frontend-design`, `ui-ux-pro-max`,
`animate`, `emil-design-eng`, `apple-design`, `mobile-native`…). Quién manda en cada tema, el orden de trabajo y qué hacer
si no están: [references/reparto-skills-diseno.md](references/reparto-skills-diseno.md). No copies aquí sus instrucciones:
invócalas.

**Técnica y activos (vive aquí):**
| Sección | Skills |
|---|---|
| Dirección de activos y coste | `pedir-assets-ia` (qué medio lleva cada elemento, presupuesto antes de generar, prompts por plano, revisión «¿se nota falso?») |
| Recursos de imagen con IA | `recursos-imagen-ia` (piezas sueltas con alfa, iconos de marca, texturas, fondos, variantes de un objeto; revisión del lote) · `fotos-producto-ia` (el producto real en otra escena) |
| Transparencia y capas | `capas-alfa` (alfa sin Python, vídeo con alfa en todos los navegadores, texto entre capas) · `parallax-capas` (profundidad sin 3D, sombra como capa) |
| Scroll con vídeo | `video-ia-para-scroll` (cómo pedirlo) · `scroll-frames` (frames ligados al scroll) · `seguir-pantalla` (la web o el logo reales sobre una pantalla del vídeo) |
| Revelados y transiciones | `revelados-y-transiciones` (rejilla, cortina, zoom 2D, titulares por líneas, View Transitions) · `rastro-cursor` · `lente-revelado` (rayos X, antes/después) |
| Componentes | `componentes-interactivos` (tarjeta con volteo y capas, carrusel en órbita o anillo 3D, reseñas en columnas 3D) · `biblioteca-componentes` (buscar en un catálogo propio de componentes UI con licencia y prompt, y adaptarlos hasta que no se reconozcan; recetas de Spline) |
| 3D y producto | `escena-3d-gltf` (three.js con glTF) · `envase-giratorio` (lata o bote que gira sin 3D) |
| Mapas | `mapa-zoom-ubicacion` (de la ciudad al edificio: mapa vivo o por niveles de imagen) |
| Vídeo por código | `video-desde-html` (HyperFrames: el hero o un tramo de scroll a vídeo para redes; bucles sin corte, capas con alfa y secuencias para scroll sin modelo de IA) |
| Oficio | [references/reglas-de-webs-reales.md](references/reglas-de-webs-reales.md): lo aprendido en webs entregadas |

Si están instaladas, apóyate también en `gsap-skills:*` (API de GSAP) y `webgl-animation-skills:*` (shaders, partículas).

**Nunca por estilos** («plantilla de heladería»): por técnicas que se combinan según el producto, la historia y el presupuesto.

**Lo realista sale de la IA, no del 3D, y no todo es vídeo.** Lo que está quieto es **foto** (aislada, con alfa o en capas)
y lo mueve el código; **vídeo IA** solo donde la cámara viaja o algo cambia físicamente; **frames** para el scrub. El 3D en
tiempo real es el respaldo barato o la opción para lo que el vídeo no sabe hacer (girar libre, configurar, tocar). Logos,
pantallas y textos, siempre por código. La tabla por elemento está en `pedir-assets-ia` (matriz-medio-por-elemento.md).

**No toda web necesita un momento estrella.** Una web de servicio, un panel o una tienda sobria se resuelven con buen
diseño (skills de diseño), contenido real, un par de componentes y entradas discretas. El scroll fijado y el vídeo se
reservan para cuando cuentan algo.

## Paso 1 · Entender el pedido (brief)
Saca del pedido (y pregunta **solo** lo que falte y cambie la decisión, en una tanda):
1. **Negocio y protagonista**: qué se vende y cuál es *el objeto* o la idea estrella.
2. **Objetivo**: la acción que debe hacer el visitante (comprar, reservar, contactar) → el CTA.
3. **Activos disponibles**: fotos, vídeo, modelo 3D, logo, textos. Si no hay: ¿se pueden generar con IA? (cuesta dinero → presupuesto y vale).
4. **Destino técnico**: HTML estático (Vite, por defecto) o React/Next u otro CMS.
5. **Público y dispositivos**: si es sobre todo móvil (comercio local: casi siempre), manda el móvil.
6. **Marca**: colores, tipografía, tono, y si existe `DESIGN.md` o `PRODUCT.md` (se leen y se respetan). Busca primero el
   logo y los colores en el propio proyecto antes de pedirlos.
7. **Qué es verdad**: reseñas, cifras y datos que se pueden enseñar. Lo que no esté comprobado no se pone (se lista como
   «por confirmar»).

Escribe el brief en `BRIEF.md` del proyecto (10-15 líneas).

## Paso 2 · Dirección: reparto y momento estrella
1. **Reparto.** Mira qué skills de diseño hay instaladas y sigue
   [references/reparto-skills-diseno.md](references/reparto-skills-diseno.md): la estética, la tipografía, el color y los
   tokens los decide la skill de diseño (invócala con el brief). Si no hay ninguna, usa los mínimos de
   [references/direccion.md](references/direccion.md) y dilo en la entrega.
2. **Si el encargo es de peso o la dirección no está clara**: dos direcciones distintas con capturas (escritorio y móvil)
   sobre referencias reales, antes de construir. Se elige una.
3. De [references/direccion.md](references/direccion.md) lee siempre el momento estrella y el guion (recorrido y reglas de dirección); sus mínimos de tipografía y color, solo si no hay skill de diseño. Lee también [references/reglas-de-webs-reales.md](references/reglas-de-webs-reales.md) (§1-§3). Decide:
- **El momento estrella** (uno, o ninguno si la web no lo pide): la escena que la gente recordará (el producto que se despieza al bajar, la cámara que entra en la tienda, el helado rodeado de ingredientes flotando).
- **El recorrido** en 4-7 secciones: entrada (hero) → momento estrella → 2-3 secciones de apoyo (detalle, prueba, oferta) → cierre con CTA.
- **Contención**: el resto de secciones, sobrias (tipografía, reveals suaves). Si todo se mueve, nada impresiona.

## Paso 3 · Elegir técnicas
Usa la matriz de [references/catalogo-tecnicas.md](references/catalogo-tecnicas.md). Regla rápida:
| Quiero… | Técnica | Skill |
|---|---|---|
| Que el producto gire / se abra / se transforme al hacer scroll, sin interacción | Vídeo → frames | `pedir-assets-ia` + `video-ia-para-scroll` + `scroll-frames` |
| Que la cámara entre en una escena real (un estudio, una tienda, una casa) y acabe en la pantalla con la web del cliente | Vídeo IA con imagen de inicio y fin → frames + la web real encima | `pedir-assets-ia` + `scroll-frames` + `seguir-pantalla` |
| Profundidad, "3D" barato, ingredientes o elementos flotando | Fotos aisladas con alfa + capas + parallax | `capas-alfa` + `parallax-capas` |
| El titular entre el fondo y el sujeto (el texto pasa por detrás del producto) | Capas con alfa y el texto en medio | `capas-alfa` (componer capas) |
| Que el visitante gire/configure el objeto, o 3D en varias secciones | 3D real glTF | `escena-3d-gltf` |
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
| Partículas que forman figuras, distorsiones, portales | Shaders/GPGPU (fase avanzada) | catálogo (E) + `webgl-animation-skills` |
Combina 1 técnica fuerte + 1-2 de apoyo (o solo componentes y entradas discretas si la web es sobria). Anota la decisión y el porqué en `BRIEF.md`.

## Paso 4 · Plan de activos (y su coste)
Lista cada activo: qué es, de dónde sale (cliente / libre / IA / código), formato y peso objetivo.
- **Sigue `pedir-assets-ia`**: guion de tramos → medio de cada asset (vídeo IA, imagen IA, código, 3D) → `presupuesto.mjs` con el
  presupuesto del usuario → imágenes clave (baratas) elegidas antes de ningún vídeo → prueba corta → finales → revisión.
  **No generes nada de pago sin el vale de quien paga, con el precio estimado delante.**
- Vídeo con IA: detalles de movimiento y trucos en `video-ia-para-scroll`.
- Pantallas, logos y textos dentro de la escena: nunca generados; por código con `seguir-pantalla`.
- Modelos 3D: `escena-3d-gltf` (licencia, limpieza, optimización).
- Lotes de imagen (piezas con alfa, iconos, texturas, fondos): `recursos-imagen-ia`, con la primera imagen aprobada antes del resto y el lote revisado junto (`lote-imagenes.mjs`).
- Fotos de producto con IA (hero, imagen clave del vídeo, escenas): `fotos-producto-ia` (desde fotos reales, revisión contra la referencia, presupuesto).
- Recortes y transparencia: `capas-alfa` (`alfa.mjs`: pedir el elemento sobre fondo liso, negro o la pareja negro/blanco y sacar el alfa sin Python).
- Capas: `parallax-capas` (por separado, clean plate, o código). La sombra, como capa propia con `capas-sombra.mjs`.
- Sin presupuesto: activos libres (Poly Haven, Khronos, fotos del cliente) o hechos con código (SVG, degradados, render con three.js).

## Paso 5 · Construir
```bash
node scripts/nueva-web.mjs <carpeta> --con frames,pantalla,video,alfa,capas,revelados,rastro,3d,mapa,mapa-imagen,lente,envase,componentes --titulo "…" --marca "…" --fondo "#…" --texto "#…" --acento "#…"
cd <carpeta> && npm install [three] [maplibre-gl] && npm i -D playwright-core && npm run dev
```
En `--con` también valen `tarjeta`, `carrusel` y `resenas` por separado (`componentes` copia los tres). Más opciones:
`--fuente`, `--fuente-display`, `--descripcion`.
La plantilla trae Lenis + GSAP ScrollTrigger en un único bucle, reduced-motion, tokens de diseño, enlace "saltar al contenido".
Cada técnica en su fichero `src/secciones/<seccion>.js` (la carpeta `src/secciones/` se crea: la plantilla no la trae), con la maqueta y el código de las references de su skill.
**Orden**: primero todo el HTML y el texto real (la página debe tener sentido sin JS) → estilos y móvil con los tokens del
sistema de diseño → técnicas y componentes uno a uno, comprobando cada uno → microinteracciones con la skill de animación.
Antes de escribir una pieza de interfaz desde cero, busca en el catálogo (`biblioteca-componentes`, paso 1) y adapta lo
que encaje con su tabla de cambios: nunca un componente de catálogo tal cual.
Si el proyecto ya existe (React, Next, Astro…), no se usa la plantilla: se copian los motores a su carpeta de librerías y se
montan dentro de sus componentes (todos devuelven `destruir()` para el desmontaje).

## Paso 6 · Verificar (antes de enseñar nada)
1. `node scripts/verificar-scroll.mjs http://127.0.0.1:5173 capturas/` → capturas en 8 posiciones (escritorio y móvil) + pasada con reduced-motion + errores de consola + peticiones fallidas + hojas de contactos. Debe salir sin errores.
2. Mira las hojas: sin huecos en blanco, textos legibles sobre el fondo en todas las posiciones, el momento estrella se ve en móvil.
3. Revisión visual con un modelo de visión (p. ej. Gemini) de las hojas o de una grabación del scroll; contrasta cada
   aviso con la captura (da falsos positivos).
4. Tamaños de móvil que fallan: 390×844, 360×740 y apaisados 844×390 y 932×430. Sin desplazamiento lateral.
5. `npm run build` sin errores; peso total dentro del presupuesto ([references/base-tecnica.md](references/base-tecnica.md)).
6. Repasa la checklist final de base-tecnica.
7. Con la página ya sin errores, **crítica y auditoría** con la skill de diseño instalada (p. ej. `impeccable`: critique,
   audit, polish); corrige y vuelve al punto 1.

## Paso 7 · Entregar
Resumen corto: técnicas y componentes usados y por qué, qué decidió cada skill de diseño, activos (origen y licencia), pesos, qué se ha comprobado (capturas), qué queda (activos definitivos, textos del cliente, datos «por confirmar», dominio) y si está solo en local o publicado.

## Referencias
- [references/catalogo-tecnicas.md](references/catalogo-tecnicas.md): catálogo de efectos y técnicas (qué es, cómo se hace, coste, skill), organizado por técnica.
- [references/direccion.md](references/direccion.md): recorrido, momento estrella, contención, tipografía, lo que da "aspecto de IA" y cómo evitarlo.
- [references/reparto-skills-diseno.md](references/reparto-skills-diseno.md): quién manda en cada tema entre este marketplace y las skills de diseño instaladas.
- [references/reglas-de-webs-reales.md](references/reglas-de-webs-reales.md): reglas y recetas sacadas de webs entregadas (dirección, carga, móvil, trampas de CSS, comprobación).
- [references/base-tecnica.md](references/base-tecnica.md): presupuestos globales, rendimiento, accesibilidad, SEO y checklist final.
