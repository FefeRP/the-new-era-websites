# Prueba de mapa-imagen.js (mapa por niveles de imagen)

Recorrido real por Barcelona con ortofoto del PNOA (PNOA cedido por © Instituto Geográfico Nacional, CC BY 4.0): la
ciudad, el Eixample, la Sagrada Família y, pasando por encima de los dos sitios, la Torre Glòries a 1,3 km. Cuatro niveles
(ciudad y barrio 16:9; dos calles hermanas 4:5), marcadores HTML, ruta discontinua y etiqueta de distancia.

```bash
# 1. niveles (red + ffmpeg en FFMPEG o en el PATH): baja cada caja del WMS del IGN y escribe activos/niveles.json
cd pruebas/mapa-imagen && node descargar-niveles.mjs activos
# 2. servir la raíz del repo
node pruebas/servidor-estatico.mjs . 5193
# 3. prueba en Chrome (desde demos/reloj, donde está playwright-core)
cd demos/reloj && node ../../pruebas/mapa-imagen/probar.mjs http://127.0.0.1:5193/pruebas/mapa-imagen/ ../../capturas/prueba-mapa-imagen
```

Qué comprueba:
- la ciudad llena la vista al empezar; atribución visible;
- en cada parada, la cámara centrada en el sitio (Δ < 0,001) y su marcador exactamente sobre el punto (< 3 px);
- el nivel de calle es más nítido que ampliar el barrio (energía del laplaciano 14 frente a 3,5) y está alineado con él;
- cambio de zona con arco: a mitad se ve 9× más ancho, con la ruta trazada y la etiqueta de distancia;
- cámara sin saltos y anclada (el destino se acerca al centro sin pasarse);
- `fotograma()` exporta los encuadres de inicio y fin (para pedir un clip de vídeo IA entre las dos vistas);
- reduced-motion: corte de parada en parada; móvil vertical: marcador centrado y el nivel de calle cubre toda la vista;
- 0 errores de consola.

Resultado (30-10-2026): 22/22. Peso de los cuatro niveles: 4 MB (WebP calidad 80).
Lección: los niveles profundos 16:9 no cubren la vista final de un móvil vertical; por eso las calles son 4:5.
