/* CON012 · sesión simulada, barra y enrutamiento por perfil. */
"use strict";

let SESION = null, vista = "inicio";
const VISTAS = {
  encargado: { inicio: () => vInicioInterno(), casos: () => vCasos(), registrar: () => vRegistrar(), calendario: () => vCalendario(), reportes: () => vReportes(), responsables: () => vResponsables(), parametros: () => vParametros(), bitacora: () => vBitacora() },
  solicitante: { inicio: () => vPagina(), pagina: () => vPagina(), solicitud: () => vSolicitud(), acuse: () => vAcuse(), mis: () => vMis() },
  interno: { inicio: () => vInicioInterno(), casos: () => vCasos(), registrar: () => vRegistrar(), calendario: () => vCalendario() },
  fiscalia: { inicio: () => vInicioInterno(), casos: () => vCasos(), calendario: () => vCalendario(), bitacora: () => vBitacora() },
};
const grupo = () => !SESION ? null : ["solicitante", "encargado", "fiscalia"].includes(SESION.perfil) ? SESION.perfil : "interno";

function pintarLogin() {
  const li = u => `<li><button type="button" class="l-usuario" data-u="${u.id}">${ico(PERFILES[u.perfil].ico)}<span><b>${esc(PERFILES[u.perfil].n)}</b><br><span class="peq tenue">${esc(u.cargo)}</span></span>${ico("flecha", "ico fin")}</button></li>`;
  // Los perfiles con una cuenta por sede se eligen con su selector de sede.
  const porSede = perfil => `<li><div class="l-usuario l-sede">${ico(PERFILES[perfil].ico)}<span><b>${esc(PERFILES[perfil].n)}</b><br><label class="peq tenue" for="ls-${perfil}">Sede</label><select id="ls-${perfil}" class="l-select">${USUARIOS.filter(u => u.perfil === perfil).map(u => `<option value="${u.id}">${esc(u.cargo)}</option>`).join("")}</select></span><button type="button" class="boton" data-entrar="${perfil}">Ingresar</button></div></li>`;
  $("#l-externo").innerHTML = USUARIOS.filter(u => u.perfil === "solicitante").map(li).join("");
  $("#l-interno").innerHTML = ["encargado", "fiscalia", "director", "gerencia"].map(porSede).join("");
  $$("#login [data-u]").forEach(b => b.onclick = () => entrar(b.dataset.u));
  $$("#login [data-entrar]").forEach(b => b.onclick = () => entrar($("#ls-" + b.dataset.entrar).value));
  $("#demo-reg").onclick = () => demo("Dirección Regional Biobío");
  $("#demo-of").onclick = () => demo("Oficina Central");
}
/* Demostración guiada: recorre un caso de ejemplo de una sede por sus perfiles, uno por paso. */
function demo(sede) {
  const i = SEDES.indexOf(sede);
  const caso = etapas => { const c = CASOS.find(x => x.sede === sede && etapas.includes(x.etapa)); return c ? c.num : null; };
  const pasos = [
    { t: "Persona solicitante", d: "Presenta la solicitud en el sitio público. La región del domicilio define la sede que la recibe.", u: "u1" },
    { t: "Encargado de Gestión", d: "Recibe, verifica identidad y deriva el caso al Área que trata los datos.", u: "enc" + i, e: ["recepcion", "derivacion"] },
    { t: "Unidad Jurídica", d: "Resuelve la admisibilidad y revisa jurídicamente la propuesta de respuesta.", u: "fis" + i, e: ["admisibilidad", "revision"] },
    { t: "Área que trata los datos", d: "Analiza los datos del caso y propone la respuesta.", u: "ger" + i, e: ["analisis"] },
    { t: "Director o directora", d: "Revisa y firma la respuesta de la sede.", u: "dir" + i, e: ["firma"] },
    { t: "Encargado de Gestión", d: "Envía la respuesta firmada y cierra el caso.", u: "enc" + i, e: ["respuesta"] }
  ];
  const lista = pasos.map((p, k) => `<li style="display:flex;justify-content:space-between;align-items:center;gap:var(--e-3);flex-wrap:wrap"><div><b>${k + 1}. ${esc(p.t)}</b><br><span class="peq">${esc(p.d)}</span></div><button type="button" class="boton secundario chico" data-demo="${k}">Ir a este paso</button></li>`).join("");
  cajon("Demostración · " + corta(sede), "Cada paso ingresa con su perfil y abre el caso de ejemplo de esa etapa, si existe en la sede.", `<ol style="list-style:none;padding:0;margin:0;display:grid;gap:var(--e-3)">${lista}</ol>`);
  $$("[data-demo]").forEach(b => b.onclick = () => {
    const p = pasos[+b.dataset.demo], num = p.e && caso(p.e);
    entrar(p.u); cerrarCapa();
    if (num) abrirCaso(num);
  });
}
function entrar(id) {
  SESION = U[id]; SESION.cu = false; document.body.classList.remove("sin-sesion"); $("#login").hidden = true;   // cada ingreso pide Clave Única de nuevo al elegir un trámite
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
