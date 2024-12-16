import { db } from '../../config/fb';
import { ref, get, child } from "firebase/database";

// Función para buscar un nodo en 'paciente' por UID
const searchPatientByUid = (uid) => {
    return new Promise(async (resolve, reject) => {
        try {
            const patientRef = ref(db, `paciente/${uid}`); // Referencia directa al nodo por UID
            const snapshot = await get(patientRef);

            if (snapshot.exists()) {
                const patientData = snapshot.val();
                resolve({ uid, ...patientData }); // Retorna el nodo completo del médico junto con el UID
            } else {
                resolve(null); // No se encontró el nodo con el UID
            }
        } catch (error) {
            console.error("Error al buscar nodo por UID:", error);
            reject(error);
        }
    });
};

export default searchPatientByUid;
