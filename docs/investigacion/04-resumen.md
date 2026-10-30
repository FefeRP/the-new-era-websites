# Resumen: webs de scroll con IA (2026-10-30)

Detalle y fuentes en [04-webs-scroll-con-ia-2026.md](04-webs-scroll-con-ia-2026.md).

1. **Casi todo lo "imposible" son fotos.** En los vídeos de referencia, la mayoría de efectos salen de fotos fijas, capas,
   máscaras, un zoom 2D o 3-4 clips cortos con la misma luz. El 3D solo donde algo gira libre en varios ejes.
2. **Lo quieto, foto; lo que cambia, vídeo.** Un splash congelado, un producto, un interior: imagen. Vídeo solo si la cámara
   viaja o algo cambia físicamente. Texto, cifras, logos, pantallas y marcadores: siempre código.
3. **Alfa:** pedir el elemento aislado (gpt-image-1.5/2.5, Ideogram Transparent o Seedream 5 dan alfa al generar; el resto,
   fondo liso y recorte por 0,006-0,018 $). Vídeo: BiRefNet en fal (~0,001 $) o generar sobre negro y mezclar con `screen`.
   En la web, "stacked alpha" (color + alfa en un MP4 normal y un shader) es lo único que va en todos los navegadores sin Mac.
4. **Stack:** Lenis + GSAP ScrollTrigger con un solo ticker; CSS scroll-driven solo como mejora; View Transitions entre páginas;
   frames WebP en canvas con ventana de memoria, o vídeo con keyframes cada 1-8 frames.
5. **Rendimiento:** el canvas no cuenta para el LCP (poner un `<img>` del primer frame); `100svh`, `ignoreMobileResize`,
   `gsap.matchMedia` para reduced-motion; hero ≤ 2-3 MB en móvil.
6. **Recetas que funcionan:** plate primero (producto al ~80 % del alto), imagen de inicio y fin, cámara fija para cambios de
   estado, nunca giro y zoom a la vez; para etiquetas rígidas, 3D generado (TRELLIS, Hunyuan3D, ~0,25 $) o la etiqueta enrollada.
7. **Mapas:** la IA inventa geografía. Niveles de zoom desde ortofoto real abierta (PNOA, USGS, Copernicus) y la IA, como mucho,
   para estilizar o animar entre fotogramas reales.
8. **Hueco que nadie cubre bien:** presupuesto antes de generar, continuidad entre clips y móvil.
