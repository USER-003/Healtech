import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Button } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Menu from "../../Menu";
import ProtectedRoute from "../../../../sesion/ProtectedRoute";
import { auth } from "../../../../../../../src/config/fb";

import {
  secundario,
  createUserWithEmailAndPassword,
} from "../../../../../../../src/config/secundary";
import getUserUID from "../../../../../../../src/queryfb/general/getUserUID";

const App = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [createUid, setCreateUid] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%*_?&]{8,}$/.test(
      password
    );

  const handleRegister = async () => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!email) {
      setEmailError("El correo electrónico es obligatorio.");
      return;
    } else if (!validateEmail(email)) {
      setEmailError("Por favor, ingrese un correo electrónico válido.");
      return;
    }

    if (!password) {
      setPasswordError("La contraseña es obligatoria.");
      return;
    } else if (!validatePassword(password)) {
      setPasswordError(
        "La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra mayúscula, una letra minúscula, un número y un carácter especial."
      );
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Por favor, confirme su contraseña.");
      return;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        secundario,
        email,
        password
      );
      const uid = userCredential.user.uid;
      setCreateUid(uid);

      setModalMessage("La cuenta ha sido creada correctamente.");
      setShowModal(true);
    } catch (error) {
      console.error("Error al crear la cuenta:", error);
      setModalMessage(
        "Hubo un problema al crear la cuenta. Inténtelo nuevamente."
      );
      setShowModal(true);
    }
  };

  const handleModalClose = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowModal(false);
  };

  const handleNavigate = () => {
    setShowModal(false);
    router.replace(
      `/views/web/admin/Componentes/Administracion/paciente/CrearExpediente?ID=${createUid}`
    );
  };

  const handleBack = () => {
    router.replace(
      "views/web/admin/Componentes/Administracion/paciente/VerPacientes"
    );
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["pacientes"]}
    >
      <View style={styles.container}>
        <Menu />
        <View style={styles.mainContent}>
          <Text style={styles.dashboardText}>Crear cuenta de paciente</Text>

          <ScrollView style={styles.formContainer}>
            <View style={styles.card}>
              <Text style={styles.formTitle}>Datos de cuenta</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="Correo"
                  autoComplete="off"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError && validateEmail(text)) {
                      setEmailError("");
                    }
                  }}
                />
                {emailError && (
                  <Text style={styles.errorText}>{emailError}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    passwordError ? styles.inputError : null,
                  ]}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
                {passwordError && (
                  <Text style={styles.errorText}>{passwordError}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    confirmPasswordError ? styles.inputError : null,
                  ]}
                  placeholder="Confirmar Password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
                {confirmPasswordError && (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                )}
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.buttonCancel}
                >
                  <Text style={styles.cancelButtonText}>Volver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRegister}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Crear cuenta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        <Modal
          visible={showModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleModalClose}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <Button
                title="Ir a Crear Expediente"
                onPress={handleNavigate}
                containerStyle={styles.modalButton}
              />
            </View>
          </View>
        </Modal>
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  dashboardText: {
    color: "#1E3A8A",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
  },
  formContainer: {
    backgroundColor: "#FFF",
    borderRadius: 0,
    alignContent: "center",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderColor: "#C9C9C9",
    borderWidth: 1,
    padding: 20,
  },
  formTitle: {
    color: "#1E3A8A",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
  },
  inputContainer: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  icon: {
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#37817A",
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    width: "45%",
    marginHorizontal: 5,
  },
  buttonCancel: {
    padding: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#37817A",
    borderRadius: 25,
    alignItems: "center",
    width: "45%",
    marginHorizontal: 5,
  },
  cancelButtonText: {
    color: "#37817A",
    fontFamily: "CeraRoundProMedium",
  },
  buttonText: {
    color: "white",
    fontFamily: "CeraRoundProMedium",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    marginBottom: 20,
    fontSize: 18,
    textAlign: "center",
  },
  modalButton: {
    marginTop: 10,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});

export default App;
