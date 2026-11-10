# Patrones de revelado y transición

Complementos de `revelados.js`. Soporte de navegadores revisado en octubre de 2026 (fuentes en
`docs/investigacion/04-webs-scroll-con-ia-2026.md` del repositorio).

## Tarjeta que crece a pantalla completa
Una tarjeta de una rejilla se abre y ocupa la pantalla (detalle de un producto, de un proyecto).

- **Dentro de la misma página, sin librerías:** View Transitions de mismo documento. El navegador hace la captura de
  antes y después y anima entre las dos; tú solo cambias el DOM.
  ```js
  const abrir = (tarjeta) => {
    tarjeta.style.viewTransitionName = 'detalle';
    const cambiar = () => { tarjeta.style.viewTransitionName = ''; mostrarDetalle(tarjeta); /* el detalle lleva view-transition-name: detalle */ };
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return cambiar();
    document.startViewTransition(cambiar);
  };
  ```
  ```css
  ::view-transition-group(detalle) { animation-duration: .6s; animation-timing-function: cubic-bezier(.2,.7,.2,1); }
  ```
  Disponible en Chrome, Edge, Safari 18+ y Firefox reciente; sin soporte, el cambio es instantáneo (no se rompe nada).
- **Ligado al scroll:** técnica FLIP con GSAP Flip (gratis): `Flip.getState(tarjeta)`, cambias la clase a
  `.a-pantalla-completa` y `Flip.from(estado, { scale: true })` dentro de un timeline con `scrub`.

## Entre páginas (cross-document)
```css
@view-transition { navigation: auto; }
```
Chrome 126+ y Safari 18.2+; Firefox todavía no. Basta con poner el mismo `view-transition-name` a la imagen de la lista y a
la de la página de destino. Sin soporte, navegación normal. Úsalo para webs de varias páginas (catálogo → ficha), no
como sustituto de una transición dentro del scroll.

## Animaciones CSS ligadas al scroll (sin JS)
Para revelados sencillos (fundido, subida, `clip-path`) en Chrome 115+ y Safari 26+; en Firefox va detrás de una
opción, así que **siempre dentro de `@supports`** y con el estado final como estilo base:
```css
.revela { opacity: 1; clip-path: inset(0); }              /* sin soporte: visible */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .revela {
      animation: revela linear both;
      animation-timeline: view();
      animation-range: entry 10% cover 40%;
    }
  }
}
@keyframes revela { from { opacity: 0; clip-path: inset(30% 0 0 0); } }
```
No sirve para secuencias de frames, para pinar con varias fases ni para sincronizar varias capas: ahí, GSAP.

## Texto entre capas
El titular por detrás del producto y por delante del fondo: tres capas (fondo, texto HTML, recorte con alfa del
producto). Cómo pedir y preparar el recorte, en `capas-alfa` (`references/componer-capas.md`). Combina bien con
`crearLineas` para la entrada del titular.

## Revelado de imagen con máscara de forma
`clip-path: circle()` o `inset(... round 24px)` animados desde el centro de interés de la foto, en vez de la rejilla.
Una línea con GSAP: `gsap.fromTo(img, { clipPath: 'circle(0% at 60% 40%)' }, { clipPath: 'circle(75% at 60% 40%)', scrollTrigger: { scrub: true } })`.

## Qué evitar
- Cortinas o rejillas a cada sección: cansan a la tercera. Una transición fuerte por capítulo.
- Animar `filter: blur()` sobre imágenes grandes (caro en móvil). Si hace falta desenfoque, una versión ya desenfocada
  de la imagen con un fundido de opacidad.
- Zoom 2D a más de ~4× sin relevo: se ve el pixelado. A partir de ahí, relevo a una imagen de detalle o frames.
