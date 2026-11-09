/* CON012 · reglas del caso: plazos, estado, responsable y transiciones. */
"use strict";

/* ---------- Plazos ---------- */
const venceLegal = c => sumaCorridos(c.ingreso, PARAM.RESPUESTA + (c.prorroga ? PARAM.PRORROGA : 0));
const diasLegal = c => corridosEntre(HOY, venceLegal(c));
const venceBloqueo = c => c.bloq ? sumaHabiles(c.bloq.pide, PARAM.BLOQUEO) : null;
const bloqueoPendiente = c => !!(c.bloq && !c.bloq.res && c.etapa !== "cerrado");
const venceAntecedentes = c => c.ant ? sumaHabiles(c.ant.pide, PARAM.ANTECEDENTES) : null;
const esperaAntecedentes = c => !!(c.ant && !c.ant.rec && c.etapa !== "cerrado");
function venceInterno(c) { const n = PARAM.interno[c.etapa]; return n ? sumaHabiles(c.desde, n) : null; }
const abierto = c => c.etapa !== "cerrado";

function semaforo(c) {
  if (!abierto(c)) return chip("Cerrado", "c-neu", "✓");
  const d = diasLegal(c);
  if (d < 0) return chip(`Vencido hace ${-d} ${-d === 1 ? "día" : "días"}`, "c-malo", "✕");
  if (d <= 2) return chip(d === 0 ? "Vence hoy" : `Urgente · ${d} ${d === 1 ? "día" : "días"}`, "c-malo", "▲");
  if (d <= 9) return chip(`Esta semana · ${d} días`, "c-pend", "!");
  return chip(`Con holgura · ${d} días`, "c-disp", "●");
}
const urgencia = c => reclamoPendiente(c) ? corridosEntre(HOY, venceReclamo(c)) - 50 : !abierto(c) ? 999 : bloqueoPendiente(c) ? -100 : diasLegal(c);

/* ---------- Estado visible ---------- */
function estado(c) {
  if (c.etapa === "cerrado") return c.cierre && c.cierre.res === "No admitida" ? ["No admitida", "c-neu", "⊘"] : c.cierre && c.cierre.res === "Denegada" ? ["Denegada", "c-neu", "⊘"] : ["Respondida", "c-neu", "✓"];
  if (esperaAntecedentes(c)) return ["Requiere antecedentes", "c-pend", "?"];
  return {
    recepcion: [c.identidad ? "Registrada · por admisibilidad" : "Ingresada · por verificar identidad", "c-res", "■"],
    admisibilidad: ["En admisibilidad", "c-terr", "◆"], derivacion: ["Admisible · por derivar", "c-res", "◑"],
    analisis: ["En análisis", "c-terr", "▶"], revision: ["En revisión jurídica", "c-terr", "◆"],
    firma: ["En firma", "c-tall", "✎"], respuesta: ["Firmada · por enviar", "c-res", "➤"]
  }[c.etapa];
}
const chipEstado = c => chip(...estado(c));

/* ---------- Responsable de la etapa ---------- */
function sedeDe(c) { return c.sede; }
function responsable(c) {
  if (!abierto(c)) return null;
  const e = ETAPA[c.etapa];
  if (e.col === "ambito") return c.ambito && AMB(c.ambito) ? AMB(c.ambito).resp : null;
  return RESP[sedeDe(c)][e.col];
}
const sinResponsable = c => abierto(c) && !responsable(c);
function quienTxt(c) {
  if (!abierto(c)) return "—";
  const r = responsable(c);
  if (r) return esc(nomU(r));
  if (c.etapa === "analisis" && !c.ambito) return porDefinir("Sin ámbito");
  return chip("Sin responsable", "c-malo", "!");
}
function visibleParaUsuario(c, u) {
  const r = RESP[c.sede];
  if (u.perfil === "admin" || u.perfil === "delegado") return true;
  if (u.perfil === "fiscalia") return r.admisibilidad === u.id || r.revision === u.id || r.reclamos === u.id;
  if (u.perfil === "gerencia") return AMBITOS.some(a => a.resp === u.id && a.k === c.ambito);
  if (u.perfil === "director") return r.firma === u.id;
  if (u.perfil === "encargado") return ["recibe", "deriva", "responde"].some(k => r[k] === u.id);
  return false;
}
/* Reclamos ante la Agencia (art. 41): CONAF responde en 30 días corridos desde la notificación, prorrogables. */
const reclamoPendiente = c => !!(c.reclamo && !c.reclamo.resp);
const venceReclamo = c => c.reclamo ? sumaCorridos(c.reclamo.notif, PARAM.RECLAMO_RESP + (c.reclamo.prorroga ? PARAM.RECLAMO_RESP : 0)) : null;
function tareaDe(c, u) { // ¿le toca actuar a este usuario?
  if (reclamoPendiente(c) && RESP[c.sede].reclamos === u.id) return true;
  if (!abierto(c)) return false;
  if (bloqueoPendiente(c) && u.perfil === "fiscalia" && RESP[c.sede].admisibilidad === u.id) return true;
  return responsable(c) === u.id;
}

/* ---------- Transiciones ---------- */
function anota(c, a) { c.bit.push({ f: HOY, u: SESION ? nomU(SESION.id) : "Sistema", a }); BIT.unshift({ f: HOY, u: SESION ? nomU(SESION.id) : "Sistema", caso: c.num, a }); }
function pasar(c, etapa, a) { c.etapa = etapa; c.desde = HOY; anota(c, a); }
function nuevoNumero() { const n = correlativo["2027"]++; return "DP-2027-" + String(n).padStart(6, "0"); }
function sedeParaWeb(region) { return PARAM.sedeWeb === "region" && region ? "Dirección Regional " + region : "Oficina Central"; }
