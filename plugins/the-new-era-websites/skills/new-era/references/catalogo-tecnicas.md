# Catálogo de efectos y técnicas (por técnica, no por estilo)

Cada entrada tiene: **qué se ve** · **cómo se hace** · **coste** (€ activos / rendimiento / horas) · **skill** ("hecho": la
skill existe; "idea": fase siguiente, sin skill todavía).
"Ref" señala el vídeo de referencia de `docs/referencias` del repositorio donde aparece:
- ref1: The Seed (girasol)
- ref2: Igloo Inc
- ref3: sweet-tape, era-residence, nickho-motorsports
- ref4: slider de helados
- ref5: café POUR/PLAY
- ref6: cosmética 9:16 (@ASCENTA.STUDIO)
- ref7: Reposé y latas en órbita (@W.WEAREBRAND)
- ref8: Reposé Residence, del satélite al edificio (@W.WEAREBRAND)
- ref9: mapas de arcilla en Barcelona (@RIKI.BOSSO, motion)
- ref10: slider de latas en Figma (@DESIGNGEMSTUDIO)
- ref11: cruasán por dentro (@W.WEAREBRAND)
- ref12: FORMA STUDIO, interiorismo solo con fotos (@DESIGNWITHARIAN)
- ref13: 7 webs seguidas (@IDANWEB): rastro de cursor, rejilla, texto entre capas
- ref14: zapatillas Last Dept, zoom a la estantería (@ASCENTA.STUDIO)
- ref15: café en cuatro tiempos con clips de vídeo IA
- ref16: Aeternum, escenas separadas por cortinas

Cada sección dice si es de la **base** (vale para cualquier web) o de qué **módulo** es (se usa si el módulo está activo
en el brief; ver [modulos/README.md](modulos/README.md)).

Coste de rendimiento: **ligero** (cualquier móvil) · **medio** (cuidar móvil) · **pesado** (solo escritorio o con alternativa).

Criterio de medio, antes de elegir técnica: lo quieto es **foto** (aislada, con alfa o en capas) que mueve el código;
**vídeo IA** solo donde la cámara viaja o algo cambia físicamente; **frames** para el scrub; **3D** solo si el usuario lo
gira libremente, lo configura o lo toca. Detalle en `pedir-assets-ia/references/matriz-medio-por-elemento.md`.

## A. Scroll y ritmo (la columna vertebral) · base
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Scroll suave con inercia | Lenis + `ScrollTrigger.update` en un único ticker | ligero | plantilla (hecho) · ref2, ref3 |
| Sección fijada (pin) que "reproduce" una escena | ScrollTrigger `pin:true, scrub:true, end:'+=300%'` | ligero | scroll-frames (hecho) · ref1, ref5 |
| Textos que aparecen sincronizados con la escena | timeline con etiquetas, `autoAlpha`+`y`, normalizado 0..1 | ligero | scroll-frames, patrones (hecho) · ref1 |
| HUD de datos ligado al progreso (contador, tiempo, °C, estado, barra) | el mismo `progress` que los frames → texto con `tabular-nums` y curva suave | ligero | scroll-frames, patrones "HUD de datos" (hecho) · ref1 (Day 0→90), ref3 (contador 98), ref11 (migas en el aire, horno) |
| Scroll horizontal dentro de vertical | pin + `x: -(ancho-vw)` con scrub; `containerAnimation` para hijos | ligero | idea: scroll-horizontal |
| Snap a capítulos | `snap:{snapTo:'labels'}` o CSS scroll-snap | ligero | idea |
| Animaciones CSS ligadas al scroll sin JS | `animation-timeline: view()/scroll()` + `animation-range`, dentro de `@supports` | ligero (Chrome/Edge/Safari 26) | parallax-capas (patrones), revelados-y-transiciones (patrones.md) (hecho) |

