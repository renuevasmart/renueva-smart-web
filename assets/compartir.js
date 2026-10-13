/* Renueva Smart — botón "Compartir" (un solo botón que despliega las opciones).
   Uso: poner <div class="compartir" data-compartir></div> donde deba aparecer.
   - Comparte la URL canónica de la página y el texto del <h1>.
   - Son enlaces normales a cada red: no se carga ningún script ni cookie de terceros. */
(function () {
  var ICONOS = {
    compartir: '<path d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.2a3 3 0 0 0 0-1.4L16 7.2a3 3 0 1 0-.9-1.5l-7.1 4.2a3 3 0 1 0 0 4.2l7.2 4.2a2.9 2.9 0 1 0 2.8-2.2z"/>',
    wa: '<path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.3 14.96l-.3-.19-3.08.88.9-3-.2-.31A8.1 8.1 0 0 1 12.04 3.8zm-3 3.9c-.2 0-.5.07-.75.35-.26.28-.98.96-.98 2.34s1 2.71 1.14 2.9c.14.18 1.96 3.1 4.84 4.22 2.4.94 2.88.75 3.4.7.52-.05 1.68-.69 1.92-1.35.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.54-.33-.28-.14-1.68-.83-1.94-.92-.26-.1-.45-.14-.64.14-.19.28-.73.92-.9 1.1-.16.2-.33.22-.61.08-.28-.14-1.2-.44-2.28-1.4-.84-.75-1.41-1.68-1.58-1.96-.16-.28-.02-.43.12-.57.13-.12.28-.33.42-.5.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.5-.07-.14-.62-1.55-.87-2.1-.2-.5-.42-.5-.6-.5z"/>',
    li: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11.5H3zM9.75 9.75h3.83v1.57h.06c.53-1 1.84-2.07 3.78-2.07 4.04 0 4.78 2.66 4.78 6.12v5.88h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75v5.29h-4z"/>',
    x: '<path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78zm-1.08 16.15h1.7L7.4 4.75H5.58z"/>',
    fb: '<path d="M13.5 22v-8.2h2.76l.41-3.2H13.5V8.56c0-.93.26-1.56 1.59-1.56h1.7V4.14A22.6 22.6 0 0 0 14.3 4c-2.45 0-4.12 1.5-4.12 4.23v2.37H7.4v3.2h2.78V22z"/>',
    mail: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.3V17h16V7.3l-8 5.2zM5.4 7 12 11.3 18.6 7z"/>',
    copiar: '<path d="M10.6 13.4a1 1 0 0 1 0-1.4l3-3a3 3 0 0 1 4.3 4.2l-2 2a1 1 0 0 1-1.4-1.4l2-2a1 1 0 0 0-1.5-1.4l-3 3a1 1 0 0 1-1.4 0zm2.8-2.8a1 1 0 0 1 0 1.4l-3 3a3 3 0 0 1-4.3-4.2l2-2a1 1 0 0 1 1.4 1.4l-2 2a1 1 0 0 0 1.5 1.4l3-3a1 1 0 0 1 1.4 0z"/>'
  };

  function icono(nombre) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[nombre] + '</svg>';
  }

  function inyectarEstilos() {
    var estilo = document.createElement('style');
    estilo.textContent = [
      '.compartir{position:relative;display:inline-block;margin:28px 0;}',
      '.compartir-trigger,.compartir-item{display:flex;align-items:center;gap:10px;font-family:var(--font-ui,"Plus Jakarta Sans",sans-serif);',
      'font-weight:700;font-size:14px;cursor:pointer;text-decoration:none;}',
      '.compartir svg{width:17px;height:17px;fill:currentColor;flex-shrink:0;}',
      '.compartir-trigger{color:var(--color-text-secondary,#d9dce0);background:var(--color-bg-secondary,#151719);',
      'border:1px solid var(--color-border-default,rgba(255,255,255,.12));border-radius:999px;padding:10px 20px;',
      'transition:color .15s ease,border-color .15s ease,background .15s ease,transform .15s ease;}',
      '.compartir-trigger:hover,.compartir-trigger[aria-expanded="true"]{color:var(--color-text-primary,#f5f3ee);',
      'border-color:var(--color-brand,#ff6a00);background:var(--color-bg-tertiary,#25282c);}',
      '.compartir-trigger:active{transform:scale(.97);}',
      '.compartir-menu{position:absolute;left:0;top:calc(100% + 8px);z-index:30;min-width:220px;margin:0;padding:6px;list-style:none;',
      'background:var(--color-bg-secondary,#151719);border:1px solid var(--color-border-strong,rgba(255,255,255,.18));',
      'border-radius:16px;box-shadow:0 14px 36px rgba(0,0,0,.45);transform-origin:top left;',
      'opacity:0;transform:scale(.96) translateY(-4px);visibility:hidden;',
      'transition:opacity .15s ease-out,transform .15s ease-out,visibility 0s linear .15s;}',
      '.compartir-menu--arriba{top:auto;bottom:calc(100% + 8px);transform-origin:bottom left;transform:scale(.96) translateY(4px);}',
      '.compartir--abierto .compartir-menu{opacity:1;transform:none;visibility:visible;transition:opacity .15s ease-out,transform .15s ease-out,visibility 0s;}',
      '.compartir-item{width:100%;color:var(--color-text-secondary,#d9dce0);background:none;border:none;border-radius:10px;padding:10px 12px;text-align:left;',
      'transition:background .12s ease,color .12s ease;}',
      '.compartir-item:hover,.compartir-item:focus-visible{background:var(--color-bg-tertiary,#25282c);color:var(--color-text-primary,#f5f3ee);}',
      '@media (prefers-reduced-motion:reduce){.compartir-menu,.compartir-trigger{transition:none;}}'
    ].join('');
    document.head.appendChild(estilo);
  }

  function datosPagina() {
    var canonica = document.querySelector('link[rel="canonical"]');
    var h1 = document.querySelector('h1');
    return {
      url: canonica ? canonica.href : location.href.split('#')[0],
      titulo: (h1 ? h1.textContent : document.title).replace(/\s+/g, ' ').trim()
    };
  }

  function copiarAlPortapapeles(texto) {
    return new Promise(function (resolve, reject) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(resolve, function () { respaldo(); });
      } else {
        respaldo();
      }
      function respaldo() {
        var area = document.createElement('textarea');
        area.value = texto;
        area.setAttribute('readonly', '');
        area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(area);
        if (ok) resolve(); else reject();
      }
    });
  }

  function crear(contenedor) {
    var id = 'compartir-menu-' + Math.random().toString(36).slice(2, 8);

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'compartir-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', id);
    trigger.innerHTML = icono('compartir') + '<span>Compartir</span>';

    var menu = document.createElement('ul');
    menu.className = 'compartir-menu';
    menu.id = id;

    function enlace(nombre, texto, href) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'compartir-item';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.dataset.red = nombre;
      a.href = href;
      a.innerHTML = icono(nombre) + '<span>' + texto + '</span>';
      li.appendChild(a);
      menu.appendChild(li);
      return a;
    }

    var enlaces = [
      enlace('wa', 'WhatsApp', '#'),
      enlace('li', 'LinkedIn', '#'),
      enlace('x', 'X', '#'),
      enlace('fb', 'Facebook', '#'),
      enlace('mail', 'Correo', '#')
    ];
    enlaces[4].removeAttribute('target');

    var liCopiar = document.createElement('li');
    var botonCopiar = document.createElement('button');
    botonCopiar.type = 'button';
    botonCopiar.className = 'compartir-item';
    botonCopiar.innerHTML = icono('copiar') + '<span>Copiar enlace</span>';
    liCopiar.appendChild(botonCopiar);
    menu.appendChild(liCopiar);

    // Las URL se arman al abrir, por si el <h1> cambia de texto (variante regional).
    function actualizarEnlaces() {
      var d = datosPagina();
      var u = encodeURIComponent(d.url);
      var t = encodeURIComponent(d.titulo);
      enlaces[0].href = 'https://wa.me/?text=' + t + '%20' + u;
      enlaces[1].href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + u;
      enlaces[2].href = 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t;
      enlaces[3].href = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
      enlaces[4].href = 'mailto:?subject=' + t + '&body=' + u;
      return d;
    }

    function abierto() { return contenedor.classList.contains('compartir--abierto'); }

    function cerrar(devolverFoco) {
      contenedor.classList.remove('compartir--abierto');
      trigger.setAttribute('aria-expanded', 'false');
      if (devolverFoco) trigger.focus();
    }

    function abrir() {
      actualizarEnlaces();
      menu.classList.remove('compartir-menu--arriba');
      var caja = trigger.getBoundingClientRect();
      var alto = menu.offsetHeight;
      if (caja.bottom + alto + 16 > window.innerHeight && caja.top > alto + 16) {
        menu.classList.add('compartir-menu--arriba');
      }
      contenedor.classList.add('compartir--abierto');
      trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', function () { if (abierto()) cerrar(false); else abrir(); });

    botonCopiar.addEventListener('click', function () {
      var etiqueta = botonCopiar.querySelector('span');
      var url = datosPagina().url;
      copiarAlPortapapeles(url).then(function () {
        etiqueta.textContent = 'Enlace copiado';
        setTimeout(function () { etiqueta.textContent = 'Copiar enlace'; cerrar(false); }, 1200);
      }, function () {
        window.prompt('Copia el enlace:', url);
        cerrar(true);
      });
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) cerrar(false);
    });

    document.addEventListener('click', function (e) { if (abierto() && !contenedor.contains(e.target)) cerrar(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && abierto()) cerrar(contenedor.contains(document.activeElement));
    });
    contenedor.addEventListener('focusout', function (e) {
      if (abierto() && e.relatedTarget && !contenedor.contains(e.relatedTarget)) cerrar(false);
    });

    contenedor.appendChild(trigger);
    contenedor.appendChild(menu);
  }

  function iniciar() {
    var lugares = document.querySelectorAll('[data-compartir]');
    if (!lugares.length) return;
    inyectarEstilos();
    lugares.forEach(crear);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
