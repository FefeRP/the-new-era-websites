// video-alfa.js: reproduce un vídeo con transparencia en TODOS los navegadores ("stacked alpha": un MP4 H.264 normal con el
// color premultiplicado arriba y el alfa abajo, compuesto en WebGL). Lo genera alfa.mjs (apilado.mp4 + alfa.json + poster.webp).
// Técnica de Jake Archibald (https://jakearchibald.com/2024/video-with-transparency/): VP9 con alfa no va en Safari y HEVC con
// alfa solo se codifica en un Mac; esto va en Chrome, Safari, Firefox y Edge con un vídeo corriente. Sin dependencias.
//
//   import { crearVideoAlfa } from './video-alfa.js';
//   const splash = await crearVideoAlfa({ canvas, base: '/alfa/splash/', modo: 'bucle', poster: imgPoster });
//   // modo scroll (genera con alfa.mjs --scrub):
//   const s = await crearVideoAlfa({ canvas, base: '/alfa/splash/', modo: 'scroll' });
//   ScrollTrigger.create({ trigger, start: 'top bottom', end: 'bottom top', scrub: true, onUpdate: (st) => s.irA(st.progress) });
//   // al desmontar: splash.destruir();
//
// - El <canvas> se coloca y se ordena con CSS como cualquier capa (position, z-index, transform para el parallax).
// - poster: un <img> con poster.webp (alfa) que ya está en el HTML: es el LCP, el respaldo sin WebGL o sin vídeo (iOS en
//   ahorro de energía) y lo que se ve con prefers-reduced-motion. El motor lo oculta cuando pinta el primer fotograma.
// - Pausa fuera de la vista y con la pestaña oculta. Un solo dibujo por fotograma de vídeo (requestVideoFrameCallback).

