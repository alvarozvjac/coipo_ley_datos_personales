"""Genera los diagramas de flujo por perfil del manual (manual/img/flujo-*.svg).

Uso (desde la raíz del repositorio):  python -X utf8 manual/diagramas_flujo.py
Cada diagrama sigue las transiciones de js/interno.js (acciones de cada perfil) y las etapas de js/datos.js.
Convención: recuadro verde = paso del perfil; recuadro punteado = paso de otro perfil; rombo = decisión;
gris redondeado = cierre del caso.
"""
import pathlib
import textwrap
from xml.sax.saxutils import escape

SAL = pathlib.Path(__file__).resolve().parent / "img"
W, H_BOX, W_BOX = 780, 64, 170
COL = {1: 20, 2: 215, 3: 410, 4: 605}
ROW = {0: 20, 1: 128, 2: 236, 3: 344}
ESTILO = {
    "step": ("#eef5f0", "#2e6b43", ""),
    "ext": ("#ffffff", "#5b6b62", 'stroke-dasharray="6 4"'),
    "dec": ("#fff6e0", "#9a6a00", ""),
    "end": ("#e4e9e6", "#4a5a50", ""),
    "side": ("#ffffff", "#8a958f", 'stroke-dasharray="3 3"'),
}


def caja(nodos, nid, c, r, texto, tipo="step", w=W_BOX):
    x, y = COL[c], ROW[r]
    nodos[nid] = dict(x=x, y=y, w=w, h=H_BOX, texto=texto, tipo=tipo)


def ancla(n, lado):
    x, y, w, h = n["x"], n["y"], n["w"], n["h"]
    return {"l": (x, y + h / 2), "r": (x + w, y + h / 2), "t": (x + w / 2, y), "b": (x + w / 2, y + h)}[lado]


def ruta(p1, s1, p2, s2):
    (x1, y1), (x2, y2) = p1, p2
    if abs(y1 - y2) < 1 or abs(x1 - x2) < 1:
        return [(x1, y1), (x2, y2)]
    if s1 in "lr" and s2 in "lr":
        xm = (x1 + x2) / 2
        return [(x1, y1), (xm, y1), (xm, y2), (x2, y2)]
    if s1 in "tb" and s2 in "tb":
        ym = (y1 + y2) / 2
        return [(x1, y1), (x1, ym), (x2, ym), (x2, y2)]
    if s1 in "lr":
        return [(x1, y1), (x2, y1), (x2, y2)]
    return [(x1, y1), (x1, y2), (x2, y2)]


def dibujar(titulo, nodos, aristas, nota):
    partes = []
    for a, sa, b, sb, etiqueta, punteada in aristas:
        pts = ruta(ancla(nodos[a], sa), sa, ancla(nodos[b], sb), sb)
        d = "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in pts)
        extra = 'stroke-dasharray="5 4"' if punteada else ""
        partes.append(f'<path d="{d}" fill="none" stroke="#3b4a42" stroke-width="1.4" {extra} marker-end="url(#f)"/>')
        if etiqueta:
            (x0, y0), (x1, y1) = pts[0], pts[1]
            if abs(y0 - y1) < 0.5:   # primer tramo horizontal: etiqueta centrada encima de la línea
                lx, ly, ancla_txt = (x0 + x1) / 2, y0 - 5, "middle"
            else:                     # primer tramo vertical: etiqueta a la derecha de la línea
                lx, ly, ancla_txt = x0 + 5, (y0 + y1) / 2, "start"
            partes.append(f'<text x="{lx:.1f}" y="{ly:.1f}" class="et" text-anchor="{ancla_txt}">{escape(etiqueta)}</text>')
    for nid, n in nodos.items():
        fondo, borde, extra = ESTILO[n["tipo"]]
        x, y, w, h = n["x"], n["y"], n["w"], n["h"]
        if n["tipo"] == "dec":
            cx, cy = x + w / 2, y + h / 2
            pts = f"{cx},{y} {x + w},{cy} {cx},{y + h} {x},{cy}"
            partes.append(f'<polygon points="{pts}" fill="{fondo}" stroke="{borde}" stroke-width="1.4"/>')
            ancho = 17
        else:
            rx = 18 if n["tipo"] == "end" else 6
            partes.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fondo}" stroke="{borde}" stroke-width="1.4" {extra}/>')
            ancho = 25
        lineas = textwrap.wrap(n["texto"], ancho)[:3]
        lh = 14
        y0 = y + h / 2 - (len(lineas) - 1) * lh / 2 + 4.5
        for k, linea in enumerate(lineas):
            partes.append(f'<text x="{x + w / 2:.1f}" y="{y0 + k * lh:.1f}" class="tx" text-anchor="middle">{escape(linea)}</text>')
    alto = 470
    leyenda = [("step", "Paso de este perfil"), ("ext", "Paso de otro perfil"), ("dec", "Decisión"), ("end", "Cierre del caso")]
    lx = 20
    ly = alto - 22
    for tipo, txt in leyenda:
        fondo, borde, extra = ESTILO[tipo]
        if tipo == "dec":
            partes.append(f'<polygon points="{lx + 9},{ly - 9} {lx + 18},{ly} {lx + 9},{ly + 9} {lx},{ly}" fill="{fondo}" stroke="{borde}"/>')
        else:
            partes.append(f'<rect x="{lx}" y="{ly - 9}" width="18" height="12" rx="3" fill="{fondo}" stroke="{borde}" {extra}/>')
        partes.append(f'<text x="{lx + 24}" y="{ly + 1}" class="leyenda">{escape(txt)}</text>')
        lx += 24 + 7.2 * len(txt) + 18
    cuerpo = "\n".join(partes)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {alto}" role="img" aria-label="{escape(titulo)}">
