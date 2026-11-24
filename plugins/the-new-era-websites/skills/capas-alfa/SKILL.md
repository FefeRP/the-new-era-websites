---
name: capas-alfa
description: Sacar el fondo transparente de una imagen o de un vídeo y servirlo con alfa en la web (stacked MP4, WebM, frames WebP, PNG), con el texto pasando por detrás del sujeto. «fondo transparente», «quitar el fondo del vídeo», «chroma key», «transparent video», «text behind subject». NO para mover capas con el scroll (parallax-capas) ni para generar las piezas (recursos-imagen-ia).
license: MIT
version: 1.3.1
---

# Capas con alfa: elementos aislados que se mueven sobre la web

> **En NEW ERA:** módulo **Assets de IA (foto, alfa y capas)** (`new-era/references/modulos/assets-ia.md`): la maestra la carga cuando ese módulo está activo en el brief. Usada sola, funciona igual.

Muchos momentos "imposibles" son un elemento aislado (un splash, un producto, humo, una persona recortada) moviéndose
por encima del fondo y del texto. Si el elemento está **quieto**, es una foto con alfa que el código mueve (parallax,
zoom, máscara): barato y nítido. Solo si **tiene que moverse por sí mismo** (el líquido cae, el humo sube) hace falta
vídeo con alfa. Antes de nada, mira la matriz de `pedir-assets-ia` (`references/matriz-medio-por-elemento.md`).

## Antes de programar (obligatorio)
El código de esta skill se monta dentro de un proyecto: no se escribe de memoria (regla 6 de `new-era`; protocolo en
`new-era/references/codigo-y-plataforma.md`).
- **`find-docs`** (cárgala con `Skill`): lee la versión en el `package.json` y consulta en esa versión three.js o WebGL si se escribe código propio alrededor de `video-alfa.js` antes de
  usar o cambiar su API. En Next.js, además, cómo se monta en un componente de cliente y se desmonta con `destruir()`.
- **`modern-web-guidance:modern-web-guidance`** (con `Skill`): busca y aplica las guías de vídeo diferido y en silencio, formatos de vídeo e imagen, póster para el LCP, reduced-motion.
- Apunta cada consulta en `BRIEF.md` («Documentación consultada»).

## Pasos
1. **Decide el medio** (foto con alfa, vídeo con alfa o frames con alfa) y el **destino**: bucle decorativo, avance con el
   scroll o capa quieta con parallax. Tabla de formatos en [references/formatos-alfa.md](references/formatos-alfa.md).
