# Modelos de imagen y precios (los precios cambian: confírmalos en la herramienta antes de presupuestar)

Planes de Higgsfield, créditos por imagen de cada modelo (Nano Banana, GPT Image, Seedream, Soul, Marketing Studio,
Layers…), API y los demás proveedores, en un solo sitio:
[proveedores.md](../../pedir-assets-ia/references/proveedores.md) de `pedir-assets-ia` («Imagen en Higgsfield»). El
presupuesto se calcula con `pedir-assets-ia/scripts/presupuesto.mjs`.

Para fotos del producto real: Nano Banana Pro o GPT Image en calidad alta si hay texto o logo (el más fiable, el
primero); Seedream 5 o Nano Banana 2.1 para volumen; Soul solo para ambiente sin producto; Marketing Studio para una
serie desde una foto; Layers para separar capas o reiluminar. Ninguno promete fidelidad de logo o texto: revisa siempre.

## Alternativas (gratis en local, necesitan GPU)
| Modelo | Licencia | Requisitos | Nota |
|---|---|---|---|
| Qwen-Image-Edit-2511 | Apache 2.0 (uso comercial permitido) | 24 GB VRAM; 12 GB con GGUF Q4 | edición por referencia, inpaint crop-and-stitch |
| FLUX.1 Kontext dev | no comercial | 12-24 GB | solo para probar; por API, Flux 3 / Flux 2 pro (ver `proveedores.md` de `pedir-assets-ia`) |
| IC-Light v1 | OpenRAIL-M | ~6-8 GB (sin confirmar) | reiluminar un recorte para que case con la escena |
| BiRefNet / rembg | MIT | CPU vale | recorte con alfa (rembg necesita Python) |

## Presupuesto tipo (web con hero por capas + 3 tomas de apoyo + imagen clave de vídeo)
- Tomas finales: hero 16:9, hero 9:16, escena vacía, 3 de apoyo e imagen clave. En total, 7.
- Con margen ×3 por las tiradas: ~21 imágenes × 2 créditos ≈ 42 créditos ≈ **2-3 $** con Nano Banana Pro a 2K.
- Rehacer 2 a 4K: +8 créditos.
- El vídeo va aparte y es mucho más caro: ver `video-ia-para-scroll`.
