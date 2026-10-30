# ref16 · Aeternum (pirámide y escarabajo, "Me and Claude at 6:99 AM")

Vídeo corto de TikTok (19 s, 9:16) grabado a un portátil en penumbra: una web narrativa de estética egipcia. Análisis:
fotogramas a 1,5-2 fps revisados a mano el 30-10-2026, contrastados con un informe de Gemini (flash-lite), que lo da por
three.js con partículas.

## Qué se ve
| Tramo | Qué pasa | Técnica (lo que se ve) | Fiabilidad |
|---|---|---|---|
| 0:00-0:02 | Rejilla técnica clara con un contador abajo (0 → 100); los bloques de una pirámide aparecen sobre la rejilla | Pantalla de carga con contador real + inicio de la escena | Confirmado el contador; la pirámide, dudosa |
| 0:02-0:05 | La rejilla se convierte en un desierto de dunas; la pirámide de bloques de madera/piedra se ilumina por dentro con pulsos cian. Texto "A memory in the sand." | Transición rejilla → desierto que se "funde" como lo hace un vídeo IA con imagen de inicio y de fin; pero los bloques tienen textura y luz coherentes en todo el giro | Dudoso: vídeo IA encadenado o 3D con texturas buenas |
| 0:05-0:07 | La cámara atraviesa la pirámide, que se abre en bloques que pasan a los lados, hasta un blanco | Vuelo a través (fly-through) con cortina a blanco | Dudoso |
| 0:07-0:11 | Nube de arena; piezas que se ensamblan en un amuleto de escarabajo dorado con gema azul. "A trace of the sun." | Ensamblado | Dudoso |
| 0:11-0:17 | Un triángulo con un ojo y anillos concéntricos que giran; túnel hasta un sol sobre montañas en bruma. "The way back." | Anillos de líneas finas muy limpios: más propio de 3D o shader que de vídeo IA | Suposición |
| 0:17-0:19 | Fundido de vuelta a la pirámide | Bucle | Confirmado |

## Qué sacamos aunque no sepamos cómo está hecho
- Las escenas están **separadas por cortinas** (blanco, nube de arena, fundido a negro): así se encadenan clips que no casan
  fotograma a fotograma. Es la misma estrategia que en ref1 y ref11. En código: `crearCortina` de
  `revelados-y-transiciones` (el panel cubre, la escena cambia en `alCubrir` y el panel sale).
- Texto mínimo, una frase por escena, en una esquina, y un HUD técnico fino (coordenadas, contador).
- Si se hace con IA: 4-5 clips (pirámide que se ilumina, vuelo a través, ensamblado del escarabajo, túnel al sol) con imagen de
  inicio y de fin, unidos por cortinas de partículas o blanco. El túnel de anillos puede ser código (canvas/shader) barato.
- Si se hace con 3D: es la vía cara (modelado y texturas de calidad). El marketplace la deja como alternativa.

## Lo que dijo Gemini y hay que tomar con cautela
Afirma con seguridad que es WebGL en tiempo real y recomienda Blender + Substance + three.js. Los fotogramas no permiten
confirmarlo: la transición rejilla → desierto y la luz de los bloques encajan también con vídeo IA. Queda marcado como dudoso.
