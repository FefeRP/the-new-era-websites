# Proveedores: cuál usar para cada cosa (octubre de 2026; vídeo de Higgsfield revisado el 21-11-2026)

La receta (imagen clave → imagen final → vídeo entre ambas → revisión → montaje) es la misma con cualquier proveedor; solo cambian
el nombre de los parámetros, el precio y lo que cada modelo hace mejor. Precios orientativos en USD, sin audio, de páginas
públicas y de generaciones reales ("medido"); cambian cada mes. Los mismos datos están en `scripts/precios.json` para
`presupuesto.mjs`. **Confirma el precio en el proveedor antes de pedir el vale** (varios tienen un "estimate" gratis).

## Dónde se compra
- **Higgsfield** (principal): agregador con muchos modelos, presets de cámara y MCP.
  - Web por créditos: Starter 15 $/200, Plus 49 $/1.000, Ultra 129 $/3.000 al mes. Los créditos **caducan cada mes**. Un clip de
    5 s: Kling 3.0 720p ≈ 7,5-10 créditos, Seedance 2.5 ≈ 15 (480p) / 35 (720p) / 80 (1080p).
  - API: prepago en dólares (desde 5 $), `POST /estimate/<modelo>` gratis antes de lanzar, lo fallido o moderado no se cobra,
    no da el saldo. Algunos modelos de su web no están en la API (Nano Banana, Veo, Seedream). En noviembre de 2026 los precios
    de vídeo bajaron (Seedance 2.5 ya sale cerca del oficial). Guía de vídeo para webs: `video-ia-para-scroll/references/higgsfield-para-webs.md`.
  - **MCP** (conector para Claude; catálogo leído el 11-11-2026 con `models_explore`): además de los de la API trae
    Nano Banana 2 / 2.1 / Pro, Seedream 5 Pro, GPT Image 2 / 2.5 / 2.6 y Seedance 2.0 / 2.5. Cada `generate_*` admite
    `get_cost: true`, que da el precio sin lanzar nada: úsalo antes de cada lote. Parámetros que importan aquí:
    - `seedance_2_0`: 4-15 s, 480p-4K, `mode` std/fast, `generate_audio` **activado por defecto** (apágalo), medios
      `start_image`, `end_image` e `image_references`.
    - `seedance_2_5`: `mode` t2v / omni_reference / video_edit / video_extension, 4-30 s, hasta 1080p, `draft`.
    - `gpt_image_2_6`: `background: transparent` (alfa nativo) y `output_format` png / svg / gif; en SVG no admite referencias.
    - `seedream_v5_pro`: hasta 2K, `remove_bg` (recorte integrado) e `is_inpaint`. `nano_banana_2`: 1K-4K, `is_inpaint` con `mask`.
    - Los medios se suben con `media_upload` (+ PUT firmado) y se citan por su id; el id de una generación anterior
      también vale como imagen de inicio o de referencia, sin bajarla y volverla a subir.
- **APIs oficiales** (Google Vertex, BytePlus, Alibaba, Kling, Luma, MiniMax, OpenAI, BFL…): lo más barato por unidad, una cuenta por proveedor.
- **fal.ai / Replicate:** un solo saldo para casi todos, precio ≈ oficial o algo más; cuidado con el audio activado por defecto.

