import { db } from '../../config/fb';
import { ref, get } from "firebase/database";

/**
 * Función para buscar un doctor por jvpm en Firebase Realtime Database.
 * @param {string} identificacion - jvpm a buscar.
 * @returns {Promise<boolean>} - Promesa que se resuelve con `true` si se encuentra el jvpm, `false` si no.
 */
const searchJVPM = (jvpm) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doctorRef = ref(db, "doctor");
            const snapshot = await get(doctorRef);

            if (snapshot.exists()) {
                const doctors = snapshot.val();
                for (const key in doctors) {
                    if (doctors[key].jvpm === jvpm) {
                        resolve(true); // La jvpm ya existe
                        return;
                    }
                }
                resolve(false); // La jvpm no existe
            } else {
                resolve(false); // No hay doctores registrados con este codigo
            }
        } catch (error) {
            reject(error); // Rechaza la promesa en caso de error
        }
    });
}

export default searchJVPM;
