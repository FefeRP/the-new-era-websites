# ref20 · Web de limpieza a presión con presupuesto al instante

Vídeo vertical (22,4 s, 576×1024) de @opuscode.de, rotulado «Client paid $1,650»: la web de una empresa de limpieza
exterior (entradas de garaje, tejados, fachadas). Análisis: fotogramas cada 0,5 s y detalles ampliados revisados a
mano el 23-11-2026, contrastados con un informe de Gemini (flash-lite).

## Qué se ve
| Tramo | Qué pasa | Técnica (lo que se ve) | Fiabilidad |
|---|---|---|---|
| 0:00-0:02 | Hero con la casa y una barra fija abajo con la llamada «presupuesto gratis» | Hero con foto o vídeo + barra fija | Confirmado |
| 0:02-0:11 | El trabajo contado **por zonas** (entrada, tejado, la fachada del lado umbrío «Green on the shady side»): cada zona pasa de sucia a limpia mientras un anillo de avance sube (38 → 99) y los titulares alternan de lado | Clips por zona con la misma casa y la misma luz ligados al scroll; anillo SVG con cifra | Confirmado el anillo y la alternancia; el vídeo IA, probable |
| 0:03-0:05 | «Clean this driveway»: el visitante mantiene pulsado y **rocía**; lo que toca queda limpio; contador de % limpio, tiempo y dos herramientas (limpiador de superficie de 20″ o lanza) | Canvas que se borra pintando sobre la foto limpia | Confirmado en los fotogramas. Gemini lo llama «slider de antes/después»: discrepa |
| 0:11-0:13 | «Same house. One visit.»: antes y después arrastrando una línea | Antes/después con cortina (ya en `lente-revelado`) | Confirmado |
| 0:13-0:15 | Manómetro: chips por superficie y una aguja que va al rango de presión de cada una | Dial SVG que explica el método | Confirmado |
| 0:15-0:18 | «Price your house in 20 seconds»: chips de tamaño y servicios y un rango de precio que cambia en vivo | Presupuesto al instante | Confirmado |

## Qué sacamos (recetas)
- **Trabajo por zonas con anillo de avance** (catálogo B): un clip IA por zona con la misma casa y la misma luz;
  anillo con `stroke-dashoffset` y `tabular-nums`.
- **«Límpialo tú»**, **instrumento que explica**, **presupuesto al instante** y **barra fija** (catálogo J; código
  probado en `new-era/references/recetas-producto-y-servicio.md`, recetas 4-6).
- El orden de la página ya es una receta para servicios: demostrar (zonas) → que lo pruebe el visitante (pintar) →
  explicar el método (dial) → precio (rango) → llamada siempre a mano (barra).

## Lo trillado o mejorable
- Gemini señala que varios bloques repiten la misma estructura (imagen grande + texto a un lado): alternar formatos.
- El precio en vivo solo vale con la tabla real del cliente; nunca con cifras inventadas.
