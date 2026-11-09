/* CON012 · Línea 2 · Vulneraciones de seguridad, evaluaciones de impacto, encargados y convenios de cesión. */
"use strict";

/* ---------- Vulneraciones de seguridad (art. 14 sexies) ---------- */
const debeComunicarTitulares = v => v.cats.sensibles || v.cats.menores || v.cats.economicos;
function vVulneraciones() {
  const ab = vulAbiertas(), puedeReg = ["seguridad", "delegado"].includes(SESION.perfil);
  return volverHTML() + cab("Vulneraciones de seguridad", "Destrucción, filtración, pérdida, alteración o acceso no autorizado a datos personales. Si hay riesgo razonable para los titulares se reporta a la Agencia, y todas quedan registradas.", "Art. 14 sexies") + avisoEjemplo() +
    `<div class="regla inf" style="margin-bottom:var(--e-4)"><span class="ico">i</span><div><b>La ley no fija un plazo en horas</b><span>Pide reportar «por los medios más expeditos posibles y sin dilaciones indebidas». Por eso la plataforma muestra los días desde la detección en vez de una cuenta regresiva.</span></div></div>
    <div class="contadores"><div class="contador ${ab.length ? "alerta" : ""}"><b>${ab.length}</b><span>vulneraciones<br>abiertas</span></div><div class="contador ${ab.some(v => v.paso === "decision") ? "alerta" : ""}"><b>${ab.filter(v => v.paso === "decision").length}</b><span>esperan decisión<br>del delegado</span></div><div class="contador"><b>${VULNERACIONES.filter(v => v.agencia).length}</b><span>reportadas<br>a la Agencia</span></div></div>
    ${puedeReg ? `<div class="barra-herr"><span></span><button class="boton" type="button" id="v-nueva">${ico("plus")}Registrar vulneración</button></div>` : ""}
    <section class="panel"><div class="tabla-env"><table><thead><tr><th>Registro</th><th>Detectada</th><th>Tratamiento</th><th>Tipo</th><th>Afectados</th><th>Etapa</th><th></th></tr></thead><tbody>${VULNERACIONES.map(v => `<tr><td class="mono peq">${v.id}</td><td class="num">${fF(v.det)}${v.paso !== "cerrada" ? `<br><span class="peq tenue">hace ${corridosEntre(v.det, HOY)} días</span>` : ""}</td><td class="peq">${esc(TRAT(v.trat).n)}</td><td class="peq">${esc(v.tipo)}</td><td class="num">${v.afectados ?? "—"}</td><td>${v.paso === "cerrada" ? chip("Cerrada", "c-disp", "✓") : chip(PASOS_VUL.find(x => x[0] === v.paso)[1], v.paso === "decision" ? "c-malo" : "c-pend", "◷")}</td><td class="d"><button class="boton chico" type="button" data-vul="${v.id}">Abrir</button></td></tr>`).join("")}</tbody></table></div></section>`;
}
POST.vulneraciones = () => { $$("[data-vul]").forEach(b => b.onclick = () => abrirVul(b.dataset.vul)); if ($("#v-nueva")) $("#v-nueva").onclick = nuevaVul; };
function nuevaVul() {
  cajon("Registrar vulneración", "", `<div class="campos"><div class="campo"><label for="nv-t">Tratamiento afectado</label><select id="nv-t">${TRATAMIENTOS.map(t => `<option value="${t.id}">${t.id} · ${esc(t.n)}</option>`).join("")}</select></div>
    <div class="campo"><label for="nv-f">Fecha de detección</label><input type="date" id="nv-f" value="${HOY}" max="${HOY}"></div>
    <div class="campo"><label for="nv-tipo">Tipo</label><select id="nv-tipo">${["Filtración", "Comunicación no autorizada", "Acceso no autorizado", "Pérdida", "Destrucción", "Alteración", "Indisponibilidad"].map(x => `<option>${x}</option>`).join("")}</select></div>
    <div class="campo ancho"><label for="nv-d">Qué pasó</label><textarea id="nv-d" rows="3"></textarea><span class="ayuda">Sin datos de los titulares: describa el hecho, no a las personas.</span></div></div>
    <div class="acciones"><button class="boton" type="button" id="nv-ok">Registrar</button></div>`, render);
  $("#nv-ok").onclick = () => {
    const d = $("#nv-d").value.trim(); if (!d) { tostada("Describa qué pasó"); return; }
    const n = VULNERACIONES.filter(v => v.id.startsWith("V-2027")).length + 1, id = "V-2027-" + String(n).padStart(3, "0");
    const v = { id, f: HOY, det: $("#nv-f").value || HOY, por: SESION.id, trat: $("#nv-t").value, paso: "registro", desc: d, tipo: $("#nv-tipo").value, cats: { sensibles: false, menores: false, economicos: false }, afectados: null, riesgo: null, medidas: "", agencia: null, titulares: null, bit: [] };
    VULNERACIONES.unshift(v); anotaRef(v, "Vulneración registrada"); tostada("Vulneración registrada: " + id); abrirVul(id);
  };
}
function lineaVul(v) {
  const i = PASOS_VUL.findIndex(x => x[0] === v.paso);
  return `<div class="flujo" aria-label="Etapa de la vulneración">${PASOS_VUL.map(([k, n], j) => `<span class="${j < i ? "hecho" : j === i ? "actual" : ""}">${esc(n)}</span>`).join("")}</div>`;
}
function abrirVul(id) {
  const v = VULNERACIONES.find(x => x.id === id), p = SESION.perfil, seg = ["seguridad", "delegado"].includes(p), del = p === "delegado";
  let acc = "";
  if (v.paso === "registro" && seg) acc = `<div class="seccion"><h3>Evaluar el riesgo</h3>
    <div class="campo"><span class="lbl">Categorías afectadas</span><label class="opcion"><input type="checkbox" id="ev-s"><span><b>Datos sensibles</b></span></label><label class="opcion"><input type="checkbox" id="ev-m"><span><b>Datos de niños y niñas menores de 14 años</b></span></label><label class="opcion"><input type="checkbox" id="ev-e"><span><b>Obligaciones económicas, financieras, bancarias o comerciales</b></span></label><span class="ayuda">Si marca alguna, también hay que comunicarlo a cada titular afectado.</span></div>
    <div class="campos"><div class="campo"><label for="ev-n">Número aproximado de titulares</label><input type="number" min="0" id="ev-n"></div><div class="campo"><span class="lbl">¿Riesgo razonable para los titulares?</span><label class="opcion"><input type="radio" name="ev-r" value="si"><span><b>Sí</b></span></label><label class="opcion"><input type="radio" name="ev-r" value="no"><span><b>No</b></span></label></div>
    <div class="campo ancho"><label for="ev-med">Medidas adoptadas</label><textarea id="ev-med" rows="2"></textarea></div></div><div class="acciones"><button class="boton" type="button" id="ev-ok">Enviar al delegado</button></div></div>`;
  if (v.paso === "decision" && del) acc = `<div class="seccion"><h3>Decisión del delegado</h3><p class="peq">${v.riesgo ? "Seguridad evaluó que <b>hay riesgo razonable</b> para los titulares: corresponde reportar a la Agencia." : "Seguridad evaluó que no hay riesgo razonable: basta con registrarla."}</p><div class="acciones"><button class="boton ${v.riesgo ? "" : "secundario"}" type="button" id="d-rep">Reportar a la Agencia hoy</button><button class="boton ${v.riesgo ? "secundario" : ""}" type="button" id="d-no">No reportar y cerrar</button></div></div>`;
  if (v.paso === "comunicacion" && del) acc = `<div class="seccion"><h3>Comunicación</h3>${debeComunicarTitulares(v) ? `<p class="peq">Hay datos de una categoría especial: se comunica a cada titular en lenguaje claro, con los datos afectados, sus consecuencias y las medidas. Si no es posible, por un aviso en un medio masivo de alcance nacional.</p>${v.titulares ? chip("Comunicada a los titulares el " + fF(v.titulares.f) + " · " + v.titulares.medio, "c-disp", "✓") : `<div class="campo"><label for="c-m">Medio</label><select id="c-m"><option>Comunicación individual</option><option>Aviso en medio masivo nacional</option></select></div><div class="acciones"><button class="boton" type="button" id="c-tit">Registrar comunicación a los titulares</button></div>`}` : `<p class="peq">No hay categorías especiales: no corresponde comunicar a los titulares.</p>`}<div class="acciones"><button class="boton secundario" type="button" id="c-cerrar" ${debeComunicarTitulares(v) && !v.titulares ? "disabled" : ""}>Cerrar la vulneración</button></div></div>`;
  const cats = [v.cats.sensibles && "sensibles", v.cats.menores && "menores de 14 años", v.cats.economicos && "económicos"].filter(Boolean);
  const cuerpo = `${lineaVul(v)}${acc}<div class="seccion"><h3>Registro</h3><dl class="ficha"><dt>Detectada</dt><dd class="num">${fF(v.det)} · registrada por ${esc(nomU(v.por))}</dd><dt>Tratamiento</dt><dd>${esc(TRAT(v.trat).id + " · " + TRAT(v.trat).n)}</dd><dt>Tipo</dt><dd>${esc(v.tipo)}</dd><dt>Qué pasó</dt><dd>${esc(v.desc)}</dd>
    <dt>Categorías</dt><dd>${v.riesgo === null ? `<span class="tenue">Sin evaluar</span>` : cats.length ? cats.join(", ") : "Ninguna especial"}</dd><dt>Afectados</dt><dd>${v.afectados ?? "—"}</dd><dt>Riesgo razonable</dt><dd>${v.riesgo === null ? "—" : v.riesgo ? "Sí" : "No"}</dd><dt>Medidas</dt><dd>${esc(v.medidas || "—")}</dd>
    <dt>Agencia</dt><dd>${v.agencia ? "Reportada el " + fF(v.agencia) : "No reportada"}</dd><dt>Titulares</dt><dd>${v.titulares ? "Comunicada el " + fF(v.titulares.f) : debeComunicarTitulares(v) ? "Por comunicar" : "No corresponde"}</dd></dl></div>
    <div class="seccion"><h3>Bitácora</h3><div class="tabla-env"><table><tbody>${v.bit.map(b => `<tr><td class="num">${fF(b.f)}</td><td class="peq">${esc(b.u)}</td><td>${esc(b.a)}</td></tr>`).join("")}</tbody></table></div></div>`;
  cajon(v.id, v.paso === "cerrada" ? chip("Cerrada", "c-disp", "✓") : chip(PASOS_VUL.find(x => x[0] === v.paso)[1], "c-pend", "◷"), cuerpo, render);
  if ($("#ev-ok")) $("#ev-ok").onclick = () => {
    const r = ($$("[name=ev-r]").find(x => x.checked) || {}).value; if (!r) { tostada("Indique si hay riesgo razonable"); return; }
    Object.assign(v, { cats: { sensibles: $("#ev-s").checked, menores: $("#ev-m").checked, economicos: $("#ev-e").checked }, afectados: +$("#ev-n").value || 0, riesgo: r === "si", medidas: $("#ev-med").value.trim(), paso: "decision" });
    anotaRef(v, "Evaluación: " + (v.riesgo ? "riesgo razonable" : "sin riesgo razonable") + " · " + v.afectados + " titulares"); tostada("Enviada al delegado"); abrirVul(id);
  };
  if ($("#d-rep")) $("#d-rep").onclick = () => { v.agencia = HOY; v.paso = "comunicacion"; anotaRef(v, "Reportada a la Agencia (simulado)"); tostada("Reporte a la Agencia registrado (simulado)"); abrirVul(id); };
  if ($("#d-no")) $("#d-no").onclick = () => { v.paso = "cerrada"; anotaRef(v, "No se reporta a la Agencia: queda registrada"); tostada("Vulneración cerrada"); abrirVul(id); };
  if ($("#c-tit")) $("#c-tit").onclick = () => { v.titulares = { f: HOY, medio: $("#c-m").value }; anotaRef(v, "Comunicada a los titulares · " + v.titulares.medio); abrirVul(id); };
  if ($("#c-cerrar")) $("#c-cerrar").onclick = () => { v.paso = "cerrada"; anotaRef(v, "Vulneración cerrada"); tostada("Vulneración cerrada"); abrirVul(id); };
}

