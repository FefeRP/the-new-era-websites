# ref13 · "We make websites. You judge." (7 webs, @IDANWEB)

Vídeo de 25 s (9:16) grabado con el móvil a la pantalla de un portátil: siete webs seguidas, unos 2-3 s cada una. Análisis:
fotogramas a 4-6 fps recortados a la pantalla y revisados a mano el 30-10-2026, contrastados con un informe de Gemini
(gemini-3.5-flash). Gemini tiende a atribuirlo todo a three.js; abajo se marca qué se ve de verdad.

## Las siete webs
| # | Web | Qué se ve | Técnica real (según los fotogramas) | Fiabilidad |
|---|---|---|---|---|
| 1 | Cafetería (Joe's Coffee) | Una mancha marrón cubre toda la pantalla y se retira dejando un trazo curvo que se enrosca y sale por un lado; detrás queda la home | **Forma plana de color liso** (sin brillos ni volumen): un trazado SVG o una máscara animada, no una simulación de líquido. Transición de entrada barata | Confirmado (color plano, bordes nítidos) |
| 2 | Productora (REV) | La foto del hero (costa aérea) encoge y entra en la pantalla trasera de una cámara de fotos; la cámara gira un poco y la foto de su pantalla cambia (costa → villa) | La cámara es muy realista y su pantalla cambia de contenido mientras gira: o 3D (glTF con la imagen como textura) o un vídeo/fotogramas con la pantalla compuesta por código (`seguir-pantalla`). Con un vídeo IA y la pantalla en blanco se consigue lo mismo | Suposición (no se puede distinguir en la grabación) |
| 3 | Bebida (Hydro) | Lata blanca lisa que da vueltas en todos los ejes mientras baja entre titulares, hasta quedar de frente en una ficha | 3D en tiempo real (se ve la tapa, el fondo y giros libres en tres ejes, imposibles de casar con un vídeo fijo). Lata sencilla, poco realista: es el caso donde el 3D sí compensa | Confirmado (giros libres) |
| 4 | Cafetería (Joe's Coffee, 2.ª parte) | "Move your cursor": al mover el ratón van saliendo fotos (baristas, cafés) que se apilan y desaparecen | **Rastro de imágenes del cursor** en el DOM: cada cierta distancia recorrida aparece la siguiente foto de una lista, con escala y opacidad que se apagan | Confirmado |
| 5 | Inmobiliaria (La Cerda) | Recorrido por el interior de una casa (salón → pasillo → dormitorio) con el titular fijo encima | **Vídeo realista ligado al scroll** (desenfoque de movimiento real entre fotogramas, luz y materiales fotográficos). Por el aspecto, vídeo de IA o un render de arquitectura; con WebGL no se llega a ese acabado | Confirmado que es vídeo/fotogramas; que sea IA es suposición |
| 6 | Reloj (FS 60P) | Reloj metálico que gira 360° (hasta verse de canto) mientras palabras enormes pasan por delante y por detrás | Secuencia de fotogramas de un render o vídeo con fondo blanco, y el texto en capas (unas palabras por detrás del reloj y otras delante: sándwich de texto) | Suposición fuerte (frames; el canto fino y el metal casan con un render) |
| 7 | Safari (Essentia) | La foto de cabecera aparece por bloques en escalera; luego la palabra "ESSENTIA" con las jirafas y la hierba **por delante** de las letras | Revelado en rejilla (`clip-path` por celdas con retraso escalonado) + **foto separada en capas**: cielo y árbol detrás, texto en medio, jirafas y hierba recortadas delante | Confirmado (las jirafas tapan las letras) |

## De qué assets se compone cada una
- Cafetería: fotos fijas (local, baristas, cafés) + una forma SVG. Ningún vídeo.
- Productora: foto aérea + cámara (modelo 3D o vídeo IA de producto con pantalla lisa).
- Bebida: modelo 3D sencillo de lata + etiqueta.
- Inmobiliaria: un vídeo de recorrido (o 2-3 encadenados) partido en fotogramas.
- Reloj: secuencia de 120-180 fotogramas de un giro con fondo blanco.
- Safari: **una sola foto** separada en 2-3 capas (fondo, sujetos delante) con el texto en medio.

## Lecciones para el marketplace
- Tres de siete efectos se resuelven **sin vídeo**: una forma SVG, un rastro de fotos y una foto en capas. Son baratos y quedan bien.
- El "texto entre capas" (ref13-7 y ref13-6) pide recortar el sujeto de la foto: el asset se pide **con el sujeto bien separado
  del fondo** (contraste, sin pelo suelto ni hierba fina en el borde si se puede) o directamente por capas.
- El 3D en tiempo real solo aparece donde hay giro libre en varios ejes (la lata), y es la pieza menos realista del vídeo.
- Técnicas: `capas-alfa` (sándwich de texto: recorte del sujeto con alfa y texto entre capas) + `parallax-capas` (movimiento de
  las capas), `revelados-y-transiciones` (revelado en rejilla con `crearRejilla`, cortinas), `rastro-cursor` (rastro de fotos),
  `scroll-frames` (recorrido y reloj), `seguir-pantalla` (pantalla de la cámara), `escena-3d-gltf` (lata con giro libre).
