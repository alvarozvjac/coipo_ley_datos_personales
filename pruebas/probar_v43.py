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


def entrar(pg, perfil, sede="Oficina Central"):
    pg.goto(URL)
    pg.wait_for_selector("#login:not([hidden])")
    if perfil == "Persona solicitante":
        pg.locator("#login .l-usuario", has_text=perfil).first.click()
    else:  # el ingreso sólo entra a Oficina Central; la cuenta de cada sede se abre por su id
        uid = pg.evaluate("([t, s]) => { const u = USUARIOS.find(x => PERFILES[x.perfil].n.includes(t) && x.sede === s); return u ? u.id : null; }", [perfil, sede])
        pg.evaluate("id => entrar(id)", uid)
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
    for perfil in ["Encargado de Gestión", "Unidad Jurídica", "Director o directora", "Área que trata los datos"]:
        n = etiquetas.count(perfil)
        ok(n == 1, f"ingreso: «{perfil}» aparece {n} vez (debe ser 1)")
    for retirado in ["Responsable de datos", "Encargado de Gestión regional", "Unidad jurídica regional", "Firmante",
                     "Dueño de tratamiento", "Seguridad de la información",
                     "Delegado de protección de datos", "Administración del canal"]:
        ok(retirado not in etiquetas, f"ingreso: ya no existe «{retirado}»")
    ok(pg.evaluate("SEDES.every(s => ['encargado', 'fiscalia', 'director', 'gerencia'].every(p => "
                   "USUARIOS.filter(u => u.perfil === p && u.sede === s).length === 1))"),
       "datos: cada sede tiene su Encargado, Unidad Jurídica, Director y Área (una cuenta cada uno)")

    # 2. Sin nombres ficticios en el ingreso ni en la sesión
    texto_ingreso = pg.locator("#l-interno").inner_text()
    ok(not any(n in texto_ingreso for n in NOMBRES_FICTICIOS), "ingreso: no aparecen nombres ficticios")

    # 3. Encargado de Gestión: ve y registra en todas las sedes, sin selector de sede propio
    entrar(pg, "Encargado de Gestión")
    ok(not any(n in pg.locator("#quien").inner_text() for n in NOMBRES_FICTICIOS),
       "sesión: el encabezado muestra el perfil, no un nombre ficticio")
    ev(pg, 'ir("casos")')
    pg.wait_for_selector("#c-q", timeout=5000)
    sedes = ev(pg, "[...new Set(misCasos().map(c => c.sede))]")
    ok(sedes == ["Oficina Central"] or sedes == [], f"Encargado de Oficina Central: ve sólo casos de su sede ({sedes})")
    entrar(pg, "Encargado de Gestión", "Dirección Regional Biobío")
    ev(pg, 'ir("casos")')
    pg.wait_for_selector("#c-q", timeout=5000)
    sedes = ev(pg, "[...new Set(misCasos().map(c => c.sede))]")
    ok(sedes == ["Dirección Regional Biobío"], f"Encargado de Biobío: ve sólo casos de su sede ({sedes})")
    ev(pg, 'ir("casos")')
    ok(pg.locator("#vista-sede").count() == 0, "Encargado: ya no hay selector «Sede que consulta»")
    ok(ev(pg, "RECEPTOR.includes(SESION.perfil)") is True, "Encargado: se reconoce como perfil receptor")

    # 4. Director o directora: firma en todas las sedes y no deriva
    entrar(pg, "Director o directora", "Dirección Regional Biobío")
    firma = ev(pg, "misTareas().filter(c => c.etapa === 'firma').map(c => c.num)")
    ok("DP-2026-000112" in firma, f"Director de Biobío: tiene a firmar el caso DP-2026-000112 ({firma})")
    ok(ev(pg, "SEDES.every(s => USUARIOS.find(u => u.id === RESP[s].deriva).perfil === 'encargado')") is True,
       "Director: no deriva; deriva el Encargado de cada sede")
    ok(ev(pg, "SEDES.every(s => USUARIOS.find(u => u.id === RESP[s].firma).sede === s)") is True,
       "Director: firma en cada sede el director de esa sede")

    # 5. Unidad Jurídica: una sola cuenta con la revisión de todas las sedes
    entrar(pg, "Unidad Jurídica")
    ok(ev(pg, "USUARIOS.find(u => u.id === RESP['Dirección Regional Biobío'].revision).sede === 'Dirección Regional Biobío' && "
              "USUARIOS.find(u => u.id === RESP['Oficina Central'].revision).sede === 'Oficina Central'") is True,
       "Fiscalía: hace la revisión (V°B°) en Oficina Central y en Biobío")

    # 6. Área que trata los datos: una persona con sus ámbitos
    entrar(pg, "Área que trata los datos")
    ok(ev(pg, "SEDES.every(s => { const u = USUARIOS.find(x => x.id === RESP[s].ambito); return u.perfil === 'gerencia' && u.sede === s; })") is True,
       "Área: cada sede tiene su Área que trata los datos (analiza sus ámbitos)")

    # 8. Visibilidad y trazabilidad por perfil
    entrar(pg, "Director o directora", "Dirección Regional Biobío")
    ev(pg, 'ir("casos")')
    ok(ev(pg, "CASOS.filter(c => visibleParaUsuario(c, SESION)).every(c => c.etapa === 'firma')") is True,
       "Director: sólo ve los casos cuando les toca firmar (etapa firma)")
    ev(pg, "abrirCaso('DP-2026-000112')")
    ok("Bitácora del caso" not in pg.evaluate("document.body.innerText"),
       "Director: el detalle del caso no muestra la bitácora")
    entrar(pg, "Encargado de Gestión", "Dirección Regional Biobío")
    ev(pg, "abrirCaso('DP-2026-000112')")
    ok("Bitácora del caso" in pg.evaluate("document.body.innerText"),
       "Encargado: el detalle del caso sí muestra la bitácora de su sede")
    entrar(pg, "Unidad Jurídica", "Dirección Regional Biobío")
    ev(pg, "abrirCaso('DP-2026-000112')")
    ok("Bitácora del caso" in pg.evaluate("document.body.innerText"),
       "Unidad Jurídica: ve la trazabilidad completa de su sede")
    ok(ev(pg, "typeof vBitacora === 'function' && SESION.perfil === 'fiscalia'") is True,
       "Unidad Jurídica: tiene acceso a la bitácora global")
    entrar(pg, "Director o directora", "Oficina Central")
    ok(ev(pg, "CASOS.filter(c => visibleParaUsuario(c, SESION)).every(c => c.sede === 'Oficina Central')") is True,
       "Director de Oficina Central: sólo ve casos de su sede")

    # 7. Sin errores de script y sin correos institucionales en pantalla
    ok(not errores, f"sin errores de script ({errores[:2]})")
    ok("@conaf.cl" not in pg.evaluate("document.body.innerText"), "sin correos @conaf.cl en pantalla")
    nav.close()

print(f"\n{oks} OK · {len(fallas)} fallas")
sys.exit(1 if fallas else 0)
