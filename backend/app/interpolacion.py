def interp_matlab(x, y, v):

    x1, x2 = x[0], x[1]

    y1, y2 = y[0], y[1]

    if x1 > x2:

        x1, x2 = x2, x1

        y1, y2 = y2, y1

    return y1 + (v - x1) * (y2 - y1) / (x2 - x1)
