import { ref, get, child } from "firebase/database";
import { db } from "../../config/fb"; // Ajusta la ruta según tu configuración

/**
 * Función para obtener el número de registro de la clínica asociada a un usuario.
 * Intenta primero en `admin/{uid}/clinica` y luego en `colaboradores/{uid}/clinica` si no lo encuentra en el primer nodo.
 * @param {string} uid - UID del usuario activo.
 * @returns {Promise<string|null>} - Retorna el número de registro de la clínica o null si no hay ninguna clínica asociada.
 */
const obtenerRegistroClinicaAsociada = async (uid) => {
  try {
    const dbRef = ref(db);

    // Intentar obtener el registro de la clínica en el nodo `admin/{uid}/clinica`
    let snapshot = await get(child(dbRef, `admin/${uid}/clinica`));

    // Si no se encuentra en `admin`, intenta en `colaboradores/{uid}/clinica`
    if (!snapshot.exists()) {
      console.log("No se encontró clínica en admin, buscando en colaboradores.");
      snapshot = await get(child(dbRef, `colaboradores/${uid}/clinica`));
    }
    if (!snapshot.exists()) {
      console.log("No se encontró clínica en admin, buscando en colaboradores.");
      snapshot = await get(child(dbRef, `doctor/${uid}/clinica`));
    }

    // Si encontramos el registro de la clínica en cualquiera de los nodos
    if (snapshot.exists()) {
      const clinicasAsociadas = snapshot.val();
      const registroClinica = Object.keys(clinicasAsociadas)[0]; // Primer nodo de clínica asociada
      console.log("Registro de la clínica encontrado:", registroClinica);
      return registroClinica;
    } else {
      console.log("No se encontró ninguna clínica asociada para el usuario en admin ni colaboradores.");
      return null; // No hay ninguna clínica asociada en los nodos
    }
  } catch (error) {
    console.error("Error al obtener el registro de la clínica asociada:", error);
    return null; // En caso de error, retornamos null
  }
};

export default obtenerRegistroClinicaAsociada;