/* ---------- Evaluaciones de impacto (art. 15 ter) ---------- */
function vEipd() {
  const p = SESION.perfil, L = TRATAMIENTOS.filter(t => criteriosDe(t).length && (p !== "gerencia" || t.dueno === SESION.id));
  const est = t => (EIPD[t.id] || (EIPD[t.id] = { estado: "falta" })).estado;
  const boton = t => { const e = est(t); if (p === "gerencia" && t.dueno === SESION.id && e === "falta") return `<button class="boton chico" type="button" data-eipd="${t.id}" data-a="curso">Iniciar</button>`;
    if (p === "gerencia" && t.dueno === SESION.id && e === "curso") return `<button class="boton chico" type="button" data-eipd="${t.id}" data-a="fiscalia">Enviar a Fiscalía</button>`;
    if (p === "fiscalia" && e === "fiscalia") return `<button class="boton chico" type="button" data-eipd="${t.id}" data-a="lista">Dar por terminada</button>`; return ""; };
  return volverHTML() + cab("Evaluaciones de impacto", "Antes de iniciar un tratamiento de alto riesgo se evalúan su necesidad y proporcionalidad, sus riesgos y las medidas para mitigarlos.", "Art. 15 ter") + avisoEjemplo() +
    `<div class="regla av" style="margin-bottom:var(--e-4)"><span class="ico">?</span><div><b>Exigibilidad por confirmar con Fiscalía</b><span>El art. 21 enumera los artículos que se aplican a los órganos públicos y no nombra el art. 15 ter. Mientras Fiscalía no lo confirme, la plataforma la trata como buena práctica.</span></div></div>
    <section class="panel"><header><div><h2>Tratamientos que cumplen algún criterio</h2><span class="sub">${CRIT_EIPD.map(c => esc(c[1])).join(" · ")}</span></div></header><div class="tabla-env"><table><thead><tr><th>Tratamiento</th><th>Criterios</th><th>Dueño</th><th>Estado</th><th></th></tr></thead><tbody>${L.map(t => `<tr><td><span class="mono peq">${t.id}</span> ${esc(t.n)}</td><td class="peq">${criteriosDe(t).map(c => c[1]).join("<br>")}</td><td class="peq">${t.dueno ? esc(nomU(t.dueno)) : porDefinir()}</td><td>${chip(...EST_EIPD[est(t)])}</td><td class="d">${boton(t)}</td></tr>`).join("") || `<tr><td colspan="5" class="vacio-chico">Ninguno de sus tratamientos cumple los criterios.</td></tr>`}</tbody></table></div>
    <div class="leyenda"><span class="peq tenue">Contenido mínimo según el art. 15 ter: descripción de las operaciones, finalidad, necesidad y proporcionalidad, riesgos y medidas de mitigación. La Agencia publicará una lista orientativa y criterios mínimos.</span></div></section>`;
}
POST.eipd = () => $$("[data-eipd]").forEach(b => b.onclick = () => { const t = TRAT(b.dataset.eipd), a = b.dataset.a; EIPD[t.id] = { estado: a, f: HOY }; anotaRef(t, "Evaluación de impacto: " + EST_EIPD[a][0].toLowerCase()); tostada("Evaluación de impacto: " + EST_EIPD[a][0].toLowerCase()); render(); });

