# coipo_ley_datos_personales — Maqueta del canal de ejercicio de derechos (Ley N° 21.719)

Maqueta de validación del canal por el que las personas ejercen ante CONAF sus derechos
sobre datos personales (acceso, rectificación, supresión, oposición, portabilidad y
bloqueo temporal), según la Ley N° 21.719. Iniciativa CON012, elaborada por la Unidad de
Información y Análisis (UIA), línea de Gobernanza de Datos.

**Versiones:**

- **Publicada (v4.1, rama `main`):** https://alvarozvjac.github.io/coipo_ley_datos_personales/
- **En revisión (v4.3, rama `v4.3-ajustes`):** sin publicar; se abre desde esa rama.

> Demostración no operacional. Personas, RUN, casos y responsables son ficticios; los RUN
> tienen dígito verificador inválido a propósito. Fecha simulada: lunes 11-01-2027. Nada se
> envía a un servidor. El ingreso con Clave Única está simulado: CONAF hoy no cuenta con la
> integración.

**Vista celular:** en computador, el botón flotante «Vista celular», abajo a la izquierda muestra la maqueta dentro de un marco de teléfono de 390 × 844 px, para presentarla sin abrir las herramientas del navegador. Se cierra con «Cerrar» o Esc. En un teléfono real el botón no aparece.

## Versión 4.3 (en revisión, sin aprobar)

Ajustes tras la revisión de la maqueta 4.2:

- **Perfiles regionales.** Se agregan tres perfiles que se asignan por sede: **Encargado OIRS regional** (recibe y responde en cada región), **Director o directora regional** (deriva y firma) y **Unidad jurídica regional** (V°B°). Fiscalía mantiene la admisibilidad. El flujo sigue el procedimiento de transparencia que describe la Encargada de Gestión (OC).
- **Oficinas regionales.** Cada región tiene dirección y teléfono, que se muestran al elegir el retiro presencial. Los correos no se muestran: la maqueta no usa correos `@conaf.cl`.
- **Responsable de datos.** Tiene un selector «Sede que consulta» que permite ver en lectura los casos de cualquier sede; sólo actúa donde está asignado.
- **Dueño de tratamiento fusionado con Área que trata los datos.** Cada perfil aparece una sola vez en el ingreso. El Área tiene una sola persona de prueba, responsable de los ámbitos personal y ASP, y de sus tratamientos.
- **Pruebas:** `pruebas/probar_v43.py` (26 comprobaciones) cubre estos cambios.

## Versión 4.2 (borrador, sin aprobar)

Nace del **estándar de interfaz de la fábrica**, no de una maqueta anterior: las hojas de
`css/semilla/` son copia sin editar de `semilla/ESQUELETO/frontend/src` de
`Sud-Austral/coipo_master_produccion` (commit `0853a0e`), los tokens y el banner de la
Secretaría de Asuntos Institucionales se generaron con `semilla/sembrar.py`, y las fuentes
(Instrument Sans, Fraunces y JetBrains Mono) están autoalojadas en `fuentes/`. Lo propio va en
`css/con012.css`, sólo con tokens. Detalle en `css/semilla/LEEME.md`.

El marco normativo es la **Ley N° 21.719** (texto de la BCN en los antecedentes del proyecto):
plazos del art. 11 y 41, derechos ante órganos públicos de los arts. 21 y 23, y las doce letras
del art. 14 ter.

### Perfiles

| Perfil | Qué hace |
|---|---|
| Persona solicitante | Página del art. 14 ter, solicitud en 4 pasos con Clave Única simulada, acuse y **Mis solicitudes** (estado y envío de antecedentes) |
| Responsable de datos | Registro (incluido el formulario físico de Oficina de Partes), verificación de identidad, derivación, prórroga, respuesta y comunicación a cesionarios (art. 6°). Selector de sede en lectura |
| Encargado OIRS regional | Recibe y responde las solicitudes de su región |
| Director o directora regional | Deriva y firma las respuestas de su región |
| Unidad jurídica regional | Visto bueno (V°B°) de las respuestas de su región |
| Fiscalía | Admisibilidad, bloqueo temporal (2 días hábiles; el rechazo se comunica a la Agencia), revisión jurídica y **reclamos ante la Agencia** (art. 41) |
| Área que trata los datos | Análisis y propuesta de respuesta de sus ámbitos; mantiene sus tratamientos (en la Línea 2) |
| Firmante | Firma de las respuestas de su sede |
| Delegado de protección de datos | Supervisión: vencidos, bloqueos, reclamos, casos sin responsable, bitácora y observaciones (art. 50) |
| Administración del canal | Responsables por etapa y sede, asignación de las solicitudes web, plazos internos y feriados |

