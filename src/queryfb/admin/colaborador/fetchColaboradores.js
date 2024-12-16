import { ref, get } from "firebase/database";
import { db } from "../../../config/fb";
import obtenerRegistroClinicaAsociada from "../../admin/getRegistroClinica"; // Para obtener el registro de la clínica asociada
import { getAuth } from "firebase/auth";

// Función para obtener colaboradores filtrados por la clínica asociada
export const fetchCollaborators = async () => {
  try {
    const auth = getAuth();
    const userUID = auth.currentUser.uid;
    const registroClinica = await obtenerRegistroClinicaAsociada(userUID); // Obtenemos el registro de la clínica asociada

    if (!registroClinica) {
      console.log("No se encontró el registro de la clínica asociada");
      return null;
    }

    const collaboratorsRef = ref(db, "colaboradores");
    const snapshot = await get(collaboratorsRef);

    if (snapshot.exists()) {
      const allCollaborators = snapshot.val();

      // Filtrar colaboradores que tengan el mismo registro de clínica
      const filteredCollaborators = Object.keys(allCollaborators)
        .filter((collaboratorId) => {
          const collaborator = allCollaborators[collaboratorId];
          return collaborator.clinica && collaborator.clinica[registroClinica]; // Verifica si la clínica coincide
        })
        .reduce((result, collaboratorId) => {
          result[collaboratorId] = allCollaborators[collaboratorId];
          return result;
        }, {});

      console.log("Colaboradores filtrados:", filteredCollaborators);
      return filteredCollaborators; // Retorna los colaboradores filtrados
    } else {
      console.log("No se encontraron colaboradores");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener colaboradores:", error);
    throw error; // Si hay un error, lo lanzamos para manejarlo en la llamada
  }
};