/* ---------- Encargados de tratamiento (art. 15 bis) ---------- */
function vEncargados() {
  return volverHTML() + cab("Encargados de tratamiento", "Proveedores que tratan datos por cuenta de CONAF. El contrato debe tener las cláusulas del art. 15 bis; sin ellas el encargo no está cubierto.", "Art. 15 bis") + avisoEjemplo() +
    `<section class="panel"><div class="tabla-env"><table><thead><tr><th>Encargado</th><th>Tratamientos</th><th>Vigencia</th><th>Cláusulas</th><th></th></tr></thead><tbody>${ENCARGADOS.map(e => `<tr><td><span class="mono peq">${e.id}</span> ${esc(e.n)}</td><td class="peq">${e.trat.map(id => esc(TRAT(id).n)).join("<br>")}</td><td class="num">hasta ${fF(e.vence)}</td><td>${e.ok.length === CLAUSULAS.length ? chip("Completo", "c-disp", "✓") : chip(e.ok.length + " de " + CLAUSULAS.length, "c-malo", "!")}</td><td class="d"><button class="boton chico" type="button" data-enc="${e.id}">Revisar</button></td></tr>`).join("")}</tbody></table></div>
    <div class="leyenda"><span class="peq tenue">La Agencia pondrá modelos tipo de contrato en su página web (art. 15 bis).</span></div></section>`;
}
POST.encargados = () => $$("[data-enc]").forEach(b => b.onclick = () => abrirEnc(b.dataset.enc));
function abrirEnc(id) {
  const e = ENCARGADOS.find(x => x.id === id), edita = ["fiscalia", "delegado"].includes(SESION.perfil);
  cajon(id, esc(e.n), `<div class="seccion"><h3>Cláusulas del contrato</h3>${CLAUSULAS.map(([k, n]) => `<label class="opcion"><input type="checkbox" data-cl="${k}" ${e.ok.includes(k) ? "checked" : ""} ${edita ? "" : "disabled"}><span><b>${esc(n)}</b></span></label>`).join("")}${edita ? `<div class="acciones"><button class="boton" type="button" id="cl-ok">Guardar revisión</button></div>` : ""}</div>`, render);
  if ($("#cl-ok")) $("#cl-ok").onclick = () => { e.ok = $$("[data-cl]").filter(x => x.checked).map(x => x.dataset.cl); BIT.unshift({ f: HOY, u: nomU(SESION.id), caso: e.id, a: "Revisión del contrato: " + e.ok.length + " de " + CLAUSULAS.length + " cláusulas" }); tostada("Revisión guardada"); cerrarCapa(); render(); };
}

