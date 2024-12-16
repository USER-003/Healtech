import { db } from '../../config/fb';
import { ref, set } from "firebase/database";

/**
 * Función para agregar una referencia de la clínica al nodo del administrador en la base de datos de Firebase.
 * @param {string} uid - UID del administrador.
 * @param {string} registroClinica - Número de registro de la clínica.
 * @returns {Promise<void>} - Promesa que se resuelve cuando la operación es exitosa.
 */
const agregarReferenciaClinica = (uid, registroClinica) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Referencia a la ubicación admin/{uid}/clinica/{registroClinica}
      const clinicaRef = ref(db, `admin/${uid}/clinica/${registroClinica}`);

      // Establecer el valor del nodo como true para referenciar la clínica
      await set(clinicaRef, true);

      resolve("Referencia a la clínica creada exitosamente en el nodo del admin.");
    } catch (error) {
      console.error("Error al agregar la referencia de la clínica:", error);
      reject(error);
    }
  });
};

export default agregarReferenciaClinica;
