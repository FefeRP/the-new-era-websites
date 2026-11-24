# Pedir el asset aislado (para recortarlo bien)

El recorte bueno empieza en el prompt: un sujeto bien separado de un fondo liso se recorta solo; uno con pelo suelto sobre un
fondo cargado no lo arregla ningún script. Precios de octubre de 2026 (confírmalos en `pedir-assets-ia/scripts/precios.json`).

## 1. Imagen con alfa nativo (sin recortar después)
Qué modelos dan alfa nativo y cómo se pide (`background: "transparent"` en GPT Image 1.5 / 2.5 / 2.6 y Seedream 5
Flash, `remove_bg` en Seedream 5 Pro, Ideogram 3 Transparent, Qwen-Image-Layered para partir una imagen en capas), con
su precio: [proveedores.md](../../pedir-assets-ia/references/proveedores.md) de `pedir-assets-ia`, «Alfa, recorte y 3D
generado». GPT Image 2 lo perdió el 30-09-2026.

- **No describas ningún fondo** en el prompt: con "on a white background" algunos lo pintan aunque pidas transparencia.
- Revisa igual con `alfa.mjs --modo ya-alfa --entrada x.png` (la hoja enseña halos y restos).
- Plantilla (guía de OpenAI): `Extract the product from the input image and isolate it on a fully transparent background.
  Output: centered product, crisp silhouette, no halos/fringing. Do not add a solid backdrop, checkerboard, scenery, or shadow.`

## 2. Imagen sobre fondo liso (cualquier modelo) → `alfa.mjs`
Elige el fondo por el sujeto:
| Sujeto | Fondo | Modo de `alfa.mjs` |
|---|---|---|
| Opaco y sin verde (producto, fruta, persona) | verde croma `#00B140` | `croma` |
| Verde (hojas, botella verde, lima) | magenta `#FF00FF` o azul `#0047BB` | `croma` |
| Luminoso o claro: humo, vapor, chispas, polvo con luz, leche, salpicadura blanca | **negro puro** | `negro` |
| Oscuro sobre claro: tinta, trazos, sombras | **blanco puro** | `blanco` |
| Semitransparente con color: vaso, cristal, zumo, gel, burbujas | **par negro + blanco** de la misma imagen | `diferencia` |
| Lo quieres recortar con un servicio (rembg, BiRefNet) | gris neutro claro | (servicio) + `ya-alfa` |

Bloque de fondo para el prompt (en inglés, al final):
- Croma: `Isolated on a perfectly flat, evenly lit chroma green background (#00B140), no gradient, no vignette, no floor, no
  horizon, no shadow on the background, subject fully inside the frame with margin on all sides.`
- Negro: `Pure black background (#000000), no grey lift, no vignette, no floor, no reflections, nothing else in frame.`
- Par negro/blanco: genera sobre negro y después **edita** esa imagen: `Same image, keep the subject exactly as it is, only
  change the background to pure white (#FFFFFF).` Si el editor mueve el encuadre, `alfa.mjs` lo avisa (los canales no
  coinciden): repite la edición o usa otro editor.

Reglas de la toma aislada:
- Sujeto **entero dentro del encuadre** con margen (si toca el borde, el corte se ve en la web).
- **Luz que case con la escena** donde irá (dirección y temperatura): el recorte no arregla una luz de otra escena.
- **Sin sombra en el fondo**; la sombra de contacto, como capa propia (`parallax-capas`, `capas-sombra.mjs`) o por código.
- Pelo, pelusa y hierba fina: lo más difícil. Pide pelo recogido o fondo más claro que el pelo; o acepta un borde algo duro.
- El verde rebota en superficies brillantes y cristal: para lo reflectante, magenta o el par negro/blanco.

## 3. Recorte por servicio (cuando no hay fondo liso)
Servicios de recorte (0,006-0,018 $ por imagen en fal), `rembg` en local y Higgsfield Layers, con precio y avisos:
[proveedores.md](../../pedir-assets-ia/references/proveedores.md), «Alfa, recorte y 3D generado». Lo que devuelvan entra
en `alfa.mjs --modo ya-alfa` para revisarlo.

## 4. Vídeo con alfa
| Vía | Cómo | Coste | Cuándo |
|---|---|---|---|
| **Sobre negro** | prompt con el bloque negro; `alfa.mjs --modo negro` | el del vídeo | humo, vapor, chispas, polvo, salpicadura clara |
| **Sobre fondo liso** | imagen de inicio aislada sobre verde/magenta + vídeo (Kling, Veo, Seedance) que conserve el fondo; `--modo croma` | el del vídeo | sujeto opaco que se mueve (fruta que cae, producto que gira) |
| **Recorte por fotograma** | BiRefNet v2 vídeo en fal (ProRes 4444 o WebM con alfa, o la máscara) → `--modo ya-alfa` o `--modo mascara` | ~0,001 $ por s de cómputo | fondo no liso o el croma no basta |
| VEED / Bria / BEN (fal) | igual, devuelven WebM con alfa o máscara | 0,015-0,05 $/s | alternativa a BiRefNet |
| **Generado con alfa** | Wan-Alpha (solo texto a vídeo, 832×480) o Adobe Firefly ("Transparent background") | variable | elementos genéricos (agua, humo) sin producto concreto |

- Kling, Veo, Seedance, Runway y Luma no generan alfa: el fondo liso hay que pedirlo y **mantenerlo**:
  `Keep the background a perfectly flat, unchanged chroma green for the whole clip; locked camera; the subject never leaves the frame.`
- **Cámara fija** siempre que haya que recortar: si la cámara se mueve, el fondo deja de ser liso (luz, viñeta).
- Imagen de inicio sobre el mismo fondo liso; si el modelo admite fin, también.
- 24 fps, sin audio, 4-6 s. Para bucle, inicio = fin (o el bucle por código: ida y vuelta).
- Revisa la hoja de `alfa.mjs` y `fotogramas_dudosos` en `alfa.json`: el recorte que parpadea entre fotogramas se nota mucho.

## 5. Coste orientativo de un elemento
- Splash congelado (foto): imagen 0,03-0,08 $ + par blanco 0,03-0,08 $ = **0,06-0,16 $**.
- Producto recortado: imagen 0,05-0,13 $ (+ recorte 0,006-0,018 $ si no es de fondo liso).
- Humo o chispas en bucle (vídeo sobre negro, 5 s): **0,25-0,56 $**.
- Fruta que cae (vídeo sobre verde, 5 s): 0,25-0,56 $ + imagen de inicio 0,05 $.
Siempre la imagen primero; el vídeo, solo si la imagen con movimiento por código no basta.
