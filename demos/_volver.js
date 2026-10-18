/* Insignia "Demo de Renueva Smart": solo aparece cuando la demo se abre fuera de la sala (no dentro del visor). */
(function () {
  if (window.top !== window.self) return;
  var a = document.createElement("a");
  a.href = "../muestras.html";
  a.textContent = "← Demo de Renueva Smart · Volver a la sala";
  a.setAttribute("style", "position:fixed;left:12px;bottom:12px;z-index:9999;background:#0b0c0e;color:#f5f3ee;font:600 13px/1 'Plus Jakarta Sans',system-ui,sans-serif;padding:11px 16px;border-radius:999px;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.3);border:1px solid #ff6a00");
  document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(a); });
})();
