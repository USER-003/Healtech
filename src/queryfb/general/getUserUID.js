import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

const getUserUID = () => {
  const [userUID, setUserUID] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    // Verifica el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);  // Asigna el UID del usuario autenticado
      } else {
        setUserUID(null);  // Si no hay usuario autenticado, deja UID como null
      }
    });

    return () => unsubscribe();
  }, []);

  return userUID;
};

export default getUserUID;
