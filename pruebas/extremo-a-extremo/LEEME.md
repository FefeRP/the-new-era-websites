# Ejemplo de punta a punta: Orbe 01, boutique y taller en Sabadell

Una página real hecha con el flujo de la skill maestra `web-premium` (brief → guion → medio de cada elemento → presupuesto →
activos → montaje → verificación) y las técnicas nuevas juntas, solo con activos gratuitos o generados por código.
Plan, matriz de medios y presupuesto en [PLAN.md](PLAN.md) (`plan.json` para `presupuesto.mjs`). **Coste real: 0 $.**

## Qué demuestra
| Tramo | Técnica | Motor o script |
|---|---|---|
| Hero | Titular HTML **entre** el fondo y el reloj recortado con alfa, entrada línea a línea y parallax leve | `capas-alfa/scripts/alfa.mjs` (croma magenta, `--recortar`), `revelados.js` → `crearLineas` |
| Giro | 120 frames en canvas fijado con el scroll; `<img>` del frame 0 debajo (LCP); 3 textos HTML | `scroll-frames/scripts/frame-scrubber.js` |
| Detalle | La esfera (un frame recortado) se descubre por bloques | `revelados.js` → `crearRejilla` |
| Taller | Del municipio a la calle con 3 niveles de ortofoto PNOA, marcador y atribución | `mapa-zoom-ubicacion/scripts/mapa-imagen.js` |
| Cierre | Precio, botón y créditos (modelo glTF CC BY y PNOA) | HTML |

Sin build ni GSAP: módulos ES importados por ruta relativa desde `plugins/` y un solo cálculo de scroll para todas las escenas.
`overflow: clip` (nunca `hidden`) en los antepasados de los sticky, `100svh`, reduced-motion (titular quieto, sin parallax,
un frame fijo por fase, rejilla abierta, mapa de parada en parada) y todo el texto en HTML.

## Regenerar y probar
`activos/` no va al repo (se regenera en ~30 s; necesita red para el WMS del IGN):
```bash
# desde la raíz del repo; ffmpeg en FFMPEG/FFPROBE o en el PATH; demos/reloj con npm install (three y playwright-core)
node pruebas/extremo-a-extremo/preparar.mjs            # [--solo producto,frames,mapa]
node pruebas/servidor-estatico.mjs . 5193               # si no está ya en marcha
cd demos/reloj
node ../../pruebas/extremo-a-extremo/probar.mjs http://127.0.0.1:5193/pruebas/extremo-a-extremo/ ../../capturas/prueba-extremo-a-extremo
node ../../plugins/web-premium/skills/web-premium/scripts/verificar-scroll.mjs http://127.0.0.1:5193/pruebas/extremo-a-extremo/ ../../capturas/prueba-extremo-a-extremo/verificar --tramos "#giro,#taller"
```
`preparar.mjs` renderiza `render-producto.html` (three.js de `demos/reloj/node_modules`, Chrome con swiftshader) con su propio
servidor efímero, recorta con `alfa.mjs`, copia los frames de `demos/reloj/public/frames/reloj` (solo WebP) y baja la ortofoto.

## Resultados (30-10-2026)
- **Activos:** recorte del reloj 987×1098, 96 KB (alfa.json: cobertura 0,31 · borde 0,001 · halo 0 · fondo residual 0 · sin
  avisos; color detectado `#ff00ff`) · detalle 64 KB · frames 5,8 MB escritorio / 4,4 MB móvil (120) · mapa: ciudad 908 KB
  (2,5 m/px), barrio 900 KB (0,67 m/px), calle 4:5 768 KB (0,18 m/px).
- **`probar.mjs`: 31/31.** Hero sin un píxel verde ni magenta; el titular queda detrás del reloj (98,7 % de los 6550 px
  solapados iguales a «solo reloj»; móvil 97,6 %); parallax 198 px el titular frente a 40 px el reloj; el canvas cambia
  entre p=0 y p=1 (diferencia media 31,9/255); rejilla cerrada en 0 (100 % color del fondo) y abierta en 1 (desviación 72);
  mapa centrado en el taller (Δ 0,00000) con el marcador a 0 px del centro (móvil 0,2 px) y la vista final dentro del nivel
  de calle; atribución visible; reduced-motion y móvil 390×844 sin errores ni scroll horizontal; 0 errores de consola.
- **`verificar-scroll.mjs`:** escritorio, móvil y reduced-motion con 0 errores y 0 peticiones fallidas (8,1 MB transferidos en
  escritorio, 6,7 MB en móvil, casi todo frames y mapa). Hojas en `capturas/prueba-extremo-a-extremo/verificar/`; la de
  escritorio, también en `capturas/prueba-extremo-a-extremo/hoja-escritorio.png`.

Ajustes que salieron al mirar las capturas (ya en la página): en móvil el reloj no pisaba el titular (se subió); en el último
tercio del giro el reloj queda a la izquierda bajo el texto (velo lateral); en el mapa, velo más fuerte arriba a la izquierda
(tejados claros) y, en vertical, la parada del barrio con `cubrir` (si no, asoman bandas fuera de la base).

## Con IA de pago, en vez de lo gratuito
- Hero: la foto real del cliente editada sobre magenta liso (nano-banana-pro, ~0,13 $ por tirada) y el mismo `alfa.mjs`.
- Giro: imágenes de inicio y fin + vídeo de 5 s con inicio y fin (kling-o3-pro, ~0,56 $; antes, prueba de 3 s), y
  `extraer-frames.mjs` para los frames; revisión con `revisar-video.mjs`.
- Detalle: una imagen de la esfera de cerca (~0,05 $).
- Mapa y textos: igual (nunca IA). Total estimado 1,29 $ (peor caso 2,52 $); ver PLAN.md.
