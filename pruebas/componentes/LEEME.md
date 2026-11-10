# Prueba de componentes-interactivos

Página sin build con los tres componentes de la skill `componentes-interactivos` (tarjeta con volteo y capas, carrusel en
órbita, anillo 3D y muro de reseñas en columnas), con contenido inventado y sin imágenes externas.

```bash
# 1. servir la raíz del repo
node pruebas/servidor-estatico.mjs . 5193
# 2. prueba en Chrome (desde demos/reloj, donde está playwright-core)
cd demos/reloj && node ../../pruebas/componentes/probar.mjs http://127.0.0.1:5193/pruebas/componentes/ ../../capturas/prueba-componentes
```

Qué comprueba (por el DOM, por geometría y por píxeles de la captura):
- tarjeta: gira con clic, Enter y espacio; Escape vuelve al frente; la cara oculta queda `inert`; un clic en un enlace del
  dorso no gira; las capas `data-z` salen en profundidad y no se transparenta el frente; `disparo: 'hover'` con ratón, y con
  un toque en táctil;
- carrusel en órbita: el elemento activo queda delante y centrado; botones, flechas y Fin; arrastre con encaje;
  clic en un lateral; el resto queda inerte; autoplay que se para con el puntero encima y fuera de pantalla;
- anillo 3D: perspectiva y tarjetas giradas en profundidad, las de detrás ocultas, velo en las laterales y, ligado al
  scroll, giro fraccionario con encaje en la más cercana al parar;
- reseñas: la lista real sigue en el DOM, la escena es decorativa (`aria-hidden`, `inert`), el bucle no salta y las
  columnas cambian con el ancho;
- reduced-motion: fundido en la tarjeta, cambios inmediatos en el carrusel, reseñas como lista;
- móvil (390×844) sin desplazamiento lateral; `destruir()` deja el DOM como estaba; 0 errores de consola.

Resultado (10-11-2026): 42/42.
