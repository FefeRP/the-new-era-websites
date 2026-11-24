# Checklists: antes de generar y después de recibir

## Antes de generar (no se lanza nada sin esto)
**El plano**
- [ ] Coreografía en una frase de 0 a 100 % del scroll, con dónde aparecen los textos.
- [ ] Tipo de plano elegido en `plantillas-prompt.md` y modelo en `arbol-decision.md`.
- [ ] Una toma, **un** movimiento de cámara, un eje. Como mucho dos fases en 5 s.
- [ ] Estado inicial distinto del final (si no, el scroll no cuenta nada) [1].
- [ ] Sin texto ni logos dentro del vídeo, salvo la marca que ya trae la imagen clave [1].

**La imagen clave**
- [ ] Aprobada antes del vídeo, en la proporción final (16:9 con aire lateral, o una vertical aparte).
- [ ] Focal fijada en la imagen (gran angular para avanzar; Cinema Studio Image `camera_focal_length_id` si hace falta).
- [ ] Fondo con poco detalle donde irá el texto; exposición que pueda mantenerse.
- [ ] Si hay fin: hecho **editando el inicio** (misma lente, altura, luz), físicamente alcanzable en los segundos
      pedidos, misma proporción.
- [ ] El storyboard, como referencia de estilo, no como imagen de inicio [1].

**La petición**
- [ ] Prompt < 200 tokens, con lo que la cámara **no** hace al final («no cuts, no zoom…»).
- [ ] Audio apagado; multiplano apagado (Kling); duración puesta (Kling 4.0 viene a 10 s).
- [ ] Prueba barata primero: Seedance a 480p o en borrador; Kling 2.5 Turbo o 3.0 std.
- [ ] Precio estimado (`estimar-higgsfield.mjs lote` o `estimate_video_cost`) y **tope** del lote apuntados.
- [ ] Vale de quien paga, con el precio. En la web, mira el coste del botón antes de pulsar.
- [ ] Una sola variable cambiada por reintento.

## Después de recibir (antes de montar)
**Medir**
```bash
node scripts/revisar-video.mjs clip.mp4          # cortes, saltos, tirones, avance, velocidad, parpadeo + hoja
ffprobe -v error -select_streams v -show_entries stream=codec_name,profile,pix_fmt,width,height,r_frame_rate,bit_rate clip.mp4
```
- [ ] Sin cortes, escenas, saltos ni tirones.
- [ ] Si la cámara avanza: avanza en todo el clip (sin tramos parados; en una intro, ×1,1 o más cada medio segundo).
- [ ] Velocidad constante (variación ≤ 0,45 ideal, ≤ 0,7 aceptable).
- [ ] Sin parpadeo ni fondo que «respira».
- [ ] Códec y fotogramas: si llega H.265 o 10 bits, o con un solo fotograma clave (lo normal en Higgsfield),
      se recodifica (`montaje-web.md`).

**Mirar**
- [ ] La hoja de contactos en los segundos que señala el informe. Los fallos suelen salir entre el s 5 y el 8 en
      clips largos.
- [ ] El producto es el real en **todos** los fotogramas: forma, color, etiqueta, proporciones.
- [ ] Hueco limpio donde irán los textos.
- [ ] Revisión de realismo (señales de «se nota falso», revisión con IA como apoyo y confirmación a mano):
      [se-nota-falso.md](../../pedir-assets-ia/references/se-nota-falso.md).

**Decidir**
- [ ] Velocidad irregular o frenada → arreglo por código (`higgsfield-para-webs.md` §7).
- [ ] Parpadeo leve → deflicker (`flujos.md`). Blando → reescalado.
- [ ] Corte, salto o deformación del producto → regenerar cambiando **una** cosa (y apuntar qué).
- [ ] Apuntar en el registro: modelo, parámetros, prompt, precio, resultado y lección.

**Antes de publicar la web**
- [ ] Probado en un móvil real (iPhone incluido) y con movimiento reducido.
- [ ] Aviso de contenido generado con IA si el plano es realista (art. 50 del Reglamento europeo de IA).

## Fuentes
1. higgsfield-ai/skills, `higgsfield-websites/references/scroll-scrub.md` [leída entera]: https://github.com/higgsfield-ai/skills
