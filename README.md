# coipo_ley_datos_personales — Maqueta del canal de ejercicio de derechos (Ley N° 21.719)

Maqueta de validación del canal por el que las personas ejercen ante CONAF sus derechos
sobre datos personales (acceso, rectificación, supresión, oposición, portabilidad y
bloqueo temporal), según la Ley N° 21.719. Iniciativa CON012, elaborada por la Unidad de
Información y Análisis (UIA), línea de Gobernanza de Datos.

**Versión publicada:** la v5, en la rama `main`, con los cambios de la reunión del
18-11-2026 y de los correos del 19-11-2026: [abrir la maqueta publicada](https://alvarozvjac.github.io/coipo_ley_datos_personales/).

> Demostración no operacional. Personas, RUN, casos y responsables son ficticios; los RUN
> tienen dígito verificador inválido a propósito. Fecha simulada: lunes 11-01-2027. Nada se
> envía a un servidor. El ingreso con Clave Única está simulado: CONAF hoy no cuenta con la
> integración.

**Vista celular:** en computador, el botón flotante «Vista celular», abajo a la izquierda muestra la maqueta dentro de un marco de teléfono de 390 × 844 px, para presentarla sin abrir las herramientas del navegador. Se cierra con «Cerrar» o Esc. En un teléfono real el botón no aparece.

## Versión 5

Cambios acordados con la contraparte en la reunión del 18-11-2026 y en los correos del 19-11-2026:

- **La Unidad Jurídica asume las funciones del Encargado de Gestión.** En cada sede, la Unidad Jurídica recibe y registra (incluido el formulario físico de la Oficina de Partes), verifica identidad, resuelve la admisibilidad y el bloqueo temporal, deriva al Área, hace la revisión jurídica (V°B°), responde y prorroga, y atiende los reclamos ante la Agencia. También asigna responsables, plazos internos y feriados, y ve reportes y bitácora de su sede. El perfil «Encargado de Gestión» desaparece. El flujo conserva sus etapas: la misma cuenta pasa por recepción, admisibilidad, derivación, revisión y cierre.
- **Delegado de protección de datos (nuevo perfil, nacional).** Una sola cuenta, de sólo lectura, para el seguimiento: panel de alertas por sede (abiertos, con holgura, esta semana, urgentes, vencidos, bloqueos y reclamos), todos los casos de todas las sedes, calendario, reportes nacionales y bitácora. No tramita casos ni ve el RUN completo.
- **Página del art. 14 ter con las letras a) a f)**, según el correo de la Unidad de Participación Ciudadana y Transparencia: a) política de tratamiento; b) responsable de datos y representante legal; c) **«Canales para presentación de solicitudes»** (título propuesto por la Secretaría de Asuntos Institucionales); d) datos que trata CONAF, es decir, el Catálogo de Datos Personales, que incluye conservación, fuentes, transferencias internacionales y decisiones automatizadas; e) política y medidas de seguridad, por revisar con el jefe de Informática; f) derecho a reclamar ante la Agencia. Salen los bloques que antes eran g) a l).
- **Respuesta por Cero Papel.** La carta de respuesta se sigue emitiendo por Cero Papel; el canal registra el flujo y envía el acuse automático al solicitante.
- **Pruebas:** `pruebas/probar_v5.py` (57 comprobaciones) cubre estos cambios y reemplaza a `probar_v43.py`, que comprobaba el modelo anterior y queda en el historial.

Supuesto por confirmar: tras la fusión, el formulario físico que llega a la Oficina de Partes de cada región lo registra la Unidad Jurídica de esa sede. En la reunión se planteó que la Oficina de Partes tuviera un perfil propio para registrar, pero no quedó resuelto.

### Versión 4.4

Ajustes tras la revisión de la maqueta 4.2 (en parte reemplazados por la v5):

