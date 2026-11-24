# Cristal líquido y glassmorphism: guía técnica

Destilado del estudio de unos veinte componentes de cristal (navegación, botones, interruptores, acordeones, paneles,
docks, formularios, revelados de logo). No hay código copiado. Los valores son los que se repiten en los buenos y,
cuando hace falta, se dice de cuál de las tres familias viene cada uno:

- **Familia A, agua en WebGL:** una píldora con un shader que dibuja el agua (SDF + física propia) encima de un cristal CSS.
- **Familia B, lente por mapa:** se genera por canvas un mapa de desplazamiento con la forma exacta del elemento y se
  usa en un filtro SVG dentro de `backdrop-filter: url(#id)`.
- **Familia C, cristal CSS:** solo `backdrop-filter` + tintes + `box-shadow` interiores. Es el respaldo de las otras dos y,
  bien hecho, basta para paneles grandes.

---

## 1. Anatomía de la capa de cristal

Orden de abajo arriba. Cada capa es un `span` absoluto con `inset:0`, `border-radius:inherit` y `pointer-events:none`
detrás del contenido (`z-index:-1` dentro de un padre con `isolation:isolate`), o un pseudo-elemento.

| # | Capa | Qué hace | Valores que se repiten |
|---|------|----------|------------------------|
| 1 | Fondo refractado (lente) | `backdrop-filter` sobre lo que hay detrás | Sin refracción: `blur(10-15px) saturate(1.2-1.35) brightness(1.04-1.08)`. Con refracción: `url(#f) blur(0.5-2px) saturate(1.2-1.85) brightness(1.02-1.05)` |
| 2 | Tinte (cuerpo) | Color propio del vidrio | Blanco 0.08-0.14 sobre fondos claros; oscuro `rgba(10,18,40,.26)` en tema oscuro; paneles de texto 0.23-0.48 |
| 3 | Luz de cara | Degradado diagonal que simula el cielo reflejado | `linear-gradient(150deg, blanco 7-35%, transparent 38-44%)` |
| 4 | Borde de luz (rim) | Grosor del canto | Anillo `inset 0 0 0 .75-1px` blanco 20-48 %; filo superior `inset 0 1px 1px` blanco 70-95 %; filo inferior `inset 0 -1px 1px` blanco 60 % o sombra 19 % |
| 5 | Brillo especular | Reflejo duro de una luz concreta | Banda de ~1 px solo donde la normal mira arriba/abajo; o radial que sigue al puntero (hover 0.35, pulsado 1) |
| 6 | Bisel interior | Volumen del canto | `inset 0 7px 10px -7px` claro arriba y `inset 0 -7px 10px -7px` oscuro (texto 24 %) abajo |
| 7 | Grano (opcional) | Romper la banda de degradado | `feTurbulence` en data-URL, opacidad 0.03-0.06, `mix-blend-mode: overlay`. Los mejores casi no lo usan |
| 8 | Sombra de contacto | Pegar el objeto al fondo | `0 2px 6px` al 10 % |
| 9 | Sombra exterior | Altura | `0 12px 32px -14px` al 45-50 % del color del fondo, no negro |

Por qué funcionan:

- **Blur bajo con refracción, blur alto sin ella.** La refracción ya rompe la lectura del fondo; si además se
  desenfoca 10 px, el efecto lente desaparece. Los buenos bajan a 0.5-2 px cuando el filtro SVG está activo y suben a
  10-20 px solo en el respaldo.
- **`saturate` > 1 siempre.** El desenfoque apaga los colores; sin saturación extra el vidrio queda sucio y gris.
  `brightness` 1.02-1.08 da la sensación de que el vidrio "recoge" luz.
- **El rim es asimétrico.** Arriba más luz que abajo (luz cenital). Un anillo uniforme lee como borde de CSS, no como canto.
- **Sombras de dos capas y con spread negativo.** `-14px` de spread hace que la sombra nazca bajo el objeto y no como
  halo; la segunda, corta, es el contacto.
- **El color de la sombra y del tinte sale del fondo.** El panel cálido usa sombras `rgb(35 21 14 / x)` sobre una foto
  de tonos tierra; el de navegación usa `rgba(0,40,90,…)` sobre cielo. El negro puro delata la plantilla.
