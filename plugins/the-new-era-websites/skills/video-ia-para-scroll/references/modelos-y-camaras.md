# Modelos y cámaras (estado a 30-10-2026; revisa antes de presupuestar)

## Higgsfield
Agregador con créditos: un plan da acceso a muchos modelos y a sus propios presets de cámara. Tiene MCP (permite ver el coste
antes de generar) y una skill oficial para Claude (junio 2026) que hace webs con scroll vía MCP + Remotion.
Planes de la web (oct-2026): Starter 15 $/200 créditos, Plus 49 $/1.000, Ultra 129 $/3.000; los créditos caducan cada mes.
Por API: prepago en dólares con `estimate` gratis antes de lanzar. Costes medidos en noviembre de 2026 (bajaron respecto a
octubre): Kling O3 pro 0,068 $/s a 720p y 0,086 $/s a 1080p (0,43 $ por 5 s); Seedance 2.5 0,118 / 0,265 / 0,652 $/s a
480p / 720p / 1080p (1,32 $ por 5 s a 720p). Guía por pieza de web y lecciones: `higgsfield-para-webs.md`. Una web completa con 4-6 clips: ~1-4 $ si se planifica
(ver `pedir-assets-ia`, `references/recetas-por-tipo-de-web.md`). Tabla completa de precios: `pedir-assets-ia/references/proveedores.md`.
**Siempre presupuesto (`pedir-assets-ia/scripts/presupuesto.mjs`) y vale antes de generar.**

### Presets de cámara: cuáles sirven para scroll
| Sirven (movimiento único y constante) | Evitar (cambian de velocidad o tiemblan) |
|---|---|
| 360 Orbit, Lazy Susan, Arc Left/Right, 3D Rotation | Handheld, Wiggle, Snorricam |
| Dolly In/Out, Super Dolly In/Out, Dolly Left/Right | Crash Zoom, Rapid Zoom, YoYo Zoom |
| Crane Up/Down, Jib Up/Down, Robo Arm | Whip Pan, Dutch Angle |
| Through Object In/Out, Static, Overhead | FPV Drone y Hyperlapse (solo si salen muy suaves) |
| Aerial Pullback (paisajes, inmobiliaria) | Bullet Time, Disintegration (efectistas; prueba aparte) |

## Modelos
| Modelo | Duración / resolución | Inicial + final | Para qué |
|---|---|---|---|
| **Kling O3 pro** | 3-15 s, 1080p/24 fps | Sí (`first_frame_url`/`last_frame_url`) | **Mejor calidad/precio** para interiores y producto (0,086 $/s a 1080p, medido en noviembre). Sin negative prompt; reescribe letras pequeñas. Con inicio + fin puede apenas avanzar y saltar al fin al final: mide con `revisar-video.mjs` |
| **Kling 4.0** | 3-30 s, hasta 4K, hasta 10 fotogramas clave | Sí (varios) | Planos largos y bucles controlados. Flash: 20 s, 720p, sin varios clave |
| **Kling 3.0 std / pro** | 3-15 s, 720p-1080p | Sí | El caballo de batalla para producto; std barato para pruebas |
| **Veo 3.1** (Google) | 4/6/8 s, 720p/1080p (4K a 8 s) | Sí, **el final solo con 8 s** | Máxima calidad de luz/material. Lite 0,05-0,08 $/s, Fast 0,10-0,12, Standard 0,40. **Solo en Vertex AI** (salió de la API de Gemini el 22-10-2026) |
| **Luma Ray 3.2** | 5/10 s, 1080p, HDR | Sí, **modo loop**, hasta 16 clave | Bucles de producto y fondos de hero |
| **Seedance 2.5** (ByteDance) | hasta 30 s, 480p-1080p | Sí (`end_image_url`) y referencias | Movimiento de cine con paralaje real; el modelo por defecto para intros de recorrido. 0,265/0,652 $/s en la API de Higgsfield (720p/1080p, noviembre); los detalles finos "hierven" a 720p. Con un fin lejano da tirones; frena en el último tramo (`higgsfield-para-webs.md` §4 y §8) |
| **Seedance 2.0** (std / fast) · Mini | 4-15 s, 480p-4K | Sí (`start_image`/`end_image` en Higgsfield MCP) | Pruebas y planos de producto con cámara lenta: 0,12 $/s fast, 0,08 Mini (std: confirma con `get_cost`). Audio activado por defecto: apágalo |
| **Runway Gen-4.5 / Aleph** | — | Gen-4.5 **solo fotograma inicial**; Aleph edita vídeo existente | Arreglar un vídeo (quitar un objeto, cambiar fondo) |
| **Wan 2.7, Hailuo 2.3, MiniMax H3** | 2-15 s, 720p-1080p | Wan 2.7 y MiniMax H3, sí | Baratas (0,05-0,15 $/s). Wan sale a 30 fps y con audio: pide 24 fps y sin audio, o conviértelo |
| **Sora 2** | **cerrado** (API apagada el 24-09-2026) | — | No usar |

## Elección rápida
- Intro de recorrido (entrar, atravesar, llegar a la marca) → Seedance 2.5 con imagen de inicio; el fin solo si es alcanzable, y lo exacto (logo) en una segunda pasada o por código (`higgsfield-para-webs.md` §4).
- Interior o escena con cámara que entra o se acerca (zoom a una pantalla) → Kling O3 pro con inicio + fin; el fin, otra toma de verdad.
- Producto que gira / arco → Kling 3.0 std (pruebas) → Kling O3 pro, Kling 4.0 o Veo 3.1 (final).
- Despiece → Veo 3.1 8 s con fotograma final, o Kling con inicial+final.
- Bucle de fondo → Luma (loop) o Kling inicial = final.
- Plano largo de recorrido (inmobiliaria, mundo) → 2-4 clips Kling encadenados por fotograma, mejor que uno de 30 s.
- Comida/fluidos → Veo 3.1 o Kling (los dos lo hacen bien); prueba ambos con 1 tirada barata.

## Resolución y aspecto
- Pide 1080p mínimo. 4K solo si el hero es a pantalla completa en pantallas grandes y el presupuesto de peso lo aguanta (se reescala a 1920 al extraer igualmente).
- 16:9 con margen lateral → el recorte 9:16 para móvil sale del centro (`--recorte-movil`). Si el producto es alto y estrecho (botella), genera también una toma 9:16 con la misma imagen clave.
- 24 fps es suficiente: 6 s = 144 frames, de sobra para 300 % de scroll.
