import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Button,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import styles from "../../../../styles/styles";
import RBSheet from "react-native-raw-bottom-sheet"; // Importa el componente RBSheet
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
  Toast,
  AlertNotificationDialog,
} from "react-native-alert-notification";

import searchDoctorByCode from "../../../../src/queryfb/doctor/searchDoctorByCode";
import searchPatientByCode from "../../../../src/queryfb/paciente/searchPatientByCode";
import setPatientPrescription from "../../../../src/queryfb/paciente/setPatientPrescription";
import { Link, useRouter } from "expo-router";

import DataContext from "./DataContext";
import ProtectedRoute from "../Componentes/ProtectedRoute";

export default function AgregaRecetaMovil() {
  //Estados para componentes cuando se busca un paciente
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isMedListVisible, setIsMedListVisible] = useState(false);
  const [areActionButtonsVisible, setAreActionButtonsVisible] = useState(false);

  //backend
  const {
    identificacion,
    setData,
    modo,
    setModo,
    evaluacion,
    setEvaluacion,
    farmacos,
    setFarmacos,
  } = useContext(DataContext);
  const refRBSheet = useRef(); // Referencia al componente RBSheet{}
  const richTextRef = useRef(); // Cambiado
  const richTextRef2 = useRef(); // Nueva referencia para el segundo editor de texto enriquecido
  const router = useRouter();

  const [nombreMedicamento, setNombreMedicamento] = useState("");
  const [duracion, setDuracion] = useState(0);
  const [unidad, setUnidad] = useState(0);
  const [cada, setCada] = useState(0);
  const [prescriptionNote, setPrescriptionNote] = useState("");
  const [disablePatient, setdisablePatient] = useState(true);
  const [isPatientMenuOpen, setIsPatientMenuOpen] = useState(false);
  const [diagnosticoData, setDiagnosticoData] = useState("");
  const [medicoData, setMedicoData] = useState("");
  const [pacienteData, setPacienteData] = useState("");
  const [inputText, setInputText] = useState("");
  const [selectedOption, setSelectedOption] = useState("DUI");
  const [medicamentos, setMedicamentos] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDoctorMenuOpen, setIsDoctorMenuOpen] = useState(false);
  const [isTimeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [selectedTimeOption, setSelectedTimeOption] = useState(null);
  const [isMedicationTypeDropdownOpen, setMedicationTypeDropdownOpen] =
    useState(false);
  const [selectedMedicationType, setSelectedMedicationType] = useState(null);
  const [
    isAdministrationRouteDropdownOpen,
    setAdministrationRouteDropdownOpen,
  ] = useState(false);
  const [selectedAdministrationRoute, setSelectedAdministrationRoute] =
    useState(null);
  const [isTreatmentDurationDropdownOpen, setTreatmentDurationDropdownOpen] =
    useState(false);
  const [selectedTreatmentDuration, setSelectedTreatmentDuration] =
    useState(null);

  // Varible para recibir index del medicamento a modificar
  const [indexMod, setindexMod] = useState(null);

  // Verifica si hay una sesión de paciente activa
  useEffect(() => {
    if (!identificacion) {
      return console.log("Función no disponible");
    }
    console.log("ID:", identificacion);
    if (identificacion) {
      console.log("SetInputText dento de sesion global" + identificacion);
      setInputText(identificacion);
      setSelectedOption(modo);
      setDiagnosticoData(evaluacion);
      const upFarmacos = JSON.parse(farmacos); // Recibe json con arreglo de medicamentos
      setMedicamentos(upFarmacos);
      console.log("Sesión activa por error");
    }

    identificacion
      ? handleSearchPatient()
      : console.log("No hay sesiones activas");
  }, [identificacion, modo, evaluacion, farmacos]);

  // Función para abrir el bottom sheet y agregar una nota de prescripción
  const openPrescriptionNoteEditor = () => {
    refRBSheet.current.open(); // Abre el bottom sheet
  };

  // Maneja la acción de cerrar bottom sheet desde botón cancelar
  const closeWindow = () => {
    console.log("Ventana cerrada");
    vaciarBottomSheet();
    refRBSheet.current.close(); // Cierra el bottom sheet
  };

  // Maneja la acción de guardar la nota de prescripción
  const savePrescriptionNote = (index) => {
    console.log("INDEX MOD OR INSERT: " + index);
    const medicamentosAdd = {
      nombre_medicamento: nombreMedicamento,
      duracion_tratamiento: {
        numero: duracion,
        tiempo: selectedTreatmentDuration,
      },
      frecuencia_administracion: {
        dosis: unidad,
        cada: cada,
        tiempo: selectedTimeOption,
      },
      informacion_adicional: prescriptionNote,
      via_administracion: selectedAdministrationRoute,
      tipo_medicamento: selectedMedicationType,
    };

    if (index === null) {
      setMedicamentos((prevMedicamentos) => [
        ...prevMedicamentos,
        medicamentosAdd,
      ]);
    } else {
      const medicamentosArray = medicamentos.flat();
      medicamentosArray[index] = medicamentosAdd;
      setMedicamentos(medicamentosArray);
    }

    vaciarBottomSheet();

    refRBSheet.current.close(); // Cierra el bottom sheet
  };

  const vaciarBottomSheet = () => {
    setSelectedTimeOption(false);
    setSelectedMedicationType(null);
    setSelectedAdministrationRoute(null);
    setSelectedTreatmentDuration(null);
    setNombreMedicamento("");
    setDuracion(0);
    setUnidad(0);
    setCada(0);
    setPrescriptionNote("");
  };

  const handleTimeOptionSelect = (option) => {
    setSelectedTimeOption(option);
    setTimeDropdownOpen(false);
  };

  const handleMedicationTypeSelect = (option) => {
    setSelectedMedicationType(option);
    setMedicationTypeDropdownOpen(false);
  };

  // Función para seleccionar una opción de vía de administración
  const handleAdministrationRouteSelect = (option) => {
    setSelectedAdministrationRoute(option);
    setAdministrationRouteDropdownOpen(false);
  };

  const handleTreatmentDurationSelect = (option) => {
    setSelectedTreatmentDuration(option);
    setTreatmentDurationDropdownOpen(false);
  };

  // Carga las fuentes personalizadas
  const [fontsLoaded, fontError] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
  });

  const options = ["DUI", "EXP"];

  const handleSearchPatient = async () => {
    try {
      const data = await searchPatientByCode(
        selectedOption,
        inputText || identificacion
      );
      console.log("Test de resultados: " + data);
      console.log("Opc:" + selectedOption + " input: " + inputText);
      if (data) {
        console.log("Esta es una alerta desde dentro de las acciones");
        setPacienteData(data);
        console.log("La información del paciente es: " + data?.nombre);
        setIsPatientMenuOpen(true);
        setdisablePatient(false);
        setIsTextVisible(true); // Asegurarse de que el texto esté oculto si no se encuentra el paciente
        setIsEditorVisible(true); // Asegurarse de que el editor esté oculto si no se encuentra el paciente
        setIsButtonVisible(true); // Mostrar el botón de agregar medicamento
        setIsMedListVisible(true); // Asegurarse de que la lista de medicamentos esté oculta si no se encuentra el paciente
        setAreActionButtonsVisible(true); // Mostrar los botones de acción
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "¡Oops!",
          textBody: "Paciente no encontrado, escriba bien su DUI o Expediente.",
          button: "Cerrar",
          onPressButton: () => Dialog.hide(),
        });
        setPacienteData(null); // O setPacienteData
        setIsPatientMenuOpen(false); // Cierra el menú del paciente
        setInputText("");
        setIsTextVisible(false); // Asegurarse de que el texto esté oculto si no se encuentra el paciente
        setIsEditorVisible(false); // Asegurarse de que el editor esté oculto si no se encuentra el paciente
        setIsButtonVisible(false); // Mostrar el botón de agregar medicamento
        setIsMedListVisible(false);
        setAreActionButtonsVisible(false); // Asegurarse de que los botones de acción estén ocultos si no se encuentra el paciente
      }
    } catch (error) {
      console.error(error); // Manejar el error de búsqueda
    }
  };

  // Función para consultar datos del Médico
  useEffect(() => {
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

  // Prevenir el autohide de la pantalla de carga
  SplashScreen.preventAutoHideAsync();

  // Oculta la pantalla de carga una vez que las fuentes se hayan cargado o haya un error
  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplashScreen();
  }, [fontsLoaded, fontError]);

  // Maneja la selección de una opción
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsMenuOpen(false);
  };

  // Maneja la apertura y cierre del menú de información del doctor
  const toggleDoctorMenu = () => {
    setIsDoctorMenuOpen(!isDoctorMenuOpen);
  };
  const togglePatientMenu = () => {
    setIsPatientMenuOpen(!isPatientMenuOpen);
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Función para agregar un medicamento ficticio y mostrar el bottom sheet
  const agregarMedicamento = () => {
    vaciarBottomSheet();
    setindexMod(null);
    refRBSheet.current.open(); // Abre el bottom sheet
  };

  // Función para eliminar un medicamento de la lista
  const eliminarMedicamento = (index) => {
    const medicamentosArray = medicamentos.flat(); // Aplanar cualquier array anidado
    setMedicamentos(medicamentosArray.filter((_, idx) => idx !== index));
  };

  const modificarMedicamento = (indexMot) => {
    const medicamentosArray = medicamentos.flat();
    const medSelect = medicamentosArray[indexMot];
    setindexMod(indexMot);

    setNombreMedicamento(medSelect.nombre_medicamento);
    setUnidad(medSelect.frecuencia_administracion.dosis);
    setCada(medSelect.frecuencia_administracion.cada);
    setSelectedTimeOption(medSelect.frecuencia_administracion.tiempo);
    setSelectedMedicationType(medSelect.tipo_medicamento);
    setSelectedAdministrationRoute(medSelect.via_administracion);
    setDuracion(medSelect.duracion_tratamiento.numero);
    setSelectedTreatmentDuration(medSelect.duracion_tratamiento.tiempo);
    setPrescriptionNote(medSelect.informacion_adicional);

    refRBSheet.current.open();
  };

  const renderMedicamentos = () => {
    return medicamentos.map((medicamento, index) => (
      <View
        key={`${medicamento.nombre_medicamento}-${index}`}
        style={styles.medicamentoItem}
      >
        <FontAwesome
          name="edit"
          size={20}
          color="#999999"
          style={styles.editIcon}
        />
        <Text style={styles.medicamentoNombre}>
          {medicamento.nombre_medicamento}
        </Text>
        <TouchableOpacity
          onPress={() => eliminarMedicamento(medicamento.nombre_medicamento)}
        >
          <FontAwesome
            name="times"
            size={20}
            color="#999999"
            style={styles.deleteIcon}
          />
        </TouchableOpacity>
      </View>
    ));
  };

  const handleHistorialMedico = () => {
    setEvaluacion(diagnosticoData);
    const farmacosArray = medicamentos.flat();
    const jsonFarmacos = JSON.stringify(farmacosArray);
    setFarmacos(jsonFarmacos);
    setData(
      selectedOption === "DUI"
        ? pacienteData.identificacion
        : pacienteData.expediente
    );
    setModo(selectedOption);
    router.push("views/movil/doctor/ExpedientePaciente");
  };

  const onSubmit = () => {
    if (!inputText) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Complete el Campo de Buscar Paciente",
        button: "Ok",
        closeOnOverlayTap: false,
      });
    } else {
      setMedicamentos([]);
      setDiagnosticoData("");
      setData("");
      setEvaluacion("");
      setFarmacos("[]");
      handleSearchPatient();
    }
  };

  return (
    <ProtectedRoute>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Rectángulo en la parte superior con bordes redondeados en la parte inferior */}
        <View style={styles.rectangle}>
          {/* Texto "WELCOME" con fuente CeraRoundProRegular */}
          <Text style={styles.welcomeText}>HealTech</Text>
          {/* Texto "Doctor" con fuente CeraRoundProLight */}

          {/* Contenedor de barra de búsqueda y menú desplegable */}
          <View style={styles.searchContainer}>
            {/* Contenedor del TextInput */}
            <View style={styles.inputContainer}>
              {/* Ícono de búsqueda */}
              <FontAwesome
                name="search"
                size={20}
                color="#000000"
                onPress={handleSearchPatient}
                style={styles.icon}
              />

              {/* TextInput */}
              <TextInput
                style={styles.textInput}
                placeholder="Busca tu paciente"
                placeholderTextColor="#999999"
                value={inputText.trim()}
                onChangeText={(text) => setInputText(text.trim())}
                onSubmitEditing={onSubmit}
              />

              {/* Mostrar ícono de cancelar si hay texto */}
              {inputText.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setInputText("")}
                >
                  <FontAwesome name="times" size={20} color="#000000" />
                </TouchableOpacity>
              )}
            </View>

            {/* Botón para abrir el menú desplegable */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setIsMenuOpen(!isMenuOpen)}
            >
              {/* Contenedor para el texto y el ícono */}
              <View style={styles.menuButtonContent}>
                {/* Texto "opción" */}
                <Text style={styles.optionText}>{selectedOption}</Text>
                {/* Ícono de selección, cambia de dirección según el estado del menú */}
                <FontAwesome
                  name={isMenuOpen ? "chevron-up" : "chevron-down"}
                  size={20}
                  style={{ paddingRight: 10 }}
                  color="#000000"
                />
              </View>
            </TouchableOpacity>

            {/* Menú desplegable */}
            {isMenuOpen && (
              <View style={styles.dropdownMenu}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.option}
                    onPress={() => handleOptionSelect(option)}
                  >
                    {/* Mostrar el texto de la opción */}
                    <Text style={styles.optionText}>{option}</Text>
                    {/* Mostrar ícono de cheque si es la opción seleccionada */}
                    {selectedOption === option && (
                      <FontAwesome name="check" size={20} color="#000000" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Botón para desplegar el dropdown de datos del paciente */}
        <TouchableOpacity
          style={styles.patientMenuButton}
          onPress={togglePatientMenu}
          disabled={disablePatient}
        >
          <View style={styles.menuButtonContent}>
            <Text style={styles.optionText4w}>Datos del paciente</Text>
            {/* Icono para indicar si el menú está abierto o cerrado */}
            <FontAwesome
              name={isPatientMenuOpen ? "chevron-up" : "chevron-down"}
              size={20}
              style={{ paddingRight: 10 }}
              color="#000000"
            />
          </View>
        </TouchableOpacity>

        {/* Dropdown de datos personales del paciente */}
        {isPatientMenuOpen && (
          <View style={styles.patientDropdownContainer}>
            <View style={styles.patientDropdownMenu}>
              {/* Información del paciente con íconos */}

              <View style={styles.patientDataField}>
                <FontAwesome name="user" size={20} color="black" />
                <Text style={styles.patientInfoText}>
                  {pacienteData?.nombre}
                </Text>
              </View>

              <View style={styles.patientDataField}>
                <FontAwesome name="map-marker" size={20} color="black" />
                <Text style={styles.patientInfoText}>
                  {pacienteData?.direccion}
                </Text>
              </View>

              <View style={styles.patientDataField}>
                <FontAwesome name="phone" size={20} color="black" />
                <Text style={styles.patientInfoText}>
                  {pacienteData?.telefono}
                </Text>
              </View>
            </View>

            {/* Botón de expediente, posicionado en la parte inferior derecha */}
            <TouchableOpacity
              style={styles.medicalHistoryButton}
              onPress={handleHistorialMedico}
            >
              <Text style={styles.medicalHistoryButtonText}>
                Ver expediente
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isTextVisible && (
          <Text style={styles.bigCenteredText}>Diagnóstico</Text>
        )}

        {/* Renderiza el editor de texto enriquecido basado en el estado */}
        {isEditorVisible && (
          <View style={styles.editorWrapper}>
            <TextInput
              style={styles.simpleTextInput}
              placeholder="Escribe tu nota de prescripción aquí..."
              multiline
              value={diagnosticoData}
              onChangeText={(text) => setDiagnosticoData(text)}
            />
          </View>
        )}

        {/* Renderiza el botón basado en el estado */}
        {isButtonVisible && (
          <TouchableOpacity
            style={styles.addMedicineButton}
            onPress={agregarMedicamento}
          >
            <Text style={styles.addMedicineButtonText}>
              Agregar Medicamento
            </Text>
          </TouchableOpacity>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          style={{ flex: 1 }}
        >
          <RBSheet
            ref={refRBSheet}
            height={500}
            openDuration={700}
            closeOnPressMask={false}
            draggable={true}
            statusBarTranslucent={true}
            customStyles={{
              container: {
                paddingHorizontal: 20,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                position: "absolute",
                flexGrow: 1,
                justifyContent: "flex-start",
                bottom: 0,
                left: 0,
                right: 0,
              },
            }}
          >
            <Text
              style={{
                fontFamily: "CeraRoundProBlack",
                fontSize: 16,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {indexMod === null ? "Agregar" : "Modificar"} Medicamento
            </Text>

            <View style={styles.separator} />
            <ScrollView style={{ flex: 1 }}>
              <View style={{ paddingTop: 20 }}>
                <Text
                  style={{
                    fontFamily: "CeraRoundProRegular",
                    fontSize: 14,
                    marginBottom: 5,
                  }}
                >
                  Medicamento
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#E0E0E0",
                    borderRadius: 10,
                    height: 40,
                    width: "100%",
                    paddingHorizontal: 10,
                    marginBottom: 20,
                  }}
                  value={nombreMedicamento.trim()}
                  onChangeText={(text) => {
                    setNombreMedicamento(text.trim());
                  }}
                  placeholder="Escriba el nombre del medicamento"
                  placeholderTextColor="#999999"
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{ fontFamily: "CeraRoundProRegular", fontSize: 14 }}
                  >
                    Unidad:
                  </Text>
                  <Text
                    style={{ fontFamily: "CeraRoundProRegular", fontSize: 14 }}
                  >
                    Cada:
                  </Text>
                  <Text
                    style={{ fontFamily: "CeraRoundProRegular", fontSize: 14 }}
                  >
                    Tiempo:
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Inputs anteriores */}
                  <TextInput
                    style={{
                      backgroundColor: "#E0E0E0",
                      borderRadius: 10,
                      height: 30,
                      paddingHorizontal: 10,
                      width: "30%",
                      marginBottom: 10,
                    }}
                    value={unidad}
                    onChangeText={(text) => {
                      setUnidad(text.trim());
                    }}
                    inputMode="numeric"
                    placeholder="Unidad"
                    placeholderTextColor="#999999"
                  />
                  <TextInput
                    style={{
                      backgroundColor: "#E0E0E0",
                      borderRadius: 10,
                      height: 30,
                      paddingHorizontal: 10,
                      width: "30%",
                      marginBottom: 10,
                    }}
                    value={cada}
                    onChangeText={(text) => setCada(text.trim())}
                    inputMode="numeric"
                    placeholder="Cada"
                    placeholderTextColor="#999999"
                  />

                  {/* Menú desplegable de tiempo */}
                  <TouchableOpacity
                    onPress={() => setTimeDropdownOpen(!isTimeDropdownOpen)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      width: "30%",
                      backgroundColor: "#E0E0E0",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      height: 30,
                    }}
                  >
                    <Text style={{ flex: 1 }}>
                      {selectedTimeOption ? selectedTimeOption : "Seleccione"}
                    </Text>
                    <FontAwesome
                      name={isTimeDropdownOpen ? "angle-up" : "angle-down"}
                      size={20}
                    />
                  </TouchableOpacity>
                </View>

                {/* Menú desplegable de tiempo */}
                {isTimeDropdownOpen && (
                  <View
                    style={{
                      position: "absolute",
                      zIndex: 2,
                      width: "30%",
                      backgroundColor: "#E0E0E0",
                      borderRadius: 10,
                      marginTop: 180,
                      marginLeft: "70%",
                      zIndex: 40,
                    }}
                  >
                    {/* Opciones del menú desplegable */}
                    <TouchableOpacity
                      onPress={() => handleTimeOptionSelect("Horas")}
                      style={{
                        paddingHorizontal: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ paddingVertical: 5 }}>Horas</Text>
                      {selectedTimeOption === "Horas" && (
                        <FontAwesome name="check" size={20} color="#999999" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleTimeOptionSelect("Días")}
                      style={{
                        paddingHorizontal: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ paddingVertical: 5 }}>Días</Text>
                      {selectedTimeOption === "Días" && (
                        <FontAwesome name="check" size={20} color="#999999" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Menú desplegable de tipo de medicamento */}
                <View style={{ marginTop: 20 }}>
                  <Text
                    style={{
                      fontFamily: "CeraRoundProRegular",
                      fontSize: 14,
                      marginBottom: 5,
                      zIndex: -40,
                    }}
                  >
                    Tipo de medicamento:
                  </Text>
                  {/* Menú desplegable de tipo de medicamento */}
                  <TouchableOpacity
                    onPress={() =>
                      setMedicationTypeDropdownOpen(
                        !isMedicationTypeDropdownOpen
                      )
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#E0E0E0",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      height: 40,
                      width: "100%",
                      marginBottom: 20,
                    }}
                  >
                    <Text style={{ flex: 1 }}>
                      {selectedMedicationType
                        ? selectedMedicationType
                        : "Selecciona"}
                    </Text>
                    <FontAwesome
                      name={
                        isMedicationTypeDropdownOpen ? "angle-up" : "angle-down"
                      }
                      size={20}
                    />
                  </TouchableOpacity>
                  {/* Desplegable de tipo de medicamento */}
                  {isMedicationTypeDropdownOpen && (
                    <View
                      style={{
                        backgroundColor: "#E0E0E0",
                        borderRadius: 10,
                        marginTop: -2,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleMedicationTypeSelect("Cápsula")}
                        style={{
                          paddingHorizontal: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <Text>Cápsula</Text>
                        {selectedMedicationType === "Cápsula" && (
                          <FontAwesome name="check" size={20} color="#999999" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleMedicationTypeSelect("Ampolla")}
                        style={{
                          paddingHorizontal: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <Text>Ampolla</Text>
                        {selectedMedicationType === "Ampolla" && (
                          <FontAwesome name="check" size={20} color="#999999" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleMedicationTypeSelect("Tópico")}
                        style={{
                          paddingHorizontal: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <Text>Tópico</Text>
                        {selectedMedicationType === "Tópico" && (
                          <FontAwesome name="check" size={20} color="#999999" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Menú desplegable de vía de administración */}
                <View style={{ marginTop: 20 }}>
                  <Text
                    style={{
                      fontFamily: "CeraRoundProRegular",
                      fontSize: 14,
                      marginBottom: 5,
                      zIndex: -40,
                    }}
                  >
                    Vía de administración:
                  </Text>
                  {/* Menú desplegable de vía de administración */}
                  <TouchableOpacity
                    onPress={() =>
                      setAdministrationRouteDropdownOpen(
                        !isAdministrationRouteDropdownOpen
                      )
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#E0E0E0",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      height: 40,
                      width: "100%",
                      marginBottom: 20,
                    }}
                  >
                    <Text style={{ flex: 1 }}>
                      {selectedAdministrationRoute
                        ? selectedAdministrationRoute
                        : "Selecciona"}
                    </Text>
                    <FontAwesome
                      name={
                        isAdministrationRouteDropdownOpen
                          ? "angle-up"
                          : "angle-down"
                      }
                      size={20}
                    />
                  </TouchableOpacity>
                  {/* Desplegable de vía de administración */}
                  {isAdministrationRouteDropdownOpen && (
                    <View
                      style={{
                        backgroundColor: "#E0E0E0",
                        borderRadius: 10,
                        marginTop: -2,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          handleAdministrationRouteSelect("Vía oral")
                        }
                        style={{
                          paddingHorizontal: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <Text>Vía oral</Text>
                        {selectedAdministrationRoute === "Vía oral" && (
                          <FontAwesome name="check" size={20} color="#999999" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleAdministrationRouteSelect("Intravenosa")
                        }
                        style={{
                          paddingHorizontal: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <Text>Intravenosa</Text>
                        {selectedAdministrationRoute === "Intravenosa" && (
                          <FontAwesome name="check" size={20} color="#999999" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleAdministrationRouteSelect("Intramuscular")
                        }
                        style={{
                          paddingHorizontal: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <Text>Intramuscular</Text>
                        {selectedAdministrationRoute === "Intramuscular" && (
                          <FontAwesome name="check" size={20} color="#999999" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {/* Menú desplegable de Duracion de tratamiento */}
                <View style={{ marginTop: 20 }}>
                  <Text
                    style={{
                      fontFamily: "CeraRoundProRegular",
                      fontSize: 14,
                      marginBottom: 5,
                      zIndex: -40,
                    }}
                  >
                    Duración de tratamiento:
                  </Text>
                  {/* Input de duración de tratamiento */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <TextInput
                      style={{
                        backgroundColor: "#E0E0E0",
                        borderRadius: 10,
                        height: 30,
                        paddingHorizontal: 10,
                        width: "38%",
                        marginBottom: 10,
                      }}
                      value={duracion}
                      onChangeText={(text) => setDuracion(text.trim())}
                      inputMode="numeric"
                      placeholder="Número"
                      placeholderTextColor="#999999"
                    />
                    {/* Menú desplegable de duración de tratamiento */}
                    <TouchableOpacity
                      onPress={() =>
                        setTreatmentDurationDropdownOpen(
                          !isTreatmentDurationDropdownOpen
                        )
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "30%",
                        backgroundColor: "#E0E0E0",
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        height: 30,
                      }}
                    >
                      <Text style={{ flex: 1 }}>
                        {selectedTreatmentDuration
                          ? selectedTreatmentDuration
                          : "Seleccione"}
                      </Text>
                      <FontAwesome
                        name={
                          isTreatmentDurationDropdownOpen
                            ? "angle-up"
                            : "angle-down"
                        }
                        size={20}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Menú desplegable de duración de tratamiento */}
                  {isTreatmentDurationDropdownOpen && (
                    <View
                      style={{
                        position: "absolute",
                        zIndex: 2,
                        width: "30%",
                        backgroundColor: "#E0E0E0",
                        borderRadius: 10,
                        marginTop: 60,
                        marginLeft: "70%",
                      }}
                    >
                      {/* Opciones del menú desplegable */}
                      <TouchableOpacity
                        onPress={() => handleTreatmentDurationSelect("Horas")}
                        style={{
                          paddingHorizontal: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ paddingVertical: 5 }}>Horas</Text>
                        {selectedTreatmentDuration === "Horas" && (
                          <FontAwesome name="check" size={20} color="#999999" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleTreatmentDurationSelect("Días")}
                        style={{
                          paddingHorizontal: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ paddingVertical: 5 }}>Días</Text>
                        {selectedTreatmentDuration === "Días" && (
                          <FontAwesome name="check" size={20} color="#999999" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <View style={{ paddingTop: 20 }}>
                  {/* Título del editor de texto enriquecido */}
                  <Text
                    style={{
                      fontFamily: "CeraRoundProRegular",
                      fontSize: 14,
                      textAlign: "center",
                      marginBottom: 20,
                    }}
                  >
                    Agregar Nota de Prescripción
                  </Text>
                  <TextInput
                    style={{
                      height: 200, // Altura fija para el campo de texto
                      backgroundColor: "#D9D9D9", // Color de fondo
                      fontSize: 16, // Tamaño de fuente
                      color: "black", // Color del texto
                      fontFamily: "CeraRoundProRegular", // Fuente personalizada
                      padding: 10, // Espacio interno
                      borderRadius: 8, // Borde redondeado
                      textAlignVertical: "top", // Asegura que el texto empieza desde arriba
                    }}
                    placeholder="Escribe tu nota de prescripción aquí..."
                    multiline
                    value={prescriptionNote}
                    onChangeText={(text) => setPrescriptionNote(text)}
                  />

                  {/* Contenedor de los botones */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 20,
                    }}
                  >
                    {/* Botón Cancelar */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: "white", // Fondo blanco
                        borderRadius: 16, // Borde redondeado
                        alignItems: "center", // Centrar el texto horizontalmente
                        justifyContent: "center", // Centrar el texto verticalmente
                        height: 40,
                        width: "48%", // Ancho ajustado para dejar espacio al botón "Guardar"
                        borderWidth: 2, // Ancho del borde
                        borderColor: "#37817A", // Color del borde// Ancho ajustado para dejar espacio al botón "Guardar"
                      }}
                      onPress={closeWindow}
                    >
                      <Text
                        style={{
                          color: "#37817A",
                          fontFamily: "CeraRoundProRegular",
                        }}
                      >
                        Cancelar
                      </Text>
                    </TouchableOpacity>

                    {/* Botón Guardar */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#37817A",
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        height: 40,
                        width: "48%", // Ancho ajustado para dejar espacio al botón "Cancelar"
                      }}
                      onPress={() => savePrescriptionNote(indexMod)}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontFamily: "CeraRoundProBlack",
                        }}
                      >
                        {indexMod === null ? "Guardar" : "Modificar"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </RBSheet>
        </KeyboardAvoidingView>
        <Text style={styles.medicamentosTitle}>Lista de medicamentos</Text>

        {/* Renderiza la lista de medicamentos basada en el estado */}
        {isMedListVisible && (
          <View style={styles.medicamentosContainer}>
            {/* Muestra la lista de medicamentos */}
            {medicamentos.flat().map((medicamento, index) => (
              <View key={index} style={styles.medicamentoItem}>
                {/* Ícono de editar */}

                {/* Nombre del medicamento */}
                <Text style={styles.medicamentoNombre}>
                  {medicamento.nombre_medicamento}
                </Text>
                <TouchableOpacity onPress={() => modificarMedicamento(index)}>
                  <FontAwesome
                    name="edit"
                    size={20}
                    color="#999999"
                    style={styles.editIcon}
                  />
                </TouchableOpacity>
                {/* Ícono de eliminar */}
                <TouchableOpacity onPress={() => eliminarMedicamento(index)}>
                  <FontAwesome
                    name="times"
                    size={20}
                    color="#999999"
                    style={styles.deleteIcon}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <AlertNotificationRoot>
          {areActionButtonsVisible && (
            <View style={styles.buttonContainer}>
              {/* Botón Cancelar */}
              <TouchableOpacity
                style={styles.cancelarButton}
                onPress={() =>
                  Dialog.show({
                    type: ALERT_TYPE.WARNING,
                    title: "Cancelar Receta",
                    textBody: "Estas seguro que quieres cancelar la receta!?",
                    button: "Cancelar Receta",
                    closeOnOverlayTap: true,
                    onPressButton: () => {
                      setInputText("");
                      setPacienteData("");
                      setDiagnosticoData("");
                      setIsPatientMenuOpen(false);
                      Dialog.hide();
                      setIsTextVisible(false);
                      setIsEditorVisible(false);
                      setIsButtonVisible(false);
                      setIsMedListVisible(false);
                      setAreActionButtonsVisible(false);
                    },
                  })
                }
              >
                <Text style={styles.cancelarButtonText}>Cancelar</Text>
              </TouchableOpacity>

              {/* Botón Enviar */}
              <TouchableOpacity
                style={styles.enviarButton}
                onPress={() => {
                  setPatientPrescription(
                    selectedOption,
                    inputText,
                    medicoData?.nombre || "Indeterminado",
                    medicoData?.telefono || "Indeterminado",
                    diagnosticoData || "Indeterminado",
                    medicamentos || []
                  )
                    .then((message) => {
                      Dialog.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: "Exito",
                        textBody: "La receta ha sido enviada con Exito",
                        button: "Ok",
                        closeOnOverlayTap: true,
                        onPressButton: () => {
                          setInputText("");
                          setPacienteData("");
                          setDiagnosticoData("");
                          setIsPatientMenuOpen(false);
                          setMedicamentos([]);
                          Dialog.hide();
                          setData("");
                          setModo("");
                          setEvaluacion("");
                          setFarmacos("[]");
                          setdisablePatient(true);
                          setIsTextVisible(false);
                          setIsEditorVisible(false);
                          setIsButtonVisible(false);
                          setIsMedListVisible(false);
                          setAreActionButtonsVisible(false);
                        },
                      });
                    })
                    .catch((error) => {
                      Dialog.show({
                        type: ALERT_TYPE.ERROR,
                        title: "Error",
                        textBody: "Error:" + error,
                        button: "Ok",
                        closeOnOverlayTap: true,
                        onPressButton: () => {
                          Dialog.hide();
                        },
                      });
                    });
                }}
              >
                <Text style={styles.enviarButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          )}
        </AlertNotificationRoot>
        <View style={{paddingBottom: 60}}>
        </View>

      </ScrollView>
    </ProtectedRoute>
  );
}
