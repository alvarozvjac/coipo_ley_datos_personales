/* CON012 · Línea 2 · Cumplimiento interno: datos de EJEMPLO.
   Todo lo de este archivo es ficticio y sirve para recorrer la maqueta. El registro real nace de la matriz de datos
   personales que compartió el delegado (28-10-2026), que todavía no se ha recibido.
   Fuente normativa: Ley N° 21.719 (texto de la BCN en los antecedentes del proyecto). Lo que viene de IusConsult o
   no se leyó en la ley va marcado [VERIFICAR]. */
"use strict";

/* ---------- Perfiles y usuarios de la línea 2 ---------- */
Object.assign(PERFILES, {
  seguridad: { n: "Seguridad de la información", ico: "candado", d: "Registra y evalúa las vulneraciones de seguridad y aporta evidencia de las medidas (arts. 14 quinquies y 14 sexies)." }
});
USUARIOS.splice(USUARIOS.length - 1, 0,
  { id: "u11", perfil: "seguridad", nom: "Daniela Ossandón Pérez", cargo: "Usuario de prueba" });
USUARIOS.forEach(u => U[u.id] = u);

/* ---------- Registro de tratamientos (art. 49 c; art. 14 ter d, h, i, j) ---------- */
const EST_TRAT = { borrador: ["Borrador", "c-neu", "○"], revision: ["En revisión del delegado", "c-pend", "◷"], aprobado: ["Aprobado", "c-disp", "✓"], observado: ["Con observaciones", "c-malo", "!"] };
const TRATAMIENTOS = [
  { id: "T-01", n: "Gestión del personal y remuneraciones", amb: "personal", dueno: "u5", estado: "aprobado",
    fin: "Administrar la relación laboral, pagar remuneraciones y cumplir obligaciones previsionales.", base: "Funciones legales del órgano (art. 20) [VERIFICAR]",
    datos: ["Identificación", "Contacto", "Remuneraciones y previsión", "Salud laboral y licencias"], titulares: "Funcionarios y ex funcionarios",
    dest: "Organismos previsionales y de fiscalización (ejemplo)", internacional: "Correo institucional en nube extranjera [PENDIENTE]", conserva: "Según normas de archivo [VERIFICAR]",
    fuente: "El propio titular", sistema: "Sistema de remuneraciones (ejemplo)", sensible: true, nna: false, masivo: false, monitoreo: false },
  { id: "T-02", n: "Reservas y control de visitantes de áreas protegidas", amb: "asp", dueno: "u5", estado: "revision",
    fin: "Gestionar reservas, cobros y aforo de las áreas silvestres protegidas.", base: "Funciones legales del órgano (art. 20) [VERIFICAR]",
    datos: ["Identificación", "Contacto", "Nacionalidad", "Grupo de viaje, incluidos menores de edad"], titulares: "Visitantes nacionales y extranjeros",
    dest: "Encargado de la plataforma de reservas", internacional: "Por confirmar con el encargado [PENDIENTE]", conserva: "2 años desde la visita; luego se anonimiza (propuesta del dueño)",
    fuente: "El propio titular", sistema: "Plataforma de reservas (ejemplo)", sensible: false, nna: true, masivo: true, monitoreo: false },
  { id: "T-03", n: "Fiscalización forestal y sumarios", amb: "fiscalizacion", dueno: null, estado: "borrador",
    fin: "Fiscalizar el cumplimiento de la normativa forestal y tramitar los procedimientos sancionatorios.", base: "Funciones legales del órgano (art. 20) [VERIFICAR]",
    datos: ["Identificación", "Domicilio", "Infracciones administrativas (art. 25)", "Geolocalización de predios"], titulares: "Propietarios y presuntos infractores",
    dest: "Tribunales y otros órganos cuando corresponda (ejemplo)", internacional: "No", conserva: null,
    fuente: "Fiscalización en terreno y registros públicos", sistema: "Sistema de fiscalización (ejemplo)", sensible: false, nna: false, masivo: false, monitoreo: false },
  { id: "T-04", n: "Brigadas de temporada", amb: "personal", dueno: "u5", estado: "observado",
    fin: "Contratar y gestionar brigadistas para la temporada de incendios.", base: "Funciones legales del órgano (art. 20) [VERIFICAR]",
    datos: ["Identificación", "Contacto", "Aptitud física y exámenes de salud"], titulares: "Postulantes y brigadistas",
    dest: "Mutualidad (ejemplo)", internacional: "No", conserva: null,
    fuente: "El propio titular y prestadores de salud", sistema: "Planillas de la unidad (ejemplo)", sensible: true, nna: false, masivo: true, monitoreo: false,
    obs: "Falta el plazo de conservación de los exámenes de los postulantes no seleccionados." },
  { id: "T-05", n: "Canal de ejercicio de derechos (este aplicativo)", amb: "tramites", dueno: null, estado: "borrador",
    fin: "Recibir y responder las solicitudes de derechos de la Ley N° 21.719.", base: "Obligación legal (arts. 11 y 23)",
    datos: ["RUN", "Nombre", "Contacto", "Contenido de la solicitud y adjuntos"], titulares: "Personas que ejercen derechos ante CONAF",
    dest: "Agencia de Protección de Datos Personales, si hay reclamo", internacional: "No", conserva: null,
    fuente: "El propio titular", sistema: "CON012", sensible: false, nna: false, masivo: false, monitoreo: false },
  { id: "T-06", n: "Cámaras en accesos de áreas protegidas", amb: "asp", dueno: "u5", estado: "borrador",
    fin: "Seguridad de visitantes y del patrimonio en accesos y centros de información.", base: "Por definir [VERIFICAR]",
    datos: ["Imagen de personas"], titulares: "Visitantes y personal", dest: "Ninguno previsto", internacional: "No", conserva: null,
    fuente: "Captura directa", sistema: "Sistema de cámaras (ejemplo)", sensible: false, nna: true, masivo: false, monitoreo: true }
];
TRATAMIENTOS.forEach(t => { t.bit = [{ f: "2027-01-04", u: "Sistema", a: "Ficha creada a partir de la matriz de ejemplo" }]; });
const TRAT = id => TRATAMIENTOS.find(t => t.id === id);

