/* CON012 · datos de la maqueta. Todo es ficticio salvo lo marcado con su fuente.
   Marco normativo: Ley N° 21.719 (texto de la BCN, versión con vigencia diferida al 01-12-2026, en los antecedentes
   del proyecto). Antecedentes de la contraparte: correo del delegado de protección de datos del 28-10-2026 (vías de
   ingreso confirmadas; perfiles y flujos por levantar) y observaciones de la reunión del 15-10-2026. */
"use strict";

/* ---------- Parámetros del canal ---------- */
const PARAM = {
  // Plazos legales VERIFICADOS en el texto de la ley.
  legal: [
    { n: "Acuse de recibo", v: "Al recibir la solicitud", art: "art. 11 inc. 2°" },
    { n: "Respuesta a la solicitud", v: "30 días corridos desde la fecha de ingreso", art: "art. 11 inc. 2°" },
    { n: "Prórroga", v: "Una sola vez, hasta 30 días corridos", art: "art. 11 inc. 2°" },
    { n: "Bloqueo temporal", v: "Respuesta en 2 días hábiles desde la recepción; el rechazo se funda y se comunica electrónicamente a la Agencia", art: "art. 11 inc. 6°" },
    { n: "Reclamo del titular ante la Agencia", v: "30 días hábiles desde la respuesta negativa o desde que venció el plazo sin respuesta", art: "art. 11 inc. 4° y 5°; art. 41 a)" },
    { n: "Respuesta de CONAF a un reclamo", v: "30 días corridos desde la notificación de la Agencia, prorrogables por el mismo plazo", art: "art. 41 d)" },
    { n: "Destinatario de la solicitud", v: "El jefe superior del servicio", art: "art. 23 inc. 3°" }
  ],
  propuestos: [ // NO están en la ley: se muestran como propuesta
    { n: "Plazo del titular para aportar antecedentes", v: "5 días hábiles", art: "Sin norma en la Ley N° 21.719 · por definir con Fiscalía" }
  ],
  RESPUESTA: 30, PRORROGA: 30, BLOQUEO: 2, ANTECEDENTES: 5, RECLAMO_RESP: 30,
  interno: { recepcion: null, admisibilidad: null, derivacion: null, analisis: null, revision: null, firma: null, respuesta: null },
  sedeWeb: "pendiente",
  feriados: [{ f: "2026-12-08", n: "Inmaculada Concepción" }, { f: "2026-12-25", n: "Navidad" }, { f: "2027-01-01", n: "Año Nuevo" }]
};

const SEDES = ["Oficina Central"].concat(TERRITORIO.map(r => "Dirección Regional " + r.r));
const OFICINAS = {
  "Oficina Central": { d: "Paseo Bulnes 285, Santiago", t: "+56 (2) 2663 0000", c: "" },
  "Dirección Regional Arica y Parinacota": { d: "AVDA. BENJAMÍN VICUÑA MACKENNA N° 820, ARICA", t: "+56 58 2201201", c: "" },
  "Dirección Regional Tarapacá": { d: "AVDA. DIAGONAL FRANCISCO BILBAO N° 3692, IQUIQUE", t: "+56 57 2383537", c: "" },
  "Dirección Regional Antofagasta": { d: "AVDA. ARGENTINA N° 2510, ANTOFAGASTA", t: "+56 55 2602618", c: "" },
  "Dirección Regional Atacama": { d: "JUAN MARTÍNEZ N° 55 – COPIAPO", t: "+56 52 2213404", c: "" },
  "Dirección Regional Coquimbo": { d: "REGIMIENTO ARICA N° 901, SECTOR PEÑUELAS, COQUIMBO", t: "+56 51 2244769", c: "" },
  "Dirección Regional Valparaíso": { d: "3 NORTE N° 541 – VIÑA DEL MAR", t: "+56 32 2320212", c: "" },
  "Dirección Regional O'Higgins": { d: "TENIENTE CORONEL JOSÉ BDO. CUEVAS N° 480, RANCAGUA", t: "+56 72 2204611", c: "" },
  "Dirección Regional Maule": { d: "4 NORTE N° 1673, TALCA", t: "+56 71 2209510", c: "" },
  "Dirección Regional Ñuble": { d: "PANAMERICANA NORTE N° 3430, CHILLAN", t: "+56 42 2221085", c: "" },
  "Dirección Regional Biobío": { d: "BARROS ARANA N° 514, 3er. PISO LOCAL A, CONCEPCIÓN", t: "+56 41 2624000", c: "" },
  "Dirección Regional La Araucanía": { d: "FRANCISCO BILBAO N° 931 – 2do. PISO, TEMUCO", t: "+56 45 2298114", c: "" },
  "Dirección Regional Los Ríos": { d: "LOS CASTAÑOS N° 100 – ISLA TEJA, VALDIVIA", t: "+56 63 2283426", c: "" },
  "Dirección Regional Los Lagos": { d: "OCHAGAVÍA N° 458 – PUERTO MONTT", t: "+56 65 2486101", c: "" },
  "Dirección Regional Aysén del General Carlos Ibáñez del Campo": { d: "AVDA. OGANA N° 1060 – COYHAIQUE", t: "+56 67 2212109", c: "" },
  "Dirección Regional Magallanes y de la Antártica Chilena": { d: "AVDA. BULNES N° 0309 4º PISO, PUNTA ARENAS", t: "+56 61 2238554", c: "" },
  "Dirección Regional Metropolitana de Santiago": { d: "SAN PIO X N° 2475 – PROVIDENCIA, STGO", t: "+56 22 3280300", c: "" },
};
const oficinaDe = s => OFICINAS[s] || null;
const corta = s => s === "Oficina Central" ? "Oficina Central" : s.replace("Dirección Regional ", "DR ");