## B. Vídeo y secuencias de frames · módulos Vídeo con IA y Scroll inmersivo
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Producto que gira/se abre/se transforma al bajar | vídeo IA (imagen→vídeo) → frames WebP/AVIF → canvas | medio (4-8 MB) · € vídeo IA | video-ia-para-scroll + scroll-frames (hecho) · ref1, ref5, ref3 (sweet-tape) |
| Lo mismo con poco peso | MP4 con GOP corto + `currentTime` | ligero en peso · medio en fluidez iOS | scroll-frames, modo vídeo (hecho) |
| Despiece/ensamblado ("exploded view") | vídeo de explosión invertido | medio | video-ia-para-scroll, trucos (hecho) |
| Entrar en un objeto o un lugar (fly-through) | plantilla "Through Object"/dolly + frames | medio | video-ia-para-scroll (hecho) · ref2 (portal) |
| Transición de escena a escena | encadenar vídeos por último frame + fundido; si no hace falta que la cámara viaje, una cortina (ver G) | medio | video-ia-para-scroll (hecho) · ref1, ref15 |
| Fondo vivo en bucle | vídeo corto en bucle (inicio=fin), `muted playsinline`, pausa fuera de vista; si va encima de la web, vídeo con alfa en bucle | ligero | pedir-assets-ia (plantillas-por-plano §16) + capas-alfa (`video-alfa.js` en bucle) (hecho) |
| Vídeo con transparencia sobre la web (humo, chispas, líquido que cae) | vídeo IA sobre fondo liso o negro → `alfa.mjs` → MP4 "stacked alpha" (color arriba, alfa abajo) que `video-alfa.js` compone en WebGL; WebM VP9 como alternativa | medio | capas-alfa (hecho) · ref13 |
| Frames con alfa ligados al scroll (el elemento aislado avanza con el scroll sobre la página) | `alfa.mjs --formatos frames` (WebP con alfa) + `crearFrameScrubber({ transparente: true })` o manifest `alfa: true` | medio | capas-alfa + scroll-frames (hecho) |
| Frames en sprite CSS (muy pocos frames) | `steps()` + `background-position` | ligero | scroll-frames, tabla de modos (hecho) |
| La secuencia "aterriza" en la ficha de producto (PDP) o en la parrilla | último frame = foto exacta del producto en la UI; relevo de canvas a `<img>` sin fundido por CSS (cambio directo cuando el frame está pintado) y la UI (precio, botón) entra después | medio | scroll-frames + video-ia-para-scroll (hecho; el frame final, desde `fotos-producto-ia`) · ref6, ref15 |
| Vuelo multiescala (cielo → plano del lugar → fachada → interior) | 2-4 vídeos encadenados por último frame, cada uno una escala; textos editoriales entre tramos | medio · € vídeo IA | video-ia-para-scroll, transición encadenada (hecho) · ref7 (Reposé) |
| Antes/después guiado por el scroll (manchas que se borran, limpieza) | frames de un vídeo IA, o barato: dos fotos alineadas + cortina con máscara (`lente.cortina(p)`); shader de mezcla con ruido (idea) | ligero-medio | lente-revelado, cortina (hecho) · ref6 (sérum) |
| Producto realista contado por dentro en tramos (se parte → capas → entrar dentro → cambio de estado) | imagen clave sobre negro + 3-4 vídeos IA encadenados por fotograma (inicial/final) → frames por tramo + HUD | medio · € vídeo IA (unos pocos dólares en generación; la suscripción va aparte) | video-ia-para-scroll (receta-producto-por-dentro) + scroll-frames (hecho) · ref11 |
| Cambio de estado ligado al scroll (crudo → horneado, cerrado → abierto) | vídeo IA con fotograma inicial y final del mismo encuadre → frames; el HUD pone nombre al estado | medio | video-ia-para-scroll, receta (hecho) · ref11 |
| Composición vertical 9:16 propia para móvil | vídeo o frames generados aparte en vertical (no recortar el horizontal) | medio | scroll-frames, `--recorte-movil` o variante móvil (hecho) · ref6, ref7 |
| La web, el logo o un texto reales sobre una pantalla o cartel del vídeo IA, pegados fotograma a fotograma | seguimiento de 4 esquinas (`seguir-pantalla.mjs`) + capa con `matrix3d` en el `alDibujar` del scrubber; contenido con su proporción (nunca estirado) | ligero | seguir-pantalla (hecho) · ref4, ref6 (UI sobre el último frame), ref13 |
| Zoom a la pantalla y "entrar" en la web real | vídeo IA con inicio + fin (el fin es otra toma, no un recorte) → frames + capa de pantalla que crece a pantalla completa | medio · € vídeo IA (~1-2 $) | pedir-assets-ia (§1) + scroll-frames + seguir-pantalla (hecho) |
| Assets realistas pedidos a IA (qué medio, imagen clave, inicio/fin, presupuesto previo, revisión "¿se nota falso?") | guion de tramos → `presupuesto.mjs` → claves → prueba de 3 s → finales → `revisar-ia.mjs` | — · € según plan | pedir-assets-ia (hecho) · ref4, ref5, ref6, ref7, ref10, ref11, ref15 |

