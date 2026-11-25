# Hojas del estándar (copia sin editar)

Copiadas de `Sud-Austral/coipo_master_produccion`. Desde el 25-11-2026 no vienen todas
del mismo commit:

| Archivo | Origen | Commit |
|---|---|---|
| `tokens.css`, `marca.json` | generados con `semilla/siembra/marca.py` (`escribir_marca`) para `8_banner_ASUNTOS_INSTITUCIONALES` | `fc1907b` (24-11-2026) |
| `interfaz.css` | `semilla/ESQUELETO/frontend/src/estilos/` | `fc1907b` (24-11-2026) |
| `BannerInstitucional.css`, `Boton.css`, `Estado.css` | `semilla/ESQUELETO/frontend/src/componentes/` | `fc1907b` (24-11-2026); `Boton.css` y `Estado.css` no cambiaron desde `0853a0e` |
| `tipografia.css` | `semilla/ESQUELETO/frontend/src/estilos/` | `0853a0e` (30-10-2026), **a propósito** |

**Por qué `tipografia.css` se queda en `0853a0e`.** El 14-11-2026 la fábrica cambió a la
pila de Apple (Inter fuera de Apple). Esa decisión rige hacia adelante (`FILOSOFIA.md` §3
de la fábrica), y una maqueta validada por el cliente manda sobre el estándar visual
(`identidad/ESTANDAR_UI.md` §1-bis). Esta maqueta conserva Instrument Sans, Fraunces y
JetBrains Mono, autoalojadas en `../../fuentes/`.

**Qué trajo la alineación del 25-11-2026.** En `interfaz.css`, `color-scheme` pasa de
`body` a `:root`, para que el lienzo y las barras de desplazamiento de la ventana sigan el
tema; `index.html` lo declara también con `<meta name="color-scheme" content="light">`
(la maqueta fija `data-theme="claro"`). En el resto solo cambian comentarios
(`verificar-titulo.mjs` → `.ts`, la nota de las nueve gerencias). Los banners de `../../img/`
coinciden byte a byte con los de la fábrica en `fc1907b`.

No se editan aquí. Lo propio de la maqueta va en `../con012.css`, sólo con tokens.
Estándar de referencia: `identidad/ESTANDAR_UI.md` (UI-1 a UI-20).
