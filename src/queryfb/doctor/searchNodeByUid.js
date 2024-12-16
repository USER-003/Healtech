import { db } from '../../config/fb';
import { ref, get } from "firebase/database";

// Función para buscar un nodo en 'doctor' por UID
const searchNodeByUid = (uid) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doctorRef = ref(db, `doctor/${uid}`); // Referencia directa al nodo por UID
            const snapshot = await get(doctorRef);

            if (snapshot.exists()) {
                const doctorData = snapshot.val();
                resolve({ uid, ...doctorData }); // Retorna el nodo completo del médico junto con el UID
            } else {
                resolve(null); // No se encontró el nodo con el UID
            }
        } catch (error) {
            console.error("Error al buscar nodo por UID:", error);
            reject(error);
        }
    });
};

export default searchNodeByUid;