### Línea 2 · Cumplimiento interno (nueva en la v4.2, pendiente de aprobación)

Con datos de ejemplo, sin datos reales, hasta cargar la matriz de datos personales. Archivos: `js/cumplimiento-datos.js`,
`js/cumplimiento.js` y `js/cumplimiento-instrumentos.js`. Su contenido queda igual hasta la reunión con la contraparte.

| Módulo | Quién lo usa | Fuente |
|---|---|---|
| Registro de tratamientos | Área que trata los datos completa, delegado aprueba | Art. 49 c); art. 14 ter d), h), i), j) |
| Matriz de riesgos y controles (mapa de calor 5 × 5; control sin evidencia no se cierra) | Delegado; áreas cumplen controles | Art. 49 d) y e); art. 14 quinquies |
| Vulneraciones de seguridad (reporte a la Agencia y comunicación a titulares) | Seguridad de la información y delegado | Art. 14 sexies |
| Evaluaciones de impacto | Área elabora, Fiscalía revisa | Art. 15 ter [VERIFICAR exigibilidad: el art. 21 no lo nombra] |
| Encargados de tratamiento (cláusulas del contrato) | Fiscalía y delegado | Art. 15 bis |
| Convenios de cesión y su publicación mensual | Fiscalía y delegado | Art. 22 |

Perfil nuevo: **Seguridad de la información**. El Dueño de tratamiento se fusionó con el Área que trata los datos. La gravedad de cada infracción y los cortes
del mapa de calor son una propuesta tomada de material de IusConsult, por confirmar con Fiscalía (arts. 34 bis a 34 quáter).

**Manual de usuario:** [`manual/manual-usuario.pdf`](manual/manual-usuario.pdf), con un capítulo
por perfil y capturas reales de la maqueta. Se regenera con `manual/capturar.py` y
`manual/imprimir.py`. Aún no refleja la v4.3.

### Lo que no está decidido (pendiente de la contraparte)

- Responsables por etapa en cada región: la v4.3 asigna Oficina Central y Biobío como prueba; el resto de las regiones queda por definir.
- Correos de las oficinas regionales: se omiten en la maqueta; por confirmar si se muestran.
- Línea 2 (cumplimiento interno): pendiente de aprobación en la reunión con Ignacio Valenzuela y Leslie Escobar.
- Quién firma y si la firma se tramita en Cero Papel; a qué sede van las solicitudes web; plazos internos.
- Procedencia de la portabilidad ante órganos públicos (los arts. 21 y 23 no la mencionan).
- Plazo para aportar antecedentes: la ley no lo fija (la maqueta propone 5 días hábiles).
- Canal disponible desde el 01-12-2026 mientras no exista la integración con Clave Única.
- Contenidos del art. 14 ter; ámbitos de datos (de ejemplo hasta cargar la matriz); origen del catálogo de comunas, que trae nombres mal escritos.

## Pruebas

```bash
python -X utf8 pruebas/probar_v43.py          # 26 comprobaciones de la v4.3: perfiles regionales, sede y área fusionada
python -X utf8 pruebas/probar_v4.py           # 57 comprobaciones del canal, escritorio y teléfono
python -X utf8 pruebas/probar_v42.py          # 59 comprobaciones de la línea 2, escritorio y teléfono
```

Requiere `playwright` para Python con Chromium. Las capturas quedan en `pruebas/capturas/`
(no se versionan). Las pruebas de la v3.x (`recorrido_caso.py`, `probar_v3*.py`) corresponden
a la versión 3.x, que queda en el historial (commit `775435f`).

## Contenido del repositorio

- `index.html`: estructura de la página.
- `css/semilla/`: hojas del estándar, sin editar. `css/fuentes.css` y `fuentes/`: tipografía autoalojada (OFL). `css/con012.css`: estilos propios.
- `js/`: `comun.js`, `datos.js`, `casos.js`, `publico.js`, `interno.js`, `admin.js`, `app.js` y `territorio.js` (línea 1); `cumplimiento-datos.js`, `cumplimiento.js` y `cumplimiento-instrumentos.js` (línea 2).
- `img/`: banner de la Secretaría de Asuntos Institucionales generado por la semilla.
- `manual/`: manual en PDF, su fuente HTML y los scripts de capturas e impresión.
- `pruebas/`: pruebas con Playwright (`probar_v43.py`, `probar_v4.py`, `probar_v42.py`).

Norma de referencia: Ley N° 21.719 (vigencia 01-12-2026) y el procedimiento institucional V1
de atención de solicitudes de derechos.
