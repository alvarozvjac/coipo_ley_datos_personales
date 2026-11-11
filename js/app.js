/* CON012 · sesión simulada, barra y enrutamiento por perfil. */
"use strict";

let SESION = null, vista = "inicio";
const VISTAS = {
  solicitante: { inicio: () => vPagina(), pagina: () => vPagina(), solicitud: () => vSolicitud(), acuse: () => vAcuse(), mis: () => vMis() },
  interno: { inicio: () => vInicioInterno(), casos: () => vCasos(), registrar: () => vRegistrar(), calendario: () => vCalendario(), reportes: () => vReportes() },
  fiscalia: { inicio: () => vInicioInterno(), casos: () => vCasos(), calendario: () => vCalendario(), reportes: () => vReportes() },
  delegado: { inicio: () => vInicioInterno(), casos: () => vCasos(), calendario: () => vCalendario(), reportes: () => vReportes(), bitacora: () => vBitacora() },
  admin: { inicio: () => vInicioInterno(), casos: () => vCasos(), calendario: () => vCalendario(), reportes: () => vReportes(), responsables: () => vResponsables(), parametros: () => vParametros(), bitacora: () => vBitacora() }
};
const grupo = () => !SESION ? null : ["solicitante", "admin", "delegado", "fiscalia"].includes(SESION.perfil) ? SESION.perfil : "interno";

function pintarLogin() {
  const li = u => `<li><button type="button" class="l-usuario" data-u="${u.id}">${ico(PERFILES[u.perfil].ico)}<span><b>${esc(PERFILES[u.perfil].n)}</b><br><span class="peq tenue">${esc(u.cargo)}</span></span>${ico("flecha", "ico fin")}</button></li>`;
  $("#l-externo").innerHTML = USUARIOS.filter(u => u.perfil === "solicitante").map(li).join("");
  $("#l-interno").innerHTML = USUARIOS.filter(u => u.perfil !== "solicitante").map(li).join("");
  $$("#login [data-u]").forEach(b => b.onclick = () => entrar(b.dataset.u));
}
function entrar(id) {
  SESION = U[id]; document.body.classList.remove("sin-sesion"); $("#login").hidden = true;
  tostada(SESION.perfil === "solicitante" ? "Sitio público de conaf.cl (simulado)" : "Sesión de prueba: " + PERFILES[SESION.perfil].n + " · " + SESION.cargo);
  ir("inicio");
}
function salir() { SESION = null; cerrarCapa(); document.body.classList.add("sin-sesion"); $("#login").hidden = false; $("#vista").innerHTML = ""; try { history.replaceState(null, "", location.pathname); } catch (e) { } window.scrollTo(0, 0); }

function pintarBarra() {
  const p = PERFILES[SESION.perfil], ini = p.n.split(" ").filter(Boolean);
  $("#rol-chip").innerHTML = ico(p.ico) + esc(p.n);
  $("#quien").innerHTML = `<span class="avatar" aria-hidden="true">${esc((ini[0][0] + (ini[ini.length - 2] || ini[1] || " ")[0]).toUpperCase())}</span><span class="qtxt"><b>${esc(p.n)}</b><span>${esc(SESION.cargo)}</span></span>`;
}
function ir(v) {
  const g = VISTAS[grupo()];
  vista = g[v] ? v : "inicio";
  try { history.replaceState(null, "", "#" + vista); } catch (e) { }
  render(); try { window.scrollTo(0, 0); } catch (e) { }
  $("#vista").focus({ preventScroll: true });
}
function render() {
  pintarBarra();
  const V = $("#vista");
  V.innerHTML = VISTAS[grupo()][vista]();
  postAccesos();
  $$("#vista [data-ir]").forEach(b => b.onclick = () => ir(b.dataset.ir));
  (POST[vista] || (() => { }))();
}
$("#btn-salir").onclick = salir;
const irInicio = () => { if (SESION) { cerrarCapa(); ir("inicio"); } };
$("#app-home").addEventListener("click", irInicio);
$("#app-home").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); irInicio(); } });
$("#f-hoy").textContent = fLarga(HOY);
pintarLogin();
$("#login").hidden = false;