## Vídeo
| Modelo | 720p $/s | 1080p $/s | Inicio + fin (parámetro) | Duración | Bueno para | Cuidado |
|---|---|---|---|---|---|---|
| **Kling O3 pro** | 0,068 (medido) | **0,086** (medido) | sí: `first_frame_url`/`last_frame_url` (Higgsfield), `image_url`/`end_image_url` (fal) | 3-15 s | Interiores y producto: respeta muy bien inicio y fin, geometría estable, 1080p/24 fps reales. **Mejor calidad/precio** | Sin negative prompt. Reescribe letras de ~70 px. No anima exteriores. Con inicio + fin puede apenas avanzar y saltar al fin: mide con `revisar-video.mjs` |
| Kling 3.0 std / pro | 0,071 (medido) | 0,096 (medido) | sí | 3-15 s | Pruebas baratas (std) | Etiquetas con texto se deforman |
| Kling 4.0 | 0,157 | 0,235 | hasta 10 clave | 3-30 s, hasta 4K | Planos largos sin cortes | Caro; en fal, audio siempre activo |
| Veo 3.1 Lite / Fast / Std | 0,05 / 0,10 / 0,40 | 0,08 / 0,12 / 0,40 | sí (`first_frame`/`last_frame`; el final, en clips de 8 s) | 4, 6, 8 s | La mejor luz, materiales y física; Lite = la prueba más barata | Solo en Vertex (salió de la API de Gemini el 22-10-2026); máx. 8 s |
| Seedance 2.5 | 0,231 oficial · 0,265 Higgsfield (480p: 0,118) | 0,569 · 0,652 | sí (`end_image_url`; oficial: `role: last_frame`) | hasta 30 s | Movimiento "de cine", paralaje y desenfoque reales; el de las intros de recorrido | Finos que "hierven" a 480-720p; con un fin lejano da tirones y frena en el último tramo |
| Seedance 2.0 (std / fast) · Mini | 0,12 fast · 0,08 Mini (std: confirma con `get_cost`) | — | sí (`start_image`/`end_image` en Higgsfield MCP) | 4-15 s | Pruebas y planos de producto con cámara lenta | Audio activado por defecto |
| Wan 2.7 | 0,10 | 0,15 | sí: `image_url`/`end_image_url` | 2-15 s | Barato con negativo | Ignora a veces la trayectoria, rompe texto, sale a 30 fps y con audio |
| Wan 2.1/2.2 (abierto) | 0 en local | — | 2.1 FLF2V | ~5 s | Sin coste si hay GPU (8-54 GB) | 480-720p |
| Luma Ray 3.2 | 0,06 | 0,24 | hasta 16 clave, modo bucle | 5/10 s | Bucles, HDR | Revisa geometría |
| MiniMax H3 / Hailuo 2.3 | 0,08 / ~0,05 | 2K 0,13 / ~0,08 | H3 sí (`first_frame_image`/`last_frame_image`) | 5-10 s | Barato en alta resolución | Menos probado |
| Runway Gen-4.5 / Aleph | 0,12 / 0,28 | — | **solo inicio** / edita vídeo existente | — | Aleph: cambiar luz u objetos de un vídeo ya hecho | No sirve para encadenar por fin |

## Imagen
| Modelo | $/imagen | Edita con referencia | Bueno para | Cuidado |
|---|---|---|---|---|
| Nano Banana 2.1 / Pro (Google) | 0,034-0,05 / 0,134 | sí (máximo técnico 14; recomendado 3-6) | Producto fiel, texto legible, ediciones "misma toma" | Pro caro a 4K |
| GPT Image 2 / 2.5 (OpenAI) | 0,006 baja · 0,053 media · 0,211 alta | sí | Texto y etiquetas exactas, composición; baja = bocetos baratos | Calidad alta cara |
| Qwen Image 3 (Alibaba) | 0,075 en Higgsfield (medido) · 0,025-0,07 oficial | sí (edit, 1-3 ref.) | Escenas e interiores 2K, día/noche como edición | Las ediciones mueven píxeles (~30 px) |
| Flux 3 / Flux 2 pro (BFL) | 0,048-0,10 / 0,03 | sí | Fidelidad a la foto del producto | — |
| Seedream 5 (ByteDance) | 0,035-0,045 | sí | Volumen barato a 2K, variaciones | — |
| Midjourney | plan desde 10 $/mes | poco | Estética, moodboard, explorar estilos | Sin API; poco control de producto y encuadre |
| Ideogram 4 / Recraft 4.1 | 0,03-0,10 / 0,007-0,21 | no | Tipografía, logos, vectores, patrones | No para fotografía de escena |

## Alfa, recorte y 3D generado
Para los assets que se componen encima de la web (skill `capas-alfa`). Precios de fal y Runware, 07 a 10-2026.

