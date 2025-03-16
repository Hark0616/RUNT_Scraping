document.getElementById("extraerDatos").addEventListener("click", async () => {
    console.log("Botón clickeado");
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Define la función extraerDatos
    function extraerDatos() {
        console.log("Script extraerDatos ejecutado");
        
        function getLabelValue(texto) {
            let labels = document.querySelectorAll("label");
        
            // Normalizar el texto buscado (eliminar acentos y convertir a minúsculas)
            let textoNormalizado = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
            for (let label of labels) {
                // Normalizar el texto de la etiqueta
                let labelText = label.textContent.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
                if (labelText.includes(textoNormalizado)) {
                    console.log("✅ Label encontrado:", label.textContent.trim());
        
                    // Buscar la fila completa donde está el label
                    let row = label.closest(".row");
                    if (row) {
                        // Buscar todos los elementos con la clase show-grande dentro de la fila
                        let valores = row.querySelectorAll(".show-grande");
                        
                        // Identificar la posición del label dentro de la fila
                        let columnas = Array.from(row.children);
                        let labelIndex = columnas.indexOf(label.closest("div")); // Encuentra en qué columna está el label
                        
                        // El valor correcto debería estar en la siguiente columna
                        let valorDiv = labelIndex !== -1 && labelIndex + 1 < columnas.length ? columnas[labelIndex + 1] : null;
        
                        // Si encontramos un div válido, extraemos el texto
                        if (valorDiv && valorDiv.classList.contains("show-grande")) {
                            let valor = valorDiv.textContent.trim();
                            console.log(`🔍 Valor extraído para "${texto}": ${valor}`);
                            return valor;
                        }
                    }
        
                    console.log(`❌ No se encontró un valor visible para "${texto}"`);
                }
            }
        
            return "N/A"; // Si no encuentra el dato
        }       

        // Extraer todos los datos relevantes con las etiquetas exactas que aparecen en la página
        let datos = [];
        
        // Campos principales - usando las etiquetas exactas del HTML
        let placa = getLabelValue("PLACA DEL VEHÍCULO");
        let licencia = getLabelValue("Nro. de licencia de tránsito");
        let estado = getLabelValue("Estado del vehículo");
        let servicio = getLabelValue("Tipo de servicio");
        let clase = getLabelValue("Clase de vehículo");
        
        // Información técnica
        let marca = getLabelValue("Marca");
        let linea = getLabelValue("Línea");
        let modelo = getLabelValue("Modelo");
        let color = getLabelValue("Color");
        let numeroMotor = getLabelValue("Número de motor");
        let numeroChasis = getLabelValue("Número de chasis");
        let numeroVIN = getLabelValue("Número de VIN");
        let cilindraje = getLabelValue("Cilindraje");
        let tipoCarroceria = getLabelValue("Tipo de carrocería");
        let combustible = getLabelValue("Tipo Combustible");
        
        // Información administrativa
        let fechaMatricula = getLabelValue("Fecha de Matricula Inicial");
        let autoridadTransito = getLabelValue("Autoridad de tránsito");
        let gravamenes = getLabelValue("Gravámenes a la propiedad");
        
        // Crear encabezados y fila de datos
        let encabezados = [
            "Placa", "Licencia", "Estado", "Tipo de Servicio", "Clase de Vehiculo", 
            "Marca", "Línea", "Modelo", "Color", "Número de Motor", "Numero de Chasis",
            "Numero de VIN", "Cilindraje", "Tipo de Carrocería", "Combustible",
            "Fecha de Matricula", "Autoridad de Transito", "Gravamenes"
        ];
        
        let valores = [
            placa, licencia, estado, servicio, clase, 
            marca, linea, modelo, color, numeroMotor, numeroChasis,
            numeroVIN, cilindraje, tipoCarroceria, combustible,
            fechaMatricula, autoridadTransito, gravamenes
        ];

        datos.push(encabezados);
        datos.push(valores);

        console.log("Datos extraídos:", datos);

        // Enviar los datos al background script para descargar
        chrome.runtime.sendMessage({ 
            action: "descargarCSV", 
            data: datos 
        }, response => {
            console.log("Respuesta recibida:", response);
        });
    }

    // Inyecta la función extraerDatos en la pestaña activa
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: extraerDatos
        });
    } catch (error) {
        console.error("Error al ejecutar el script:", error);
    }
});