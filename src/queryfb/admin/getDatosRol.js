import { db } from '../../config/fb';
import { ref, get, child } from "firebase/database";

/**
 * Función para obtener los datos de un rol específico en la base de datos de Firebase.
 * @param {string} registroClinica - Número de registro de la clínica asociada.
 * @param {string} rolUID - UID del rol a obtener.
 * @returns {Promise<object|null>} - Promesa que se resuelve con los datos del rol si existen, o `null` si no se encuentra.
 */
const obtenerDatosRol = async (registroClinica, rolUID) => {
  try {
    // Referencia al nodo específico del rol dentro de clinica/{registroClinica}/roles/{rolUID}
    const rolRef = ref(db, `clinica/${registroClinica}/roles/${rolUID}`);
    const snapshot = await get(rolRef);

    // Verificar si el rol existe
    if (snapshot.exists()) {
      return snapshot.val(); // Retorna los datos del rol si existen
    } else {
      console.log("El rol no existe en la base de datos.");
      return null; // Retorna null si no se encuentra el rol
    }
  } catch (error) {
    console.error("Error al obtener los datos del rol:", error);
    throw error; // Lanza el error para que el controlador lo maneje
  }
};

export default obtenerDatosRol;