/* ---------- Etapas (procedimiento V1, como lo citaba la v3.7; arts. 11 y 23 de la ley) ---------- */
const ETAPAS = [
  { k: "recepcion", n: "Recepción y registro", col: "recibe", hace: "Registra la fecha de ingreso, verifica identidad y representación (art. 11 a) y acusa recibo." },
  { k: "admisibilidad", n: "Admisibilidad", col: "admisibilidad", hace: "Resuelve si la solicitud procede, incluidas las causales del art. 23 inc. 2°." },
  { k: "derivacion", n: "Derivación", col: "deriva", hace: "Asigna el caso al área que trata los datos." },
  { k: "analisis", n: "Análisis y propuesta", col: "ambito", hace: "Localiza los datos, decide y redacta la propuesta de respuesta." },
  { k: "revision", n: "Revisión jurídica", col: "revision", hace: "Revisa el fundamento antes de la firma (art. 11 inc. 4°)." },
  { k: "firma", n: "Firma", col: "firma", hace: "Firma de la respuesta por quien corresponda (art. 23 inc. 3°: jefe superior del servicio)." },
  { k: "respuesta", n: "Respuesta y cierre", col: "responde", hace: "Envía la respuesta escrita, guarda el respaldo y comunica a los cesionarios (art. 11)." }
];
const ETAPA = Object.fromEntries(ETAPAS.map(e => [e.k, e]));
const COLS = [["recibe", "Recibe y registra", "encargado"], ["admisibilidad", "Admisibilidad y bloqueo", "fiscalia"], ["deriva", "Deriva", "encargado"], ["revision", "Revisión jurídica", "fiscalia"], ["firma", "Firma", "director"], ["responde", "Responde y cierra", "encargado"], ["reclamos", "Reclamos ante la Agencia", "fiscalia"]];
/* Una cuenta por función, en todas las sedes: la sede es un dato del caso, no del perfil. */
const PERFIL_EN = (s, k) => COLS.find(c => c[0] === k)[2];
const RECEPTOR = ["encargado"];   // perfiles que reciben y registran

