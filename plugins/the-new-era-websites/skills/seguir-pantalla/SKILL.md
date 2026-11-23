---
name: seguir-pantalla
description: Poner contenido REAL (la web del cliente, un logo, un texto, un vídeo, cifras) encima de una pantalla, cartel, etiqueta o cualquier superficie plana de un vídeo generado con IA o grabado, siguiéndola fotograma a fotograma con su perspectiva y SIN estirarla, para que la IA haga la escena y el código ponga lo que se tiene que leer. Incluye el seguimiento de las 4 esquinas (Node + ffmpeg, gratis, con fotogramas clave de ida y vuelta) y la capa que lo pinta sincronizada con frame-scrubber. Úsala cuando pidan "zoom a la pantalla del portátil con nuestra web", "poner el logo en el cartel del vídeo", "que se lea la pantalla", "el logo sale deformado/aplastado", "mockup de pantalla en vídeo", "screen replacement", "screen tracking", "corner pin", "planar tracking", "replace screen content in video", "logo on sign in AI video".
license: MIT
version: 1.0.1
---

# Seguir una pantalla (o un cartel) y poner encima lo real

> **En NEW ERA:** módulo **Vídeo con IA** (`new-era/references/modulos/video-ia.md`): la maestra la carga cuando ese módulo está activo en el brief. Usada sola, funciona igual.

La IA de vídeo inventa letras, aplasta logos y no sabe cómo es la web del cliente. Así que **no se le pide**: la escena se
genera con la pantalla en blanco (o con la superficie lisa) y el código pone encima la captura real, el logo o el texto,
siguiendo las 4 esquinas en cada fotograma. Resultado: escena de IA realista y todo lo de marca nítido y exacto.

## Cuándo sí y cuándo no
- **Sí:** zoom a un portátil o móvil con la web del cliente, cartel o placa con el logo, etiqueta de un envase que no gira,
  pantalla de una tienda, valla en un aéreo. Vale para vídeos de IA, grabados o renders.
- **No:** superficies que **giran más de ~60°** o se doblan (lata que gira → `envase-giratorio`; producto 3D → `escena-3d-gltf`).
  Si la superficie se tapa mucho rato (una mano delante), corta el tramo o pon una clave antes y otra después.
- **Entrar en la pantalla** (la web llena el encuadre al final): sigue la pantalla mientras se ven sus 4 esquinas y, cuando se
  salgan, termina con la captura a pantalla completa (fundido corto, ≤ 1 s). Ver
  [references/integrar-pantallas-y-logos.md](references/integrar-pantallas-y-logos.md).

## Antes de programar (obligatorio)
El código de esta skill se monta dentro de un proyecto: no se escribe de memoria (regla 6 de `new-era`; protocolo en
`new-era/references/codigo-y-plataforma.md`).
- **`find-docs`** (cárgala con `Skill`): lee la versión en el `package.json` y consulta en esa versión GSAP y el framework del proyecto antes de
  usar o cambiar su API. En Next.js, además, cómo se monta en un componente de cliente y se desmonta con `destruir()`.
- **`modern-web-guidance:modern-web-guidance`** (con `Skill`): busca y aplica las guías de transformaciones 3D en CSS, vídeo e imagen diferidos, reduced-motion.
- Apunta cada consulta en `BRIEF.md` («Documentación consultada»).

## Pasos
1. **Pídelo bien al generar** (skill `pedir-assets-ia`): pantalla "flat evenly lit plain white, empty" (o el color de fondo de la
   web), superficie del logo lisa y **con la proporción del logo**, las 4 esquinas dentro del cuadro todo el clip, en ligero
   escorzo y sin reflejos fuertes que tapen. Nada de texto ni logos generados.
2. **Mide las esquinas** en el primer fotograma (y en el último, que da mucha más precisión):
   ```
   node scripts/seguir-pantalla.mjs video.mp4 --rejilla 0 --revision rev            # fotograma con rejilla cada 50 px
   node scripts/seguir-pantalla.mjs video.mp4 --rejilla 0 --zona 1300,430,260,140 --revision rev   # zona ampliada, rejilla cada 10 px
   ```
   Orden: arriba-izquierda, arriba-derecha, abajo-derecha, abajo-izquierda; el borde de la zona **visible** (sin el marco), en
   píxeles del vídeo. Si generaste con imagen de inicio/fin, puedes medir en esas imágenes y escalar (×1920/ancho de la imagen),
   pero la IA no las clava al píxel (±4-6 px): mejor en fotogramas del propio vídeo.
