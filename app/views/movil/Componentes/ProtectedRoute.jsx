import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get, child } from "firebase/database";
import { db } from "../../../../src/config/fb";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";


// Expiración de la sesión en diferentes intervalos

// 1 minuto en milisegundos (para pruebas rápidas)
// const SESSION_TIMEOUT = 1 * 60 * 1000; // 1 minuto

// 5 minutos en milisegundos
 //const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutos

// 30 minutos en milisegundos (ideal para pruebas de mediana duración)
// const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

// 1 hora en milisegundos
 const SESSION_TIMEOUT = 1 * 60 * 60 * 1000; // 1 hora

// 4 horas en milisegundos (usado frecuentemente para sesiones medianas)
// const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 horas

// 8 horas en milisegundos (equivalente a una jornada laboral típica)
//const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 horas

// 12 horas en milisegundos (media jornada extendida)
// const SESSION_TIMEOUT = 12 * 60 * 60 * 1000; // 12 horas

// 24 horas en milisegundos (sesión de 1 día completo)
// const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 horas

const ProtectedRoute = ({ allowedRoles, children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const auth = getAuth();
  const router = useRouter();

  // Función para buscar el rol del usuario en los diferentes nodos
  const fetchUserRole = async (userUid) => {
    const dbRef = ref(db);

    let snapshot = await get(child(dbRef, `admin/${userUid}`));
    if (snapshot.exists()) return { role: "admin", data: snapshot.val() };

    snapshot = await get(child(dbRef, `doctor/${userUid}`));
    if (snapshot.exists()) return { role: "doctor", data: snapshot.val() };

    snapshot = await get(child(dbRef, `paciente/${userUid}`));
    if (snapshot.exists()) return { role: "paciente", data: snapshot.val() };

    return null;
  };

  // Verificar si la sesión ha expirado
  const checkSessionExpiration = async () => {
    try {
      const storedLoginTime = await AsyncStorage.getItem("loginTimeP");
      if (storedLoginTime) {
        const loginTime = JSON.parse(storedLoginTime);
        const currentTime = Date.now();

        // Verificar si han pasado más de 8 horas
        if (currentTime - loginTime > SESSION_TIMEOUT) {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: "¡Oops!",
            textBody: "Su session expiró, vuelva a iniciar Sesion.",
            button: "Ok",
            onPressButton: () => Dialog.hide(),
          });
          await signOut(auth); // Cerrar sesión si ha expirado
          router.replace("/views/movil/login/Login");
          return true;
        }
      }
    } catch (error) {
      console.error("Error al verificar la expiración de la sesión:", error);
    }
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verificar si la sesión ha expirado
        const isExpired = await checkSessionExpiration();
        if (isExpired) return; // Si la sesión expiró, salir

        try {
          const userInfo = await fetchUserRole(user.uid);
          if (userInfo) {
            const { role } = userInfo;
            setUserRole(role);

            if (!allowedRoles.includes(role)) {
              router.replace("/views/web/sesion/Desautorizado");
            }
          } else {
            router.replace("/views/movil/login/Login");
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario:", error);
        }
      } else {
        router.replace("/views/movil/login/Login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, allowedRoles, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
};

export default ProtectedRoute;
