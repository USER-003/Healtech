import { ref, update } from "firebase/database";
import { db } from "../../config/fb"; 
import registrarLogSistema from "../general/setLog";

const actualizarRol = async (registroClinica, rolId, nombre, descripcion) => {
  try {
    const rolRef = ref(db, `clinica/${registroClinica}/roles/${rolId}`);
    await update(rolRef, { nombre, descripcion });
     // Log: Intentar registrar el log de la acción
     try {
      await registrarLogSistema("Se actualiza información del rol", "Roles del sistema", "exito");
      console.log("Log del sistema registrado exitosamente.");
     } catch (logError) {
         console.error("Error al registrar el log del sistema:", logError);
     }
    console.log("Rol actualizado exitosamente.");
  } catch (error) {
    try {
      await registrarLogSistema("Se actualiza información del rol", "Roles del sistema", "fallo");
      console.log("Log del sistema registrado exitosamente.");
     } catch (logError) {
         console.error("Error al registrar el log del sistema:", logError);
     }
    console.error("Error al actualizar el rol:", error);
    throw error;
  }
};

export default actualizarRol;
