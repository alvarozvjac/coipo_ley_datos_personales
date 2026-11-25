/* CON012 · gestión interna: inicio por perfil, casos, panel del caso, registro de la vía física, calendario y reportes. */
"use strict";

const misCasos = () => CASOS.filter(c => visibleParaUsuario(c, SESION));
const misTareas = () => misCasos().filter(c => tareaDe(c, SESION)).sort((a, b) => urgencia(a) - urgencia(b));
let FILTRO = { g: "tareas", q: "", via: "", der: "", sede: "" };
const conFiltro = g => () => { FILTRO = { g, q: "", via: "", der: "", sede: "" }; };

/* ---------- Inicio por perfil ---------- */
function vInicioInterno() {
  const u = SESION, p = u.perfil, mis = misCasos(), t = misTareas();
  const n = f => mis.filter(f).length;
  const sinR = mis.filter(sinResponsable).length, venc = mis.filter(c => abierto(c) && diasLegal(c) < 0).length;
  const textos = {
    director: "Propuestas de respuesta de su sede por revisar y firmar.",
    fiscalia: "Solicitudes de su sede: registro, admisibilidad y bloqueos, derivación, revisión jurídica (V°B°), respuesta y reclamos ante la Agencia. Además, responsables por etapa y sede, plazos internos, feriados, reportes y bitácora.",
    gerencia: "Casos derivados a su ámbito para localizar los datos y proponer la respuesta.",
  };
  const A = [];
  A.push({ t: p === "director" ? "Por firmar" : "Mis tareas", d: "Casos en los que le toca actuar, del más urgente al menos urgente.", ico: "lista", cta: "Ver tareas", v: "casos", pre: conFiltro("tareas"), n: t.length, principal: true, aviso: t.some(c => diasLegal(c) <= 2) });
  if (RECEPTOR.includes(p)) A.push({ t: "Registrar solicitud en formulario físico", d: "Ingrese un formulario físico recibido. El plazo corre desde la fecha de recepción en CONAF.", ico: "plus", cta: "Registrar", v: "registrar" });
  if (p === "fiscalia") A.push({ t: "Bloqueos por resolver", d: "Bloqueos temporales que se resuelven en " + PARAM.BLOQUEO + " días hábiles.", ico: "alerta", cta: "Ver bloqueos", v: "casos", pre: conFiltro("bloqueo"), n: n(bloqueoPendiente), aviso: true, nl: "bloqueos pendientes" });
  if (p === "fiscalia") A.push({ t: "Reclamos ante la Agencia", d: "Reclamos notificados por la Agencia: CONAF responde en " + PARAM.RECLAMO_RESP + " días corridos, prorrogables (art. 41 d).", ico: "balanza", cta: "Ver reclamos", v: "casos", pre: conFiltro("reclamos"), n: n(reclamoPendiente), aviso: true, nl: "reclamos por responder"});
  if (p === "fiscalia") {
    A.push({ t: "Plazos vencidos", d: "Casos abiertos con el plazo legal vencido: el titular puede reclamar ante la Agencia.", ico: "alerta", cta: "Ver vencidos", v: "casos", pre: conFiltro("vencidos"), n: n(c => abierto(c) && diasLegal(c) < 0), aviso: true, nl: "vencidos" });
    A.push({ t: "Casos sin responsable", d: "Casos detenidos porque la etapa no tiene responsable en su sede o ámbito.", ico: "alerta", cta: "Ver casos", v: "casos", pre: conFiltro("sin"), n: sinR, aviso: true, principal: true, nl: "casos sin responsable" });
    A.push({ t: "Responsables por etapa y sede", d: "Quién recibe, revisa, deriva, firma y responde en Oficina Central y en cada región.", ico: "equipo", cta: "Configurar", v: "responsables", n: celdasPorDefinir(), nl: "por definir" });
    A.push({ t: "Plazos internos y feriados", d: "Plazos por etapa (vacíos hasta que se definan), plazos legales y feriados.", ico: "reloj", cta: "Ver parámetros", v: "parametros" });
  }
  A.push({ t: p === "fiscalia" ? "Todos los casos" : "Casos de mi alcance", d: "Lista con filtros por estado, vía, derecho y sede.", ico: "doc", cta: "Ver casos", v: "casos", pre: conFiltro("todos"), n: venc || null, aviso: true, nl: "vencidos" });
  A.push({ t: "Calendario de vencimientos", d: "Vencimientos legales, bloqueos y plazos de antecedentes, día a día.", ico: "calendario", cta: "Abrir calendario", v: "calendario" });
  if (p === "fiscalia") A.push({ t: "Reportes", d: "Cifras del canal y planilla Excel mensual o anual, sin datos de los titulares.", ico: "grafico", cta: "Ver reportes", v: "reportes" });
  if (p === "fiscalia") A.push({ t: "Bitácora", d: "Registro de acciones sobre los casos y la configuración.", ico: "lista", cta: "Ver bitácora", v: "bitacora" });
  const amplio = p === "fiscalia";
  const urg = (amplio ? mis.filter(c => abierto(c) || reclamoPendiente(c)) : t).slice().sort((a, b) => urgencia(a) - urgencia(b)).slice(0, 4);
  return heroHTML(u.cargo, PERFILES[p].n, textos[p]) +
    `<h2 class="sec-tit">${ico("flecha")}¿Qué necesitas hacer?</h2>` + accesosHTML(A) +
    `<section class="panel"><header><h2>${amplio ? "Lo más urgente del canal" : "Lo más urgente para usted"}</h2></header><div class="cuerpo">${urg.length ? urg.map(filaTarea).join("") : `<p class="vacio-chico">No tiene casos pendientes.</p>`}</div></section>`;
}
/* ---------- Delegado de protección de datos: seguimiento nacional (reunión del 18-11-2026) ---------- */
// Cuenta un caso abierto en un solo tramo del semáforo, igual que la columna «Plazo legal» de la lista de casos.
const pl = (n, s) => n + " " + s + (n === 1 ? "" : "s");
const tramo = c => { const d = diasLegal(c); return d < 0 ? "vencido" : d <= 2 ? "urgente" : d <= 9 ? "semana" : "holgura"; };
function alertaSede(L) {
  const ab = L.filter(abierto), t = k => ab.filter(c => tramo(c) === k).length;
  return { ab: ab.length, holgura: t("holgura"), semana: t("semana"), urgente: t("urgente"), vencido: t("vencido"), bloq: L.filter(bloqueoPendiente).length, rec: L.filter(reclamoPendiente).length };
}
function chipSede(a) {
  if (a.vencido) return chip(pl(a.vencido, "vencido"), "c-malo", "✕");
  if (a.urgente || a.bloq || a.rec) return chip("Urgente", "c-malo", "▲");
  if (a.semana) return chip("Vence esta semana", "c-pend", "!");
  return a.ab ? chip("Con holgura", "c-disp", "●") : chip("Sin casos abiertos", "c-neu", "–");
}
function vInicioDelegado() {
  const todos = CASOS, nac = alertaSede(todos);
  const urg = todos.filter(c => abierto(c) || reclamoPendiente(c)).sort((a, b) => urgencia(a) - urgencia(b)).slice(0, 5);
  const A = [
    { t: "Todos los casos", d: "Las solicitudes de todas las sedes, con filtros por estado, vía, derecho y sede. Sólo lectura.", ico: "doc", cta: "Ver casos", v: "casos", pre: conFiltro("todos"), principal: true },
    { t: "Plazos vencidos", d: "Casos con el plazo legal vencido en cualquier sede: el titular puede reclamar ante la Agencia y hay riesgo de multa.", ico: "alerta", cta: "Ver vencidos", v: "casos", pre: conFiltro("vencidos"), n: nac.vencido, aviso: true, nl: "vencidos" },
    { t: "Calendario de vencimientos", d: "Vencimientos legales, bloqueos y plazos de antecedentes de todas las sedes.", ico: "calendario", cta: "Abrir calendario", v: "calendario" },
    { t: "Reportes", d: "Cifras nacionales del canal y planilla Excel, sin datos de los titulares.", ico: "grafico", cta: "Ver reportes", v: "reportes" },
    { t: "Bitácora", d: "Acciones sobre los casos y la configuración en todas las sedes.", ico: "lista", cta: "Ver bitácora", v: "bitacora" }
  ];
  const filas = SEDES.map(s => { const L = todos.filter(c => c.sede === s); return { s, a: alertaSede(L), n: L.length }; })
    .sort((x, y) => (y.a.vencido - x.a.vencido) || ((y.a.urgente + y.a.bloq + y.a.rec) - (x.a.urgente + x.a.bloq + x.a.rec)) || (y.a.semana - x.a.semana) || (y.a.ab - x.a.ab));
  const num = (v, malo) => `<td class="d num">${v ? (malo ? `<b>${v}</b>` : v) : `<span class="tenue">0</span>`}</td>`;
  return heroHTML(SESION.cargo, PERFILES.delegado.n, "Seguimiento de las solicitudes de todas las sedes: alertas de plazo por sede, casos, reportes y bitácora. Las sedes tramitan; usted supervisa y avisa cuando un caso se acerca a su vencimiento.") +
    `<div class="grid g-kpi" style="margin-bottom:var(--e-4)"><div class="kpi"><span class="k">Abiertos</span><span class="v">${nac.ab}</span></div><div class="kpi ${nac.vencido ? "alerta" : ""}"><span class="k">Vencidos</span><span class="v">${nac.vencido}</span></div><div class="kpi ${nac.urgente ? "alerta" : ""}"><span class="k">Urgentes · 2 días o menos</span><span class="v">${nac.urgente}</span></div><div class="kpi"><span class="k">Bloqueos y reclamos pendientes</span><span class="v">${nac.bloq + nac.rec}</span></div></div>
    <section class="panel" id="panel-sedes" style="margin-bottom:var(--e-4)"><header><div><h2>Alertas por sede</h2><span class="sub">Casos abiertos por tramo del plazo legal. Primero las sedes con casos vencidos o urgentes. Toque una sede para ver sus casos.</span></div></header>
    <div class="tabla-env solo-ancho"><table><thead><tr><th>Sede</th><th>Alerta</th><th class="d">Abiertos</th><th class="d">Con holgura</th><th class="d">Esta semana</th><th class="d">Urgentes</th><th class="d">Vencidos</th><th class="d">Bloqueos</th><th class="d">Reclamos</th></tr></thead>
    <tbody>${filas.map(({ s, a }) => `<tr class="clic" data-ir-sede="${esc(s)}" tabindex="0"><th scope="row">${esc(corta(s))}</th><td>${chipSede(a)}</td>${num(a.ab)}${num(a.holgura)}${num(a.semana)}${num(a.urgente, true)}${num(a.vencido, true)}${num(a.bloq, true)}${num(a.rec, true)}</tr>`).join("")}</tbody></table></div>
    <div class="lista-tel">${filas.map(({ s, a }) => `<button type="button" class="sol seleccionable" data-ir-sede="${esc(s)}"><div class="fila"><b>${esc(corta(s))}</b>${chipSede(a)}</div>${a.ab ? `<div class="meta"><span>${pl(a.ab, "abierto")}</span>${a.semana ? `<span>${a.semana} esta semana</span>` : ""}${a.urgente ? `<span><b>${pl(a.urgente, "urgente")}</b></span>` : ""}${a.vencido ? `<span><b>${pl(a.vencido, "vencido")}</b></span>` : ""}${a.bloq ? `<span><b>${pl(a.bloq, "bloqueo")}</b></span>` : ""}${a.rec ? `<span><b>${pl(a.rec, "reclamo")}</b></span>` : ""}</div>` : ""}</button>`).join("")}</div>
    <div class="leyenda">${chip("Con holgura · 10 días o más", "c-disp", "●")}${chip("Esta semana · 3 a 9 días", "c-pend", "!")}${chip("Urgente · 2 días o menos", "c-malo", "▲")}${chip("Vencido", "c-malo", "✕")}<span class="tenue peq">Días corridos hasta el vencimiento legal. Las alertas por correo al delegado están por definir.</span></div></section>
    <h2 class="sec-tit">${ico("flecha")}¿Qué necesitas revisar?</h2>` + accesosHTML(A) +
    `<section class="panel"><header><h2>Lo más urgente a nivel nacional</h2></header><div class="cuerpo">${urg.length ? urg.map(filaTarea).join("") : `<p class="vacio-chico">No hay casos abiertos.</p>`}</div></section>`;
}
function sedesDe(u) { return SEDES.filter(s => ["recibe", "deriva", "responde"].some(k => RESP[s][k] === u.id)); }
const filaTarea = c => `<div class="tarea"><span class="mono peq">${c.num}</span><div class="q">${accionPendiente(c)}<small>${c.derechos.map(k => DER[k]).join(", ")} · ${corta(c.sede)} · ${VIAS[c.via]}</small></div><div class="estado-linea">${reclamoPendiente(c) ? chip("Reclamo · responder hasta " + fF(venceReclamo(c)), "c-malo", "⚖") : bloqueoPendiente(c) ? chip("Bloqueo · vence " + fF(venceBloqueo(c)), "c-malo", "▲") : semaforo(c)}<button class="boton chico" type="button" data-caso="${c.num}">Abrir</button></div></div>`;
function accionPendiente(c) {
  if (reclamoPendiente(c)) return "Responder el reclamo ante la Agencia";
  if (bloqueoPendiente(c)) return "Resolver el bloqueo temporal";
  if (esperaAntecedentes(c)) return "Esperando antecedentes del titular";
  if (sinResponsable(c)) return "Sin responsable en " + ETAPA[c.etapa].n.toLowerCase();
  return { recepcion: c.identidad ? "Pasar a admisibilidad" : "Verificar identidad y registrar", admisibilidad: c.ant && c.ant.rec ? "Revisar los antecedentes aportados" : "Resolver la admisibilidad", derivacion: "Derivar al área que trata los datos", analisis: "Analizar y proponer la respuesta", revision: "Revisar la propuesta de respuesta", firma: "Firmar la respuesta", respuesta: "Enviar la respuesta y cerrar" }[c.etapa];
}
POST.inicio = () => {
  if (!SESION || SESION.perfil === "solicitante") return;
  enlazarCasos();
  $$("[data-ir-sede]").forEach(r => { const fn = () => { FILTRO = { g: "abiertos", q: "", via: "", der: "", sede: r.dataset.irSede }; ir("casos"); }; r.onclick = fn; r.onkeydown = e => { if (e.key === "Enter") fn(); }; });
};
function enlazarCasos() { $$("[data-caso]").forEach(b => b.onclick = e => { e.stopPropagation(); abrirCaso(b.dataset.caso); }); }