3. **Sigue:**
   ```
   node scripts/seguir-pantalla.mjs video.mp4 --esquinas "x,y x,y x,y x,y" --clave "6.0=x,y x,y x,y x,y" --salida pista.json --revision rev
   ```
   Abre `rev/revision-pista-hoja.png` (y el vídeo): el cuadro verde debe ir pegado a la pantalla todo el clip; naranja = tramo
   dudoso rellenado (añade una `--clave` en medio). Tarda segundos.
4. **Extrae los frames** con `scroll-frames` (`extraer-frames.mjs` guarda en el manifest `inicio`, `fps`, `original` y el recorte
   móvil: la capa lo necesita para casar coordenadas). Copia `pista.json` junto a `manifest.json`.
   - En móvil el recorte 9:16 sale del centro: si la pantalla está a un lado, usa `--recorte-movil x=0.7` o genera la toma vertical.
5. **Monta la capa** ([references/integrar-pantallas-y-logos.md](references/integrar-pantallas-y-logos.md)):
   ```js
   import { crearCapaPantalla } from './capa-pantalla.js';
   const pista = await (await fetch('/frames/intro/pista.json')).json();
   const capa = crearCapaPantalla({ contenedor, pista, contenido: '/img/web-cliente-1600x1000.webp', aspecto: 16 / 10,
     expandir: 2, radio: 6, filtro: 'blur(0.35px) contrast(0.96)', brillo: 'linear-gradient(115deg,#ffffff18,#fff0 45%)' });
   const seq = await crearFrameScrubber({ canvas, base: '/frames/intro/', alDibujar: capa.actualizar });
   ```
6. **Integra a ojo** (lo que separa "pegado" de "real"): mismo desenfoque y grano que la escena, negros un poco levantados, un
   reflejo suave, color corregido a la luz de la escena. Compara con `../new-era/scripts/verificar-scroll.mjs` en 3-5 puntos del tramo.

## Reglas
- **Nunca estirar.** `aspecto` = proporción REAL de la superficie (MacBook 16:10, monitor 16:9, móvil ~9:19,5, la placa medida).
  La perspectiva la pone la homografía; el contenido entra con `contain` (cabe entero) o `cover` (recorta). Una captura de otra
  proporción se recorta o se rellena, no se deforma. Un logo de 2:1 en una placa de 0,9:1 se queda pequeño y centrado.
- **Captura a la resolución que se verá:** si al final la pantalla mide 1100 px de ancho, la captura de al menos 1600 px y
  `resolucion` de la capa ≥ ese ancho en CSS.
- **Nada de texto de IA debajo:** si la pantalla generada trae letras, tápalas entera con la capa (`expandir` 2-4 px) o genera
  de nuevo con la pantalla en blanco.
- **Varias superficies** (pantalla + cartel): una pista y una capa por superficie, y en `alDibujar` actualiza las dos.
- **Menos movimiento:** la capa sigue al frame que se vea; no añade movimiento propio.

## Checklist
- [ ] Hoja de revisión: el cuadro pegado a la pantalla en todo el clip, sin tramos naranjas sin revisar.
- [ ] Prueba en escritorio y en móvil (variante recortada): la capa coincide y no se ve el borde de la pantalla original.
- [ ] El círculo de una carta de ajuste sale redondo (o el logo con su proporción): no hay estiramiento.
- [ ] La capa solo cambia `transform` (matrix3d) por frame: sin layout. Imagen de la captura en WebP/AVIF.

## Referencias
- [references/integrar-pantallas-y-logos.md](references/integrar-pantallas-y-logos.md): cómo funciona, opciones de la capa,
  entrar en la pantalla, logos en carteles, que no parezca pegado y fallos típicos.
- Prueba con verdad conocida: `pruebas/seguir-pantalla/` del repositorio (vídeo sintético con perspectiva y esquinas exactas;
  error medido ≤ 3 px con dos claves).
