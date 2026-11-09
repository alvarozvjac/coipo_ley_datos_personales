/* CON012 · Administración del canal: responsables por etapa y sede, parámetros y bitácora. */
"use strict";

const celdasPorDefinir = () => SEDES.reduce((n, s) => n + COLS.filter(([k]) => !RESP[s][k]).length, 0) + AMBITOS.filter(a => !a.resp).length;
const perfilDeCol = k => COLS.find(c => c[0] === k)[2];
let RESP_PRUEBA = null; // respaldo para «Restaurar asignaciones de prueba»

function vResponsables() {
  const completas = SEDES.filter(s => COLS.every(([k]) => RESP[s][k])).length, sinR = CASOS.filter(sinResponsable).length;
  const celda = (s, k) => { const v = RESP[s][k]; const txt = !v ? porDefinir() : esc(nomU(v)); return `<td><button type="button" class="celda-resp" data-s="${esc(s)}" data-k="${k}" aria-label="${esc(s)} · ${COLS.find(c => c[0] === k)[1]}: ${v ? esc(nomU(v)) : "por definir"}">${txt}</button></td>`; };
  return volverHTML() + cab("Responsables por etapa y sede", "Quién actúa en cada etapa, en Oficina Central y en cada dirección regional. Un caso cuya etapa no tiene responsable queda detenido y aparece en «Casos sin responsable».", "") +
    `<div class="regla av" style="margin-bottom:var(--e-4)"><span class="ico">?</span><div><b>Responsables por definir</b><span>Los perfiles de gestión en Oficina Central y en regiones y los flujos de cada una los está levantando la contraparte (correo del 28-10-2026). Oficina Central y Biobío llevan una asignación de prueba, con usuarios ficticios, para que la maqueta se pueda recorrer.</span></div></div>
    <div class="contadores"><div class="contador"><b>${completas}</b><span>sedes con todas<br>las etapas cubiertas</span></div><div class="contador ${celdasPorDefinir() ? "alerta" : ""}"><b>${celdasPorDefinir()}</b><span>asignaciones<br>por definir</span></div><div class="contador ${sinR ? "alerta" : ""}"><b>${sinR}</b><span>casos abiertos<br>sin responsable</span></div></div>
    <section class="panel" style="margin-bottom:var(--e-4)"><header><h2>Asignación de las solicitudes web</h2></header><div class="cuerpo"><div class="campo" style="max-width:520px"><label for="p-web">Las solicitudes del formulario web se asignan a</label><select id="p-web"><option value="pendiente" ${PARAM.sedeWeb === "pendiente" ? "selected" : ""}>Por definir · mientras tanto, Oficina Central</option><option value="oc" ${PARAM.sedeWeb === "oc" ? "selected" : ""}>Oficina Central</option><option value="region" ${PARAM.sedeWeb === "region" ? "selected" : ""}>La región del domicilio indicado (si responde por carta)</option></select><span class="ayuda">Las del formulario físico quedan en la sede de la Oficina de Partes que la recibió.</span></div></div></section>
    <section class="panel" style="margin-bottom:var(--e-4)"><header><div><h2>Por sede</h2><span class="sub">Toque una celda para asignar. Cada columna admite usuarios del perfil que hace esa etapa.</span></div><div class="acciones"><button class="boton secundario chico" type="button" id="vaciar">Dejar todo por definir</button>${RESP_PRUEBA ? `<button class="boton secundario chico" type="button" id="restaurar">Restaurar la asignación de prueba</button>` : ""}</div></header>
    <div class="tabla-env"><table class="t-resp"><thead><tr><th>Sede</th>${COLS.map(([, t]) => `<th>${t}</th>`).join("")}</tr></thead><tbody>${SEDES.map(s => `<tr><th scope="row">${esc(corta(s))}${RESP[s].prueba ? ` ${chip("prueba", "c-excl", "◆")}` : ""}</th>${COLS.map(([k]) => celda(s, k)).join("")}</tr>`).join("")}</tbody></table></div></section>
    <section class="panel"><header><div><h2>Por ámbito de datos · análisis y propuesta</h2><span class="sub">Ámbitos de ejemplo: se reemplazan por los tratamientos de la matriz de datos personales.</span></div></header>
    <div class="tabla-env"><table><thead><tr><th>Ámbito</th><th>Responsable del análisis</th><th>Casos abiertos</th></tr></thead><tbody>${AMBITOS.map(a => `<tr><td>${esc(a.n)} ${chip("ejemplo", "c-excl", "◆")}</td><td><select data-amb="${a.k}" aria-label="Responsable de ${esc(a.n)}"><option value="">Por definir</option>${USUARIOS.filter(u => u.perfil === "gerencia").map(u => `<option value="${u.id}" ${a.resp === u.id ? "selected" : ""}>${esc(PERFILES[u.perfil].n)}</option>`).join("")}</select></td><td class="d">${CASOS.filter(c => abierto(c) && c.ambito === a.k).length}</td></tr>`).join("")}</tbody></table></div></section>`;
}
POST.responsables = () => {
  $("#p-web").onchange = e => { PARAM.sedeWeb = e.target.value; anotaGlobal("Asignación de solicitudes web: " + e.target.selectedOptions[0].text); tostada("Parámetro guardado"); };
  $$("[data-amb]").forEach(s => s.onchange = () => { AMB(s.dataset.amb).resp = s.value || null; anotaGlobal("Responsable del ámbito " + AMB(s.dataset.amb).n + ": " + (s.value ? nomU(s.value) : "por definir")); tostada("Asignación guardada"); render(); });
  $("#vaciar").onclick = () => { RESP_PRUEBA = JSON.stringify({ RESP, amb: AMBITOS.map(a => a.resp) }); SEDES.forEach(s => { COLS.forEach(([k]) => RESP[s][k] = null); RESP[s].prueba = false; }); AMBITOS.forEach(a => a.resp = null); anotaGlobal("Todas las asignaciones quedan por definir"); tostada("Todas las asignaciones quedan por definir"); render(); };
  if ($("#restaurar")) $("#restaurar").onclick = () => { const o = JSON.parse(RESP_PRUEBA); SEDES.forEach(s => Object.assign(RESP[s], o.RESP[s])); AMBITOS.forEach((a, i) => a.resp = o.amb[i]); RESP_PRUEBA = null; anotaGlobal("Se restaura la asignación de prueba"); render(); };
  $$(".celda-resp").forEach(b => b.onclick = () => editarCelda(b.dataset.s, b.dataset.k));
};
function editarCelda(s, k) {
  const t = COLS.find(c => c[0] === k)[1], v = RESP[s][k];
  const ops = USUARIOS.filter(u => u.perfil === PERFIL_EN(s, k));
  cajon(t, esc(s), `<div class="campo"><label for="e-u">Responsable</label><select id="e-u"><option value="">Por definir</option>${ops.map(u => `<option value="${u.id}" ${v === u.id ? "selected" : ""}>${esc(PERFILES[u.perfil].n)} · ${esc(u.cargo)}</option>`).join("")}</select><span class="ayuda">En la maqueta sólo hay usuarios de prueba del perfil ${esc(PERFILES[PERFIL_EN(s, k)].n)}. En la versión institucional se eligen desde el sistema de identidad de CONAF.</span></div><div class="acciones"><button class="boton" type="button" id="e-ok">Guardar</button></div>`, render);
  $("#e-ok").onclick = () => {
    const nv = $("#e-u").value || null;
    RESP[s][k] = nv; RESP[s].prueba = RESP[s].prueba && !!nv;
    anotaGlobal(`${s} · ${t}: ${nv ? nomU(nv) : "por definir"}`); cerrarCapa(); tostada("Asignación guardada"); render();
  };
}

