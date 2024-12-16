import { ref, set, remove } from "firebase/database";
import { db } from "../../../config/fb";

// Función para generar un código de 4 dígitos
const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000); // Genera un número aleatorio de 4 dígitos
};

const generateAccessCode = async (uid) => {
  try {
    const code = generateCode();
    const codeRef = ref(db, `paciente/${uid}/codigo`);

    // Crea el nodo con el código
    await set(codeRef, {
      valor: code,
      timestamp: Date.now(),
    });

    console.log(`Código generado para el paciente ${uid}: ${code}`);

    // Programar la eliminación automática después de 15 minutos
    setTimeout(async () => {
      try {
        await remove(codeRef);
        console.log(`Código temporal para el paciente ${uid} eliminado automáticamente.`);
      } catch (error) {
        console.error(`Error al eliminar el código para el paciente ${uid}:`, error);
      }
    }, 10 * 60 * 1000); // 10 minutos

    return code;
  } catch (error) {
    console.error("Error al generar el código temporal:", error);
    throw error;
  }
};

export default generateAccessCode;