2. **Pide el asset ya preparado para recortar** ([references/pedir-aislado.md](references/pedir-aislado.md)):
   - imagen: con alfa nativo (gpt-image-1.5/2.5, Ideogram Transparent, Seedream 5) o sobre un fondo liso elegido según el
     sujeto (verde, magenta, negro, blanco);
   - cristal, líquido o humo semitransparente: **la misma imagen sobre negro y sobre blanco** (edición "only change the
     background") → alfa exacto con `--modo diferencia`;
   - vídeo: sobre fondo liso con la imagen de inicio también sobre ese fondo; lo luminoso, sobre negro puro.
   Presupuesta antes con `pedir-assets-ia` (recorte por API: 0,006-0,018 $ por imagen; vídeo con BiRefNet ~0,001 $).
3. **Saca el alfa** con `scripts/alfa.mjs`:
   ```bash
   node scripts/alfa.mjs --entrada splash.mp4 --modo croma --salida public/alfa/splash          # fondo de color
   node scripts/alfa.mjs --entrada humo.mp4 --modo negro --salida public/alfa/humo               # luminoso sobre negro
   node scripts/alfa.mjs --modo diferencia --negro n.png --blanco b.png --salida public/capas/vaso   # semitransparente
   node scripts/alfa.mjs --entrada clip.mp4 --modo mascara --mascara mate.mp4 --salida …          # máscara del proveedor
   node scripts/alfa.mjs --entrada producto.png --modo croma --salida public/capas/producto --recortar
   ```
   Para scroll añade `--scrub` (keyframe cada 4 frames) o `--formatos frames` (WebP con alfa para `frame-scrubber`).
   Si la capa se puede dibujar por código (un sello, un trazo, confeti, un contador), no hace falta croma: `video-desde-html`
   la renderiza con alfa nativo (secuencia PNG) y aquí entra con `--modo ya-alfa`.
4. **Revisa** `hoja.png` (el elemento sobre cuadros, fondo oscuro y fondo claro) y los avisos de `alfa.json`: halo del color de
   fondo, fondo residual en el borde, fotogramas donde el recorte parpadea, par negro/blanco desalineado. Si falla, se arregla
   en el asset (más separación, fondo más liso), no subiendo umbrales a ciegas.
5. **Compón en la web** ([references/componer-capas.md](references/componer-capas.md)): orden de capas con `z-index`, texto
   entre fondo y sujeto, parallax con `capas-parallax.js` (skill `parallax-capas`) o GSAP, `scripts/video-alfa.js` para el
   vídeo, póster `<img>` con alfa como respaldo y LCP.
6. **Verifica** con `../new-era/scripts/verificar-scroll.mjs` (escritorio, móvil, reduced-motion) y mira las capturas: sin verde, sin
   rectángulos negros, sin bordes claros u oscuros alrededor del sujeto.

## Reglas
- **Lo quieto es foto.** Un splash congelado, un producto, un ingrediente: imagen con alfa + movimiento por código.
- **Formato universal:** stacked alpha (`apilado.mp4` + `video-alfa.js`). VP9 con alfa no va en Safari y HEVC con alfa solo se
  codifica en un Mac; el WebM queda como extra para `<video>` directo donde Safari no importe.
- **Lo luminoso sobre negro** (humo, chispas, polvo con luz, salpicadura blanca): `--modo negro`, sin recortar. Pide negro
  puro y comprueba la esquina: un gris levantado se ve como un rectángulo.
- **Fondo del croma según el sujeto:** verde si el sujeto no tiene verde; magenta o azul si es verde (plantas, botellas
  verdes); nunca el color de la marca. El fondo, liso, sin degradado, sin viñeta y sin sombra del sujeto.
- **Texto, logos y cifras siempre en HTML**, en su capa; nunca dentro del vídeo.
- Peso: capa con alfa ≤ 250 KB; vídeo con alfa ≤ 3 MB y ≤ 1280 px; frames con alfa ≤ 6 MB (la mitad en móvil).
- `prefers-reduced-motion`: el póster con alfa y nada en movimiento (los motores ya lo hacen).
- Tecnologías de recorte con licencia no comercial (p. ej. MatAnyone) no valen para clientes.

## Checklist
- [ ] Medio justificado (matriz) y coste apuntado en `plan.json` de `pedir-assets-ia`.
- [ ] `hoja.png` revisada: sin halo, sin restos de fondo, borde suave donde debe (pelo, cristal, humo).
- [ ] `alfa.json` sin avisos o con su motivo apuntado.
- [ ] Póster `<img>` con alfa en el HTML (LCP y respaldo); canvas con `aria-hidden="true"`.
- [ ] Capturas de escritorio, móvil y reduced-motion revisadas; 0 errores de consola.
- [ ] Pesos dentro del presupuesto (`alfa.json` → `pesos_kb`).

## Referencias
- [references/pedir-aislado.md](references/pedir-aislado.md): qué pedir a cada proveedor, qué fondo, prompts y coste.
- [references/formatos-alfa.md](references/formatos-alfa.md): formatos con alfa, navegadores, pesos y cuál usar.
- [references/componer-capas.md](references/componer-capas.md): maqueta de capas, texto entre capas, parallax, scroll.
- `scripts/alfa.mjs`: alfa de imagen o vídeo (croma, negro, blanco, diferencia, máscara) → apilado, WebM, frames, PNG, póster,
  hoja y métricas. Probado con verdad conocida en `pruebas/capas-alfa/` del repositorio (ver su LEEME).
- `scripts/video-alfa.js`: reproduce el apilado en WebGL (bucle, una vez o con el scroll), póster de respaldo, `destruir()`.
