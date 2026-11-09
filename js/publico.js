/* CON012 · sitio público: página de datos personales (punto de entrada), solicitud y consulta de estado. */
"use strict";

/* ---------- Página «Protección de datos personales» (art. 14 ter) ---------- */
const ITEMS_14TER = [ // art. 14 ter de la Ley N° 21.719, letras a) a l)
  ["a", "Política de tratamiento de datos personales", "La política que adopta CONAF, con su fecha y versión.", porDefinir("Por aprobar")],
  ["b", "Responsable, representante legal y encargado de prevención", "Corporación Nacional Forestal, su representante legal y, si existe, el encargado de prevención.", porDefinir("Por confirmar")],
  ["c", "Domicilio y medios para presentar solicitudes", "Formulario web con Clave Única y formulario físico en las Oficinas de Partes de Oficina Central y de las direcciones regionales. Domicilio postal y correo electrónico por publicar.", chip("Vías confirmadas · 28-10-2026", "c-disp", "✓")],
  ["d", "Datos que trata CONAF", "Categorías de datos, universo de personas, destinatarios, finalidades y base de legitimidad de cada tratamiento. Sale de la matriz de datos personales.", porDefinir("Por completar")],
  ["e", "Política y medidas de seguridad", "La política y las medidas para proteger las bases de datos personales.", porDefinir("Por aprobar")],
  ["f", "Sus derechos ante CONAF", "Acceso, rectificación, supresión y oposición, y bloqueo temporal, en los términos del art. 23 para los órganos públicos.", chip("Ley vigente desde 01-12-2026", "c-res", "■")],
  ["g", "Reclamo ante la Agencia", "Si CONAF rechaza su solicitud o no responde a tiempo, puede reclamar ante la Agencia de Protección de Datos Personales dentro de 30 días hábiles.", chip("Art. 11 y 41", "c-res", "■")],
  ["h", "Transferencias internacionales", "Si CONAF transfiere datos a otro país u organización internacional y con qué garantías.", porDefinir("Por confirmar")],
  ["i", "Período de conservación", "Por cuánto tiempo se conservan los datos.", porDefinir("Por confirmar")],
  ["j", "Fuente de los datos", "De dónde provienen los datos y si proceden de fuentes de acceso público.", porDefinir("Por confirmar")],
  ["k", "Retiro del consentimiento", "Cuando un tratamiento se basa en el consentimiento, el derecho a retirarlo en cualquier momento.", porDefinir("Por confirmar si aplica")],
  ["l", "Decisiones automatizadas", "Si existen decisiones automatizadas o perfiles, la lógica aplicada y sus consecuencias.", porDefinir("Por confirmar")]
];
function vPagina() {
  return cab("Protección de datos personales", "Información que CONAF publica sobre el tratamiento de sus datos y cómo ejercer sus derechos.", "Art. 14 ter, letras a) a l) · propuesta") +
    `<div class="acciones" style="margin-bottom:var(--e-5)"><button class="boton grande" type="button" data-ir="solicitud">${ico("plus")}Presentar una solicitud</button><button class="boton secundario grande" type="button" data-ir="mis">${ico("buscar")}Consultar mis solicitudes</button></div>
    <ol class="items-14ter">${ITEMS_14TER.map(([l, t, d, e]) => `<li><span class="n num">${l}</span><div><h3>${t}</h3><p>${d}</p></div><div class="e">${e}</div></li>`).join("")}</ol>
    <p class="nota" style="margin-top:var(--e-4)">¿No tiene Clave Única? Puede presentar su solicitud con el formulario físico en la Oficina de Partes de Oficina Central o de cualquier dirección regional de CONAF.</p>`;
}

