import { ref, get, remove } from "firebase/database";
import { db } from "../../../config/fb";
import registrarLogSistema from '../../general/setLog';

const compareAndDeleteAccessCode = async (uid, inputCode) => {
  try {
    const codeRef = ref(db, `paciente/${uid}/codigo`);

    // Lee el código del nodo
    const snapshot = await get(codeRef);
    if (snapshot.exists()) {
      const { valor } = snapshot.val();

      // Compara el código proporcionado con el almacenado
      const isMatch = parseInt(inputCode, 10) === parseInt(valor, 10);

      if (isMatch) {
        // Elimina el nodo después de la comparación exitosa
        await remove(codeRef);
        console.log(`Código para el paciente ${uid} eliminado tras validación exitosa.`);

        // Registrar log de acceso exitoso
        await registrarLogSistema(
          `Acceso autorizado para el paciente ${uid}`,
          "Códigos de acceso",
          "éxito"
        );
      } else {
        console.log(`Código proporcionado para el paciente ${uid} es incorrecto.`);
        
        // Registrar log de intento fallido
        await registrarLogSistema(
          `Intento fallido de acceso para el paciente ${uid}`,
          "Códigos de acceso",
          "fracaso"
        );
      }

      return isMatch; // Devuelve true si coinciden, false en caso contrario
    } else {
      console.log(`No se encontró un código para el paciente ${uid}.`);
      
      // Registrar log de intento fallido por ausencia de código
      await registrarLogSistema(
        `Intento fallido de acceso para el paciente ${uid} (código no encontrado)`,
        "Códigos de acceso",
        "fracaso"
      );
      
      return false; // Si no hay código, devuelve false
    }
  } catch (error) {
    console.error(`Error al comparar/eliminar el código para el paciente ${uid}:`, error);

    // Registrar log de error en la operación
    await registrarLogSistema(
      `Error al procesar el acceso del paciente ${uid}: ${error.message}`,
      "Códigos de acceso",
      "error"
    );
    
    throw error;
  }
};

export default compareAndDeleteAccessCode;
