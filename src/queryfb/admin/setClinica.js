import { db } from '../../config/fb';
import { ref, set, get } from "firebase/database";
import registrarLogSistema from '../general/setLog';

/**
 * Función para registrar una clínica en la base de datos de Firebase.
 * @param {string} uid - UID del administrador.
 * @param {string} registro - Número de registro de la clínica (usado como ID).
 * @param {string} nombre - Nombre de la clínica.
 * @param {string} direccion - Dirección de la clínica.
 * @param {string} telefono - Teléfono de contacto de la clínica.
 * @param {string} entidad - Tipo de entidad (Pública o Privada).
 * @returns {Promise<void>} - Promesa que se resuelve cuando la operación es exitosa.
 */
const registrarClinica = (uid, registro, nombre, direccion, telefono, entidad) => {
    return new Promise(async (resolve, reject) => {
        try {
            const clinicaRef = ref(db, "clinica/" + registro);
            const adminRef = ref(db, "clinica/" + registro + "/admin/" + uid);

            // Verificar si la clínica ya existe
            const snapshot = await get(clinicaRef);
            if (snapshot.exists()) {
                reject(new Error("La clínica ya está registrada en la base de datos."));
                return;
            }

            // Si no existe, crea una nueva entrada en la base de datos
            await set(clinicaRef, {
                nombre,
                direccion,
                telefono,
                registro, // Guarda el número de registro también
                entidad
            });

            // Añadir nodo admin y dentro el UID con valor 'true'
            await set(adminRef, true);

            // Log: Intentar registrar el log de la acción en una nueva sección
            try {
                await registrarLogSistema("Se crea clinica", "Mi Clínica", "exito");
                console.log("Log del sistema registrado exitosamente.");
            } catch (logError) {
                console.error("Error al registrar el log del sistema:", logError);
            }

            resolve("Clínica y nodo de administrador registrados exitosamente.");
        } catch (error) {
            try {
                await registrarLogSistema("Se crea clinica", "Mi Clínica", "fallo");
                console.log("Log del sistema registrado exitosamente.");
            } catch (logError) {
                console.error("Error al registrar el log del sistema:", logError);
            }
            console.error("Error al registrar la clínica:", error);
            reject(error);
        }
    });
};

export default registrarClinica;
