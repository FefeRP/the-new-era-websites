# Proveedores: cuál usar para cada cosa (octubre de 2026; vídeo de Higgsfield revisado el 21-11-2026)

La receta (imagen clave → imagen final → vídeo entre ambas → revisión → montaje) es la misma con cualquier proveedor; solo cambian
el nombre de los parámetros, el precio y lo que cada modelo hace mejor. Precios orientativos en USD, sin audio, de páginas
públicas y de generaciones reales ("medido"); cambian cada mes. Los mismos datos están en `scripts/precios.json` para
`presupuesto.mjs`. **Confirma el precio en el proveedor antes de pedir el vale** (varios tienen un "estimate" gratis).

## Dónde se compra
- **Higgsfield** (principal): agregador con muchos modelos, presets de cámara y MCP.
  - Web por créditos: Starter 15 $/200, Plus 49 $/1.000, Ultra 129 $/3.000 al mes (en noviembre de 2026, con oferta: 19 €/270, 33 €/1.200 y 50 €/3.000 en pago anual). Free: sin créditos y con marca de agua. Lo fallido o moderado no se cobra y los resultados se guardan 7 días. Los créditos **caducan cada mes**. Un clip de
    5 s: Kling 3.0 720p ≈ 7,5-10 créditos, Seedance 2.5 ≈ 15 (480p) / 35 (720p) / 80 (1080p).
  - API: prepago en dólares (desde 5 $), `POST /estimate/<modelo>` gratis antes de lanzar, lo fallido o moderado no se cobra,
    no da el saldo. Algunos modelos de su web no están en la API (Nano Banana, Veo, GPT Image, Flux, Sora no está en ningún sitio); Seedream 5 Pro sí (0,108 $ medido). En noviembre de 2026 los precios
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
| Kling 3.0 Turbo · 2.5 Turbo | 0,084 · 0,032 (medido) | 0,105 · 0,053 (medido) | **no** (solo inicio) | 3-15 s · 5/10 s | Pruebas del movimiento muy baratas; 2.5 Turbo con negative prompt | Sin fin |
| Kling 4.0 · Flash | 0,126 · 0,094 (medido) | 0,188 (medido; 4K 0,549; HDR +0,047) | hasta 10 clave (Flash: no) | 3-30 s (10 por defecto) · Flash hasta 20 s 720p | Recorridos con paradas guiadas por fotogramas intermedios | Pon la duración: viene a 10 s; en fal, audio siempre activo (0,157 / 0,235) |
| Veo 3.1 Lite / Fast / Std | 0,05 / 0,10 / 0,40 | 0,08 / 0,12 / 0,40 | sí (`first_frame`/`last_frame`; el final, en clips de 8 s) | 4, 6, 8 s | La mejor luz, materiales y física; Lite = la prueba más barata | Solo en Vertex (salió de la API de Gemini el 22-10-2026); máx. 8 s |
| Seedance 2.5 | 0,231 oficial · 0,265 Higgsfield (480p: 0,118) | 0,569 · 0,652 | sí (`end_image_url`; oficial: `role: last_frame`) | hasta 30 s | Movimiento "de cine", paralaje y desenfoque reales; el de las intros de recorrido | Finos que "hierven" a 480-720p; con un fin lejano da tirones y frena en el último tramo |
| Seedance 2.0 · Mini | 0,174 (medido; 480p 0,080) · Mini 5 créditos/5 s en la web | 0,429 (medido; 4K 0,891) | sí (`end_image_url`; `start_image`/`end_image` en el MCP) | 4-15 s | Revelado de logo que termina en la imagen final (receta oficial de Higgsfield); pruebas con Mini | Audio activado por defecto |
| Wan 3.0 · Prime | 0,075 · 0,105 (medido; 480p 0,038) | 0,150 · 0,210 (medido) | sí | 2-30 s | Lo más barato a 1080p con inicio + fin; semilla | 30 fps; en preview en Alibaba |
| Wan 2.7 | 0,075 (medido) | 0,113 (medido) | sí: `image_url`/`end_image_url` | 2-15 s | Barato con negativo y semilla | Ignora a veces la trayectoria, rompe texto, sale a 30 fps y con audio |
| Wan 2.1/2.2 (abierto) | 0 en local | — | 2.1 FLF2V | ~5 s | Sin coste si hay GPU (8-54 GB) | 480-720p |
| Luma Ray 3.2 | 0,06 | 0,24 | hasta 16 clave, modo bucle | 5/10 s | Bucles, HDR | Revisa geometría |
| MiniMax H3 / H3 lite / Hailuo 2.3 | 0,08 / 768p 0,04 (medido) / ~0,05 | 2K 0,13 / — / ~0,08 | H3 sí (`first_frame_image`/`last_frame_image`) | 5-15 s | Barato en alta resolución; física | Menos probado; marca de agua de IA opcional |
| Grok Video 1.5 · LTX-2.5 pro · Happy Horse 1.1 | 0,142 · — · — (medido) | — · 0,17 · 0,18 (medido) | no | 1-15 s · 6 s · 5 s | — | Sin ventaja para scroll al mismo precio |
| Runway Gen-4.5 / Aleph | 0,12 / 0,28 | — | **solo inicio** / edita vídeo existente | — | Aleph: cambiar luz u objetos de un vídeo ya hecho | No sirve para encadenar por fin |

