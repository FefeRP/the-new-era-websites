---
name: video-ia-para-scroll
description: Cómo pedir a un generador de vídeo con IA (Higgsfield y sus modelos Seedance 2.5/2.0, Kling 3.0/O3/4.0, Veo 3.1, Wan 3.0, MiniMax, Cinema Studio) el vídeo pensado para el hero o el scroll de una web, no un anuncio, y cómo montarlo. Trae una guía por modelo (parámetros reales de la API y la web, precio medido por segundo y resolución, fallos conocidos), una biblioteca de plantillas de prompt por tipo de plano (intro hacia delante, revelado de logo, fondo en bucle, transición entre secciones, producto 360, despiece, FPV…), un árbol de decisión de modelo según plano y presupuesto, checklists de antes y después de generar, flujos (imagen clave a vídeo, encadenar, bucles, extender, upscale, deflicker, logo sin deformar), la receta técnica de montaje medida (códec, GOP, frames frente a vídeo, móvil, carga, movimiento reducido), el precio de un lote sin generar (estimar-higgsfield.mjs) y el control de calidad del vídeo recibido (revisar-video.mjs: cortes, saltos, tirones, avance real de la cámara, parpadeo). Úsala cuando haya que "generar el vídeo del producto para la web", "pedir el vídeo a Higgsfield", "Higgsfield para webs", "intro en vídeo por scroll", "prompt para Kling/Veo/Seedance", "primer y último fotograma", "el vídeo da un salto", "la cámara no avanza", "vídeo para scroll", "hero video con IA", "fondo en bucle con IA", "AI video for scroll animation", "scroll-driven video intro", "first and last frame", "exploded view video", "product orbit video", "producto por dentro", "scroll sobre imagen realista", "web como la del cruasán", "inside the product scroll story", "qué modelo de Higgsfield uso", "cuánto cuesta en Higgsfield", "revelado de logo en vídeo", "bucle de fondo con IA", "transición en vídeo entre secciones", "Seedance 2.5", "Kling 4", "Wan 3", "which Higgsfield model", "logo reveal video", "scrub video codec", "keyframe interval for scroll video".
license: MIT
version: 1.0.1
---

# Pedir el vídeo para scroll a una IA

> **En NEW ERA:** módulo **Vídeo con IA** (`new-era/references/modulos/video-ia.md`): la maestra la carga cuando ese módulo está activo en el brief. Usada sola, funciona igual.

Un vídeo para scroll no es un anuncio. El visitante lo va a **arrastrar** adelante y atrás, frame a frame:
cualquier corte, acelerón, parpadeo o deformación se nota diez veces más que en un vídeo que se reproduce.
El objetivo es **un único plano continuo, a velocidad constante, con el producto estable y fondo limpio**.

> **Dinero:** generar cuesta créditos. Antes de lanzar nada, presupuesta sin gastar: `node scripts/estimar-higgsfield.mjs
> lote lote.json` (API de Higgsfield, `/estimate` es gratis; clave en `HF_API_KEY_ID`/`HF_API_KEY_SECRET`) o
> `estimate_video_cost` en el MCP. Luego **pide el vale** a quien paga. Itera en la imagen (barata), no en el vídeo
> (~30-40× más caro).

> **Higgsfield para webs (intros, revelados de logo, fondos, transiciones, marcos, cristal):** empieza por
> [references/higgsfield-para-webs.md](references/higgsfield-para-webs.md), que es la guía central y el mapa de lo
> demás. El modelo se elige con [references/arbol-decision.md](references/arbol-decision.md), y cada modelo tiene su
> ficha en [references/modelos/](references/modelos/README.md). El prompt sale de
> [references/plantillas-prompt.md](references/plantillas-prompt.md) y las checklists están en
> [references/checklists.md](references/checklists.md). Para encadenar, hacer bucles, reescalar o meter la marca, ve a
> [references/flujos.md](references/flujos.md); para montarlo en la web, a
> [references/montaje-web.md](references/montaje-web.md).

> **Antes de esta skill:** `pedir-assets-ia` decide qué assets van con vídeo, imagen, código o 3D, calcula el presupuesto
> (`presupuesto.mjs`), da los prompts de escena por tipo de plano y la revisión "¿se nota falso?". Esta skill se centra en el
> movimiento del vídeo para scroll. Las pantallas, logos y textos de la escena van por código con `seguir-pantalla`.

