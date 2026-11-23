# Base común y módulos

NEW ERA sirve para cualquier web con carácter: corporativa, editorial, inmobiliaria, tienda, restaurante, estudio,
producto, inmersiva. Por eso se divide en dos capas:

- **Base común (siempre).** Brief, dirección de estilo y `DESIGN.md`, idea, hilo y firma, estructura y recorrido,
  tipografía, color, ritmo, movimiento por código (revelados, titulares por líneas, transiciones, microinteracciones,
  componentes interactivos), carga de las skills de diseño, código contra la documentación actual (`find-docs` y
  `modern-web-guidance`), verificación con capturas y revisión independiente por rondas. Todo esto está en el
  `SKILL.md` de `new-era` y vale igual para una notaría que para una web inmersiva.
- **Módulos (según el proyecto).** Cada uno trae sus skills, sus técnicas, sus activos y sus comprobaciones. La
  maestra decide en el paso 4 cuáles activa y lo deja escrito en `BRIEF.md` con el motivo. Un módulo que no se activa
  no se carga ni se monta: la web no arrastra su peso ni su forma de pensar.

| Módulo | Fichero | Skills que trae |
|---|---|---|
| **3D y WebGL** | [3d-y-webgl.md](3d-y-webgl.md) | `escena-3d-gltf` · `webgl-animation-skills` (shaders, three.js, partículas) · recetas de Spline de `biblioteca-componentes` · `gsap-skills` para la cámara |
| **Vídeo con IA** | [video-ia.md](video-ia.md) | `video-ia-para-scroll` (Higgsfield entero: modelos, plantillas, árbol, checklists, flujos, montaje, revisor) · `pedir-assets-ia` (parte de vídeo y presupuesto) · `seguir-pantalla` |
| **Scroll inmersivo y frames** | [scroll-inmersivo.md](scroll-inmersivo.md) | `scroll-frames` · `video-desde-html` · `gsap-skills:gsap-scrolltrigger` / `gsap-timeline` (escenas fijadas largas) · `nateherk-design:scroll-craft` si está instalada |
| **Assets de IA: foto, alfa y capas** | [assets-ia.md](assets-ia.md) | `pedir-assets-ia` · `recursos-imagen-ia` · `fotos-producto-ia` · `capas-alfa` · `parallax-capas` · `lente-revelado` · `envase-giratorio` |
| **Biblioteca de componentes** | [biblioteca.md](biblioteca.md) | `biblioteca-componentes` (catálogo propio con licencias y prompt) |
| **Lugar y mapa** | [lugar-y-mapa.md](lugar-y-mapa.md) | `mapa-zoom-ubicacion` (mapa vivo o por niveles de imagen) |

Skills que no son módulo porque son de la base: `revelados-y-transiciones`, `rastro-cursor`,
`componentes-interactivos`, `emil-design-eng`, `animate`, `apple-design`, las skills de diseño y las de código.

## Por qué cada skill está donde está
- **`lente-revelado` y `envase-giratorio` van en Assets de IA**, no en 3D: los dos funcionan con imágenes (dos
  alineadas, o una etiqueta plana) y su gracia es dar la sensación de objeto sin cargar three.js. Son la alternativa al
  3D, así que una web sobria puede usarlos sin activar el 3D.
- **`seguir-pantalla` va en Vídeo con IA**: solo tiene sentido cuando hay un vídeo con una pantalla o un cartel dentro.
- **`video-desde-html` va en Scroll inmersivo**: hace secuencias y bucles por código, sin modelo de IA, para el scrub.
  También sirve en la entrega (un vídeo de la web para redes) aunque el módulo no esté activo.
- **El fondo vivo con shader va en 3D y WebGL**: necesita las mismas skills (GLSL, canvas, rendimiento de GPU), aunque
  sea plano.
- **El mapa es un módulo propio** y no parte del scroll inmersivo: lo piden webs de lugar (inmobiliaria, hotel,
  restaurante, tienda física) que muchas veces son sobrias y no quieren nada más inmersivo.
- **`pedir-assets-ia` está en dos módulos** (Vídeo con IA y Assets de IA) porque reparte el medio de cada elemento y
  el presupuesto de los dos. Se carga una vez si cualquiera de ellos está activo.

## Cómo se decide (paso 4 de la skill)
1. **Lee las señales del pedido y del brief**, no el gusto propio. Cada módulo tiene su lista de señales en su
   fichero: «Se activa cuando…».
