import json
import shutil

from .config import DATA_PATH


# ==========================================
# LISTAR REACCIONES
# ==========================================

def listar_reacciones():

    reacciones = []

    if not DATA_PATH.exists():

        return []

    for carpeta in DATA_PATH.iterdir():

        if carpeta.is_dir():

            metadata = carpeta / "metadata.json"

            if metadata.exists():

                with open(

                    metadata,

                    "r",

                    encoding="utf-8"

                ) as f:

                    datos = json.load(f)

                reacciones.append({

                    "id": carpeta.name,

                    "nombre": datos["nombre"]

                })

    reacciones.sort(

        key=lambda x: x["nombre"]

    )

    return reacciones


# ==========================================
# OBTENER REACCIÓN
# ==========================================

def obtener_reaccion(nombre):

    carpeta = DATA_PATH / nombre

    if not carpeta.exists():

        return {

            "error": "La reacción no existe"

        }

    metadata = carpeta / "metadata.json"

    if not metadata.exists():

        return {

            "error": "No existe metadata.json"

        }

    with open(

        metadata,

        "r",

        encoding="utf-8"

    ) as f:

        datos = json.load(f)

    variables = []

    for carpeta_variable in carpeta.iterdir():

        if (

            carpeta_variable.is_dir()

            and
            carpeta_variable.name != "__pycache__"

        ):

            variables.append(

                carpeta_variable.name

            )

    datos["variables"] = sorted(

        variables

    )

    return datos


# ==========================================
# CREAR REACCIÓN
# ==========================================

async def crear_reaccion(

    nombre,
    tiempo_salto,
    m,
    variable,
    archivos

):

    carpeta = DATA_PATH / nombre

    if carpeta.exists():

        return {

            "error": "La reacción ya existe"

        }

    carpeta.mkdir(

        parents=True,

        exist_ok=False

    )

    datos = {

    "nombre": nombre,

    "tiempo_salto": tiempo_salto,

    "variables": {

        variable: {

            "m": m

        }

    }

}

    with open(

        carpeta / "metadata.json",

        "w",

        encoding="utf-8"

    ) as f:

        json.dump(

            datos,

            f,

            indent=4,

            ensure_ascii=False

        )

    carpeta_variable = carpeta / variable

    carpeta_variable.mkdir()

    await guardar_archivos(

        carpeta_variable,

        archivos

    )

    return {

        "mensaje": "Reacción creada correctamente"

    }


# ==========================================
# AGREGAR VARIABLE
# ==========================================

async def agregar_variable(

    nombre,
    variable,
    m,
    archivos

):

    carpeta = DATA_PATH / nombre

    if not carpeta.exists():

        return {

            "error": "La reacción no existe"

        }

    carpeta_variable = carpeta / variable

    # Si la variable no existe, crearla y guardarla en metadata
    if not carpeta_variable.exists():

        carpeta_variable.mkdir()

        metadata = carpeta / "metadata.json"

        with open(

            metadata,

            "r",

            encoding="utf-8"

        ) as f:

            datos = json.load(f)

        datos["variables"][variable] = {

            "m": m

        }

        with open(

            metadata,

            "w",

            encoding="utf-8"

        ) as f:

            json.dump(

                datos,

                f,

                indent=4,

                ensure_ascii=False

            )

    # Siempre guardar los archivos (aunque la variable ya exista)
    await guardar_archivos(

        carpeta_variable,

        archivos

    )

    return {

        "mensaje": "Archivos agregados correctamente"

    }
   


# ==========================================
# GUARDAR ARCHIVOS
# ==========================================

async def guardar_archivos(

    carpeta_variable,
    archivos

):

    for archivo in archivos:

        destino = carpeta_variable / archivo.filename

        with open(

            destino,

            "wb"

        ) as buffer:

            shutil.copyfileobj(

                archivo.file,

                buffer

            )

    return


# ==========================================
# ELIMINAR REACCIÓN
# ==========================================

def eliminar_reaccion(

    nombre

):

    carpeta = DATA_PATH / nombre

    if not carpeta.exists():

        return {

            "error": "La reacción no existe"

        }

    shutil.rmtree(

        carpeta

    )

    return {

        "mensaje": "Reacción eliminada correctamente"

    }
