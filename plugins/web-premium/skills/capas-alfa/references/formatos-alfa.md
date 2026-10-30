# Formatos con alfa: cuál usar

| Formato | Navegadores | Peso (ejemplo de 5 s, 640-1280 px) | Uso | Lo genera |
|---|---|---|---|---|
| **Stacked alpha MP4** (H.264; color premultiplicado arriba, alfa abajo) + `video-alfa.js` | Todos (WebGL 1) | 0,1-3 MB | **Por defecto** para vídeo con alfa: bucle o scroll | `alfa.mjs` (`apilado.mp4`) |
| WebM VP9 con alfa | Chrome, Edge, Firefox; **no Safari** | 0,1-1,5 MB | `<video>` directo cuando Safari no importa | `alfa.mjs` (`alfa.webm`) |
| HEVC con alfa (`hvc1`) | Safari | ~3 veces el WebM | Solo si se codifica en un Mac (`hevc_videotoolbox`) | — (no en Windows/Linux) |
| Frames WebP con alfa + `frame-scrubber` (`transparente: true`) | Todos | 3-8 MB (120 frames a 1280 px) | Scroll exacto, iOS en ahorro de energía | `alfa.mjs --formatos frames [--movil]` |
| WebP / PNG con alfa | Todos | 50-250 KB | Capa quieta (parallax, zoom, máscara) | `alfa.mjs` (imagen) |
| AVIF con alfa | Todos los actuales | algo menos que WebP | Capa quieta, si el decodificado no es crítico | ffmpeg/avifenc a partir del PNG |

Fuente de navegadores y pesos: Jake Archibald, "Video with transparency" (05-08-2024); ningún documento confirma que Safari
respete el alfa de VP9.

## Cómo elegir
- **Capa quieta** → WebP con alfa (+ `srcset` móvil). Es lo normal.
- **Bucle decorativo** (humo, burbujas, partículas, splash que se repite) → apilado (`modo: 'bucle'`).
- **Avanza con el scroll**:
  - corto y ligero → apilado con `--scrub` (`modo: 'scroll'`, `irA(p)` desde ScrollTrigger);
  - plano estrella, exactitud total, iOS → frames con alfa (`frame-scrubber` con `transparente: true`).
- **Luminoso sobre negro** y el fondo de la web es oscuro → a veces basta el vídeo normal con `mix-blend-mode: screen`
  (sin alfa); `--modo negro` lo hace válido sobre cualquier fondo, también claro.

## Detalles que importan
- El apilado tiene el doble de alto: 1280×720 → 1280×1440. Algunos móviles antiguos limitan H.264 a 1920 px de alto: con
  vídeos verticales usa `--ancho 720` o menos.
- `alfa.mjs` guarda el color **premultiplicado** (negro donde no hay sujeto): comprime mejor y evita el halo verde al
  escalar. `video-alfa.js` lo compone con `premultipliedAlpha: true`.
- Keyframes: por defecto uno cada 2 s (bucle, pesa poco). `--scrub` pone uno cada 4 frames: la búsqueda con `currentTime`
  responde rápido sin el peso de `-g 1`.
- Frames con alfa: la memoria decodificada es la misma que sin alfa (ancho × alto × 4 bytes): la ventana LRU de
  `frame-scrubber` sigue siendo necesaria.
- iOS en ahorro de energía no reproduce `<video>`: `video-alfa.js` deja el póster. Si el elemento es imprescindible en móvil,
  frames.