/* ---------- Clave Única (simulada) ---------- */
function pedirClaveUnica(luego) {
  if (SESION.cu) return luego();
  cajon("Clave Única", "Simulación", `<p>En producción, este botón lleva a Clave Única del Estado y vuelve con su RUN y su nombre verificados. CONAF hoy no cuenta con la integración: es una condición para operar el formulario web ${porDefinir("Informática")}.</p>
    <dl class="ficha"><dt>RUN</dt><dd class="mono">${esc(SESION.run)}</dd><dt>Nombre</dt><dd>${esc(SESION.nom)}</dd></dl>
    <div class="acciones"><button class="boton grande" type="button" id="cu-ok">${ico("candado")}Autorizar (simulado)</button></div>`);
  $("#cu-ok").onclick = () => { SESION.cu = true; cerrarCapa(); tostada("Identidad verificada con Clave Única (simulado)"); luego(); };
}

/* ---------- Solicitud paso a paso ---------- */
let SOL = null;
const solNueva = () => ({ paso: 1, calidad: "titular", otro: { run: "", nom: "" }, poder: false, der: {}, detalle: "", fundBloq: "", docs: 0, medio: "correo", correo: "", region: "", prov: "", comuna: "", dom: "", retiro: "Oficina Central", decl: false, err: [] });
const PASOS = ["Quién solicita", "Qué pide", "Cómo recibe la respuesta", "Revisar y enviar"];
function vSolicitud() {
  if (!SOL) SOL = solNueva();
  const p = SOL.paso;
  return volverHTML("Volver a Datos Personales") + cab("Presentar una solicitud", "Ejercicio de derechos sobre datos personales · Ley N° 21.719", "") +
    `<div class="progreso" aria-label="Paso ${p} de 4"><div class="pr-txt"><b>Paso ${p} de 4</b> · ${PASOS[p - 1]}</div><div class="pr-barra"><span style="width:${p * 25}%"></span></div><ol class="pr-pasos">${PASOS.map((t, i) => `<li class="${i + 1 < p ? "hecho" : i + 1 === p ? "actual" : ""}">${t}</li>`).join("")}</ol></div>
    ${SOL.err.length ? `<div class="faltan" role="alert" tabindex="-1" id="faltan"><b>Revise lo siguiente:</b><ul>${SOL.err.map(e => `<li>${esc(e)}</li>`).join("")}</ul></div>` : ""}
    <form id="f-sol" class="form-sol" novalidate>${[paso1, paso2, paso3, paso4][p - 1]()}
    <div class="acciones barra-pasos">${p > 1 ? `<button class="boton secundario" type="button" id="sol-atras">← Anterior</button>` : ""}<button class="boton" type="submit">${p < 4 ? "Continuar →" : ico("enviar") + "Enviar solicitud"}</button></div></form>`;
}
const radio = (name, v, act, t, d) => `<label class="opcion"><input type="radio" name="${name}" value="${v}" ${act === v ? "checked" : ""}><span><b>${t}</b>${d ? `<small>${d}</small>` : ""}</span></label>`;
function paso1() {
  return `<fieldset><legend>¿Quién presenta la solicitud?</legend><div class="lista-opciones">
    ${radio("calidad", "titular", SOL.calidad, "Soy el titular de los datos", "Los derechos son personales: puede ejercerlos directamente.")}
    ${radio("calidad", "representante", SOL.calidad, "Represento al titular", "Representante legal o mandatario (art. 4°). Debe adjuntar poder notarial: no se acepta poder simple.")}
    ${radio("calidad", "heredero", SOL.calidad, "Soy heredero de un titular fallecido", "Debe acreditar la calidad de heredero. No procede si el titular lo prohibió o una ley lo establece (art. 4°).")}</div></fieldset>
    <fieldset><legend>Identificación</legend>
    ${SESION.cu ? `<div class="estado-linea">${chip("Verificado con Clave Única (simulado)", "c-disp", "✓")}<span class="mono">${esc(SESION.run)}</span><span>${esc(SESION.nom)}</span></div>` : `<p>Para continuar, identifíquese con su Clave Única.</p><div><button class="boton" type="button" id="sol-cu">${ico("candado")}Ingresar con Clave Única</button></div>`}</fieldset>
    ${SOL.calidad !== "titular" ? `<fieldset><legend>${SOL.calidad === "representante" ? "Titular representado" : "Titular fallecido"}</legend><div class="campos">
      <div class="campo"><label for="o-run">RUN del titular *</label><input type="text" id="o-run" class="mono" value="${esc(SOL.otro.run)}" placeholder="12.345.678-9" maxlength="12"></div>
      <div class="campo"><label for="o-nom">Nombre del titular *</label><input type="text" id="o-nom" value="${esc(SOL.otro.nom)}"></div>
      <div class="campo ancho"><label class="adj"><input type="checkbox" id="o-poder" ${SOL.poder ? "checked" : ""}> ${SOL.calidad === "representante" ? "Adjunto el poder notarial" : "Adjunto el documento que acredita la calidad de heredero"} * <span class="tenue peq">(simulado: no se sube ningún archivo)</span></label></div></div></fieldset>` : ""}`;
}
function paso2() {
  return `<fieldset><legend>¿Qué derecho desea ejercer?</legend><p class="peq tenue" style="margin-bottom:var(--e-3)">Puede marcar más de uno.</p><div class="lista-opciones">
    ${DERECHOS.map(d => `<label class="opcion"><input type="checkbox" name="der" value="${d.k}" ${SOL.der[d.k] ? "checked" : ""}><span><b>${d.n}</b><small>${d.d}</small>${d.verificar ? `<small>${chip("Por confirmar", "c-pend", "?")} ${esc(d.verificar)}</small>` : ""}</span></label>`).join("")}</div></fieldset>
    <fieldset><legend>Detalle de la solicitud</legend><div class="campos">
    <div class="campo ancho"><label for="s-det">Qué información pide y dónde cree que consta *</label><textarea id="s-det" rows="4" placeholder="Por ejemplo: el trámite, el programa o la oficina, y el año aproximado.">${esc(SOL.detalle)}</textarea><span class="ayuda">Obligatorio: ayuda a CONAF a ubicar sus datos.</span></div>
    ${SOL.der.bloqueo ? `<div class="campo ancho"><label for="s-fb">Fundamento del bloqueo temporal *</label><textarea id="s-fb" rows="2">${esc(SOL.fundBloq)}</textarea></div>` : ""}
    <div class="campo ancho"><span class="lbl">Documentos (opcional)</span><div class="acciones"><button class="boton secundario chico" type="button" id="s-doc">${ico("doc")}Adjuntar documento (simulado)</button><span class="tenue peq" id="s-docn">${SOL.docs ? SOL.docs + " adjunto(s)" : "Sin adjuntos"}</span></div></div></div></fieldset>`;
}
function paso3() {
  const ops = SEDES.map(s => `<option ${SOL.retiro === s ? "selected" : ""}>${s}</option>`).join("");
  return `<fieldset><legend>¿Cómo quiere recibir la respuesta?</legend><div class="lista-opciones">
    ${radio("medio", "correo", SOL.medio, MEDIOS.correo, "")}${radio("medio", "carta", SOL.medio, MEDIOS.carta, "")}${radio("medio", "retiro", SOL.medio, MEDIOS.retiro, "Oficina Central o una dirección regional.")}</div></fieldset>
    <fieldset><legend>Datos de contacto</legend><div class="campos">
    <div class="campo ancho"><label for="s-mail">Correo electrónico *</label><input type="text" id="s-mail" inputmode="email" autocomplete="email" value="${esc(SOL.correo)}" placeholder="nombre@ejemplo.cl"><span class="ayuda">Aquí llega el acuse de recibo con el número de caso.</span></div>
    ${SOL.medio === "carta" ? `<div class="campo"><label for="s-reg">Región *</label><select id="s-reg"><option value="">Seleccione</option>${TERRITORIO.map(r => `<option ${SOL.region === r.r ? "selected" : ""}>${r.r}</option>`).join("")}</select></div>
      <div class="campo"><label for="s-prov">Provincia *</label><select id="s-prov" ${SOL.region ? "" : "disabled"}><option value="">${SOL.region ? "Seleccione" : "Seleccione región primero"}</option>${SOL.region ? TERRITORIO.find(r => r.r === SOL.region).p.map(p => `<option ${SOL.prov === p[0] ? "selected" : ""}>${p[0]}</option>`).join("") : ""}</select></div>
      <div class="campo"><label for="s-com">Comuna *</label><select id="s-com" ${SOL.prov ? "" : "disabled"}><option value="">${SOL.prov ? "Seleccione" : "Seleccione provincia primero"}</option>${SOL.prov ? TERRITORIO.find(r => r.r === SOL.region).p.find(p => p[0] === SOL.prov)[1].map(c => `<option ${SOL.comuna === c ? "selected" : ""}>${c}</option>`).join("") : ""}</select></div>
      <div class="campo"><label for="s-dom">Domicilio *</label><input type="text" id="s-dom" value="${esc(SOL.dom)}" autocomplete="street-address"></div>` : ""}
    ${SOL.medio === "retiro" ? `<div class="campo ancho"><label for="s-ret">Oficina de Partes donde retirará la respuesta *</label><select id="s-ret">${ops}</select>${oficinaDe(SOL.retiro) ? `<span class="ayuda">${esc(oficinaDe(SOL.retiro).d)}${oficinaDe(SOL.retiro).t ? " · Tel. " + esc(oficinaDe(SOL.retiro).t) : ""}${oficinaDe(SOL.retiro).c ? " · " + esc(oficinaDe(SOL.retiro).c) : ""}</span>` : ""}</div>` : ""}</div></fieldset>`;
}
function paso4() {
  const ders = Object.keys(SOL.der).filter(k => SOL.der[k]);
  const venc = sumaCorridos(HOY, PARAM.RESPUESTA);
  return `<section class="panel"><header><h2>Resumen</h2></header><div class="cuerpo"><dl class="ficha">
    <dt>Solicitante</dt><dd>${esc(SESION.nom)} · <span class="mono">${esc(SESION.run)}</span> · ${CALIDAD[SOL.calidad]}</dd>
    ${SOL.calidad !== "titular" ? `<dt>Titular</dt><dd>${esc(SOL.otro.nom)} · <span class="mono">${esc(SOL.otro.run)}</span></dd>` : ""}
    <dt>Derechos</dt><dd>${ders.map(k => DER[k]).join(", ")}</dd><dt>Detalle</dt><dd>${esc(SOL.detalle)}</dd>
    <dt>Respuesta</dt><dd>${MEDIOS[SOL.medio]}${SOL.medio === "retiro" ? " · " + esc(SOL.retiro) : SOL.medio === "carta" ? " · " + esc(SOL.dom + ", " + SOL.comuna) : ""}</dd><dt>Correo</dt><dd>${esc(SOL.correo)}</dd></dl></div></section>
    <section class="panel"><header><h2>Plazos que se activan</h2>${chip("Art. 11 · Ley N° 21.719", "c-disp", "✓")}</header><div class="cuerpo"><ul class="plazos">
    <li>Acuse de recibo inmediato con número de caso.</li><li>Respuesta a más tardar el <b>${fF(venc)}</b> (${PARAM.RESPUESTA} días corridos, prorrogables una vez).</li>
    ${SOL.der.bloqueo ? `<li>Bloqueo temporal: se resuelve en ${PARAM.BLOQUEO} días hábiles, a más tardar el <b>${fF(sumaHabiles(HOY, PARAM.BLOQUEO))}</b>.</li>` : ""}
    <li>Si CONAF le pide antecedentes, tendrá ${PARAM.ANTECEDENTES} días hábiles para aportarlos ${chip("propuesta", "c-pend", "?")}.</li><li>La solicitud se dirige a la Directora Ejecutiva, jefa superior del servicio (art. 23 inc. 3°).</li></ul></div></section>
    <label class="opcion decl"><input type="checkbox" id="s-decl" ${SOL.decl ? "checked" : ""}><span>Declaro que los antecedentes son verdaderos y que CONAF podrá verificar mi identidad y, si corresponde, la representación invocada. *</span></label>`;
}
function leerPaso() {
  const v = id => ($("#" + id) || {}).value;
  if (SOL.paso === 1) { const r = $("input[name=calidad]:checked"); if (r) SOL.calidad = r.value; if ($("#o-run")) { SOL.otro = { run: v("o-run").trim(), nom: v("o-nom").trim() }; SOL.poder = $("#o-poder").checked; } }
  if (SOL.paso === 2) { SOL.der = {}; $$("input[name=der]:checked").forEach(i => SOL.der[i.value] = true); SOL.detalle = v("s-det").trim(); if ($("#s-fb")) SOL.fundBloq = v("s-fb").trim(); }
  if (SOL.paso === 3) { const r = $("input[name=medio]:checked"); if (r) SOL.medio = r.value; SOL.correo = v("s-mail").trim(); if ($("#s-dom")) SOL.dom = v("s-dom").trim(); if ($("#s-ret")) SOL.retiro = v("s-ret"); }
  if (SOL.paso === 4) SOL.decl = $("#s-decl").checked;
}
function validarPaso() {
  const e = [];
  if (SOL.paso === 1) { if (!SESION.cu) e.push("Identifíquese con Clave Única."); if (SOL.calidad !== "titular") { if (!SOL.otro.run || !SOL.otro.nom) e.push("Indique el RUN y el nombre del titular."); if (!SOL.poder) e.push(SOL.calidad === "representante" ? "Adjunte el poder notarial." : "Adjunte el documento que acredita la calidad de heredero."); } }
  if (SOL.paso === 2) { if (!Object.keys(SOL.der).length) e.push("Marque al menos un derecho."); if (!SOL.detalle) e.push("Describa qué información pide y dónde cree que consta."); if (SOL.der.bloqueo && !SOL.fundBloq) e.push("Indique el fundamento del bloqueo temporal."); if (SOL.der.bloqueo && Object.keys(SOL.der).length === 1) e.push("El bloqueo temporal acompaña a otra solicitud (rectificación, supresión u oposición)."); }
  if (SOL.paso === 3) { if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(SOL.correo)) e.push("Ingrese un correo electrónico válido."); if (SOL.medio === "carta" && (!SOL.region || !SOL.prov || !SOL.comuna || !SOL.dom)) e.push("Complete región, provincia, comuna y domicilio."); }
  if (SOL.paso === 4 && !SOL.decl) e.push("Marque la declaración para enviar.");
  return e;
}
POST.solicitud = () => {
  const f = $("#f-sol"); if (!f) return;
  const repinta = () => { leerPaso(); render(); };
  $$("input[name=calidad],input[name=medio],input[name=der][value=bloqueo]").forEach(i => i.onchange = repinta);
  if ($("#sol-cu")) $("#sol-cu").onclick = () => { leerPaso(); pedirClaveUnica(render); };
  if ($("#s-doc")) $("#s-doc").onclick = () => { SOL.docs++; $("#s-docn").textContent = SOL.docs + " adjunto(s)"; };
  if ($("#s-reg")) $("#s-reg").onchange = e => { leerPaso(); SOL.region = e.target.value; SOL.prov = ""; SOL.comuna = ""; render(); };
  if ($("#s-prov")) $("#s-prov").onchange = e => { leerPaso(); SOL.prov = e.target.value; SOL.comuna = ""; render(); };
  if ($("#s-com")) $("#s-com").onchange = e => { SOL.comuna = e.target.value; };
  if ($("#sol-atras")) $("#sol-atras").onclick = () => { leerPaso(); SOL.err = []; SOL.paso--; render(); };
  if ($("#faltan")) $("#faltan").focus();
  f.onsubmit = ev => {
    ev.preventDefault(); leerPaso(); SOL.err = validarPaso();
    if (SOL.err.length) { render(); return; }
    if (SOL.paso < 4) { SOL.paso++; render(); window.scrollTo(0, 0); return; }
    enviarSolicitud();
  };
};
let ULTIMO = null;
function enviarSolicitud() {
  const ders = Object.keys(SOL.der);
  const c = nuevoCaso({ num: nuevoNumero(), ingreso: HOY, desde: HOY, via: "web", sede: sedeParaWeb(SOL.medio === "carta" ? SOL.region : ""), calidad: SOL.calidad, derechos: ders, detalle: SOL.detalle, medio: SOL.medio, retiro: SOL.retiro, correo: SOL.correo,
    tit: SOL.calidad === "titular" ? { nom: SESION.nom, run: SESION.run } : { nom: SOL.otro.nom, run: SOL.otro.run }, rep: SOL.calidad === "titular" ? null : { nom: SESION.nom, run: SESION.run }, bloq: SOL.der.bloqueo ? { pide: HOY, res: null, fund: SOL.fundBloq } : null, identidad: true });
  c.bit.push({ f: HOY, u: "Sistema", a: "Ingreso por formulario web con Clave Única (simulada) · acuse enviado a " + c.correo });
  CASOS.push(c); BIT.unshift({ f: HOY, u: "Sistema", caso: c.num, a: "Ingreso por formulario web" });
  ULTIMO = c; SOL = null; ir("acuse");
}
function vAcuse() {
  const c = ULTIMO; if (!c) return vPagina();
  return `<section class="acuse panel"><div class="cuerpo"><span class="app-ico grande" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#i-check"/></svg></span>
    <h1>Solicitud recibida</h1><p class="tenue">Número de caso</p><p class="acuse-num mono">${c.num}</p>
    <p>Recibida el ${fLarga(c.ingreso)}. Enviamos una copia íntegra a <b>${esc(c.correo)}</b> (simulado).</p></div></section>
    <section class="panel"><header><h2>Qué ocurre ahora</h2>${chip("Art. 11 · Ley N° 21.719", "c-disp", "✓")}</header><div class="cuerpo"><ul class="plazos">
    <li>CONAF registra su solicitud y resuelve si procede.</li><li>El área que trata sus datos analiza lo pedido y prepara la respuesta.</li>
    <li>Recibirá la respuesta por ${MEDIOS[c.medio].toLowerCase()} a más tardar el <b>${fF(venceLegal(c))}</b>.</li>
    ${c.bloq ? `<li>Su bloqueo temporal se resuelve a más tardar el <b>${fF(venceBloqueo(c))}</b>.</li>` : ""}
    <li>Si CONAF no responde a tiempo o deniega su solicitud, puede reclamar ante la Agencia de Protección de Datos Personales dentro de 30 días hábiles (art. 11 y 41).</li></ul></div></section>
    <div class="acciones" style="margin-top:var(--e-4)"><button class="boton" type="button" data-ir="mis">${ico("buscar")}Ver mis solicitudes</button><button class="boton secundario" type="button" data-ir="inicio">Volver a Datos Personales</button></div>`;
}