## C. Profundidad 2.5D (sin 3D) · módulo Assets de IA
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Parallax de capas en el scroll | `[data-profundidad]` + translate3d | ligero | parallax-capas (hecho) · ref4, ref5, ref12 |
| Capas que siguen al ratón | puntero → lerp por profundidad (solo hover) | ligero | parallax-capas (hecho) · ref3 (nickho) |
| Ingredientes/objetos flotando alrededor del producto | PNG/WebP con alfa con rotación + flotación lenta + parallax | ligero | parallax-capas + capas-alfa (hecho) · ref4 |
| Splash o ingrediente aislado (líquido congelado, fruta, polvo en el aire) | foto IA del momento congelado sobre fondo liso → `alfa.mjs --modo croma --recortar` (o `--modo diferencia` si es semitransparente) → capa con parallax; vídeo solo si tiene que moverse solo | ligero · € imagen IA (céntimos) | capas-alfa + pedir-assets-ia (plantillas-por-plano §11) (hecho) · ref4, ref10 |
| Texto entre planos (detrás del producto) | z-index: fondo < título HTML < producto con alfa | ligero | capas-alfa (componer-capas) + parallax-capas (hecho) · ref4, ref13 |
| Sombra como capa propia: el producto levita y la sombra se abre y difumina; cambiar de fondo sin perder la sombra | `capas-sombra.mjs` (foto + plato → fondo, sombra semitransparente, producto) + CSS `view-timeline` | ligero | parallax-capas, sombras.md (hecho) |
| Fotos del producto real en escenas imposibles, iguales entre tomas | edición por referencia con IA + revisión con superposición | € imagen IA (céntimos) | fotos-producto-ia (hecho) · ref12 |
| Mirar dentro con el cursor: lente de rayos X / térmica / interior, con interruptor de modo | dos imágenes alineadas + `mask-image: radial-gradient` que sigue al puntero (lerp); variantes con ffmpeg o edición IA | ligero | lente-revelado (hecho) · ref11 (X-ray / Thermal) |
| Lata o envase cilíndrico que gira sin 3D | etiqueta plana enrollada en canvas 2D (`u = asin(x/r)`) + sombreado y tapa; giro con scroll, arrastre o slider | ligero | envase-giratorio (hecho) · ref10 (en Figma: franja dentro de máscara) |
| Tarjetas en perspectiva (CSS 3D) | `perspective` + `rotateX/Y` + stagger | ligero | componentes-interactivos, `tarjeta-volteo.js` (hecho) · ref5 |
| Tilt de tarjeta con brillo | puntero → rotateX/Y + degradado radial de brillo | ligero | skill de animación instalada (`animate`) |
| Profundidad desde una foto (depth map) | foto + mapa de profundidad (Depth Anything, necesita Python/GPU para sacarlo; o un servicio externo) → shader de desplazamiento | medio | idea: foto-profundidad |

