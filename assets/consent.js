/* Renueva Smart — consentimiento de cookies + Google Analytics 4 (Consent Mode v2)
   Compartido por todas las páginas públicas del sitio.
   - Google Analytics (gtag.js) NO se descarga hasta que el visitante acepta.
   - Si rechaza (o retira el consentimiento), se borran las cookies _ga* ya guardadas.
   - Cualquier elemento con el atributo data-rs-cookies reabre el aviso ("Configurar cookies"). */
(function () {
  var GA_MEASUREMENT_ID = 'G-GMLTHK21XM';
  var CONSENT_KEY = 'rs_consentimiento_cookies';
  var POLITICA_COOKIES = '/politica-cookies.html';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  // Consent Mode v2: por defecto, todo denegado hasta que el visitante elija.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  var analiticaCargada = false;

  // Solo se llama tras un "aceptado": hasta entonces no se descarga nada de Google.
  function cargarAnalitica() {
    if (analiticaCargada) return;
    analiticaCargada = true;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);
  }

  function borrarCookiesAnalitica() {
    var host = location.hostname;
    var partes = host.split('.');
    var dominios = [host, '.' + host];
    if (partes.length > 2) dominios.push('.' + partes.slice(-2).join('.'));
    var caducada = '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie.split(';').forEach(function (c) {
      var nombre = c.split('=')[0].trim();
      if (nombre === '_ga' || nombre === '_gid' || nombre.indexOf('_ga_') === 0) {
        document.cookie = nombre + caducada;
        dominios.forEach(function (d) { document.cookie = nombre + caducada + '; domain=' + d; });
      }
    });
  }

  function aplicarConsentimiento(valor) {
    var otorgado = valor === 'aceptado';
    gtag('consent', 'update', {
      ad_storage: otorgado ? 'granted' : 'denied',
      ad_user_data: otorgado ? 'granted' : 'denied',
      ad_personalization: otorgado ? 'granted' : 'denied',
      analytics_storage: otorgado ? 'granted' : 'denied'
    });
    if (otorgado) cargarAnalitica();
    else borrarCookiesAnalitica();
  }

  function guardarYAplicar(valor) {
    try { localStorage.setItem(CONSENT_KEY, valor); } catch (e) {}
    aplicarConsentimiento(valor);
    ocultarBanner();
  }

  var banner;

  function ocultarBanner() {
    if (banner) banner.classList.remove('rs-cookie-banner--visible');
  }

  function crearBanner() {
    var estilo = document.createElement('style');
    estilo.textContent = [
      '.rs-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:200;',
      'display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:18px;',
      'padding:18px clamp(20px,4vw,32px);background:var(--color-bg-secondary,#151719);',
      'border-top:1px solid var(--color-border-default,rgba(255,255,255,.12));',
      'font-family:var(--font-ui,"Plus Jakarta Sans",sans-serif);',
      'visibility:hidden;transform:translateY(100%);',
      'transition:transform .35s ease,visibility 0s linear .35s;}',
      '.rs-cookie-banner--visible{visibility:visible;transform:translateY(0);',
      'transition:transform .35s ease,visibility 0s;}',
      '.rs-cookie-texto{flex:1 1 320px;margin:0;font-size:13.5px;line-height:1.55;',
      'color:var(--color-text-secondary,#d9dce0);max-width:640px;}',
      '.rs-cookie-texto a{color:var(--color-text-primary,#f5f3ee);text-decoration:underline;}',
      '.rs-cookie-acciones{display:flex;gap:10px;flex-shrink:0;}',
      '.rs-cookie-btn{font-family:inherit;font-weight:800;font-size:13.5px;border-radius:999px;',
      'border:none;padding:10px 20px;cursor:pointer;white-space:nowrap;transition:background .15s ease,',
      'transform .15s ease;}',
      '.rs-cookie-aceptar{color:var(--color-bg-primary,#0b0c0e);',
      'background:var(--color-brand,#ff6a00);}',
      '.rs-cookie-aceptar:hover{background:var(--color-brand-hover,#ff7a1a);transform:translateY(-1px);}',
      '.rs-cookie-rechazar{color:var(--color-bg-primary,#0b0c0e);',
      'background:var(--color-text-primary,#f5f3ee);}',
      '.rs-cookie-rechazar:hover{background:#fff;transform:translateY(-1px);}',
      '@media (max-width:560px){.rs-cookie-acciones{width:100%;}',
      '.rs-cookie-btn{flex:1;}}'
    ].join('');
    document.head.appendChild(estilo);

    banner = document.createElement('div');
    banner.className = 'rs-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Aviso de cookies');

    banner.innerHTML =
      '<p class="rs-cookie-texto">Usamos cookies de análisis para entender desde dónde nos visitan (por ejemplo, el país). ' +
      'Puedes aceptarlas o rechazarlas — no cambia nada más en la web. ' +
      '<a href="' + POLITICA_COOKIES + '">Más información sobre cookies</a>.</p>' +
      '<div class="rs-cookie-acciones">' +
      '<button type="button" class="rs-cookie-btn rs-cookie-rechazar">Rechazar</button>' +
      '<button type="button" class="rs-cookie-btn rs-cookie-aceptar">Aceptar</button>' +
      '</div>';

    document.body.appendChild(banner);
    banner.querySelector('.rs-cookie-aceptar').addEventListener('click', function () { guardarYAplicar('aceptado'); });
    banner.querySelector('.rs-cookie-rechazar').addEventListener('click', function () { guardarYAplicar('rechazado'); });
  }

  // enfocar = true cuando lo abre el propio visitante desde "Configurar cookies".
  function mostrarBanner(enfocar) {
    if (!banner) crearBanner();
    void banner.offsetHeight; // fuerza el layout para que la transición arranque desde fuera de pantalla
    banner.classList.add('rs-cookie-banner--visible');
    if (enfocar) banner.querySelector('.rs-cookie-rechazar').focus();
  }

  window.rsAbrirCookies = function () { mostrarBanner(true); };

  document.addEventListener('click', function (e) {
    var disparador = e.target.closest ? e.target.closest('[data-rs-cookies]') : null;
    if (!disparador) return;
    e.preventDefault();
    mostrarBanner(true);
  });

  document.addEventListener('DOMContentLoaded', function () {
    var guardado = null;
    try { guardado = localStorage.getItem(CONSENT_KEY); } catch (e) {}
    if (guardado) {
      aplicarConsentimiento(guardado);
    } else {
      mostrarBanner(false);
    }
  });
})();
