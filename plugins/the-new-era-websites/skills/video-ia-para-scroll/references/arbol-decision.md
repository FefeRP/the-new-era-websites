# Árbol de decisión: qué modelo según el plano y el presupuesto

Precios del 21-11-2026 (API de Higgsfield, $/s sin audio; créditos de la web entre paréntesis por 5 s). Compruébalos
antes de presupuestar: `node scripts/estimar-higgsfield.mjs tabla` (API) o `estimate_video_cost` (MCP). Detalle de
cada modelo en `modelos/`.

## Paso 0: ¿hace falta vídeo?
```
¿El momento puede estar congelado (un splash, un producto quieto, un marco)?
  └─ sí → imagen (2 créditos) + movimiento por código (parallax-capas, revelados-y-transiciones). Fin.
¿Es logo, texto, interfaz o precio?
  └─ sí → por código siempre (o compuesto en la imagen final). Fin.
¿El usuario tiene que girarlo a su gusto?
  └─ sí → 3D real (escena-3d-gltf). Fin.
Si no → vídeo. Sigue.
```

## Paso 1: el tipo de plano
```
Intro hacia delante / recorrido continuo (entrar, atravesar, llegar)
  ├─ presupuesto normal ............ Seedance 2.5 · borrador 480p (0,59 $ / 15 cr) → final 720p (1,32 $ / 35 cr)
  ├─ barato o muchas pruebas ....... Wan 3.0 · 720p 0,38 $ por 5 s · 1080p 0,75 $
  ├─ con paradas concretas ......... Kling 4.0 con fotogramas intermedios · 1080p 0,94 $ por 5 s (18,75 cr)
  └─ más de 10 s ................... Seedance 2.5 en una toma (hasta 30 s) antes que encadenar
Revelado de logo / portada (termina en una imagen exacta)
  ├─ por defecto ................... Seedance 2.0 con imagen final · 5 s 1080p 2,15 $ (60 cr) · 720p 0,87 $
  ├─ barato ........................ Seedance 2.0 Mini (5 cr) o Veo 3.1 Lite con dos fotogramas (12 cr por 8 s)
  └─ si el logo tiene letras ....... el logo llega por código; el vídeo solo prepara la superficie
Fondo en bucle (autoplay, no scroll)
  ├─ por defecto ................... Kling 3.0 std, inicio = fin · 0,36 $ (7,5 cr)
  └─ repetible con semilla ......... Wan 2.7 · 0,38 $ a 720p
Transición entre secciones (A → B)
  ├─ A y B comparten portador ...... Kling O3 con inicio + fin · 1080p 0,43 $ (6,25 cr)
  ├─ cambio grande (arco 180°) ..... Veo 3.1 (web) o Seedance 2.5 con fin
  └─ no comparten nada ............. transición por código o puente generado (flujos.md)
Producto: arco / 360 / giro
  ├─ fidelidad al producto ......... Kling 3.0 pro / O3 · 0,43-0,48 $ a 1080p
  ├─ prueba del movimiento ......... Kling 2.5 Turbo · 0,16-0,26 $
  └─ luz de cine ................... Veo 3.1 (8 s, web)
Despiece / líquidos / física
  ├─ calidad ....................... Veo 3.1 o Kling 3.0 (prueba los dos barato)
  └─ barato ........................ Hailuo 2.3 / MiniMax H3 lite (0,24 $ 6 s)
Hero con poco movimiento ........... Seedance 2.0 5 s o Kling 3.0 std
La obra al revés (de lo terminado a su construcción, plantilla 14)
  └─ por defecto ................... Seedance 2.5 References con el render final · se invierte y se ata al scroll
```

## Paso 2: la resolución
```
¿Va a pantalla completa en escritorio?
  ├─ sí → 1080p (o 720p + reescalado ByteDance AIGC a 1080p: 1 crédito)
  └─ no (bloque mediano, móvil) → 720p basta
¿Es la prueba de estructura? → 480p siempre (Seedance: 2,2 veces más barato que 720p; Kling no baja de 720p)
```
La web se monta a ~1280-1600 px de ancho en escritorio y 540-720 px en móvil (`montaje-web.md`): 1080p da margen
para recortar; 4K casi nunca compensa en scroll.

## Paso 3: el presupuesto de un proyecto
| Web | Clips | Camino | Total aproximado |
|---|---|---|---|
| Landing con intro | 1 intro + 1 bucle | Seedance 2.5 borrador + final 720p; Kling 3.0 std bucle | ~2,3 $ (≈ 60 créditos) |
| Landing de producto | intro + 360 + revelado de logo | Seedance 2.5 720p + Kling O3 1080p + Seedance 2.0 720p | ~3 $ |
| Web de servicio | 2 bucles de fondo | Kling 3.0 std | ~0,7 $ |
| Recorrido inmobiliario | 15 s con 3 paradas | Kling 4.0 1080p 15 s + prueba Flash | ~3,3 $ |
Suma un 50-100 % de margen para reintentos: el coste real es **por clip aceptado**, no por clip generado.

## Reglas que cambian la elección
- **¿Necesitas fin?** Turbo de Kling 3.0, Kling 4.0 Flash, Kling 2.5/2.6, Wan 2.6, Grok y Hailuo **no tienen fin**.
- **¿Necesitas repetir un resultado?** Solo Wan (semilla + negativo), Qwen y Soul en imagen.
- **¿Hay letras?** Ningún modelo: por código.
- **¿Una cadena de clips?** No mezcles modelos dentro de la misma cadena [1].
- **¿Higgsfield con plan de la web?** Los créditos de la web y el dinero de la API son dos bolsas distintas; las
  generaciones «ilimitadas» de los planes solo cuentan en la web, no en el MCP ni en la API.

## Fuentes
1. higgsfield-ai/skills, `higgsfield-websites/references/scroll-scrub.md` [leída entera]: https://github.com/higgsfield-ai/skills
2. Precios medidos con `POST /estimate` de la API de Higgsfield y `estimate_video_cost` del MCP el 21-11-2026.
