//======================================================
// CONTROL SYSTEM DESIGNER
// SCRIPT.JS
// PARTE 1 DE 6
//======================================================

//======================================================
// API
//======================================================

const API = "";

const modalBiblioteca =
    new bootstrap.Modal(
        document.getElementById("modalBiblioteca")
    );


//======================================================
// CARGAR REACCIONES DE LA BIBLIOTECA
//======================================================

async function cargarReacciones(){

    const response = await fetch(

        API + "/reacciones"

    );

    const datos = await response.json();

    //==========================
    // COMBO PRINCIPAL
    //==========================

    const reaccion =

        document.getElementById(

            "reaccion"

        );

    reaccion.innerHTML = "";

    //==========================
    // COMBO BIBLIOTECA
    //==========================

    const reaccionExistente =

        document.getElementById(

            "reaccionExistente"

        );

    reaccionExistente.innerHTML = "";

    datos.forEach(r=>{

        const op1 = document.createElement(

            "option"

        );

        op1.value = r.id;

        op1.textContent = r.nombre;

        reaccion.appendChild(op1);

        const op2 = op1.cloneNode(true);

        reaccionExistente.appendChild(op2);

    });

}

//======================================================
// VARIABLES GLOBALES
//======================================================

let respuesta = null;

let yminGlobal = null;
let ymaxGlobal = null;

// Tipo de gráfica actualmente visible

let graficaActual = "concentracion";

// Temperatura actualmente visible (0-10)

let temperaturaActual = 0;

//======================================================
// COMBO DE SALTOS
//======================================================

const salto = document.getElementById("salto");

for(let i=-10;i<=10;i++){

    if(i!==0){

        const op = document.createElement("option");

        op.value = i;

        op.text = i;

        if(i===1){

            op.selected = true;

        }

        salto.appendChild(op);

    }

}

//======================================================
// BIBLIOTECA
//======================================================

document.getElementById(

    "btnBiblioteca"

).onclick = async()=>{

    await cargarReacciones();

    modalBiblioteca.show();

};

window.onload = ()=>{

    cargarReacciones();

};

//======================================================
// CAMBIAR TIPO DE REGISTRO
//======================================================

const panelNuevaReaccion =

    document.getElementById(

        "panelNuevaReaccion"

    );

const panelReaccionExistente =

    document.getElementById(

        "panelReaccionExistente"

    );

document.getElementById(

    "nuevaReaccion"

).onchange = ()=>{

    panelNuevaReaccion.style.display = "block";

    panelReaccionExistente.style.display = "none";

};

document.getElementById(

    "agregarVariable"

).onchange = ()=>{

    console.log("Agregar Variable");

    panelNuevaReaccion.style.display = "none";

    panelReaccionExistente.style.display = "block";

    console.log(panelReaccionExistente);

};

//======================================================
// GUARDAR REACCIÓN
//======================================================

document.getElementById(

    "btnGuardarReaccion"

).onclick = async()=>{

    const formData = new FormData();

    //--------------------------------------
    // ¿Nueva reacción o agregar variable?
    //--------------------------------------

    if(

        document.getElementById(

            "nuevaReaccion"

        ).checked

    ){

        formData.append(

            "nombre",

            document.getElementById(

                "nombreReaccion"

            ).value

        );

        formData.append(

            "tiempo_salto",

            document.getElementById(

                "nuevoTiempo"

            ).value

        );

        formData.append(

            "m",

            document.getElementById(

                "nuevoM"

            ).value

        );

        formData.append(

            "variable",

            document.getElementById(

                "nuevaVariable"

            ).value

        );

    }else{

        formData.append(

            "nombre",

            document.getElementById(

                "reaccionExistente"

            ).value

        );

        formData.append(

            "variable",

            document.getElementById(

                "nuevaVariable"

            ).value

        );

        formData.append(

            "m",

             document.getElementById(

                 "nuevoMVariable"

             ).value

        );

    }

    //--------------------------------------
    // Archivos .dat
    //--------------------------------------

    const archivos =

        document.getElementById(

            "archivosDat"

        ).files;

    for(

        let i=0;

        i<archivos.length;

        i++

    ){

        formData.append(

            "archivos",

            archivos[i]

        );

    }

    //--------------------------------------
    // URL
    //--------------------------------------

    let url="";

    if(

        document.getElementById(

            "nuevaReaccion"

        ).checked

    ){

        url=API+"/reaccion";

    }else{

        url=API+"/reaccion/agregar-variable";

    }

    //--------------------------------------
    // Enviar
    //--------------------------------------

    const response = await fetch(

        url,

        {

            method:"POST",

            body:formData

        }

    );

    const datos =

        await response.json();

    if(datos.error){

        alert(datos.error);

        return;

    }

    alert(datos.mensaje);

    modalBiblioteca.hide();

    cargarReacciones();

};


