import { db } from '../../config/fb';
import { ref, get } from "firebase/database";

/**
 * Función para obtener el registro de la clínica asociada al doctor mediante su UID.
 * @param {string} doctorUID - UID del doctor.
 * @returns {Promise<string>} - Promesa que devuelve la clave del registro de la clínica.
 */
const getClinicaFromDoctorUID = async (doctorUID) => {
    try {
        // Referencia directa al nodo de la clínica dentro del nodo del doctor
        const clinicaRef = ref(db, `doctor/${doctorUID}/clinica`);
        const snapshot = await get(clinicaRef);

        if (!snapshot.exists()) {
            throw new Error("No se encontró una clínica asociada para este doctor.");
        }

        // Extrae la clave del registro de clínica (la primera clave del objeto)
        const clinicaRegistro = Object.keys(snapshot.val())[0];
        return clinicaRegistro; // Devuelve solo la clave del registro de la clínica
    } catch (error) {
        console.error("Error al obtener la clínica del doctor:", error);
        throw error;
    }
};

export default getClinicaFromDoctorUID;
