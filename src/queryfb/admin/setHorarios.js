import { db } from '../../config/fb';
import { ref, set } from "firebase/database";
import registrarLogSistema from '../general/setLog';

/**
 * Función para agregar los horarios de atención de una clínica en la base de datos de Firebase.
 * @param {string} registro - Número de registro de la clínica (usado como ID).
 * @param {object} schedule - Objeto con los horarios de atención de cada día de la semana.
 * @returns {Promise<void>} - Promesa que se resuelve cuando la operación es exitosa.
 */
const agregarHorariosClinica = (registro, schedule) => {
    return new Promise(async (resolve, reject) => {
        try {
            const horariosRef = ref(db, "clinica/" + registro + "/horarios");

            // Guardar los horarios en Firebase
            await set(horariosRef, schedule);

            resolve("Horarios de atención registrados exitosamente.");
                // Log: Intentar registrar el log de la acción
            try {
                await registrarLogSistema("Se crean horarios", "Mi Clínica", "exito");
                console.log("Log del sistema registrado exitosamente.");
            } catch (logError) {
                console.error("Error al registrar el log del sistema:", logError);
            }
        } catch (error) {
            try {
                await registrarLogSistema("Se crean horarios", "Mi Clínica", "fallo");
                console.log("Log del sistema registrado exitosamente.");
            } catch (logError) {
                console.error("Error al registrar el log del sistema:", logError);
            }
            console.error("Error al registrar los horarios de atención:", error);
            reject(error);
        }
    });
};

export default agregarHorariosClinica;
