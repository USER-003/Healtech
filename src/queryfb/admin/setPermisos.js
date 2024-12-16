import { ref, update } from "firebase/database";
import { db } from "../../../src/config/fb";
import registrarLogSistema from "../../../src/queryfb/general/setLog";

/**
 * Función para guardar los permisos en el rol seleccionado en Firebase dentro del registro de la clínica.
 * @param {string} registroClinica - Número de registro de la clínica.
 * @param {string} rolUID - UID del rol seleccionado.
 * @param {object} permisos - Objeto con los permisos a asignar.
 * @param {string} uidAdmin - UID del administrador que realiza la acción.
 * @returns {Promise<boolean>} - Retorna `true` si la operación es exitosa, `false` si ocurre algún error.
 */
const guardarPermisosEnRol = async (registroClinica, rolUID, permisos, uidAdmin) => {
  try {
    const permisosRef = ref(db, `clinica/${registroClinica}/roles/${rolUID}/permisos`);
    await update(permisosRef, permisos); // Actualiza el nodo de permisos en Firebase con el objeto permisos

    // Registrar el log de la acción
    const accion = `Permisos actualizados para el rol ${rolUID}`;
    try {
      await registrarLogSistema(accion, "Administrar permisos", "exito");
      console.log("Log del sistema registrado exitosamente.");
    } catch (logError) {
        console.error("Error al registrar el log del sistema:", logError);
    }
    return true;
  } catch (error) {
    const accion = `Permisos actualizados para el rol ${rolUID}`;

    try {
      await registrarLogSistema(accion, "Administrar permisos", "fallo");
      console.log("Log del sistema registrado exitosamente.");
    } catch (logError) {
        console.error("Error al registrar el log del sistema:", logError);
    }
    console.error("Error al guardar permisos:", error);
    return false;
  }
};

export default guardarPermisosEnRol;
