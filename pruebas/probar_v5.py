"""Pruebas de la v5: la Unidad Jurídica asume las funciones del Encargado de Gestión, el perfil del delegado de
protección de datos (seguimiento nacional, sólo lectura) y la página del art. 14 ter con las letras a) a f).

Fuentes: reunión con la contraparte del 18-11-2026 y correos del 19-11-2026. Reemplaza a probar_v43.py, que comprobaba
lo contrario (Encargado de Gestión aparte y sin delegado) y queda en el historial.

Uso (desde la raíz del repositorio):  python -X utf8 pruebas/probar_v5.py [ruta-o-url]
"""
import pathlib
import sys

from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
OBJ = sys.argv[1] if len(sys.argv) > 1 else str(RAIZ / "index.html")
URL = OBJ if OBJ.startswith("http") else pathlib.Path(OBJ).resolve().as_uri()
fallas, oks = [], 0
BIOBIO, LAGOS, OC = "Dirección Regional Biobío", "Dirección Regional Los Lagos", "Oficina Central"


def ok(cond, msg):
    global oks
    if cond:
        oks += 1
        print("OK   ", msg)
    else:
        fallas.append(msg)
        print("FALLA", msg)


def entrar(pg, perfil, sede=OC):
    pg.goto(URL)
    pg.wait_for_selector("#login:not([hidden])")
    if perfil == "Persona solicitante":
        pg.locator("#login .l-usuario", has_text=perfil).first.click()
        pg.wait_for_selector("#vista .items-14ter", timeout=5000)
        return
    uid = pg.evaluate("([t, s]) => { const u = USUARIOS.find(x => PERFILES[x.perfil].n.includes(t) && x.sede === s); return u ? u.id : null; }", [perfil, sede])
    pg.evaluate("id => entrar(id)", uid)
    pg.wait_for_selector("#vista .hero", timeout=5000)


def ev(pg, js):
    r = pg.evaluate(js)
    pg.wait_for_timeout(120)
    return r


def accesos(pg):
    return pg.locator(".acceso h3").all_inner_texts()