//======================================================
// BOTÓN CALCULAR
//======================================================

document.getElementById("btnCalcular").onclick = async()=>{

    const reaccion = document.getElementById("reaccion").value;

    const variable = document.getElementById("variable").value;

    const salto = parseInt(
        document.getElementById("salto").value
    );

    
    const r = await fetch(

        API + "/calcular",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                reaccion,

                variable,

                salto

            })

        }

    );

    respuesta = await r.json();

    //==========================================
    // CALCULAR ESCALA GLOBAL DE TEMPERATURAS
    //==========================================

    yminGlobal = Infinity;

    ymaxGlobal = -Infinity;

    for(let j=0;j<11;j++){

        for(let i=0;i<respuesta.temperaturas.length;i++){

            yminGlobal = Math.min(

                yminGlobal,

                respuesta.temperaturas[i][j]

            );

            ymaxGlobal = Math.max(

                ymaxGlobal,

                respuesta.temperaturas[i][j]

            );

        }

    }

    //==========================================
    // GRÁFICA INICIAL
    //==========================================

    graficaActual = "concentracion";

    temperaturaActual = 0;

    graficarConcentracion();

    llenarTabla();

};

//======================================================
// PARTE 2 DE 6
// GRÁFICAS
//======================================================

function graficarConcentracion(){

    graficaActual = "concentracion";

    const layout = {

        title:"Concentración",

        xaxis:{
            title:"Tiempo"
        },

        yaxis:{
            title:"Concentración"
        }

    };

    Plotly.newPlot(

        "grafica",

        [{

            x:respuesta.tiempo,

            y:respuesta.concentracion,

            mode:"lines",

            name:"Concentración"

        }],

        layout,

        {

            responsive:true

        }

    );

}

function graficarTemperatura(pos){

    graficaActual = "temperatura";

    temperaturaActual = pos;

    let y = [];

    for(let i=0;i<respuesta.temperaturas.length;i++){

        y.push(

            respuesta.temperaturas[i][pos]

        );

    }

    //--------------------------------------------------
    // CONFIGURAR EJE Y
    //--------------------------------------------------

    const ejeY = {

        title:"Temperatura"

    };

    if(

        document.getElementById("mismaEscala").checked

    ){

        const margen =

            (ymaxGlobal-yminGlobal)*0.05;

        ejeY.range = [

            yminGlobal-margen,

            ymaxGlobal+margen

        ];

    }

    Plotly.newPlot(

        "grafica",

        [{

            x:respuesta.tiempo,

            y:y,

            mode:"lines",

            name:"Temperatura"

        }],

        {

            title:

                "Temperatura T"+(pos+1),

            xaxis:{

                title:"Tiempo"

            },

            yaxis:ejeY

        },

        {

            responsive:true

        }

    );

}

//======================================================
// BOTONES CONCENTRACIÓN / TEMPERATURA
//======================================================

const sliderContainer =

document.getElementById("sliderContainer");

document.getElementById(

    "btnConc"

).onclick = ()=>{

    sliderContainer.style.display="none";

    if(respuesta){

        graficarConcentracion();

    }

};

document.getElementById(

    "btnTemp"

).onclick = ()=>{

    sliderContainer.style.display="block";

    if(respuesta){

        temperaturaActual =

        document.getElementById("slider").value-1;

        graficarTemperatura(

            temperaturaActual

        );

    }

};

//======================================================
// SLIDER
//======================================================

document.getElementById(

    "slider"

).oninput = ()=>{

    if(respuesta){

        temperaturaActual =

        document.getElementById("slider").value-1;

        graficarTemperatura(

            temperaturaActual

        );

    }

};

//======================================================
// PARTE 3 DE 6
// TABLA Y DESCARGAS
//======================================================

function llenarTabla(){

    const cuerpo = document.querySelector("#tabla tbody");

    cuerpo.innerHTML = "";

    for(let i=0;i<11;i++){

        cuerpo.innerHTML += `

        <tr>

            <td>T${i+1}</td>

            <td>${respuesta.Kc[i].toFixed(4)}</td>

            <td>${respuesta.KPI[i].toFixed(4)}</td>

            <td>${respuesta.Tint[i].toFixed(4)}</td>

            <td>${respuesta.Reglas[i]}</td>

        </tr>

        `;

    }

}

//======================================================
// DESCARGAR EXCEL
//======================================================