### Vídeo en Higgsfield: tabla medida (21-11-2026)
Precio por segundo en la API de Higgsfield (`POST /estimate`, gratis; sin audio) y, entre paréntesis, créditos de la web
y el MCP por 5 s (`estimate_video_cost`, también gratis). Son dos tarifas distintas: no conviertas una en otra. Se
recalcula con `node ../video-ia-para-scroll/scripts/estimar-higgsfield.mjs tabla`. Ficha de cada modelo (parámetros,
fallos, prompt): [modelos/](../../video-ia-para-scroll/references/modelos/README.md) de `video-ia-para-scroll`.

| Modelo | Duración | 480p | 720p | 1080p | 4K | Inicio + fin |
|---|---|---|---|---|---|---|
| Seedance 2.5 | 4-30 s | 0,118 (15) | 0,265 (35) | 0,652 (80) | — | Sí (el fin se recorta a la proporción del inicio) |
| Seedance 2.0 | 4-15 s | 0,080 | 0,174 (22,5) | 0,429 (60) | 0,891 | Sí |
| Seedance 2.0 Mini | 4-15 s | — | (5) | — | — | Sí |
| Kling 3.0 std / pro / 4k | 3-15 s | — | 0,071 (7,5) | 0,096 (8,75) | 0,315 (30) | Sí |
| Kling 3.0 Turbo | 3-15 s | — | 0,084 | 0,105 | — | **No** (solo inicio) |
| Kling O3 (FLF) | 3-15 s | — | 0,068 | 0,086 (6,25) | — | Sí |
| Kling 2.5 Turbo pro | 5/10 s | — | 0,032 | 0,053 | — | No |
| Kling 4.0 | 3-30 s | — | 0,126 (12,5) | 0,188 (18,75) | 0,549 | Sí + intermedios |
| Kling 4.0 Flash | 3-20 s | — | 0,094 (7,5) | — | — | No |
| Veo 3.1 / Fast / Lite | 4/6/8 s | solo web: 8 s Lite 12 cr, Fast 32 cr, High 80 cr | | | | Lite y web (ver ficha) |
| Wan 3.0 | 2-30 s | 0,038 (3,75) | 0,075 (7,5) | 0,150 (15) | — | Sí |
| Wan 3.0 Prime | 2-30 s | 0,051 | 0,105 | 0,210 (27,5) | — | Sí |
| Wan 2.7 | 2-15 s | — | 0,075 | 0,113 (12,5) | — | Sí |

- Por clip: Kling 4.0 Flash 5 s 0,47 $; MiniMax H3 lite 6 s 0,24 $ (768p); Grok Video 1.5 5 s 720p 0,71 $; LTX-2.5
  pro 6 s 1080p 1,02 $; Happy Horse 1.1 5 s 1080p 0,90 $.
- Herramientas (créditos de la web): deflicker 2, upscale 2, ByteDance upscale a 1080p (preset AIGC) 1. Topaz y
  fps_boost no se pueden estimar sin el vídeo.
- Seedance 2.5 Flash existe en BytePlus y en el MCP de Higgsfield (25 créditos 5 s a 720p), no en la API.
- Una intro bien planificada (borrador a 480p y final a 720p con Seedance 2.5) cuesta 1,91 $; con Kling o Wan, menos
  de 1 $. Presupuestos por tipo de web: `video-ia-para-scroll/references/arbol-decision.md`, paso 3.