- **Radios:** píldora (`999px`) en controles; 20-34 px en paneles (34 el marco, 20 las tarjetas dentro, 15 las
  subtarjetas: el radio interior = exterior - relleno). Los mejores usan squircle (superelipse, exponente ~4.8 o
  suavizado 0.8) en vez de círculo en las esquinas.

Material como variables (la forma más limpia que se ha visto): `--blur`, `--opacity`, `--saturation`, `--edge` (0-1,
multiplica la alfa del rim), `--bend` (0-1, multiplica el bisel) y `--tint`, combinados con `color-mix(in srgb, …
calc(var(--edge) * 92%), transparent)`. Tres preajustes que funcionan:

| Preajuste | blur | opacidad tinte | saturate | edge |
|-----------|------|----------------|----------|------|
| Claro (sobre foto, controles) | 8 px | 0.12 | 1.1 | 0.8 |
| Normal (paneles) | 22 px | 0.30 | 1.2 | 0.6 |
| Escarchado (mucho texto) | 32 px | 0.86 | 1.0 | 0.35 |

**Anidados:** solo la capa exterior lleva `backdrop-filter`. Las tarjetas de dentro son tinte + rim + sombra corta
(`0 6px 18px` al 9 %). Un vidrio dentro de otro que también desenfoca cuesta el doble y además se lee peor. Si se
anida cristal con refracción, bajar la fuerza (18 → 8 px).

**Prepara el fondo.** El panel mejor resuelto filtra la foto de fondo (`sepia(.22) saturate(.78) brightness(.86)`) y le
pone encima dos degradados suaves. El vidrio luce cuando detrás hay contraste medio y color. Sobre un fondo plano
no hay nada que refractar.

---

## 2. Refracción

### 2.1 Vía SVG: `backdrop-filter: url(#id)`

**Soporte:** solo Chromium (Chrome, Edge, Opera, Samsung, Brave…) aplica filtros SVG dentro de `backdrop-filter`.
Safari y Firefox tienen `backdrop-filter` normal pero no la refracción. Chrome en iOS es WebKit.

**Detección correcta (la de los buenos):**

1. `navigator.userAgentData?.brands` con `/Chromium|Google Chrome|Microsoft Edge/`. Si no existe (orígenes no seguros),
   UA con `/(Chrome|Chromium|Edg|SamsungBrowser)\/\d+/` y sin `Firefox/` ni `CriOS`. Safari se detecta por la ausencia de
   tokens de Chromium, nunca por la presencia de "Safari", porque Chrome también lo lleva.
2. Y además `CSS.supports("backdrop-filter", "url(#x)")`. Solo esto no basta: otros motores lo aceptan al parsear.
3. Y que no case `(prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)`.

**Dos maneras de hacer el mapa:**

a) **Ruido (`feTurbulence` → `feGaussianBlur` → `feDisplacementMap`).** Barato y sin JS, pero da "vidrio de baño"
ondulado, no una lente. Solo vale como agua o vidrio deformado. Valores vistos: anisótropo `baseFrequency="0.006 0.02"`,
`numOctaves="2"`, desenfoque 2 y `scale="60"` (ondas alargadas en horizontal, lo mejor de esta vía); isótropo
`0.008`, 2 octavas y `scale="80"`; `0.05` y `scale="70"` (demasiado fino: parece roto). Más octavas = más detalle y más
coste; con 1-2 basta.

b) **Mapa con la forma (el bueno).** Se pinta en un canvas un mapa del tamaño exacto del elemento:
R = desplazamiento en x, G = en y, 128 = neutro, alfa = máscara de la forma. Se pasa a `feImage` y a
`feDisplacementMap`. El desplazamiento solo vive en una banda de bisel junto al borde: el centro queda nítido y el canto
dobla la luz, que es lo que hace leer "lente".

```
para cada píxel (x,y), centrado:
  d  = sdCajaRedondeada(x, y, w/2, h/2, r)      // < 0 dentro
  si d >= 0: R=G=128, A=0
  t  = clamp(-d / bisel, 0, 1)                    // 0 en el canto, 1 hacia dentro
  f  = 1 - sqrt((2 - t) * t)                      // perfil de cuarto de círculo: 1 en el canto, 0 dentro
  n  = normalize(d(x+1)-d(x-1), d(y+1)-d(y-1))    // normal hacia fuera por diferencias
  R  = 128 - n.x * f * 127 ;  G = 128 - n.y * f * 127   // signo -: toma muestras de dentro (amplía el canto)
```

