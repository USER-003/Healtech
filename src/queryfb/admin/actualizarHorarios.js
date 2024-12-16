import { db } from '../../config/fb';
import { ref, update } from "firebase/database";
import registrarLogSistema from '../general/setLog';

/**
 * Función para actualizar los horarios de atención de una clínica en la base de datos de Firebase.
 * @param {string} registro - Número de registro de la clínica (usado como ID).
 * @param {object} schedule - Objeto con los horarios de atención de cada día de la semana.
 * @returns {Promise<void>} - Promesa que se resuelve cuando la operación es exitosa.
 */
const actualizarHorariosClinica = (registro, schedule) => {
    return new Promise(async (resolve, reject) => {
        try {
            const horariosRef = ref(db, "clinica/" + registro + "/horarios");

            // Actualizar los horarios en Firebase
            await update(horariosRef, schedule);
            try {
                await registrarLogSistema("Se actualizan horarios", "Mi Clínica", "exito");
                console.log("Log del sistema registrado exitosamente.");
            } catch (logError) {
                console.error("Error al registrar el log del sistema:", logError);
            }

            resolve("Horarios de atención actualizados exitosamente.");
        } catch (error) {
            try {
                await registrarLogSistema("Se actualizan horarios", "Mi Clínica", "fallo");
                console.log("Log del sistema registrado exitosamente.");
            } catch (logError) {
                console.error("Error al registrar el log del sistema:", logError);
            }
            console.error("Error al actualizar los horarios de atención:", error);
            reject(error);
        }
    });
};

export default actualizarHorariosClinica;
