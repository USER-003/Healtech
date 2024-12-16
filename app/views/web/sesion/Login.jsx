import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal, // Importamos Modal
} from "react-native";
import { useRouter } from "expo-router";
import {
  auth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "../../../../src/config/fb";
import { useFonts } from "expo-font";
import searchRole from "../../../../src/queryfb/general/searchRole";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import registrarLogSistema from "../../../../src/queryfb/general/setLog";
import FontAwesome from "react-native-vector-icons/FontAwesome"; // Importamos FontAwesome

// Component to load fonts and render children when fonts are ready
const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
    CeraRoundProBold: require("../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProMedium: require("../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
};

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("warning");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  // Redirigir según el rol del usuario
  const handleUserRedirection = async (role, user) => {
    try {
      if (role === "admin") {
        await registrarLogSistema("Inicio de sesión", "Dashboard", "exito");
        router.replace("/views/web/admin/DashBoard");
      } else if (role === "doctor") {
        router.replace(`/views/web/doctor/BuscarPaciente`);
      } else if (role === "paciente") {
        router.replace("/views/web/paciente/DownloadApp");
      } else if (role === "colaboradores") {
        router.replace("/views/web/admin/DashBoard");
      } else {
        setModalTitle("Rol no reconocido");
        setModalMessage("No se pudo determinar el rol del usuario.");
        setModalType("error");
        setModalVisible(true);
      }
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(
        "Ocurrió un error al redirigir al usuario. Intente nuevamente."
      );
      setModalType("error");
      setModalVisible(true);
    }
  };

  // Verifica la sesión activa del usuario y redirige en base al rol
  useEffect(() => {
    const checkActiveSession = () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const role = await searchRole(user.uid);
            handleUserRedirection(role, user);
          } catch (error) {
            console.error("Error al verificar el rol del usuario:", error);
          }
        }
      });
    };

    checkActiveSession();
  }, [router]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Manejo de inicio de sesión
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setModalTitle("Campos incompletos");
      setModalMessage("Por favor, ingrese su correo electrónico y contraseña.");
      setModalType("warning");
      setModalVisible(true);
      return;
    }

    if (!emailRegex.test(email)) {
      setModalTitle("Correo no válido");
      setModalMessage(
        "El correo electrónico ingresado no tiene un formato válido. Por favor, verifica y vuelve a intentarlo."
      );
      setModalType("warning");
      setModalVisible(true);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const loginTime = Date.now();
      await AsyncStorage.setItem("loginTime", JSON.stringify(loginTime));

      const role = await searchRole(user.uid);
      handleUserRedirection(role, user);
    } catch (error) {
      setModalTitle("No pudimos iniciar sesión");
      setModalMessage(
        "Por favor, verifica tu correo y contraseña e inténtalo de nuevo. Si el problema persiste, considera restablecer tu contraseña."
      );
      setModalType("warning");
      setModalVisible(true);
    }
  };

  const handleRegister = () => {
    router.navigate("/views/web/sesion/SignUp");
  };

  const handleOlvidasteContrasena = () => {
    router.navigate("/views/web/Recovery/OlvidasteContrasena");
  };

  return (
    <LoadFonts>
      <View style={styles.container}>
        <View style={styles.leftPanel}>
          <Text style={styles.welcomeText}>
            ¿Quieres administrar una clínica?
          </Text>
          <Text style={styles.infoText}>
            Crea una cuenta de administrador para acceder a nuestro panel de
            gestión
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightPanel}>
          <Text style={styles.createAccountText}>Iniciar sesión</Text>
          <TextInput
            style={styles.inputPass}
            placeholder="Correo electrónico"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
          />
          <View style={[styles.inputContainer, { marginVertical: 10 }]}>
            <TextInput
              style={styles.inputPass}
              placeholder="Contraseña"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              value={password}
            />
            <TouchableOpacity
              style={styles.icon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? "visibility-off" : "visibility"}
                size={24}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.signUpButton} onPress={handleLogin}>
              <Text style={styles.buttonTextSignUp}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleOlvidasteContrasena}>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        {/* Modal personalizado */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FontAwesome
                name={
                  modalType === "success"
                    ? "check-circle"
                    : modalType === "warning"
                    ? "exclamation-circle"
                    : modalType === "error"
                    ? "times-circle"
                    : "info-circle"
                }
                size={60}
                color={
                  modalType === "success"
                    ? "#4CAF50"
                    : modalType === "warning"
                    ? "#FF9800"
                    : modalType === "error"
                    ? "#F44336"
                    : "#2196F3"
                }
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </LoadFonts>
  );
}

const styles = StyleSheet.create({
  // ... tus estilos existentes ...
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
  },
  inputContainer: {
    position: "relative",
    width: "100%",
  },
  inputPass: {
    width: "100%",
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingRight: 40,
  },
  icon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  forgotPassword: {
    color: "#37817A",
    marginBottom: 20,
    textAlign: "right",
    marginTop: 20,
    fontFamily: "CeraRoundProMedium",
  },
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F7F7F7",
  },
  leftPanel: {
    flex: 1,
    backgroundColor: "#37817A",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    fontFamily: "CeraRoundProMedium",
  },
  infoText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
  },
  signInButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: "#4CAF91",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "CeraRoundProMedium",
  },
  buttonTextSignUp: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  rightPanel: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  createAccountText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#37817A",
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginTop: 10,
  },
  signUpButton: {
    backgroundColor: "#37817A",
    borderRadius: 25,
    padding: 10,
    width: "50%",
    flex: 1,
  },
  // Estilos para el modal personalizado
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "30%",
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "CeraRoundProBold",
    textAlign: "center",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    fontFamily: "CeraRoundProRegular",
    textAlign: "center",
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: "#37817A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "CeraRoundProBold",
  },
});
