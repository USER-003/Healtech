import { db } from "../../../config/fb";
import { ref, get } from "firebase/database";
import obtenerRegistroClinicaAsociada from '../getRegistroClinica';

// Función de formato de fecha para ignorar la hora
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`; // Formato yyyy-mm-dd
};

// Función para contar médicos
const contarMedicos = async (adminUID, fechaInicio, fechaFin) => {
  try {
    const registroClinica = await obtenerRegistroClinicaAsociada(adminUID);
    const medicosRef = ref(db, `clinica/${registroClinica}/medicos`);
    const snapshot = await get(medicosRef);

    if (!snapshot.exists()) {
      return 0; // No hay médicos registrados
    }

    const medicos = snapshot.val();
    const medicosFiltrados = Object.values(medicos).filter((medico) => {
      if (!medico.fecha_creacion) return false;
      
      const fechaRegistro = formatDate(new Date(medico.fecha_creacion.split("/").reverse().join("-")));
      return (!fechaInicio || fechaRegistro >= fechaInicio) && (!fechaFin || fechaRegistro <= fechaFin);
    });

    return medicosFiltrados.length;
  } catch (error) {
    console.error("Error al contar médicos:", error);
    throw error;
  }
};

// Función para contar pacientes
const contarPacientes = async (adminUID, fechaInicio, fechaFin) => {
  try {
    const registroClinica = await obtenerRegistroClinicaAsociada(adminUID);
    const pacientesRef = ref(db, `clinica/${registroClinica}/pacientes`);
    const snapshot = await get(pacientesRef);

    if (!snapshot.exists()) {
      return 0; // No hay pacientes registrados
    }

    const pacientes = snapshot.val();
    const pacientesFiltrados = Object.values(pacientes).filter((paciente) => {
      if (!paciente.fecha_creacion) return false;
      
      const fechaRegistro = formatDate(new Date(paciente.fecha_creacion.split("/").reverse().join("-")));
      return (!fechaInicio || fechaRegistro >= fechaInicio) && (!fechaFin || fechaRegistro <= fechaFin);
    });

    return pacientesFiltrados.length;
  } catch (error) {
    console.error("Error al contar pacientes:", error);
    throw error;
  }
};

// Función para contar recetas
const contarRecetas = async (adminUID, fechaInicio, fechaFin) => {
  try {
    const registroClinica = await obtenerRegistroClinicaAsociada(adminUID);
    const recetasRef = ref(db, `clinica/${registroClinica}/recetas`);
    const snapshot = await get(recetasRef);

    if (!snapshot.exists()) {
      return 0; // No hay recetas registradas
    }

    const recetas = snapshot.val();
    const recetasFiltradas = Object.values(recetas).filter((receta) => {
      if (!receta.fecha_creacion) return false;
      
      const fechaRegistro = formatDate(new Date(receta.fecha_creacion.split("/").reverse().join("-")));
      return (!fechaInicio || fechaRegistro >= fechaInicio) && (!fechaFin || fechaRegistro <= fechaFin);
    });

    return recetasFiltradas.length;
  } catch (error) {
    console.error("Error al contar recetas:", error);
    throw error;
  }
};

export { contarMedicos, contarPacientes, contarRecetas };
