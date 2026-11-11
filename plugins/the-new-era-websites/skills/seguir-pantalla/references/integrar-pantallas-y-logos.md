# Integrar pantallas, logos y textos sobre un vídeo

## Cómo funciona
1. `seguir-pantalla.mjs` busca cada esquina del fotograma N en el N+1 comparando un parche de imagen (correlación normalizada,
   que aguanta cambios de luz), con precisión subpíxel. Va de la primera clave hacia delante y de la siguiente hacia atrás, y
   mezcla las dos pasadas en proporción a la distancia: en cada clave el error es cero y la deriva no se acumula.
   - Si las dos pasadas discrepan o la esquina no se encuentra (tapada, fuera de cuadro), ese fotograma se marca dudoso y se
     rellena interpolando entre los buenos. Si son muchos, avisa: añade una `--clave` en medio.
   - Medido con un vídeo sintético con verdad exacta (empuje ×2,2 con giro y perspectiva, `pruebas/seguir-pantalla/` del repositorio):
     con 2 claves, error medio 1 px y máximo 2,9 px; solo hacia delante (1 clave), máximo 6,5 px. En un vídeo de IA real
     (arco de 6 s, la pantalla pasa de 175 a 450 px) la deriva de una sola pasada fue de 1-8 px: con la clave final se anula.
   - La precisión de las claves manda: un error de 3 px al medirlas son 3 px en todo el tramo. Mide ampliado (`--zona`).
2. `pista.json` guarda las esquinas por fotograma en píxeles del vídeo original (`esquinas[f] = [[x,y] ×4]`, `fps`, `ancho`, `alto`).
3. `capa-pantalla.js` crea un `div` con el aspecto real de la superficie y le aplica una homografía (`matrix3d`) que lleva su
   rectángulo a las 4 esquinas. En cada frame pintado (`alDibujar` de frame-scrubber) convierte: segundo del frame
   (`manifest.inicio + i / manifest.fps`) → esquinas de la pista (interpoladas) → recorte de la variante → caja del canvas
   (cover/contain) → px CSS. Coste por frame: un `transform`, sin layout.

## Opciones de la capa
| Opción | Por defecto | Para qué |
|---|---|---|
| `aspecto` | estimado (malo) | Proporción real de la superficie. **Pásala siempre**: MacBook 16:10, iMac/monitor 16:9, iPhone ~0,46, la placa medida |
| `ajuste` | `contain` | `contain`: cabe entero (bandas del color `fondo`). `cover`: llena y recorta. Nunca se estira |
| `resolucion` | 1280 | Ancho en px CSS del elemento antes de la perspectiva. Súbela si la pantalla acaba grande |
| `expandir` | 1 | px del vídeo que crece el cuadro hacia fuera para tapar el filo de la pantalla original (2-4 si se ve un hilo claro) |
| `radio` | 0 | Esquinas redondeadas (pantallas modernas ~0,5-1 % del ancho) |
| `filtro` | — | CSS filter para casarla con el vídeo: `blur(0.3-0.6px)`, `contrast(0.95)`, `brightness(0.97)`, `saturate(0.95)` |
| `brillo` | — | Reflejo encima (CSS background), p. ej. `linear-gradient(115deg,#ffffff1a,#fff0 45%)` |

## Que no parezca pegado (lo que delata una pantalla compuesta)
- **Demasiado nítida y limpia** frente a una escena con desenfoque y grano: `filtro: blur(...)` y, si el vídeo tiene grano, un
  `div` encima con ruido al 3-5 % (`mix-blend-mode: overlay`).
- **Sin reflejo:** un cristal real refleja la ventana o la lámpara. Degradado blanco muy suave (5-12 %) desde el lado de la luz.
- **Negros puros y blancos quemados:** las pantallas reales levantan los negros y tiñen el blanco con la luz de la sala.
  `contrast(0.93-0.97)`; de noche, la pantalla es lo más brillante, de día pierde contraste.
- **Color que no casa:** escena cálida → captura un pelo cálida (`sepia(0.05)`), escena fría → `hue-rotate` mínimo.
- **Captura que no es de esa pantalla:** usa una captura del tamaño real de esa pantalla (1512×982 de un MacBook 14, sin barras
  del navegador o con ellas, pero coherente) en lugar de una 16:9 cualquiera.

## Entrar en la pantalla (zoom final a la web)
- El modelo de vídeo **no sabe** entrar en una pantalla manteniendo la web legible. Lo que funciona:
  1. Vídeo IA del acercamiento hasta que la pantalla ocupa ~60-70 % del ancho (con sus 4 esquinas aún dentro).
  2. Capa con la captura siguiendo la pantalla.
  3. Último tramo por código: la capa (que ya es la web real) crece hasta llenar el viewport, y entonces se cambia por la web
     de verdad (HTML) o por la captura a pantalla completa. ≤ 1 s de scroll: si el tramo 2D dura más, se nota que es plano.
- **No** pidas a la IA un último fotograma que sea un recorte ampliado de la misma foto: interpola un zoom 2D sin paralaje y
  se nota falso. Si das fotograma final, que sea **otra toma** con la cámara de verdad más cerca (ver `pedir-assets-ia`).

## Logos en carteles, placas, cajas
- **Mide la cara** (ancho/alto en la imagen, corrigiendo la perspectiva a ojo o con la pista en el fotograma más frontal) y
  compárala con el logo. Si no coinciden, el logo va contenido y centrado con margen (15-25 %); nunca a las 4 esquinas.
- Mejor aún: pide la superficie **con la proporción del logo** ("landscape plaque about twice as wide as tall") y comprueba
  la imagen clave antes de generar el vídeo: los modelos ignoran a menudo las medidas.
- Un logo impreso no brilla como una pantalla: `fondo: 'transparent'`, `mix-blend-mode: multiply` en el contenido, y relieve
  o sombra muy ligera si es grabado. La textura del material encima (la misma zona de la imagen al 20-30 % en overlay) ayuda.

## Fallos típicos
| Síntoma | Causa | Arreglo |
|---|---|---|
| La capa resbala poco a poco | solo una clave | añade la clave final (y una en medio si el clip es largo o gira) |
| Tramo naranja en la revisión | esquina tapada (hoja, mano) o fuera de cuadro | clave antes y después del tapado; o corta el tramo |
| Hilo claro alrededor | el cuadro mide el borde exacto y el vídeo tiene halo | `expandir: 2-4` |
| Contenido deformado | `aspecto` mal o sin pasar | mide la superficie; nunca `fill` |
| Desfase de medio frame | frames extraídos con otro `inicio` o sin manifest nuevo | vuelve a extraer con `extraer-frames.mjs` actual |
| En móvil no aparece | el recorte 9:16 deja la pantalla fuera | `--recorte-movil x=…` o toma vertical |
| Letras inventadas asoman | la IA puso texto en la pantalla | capa opaca que la tape entera, o regenerar con pantalla en blanco |
