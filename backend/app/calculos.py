import numpy as np

from .interpolacion import interp_matlab


def calcular_parametros(data, tiempo_salto, m, porcentaje_salto):
    """
    Calcula los parámetros del controlador a partir de los datos del proceso.

    Parámetros
    ----------
    data : numpy.ndarray
        Matriz con columnas:
        tiempo | concentración | T1 | T2 | ... | T11
    tiempo_salto : float
        Instante en que ocurre el escalón.
    m : float
        Valor base de la variable manipulada.
    porcentaje_salto : float
        Magnitud del escalón (%).

    Retorna
    -------
    Kc, KPI, T_Int, reglas
    """

    tiempo = data[:, 0]

    idx = np.where(tiempo >= tiempo_salto)[0]
    if len(idx) == 0:
        raise ValueError("El tiempo de salto es mayor que el tiempo final del archivo.")

    idx_inicio = idx[0]

    LI = data[idx_inicio, 1:]
    LS = data[-1, 1:]

    delta_m = m * (porcentaje_salto / 100.0)

    if delta_m == 0:
        raise ValueError("El porcentaje de salto no puede ser cero.")

    delta_Cs = LS - LI
    K = delta_Cs / delta_m

    tiempos = data[idx_inicio:, 0]
    conc = data[idx_inicio:, 1]

    valor_1 = 0.283 * delta_Cs + LI
    valor_2 = 0.632 * delta_Cs + LI

    def calc_t(y, v1, v2):
        crece = y[-1] > y[0]

        if crece:
            i1 = np.where(y >= v1)[0][0]
            i2 = np.where(y >= v2)[0][0]
        else:
            i1 = np.where(y <= v1)[0][0]
            i2 = np.where(y <= v2)[0][0]

        if i1 > 0:
            t1 = (
                interp_matlab(
                    y[i1 - 1:i1 + 1],
                    tiempos[i1 - 1:i1 + 1],
                    v1,
                )
                - tiempo_salto
            )
        else:
            t1 = tiempos[i1] - tiempo_salto

        if i2 > 0:
            t2 = (
                interp_matlab(
                    y[i2 - 1:i2 + 1],
                    tiempos[i2 - 1:i2 + 1],
                    v2,
                )
                - tiempo_salto
            )
        else:
            t2 = tiempos[i2] - tiempo_salto

        return t1, t2

    t1_c, t2_c = calc_t(conc, valor_1[0], valor_2[0])

    t1_T = []
    t2_T = []

    for j in range(1, 12):
        temp = data[idx_inicio:, j + 1]
        t1, t2 = calc_t(temp, valor_1[j], valor_2[j])
        t1_T.append(t1)
        t2_T.append(t2)

    t1_T = np.array(t1_T)
    t2_T = np.array(t2_T)

    Tao_c = 1.5 * (t2_c - t1_c)
    Teta_c = abs(t2_c - Tao_c)

    Tao_T = 1.5 * (t2_T - t1_T)
    Teta_T = abs(t2_T - Tao_T)

    Kc = (1.0 / K[1:]) * (Tao_T / (2.0 * Teta_T))
    KI = K[0] / K[1:]

    Teta_kc = abs(Teta_c - Teta_T)

    Tao_kc = np.zeros(11)
    reglas = []

    for j in range(11):

        if Tao_T[j] > Tao_c > Teta_kc[j]:
            Tao_kc[j] = Tao_T[j] / Tao_c
            reglas.append("T1")

        elif Tao_T[j] > Teta_kc[j] > Tao_c:
            Tao_kc[j] = Tao_T[j] / Teta_kc[j]
            reglas.append("T1a")

        elif Teta_kc[j] > Tao_T[j] > Tao_c:
            Tao_kc[j] = 1
            reglas.append("T1b")

        elif Tao_c > Tao_T[j] > 5 * Teta_kc[j]:
            Tao_kc[j] = Tao_T[j] / Tao_c
            reglas.append("T2")

        elif min(Tao_c, 5 * Teta_kc[j]) >= Tao_T[j]:
            Tao_kc[j] = Tao_c - Tao_T[j]
            reglas.append("T3")

        else:
            Tao_kc[j] = np.nan
            reglas.append("No aplica")

    KPI = (1.0 / KI) * (Tao_kc / (2.0 * Teta_kc))
    T_Int = np.minimum(Tao_kc, 8.0 * Teta_kc)

    return (
        Kc.tolist(),
        KPI.tolist(),
        T_Int.tolist(),
        reglas,
    )
