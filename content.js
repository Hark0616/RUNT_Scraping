(() => {
    console.log("Content script cargado");
    
    function getLabelValue(texto) {
        let labels = [...document.querySelectorAll("label")];
    
        // Normalizar texto buscado
        let textoNormalizado = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        for (let label of labels) {
            let labelText = label.textContent.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

            if (labelText.includes(textoNormalizado)) {
                let row = label.closest(".row");
                if (!row) continue;

                let valorDiv = row.querySelector(".show-grande, span, p");
                if (valorDiv) {
                    let valor = valorDiv.textContent.trim();
                    console.log(`✅ Valor extraído para "${texto}": ${valor}`);
                    return valor;
                }
            }
        }
        return "N/A";
    }

    // Función principal para obtener todos los datos
    function getData() {
        // Debugging: Mostrar todas las etiquetas disponibles para ayudar a diagnosticar problemas
        console.log("🔍 Todas las etiquetas disponibles:");
        document.querySelectorAll("label").forEach(label => {
            console.log(`- "${label.textContent.trim()}"`);
        });
        
        return {
            placa: getLabelValue("PLACA DEL PLACA DEL VEHÍCULO"),
            licencia: getLabelValue("Nro. de licencia de tránsito"),
            estado: getLabelValue("Estado del vehículo"),
            servicio: getLabelValue("Tipo de servicio"),
            clase: getLabelValue("Clase de vehículo"),
            marca: getLabelValue("Marca"),
            linea: getLabelValue("Línea"),
            modelo: getLabelValue("Modelo"),
            color: getLabelValue("Color"),
            numeroMotor: getLabelValue("Número de motor"),
            numeroChasis: getLabelValue("Número de chasis"),
            numeroVIN: getLabelValue("Número de VIN:"),
            cilindraje: getLabelValue("Cilindraje"),
            tipoCarroceria: getLabelValue("Tipo de carrocería"),
            combustible: getLabelValue("Tipo Combustible"),
            fechaMatricula: getLabelValue("Fecha de Matricula Inicial"),
            autoridadTransito: getLabelValue("Autoridad de tránsito"),
            gravamenes: getLabelValue("Gravámenes a la propiedad")
        };
    }

    // Escuchar mensajes del popup o background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "extraerDatos") {
            let data = getData();
            console.log("📦 Datos extraídos:", data);
            sendResponse({ success: true, data });
        }
        return true;
    });
    

    // Función de inicialización automática
    function waitForLabels(callback) {
        let attempts = 0;
        const maxAttempts = 20; // Aumentar el número de intentos
        const interval = 500; // ms
        
        console.log("Esperando a que carguen las etiquetas...");
        
        let check = setInterval(() => {
            if (document.querySelectorAll("label").length > 0) {
                console.log(`Etiquetas encontradas después de ${attempts} intentos`);
                clearInterval(check);
                callback();
            } else if (attempts >= maxAttempts) {
                console.log("Tiempo de espera agotado, no se encontraron etiquetas");
                clearInterval(check);
            }
            attempts++;
        }, interval);
    }

    // Se ejecuta automáticamente al cargar
    waitForLabels(() => {
        let data = getData();
        console.log("🚀 Datos extraídos automáticamente:", data);

        // Enviar los datos al background.js
        chrome.runtime.sendMessage({ action: "saveData", data: data }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error al enviar mensaje:", chrome.runtime.lastError);
            } else {
                console.log("Respuesta del background:", response);
            }
        });
    });
})();