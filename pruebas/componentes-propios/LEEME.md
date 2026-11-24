# Prueba: piezas de interfaz escritas desde cero

Comprueba que las guías `cristal-liquido.md` y `fisica-y-fluidez.md` y los motores de `componentes-interactivos`
(`muelle.js`, `cristal-lente.js`, `nivel-burbuja.js`, `marea.js`) bastan para hacer piezas de primer nivel sin copiar
ningún componente de terceros.

- `index.html`: «Salinas de Arés», una marca inventada. Lleva un fondo por capas generado por código (motor de
  `parallax-capas`), una barra de navegación de cristal con refracción real y una gota de dos cuerpos que se estira, y un
  desplegable con rebote: popover con `commandfor`, `@starting-style` y un muelle convertido a `linear()`.
- `originales.html`: los dos componentes «NEW ERA original». El nivel de burbuja hace de indicador de scroll y la marea
  es un control segmentado líquido.
- `probar.mjs`: comprueba lente, estiramiento, posado, accesibilidad (aria, foco, flechas, Esc), reduced-motion, móvil y
  que no haya errores, y guarda las capturas 01-14.

## Cómo se lanza

```
node pruebas/servidor-estatico.mjs . 5193            # desde la raíz del repo
cd demos/reloj
node ../../pruebas/componentes-propios/probar.mjs http://127.0.0.1:5193/pruebas/componentes-propios/ ../../capturas/componentes-propios
```

Necesita Chrome del sistema (playwright-core de `demos/reloj`). La refracción solo se ve en Chromium; en otros
navegadores queda el cristal esmerilado de respaldo.