Perfiles de bisel vistos: cuarto de círculo (arriba, el más natural); `sin(t·π)` (máximo a mitad del bisel: un canto
en "cordón"); y el más físico, por Snell: pendiente de una cúpula squircle `u³ / (1-u⁴)^0.75`, ángulo de incidencia
`θi = atan(pendiente)`, refracción con n = 1.5, `curva = sin(θi - asin(sin θi / 1.5))`, integrada a lo largo del bisel
para tener una altura φ y desplazando según su gradiente (ganancia 1.35, recortado a ±1 para que el canto se comprima sin
plegarse).

Valores del filtro: bisel 14-20 px o `min(32, lado_corto/2)`; `scale` 28-60 (18·2 en botones, 48 en píldoras, -56 en
un formulario: el signo invierte la lente); blur posterior 0.4-2 px.

**Detalles que separan lo que funciona de lo que no:**

- `feImage` con `width`/`height` **en píxeles** y `preserveAspectRatio="none"`. Con porcentajes el bisel se emborrona.
- La región del filtro: `x="0" y="0" width="100%" height="100%"` o en `userSpaceOnUse` con el tamaño en px. Si se usa
  dispersión, ampliar la región `scale + aberración + 4` px por lado.
- Regenerar el mapa solo con `ResizeObserver` (programado en un `requestAnimationFrame`) y con una firma
  (`ancho:alto:radio`) para no repetir. `offsetWidth` ignora transformaciones: un `scale` al pulsar no regenera nada.
- Un `id` nuevo en cada reconstrucción: el navegador cachea la salida del filtro por id.
- Mejor `URL.createObjectURL(blob)` que `toDataURL()`: WebKit rechaza `data:` dentro de `feImage`. Revocar la anterior.
- Mapa a media resolución (tope ~224×256 o la mitad del tamaño si pasa de 250 000 px²): el desplazamiento es suave y se
  estira bien.
- Píldoras: el mapa de una cápsula no depende del ancho. Se hornea una vez a 3×alto y se corta en tres (dos tapas sin
  estirar + centro estirado). Cachear por tamaño (tope ~64 entradas) y compartir un único `<filter>` entre elementos
  iguales con un contador de referencias.
- Recortar el resultado con `mask`/`clip-path` de la misma forma: los píxeles desplazados se salen por las esquinas.
- Leer el radio real con `getComputedStyle(el).borderTopLeftRadius` para que el mapa y el recorte coincidan.

**Aberración cromática:** tres `feDisplacementMap` con `scale` `s·(1+k)`, `s` y `s·(1-k)` (o `s±4px`), cada uno aislado en
un canal con `feColorMatrix` y recompuestos con `feBlend mode="screen"`. k ≈ 0.05-0.1. Sin aberración, una sola pasada
(si no, quedan costuras). Ojo: si se hacen las tres pasadas, no desplazar otra vez el resultado (dobla la refracción).

**Tono dentro del filtro:** `feComponentTransfer` con una tabla de 33 valores que levanta sombras
`v + 0.18·(1-v)³` (claro) y recorta altas `- 0.2·v³` (oscuro). Es lo que hace que el vidrio no "ensucie" las zonas
oscuras del fondo. Para un tinte de color: desaturar a luminancia y mapear linealmente con pendiente `tinte·0.32` y
ordenada `tinte·0.68`.

**Truco sin filtro (todos los navegadores):** si el fondo es tuyo (degradado, rejilla), cada superficie "transparente"
puede pintar ese mismo fondo desplazado por su propia posición (`background-position: calc(Xfondo - var(--x))`) y
deformarlo en las bandas del canto. Es refracción falsa pero exacta y funciona en Safari. Solo vale si el fondo no es
contenido arbitrario.

### 2.2 Vía WebGL: agua y lentes vivas

Se dibuja un canvas solo del tamaño del componente más un margen (14 px) para sombras y ondas, con
`premultipliedAlpha:true`, `antialias:false`, DPR tope 2, un triángulo que cubre la pantalla y todo en el fragment shader.
El cristal CSS sigue debajo: el shader solo añade el agua (gotas, brillo, cáusticas), no vuelve a muestrear el fondo.

Piezas (GLSL corto, propio):