/* ---------- Matriz de riesgos (art. 49 d). Gravedad según la autoevaluación de IusConsult [VERIFICAR arts. 34 bis a 34 quáter] ---------- */
const GRAV = { leve: ["Leve", "c-res", "▪"], grave: ["Grave", "c-pend", "▲"], gravisima: ["Gravísima", "c-malo", "✕"] };
const NIVEL = s => s >= 16 ? ["Crítico", "c-malo", "✕", "critico"] : s >= 10 ? ["Alto", "c-pend", "▲", "alto"] : s >= 5 ? ["Medio", "c-res", "■", "medio"] : ["Bajo", "c-disp", "●", "bajo"];
const RIESGOS = [
  { id: "R-01", trat: "T-01", n: "Acceso indebido a licencias médicas", inf: "Infringir las obligaciones de seguridad", grav: "grave", p: 3, i: 5 },
  { id: "R-02", trat: "T-02", n: "Datos de menores sin las reglas que les son propias", inf: "Infringir las normas de datos de niños, niñas y adolescentes", grav: "grave", p: 3, i: 4 },
  { id: "R-03", trat: "T-02", n: "Proveedor de reservas guarda datos fuera de Chile sin informarlo", inf: "Infringir las reglas de transferencia internacional", grav: "grave", p: 2, i: 4 },
  { id: "R-04", trat: "T-04", n: "Exámenes de postulantes guardados sin plazo", inf: "Tratar datos innecesarios para sus fines", grav: "grave", p: 4, i: 4 },
  { id: "R-05", trat: "T-05", n: "Respuesta a una solicitud fuera de plazo", inf: "Responder fuera de plazo o de forma incompleta", grav: "leve", p: 3, i: 2 },
  { id: "R-06", trat: "T-03", n: "Información al público incompleta sobre el tratamiento", inf: "Incumplir el deber de información", grav: "leve", p: 4, i: 1 },
  { id: "R-07", trat: "T-06", n: "Grabaciones conservadas sin plazo ni aviso", inf: "Tratar datos innecesarios para sus fines", grav: "grave", p: 3, i: 3 }
];
const EST_CTRL = { pendiente: ["Pendiente", "c-neu", "○"], curso: ["En curso", "c-pend", "◷"], hecho: ["Implementado", "c-disp", "✓"] };
const CONTROLES = [
  { id: "C-01", riesgo: "R-01", n: "Acceso a licencias sólo por perfil, con registro de lecturas", resp: "u11", plazo: "2027-01-29", estado: "curso", ev: 1 },
  { id: "C-02", riesgo: "R-01", n: "Revisión trimestral de usuarios con acceso", resp: "u5", plazo: "2027-02-26", estado: "pendiente", ev: 0 },
  { id: "C-03", riesgo: "R-02", n: "Aviso de información y consentimiento del adulto a cargo en la reserva", resp: "u5", plazo: "2027-01-08", estado: "pendiente", ev: 0 },
  { id: "C-04", riesgo: "R-03", n: "Cláusula de ubicación de los datos en el contrato de encargo", resp: "u4", plazo: "2027-02-15", estado: "curso", ev: 0 },
  { id: "C-05", riesgo: "R-04", n: "Supresión de exámenes de no seleccionados al cerrar el concurso", resp: "u5", plazo: "2027-01-15", estado: "pendiente", ev: 0 },
  { id: "C-06", riesgo: "R-05", n: "Alertas de vencimiento del canal (línea 1)", resp: "u8", plazo: "2026-12-01", estado: "hecho", ev: 2 },
  { id: "C-07", riesgo: "R-06", n: "Publicar la ficha del tratamiento en la página del art. 14 ter", resp: "u8", plazo: "2027-03-01", estado: "pendiente", ev: 0 },
  { id: "C-08", riesgo: "R-07", n: "Letrero de aviso y plazo de borrado automático", resp: "u5", plazo: "2027-02-01", estado: "pendiente", ev: 0 }
];

