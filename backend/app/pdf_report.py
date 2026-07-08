from io import BytesIO
from datetime import datetime
import base64

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image
)

def convertir_imagen(base64_string):

    if base64_string is None:

        return None

    if "," in base64_string:

        base64_string = base64_string.split(",")[1]

    imagen_bytes = base64.b64decode(base64_string)

    imagen = BytesIO(imagen_bytes)

    return Image(

        imagen,

        width=17*cm,

        height=10*cm

    )

def crear_pdf(
    datos,
    metadata,
    Kc,
    KPI,
    Tint,
    reglas
):

    # ==========================================
    # NOMBRE COMPLETO DE LA REACCIÓN
    # ==========================================

    if datos["reaccion"] == "R1":

        nombre_reaccion = (
            "Ethylene Oxidation to Ethylene Oxide"
        )

    else:

        nombre_reaccion = (
            "Butane Oxidation to Maleic Anhydride"
        )

    # ==========================================
    # CREAR PDF
    # ==========================================

    buffer = BytesIO()

    doc = SimpleDocTemplate(

        buffer,

        rightMargin=1.8 * cm,
        leftMargin=1.8 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm

    )

    estilos = getSampleStyleSheet()

    elementos = []

    # ==========================================
    # TÍTULO
    # ==========================================

    elementos.append(

        Paragraph(

            "<font size='22'><b>CONTROL SYSTEM DESIGNER</b></font>",

            estilos["Title"]

        )

    )

    elementos.append(

        Paragraph(

            "<font size='14'>Tubular Reactor Control Platform</font>",

            estilos["Heading2"]

        )

    )

    elementos.append(

        Spacer(1,0.6*cm)

    )

    # ==========================================
    # SIMULATION INFORMATION
    # ==========================================

    elementos.append(

        Paragraph(

            "<b>Simulation Information</b>",

            estilos["Heading2"]

        )

    )

    elementos.append(

        Spacer(1,0.3*cm)

    )

    elementos.append(

        Paragraph(

            f"<b>Reaction:</b> {nombre_reaccion}",

            estilos["BodyText"]

        )

    )

    elementos.append(

        Paragraph(

            f"<b>Variable:</b> {datos['variable']}",

            estilos["BodyText"]

        )

    )

    elementos.append(

        Paragraph(

            f"<b>Step:</b> {datos['salto']} %",

            estilos["BodyText"]

        )

    )

    elementos.append(

        Paragraph(

            f"<b>Step Time:</b> {metadata['tiempo_salto']} s",

            estilos["BodyText"]

        )

    )

    elementos.append(

        Paragraph(

            f"<b>m:</b> {metadata['variables'][datos['variable']]['m']}",

            estilos["BodyText"]

        )

    )

    elementos.append(

        Paragraph(

            f"<b>Date:</b> {datetime.now().strftime('%d/%m/%Y %H:%M')}",

            estilos["BodyText"]

        )

    )

    elementos.append(

        Spacer(1,0.6*cm)

    )

    # ==========================================
    # CONTROLLER DESIGN
    # ==========================================

    elementos.append(

        Paragraph(

            "<b>Controller Design</b>",

            estilos["Heading2"]

        )

    )

    elementos.append(

        Spacer(1,0.3*cm)

    )
    tabla = [

        [

            "Temperature",

            "Kc",

            "KPI",

            "Tint",

            "Rule"

        ]

    ]

    for i in range(11):

        tabla.append(

            [

                f"T{i+1}",

                f"{Kc[i]:.4f}",

                f"{KPI[i]:.4f}",

                f"{Tint[i]:.4f}",

                str(reglas[i])

            ]

        )

    tabla_pdf = Table(

        tabla,

        colWidths=[3*cm,3*cm,3*cm,3*cm,3*cm]

    )

    tabla_pdf.setStyle(

        TableStyle([

            ("BACKGROUND",(0,0),(-1,0),colors.HexColor("#1E5AA8")),

            ("TEXTCOLOR",(0,0),(-1,0),colors.white),

            ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),

            ("FONTSIZE",(0,0),(-1,0),11),

            ("ALIGN",(0,0),(-1,-1),"CENTER"),

            ("GRID",(0,0),(-1,-1),0.5,colors.black),

            ("BOTTOMPADDING",(0,0),(-1,0),8),

            ("BACKGROUND",(0,1),(-1,-1),colors.whitesmoke),

            ("FONTNAME",(0,1),(-1,-1),"Helvetica"),

            ("FONTSIZE",(0,1),(-1,-1),10)

        ])

    )

    elementos.append(

        tabla_pdf

    )

    elementos.append(

        Spacer(1,0.8*cm)

    )

    # ==========================================
    # PROCESS RESPONSE
    # ==========================================

    elementos.append(

        Paragraph(

            "<b>Process Response</b>",

            estilos["Heading2"]

        )

    )

    elementos.append(

        Spacer(1,0.3*cm)

    )

        # ==========================================
    # INSERTAR TODAS LAS GRÁFICAS
    # ==========================================

    if "graficas" in datos:

        for nombre, grafica in datos["graficas"].items():

            elementos.append(

                Paragraph(

                    f"<b>{nombre}</b>",

                    estilos["Heading3"]

                )

            )

            elementos.append(

                Spacer(1,0.2*cm)

            )

            imagen = convertir_imagen(grafica)

            if imagen:

                elementos.append(

                    imagen

                )

            elementos.append(

                Spacer(1,0.5*cm)

            )
    

    # ==========================================
    # FOOTER
    # ==========================================

    elementos.append(

        Paragraph(

            "<font size='10'><b>Control System Designer</b></font>",

            estilos["Heading3"]

        )

    )

    elementos.append(

        Paragraph(

            "<font size='9'>Automatically generated technical report.</font>",

            estilos["BodyText"]

        )

    )

    elementos.append(

        Paragraph(

            "<font size='9'>Version 2.0</font>",

            estilos["BodyText"]

        )

    )

    doc.build(

        elementos

    )

    buffer.seek(

        0

    )

    return buffer