## Imagen
| Modelo | $/imagen | Edita con referencia | Bueno para | Cuidado |
|---|---|---|---|---|
| Nano Banana 2.1 / Pro (Google) | 0,034-0,05 / 0,134 | sí (máximo técnico 14; recomendado 3-6) | Producto fiel, texto legible, ediciones "misma toma" | Pro caro a 4K |
| GPT Image 2 / 2.5 (OpenAI) | 0,006 baja · 0,053 media · 0,211 alta | sí | Texto y etiquetas exactas, composición; baja = bocetos baratos | Calidad alta cara |
| Qwen Image 3 (Alibaba) | 0,04 en Higgsfield (medido el 21-11; 0,075 en octubre) · 0,025-0,07 oficial | sí (edit, 1-3 ref.) | Escenas e interiores 2K, día/noche como edición | Las ediciones mueven píxeles (~30 px) |
| Flux 3 / Flux 2 pro (BFL) | 0,048-0,10 / 0,03 | sí | Fidelidad a la foto del producto | — |
| Seedream 5 (ByteDance) | 0,035-0,045 oficial · 5 Pro 0,108 en Higgsfield (medido) | sí | Volumen barato a 2K, variaciones; letra pequeña legible | — |
| Cinema Studio Image (Higgsfield, solo web/MCP) | 2 créditos a 2K | sí | Fijar la **focal (FOV)**, la lente, el cuerpo y la apertura de la imagen de inicio | — |
| Midjourney | plan desde 10 $/mes | poco | Estética, moodboard, explorar estilos | Sin API; poco control de producto y encuadre |
| Ideogram 4 / Recraft 4.1 | 0,03-0,10 / 0,007-0,21 | no | Tipografía, logos, vectores, patrones | No para fotografía de escena |

### Imagen en Higgsfield (créditos de la web y el MCP; API donde la hay)
Consultado entre el 30-10 y el 21-11-2026. Un crédito sale por ~0,04-0,075 $ según el plan. Higgsfield no promete
fidelidad de logo o texto: revisa siempre (`fotos-producto-ia/references/fallos-y-arreglos.md`).

| Modelo / herramienta | Créditos (web) | API | Referencias | Máx. | Lo mejor | Notas |
|---|---|---|---|---|---|---|
| **GPT Image 2 / 2.5 / 2.6** (2.6 por defecto en Higgsfield) | 1,5 (1K baja) · 1,75-2 (2K alta, 2.6) · 5,5 (2K alta) · 26,5 (4K máx.) | no | hasta 16 | 4K | Tipografía, texto exacto, composición | La 2.6 con fondo transparente y salida PNG, JPEG, WebP, GIF o **SVG** |
| **Nano Banana Pro / 2 / 2.1** | ~2 (0,134 $ la Pro), ~4 en 4K; 2.1 sin confirmar (Plus/Ultra: 7 días ilimitado a 2K) | no | hasta 14 (14 en Lite) | 4K | Producto con texto y logo (el más fiable); editar manteniendo el universo (**fin editando el inicio**) | La que recomienda la skill oficial para un «universo de producto» coherente |
| **Seedream 5 / 5.0 Pro / 5.5** | ~1 (5) · 2,5 (5 Pro) · 3,5 (5.5) | 0,108 $ (5 Pro) | hasta 14 (dato de terceros; 10 en Pro/5.5) | 4096² | Volumen barato, variaciones, letra pequeña legible | La 5 Pro recorta (`remove_bg`); la 5.5 con **fondo transparente** |
| **Cinema Studio Image** | 2 (2K) | no | — | 2K | **Focal, lente, cuerpo y apertura** controlados | La forma de fijar el FOV de la imagen clave |
| Soul 2.0 / Cinema / Location | ~0,12 | Soul 2 ~0,0032 $ | sin confirmar | — | Estética, escenas; semilla; Location para escenarios | Poco fiel al producto |
| Flux 2 Pro / Flex / Max · Kontext | 1 / 3 / 4 · 1,5 | no | — | — | Edición contextual | — |
| Qwen Image 3 | — | 0,04 $ (21-11; ~0,075 $ en octubre) | 1-3 | 2K | Semilla y **prompt negativo**; escenas e interiores; variantes baratas | — |
| Kling Image 4 · Grok Image 2 | — · 2,5 | 0,063 $ · 0,06 $ | — · 10 | — | — | — |
| Marketing Studio / Recreate | 2-4 por foto | Marketing Studio Image ~0,0059 $ | 1 foto | — | Serie hero, lifestyle y modelo desde una foto | — |
| Layers (Seedream 5) | sin confirmar | — | — | 4K | Separar capas, inpaint dibujando, recorte con alfa, reiluminar | No está confirmado que exporte PNG con alfa: pruébalo con una imagen |
| Recraft V4.1 Vector / Ideogram Vector | — | — | — | — | **Logos en SVG** | Para la marca que luego va por código |