/* ---------- Convenios de cesión (art. 22) ---------- */
function vConvenios() {
  const edita = ["fiscalia", "delegado"].includes(SESION.perfil), mes = MESES[+MES_PUB.slice(5) - 1] + " " + MES_PUB.slice(0, 4);
  return volverHTML() + cab("Convenios de cesión", "Convenios con otros órganos públicos y con entidades privadas para comunicar o ceder datos personales. Se informan mensualmente en la web institucional y lo fiscaliza la Agencia.", "Art. 22") + avisoEjemplo() +
    `<section class="panel"><header><div><h2>Publicación de ${mes}</h2><span class="sub">${porPublicar().length ? porPublicar().length + " convenios sin publicar este mes" : "Todos los convenios vigentes están publicados"}</span></div>${porPublicar().length ? chip("Pendiente", "c-pend", "◷") : chip("Al día", "c-disp", "✓")}</header>
    <div class="tabla-env"><table><thead><tr><th>Convenio</th><th>Con</th><th>Tratamiento</th><th>Finalidad</th><th>Vigente desde</th><th>${mes}</th></tr></thead><tbody>${CONVENIOS.map(c => `<tr><td class="mono peq">${c.id}</td><td>${esc(c.con)}<br>${chip(c.tipo === "publico" ? "Órgano público" : "Entidad privada", c.tipo === "publico" ? "c-res" : "c-pend", "◆")}${c.base ? `<br><span class="peq tenue">${esc(c.base)}</span>` : ""}</td><td class="peq">${esc(TRAT(c.trat).n)}</td><td class="peq">${esc(c.fin)}</td><td class="num">${fF(c.desde)}</td><td>${c.pub.includes(MES_PUB) ? chip("Publicado", "c-disp", "✓") : edita ? `<button class="boton chico" type="button" data-pub="${c.id}">Marcar publicado</button>` : chip("Sin publicar", "c-pend", "◷")}</td></tr>`).join("")}</tbody></table></div>
    <div class="leyenda"><span class="peq tenue">A privados sólo se cede con consentimiento del titular, salvo fiscalización o inspección (art. 22 inc. 4°). El listado público no contiene datos de personas.</span></div></section>`;
}
POST.convenios = () => $$("[data-pub]").forEach(b => b.onclick = () => { const c = CONVENIOS.find(x => x.id === b.dataset.pub); c.pub.push(MES_PUB); BIT.unshift({ f: HOY, u: nomU(SESION.id), caso: c.id, a: "Publicado en la web del mes " + MES_PUB }); tostada("Publicación registrada"); render(); });
