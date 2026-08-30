/* Renueva Smart — consentimiento de cookies + Google Analytics 4 (Consent Mode v2)
   Compartido por index.html, contacto.html y privacidad.html.
   Reemplazar GA_MEASUREMENT_ID por el ID real (formato G-XXXXXXXXXX) cuando esté creada
   la propiedad en analytics.google.com. */
(function () {
  var GA_MEASUREMENT_ID = 'G-GMLTHK21XM';
  var CONSENT_KEY = 'rs_consentimiento_cookies';

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

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(script);

  function aplicarConsentimiento(valor) {
    var otorgado = valor === 'aceptado';
    gtag('consent', 'update', {
      ad_storage: otorgado ? 'granted' : 'denied',
      ad_user_data: otorgado ? 'granted' : 'denied',
      ad_personalization: otorgado ? 'granted' : 'denied',
      analytics_storage: otorgado ? 'granted' : 'denied'
    });
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
      'transform:translateY(100%);transition:transform .35s ease;}',
      '.rs-cookie-banner--visible{transform:translateY(0);}',
      '.rs-cookie-texto{flex:1 1 320px;margin:0;font-size:13.5px;line-height:1.55;',
      'color:var(--color-text-secondary,#d9dce0);max-width:640px;}',
      '.rs-cookie-texto a{color:var(--color-text-primary,#f5f3ee);text-decoration:underline;}',
      '.rs-cookie-acciones{display:flex;gap:10px;flex-shrink:0;}',
      '.rs-cookie-btn{font-family:inherit;font-weight:800;font-size:13.5px;border-radius:999px;',
      'padding:10px 20px;cursor:pointer;white-space:nowrap;transition:background .15s ease,',
      'transform .15s ease,border-color .15s ease;}',
      '.rs-cookie-aceptar{border:none;color:var(--color-bg-primary,#0b0c0e);',
      'background:var(--color-brand,#ff6a00);}',
      '.rs-cookie-aceptar:hover{background:var(--color-brand-hover,#ff7a1a);transform:translateY(-1px);}',
      '.rs-cookie-rechazar{background:transparent;color:var(--color-text-primary,#f5f3ee);',
      'border:1.5px solid var(--color-border-strong,rgba(255,255,255,.18));}',
      '.rs-cookie-rechazar:hover{background:rgba(255,255,255,.06);}',
      '@media (max-width:560px){.rs-cookie-acciones{width:100%;}',
      '.rs-cookie-btn{flex:1;}}'
    ].join('');
    document.head.appendChild(estilo);

    banner = document.createElement('div');
    banner.className = 'rs-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Aviso de cookies');

    var privacidadHref = /\/contacto\.html$|\/privacidad\.html$/.test(location.pathname)
      ? 'privacidad.html'
      : 'privacidad.html';

    banner.innerHTML =
      '<p class="rs-cookie-texto">Usamos cookies de análisis para entender desde dónde nos visitan (por ejemplo, el país). ' +
      'Puedes aceptarlas o rechazarlas — no cambia nada más en la web. ' +
      '<a href="' + privacidadHref + '">Más información</a>.</p>' +
      '<div class="rs-cookie-acciones">' +
      '<button type="button" class="rs-cookie-btn rs-cookie-rechazar">Rechazar</button>' +
      '<button type="button" class="rs-cookie-btn rs-cookie-aceptar">Aceptar</button>' +
      '</div>';

    document.body.appendChild(banner);
    banner.querySelector('.rs-cookie-aceptar').addEventListener('click', function () { guardarYAplicar('aceptado'); });
    banner.querySelector('.rs-cookie-rechazar').addEventListener('click', function () { guardarYAplicar('rechazado'); });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('rs-cookie-banner--visible'); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var guardado = null;
    try { guardado = localStorage.getItem(CONSENT_KEY); } catch (e) {}
    if (guardado) {
      aplicarConsentimiento(guardado);
    } else {
      crearBanner();
    }
  });
})();