2. **Decide cada módulo por separado**: activado o no, con una frase de motivo que cite la señal («la inmobiliaria
   vende la ubicación → Lugar y mapa»; «no hay nada que girar ni configurar → sin 3D»).
3. **Contrasta con la intensidad** del paso 2:
   - **3 · Inmersiva**: al menos un módulo de escena (3D y WebGL, Vídeo con IA o Scroll inmersivo) da el momento
     estrella. Si el pedido es inmersivo y ninguno encaja, se vuelve al paso 3 a buscar otra idea; no se baja la
     intensidad sin decirlo.
   - **2 · Con escenas**: un módulo de escena o de assets suele dar la técnica fuerte.
   - **1 · Contenida**: la firma puede salir solo de la base (tipografía como imagen, revelados, una pieza
     propia por código). Que no haya módulos no rebaja nada de la base: dirección, firma, imagen propia, revisión
     por rondas y presupuesto con opciones siguen siendo obligatorios.
4. **Escríbelo en `BRIEF.md`**, sección «Módulos», antes de cargar nada del módulo:
   ```
   ## Módulos
   3D y WebGL: no · nada se gira ni se configura; la casa se enseña con fotos y plano
   Vídeo con IA: no · el cliente tiene fotos profesionales de todas las estancias
   Scroll inmersivo y frames: no
   Assets de IA: sí · fachada con alfa y capas para el hero (parallax-capas, capas-alfa)
   Biblioteca de componentes: sí · filtros, galería y formulario de visita
   Lugar y mapa: sí · vende la ubicación (mapa por niveles hasta el edificio)
   ```
5. **Carga las skills de cada módulo activo** con la herramienta `Skill` y lee su fichero. Apunta las cargas en
   «Skills cargadas → Módulos».
6. **Si a mitad del trabajo aparece la necesidad** (el cliente manda un modelo 3D, pide un vídeo), se activa el
   módulo entonces y se añade al brief con la fecha y el motivo. Desactivar uno ya activo también se apunta.

## Combinaciones típicas (ejemplos, no plantillas)
| Tipo de web | Suele activar | Suele quedar fuera | Dónde está la firma |
|---|---|---|---|
| Corporativa o despacho profesional | Biblioteca · a veces Assets (fotos del equipo tratadas, iconos propios) | 3D, Vídeo IA | Tipografía, retícula y un detalle propio por código |
| Editorial, revista, cultura | Biblioteca · a veces Scroll inmersivo (una escena larga por artículo) | 3D, Vídeo IA | Tipografía como imagen, ritmo y maquetación |
| Inmobiliaria | Lugar y mapa · Assets (fachada en capas) · Biblioteca | 3D (salvo que el visitante configure la vivienda) | Del mapa a la puerta, fichas con volteo |
| Tienda o e-commerce | Assets (producto aislado, fotos IA desde las reales) · Biblioteca · a veces Vídeo IA (el producto se abre) | 3D salvo configurador | La ficha que aterriza desde la escena |
| Restaurante, hotel, lugar | Assets · Lugar y mapa · a veces Vídeo IA (entrar al local) | 3D | La entrada al sitio, o la carta con el plato en escenario (catálogo J) |
| Producto estrella (reloj, perfume, bebida) | Vídeo IA + Scroll inmersivo · Assets · 3D solo si se gira libre | — | El objeto que se transforma con el scroll |
| Inmersiva, marca tecnológica o abstracta | 3D y WebGL · Scroll inmersivo · a veces Vídeo IA | — | La escena viva que persiste toda la web |
| Moda o tienda por looks | Assets (modelos IA con la misma luz, cámara y fondo blanco) · a veces Vídeo IA (bucle corto del look central) | 3D, Scroll inmersivo | La pasarela con foco y los puntos sobre la ropa (catálogo J) |
| Servicio a domicilio u oficio (limpieza, reformas, jardín) | Assets (antes y después del mismo encuadre) · a veces Vídeo IA (el trabajo por zonas) | 3D | «Límpialo tú» y el presupuesto al instante (catálogo J) |
| Constructora, arquitectura | Vídeo IA (la obra al revés, plantilla 14) + Scroll inmersivo · Assets | 3D salvo maqueta navegable | Se construye mientras bajas |

## Lo que no cambia con los módulos
- Ninguna web concreta es referencia fija: el tablero del paso 2 se hace para cada cliente.
- Lo realista sale de la IA o de fotos, no del 3D; lo exacto (logos, textos, precios, pantallas) siempre por código.
- No se genera nada de pago sin el precio estimado delante y el vale de quien paga, sea cual sea el módulo.
