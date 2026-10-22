/* Botón de tema: alterna entre el claro blanco y naranja (por defecto) y el
   oscuro (estilos en assets/tema.css). La elección se recuerda en este
   navegador; el script del <head> de cada página la aplica antes de pintar
   para que no parpadee. */
(function () {
  var raiz = document.documentElement;
  var boton = document.getElementById('tema-boton');
  var meta = document.querySelector('meta[name="theme-color"]');
  function pintar() {
    var claro = raiz.getAttribute('data-tema') === 'claro';
    if (meta) meta.setAttribute('content', claro ? '#ffffff' : '#0b0c0e');
    if (!boton) return;
    boton.setAttribute('aria-label', claro ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    boton.title = claro ? 'Modo oscuro' : 'Modo claro';
  }
  if (boton) {
    boton.addEventListener('click', function () {
      var claro = raiz.getAttribute('data-tema') !== 'claro';
      if (claro) raiz.setAttribute('data-tema', 'claro');
      else raiz.removeAttribute('data-tema');
      try { localStorage.setItem('rs-tema', claro ? 'claro' : 'oscuro'); } catch (e) {}
      pintar();
    });
  }
  pintar();
})();