with sync_playwright() as p:
    nav = p.chromium.launch()
    pg = nav.new_page(viewport={"width": 1280, "height": 900})
    errores = []
    pg.on("pageerror", lambda e: errores.append(str(e)))

    # 1. Ingreso: Unidad Jurídica, Delegado, Director y Área; sin el Encargado de Gestión aparte
    pg.goto(URL)
    etiquetas = pg.locator("#l-interno .l-usuario b").all_inner_texts()
    ok(etiquetas == ["Unidad Jurídica", "Delegado de protección de datos", "Director o directora", "Área que trata los datos"],
       f"ingreso: los cuatro perfiles internos, en orden ({etiquetas})")
    for retirado in ["Encargado de Gestión", "Responsable de datos", "Firmante", "Administración del canal", "Unidad jurídica regional"]:
        ok(retirado not in etiquetas, f"ingreso: no existe «{retirado}»")
    ok(ev(pg, "!USUARIOS.some(u => u.perfil === 'encargado') && !('encargado' in PERFILES)") is True,
       "datos: no quedan cuentas ni perfil «encargado»")
    ok(ev(pg, "SEDES.every(s => ['fiscalia', 'director', 'gerencia'].every(p => USUARIOS.filter(u => u.perfil === p && u.sede === s).length === 1))") is True,
       "datos: cada sede tiene una Unidad Jurídica, un Director y un Área")
    ok(ev(pg, "USUARIOS.filter(u => u.perfil === 'delegado').length") == 1, "datos: hay una sola cuenta de delegado, nacional")

    # 2. La Unidad Jurídica de cada sede hace todas las etapas salvo el análisis y la firma
    ok(ev(pg, "SEDES.every(s => ['recibe', 'admisibilidad', 'deriva', 'revision', 'responde', 'reclamos'].every(k => { const u = U[RESP[s][k]]; return u.perfil === 'fiscalia' && u.sede === s; }))") is True,
       "responsables: en cada sede, la Unidad Jurídica de la sede recibe, admite, deriva, revisa, responde y atiende reclamos")
    ok(ev(pg, "SEDES.every(s => U[RESP[s].firma].perfil === 'director' && U[RESP[s].ambito].perfil === 'gerencia')") is True,
       "responsables: el Director firma y el Área analiza en cada sede")
    ok(ev(pg, "COLS.every(([k, , p]) => k === 'ambito' ? p === 'gerencia' : k === 'firma' ? p === 'director' : p === 'fiscalia')") is True,
       "configuración: cada columna de responsables admite el perfil correcto")

    # 3. Unidad Jurídica de Biobío: hereda las funciones del Encargado y sólo ve su sede
    entrar(pg, "Unidad Jurídica", BIOBIO)
    a = accesos(pg)
    for t in ["Registrar solicitud en formulario físico", "Bloqueos por resolver", "Reclamos ante la Agencia",
              "Responsables por etapa y sede", "Plazos internos y feriados", "Reportes", "Bitácora"]:
        ok(t in a, f"Unidad Jurídica: tiene «{t}»")
    ok(ev(pg, "RECEPTOR.includes(SESION.perfil)") is True, "Unidad Jurídica: es el perfil receptor (formulario físico)")
    ok(ev(pg, "[...new Set(misCasos().map(c => c.sede))]") == [BIOBIO], "Unidad Jurídica de Biobío: ve sólo casos de su sede")
    # La misma cuenta resuelve la admisibilidad y luego deriva
    ev(pg, "abrirCaso('DP-2027-000002')")
    pg.locator("[data-a='admisible']").click()
    ok("Admisible · por derivar" in pg.locator("#capa").inner_text(), "Unidad Jurídica: declara admisible")
    ok(pg.locator("#a-amb").count() == 1, "Unidad Jurídica: la misma cuenta deriva enseguida, sin pasar por otro perfil")
    pg.select_option("#a-amb", "asp")
    pg.locator("[data-a='derivar']").click()
    ok("En análisis" in pg.locator("#capa").inner_text(), "Unidad Jurídica: deriva al Área que trata los datos")
    pg.locator("#cerrar").click()

    # 4. Registro de papel en una región: queda en la sede de esa región
    entrar(pg, "Unidad Jurídica", LAGOS)
    pg.locator(".acceso", has_text="Registrar solicitud").first.click()
    ok(pg.locator("#r-sede option").all_inner_texts() == [LAGOS], "Registro físico: la Oficina de Partes es la de su sede")
    pg.fill("#r-folio", "OP-LAG-0099")
    pg.fill("#r-run", "11.222.333-0")
    pg.fill("#r-nom", "Persona Ficticia Dos")
    pg.locator("input[name=r-der][value=acceso]").check()
    pg.fill("#r-det", "Datos de un permiso de quema.")
    pg.locator("#r-ced").check()
    pg.locator("#r-scan").check()
    pg.get_by_role("button", name="Registrar y acusar recibo").click()
    ok(ev(pg, "CASOS[CASOS.length - 1].sede") == LAGOS, "Registro físico: el caso queda en Los Lagos")
    ok(ev(pg, "responsable(CASOS[CASOS.length - 1])") == ev(pg, "SESION.id"), "Registro físico: la misma cuenta sigue con la recepción")
    pg.locator("#cerrar").click()

    # 5. Delegado: seguimiento nacional, sólo lectura
    entrar(pg, "Delegado de protección de datos")
    ok(pg.locator("#panel-sedes").count() == 1, "Delegado: el inicio muestra el panel de alertas por sede")
    ok(pg.locator("#panel-sedes tbody tr").count() == 17, "Delegado: el panel lista las 17 sedes")
    primera = pg.locator("#panel-sedes tbody tr").first.inner_text()
    ok("vencido" in primera, f"Delegado: la primera sede del panel es la que tiene casos vencidos ({primera.split(chr(9))[0]})")
    a = accesos(pg)
    ok(a == ["Todos los casos", "Plazos vencidos", "Calendario de vencimientos", "Reportes", "Bitácora"], f"Delegado: accesos de seguimiento ({a})")
    ok(ev(pg, "misCasos().length === CASOS.length") is True, "Delegado: ve los casos de todas las sedes")
    ok(ev(pg, "CASOS.every(c => !tareaDe(c, SESION))") is True, "Delegado: no tiene tareas, no tramita")
    pg.locator("#panel-sedes tr[data-ir-sede]", has_text="DR Biobío").click()
    pg.wait_for_selector("#c-q", timeout=5000)
    ok(ev(pg, "[...new Set($$('tr[data-caso]').map(r => CASOS.find(c => c.num === r.dataset.caso).sede))]") == [BIOBIO],
       "Delegado: tocar una sede lista sólo los casos de esa sede")
    ok(pg.locator("[data-g='tareas']").count() == 0, "Delegado: la lista de casos no ofrece «Mis tareas»")
    ev(pg, "abrirCaso('DP-2027-000003')")
    ok(pg.locator("#capa .acc-caso").count() == 0, "Delegado: el panel del caso no tiene acciones")
    ok(pg.locator("#ver-run").count() == 0, "Delegado: no puede ver el RUN completo")
    ok("Bitácora del caso" in pg.locator("#capa").inner_text(), "Delegado: ve la trazabilidad del caso")
    pg.locator("#cerrar").click()
    for v in ["responsables", "parametros", "registrar"]:
        ok(ev(pg, f"(ir('{v}'), vista)") == "inicio", f"Delegado: no entra a «{v}»")
    ok(ev(pg, "(ir('reportes'), vista)") == "reportes", "Delegado: entra a los reportes")
    ev(pg, "ir('bitacora')")
    sedes_bit = ev(pg, "[...new Set($$('#vista tbody tr td:nth-child(3)').map(td => (CASOS.find(c => c.num === td.textContent) || {}).sede).filter(Boolean))]")
    ok(len(sedes_bit) > 1, f"Delegado: la bitácora abarca varias sedes ({len(sedes_bit)})")

    # 6. Director y Área: sin cambios
    entrar(pg, "Director o directora", BIOBIO)
    ok(ev(pg, "CASOS.filter(c => visibleParaUsuario(c, SESION)).every(c => c.etapa === 'firma' && c.sede === 'Dirección Regional Biobío')") is True,
       "Director: sólo ve los casos de su sede en etapa de firma")
    ev(pg, "abrirCaso('DP-2026-000112')")
    ok("Bitácora del caso" not in pg.evaluate("document.body.innerText"), "Director: sin bitácora del caso")

    # 7. Página del art. 14 ter: letras a) a f)
    entrar(pg, "Persona solicitante")
    letras = pg.locator(".items-14ter li .n").all_inner_texts()
    titulos = pg.locator(".items-14ter li h3").all_inner_texts()
    ok(letras == list("abcdef"), f"14 ter: letras a) a f) ({''.join(letras)})")
    ok(titulos[2] == "Canales para presentación de solicitudes", f"14 ter: la letra c) se titula «Canales para presentación de solicitudes» ({titulos[2]})")
    ok("Catálogo de Datos Personales" in pg.locator(".items-14ter li").nth(3).inner_text(), "14 ter: la letra d) es el Catálogo de Datos Personales")
    ok(titulos[5] == "Derecho a reclamar ante la Agencia", f"14 ter: la letra f) es el derecho a reclamar ante la Agencia ({titulos[5]})")
    for fuera in ["Transferencias internacionales", "Período de conservación", "Fuente de los datos", "Retiro del consentimiento", "Decisiones automatizadas"]:
        ok(fuera not in titulos, f"14 ter: «{fuera}» ya no es un bloque aparte")
    ok("letras a) a f)" in pg.locator("#vista").inner_text(), "14 ter: la referencia dice «letras a) a f)»")

    ok(not errores, f"sin errores de script ({errores[:2]})")
    ok("@conaf.cl" not in pg.evaluate("document.body.innerText"), "sin correos @conaf.cl en pantalla")
    nav.close()

print(f"\n{oks} OK · {len(fallas)} fallas")
sys.exit(1 if fallas else 0)
