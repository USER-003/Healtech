import { db } from "../../config/fb";
import { ref, update, set, remove, push } from "firebase/database";

// Función para gestionar (actualizar, agregar o eliminar) datos del paciente
const managePacientAccount = async (
  uid,
  dataToUpdate = {}, // Objeto con los datos a actualizar o agregar
  chronicDiseases = [], // Arreglo con enfermedades crónicas (puede incluir modificaciones)
  hospitalizations = [], // Arreglo con hospitalizaciones previas (puede incluir modificaciones)
  surgeries = [], // Arreglo con cirugías previas (puede incluir modificaciones)
  options = { overwrite: false } // Opciones adicionales, como sobrescribir completamente los arreglos
) => {
  try {
    const patientRef = ref(db, `paciente/${uid}`);

    // Actualiza o sobrescribe datos básicos del nodo principal
    if (Object.keys(dataToUpdate).length > 0) {
      await update(patientRef, dataToUpdate);
    }

    // Helper para manejar nodos individuales
    const manageNode = async (refPath, items, options) => {
      const nodeRef = ref(db, refPath);

      if (options.overwrite) {
        // Sobrescribe el nodo completo
        await set(nodeRef, null);
        const promises = items.map((item) => push(nodeRef, item));
        await Promise.all(promises);
      } else {
        // Manejo individual (agregar, actualizar, eliminar)
        const promises = items.map(async (item) => {
          if (item.key && item.action === "delete") {
            // Eliminar un item existente
            const itemToDeleteRef = ref(db, `${refPath}/${item.key}`);
            return remove(itemToDeleteRef);
          } else if (item.key) {
            // Actualizar un item existente
            const itemToUpdateRef = ref(db, `${refPath}/${item.key}`);
            return update(itemToUpdateRef, item);
          } else {
            // Agregar un nuevo item
            return push(nodeRef, item);
          }
        });
        await Promise.all(promises);
      }
    };

    // Gestiona enfermedades crónicas
    if (chronicDiseases.length > 0) {
      await manageNode(
        `paciente/${uid}/historia_clinica/enf_cron`,
        chronicDiseases,
        options
      );
    }

    // Gestiona hospitalizaciones previas
    if (hospitalizations.length > 0) {
      await manageNode(
        `paciente/${uid}/historia_clinica/hosp_prev`,
        hospitalizations,
        options
      );
    }

    // Gestiona cirugías anteriores
    if (surgeries.length > 0) {
      await manageNode(
        `paciente/${uid}/historia_clinica/int_quir`,
        surgeries,
        options
      );
    }

    console.log("Gestión de datos completada exitosamente.");
    return "Datos gestionados exitosamente.";
  } catch (error) {
    console.error("Error al gestionar los datos del paciente:", error);
    throw error;
  }
};

export default managePacientAccount;