- **Una cuenta por función y sede.** Encargado de Gestión, Unidad Jurídica, Director y Área que trata los datos tienen una cuenta por sede (Oficina Central y 16 direcciones regionales); el ingreso entra a Oficina Central y las cuentas de cada región se usan en las pruebas. Cada perfil ve sólo lo que le corresponde: el Encargado y la Unidad Jurídica ven la trazabilidad de su sede; el Director y el Área ven sus casos sólo cuando les toca, sin bitácora. Se eliminan los perfiles duplicados Encargado de Gestión regional, Unidad jurídica regional y Firmante.
- **Encargado de Gestión.** Recibe y registra (incluida la Oficina de Partes), verifica identidad, deriva y responde en su sede.
- **Unidad Jurídica.** Una cuenta por sede para admisibilidad, revisión jurídica (V°B°) y reclamos ante la Agencia, con la trazabilidad completa de su sede.
- **Director o directora.** Revisa y firma en su sede; no deriva; sin bitácora. Representa a la Directora Ejecutiva en Oficina Central y a los directores regionales.
- **Ingreso sin nombres ficticios.** Cada usuario de prueba se identifica por su perfil y su cargo, también en el encabezado, la tostada y la bitácora.
- **Oficinas regionales.** Cada región tiene dirección y teléfono, que se muestran al elegir el retiro presencial. Los correos no se muestran: la maqueta no usa correos `@conaf.cl`.
- **Área que trata los datos.** Una cuenta por sede, que analiza los ámbitos de datos de su sede y ve sus casos sólo en la etapa de análisis, sin bitácora.
- **Cumplimiento interno (Línea 2) retirado de esta versión.** Queda en el historial de la rama, pendiente de la reunión con la contraparte.
- **Pruebas:** `pruebas/probar_v43.py` (32 comprobaciones) cubre estos cambios, incluida la visibilidad por perfil.

## Base de estilos

Las hojas de `css/semilla/` son copia sin editar de `semilla/ESQUELETO/frontend/src` de `Sud-Austral/coipo_master_produccion`, alineadas el 25-11-2026 con el commit `fc1907b` salvo `tipografia.css`, que se queda en `0853a0e` a propósito. Los tokens y el banner de la Secretaría de Asuntos Institucionales se generaron con `semilla/sembrar.py`. Lo propio va en `css/con012.css`, sólo con tokens. Detalle en `css/semilla/LEEME.md`.

La fábrica cambió su tipografía el 14-11-2026 (pila de Apple e Inter fuera de Apple). Esa decisión rige hacia adelante; esta maqueta conserva Instrument Sans, Fraunces y JetBrains Mono, autoalojadas en `fuentes/`.

### Perfiles

| Perfil | Qué hace |
|---|---|
| Persona solicitante | Página del art. 14 ter, solicitud en 4 pasos con Clave Única simulada, acuse y **Mis solicitudes** (estado y envío de antecedentes) |
| Unidad Jurídica | Gestiona el canal en su sede (asume las funciones del Encargado de Gestión): registro, incluido el formulario físico de Oficina de Partes; verificación de identidad; admisibilidad y bloqueo temporal (2 días hábiles; el rechazo se comunica a la Agencia); derivación; revisión jurídica (V°B°); prórroga, respuesta y comunicación a cesionarios (art. 6°); **reclamos ante la Agencia** (art. 41) y **reporte de vulneraciones** (art. 14 sexies; plazo y medio pendientes de Fiscalía). **Además**, responsables por etapa y sede, plazos internos, feriados, reportes y bitácora de su sede |
| Delegado de protección de datos | Una cuenta nacional de sólo lectura: panel de alertas de plazo por sede, todos los casos, calendario, reportes y bitácora de todas las sedes. No tramita casos |
| Director o directora | Revisa y firma las respuestas de su sede, sólo cuando le toca; no deriva; sin bitácora |
| Área que trata los datos | En su sede, análisis y propuesta de respuesta de los ámbitos de datos; sólo ve los casos en su etapa de análisis, sin bitácora |

