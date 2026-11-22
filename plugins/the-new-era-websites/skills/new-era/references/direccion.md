# Dirección: idea, hilo conductor y recorrido

La dirección de estilo (qué lenguaje y qué intensidad) se elige en [direcciones-de-estilo.md](direcciones-de-estilo.md).
Aquí está cómo se convierte en una web que se recuerda.

## La idea y el hilo conductor
- **Una idea que ordena todo**, dicha en una frase y que solo sirve para este negocio. Suele ser una metáfora del propio
  oficio: un recorrido en el tiempo (una noche, una jornada, una temporada), en el espacio (del mapa a la puerta, de la
  fachada a la cocina), por dentro de algo (el producto pieza a pieza) o un proceso (de la materia prima a la mesa). Las
  secciones pasan a ser capítulos de ese relato y toman de él su orden, sus títulos y su color.
- **Un hilo conductor que persiste y se transforma**: un objeto, una cámara, una línea, una luz o un fondo vivo que
  acompaña todo el scroll y cambia de estado en cada capítulo (primer plano → entero → se puede tocar → se convierte en
  otra cosa). Es lo que hace que la web se sienta una sola pieza y no una pila de bloques.
- **La interfaz también cuenta la idea**: la navegación, el indicador de progreso o la barra fija pueden ser un objeto del
  oficio (un reloj, una regla, un plano, una pista de audio) en vez del menú de siempre.
- **La paleta acompaña el relato**: cambia con los capítulos (de noche a día, de crudo a cocinado, de plano a obra
  acabada). Una inversión de fondo en el momento clave vale más que diez efectos.
- **Tensión y descarga**: el momento estrella prepara algo (una palabra que crece, una cámara que se acerca) y lo suelta
  (cambio brusco de escala, de color o de escena).
- **Algo que tocar**: una interacción con sentido para el negocio y respuesta inmediata (arrastrar, girar, elegir una
  opción y que la escena cambie). Opcional: sonido, siempre apagado por defecto.
- **Voz propia en los textos**: frases que solo podría decir este negocio, cortas y concretas.

Nada de esto pide activos de pago: una idea, un canvas por código, tipografía variable y una paleta que cambia bastan
para una web inmersiva de pocos cientos de KB. Los activos (foto, vídeo, 3D) suben el techo, no sustituyen a la idea.

## El recorrido (5-8 secciones)
1. **Primera pantalla**: ya es la idea. Marca + promesa en una frase + el protagonista o el hilo conductor visibles y en
   movimiento. Debe verse completa en 1 segundo, antes de que cargue nada pesado (póster), y responder al primer gesto de
   scroll.
2. **Momento estrella**: la técnica fuerte, fijada (pin) 200-400 % de alto de pantalla. Como mucho 3-4 textos cortos sincronizados.
3. **Apoyo** (2-4): detalle, beneficios, prueba social, galería, oferta. Cada una con su composición; en intensidad 3, al
   menos una segunda escena y transiciones entre secciones (cortina, cambio de fondo, relevo de imagen).
4. **Cierre**: CTA claro, datos de contacto/compra, créditos. El hilo conductor llega a su estado final.

## Reglas de dirección
- **Un pico principal**: un momento estrella por página; las demás escenas, más cortas y de otra técnica.
- **Contraste de ritmo**: tras una sección fijada larga, una que respire (texto, espacio). El respiro también se diseña:
  no es una sección de plantilla.
- **Cada sección cambia algo** respecto a la anterior: fondo, composición, escala o técnica.
- **El scroll manda**: las animaciones en bucle no compiten con el scroll (un fondo vivo sí puede moverse solo si además
  responde al avance).
- **Texto legible siempre**: comprueba en cada posición que el texto tenga contraste sobre lo que pasa detrás (velo degradado si hace falta).
- **Móvil primero**: el momento estrella debe funcionar en vertical (recorte 9:16 o encuadre propio). Si no, rediseñarlo para móvil, no encogerlo ni quitarlo.
- **Duración**: un pin de 300 % ≈ 3 pantallas de pulgar. Más de 500 % cansa.
- **Velocidad coherente**: el mismo `ease` y duraciones parecidas en toda la web (p. ej. `power3.out` 0,8-1,2 s en reveals; `none` en scrub), salvo que la skill de animación cargada fije otras.
- **Ruido no, intensidad sí**: sobra el efecto que no cuenta nada de la idea, no la escena que la cuenta.