/* ---------- Casos ---------- */
function vCasos() {
  const base = misCasos();
  const G = [["tareas", "Mis tareas", base.filter(c => tareaDe(c, SESION)).length], ["todos", "Todos", base.length], ["abiertos", "Abiertos", base.filter(abierto).length], ["bloqueo", "Bloqueo pendiente", base.filter(bloqueoPendiente).length], ["antecedentes", "Requieren antecedentes", base.filter(esperaAntecedentes).length], ["sin", "Sin responsable", base.filter(sinResponsable).length], ["vencidos", "Vencidos", base.filter(c => abierto(c) && diasLegal(c) < 0).length], ["reclamos", "Reclamos ante la Agencia", base.filter(c => !!c.reclamo).length], ["cerrados", "Cerrados", base.filter(c => !abierto(c)).length]].filter(g => (g[2] > 0 || ["tareas", "todos", FILTRO.g].includes(g[0])) && !(SESION.perfil === "delegado" && g[0] === "tareas"));   // el delegado no tramita: no tiene tareas
  const fg = { tareas: c => tareaDe(c, SESION), todos: () => true, abiertos: abierto, bloqueo: bloqueoPendiente, antecedentes: esperaAntecedentes, sin: sinResponsable, vencidos: c => abierto(c) && diasLegal(c) < 0, reclamos: c => !!c.reclamo, cerrados: c => !abierto(c) }[FILTRO.g];
  const q = FILTRO.q.toLowerCase();
  const L = base.filter(fg).filter(c => (!FILTRO.via || c.via === FILTRO.via) && (!FILTRO.der || c.derechos.includes(FILTRO.der)) && (!FILTRO.sede || c.sede === FILTRO.sede) && (!q || (c.num + " " + c.detalle).toLowerCase().includes(q))).sort((a, b) => urgencia(a) - urgencia(b));
  const sedes = [...new Set(base.map(c => c.sede))];
  return volverHTML() + cab("Casos", "Ordenados por urgencia: primero los bloqueos pendientes y luego el plazo legal. El RUN se muestra enmascarado.", "") +
    filtrosHTML(G, FILTRO.g, "data-g") +
    `<div class="barra-herr" style="margin-top:var(--e-3)"><input type="search" id="c-q" placeholder="Buscar por número o detalle" value="${esc(FILTRO.q)}" aria-label="Buscar casos">
    <div class="acciones"><select id="c-via" aria-label="Vía"><option value="">Todas las vías</option>${Object.entries(VIAS).map(([k, v]) => `<option value="${k}" ${FILTRO.via === k ? "selected" : ""}>${v}</option>`).join("")}</select>
    <select id="c-der" aria-label="Derecho"><option value="">Todos los derechos</option>${DERECHOS.map(d => `<option value="${d.k}" ${FILTRO.der === d.k ? "selected" : ""}>${d.n}</option>`).join("")}</select>
    ${sedes.length > 1 ? `<select id="c-sede" aria-label="Sede"><option value="">Todas las sedes</option>${sedes.map(s => `<option ${FILTRO.sede === s ? "selected" : ""}>${s}</option>`).join("")}</select>` : ""}</div></div>
    <section class="panel">${L.length ? `<div class="tabla-env solo-ancho"><table><thead><tr><th>Caso</th><th>Ingreso · vía</th><th>Sede</th><th>Derecho(s)</th><th>Estado</th><th>Responsable</th><th>Plazo legal</th></tr></thead><tbody>${L.map(c => `<tr class="clic" data-caso="${c.num}" tabindex="0"><td class="mono">${c.num}</td><td class="num">${fF(c.ingreso)}<br><span class="tenue peq">${VIAS[c.via]}</span></td><td class="peq">${corta(c.sede)}</td><td>${c.derechos.map(k => DER[k]).join(", ")}</td><td>${chipEstado(c)}${bloqueoPendiente(c) ? "<br>" + chip("Bloqueo pendiente", "c-malo", "▲") : ""}</td><td class="peq">${quienTxt(c)}</td><td>${semaforo(c)}<br><span class="tenue peq num">${abierto(c) ? "vence " + fF(venceLegal(c)) : "cerrado " + fF(c.cierre.f)}</span></td></tr>`).join("")}</tbody></table></div>
    <div class="lista-tel">${L.map(c => `<button type="button" class="sol seleccionable" data-caso="${c.num}"><div class="fila"><span class="id">${c.num}</span>${semaforo(c)}</div><div class="estado-linea">${chipEstado(c)}${bloqueoPendiente(c) ? chip("Bloqueo pendiente", "c-malo", "▲") : ""}</div><div class="meta"><span>${c.derechos.map(k => DER[k]).join(", ")}</span><span>${corta(c.sede)}</span><span>${quienTxt(c)}</span></div></button>`).join("")}</div>` : vacio("Sin casos en este grupo", "Cambie el filtro o la búsqueda.")}
    <div class="leyenda">${chip("Con holgura · 10 días o más", "c-disp", "●")}${chip("Esta semana · 3 a 9 días", "c-pend", "!")}${chip("Urgente · 2 días o menos", "c-malo", "▲")}${chip("Vencido", "c-malo", "✕")}<span class="tenue peq">Días corridos hasta el vencimiento legal.</span></div></section>`;
}
POST.casos = () => {
  $$("[data-g]").forEach(b => b.onclick = () => { FILTRO.g = b.dataset.g; render(); });
  const q = $("#c-q"); q.oninput = () => { FILTRO.q = q.value; clearTimeout(q._t); q._t = setTimeout(() => { render(); const n = $("#c-q"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
  [["c-via", "via"], ["c-der", "der"], ["c-sede", "sede"]].forEach(([id, k]) => { if ($("#" + id)) $("#" + id).onchange = e => { FILTRO[k] = e.target.value; render(); }; });
  enlazarCasos(); $$("tr[data-caso]").forEach(r => r.onkeydown = e => { if (e.key === "Enter") abrirCaso(r.dataset.caso); });
};

/* ---------- Panel del caso ---------- */
function lineaEtapas(c) {
  const corte = c.cierre && ["No admitida", "Denegada"].includes(c.cierre.res); // se cerró en admisibilidad
  const i = c.etapa === "cerrado" ? (corte ? 2 : ETAPAS.length) : ETAPAS.findIndex(e => e.k === c.etapa);
  return `<div class="flujo" aria-label="Etapa del caso">${ETAPAS.map((e, k) => `<span class="${k < i ? "hecho" : k === i && c.etapa !== "cerrado" ? "actual" : ""}">${e.n}</span>`).join("")}<span class="${c.etapa === "cerrado" ? "actual" : ""}">Cerrado</span></div>`;
}
function abrirCaso(num) {
  const c = CASOS.find(x => x.num === num); if (!c) return;
  const u = SESION, e = ETAPA[c.etapa], vi = venceInterno(c), acotado = ["director", "gerencia"].includes(u.perfil);
  const avisos = [];
  if (sinResponsable(c)) avisos.push(`<div class="regla bl"><span class="ico">!</span><div><b>Sin responsable en «${e.n}»</b><span>${c.etapa === "analisis" && !c.ambito ? "El caso no tiene ámbito asignado." : `${esc(c.sede)} no tiene responsable para esta etapa${c.etapa === "analisis" ? " en el ámbito " + esc(AMB(c.ambito).n) : ""}.`} El caso no avanza hasta que la Unidad Jurídica de la sede lo asigne.${u.perfil === "fiscalia" ? ` <button class="boton secundario chico" type="button" data-ir-cfg>Asignar responsables</button>` : ""}</span></div></div>`);
  if (c.derechos.includes("portabilidad")) avisos.push(`<div class="regla av"><span class="ico">?</span><div><b>Portabilidad: procedencia por confirmar</b><span>Los arts. 21 y 23 de la Ley N° 21.719, que regulan los derechos ante órganos públicos, no mencionan la portabilidad (art. 9°). Consultar a Fiscalía antes de resolver.</span></div></div>`);
  if (reclamoPendiente(c)) avisos.push(`<div class="regla bl"><span class="ico">⚖</span><div><b>Reclamo ante la Agencia por responder</b><span>${esc(c.reclamo.folio)} · notificado el ${fF(c.reclamo.notif)} · responder a más tardar el ${fF(venceReclamo(c))} (art. 41 d).</span></div></div>`);
  if (c.bloq && c.bloq.agencia) avisos.push(`<div class="regla inf"><span class="ico">i</span><div><b>Rechazo del bloqueo comunicado a la Agencia</b><span>${fF(c.bloq.agencia)} (art. 11).</span></div></div>`);
  if (bloqueoPendiente(c)) avisos.push(`<div class="regla bl"><span class="ico">▲</span><div><b>Bloqueo temporal por resolver</b><span>Pedido el ${fF(c.bloq.pide)} · vence el ${fF(venceBloqueo(c))} (${PARAM.BLOQUEO} días hábiles). Mientras tanto no se tratan los datos indicados.</span></div></div>`);
  if (esperaAntecedentes(c)) { const ve = venceAntecedentes(c); avisos.push(`<div class="regla av"><span class="ico">?</span><div><b>Esperando antecedentes del titular</b><span>Pedidos el ${fF(c.ant.pide)}: «${esc(c.ant.que)}». Plazo hasta el ${fF(ve)}${ve < HOY ? " · vencido" : ""}. No suspende el plazo legal.</span></div></div>`); }
  if (c.ant && c.ant.rec) avisos.push(`<div class="regla inf"><span class="ico">i</span><div><b>Antecedentes aportados el ${fF(c.ant.rec)}</b><span>${esc(c.ant.resp || "Recibidos por la vía física.")}</span></div></div>`);
  if (abierto(c) && diasLegal(c) < 0) avisos.push(`<div class="regla bl"><span class="ico">✕</span><div><b>Plazo legal vencido el ${fF(venceLegal(c))}</b><span>El titular puede reclamar ante la Agencia.</span></div></div>`);
  const verRun = c._runVisto;
  const cuerpo = `${acotado ? `<div class="flujo" aria-label="Etapa del caso"><span class="actual">${e.n}</span></div>` : lineaEtapas(c)}${avisos.length ? `<div class="revision">${avisos.join("")}</div>` : ""}
    ${accionesHTML(c)}
    <div class="seccion"><h3>Solicitud</h3><dl class="ficha">
      <dt>Ingreso</dt><dd class="num">${fLarga(c.ingreso)} · ${VIAS[c.via]}${c.folio ? ` · número de registro <span class="mono">${esc(c.folio)}</span>` : ""}</dd>
      <dt>Sede</dt><dd>${esc(c.sede)}</dd><dt>Quién solicita</dt><dd>${CALIDAD[c.calidad]}</dd>
      <dt>Titular</dt><dd>${esc(c.tit.nom)} · <span class="mono">${verRun ? esc(c.tit.run) : runMascara(c.tit.run)}</span> ${!verRun && RECEPTOR.includes(u.perfil) ? `<button class="pin-reveal" type="button" id="ver-run">Ver RUN completo</button>` : ""}</dd>
      ${c.rep ? `<dt>Representante</dt><dd>${esc(c.rep.nom)}</dd>` : ""}
      <dt>Derechos</dt><dd>${c.derechos.map(k => DER[k]).join(", ")}</dd><dt>Detalle</dt><dd>${esc(c.detalle)}</dd>
      <dt>Respuesta por</dt><dd>${MEDIOS[c.medio]}${c.retiro && c.medio === "retiro" ? " · " + esc(c.retiro) : ""}</dd>
      <dt>Ámbito</dt><dd>${c.ambito ? esc(AMB(c.ambito).n) : `<span class="tenue">Sin derivar</span>`}</dd>
      ${c.decision ? `<dt>Propuesta</dt><dd><b>${esc(c.decision)}</b> · ${esc(c.propuesta)}</dd>` : ""}
      ${c.firma ? `<dt>Firma</dt><dd>${esc(c.firma.doc)} · ${fF(c.firma.f)}${c.firma.por ? " · " + esc(nomU(c.firma.por)) : ""}</dd>` : ""}
      ${c.cierre && c.cierre.cesion ? `<dt>Destinatarios</dt><dd>${esc(c.cierre.cesion)}</dd>` : ""}
      ${c.reclamo ? `<dt>Reclamo</dt><dd>${esc(c.reclamo.folio)} · notificado ${fF(c.reclamo.notif)} · ${c.reclamo.resp ? "respondido el " + fF(c.reclamo.resp.f) : "responder hasta " + fF(venceReclamo(c))}</dd>` : ""}
      ${c.cierre ? `<dt>Cierre</dt><dd>${esc(c.cierre.res)} · ${fF(c.cierre.f)}${c.cierre.causal ? " · " + esc(c.cierre.causal) : ""}</dd>` : ""}</dl></div>
    <div class="seccion"><h3>Plazos</h3><dl class="ficha">
      <dt>Legal</dt><dd>${abierto(c) ? semaforo(c) + ` <span class="num">vence ${fF(venceLegal(c))}</span>${c.prorroga ? ` · prorrogado el ${fF(c.prorroga)}` : ""}` : "Cerrado"}</dd>
      <dt>Interno</dt><dd>${abierto(c) ? (vi ? `${esc(e.n)}: vence ${fF(vi)} (${PARAM.interno[c.etapa]} días hábiles)` : `<span class="tenue">Sin plazo interno definido para «${esc(e.n)}»</span>`) : "—"}</dd>
      <dt>Responsable</dt><dd>${quienTxt(c)}</dd></dl></div>
    ${acotado ? "" : `<div class="seccion"><h3>Bitácora del caso</h3><div class="tabla-env"><table><tbody>${c.bit.slice().reverse().map(b => `<tr><td class="num">${fF(b.f)}</td><td class="peq">${esc(b.u)}</td><td>${esc(b.a)}</td></tr>`).join("")}</tbody></table></div></div>`}`;
  cajon(c.num, chipEstado(c), cuerpo, render);
  enlazarAcciones(c);
  if ($("#ver-run")) $("#ver-run").onclick = () => { c._runVisto = true; anota(c, "Lectura del RUN completo"); abrirCaso(num); };
  if ($("[data-ir-cfg]")) $("[data-ir-cfg]").onclick = () => { cerrarCapa(); ir("responsables"); };
}
function accionesHTML(c) {
  const u = SESION, A = [];
  if (bloqueoPendiente(c) && u.perfil === "fiscalia" && RESP[c.sede].admisibilidad === u.id) A.push(`<div class="grupo-acc">Bloqueo temporal</div><p class="peq">Fundamento del titular: «${esc(c.bloq.fund || "—")}». Se responde dentro de ${PARAM.BLOQUEO} días hábiles; el rechazo se funda y se comunica electrónicamente a la Agencia (art. 11).</p><div class="campo"><label for="a-fb">Fundamento (obligatorio si se rechaza)</label><textarea id="a-fb" rows="2"></textarea></div><div class="acciones"><button class="boton" type="button" data-a="bloq-ok">Acoger el bloqueo</button><button class="boton secundario peligro" type="button" data-a="bloq-no">Rechazar el bloqueo</button></div>`);
  if (responsable(c) === u.id && abierto(c)) {
    const k = c.etapa;
    if (k === "recepcion") A.push(`<div class="grupo-acc">Recepción y registro</div>${!c.identidad ? `<label class="opcion"><input type="checkbox" id="a-ident"><span><b>Identidad verificada</b><small>Clave Única, cédula exhibida en Oficina de Partes o copia acompañada.</small></span></label>` : chip("Identidad verificada", "c-disp", "✓")}
      <div class="acciones"><button class="boton" type="button" data-a="a-admis">Pasar a admisibilidad</button><button class="boton secundario aviso" type="button" data-a="pedir-ant">Pedir antecedentes</button></div><div id="a-ant"></div>`);
    if (k === "admisibilidad") A.push(`<div class="grupo-acc">Admisibilidad</div><div class="acciones"><button class="boton" type="button" data-a="admisible">Admisible</button>${!esperaAntecedentes(c) ? `<button class="boton secundario aviso" type="button" data-a="pedir-ant">Pedir antecedentes</button>` : ""}<button class="boton secundario peligro" type="button" data-a="no-procede">No procede</button>${esperaAntecedentes(c) && venceAntecedentes(c) < HOY ? `<button class="boton secundario peligro" type="button" data-a="denegar-ant">Denegar por falta de antecedentes</button>` : ""}</div><div id="a-ant"></div><div id="a-np"></div>`);
    if (k === "derivacion") A.push(`<div class="grupo-acc">Derivación</div><div class="campo"><label for="a-amb">Ámbito que trata los datos</label><select id="a-amb"><option value="">Seleccione</option>${AMBITOS.map(a => `<option value="${a.k}">${esc(a.n)}${a.resp ? "" : " · sin responsable"}</option>`).join("")}</select><span class="ayuda">Ámbitos de ejemplo hasta cargar la matriz de datos personales.</span></div><div class="acciones"><button class="boton" type="button" data-a="derivar">Derivar</button></div>`);
    if (k === "analisis") A.push(`<div class="grupo-acc">Análisis y propuesta</div><div class="opciones" role="radiogroup" aria-label="Decisión">${["Acoge", "Acoge parcialmente", "Rechaza"].map(d => `<label><input type="radio" name="a-dec" value="${d}" ${c.decision === d ? "checked" : ""}> ${d}</label>`).join("")}</div><div class="campo"><label for="a-prop">Propuesta de respuesta *</label><textarea id="a-prop" rows="3">${esc(c.propuesta)}</textarea></div><div class="acciones"><button class="boton" type="button" data-a="a-revision">Enviar a revisión jurídica</button>${!c.prorroga && !c.pidePror ? `<button class="boton secundario" type="button" data-a="pedir-pror">Pedir prórroga a la Unidad Jurídica</button>` : ""}</div>`);
    if (k === "revision") A.push(`<div class="grupo-acc">Revisión jurídica</div><div class="campo"><label for="a-obs">Observaciones (obligatorio si se devuelve)</label><textarea id="a-obs" rows="2"></textarea></div><div class="acciones"><button class="boton" type="button" data-a="conforme">Conforme · pasa a firma</button><button class="boton secundario aviso" type="button" data-a="devolver">Devolver al área</button></div>`);
    if (k === "firma") A.push(`<div class="grupo-acc">Firma</div><p><b>${esc(c.decision || "")}</b> · ${esc(c.propuesta)}</p>${c.decision !== "Acoge" ? `<p class="peq">${chip("Denegación total o parcial", "c-pend", "!")} La respuesta debe indicar la causa, sus antecedentes y el plazo de 30 días hábiles para reclamar ante la Agencia (art. 11 inc. 4°).</p>` : ""}<p class="peq">La respuesta se firma y se emite por Cero Papel (reunión del 18-11-2026); aquí se registra el número del documento.</p><div class="campos"><div class="campo"><label for="a-doc">N° del documento *</label><input type="text" id="a-doc" placeholder="Carta Oficial N°"></div></div><div class="acciones"><button class="boton" type="button" data-a="firmada">${ico("firma")}Firmar la respuesta</button></div>`);
    if (k === "respuesta") A.push(`<div class="grupo-acc">Respuesta y cierre</div><p class="peq">Se envía por escrito por ${MEDIOS[c.medio].toLowerCase()} y se guarda el respaldo con fecha, destinatario y contenido íntegro (art. 11 inc. 3°).</p>${c.decision !== "Rechaza" && c.derechos.some(d => ["rectificacion", "supresion", "oposicion"].includes(d)) ? `<fieldset><legend>Comunicación a destinatarios (art. 6° y art. 11)</legend><div class="lista-opciones"><label class="opcion"><input type="radio" name="a-ces" value="Se comunicaron los cambios a los destinatarios a quienes se cedieron los datos"><span><b>Se comunicaron los cambios</b><small>A quienes CONAF comunicó o cedió los datos.</small></span></label><label class="opcion"><input type="radio" name="a-ces" value="Los datos no se comunicaron ni cedieron a terceros"><span><b>No hubo cesiones</b><small>Los datos no se comunicaron a terceros.</small></span></label></div></fieldset>` : ""}<div class="acciones"><button class="boton" type="button" data-a="cerrar">${ico("enviar")}Enviar la respuesta y cerrar</button></div>`);
  }
  if (RECEPTOR.includes(u.perfil) && abierto(c) && RESP[c.sede].responde === u.id && !c.prorroga) A.push(`<div class="grupo-acc">Prórroga</div><p class="peq">${c.pidePror ? chip("El área pidió prórroga", "c-pend", "!") + " " : ""}Una sola vez, hasta ${PARAM.PRORROGA} días corridos, comunicada al titular antes del vencimiento.</p>${diasLegal(c) < 0 ? `<p class="peq">${chip("No se puede prorrogar: el plazo ya venció", "c-malo", "✕")}</p>` : `<div class="acciones"><button class="boton secundario" type="button" data-a="prorrogar">Prorrogar y comunicar al titular</button></div>`}`);
  if (RESP[c.sede].reclamos === u.id) {
    if (reclamoPendiente(c)) A.push(`<div class="grupo-acc">Reclamo ante la Agencia (art. 41)</div><p class="peq">${esc(c.reclamo.folio)} · notificado el ${fF(c.reclamo.notif)}. CONAF responde a más tardar el <b>${fF(venceReclamo(c))}</b>, con todos los antecedentes${c.reclamo.prorroga ? " (prorrogado)" : ""}.</p><div class="campo"><label for="a-rec">Respuesta a la Agencia *</label><textarea id="a-rec" rows="2"></textarea></div><div class="acciones"><button class="boton" type="button" data-a="rec-resp">Registrar la respuesta enviada</button>${!c.reclamo.prorroga ? `<button class="boton secundario" type="button" data-a="rec-pror">Prorrogar ${PARAM.RECLAMO_RESP} días</button>` : ""}</div>`);
    else if (!c.reclamo && ((!abierto(c) && c.cierre.res !== "Acogida") || (abierto(c) && diasLegal(c) < 0))) A.push(`<div class="grupo-acc">Reclamo ante la Agencia (art. 41)</div><p class="peq">El titular puede reclamar dentro de 30 días hábiles${abierto(c) ? " desde que venció el plazo sin respuesta" : " desde la respuesta negativa"}.</p><div class="campos"><div class="campo"><label for="a-rnot">Fecha de notificación</label><input type="date" id="a-rnot" max="${HOY}" value="${HOY}"></div><div class="campo"><label for="a-rfol">Folio de la Agencia *</label><input type="text" id="a-rfol"></div></div><div class="acciones"><button class="boton secundario" type="button" data-a="rec-nuevo">Registrar reclamo notificado</button></div>`);
  }
  return A.length ? `<section class="panel acc-caso"><header><h2>Acciones</h2><span class="sub">${esc(PERFILES[u.perfil].n)}</span></header><div class="cuerpo grid">${A.join("")}</div></section>` : "";
}
function enlazarAcciones(c) {
  const val = id => ($("#" + id) || {}).value || "", hecho = t => { tostada(t + " · " + c.num); abrirCaso(c.num); };
  const req = (id, msg) => { const el = $("#" + id); if (!el.value.trim()) { el.setAttribute("aria-invalid", "true"); el.focus(); tostada(msg); return false; } return true; };
  const act = {
    "bloq-ok": () => { c.bloq.res = "Acogido"; c.bloq.f = HOY; anota(c, "Bloqueo temporal acogido"); hecho("Bloqueo acogido"); },
    "bloq-no": () => { if (!req("a-fb", "Indique el fundamento del rechazo")) return; c.bloq.res = "Rechazado"; c.bloq.f = HOY; c.bloq.agencia = HOY; anota(c, "Bloqueo temporal rechazado: " + val("a-fb")); anota(c, "Rechazo del bloqueo comunicado electrónicamente a la Agencia (art. 11) · simulado"); hecho("Bloqueo rechazado y comunicado a la Agencia"); },
    "a-admis": () => { if ($("#a-ident") && $("#a-ident").checked) { c.identidad = true; anota(c, "Identidad verificada"); } if (!c.identidad) { tostada("Primero verifique la identidad"); return; } pasar(c, "admisibilidad", "Pasa a admisibilidad"); hecho("Enviado a admisibilidad"); },
    "pedir-ant": () => { $("#a-ant").innerHTML = `<div class="campo"><label for="a-que">Antecedentes que se piden *</label><textarea id="a-que" rows="2"></textarea></div><div class="acciones"><button class="boton secundario aviso" type="button" id="a-ant-ok">Enviar el requerimiento al titular</button></div>`; $("#a-que").focus();
      $("#a-ant-ok").onclick = () => { if (!req("a-que", "Indique qué antecedentes se piden")) return; c.ant = { pide: HOY, que: val("a-que") }; anota(c, "Se piden antecedentes al titular (" + PARAM.ANTECEDENTES + " días hábiles)"); hecho("Requerimiento enviado"); }; },
    "admisible": () => { pasar(c, "derivacion", "Declarada admisible"); hecho("Declarada admisible"); },
    "no-procede": () => { $("#a-np").innerHTML = `<div class="campo"><label for="a-causal">Causal y fundamento *</label><textarea id="a-causal" rows="2"></textarea></div><div class="acciones"><button class="boton secundario peligro" type="button" id="a-np-ok">Confirmar: no procede</button></div>`; $("#a-causal").focus();
      $("#a-np-ok").onclick = () => { if (!req("a-causal", "Indique la causal")) return; c.cierre = { f: HOY, res: "No admitida", causal: val("a-causal") }; pasar(c, "cerrado", "No procede: " + val("a-causal") + " · se informa el derecho a reclamar"); hecho("Caso cerrado"); }; },
    "denegar-ant": () => { c.cierre = { f: HOY, res: "Denegada", causal: "No se aportaron los antecedentes pedidos" }; pasar(c, "cerrado", "Denegada por falta de antecedentes"); hecho("Caso cerrado"); },
    "derivar": () => { const a = val("a-amb"); if (!a) { tostada("Elija el ámbito"); return; } c.ambito = a; pasar(c, "analisis", "Derivado a " + AMB(a).n); hecho("Caso derivado"); },
    "a-revision": () => { const d = $("input[name=a-dec]:checked"); if (!d) { tostada("Elija la decisión"); return; } if (!req("a-prop", "Escriba la propuesta")) return; c.decision = d.value; c.propuesta = val("a-prop"); pasar(c, "revision", "Propuesta enviada a revisión jurídica: " + d.value); hecho("Enviado a revisión"); },
    "pedir-pror": () => { c.pidePror = true; anota(c, "El área pide prórroga a la Unidad Jurídica"); hecho("Prórroga pedida"); },
    "conforme": () => { pasar(c, "firma", "Revisión jurídica conforme"); hecho("Pasa a firma"); },
    "devolver": () => { if (!req("a-obs", "Escriba las observaciones")) return; pasar(c, "analisis", "Devuelto con observaciones: " + val("a-obs")); hecho("Devuelto al área"); },
    "firmada": () => { if (!req("a-doc", "Indique el número del documento")) return; c.firma = { f: HOY, doc: val("a-doc"), por: SESION.id }; pasar(c, "respuesta", "Respuesta firmada: " + val("a-doc")); hecho("Respuesta firmada"); },
    "cerrar": () => { const ces = $("input[name=a-ces]"); const sel = $("input[name=a-ces]:checked"); if (ces && !sel) { tostada("Indique si se comunicaron los cambios a los destinatarios"); return; } if (sel) anota(c, sel.value + " (art. 6°)"); const r = { "Acoge": "Acogida", "Acoge parcialmente": "Acogida parcialmente", "Rechaza": "Rechazada" }[c.decision] || "Respondida"; c.cierre = { f: HOY, res: r, medio: c.medio, cesion: sel ? sel.value : null }; pasar(c, "cerrado", "Respuesta enviada por " + MEDIOS[c.medio].toLowerCase() + " · respaldo guardado"); hecho("Respuesta enviada"); },
    "rec-resp": () => { if (!req("a-rec", "Escriba la respuesta enviada a la Agencia")) return; c.reclamo.resp = { f: HOY, txt: val("a-rec") }; anota(c, "Respuesta al reclamo enviada a la Agencia"); hecho("Respuesta a la Agencia registrada"); },
    "rec-pror": () => { c.reclamo.prorroga = HOY; anota(c, "Se prorroga la respuesta al reclamo (art. 41 d) · vence " + fF(venceReclamo(c))); hecho("Plazo del reclamo prorrogado"); },
    "rec-nuevo": () => { if (!req("a-rfol", "Indique el folio de la Agencia")) return; c.reclamo = { notif: val("a-rnot") || HOY, folio: val("a-rfol"), resp: null }; anota(c, "La Agencia notificó un reclamo del titular (art. 41) · responder hasta " + fF(venceReclamo(c))); hecho("Reclamo registrado"); },
    "prorrogar": () => { c.prorroga = HOY; anota(c, "Prórroga registrada y comunicada al titular · nuevo vencimiento " + fF(venceLegal(c))); hecho("Prórroga registrada"); }
  };
  $$("#capa [data-a]").forEach(b => b.onclick = () => act[b.dataset.a]());
}

/* ---------- Registrar solicitud recibida en Oficina de Partes ---------- */
let REG = null;
function vRegistrar() {
  const sedes = sedesDe(SESION).filter(s => RESP[s].recibe === SESION.id);
  if (!REG) REG = { sede: sedes[0] || "", err: [] };
  return volverHTML() + cab("Registrar solicitud en formulario físico", "Formulario físico recibido. El plazo legal corre desde la fecha de recepción en CONAF, no desde este registro.", "") +
    `${REG.err.length ? `<div class="faltan" role="alert" id="faltan" tabindex="-1"><b>Revise lo siguiente:</b><ul>${REG.err.map(e => `<li>${esc(e)}</li>`).join("")}</ul></div>` : ""}
    <form id="f-reg" class="grid" novalidate><fieldset><legend>Ingreso</legend><div class="campos">
    <div class="campo"><label for="r-sede">Oficina de Partes</label><select id="r-sede">${sedes.map(s => `<option ${REG.sede === s ? "selected" : ""}>${s}</option>`).join("")}</select></div>
    <div class="campo"><label for="r-fecha">Fecha de recepción en CONAF *</label><input type="date" id="r-fecha" max="${HOY}" value="${REG.fecha || HOY}"></div>
    <div class="campo"><label for="r-folio">Número de registro *</label><input type="text" id="r-folio" class="mono" value="${esc(REG.folio || "")}"></div>
    <div class="campo"><label for="r-cal">Quién solicita</label><select id="r-cal">${Object.entries(CALIDAD).map(([k, v]) => `<option value="${k}" ${REG.cal === k ? "selected" : ""}>${v}</option>`).join("")}</select></div></div></fieldset>
    <fieldset><legend>Titular</legend><div class="campos"><div class="campo"><label for="r-run">RUN *</label><input type="text" id="r-run" class="mono" placeholder="12.345.678-9" maxlength="12" value="${esc(REG.run || "")}"></div><div class="campo"><label for="r-nom">Nombre *</label><input type="text" id="r-nom" value="${esc(REG.nom || "")}"></div>
    <div class="campo ancho"><label class="adj"><input type="checkbox" id="r-ced" ${REG.ced ? "checked" : ""}> Identidad verificada con la cédula exhibida o su copia</label><span class="ayuda">Si no viene, el caso queda en «Requiere antecedentes» y no se responde sin ella.</span></div></div></fieldset>
    <fieldset><legend>Solicitud</legend><div class="check-grid">${DERECHOS.map(d => `<label><input type="checkbox" name="r-der" value="${d.k}" ${(REG.ders || []).includes(d.k) ? "checked" : ""}> ${d.n}</label>`).join("")}</div>
    <div class="campos" style="margin-top:var(--e-3)"><div class="campo ancho"><label for="r-det">Qué información pide y dónde cree que consta *</label><textarea id="r-det" rows="3">${esc(REG.det || "")}</textarea></div>
    <div class="campo"><label for="r-medio">Medio de respuesta</label><select id="r-medio">${Object.entries(MEDIOS).map(([k, v]) => `<option value="${k}" ${REG.medio === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="campo ancho"><label class="adj"><input type="checkbox" id="r-scan"> Documento original digitalizado y adjunto * <span class="tenue peq">(simulado)</span></label></div></div></fieldset>
    <div class="acciones"><button class="boton grande" type="submit">${ico("plus")}Registrar y acusar recibo</button></div></form>`;
}
POST.registrar = () => {
  if ($("#faltan")) $("#faltan").focus();
  $("#f-reg").onsubmit = e => {
    e.preventDefault(); const v = id => $("#" + id).value.trim();
    Object.assign(REG, { sede: v("r-sede"), fecha: v("r-fecha"), folio: v("r-folio"), run: v("r-run"), nom: v("r-nom"), det: v("r-det") });
    const ders = $$("input[name=r-der]:checked").map(i => i.value), err = [];
    Object.assign(REG, { ders, cal: v("r-cal"), medio: v("r-medio"), ced: $("#r-ced").checked });
    if (!REG.fecha || REG.fecha > HOY) err.push("La fecha de recepción en CONAF no puede ser posterior a hoy.");
    if (!REG.folio) err.push("Indique el número de registro.");
    if (!/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(REG.run) || !REG.nom) err.push("Indique RUN y nombre del titular.");
    if (!ders.length) err.push("Marque al menos un derecho.");
    if (!REG.det) err.push("Describa qué pide el titular.");
    if (!$("#r-scan").checked) err.push("El documento original digitalizado es obligatorio.");
    REG.err = err; if (err.length) { render(); return; }
    const ced = $("#r-ced").checked;
    const c = nuevoCaso({ num: nuevoNumero(), ingreso: REG.fecha, desde: HOY, via: "fisica", folio: REG.folio, sede: REG.sede, calidad: v("r-cal"), derechos: ders, detalle: REG.det, medio: v("r-medio"), tit: { nom: REG.nom, run: REG.run }, identidad: ced, bloq: ders.includes("bloqueo") ? { pide: REG.fecha, res: null } : null, ant: ced ? null : { pide: HOY, que: "Copia de la cédula de identidad del titular." } });
    c.bit.push({ f: HOY, u: nomU(SESION.id), a: `Registro manual · número de registro ${REG.folio} · recepción en CONAF ${fF(REG.fecha)} (${corridosEntre(REG.fecha, HOY)} días antes del registro)` });
    CASOS.push(c); BIT.unshift({ f: HOY, u: nomU(SESION.id), caso: c.num, a: "Registro de formulario físico" });
    REG = null; tostada("Caso " + c.num + " registrado · vence " + fF(venceLegal(c))); ir("inicio"); abrirCaso(c.num);
  };
};

/* ---------- Calendario de vencimientos ---------- */
let MES = HOY.slice(0, 7);
function eventosDia(d) {
  const ev = [];
  misCasos().filter(abierto).forEach(c => {
    if (venceLegal(c) === d) ev.push({ c, t: "Vence plazo legal", cls: diasLegal(c) < 0 ? "c-malo" : "c-pend", i: "◷" });
    if (bloqueoPendiente(c) && venceBloqueo(c) === d) ev.push({ c, t: "Vence bloqueo", cls: "c-malo", i: "▲" });
    if (esperaAntecedentes(c) && venceAntecedentes(c) === d) ev.push({ c, t: "Vencen antecedentes", cls: "c-res", i: "?" });
    const vi = venceInterno(c); if (vi === d) ev.push({ c, t: "Plazo interno", cls: "c-excl", i: "◆" });
  });
  return ev;
}
function vCalendario() {
  const [a, m] = MES.split("-").map(Number), pri = new Date(a, m - 1, 1, 12), dias = new Date(a, m, 0).getDate(), off = (pri.getDay() + 6) % 7;
  const celdas = []; for (let i = 0; i < off; i++) celdas.push(`<div class="cal-d vacia" aria-hidden="true"></div>`);
  for (let d = 1; d <= dias; d++) {
    const s = MES + "-" + String(d).padStart(2, "0"), ev = eventosDia(s), fer = PARAM.feriados.find(f => f.f === s), fin = [0, 6].includes(F(s).getDay());
    celdas.push(`<div class="cal-d ${fin ? "fin" : ""} ${s === HOY ? "hoy" : ""} ${ev.length ? "con" : "sin"}"><div class="cal-n"><b>${d}</b><span class="cal-ds">${DS[F(s).getDay()]}</span>${s === HOY ? chip("Hoy", "c-disp", "●") : ""}${fer ? `<span class="peq tenue">${esc(fer.n)}</span>` : ""}</div>${ev.map(x => `<button type="button" class="cal-ev estado ${TONO[x.cls]}" data-caso="${x.c.num}"><span class="estado-glifo" aria-hidden="true">${x.i}</span>${x.c.num.slice(-6)} · ${x.t}</button>`).join("")}</div>`);
  }
  const prev = sumaCorridos(MES + "-01", -1).slice(0, 7), next = sumaCorridos(MES + "-28", 5).slice(0, 7);
  return volverHTML() + cab("Calendario de vencimientos", "Plazos legales, bloqueos temporales, plazos de antecedentes y, si se definen, plazos internos. Fines de semana y feriados sombreados.", "") +
    `<section class="panel"><header><div class="cal-cab"><button class="boton secundario chico cal-mes" type="button" data-mes="${prev}" aria-label="Mes anterior: ${MESES[+prev.slice(5) - 1]}">←<span class="txt"> ${MESES[+prev.slice(5) - 1]}</span></button><h2 class="cal-t">${MESES[m - 1]} ${a}</h2><button class="boton secundario chico cal-mes" type="button" data-mes="${next}" aria-label="Mes siguiente: ${MESES[+next.slice(5) - 1]}"><span class="txt">${MESES[+next.slice(5) - 1]} </span>→</button></div></header>
    <div class="cal"><div class="cal-sem" aria-hidden="true">${["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map(x => `<span>${x}</span>`).join("")}</div><div class="cal-grid">${celdas.join("")}</div></div>
    <div class="leyenda">${chip("Vence plazo legal", "c-pend", "◷")}${chip("Vencido", "c-malo", "◷")}${chip("Vence bloqueo", "c-malo", "▲")}${chip("Vencen antecedentes", "c-res", "?")}${chip("Plazo interno", "c-excl", "◆")}</div></section>`;
}
POST.calendario = () => { $$("[data-mes]").forEach(b => b.onclick = () => { MES = b.dataset.mes; render(); }); enlazarCasos(); };

/* ---------- Reportes ---------- */
let PER = "2027-01";
function enPeriodo(c) { return c.ingreso.startsWith(PER); }
function vReportes() {
  const L = misCasos().filter(enPeriodo), cer = L.filter(c => !abierto(c));
  const enPlazo = cer.filter(c => c.cierre.f <= venceLegal(c)).length, venc = L.filter(c => abierto(c) && diasLegal(c) < 0).length;
  const cuenta = (lista, f) => { const o = {}; lista.forEach(c => [].concat(f(c)).forEach(k => o[k] = (o[k] || 0) + 1)); return Object.entries(o).sort((a, b) => b[1] - a[1]); };
  const barras = (t, pares) => `<section class="panel"><header><h2>${t}</h2></header><div class="cuerpo barras">${pares.length ? pares.map(([k, n]) => `<div class="b"><span class="eti">${esc(k)}</span><span class="pista"><span style="width:${Math.round(n / Math.max(...pares.map(p => p[1])) * 100)}%"></span></span><span class="num">${n}</span></div>`).join("") : `<p class="vacio-chico">Sin datos en el periodo.</p>`}</div></section>`;
  const per = [["2026-12", "Diciembre 2026"], ["2027-01", "Enero 2027"], ["2026", "Año 2026"], ["2027", "Año 2027"]];
  return volverHTML() + cab("Reportes", "Cifras agregadas del canal, sin datos de los titulares. El Excel lista los casos sin RUN ni nombres.", "") +
    `<div class="barra-herr"><div class="acciones">${filtrosHTML(per.map(([k, t]) => [k, t]), PER, "data-per")}</div><button class="boton" type="button" id="xls">${ico("doc")}Descargar Excel</button></div>
    <div class="grid g-kpi" style="margin-bottom:var(--e-4)"><div class="kpi"><span class="k">Ingresadas</span><span class="v">${L.length}</span></div><div class="kpi"><span class="k">Cerradas</span><span class="v">${cer.length}</span></div>
    <div class="kpi"><span class="k">Cerradas en plazo</span><span class="v">${cer.length ? Math.round(enPlazo / cer.length * 100) + "%" : "—"}</span><span class="d">${enPlazo} de ${cer.length}</span></div><div class="kpi ${venc ? "alerta" : ""}"><span class="k">Abiertas vencidas</span><span class="v">${venc}</span></div></div>
    <div class="grid g-2b">${barras("Por derecho", cuenta(L, c => c.derechos.map(k => DER[k])))}${barras("Por vía de ingreso", cuenta(L, c => VIAS[c.via]))}${barras("Por sede", cuenta(L, c => corta(c.sede)))}${barras("Por estado", cuenta(L, c => estado(c)[0]))}</div>`;
}
POST.reportes = () => {
  $$("[data-per]").forEach(b => b.onclick = () => { PER = b.dataset.per; render(); });
  $("#xls").onclick = () => {
    if (typeof XLSX === "undefined") { tostada("No se pudo cargar la librería de Excel (sin conexión)"); return; }
    const L = misCasos().filter(enPeriodo).map(c => ({ "Caso": c.num, "Ingreso": fF(c.ingreso), "Vía": VIAS[c.via], "Sede": c.sede, "Derechos": c.derechos.map(k => DER[k]).join(", "), "Estado": estado(c)[0], "Vence (legal)": fF(venceLegal(c)), "Prorrogado": c.prorroga ? "Sí" : "No", "Cierre": c.cierre ? fF(c.cierre.f) : "", "Resultado": c.cierre ? c.cierre.res : "", "En plazo": c.cierre ? (c.cierre.f <= venceLegal(c) ? "Sí" : "No") : (diasLegal(c) < 0 ? "Vencido" : "En curso") }));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(L.length ? L : [{ "Caso": "Sin casos en el periodo" }]), "Solicitudes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["CON012 · Reporte del canal Ley N° 21.719 (maqueta, datos ficticios)"], ["Periodo", PER], ["Generado", fF(HOY)]]), "Información");
    XLSX.writeFile(wb, "CON012_reporte_" + PER + ".xlsx"); anotaGlobal("Descarga de reporte Excel " + PER);
  };
};
function anotaGlobal(a) { BIT.unshift({ f: HOY, u: nomU(SESION.id), caso: "—", a }); }
