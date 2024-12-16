import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  TextInput,
  Button,
  Title,
  RadioButton,
  Text,
  Provider as PaperProvider,
  DefaultTheme,
  Menu,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// Eliminamos la importación de SweetAlert
// import Swal from "sweetalert2";
import { useRouter } from "expo-router";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "../../../../src/config/fb";
import { useFonts } from "expo-font";
import setAdminAccount from "../../../../src/queryfb/admin/setAdminAccount";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "react-native-vector-icons/FontAwesome"; // Importamos FontAwesome

// No es necesario importar TouchableOpacity de nuevo si ya está importado
// import { TouchableOpacity } from "react-native";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#37817A",
    accent: "#37817A",
  },
};

const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
    CeraRoundProBold: require("../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProMedium: require("../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return children;
};

const AdminRegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dui, setDui] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("masculino");
  const [birthDate, setBirthDate] = useState({ day: "", month: "", year: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [visible, setVisible] = useState(false);

  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("warning");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const router = useRouter();

  const obtenerNumeroMes = (mes) => {
    const meses = {
      enero: 1,
      febrero: 2,
      marzo: 3,
      abril: 4,
      mayo: 5,
      junio: 6,
      julio: 7,
      agosto: 8,
      septiembre: 9,
      octubre: 10,
      noviembre: 11,
      diciembre: 12,
    };

    return meses[mes.toLowerCase()] || "Mes no válido";
  };

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%*_?&]{8,}$/;
    const duiRegex = /^\d{9}$/;
    const phoneRegex = /^\d{8}$/;

    const month = obtenerNumeroMes(birthDate.month);

    if (!name || !email || !password || !dui || !phone || !address) {
      setErrorMessage("Complete todos los campos obligatorios.");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("Por favor, ingrese un correo electrónico válido.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setErrorMessage("La contraseña debe cumplir con los requisitos.");
      return;
    }

    if (!duiRegex.test(dui)) {
      setErrorMessage("Por favor, ingrese un DUI válido.");
      return;
    }

    if (!phoneRegex.test(phone)) {
      setErrorMessage("El teléfono debe contener exactamente 8 dígitos.");
      return;
    }

    if (
      !birthDate.day ||
      !month ||
      !birthDate.year ||
      isNaN(birthDate.day) ||
      isNaN(month) ||
      isNaN(birthDate.year)
    ) {
      setErrorMessage("Por favor, ingrese una fecha de nacimiento válida.");
      return;
    }

    try {
      // Creando cuenta de admin
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Se obtiene el usuario creado
      const user = userCredential.user;

      // Se define el rol de admin
      const role = "admin";

      // Se crea el perfil del admin
      try {
        await setAdminAccount(
          user.uid,
          name,
          email,
          dui,
          phone,
          address,
          gender,
          birthDate,
          month,
          role
        );
      } catch (error) {
        console.log(error);
      }

      await signInWithEmailAndPassword(auth, email, password);

      router.replace("/views/web/sesion/RegistroClinica");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Este correo electrónico ya está registrado.");
      } else {
        setErrorMessage(error.message);
      }
    }
  };

  const handleCancelar = () => {
    setModalTitle("¿Estás seguro?");
    setModalMessage("Estás a punto de cancelar el registro. ¿Quieres continuar?");
    setModalType("warning");
    setModalVisible(true);
  };

  // Maneja la visibilidad del menú de meses
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <PaperProvider theme={theme}>
      <LoadFonts>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <View style={styles.formContainer}>
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.radioLabel}>
                  Paso 1: Registra tu cuenta administrativa
                </Text>
                <Title style={styles.title}>Registro de Administrador</Title>

                <Text style={styles.radioLabel}>Información personal</Text>
                <View style={styles.row}>
                  <TextInput
                    label="Nombre"
                    value={name}
                    onChangeText={(text) => setName(text)}
                    mode="outlined"
                    style={styles.input}
                  />
                  <TextInput
                    label="DUI"
                    value={dui}
                    onChangeText={(text) => setDui(text)}
                    mode="outlined"
                    style={styles.input}
                  />
                </View>

                <View style={styles.row}>
                  <TextInput
                    label="Teléfono"
                    inputMode="tel"
                    value={phone}
                    onChangeText={(text) => setPhone(text)}
                    mode="outlined"
                    keyboardType="phone-pad"
                    style={styles.input}
                  />
                  <TextInput
                    label="Dirección"
                    value={address}
                    onChangeText={(text) => setAddress(text)}
                    mode="outlined"
                    style={styles.input}
                  />
                </View>

                <Text style={styles.radioLabel}>Credenciales de acceso</Text>
                <View style={styles.row}>
                  <TextInput
                    label="Correo"
                    inputMode="email"
                    onChangeText={setEmail}
                    value={email}
                    mode="outlined"
                    style={styles.input}
                  />

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      label="Contraseña"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      mode="outlined"
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
                </View>
                <View style={styles.row}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      label="Confirmar contraseña"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      mode="outlined"
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
                </View>

                <Text style={styles.radioLabel}>Fecha de nacimiento</Text>
                <View style={styles.row}>
                  <TextInput
                    label="Día"
                    placeholder="DD"
                    value={birthDate.day}
                    onChangeText={(text) =>
                      setBirthDate({ ...birthDate, day: text })
                    }
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                  />

                  {/* Modificación del campo de Mes */}
                  <Menu
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={
                      <TouchableOpacity
                        onPress={openMenu}
                        style={{ flex: 1 }}
                      >
                        <TextInput
                          label="Mes"
                          value={birthDate.month}
                          mode="outlined"
                          style={styles.input}
                          editable={false}
                          right={
                            <TextInput.Icon
                              icon="menu-down"
                              onPress={openMenu}
                            />
                          }
                        />
                      </TouchableOpacity>
                    }
                  >
                    {[
                      "Enero",
                      "Febrero",
                      "Marzo",
                      "Abril",
                      "Mayo",
                      "Junio",
                      "Julio",
                      "Agosto",
                      "Septiembre",
                      "Octubre",
                      "Noviembre",
                      "Diciembre",
                    ].map((mes) => (
                      <Menu.Item
                        key={mes}
                        onPress={() => {
                          setBirthDate({ ...birthDate, month: mes });
                          closeMenu();
                        }}
                        title={mes}
                      />
                    ))}
                  </Menu>

                  <TextInput
                    label="Año"
                    placeholder="YYYY"
                    value={birthDate.year}
                    onChangeText={(text) =>
                      setBirthDate({ ...birthDate, year: text })
                    }
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.radioGroup}>
                  <Text style={styles.radioLabel}>Género</Text>
                  <View style={styles.radioRow}>
                    <RadioButton
                      value="masculino"
                      status={gender === "masculino" ? "checked" : "unchecked"}
                      onPress={() => setGender("masculino")}
                      color={theme.colors.primary}
                    />
                    <Text>Masculino</Text>
                    <RadioButton
                      value="femenino"
                      status={gender === "femenino" ? "checked" : "unchecked"}
                      onPress={() => setGender("femenino")}
                      color={theme.colors.primary}
                    />
                    <Text>Femenino</Text>
                    <RadioButton
                      value="personalizado"
                      status={
                        gender === "personalizado" ? "checked" : "unchecked"
                      }
                      onPress={() => setGender("personalizado")}
                      color={theme.colors.primary}
                    />
                    <Text>Personalizado</Text>
                  </View>
                </View>

                {errorMessage ? (
                  <Text style={styles.errorMessage}>{errorMessage}</Text>
                ) : null}

                <View style={styles.row}>
                  <Button
                    mode="contained"
                    onPress={handleCancelar}
                    style={styles.buttonCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleRegister}
                    style={styles.button}
                  >
                    Siguiente
                  </Button>
                </View>
              </ScrollView>
            </View>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: "/assets/doctor.jpg" }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          </View>
        </ScrollView>

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
                    : "info-circle"
                }
                size={60}
                color={
                  modalType === "success"
                    ? "#4CAF50"
                    : modalType === "warning"
                    ? "#FF9800"
                    : "#2196F3"
                }
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalText}>{modalMessage}</Text>
              {modalType === "warning" ? (
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.modalButtonCancel}
                    onPress={() => {
                      // Usuario confirma la cancelación
                      setModalVisible(false);
                      router.replace("/views/web/sesion/Login");
                    }}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      // Usuario decide continuar con el registro
                      setModalVisible(false);
                      setModalTitle("Acción cancelada");
                      setModalMessage("Puedes continuar con el registro.");
                      setModalType("info");
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Continuar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
        {/* Fin del modal */}
      </LoadFonts>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 5,
      flex: 1,
      position: "relative",
    },
    input: {
      flex: 1,
      paddingRight: 40,
    },
    iconOverlay: {
      position: "absolute",
      right: 25, // Ajusta la posición para que el icono quede al lado derecho dentro del input
      zIndex: 1, // Asegura que el ícono se superponga sobre el campo
    },
    container: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      fontFamily: "CeraRoundProBlack",
      margin: 20,
    },
    content: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    formContainer: {
      width: "50%",
      padding: 20,
      backgroundColor: "#ffffff",
    },
    scrollContainer: {
      flexGrow: 1,
    },
    imageContainer: {
      width: "50%",
      backgroundColor: "#ffffff",
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    title: {
      textAlign: "left",
      fontSize: 27,
      marginBottom: 20,
      color: "#37817A",
      fontWeight: "bold",
      fontFamily: "CeraRoundProMedium",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    input: {
      flex: 1,
      marginRight: 10,
      backgroundColor: "#ffffff",
    },
    radioGroup: {
      marginBottom: 15,
    },
    radioLabel: {
      marginBottom: 5,
      color: "#37817A",
      fontWeight: "bold",
    },
    radioRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    dateRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flex: 1,
    },
    dateInput: {
      flex: 1,
      marginHorizontal: 5,
      backgroundColor: "#ffffff",
    },
    menuWrapper: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    button: {
      width: "45%",
      backgroundColor: "#37817A",
      alignSelf: "center",
      fontFamily: "CeraRoundProMedium",
    },
    buttonCancel: {
      width: "45%",
      backgroundColor: "white",
      color: "#37817A",
      borderWidth: 1,
      borderColor: "#37817A",
      alignSelf: "center",
      fontFamily: "CeraRoundProMedium",
    },
    cancelButtonText: {
      color: "#37817A",
      fontFamily: "CeraRoundProMedium",
    },
    errorMessage: {
      color: "red",
      fontSize: 14,
      textAlign: "center",
      marginTop: 10,
      marginBottom: 20,
    },
 
  // Estilos para el modal
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
    width: "50%",
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
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#37817A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    color: "#37817A",
    borderWidth: 1,
    borderColor: "#37817A",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "CeraRoundProBold",
  },
  modalButtonTextCancel: {
    color: "#37817A",
    fontSize: 16,
    fontFamily: "CeraRoundProBold",
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

export default AdminRegisterForm;
