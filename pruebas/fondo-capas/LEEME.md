# Prueba de fondo-capas.js

Página sin build con un fondo de tres capas (cielo, montañas, nubes en el suelo) y tres escenas (día, atardecer,
noche), más una capa fija por código (un canvas que hace de shader). Las capas son SVG generados por código.

```bash
# 1. capas (van en .gitignore)
node pruebas/fondo-capas/hacer-capas.mjs
# 2. servir la raíz del repo
node pruebas/servidor-estatico.mjs . 5193
# 3. prueba en Chrome (desde demos/reloj, donde está playwright-core)
cd demos/reloj && node ../../pruebas/fondo-capas/probar.mjs http://127.0.0.1:5193/pruebas/fondo-capas/ ../../capturas/prueba-fondo-capas
```

Qué comprueba (16 comprobaciones, por el DOM y las animaciones):
- al cargar, solo se ve la escena inicial;
- el relevo es escalonado: a los 260 ms el cielo ya entra y montañas y suelo aún no (se mide pausando las animaciones,
  porque el reloj de un Chrome sin GPU va a saltos);
- al acabar, todas las capas están en la escena nueva y no quedan animaciones acumuladas;
- la capa fija sigue en su sitio;
- dos cambios seguidos a medias acaban limpios en la última escena;
- con reduced-motion todas las capas cambian a la vez en ≤ 450 ms;
- con `?scroll`, los pasos con `data-paso-escena` llevan la escena al entrar en pantalla, también hacia atrás;
- sin errores de consola.

Capturas: `1-dia`, `2-relevo` (a mitad: cielo de noche, montañas y suelo aún de día), `3-noche`, `4-atardecer`.