## D. 3D real (three.js / R3F) · módulo 3D y WebGL
Solo si el usuario debe girar el objeto libremente, configurarlo o tocarlo. Si solo se ve girar, frames de un render; si
es una lata o botella con etiqueta, `envase-giratorio`.

| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Producto 3D que gira con scroll y arrastre | glTF optimizado + entorno PBR + render bajo demanda | medio | escena-3d-gltf (hecho) · ref3 (casco nickho), ref13 (lata con giro libre) |
| Objeto que sigue al ratón | rotación objetivo + lerp | ligero sobre medio | escena-3d-gltf, patrones (hecho) · ref3 |
| Cámara que recorre una escena con el scroll | CatmullRomCurve3 + progreso | medio | escena-3d-gltf, patrones (hecho) · ref2 |
| Configurador (colores/materiales) | KHR_materials_variants o cambiar material | medio | escena-3d-gltf, optimizar (hecho) |
| Del mapa al edificio (ciudad → barrio → parcela → edificio resaltado) | MapLibre + ortofoto con licencia (PNOA en España) + extrusión OSM; cámara por paradas ligada al scroll, relevo a foto/render real | ligero-medio · 0 € en España | mapa-zoom-ubicacion (hecho) · ref8 (Reposé, satélite) |
| Mapa por niveles de imagen (ciudad → barrio → calle), ortofoto real o estilizada por IA | 3-5 imágenes anidadas en canvas 2D (`mapa-imagen.js`); marcadores, rutas y textos por código; arco entre dos sitios; `fotograma()` para clips IA | ligero (2-4 MB fijos) | mapa-zoom-ubicacion, `mapa-imagen.js` (hecho) · ref8, ref9 |
| Mapa "de arcilla" o ilustrado con ruta que se dibuja y tarjetas ancladas | niveles de imagen estilizados con IA sobre la ortofoto real + rutas y tarjetas de `mapa-imagen.js`; o MapLibre con estilo propio de extrusión clara y capa `line` animada | ligero-medio | mapa-zoom-ubicacion, `mapa-imagen.js` + ideas-ref9 (hecho) · ref9 |
| Corte circular del suelo que enseña el subsuelo (metro, cimientos) / dolly zoom | three.js con stencil/clipping; FOV animado | pesado | idea · ref9 |
| Gama de latas: slider de sabores; carrusel orbital → foco → line-up | `envase-giratorio` + slider; carrusel orbital con varias instancias de glTF y GSAP timeline solo si hace falta giro libre en varios ejes | ligero (envase) · medio (3D) | envase-giratorio (hecho); carrusel orbital sin 3D: componentes-interactivos, `carrusel-orbital.js` (hecho); escena-3d-gltf, patrones (parcial) · ref7 (Ciao), ref10 |
| Vidrio/hielo con refracción | MeshPhysicalMaterial `transmission`, `ior`, `thickness`; drei MeshTransmissionMaterial | pesado | idea: materiales-premium · ref2 |
| Wireframe → sólido / bloques que se dispersan | dos materiales + uniform de progreso; instancias con offset | medio | idea · ref2 |
| Niebla/whiteout como transición | `scene.fog` animado + overlay; fuera de una escena 3D, una cortina blanca (`crearCortina`) | ligero | idea (3D) · revelados-y-transiciones (cortina, hecho) · ref2, ref16 |
| Postprocesado (bloom, aberración cromática, grano) | EffectComposer / pmndrs postprocessing | pesado | idea: postpro · ref2 |
| Escenas hechas en Spline | `@splinetool/runtime` (pesado; bueno para prototipos) | pesado | idea |