```glsl
// Distancias
float sdCajaR(vec2 p, vec2 b, float r){ vec2 q=abs(p)-b+r; return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }
float sdCapsula(vec2 p, vec2 c, float medioLargo, float radio, float sy){
  p-=c; p.y/=sy; p.x=max(abs(p.x)-medioLargo,0.); return (length(p)-radio)*min(1.,sy); }   // sy = aplastado
float smin(float a,float b,float k){ float h=clamp(.5+.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }  // k≈9-13 px

// Perfil de altura de lente: cuarto de círculo sobre una banda w
float lente(float d,float w){ float t=clamp(-d/w,0.,1.); return sqrt(1.-(1.-t)*(1.-t)); }

// Altura total: píldora suave + gota alta + ondas solo dentro
float H(vec2 p){ return lente(dPildora(p), alto*.36)*2.4 + lente(dGotas(p), 11.)*7.5 + ondas(p)*smoothstep(0.,7.,-dPildora(p)); }

// Normal por diferencias finitas (1 px)
vec3 n = normalize(vec3(H(p)-H(p+vec2(1,0)), H(p)-H(p+vec2(0,1)), 1.));
float spec  = pow(max(dot(reflect(-L1,n), vec3(0,0,1)),0.), 70.);          // L1 = normalize(-.45,-.8,.85)
float spec2 = pow(max(dot(reflect(-L2,n), vec3(0,0,1)),0.), 22.) * .3;    // contraluz suave, L2 opuesta
float fres  = clamp((1.-n.z)*4., 0., 1.);                                  // borde = más reflejo
vec3 irid   = .5+.5*cos(6.2831*(vec3(0,.33,.67) + fres*.85 + p.x*.0028 + t*.035));  // solo en el canto
```

- **Unir formas:** el `smin` entre la cabeza y la cola de la gota da el "cuello" que se estira y se rompe; con k ≈ 13 px
  el puente aguanta lo justo.
- **Cáusticas:** 3 iteraciones de `q += vec2(sin(q.y*1.1+t), cos(q.x*1.3-t*.7))*.6` y acumular
  `1/(1+16·|sin q.x · sin q.y|)`; muestrear en `p + n.xy * grosor * 18` para que se curven con la gota. Mezclar a 0.28 y
  solo dentro de la gota.
- **Sombra de contacto de la gota:** la misma SDF desplazada 5 px hacia abajo, `smoothstep(9,-9,d)`, alfa 0.11 (0.18 en
  oscuro), teñida de azul profundo y no gris.
- **Composición:** capa a capa en premultiplicado (`c = cCapa + c·(1-aCapa)`): sombra → cuerpo de la gota (tinte
  0.26-0.40 según `-n.y`) → rim azulado 0.22 en los 8 px del borde → luna creciente (cara iluminada) 0.7 → especular
  → iridiscencia 0.35-0.5 en el canto.
- **Dispersión espectral real (para un momento único, no para UI permanente):** 20 muestras de longitud de onda, cada una
  con su índice `1.5 + dispersión·(1-2λ)`, ponderadas por una curva de espectro y normalizadas. Bisel con perfil
  superelíptico `1-(1-x)^2.6`, y un segundo escalón al 62 % del bisel para la línea fina interior.

---

## 3. Movimiento y física

Integración semiimplícita en cada fotograma, con `dt = min(dt, 1/30)` para que un salto de pestaña no explote:
`v += (k·(objetivo-x) - c·v)·dt;  x += v·dt`.

**Muelles concretos (masa 1):**

| Uso | k | c | Notas |
|-----|---|---|-------|
| Cabeza de la gota (navegación) | 210 | 25 | Rápida, casi sin rebote |
| Cola de la gota | 72 | 13 | Más blanda: se queda atrás y estira el cuello |
| Cabeza en un interruptor | 260 (150 arrastrando) | — | Al soltar vuelve a 260 |
| Gota de selección en un segmentado | 480 | 28 | Ancho interpolado aparte a 14/s |
| Escala vertical (aplastado) | 280 | 9 | Muy poco amortiguado: tiembla como un líquido |
| Gotitas sueltas | 70-160 en x, 90 en y | 9 / 7 | Cada una con su k al azar: llegan desordenadas |
| Ampliación de iconos en un dock | 460 | 36 | Umbral de reposo 0.0005 en valor |
| Pestaña con lente | ζ = 0.53, ωn = 11.1 | — | ~14 % de sobrepaso, pico a 0.33 s |