/* ---------- Perfiles: derivados de las funciones del canal ---------- */
const PERFILES = {
  solicitante: { n: "Persona solicitante", ico: "user", d: "Titular, representante o heredero. Presenta solicitudes y consulta su estado." },
  encargado: { n: "Encargado OIRS", ico: "oficina", d: "Recibe y registra las solicitudes de todas las sedes (incluida la Oficina de Partes), verifica identidad, deriva, responde y prorroga." },
  fiscalia: { n: "Unidad Jurídica", ico: "balanza", d: "Admisibilidad, bloqueo temporal, revisión jurídica (V°B°) y reclamos ante la Agencia, en todas las sedes." },
  director: { n: "Director o directora", ico: "firma", d: "Revisa y firma las respuestas de todas las sedes. No deriva." },
  gerencia: { n: "Área que trata los datos", ico: "equipo", d: "Analiza los casos de su ámbito y propone la respuesta." },
  delegado: { n: "Delegado de protección de datos", ico: "escudo", d: "Supervisa el cumplimiento, ve todos los casos y deja observaciones (art. 50)." },
  admin: { n: "Administración del canal", ico: "config", d: "Responsables por etapa y sede, plazos internos, feriados y bitácora." }
};
const USUARIOS = [
  { id: "u1", perfil: "solicitante", nom: "Carolina Andrea Muñoz Pérez", run: runFicticio(16482337), cargo: "Titular de los datos" },
  { id: "u2", perfil: "encargado", nom: "Paula Rojas Soto", cargo: "Todas las sedes" },
  { id: "u4", perfil: "fiscalia", nom: "Andrés Contreras Silva", cargo: "Todas las sedes" },
  { id: "u12", perfil: "director", nom: "Carmen Lillo Varas", cargo: "Oficina Central y regiones" },
  { id: "u5", perfil: "gerencia", nom: "Natalia Herrera Torres", cargo: "Ámbitos: Personal y ex funcionarios · Áreas Silvestres Protegidas" },
  { id: "u8", perfil: "delegado", nom: "Sergio Bravo Ulloa", cargo: "Usuario de prueba" },
  { id: "u6", perfil: "admin", nom: "Valeria Soto Araya", cargo: "Usuario de prueba" }
];
const U = Object.fromEntries(USUARIOS.map(u => [u.id, u]));
const nomU = id => U[id] ? PERFILES[U[id].perfil].n : "—";   // los usuarios de prueba se nombran por su perfil

/* Responsables por sede y etapa: POR DEFINIR (pendiente de la contraparte, correo del 28-10-2026).
   Oficina Central y Biobío llevan una asignación DE PRUEBA para poder recorrer la maqueta. */
const RESP = Object.fromEntries(SEDES.map(s => [s, { recibe: null, admisibilidad: null, deriva: null, revision: null, firma: null, responde: null, reclamos: null, prueba: false }]));
Object.assign(RESP["Oficina Central"], { recibe: "u2", admisibilidad: "u4", deriva: "u2", revision: "u4", firma: "u12", responde: "u2", reclamos: "u4", prueba: true });
Object.assign(RESP["Dirección Regional Biobío"], { recibe: "u2", admisibilidad: "u4", deriva: "u2", revision: "u4", firma: "u12", responde: "u2", reclamos: "u4", prueba: true });

/* Ámbitos de EJEMPLO hasta cargar la matriz de datos personales (compartida por el delegado el 28-10-2026). */
const AMBITOS = [
  { k: "personal", n: "Personal y ex funcionarios", resp: "u5" },
  { k: "asp", n: "Áreas Silvestres Protegidas", resp: "u5" },
  { k: "fiscalizacion", n: "Fiscalización forestal", resp: null },
  { k: "programas", n: "Programas y beneficios", resp: null },
  { k: "tramites", n: "Trámites forestales", resp: null }
];
const AMB = k => AMBITOS.find(a => a.k === k);

/* ---------- Derechos ante un órgano público (arts. 4° a 9°, 21 y 23) ---------- */
const DERECHOS = [
  { k: "acceso", n: "Acceso", d: "Saber si CONAF trata sus datos, cuáles, su origen, finalidad, destinatarios y por cuánto tiempo (art. 5°).", art: "art. 5° y 23" },
  { k: "rectificacion", n: "Rectificación", d: "Corregir datos inexactos, desactualizados o incompletos. Indique la corrección precisa (art. 6° y 11 d).", art: "art. 6° y 23" },
  { k: "oposicion", n: "Oposición", d: "Oponerse a un tratamiento específico, también cuando sea contrario a las normas para órganos públicos (art. 8° y 23).", art: "art. 8° y 23" },
  { k: "supresion", n: "Supresión", d: "Eliminar sus datos. En un órgano público procede en los casos del art. 22 inc. 3° (art. 23). Indique la causal.", art: "art. 7° y 23" },
  { k: "bloqueo", n: "Bloqueo temporal", d: "Suspender el tratamiento mientras se resuelve su rectificación, supresión u oposición. Debe fundarse; se responde en 2 días hábiles (art. 8° ter y 11).", art: "art. 8° ter y 11" },
  { k: "portabilidad", n: "Portabilidad", d: "Copia de sus datos en formato estructurado (art. 9°).", art: "art. 9°", verificar: "Su procedencia ante órganos públicos está por confirmar: los arts. 21 y 23 no la mencionan." }
];
const DER = Object.fromEntries(DERECHOS.map(d => [d.k, d.n]));
const VIAS = { web: "Formulario web", fisica: "Formulario físico · Oficina de Partes" };
const MEDIOS = { correo: "Correo electrónico", carta: "Carta al domicilio", retiro: "Retiro en Oficina de Partes" };
const CALIDAD = { titular: "Titular", representante: "Representante o mandatario", heredero: "Heredero de titular fallecido" };