## E. Shaders y GPU · módulo 3D y WebGL
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Partículas que forman una figura (y se deshacen) | MeshSurfaceSampler → posiciones; GPGPU (GPUComputationRenderer) + curl noise | pesado | idea: particulas-gpgpu · ref2 (pingüino) |
| Imagen que se distorsiona al pasar / al hacer scroll | plano con shader de desplazamiento (OGL o three) | medio | idea: imagen-shader · ref3 (sweet-tape vertex) |
| Fondo de degradado vivo / ruido | fragment shader a pantalla completa (OGL, ligero) | medio | idea: fondo-shader |
| Transición líquida entre imágenes | mezcla de texturas con mapa de desplazamiento | medio | idea |
| Cursor con estela de imágenes (image trail) | pool fijo de `<img>` + Web Animations; solo con ratón, composición estática en táctil y reduced-motion | ligero | rastro-cursor (hecho) · ref13 |
| Cursor con estela metaball | canvas 2D o shader | ligero-medio | idea |

## F. Tipografía cinética · base
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Reveal por líneas/palabras con máscara | `crearLineas` (texto plano) o SplitText (`mask:'lines'`) + `yPercent` stagger si hay marcado | ligero | revelados-y-transiciones, `crearLineas` (hecho) · ref1, ref3 (era), ref12 |
| Título que se recorta al cambiar (slider) | máscara `overflow: clip` + salida/entrada en `xPercent`/`yPercent` | ligero | envase-giratorio, patrones (hecho) · ref4, ref10 |
| Contador que sube | `gsap.to(obj,{v})` o ligado al progreso + `textContent` redondeado, `tabular-nums` | ligero | scroll-frames, patrones HUD (hecho) · ref3, ref11, ref15 |
| Sello/insignia giratoria | SVG `textPath` + rotación ligada al scroll | ligero | idea · ref3 (era) |
| Texto gigante que se escala/rellena | `scale`/`clip-path` con scrub | ligero | idea · ref12 (serif que se parte hacia las esquinas) |
| Marquesina infinita con velocidad del scroll | duplicar pista + `x` modulado por la velocidad de Lenis | ligero | muro de reseñas: componentes-interactivos, `resenas-3d.js` (hecho); marquesina de texto: skill de animación instalada (`animate`) |

## G. Transiciones y layout · base
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Slider de producto con elemento compartido | GSAP Flip o View Transitions API (`view-transition-name`) | ligero | revelados-y-transiciones, patrones.md (hecho) · ref4 |
| Slider de sabores: la lata gira y cambian a la vez fondo, título gigante detrás, frutas y texto | `envase-giratorio` + variables CSS + título en máscara + frutas con alfa y parallax; cambio de etiqueta a mitad de giro | ligero | envase-giratorio, patrones (hecho) + capas-alfa · ref10, ref4 |
| Cambio de color de fondo por sección o variante | ScrollTrigger `onEnter` o el slider → variables CSS | ligero | envase-giratorio, patrones (hecho) · ref4, ref10 |
| Cortina que cambia de escena sin corte visible | un panel entra, cubre y sale; el contenido cambia en `alCubrir` | ligero | revelados-y-transiciones, `crearCortina` (hecho) · ref16 |
| Revelado de imagen en rejilla (por bloques) | capa de celdas del color del fondo que se abren por orden (escalera, centro, filas, azar) | ligero | revelados-y-transiciones, `crearRejilla` (hecho) · ref13 |
| Zoom 2D a un punto de una imagen grande, con relevo a una imagen de detalle | escala logarítmica hacia un rectángulo de la imagen; fundido final a la toma de detalle | ligero · € imagen IA si hay que pedir la toma cercana | revelados-y-transiciones, `crearZoomA` (hecho) · ref14 |
| Imagen o tarjeta que crece hasta pantalla completa | View Transitions de mismo documento, o GSAP Flip con scrub; `clip-path`/`scale` | ligero | revelados-y-transiciones, patrones.md (hecho) · ref3 (era) |
| Transiciones entre páginas | View Transitions entre documentos (`@view-transition { navigation: auto; }`) o Barba/Next | ligero | revelados-y-transiciones, patrones.md (hecho) |
| Preloader con progreso real | progreso de frames/modelo (callbacks de los motores) | ligero | idea · ref3 (contador) |

