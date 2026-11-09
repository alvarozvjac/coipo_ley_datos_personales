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

- **Una cuenta por función, en todas las sedes.** Oficina Central y las regiones comparten los mismos perfiles; la sede es un dato del caso, no del perfil. Se eliminan los perfiles duplicados Encargado OIRS regional, Unidad jurídica regional y Firmante.
- **Encargado OIRS.** Recibe y registra (incluida la Oficina de Partes), verifica identidad, deriva y responde en todas las sedes.
- **Fiscalía y unidad jurídica.** Una sola cuenta para admisibilidad, revisión jurídica (V°B°) y reclamos ante la Agencia, en todas las sedes.
- **Director o directora.** Revisa y firma en todas las sedes; no deriva. Representa a la Directora Ejecutiva en Oficina Central y a los directores regionales.
- **Ingreso sin nombres ficticios.** Cada usuario de prueba se identifica por su perfil y su cargo, también en el encabezado, la tostada y la bitácora.
- **Oficinas regionales.** Cada región tiene dirección y teléfono, que se muestran al elegir el retiro presencial. Los correos no se muestran: la maqueta no usa correos `@conaf.cl`.
- **Área que trata los datos.** Una sola persona de prueba, responsable de los ámbitos personal y ASP.
- **Cumplimiento interno (Línea 2) retirado de esta versión.** Queda en el historial de la rama, pendiente de la reunión con la contraparte.
- **Pruebas:** `pruebas/probar_v43.py` (25 comprobaciones) cubre estos cambios.

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
| Encargado OIRS | Registro (incluido el formulario físico de Oficina de Partes), verificación de identidad, derivación, prórroga, respuesta y comunicación a cesionarios (art. 6°), en todas las sedes |
| Director o directora | Revisa y firma las respuestas de todas las sedes; no deriva |
| Fiscalía y unidad jurídica | Admisibilidad, bloqueo temporal (2 días hábiles; el rechazo se comunica a la Agencia), revisión jurídica (V°B°) y **reclamos ante la Agencia** (art. 41) |
| Área que trata los datos | Análisis y propuesta de respuesta de sus ámbitos |
| Delegado de protección de datos | Supervisión: vencidos, bloqueos, reclamos, casos sin responsable, bitácora y observaciones (art. 50) |
| Administración del canal | Responsables por etapa y sede, asignación de las solicitudes web, plazos internos y feriados |

**Manual de usuario:** [`manual/manual-usuario.pdf`](manual/manual-usuario.pdf), con un capítulo
por perfil y capturas reales de la maqueta. Se regenera con `manual/capturar.py` y
`manual/imprimir.py`. Describe la v4.3.

### Lo que no está decidido (pendiente de la contraparte)

- Asignación real de personas por sede: la maqueta usa una cuenta por función para todas las sedes; por confirmar si cada región tendrá su propia persona en esas funciones.
- Correos de las oficinas regionales: se omiten en la maqueta; por confirmar si se muestran.
- Quién firma y si la firma se tramita en Cero Papel; a qué sede van las solicitudes web; plazos internos.
- Procedencia de la portabilidad ante órganos públicos (los arts. 21 y 23 no la mencionan).
- Plazo para aportar antecedentes: la ley no lo fija (la maqueta propone 5 días hábiles).
- Canal disponible desde el 01-12-2026 mientras no exista la integración con Clave Única.
- Contenidos del art. 14 ter; ámbitos de datos (de ejemplo hasta cargar la matriz); origen del catálogo de comunas, que trae nombres mal escritos.

## Pruebas

```bash
python -X utf8 pruebas/probar_v43.py          # 25 comprobaciones de la v4.3: una cuenta por función y sin nombres ficticios
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
