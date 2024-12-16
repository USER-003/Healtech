import { db } from "../../config/fb";
import { ref, set, push, child } from "firebase/database";
import registrarLogSistema from '../general/setLog'; // Importa la función para registrar logs
import obtenerRegistroClinica from '../admin/getRegistroClinica'; // Importa la función para obtener el registro de la clínica asociada

const setPacientAccount = async (
  adminUID,
  uid,
  nombre,
  expediente,
  identificacion,
  esMenor,
  direccion,
  telefono,
  email,
  nacionalidad,
  peso,
  altura,
  tipoSangre,
  alergias = "",
  medicamentosCronicos = "",
  antecedentesFamiliares = "",
  enfermedadesCronicas = [],
  cirugiasAnteriores = [],
  hospitalizacionesPrevias = [],
  fechaNacimiento,
  sexo
) => {
  try {
    const patientRef = ref(db, "paciente/" + uid);

    // Convierte las cadenas separadas por comas en arrays
    const alergiasArray = alergias.split(',').map(item => item.trim()); // Separa y elimina espacios
    const medicamentosArray = medicamentosCronicos.split(',').map(item => item.trim());
    const antecedentesArray = antecedentesFamiliares.split(',').map(item => item.trim());

    // Almacena los datos de salud en un nodo interno como listas
    const healthData = {
      altura: `${altura}`,
      peso: `${peso}`,
      tipo_sangre: tipoSangre,
      alergias: alergiasArray,
      medicamentos_cronicos: medicamentosArray,
      antecedentes_familiares: antecedentesArray,
    };

    // Crea el nodo principal del paciente
    await set(patientRef, {
      nombre,
      expediente,
      identificacion,
      es_menor: esMenor,
      direccion,
      telefono,
      email,
      nacionalidad,
      nacimiento: fechaNacimiento,
      sexo,
      rol: "paciente", // Se agrega el rol por defecto
      datos_salud: healthData,
    });

    // Almacena las enfermedades crónicas
    const chronicDiseasesRef = child(patientRef, "historia_clinica/enf_cron");
    enfermedadesCronicas.forEach((enfermedad) => {
      const newChronicDiseaseRef = push(chronicDiseasesRef);
      set(newChronicDiseaseRef, { enfermedad });
    });

    // Almacena las hospitalizaciones previas
    const previousHospitalizationsRef = child(
      patientRef,
      "historia_clinica/hosp_prev"
    );

    hospitalizacionesPrevias.forEach((hospitalizacion) => {
      const newHospitalizationRef = push(previousHospitalizationsRef);
      set(newHospitalizationRef, {
        razon: hospitalizacion.razon,
        fecha_ingreso: hospitalizacion.fechaIngreso,
        fecha_alta: hospitalizacion.fechaAlta,
      });
    });

    // Almacena las cirugías anteriores
    const previousSurgeriesRef = child(
      patientRef,
      "historia_clinica/int_quir"
    );
    cirugiasAnteriores.forEach((cirugia) => {
      const newSurgeryRef = push(previousSurgeriesRef);
      set(newSurgeryRef, {
        razon: cirugia.razon,
        fecha_ingreso: cirugia.fechaIngreso,
        fecha_alta: cirugia.fechaAlta,
      });
    });

    // Obtiene el registro de la clínica asociada
    const registroClinica = await obtenerRegistroClinica(adminUID);
    if (!registroClinica) {
      throw new Error("No se encontró la clínica asociada para el administrador.");
    }

    // Obtener la fecha actual en formato "DD/MM/YYYY"
    const fechaCreacion = new Date().toLocaleDateString("es-ES");

    // Agregar el UID del paciente y la fecha de creación en el nodo dentro de la clínica asociada
    const clinicaPacientesRef = ref(db, `clinica/${registroClinica}/pacientes/${uid}`);
    await set(clinicaPacientesRef, {
      activo: true,  // Puedes usar esta propiedad para otras necesidades
      fecha_creacion: fechaCreacion // Guardar la fecha de creación
    });

    // Registrar log de la creación del paciente
    const accion = `Creación de cuenta para el paciente ${nombre} (UID: ${uid})`;
    try {
      await registrarLogSistema(accion, "Pacientes", "exito");
      console.log("Log del sistema registrado exitosamente.");
    } catch (logError) {
        console.error("Error al registrar el log del sistema:", logError);
    }
    
    return "Cuenta de paciente creada exitosamente con log registrado.";
  } catch (error) {
    const accion = `Creación de cuenta para el paciente ${nombre} (UID: ${uid})`;
    try {
      await registrarLogSistema(accion, "Pacientes", "fallo");
      console.log("Log del sistema registrado exitosamente.");
    } catch (logError) {
        console.error("Error al registrar el log del sistema:", logError);
    }
    console.error("Error al establecer la cuenta del paciente:", error);
    throw error;
  }
};

export default setPacientAccount;
