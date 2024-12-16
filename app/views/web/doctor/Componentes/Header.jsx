import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import ProtectedRoute from "../../sesion/ProtectedRoute";

const Header = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();

  // Maneja la lógica de cierre de sesión
  const handleSignOut = async () => {
    try {
      const auth = getAuth(); // Inicializa auth
      await signOut(auth); // Cierra la sesión
      router.replace("/views/web/sesion/Login"); // Redirige al inicio de sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Alterna la visibilidad del menú desplegable
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  // Maneja la redirección al buscar paciente
  const redirectToBuscarPaciente = () => {
    router.push("/views/web/doctor/BuscarPaciente");
  };

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <View style={styles.container}>
        <View style={styles.navbar}>
          {/* Logo redirige a la búsqueda de pacientes */}
          <TouchableOpacity onPress={redirectToBuscarPaciente}>
            <Text style={styles.logo}>HEALTECH</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileIcon} onPress={toggleDropdown}>
            <FontAwesomeIcon icon={faUser} color="white" />
          </TouchableOpacity>
        </View>
        {isDropdownVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleSignOut}
            >
              <Text style={styles.dropdownText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    zIndex: 1,
  },
  navbar: {
    backgroundColor: "#2A2A2E",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    fontFamily: "CeraRoundProMedium",
  },
  logo: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  profileIcon: {
    padding: 10,
    backgroundColor: "#2A2A2E",
    borderRadius: 25,
  },
  dropdownMenu: {
    position: "absolute",
    right: 20, // Ajusta la posición para alinearlo con el ícono de perfil
    top: 60, // Posición bajo la barra de navegación
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    elevation: 5, // Sombra para darle profundidad
    zIndex: 9999, // Asegura que se muestre sobre los demás elementos
  },
  dropdownItem: {
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
});

export default Header;
