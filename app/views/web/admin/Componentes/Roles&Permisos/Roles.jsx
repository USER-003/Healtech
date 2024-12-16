import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal, // Importamos Modal
  ActivityIndicator, // Importamos ActivityIndicator
} from "react-native";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router"; // Para redirigir
import Menu from "../Menu";
import ProtectedRoute from "../../../sesion/ProtectedRoute";
import crearRol from "../../../../../../src/queryfb/admin/setRol";
import obtenerRegistroClinicaAsociada from "../../../../../../src/queryfb/admin/getRegistroClinica";
import getUserUID from "../../../../../../src/queryfb/general/getUserUID";
// Eliminamos la importación de SweetAlert2
// import Swal from "sweetalert2";
import verificarNombreRolExistente from "../../../../../../src/queryfb/admin/checkNombreRol";
import FontAwesome from "react-native-vector-icons/FontAwesome"; // Importamos FontAwesome

const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProMedium: require("../../../../../../assets/fonts/CeraRoundProMedium.otf"),
    CeraRoundProBold: require("../../../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProRegular: require("../../../../../../assets/fonts/CeraRoundProRegular.otf"),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return children;
};

const App = () => {
  const [nombreRol, setNombreRol] = useState(""); // Estado para el nombre del rol
  const [descripcion, setDescripcion] = useState(""); // Estado para la descripción
  const [nombreError, setNombreError] = useState(""); // Estado para el error del nombre
  const [descripcionError, setDescripcionError] = useState(""); // Estado para el error de la descripción
  const [isSmallScreen, setIsSmallScreen] = useState(false); // Para ajustar diseño en pantallas pequeñas
  const router = useRouter(); // Para redirigir
  const userUID = getUserUID(); // Obtener el UID y el estado de carga

  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    const updateLayout = () => {
      setIsSmallScreen(Dimensions.get("window").width < 768); // Detecta pantallas más pequeñas
    };

    Dimensions.addEventListener("change", updateLayout);
    return () => Dimensions.removeEventListener("change", updateLayout);
  }, []);

  const handleCrearRol = async () => {
    // Reseteamos los errores antes de validar
    setNombreError("");
    setDescripcionError("");

    // Validación de campos
    let hasError = false;
    if (nombreRol.trim() === "") {
      setNombreError(
        "El nombre del rol es obligatorio y no puede contener solo espacios"
      );
      hasError = true;
    }
    if (descripcion.trim() === "") {
      setDescripcionError(
        "La descripción es obligatoria y no puede contener solo espacios"
      );
      hasError = true;
    }

    if (!hasError) {
      try {
        // Obtenemos el registro de la clínica asociada
        const registroClinica = await obtenerRegistroClinicaAsociada(userUID);

        if (registroClinica) {
          // Validar si el nombre del rol ya existe en la clínica
          const nombreExiste = await verificarNombreRolExistente(
            registroClinica,
            nombreRol.trim()
          );
          if (nombreExiste) {
            setNombreError(
              "El nombre del rol ya está en uso. Elija otro nombre."
            );
            return; // Salir de la función si el nombre ya existe
          }

          // Llamamos a la función crearRol con los datos correctos
          await crearRol(registroClinica, nombreRol.trim(), descripcion.trim());

          console.log("Rol creado exitosamente:", {
            nombreRol: nombreRol.trim(),
            descripcion: descripcion.trim(),
          });

          // Limpiamos los campos después de la creación
          setNombreRol("");
          setDescripcion("");

          // Mostrar modal de éxito
          setModalTitle("Éxito");
          setModalMessage("El rol se ha creado correctamente");
          setModalType("success");
          setModalVisible(true);

          // No redirigimos aquí; lo haremos al cerrar el modal
          // router.replace("/views/web/admin/Componentes/Roles&Permisos/AdministrarRoles");
        } else {
          console.error("No se pudo obtener el registro de la clínica.");
          setNombreError(
            "No se encontró una clínica asociada para este usuario."
          );
        }
      } catch (error) {
        console.error("Error al crear el rol:", error);
        setNombreError("Ocurrió un error al intentar crear el rol.");
      }
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      router.replace(
        "/views/web/admin/Componentes/Roles&Permisos/AdministrarRoles"
      );
    }
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["crearroles"]}
    >
      <LoadFonts>
        <View style={styles.container}>
          <Menu />
          <View style={styles.mainContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>◀ VOLVER</Text>
            </TouchableOpacity>

            <Text style={styles.title}>CREAR ROL</Text>

            {/* Contenedor de formulario e imagen */}
            <View
              style={[
                styles.formContainer,
                isSmallScreen
                  ? styles.smallScreenContainer
                  : styles.largeScreenContainer,
              ]}
            >
              {/* Imagen que cambia de posición según el tamaño de la pantalla */}
              {isSmallScreen && (
                <Image
                  source={require("./Imagenes/personal.jpg")} // Asegúrate de que esta ruta sea correcta
                  style={styles.image}
                />
              )}

              {/* Formulario a la izquierda o debajo según la pantalla */}
              <View style={styles.formLeft}>
                <Text style={styles.label}>NOMBRE DE ROL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el nombre del rol"
                  value={nombreRol}
                  onChangeText={setNombreRol}
                />
                {nombreError ? (
                  <Text style={styles.errorText}>{nombreError}</Text>
                ) : null}

                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={styles.textarea}
                  multiline
                  placeholder="Ingrese una descripción"
                  value={descripcion}
                  onChangeText={setDescripcion}
                />
                {descripcionError ? (
                  <Text style={styles.errorText}>{descripcionError}</Text>
                ) : null}

                {/* Botones a la izquierda */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCrearRol}
                    style={styles.createButton}
                  >
                    <Text style={styles.createButtonText}>Registrar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Imagen en la derecha en pantallas grandes */}
              {!isSmallScreen && (
                <Image
                  source={require("./Imagenes/personal.jpg")} // Asegúrate de que esta ruta sea correcta
                  style={styles.image}
                  resizeMode="cover"
                />
              )}
            </View>
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
                  onPress={handleModalClose}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </LoadFonts>
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
    flexDirection: "column",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backText: {
    fontFamily: "CeraRoundProMedium",
    fontSize: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
  },
  formContainer: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  largeScreenContainer: {
    flexDirection: "row", // Para pantallas grandes
  },
  smallScreenContainer: {
    flexDirection: "column", // Para pantallas pequeñas
  },
  formLeft: {
    flex: 1, // Hace que la parte del formulario ocupe más espacio
    paddingRight: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: "CeraRoundProMedium",
    alignSelf: "flex-start",
  },
  input: {
    width: "100%", // Ancho ajustado a 100% para pantallas pequeñas
    padding: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 5,
    marginBottom: 5,
    fontFamily: "CeraRoundProMedium",
  },
  textarea: {
    width: "100%", // Ancho ajustado a 100% para pantallas pequeñas
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 5,
    height: 200,
    marginBottom: 5,
    fontFamily: "CeraRoundProMedium",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    fontFamily: "CeraRoundProMedium",
  },
  image: {
    width: 400, // Tamaño de la imagen
    height: 300,
    marginLeft: 10, // Espacio entre la imagen y el formulario
    resizeMode: "contain", // Ajusta la imagen al tamaño del contenedor
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start", // Alinea los botones a la izquierda
    marginTop: 20,
  },
  createButton: {
    backgroundColor: "#37817A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 5,
  },
  createButtonText: {
    color: "#FFF",
    fontFamily: "CeraRoundProMedium",
  },
  cancelButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#37817A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 5,
  },
  cancelButtonText: {
    color: "#37817A",
    fontFamily: "CeraRoundProMedium",
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

export default App;