export async function crearVideoAlfa({
  canvas,
  base,                 // carpeta con alfa.json (acaba en /)
  manifest = null,      // o el objeto alfa.json ya cargado
  src = null,           // o directamente la URL del apilado.mp4 (entonces hace falta { ancho, alto } en manifest o se mide)
  modo = 'bucle',       // 'bucle' | 'una-vez' | 'scroll' (scroll: el vídeo no se reproduce; irA(p) mueve currentTime)
  ajuste = 'contain',   // 'contain' | 'cover'
  poster = null,        // <img> de respaldo (se oculta al pintar)
  dprMax = 2,
  alTerminar = null,    // modo 'una-vez': callback al acabar
} = {}) {
  if (!canvas) throw new Error('video-alfa: falta canvas');
  if (base && !base.endsWith('/')) base += '/';
  const m = manifest ?? (base ? await (await fetch(base + 'alfa.json')).json() : {});
  const url = src ?? base + (m.ficheros?.apilado ?? 'apilado.mp4');
  const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const respaldo = (motivo) => {
    if (poster) poster.style.visibility = '';
    canvas.style.visibility = 'hidden';
    if (motivo) console.info('video-alfa: se queda el póster (' + motivo + ')');
    return { destruir() {}, irA() {}, video: null, respaldo: true };
  };
  if (menosMovimiento) return respaldo(''); // ni bucle ni scrub: el póster y el texto

  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return respaldo('sin WebGL');

  // --- vídeo oculto ---
  const video = document.createElement('video');
  video.muted = true; video.defaultMuted = true; video.playsInline = true;
  video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
  video.preload = 'auto'; video.crossOrigin = 'anonymous';
  video.loop = modo === 'bucle';
  video.src = url;

  // --- WebGL: un quad, una textura con el vídeo entero; arriba el color premultiplicado, abajo el alfa ---
  const vs = `attribute vec2 p; uniform vec2 esc; varying vec2 uv;
    void main(){ uv = vec2(p.x*0.5+0.5, 0.5-p.y*0.5); gl_Position = vec4(p*esc, 0.0, 1.0); }`;
  const fs = `precision mediump float; varying vec2 uv; uniform sampler2D tex; uniform float medio;
    void main(){
      vec3 c = texture2D(tex, vec2(uv.x, min(uv.y*0.5, 0.5-medio))).rgb;
      float a = texture2D(tex, vec2(uv.x, max(0.5+uv.y*0.5, 0.5+medio))).r;
      gl_FragColor = vec4(min(c, vec3(a)), a);
    }`;
  let prog, buf, tex, uEsc, uMedio;
  function iniciarGL() {
    const sh = (tipo, codigo) => {
      const s = gl.createShader(tipo); gl.shaderSource(s, codigo); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);
    buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    uEsc = gl.getUniformLocation(prog, 'esc'); uMedio = gl.getUniformLocation(prog, 'medio');
    gl.clearColor(0, 0, 0, 0);
  }
  try { iniciarGL(); } catch (e) { return respaldo('shader: ' + e.message); }

  let destruido = false, visible = true, pintado = false, perdido = false, rvfc = 0, raf = 0;
  const ancho = () => m.ancho || video.videoWidth;
  const alto = () => m.alto || video.videoHeight / 2;

  function ajustarTamano() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, dprMax);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  function pintar() {
    if (destruido || perdido || video.readyState < 2) return;
    ajustarTamano();
    const cw = canvas.width, ch = canvas.height, vw = ancho(), vh = alto();
    if (!vw || !vh) return;
    const sv = vw / vh, sc = cw / ch;
    // escala del quad en coordenadas de recorte: contain encoge el lado que sobra, cover lo agranda
    let ex = 1, ey = 1;
    if ((ajuste === 'contain') === (sv > sc)) ey = sc / sv; else ex = sv / sc;
    gl.viewport(0, 0, cw, ch);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.uniform2f(uEsc, ex, ey);
    gl.uniform1f(uMedio, 1 / Math.max(2, video.videoHeight || vh * 2)); // medio texel: que el color no lea la franja del alfa
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!pintado) { pintado = true; if (poster) poster.style.visibility = 'hidden'; canvas.style.visibility = ''; }
  }

  // bucle de dibujo mientras se reproduce: un dibujo por fotograma nuevo de vídeo
  const conRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
  function programar() {
    if (destruido) return;
    if (conRVFC) rvfc = video.requestVideoFrameCallback(() => { pintar(); programar(); });
    else raf = requestAnimationFrame(() => { pintar(); if (!video.paused) programar(); });
  }
  function reproducir() {
    if (modo === 'scroll' || destruido || !visible || document.hidden) return;
    const p = video.play();
    if (p) p.then(programar).catch(() => respaldo('el navegador no deja reproducir (ahorro de energía)'));
  }

  // --- scroll: currentTime según el progreso; se pinta al terminar cada búsqueda ---
  // Una sola búsqueda en vuelo; al acabar, si el scroll pidió otro tiempo mientras tanto, se va a ese. Nunca se compara con
  // currentTime (el navegador lo deja en el inicio del fotograma y eso provocaría un bucle de búsquedas).
  let progresoPendiente = 0, objetivo = -1, pedido = -1, buscando = false;
  function irA(progreso) {
    progresoPendiente = progreso;
    if (!video.duration || !Number.isFinite(video.duration)) return;
    const fps = m.fps || 24;
    const total = m.frames || Math.max(1, Math.round(video.duration * fps));
    objetivo = Math.round(Math.min(1, Math.max(0, progreso)) * (total - 1)); // índice de fotograma
    if (!buscando && objetivo !== pedido) buscar();
  }
  // se busca el CENTRO del fotograma: en la frontera exacta algunos navegadores enseñan el anterior
  const buscar = () => { buscando = true; pedido = objetivo; video.currentTime = (objetivo + 0.5) / (m.fps || 24); };
  const alBuscar = () => {
    pintar();
    buscando = false;
    if (objetivo !== pedido) buscar();
  };

  // --- eventos ---
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (modo === 'scroll') return;
    if (visible) reproducir(); else video.pause();
  }, { rootMargin: '25% 0px' });
  io.observe(canvas);
  const alVisibilidad = () => (document.hidden ? video.pause() : reproducir());
  document.addEventListener('visibilitychange', alVisibilidad);
  const ro = new ResizeObserver(() => { if (pintado && (video.paused || modo === 'scroll')) pintar(); });
  ro.observe(canvas);
  const alPerder = (e) => { e.preventDefault(); perdido = true; respaldo('contexto WebGL perdido'); };
  const alRecuperar = () => { perdido = false; try { iniciarGL(); canvas.style.visibility = ''; pintar(); } catch { /* se queda el póster */ } };
  canvas.addEventListener('webglcontextlost', alPerder);
  canvas.addEventListener('webglcontextrestored', alRecuperar);
  const alFinal = () => { pintar(); alTerminar?.(); };
  video.addEventListener('ended', alFinal);
  video.addEventListener('seeked', alBuscar);
  video.addEventListener('error', () => respaldo('no se pudo cargar ' + url));

  await new Promise((ok) => {
    if (video.readyState >= 2) return ok();
    video.addEventListener('loadeddata', ok, { once: true });
    video.addEventListener('error', ok, { once: true });
  });
  if (video.error) return respaldo('error de vídeo');
  if (modo === 'scroll') { irA(progresoPendiente); pintar(); } else reproducir();

  return {
    video,
    irA,
    pintar,
    destruir() {
      destruido = true;
      if (rvfc && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(rvfc);
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', alVisibilidad);
      canvas.removeEventListener('webglcontextlost', alPerder);
      canvas.removeEventListener('webglcontextrestored', alRecuperar);
      video.removeEventListener('ended', alFinal);
      video.removeEventListener('seeked', alBuscar);
      video.pause(); video.removeAttribute('src'); video.load();
      gl.deleteTexture(tex); gl.deleteBuffer(buf); gl.deleteProgram(prog);
    },
  };
}
