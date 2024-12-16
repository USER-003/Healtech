import { db } from '../../config/fb';
import { ref, get, update } from "firebase/database";

// Función auxiliar para formatear el número con 7 dígitos
const formatNumberToSevenDigits = (number) => {
    return String(number).padStart(7, '0'); // Convierte el número a cadena y lo rellena con ceros a la izquierda
};

// Función para obtener el número actual de expediente sin incrementarlo
const getExpedienteNumber = async () => {
    try {
        const expedienteRef = ref(db, 'contadorExpedientes/numero');
        const snapshot = await get(expedienteRef);
        if (snapshot.exists()) {
            const currentNumber = snapshot.val();
            return formatNumberToSevenDigits(currentNumber + 1); // Devuelve el número formateado
        } else {
            throw new Error("No existe el número de expediente");
        }
    } catch (error) {
        console.error("Error obteniendo el número de expediente:", error);
        throw error;
    }
};

// Función para incrementar el número de expediente al confirmar el registro
const incrementExpedienteNumber = async () => {
    try {
        const expedienteRef = ref(db, 'contadorExpedientes');
        const snapshot = await get(expedienteRef);
        if (snapshot.exists()) {
            const currentNumber = snapshot.val().numero;
            const nextNumber = currentNumber + 1;
            await update(expedienteRef, { numero: nextNumber });
            return formatNumberToSevenDigits(nextNumber); // Devuelve el número formateado
        } else {
            throw new Error("No existe el número de expediente");
        }
    } catch (error) {
        console.error("Error incrementando el número de expediente:", error);
        throw error;
    }
};

export { getExpedienteNumber, incrementExpedienteNumber };
