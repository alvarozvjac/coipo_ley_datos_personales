"""Pruebas de la v4.3: una cuenta por función (en todas las sedes), sin nombres ficticios en pantalla,
Director o directora que revisa y firma (sin Firmante) y Área que trata los datos fusionado con el Dueño de tratamiento.

Uso (desde la raíz del repositorio):  python -X utf8 pruebas/probar_v43.py [ruta-o-url]
"""
import pathlib
import sys

from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
OBJ = sys.argv[1] if len(sys.argv) > 1 else str(RAIZ / "index.html")
URL = OBJ if OBJ.startswith("http") else pathlib.Path(OBJ).resolve().as_uri()
fallas, oks = [], 0
NOMBRES_FICTICIOS = ["Paula Rojas", "Marcelo Fuentes", "Andrés Contreras", "Natalia Herrera", "Carmen Lillo",
                     "Jorge Medina", "Ricardo Fuenzalida", "Sergio Bravo", "Valeria Soto", "Daniela Ossandón"]


def ok(cond, msg):
    global oks
    if cond:
        oks += 1
        print("OK   ", msg)
    else:
        fallas.append(msg)
        print("FALLA", msg)


def entrar(pg, perfil):
    pg.goto(URL)
    pg.locator("#login .l-usuario", has_text=perfil).first.click()
    pg.wait_for_selector("#vista .hero", timeout=5000)


def ev(pg, js):
    r = pg.evaluate(js)
    pg.wait_for_timeout(120)
    return r


with sync_playwright() as p:
    nav = p.chromium.launch()
    pg = nav.new_page(viewport={"width": 1280, "height": 900})
    errores = []
    pg.on("pageerror", lambda e: errores.append(str(e)))

    # 1. Una sola cuenta por función y sin los perfiles retirados
    pg.goto(URL)
    etiquetas = pg.locator("#l-interno .l-usuario b").all_inner_texts()
    for perfil in ["Encargado OIRS", "Unidad Jurídica", "Director o directora", "Área que trata los datos",
                   "Delegado de protección de datos", "Administración del canal"]:
        n = etiquetas.count(perfil)
        ok(n == 1, f"ingreso: «{perfil}» aparece {n} vez (debe ser 1)")
    for retirado in ["Responsable de datos", "Encargado OIRS regional", "Unidad jurídica regional", "Firmante",
                     "Dueño de tratamiento", "Seguridad de la información"]:
        ok(retirado not in etiquetas, f"ingreso: ya no existe «{retirado}»")
    ok(pg.evaluate("new Set(USUARIOS.filter(u => u.perfil !== 'solicitante').map(u => u.perfil)).size === "
                   "USUARIOS.filter(u => u.perfil !== 'solicitante').length"),
       "datos: cada perfil tiene una sola cuenta")

    # 2. Sin nombres ficticios en el ingreso ni en la sesión
    texto_ingreso = pg.locator("#l-interno").inner_text()
    ok(not any(n in texto_ingreso for n in NOMBRES_FICTICIOS), "ingreso: no aparecen nombres ficticios")

    # 3. Encargado OIRS: ve y registra en todas las sedes, sin selector de sede propio
    entrar(pg, "Encargado OIRS")
    ok(not any(n in pg.locator("#quien").inner_text() for n in NOMBRES_FICTICIOS),
       "sesión: el encabezado muestra el perfil, no un nombre ficticio")
    ev(pg, 'ir("casos")')
    pg.wait_for_selector("#c-q", timeout=5000)
    sedes = ev(pg, "[...new Set(misCasos().map(c => c.sede))]")
    ok("Oficina Central" in sedes and "Dirección Regional Biobío" in sedes,
       f"Encargado: ve casos de varias sedes ({len(sedes)})")
    ok(pg.locator("#vista-sede").count() == 0, "Encargado: ya no hay selector «Sede que consulta»")
    ok(ev(pg, "RECEPTOR.includes(SESION.perfil)") is True, "Encargado: se reconoce como perfil receptor")

    # 4. Director o directora: firma en todas las sedes y no deriva
    entrar(pg, "Director o directora")
    firma = ev(pg, "misTareas().filter(c => c.etapa === 'firma').map(c => c.num)")
    ok("DP-2026-000112" in firma, f"Director: tiene a firmar el caso DP-2026-000112 ({firma})")
    ok(ev(pg, "SEDES.every(s => RESP[s].deriva !== 'u12')") is True, "Director: no deriva en ninguna sede")
    ok(ev(pg, "SEDES.every(s => RESP[s].firma === 'u12' || !RESP[s].prueba)") is True,
       "Director: es quien firma en las sedes con asignación de prueba")

    # 5. Unidad Jurídica: una sola cuenta con la revisión de todas las sedes
    entrar(pg, "Unidad Jurídica")
    ok(ev(pg, "RESP['Dirección Regional Biobío'].revision === 'u4' && RESP['Oficina Central'].revision === 'u4'") is True,
       "Fiscalía: hace la revisión (V°B°) en Oficina Central y en Biobío")

    # 6. Área que trata los datos: una persona con sus ámbitos
    entrar(pg, "Área que trata los datos")
    ok(ev(pg, "AMBITOS.filter(a => a.resp === 'u5').map(a => a.k)") == ["personal", "asp"],
       "Área: responsable de los ámbitos personal y ASP")

    # 7. Sin errores de script y sin correos institucionales en pantalla
    ok(not errores, f"sin errores de script ({errores[:2]})")
    ok("@conaf.cl" not in pg.evaluate("document.body.innerText"), "sin correos @conaf.cl en pantalla")
    nav.close()

print(f"\n{oks} OK · {len(fallas)} fallas")
sys.exit(1 if fallas else 0)
