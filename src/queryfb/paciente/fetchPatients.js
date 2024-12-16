import { ref, get } from "firebase/database";
import { db } from '../../config/fb'; // Asegúrate de que este sea el archivo correcto de configuración de Firebase

// Función para obtener todos los pacientes del nodo 'paciente'
export const fetchPatients = async () => {
  try {
    const patientsRef = ref(db, "paciente");
    const snapshot = await get(patientsRef);
    
    if (snapshot.exists()) {
      return snapshot.val(); // Retorna todos los pacientes
    } else {
      console.log("No se encontraron pacientes");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    throw error; // Si hay un error, lo lanzamos para manejarlo en la llamada
  }
};