## Tipografía y color (mínimos; la skill de diseño cargada puede subirlos, nunca bajarlos)
- Dos familias como mucho: una display **con carácter** y una de texto. Mejor variables (ejes de peso y de ancho) si se van
  a animar. Las familias por defecto del sistema y las más usadas en plantillas no cuentan como elección.
- Escala con un salto de verdad: titular principal de 9-20 vw en escritorio (al menos 5-6 veces el cuerpo); cifras, horas
  o palabras clave pueden ser imagen (hasta 30-36 vw). Tamaños con `clamp()`.
- Paleta: un fondo (rara vez blanco puro o negro puro), un texto, un acento, y si la idea lo pide, una segunda paleta para
  el cambio de capítulo. El color del fondo de la web = el del fondo del vídeo/render, para que el lienzo "desaparezca".
- Números con `font-variant-numeric: tabular-nums` si se animan.

## Lo que da "aspecto de IA" o de plantilla y cómo evitarlo
Vale siempre, haya o no skill de diseño.

| Huele a plantilla | Mejor |
|---|---|
| Degradado morado-azul y tarjetas con sombra suave | Paleta del negocio real; superficies planas o con textura |
| Todo aparece con el mismo fade-up | Una técnica por sección y entradas distintas según el contenido |
| Titular mediano, subtítulo, dos botones e imagen a la derecha | Primera pantalla compuesta para esta idea: tipografía enorme, imagen a sangre o escena viva |
| Tipografía neutra en tamaño de landing | Display con carácter y salto de escala grande |
| Emojis o iconos genéricos como ilustración | Fotos/frames del producto, iconos de marca, detalle tipográfico |
| Textos vagos ("Innovación que transforma") | Datos concretos y frases con la voz del negocio |
| Tres columnas de "features" y rejillas de tarjetas iguales | Recorrido narrativo: un beneficio por pantalla, cada uno con su composición |
| La misma maqueta sección tras sección | Cambio de fondo, escala o composición en cada una |
| Un efecto suelto pegado a una web corriente | Un hilo conductor que atraviesa toda la web |
| Botón "Empezar ahora" sin contexto | CTA que dice lo que pasa ("Reservar mesa", "Ver tallas") |

## Brief (BRIEF.md)
```
Negocio / producto:
Objetivo y CTA:
Público y dispositivo principal:
Tiempo y alcance del encargo (rondas previstas):

## Dirección
Estilo e intensidad (1-3) y por qué:
Direcciones descartadas y por qué:
Tablero de referencias (5-8, qué se toma de cada una):
La idea en una frase:
Hilo conductor:
Momento estrella / firma:
Algo que tocar:
Sistema (enlace a DESIGN.md): tipografía, paleta, retícula

## Módulos (ver modulos/README.md; cada uno sí/no con la señal del pedido que lo decide)
3D y WebGL:
Vídeo con IA:
Scroll inmersivo y frames:
Assets de IA (foto, alfa, capas):
Biblioteca de componentes:
Lugar y mapa:
Cambios durante el encargo (fecha · módulo · motivo):

## Plan
Recorrido (secciones y qué cambia en cada una):
Técnicas (fuerte + apoyo) y por qué:
Activos: origen, licencia, opciones de presupuesto y la elegida:
Destino técnico (Vite / Next / …):

## Documentación consultada (ver codigo-y-plataforma.md)
Versiones (package.json) y, en Next.js, App Router o Pages Router:
find-docs (librería y versión · pregunta · qué decidió):
Modern Web Guidance (id de la guía · qué se aplicó):

## Skills cargadas (con la herramienta Skill, según se cargan)
Dirección:
Componentes:
Movimiento:
Módulos (skills de cada módulo activo):
Código (find-docs, modern-web-guidance):
Revisión:
No cargadas y motivo:

## Rondas de revisión
1. Qué dijo el revisor · qué se cambió · qué queda
```
