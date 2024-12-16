import { ref, get, child } from "firebase/database";
import { db } from "../../config/fb"; // Ajusta la ruta según tu configuración

/**
 * Función para obtener la información de un usuario (admin o colaborador) basado en el UID.
 * @param {string} userUID - UID del usuario
 * @returns {Promise<object|null>} - Objeto con los datos del usuario o `null` si no se encuentra
 */
const getUserInfo = async (userUID) => {
  if (!userUID) return null;

  try {
    const dbRef = ref(db);

    // Intentar obtener la información del nodo `admin/{userUID}`
    let snapshot = await get(child(dbRef, `admin/${userUID}`));

    // Si no se encuentra en `admin`, intenta en `colaboradores/{userUID}`
    if (!snapshot.exists()) {
      console.log("No se encontró información en admin, buscando en colaboradores.");
      snapshot = await get(child(dbRef, `colaboradores/${userUID}`));
    }
    if (!snapshot.exists()) {
      console.log("No se encontró información en admin, buscando en doctores.");
      snapshot = await get(child(dbRef, `doctor/${userUID}`));
    }

    // Si encontramos información en cualquiera de los nodos
    if (snapshot.exists()) {
      return snapshot.val(); // Retorna la información del usuario
    } else {
      console.log("No se encontró información para este UID en admin ni colaboradores.");
      return null; // No hay información en ninguno de los nodos
    }
  } catch (error) {
    console.error("Error al obtener la información del usuario:", error);
    return null; // Retorna `null` en caso de error
  }
};

export default getUserInfo;
