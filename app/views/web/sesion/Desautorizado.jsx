import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth"; // Importa Firebase Auth y signOut

export default function NoAuthorization() {
  const router = useRouter();

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acceso Denegado</Text>
      <Text style={styles.message}>
        No tienes permisos para acceder a esta página.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleGoBack}>
        <Text style={styles.buttonText}>Volver al Inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#D9534F",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#37817A",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
