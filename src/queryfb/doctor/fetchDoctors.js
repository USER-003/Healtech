import { ref, get } from "firebase/database";
import { db } from '../../config/fb'; // Configuración de Firebase
import obtenerRegistroClinicaAsociada from "../admin/getRegistroClinica";
import { getAuth } from "firebase/auth";


// Función para obtener los doctores filtrados por clínica asociada
export const fetchDoctors = async () => {
  try {
    const auth = getAuth();
    const userUID = auth.currentUser.uid;
    const registroClinica = await obtenerRegistroClinicaAsociada(userUID); // Registro de clínica asociada al usuario actual

    if (!registroClinica) {
      console.log("No se encontró el registro de la clínica asociada");
      return null;
    }

    const doctorsRef = ref(db, "doctor");
    const snapshot = await get(doctorsRef);

    if (snapshot.exists()) {
      const allDoctors = snapshot.val();

      // Filtramos los doctores que tienen el mismo registro de clínica
      const filteredDoctors = Object.keys(allDoctors)
        .filter((doctorId) => {
          const doctor = allDoctors[doctorId];
          return doctor.clinica && doctor.clinica[registroClinica]; // Comprobamos si el registro de la clínica coincide
        })
        .reduce((result, doctorId) => {
          result[doctorId] = allDoctors[doctorId];
          return result;
        }, {});

      console.log("Doctores filtrados:", filteredDoctors);
      return filteredDoctors; // Retorna solo los doctores filtrados
    } else {
      console.log("No se encontraron doctores");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener doctores:", error);
    throw error; // Si hay un error, lo lanzamos para manejarlo en la llamada
  }
};
