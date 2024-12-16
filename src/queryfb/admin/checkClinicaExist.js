import { ref, get, child } from "firebase/database";
import { db } from "../../config/fb"; // Asegúrate de ajustar la ruta según tu proyecto

/**
 * Función para verificar si un número de registro de clínica ya existe en Firebase.
 * @param {string} registro - Número de registro de la clínica a verificar.
 * @returns {Promise<boolean>} - Retorna true si el registro existe, false si no existe.
 */
const verificarRegistroClinica = async (registro) => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `clinica/${registro}`));

    if (snapshot.exists()) {
      // Si el número de registro ya existe, retorna true
      return true;
    } else {
      // Si el número de registro no existe, retorna false
      return false;
    }
  } catch (error) {
    console.error("Error al verificar el número de registro:", error);
    throw error; // Lanza el error para manejarlo en el flujo donde se use
  }
};

export default verificarRegistroClinica;
