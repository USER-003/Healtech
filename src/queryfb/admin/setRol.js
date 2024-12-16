// src/queryfb/admin/crearRol.js
import { db } from '../../config/fb';
import { ref, push } from "firebase/database";
import registrarLogSistema from '../general/setLog';

/**
 * Función para crear un rol en la base de datos de Firebase.
 * @param {string} registro - Número de registro de la clínica.
 * @param {string} nombre - Nombre del rol.
 * @param {string} descripcion - Descripción del rol.
 * @returns {Promise<void>} - Promesa que se resuelve cuando la operación es exitosa.
 */
const crearRol = async (registro, nombre, descripcion) => {
  try {
    // Referencia al nodo roles dentro de clinica/{registro}
    const rolesRef = ref(db, `clinica/${registro}/roles`);
    
    // Crear el objeto del rol con un ID generado automáticamente
    const nuevoRol = {
      nombre,
      descripcion,
      fechaCreacion: new Date().toLocaleDateString(), // Fecha en formato local
    };

    // Guardar el rol en Firebase con push() para generar una clave única
    await push(rolesRef, nuevoRol);

    // Log: Intentar registrar el log de la acción
    try {
        await registrarLogSistema("Se crea rol", "Roles del sistema", "exito");
        console.log("Log del sistema registrado exitosamente.");
    } catch (logError) {
        console.error("Error al registrar el log del sistema:", logError);
    }
    console.log("Rol creado exitosamente.");
  } catch (error) {
    try {
      await registrarLogSistema("Se crea rol", "Roles del sistema", "fallo");
      console.log("Log del sistema registrado exitosamente.");
  } catch (logError) {
      console.error("Error al registrar el log del sistema:", logError);
  }
    console.error("Error al crear el rol:", error);
    throw error;
  }
};

export default crearRol;
