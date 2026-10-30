# Matriz: foto, vídeo, capas con alfa, frames o 3D (por tipo de elemento)

Antes de pedir nada, cada elemento de la web pasa por esta tabla. Regla de fondo: **lo quieto es foto; vídeo solo si la cámara
viaja o algo cambia físicamente; 3D solo si gira libre o el usuario lo toca.** El movimiento "de adorno" (flotar, acercarse,
parallax, entrar por una máscara) lo pone el código sobre una foto, gratis y sin artefactos.

## Los cinco medios
| Medio | Qué es | Coste típico (IA, oct-2026) | Peso en la web | Riesgo principal |
|---|---|---|---|---|
| **Foto** | Una imagen fija (WebP/AVIF) que el código mueve: zoom, parallax, máscara, fundido | 0,02-0,13 $ por imagen | 80-300 KB (1600-2400 px) | Bajo: lo que ves es lo que hay |
| **Capas con alfa** | El elemento aislado (PNG/WebP con alfa) sobre otras capas, cada una a su velocidad | 0,02-0,13 $ + recorte 0,006-0,018 $ (o alfa nativo) | 50-250 KB por capa | Bordes (halo, pelo, cristal) y sombra perdida |
| **Vídeo** | Clip de 4-8 s que se reproduce o avanza con el scroll (`currentTime`) | 0,25-0,60 $ por 5 s (Veo Lite, Kling std/pro) | 1-2 MB normal · ~8 MB todo intra a 1280 px | Deformaciones, rectas que tiemblan, letras inventadas |
| **Vídeo con alfa** | Clip aislado: stacked alpha (MP4) o WebM VP9 + frames WebP con alfa | vídeo + 0,001-0,25 $ de recorte por clip (o sobre negro gratis) | stacked 1-3 MB · frames con alfa 3-8 MB | Borde que parpadea entre fotogramas; Safari sin VP9 alfa |
| **Frames** | El vídeo partido en WebP pintados en canvas según el scroll: 90-150 de 1600 px en escritorio, 60-90 de 900 px en móvil | el del vídeo | 3-8 MB escritorio · ≤ 4 MB móvil | Memoria en iOS (ventana LRU), peso |
| **3D** | Modelo glTF en tiempo real (three.js) | 0 (libre) · 0,25-0,35 $ generado (TRELLIS, Hunyuan3D) · modelado a mano | three ~150 KB gz + modelo 1-3 MB | Aspecto de "render barato", GPU en móvil |

## Por tipo de elemento
Orden de preferencia: **1.ª opción** → alternativa → lo que **no** hacer.

| Elemento | 1.ª opción | Alternativa | Evitar | Por qué |
|---|---|---|---|---|
| **Objeto estático** (producto en reposo, ingrediente, plato) | Foto aislada con alfa + parallax/zoom por código | Foto con fondo de la sección | Vídeo de "producto flotando" | El vídeo cuesta 10-20 veces más y solo añade temblor |
| **Objeto que gira** (360°) | Frames de un giro: 3D generado y renderizado, o vídeo con inicio = fin y cámara fija | `envase-giratorio` si es cilíndrico con etiqueta; 3D en vivo si el usuario lo gira | Vídeo con giro **y** zoom a la vez; Seedance para un 360 | La IA inventa la cara trasera y dobla las etiquetas |
| **Líquido, splash, vertido** | Congelado: **foto** del splash aislada (o sobre negro) en capa | Si tiene que moverse: vídeo sobre negro (`screen`) o vídeo recortado con alfa | Simulación 3D de fluidos | Un splash congelado es una foto; el líquido en tiempo real no es creíble |
| **Partículas** (polvo, chispas, granos, humo) | Código (canvas/CSS) si son puntos o motas | Vídeo sobre negro con `screen` para humo y chispas realistas | Vídeo con fondo para luego recortar | Sobre negro el alfa sale gratis; recortar humo es lo más difícil |
| **Fondo ambiental** (cielo, interior, textura, luz) | Foto con movimiento lento por código (zoom, parallax de 2-3 capas) | Vídeo en bucle corto y sutil (luz, cortinas, agua) | Vídeo largo de fondo con scroll | El fondo no es el protagonista: que no compita ni pese |
| **Mapa / ubicación** | Mapa real (`mapa-zoom-ubicacion`, MapLibre) o **niveles de imagen** desde ortofoto real + marcadores por código | Ilustración cenital/isométrica hecha **sobre** ortofoto real; IA solo para animar entre fotogramas reales | Ciudad o calles inventadas por la IA; Google Earth/Maps en anuncios | La IA inventa geografía; las licencias abiertas (PNOA, USGS) sí permiten |
| **Producto protagonista** (el momento estrella) | Frames de un vídeo IA desde la foto real (plate primero) | Capas con alfa si el momento es "flotar" o "despiezar en capas"; 3D si se configura | Texto a vídeo sin foto del producto | Sin plate, el modelo se inventa otro producto |
| **Personas** | Foto (retrato, ambiente) con parallax o máscara | Vídeo corto con cámara casi quieta y la persona haciendo una sola acción | Primeros planos de caras en movimiento, manos manipulando | Caras y manos son lo primero que delata la IA |
| **UI, texto, cifras, logos, pantallas** | **Código** (HTML, SVG, `seguir-pantalla`) | Captura real encajada con su proporción | Generarlos con IA, estirarlos | La IA inventa letras y aplasta logos |
| **Transiciones entre escenas** | Código (cortina, `clip-path`, fundido, máscara SVG) | Clip con imagen de inicio y fin si hay puente físico real | Morphing libre entre dos escenas | El código es exacto y gratis; el morphing se nota |

