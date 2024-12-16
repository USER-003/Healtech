import { db } from '../../config/fb';
import { ref, push, set } from "firebase/database";
import obtenerRegistroClinicaAsociada from '../admin/getRegistroClinica';
import { getAuth } from "firebase/auth";
import getUserInfo from '../admin/getUserInfo';

/**
 * Función para registrar logs de sistema en la base de datos de Firebase.
 * Crea nodos adicionales dentro de cada log para almacenar el UID del usuario y el registro de la clínica.
 * @param {string} accion - Descripción de la acción realizada.
 * @param {string} moduloAfectado - Módulo del sistema afectado por la acción.
 * @param {string} resultado - Resultado de la acción (éxito o fracaso).
 * @returns {Promise<void>} - Promesa que se resuelve cuando la operación es exitosa.
 */
const registrarLogSistema = (accion, moduloAfectado, resultado) => {
  return new Promise(async (resolve, reject) => {
    const auth = getAuth();
    const userUID = auth.currentUser.uid;
    try {
      // Obtener el registro de la clínica asociada al usuario
      const registroClinica = await obtenerRegistroClinicaAsociada(userUID);
      if (!registroClinica) {
        throw new Error("No se encontró una clínica asociada al usuario.");
      }

      // Obtener el nombre del usuario usando getUserInfo
      const userInfo = await getUserInfo(userUID);
      const userName = userInfo?.nombre || "Usuario desconocido"; // Si no se encuentra el nombre, asignar "Usuario desconocido"

      const logsRef = ref(db, "logs/");

      // Obtener la fecha y hora actual
      const fechaActual = new Date();
      const hora = fechaActual.toLocaleTimeString(); // Hora en formato local
      const fecha = fechaActual.toLocaleDateString(); // Fecha en formato local

      // Crear el objeto del log con los nuevos campos, incluyendo el registro de la clínica y el nombre del usuario
      const nuevoLog = {
        accion,
        moduloAfectado,    // Módulo del sistema afectado
        resultado,         // Resultado de la acción: "éxito" o "fracaso"
        fecha,             // "DD/MM/YYYY"
        hora,              // "HH:MM:SS AM/PM"
        registroClinica,   // Número de registro de la clínica
        usuario: { nombre: userName }, // Incluye el UID y el nombre del usuario
        timestamp: fechaActual.getTime()  // Marca de tiempo UNIX para ordenación si es necesario
      };

      // Guardar el log en Firebase con push() para generar una clave única
      const logRef = await push(logsRef, nuevoLog);

      // Crear nodos adicionales dentro del log para usuario y clínica
      await set(ref(db, `logs/${logRef.key}/usuario/${userUID}`), true); // Nodo de usuario con UID
      await set(ref(db, `logs/${logRef.key}/clinica/${registroClinica}`), true); // Nodo de clínica con el registro de la clínica

      // Añadir una referencia del log en el nodo `clinica/{registroClinica}/logs`
      const clinicaLogRef = ref(db, `clinica/${registroClinica}/logs/${logRef.key}`);
      await set(clinicaLogRef, true); // Guardar el identificador del log con valor true

      resolve("Log registrado exitosamente con referencias en nodos adicionales y en clínica.");
    } catch (error) {
      console.error("Error al registrar el log:", error);
      reject(error);
    }
  });
};

export default registrarLogSistema;