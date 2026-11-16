# coipo_ley_datos_personales — Maqueta del canal de ejercicio de derechos (Ley N° 21.719)

Maqueta de validación del canal por el que las personas ejercen ante CONAF sus derechos
sobre datos personales (acceso, rectificación, supresión, oposición, portabilidad y
bloqueo temporal), según la Ley N° 21.719. Iniciativa CON012, elaborada por la Unidad de
Información y Análisis (UIA), línea de Gobernanza de Datos.

**Versiones:**

- **Publicada (v4.4, rama `main`):** [abrir la maqueta publicada](https://alvarozvjac.github.io/coipo_ley_datos_personales/)

> Demostración no operacional. Personas, RUN, casos y responsables son ficticios; los RUN
> tienen dígito verificador inválido a propósito. Fecha simulada: lunes 11-01-2027. Nada se
> envía a un servidor. El ingreso con Clave Única está simulado: CONAF hoy no cuenta con la
> integración.

**Vista celular:** en computador, el botón flotante «Vista celular», abajo a la izquierda muestra la maqueta dentro de un marco de teléfono de 390 × 844 px, para presentarla sin abrir las herramientas del navegador. Se cierra con «Cerrar» o Esc. En un teléfono real el botón no aparece.

## Versión 4.4 (publicada en `main`)

Cambios de perfiles en curso (rama `perfiles-fusion-delegado`, sin publicar):

- **Delegado de protección de datos retirado de la maqueta.** Su designación es voluntaria (art. 50) y CONAF aún no decide si lo hará. La pregunta va a Fiscalía (F1).
- **Administración del canal fundida en el Encargado de Gestión.** El Encargado asigna responsables, plazos internos y feriados, y revisa la bitácora. Pregunta a Fiscalía sobre la separación de funciones (F4).
- **Reporte de vulneraciones (art. 14 sexies) en la Unidad Jurídica.** Plazo y medio pendientes (F2). El rol de Informática en las medidas de seguridad también va a Fiscalía (F3).

Ajustes tras la revisión de la maqueta 4.2:

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

Las hojas de `css/semilla/` son copia sin editar de `semilla/ESQUELETO/frontend/src` de `Sud-Austral/coipo_master_produccion` en el commit `0853a0e`. Los tokens y el banner de la Secretaría de Asuntos Institucionales se generaron con `semilla/sembrar.py`. Lo propio va en `css/con012.css`, sólo con tokens. Detalle en `css/semilla/LEEME.md`.

La fábrica cambió su tipografía el 14-11-2026 (pila de Apple e Inter fuera de Apple). Esa decisión rige hacia adelante; esta maqueta conserva Instrument Sans, Fraunces y JetBrains Mono, autoalojadas en `fuentes/`.

### Perfiles

| Perfil | Qué hace |
|---|---|
| Persona solicitante | Página del art. 14 ter, solicitud en 4 pasos con Clave Única simulada, acuse y **Mis solicitudes** (estado y envío de antecedentes) |
| Encargado de Gestión | Registro (incluido el formulario físico de Oficina de Partes), verificación de identidad, derivación, prórroga, respuesta y comunicación a cesionarios (art. 6°), en su sede; **además** responsables por etapa y sede, plazos internos, feriados y bitácora de su sede (antes «Administración del canal») |
| Director o directora | Revisa y firma las respuestas de su sede, sólo cuando le toca; no deriva; sin bitácora |
| Unidad Jurídica | Trazabilidad completa de su sede. Admisibilidad, bloqueo temporal (2 días hábiles; el rechazo se comunica a la Agencia), revisión jurídica (V°B°), **reclamos ante la Agencia** (art. 41) y **reporte de vulneraciones** (art. 14 sexies; plazo y medio pendientes de Fiscalía) |
| Área que trata los datos | En su sede, análisis y propuesta de respuesta de los ámbitos de datos; sólo ve los casos en su etapa de análisis, sin bitácora |

**Manual de usuario:** [`manual/manual-usuario.pdf`](manual/manual-usuario.pdf), con un capítulo
por perfil y capturas reales de la maqueta. Se regenera con `manual/capturar.py` y
`manual/imprimir.py`. Describe la v4.4.

### Lo que no está decidido (pendiente de la contraparte)

- Personas reales por sede: la maqueta tiene una cuenta de prueba por sede y función; por confirmar quién ocupa cada una.
- Correos de las oficinas regionales: se omiten en la maqueta; por confirmar si se muestran.
- Quién firma y si la firma se tramita en Cero Papel; a qué sede van las solicitudes web; plazos internos.
- Procedencia de la portabilidad ante órganos públicos (los arts. 21 y 23 no la mencionan).
- La maqueta asume que el Título IV (arts. 20 a 23) se aplica a CONAF, institución autónoma del Estado según la Ley N° 18.348. Fiscalía debe validar ese supuesto (pregunta A1). El SERNAFOR (Ley N° 21.744) es servicio público descentralizado y quedaría sujeto al Título IV al entrar en funcionamiento.
- Plazo para aportar antecedentes: la ley no lo fija (la maqueta propone 5 días hábiles).
- Canal disponible desde el 01-12-2026 mientras no exista la integración con Clave Única.
- Contenidos del art. 14 ter; ámbitos de datos (de ejemplo hasta cargar la matriz); origen del catálogo de comunas, que trae nombres mal escritos.

## Pruebas

```bash
python -X utf8 pruebas/probar_v43.py          # 32 comprobaciones: cuentas por sede, visibilidad por perfil y sin nombres ficticios
python -X utf8 pruebas/probar_v4.py           # 57 comprobaciones del canal, escritorio y teléfono
```

Requiere `playwright` para Python con Chromium. Las capturas quedan en `pruebas/capturas/`
(no se versionan). Las pruebas de la v3.x (`recorrido_caso.py`, `probar_v3*.py`) corresponden
a la versión 3.x, que queda en el historial (commit `775435f`).

## Contenido del repositorio

- `index.html`: estructura de la página.
- `css/semilla/`: hojas del estándar, sin editar. `css/fuentes.css` y `fuentes/`: tipografía autoalojada (OFL). `css/con012.css`: estilos propios.
- `js/`: `comun.js`, `datos.js`, `casos.js`, `publico.js`, `interno.js`, `admin.js`, `app.js` y `territorio.js`.
- `img/`: banner de la Secretaría de Asuntos Institucionales generado por la semilla.
- `manual/`: manual en PDF, su fuente HTML y los scripts de capturas e impresión.
- `pruebas/`: pruebas con Playwright (`probar_v43.py`, `probar_v4.py`).

Norma de referencia: Ley N° 21.719 (vigencia 01-12-2026) y el procedimiento institucional V1
de atención de solicitudes de derechos.