## Reglas de oro
1. **Imagen a vídeo, nunca texto a vídeo.** Primero la imagen clave (foto real del producto o imagen generada y aprobada); el vídeo parte de ella. Con texto a vídeo sale *otro* producto.
2. **Un solo movimiento de cámara**, lento y continuo, de principio a fin ("begins immediately in the very first frame and continues without pause until the final frame"). Nada de combinar órbita + zoom + partículas.
3. **Velocidad constante** ("constant speed", "steady", "linear"). Sin arranque ni frenada.
4. **El producto no cambia**: misma forma, color, material, proporciones, logo ("every component keeps its exact shape, colour and material").
5. **Fondo liso de estudio** del color que tendrá la web (o claramente recortable), luz suave y estable.
6. **Sin texto en el vídeo**: el texto va en HTML. Pide "no text, no logos" salvo el logo real que ya trae la imagen clave.
7. **Espacio para el texto**: producto centrado con aire a los dos lados ("product centred, empty space on both sides"), para poder recortar a 9:16. El tercio derecho ("product on the right third, empty space on the left") solo si no hay versión móvil.
8. **Encuadre con margen**: producto al ~70-85 % del alto y centrado, con aire lateral para poder recortar a 9:16 en móvil.
9. **Varias tiradas baratas** antes que una cara: varía más entre tiradas que entre niveles de calidad.
10. **Último fotograma solo si es físicamente alcanzable**: lo que la cámara vería tras avanzar unos metros, con la misma lente, altura y luz. Si el fin está lejos (otro sitio, otra luz), el modelo se salta el camino y da un salto; si está demasiado cerca, no hay recorrido. Para llegar a algo exacto (un logo), dos pasadas o el logo por código (`references/higgsfield-para-webs.md` §4).
11. **Encuadre abierto desde la imagen clave** (gran angular, aire): el ángulo lo fija la imagen, no el prompt del vídeo, y cada acercamiento por código lo cierra más.
12. **Mide antes de montar**: `revisar-video.mjs` mide el avance real de la cámara, los saltos y los tirones. Un revisor con IA no basta.

## Proceso
1. **Coreografía del scroll** (antes de abrir el generador). Escribe en una frase qué pasa de 0 % a 100 % del scroll y dónde aparecen los textos. Ej.: "0 %: reloj de perfil; 50 %: esfera de frente; 100 %: perfil opuesto, más cerca. Textos: 15 % caja, 55 % esfera, 85 % correa."
2. **Elige el tipo de plano** de [references/plantillas-prompt.md](references/plantillas-prompt.md): intro hacia delante, revelado de logo, fondo en bucle, transición entre secciones, producto 360 o arco, giro, dolly o grúa de revelado, despiece, ingredientes, líquido, FPV, hero con poco movimiento y la obra al revés (del resultado final a su construcción, con Seedance 2.5 y la imagen final como referencia). Cada plantilla dice si está publicada, medida o solo sigue las reglas.
   Si la web cuenta el producto **por dentro en varios tramos** (se parte → capas → entrar dentro → cambio de estado → rayos X, como ref11), sigue la receta completa de [references/receta-producto-por-dentro.md](references/receta-producto-por-dentro.md): tramos encadenados por fotograma, prompts y presupuesto.
3. **Imagen clave**: genera o retoca la imagen inicial (y la final si el modelo admite fotograma final). Aprueba la imagen antes del vídeo. Si parte de fotos reales del producto, sigue `fotos-producto-ia` (referencias, prompt y revisión contra la referencia: un logo deformado en la imagen clave sale deformado en todo el vídeo).
4. **Modelo**: [references/arbol-decision.md](references/arbol-decision.md) según plano y presupuesto; parámetros y fallos en la ficha del modelo (`references/modelos/`); presets y lente en [references/modelos-y-camaras.md](references/modelos-y-camaras.md). Regla rápida: intro o recorrido continuo → Seedance 2.5 con imagen de inicio (borrador a 480p primero; barato: Wan 3.0; con paradas: Kling 4.0); revelado de logo → Seedance 2.0 con la portada como imagen final; producto o interior con recorrido corto e inicio+fin → Kling O3 / 3.0 (mide que avance); bucle → Kling 3.0 std (inicial = final); máxima calidad de luz 8 s → Veo 3.1 (solo web); plano largo → Seedance 2.5 en una toma (hasta 30 s).
   Antes de lanzar, la **checklist** de [references/checklists.md](references/checklists.md) y el precio del lote con `scripts/estimar-higgsfield.mjs`.
5. **Parámetros**: 4-6 s (5 por defecto; ≈96-144 frames a 24 fps: de sobra); 8 s solo en Veo cuando hace falta el fotograma final, y se recorta. 1080p mínimo, 16:9 para escritorio (con Seedance 2.5, 720p si el presupuesto no llega: 1080p cuesta 2,5 veces más; la prueba de estructura, a 480p). Para móvil: o recorte central 9:16 (si pediste margen) o una segunda generación vertical con la misma imagen clave.
6. **Prompt**: plantilla = *preámbulo de estilo fijo* + *movimiento* + *estabilidad* + *restricciones en positivo al final* ("Keep…", "no text, no logos"). Campo negativo solo en los modelos que lo tienen (Wan, Seedance, Qwen, Flux). Con imagen a vídeo describe el **movimiento**, no el aspecto (eso ya lo da la imagen).
7. **Control de calidad** del vídeo recibido:
   ```bash
   node scripts/revisar-video.mjs video.mp4      # cortes (scdet), saltos y tirones, avance de la cámara, acelerones,
                                                 # frames duplicados, tramos quietos, parpadeo + hoja de contactos
   ```
   Mira la hoja en los segundos que señala el informe (da el segundo de cada viñeta) y pásale la revisión de realismo (`pedir-assets-ia/scripts/revisar-ia.mjs` + señales de `se-nota-falso.md`).
   Checklist de aceptación abajo. Si la velocidad es irregular o la cámara frena, arréglalo por código (§7 de `higgsfield-para-webs.md`); regenera solo si hay cortes, saltos o deformaciones.
