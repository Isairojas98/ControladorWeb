from pydantic import BaseModel


class DatosEntrada(BaseModel):

    reaccion: str

    variable: str

    salto: int


class Resultado(BaseModel):

    archivo: str

    tiempo: list

    concentracion: list

    temperaturas: list

    Kc: list

    KPI: list

    Tint: list

    Reglas: list
    
