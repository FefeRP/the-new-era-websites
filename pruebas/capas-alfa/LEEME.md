# Prueba de capas-alfa (alfa.mjs + video-alfa.js)

Entradas sintéticas con el alfa real conocido, para medir `alfa.mjs` sin IA ni coste, y una página que comprueba en Chrome
el vídeo con alfa (bucle y scroll), los frames con alfa y el póster con reduced-motion. `entrada/` y `salida/` no van al
repo: se regeneran en unos segundos.

## Regenerar y medir (desde esta carpeta)
```bash
node hacer-prueba.mjs entrada
A=../../plugins/the-new-era-websites/skills/capas-alfa/scripts/alfa.mjs
node $A --entrada entrada/croma.mp4 --modo croma --salida salida/croma --formatos apilado,webm,frames,png,poster --movil
node $A --entrada entrada/croma.mp4 --modo croma --salida salida/croma-scrub --scrub
node $A --entrada entrada/negro.mp4 --modo negro --salida salida/negro --formatos apilado,png,poster
node $A --modo diferencia --negro entrada/splash-negro.png --blanco entrada/splash-blanco.png --salida salida/splash
node $A --modo diferencia --negro entrada/splash-negro.png --blanco entrada/splash-blanco-movido.png --salida salida/splash-movido
node $A --entrada entrada/producto-verde.png --modo croma --salida salida/producto
node medir.mjs entrada/verdad-croma salida/croma/png
node medir.mjs entrada/verdad-negro salida/negro/png
node medir.mjs entrada/verdad-splash.png salida/splash/recorte.png
node medir.mjs entrada/verdad-producto.png salida/producto/recorte.png
```

11-11-2026: tras el cambio a paso entero de fotogramas (`--fps`), los cinco casos dan exactamente las mismas cifras.
Con un vídeo de 60 fps: `--fps 24` saca 20 fps (1 de cada 3, con aviso) y sin `--fps` saca 30 (1 de cada 2). Antes
sacaba los 60 fotogramas etiquetados a 30 fps, y el vídeo iba a media velocidad.

## Resultados (30-10-2026)
| Caso | Error medio del alfa | Error en el borde | Recomposición |
|---|---|---|---|
| Croma (vídeo H.264, esfera con borde suave + aro de cristal al 45 % sobre verde con ruido y verde rebotado) | 0,005 | 0,115 | 39,8 dB |
| Negro (chispas y humo) | 0,011 | 0,026 | 40,1 dB |
| Diferencia negro/blanco (salpicadura al 55-85 %) | 0,0003 | 0,0014 | 59,4 dB |
| Croma de imagen (frasco) | 0,0001 | 0,031 | 49,8 dB |
| Par negro/blanco desplazado 6 px | — | — | **aviso** "los tres canales dan alfas distintos" (17 %) |

Comparativa: el `chromakey` + `despill` de ffmpeg daba 28,2 dB en el vídeo (se comía el aro de cristal y oscurecía el borde)
y 38,1 dB en el frasco; por eso `alfa.mjs` usa su propia clave lineal con desmezcla.

## Prueba en el navegador
```bash
node ../servidor-estatico.mjs ../.. 5193          # raíz del repo, con peticiones Range (hacen falta para el vídeo)
cd ../../demos/reloj                               # allí está playwright-core
node ../../pruebas/capas-alfa/probar-web.mjs http://127.0.0.1:5193/pruebas/capas-alfa/web/ ../../capturas/prueba-capas-alfa
```
Resultado: 20/20 (sin verde, sin rectángulos negros, el sujeto se ve en las cuatro secciones, el vídeo avanza con el scroll,
póster con reduced-motion, 0 errores).
