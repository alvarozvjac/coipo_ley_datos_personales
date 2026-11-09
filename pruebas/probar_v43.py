"""Pruebas de los cambios de la v4.3: perfiles regionales, selector de sede del Responsable de datos y fusión del
Dueño de tratamiento con el Área que trata los datos.

Uso (desde la raíz del repositorio):  python -X utf8 pruebas/probar_v43.py [ruta-o-url]
"""
import pathlib
import sys

from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
OBJ = sys.argv[1] if len(sys.argv) > 1 else str(RAIZ / "index.html")
URL = OBJ if OBJ.startswith("http") else pathlib.Path(OBJ).resolve().as_uri()
fallas, oks = [], 0


def ok(cond, msg):
    global oks
    if cond:
        oks += 1
        print("OK   ", msg)
    else:
        fallas.append(msg)
        print("FALLA", msg)


def entrar(pg, nombre):
    pg.goto(URL)
    pg.locator("#login .l-usuario", has_text=nombre).first.click()
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

    # 1. Cada perfil aparece una sola vez en la lista de ingreso
    pg.goto(URL)
    etiquetas = pg.locator("#l-interno .l-usuario b").all_inner_texts()
    for perfil in ["Responsable de datos", "Encargado OIRS regional", "Director o directora regional",
                   "Unidad jurídica regional", "Área que trata los datos", "Fiscalía", "Firmante",
                   "Delegado de protección de datos", "Administración del canal", "Seguridad de la información"]:
        n = etiquetas.count(perfil)
        ok(n == 1, f"ingreso: «{perfil}» aparece {n} vez (debe ser 1)")
    ok("Dueño de tratamiento" not in etiquetas, "ingreso: no existe el perfil Dueño de tratamiento")

    # 2. Responsable de datos: selector de sede en lectura
    entrar(pg, "Paula Rojas")
    ev(pg, 'ir("casos")')
    pg.wait_for_selector("#vista-sede", timeout=5000)
    ok(pg.locator("#vista-sede").count() == 1, "Responsable: aparece el selector «Sede que consulta»")
    pg.locator("#vista-sede").select_option("Dirección Regional Biobío")
    pg.wait_for_timeout(250)
    ok(pg.evaluate("VISTA_SEDE") == "Dirección Regional Biobío", "Responsable: el selector cambia la sede consultada")
    biobio = pg.evaluate("misCasos().filter(c => c.sede === 'Dirección Regional Biobío').length")
    ok(biobio >= 1, f"Responsable: en lectura ve {biobio} casos de Biobío")
    ok(pg.evaluate("responsable(CASOS.find(c => c.sede === 'Dirección Regional Biobío' && abierto(c)))") != "u2",
       "Responsable: no es responsable de los casos de Biobío (sólo lectura)")
    pg.locator("#vista-sede").select_option("Oficina Central")
    pg.wait_for_timeout(150)

    # 3. Encargado OIRS: recibe y registra en su región
    entrar(pg, "Marcelo Fuentes")
    vistos = pg.evaluate("misCasos().map(c => c.sede)")
    ok(len(vistos) >= 1 and set(vistos) == {"Dirección Regional Biobío"},
       f"OIRS: ve sólo casos de Biobío ({len(vistos)} casos)")
    tareas = pg.evaluate("misTareas().length")
    ok(tareas == 0, f"OIRS: sin tareas abiertas en su etapa (ninguno de Biobío está en «recibe») ({tareas})")
    ok(pg.evaluate("RECEPTOR.includes(SESION.perfil)") is True, "OIRS: se reconoce como perfil receptor")
    ok(pg.locator("#vista .hero").count() == 1, "OIRS: carga el inicio")
    ok(pg.evaluate("misCasos().some(c => c.sede === 'Oficina Central')") is False,
       "OIRS: no ve casos de Oficina Central")

    # 4. Director regional: firma en su región
    entrar(pg, "Carmen Lillo")
    firma = pg.evaluate("misTareas().filter(c => c.etapa === 'firma').map(c => c.num)")
    ok("DP-2026-000112" in firma, f"Director: tiene a firmar el caso DP-2026-000112 ({firma})")

    # 5. Unidad jurídica regional: sólo ve casos de su región en revisión
    entrar(pg, "Jorge Medina")
    jur = pg.evaluate("misCasos().map(c => c.sede)")
    ok(all(s == "Dirección Regional Biobío" for s in jur), f"Jurídica: sólo ve casos de Biobío ({len(jur)})")

    # 6. Área que trata los datos: una sola persona con sus dos ámbitos
    entrar(pg, "Natalia Herrera")
    ambitos = pg.evaluate("[...new Set(misCasos().map(c => c.ambito))]")
    ok(pg.evaluate("AMBITOS.filter(a => a.resp === 'u5').map(a => a.k)") == ["personal", "asp"],
       "Área: Natalia es responsable de los ámbitos personal y ASP")
    ok(pg.evaluate("TRATAMIENTOS.filter(t => t.dueno === 'u5').length") == 4,
       "Área: sus 4 tratamientos del registro (fusión con el Dueño)")

    # 7. Sin errores de script y sin correos institucionales en pantalla
    ok(not errores, f"sin errores de script ({errores[:2]})")
    textos = pg.evaluate("document.body.innerText")
    ok("@conaf.cl" not in textos, "sin correos @conaf.cl en pantalla")
    nav.close()

print(f"\n{oks} OK · {len(fallas)} fallas")
sys.exit(1 if fallas else 0)