/* ---------- Parámetros ---------- */
function vParametros() {
  return volverHTML() + cab("Plazos internos y feriados", "Los plazos internos por etapa quedan vacíos hasta que la contraparte los defina; mientras tanto el canal controla sólo los plazos legales.", "") +
    `<section class="panel" style="margin-bottom:var(--e-4)"><header><div><h2>Plazos internos por etapa</h2><span class="sub">Días hábiles desde que el caso entra a la etapa. Vacío = sin plazo interno.</span></div></header><form id="f-int"><div class="tabla-env"><table><thead><tr><th>Etapa</th><th>Qué se hace</th><th>Días hábiles</th></tr></thead><tbody>${ETAPAS.map(e => `<tr><td><b>${e.n}</b></td><td class="peq">${e.hace}</td><td><input type="number" min="1" max="30" step="1" inputmode="numeric" data-int="${e.k}" value="${PARAM.interno[e.k] ?? ""}" aria-label="Días hábiles para ${e.n}" style="max-width:110px"></td></tr>`).join("")}</tbody></table></div><div class="pie-tabla"><span class="tenue">Suma de los plazos definidos: ${Object.values(PARAM.interno).reduce((s, n) => s + (n || 0), 0)} días hábiles.</span><button class="boton" type="submit">Guardar plazos</button></div></form></section>
    <section class="panel" style="margin-bottom:var(--e-4)"><header><h2>Plazos legales</h2>${chip("Leídos de la Ley N° 21.719", "c-disp", "✓")}</header><div class="tabla-env"><table><thead><tr><th>Regla</th><th>Valor</th><th>Fuente</th></tr></thead><tbody>${PARAM.legal.map(l => `<tr><td>${l.n}</td><td>${l.v}</td><td class="peq">${l.art} · ${chip("Ley N° 21.719", "c-disp", "✓")}</td></tr>`).join("")}${PARAM.propuestos.map(l => `<tr><td>${l.n}</td><td>${l.v}</td><td class="peq">${chip("Propuesta", "c-pend", "?")} ${l.art}</td></tr>`).join("")}</tbody></table></div><div class="leyenda"><span class="tenue peq">No se editan aquí: los fija la ley (texto de la BCN en los antecedentes del proyecto). Su aplicación en CONAF la confirma Fiscalía.</span></div></section>
    <section class="panel"><header><h2>Feriados</h2><span class="sub">Se descuentan de los días hábiles.</span></header><div class="tabla-env"><table><tbody>${PARAM.feriados.slice().sort((a, b) => a.f.localeCompare(b.f)).map(f => `<tr><td class="num">${fF(f.f)}</td><td>${esc(f.n)}</td><td class="d"><button class="boton secundario chico" type="button" data-quitar="${f.f}">Quitar</button></td></tr>`).join("")}</tbody></table></div>
    <form id="f-fer" class="cat-form"><div class="campos"><div class="campo"><label for="fer-f">Fecha</label><input type="date" id="fer-f"></div><div class="campo"><label for="fer-n">Nombre</label><input type="text" id="fer-n"></div></div><div><button class="boton secundario" type="submit">Agregar feriado</button></div></form></section>`;
}
POST.parametros = () => {
  $("#f-int").onsubmit = e => { e.preventDefault(); $$("[data-int]").forEach(i => { const n = parseInt(i.value, 10); PARAM.interno[i.dataset.int] = n > 0 ? n : null; }); anotaGlobal("Plazos internos actualizados"); tostada("Plazos internos guardados"); render(); };
  $$("[data-quitar]").forEach(b => b.onclick = () => { PARAM.feriados = PARAM.feriados.filter(f => f.f !== b.dataset.quitar); anotaGlobal("Feriado quitado: " + fF(b.dataset.quitar)); render(); });
  $("#f-fer").onsubmit = e => { e.preventDefault(); const f = $("#fer-f").value, n = $("#fer-n").value.trim(); if (!f || !n) { tostada("Indique fecha y nombre"); return; } if (!PARAM.feriados.some(x => x.f === f)) PARAM.feriados.push({ f, n }); anotaGlobal("Feriado agregado: " + fF(f)); render(); };
};

/* ---------- Bitácora ---------- */
function vBitacora() {
  const filas = BIT.concat(CASOS.flatMap(c => c.bit.filter(b => b.u === "Sistema" || b.u === "Recepción").map(b => ({ f: b.f, u: b.u, caso: c.num, a: b.a })))).sort((a, b) => b.f.localeCompare(a.f));
  return volverHTML() + cab("Bitácora", "Acciones sobre los casos y la configuración. En la versión institucional es inalterable y registra cada lectura del RUN completo y de los adjuntos.", "") +
    `<section class="panel"><div class="tabla-env"><table><thead><tr><th>Fecha</th><th>Usuario</th><th>Caso</th><th>Acción</th></tr></thead><tbody>${filas.slice(0, 120).map(b => `<tr><td class="num">${fF(b.f)}</td><td class="peq">${esc(b.u)}</td><td class="mono peq">${esc(b.caso)}</td><td>${esc(b.a)}</td></tr>`).join("")}</tbody></table></div></section>`;
}
POST.bitacora = () => { };
