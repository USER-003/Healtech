import { db } from '../../config/fb';
import { ref, get } from "firebase/database";

/**
 * Función para buscar un doctor por identificación en Firebase Realtime Database.
 * @param {string} identificacion - La identificación a buscar.
 * @returns {Promise<boolean>} - Promesa que se resuelve con `true` si se encuentra la identificación, `false` si no.
 */
const searchIdentificacion = (dui) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doctorRef = ref(db, "doctor");
            const snapshot = await get(doctorRef);

            if (snapshot.exists()) {
                const doctors = snapshot.val();
                for (const key in doctors) {
                    if (doctors[key].dui === dui) {
                        resolve(true); // La identificación ya existe
                        return;
                    }
                }
                resolve(false); // La identificación no existe
            } else {
                resolve(false); // No hay doctores registrados
            }
        } catch (error) {
            reject(error); // Rechaza la promesa en caso de error
        }
    });
}

export default searchIdentificacion;
