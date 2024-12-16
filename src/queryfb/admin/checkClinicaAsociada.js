import { ref, get, child } from "firebase/database";
import { db } from "../../config/fb"; // Ajusta la ruta según tu configuración

/**
 * Función para validar si un usuario (admin o colaborador) tiene una clínica asociada que existe en la base de datos.
 * @param {string} uid - UID del usuario
 * @returns {Promise<boolean>} - Retorna true si la clínica existe, false si no.
 */
const validarClinicaAsociada = async (uid) => {
  try {
    const dbRef = ref(db);

    // Intentar obtener la clínica desde el nodo `admin/{uid}/clinica`
    let snapshot = await get(child(dbRef, `admin/${uid}`));

    // Si no se encuentra en `admin`, intenta en `colaboradores/{uid}/clinica`
    if (!snapshot.exists()) {
      console.log("No se encontró ninguna clínica asociada en admin, buscando en colaboradores.");
      snapshot = await get(child(dbRef, `colaboradores/${uid}`));
    }

    // Si encontramos una clínica en cualquiera de los nodos
    if (snapshot.exists()) {
      const clinicasAsociadas = snapshot.val();
      const registroClinica = Object.keys(clinicasAsociadas.clinica)[0]; // Primer nodo de clínica

      console.log("Registro de la clínica encontrado:", registroClinica);

      // Verificar si la clínica existe en `clinica/{registro}`
      const clinicaSnapshot = await get(child(dbRef, `clinica/${registroClinica}`));

      if (clinicaSnapshot.exists()) {
        console.log("Clínica encontrada:", clinicaSnapshot.val());
        return true; // La clínica existe
      } else {
        console.log("La clínica no existe.");
        return false; // La clínica no existe
      }
    } else {
      console.log("No se encontró ninguna clínica asociada para este UID en admin ni en colaboradores.");
      return false; // No hay ninguna clínica asociada
    }
  } catch (error) {
    console.error("Error al validar la clínica del usuario:", error);
    return false; // En caso de error, retornamos false
  }
};

export default validarClinicaAsociada;