<title>{escape(titulo)}</title>
<defs><marker id="f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#3b4a42"/></marker></defs>
<style>.tx{{font:12px sans-serif;fill:#1d2a23}} .et{{font:italic 11px sans-serif;fill:#3b4a42}} .leyenda{{font:11px sans-serif;fill:#3b4a42}}</style>
<rect width="{W}" height="{alto}" fill="#ffffff"/>
{cuerpo}
<text x="20" y="{alto - 4}" class="leyenda">{escape(nota)}</text>
</svg>
'''


def generar():
    SAL.mkdir(parents=True, exist_ok=True)
    diagramas = {}

    # 1. Persona solicitante
    n = {}
    caja(n, "s1", 1, 0, "Presenta la solicitud en el sitio público (Clave Única simulada)")
    caja(n, "s2", 2, 0, "Recibe el acuse con el número de caso")
    caja(n, "s3", 3, 0, "Sigue el estado en Mis solicitudes")
    caja(n, "d1", 3, 1, "¿CONAF pide antecedentes?", "dec")
    caja(n, "s4", 2, 1, "Envía los antecedentes pedidos")
    caja(n, "s5", 3, 2, "Recibe la respuesta por correo, carta o retiro")
    caja(n, "d2", 3, 3, "¿Acoge la solicitud?", "dec")
    caja(n, "e1", 2, 3, "Caso cerrado", "end")
    caja(n, "s6", 4, 3, "Reclama ante la Agencia (30 días hábiles)")
    a = [("s1", "r", "s2", "l", "", False), ("s2", "r", "s3", "l", "", False), ("s3", "b", "d1", "t", "", False),
         ("d1", "l", "s4", "r", "sí", False), ("s4", "t", "s2", "b", "sigue el caso", True),
         ("d1", "b", "s5", "t", "no", False), ("s5", "b", "d2", "t", "", False), ("d2", "l", "e1", "r", "sí", False),
         ("d2", "r", "s6", "l", "no", False)]
    diagramas["solicitante"] = dibujar("Flujo de la persona solicitante", n, a,
                                        "Ley 21.719, art. 14 ter y 11. El plazo legal y el reclamo se informan en el acuse y en la respuesta.")

    # 2. Unidad Jurídica (asume las funciones del Encargado de Gestión desde la reunión del 18-11-2026)
    n = {}
    caja(n, "j1", 1, 0, "Recibe la solicitud: web o Oficina de Partes")
    caja(n, "j2", 2, 0, "Verifica identidad; resuelve el bloqueo (2 días hábiles), si lo hay")
    caja(n, "d1", 3, 0, "¿Procede? (art. 23 inc. 2°)", "dec")
    caja(n, "j3", 4, 0, "Declara admisible")
    caja(n, "e1", 3, 1, "No procede: causal y fundamento; se informa el derecho", "end")
    caja(n, "j4", 4, 1, "Deriva al Área que trata los datos (ámbito)")
    caja(n, "x1", 4, 2, "El Área analiza y propone la respuesta", "ext")
    caja(n, "d2", 3, 2, "¿Conforme con el fundamento? (V°B°)", "dec")
    caja(n, "j5", 2, 2, "Devuelve con observaciones al Área")
    caja(n, "x2", 3, 3, "El Director firma la respuesta", "ext")
    caja(n, "j6", 2, 3, "Envía la respuesta y cierra: correo, carta o retiro")
    caja(n, "e2", 1, 3, "Caso cerrado", "end")
    caja(n, "s1", 1, 1, "Prórroga: una vez, hasta 30 días corridos", "side")
    caja(n, "s2", 1, 2, "Reclamo ante la Agencia: responde en 30 días corridos", "side")
    a = [("j1", "r", "j2", "l", "", False), ("j2", "r", "d1", "l", "", False), ("d1", "r", "j3", "l", "sí", False),
         ("d1", "b", "e1", "t", "no", False), ("j3", "b", "j4", "t", "", False), ("j4", "b", "x1", "t", "", False),
         ("x1", "l", "d2", "r", "", False), ("d2", "l", "j5", "r", "no", False), ("d2", "b", "x2", "t", "sí", False),
         ("x2", "l", "j6", "r", "", False), ("j6", "l", "e2", "r", "", False)]
    diagramas["juridica"] = dibujar("Flujo de la Unidad Jurídica", n, a,
                                     "Si faltan antecedentes, los pide antes de decidir. También asigna responsables, plazos internos y feriados.")

    # 3. Delegado de protección de datos (seguimiento nacional, sólo lectura)
    n = {}
    caja(n, "p1", 1, 0, "Revisa el panel de alertas por sede")
    caja(n, "d1", 2, 0, "¿Alguna sede con alertas?", "dec")
    caja(n, "p2", 3, 0, "Abre la sede y el caso (sólo lectura)")
    caja(n, "p3", 4, 0, "Avisa a la Unidad Jurídica de la sede")
    caja(n, "x1", 4, 1, "La Unidad Jurídica tramita el caso", "ext")
    caja(n, "p4", 2, 1, "Revisa reportes nacionales y bitácora")
    a = [("p1", "r", "d1", "l", "", False), ("d1", "r", "p2", "l", "sí", False), ("p2", "r", "p3", "l", "", False),
         ("p3", "b", "x1", "t", "", False), ("d1", "b", "p4", "t", "no", False)]
    diagramas["delegado"] = dibujar("Flujo del Delegado de protección de datos", n, a,
                                     "No tramita casos ni ve el RUN completo. Si se le avisará también por correo está por definir.")

    # 4. Área que trata los datos
    n = {}
    caja(n, "g1", 1, 0, "Recibe el caso derivado por la Unidad Jurídica", "ext")
    caja(n, "g2", 2, 0, "Localiza los datos del ámbito")
    caja(n, "g3", 3, 0, "¿Qué decide? Acoge, acoge en parte o rechaza", "dec")
    caja(n, "g4", 3, 1, "Redacta la propuesta con su fundamento")
    caja(n, "g5", 2, 1, "Envía la propuesta a revisión jurídica")
    caja(n, "g6", 1, 1, "Unidad Jurídica revisa (V°B°)", "ext")
    caja(n, "g7", 1, 2, "Si la devuelven: revisa de nuevo y corrige", "step")
    caja(n, "g8", 2, 2, "Pide prórroga a la Unidad Jurídica si falta plazo")
    a = [("g1", "r", "g2", "l", "", False), ("g2", "r", "g3", "l", "", False), ("g3", "b", "g4", "t", "decide", False),
         ("g4", "l", "g5", "r", "", False), ("g5", "l", "g6", "r", "", False), ("g6", "b", "g7", "t", "devuelto", True),
         ("g2", "b", "g8", "t", "si falta plazo", True)]
    diagramas["area"] = dibujar("Flujo del Área que trata los datos", n, a,
                                 "Sólo ve sus casos mientras están en la etapa de análisis de su sede, y no ve la bitácora.")

    # 5. Director o directora
    n = {}
    caja(n, "h1", 1, 0, "Recibe la respuesta conforme de la Unidad Jurídica", "ext")
    caja(n, "h2", 2, 0, "Revisa la respuesta y su fundamento")
    caja(n, "h3", 3, 0, "¿La firma?", "dec")
    caja(n, "h4", 3, 1, "Firma e indica el número del documento")
    caja(n, "h5", 2, 1, "Devuelve la respuesta firmada a la Unidad Jurídica", "ext")
    caja(n, "h6", 1, 1, "La Unidad Jurídica envía la respuesta y cierra", "ext")
    caja(n, "h7", 4, 0, "No firma: devuelve con observaciones a la Unidad Jurídica", "ext")
    a = [("h1", "r", "h2", "l", "", False), ("h2", "r", "h3", "l", "", False), ("h3", "b", "h4", "t", "sí", False),
         ("h4", "l", "h5", "r", "", False), ("h5", "l", "h6", "r", "", False), ("h3", "r", "h7", "l", "no", False)]
    diagramas["director"] = dibujar("Flujo del Director o directora", n, a,
                                     "No deriva ni registra solicitudes. Sólo ve los casos que le toca firmar, sin la bitácora.")

    for nombre, svg in diagramas.items():
        (SAL / f"flujo-{nombre}.svg").write_text(svg, encoding="utf-8")
    print("diagramas en", SAL, sorted(diagramas))


if __name__ == "__main__":
    generar()
