import json
import numpy as np

from pathlib import Path

from .config import DATA_PATH


def cargar_datos(

    reaccion,
    variable,
    salto

):

    carpeta = Path(DATA_PATH) / reaccion

    archivo = f"salto_{salto}.dat"

    ruta = carpeta / variable / archivo

    if not ruta.exists():

        raise FileNotFoundError(str(ruta))

    datos = np.loadtxt(ruta)

    with open(

        carpeta / "metadata.json",

        "r",

        encoding="utf-8"

    ) as f:

        metadata = json.load(f)

    return (

        datos,

        metadata,

        str(ruta)

    )
    return datos, str(ruta)
