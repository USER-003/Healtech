import { db } from '../../config/fb';
import { ref, get } from "firebase/database";

/**
 * Función para buscar un paciente por identificación en Firebase Realtime Database.
 * @param {string} identificacion - La identificación a buscar.
 * @returns {Promise<boolean>} - Promesa que se resuelve con `true` si se encuentra la identificación, `false` si no.
 */
const searchIdentificacion = (identificacion) => {
    return new Promise(async (resolve, reject) => {
        try {
            const patientRef = ref(db, "paciente");
            const snapshot = await get(patientRef);

            if (snapshot.exists()) {
                const patients = snapshot.val();
                for (const key in patients) {
                    if (patients[key].identificacion === identificacion) {
                        resolve(true); // La identificación ya existe
                        return;
                    }
                }
                resolve(false); // La identificación no existe
            } else {
                resolve(false); // No hay pacientes registrados
            }
        } catch (error) {
            reject(error); // Rechaza la promesa en caso de error
        }
    });
}

export default searchIdentificacion;
