import { db } from "../../config/fb";
import { ref, set } from "firebase/database";
import obtenerRegistroClinicaAsociada from "./getRegistroClinica";
import registrarLogSistema from "../general/setLog";

/**
 * Función para crear una cuenta de colaborador en la base de datos.
 * @param {string} adminUID - UID del administrador.
 * @param {string} uid - UID del colaborador creado.
 * @param {string} nombre - Nombre del colaborador.
 * @param {string} apellido - Apellido del colaborador.
 * @param {string} dui - DUI del colaborador.
 * @param {string} telefono - Teléfono del colaborador.
 * @param {string} direccion - Dirección del colaborador.
 * @param {string} cargo - Cargo del colaborador.
 * @param {string} email - Correo electrónico del colaborador.
 * @param {string} permisosUID - UID del rol del colaborador.
 * @param {string} status - Estado del colaborador (activo/inactivo).
 * @returns {Promise<void>}
 */
const setCollaboratorAccount = async (
  adminUID,
  uid,
  nombre,
  apellido,
  dui,
  telefono,
  direccion,
  cargo,
  email,
  permisosUID,
  status
) => {
  try {
    // Obtener el registro de la clínica asociada al administrador
    const registroClinica = await obtenerRegistroClinicaAsociada(adminUID);

    if (!registroClinica) {
      throw new Error("No se encontró ninguna clínica asociada para el administrador.");
    }
    
    if (!permisosUID) {
      throw new Error("No se proporcionó un UID de permisos válido.");
    }

    console.log("Registro de la clínica:", registroClinica);
    console.log("UID del colaborador:", uid);
    console.log("UID del rol/permisos:", permisosUID);

    // Crear nodo del colaborador en el nodo `colaboradores`
    const collaboratorRef = ref(db, `colaboradores/${uid}`);
    await set(collaboratorRef, {
      nombre,
      apellido,
      dui,
      telefono,
      direccion,
      cargo,
      email,
      rol: "colaborador",
      status,
      permisos: {
        [permisosUID]: true // Guardar el UID del rol con valor true
      },
      clinica: {
        [registroClinica]: true // Referencia a la clínica asociada
      }
    });

    // Crear referencia del colaborador en la clínica asociada
    const clinicaCollaboratorRef = ref(db, `clinica/${registroClinica}/colaboradores/${uid}`);
    await set(clinicaCollaboratorRef, true);

    try {
      await registrarLogSistema("Se crea cuenta de colaborador", "Roles del sistema", "exito");
      console.log("Log del sistema registrado exitosamente.");
    } catch (logError) {
        console.error("Error al registrar el log del sistema:", logError);
    }
    console.log("Cuenta de colaborador creada exitosamente.");
  } catch (error) {
    console.error("Error al guardar el colaborador:", error);
    throw error;
  }
};

export default setCollaboratorAccount;
