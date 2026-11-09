"""Pruebas de la línea 2 (cumplimiento interno) de la maqueta CON012 v4.2.

Uso (desde la raíz del repositorio):  python -X utf8 pruebas/probar_v42.py [ruta-o-url] [carpeta-capturas]
Requiere playwright con Chromium. Recorre los perfiles de la línea 2 sin recargar la página, porque el estado vive
en memoria: el dueño completa una ficha, el delegado la aprueba, seguridad registra una vulneración que llega a
cerrarse, una evaluación de impacto pasa por Fiscalía, y se revisan encargados y convenios.
"""
import pathlib
import re
import sys

from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
OBJ = sys.argv[1] if len(sys.argv) > 1 else str(RAIZ / "index.html")
SAL = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else RAIZ / "pruebas" / "capturas")
SAL.mkdir(parents=True, exist_ok=True)
URL = OBJ if OBJ.startswith("http") else pathlib.Path(OBJ).resolve().as_uri()
fallas, oks = [], 0


def ok(cond, txt):
    global oks
    if cond:
        oks += 1
        print("OK   ", txt)
    else:
        fallas.append(txt)
        print("FALLA", txt)


def como(pg, quien):
    """Cambia de usuario sin recargar (el estado de la maqueta está en memoria)."""
    pg.evaluate("salir()")
    pg.locator("#login .l-usuario", has_text=quien).first.click()
    pg.wait_for_selector("#vista .hero")


def ev(pg, js):
    r = pg.evaluate(js)
    pg.wait_for_timeout(120)
    return r