/* ---------- Vulneraciones de seguridad (art. 14 sexies). La ley no fija un plazo en horas: «sin dilaciones indebidas» ---------- */
const PASOS_VUL = [["registro", "Registro"], ["evaluacion", "Evaluación del riesgo"], ["decision", "Decisión del delegado"], ["comunicacion", "Reporte y comunicación"], ["cerrada", "Cerrada"]];
const VULNERACIONES = [
  { id: "V-2027-001", f: "2027-01-08", det: "2027-01-08", por: "u11", trat: "T-04", paso: "decision",
    desc: "Planilla con exámenes de salud de postulantes enviada por error a una casilla externa.", tipo: "Comunicación no autorizada",
    cats: { sensibles: true, menores: false, economicos: false }, afectados: 37, riesgo: true, medidas: "Se pidió al receptor eliminar el correo; se cambió el procedimiento de envío.", agencia: null, titulares: null,
    bit: [{ f: "2027-01-08", u: "Daniela Ossandón Pérez", a: "Vulneración registrada" }, { f: "2027-01-08", u: "Daniela Ossandón Pérez", a: "Evaluación: riesgo razonable para los titulares; datos sensibles" }] },
  { id: "V-2026-004", f: "2026-12-14", det: "2026-12-14", por: "u11", trat: "T-02", paso: "cerrada",
    desc: "Caída de la plataforma de reservas por dos horas, sin acceso a datos.", tipo: "Indisponibilidad",
    cats: { sensibles: false, menores: false, economicos: false }, afectados: 0, riesgo: false, medidas: "El encargado restableció el servicio y entregó su informe.", agencia: null, titulares: null,
    bit: [{ f: "2026-12-14", u: "Daniela Ossandón Pérez", a: "Vulneración registrada" }, { f: "2026-12-15", u: "Sergio Bravo Ulloa", a: "Sin riesgo razonable: no se reporta a la Agencia. Queda registrada" }] }
];

/* ---------- Evaluaciones de impacto (art. 15 ter). Su exigibilidad a órganos públicos está por confirmar [VERIFICAR art. 21] ---------- */
const CRIT_EIPD = [["perfiles", "a) Perfiles o decisiones automatizadas con efectos jurídicos"], ["masivo", "b) Tratamiento masivo o a gran escala"], ["monitoreo", "c) Monitoreo sistemático de una zona de acceso público"], ["sensible", "d) Datos sensibles en las excepciones al consentimiento"]];
const EST_EIPD = { falta: ["Sin iniciar", "c-pend", "?"], curso: ["En elaboración", "c-res", "◷"], fiscalia: ["En revisión de Fiscalía", "c-pend", "◷"], lista: ["Terminada", "c-disp", "✓"] };
const EIPD = { "T-01": { estado: "lista", f: "2026-11-20" }, "T-02": { estado: "curso" }, "T-04": { estado: "fiscalia" }, "T-06": { estado: "falta" } };
const criteriosDe = t => CRIT_EIPD.filter(([k]) => k === "sensible" ? t.sensible : !!t[k]);

/* ---------- Encargados de tratamiento (art. 15 bis) ---------- */
const CLAUSULAS = [["objeto", "Objeto del encargo"], ["duracion", "Duración"], ["finalidad", "Finalidad del tratamiento"], ["datos", "Tipo de datos tratados"], ["titulares", "Categorías de titulares"], ["derechos", "Derechos y obligaciones de las partes"], ["subencargo", "Subencargo sólo con autorización escrita"], ["termino", "Devolución o supresión al terminar"], ["aviso", "Aviso de vulneraciones al responsable"]];
const ENCARGADOS = [
  { id: "E-01", n: "Proveedor de la plataforma de reservas (ejemplo)", trat: ["T-02"], vence: "2027-12-31", ok: ["objeto", "duracion", "finalidad", "datos", "derechos"] },
  { id: "E-02", n: "Proveedor de correo y ofimática en la nube (ejemplo)", trat: ["T-01", "T-05"], vence: "2028-06-30", ok: CLAUSULAS.map(c => c[0]) },
  { id: "E-03", n: "Servicio de mensajería y despacho (ejemplo)", trat: ["T-05"], vence: "2027-03-31", ok: ["objeto", "duracion"] }
];

/* ---------- Convenios de cesión (art. 22): publicación mensual en la web institucional ---------- */
const CONVENIOS = [
  { id: "CV-01", con: "Órgano público de ejemplo A", tipo: "publico", trat: "T-01", fin: "Verificar requisitos de un beneficio al personal", desde: "2026-03-01", pub: ["2026-12"] },
  { id: "CV-02", con: "Órgano público de ejemplo B", tipo: "publico", trat: "T-03", fin: "Coordinar la fiscalización de predios", desde: "2026-07-15", pub: ["2026-12"] },
  { id: "CV-03", con: "Entidad privada de ejemplo C", tipo: "privado", trat: "T-02", fin: "Seguro de accidentes de visitantes", desde: "2027-01-05", pub: [], base: "Consentimiento del titular (art. 22 inc. 4°) [VERIFICAR]" }
];
const MES_PUB = HOY.slice(0, 7);
