(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var WA = '34600000000';
  var MAIL = 'hola@example.com';

  /* menú móvil */
  var burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', nav).forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* blur-text en el H1 (palabra a palabra, conserva el <em>) */
  var h1 = $('#h1');
  (function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
          var s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.appendChild(s);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1) { split(n); }
    });
  })(h1);
  $$('.w', h1).forEach(function (w, i) { w.style.transitionDelay = (i * 0.09) + 's'; });
  setTimeout(function () { h1.classList.add('in'); }, 80);

  /* reveal al scroll (escalonado dentro de cada grupo) */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var sibs = $$('.reveal', e.target.parentNode);
      var idx = Math.max(0, sibs.indexOf(e.target));
      e.target.style.transitionDelay = Math.min(idx, 5) * 60 + 'ms';
      e.target.classList.add('in');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(function (el) { io.observe(el); });

  /* count-up */
  var fmt = function (v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  var co = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      var el = e.target, to = +el.dataset.to;
      if (reduce) { el.textContent = fmt(to); return; }
      var t0 = performance.now(), dur = 1700;
      (function step(t) {
        var k = Math.min(1, (t - t0) / dur);
        el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  $$('.count').forEach(function (el) { el.textContent = '0'; co.observe(el); });

  /* agenda: horarios según el día (L–V 9:00–21:00 · S 9:00–14:00) */
  var fecha = $('#fecha'), slots = $('#slots'), msg = $('#slots-msg');
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  fecha.min = tomorrow.getFullYear() + '-' + pad(tomorrow.getMonth() + 1) + '-' + pad(tomorrow.getDate());
  fecha.addEventListener('change', function () {
    slots.innerHTML = ''; slots.classList.remove('in');
    if (!fecha.value) { msg.textContent = 'Elige un día para ver los horarios disponibles.'; return; }
    var d = new Date(fecha.value + 'T12:00:00'), dow = d.getDay();
    if (dow === 0) { msg.textContent = 'Los domingos la clínica permanece cerrada. Elige otro día.'; return; }
    var last = dow === 6 ? 13 : 20;
    msg.textContent = 'Horas de inicio disponibles (confirmaremos tu cita en breve):';
    for (var h = 9; h <= last; h++) {
      var lab = document.createElement('label'); lab.className = 'slot'; lab.style.animationDelay = (h - 9) * 25 + 'ms';
      lab.innerHTML = '<input type="radio" name="hora" value="' + pad(h) + ':00"><span>' + pad(h) + ':00</span>';
      slots.appendChild(lab);
    }
    requestAnimationFrame(function () { slots.classList.add('in'); });
  });

  /* formulario → WhatsApp (o email) con el mensaje ya redactado */
  var form = $('#form'), err = $('#form-err'), ok = $('#form-ok');
  function dataOrError() {
    var f = form.elements, bad = [];
    ['nombre', 'tel', 'fecha'].forEach(function (n) {
      var v = f[n].value.trim();
      f[n].classList.toggle('invalid', !v);
      if (!v) bad.push(n);
    });
    if (!f.ok.checked) bad.push('ok');
    if (bad.length) {
      err.hidden = false;
      err.textContent = bad.indexOf('ok') > -1 && bad.length === 1
        ? 'Necesitamos que aceptes el tratamiento de tus datos para atender tu consulta.'
        : 'Faltan datos: nombre, teléfono y la fecha deseada.';
      ok.hidden = true; return null;
    }
    err.hidden = true;
    var hora = form.querySelector('input[name=hora]:checked');
    var d = new Date(f.fecha.value + 'T12:00:00');
    var fechaTxt = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    var lines = [
      'Hola, quisiera concertar una cita en Clínica Sanitos.',
      'Nombre: ' + f.nombre.value.trim(),
      'Teléfono: ' + f.tel.value.trim(),
      f.email.value.trim() ? 'Email: ' + f.email.value.trim() : '',
      'Motivo: ' + f.motivo.value,
      'Fecha deseada: ' + fechaTxt + (hora ? ' a las ' + hora.value : ''),
      f.msg.value.trim() ? 'Comentarios: ' + f.msg.value.trim() : ''
    ].filter(Boolean);
    return lines.join('\n');
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = dataOrError(); if (!t) return;
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
    ok.hidden = false;
  });
  $('#send-mail').addEventListener('click', function () {
    var t = dataOrError(); if (!t) return;
    location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Solicitud de cita') + '&body=' + encodeURIComponent(t);
    ok.hidden = false;
  });
})();