## Cuándo sube de categoría (y cuánto cuesta subir)
- **Foto → capas con alfa:** cuando el texto tiene que pasar **entre** el fondo y el sujeto (sándwich de texto), o el sujeto
  flota sobre otro fondo. +0,006-0,018 $ por recorte; pide la foto con el sujeto bien separado.
- **Foto → vídeo:** cuando la cámara tiene que **entrar** en el espacio (paralaje real que el zoom 2D no da) o el sujeto cambia
  de estado (se abre, se vierte, se hornea). +0,25-0,60 $ por clip; prueba de 3 s antes.
- **Vídeo → vídeo con alfa:** cuando el elemento que se mueve tiene que ir sobre fondos distintos o con texto detrás.
  Primero intenta generarlo sobre negro (gratis con `screen`) o sobre el color exacto de la sección (sin alfa).
- **Cualquier cosa → 3D:** solo si el usuario lo manipula, si gira libre en varios ejes o si hace falta el mismo objeto en
  muchos ángulos (configurador). Si no, el 3D es el respaldo barato sin presupuesto.

## Formatos de salida (lo que entregas a las skills que montan)
| Asset | Resolución | Formato | Peso objetivo |
|---|---|---|---|
| Foto de fondo / hero | 2400 px lado mayor (escritorio), 1200 px (móvil) | AVIF + WebP (q 75-82), `srcset` | ≤ 300 KB escritorio · ≤ 150 KB móvil |
| Capa con alfa | El tamaño mostrado × 2 como mucho | WebP con alfa (q 80-88); PNG solo como máster | ≤ 250 KB por capa |
| Vídeo para frames | Máster 1920×1080 o 1080×1920, 24 fps, sin audio; se exporta a 1600 px (escritorio, 90-150 frames) y 900 px (móvil, 60-90) | MP4 máster → WebP q 75 por frame (`extraer-frames.mjs --ancho 1600 --ancho-movil 900`) | 3-8 MB escritorio · 1,5-4 MB móvil |
| Vídeo con `currentTime` | Tamaño mostrado (1280 px típico) | MP4 H.264 `-g 1` a `-g 8` | 1-8 MB |
| Vídeo con alfa | ≤ 1280 px de lado, 24-30 fps | stacked alpha MP4 (todos) + WebM VP9 alfa (opcional) + póster WebP | ≤ 3 MB |
| Frames con alfa | ≤ 1280 px, 60-120 frames | WebP con alfa | ≤ 6 MB |
| Mapa por niveles | 2048-2560 px por nivel (los profundos, 4:5 para móvil) | WebP/AVIF calidad 70-80; JSON de niveles y marcadores en coordenadas 0..1 | ≤ 900 KB por nivel |
| Modelo 3D | — | glTF/GLB con Draco o Meshopt, texturas KTX2 | ≤ 3 MB escritorio · 1,5 MB móvil |

Las cifras de coste salen de `scripts/precios.json`; calcúlalas siempre con `scripts/presupuesto.mjs` antes de pedir el vale.
