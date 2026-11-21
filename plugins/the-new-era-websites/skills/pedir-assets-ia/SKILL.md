---
name: pedir-assets-ia
description: Director de assets de IA - dado un pedido de web, decide qué assets hacen falta y, elemento a elemento, si van con foto, foto con alfa o en capas, vídeo, vídeo con alfa, frames, código o 3D (matriz con coste, peso y riesgo); estima el coste ANTES de generar y propone la prueba más barata; redacta los prompts de imagen clave y de vídeo (en inglés, por tipo de plano) para Higgsfield o cualquier proveedor (Kling, Veo, Seedance, Wan, Runway, Luma, Midjourney, Flux, Nano Banana, GPT Image, Qwen); fija la continuidad (imagen de inicio y fin, encadenado, día/noche); y revisa el resultado ("¿se nota falso?") antes de montarlo. Úsala cuando pidan "qué assets necesito", "pide el vídeo a Higgsfield", "prompt para Kling/Veo/Seedance", "que parezca real y no IA", "cuánto cuesta generar", "imagen clave", "imagen de inicio y fin", "encadenar vídeos", "versión de noche", "¿foto o vídeo?", "pedir el producto aislado", "splash", "giro 360", "AI asset plan", "photo or video for this section", "AI video prompt for a website", "make AI video look real", "first and last frame", "Higgsfield prompt", "AI generation budget".
license: MIT
version: 1.0.0-beta.12
---

# Pedir assets realistas a la IA (y saber cuándo no)

Lo que hace que las webs de referencia parezcan reales no es el código: son **fotografías y vídeos generados por IA,
separados y bien pensados**, y el código solo los mueve con el scroll y pone encima el texto. El 3D (three.js) queda como
**respaldo barato** o para lo que el vídeo no sabe hacer (girar libre, configurar, tocar). Y no todo es vídeo: lo quieto es
foto (aislada, con alfa o en capas) que mueve el código. Esta skill hace de
director: decide, presupuesta, escribe los prompts, controla la calidad y entrega los assets a las skills que los montan.

## Pasos
1. **Guion de tramos.** Del brief (y del momento estrella de la skill `new-era`): 4-6 tramos, cada uno con lo que ve el
   usuario, su estado inicial y final, y cuánto scroll dura (1-3 pantallas).
2. **Decide el medio de cada elemento** con la matriz
   ([references/matriz-medio-por-elemento.md](references/matriz-medio-por-elemento.md)): foto, foto con alfa o en capas,
   vídeo, vídeo con alfa, frames o 3D, con su coste, peso y riesgo. **No todo es vídeo:** lo quieto (un splash congelado,
   un producto, un interior) es foto y el código lo mueve; vídeo solo donde la cámara viaja o algo cambia físicamente;
   código para todo texto, logo, pantalla y cifra; canvas (`envase-giratorio`) o frames de un render para lo que gira con
   texto; 3D en vivo solo si se toca o se configura. Parte de la receta del
   tipo de web más parecido ([references/recetas-por-tipo-de-web.md](references/recetas-por-tipo-de-web.md)).
3. **Lista de assets y presupuesto ANTES de nada:** escribe `plan.json` (`node scripts/presupuesto.mjs --ejemplo`) y
   `node scripts/presupuesto.mjs plan.json --presupuesto <lo que diga el usuario>`. Enseña el total esperado, el peor caso y
   las fases, y **espera el vale**. Sin presupuesto del usuario, pregúntalo. Si no cabe, recorta vídeo antes que calidad.
4. **Imágenes clave primero** (la fase barata): 2-3 variantes por plano con el bloque de realismo y la plantilla del plano
   ([references/plantillas-por-plano.md](references/plantillas-por-plano.md)). Revisa cada una
   (`node scripts/revisar-ia.mjs clave.png --contexto "..."` + ojo): composición no de catálogo, luces con fuente, superficies
   para el código lisas, enteras y con la proporción del logo o la pantalla. **Elige con el usuario antes de pasar al vídeo.**
5. **Imágenes finales y versiones** como edición de la clave: el final es **otra toma** (la cámara se ha movido de verdad),
   nunca un recorte ampliado; noche o estados con "relight / same shot, only change…". Continuidad en
   [references/continuidad.md](references/continuidad.md).
6. **Prueba de vídeo** del plano más difícil: 4 s en Veo (solo imagen de inicio) o 3 s en Kling estándar
   ([references/proveedores.md](references/proveedores.md)). Si pasa la revisión, los finales de 4-6 s, una tirada cada uno.
