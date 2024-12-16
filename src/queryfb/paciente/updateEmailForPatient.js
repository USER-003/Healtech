import { getAuth, updateEmail } from 'firebase/auth';
import { db } from '../../config/fb';
import { ref, update } from 'firebase/database';

// Función para cambiar el correo en Firebase Auth y en la base de datos de Realtime
const updateEmailForPatient = async (uid, newEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            // Actualizar el correo en Firebase Authentication
            await updateEmail(user, newEmail);

            // Actualizar el correo en la base de datos Realtime
            await update(ref(db, `paciente/${uid}`), { email: newEmail });

            resolve('Correo actualizado correctamente');
        } catch (error) {
            console.error("Error al actualizar el correo:", error);
            reject(error);
        }
    });
};

export default updateEmailForPatient;
