import React, { useState, useEffect } from "react";
import { Platform, View, ActivityIndicator } from "react-native";
import MisRecetas from "./views/movil/paciente/MisRecetas";
import LoginMovil from "./views/movil/Lotties/Pantalla1";
import LoginWeb from "./views/web/sesion/Login";
import { auth } from "../src/config/fb";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { LogBox } from "react-native";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  console.disableYellowBox = true;
  LogBox.ignoreAllLogs(true);
  console.warn = () => {}; // Desactiva las advertencias
  console.log = () => {}; // Desactiva los logs generales
  if (__DEV__) {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (
        args[0] &&
        typeof args[0] === "string" &&
        args[0].includes("[Expo]")
      ) {
        // Filtrar logs de Expo o warnings
        return;
      }
      originalConsoleLog(...args);
    };
  }

  useEffect(() => {
    // Listener para Firebase Auth
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser || null);
      setLoading(false);
    });

    // Limpieza del listener al desmontar el componente
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      // Manejar enlaces profundos en la versión web
      const handleWebDeepLink = () => {
        const url = window.location.href; // Obtén la URL actual
        console.log("URL Web inicial obtenida:", url);

        // Verifica si la URL contiene parámetros
        if (url.includes("?")) {
          const urlParams = new URLSearchParams(window.location.search);
          const mode = urlParams.get("mode");
          const oobCode = urlParams.get("oobCode");

          // Verifica si estamos en el modo de restablecimiento de contraseña
          if (mode === "resetPassword" && oobCode) {
            console.log("Código OOB para restablecimiento:", oobCode);
            // Redirigir a la página de cambio de contraseña
            router.push(`/web/reset-password?oobCode=${oobCode}`);
          } else {
            console.log("El modo no es correcto o no hay código OOB válido.");
          }
        } else {
          console.log("No se encontraron parámetros en la URL.");
        }
      };

      // Llama a la función para manejar el deep link en web
      handleWebDeepLink();
    } else {
      // Manejar enlaces profundos en dispositivos móviles
      const handleDeepLink = ({ url }) => {
        if (url) {
          console.log("Deep Link URL recibido:", url);
          const parsedUrl = Linking.parse(url);
          console.log("URL Analizada:", parsedUrl);

          const { queryParams, path } = parsedUrl;

          if (queryParams?.mode === "resetPassword") {
            const oobCode = queryParams?.oobCode;
            console.log("Código OOB extraído:", oobCode);
            if (oobCode) {
              router.push(`/views/movil/Recovery/Paso3?oobCode=${oobCode}`);
            }
          } else {
            console.log(
              "Modo de enlace desconocido o faltan parámetros requeridos."
            );
          }
        }
      };

      // Obtener la URL inicial cuando se abre la aplicación
      Linking.getInitialURL()
        .then((url) => {
          console.log("URL inicial obtenida:", url);
          if (url) {
            handleDeepLink({ url });
          }
        })
        .catch((err) => {
          console.error("Error al obtener la URL inicial:", err);
        });

      // Suscribirse al evento de cambios de URL mientras la aplicación está abierta
      const linkingListener = Linking.addEventListener("url", handleDeepLink);

      // Limpieza del evento cuando el componente se desmonte
      return () => {
        if (linkingListener && linkingListener.remove) {
          linkingListener.remove();
        }
      };
    }
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <>
      {Platform.OS === "web" ? (
        <LoginWeb />
      ) : user ? (
        <MisRecetas />
      ) : (
        <LoginMovil />
      )}
    </>
  );
}