Muelles por duración y rebote (más fáciles de afinar): `k = (2π/duración)²`, `c = 4π·(1-rebote)/duración`.
Pulsar 0.24 s / 0.2; soltar 0.5 s / 0.42 (el rebote va en la salida, no en la entrada); brillo 0.42 s / 0; seguir
puntero 0.18 s / 0 (+0.0005 s por px de tamaño); cambio de tamaño 0.4 s / 0.16. Con solución analítica (subamortiguado,
crítico, sobreamortiguado) se puede avanzar cualquier dt sin inestabilidad.

**Cuerpo con retraso:** dos cuerpos (cabeza y cola) persiguen el mismo objetivo. La cola arranca 70 ms tarde con la
fuerza al 8 %. Se elige como cabeza el cuerpo más cercano al destino.

**Squash and stretch:** objetivo de escala vertical `1 - 0.2·min(|v|/1500, 1)`; en la gota de un formulario,
`scaleX = 1 + min(0.22, |v|/2600)` y `scaleY = 1 - min(0.12, |v|/4200)`. Conservando volumen al arrastrar un botón:
`sx = (1+crece)(1+ex)/√(1+ey)`, `sy = (1+crece)(1+ey)/√(1+ex)`, con `ex = min(tope, 0.5·|dx|/ancho + 0.00007·|v|)`,
tope 0.2 en piezas ≤ 72 px y 0.12 en grandes; al pulsar crece `min(0.16, 8/lado)`.

**Goma (rubber band) al arrastrar:** `límite·(1 - 1/(|x|·0.55/límite + 1))`, límite `4 + 0.15·lado` en piezas
pequeñas y `min(10, 3 + 0.04·lado)` en grandes.

**Choque con el borde:** rebote `v *= -0.25` y un impulso al aplastado `-min(|v|, 900)·0.0016`.

**Gotas:** si el cuello supera el ancho de las dos tapas (separación > 2·(medioLargo + r) - 6), nacen 3 gotitas al 30, 50
y 72 % del camino, radio 5-8 px, con la velocidad media de los cuerpos. Se encogen 26 px/s al llegar y se borran bajo
0.6 px.

**Ondas:** al asentarse, una onda en el destino (amplitud 0.7, o 1.2 si hubo gotas); al tocar, 0.8. En el shader:
`x = |p - centro| - edad·240;  w += A·exp(-1.7·edad)·sin(0.3·x)·exp(-x²/700)`; vida 2.4 s; máximo 6 a la vez.

**Menisco con el ratón:** campana `3.6·exp(-|p-ratón|²/1000)` sumada a la altura; la intensidad entra y sale a 7/s.
Solo con `pointerType === "mouse"`. Ambiente: `0.45·sin(0.05x + 1.2t) + 0.25·sin(0.13x - 0.85t + 0.2y)`.

**Brillo que sigue al puntero:** radial en `--glow-x/--glow-y`, tamaño `clamp(36, 0.9·lado, 180)` px, intensidad 0.35 en
hover y 1 al pulsar, con muelle propio. Solo con `(hover:hover) and (pointer:fine)`.

**Bucle:** un solo `requestAnimationFrame` que se apaga cuando todo está quieto (|Δx| < 0.3 px y |v| < 3) y se
despierta con cualquier evento. Las propiedades se escriben solo si cambian.

---

## 4. Respaldos, accesibilidad y rendimiento

- **Sin refracción (Safari, Firefox, iOS):** el mismo panel con `blur(10-20px) saturate(1.4)` (WebKit con tope de 16 px
  de blur) y tinte más alto (blanco 0.7 en el caso más prudente; 0.14-0.3 si el fondo está controlado). El rim y las
  sombras no cambian: el vidrio sigue leyéndose como vidrio.
- **Sin `backdrop-filter`:** `@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))` → fondo
  sólido de la superficie.
- **Sin WebGL o contexto perdido:** escuchar `webglcontextlost` (con `preventDefault`) y pasar a una gota CSS
  (`radial-gradient(120% 140% at 30% 0%, blanco .75, transparente 55%), blanco .38`, rim interior y sombra), que se mueve
  con la misma física aplicada a `transform` y `width`.