/* ---------- Mis solicitudes (consulta de estado) ---------- */
const PUB = [["Recibida", ["recepcion"]], ["Revisión de admisibilidad", ["admisibilidad"]], ["En análisis", ["derivacion", "analisis", "revision"]], ["Respuesta en preparación", ["firma", "respuesta"]], ["Respondida", ["cerrado"]]];
function lineaPublica(c) {
  const i = PUB.findIndex(p => p[1].includes(c.etapa));
  return `<div class="flujo" aria-label="Avance de la solicitud">${PUB.map((p, k) => `<span class="${k < i ? "hecho" : k === i ? "actual" : ""}">${p[0]}</span>`).join("")}</div>`;
}
function vMis() {
  if (!SESION.cu) return volverHTML("Volver a Datos Personales") + cab("Mis solicitudes", "Consulte el estado de las solicitudes que presentó.", "") +
    `<section class="panel"><div class="cuerpo"><p>Para ver sus solicitudes, identifíquese con su Clave Única.</p><div class="acciones" style="margin-top:var(--e-3)"><button class="boton" type="button" id="mis-cu">${ico("candado")}Ingresar con Clave Única</button></div></div></section>`;
  const mias = CASOS.filter(c => c.tit.run === SESION.run || (c.rep && c.rep.run === SESION.run)).sort((a, b) => b.ingreso.localeCompare(a.ingreso));
  return volverHTML("Volver a Datos Personales") + cab("Mis solicitudes", `${esc(SESION.nom)} · <span class="mono">${esc(SESION.run)}</span>`, "") +
    `<div class="lista">${mias.length ? mias.map(c => tarjetaPublica(c)).join("") : vacio("No tiene solicitudes", "Cuando presente una, aparecerá aquí.")}</div>`;
}
function tarjetaPublica(c) {
  const ant = esperaAntecedentes(c);
  return `<article class="sol"><div class="fila"><span class="id">${c.num}</span>${ant ? chip("CONAF le pide antecedentes", "c-pend", "?") : abierto(c) ? chip("En trámite", "c-res", "■") : chip(c.cierre.res === "No admitida" ? "No admitida" : "Respondida", "c-neu", "✓")}</div>
    <h3>${c.derechos.map(k => DER[k]).join(", ")}</h3>
    <div class="meta"><span>Ingreso <b>${fF(c.ingreso)}</b></span>${abierto(c) ? `<span>Respuesta a más tardar <b>${fF(venceLegal(c))}</b>${c.prorroga ? " (prorrogado)" : ""}</span>` : `<span>Respondida <b>${fF(c.cierre.f)}</b></span>`}<span>${VIAS[c.via]}</span></div>
    ${lineaPublica(c)}
    ${ant ? `<form class="antecedentes" data-ant="${c.num}"><p><b>Antecedentes pedidos:</b> ${esc(c.ant.que)}</p><p class="peq">Plazo para aportarlos: hasta el <b>${fF(venceAntecedentes(c))}</b>. Este requerimiento no suspende el plazo de respuesta.</p>
      <div class="campo"><label for="ant-${c.num}">Su respuesta *</label><textarea id="ant-${c.num}" rows="3"></textarea></div><div class="acciones"><button class="boton" type="submit">${ico("enviar")}Enviar antecedentes</button></div></form>` : ""}
    ${!abierto(c) ? `<p class="peq">${c.cierre.res === "No admitida" ? "Motivo: " + esc(c.cierre.causal || "") + ". " : ""}${c.cierre.res !== "Acogida" ? "Puede reclamar ante la Agencia de Protección de Datos Personales dentro de 30 días hábiles." : ""}</p><div class="acciones"><button class="boton secundario chico" type="button" data-resp="${c.num}">${ico("doc")}Ver respuesta (simulado)</button></div>` : ""}</article>`;
}
POST.mis = () => {
  if ($("#mis-cu")) $("#mis-cu").onclick = () => pedirClaveUnica(render);
  $$("form[data-ant]").forEach(f => f.onsubmit = e => {
    e.preventDefault(); const c = CASOS.find(x => x.num === f.dataset.ant), t = f.querySelector("textarea");
    if (!t.value.trim()) { t.setAttribute("aria-invalid", "true"); t.focus(); return; }
    c.ant.rec = HOY; c.ant.resp = t.value.trim(); anota(c, "El titular aportó antecedentes por el sitio web"); tostada("Antecedentes enviados · caso " + c.num); render();
  });
  $$("[data-resp]").forEach(b => b.onclick = () => { const c = CASOS.find(x => x.num === b.dataset.resp); cajon("Respuesta " + c.num, "Documento simulado", `<p>Aquí se muestra la Carta Oficial de respuesta que se envió el ${fF(c.cierre.f)}${c.cierre.medio ? " por " + MEDIOS[c.cierre.medio].toLowerCase() : ""}. Resultado: <b>${esc(c.cierre.res)}</b>.</p><p class="nota">Documento no disponible en la maqueta.</p>`); });
};
