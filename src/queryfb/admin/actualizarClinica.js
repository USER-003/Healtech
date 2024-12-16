import { db } from '../../config/fb';
import { ref, get, update } from "firebase/database";
import registrarLogSistema from '../general/setLog';

const actualizarClinica = (uid, registro, datosClinica) => {
    return new Promise(async (resolve, reject) => {
        try {
            const clinicaRef = ref(db, "clinica/" + registro);

            // Verificar si la clínica existe
            const snapshot = await get(clinicaRef);
            if (!snapshot.exists()) {
                reject(new Error("La clínica no está registrada en la base de datos."));
                return;
            }

            // Validar que ningún campo sea undefined
            const { nombre, direccion, telefono, entidad } = datosClinica;
            if (!nombre || !direccion || !telefono || !entidad) {
                reject(new Error("Todos los campos son obligatorios y deben tener valores válidos."));
                return;
            }

            // Actualizar la información de la clínica
            await update(clinicaRef, datosClinica);

            // Log: Intentar registrar el log de la acción
            try {
                await registrarLogSistema("Se actualiza información de la clinica", "Mi Clínica", "exito");
                console.log("Log del sistema registrado exitosamente.");
            } catch (logError) {
                console.error("Error al registrar el log del sistema:", logError);
            }

            resolve("Información de la clínica actualizada exitosamente.");
        } catch (error) {

            try {
                await registrarLogSistema("Se actualiza información de la clinica", "Mi Clínica", "fallo");
                console.log("Log del sistema registrado exitosamente.");
            } catch (logError) {
                console.error("Error al registrar el log del sistema:", logError);
            }
            console.error("Error al actualizar la información de la clínica:", error);
            reject(error);
        }
    });
};

export default actualizarClinica;
