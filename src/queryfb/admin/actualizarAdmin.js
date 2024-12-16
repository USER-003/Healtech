import { db } from '../../config/fb';
import { ref, get, update } from "firebase/database";
import registrarLogSistema from '../general/setLog';

/**
 * Función para actualizar la cuenta de un administrador en la base de datos de Firebase.
 * @param {string} uid - Identificador del administrador.
 * @param {object} datosAdmin - Datos del administrador a actualizar, que incluyen nombre, email, dui, telefono, direccion, genero, nacimiento y rol.
 * @returns {Promise<string>} - Promesa que se resuelve cuando la operación es exitosa.
 */
const actualizarAdmin = (uid, datosAdmin) => {
    return new Promise(async (resolve, reject) => {
        try {
            const adminRef = ref(db, "admin/" + uid);

            // Verificar si el administrador existe
            const snapshot = await get(adminRef);
            if (!snapshot.exists()) {
                reject(new Error("El administrador no está registrado en la base de datos."));
                return;
            }

            // Validar que ningún campo importante sea undefined o vacío
            const { nombre, email, dui, telefono, direccion, genero, nacimiento, rol } = datosAdmin;
            if (!nombre || !email || !dui || !telefono || !direccion || !genero || !nacimiento || !rol) {
                reject(new Error("Todos los campos son obligatorios y deben tener valores válidos."));
                return;
            }

            // Formatear la fecha de nacimiento como "DD/MM/YYYY" si es necesario
            const formattedNacimiento = `${nacimiento.day.padStart(2, '0')}/${nacimiento.month.padStart(2, '0')}/${nacimiento.year}`;

            // Preparar los datos a actualizar
            const datosActualizados = {
                nombre,
                email,
                dui,
                telefono,
                direccion,
                genero,
                nacimiento: formattedNacimiento, // Usa la fecha formateada
                rol
            };

            // Actualizar la información del administrador
            await update(adminRef, datosActualizados);

            // Log: Intentar registrar el log de la acción
            try {
                await registrarLogSistema("Se actualiza información del administrador", "Mi Perfil", "exito");
                console.log("Log del sistema registrado exitosamente.");
            } catch (logError) {
                console.error("Error al registrar el log del sistema:", logError);
            }

            resolve("Información del administrador actualizada exitosamente.");
        } catch (error) {
             // Log: Intentar registrar el log de la acción (ERROR)
             try {
                await registrarLogSistema("Se actualiza información del administrador", "Mi Perfil", "fallo");
                console.log("Log del sistema registrado exitosamente.");
            } catch (logError) {
                console.error("Error al registrar el log del sistema:", logError);
            }
            console.error("Error al actualizar la información del administrador:", error);
            reject(error);
        }
    });
};

export default actualizarAdmin;
