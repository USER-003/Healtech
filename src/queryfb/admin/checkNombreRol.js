import { db } from '../../config/fb';
import { ref, get, child } from "firebase/database";

/**
 * Función para verificar si un rol con el mismo nombre ya existe dentro de una clínica en Firebase.
 * @param {string} registro - Número de registro de la clínica.
 * @param {string} nombre - Nombre del rol a verificar.
 * @returns {Promise<boolean>} - Retorna `true` si el rol ya existe, de lo contrario `false`.
 */
const verificarNombreRolExistente = async (registro, nombre) => {
  try {
    // Referencia al nodo roles dentro de clinica/{registro}
    const rolesRef = ref(db, `clinica/${registro}/roles`);
    const snapshot = await get(rolesRef);

    if (snapshot.exists()) {
      const roles = snapshot.val();

      // Recorrer los roles y verificar si algún rol tiene el mismo nombre
      for (const key in roles) {
        if (roles[key].nombre === nombre) {
          return true; // El nombre ya existe
        }
      }
    }

    return false; // El nombre no existe
  } catch (error) {
    console.error("Error al verificar el nombre del rol:", error);
    throw error;
  }
};

export default verificarNombreRolExistente;
