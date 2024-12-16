import { db } from '../../config/fb';
import { set, ref, push } from "firebase/database";
import registrarLogSistema from '../general/setLog';
import searchPatientByCode from './searchPatientByCode'; // Asegúrate de tener esta función implementada y exportada
import getClinicaFromDoctorUID from '../doctor/getClinicaDoctor';

/**
 * Función para guardar la receta médica de un paciente y asociarla con la clínica.
 * @param {string} searchType - Tipo de búsqueda para encontrar al paciente.
 * @param {string} searchValue - Valor de búsqueda para encontrar al paciente.
 * @param {string} nombre_doctor - Nombre del doctor que realiza la receta.
 * @param {string} numero_doctor - Número del doctor que realiza la receta.
 * @param {string} diagnostico - Diagnóstico del paciente.
 * @param {Array} medicamentos - Array de medicamentos.
 * @param {string} doctorUID - UID del doctor que realiza la receta.
 * @returns {Promise<string>} - Promesa que se resuelve cuando la operación es exitosa.
 */
const setPatientPrescription = async (searchType, searchValue, nombre_doctor, numero_doctor, diagnostico, medicamentos, doctorUID) => {
    let recetaId; // Definir recetaId fuera del bloque try para que esté disponible en el catch 0108
    let uid; // Definir uid fuera del try para que esté disponible en el catch 0108
    try {
        // Buscar el UID del paciente con la función `searchPatientByCode`
        const pacienteData = await searchPatientByCode(searchType, searchValue);
        
        if (!pacienteData) {
            throw new Error('Paciente no encontrado');
        }
        
        uid = pacienteData.uid; // Obtener el UID del paciente

        // Obtener el registro de la clínica asociada al doctor
        const registroClinica = await getClinicaFromDoctorUID(doctorUID);
        
        // Referencia al nodo de recetas del paciente
        const recetaRef = ref(db, `paciente/${uid}/Recetas`);
        const nuevaRecetaRef = push(recetaRef); // Crear un nuevo nodo de receta
        
        // Función para obtener la fecha y hora actual en formato dd/mm/yyyy y hh:mm:ss
        const obtenerFechaYHoraActual = () => {
            const fechaActual = new Date();
            const dia = String(fechaActual.getDate()).padStart(2, '0');
            const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
            const anio = fechaActual.getFullYear();
            const hora = String(fechaActual.getHours()).padStart(2, '0');
            const minutos = String(fechaActual.getMinutes()).padStart(2, '0');
            const segundos = String(fechaActual.getSeconds()).padStart(2, '0');
            return {
                fecha: `${dia}/${mes}/${anio}`,
                hora: `${hora}:${minutos}:${segundos}`
            };
        };

        // Transformar el array de medicamentos a un objeto con nombres de medicamentos como claves
        const medicamentosObj = {};
        medicamentos.forEach(medicamento => {
        const medicamentoId = `${medicamento.nombre_medicamento}_${Date.now()}`; // Genera un ID único para cada medicamento 0108
            medicamentosObj[medicamento.nombre_medicamento] = {
                nombre_medicamento: medicamento.nombre_medicamento,
                medicamentoId: medicamentoId, // ID único del medicamento 0108
                duracion_tratamiento: medicamento.duracion_tratamiento,
                frecuencia_administracion: {
                    cada: medicamento.frecuencia_administracion.cada,
                    dosis: medicamento.frecuencia_administracion.dosis,
                    tiempo: medicamento.frecuencia_administracion.tiempo
                },
                informacion_adicional: medicamento.informacion_adicional,
                via_administracion: medicamento.via_administracion
    };
});
        
        // Obtener el ID generado por push()
        recetaId = nuevaRecetaRef.key;
        const { fecha, hora } = obtenerFechaYHoraActual();

        // Establecer los datos de la receta, incluyendo el campo "id"
        await set(nuevaRecetaRef, {
            id: recetaId,
            nombre_doctor: nombre_doctor || 'Indeterminado',
            numero_doctor: numero_doctor || 'Indeterminado',
            diagnostico: diagnostico || 'Indeterminado',
            fecha_emision: fecha,
            hora_emision: hora,
            diasTratamiento: 0,
            medicamentos: medicamentosObj || {} // Agregar el objeto de medicamentos aquí
        });

        // Guardar la referencia de la receta en el nodo de la clínica, incluyendo la fecha y hora de emisión
        const clinicaRecetaRef = ref(db, `clinica/${registroClinica}/recetas/${recetaId}`);
        await set(clinicaRecetaRef, {
            activo: true,
            fecha_creacion: fecha,
            hora_creacion: hora
        });

        // Registrar un log de la creación de la receta en la clínica asociada
        const accion = `Creación de receta (ID: ${recetaId}) para el paciente ${uid} realizada por el doctor ${nombre_doctor}`;
        try {
          await registrarLogSistema(accion, "Panel Medico", "exito");
          console.log("Log del sistema registrado exitosamente.");
        } catch (logError) {
            console.error("Error al registrar el log del sistema:", logError);
        }
        return 'Receta enviada exitosamente y registrada en la clínica';
    } catch (error) {

        const accion = `Creación de receta (ID: ${recetaId}) para el paciente ${uid} realizada por el doctor ${nombre_doctor}`;
        try {
          await registrarLogSistema(accion, "Panel Medico", "fallo");
          console.log("Log del sistema registrado exitosamente.");
        } catch (logError) {
            console.error("Error al registrar el log del sistema:", logError);
        }

        console.error('Error al enviar la receta:', error);
        throw error;
    }
}

export default setPatientPrescription;