| Qué | Opción | Precio | Nota |
|---|---|---|---|
| Imagen con alfa nativo | GPT Image 1.5 / 2.5 / 2.6 (`background: "transparent"`) | como su imagen | GPT Image 2 lo perdió el 30-09-2026; la 2.6 lo tiene (Higgsfield MCP, 11-2026). No describas fondo en el prompt |
| | Seedream 5 Pro (`remove_bg`, Higgsfield MCP) | como su imagen | Recorta en el mismo paso; mide el borde con `alfa.mjs --modo ya-alfa` |
| | Ideogram 3 Transparent | 0,03-0,09 $ | Bueno en bordes finos |
| | Seedream 5 Flash (`background: "transparent"`) | ~0,019 $ | El más barato con alfa |
| Imagen partida en capas | Qwen-Image-Layered | ~0,05 $ | 1-10 capas RGBA de una foto (fondo, sujeto, primer plano) |
| Recorte de imagen | `alfa.mjs` (local, fondo liso) | 0 $ | Croma, negro, blanco o par negro/blanco para lo semitransparente |
| | Rembg Enhance · Ideogram · Recraft · Pixelcut · Bria RMBG 2.0 (fal) | 0,006 · 0,01 · 0,011 · 0,016 · 0,018 $ | Para fondos que no son lisos |
| Vídeo con alfa nativo | Wan-Alpha (abierto, 832×480) · Firefly Video "transparent background" | alojado sin precio publicado · plan de Adobe | Kling, Veo, Seedance, Runway y Luma **no** dan alfa |
| Recorte de vídeo | `alfa.mjs` (local, fondo liso o negro) | 0 $ | La vía por defecto si el vídeo se pidió sobre fondo liso |
| | BiRefNet v2 vídeo (fal) | ~0,0008 $ por segundo de cómputo | Saca ProRes 4444 o WebM con alfa |
| | VEED · Bria v3 | 0,015-0,0225 $ por 30 fotogramas · 0,05 $/s | Fondos complicados |
| 3D desde fotos | TRELLIS 2 · Hunyuan3D v3 (fal) | 0,25-0,35 $ · desde 0,225 $ | Para giros con etiqueta rígida: render propio sin texto deformado |

## Elección rápida
- **Interior o escena con cámara que se mueve** (zoom a pantalla, entrada a una sala): imagen Qwen/Nano Banana → **Kling O3 pro** con inicio+fin. La prueba más barata: 4 s en Veo 3.1 Lite 720p (solo imagen de inicio) o 3 s en Kling 3.0 std.
- **Producto con luz y materiales difíciles** (vidrio, líquido, comida): Veo 3.1 Fast/Std o Kling O3 pro; prueba ambos en 3-4 s.
- **Movimiento cinematográfico con paralaje fuerte** y presupuesto: Seedance 2.5 a 1080p (mejor en su API oficial).
- **Bucle de fondo:** Luma (modo loop) o Kling con inicio = fin.
- **Plano largo** (> 10 s): mejor 2-4 clips encadenados por fotograma que uno largo; si no, Kling 4.0.
- **Producto que gira con texto legible:** ningún vídeo: `envase-giratorio` o `escena-3d-gltf`.
- **Imagen clave:** Nano Banana 2.1 o Qwen Image 3 (baratas, editan bien); Nano Banana Pro o GPT Image si hay texto o producto exacto.
- **Bocetos para elegir dirección:** GPT Image baja (0,006 $) o Flux 2 pro (0,03 $): 6-10 opciones por menos de 0,30 $.

## Parámetros que conviene fijar siempre
- Sin audio (`sound: off`, `generate_audio: false`): cuesta más y no se usa.
- 16:9 a 1080p y 24 fps para escritorio; la toma 9:16 aparte si el sujeto no cabe en el recorte central.
- Semilla fija cuando el modelo la admite (repetir con cambios pequeños).
- Imágenes de entrada al tamaño de salida o mayores (2K): el modelo reescala; mide coordenadas en el vídeo devuelto.
- Licencias: la mayoría permite uso comercial; algunos entrenan con lo generado. En la UE, el vídeo realista generado con IA
  debe poder identificarse como tal (Ley de IA, art. 50): un aviso discreto en la web basta.
