document.getElementById('consulta-form').addEventListener("submit", function(e){
    e.preventDefault();

    const tipo = document.getElementById("tipoDocumento").value;
    let numero = document.getElementById("numeroDocumento").value.trim();

    //validar el numero de documento segun el tipo ingresado
    if(tipo === "ruc" && !/^\d{11}$/.test(numero)){
        alert("El número de RUC debe tener 11 dígitos.");
        return;
    }
    if(tipo === "dni" && !/^\d{8}$/.test(numero)){
        alert("El número de DNI debe tener 8 dígitos.");
        return;
    }

    // Asegurar que el DNI tenga 8 dígitos con ceros a la izquierda si es necesario
    if(tipo === "dni"){
        numero = numero.padStart(8, '0');
    }

// Usar diferentes APIs según el tipo de documento
let apiUrl = "";

if(tipo === "ruc"){
    // Para RUC: APISPeru (funciona bien con RUC)
    const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImRleHRyZTE0ODFAZ21haWwuY29tIn0.CNlAXjuwdzDfG6NrsuLGKUrJBh1KASQKUcRxYqwSNc0";
    apiUrl = `https://dniruc.apisperu.com/api/v1/ruc/${numero}?token=${TOKEN}`;
} else if(tipo === "dni"){
    // Para DNI: API alternativa gratuita (sin token)
    apiUrl = `https://api.apis.net.pe/v1/dni?numero=${numero}`;
}

// Usar proxy CORS
const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
console.log("Consultando API:", apiUrl);

fetch(proxyUrl).then(response => response.json())
    .then(data => {
        // Ver qué estructura tiene la respuesta
        console.log("Respuesta de la API:", data);
        
        // Verificar si la consulta fue exitosa (diferentes APIs tienen diferentes estructuras)
        const isSuccess = (data && data.success === true) || (data && !data.error && !data.message);
        
        if(isSuccess){
            alert("Datos obtenidos con éxito");
            
            if(tipo === "ruc"){
                document.getElementById("rucResultado").classList.remove("hidden");
                document.getElementById("dniResultado").classList.add("hidden");
                
                document.getElementById("razonSocial").value = data.razonSocial || "";
                document.getElementById("direccion").value = data.direccion || "";
                document.getElementById("departamento").value = data.departamento || "";
                document.getElementById("provincia").value = data.provincia || "";
                document.getElementById("distrito").value = data.distrito || "";
                
                // Dividir ubigeo correctamente
                if(data.ubigeo){
                    if(Array.isArray(data.ubigeo)){
                        // Si es array, usar directamente
                        document.getElementById("idDepartamento").value = data.ubigeo[0] || "";
                        document.getElementById("idProvincia").value = data.ubigeo[1] || "";
                        document.getElementById("idDistrito").value = data.ubigeo[2] || "";
                    } else {
                        // Si es string, dividir en pares de dígitos (DDPPDD)
                        const ubigeoStr = data.ubigeo.toString();
                        document.getElementById("idDepartamento").value = ubigeoStr.substring(0, 2);
                        document.getElementById("idProvincia").value = ubigeoStr.substring(2, 4);
                        document.getElementById("idDistrito").value = ubigeoStr.substring(4, 6);
                    }
                    document.getElementById("ubigeoRuc").value = data.ubigeo;
                }
            } else if(tipo === "dni"){
                document.getElementById("dniResultado").classList.remove("hidden");
                document.getElementById("rucResultado").classList.add("hidden");

                // Manejar diferentes estructuras de respuesta
                document.getElementById("nombres").value = data.nombres || data.nombre || "";
                document.getElementById("apellidoPaterno").value = data.apellidoPaterno || data.apellido_paterno || "";
                document.getElementById("apellidoMaterno").value = data.apellidoMaterno || data.apellido_materno || "";
            }
        } else {
            // Mostrar el mensaje de error específico de la API
            alert(data.message || data.error || "No se encontraron datos para el documento ingresado");
            return;
        }
    }).catch(error => {
        console.error("Error al obtener los datos:", error);
        alert("Ocurrió un error al obtener los datos. Por favor, inténtelo de nuevo más tarde.");
    });
});
