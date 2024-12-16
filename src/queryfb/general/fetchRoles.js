import { ref, get } from "firebase/database";
import { db } from '../../config/fb'; // Asegúrate de que este sea el archivo correcto de configuración de Firebase

// Función para obtener todos los doctor del nodo 'doctor'
export const fetchRoles = async (registro) => {
  try {
    const rolesRef = ref(db, "clinica/" + registro + "/roles");
    const snapshot = await get(rolesRef);
    
    if (snapshot.exists()) {

      return snapshot.val(); // Retorna todos los roles
    } else {
      console.log("No se encontraron roles");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener roles:", error);
    throw error; // Si hay un error, lo lanzamos para manejarlo en la llamada
  }
};
