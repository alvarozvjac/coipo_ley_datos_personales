"""Pruebas funcionales de la maqueta CON012 v4 (formato flota).

Uso (desde la raíz del repositorio):  python -X utf8 pruebas/probar_v4.py [ruta-o-url] [carpeta-capturas]
Requiere: pip install playwright  y  python -m playwright install chromium
Recorre cada perfil, las transiciones de un caso y las mejoras de la v4; guarda capturas de viewport.
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


def entrar(pg, perfil_txt):
    pg.goto(URL)
    pg.wait_for_selector("#login:not([hidden])")
    pg.locator("#login .l-usuario", has_text=perfil_txt).first.click()
    pg.wait_for_selector("#vista .hero, #vista .items-14ter")


def tarjeta(pg, titulo):
    pg.locator(".acceso", has_text=titulo).first.click()
    pg.wait_for_timeout(150)


with sync_playwright() as p:
    nav = p.chromium.launch()
    errores = []
    for nombre, op in {"escritorio": {"viewport": {"width": 1440, "height": 900}},
                       "telefono": {"viewport": {"width": 390, "height": 844}, "is_mobile": True, "has_touch": True, "device_scale_factor": 2}}.items():
        ctx = nav.new_context(**op)
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: errores.append(str(e)))
        pg.on("console", lambda m: errores.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        tel = nombre == "telefono"

        # --- Persona solicitante: página (entrada directa) → solicitud → acuse → mis solicitudes
        entrar(pg, "Persona solicitante")
        pg.screenshot(path=str(SAL / f"{nombre}-01-pagina.png"))
        y = pg.evaluate("document.querySelector('#vista').getBoundingClientRect().top")
        ok(y < (300 if tel else 400), f"{nombre}: el contenido empieza en y={y:.0f}")
        ok(pg.evaluate("document.documentElement.scrollWidth") <= op["viewport"]["width"], f"{nombre}: sin scroll horizontal en la página")
        ok(pg.locator(".portada").count() == 0, f"{nombre}: el solicitante entra directo a la página, sin portada simulada")
        ok(pg.locator(".items-14ter li").count() == 12, f"{nombre}: la página muestra las 12 letras del art. 14 ter")
        pg.screenshot(path=str(SAL / f"{nombre}-02-pagina.png"))
        pg.get_by_role("button", name="Presentar una solicitud").click()
        pg.get_by_role("button", name="Continuar →").click()
        ok(pg.locator("#faltan").count() == 1, f"{nombre}: sin Clave Única no avanza")
        pg.get_by_role("button", name="Ingresar con Clave Única").click()
        pg.locator("#cu-ok").click()
        pg.locator("input[name=calidad][value=representante]").check()
        pg.get_by_role("button", name="Continuar →").click()
        ok("poder notarial" in pg.locator("#faltan").inner_text(), f"{nombre}: el representante debe adjuntar poder notarial")
        pg.locator("input[name=calidad][value=titular]").check()
        pg.get_by_role("button", name="Continuar →").click()
        pg.locator("input[name=der][value=acceso]").check()
        pg.get_by_role("button", name="Continuar →").click()
        ok("Describa" in pg.locator("#faltan").inner_text(), f"{nombre}: el detalle es obligatorio")
        pg.fill("#s-det", "Datos de mi postulación a un concurso del año 2024.")
        pg.locator("input[name=der][value=bloqueo]").check()
        pg.fill("#s-fb", "Hay un error en mis datos que me perjudica.")
        pg.get_by_role("button", name="Continuar →").click()
        pg.screenshot(path=str(SAL / f"{nombre}-03-paso3.png"))
        pg.locator("input[name=medio][value=retiro]").check()
        pg.fill("#s-mail", "persona@ejemplo.cl")
        pg.select_option("#s-ret", "Dirección Regional Biobío")
        pg.get_by_role("button", name="Continuar →").click()
        pg.locator("#s-decl").check()
        pg.get_by_role("button", name="Enviar solicitud").click()
        num = pg.locator(".acuse-num").inner_text()
        ok(re.match(r"DP-2027-\d{6}", num) is not None, f"{nombre}: acuse con número {num}")
        ok("10-02-2027" in pg.locator("#vista").inner_text(), f"{nombre}: respuesta a más tardar el 10-02-2027")
        pg.screenshot(path=str(SAL / f"{nombre}-04-acuse.png"))
        pg.get_by_role("button", name="Ver mis solicitudes").click()
        ok(pg.locator("article.sol").count() >= 3, f"{nombre}: «Mis solicitudes» lista los casos de la persona")
        f = pg.locator("form[data-ant]")
        ok(f.count() == 1, f"{nombre}: hay un caso que pide antecedentes")
        f.locator("textarea").fill("Fue en la oficina de Talca, en 2023.")
        f.get_by_role("button", name="Enviar antecedentes").click()
        ok(pg.locator("form[data-ant]").count() == 0, f"{nombre}: los antecedentes se envían")
        pg.screenshot(path=str(SAL / f"{nombre}-05-mis.png"))

        # --- Recepción Oficina Central
        entrar(pg, "Paula Rojas")
        pg.screenshot(path=str(SAL / f"{nombre}-06-inicio-recepcion.png"))
        tarjeta(pg, "Mis tareas")
        pg.locator("[data-caso='DP-2027-000004']:visible").first.click()
        pg.locator("#a-ident").check()
        pg.locator("[data-a='a-admis']").click()
        ok("En admisibilidad" in pg.locator("#capa").inner_text(), f"{nombre}: recepción pasa el caso a admisibilidad")
        pg.screenshot(path=str(SAL / f"{nombre}-07-caso.png"))
        pg.locator("#cerrar").click()
        pg.get_by_role("button", name="Volver al inicio").click()
        tarjeta(pg, "Registrar solicitud")
        pg.fill("#r-fecha", "2027-01-08")
        pg.fill("#r-folio", "OP-OC-9001")
        pg.fill("#r-run", "11.222.333-0")
        pg.fill("#r-nom", "Persona Ficticia Uno")
        pg.locator("input[name=r-der][value=rectificacion]").check()
        pg.fill("#r-det", "Corregir el apellido.")
        pg.get_by_role("button", name="Registrar y acusar recibo").click()
        ok("digitalizado" in pg.locator("#faltan").inner_text(), f"{nombre}: el documento digitalizado es obligatorio")
        pg.locator("#r-scan").check()
        pg.get_by_role("button", name="Registrar y acusar recibo").click()
        txt = pg.locator("#capa").inner_text()
        ok("07-02-2027" in txt and "Requiere antecedentes" in txt, f"{nombre}: el plazo corre desde el timbre y pide la cédula")
        pg.locator("#cerrar").click()

        # --- Fiscalía: bloqueo
        entrar(pg, "Fiscalía")
        tarjeta(pg, "Bloqueos por resolver")
        pg.locator("[data-caso='DP-2027-000003']:visible").first.click()
        pg.locator("[data-a='bloq-no']").click()
        ok(pg.locator("#a-fb[aria-invalid=true]").count() == 1, f"{nombre}: rechazar el bloqueo exige fundamento")
        pg.locator("[data-a='bloq-ok']").click()
        ok("Bloqueo temporal acogido" in pg.locator("#capa").inner_text(), f"{nombre}: Fiscalía acoge el bloqueo")
        pg.locator("#cerrar").click()

        # --- Fiscalía: reclamo ante la Agencia (art. 41)
        entrar(pg, "Fiscalía")
        tarjeta(pg, "Reclamos ante la Agencia")
        pg.locator("[data-caso='DP-2026-000103']:visible").first.click()
        ok("03-02-2027" in pg.locator("#capa").inner_text(), f"{nombre}: el reclamo vence 30 días corridos después de la notificación")
        pg.fill("#a-rec", "Se remiten los antecedentes de la causal del art. 23.")
        pg.locator("[data-a='rec-resp']").click()
        ok("Respuesta al reclamo enviada" in pg.locator("#capa").inner_text(), f"{nombre}: Fiscalía registra la respuesta a la Agencia")
        pg.screenshot(path=str(SAL / f"{nombre}-12-reclamo.png"))
        pg.locator("#cerrar").click()

        # --- Firmante: firma una respuesta
        entrar(pg, "Firmante")
        pg.screenshot(path=str(SAL / f"{nombre}-13-inicio-firmante.png"))
        tarjeta(pg, "Por firmar")
        pg.locator("[data-caso='DP-2026-000104']:visible").first.click()
        pg.fill("#a-doc", "Carta Oficial N° 21 (ficticia)")
        pg.locator("[data-a='firmada']").click()
        ok("Firmada · por enviar" in pg.locator("#capa").inner_text(), f"{nombre}: el firmante firma y el caso pasa a envío")
        pg.locator("#cerrar").click()

        # --- Delegado: observación
        entrar(pg, "Delegado")
        pg.screenshot(path=str(SAL / f"{nombre}-14-inicio-delegado.png"))
        tarjeta(pg, "Plazos vencidos")
        pg.locator("[data-caso]:visible").first.click()
        pg.fill("#a-dpo", "Priorizar la respuesta: el plazo legal venció.")
        pg.locator("[data-a='dpo']").click()
        ok("Observación del delegado" in pg.locator("#capa").inner_text(), f"{nombre}: el delegado deja una observación")
        pg.locator("#cerrar").click()

        # --- Administración: responsables por sede
        entrar(pg, "Administración")
        pg.screenshot(path=str(SAL / f"{nombre}-08-inicio-admin.png"))
        tarjeta(pg, "Casos sin responsable")
        n0 = pg.locator("[data-caso]:visible").count()
        ok(n0 >= 2, f"{nombre}: hay {n0} casos sin responsable (Valparaíso, Los Lagos)")
        pg.get_by_role("button", name="Volver al inicio").click()
        tarjeta(pg, "Responsables por etapa y sede")
        pg.screenshot(path=str(SAL / f"{nombre}-09-responsables.png"))
        ok(pg.evaluate("document.documentElement.scrollWidth") <= op["viewport"]["width"], f"{nombre}: la tabla de responsables no desborda la página")
        pg.locator(".celda-resp[data-s='Dirección Regional Valparaíso'][data-k='recibe']").click()
        pg.select_option("#e-u", "u3")  # v4.3: en regiones recibe el Encargado OIRS
        pg.locator("#e-ok").click()
        pg.get_by_role("button", name="Volver al inicio").click()
        tarjeta(pg, "Casos sin responsable")
        ok(pg.locator("[data-caso]:visible").count() < n0, f"{nombre}: al asignar, salen de «sin responsable»")
        pg.get_by_role("button", name="Volver al inicio").click()
        tarjeta(pg, "Plazos internos")
        pg.fill("[data-int='admisibilidad']", "2")
        pg.get_by_role("button", name="Guardar plazos").click()
        ok("Suma de los plazos definidos: 2" in pg.locator("#vista").inner_text(), f"{nombre}: se guarda un plazo interno")
        pg.get_by_role("button", name="Volver al inicio").click()
        tarjeta(pg, "Calendario")
        ok(pg.locator(".cal-ev").count() > 0, f"{nombre}: el calendario muestra vencimientos")
        pg.screenshot(path=str(SAL / f"{nombre}-10-calendario.png"))
        pg.get_by_role("button", name="Volver al inicio").click()
        tarjeta(pg, "Reportes")
        pg.screenshot(path=str(SAL / f"{nombre}-11-reportes.png"))
        ok(pg.locator(".kpi").count() == 4, f"{nombre}: los reportes muestran 4 indicadores")
        ctx.close()

    # --- Barrido de datos personales en lo publicado
    textos = "".join(f.read_text(encoding="utf-8") for f in [RAIZ / "index.html", *sorted((RAIZ / "js").glob("*.js"))])
    def dv(n):
        s, m = 0, 2
        for c in reversed(str(n)):
            s += int(c) * m
            m = 2 if m == 7 else m + 1
        r = 11 - s % 11
        return "0" if r == 11 else "K" if r == 10 else str(r)
    runs = re.findall(r"\b(\d{1,2}\.?\d{3}\.?\d{3})-([\dkK])\b", textos)
    ok(all(dv(a.replace(".", "")) != b.upper() for a, b in runs), f"barrido: {len(runs)} RUN escritos, todos con dígito verificador inválido")
    ok(not re.search(r"[\w.+-]+@conaf\.cl", textos, re.I), "barrido: sin correos @conaf.cl")
    ok(errores == [], "sin errores de consola" + ("" if not errores else ": " + " | ".join(errores[:3])))
    nav.close()

print(f"\n{oks} OK · {len(fallas)} fallas · capturas en {SAL}")
sys.exit(1 if fallas else 0)