/* ---------- Casos ficticios (fecha simulada: lunes 11-01-2027) ---------- */
const NOMBRES = ["Javiera Soto Rivas", "Felipe Araya Morales", "Rosa Contreras León", "Tomás Sepúlveda Vera", "Elena Díaz Bravo", "Héctor Pinto Lagos", "Sofía Torres Garrido", "Diego Fuentes Lara", "Patricia Vidal Cáceres", "Luis Molina Reyes", "Francisca Navarro Gómez", "Jorge Espinoza Toro", "Camila Ortiz Vargas", "Matías Castro Peña"];
function nuevoCaso(o) {
  return Object.assign({ via: "web", sede: "Oficina Central", calidad: "titular", derechos: ["acceso"], detalle: "", medio: "correo", correo: "correo@ejemplo.cl", etapa: "recepcion", desde: o.ingreso, identidad: false, ambito: null, prorroga: null, ant: null, bloq: null, decision: null, propuesta: "", firma: null, cierre: null, reclamo: null, obs: [], bit: [] }, o);
}
let n0 = 0;
const T = (num, ingreso, o) => { const i = n0++; return nuevoCaso(Object.assign({ num, ingreso, tit: { nom: NOMBRES[i % NOMBRES.length], run: runFicticio(9100000 + i * 731177) } }, o)); };
const CASOS = [
  T("DP-2026-000101", "2026-12-02", { etapa: "cerrado", identidad: true, ambito: "personal", desde: "2026-12-28", detalle: "Antecedentes de mi hoja de vida funcionaria entre 2015 y 2019.", cierre: { f: "2026-12-28", res: "Acogida", medio: "correo" }, tit: { nom: USUARIOS[0].nom, run: USUARIOS[0].run } }),
  T("DP-2026-000102", "2026-12-03", { via: "fisica", folio: "OP-OC-4410", derechos: ["rectificacion"], etapa: "cerrado", identidad: true, ambito: "personal", desde: "2027-01-04", detalle: "Corregir mi domicilio registrado.", medio: "carta", cierre: { f: "2027-01-04", res: "Acogida", medio: "carta", cesion: "Se comunicó la rectificación a los destinatarios" } }),
  T("DP-2026-000103", "2026-12-04", { derechos: ["supresion"], etapa: "cerrado", identidad: true, desde: "2026-12-10", detalle: "Eliminar mis datos de una denuncia.", cierre: { f: "2026-12-10", res: "No admitida", causal: "Art. 23 inc. 2° a): afectaría funciones fiscalizadoras" }, reclamo: { notif: "2027-01-04", folio: "Reclamo ficticio N° 0001", resp: null } }),
  T("DP-2026-000104", "2026-12-09", { etapa: "firma", identidad: true, ambito: "personal", desde: "2027-01-05", detalle: "Copia de los datos de mi postulación a un concurso.", decision: "Acoge", propuesta: "Se entregan los datos solicitados con la información del art. 5°." }),
  T("DP-2026-000105", "2026-12-11", { via: "fisica", folio: "OP-OC-4471", derechos: ["oposicion"], etapa: "revision", identidad: true, ambito: "programas", desde: "2027-01-07", prorroga: "2027-01-06", detalle: "Oponerme al uso de mi teléfono para encuestas.", decision: "Acoge parcialmente", propuesta: "Se suspende el uso para encuestas; se mantiene para el programa." }),
  T("DP-2026-000106", "2026-12-14", { derechos: ["acceso", "rectificacion"], etapa: "analisis", identidad: true, ambito: "personal", desde: "2026-12-21", detalle: "Revisar mis datos previsionales y corregir la AFP registrada." }),
  T("DP-2026-000107", "2026-12-15", { via: "fisica", folio: "OP-BIO-0218", sede: "Dirección Regional Biobío", etapa: "analisis", identidad: true, ambito: "asp", desde: "2026-12-22", detalle: "Saber qué datos guardan de mis visitas a un parque.", medio: "retiro", retiro: "Dirección Regional Biobío" }),
  T("DP-2026-000108", "2026-12-21", { derechos: ["rectificacion", "bloqueo"], etapa: "analisis", identidad: true, ambito: "personal", desde: "2026-12-28", bloq: { pide: "2026-12-21", res: "Acogido", f: "2026-12-22", fund: "Mi nombre mal escrito me impide un trámite." }, detalle: "Mi nombre figura mal escrito en un certificado." }),
  T("DP-2026-000109", "2026-12-22", { via: "fisica", folio: "OP-VAL-0094", sede: "Dirección Regional Valparaíso", etapa: "recepcion", desde: "2026-12-22", detalle: "Acceso a los datos de mi permiso de corta.", medio: "carta" }),
  T("DP-2026-000110", "2026-12-28", { derechos: ["portabilidad"], etapa: "derivacion", identidad: true, desde: "2027-01-05", detalle: "Copia de mis datos de un trámite en línea en formato CSV." }),
  T("DP-2026-000111", "2026-12-29", { via: "fisica", folio: "OP-OC-4502", etapa: "respuesta", identidad: true, ambito: "personal", desde: "2027-01-08", decision: "Acoge", propuesta: "Se entregan los datos solicitados.", firma: { f: "2027-01-08", doc: "Carta Oficial N° 18 (ficticia)", por: "u7" }, detalle: "Datos de mis licencias médicas registradas.", medio: "retiro", retiro: "Oficina Central" }),
  T("DP-2026-000112", "2026-12-30", { via: "fisica", folio: "OP-BIO-0225", sede: "Dirección Regional Biobío", etapa: "firma", identidad: true, ambito: "personal", desde: "2027-01-08", decision: "Rechaza", propuesta: "Los datos no constan en las bases de CONAF.", detalle: "Datos de un contrato a honorarios de 2010." }),
  T("DP-2027-000001", "2027-01-04", { etapa: "admisibilidad", identidad: true, desde: "2027-01-05", ant: { pide: "2027-01-05", que: "Indique el año aproximado y la oficina donde realizó el trámite." }, detalle: "Datos de un trámite que hice en una oficina.", tit: { nom: USUARIOS[0].nom, run: USUARIOS[0].run } }),
  T("DP-2027-000002", "2027-01-06", { via: "fisica", folio: "OP-BIO-0231", sede: "Dirección Regional Biobío", derechos: ["supresion"], etapa: "admisibilidad", identidad: true, desde: "2027-01-07", detalle: "Eliminar mi correo de una lista de difusión." }),
  T("DP-2027-000003", "2027-01-08", { derechos: ["oposicion", "bloqueo"], etapa: "admisibilidad", identidad: true, desde: "2027-01-08", bloq: { pide: "2027-01-08", res: null, fund: "El estudio usa mis datos sin que lo haya pedido." }, detalle: "Oponerme a que mis datos se usen en un estudio." }),
  T("DP-2027-000004", "2027-01-11", { etapa: "recepcion", desde: "2027-01-11", detalle: "Saber qué datos personales tiene CONAF de mí." }),
  T("DP-2027-000005", "2027-01-07", { via: "fisica", folio: "OP-LAG-0057", sede: "Dirección Regional Los Lagos", derechos: ["rectificacion"], etapa: "recepcion", desde: "2027-01-07", detalle: "Corregir mi fecha de nacimiento.", medio: "carta" })
];
CASOS.forEach(c => {
  c.bit.push({ f: c.ingreso, u: c.via === "web" ? "Sistema" : "Responsable de datos", a: c.via === "web" ? "Ingreso por formulario web · acuse de recibo enviado" : "Registro manual del formulario físico " + (c.folio || "") + " · acuse de recibo" });
  if (c.etapa !== "recepcion") c.bit.push({ f: c.desde, u: "—", a: "En etapa: " + (ETAPA[c.etapa] ? ETAPA[c.etapa].n : "cerrado") });
  if (c.reclamo) c.bit.push({ f: c.reclamo.notif, u: "Fiscalía", a: "La Agencia notificó un reclamo del titular (art. 41)" });
});
const BIT = [];
let correlativo = { "2027": 6 };
