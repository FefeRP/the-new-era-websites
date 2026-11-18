---
name: video-ia-para-scroll
description: Cómo pedir a un generador de vídeo con IA (Higgsfield y sus modelos Kling, Veo, Seedance, WAN, Hailuo; también Luma, Runway) el vídeo pensado para el hero o el scroll de una web, no un anuncio - coreografía, imagen clave primero, preset de cámara, fondo limpio, velocidad constante, bucle, duración, resolución y plantillas de prompt por tipo de plano (giro, despiece, ingredientes, vuelo a través, transición, bucle). Incluye el control de calidad del vídeo recibido (cortes, velocidad, parpadeo) antes de partirlo en frames. Úsala cuando haya que "generar el vídeo del producto para la web", "pedir el vídeo a Higgsfield", "prompt para Kling/Veo", "vídeo para scroll", "hero video con IA", "AI video for scroll animation", "exploded view video", "product orbit video", "producto por dentro", "scroll sobre imagen realista", "web como la del cruasán", "inside the product scroll story".
license: MIT
version: 1.0.0-beta.10
---

# Pedir el vídeo para scroll a una IA

Un vídeo para scroll no es un anuncio. El visitante lo va a **arrastrar** adelante y atrás, frame a frame:
cualquier corte, acelerón, parpadeo o deformación se nota diez veces más que en un vídeo que se reproduce.
El objetivo es **un único plano continuo, a velocidad constante, con el producto estable y fondo limpio**.

> **Dinero:** generar cuesta créditos. Antes de lanzar nada, presupuesta (nº de tiradas × coste por clip del modelo elegido;
> mírelo en la herramienta o en el MCP de Higgsfield, que da el coste antes de generar) y **pide el vale** a quien paga.
> Itera en la imagen (barata), no en el vídeo (~30-40× más caro).

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

## Proceso
1. **Coreografía del scroll** (antes de abrir el generador). Escribe en una frase qué pasa de 0 % a 100 % del scroll y dónde aparecen los textos. Ej.: "0 %: reloj de perfil; 50 %: esfera de frente; 100 %: perfil opuesto, más cerca. Textos: 15 % caja, 55 % esfera, 85 % correa."
2. **Elige el tipo de plano** de [references/plantillas-prompt.md](references/plantillas-prompt.md): giro/arco, dolly de revelado, despiece, montaje, ingredientes, caída/líquido, vuelo a través, transición encadenada, bucle.
   Si la web cuenta el producto **por dentro en varios tramos** (se parte → capas → entrar dentro → cambio de estado → rayos X, como ref11), sigue la receta completa de [references/receta-producto-por-dentro.md](references/receta-producto-por-dentro.md): tramos encadenados por fotograma, prompts y presupuesto.
3. **Imagen clave**: genera o retoca la imagen inicial (y la final si el modelo admite fotograma final). Aprueba la imagen antes del vídeo. Si parte de fotos reales del producto, sigue `fotos-producto-ia` (referencias, prompt y revisión contra la referencia: un logo deformado en la imagen clave sale deformado en todo el vídeo).
4. **Modelo y preset**: tabla en [references/modelos-y-camaras.md](references/modelos-y-camaras.md). Regla rápida: interiores y producto con inicio+fin → Kling O3 pro (mejor calidad/precio); bucle → Kling (inicial = final) o Luma (modo loop); máxima calidad de luz 8 s → Veo 3.1; plano largo → mejor 2-4 clips encadenados que uno de 30 s.
5. **Parámetros**: 4-6 s (5 por defecto; ≈96-144 frames a 24 fps: de sobra); 8 s solo en Veo cuando hace falta el fotograma final, y se recorta. 1080p mínimo, 16:9 para escritorio. Para móvil: o recorte central 9:16 (si pediste margen) o una segunda generación vertical con la misma imagen clave.
6. **Prompt**: plantilla = *preámbulo de estilo fijo* + *movimiento* + *estabilidad* + *restricciones en positivo al final* ("Keep…", "no text, no logos"). Campo negativo solo en los modelos que lo tienen (Wan, Seedance, Qwen, Flux). Con imagen a vídeo describe el **movimiento**, no el aspecto (eso ya lo da la imagen).
7. **Control de calidad** del vídeo recibido:
   ```bash
   node scripts/revisar-video.mjs video.mp4      # cortes, acelerones, frames duplicados, tramos quietos, parpadeo + hoja de contactos
   ```
   Mira la hoja y pásale la revisión de realismo (`pedir-assets-ia/scripts/revisar-ia.mjs` + señales de `se-nota-falso.md`).
   Checklist de aceptación abajo. Si la velocidad es irregular, remapea la velocidad o recorta; regenera solo si hay cortes o deformaciones.
8. **Pasa a `scroll-frames`** con los `--inicio/--fin` que sugiere el informe.

## Trucos que ahorran tiradas
- **Montaje = despiece al revés**: genera la explosión (sale mejor) e inviértela: `ffmpeg -i despiece.mp4 -vf reverse montaje.mp4`.
- **Bucle perfecto**: misma imagen como fotograma inicial y final (Kling, Luma loop). O ida y vuelta: `ffmpeg -i v.mp4 -filter_complex "[0]reverse[r];[0][r]concat=n=2:v=1" ida-vuelta.mp4`.
- **Secuencias largas sin morphing**: encadena clips cortos; el último frame de uno es la imagen inicial del siguiente (`ffmpeg -sseof -0.05 -i a.mp4 -frames:v 1 ultimo.png`).
- **Velocidad**: si el generador acelera al final, recorta el tramo útil o remapea (`setpts`).
- **Parpadeo leve**: `ffmpeg -i v.mp4 -vf deflicker=size=5 v2.mp4` antes de extraer.

## Checklist de aceptación del vídeo
- [ ] Un solo plano, sin cortes ni saltos (revisar-video: `cortes` vacío).
- [ ] Velocidad constante: sin acelerones ni frames duplicados (variación ≤ 0,45 ideal, ≤ 0,7 aceptable; un giro perfecto da ~0,35 porque el movimiento aparente cambia con lo que se ve).
- [ ] El producto es el real: forma, color, logo y proporciones intactos en TODOS los frames de la hoja.
- [ ] Sin texto basura, sin manos/dedos raros, sin objetos que aparecen o desaparecen.
- [ ] Fondo estable (no "respira" ni cambia de tono); sin parpadeo.
- [ ] Hay hueco limpio donde irán los textos.
- [ ] 1080p o más; margen para recorte móvil o versión vertical aparte.
- [ ] Licencia/derechos: la imagen clave es del cliente o generada; nada de marcas ajenas.

## Referencias
- [references/plantillas-prompt.md](references/plantillas-prompt.md): preámbulos de estilo y prompts por tipo de plano. Siguen reglas comprobadas, pero no todos se han validado con una generación real modelo a modelo: trata el primer clip como la prueba.
- [references/modelos-y-camaras.md](references/modelos-y-camaras.md): modelos (oct-2026), duraciones, fotogramas clave, presets de cámara de Higgsfield que sirven y los que no, costes a verificar.
- [references/receta-producto-por-dentro.md](references/receta-producto-por-dentro.md): el producto realista sobre negro contado en tramos (rotura, corte, entrar dentro, cambio de estado, rayos X) con Higgsfield: activos, prompts, encadenado, montaje y presupuesto (ref11).