- **`prefers-reduced-transparency`, `prefers-contrast: more` y `forced-colors`:** fuera `backdrop-filter`, fondo sólido;
  en `forced-colors`, borde `1px solid CanvasText`, sin sombras, foco en `Highlight`. Escuchar el `change` de la consulta
  y retirar el filtro en caliente.
- **`prefers-reduced-motion`:** sin rebotes ni gotas ni ondas: los cuerpos saltan al destino y el bucle solo corre si
  algo cambia; el ambiente a 0. Los cambios de estado siguen viéndose (color, posición final).
- **Contraste del texto:** el contraste se mide contra la peor zona del fondo, no contra el tinte. Para listas y
  formularios, velo de 54-66 % del color de superficie bajo el texto aunque el borde siga siendo claro; texto atenuado
  como `color-mix(texto 78-96 %, superficie)`, nunca gris fijo. Si el fondo se mueve (vídeo, WebGL), subir el velo.
  Objetivo 4.5:1 en texto normal.
- **Pausar fuera de vista:** `IntersectionObserver` + `visibilitychange`; el canvas WebGL solo cubre el componente.
- **Coste de `backdrop-filter`:** proporcional al área × radio de blur, y se recalcula cada vez que cambia algo detrás.
  Reglas: una sola capa con blur por zona (las de dentro, tinte); blur grande solo en superficies pequeñas o fijas;
  nunca animar el valor de blur (animar `opacity` de una capa ya desenfocada); no poner `backdrop-filter` sobre vídeo a
  pantalla completa sin medir; en móvil, bajar a 8-12 px. El filtro SVG cuesta más que el blur: compartir filtros y
  mapas, mapas a media resolución y regenerarlos solo al cambiar el tamaño.
- **Animar solo `transform`/`opacity`:** los buenos mueven gotas con `transform` y cambian tamaños de panel con FLIP;
  los flojos animan `left`, `top`, `padding` y radios.

---

## 5. Lo que abarata el cristal y qué separa a los buenos

**Errores típicos:**

1. **Ruido en vez de lente.** `feTurbulence` con frecuencia alta y `scale` 70-200 deforma todo el panel: parece vidrio de
   ducha. La lente real deja el centro nítido y solo dobla el canto.
2. **Blur alto + refracción.** Se anulan: queda niebla.
3. **Blanco y negro puros.** Tinte blanco 25 % y sombra negra 20 % sobre cualquier fondo. Saca el color del fondo.
4. **Rim uniforme o de 9 capas.** Un `border: 1px solid rgba(255,255,255,.2)` es CSS de 2021; nueve `inset` oscuros
   apilados dan un botón sucio. Con 3-4 sombras asimétricas basta.
5. **Respaldo inexistente.** `backdrop-filter: url(#x)` solo: en Safari y Firefox no se ve nada, ni siquiera el blur.
   Siempre `url(#x) blur(…)` en Chromium y otra regla completa para el resto.
6. **Ids de filtro globales y duplicados.** Un `<filter id="glass">` dentro de cada botón repite el id en la página.
7. **Radios que no coinciden.** Capa de lente con `rounded-md` bajo un botón `rounded-full`: el desenfoque asoma por las
   esquinas.
8. **Animar propiedades de maquetación** (`padding`, `left`, `top`) con `cubic-bezier(…, 2.2)` de 700 ms: tirones y un
   rebote de goma de juguete. El líquido sale de muelles con velocidad, no de una curva con sobrepaso.
9. **`mousemove` en `window` siempre activo** y bucles que nunca duermen.
10. **Medir una vez.** El mapa se calcula en el montaje y nunca con `ResizeObserver`: al cambiar el tamaño la lente
    queda descolocada.
11. **Cristal sobre fondo plano.** Sin contraste detrás, no hay nada que doblar.

**Lo que hacen los tres mejores:**

- **El agua en WebGL (navegación; el interruptor y el acordeón comparten motor).** Física de dos cuerpos con gotas que
  se rompen y se unen, ondas, menisco, cáusticas e iridiscencia, todo en un canvas recortado al componente, dormido cuando
  está quieto y fuera de vista, con respaldo CSS que usa la misma física, teclado con flechas y `aria-current`. El
  cristal de debajo cambia a refracción solo en Chromium. Es el estándar.
- **El botón tipo sistema operativo.** Mapa de lente con squircle, plano aparte para el rim especular, filtro con tabla
  de tono, tinte y dispersión, cápsulas horneadas en tres trozos, filtros compartidos con recuento de referencias,
  detección de motor con `userAgentData`, muelles analíticos por duración/rebote y estiramiento que conserva volumen.
  Lo más completo como material.
