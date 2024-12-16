import { db } from '../../config/fb';
import { ref, get, child } from "firebase/database";

/**
 * Función para obtener un único log por su UID.
 * @param {string} logUID - UID del log que se desea obtener.
 * @returns {Promise<Object|null>} - Promesa que se resuelve con el log encontrado o null si no existe.
 */
const getLog = async (logUID) => {
    console.log("Buscando log con UID:", logUID);

    try {
        // Referencia al nodo del log específico en `logs`
        const logRef = ref(db, `logs/${logUID}`);
        const logSnapshot = await get(logRef);

        // Verificar si el log existe
        if (!logSnapshot.exists()) {
            console.warn("No se encontró un log con el UID proporcionado.");
            return null;
        }

        // Retornar el log con su UID y datos
        return { id: logUID, ...logSnapshot.val() };
    } catch (error) {
        console.error("Error al obtener el log:", error);
        throw error;
    }
};

export default getLog;
