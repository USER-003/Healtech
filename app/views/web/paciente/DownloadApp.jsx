import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth"; // Importa Firebase Auth y signOut
import ProtectedRoute from "../sesion/ProtectedRoute";
import getUserUID from "../../../../src/queryfb/general/getUserUID";
import generateAccessCode from "../../../../src/queryfb/paciente/accessCode/createAccessCode";

export default function DownloadAppPrompt() {
  const userUID = getUserUID();

  // Función para abrir el enlace de descarga de la app en el teléfono
  const handleDownload = () => {
    // Redirige a las tiendas de aplicaciones
    const appStoreLink = "https://example.com/app-store-link"; // Cambia esto por el enlace a la App Store
    const playStoreLink = "https://example.com/play-store-link"; // Cambia esto por el enlace a la Play Store
    const router = useRouter();

    // Detecta el sistema operativo para redirigir al enlace adecuado
    if (Platform.OS === "ios") {
      Linking.openURL(appStoreLink);
    } else {
      Linking.openURL(playStoreLink);
    }
  };

  // Función para redirigir a la página principal o de inicio de sesión
  const handleGoBack = async () => {
    try {
      const auth = getAuth(); // Inicializa auth correctamente
      await signOut(auth); // Cierra la sesión actual
      router.replace("/views/web/sesion/Login"); // Cambia la ruta según la estructura de tu proyecto
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleAccessCode = async () => {
    console.log(userUID);
    try {
      const code = await generateAccessCode(userUID);
      alert(`Código generado: ${code}`);
    } catch (error) {
      console.error("Error al generar el código:", error);
      alert("No se pudo generar el código. Intenta de nuevo.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["paciente"]}>
      <View style={styles.container}>
        <Text style={styles.title}>
          Healtech para pacientes no esta disponible en la web
        </Text>
        <Text style={styles.message}>
          Para continuar utilizando las funciones de paciente, por favor
          descarga nuestra aplicación móvil.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleDownload}>
          <Text style={styles.buttonText}>Descargar la App</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleAccessCode}>
          <Text style={styles.buttonText}>Generar Codigo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#37817A",
    padding: 15,
    borderRadius: 10,
    margin: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: "#37817A",
    fontSize: 16,
    fontWeight: "bold",
  },
});
