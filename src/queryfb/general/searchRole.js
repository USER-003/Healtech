import { db } from '../../config/fb';
import { ref, get } from "firebase/database";

/**
 * Función para buscar el rol de un usuario en Firebase Realtime Database.
 * Verifica en los nodos de "admin", "doctor" y "paciente".
 * @param {string} uid - El UID del usuario.
 * @returns {Promise<string>} - Promesa que se resuelve con el rol del usuario o un error si no se encuentra.
 */
const searchRole = (uid) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Lista de nodos donde se podría encontrar el usuario
            const roles = ["admin", "doctor", "paciente", "colaboradores"];
            
            for (const role of roles) {
                const userRef = ref(db, `${role}/${uid}`);
                const snapshot = await get(userRef);
                
                if (snapshot.exists()) {
                    resolve(role); // Resuelve la promesa con el rol encontrado
                    return;
                }
            }

            // Si no se encuentra el UID en ninguno de los nodos
            reject(new Error("No se pudo encontrar la información del usuario en ninguno de los roles."));
        } catch (error) {
            reject(error); // Rechaza la promesa en caso de error
        }
    });
}

export default searchRole;
