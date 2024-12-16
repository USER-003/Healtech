import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  CheckBox,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Button } from "react-native-elements";
import { useRouter } from "expo-router";
import { auth } from "../../../../../../../src/config/fb";

import {
  secundario,
  createUserWithEmailAndPassword,
} from "../../../../../../../src/config/secundary";

import setMedicoAccount from "../../../../../../../src/queryfb/doctor/setDoctorAccount";
import checkIdExist from "../../../../../../../src/queryfb/doctor/checkIdDoctorExist";
import checkJVPM from "../../../../../../../src/queryfb/doctor/checkJVPMExist";
// Eliminamos la importación de SweetAlert
// import Swal from "sweetalert2"; // Importa sweetalert2
import Menu from "../../Menu";
import ProtectedRoute from "../../../../sesion/ProtectedRoute";
import getUserUID from "../../../../../../../src/queryfb/general/getUserUID";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "react-native-vector-icons/FontAwesome"; // Importamos FontAwesome

const CrearCuentaMedico = () => {
  const router = useRouter();
  const userUID = getUserUID(); // Obtener el UID del usuario actual
  const [nombre, setNombre] = useState("");
  const [dui, setDui] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [jvpm, setJvpm] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState(""); // Cambio aquí: estado para contraseña
  const [confirmarContrasena, setConfirmarContrasena] = useState(""); // Cambio aquí: estado para confirmación de contraseña
  const [isChecked, setIsChecked] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("warning");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return false; // No cumple con la longitud mínima
    }

    let hasLowerCase = false;
    let hasUpperCase = false;
    let hasNumber = false;
    let hasSpecialChar = false;

    // Lista de caracteres especiales permitidos
    const specialCharacters = "@$!%*?&_+";

    for (const char of password) {
      if (!hasLowerCase && char >= "a" && char <= "z") {
        hasLowerCase = true;
      } else if (!hasUpperCase && char >= "A" && char <= "Z") {
        hasUpperCase = true;
      } else if (!hasNumber && char >= "0" && char <= "9") {
        hasNumber = true;
      } else if (!hasSpecialChar && specialCharacters.includes(char)) {
        hasSpecialChar = true;
      }

      // Si cumple todos los criterios, retornamos true
      if (hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar) {
        return true;
      }
    }

    // Si falta algún criterio, retorna false
    return false;
  };

  const validateDui = (dui) => {
    const duiRegex = /^\d{9}$/;
    return duiRegex.test(dui);
  };

  const validateFields = () => {
    let valid = true;

    if (
      !nombre ||
      !dui ||
      !direccion ||
      !telefono ||
      !correo ||
      !contrasena ||
      !confirmarContrasena ||
      !jvpm
    ) {
      setModalTitle("Campos incompletos");
      setModalMessage("Por favor, complete todos los campos obligatorios.");
      setModalType("warning");
      setModalVisible(true);
      valid = false;
    }

    if (!validateEmail(correo)) {
      setModalTitle("Correo inválido");
      setModalMessage("Por favor, ingrese un correo electrónico válido.");
      setModalType("warning");
      setModalVisible(true);
      valid = false;
    }

    if (!validatePassword(contrasena)) {
      setModalTitle("Contraseña inválida");
      setModalMessage(
        "La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra mayúscula, una letra minúscula, un número y un carácter especial."
      );
      setModalType("warning");
      setModalVisible(true);
      valid = false;
    }

    if (contrasena !== confirmarContrasena) {
      setModalTitle("Las contraseñas no coinciden");
      setModalMessage(
        "Por favor, asegúrese de que las contraseñas coincidan."
      );
      setModalType("warning");
      setModalVisible(true);
      valid = false;
    }

    if (!validateDui(dui)) {
      setModalTitle("DUI inválido");
      setModalMessage("Por favor, ingrese un DUI válido de 9 dígitos.");
      setModalType("warning");
      setModalVisible(true);
      valid = false;
    }

    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(telefono)) {
      setModalTitle("Teléfono inválido");
      setModalMessage(
        "El número de teléfono debe contener exactamente 8 dígitos numéricos."
      );
      setModalType("warning");
      setModalVisible(true);
      valid = false;
    }

    if (!isChecked) {
      setModalTitle("Términos y condiciones");
      setModalMessage(
        "Debe aceptar los términos y condiciones para continuar."
      );
      setModalType("warning");
      setModalVisible(true);
      valid = false;
    }

    return valid;
  };

  const handleRegister = async () => {
    if (!validateFields()) return;

    try {
      const duiExists = await checkIdExist(dui);
      if (duiExists) {
        setModalTitle("DUI en uso");
        setModalMessage("Este DUI ya está registrado.");
        setModalType("warning");
        setModalVisible(true);
        return;
      }

      const jvpmExists = await checkJVPM(jvpm);
      if (jvpmExists) {
        setModalTitle("JVPM en uso");
        setModalMessage("Este JVPM ya está registrado.");
        setModalType("warning");
        setModalVisible(true);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        secundario,
        correo,
        contrasena
      );

      const uid = userCredential.user.uid;

      await setMedicoAccount(
        userUID,
        uid,
        nombre,
        dui,
        direccion,
        telefono,
        correo,
        jvpm
      );

      setModalTitle("Registro exitoso");
      setModalMessage("La cuenta ha sido creada correctamente.");
      setModalType("success");
      setModalVisible(true);
    } catch (error) {
      console.error("Error al crear la cuenta:", error);
      setModalTitle("Error");
      setModalMessage(
        "Hubo un problema al crear la cuenta. Inténtelo nuevamente."
      );
      setModalType("error");
      setModalVisible(true);
    }
  };

  const handleGoBack = () => {
    router.replace(
      `/views/web/admin/Componentes/Administracion/medico/VerDoctores`
    );
  };

  const handleShowTerms = () => {
    setShowTermsModal(true);
  };

  const handleAcceptTerms = () => {
    setIsChecked(true);
    setShowTermsModal(false);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      router.replace(`/views/web/admin/Componentes/Administracion/medico/CrearMedico`);
    }
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["medicos"]}
    >
      <View style={styles.container}>
        <Menu />
        <View style={styles.mainContent}>
          <Text style={styles.dashboardText}>Crear cuenta de médico</Text>

          <ScrollView style={styles.formContainer}>
            <View style={styles.card}>
              <Text style={styles.formTitle}>Datos personales</Text>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.fullWidth, styles.marginBottom]}
                  label="Nombre"
                  placeholder="Nombre"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="DUI"
                  value={dui}
                  onChangeText={setDui}
                />
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Dirección"
                  value={direccion}
                  onChangeText={setDireccion}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Teléfono"
                  value={telefono}
                  onChangeText={setTelefono}
                />
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="JVPM"
                  value={jvpm}
                  onChangeText={setJvpm}
                />
              </View>
              <br />
              <Text style={styles.formTitle}>Credenciales de acceso</Text>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.fullWidth]}
                  placeholder="Correo"
                  value={correo}
                  onChangeText={setCorreo}
                />
              </View>

              <View style={styles.inputContainer}>
  <TextInput
    style={styles.input}
    placeholder="Contraseña"
    secureTextEntry={!showPassword}
    value={contrasena}
    onChangeText={setContrasena}
  />
  <TouchableOpacity
    style={styles.iconOverlay}
    onPress={() => setShowPassword(!showPassword)}
  >
    <Ionicons
      name={showPassword ? "eye-off" : "eye"}
      size={24}
      color="gray"
    />
  </TouchableOpacity>