document.getElementById("btnDescargar").onclick = async()=>{

    const reaccion = document.getElementById("reaccion").value;

    const variable = document.getElementById("variable").value;

    const salto = parseInt(document.getElementById("salto").value);

    const response = await fetch(

        API + "/descargar_excel",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                reaccion,

                variable,

                salto

            })

        }

    );

    if(!response.ok){

        alert("Error al generar el archivo.");

        return;

    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download =

        reaccion + "_" +

        variable + "_" +

        salto + ".xlsx";

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

};

//======================================================
// DESCARGAR GRÁFICA
//======================================================

document.getElementById("btnGrafica").onclick = ()=>{

    Plotly.downloadImage(

        "grafica",

        {

            format:"png",

            filename:"Process_Response",

            width:1600,

            height:1000,

            scale:3

        }

    );

};

//======================================================
// PARTE 4 DE 6
// REPORTE PDF
//======================================================

//======================================================
// GENERAR TODAS LAS GRÁFICAS
//======================================================

async function generarGraficasReporte(){

    const graficas = {};

    //-----------------------------
    // Concentración
    //-----------------------------

    graficarConcentracion();

    await new Promise(resolve=>setTimeout(resolve,300));

    graficas["Concentracion"] = await Plotly.toImage(

        "grafica",

        {

            format:"png",

            width:1600,

            height:1000,

            scale:3

        }

    );

    //-----------------------------
    // Temperaturas
    //-----------------------------

    for(let i=0;i<11;i++){

        graficarTemperatura(i);

        await new Promise(resolve=>setTimeout(resolve,300));

        graficas["T"+(i+1)] =

        await Plotly.toImage(

            "grafica",

            {

                format:"png",

                width:1600,

                height:1000,

                scale:3

            }

        );

    }

    //-----------------------------
    // Regresar a la gráfica
    // que estaba viendo el usuario
    //-----------------------------

    if(graficaActual==="concentracion"){

        graficarConcentracion();

    }else{

        graficarTemperatura(

            temperaturaActual

        );

    }

    return graficas;

}

//======================================================
// DESCARGAR INFORME
//======================================================

document.getElementById(

    "btnInforme"

).onclick = async()=>{

    const reaccion =

        document.getElementById(

            "reaccion"

        ).value;

    const variable =

        document.getElementById(

            "variable"

        ).value;

    const salto = parseInt(

        document.getElementById(

            "salto"

        ).value

    );

    

    //--------------------------------
    // Capturar todas las gráficas
    //--------------------------------

    const graficas =

        await generarGraficasReporte();

    //--------------------------------
    // Enviar al servidor
    //--------------------------------

    const response = await fetch(

        API+"/descargar_informe",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                reaccion,

                variable,

                salto,

                graficas

            })

        }

    );

    if(!response.ok){

        alert(

            "Error al generar el reporte."

        );

        return;

    }

    const blob =

        await response.blob();

    const url =

        window.URL.createObjectURL(blob);

    const a =

        document.createElement("a");

    a.href = url;

    a.download =

        "Reporte_Controlador.pdf";

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

};

//======================================================
// PARTE 5 DE 6
// CONFIGURACIÓN DE LA GRÁFICA
//======================================================

//------------------------------------------------------
// MOSTRAR / OCULTAR PANEL
//------------------------------------------------------

document.getElementById("btnConfigGrafica").onclick = ()=>{

    const panel = document.getElementById("panelGrafica");

    if(panel.style.display==="none"){

        panel.style.display="block";

    }else{

        panel.style.display="none";

    }

};

//------------------------------------------------------
// HABILITAR / DESHABILITAR CAMPOS
//------------------------------------------------------

document.getElementById("editarX").onchange=()=>{

    const activo=document.getElementById("editarX").checked;

    document.getElementById("xmin").disabled=!activo;

    document.getElementById("xmax").disabled=!activo;

};

document.getElementById("editarY").onchange=()=>{

    const activo=document.getElementById("editarY").checked;

    document.getElementById("ymin").disabled=!activo;

    document.getElementById("ymax").disabled=!activo;

};

//------------------------------------------------------
// APLICAR CAMBIOS
//------------------------------------------------------

