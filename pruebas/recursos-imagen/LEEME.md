# Prueba de lote-imagenes.mjs

Comprueba el script de revisión de lotes de la skill `recursos-imagen-ia` con entradas **de verdad conocida**, dibujadas
por código (sin IA y sin ficheros externos; necesita ffmpeg): piezas con alfa con defectos sembrados, una lámina de iconos y
texturas con y sin junta.

```bash
# desde la raíz del repo
node pruebas/recursos-imagen/probar.mjs capturas/prueba-recursos-imagen
```

Las entradas se generan en `entrada/` y los resultados en `salida/` (se regeneran en cada pasada; no van al repositorio).
Con la carpeta de capturas, copia allí las tres hojas (`hoja-piezas.png`, `hoja-iconos.png`, `hoja-mosaico.png`).

Qué comprueba:
- `coherencia`: señala la pieza iluminada desde el otro lado, la que toca el borde, la mucho más oscura y la que llega sin
  alfa; no señala las piezas buenas;
- `hoja`: la hoja de conjunto sale con las piezas sobre los tres fondos;
- `iconos`: corta la lámina en la rejilla pedida, iguala el tamaño visual, y avisa del icono de trazo más grueso, del
  dibujado a otro tamaño, y avisa si la rejilla pedida no corresponde a la lámina;
- `mosaico`: distingue una textura que casa de una con junta y de una con luz desigual; `--arreglar` e `--igualar` bajan
  las dos medidas.

Resultado (11-11-2026): 23/23.