## H. Sonido · base
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Sonido ambiente con interruptor | `<audio>` solo tras gesto, interruptor visible, apagado por defecto | ligero | idea: sonido · ref1, ref11 ("Sound off", el crujido) |
| Sonidos de interfaz ligados al scroll | Web Audio, volumen/filtro por progreso | ligero | idea |

## I. Microinteracciones · base
| Efecto | Cómo | Coste | Skill / ref |
|---|---|---|---|
| Botón magnético | puntero → translate con lerp, solo hover | ligero | skill de animación instalada (`animate`) |
| Cursor personalizado contextual | div con `mix-blend-mode` y estados | ligero | skill de animación instalada (`animate`) |
| Hover que revela imagen | fotos que salen en el puntero: `rastro-cursor`; otra versión de la misma imagen bajo el cursor: `lente-revelado` | ligero | rastro-cursor, lente-revelado (hecho) · ref11, ref13 |

## Repos y librerías que nombran los vídeos
- Del vídeo ref3 (Sanjai Builds):
  - nateherkai/scroll-craft
  - greensock/gsap-skills
  - iart-ai/webgl-animation-skills
  - iart-ai/web-animation-skills
  - MengTo/Skills
  - anthropics/skills (frontend-design)
  - mrdoob/three.js
  - darkroomengineering/lenis
  - pmndrs/drei
- Detectados en las webs analizadas: GSAP (ScrollTrigger, SplitText, Flip), Lenis, three.js / R3F, Webflow, Next.js.
- Igloo Inc (ref2) además usa técnicas de GPGPU, MeshSurfaceSampler y postprocesado.

## Combinaciones que funcionan (ejemplos, no plantillas)
- **Producto físico pequeño** (reloj, perfume, zapatilla): hero con capas + **frames** del giro + 3D vivo solo si el usuario
  debe girarlo. Para un catálogo, la estantería en una imagen grande con **zoom a un punto** y relevo al detalle (ref14).
- **Comida y bebida**: hero con ingredientes flotando (fotos con alfa en capas) + **frames** del vertido o el montaje +
  slider de sabores con la **lata que gira** (ref10). Para un producto con interior que vende (pan, chocolate, fruta): el
  **producto por dentro** en tramos + HUD + **lente de rayos X** (ref11). Para contar un proceso (café, vino): 3-4 clips IA
  con la misma luz y fondo (ref15).
- **Lugar** (restaurante, hotel, tienda): **frames** de fly-through de la entrada + fotos con revelados (rejilla, líneas,
  cortinas) + tarjetas CSS 3D. Para inmobiliaria o resorts, vuelo multiescala (ref7), **del mapa al edificio** con mapa real
  (ref8) o **mapa por niveles de imagen** (`mapa-zoom-ubicacion`) + plantas con capas.
- **Estudio, interiorismo, portfolio**: solo fotos con la misma luz + revelados por líneas y `clip-path` + parallax suave
  (ref12); rastro de fotos en el cursor para la portada (ref13).
- **Cosmética y e-commerce**: **frames** del producto que se abre (tapa, flor, gota) que aterrizan en la ficha con precio y
  botón (ref6); antes/después con el scroll; producto que levita sobre su sombra.
- **Gama de bebidas o variantes**: `envase-giratorio` + slider de sabores + frutas con alfa (`parallax-capas`/`capas-alfa`);
  3D real (carrusel orbital → foco → line-up, ref7) solo si hay giro libre en varios ejes.
- **Narrativa por escenas**: una frase por escena, escenas separadas por cortinas (`crearCortina`) y HUD fino (ref16).
- **Marca tecnológica o abstracta**: **3D real** con shaders y partículas + tipografía cinética (solo escritorio en el pico,
  con póster en móvil).