</View>

<View style={styles.inputContainer}>
  <TextInput
    style={styles.input}
    placeholder="Confirmar contraseña"
    secureTextEntry={!showConfirmPassword}
    value={confirmarContrasena}
    onChangeText={setConfirmarContrasena}
  />
  <TouchableOpacity
    style={styles.iconOverlay}
    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
  >
    <Ionicons
      name={showConfirmPassword ? "eye-off" : "eye"}
      size={24}
      color="gray"
    />
  </TouchableOpacity>
</View>

              <View style={styles.checkboxContainer}>
                <CheckBox value={isChecked} onValueChange={setIsChecked} />
                <Text style={styles.checkboxLabel}>
                  Acepto los{" "}
                  <Text style={styles.linkText} onPress={handleShowTerms}>
                    términos y condiciones
                  </Text>
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Registrar"
                  buttonStyle={styles.saveButton}
                  containerStyle={styles.buttonWrapper}
                  disabled={!isChecked}
                  onPress={handleRegister}
                />
                <Button
                  title="Volver"
                  buttonStyle={styles.backButton}
                  containerStyle={styles.buttonWrapper}
                  titleStyle={{ color: "#37817A" }}
                  onPress={handleGoBack}
                />
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Modal para mostrar términos y condiciones */}
        <Modal
          visible={showTermsModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>Términos y Condiciones</Text>
                <Text style={styles.modalText}>...</Text>
              </ScrollView>

              <Button title="Aceptar" onPress={handleAcceptTerms} />
            </View>
          </View>
        </Modal>

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
                onPress={handleModalClose}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  // ... tus estilos existentes
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
  },
  input: {
    flex: 1,
    padding: 10,
    paddingRight: 40, // Espacio adicional para el icono
    borderRadius: 5,
    borderWidth:1,
    borderColor:'#C9C9C9',
    margin:10,
  },
  iconOverlay: {
    position: "absolute",
    right: 10,
    padding: 5,
  },
  
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  sidebar: {
    width: "20%",
    backgroundColor: "#1E3A8A",
    paddingVertical: 20,
    paddingHorizontal: 10,
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
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderColor: "#D9D9D9",
    borderWidth: 1,
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  marginBottom: {
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: "CeraRoundProMedium",
    margin:5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 20,
  },
  buttonWrapper: {
    width: "20%",
    margin: 5,
    fontFamily: "CeraRoundProMedium",
  },
  saveButton: {
    backgroundColor: "#37817A",
    borderRadius: 25,
    fontFamily: "CeraRoundProMedium",
  },
  backButton: {
    backgroundColor: "#fff",
    borderColor: "#37817A",
    borderWidth: 1,
    color: "#000000",
    borderRadius: 25,
    fontFamily: "CeraRoundProMedium",
  },
  linkText: {
    color: "#37817A",
    textDecorationLine: "underline",
    fontFamily: "CeraRoundProMedium",
  },
  // Estilos para el modal personalizado
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "50%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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

export default CrearCuentaMedico;
