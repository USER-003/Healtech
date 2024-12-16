import { ref, get, child } from "firebase/database";
import { db } from "../../../config/fb";
/**
 * Función para obtener los permisos de un colaborador mediante su UID.
 * @param {string} colaboradorUID - UID del colaborador.
 * @returns {Promise<Object>} - Promesa que devuelve los datos de los permisos.
 */
const getPermisosFromColaboradorUID = async (colaboradorUID) => {
  try {
    // Referencia al nodo del colaborador
    const colaboradorRef = ref(db, `colaboradores/${colaboradorUID}`);
    const colaboradorSnapshot = await get(colaboradorRef);

    console.log(colaboradorSnapshot.val())
    if (!colaboradorSnapshot.exists()) {
      throw new Error("Colaborador no encontrado.");
    }

    // Extraer el UID del rol de permisos asociado al colaborador
    const { permisos, clinica } = colaboradorSnapshot.val();
    const permisosUID = Object.keys(permisos)[0]; // Obtener el UID del rol de permisos
    const clinicaRegistro = Object.keys(clinica)[0]; // Obtener el registro de la clínica
    console.log(permisos, clinica)
    
    if (!permisosUID || !clinicaRegistro) {
      throw new Error("No se encontraron permisos o clínica asociados a este colaborador.");
    }


    // Referencia al nodo de permisos en el rol dentro de la clínica
    const permisosRef = ref(db, `clinica/${clinicaRegistro}/roles/${permisosUID}/permisos`);
    const permisosSnapshot = await get(permisosRef);

    console.log(permisosSnapshot.val())

    if (!permisosSnapshot.exists()) {
      throw new Error("Permisos no encontrados en el nodo de roles de la clínica.");
    }

    return permisosSnapshot.val(); // Retorna los datos del nodo de permisos
  } catch (error) {
    console.error("Error al obtener los permisos del colaborador:", error);
    throw error;
  }
};

export default getPermisosFromColaboradorUID;
