// Cargador de enlaces con nombre (renuevasmart.com/c/<tipo>-<cliente>/#clave).
// Descifra en el navegador los datos guardados en la página (la clave viaja solo en el #,
// nunca llega al servidor) y muestra el documento real con esos datos ya cargados.
(async () => {
  const msg = document.getElementById('msg');
  const falla = (texto) => { msg.textContent = texto; };
  try {
    const b64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
    const clave = location.hash.slice(1);
    if (!clave) return falla('Este enlace está incompleto. Pedí que te lo vuelvan a enviar.');
    const datos = b64(JSON.parse(document.getElementById('datos').textContent));
    const llave = await crypto.subtle.importKey('raw', b64(clave), 'AES-GCM', false, ['decrypt']);
    const plano = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: datos.slice(0, 12) }, llave, datos.slice(12));
    const ficha = JSON.parse(new TextDecoder().decode(plano));
    const html = await (await fetch('/' + ficha.doc)).text();
    const params = new URLSearchParams(ficha.params).toString();
    const inicio = '<base href="/"><script>window.RS_PARAMS=' + JSON.stringify(params).replace(/</g, '\\u003c') + ';<\/script>';
    // con <base href="/"> los enlaces "#ancla" apuntarían a la home: se resuelven a mano
    const anclas = '<script>document.addEventListener("click",function(e){var a=e.target.closest("a[href^=\\"#\\"]");if(!a)return;var t=document.querySelector(a.getAttribute("href"));if(t){e.preventDefault();t.scrollIntoView();}});<\/script>';
    const salida = html.replace(/<head>/i, '<head>' + inicio).replace(/<\/body>/i, anclas + '</body>');
    document.open();
    document.write(salida);
    document.close();
  } catch (e) {
    falla('No pudimos abrir este enlace. Revisá que esté completo o pedí que te lo vuelvan a enviar.');
  }
})();
