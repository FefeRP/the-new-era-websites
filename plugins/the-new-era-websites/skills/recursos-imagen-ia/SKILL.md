---
name: recursos-imagen-ia
description: Generar con IA los recursos de imagen de una web como lotes coherentes y listos para usar - objetos sueltos con fondo transparente (frutas, hielo, hojas, piezas que flotan o caen), juegos de iconos únicos de marca, texturas que se repiten sin junta, fondos de sección con sitio para el texto (y su pareja día/noche), el mismo objeto en varios ángulos o materiales. Prompts por tipo de recurso, cómo mantener la misma luz y el mismo estilo en todo el lote, y lote-imagenes.mjs para revisarlo sin Python - hoja de conjunto sobre varios fondos, coherencia de luz y claridad entre piezas, corte de una lámina de iconos con medida del grosor del trazo, y texturas medidas y arregladas para mosaico. Úsala cuando pidan "frutas sueltas con transparencia", "elementos flotando", "objetos con alfa", "iconos de marca", "set de iconos coherente", "iconos únicos", "textura repetible", "textura seamless", "fondo para la sección", "fondo con espacio para el titular", "mismo producto en varios ángulos", "cambiar el material", "assets de imagen para la web", "isolated objects with alpha", "floating ingredients", "brand icon set", "consistent icon set", "seamless texture", "tileable texture", "section background image", "AI image assets for a website".
license: MIT
version: 1.0.0-beta.12
---

# Recursos de imagen con IA

Casi todo lo que hace rica una web no es vídeo: son **imágenes sueltas bien pedidas** que el código coloca y mueve. Esta
skill cubre los lotes: piezas con alfa, iconos, texturas, fondos y variantes de un objeto. El fallo típico no es una imagen
mala, es un **lote que no casa**: cada pieza con su luz, cada icono con su trazo, una textura con raya.

Reparto con las skills vecinas:
- `pedir-assets-ia` decide **qué medio** lleva cada elemento y el **presupuesto**. Empieza por ahí.
- `fotos-producto-ia`: el producto real del cliente en otra escena (edición por referencia y revisión contra el original).
- `capas-alfa`: sacar el alfa (`alfa.mjs`) y componer capas con el texto en medio.
- `parallax-capas`: mover las piezas en profundidad. `envase-giratorio`: la lata con sus frutas.
- Esta: pedir y **revisar el lote** antes de montarlo.

**Antes de generar nada de pago:** precio estimado con `presupuesto.mjs` de `pedir-assets-ia` y el sí de quien paga. La
primera imagen de cada lote se aprueba sola; el resto se genera después, con ella como referencia.

## Pasos
1. **Lista el lote**: qué piezas, a qué tamaño se verán, sobre qué fondos. Una pieza que se verá a 120 px no necesita 2K.
2. **Fija el estilo en una frase** que se repite idéntica en todos los prompts (luz, ángulo, acabado, fondo de recorte).
3. **Genera la primera y apruébala.** Las siguientes llevan la primera como imagen de referencia de luz y estilo.
4. **Saca el alfa** con `alfa.mjs` (`capas-alfa`) y recorta.
5. **Revisa el lote junto** con `lote-imagenes.mjs`: hoja de conjunto y medidas. Lo que no casa se repite, no se arregla
   a mano pieza a pieza.
6. **Exporta** a WebP (con alfa donde toque) al tamaño de uso ×2 y móntalo.

Los prompts completos, por tipo, están en [references/recetas-de-imagen.md](references/recetas-de-imagen.md).

## 1. Objetos sueltos con alfa (lo que flota, cae o rodea al producto)
- **Una pieza por imagen**, entera dentro del encuadre y con margen ancho. Las composiciones de varias piezas no se pueden
  separar ni mover después.
- **Fondo de recorte liso**: verde puro por defecto; **magenta** si la pieza tiene verde (hojas, lima); **blanco** para
  piezas oscuras y mates; **pareja negro y blanco** de la misma imagen para cristal, hielo y líquidos (alfa exacto con
  `alfa.mjs --modo diferencia`). El transparente nativo de algunos modelos se comprueba siempre sobre fondo oscuro.
- **La misma luz en todas**: dirección, dureza y temperatura escritas igual («hard key light from the upper left with a soft
  fill»), y la misma que la del producto al que acompañan.
- **Sin sombra en el fondo**: la sombra se pone por código o como capa propia (`parallax-capas`).
- Pide **variedad dentro de la coherencia**: de cada ingrediente, 2-3 tamaños o ángulos. Un reparto creíble necesita
  piezas delante y detrás del producto, y un par grandes desenfocadas en primer plano (el desenfoque se da por código o
  con copias ya desenfocadas, no se pide a la IA).
