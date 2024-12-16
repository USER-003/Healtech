import { db } from '../../config/fb';
import { ref, get } from "firebase/database";

/**
 * Función para obtener los permisos de un rol específico de una clínica en la base de datos de Firebase.
 * @param {string} registroClinica - Número de registro de la clínica.
 * @param {string} rolUID - UID del rol del cual se quieren obtener los permisos.
 * @returns {Promise<Object|null>} - Retorna un objeto con los permisos si existen, o null si no se encuentran.
 */
const obtenerPermisosDeRol = async (registroClinica, rolUID) => {
  try {
    // Referencia al nodo de permisos del rol específico en la clínica
    const permisosRef = ref(db, `clinica/${registroClinica}/roles/${rolUID}/permisos`);

    // Obtiene los datos de permisos
    const snapshot = await get(permisosRef);

    // Si el rol tiene permisos registrados, se retornan
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No se encontraron permisos para este rol.");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener los permisos del rol:", error);
    return null;
  }
};

export default obtenerPermisosDeRol;
