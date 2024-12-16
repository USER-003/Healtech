import { db } from '../../config/fb';
import { ref, set, get } from "firebase/database";

/**
 * Función para establecer la cuenta de un administrador en la base de datos de Firebase.
 * @param {string} nombre - Nombre del administrador.
 * @param {string} email - Correo electrónico del administrador.
 * @param {string} dui - DUI del administrador.
 * @param {string} telefono - Teléfono del administrador.
 * @param {string} direccion - Dirección del administrador.
 * @param {string} genero - Género del administrador.
 * @param {object} nacimiento - Fecha de nacimiento del administrador (con las propiedades day, month, year).
 * @param {string} rol - Rol del administrador.
 * @returns {Promise<void>} - Promesa que se resuelve cuando la operación es exitosa.
 */
const setAdminAccount = (uid, nombre, email, dui, telefono, direccion, genero, nacimiento, mes, rol) => {
    return new Promise(async (resolve, reject) => {
        try {
            const adminRef = ref(db, "admin/" + uid);

            // Verifica si el administrador ya existe
            const snapshot = await get(adminRef);
            if (snapshot.exists()) {
                reject(new Error("El administrador ya existe en la base de datos."));
                return;
            }

            // Formatear la fecha de nacimiento como "DD/MM/YYYY"
            const formattednacimiento = `${nacimiento.day.padStart(2, '0')}/${mes}/${nacimiento.year}`;

            // Si no existe, crea una nueva entrada en la base de datos
            await set(adminRef, {
                nombre,
                email,
                dui, // Incluye el DUI en la información almacenada
                telefono,
                direccion,
                genero,
                nacimiento: formattednacimiento, // Usa la fecha formateada
                rol
            });

            resolve("Cuenta de administrador creada exitosamente.");
        } catch (error) {

            console.error("Error al establecer la cuenta del admin:", error);
            reject(error);
        }
    });
};

export default setAdminAccount;
