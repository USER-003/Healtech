import { db } from '../../config/fb';
import { ref, get, child } from "firebase/database";
import obtenerRegistroClinicaAsociada from '../admin/getRegistroClinica';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cache } from "react-native-cache";

/**
 * Función para obtener todos los logs asociados a la clínica del usuario logueado.
 * Recibe el UID del usuario como parámetro y luego obtiene los logs.
 * @param {string} userUID - UID del usuario autenticado
 * @returns {Promise<Array>} - Promesa que se resuelve con un array de logs asociados.
 */
const fetchLogs = async (userUID) => {
    console.log("Ejecutando búsqueda con UID:", userUID);

    // Configuración de la caché
    const cache = new Cache({
        namespace: "myapp",
        policy: {
            maxEntries: 50000, // número máximo de entradas en la caché
            stdTTL: 36 // tiempo de vida en segundos, aquí 1 hora
        },
        backend: AsyncStorage
    });

    // Verificar si los datos están en la caché
    try {
        const cachedLogs = await cache.get(userUID);
        if (cachedLogs) {
            console.log("Datos obtenidos de la caché");
            return cachedLogs;
        }
    } catch (cacheError) {
        console.warn("No se encontró en caché:", cacheError);
    }

    try {
        // Obtener el registro de la clínica asociada al usuario
        const registroClinica = await obtenerRegistroClinicaAsociada(userUID);
        if (!registroClinica) {
            throw new Error("No se encontró una clínica asociada al usuario.");
        }

        console.log("Paso 1: ", registroClinica);
        
        // Referencia al nodo de logs en la clínica específica
        const clinicaLogsRef = ref(db, `clinica/${registroClinica}/logs`);
        const clinicaLogsSnapshot = await get(clinicaLogsRef);

        if (!clinicaLogsSnapshot.exists()) {
            console.warn("No hay logs asociados a esta clínica.");
            return [];
        }

        // Obtener las claves de cada log asociado a la clínica
        const logKeys = Object.keys(clinicaLogsSnapshot.val());
        
        // Recopilar cada log desde el nodo principal `logs`
        const logsRef = ref(db, "logs");
        const logs = [];

        for (const logKey of logKeys) {
            const logSnapshot = await get(child(logsRef, logKey));
            if (logSnapshot.exists()) {
                logs.push({ id: logKey, ...logSnapshot.val() });
            }
        }

        // Guardar los logs en la caché para futuras solicitudes
        await cache.set(userUID, logs);

        return logs;
    } catch (error) {
        console.error("Error al obtener los logs:", error);
        throw error;
    }
};

export default fetchLogs;