document.getElementById("btnAplicar").onclick=()=>{

    const editarX=document.getElementById("editarX").checked;

    const editarY=document.getElementById("editarY").checked;

    const mismaEscala=document.getElementById("mismaEscala").checked;

    const layout={};

    //----------------------------------
    // EJE X
    //----------------------------------

    if(editarX){

        layout["xaxis.range"]=[

            parseFloat(document.getElementById("xmin").value),

            parseFloat(document.getElementById("xmax").value)

        ];

    }else{

        layout["xaxis.autorange"]=true;

    }


    let xmin = null;
let xmax = null;

if(editarX){

    xmin = parseFloat(document.getElementById("xmin").value);

    xmax = parseFloat(document.getElementById("xmax").value);

}

    //----------------------------------
    // EJE Y
    //----------------------------------

    if(editarY){

        layout["yaxis.range"]=[

            parseFloat(document.getElementById("ymin").value),

            parseFloat(document.getElementById("ymax").value)

        ];

    }else{

        //----------------------------------
        // Si es temperatura y quiere
        // misma escala
        //----------------------------------

        if(

            graficaActual==="temperatura"

            &&

            mismaEscala

        ){

            const margen=(

                ymaxGlobal-yminGlobal

            )*0.05;

            layout["yaxis.range"]=[

                yminGlobal-margen,

                ymaxGlobal+margen

            ];

        }else{

            layout["yaxis.autorange"]=true;

        }

    }

    Plotly.relayout(

        "grafica",

        layout

    );

};

//------------------------------------------------------
// RESTABLECER
//------------------------------------------------------

document.getElementById("btnReset").onclick=()=>{

    document.getElementById("editarX").checked=true;

    document.getElementById("editarY").checked=false;

    document.getElementById("mismaEscala").checked=false;

    document.getElementById("xmin").disabled=false;

    document.getElementById("xmax").disabled=false;

    document.getElementById("ymin").disabled=true;

    document.getElementById("ymax").disabled=true;

    Plotly.relayout(

        "grafica",

        {

            "xaxis.autorange":true,

            "yaxis.autorange":true

        }

    );

};

//======================================================
// PARTE 6 DE 6
// FUNCIONES AUXILIARES
//======================================================

//------------------------------------------------------
// REDIBUJAR LA GRÁFICA ACTUAL
//------------------------------------------------------

function actualizarGraficaActual(){

    if(!respuesta){

        return;

    }

    if(graficaActual==="concentracion"){

        graficarConcentracion();

    }

    else{

        graficarTemperatura(

            temperaturaActual

        );

    }

}

//------------------------------------------------------
// APLICAR LÍMITES
//------------------------------------------------------

function aplicarLimites(){

    const editarX=document.getElementById("editarX").checked;
    const editarY=document.getElementById("editarY").checked;
    const layout={};

    const txtXmin=document.getElementById("xmin").value.trim();
    const txtXmax=document.getElementById("xmax").value.trim();

    const xmin=(editarX && txtXmin!=="") ? parseFloat(txtXmin) : respuesta.tiempo[0];
    const xmax=(editarX && txtXmax!=="") ? parseFloat(txtXmax) : respuesta.tiempo[respuesta.tiempo.length-1];

    layout["xaxis.range"]=[xmin,xmax];

    let datosY=(graficaActual==="concentracion")
        ? respuesta.concentracion
        : respuesta.temperaturas.map(f=>f[temperaturaActual]);

    if(editarY){

        layout["yaxis.range"]=[
            parseFloat(document.getElementById("ymin").value),
            parseFloat(document.getElementById("ymax").value)
        ];

    }else{

        let ymin=Infinity;
        let ymax=-Infinity;

        for(let i=0;i<respuesta.tiempo.length;i++){

            if(respuesta.tiempo[i]>=xmin && respuesta.tiempo[i]<=xmax){

                ymin=Math.min(ymin,datosY[i]);
                ymax=Math.max(ymax,datosY[i]);

            }

        }

        if(ymin===Infinity){
            ymin=Math.min(...datosY);
            ymax=Math.max(...datosY);
        }

        let margen=(ymax-ymin)*0.05;
        if(margen===0) margen=1;

        layout["yaxis.range"]=[
            ymin-margen,
            ymax+margen
        ];

    }

    Plotly.relayout("grafica",layout);

}


    
//------------------------------------------------------
// BOTÓN APLICAR
//------------------------------------------------------

document.getElementById(

    "btnAplicar"

).onclick = ()=>{

    //------------------------------------------
    // PRIMERO REDIBUJAR
    //------------------------------------------

    actualizarGraficaActual();

    //------------------------------------------
    // DESPUÉS APLICAR LOS EJES
    //------------------------------------------

    aplicarLimites();

};

//------------------------------------------------------
// CHECKBOX
// MISMA ESCALA
//------------------------------------------------------

document.getElementById(

    "mismaEscala"

).onchange=()=>{

    if(

        graficaActual==="temperatura"

        &&

        respuesta

    ){

        graficarTemperatura(

            temperaturaActual

        );

    }

};