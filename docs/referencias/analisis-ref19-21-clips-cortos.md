# ref19 y ref21 · Dos clips de 1,8 s (@deis.motion)

Los dos ficheros están completos (se reproducen enteros, sin errores), pero duran **1,83 s** y pesan unos 200 KB: solo
enseñan un momento de cada web. Análisis por fotogramas (cada 0,25 s, detalles ampliados) del 23-11-2026; Gemini no
tenía cuota para ellos.

## ref19 · Zapatilla en un mundo de nubes
- Una zapatilla flotando en un paisaje de nubes rosas, con el titular en **letras volumétricas** (infladas, como
  gominola o globo).
- Lo que se saca: **titular volumétrico** (catálogo F). Las letras nunca se generan con IA (deforma la tipografía):
  three.js `TextGeometry` con bisel y `MeshMatcapMaterial` si está el módulo 3D, o SVG con degradados o `text-shadow`
  apiladas sin él. El fondo de nubes sí puede ser una imagen IA.
- No se ve cómo se mueve ni cómo continúa: queda como idea.

## ref21 · Maqueta isométrica de un concepto
- Una ciudad isométrica de aspecto de arcilla que representa un concepto (cada edificio, un servicio), con mensajes
  cortos («Así, sí.», «Esta vez, que se quede.») y un **87 %** de avance arriba.
- Lo que se saca: **maqueta ilustrada de un concepto** (catálogo D): una imagen IA isométrica y las etiquetas por
  código (`mapa-imagen.js` o `<button>` en % de la imagen); paneo con el scroll y el % arriba; nada de texto dentro de
  la imagen.
- Es la misma familia que el mapa de arcilla de ref9, con el matiz de que aquí no es un lugar sino una idea.
