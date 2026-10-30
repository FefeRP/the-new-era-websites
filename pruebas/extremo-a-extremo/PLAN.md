# Plan · Orbe 01, boutique y taller en Sabadell

Plan escrito como lo pide la skill maestra `web-premium` (pasos 1-4) antes de construir `index.html`.

## Brief
- **Negocio y protagonista:** Orbe, marca ficticia de relojes; el Orbe 01 (modelo «Chronograph Watch» de Khronos, CC BY 4.0).
- **Objetivo y CTA:** reservar el reloj («Reservar el tuyo») y, de apoyo, ir al taller a probárselo.
- **Activos:** ninguno del cliente. Sin presupuesto: render propio del modelo glTF, frames ya renderizados de `demos/reloj` y
  ortofoto PNOA (licencia abierta). **Coste real gastado: 0 $.**
- **Destino técnico:** HTML estático sin build, módulos ES importados por ruta desde `plugins/`; scroll con cálculo propio (sin GSAP).
- **Público:** comprador local y de toda Cataluña; escritorio y móvil a partes iguales.
- **Marca:** la de `demos/reloj`: fondo #171412, texto #efe9e1, acento #c9a46a, serif Palatino para titulares, sans del sistema.
- **Momento estrella:** el giro del reloj de perfil a frente y al otro perfil con el scroll (frames).

## Guion (5 tramos)
| # | Tramo | Qué pasa | Técnica (skill) |
|---|---|---|---|
| 1 | Hero | «ORBE 01» enorme entra línea a línea y queda **entre** el fondo y el reloj recortado; al bajar, el titular sube más rápido que el reloj | capas con alfa (`capas-alfa`) + líneas (`revelados-y-transiciones`) + parallax por código |
| 2 | Giro (estrella) | Escena fijada: el reloj gira 160° con el scroll; tres textos (caja, esfera, correa) | frames (`scroll-frames`) |
| 3 | Detalle | La esfera de cerca se descubre por bloques mientras se lee el texto y las cifras | rejilla (`revelados-y-transiciones`) |
| 4 | Taller | Del municipio a la calle con ortofoto real y el marcador del taller | mapa por niveles de imagen (`mapa-zoom-ubicacion`, `mapa-imagen.js`) |
| 5 | Cierre | Precio, nota y botón de reserva; pie con créditos | HTML |

## Medio de cada elemento (matriz de `pedir-assets-ia`) y por qué
| Elemento | Tipo en la matriz | Medio elegido | Por qué | Aquí, gratis | Con IA de pago |
|---|---|---|---|---|---|
| Reloj del hero | Objeto estático + texto **entre** fondo y sujeto | **Foto con alfa** + parallax por código | Lo quieto es foto; sube a capa con alfa porque el titular pasa por detrás. Un vídeo costaría 10-20 veces más y solo añadiría temblor | render three.js sobre **magenta** liso → `alfa.mjs --modo croma --recortar` (96 KB) | edición de la foto real del cliente sobre magenta (nano-banana-pro) + `alfa-local` |
| Giro | Objeto que gira (360°) / producto protagonista | **Frames** de un giro con cámara fija | Giro preciso y nítido en cualquier móvil sin GPU; el 3D en vivo solo si el usuario lo manipula | los 120 frames ya renderizados de `demos/reloj` (copiados) | vídeo con imagen de inicio y fin (kling-o3-pro), prueba de 3 s antes |
| Esfera de cerca | Objeto estático | **Foto** + **revelado por código** | El movimiento de adorno lo pone el código: exacto y gratis | el frame 60 del giro, recortado a la esfera (64 KB) | una imagen de detalle (nano-banana-2.1) |
| Taller en Sabadell | Mapa / ubicación | **Mapa por niveles** de ortofoto real + marcador HTML | La IA inventa geografía; PNOA permite uso con atribución; sin teselas ni WebGL, peso fijo | 3 niveles PNOA por WMS (ciudad 16:9, barrio 16:9, calle 4:5) | igual: nunca IA para el mapa |
| Titulares, cifras, precio, botón | UI, texto, cifras | **Código** (HTML) | La IA inventa letras; el texto se lee, se traduce y se indexa | HTML | HTML |
| Transiciones | Transiciones | **Código** (rejilla, líneas) | Exacto y gratis | `revelados.js` | igual |

Decisión de croma: el reloj tiene un logotipo **verde** en la esfera, así que el fondo es magenta y no verde (regla de
`capas-alfa`: el color del croma según el sujeto). `alfa.mjs` detectó `#ff00ff` solo.

## Presupuesto si se hiciera con IA de pago (`plan.json`)
```
node plugins/web-premium/skills/pedir-assets-ia/scripts/presupuesto.mjs pruebas/extremo-a-extremo/plan.json
```
```
Orbe 01 · boutique y taller en Sabadell (si se hiciera con IA de pago) · precios de 2026-10-30 (orientativos)

fase       pieza              modelo                    tarifa                 n × tir.   esperado   peor caso
1-claves   hero-magenta       nano-banana-pro 2k        0.134 $/img             1 × 3     0.13 $     0.40 $
1-claves   giro-inicio-fin    qwen-image-3 2k           0.075 $/img             2 × 3     0.15 $     0.45 $
1-claves   detalle-esfera     nano-banana-2.1 2k        0.05 $/img              1 × 3     0.05 $     0.15 $
2-prueba   prueba-giro        kling-o3-pro 1080p        0.112 $/s × 3 s         1 × 1     0.34 $     0.34 $
3-final    giro               kling-o3-pro 1080p        0.112 $/s × 5 s         1 × 2     0.56 $     1.12 $
3-final    recorte-hero       alfa-local                0 $/pieza               1 × 1     0.00 $     0.00 $
3-final    qa                 revision                  0.02 $/clip             3 × 1     0.06 $     0.06 $

Por fases (para y enseña el resultado al acabar cada una):
  1-claves   esperado   0.33 $ · peor   1.00 $ · acumulado esperado 0.33 $
  2-prueba   esperado   0.34 $ · peor   0.34 $ · acumulado esperado 0.67 $
  3-final    esperado   0.62 $ · peor   1.18 $ · acumulado esperado 1.29 $

TOTAL esperado 1.29 $ · peor caso 2.52 $

Alternativas más baratas para probar:
  prueba-giro: veo-3.1-lite 720p (0.05 $/s), luma-ray-3.2 720p (0.06 $/s) — más barato; pruébalo en la fase de prueba antes de cambiar
  giro: veo-3.1-lite 1080p (0.08 $/s) — más barato; pruébalo en la fase de prueba antes de cambiar

Cabe en el presupuesto (5.00 $ disponibles) incluso en el peor caso.
Antes de generar: enseña este presupuesto y espera el vale. Confirma el precio en el proveedor (muchos tienen un "estimate" gratis).
```
**Coste real gastado en este ejemplo: 0 $** (render propio, activos CC BY y ortofoto PNOA; ninguna llamada a APIs de pago).
