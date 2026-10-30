# ref15 · Café en cuatro tiempos ("Claude can't do this")

Vídeo corto de TikTok (10 s, 9:16) grabado a un portátil: una web de café que se cuenta en cuatro secciones (01 The Grind,
02 The Bloom, 03 Extraction, 04 The Ritual). El rótulo irónico del vídeo indica que se hizo con Claude. Análisis: fotogramas a
1,2-3 fps revisados a mano el 30-10-2026, contrastados con un informe de Gemini (flash-lite).

## Qué se ve
| Tramo | Qué pasa | Técnica real | Fiabilidad |
|---|---|---|---|
| Hero | Tolva de cristal de un molinillo sobre fondo marfil; los granos caen dentro y la llenan. "ORDER" a la izquierda y "COFFEE" a la derecha, separados para dejar sitio a la tolva | Vídeo realista (granos que caen con desenfoque de movimiento) ligado al scroll; texto HTML a los lados | Confirmado vídeo/fotogramas |
| 01 The Grind | La cámara baja por el molinillo: tolva → muelas → el café molido cae en un chorro fino | **Un solo plano de grúa hacia abajo** (crane down) generado con IA; contador y titular "PRECISION BURRS" por código | Confirmado vídeo; IA por el acabado y la luz |
| 02 The Bloom | Corte a otra escena: hervidor de cuello de cisne vertiendo sobre un V60 con luz de ventana y sombras de persiana; contadores 44 → 73 → 92 °C, 18 g, 3:30 | Segundo clip; el HUD sube con el progreso | Confirmado |
| 03 Extraction | La jarra se llena; una gota cae en cámara lenta sobre café con ondas. "EVERY" y "DROP" separados para que la gota pase entre las palabras | Tercer clip (macro, cámara lenta); texto colocado alrededor del sujeto | Confirmado |
| 04 The Ritual | Taza de espresso vista desde arriba con las mismas sombras de persiana; abajo, tarjetas de producto ("Pick your ritual") | Último fotograma (o una foto con la misma luz) como fondo de la tienda; tarjetas HTML con entrada escalonada | Confirmado |

## De qué assets se compone
- **3-4 clips de vídeo IA de 4-6 s**, uno por sección, todos con el **mismo fondo marfil y la misma luz de ventana** (eso es lo
  que los une), cámara con un solo movimiento por clip.
- Entre clips no hay transición física: cambio de sección con fundido y el titular nuevo.
- Las cifras (temperatura, gramos, tiempo) y todos los textos, por código.
- Una foto final (la taza) que sirve de fondo de la parte de compra.

## Cómo pedirlo
- Clave por escena con el bloque de luz común: "warm morning window light through blinds, soft hard-edged shadow pattern on an
  ivory wall, ivory seamless background".
- Clip 1: imagen de inicio (tolva llena) y fin (muelas con el chorro), cámara "slow crane down, constant speed".
- Clip 2 y 3: cámara fija o dolly muy lento; la acción la hace el sujeto (vertido, gota). Pedir cámara lenta en el prompt
  ("slow motion, 120 fps look").
- Coste orientativo con Kling O3 pro 1080p: 4 clips × 5 s × 0,112 $ ≈ 2,2 $ + 6-8 imágenes clave ≈ 0,5 $.

## Lección para el marketplace
Es exactamente el patrón de las webs IA que ya conocíamos (ref1, ref5, ref11): clips cortos, fondo y luz comunes, texto por
código. Gemini lo describe bien en general, pero propone prompts con "8k, photorealistic, 4k resolution", que son justo los que
dan aspecto de IA; usar las plantillas de `pedir-assets-ia`.
