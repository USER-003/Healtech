import { db } from "../../config/fb";
import { ref, get } from "firebase/database";

/**
 * Busca el UID de un paciente utilizando su DUI.
 * @param {string} identificacion - El DUI del paciente.
 * @returns {Promise<string | null>} - El UID del paciente o `null` si no se encuentra.
 */
const searchPatientUIDByDUI = async (identificacion) => {
  try {
    const patientRef = ref(db, "paciente");
    const snapshot = await get(patientRef);

    if (snapshot.exists()) {
      const patients = snapshot.val();

      // Recorrer los pacientes para buscar el identificacion coincidente
      for (const uid in patients) {
        if (patients[uid]?.identificacion === identificacion) {
          console.log(`UID encontrado para el DUI ${identificacion}: ${uid}`);
          return uid; // Retorna el UID si se encuentra
        }
      }

      console.log(`No se encontró un paciente con el DUI: ${identificacion}`);
      return null; // No se encontró el DUI
    } else {
      console.log("No hay pacientes registrados en la base de datos.");
      return null; // No hay pacientes en la base de datos
    }
  } catch (error) {
    console.error("Error al buscar el UID del paciente:", error);
    throw error;
  }
};

export default searchPatientUIDByDUI;
