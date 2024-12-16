import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  TextInput,
  Button,
  Title,
  Text,
  RadioButton,
  Provider as PaperProvider,
  DefaultTheme,
} from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#37817A",
    accent: "#37817A",
  },
};

import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
//Conexion a base de datos
import { ref, get, child } from "firebase/database";
import { db } from "../../../../src/config/fb";
import { getAuth, signOut } from "firebase/auth"; // Importa Firebase Auth y signOut

//Registro de clinica
import setClinica from "../../../../src/queryfb/admin/setClinica";
import getUserUID from "../../../../src/queryfb/general/getUserUID";
import anexarClinica from "../../../../src/queryfb/admin/anexarClinica";
import verificarRegistroClinica from "../../../../src/queryfb/admin/checkClinicaExist";
import getUserInfo from "../../../../src/queryfb/admin/getUserInfo";

//Proteccion de rutas
import ProtectedRegister from "./ProtectecRegister";

import Swal from "sweetalert2";

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

const RegisterClinic = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [register, setRegister] = useState("");
  const [entityType, setEntityType] = useState("Pública"); // Estado para la selección de entidad
  const [errorMessage, setErrorMessage] = useState("");
  const [text, setText] = useState("");
  const [adminInfo, setAdminInfo] = useState(null);
  const userUID = getUserUID(); // Obtener UID del usuario autenticado

  const router = useRouter();

  // Función para obtener la información del administrador con el UID
  useEffect(() => {
    const fetchAdminData = async () => {
      if (userUID) {
        const data = await getUserInfo(userUID);
        setAdminInfo(data);
      }
    };

    fetchAdminData();
  }, [userUID]);

  // Esto se ejecutará cuando la información de admin esté cargada
  useEffect(() => {
    if (adminInfo) {
      setText(adminInfo?.nombre); // Aquí puedes usar el nombre del admin
    }
  }, [adminInfo]);

  // Maneja el registro de la clínica
  const handleCrearClinica = async () => {
    //Regla de validacion
    const phoneRegex = /^\d{8}$/;
    const regex = /^[0-9]+$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Verificar que todos los campos requeridos estén llenos
    if (!name || !phone || !register || !entityType || !adminInfo) {
      setErrorMessage("Por favor, complete todos los campos");
      return;
    }

    if (!regex.test(register)) {
      setErrorMessage("El número de registro solo debe contener números.");
      return; // Detener el flujo si el registro contiene letras o caracteres no válidos
    }

    if (!phoneRegex.test(phone)) {
      setErrorMessage("El teléfono debe contener exactamente 8 dígitos.");
      return;
    }

    // Validar que el correo electrónico, si está presente, tenga un formato válido
    if (email) {
      if (!regexEmail.test(email)) {
        setErrorMessage("El formato del correo electrónico no es válido.");
        return; // Detener el flujo si el email tiene un formato inválido
      }
    }

    // Limpiar mensaje de error previo
    setErrorMessage("");

    try {
      // Verificar si el número de registro ya existe en Firebase
      const registroExiste = await verificarRegistroClinica(register);

      if (registroExiste) {
        setErrorMessage("El número de registro ya está en uso.");
        return; // Detener el flujo si el registro ya existe
      }

      // Intentar crear la clínica usando la función setClinica
      await setClinica(userUID, register, name, address, phone, entityType);

      // Si la clínica se creó correctamente, asociar la clínica con el administrador
      try {
        await anexarClinica(userUID, register); // Asocia la clínica al admin
        console.log("Clínica anexada al administrador correctamente.");
      } catch (error) {
        console.error("Error al anexar la clínica al administrador:", error);
        setErrorMessage(
          "Ocurrió un error al asociar la clínica con el administrador."
        );

        return; // Detener el flujo si hay un error al anexar la clínica
      }

      // Redirigir al usuario a la pantalla de horarios si todo fue exitoso
      router.replace(`/views/web/sesion/Horarios`);
    } catch (error) {
      // Manejar cualquier error en la creación de la clínica
      console.error("Error al crear la clínica:", error);
      setErrorMessage(
        "Ocurrió un error al crear la clínica. Intente nuevamente."
      );
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth(); // Inicializa auth correctamente
      await signOut(auth); // Cierra la sesión actual
      router.replace("/views/web/sesion/Login"); // Redirigir al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleBefore = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás acceder al panel de administración hasta que completes el registro. ¿Deseas salir?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Continuar con el registro",
      reverseButtons: true, // Para que el botón de cancelar esté a la derecha
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, lo rediriges al login
        handleLogout();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Si el usuario decide continuar, no haces nada y sigue el registro
        Swal.fire({
          title: "Continúa con tu registro",
          text: "Completa el formulario para acceder al panel de administración.",
          icon: "info",
        });
      }
    });
  };

  return (
    <ProtectedRegister allowedRoles={["admin"]}>
      <PaperProvider theme={theme}>
        <LoadFonts>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.content}>
              <View style={styles.formContainer}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                  <Text style={styles.radioLabel}>
                    Paso 2: Registra tu clínica
                  </Text>
                  <Title style={styles.title}>Registro de clínica</Title>

                  <Text style={styles.radioLabel}>Información general</Text>
                  <View style={styles.row}>
                    <TextInput
                      label="Nombre"
                      value={name}
                      onChangeText={(text) => setName(text)}
                      mode="outlined"
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
                      label="N Registro"
                      value={register}
                      onChangeText={(text) => setRegister(text)}
                      mode="outlined"
                      style={styles.input}
                    />
                  </View>

                  {/* RadioButton para seleccionar entidad */}
                  <Text style={styles.radioLabel}>Entidad</Text>
                  <View style={styles.radioRow}>
                    <RadioButton
                      value="Pública"
                      status={
                        entityType === "Pública" ? "checked" : "unchecked"
                      }
                      onPress={() => setEntityType("Pública")}
                      color={theme.colors.primary}
                    />
                    <Text>Pública</Text>
                    <RadioButton
                      value="Privada"
                      status={
                        entityType === "Privada" ? "checked" : "unchecked"
                      }
                      onPress={() => setEntityType("Privada")}
                      color={theme.colors.primary}
                    />
                    <Text>Privada</Text>
                  </View>

                  <Text style={styles.radioLabel}>Información adicional</Text>
                  <View style={styles.row}>
                    <TextInput
                      label="Correo (opcional)"
                      inputMode="email"
                      onChangeText={setEmail}
                      value={email}
                      mode="outlined"
                      style={styles.input}
                    />
                  </View>

                  <Text style={styles.radioLabel}>
                    Información del administrador
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre del administrador"
                    value={text}
                    mode="outlined"
                    onChangeText={(newText) => setText(newText)}
                    editable={false}
                  />

                  {errorMessage ? (
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                  ) : null}
                  <br />
                  <View style={styles.row}>
                    <Button
                      mode="contained"
                      onPress={handleBefore}
                      style={styles.buttonCancel}
                    >
                      <Text
                        style={{
                          fontFamily: "CeraRoundProMedium",
                          color: "#37817A",
                        }}
                      >
                        Lo haré más tarde
                      </Text>
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleCrearClinica}
                      style={styles.button}
                    >
                      Siguiente
                    </Button>
                  </View>
                </ScrollView>
              </View>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: "/assets/clinica.jpg" }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            </View>
          </ScrollView>
        </LoadFonts>
      </PaperProvider>
    </ProtectedRegister>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 30,
    marginBottom: 20,
    color: "#37817A",
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  radioLabel: {
    marginBottom: 5,
    color: "#37817A",
    fontWeight: "bold",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
  errorMessage: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
});

export default RegisterClinic;