8. **Monta** con [references/montaje-web.md](references/montaje-web.md) (recodificar siempre: Higgsfield entrega un solo fotograma clave por clip) y `scroll-frames` con los `--inicio/--fin` que sugiere el informe.

## Trucos que ahorran tiradas
- **Montaje = despiece al revés**: genera la explosión (sale mejor) e inviértela: `ffmpeg -i despiece.mp4 -vf reverse montaje.mp4`.
- **Bucle perfecto**: misma imagen como fotograma inicial y final (Kling 3.0 std). O ida y vuelta: `ffmpeg -i v.mp4 -filter_complex "[0]reverse[r];[0][r]concat=n=2:v=1" ida-vuelta.mp4`. Más en `references/flujos.md`.
- **Secuencias largas sin morphing**: una toma larga de Seedance 2.5, o clips encadenados por el último fotograma en PNG (`ffmpeg -sseof -1 -i a.mp4 -update 1 ultimo.png`) y unidos sin el fotograma repetido (`references/flujos.md`).
- **Borrador de Seedance 2.5** (480p, 15 créditos): la estructura se ve igual que a 1080p; finalízalo solo si sirve.
- **Velocidad**: si el generador acelera al final, recorta el tramo útil o remapea (`setpts`).
- **Parpadeo leve**: `video_deflicker` de Higgsfield (2 créditos) o `ffmpeg -i v.mp4 -vf "nlmeans=s=6:p=3:r=9,tmix=frames=3:weights='1 2 1'" v2.mp4` antes de reescalar o extraer.

## Checklist de aceptación del vídeo
- [ ] Un solo plano, sin cortes ni saltos (revisar-video: `cortes`, `escenas`, `saltos` y `tirones` vacíos).
- [ ] Si la cámara avanza: avanza en todo el clip (sin `tramosParados`; en una intro, ×1,1 o más cada medio segundo) y no hay aviso de recorrido corto.
- [ ] Velocidad constante: sin acelerones ni frames duplicados (variación ≤ 0,45 ideal, ≤ 0,7 aceptable; un giro perfecto da ~0,35 porque el movimiento aparente cambia con lo que se ve).
- [ ] El producto es el real: forma, color, logo y proporciones intactos en TODOS los frames de la hoja.
- [ ] Sin texto basura, sin manos/dedos raros, sin objetos que aparecen o desaparecen.
- [ ] Fondo estable (no "respira" ni cambia de tono); sin parpadeo.
- [ ] Hay hueco limpio donde irán los textos.
- [ ] 1080p o más; margen para recorte móvil o versión vertical aparte.
- [ ] Licencia/derechos: la imagen clave es del cliente o generada; nada de marcas ajenas.

## Referencias
- [references/higgsfield-para-webs.md](references/higgsfield-para-webs.md): la guía central y el mapa (modelo por pieza, primer y último fotograma sin saltos, comprobación, arreglos por código, precios medidos el 21-11-2026, lecciones de intros reales).
- [references/modelos/](references/modelos/README.md): una ficha por modelo de vídeo (Seedance 2.5 y 2.0, Kling 3.0/O3 y 4.0, Veo 3.1, Wan, otros) y de imagen clave, con parámetros de la API y la web, precio, fallos, prompt de partida y fuentes.
- [references/arbol-decision.md](references/arbol-decision.md): qué modelo según el plano, la resolución y el presupuesto, con presupuestos por tipo de web.
- [references/plantillas-prompt.md](references/plantillas-prompt.md): biblioteca de 14 plantillas por tipo de plano, cada una con su modelo, su imagen clave, su estado (publicada, medida o por reglas) y su fuente.
- [references/checklists.md](references/checklists.md): antes de generar y después de recibir.
- [references/flujos.md](references/flujos.md): imagen clave → vídeo, encadenar, extender, bucles, upscale, deflicker y marca sin deformar.
- [references/montaje-web.md](references/montaje-web.md): la receta técnica de montaje medida (códec, GOP, pesos, tiempos de búsqueda, frames o vídeo, móvil, carga, póster, movimiento reducido).
- [references/modelos-y-camaras.md](references/modelos-y-camaras.md): presets de cámara de Higgsfield que sirven para webs y los que no, lente y FOV, cómo pedir velocidad constante.
- `scripts/estimar-higgsfield.mjs`: catálogo y precio de la API de Higgsfield sin generar (`modelos`, `precio`, `lote`, `tabla`).
- `scripts/revisar-video.mjs`: control de calidad del vídeo recibido.
- [references/receta-producto-por-dentro.md](references/receta-producto-por-dentro.md): el producto realista sobre negro contado en tramos (rotura, corte, entrar dentro, cambio de estado, rayos X) con Higgsfield: activos, prompts, encadenado, montaje y presupuesto (ref11).
