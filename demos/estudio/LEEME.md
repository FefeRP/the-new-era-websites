# Demo «Taller Arce»: una web de servicio sin momento estrella

Ejemplo de extremo a extremo hecho con la skill maestra `new-era` para el caso contrario al de `demos/reloj`: una web
sobria de servicio (un taller de reformas inventado) donde el scroll no cuenta nada y, por tanto, **no hay secciones
fijadas, ni vídeo, ni 3D**. Se resuelve con contenido real en HTML, un acento, componentes y entradas discretas.

Qué usa del marketplace:
- **Plantilla** de la maestra: `nueva-web.mjs demos/estudio --con componentes,revelados` (Vite + GSAP + Lenis).
- **`recursos-imagen-ia`**: los seis iconos de marca salen de **una sola lámina** cortada y medida con
  `lote-imagenes.mjs iconos` (mismo tamaño visual, mismo grosor de trazo, 0 avisos); las cuatro texturas pasan por
  `lote-imagenes.mjs mosaico --arreglar --igualar` y casan al repetirse.
- **`componentes-interactivos`**: fichas de proyecto con volteo y capas (`tarjeta-volteo.js`), materiales en órbita
  (`carrusel-orbital.js`) y muro de opiniones en columnas (`resenas-3d.js`).
- **`revelados-y-transiciones`**: el titular sube por líneas (`crearLineas`).
- **Reglas de webs reales**: contenedor ancho (95 % con tope), un radio único de 6 px, una pieza hecha por código en el
  hero (el calendario de la obra) en vez de una foto de banco, entradas al hacer scroll sin esconder el HTML, lista real
  de opiniones para lectores y para movimiento reducido.

No hay generación de pago: la lámina de iconos y las texturas en bruto las dibuja `herramientas/hacer-activos.mjs`, con
los defectos que suele traer un modelo de imagen (luz desigual, bordes que no casan), para que el control tenga algo que
medir. En una web real, ese paso es el lote generado con IA; el control es el mismo.

La marca, los proyectos y las opiniones son inventados (lo dice el pie de la página). En una web real, las opiniones
solo pueden ser reseñas reales.

```bash
# activos (desde demos/reloj, donde está playwright-core; ffmpeg en FFMPEG o en el PATH)
cd demos/reloj && node ../estudio/herramientas/hacer-activos.mjs
# la web
cd demos/estudio && npm install && npm run dev        # http://127.0.0.1:5192
# verificación (desde demos/reloj)
cd demos/reloj && node ../../plugins/the-new-era-websites/skills/new-era/scripts/verificar-scroll.mjs http://127.0.0.1:5192 ../../capturas/demo-estudio
```

Resultado (11-11-2026): activos sin avisos (juntas de las texturas de 4,9-15,4× a 0,9-1,1×; desigualdad de luz del 10 %
al 0,1-0,4 %), `npm run build` sin errores y `verificar-scroll` con 0 errores en escritorio, móvil y movimiento reducido.

`src/lib/` son **copias** de los motores del plugin: si cambia un motor, se copia aquí y se vuelve a verificar.
