import { db } from '../../config/fb';
import { ref, get } from "firebase/database";

// Función para buscar un paciente por expediente o identificación en el nodo 'paciente'
const searchPatientByType = (searchType, searchValue) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pacienteRef = ref(db, "paciente");
            const snapshot = await get(pacienteRef);
            
            if (snapshot.exists()) {
                const patients = snapshot.val();
                
                // Recorre todos los pacientes y busca dependiendo del tipo de búsqueda
                for (const uid in patients) {
                    const paciente = patients[uid];
                    
                    // Verifica el tipo de búsqueda y realiza la búsqueda
                    if (searchType === 'DUI' && paciente.identificacion === searchValue) {
                        resolve({ uid, ...paciente }); // Retorna el nodo completo del paciente junto con el UID
                        return;
                    }

                    if (searchType === 'EXP' && paciente.expediente === searchValue) {
                        resolve({ uid, ...paciente }); // Retorna el nodo completo del paciente junto con el UID
                        return;
                    }
                }

                // Si no se encuentra el paciente
                resolve(null); 
            } else {
                resolve(null); // No hay pacientes en la base de datos
            }
        } catch (error) {
            console.error("Error al buscar paciente:", error);
            reject(error);
        }
    });
};

export default searchPatientByType;