- **La barra lateral expandible.** Material entero en variables CSS, mapa por SDF regenerado por firma, máscara para los
  píxeles que se escapan, respaldo para transparencia reducida, contraste alto y colores forzados, colores del sistema
  (`Canvas`, `CanvasText`) heredables y velo de lectura. Lo mejor como sistema accesible.

Detrás, sólidos: la lente física por Snell (las dos variantes son el mismo código: perfil correcto, aberración y blob
URL, aunque el respaldo es muy lechoso) y el panel de mando (sin refracción, pero ejemplar en tintes cálidos, sombras
tomadas del fondo, un solo nivel de blur y fondo preparado). El revelado de logo tiene el shader óptico más fino
(dispersión espectral, superelipse, foco en las esquinas), pero es una animación de un solo uso.

**Flojos:** los tres "liquid glass" genéricos con `feTurbulence` (ruido en vez de lente, sin respaldo, ids repetidos,
uno con iluminación especular calculada que nunca se usa y otro que sigue al ratón animando `left/top`); la lupa por mapa
que mide una vez y no reacciona al tamaño; la barra de pestañas que finge la refracción repintando un fondo conocido
(idea útil, pero atada a un escenario fijo de 1920×1080 y moviendo `left`). El dock 3D y el botón de brillo resuelven
bien un vidrio pintado (degradados, reflejos con máscara, sombras diagonales) sin `backdrop-filter`, válido como
respaldo pero no como cristal. El botón tejido, el metálico y la ventana escarchada no son cristal líquido (aunque la
escarcha enseña bien a dormir una simulación y caer a un viñeteado CSS).

---

## 6. Receta mínima: panel de cristal con refracción SVG y respaldo

HTML + CSS + JS sin dependencias. Chromium: lente con mapa por SDF. Resto: cristal esmerilado. Transparencia reducida:
sólido. El texto va sobre un velo suficiente.

