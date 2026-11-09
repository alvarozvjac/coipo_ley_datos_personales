"""Imprime manual/manual.html a manual/manual-usuario.pdf con Chromium (Playwright).
Uso (desde la raíz del repositorio):  python -X utf8 manual/imprimir.py"""
import pathlib
from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent
with sync_playwright() as p:
    nav = p.chromium.launch()
    pg = nav.new_page()
    pg.goto((RAIZ / "manual.html").as_uri(), wait_until="networkidle")
    pg.evaluate("document.fonts.ready")
    pg.pdf(path=str(RAIZ / "manual-usuario.pdf"), format="A4", print_background=True, prefer_css_page_size=True,
           display_header_footer=True, header_template="<span></span>",
           footer_template='<div style="font-size:8px;width:100%;text-align:center;color:#5b6560">CON012 · Manual de usuario · maqueta v4.3 · página <span class="pageNumber"></span> de <span class="totalPages"></span></div>')
    nav.close()
print("manual-usuario.pdf listo")
