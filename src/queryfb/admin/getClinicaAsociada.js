import { ref, get, child } from "firebase/database";
import { db } from "../../config/fb"; // Ajusta la ruta según tu configuración

/**
 * Función para obtener el nodo completo de la clínica asociada a un usuario (admin o colaborador) en la base de datos.
 * @param {string} uid - UID del usuario (admin o colaborador)
 * @returns {Promise<object|null>} - Retorna el nodo de la clínica si existe, o `null` si no se encuentra.
 */
const obtenerClinicaAsociada = async (uid) => {
  try {
    const dbRef = ref(db);

    // Intentar obtener la clínica del nodo `admin/{uid}/clinica`
    let snapshot = await get(child(dbRef, `admin/${uid}`));

    // Si no se encuentra en `admin`, intenta en `colaboradores/{uid}/clinica`
    if (!snapshot.exists()) {
      console.log("No se encontró ninguna clínica asociada al admin, buscando en colaboradores.");
      snapshot = await get(child(dbRef, `colaboradores/${uid}`));
    }

    // Si encontramos una clínica en cualquiera de los nodos
    if (snapshot.exists()) {
      const clinicasAsociadas = snapshot.val();
      const registroClinica = Object.keys(clinicasAsociadas.clinica)[0]; // Primer nodo de clínica

      console.log("Registro de la clínica encontrado:", registroClinica);

      // Obtener el nodo completo de la clínica en `clinica/{registro}`
      const clinicaSnapshot = await get(child(dbRef, `clinica/${registroClinica}`));

      if (clinicaSnapshot.exists()) {
        console.log("Nodo completo de la clínica:", clinicaSnapshot.val());
        return clinicaSnapshot.val(); // Retorna el nodo completo de la clínica
      } else {
        console.log("La clínica no existe.");
        return null; // La clínica no existe
      }
    } else {
      console.log("No se encontró ninguna clínica asociada al usuario.");
      return null; // No hay ninguna clínica asociada
    }
  } catch (error) {
    console.error("Error al obtener la clínica del usuario:", error);
    return null; // En caso de error, retornamos null
  }
};

export default obtenerClinicaAsociada;
