// deleteRol.js
import { ref, remove } from "firebase/database";
import { db } from "../../config/fb"; // Ajusta la ruta según tu configuración
import registrarLogSistema from "../general/setLog";

/**
 * Eliminar un rol en Firebase en base al registro de la clínica y el ID del rol.
 * @param {string} registroClinica - Número de registro de la clínica.
 * @param {string} rolId - ID del rol a eliminar.
 * @returns {Promise<void>} - Promesa que se resuelve cuando la operación es exitosa.
 */
const eliminarRol = async (registroClinica, rolId) => {
  try {
    const rolRef = ref(db, `clinica/${registroClinica}/roles/${rolId}`);
    await remove(rolRef);
    console.log("Rol eliminado correctamente.");
    try {
      await registrarLogSistema("Se elimina rol", "Roles del sistema", "exito");
      console.log("Log del sistema registrado exitosamente.");
    } catch (logError) {
        console.error("Error al registrar el log del sistema:", logError);
    }
  } catch (error) {
    try {
      await registrarLogSistema("Se elimina rol", "Roles del sistema", "fallo");
      console.log("Log del sistema registrado exitosamente.");
    } catch (logError) {
        console.error("Error al registrar el log del sistema:", logError);
    }
    console.error("Error al eliminar el rol:", error);
    throw error;
  }
};

export default eliminarRol;
