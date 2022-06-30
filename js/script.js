'use-strict'

var datos;
var url = 'https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/50913';
var origen = "ine.es";

//Obtenemos la fecha Actual y 
fechaActual = new Date();
mes = fechaActual.getUTCMonth();
var arrayMeses = calcularMeses(mes - 1);

//Funcion que recibe el numero de mes y devuelve un array con el nombre de los ultimos 12meses
function calcularMeses(mes) {
    arrayMes = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    arrayMeses = new Array();
    for (i = mes + 1; i <= 11; i++) {

        arrayMeses.push(arrayMes[i]);
    }
    for (i = 0; i <= mes; i++) {

        arrayMeses.push(arrayMes[i]);
    }
    return arrayMeses;
}

function pedirDatos(url) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: url,
            origin: origen,
            success: function(data) {

                //resuelve la promesa y va al then() de la funcion
                resolve(data)
            },
            error: function(error) {
                //rechaza la promesa y va al catch() de la funcion
                reject(error)
            }
        })

    })

}


pedirDatos(url)
    .then(function(data) {
        //cuando resuelve la promesa ejecuta este codigo
        datos = data;
        console.log(datos);
        mostrarResumen(datos);
        inicio = 836;
        for (let i = 1; i <= 12; i++) {
            crearFilaDato(inicio, inicio + 3, datos);
            inicio = inicio + 4;
        }

    })
    .catch(function(err) {
        //cuando la promesa se rechaza ejecuta este código.
        console.log(err);
    })

function mostrarResumen(datos) {
    console.log("Datos generales");
    for (let i = 832; i <= 835; i++) {
        crearFilaResumen(datos[i].Data["0"].Valor, "general");
    }
    datoGeneral = datoAnual(832, datos);
    tablaResumen = document.getElementById('general');
    tablaResumen.addEventListener('click', function() {
            crearGrafica(datoGeneral, "Indice General");
        }

    );
    crearGrafica(datoGeneral, "Indice General");


}

function crearFilaResumen(dato, fila) {
    var fila = $('#' + fila);
    var columna = document.createElement("td");
    var textoNodo = document.createTextNode(dato);
    columna.append(textoNodo);
    fila.append(columna);
}


function crearFilaDato(inicio, fin, datos) {
    var tabla = $('#tablaDatos');
    //Crear primera columna, seleccion de texto
    var fila = document.createElement("tr");

    columnaPrincipal = document.createElement("td");
    nombreGrupo = obtenerNombreGrupo(datos[inicio].Nombre);
    var texto = document.createTextNode(nombreGrupo);
    columnaPrincipal.append(texto);

    fila.append(columnaPrincipal);
    for (let i = inicio; i <= fin; i++) {

        var columna = document.createElement("td");
        columna.addEventListener('click', function() {
            console.log(i);
            encabezado = editarEncabezado(datos[i].Nombre);
            console.log(encabezado);
            datosAnos = datoAnual(i, datos);
            //console.log(datosAnos);
            crearGrafica(datosAnos, encabezado);
        });


        var texto = document.createTextNode(datos[i].Data["0"].Valor);
        columna.append(texto);
        fila.append(columna)
    }
    tabla.append(fila);
}

function editarEncabezado(encabezado) {
    pos1 = encabezado.indexOf(".");
    return encabezado.substring(pos1 + 1);
}



function obtenerNombreGrupo(nombre) {
    console.log(nombre);
    pos1 = nombre.indexOf(".");
    subNombre = nombre.substring(pos1 + 1);
    pos2 = subNombre.indexOf(".");
    subNombreFinal = subNombre.substring(0, pos2);
    return subNombreFinal;
}

function datoAnual(i, datos) {
    arrayDatos = new Array();

    for (let j = 0; j <= 11; j++) {
        arrayDatos.push(datos[i].Data[j].Valor);
    }
    return arrayDatos;
}

function crearDatosTipo(inicio, fin) {
    crearFilaDato(inicio, fin, datos);
}




// Funcion que crea la grafica
function crearGrafica(datosAnos, encabezado) {
    //Seccionamos el contenedor del canvas
    contenedor = $('#contenedorGrafica');
    //Eliminamos el canvas
    $('#grafica').remove();
    //Añadimos el nuevo canvas
    contenedor.append('<canvas id="grafica"></canvas>');
    datosGrafica = new Array();

    var valorMaximo = datosAnos[11];
    var mes = 11;
    for (i = 11; i >= 0; i--) {
        datosGrafica.push(datosAnos[i]);
        if (valorMaximo < datosAnos[i]) {
            valorMaximo = datosAnos[i];
            mes = i;
        }

    }

    mensajeValorMaximo(valorMaximo);

    // Obtener una referencia al elemento canvas del DOM
    const $grafica = document.querySelector("#grafica").getContext('2d');

    // Podemos tener varios conjuntos de datos. Comencemos con uno
    const datosGraficaIPC = {
        label: encabezado,
        data: datosGrafica, // La data es un arreglo que debe tener la misma cantidad de valores que la cantidad de etiquetas
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Color de fondo
        borderColor: 'rgba(54, 162, 235, 1)', // Color del borde
        borderWidth: 1, // Ancho del borde
    };
    new Chart($grafica, {
        type: 'line', // Tipo de gráfica
        data: {
            labels: arrayMeses,
            datasets: [
                datosGraficaIPC,

            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
            },
        }
    });

}

function mensajeValorMaximo(valorMaximo) {


    mensaje = document.getElementById('mensajeMaximo');
    mensaje.innerHTML = "";
    var texto = document.createTextNode("El valor máximo en los ultimos 12 meses es: " + valorMaximo);
    mensaje.append(texto);

}