7. **Revisión de cada asset** ([references/se-nota-falso.md](references/se-nota-falso.md)): `revisar-video.mjs`, de la skill
   `video-ia-para-scroll` (`../video-ia-para-scroll/scripts/revisar-video.mjs`, gratis) →
   `revisar-ia.mjs` (céntimos) → confirmar a mano con fotogramas ampliados. Veredicto APTO / ARREGLAR POR CÓDIGO / REGENERAR.
   Regenerar solo con el prompt corregido y otra vez dentro del presupuesto.
8. **Entrega a las skills que montan:** `scroll-frames` (frames nítidos, sin mezclar), `capas-alfa` (sacar el alfa de lo
   pedido sobre fondo liso y componerlo encima o detrás del texto), `parallax-capas` (capas y sombra), `seguir-pantalla`
   (pantallas, logos y textos encima), `revelados-y-transiciones` (fotos que se descubren, zoom a un punto, cortinas),
   `mapa-zoom-ubicacion` (niveles de mapa), `lente-revelado`, `rastro-cursor`, `video-ia-para-scroll` (trucos de vídeo).
   Formato de entrega de cada tipo en `plantillas-por-plano.md` ("Formato de salida").
9. **Apunta lo gastado** en `plan.json` (`gastado_usd` por pieza), con los prompts, semillas y modelo: para repetir o cambiar poco.

## Reglas
- **Nada de pago sin precio estimado y vale** del usuario. Respeta su presupuesto: para tras cada fase y vuelve a estimar.
- **La prueba más barata primero:** imagen antes que vídeo, 3 s antes que 6, 720p o el modelo barato antes que el caro.
- **Sin texto, logos ni interfaces generados:** superficies lisas y todo eso por código. Nunca estirar un logo o una captura.
- **Un movimiento por clip,** velocidad constante, imagen de inicio (y de fin) siempre. Clips de 4-6 s; lo largo, encadenado.
- **Realismo en positivo:** cámara, objetivo, materiales con imperfecciones, luces con fuente, reflejos suaves, composición
  fuera del centro. Nada de "hyperrealistic, 8k, perfect", ni adjetivos sociales ("lujoso", "humilde", "de 19 años").
- **Agnóstico del proveedor:** Higgsfield es el principal, pero la receta y los prompts valen para cualquiera; cambia solo
  el nombre de los parámetros (tabla en `proveedores.md`).
- **El 3D es respaldo**, no el plan A, salvo que el pedido lo exija (configurador, giro con etiqueta, sin presupuesto).
- Activos con licencia de uso comercial y, si el vídeo realista generado podría confundirse con real, un aviso discreto.

## Checklist antes de dar los assets por buenos
- [ ] Cada asset tiene su medio justificado y el total gastado está dentro del presupuesto aprobado.
- [ ] Imágenes clave elegidas por el usuario; superficies para el código medidas (proporción) y lisas.
- [ ] Cada vídeo: revisado (técnica + IA + a mano), 24 fps, sin audio, inicio y fin donde se pidieron.
- [ ] Continuidad: uniones de clips comprobadas en el scroll; día y noche medidos por separado.
- [ ] Prompts, semillas, modelo y coste real apuntados.

## Referencias
- [references/matriz-medio-por-elemento.md](references/matriz-medio-por-elemento.md): foto, alfa, vídeo, frames o 3D para cada tipo de elemento, con coste, peso, riesgo y formatos.
- [references/recetas-por-tipo-de-web.md](references/recetas-por-tipo-de-web.md): qué medio para cada asset y la receta de 6 tipos de web con costes.
- [references/plantillas-por-plano.md](references/plantillas-por-plano.md): prompts de imagen clave y vídeo por tipo de plano (1-9), assets para componer (10-16: foto aislada, splash quieto, objeto en capas, vídeo para recortar, 360 por frames, mapa cenital o isométrico, fondos de ambiente), coherencia de un lote y formato de salida.
- [references/proveedores.md](references/proveedores.md): tabla de modelos de vídeo e imagen, alfa, recorte y 3D generado, precios, inicio y fin, cuándo usar cada uno.
- [references/continuidad.md](references/continuidad.md): inicio y fin, encadenar, sujeto ancla, día/noche, cortinas.
- [references/se-nota-falso.md](references/se-nota-falso.md): revisión de calidad en 4 capas, señales y su arreglo.
- `scripts/presupuesto.mjs` + `scripts/precios.json`: coste por fases antes de generar (vídeo, imagen, revisión y composición: recorte, capas, 3D). `scripts/revisar-ia.mjs`: revisión con Gemini.