```html
<div class="cristal" id="panel">
  <span class="cristal__lente" aria-hidden="true"></span>
  <h2>Reserva confirmada</h2>
  <p>Mesa para dos, viernes a las 21:00.</p>
</div>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs id="defs-cristal"></defs></svg>

<style>
.cristal{position:relative;isolation:isolate;border-radius:28px;padding:24px 28px;color:#0d1424;
  box-shadow:inset 0 0 0 1px rgb(255 255 255/.22),inset 0 1px 1px rgb(255 255 255/.8),
    inset 0 -1px 1px rgb(255 255 255/.35),inset 0 -8px 12px -8px rgb(20 30 60/.18),
    0 2px 6px rgb(20 40 80/.12),0 16px 36px -16px rgb(20 40 80/.5)}
.cristal::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;pointer-events:none;
  background:linear-gradient(150deg,rgb(255 255 255/.32),transparent 40%)}
.cristal__lente{position:absolute;inset:0;z-index:-2;border-radius:inherit;pointer-events:none;
  background:rgb(255 255 255/.34);
  -webkit-backdrop-filter:blur(14px) saturate(1.4) brightness(1.06);backdrop-filter:blur(14px) saturate(1.4) brightness(1.06)}
.cristal[data-refracta] .cristal__lente{background:rgb(255 255 255/.22)}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.cristal__lente{background:rgb(244 246 250/.94)}}
@media (prefers-reduced-transparency:reduce),(prefers-contrast:more){.cristal__lente{background:#f4f6fa;backdrop-filter:none;-webkit-backdrop-filter:none}}
@media (forced-colors:active){.cristal{border:1px solid CanvasText;box-shadow:none}}
</style>

<script type="module">
const panel = document.getElementById('panel'), lente = panel.querySelector('.cristal__lente');
const defs = document.getElementById('defs-cristal'), NS = 'http://www.w3.org/2000/svg';
const ESCALA = 40, MAX_BISEL = 20;
const sinTransparencia = matchMedia('(prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)');

function esChromium() {
  const marcas = navigator.userAgentData?.brands;
  if (marcas?.length) return marcas.some(m => /Chromium|Google Chrome|Microsoft Edge/.test(m.brand));
  const ua = navigator.userAgent;
  return /(Chrome|Chromium|Edg)\/\d+/.test(ua) && !/Firefox\/|CriOS/.test(ua);
}
const sdCaja = (x, y, hw, hh, r) => {
  const qx = Math.abs(x) - hw + r, qy = Math.abs(y) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};

async function hacerMapa(w, h, r, bisel) {
  const k = 0.5, W = Math.ceil(w * k), H = Math.ceil(h * k);          // media resolución basta
  const lienzo = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const ctx = lienzo.getContext('2d'), img = ctx.createImageData(W, H), px = img.data;
  const d = (x, y) => sdCaja(x, y, w / 2, h / 2, r);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const x = (i + 0.5) / k - w / 2, y = (j + 0.5) / k - h / 2, s = d(x, y), o = (j * W + i) * 4;
    let dx = 0, dy = 0;
    if (s < 0 && s > -bisel) {
      const t = -s / bisel, f = 1 - Math.sqrt((2 - t) * t);           // 1 en el canto, 0 hacia dentro
      const nx = d(x + 1, y) - d(x - 1, y), ny = d(x, y + 1) - d(x, y - 1), L = Math.hypot(nx, ny) || 1;
      dx = -nx / L * f; dy = -ny / L * f;                              // muestrea hacia dentro: amplía el canto
    }
    px[o] = 128 + dx * 127; px[o + 1] = 128 + dy * 127; px[o + 2] = 128; px[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const blob = await new Promise(res => lienzo.toBlob(res, 'image/png'));
  return URL.createObjectURL(blob);
}

let urlMapa = null, firma = '', n = 0, pendiente = 0;
async function construir() {
  pendiente = 0;
  if (sinTransparencia.matches) return quitar();
  const w = Math.round(lente.offsetWidth), h = Math.round(lente.offsetHeight);
  const r = Math.min(parseFloat(getComputedStyle(lente).borderTopLeftRadius) || 0, w / 2, h / 2);
  if (w < 4 || h < 4 || firma === `${w}:${h}:${r}`) return;
  firma = `${w}:${h}:${r}`;
  const url = await hacerMapa(w, h, r, Math.min(MAX_BISEL, h / 3));
  const id = `cristal-${++n}`, filtro = document.createElementNS(NS, 'filter');
  for (const [a, v] of Object.entries({ id, x: 0, y: 0, width: w, height: h, filterUnits: 'userSpaceOnUse',
    'color-interpolation-filters': 'sRGB' })) filtro.setAttribute(a, v);
  filtro.innerHTML = `<feImage href="${url}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="m"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="m" scale="${ESCALA}" xChannelSelector="R" yChannelSelector="G"/>`;
  defs.replaceChildren(filtro);
  const valor = `url(#${id}) blur(1.5px) saturate(1.5) brightness(1.05)`;
  lente.style.backdropFilter = valor;
  if (urlMapa) URL.revokeObjectURL(urlMapa);
  urlMapa = url;
  panel.dataset.refracta = '';
}
function quitar() {
  lente.style.removeProperty('backdrop-filter'); delete panel.dataset.refracta;
  defs.replaceChildren(); firma = '';
}

if (esChromium() && CSS.supports('backdrop-filter', 'url(#a)')) {
  const programar = () => { if (!pendiente) pendiente = requestAnimationFrame(construir); };
  new ResizeObserver(programar).observe(lente);
  sinTransparencia.addEventListener('change', programar);
}
</script>
```

Notas de la receta:

- Solo se toca `backdrop-filter` sin prefijo: en Chromium es el que vale, y Safari conserva la regla `-webkit-` del CSS
  (esmerilado).
- `ESCALA` 30-60 según tamaño; en botones, 20-36. Bisel = `min(20, alto/3)`. Para un efecto agua, sustituir el mapa por
  `feTurbulence baseFrequency="0.006 0.02" numOctaves="2"` + `feGaussianBlur stdDeviation="2"` con `scale="60"`.
- Si el panel se anima de tamaño, no regenerar en cada fotograma: animar con FLIP (`transform`) y regenerar al acabar.
- Para varios paneles iguales, cachear el blob por firma y compartir el `<filter>`.
- Comprobar en Chrome con un fondo con líneas finas (rejilla o texto): el centro debe verse nítido y las líneas deben
  curvarse solo en los últimos ~20 px del borde. En Safari, el mismo panel esmerilado; con «Reducir transparencia», sólido.
