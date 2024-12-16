import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSearch, faBars } from "@fortawesome/free-solid-svg-icons";
import searchPatientByCode from "../../../../src/queryfb/paciente/searchPatientByCode";
import searchDoctorByCode from "../../../../src/queryfb/doctor/searchDoctorByCode";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { useLocalSearchParams } from "expo-router";
import Header from "./Componentes/Header";
import ProtectedRoute from "../sesion/ProtectedRoute";
import FontAwesome from "react-native-vector-icons/FontAwesome"; // Importamos FontAwesome
import getUserUID from "../../../../src/queryfb/general/getUserUID"; // Importamos getUserUID
import AccessModal from "../verificacion/Acceso";

// Mueve LoadFonts fuera de BuscarPacienteWeb
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

function BuscarPacienteWeb() {
  const [searchType, setSearchType] = useState("DUI"); // Estado para almacenar el tipo de búsqueda seleccionado
  const [inputText, setInputText] = useState(""); // Estado para obtener el texto dentro de la barra de búsqueda
  const [showOptions, setShowOptions] = useState(false); // Estado para controlar la visibilidad de las opciones de búsqueda
  const [pacienteData, setPacienteData] = useState(""); // Estado para almacenar los datos del paciente
  const [medicoData, setMedicoData] = useState("");

  const uid = getUserUID();

  //Función para obtener el paciente
  const router = useRouter();

  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("warning");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [isAccessModalVisible, setIsAccessModalVisible] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientType, setSelectedPatientType] = useState("");

  const handleSearchPatient = async () => {
    try {
      if (!inputText.trim()) {
        setModalTitle("Campo de búsqueda vacío");
        setModalMessage("Por favor, agregue un ID para continuar");
        setModalType("warning");
        setModalVisible(true);
        return;
      }

      const data = await searchPatientByCode(searchType, inputText.trim());
      if (data?.nombre) {
        setPacienteData(data);

        const id = searchType === "DUI" ? data.identificacion : data.expediente;

        // Configura los datos necesarios para la modal
        setSelectedPatientId(id);
        setSelectedPatientType(searchType);
        setIsAccessModalVisible(true); // Abre la modal
      } else {
        setModalTitle("Paciente no encontrado");
        setModalMessage("Verifique el ID y vuelva a intentarlo");
        setModalType("warning");
        setModalVisible(true);
        setInputText("");
      }
    } catch (error) {
      console.error(error); // Manejar el error de búsqueda
    }
  };

  // Función para consultar datos del Médico
  useEffect(() => {
    // Llamar a la función para buscar datos del médico al cargar el componente
    (async () => {
      try {
        const doctorCode = "000000000"; // Obtener el código del médico
        const data = await searchDoctorByCode(doctorCode);
        setMedicoData(data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  // Función para cambiar el tipo de búsqueda y cerrar el desplegable
  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setShowOptions(false);
  };

  return (
    <LoadFonts>
      <ProtectedRoute allowedRoles={["doctor"]}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            <Header />

            <View style={styles.blueBackground}>
              <View style={styles.centeredContent}>
                <Text
                  style={[styles.name, { fontFamily: "CeraRoundProBlack" }]}
                >
                  HEALTECH
                </Text>
                <Text style={styles.bienvenida}>Busca a tu paciente aquí</Text>
                <View style={styles.searchBar}>
                  <TouchableOpacity onPress={handleSearchPatient}>
                    <FontAwesomeIcon icon={faSearch} style={styles.icon} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={(text) => setInputText(text)}
                    onSubmitEditing={handleSearchPatient}
                    placeholder={
                      searchType === "DUI"
                        ? "Buscar por identificación"
                        : "Buscar por expediente"
                    }
                  />
                  <TouchableOpacity
                    onPress={() => setShowOptions(!showOptions)}
                    style={styles.searchType}
                  >
                    {searchType ? (
                      <Text style={styles.searchTypeText}>{searchType}</Text>
                    ) : (
                      <Text style={styles.searchTypeText}></Text>
                    )}
                    <View style={styles.iconContainer}>
                      <FontAwesomeIcon icon={faBars} style={styles.caretIcon} />
                    </View>
                  </TouchableOpacity>
                  {showOptions && (
                    <View style={styles.optionsContainer}>
                      <TouchableOpacity
                        onPress={() => handleSearchTypeChange("DUI")}
                      >
                        <Text style={styles.optionText}>DUI</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleSearchTypeChange("EXP")}
                      >
                        <Text style={styles.optionText}>EXP</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          <AccessModal
            visible={isAccessModalVisible}
            onClose={() => setIsAccessModalVisible(false)} // Función para cerrar la modal
            onSuccessRedirect={() => {
              setIsAccessModalVisible(false);
              router.replace(
                `/views/web/doctor/Expediente?ID=${selectedPatientId}&type=${searchType}`
              );
            }} // Función de redirección en caso de éxito
            patientId={selectedPatientId}
            patientType={selectedPatientType}
          />

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
        </ScrollView>
      </ProtectedRoute>
    </LoadFonts>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    backgroundColor: "#2A2A2E",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    fontFamily: "CeraRoundProMedium",
  },
  bienvenida: {
    color: "white",
    fontSize: 20,
    fontFamily: "CeraRoundProMedium",
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  profileIcon: {
    color: "white",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  blueBackground: {
    flex: 1,
    backgroundColor: "#1F4687",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  centeredContent: {
    alignItems: "center",
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 80,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    fontFamily: "CeraRoundProMedium",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
    backgroundColor: "white",
    color: "black",
    borderRadius: 5,
    marginVertical: 20,
    paddingHorizontal: 10,
    width: "100%",
    maxWidth: 600,
    fontFamily: "CeraRoundProMedium",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  searchType: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
  },
  searchTypeText: {
    marginRight: 5,
    fontFamily: "CeraRoundProMedium",
  },
  caretIcon: {
    marginRight: 0,
    backgroundColor: "white",
  },
  iconContainer: {
    backgroundColor: "white", // Fondo gris
    padding: 8, // Espacio interior para el ícono
    borderRadius: 5, // Redondear las esquinas
    marginLeft: 0, // Espacio entre el campo de texto y el ícono
    marginRight: 0,
  },
  optionsContainer: {
    position: "absolute",
    top: 40,
    right: 0,
    width: "15%",
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "black",
    zIndex: 1,
  },
  optionText: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontFamily: "CeraRoundProMedium",
  },
  icon: {
    marginRight: 10,
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
    width: "40%",
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
export default BuscarPacienteWeb;
