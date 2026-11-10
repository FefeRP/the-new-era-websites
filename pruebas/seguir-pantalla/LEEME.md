# Prueba de seguir-pantalla con verdad conocida

Vídeo sintético hecho por código (escena plana con un portátil, empuje ×2,2 con giro y perspectiva) en el que se sabe dónde
está cada esquina de la pantalla en cada fotograma. Mide el seguimiento y la capa contra esa verdad. Nada de esto va al repo
salvo los scripts: la salida se genera en una carpeta temporal.

```
# 1. vídeo + verdad (imprime las esquinas del primer y último fotograma)
node pruebas/seguir-pantalla/hacer-video-prueba.mjs <tmp>
# 2. seguimiento con dos claves y error contra la verdad (sale ≤ 3 px)
node plugins/the-new-era-websites/skills/seguir-pantalla/scripts/seguir-pantalla.mjs <tmp>/prueba.mp4 --esquinas "520,260 800,260 800,435 520,435" \
     --clave "3.9583=376,173 989,198 976,563 363,545" --salida <tmp>/pista.json --revision <tmp>/rev
node pruebas/seguir-pantalla/hacer-video-prueba.mjs --medir <tmp>/pista.json <tmp>/verdad.json
# 3. frames + pista para la página
node plugins/the-new-era-websites/skills/scroll-frames/scripts/extraer-frames.mjs <tmp>/prueba.mp4 <tmp>/frames --frames 48 --ancho 1280 --formato webp
cp <tmp>/pista.json <tmp>/frames/
# 4. sirve la raíz del repo y la carpeta de frames (mismo origen o con CORS) y abre
#    /pruebas/seguir-pantalla/web/?base=<url de frames>/
# 5. prueba automática (desde demos/reloj, donde está playwright-core): escritorio cover/contain y móvil, error < 5 px CSS
node ../../pruebas/seguir-pantalla/probar-capa.mjs "<url de la página>?base=<url de frames>/" <tmp>/verdad.json <tmp>/capturas
```

Resultado del 30-10-2026: seguimiento con 2 claves, error medio 1,02 px y máximo 2,89 px; capa en el navegador, máximo
3,2 px CSS en escritorio (cover y contain) y móvil (variante recortada), aspecto 16:10 conservado, 0 errores de consola.
