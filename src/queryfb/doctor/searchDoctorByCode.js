import { db } from '../../config/fb';
import { ref, get } from "firebase/database";

// Función para buscar un médico por DUI en el nodo 'doctor'
const searchDoctorByCode = (dui) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doctorRef = ref(db, "doctor");
            const snapshot = await get(doctorRef);
            
            if (snapshot.exists()) {
                const doctors = snapshot.val();
                
                // Recorre todos los médicos y busca el que coincida con el DUI
                for (const uid in doctors) {
                    const doctor = doctors[uid];
                    
                    if (doctor.dui === dui) {
                        resolve({ uid, ...doctor }); // Retorna el nodo completo del médico junto con el UID
                        return;
                    }
                }

                // Si no se encuentra el médico
                resolve(null); 
            } else {
                resolve(null); // No hay médicos en la base de datos
            }
        } catch (error) {
            console.error("Error al buscar médico:", error);
            reject(error);
        }
    });
};

export default searchDoctorByCode;
