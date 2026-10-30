# Revisión de calidad: ¿se nota que es IA?

Antes de montar un asset en la web pasa estas 4 capas, de la gratis a la que cuesta tiempo. Veredicto: **APTO**,
**ARREGLAR POR CÓDIGO** (velocidad, color, tapar con capa, recortar el tramo) o **REGENERAR** (con el prompt corregido).

## 1. Técnica (gratis, ffmpeg)
`node ../video-ia-para-scroll/scripts/revisar-video.mjs clip.mp4 --hoja hoja.png` → cortes, velocidad (frena/acelera), parpadeo y
hoja de fotogramas. fps y audio con ffprobe (algunos modelos salen a 30 fps o con pista de audio aunque no se pida).

## 2. Ojos de IA (céntimos)
`node scripts/revisar-ia.mjs clip.mp4 --contexto "zoom a la pantalla de un portátil en un ático"` manda el vídeo a Gemini con la
lista de abajo y devuelve un informe por señal con su segundo. Sin `GEMINI_API_KEY`, imprime el prompt para pegarlo en
cualquier modelo que vea vídeo. Coste típico: 0,003-0,02 $ por clip de 5 s.
- **Los modelos de revisión se inventan fallos** (sobre todo los "lite"): "barras negras" que son el marco del portátil, "el
  logo cambia" cuando no cambia. Todo lo que señale se confirma en el paso 3.

## 3. Confirmar a mano (lo que manda)
- Extrae los fotogramas que señala la revisión y **amplíalos** (×3-×6) en la zona: `ffmpeg -ss 2.4 -i clip.mp4 -frames:v 1 -vf "crop=400:240:900:300,scale=1600:-1:flags=neighbor" z.png`.
- Recorre el vídeo a 0,25× en tramos con textura fina (ventanas, rejas, hojas, pelo, texto).
- Compara inicio y fin del clip con las imágenes que diste (superpuestas al 50 %).

## 4. En la web (scroll real)
`verificar-scroll.mjs` en 3-5 puntos del tramo: arrastrando adelante y atrás aparecen fallos que en reproducción normal no se
ven (objetos que "respiran", texturas que hierven, saltos entre clips).

## Señales de "se nota falso"
### Imagen
1. **Composición de catálogo:** simétrica, todo centrado, de frente; objetos colocados "para la foto".
2. **Luz imposible:** brillos sin fuente, sombras en varias direcciones, lámpara apagada que ilumina, HDR con halos.
3. **Cristal y reflejos:** ventanas sin reflejo (parecen un fondo pintado) o reflejos de espejo perfectos.
4. **Materiales de plástico:** madera sin veta, tela sin arrugas, piel sin poros, metal sin rozaduras; todo nuevo.
5. **Geometría:** líneas rectas que se curvan, patas que no tocan el suelo, objetos fundidos entre sí, perspectiva incoherente.
6. **Texto y logos:** letras inventadas, logos deformados, carteles con galimatías (no debería haber: van por código).
7. **Escala:** objetos de tamaño absurdo entre sí (taza enorme, portátil diminuto), escalones o puertas raros.
8. **Fondo genérico:** ciudad de postal sin edificios reconocibles, "skyline" de acuarela, paisaje de banco de imágenes.
9. **Manos y gente:** dedos de más, gomosos, caras de cera.
### Vídeo
10. **Morphing:** objetos que cambian de forma, se funden o aparecen/desaparecen; muebles que se desplazan.
11. **Hervor:** texturas finas (rejas, persianas, hojas, letras, skyline) que bailan de un fotograma a otro.
12. **Zoom plano:** la cámara "avanza" pero no hay paralaje (el fondo crece igual que el primer plano).
13. **Velocidad:** arranca lento y acelera al final; tirones; la cámara se para y sigue.
14. **Física:** partículas congeladas en el aire, líquidos que no caen, humo o vapor en bucle, ropa rígida.
15. **Luz que cambia sola:** parpadeo, una lámpara que se enciende a mitad, sombras que se mueven sin causa.
16. **Exterior muerto:** ventana a una ciudad totalmente quieta mientras la cámara se mueve (o al revés, coches que derrapan).
17. **Cortes o saltos** dentro del clip, y salto de nitidez o color entre clips encadenados.
18. **Inicio o fin** que no coinciden con las imágenes dadas (más de ~6 px o distinto encuadre).

## Prompt de revisión (el que usa `revisar-ia.mjs`)
```
You are a senior VFX supervisor reviewing an AI-generated clip that will be scrubbed frame by frame with the scroll on a premium
website. Context: {contexto}. Be strict but do not invent problems: report only what you can point to with a timestamp, and say
"not visible" when unsure. For each item give OK / MINOR / SEVERE, the time range (s) and the exact location in the frame:
1 morphing or shape changes, 2 boiling/flickering fine textures, 3 flat zoom without parallax, 4 speed ramps or stutters,
5 frozen or impossible physics, 6 lighting changes or light without a source, 7 glass and reflections (missing or mirror-perfect),
8 plastic materials, 9 bent straight lines or warped geometry, 10 generated text, letters or logos, 11 hands or people,
12 stock-photo composition, 13 dead or generic background, 14 cuts or jumps, 15 anything else that reveals AI.
Then: overall verdict APTO / ARREGLAR POR CÓDIGO / REGENERAR, the 3 most important fixes, and if REGENERAR, which words of the
prompt likely caused it and what to write instead. Answer in Spanish.
```

## De la señal al arreglo
| Señal | Arreglo barato | Si hay que regenerar, cambia en el prompt |
|---|---|---|
| Velocidad | remapeo por código | "constant speed from the first frame to the last" |
| Zoom plano | — | fin = otra toma con la cámara movida de verdad; o solo inicio |
| Hervor en finos | recortar ese tramo; 1080p | menos textura fina; exterior desenfocado |
| Texto inventado | capa de `seguir-pantalla` que lo tape | superficies "plain, blank" |
| Exterior muerto | capa de vídeo/partículas detrás del cristal con máscara | no pedir vida exterior a la IA |
| Composición de stock | recorte del encuadre | off-center, three-quarter, primer plano desenfocado |
| Cristal sin reflejo | capa de reflejo suave por CSS | "faint natural reflections", quitar "no reflections" |
| Luz que cambia | recortar el tramo | "no light changes, [lamp] stays [on/off]" |
| Morphing de objetos | tapar con capa o recortar | menos objetos pequeños en la escena, cámara más lenta |
