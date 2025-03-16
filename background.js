chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Mensaje recibido en background.js:", message);
    
    if (message.action === "saveData") {
        console.log("Datos recibidos (saveData):", message.data);
        sendResponse({ success: true, message: "Datos recibidos correctamente" });
    } 
    else if (message.action === "descargarCSV") {
        console.log("Datos recibidos para CSV:", message.data);
        descargarCSV(message.data);
        sendResponse({ success: true, message: "Iniciando descarga del CSV" });
    }
    
    return true; // Indica que la respuesta puede ser asincrónica
});

function descargarCSV(datos) {
    try {
        console.log("Preparando datos para CSV:", datos);

        // Validar si hay suficientes datos y extraer la placa
        if (datos.length < 2 || !datos[1][0]) {
            console.error("No hay suficientes datos para generar un archivo válido.");
            return;
        }

        let placa = datos[1][0].replace(/\s+/g, "_").toUpperCase(); // Normalizar la placa
        if (!placa) {
            console.error("No se pudo determinar la placa.");
            return;
        }

        // Crear el contenido CSV
        const BOM = "\uFEFF"; // Añade BOM para compatibilidad con Excel
        let csvContent = datos.map(fila => 
            fila.map(celda => {
                if (celda === null || celda === undefined) return '';
                const valor = String(celda);
                return valor.includes(',') || valor.includes('"') 
                    ? `"${valor.replace(/"/g, '""')}"` 
                    : valor;
            }).join(',')
        ).join('\n');

        let dataUri = `data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(csvContent)}`;
        let filename = `${placa}.csv`;  // Solo el nombre del archivo

        console.log("Iniciando descarga del archivo:", filename);

        chrome.downloads.download({
            url: dataUri,
            filename: filename,  // Se guardará en la carpeta de descargas de Chrome
            conflictAction: "overwrite", // Sobrescribe si existe
            saveAs: false // No pide confirmación
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error("Error en la descarga:", chrome.runtime.lastError.message);
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "Error",
                    message: "Hubo un error al descargar el archivo: " + chrome.runtime.lastError.message
                });
            } else {
                console.log("Descarga iniciada con ID:", downloadId);
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "Éxito",
                    message: `¡Archivo ${placa}.csv guardado en la carpeta de descargas!`
                });
            }
        });
    } catch (error) {
        console.error("Error al procesar la descarga:", error);
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Error",
            message: "Error al procesar la descarga: " + error.message
        });
    }
}