La tarifa por API de Nano Banana Pro y GPT Image **no está confirmada** (no están en la API de pago por uso).

## Alfa, recorte y 3D generado
Para los assets que se componen encima de la web (skill `capas-alfa`). Precios de fal y Runware, 07 a 10-2026.

| Qué | Opción | Precio | Nota |
|---|---|---|---|
| Imagen con alfa nativo | GPT Image 1.5 / 2.5 / 2.6 (`background: "transparent"`) | como su imagen | GPT Image 2 lo perdió el 30-09-2026; la 2.6 lo tiene (Higgsfield MCP, 11-2026). No describas fondo en el prompt |
| | Seedream 5 Pro (`remove_bg`, Higgsfield MCP) | como su imagen | Recorta en el mismo paso; mide el borde con `alfa.mjs --modo ya-alfa` |
| | Ideogram 3 Transparent | 0,03-0,09 $ | Bueno en bordes finos |
| | Seedream 5 Flash (`background: "transparent"`) | ~0,019 $ | El más barato con alfa; una sola referencia |
| Imagen partida en capas | Qwen-Image-Layered | ~0,05 $ | 1-10 capas RGBA de una foto (fondo, sujeto, primer plano) |
| | gpt-image-1 / 1.5 / 2.5 (`background: "transparent"`, salida PNG o WebP) | por tokens | La vía de la API de OpenAI |
| Recorte de imagen | `alfa.mjs` (local, fondo liso) | 0 $ | Croma, negro, blanco o par negro/blanco para lo semitransparente |
| | Rembg Enhance · Ideogram Remove BG · Recraft · Pixelcut · Bria RMBG 2.0 (fal, 07-2026) | 0,006 · 0,01 · 0,011 · 0,016 · 0,018 $ | Para fondos que no son lisos |
| | `rembg` (BiRefNet) en local | 0 $ | Necesita Python (mejor con GPU) |
| | Higgsfield Layers | sin confirmar | Separa sujeto y fondo; no está confirmado que exporte PNG con alfa |
| Vídeo con alfa nativo | Wan-Alpha (abierto, 832×480) · Firefly Video "transparent background" | alojado sin precio publicado · plan de Adobe | Kling, Veo, Seedance, Runway y Luma **no** dan alfa |
| Recorte de vídeo | `alfa.mjs` (local, fondo liso o negro) | 0 $ | La vía por defecto si el vídeo se pidió sobre fondo liso |
| | BiRefNet v2 vídeo (fal) | ~0,0008 $ por segundo de cómputo | Saca ProRes 4444 o WebM con alfa |
| | VEED · Bria v3 · BEN (fal) | 0,015-0,0225 $ por 30 fotogramas · 0,05 $/s · — | Fondos complicados; devuelven WebM con alfa o la máscara |
| 3D desde fotos | TRELLIS 2 · Hunyuan3D v3 (fal) | 0,25-0,35 $ · desde 0,225 $ | Para giros con etiqueta rígida: render propio sin texto deformado |

## Elección rápida
- **Interior o escena con cámara que se mueve** (zoom a pantalla, entrada a una sala): imagen Qwen/Nano Banana → **Kling O3 pro** con inicio+fin. La prueba más barata: 4 s en Veo 3.1 Lite 720p (solo imagen de inicio) o 3 s en Kling 3.0 std.
- **Producto con luz y materiales difíciles** (vidrio, líquido, comida): Veo 3.1 Fast/Std o Kling O3 pro; prueba ambos en 3-4 s.
- **Movimiento cinematográfico con paralaje fuerte** y presupuesto: Seedance 2.5 a 1080p (mejor en su API oficial).
- **Bucle de fondo:** Kling 3.0 std con inicio = fin (o Luma, modo loop, fuera de Higgsfield).
- **Plano largo** (> 10 s): una toma de Seedance 2.5 (hasta 30 s) o Kling 4.0 con fotogramas intermedios; si no, 2-4 clips encadenados por fotograma. Árbol completo por plano y presupuesto: `video-ia-para-scroll/references/arbol-decision.md`.
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
