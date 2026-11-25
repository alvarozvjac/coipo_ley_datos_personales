"""Capturas del manual de usuario de la maqueta CON012.

Uso (desde la raíz del repositorio):  python -X utf8 manual/capturar.py
Requiere playwright con Chromium. Escribe manual/img/*.jpg, que usa manual/manual.html.
Todas las capturas salen de la maqueta con sus datos ficticios.
"""
import pathlib

from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
URL = (RAIZ / "index.html").resolve().as_uri()
SAL = RAIZ / "manual" / "img"
SAL.mkdir(parents=True, exist_ok=True)


def foto(pg, nombre, sel=None):
    pg.wait_for_timeout(450)
    destino = str(SAL / f"{nombre}.jpg")
    if sel:
        pg.locator(sel).first.screenshot(path=destino, type="jpeg", quality=82)
    else:
        pg.screenshot(path=destino, type="jpeg", quality=82)


def entrar(pg, texto, sede="Oficina Central"):
    pg.goto(URL)
    pg.wait_for_selector("#login:not([hidden])")
    if texto == "Persona solicitante":
        pg.locator("#login .l-usuario", has_text=texto).first.click()
    else:  # el ingreso sólo entra a Oficina Central; la cuenta de cada sede se abre por su id
        uid = pg.evaluate("([t, s]) => { const u = USUARIOS.find(x => PERFILES[x.perfil].n.includes(t) && x.sede === s); return u ? u.id : null; }", [texto, sede])
        pg.evaluate("window.tostada = () => {}")   # sin avisos flotantes sobre las capturas
        pg.evaluate("id => entrar(id)", uid)
    pg.wait_for_selector("#vista .hero, #vista .items-14ter")


def caso(pg, num, nombre):
    pg.evaluate(f"abrirCaso('{num}')")
    foto(pg, nombre, ".cajon")
    pg.evaluate("cerrarCapa()")


with sync_playwright() as p:
    nav = p.chromium.launch()
    pg = nav.new_page(viewport={"width": 1280, "height": 860}, color_scheme="light")
    pg.goto(URL)
    pg.wait_for_selector("#login:not([hidden])")
    foto(pg, "00-ingreso")

    # Persona solicitante
    entrar(pg, "Persona solicitante")
    foto(pg, "02-pagina")
    pg.get_by_role("button", name="Presentar una solicitud").click()
    foto(pg, "03-clave-unica", ".cajon")
    pg.locator("#cu-ok").click()
    foto(pg, "04-paso1")
    pg.get_by_role("button", name="Continuar →").click()
    pg.locator("input[name=der][value=rectificacion]").check()
    pg.locator("input[name=der][value=bloqueo]").check()
    pg.wait_for_timeout(200)
    pg.locator("input[name=der][value=rectificacion]").check()
    pg.fill("#s-det", "Mi segundo apellido figura mal escrito en el registro de un programa.")
    pg.fill("#s-fb", "El error me impide un trámite.")
    pg.evaluate("document.activeElement.blur(); scrollTo(0, 0)")
    foto(pg, "05-paso2")
    pg.get_by_role("button", name="Continuar →").click()
    pg.fill("#s-mail", "persona@ejemplo.cl")
    pg.locator("#s-reg").select_option(index=1)  # región del domicilio (define la dirección regional)
    pg.evaluate("document.activeElement.blur(); scrollTo(0, 0)")
    foto(pg, "06-paso3")
    pg.get_by_role("button", name="Continuar →").click()
    pg.locator("#s-decl").check()
    foto(pg, "07-paso4")
    pg.get_by_role("button", name="Enviar solicitud").click()
    foto(pg, "08-acuse")
    pg.get_by_role("button", name="Ver mis solicitudes").click()
    foto(pg, "09-mis")

    # Unidad Jurídica de Oficina Central: asume las funciones del Encargado de Gestión (reunión del 18-11-2026).
    # Todos los casos son de Oficina Central, para que el panel muestre las acciones de la cuenta.
    entrar(pg, "Unidad Jurídica")
    foto(pg, "10-inicio-juridica")
    pg.locator(".acceso", has_text="Mis tareas").first.click()
    foto(pg, "11-casos")
    caso(pg, "DP-2027-000004", "12-caso-recepcion")
    caso(pg, "DP-2027-000003", "21-caso-bloqueo")
    caso(pg, "DP-2027-000001", "22-caso-admisibilidad")
    caso(pg, "DP-2026-000110", "13-caso-derivacion")
    caso(pg, "DP-2026-000105", "23-caso-revision")
    caso(pg, "DP-2026-000111", "14-caso-respuesta")
    caso(pg, "DP-2026-000103", "24-caso-reclamo")
    pg.evaluate("ir('registrar')")
    foto(pg, "15-registrar")

    # Delegado de protección de datos: seguimiento nacional, sólo lectura
    entrar(pg, "Delegado de protección de datos")
    foto(pg, "50-inicio-delegado")
    foto(pg, "51-panel-sedes", "#panel-sedes")
    caso(pg, "DP-2027-000003", "52-caso-delegado")
    pg.evaluate("ir('calendario')")
    foto(pg, "70-calendario")
    pg.evaluate("ir('reportes')")
    foto(pg, "71-reportes")

    # Área que trata los datos
    entrar(pg, "Área que trata")
    foto(pg, "30-inicio-area")
    caso(pg, "DP-2026-000106", "31-caso-analisis")

    # Director o directora (revisa y firma; no deriva)
    entrar(pg, "Director o directora")
    foto(pg, "40-inicio-director")
    caso(pg, "DP-2026-000104", "41-caso-firma")

    # Unidad Jurídica, en la configuración del canal (antes del Encargado de Gestión)
    entrar(pg, "Unidad Jurídica")
    pg.evaluate("ir('responsables')")
    foto(pg, "61-responsables")
    pg.evaluate("editarCelda('Dirección Regional Valparaíso', 'recibe')")
    foto(pg, "62-editar-celda", ".cajon")
    pg.evaluate("cerrarCapa()")
    pg.evaluate("ir('parametros')")
    foto(pg, "63-parametros")
    pg.evaluate("ir('bitacora')")
    foto(pg, "64-bitacora")


    # Teléfono
    tel = nav.new_context(viewport={"width": 390, "height": 760}, is_mobile=True, has_touch=True, device_scale_factor=2).new_page()
    tel.goto(URL)
    tel.wait_for_selector("#login:not([hidden])")
    tel.evaluate("window.tostada = () => {}")
    tel.locator("#login .l-usuario", has_text="Persona solicitante").first.click()
    tel.wait_for_selector("#vista .items-14ter")
    foto(tel, "80-telefono-pagina")
    tel.locator("#btn-salir").click()
    tel.evaluate("entrar('dpo')")
    tel.wait_for_selector("#panel-sedes")
    foto(tel, "81-telefono-delegado")
    nav.close()
print("capturas en", SAL)
