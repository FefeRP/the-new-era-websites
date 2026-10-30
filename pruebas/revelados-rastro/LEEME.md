# Prueba de revelados.js y rastro-cursor.js

Página sin build con los cuatro revelados (rejilla, líneas, zoom a un punto con relevo, cortina) y el rastro del cursor,
sobre activos generados por código (sin IA ni licencias).

```bash
# 1. activos (ffmpeg en FFMPEG o en el PATH)
cd pruebas/revelados-rastro && node hacer-activos.mjs activos
# 2. servir la raíz del repo (con Range)
node pruebas/servidor-estatico.mjs . 5193
# 3. prueba en Chrome (desde demos/reloj, donde está playwright-core)
cd demos/reloj && node ../../pruebas/revelados-rastro/probar.mjs http://127.0.0.1:5193/pruebas/revelados-rastro/ ../../capturas/prueba-revelados
```

Qué comprueba (por píxeles de la captura y por el DOM):
- rejilla: cubierta en 0, a medias en 0,5, la foto entera en 1;
- líneas: el titular se parte en varias líneas, ocultas al principio y en su sitio al final, con el texto completo para
  lectores de pantalla;
- zoom: la estantería entera en 0; en 1 la caja objetivo centrada (desvío ≤ 6 px) y llenando el alto; relevo a la
  imagen de detalle;
- cortina: entra, cubre del todo en 0,5 (cambio de escena) y sale;
- rastro: aparecen fotos al mover el ratón, el pool de `<img>` no crece y se apagan al parar;
- reduced-motion: rejilla y titular visibles, cortina sin panel, sin rastro; táctil: sin rastro; 0 errores de consola.

Resultado (30-10-2026): todo bien. Zoom en 1: desvío 1 px.