**Manual de usuario:** [`manual/manual-usuario.pdf`](manual/manual-usuario.pdf), con un capítulo
por perfil y capturas reales de la maqueta. Se regenera con `manual/capturar.py` y
`manual/imprimir.py`.

### Lo que no está decidido (pendiente de la contraparte)

- Personas reales por sede: la maqueta tiene una cuenta de prueba por sede y función; por confirmar quién ocupa cada una.
- Correos de las oficinas regionales: se omiten en la maqueta; por confirmar si se muestran.
- Plazos internos. (Resuelto el 18-11-2026: la respuesta se firma y emite por Cero Papel, y cada solicitud se tramita en la sede que corresponde.)
- Si en Oficina Central el fiscal recibe y reparte los casos entre los abogados (propuesta de la reunión del 18-11-2026), y si en Arica hay abogado o el cargo está vacante.
- Portabilidad: en la reunión se acordó mantenerla, porque hay datos genéricos (por ejemplo, laborales) que sí son portables. Falta definir el formato de entrega, si se requiere el consentimiento de la institución que recibe y cómo se cifra el envío.
- Letras del art. 14 ter: la maqueta sigue la lectura a) a f) de Transparencia; la valida Fiscalía. El Catálogo de Datos Personales recibido el 19-11-2026 no trae columnas de transferencias internacionales ni de decisiones automatizadas, que la letra d) incluye. El catálogo no se publica en la maqueta hasta que CONAF lo apruebe para publicación.
- Política y medidas de seguridad (letra e): por revisar con el jefe de Informática; el responsable de seguridad de la información no tiene rol en el flujo, pero da el visto bueno.
- Alertas al delegado: el panel muestra los plazos; falta decidir si además se le avisa por correo.
- La maqueta asume que el Título IV (arts. 20 a 23) se aplica a CONAF, institución autónoma del Estado según la Ley N° 18.348. Fiscalía debe validar ese supuesto (pregunta A1). El SERNAFOR (Ley N° 21.744) es servicio público descentralizado y quedaría sujeto al Título IV al entrar en funcionamiento.
- Plazo para aportar antecedentes: la ley no lo fija (la maqueta propone 5 días hábiles).
- Canal disponible desde el 01-12-2026 mientras no exista la integración con Clave Única.
- Ámbitos de datos (de ejemplo hasta cargar el catálogo); origen del catálogo de comunas, que trae nombres mal escritos.

## Pruebas

```bash
python -X utf8 pruebas/probar_v5.py           # 57 comprobaciones: Unidad Jurídica fusionada, delegado y art. 14 ter a) a f)
python -X utf8 pruebas/probar_v4.py           # 65 comprobaciones del canal, escritorio y teléfono
```

Requiere `playwright` para Python con Chromium. Las capturas quedan en `pruebas/capturas/`
(no se versionan). Las pruebas de versiones anteriores quedan en el historial: las de la v3.x
(`recorrido_caso.py`, `probar_v3*.py` y `cedula_ficticia.png`) salen del árbol el 25-11-2026,
y `probar_v43.py`, de la v4.3 y la v4.4, sale con la v5.

## Contenido del repositorio

- `index.html`: estructura de la página.
- `css/semilla/`: hojas del estándar, sin editar. `css/fuentes.css` y `fuentes/`: tipografía autoalojada (OFL). `css/con012.css`: estilos propios.
- `js/`: `comun.js`, `datos.js`, `casos.js`, `publico.js`, `interno.js`, `admin.js`, `app.js` y `territorio.js`.
- `img/`: banner de la Secretaría de Asuntos Institucionales generado por la semilla.
- `manual/`: manual en PDF, su fuente HTML y los scripts de capturas e impresión.
- `pruebas/`: pruebas con Playwright (`probar_v5.py`, `probar_v4.py`).

Norma de referencia: Ley N° 21.719 (vigencia 01-12-2026) y el procedimiento institucional V1
de atención de solicitudes de derechos.