with sync_playwright() as p:
    nav = p.chromium.launch()
    errores = []
    for nombre, op in {"escritorio": {"viewport": {"width": 1440, "height": 900}},
                       "telefono": {"viewport": {"width": 390, "height": 844}, "is_mobile": True, "has_touch": True, "device_scale_factor": 2}}.items():
        pg = nav.new_context(**op).new_page()
        pg.on("pageerror", lambda e: errores.append(str(e)))
        pg.on("console", lambda m: errores.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        ancho = op["viewport"]["width"]
        sin_desborde = lambda: pg.evaluate("document.documentElement.scrollWidth") <= ancho
        pg.goto(URL)
        pg.wait_for_selector("#login:not([hidden])")
        pg.evaluate("window.tostada = () => {}")
        pg.locator("#login .l-usuario", has_text="Sergio Bravo").first.click()
        pg.wait_for_selector("#vista .hero")

        # --- Delegado: dos secciones de accesos; los de la segunda llevan a su vista
        ok(pg.locator("h2.sec-tit", has_text="Cumplimiento interno").count() == 1, f"{nombre}: el delegado ve la sección de cumplimiento interno")
        ok(pg.locator(".acceso").count() == 14, f"{nombre}: el delegado tiene 8 accesos del canal y 6 de cumplimiento")
        pg.locator(".acceso", has_text="Convenios de cesión").click()
        ok(pg.locator("h1", has_text="Convenios de cesión").count() == 1, f"{nombre}: el acceso de la segunda sección abre su vista")
        ok(sin_desborde(), f"{nombre}: convenios sin scroll horizontal")

        # --- Área (antes Dueño, fusionado en v4.3): sólo sus fichas; completa la devuelta y la envía
        como(pg, "Natalia Herrera")
        ok(pg.locator(".acceso").count() == 6, f"{nombre}: el área ve 6 accesos (3 del canal y 3 de la línea 2)")
        ev(pg, "ir('tratamientos')")
        ok(pg.locator("[data-trat]").count() == 4, f"{nombre}: el área ve sus 4 tratamientos (sus dos ámbitos)")
        ok(sin_desborde(), f"{nombre}: registro de tratamientos sin scroll horizontal")
        pg.screenshot(path=str(SAL / f"{nombre}-l2-tratamientos.png"), full_page=True)
        ev(pg, "abrirTrat('T-04')")
        ok(pg.locator(".cajon .regla.bl", has_text="Observación del delegado").count() == 1, f"{nombre}: la ficha devuelta muestra la observación")
        pg.fill("#t-cons", "2 años desde el cierre del concurso; luego se suprimen")
        pg.click("#t-enviar")
        ok(ev(pg, "TRAT('T-04').estado") == "revision", f"{nombre}: la ficha pasa a revisión del delegado")

        # --- Dueño: control con evidencia
        ev(pg, "abrirRiesgo('R-04')")
        ok(pg.locator("[data-hecho='C-05']").is_disabled(), f"{nombre}: sin evidencia no se puede dar por implementado")
        pg.click("[data-ev='C-05']")
        pg.click("[data-hecho='C-05']")
        ok(ev(pg, "CONTROLES.find(c => c.id === 'C-05').estado") == "hecho", f"{nombre}: con evidencia, el control queda implementado")
        ev(pg, "cerrarCapa()")

        # --- Delegado: aprueba, asigna dueño, ajusta un riesgo
        como(pg, "Sergio Bravo")
        ev(pg, "ir('tratamientos'); abrirTrat('T-04')")
        pg.click("#t-aprobar")
        ok(ev(pg, "TRAT('T-04').estado") == "aprobado", f"{nombre}: el delegado aprueba la ficha")
        ev(pg, "abrirTrat('T-03')")
        pg.select_option("#t-dueno", "u5")
        pg.click("#t-asig")
        ok(ev(pg, "TRAT('T-03').dueno") == "u5", f"{nombre}: el delegado asigna dueño a una ficha sin dueño")
        ev(pg, "cerrarCapa(); ir('riesgos')")
        pg.screenshot(path=str(SAL / f"{nombre}-l2-riesgos.png"), full_page=True)
        ok(pg.locator(".mc-c").count() == 25, f"{nombre}: el mapa de calor tiene 5 × 5 celdas")
        ok(sin_desborde(), f"{nombre}: la matriz de riesgos no desborda")
        ev(pg, "abrirRiesgo('R-06')")
        pg.select_option("[data-pi='i']", "4")
        ok(ev(pg, "NIVEL(score(RIESGOS.find(r => r.id === 'R-06')))[0]") == "Crítico", f"{nombre}: al subir el impacto, el riesgo pasa a crítico")
        ev(pg, "cerrarCapa()")

        # --- Seguridad registra y evalúa; el delegado reporta, comunica y cierra
        como(pg, "Daniela Ossandón")
        ev(pg, "ir('vulneraciones')")
        pg.click("#v-nueva")
        pg.select_option("#nv-t", "T-02")
        pg.fill("#nv-d", "Acceso no autorizado a la planilla de reservas.")
        pg.click("#nv-ok")
        ok(ev(pg, "VULNERACIONES[0].id") == "V-2027-002", f"{nombre}: se registra la vulneración V-2027-002")
        pg.check("#ev-m")
        pg.fill("#ev-n", "12")
        pg.check("[name=ev-r][value=si]")
        pg.click("#ev-ok")
        ok(ev(pg, "VULNERACIONES[0].paso") == "decision", f"{nombre}: evaluada, pasa a decisión del delegado")
        ev(pg, "cerrarCapa()")
        como(pg, "Sergio Bravo")
        ev(pg, "ir('vulneraciones'); abrirVul('V-2027-002')")
        pg.click("#d-rep")
        ok(ev(pg, "VULNERACIONES[0].agencia") == ev(pg, "HOY"), f"{nombre}: el reporte a la Agencia queda con fecha")
        ok(pg.locator("#c-cerrar").is_disabled(), f"{nombre}: con datos de menores no se cierra sin comunicar a los titulares")
        pg.click("#c-tit")
        pg.click("#c-cerrar")
        ok(ev(pg, "VULNERACIONES[0].paso") == "cerrada", f"{nombre}: comunicada a los titulares, se cierra")
        ev(pg, "cerrarCapa()")
        ok(sin_desborde(), f"{nombre}: vulneraciones sin scroll horizontal")

        # --- Evaluación de impacto: dueño inicia y envía; Fiscalía termina
        como(pg, "Natalia Herrera")
        ev(pg, "ir('eipd')")
        pg.click("[data-eipd='T-06']")
        pg.click("[data-eipd='T-06']")
        ok(ev(pg, "EIPD['T-06'].estado") == "fiscalia", f"{nombre}: el dueño inicia la evaluación y la envía a Fiscalía")
        como(pg, "Andrés Contreras")
        ok(pg.locator(".acceso", has_text="Mis tareas").count() == 1, f"{nombre}: Fiscalía conserva sus tareas del canal")
        ev(pg, "ir('eipd')")
        pg.click("[data-eipd='T-06']")
        ok(ev(pg, "EIPD['T-06'].estado") == "lista", f"{nombre}: Fiscalía da por terminada la evaluación")

        # --- Encargados y convenios (Fiscalía)
        ev(pg, "ir('encargados'); abrirEnc('E-03')")
        for c in pg.locator("[data-cl]").all():
            c.check()
        pg.click("#cl-ok")
        ok(ev(pg, "ENCARGADOS.find(e => e.id === 'E-03').ok.length") == 9, f"{nombre}: el contrato queda con las 9 cláusulas del art. 15 bis")
        ev(pg, "ir('convenios')")
        pg.click("[data-pub='CV-03']")
        ok(ev(pg, "CONVENIOS.find(c => c.id === 'CV-03').pub.includes(MES_PUB)"), f"{nombre}: se registra la publicación mensual del convenio")

        # --- Bitácora y barrido
        como(pg, "Sergio Bravo")
        ev(pg, "ir('bitacora')")
        txt = pg.inner_text("#vista")
        ok("V-2027-002" in txt and "T-04" in txt, f"{nombre}: la bitácora registra las acciones de la línea 2")
        ok(not re.search(r"[\w.+-]+@conaf\.cl", pg.content(), re.I), f"{nombre}: sin correos @conaf.cl")

    ok(not errores, "sin errores de consola" + ("" if not errores else ": " + " | ".join(errores[:3])))
    nav.close()

print(f"\n{oks} OK · {len(fallas)} fallas · capturas en {SAL}")
sys.exit(1 if fallas else 0)
