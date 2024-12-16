import { db } from '../../config/fb';
import { ref, set, get } from "firebase/database";
import registrarLogSistema from '../general/setLog'; // Importa la función para registrar logs
import obtenerRegistroClinica from '../admin/getRegistroClinica'; // Importa la función para obtener el registro de la clínica asociada

/**
 * Función para establecer la cuenta de un doctor en la base de datos de Firebase y registrar un log de la creación.
 * @param {string} adminUID - UID del administrador que crea la cuenta.
 * @param {string} uid - ID único del doctor.
 * @param {string} nombre - Nombre del doctor.
 * @param {number} dui - DUI del doctor.
 * @param {string} direccion - Dirección del doctor.
 * @param {number} telefono - Teléfono del doctor.
 * @param {string} email - Correo electrónico del doctor.
 * @param {string} jvpm - Número de JVPM del doctor.
 * @returns {Promise<void>} - Promesa que se resuelve cuando la operación es exitosa.
 */
const setDoctorAccount = async (adminUID, uid, nombre, dui, direccion, telefono, email, jvpm) => {
    try {
        // Obtiene el registro de la clínica asociada
        const registroClinica = await obtenerRegistroClinica(adminUID);

        if (!registroClinica) {
            throw new Error(
                "No se encontró la clínica asociada para el administrador."
            );
        }

        const doctorRef = ref(db, "doctor/" + uid);

        // Verifica si el doctor ya existe
        const snapshot = await get(doctorRef);
        if (snapshot.exists()) {
            throw new Error("El doctor ya existe en la base de datos.");
        }

        // Si no existe, crea una nueva entrada en la base de datos con el nodo `clinica` que contiene el registro como llave y `true` como valor
        await set(doctorRef, {
            nombre,
            dui,
            telefono,
            email,
            direccion,
            jvpm,
            rol: "doctor",  // Agrega el rol de doctor
            clinica: {
                [registroClinica]: true // Crea el nodo `clinica` y añade el registro como llave y `true` como valor
            }
        });

        // Obtener la fecha actual en formato "DD/MM/YYYY"
        const fechaCreacion = new Date().toLocaleDateString("es-ES");

        // Agregar el UID del doctor y la fecha de creación en un nodo dentro de la clínica asociada
        const clinicaDoctorRef = ref(db, `clinica/${registroClinica}/medicos/${uid}`);
        await set(clinicaDoctorRef, {
            activo: true,  // Puedes usar esta propiedad para otras necesidades
            fecha_creacion: fechaCreacion // Guardar la fecha de creación
        });

        // Registrar log de la creación del doctor
        const accion = `Creación de cuenta para el doctor ${nombre} (UID: ${uid})`;

        try {
            await registrarLogSistema(accion, "Médicos", "exito");
            console.log("Log del sistema registrado exitosamente.");
        } catch (logError) {
            console.error("Error al registrar el log del sistema:", logError);
        }
        return "Cuenta de doctor creada exitosamente con log registrado.";
    } catch (error) {
        const accion = `Creación de cuenta para el doctor ${nombre} (UID: ${uid})`;

        try {
            await registrarLogSistema(accion, "Médicos", "fallo");
            console.log("Log del sistema registrado exitosamente.");
        } catch (logError) {
            console.error("Error al registrar el log del sistema:", logError);
        }
        console.error("Error al establecer la cuenta del doctor:", error);
        throw error;
    }
};

export default setDoctorAccount;