```bash
node scripts/lote-imagenes.mjs coherencia piezas/            # luz, claridad, saturación, margen
node scripts/lote-imagenes.mjs hoja piezas/ --salida hoja-piezas.png --fondo todos
```
`coherencia` señala la pieza iluminada desde el otro lado, la que es mucho más clara u oscura que el resto, la que toca el
borde (se cortará al girarla) y la que llegó sin recortar.

## 2. Iconos únicos de marca
- **Una sola lámina** con todos los iconos (rejilla de 3×2 o 4×2, separación ancha, fondo blanco) da mucha más coherencia
  que pedirlos uno a uno. Si hacen falta más, la primera lámina va como referencia de la segunda.
- El estilo, en una frase cerrada: tipo de trazo, **un único grosor**, relleno sí o no, esquinas, nivel de detalle. Y la
  lista de iconos en orden.
- Nada de texto ni números dentro de los iconos.
- La lámina se corta y se mide:
```bash
node scripts/lote-imagenes.mjs iconos lamina.png --columnas 3 --filas 2 --salida iconos/ --color "#111111"
```
  Deja un PNG con alfa por icono, todos al mismo tamaño visual, y avisa del que tiene el trazo más grueso o más fino, del
  que se dibujó a otro tamaño y del que se sale de su celda.
- **Prueba a 24, 48 y 96 px.** Un trazo fino que se pierde a 24 px no sirve para la interfaz.
- Los iconos **de interfaz** (menú, cerrar, flechas) no se generan: salen de una librería o se dibujan en SVG. La IA es para
  los iconos ilustrativos de la marca (servicios, ventajas, pasos). Si tienen que ser vectoriales, se vectorizan o se
  redibujan en SVG a partir del PNG; eso no lo hace este script.

## 3. Texturas que se repiten
- Pide «seamless tileable texture», vista cenital, **luz plana y sin sombras**, densidad uniforme, sin viñeta ni rasgos
  reconocibles (una mancha o una veta marcada delata la repetición).
- **Nunca te fíes de que casa**: mídela y, si hace falta, arréglala.
```bash
node scripts/lote-imagenes.mjs mosaico papel.png
node scripts/lote-imagenes.mjs mosaico papel.png --arreglar papel-mosaico.png --igualar
```
  Mide la junta (cuánto cambia la imagen al cruzar el borde frente a lo que cambia por dentro) y la desigualdad de luz
  entre zonas. `--arreglar` cruza los bordes con la misma imagen desplazada media anchura; `--igualar` aplana la luz.
- Sirve para grano fino (papel, tela, metal cepillado, piedra). Para patrones con dibujo grande (baldosas, ladrillo) el
  cruce deja fantasmas: pide el patrón ya repetible o dibújalo por código.
- Peso: una textura de 512 px en WebP suele bastar. El **grano** va mejor como WebP con alfa encima que como filtro SVG.

## 4. Fondos de sección
- Se pide **con el hueco del texto**: «the whole left half of the frame is calm, plain and out of focus, leaving clean
  space for a headline». Un fondo precioso sin sitio para el titular no sirve.
- Contraste bajo y paleta apagada, del color de la sección. El contraste AA del texto se comprueba sobre la imagen real.
- **Pareja día/noche** (o antes/después): la segunda se saca **por edición** de la primera («keep everything unchanged,
  change only…»), nunca generando de nuevo, para que coincidan al píxel y se puedan fundir con el scroll.
- Sin personas, sin texto, sin rótulos ni logos. Peso objetivo: menos de 400 KB en WebP o AVIF a 1920 px.
- Si solo hay **una foto**, no hay paralaje posible sin un fondo limpio detrás del sujeto: se resuelve con juego de foco
  (copias ya desenfocadas que se cruzan por opacidad) o pidiendo el fondo vacío aparte.

## 5. El mismo objeto en varios ángulos o materiales
- **Ángulos**: siempre por edición con la imagen del objeto como referencia («the exact product from image one, unchanged
  in every detail… photographed from a new angle»). Se compara cada resultado con la referencia: logotipo, proporciones,
  número de botones o de piezas.
- **Materiales**: «keep the camera, the framing, the object's exact shape and position… change only the material». Se
  superpone con la base al 50 %: si el contorno se mueve, la cortina o el fundido entre acabados saltará.
- Lo que no admite invención (texto del envase, esfera de un reloj, interfaz) se compone encima por código.

## Lo que no se pide a la IA
Logos, textos legibles, interfaces y pantallas, iconos de interfaz, manos sujetando el producto en primer plano (es donde
más se nota) y personas reales. Reseñas, cifras y nombres de negocio tampoco se inventan.

## Estado de las recetas
`lote-imagenes.mjs` está probado contra entradas de verdad conocida (`pruebas/recursos-imagen` del repositorio, 22
comprobaciones). Los prompts siguen las reglas comprobadas en las demás skills, pero **todavía no se han validado con una
tanda de generación de pago** modelo a modelo: trata la primera imagen de cada lote como la prueba.
