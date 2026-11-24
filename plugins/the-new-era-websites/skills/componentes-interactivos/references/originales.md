# Componentes «NEW ERA original»

Piezas propias, hechas desde cero con las guías de esta skill ([cristal-liquido.md](cristal-liquido.md),
[fisica-y-fluidez.md](fisica-y-fluidez.md)). La regla para que una pieza entre aquí: **no es una variación de algo que ya
existe en una librería** (otra barra con gota, otro dock, otro botón con brillo), resuelve un uso real y pasa la misma
prueba que los motores (teclado, lector de pantalla, táctil, reduced-motion, sin errores, capturas).

Cada una se firma en la cabecera del fichero con `· NEW ERA original` y aquí con su idea, sus valores y por qué
funcionan, para que se pueda rehacer o adaptar sin leer el código.

| Pieza | Motor | Qué es | Dónde se prueba |
|---|---|---|---|
| Nivel de burbuja | `scripts/nivel-burbuja.js` | Indicador de scroll con forma de nivel de albañil: tubo de cristal con líquido y una burbuja que marca dónde estás | `pruebas/componentes-propios/originales.html` |
| Marea | `scripts/marea.js` | Control segmentado o pestañas donde la opción elegida está llena de agua, y el agua viaja y chapotea al cambiar | La misma página |

---

## Nivel de burbuja

**Idea.** Las barras de progreso de lectura son una línea que crece. Un nivel de burbuja es un objeto que todo el mundo
sabe leer sin explicación (la burbuja está donde está) y tiene física propia: la burbuja tarda un poco en llegar, se
alarga cuando el tubo se mueve deprisa y se aplasta al chocar con el tapón. Con eso el scroll se siente con peso.

**Construcción.**
- Tubo: cristal sobre la página (`backdrop-filter: blur(6px) saturate(1.3)`), líquido como tinte (`--nivel-liquido`, por
  defecto verde de nivel al 55 %), luz en el lado iluminado y sombra interior en el contrario, dos marcas que abrazan la
  burbuja en el centro (como un nivel real).
- Burbuja: elipse de 1,5 × el grosor del tubo de largo y 0,62 × de ancho, con brillo radial desplazado al 35/30 % y
  canto blanco: se lee como aire, no como bola.
- Posición: muelle `k 170, c 17` (ζ ≈ 0,65). Un nivel real se pasa un poco y vuelve; con ζ 1 parecería una barra.
- Estiramiento: un segundo muelle (`k 260, c 12`) persigue `1 + min(0,55, |v| / (recorrido · 4))`; se pinta conservando
  volumen (`scale(1/√e, e)`), así que al alargarse adelgaza.
- Choque: si llega al tapón con más de 40 px/s, empuja el estiramiento hacia abajo (`-min(|v|, 900) · 0,004`): se
  aplasta y rebota una vez.
- Uso: arrastrar la burbuja o pulsar el tubo desplaza la página; `role="slider"` con `aria-valuenow` en %, flechas,
  Re Pág/Av Pág, Inicio y Fin.
- Reduced-motion: la burbuja va al sitio sin muelle ni estiramiento. Transparencia reducida o contraste alto: tubo
  sólido con borde.

**Adaptar.** El color del líquido es la marca (turquesa, ámbar…). En horizontal (`orientacion: 'horizontal'`) va bien
bajo una cabecera de artículo. No poner más de uno por página.

## Marea

**Idea.** Los selectores segmentados mueven una píldora o una gota. Aquí la opción elegida es un vaso con agua: al
cambiar, el agua pasa de un vaso a otro como en un canal (el borde delantero tira y el trasero se vacía tarde), la
superficie se inclina con la aceleración y al llegar chapotea hasta quedarse plana. Se entiende como «llenar» la opción.

**Construcción.**
- Un `svg` detrás de las opciones con dos `path`: cuerpo del agua y espuma (la línea de la superficie, blanca al 70 %).
  Se recalcula solo mientras algo se mueve; en reposo no hay bucle.
- Bordes: dos muelles; el que va hacia el destino `k 230, c 24`, el de atrás arranca con el 10 % de fuerza durante 80 ms y
  luego `k 70, c 12`. La diferencia de rigidez hace que el agua se estire en saltos largos y casi nada en contiguos.
- Inclinación: muelle `k 120, c 7` (muy poco amortiguado, como el agua) que persigue `-aceleración · 0,00011`, con tope
  ±0,35. La superficie es `nivel + inclinación · (u - 0,5) · ancho`.
- Chapoteo: a los 260 ms del cambio nace una ola estacionaria `ola · sin(2πu + fase) · sin(πu)` (cero en las paredes),
  amplitud `min(7, 2 + distancia/40)` px, fase a 9 rad/s y caída `exp(-2,6 t)`: se apaga en ~1 s.
- Nivel del agua: `--marea-nivel` (0,86 por defecto: deja ver la superficie). El texto de la opción activa cambia a
  `--marea-texto-activo` para que el contraste sea contra el agua.
- Teclado de `tablist`: flechas (dan la vuelta), Inicio y Fin; solo la opción activa entra en el Tab.
- Reduced-motion: el agua aparece en la opción nueva sin viaje ni oleaje.

**Adaptar.** Brutalismo suave: radios de 13-18 px, sombra dura desplazada en el contenedor. Cada grupo puede llevar un
color de marca distinto (`--marea-liquido`). No usarlo en navegación principal que se pulsa constantemente: ahí el
cambio debe ser instantáneo (regla de `animate`).

---

## Cómo se añade una original
1. Que pase la prueba del genérico: ¿existe ya en Magic UI, Aceternity, React Bits, 21st…? Si sí, no es original.
2. Escribir el motor en `scripts/` con la cabecera `· NEW ERA original`, sin dependencias salvo `muelle.js`, con
   `destruir()`, reduced-motion, teclado y respaldo de transparencia.
3. Página de prueba y comprobaciones en `pruebas/componentes-propios/` (estados intermedios medidos, no solo capturas).
4. Ficha aquí (idea, construcción con valores, adaptar) y fila en la tabla de motores del `SKILL.md`.
