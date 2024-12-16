import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert
} from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";

import {
  ALERT_TYPE,
  Toast,
  AlertNotificationRoot,
  Dialog,
} from 'react-native-alert-notification';
import AccesoM from '../verificacion/AccesoM';

import RBSheet from "react-native-raw-bottom-sheet";
import searchPatientByCode from '../../../../src/queryfb/paciente/searchPatientByCode';
import searchDoctorByCode from "../../../../src/queryfb/doctor/searchDoctorByCode";
import setPatientPrescription from "../../../../src/queryfb/paciente/setPatientPrescription";
import getUserUID from "../../../../src/queryfb/general/getUserUID";
import DataContext from "./DataContext";
import ProtectedRoute from "../Componentes/ProtectedRoute";
import Animated, { Layout, FadeIn, Easing } from 'react-native-reanimated';
import { use } from 'react';
import searchNodeBtUid from "../../../../src/queryfb/doctor/searchNodeByUid";

const Busqueda = () => {
  const [inputText, setInputText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('DUI');
  const [pacienteData, setPacienteData] = useState(null);
  const options = ['DUI', 'EXP.'];
  const [backgroundColor, setBackgroundColor] = useState('#1F4687'); // Estado para el color de fondo
  const inputRef = useRef(null); // Referencia al TextInput
  const userUID = getUserUID();

  const windowHeight = Dimensions.get('window').height;
  const [containerHeight, setContainerHeight] = useState(windowHeight);

  const [fontsLoaded, fontError] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
  });

  // Estados y referencias adicionales para AgregaRecetaMovil
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isMedListVisible, setIsMedListVisible] = useState(false);
  const [areActionButtonsVisible, setAreActionButtonsVisible] = useState(false);
  const [diagnosticoData, setDiagnosticoData] = useState("");
  const [medicoData, setMedicoData] = useState("");
  const [medicamentos, setMedicamentos] = useState([]);
  const refRBSheet = useRef();
  const [disablePatient, setDisablePatient] = useState(true);
  const [isPatientMenuOpen, setIsPatientMenuOpen] = useState(true);
  const [indexMod, setindexMod] = useState(null);
  // Estado para controlar la modal
  const [modalVisible, setModalVisible] = useState(false);
  //expo router
  const router = useRouter();

  // Estados para el Bottom Sheet
  const [nombreMedicamento, setNombreMedicamento] = useState("");
  const [duracion, setDuracion] = useState(0);
  const [unidad, setUnidad] = useState(0);
  const [cada, setCada] = useState(0);
  const [prescriptionNote, setPrescriptionNote] = useState("");
  const [selectedTimeOption, setSelectedTimeOption] = useState(null);
  const [isTimeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [selectedMedicationType, setSelectedMedicationType] = useState(null);
  const [isMedicationTypeDropdownOpen, setMedicationTypeDropdownOpen] = useState(false);
  const [selectedAdministrationRoute, setSelectedAdministrationRoute] = useState(null);
  const [
    isAdministrationRouteDropdownOpen,
    setAdministrationRouteDropdownOpen,
  ] = useState(false);
  const [selectedTreatmentDuration, setSelectedTreatmentDuration] = useState(null);
  const [isTreatmentDurationDropdownOpen, setTreatmentDurationDropdownOpen] = useState(false);

  const {
    identificacion,
    setData,
    modo,
    setModo,
    evaluacion,
    setEvaluacion,
    farmacos,
    setFarmacos,
    searchState,
    setSearchState,
  } = useContext(DataContext);

  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplashScreen();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (searchState) {
      setInputText(searchState.identificacion);
      setSelectedOption(searchState.modo);
      setPacienteData(searchState.pacienteData);
      setIsTextVisible(true);
      setIsEditorVisible(true);
      setIsButtonVisible(true);
      setIsMedListVisible(true);
      setAreActionButtonsVisible(true);
      setDisablePatient(false);
      setBackgroundColor('#FFFFFF');
      setContainerHeight(0.3 * windowHeight);
    }
  }, [searchState]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

   // Función para buscar al paciente y cambiar el fondo
   const handleSearchPatient = async () => {
    try {
      const data = await searchPatientByCode(selectedOption, inputText);
      console.log("Valor de data:", data);

      if (data) {
        setPacienteData(data);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Paciente encontrado",
          textBody: `Nombre: ${data.nombre}`,
          autoClose: 3000,
        });

        // Cambiar el color de fondo a blanco después de la animación
        setContainerHeight(0.3 * windowHeight); // Inicia la animación
        setTimeout(() => {
          setBackgroundColor('#FFFFFF'); // Cambia el fondo a blanco después de 750ms (duración de la animación)
        }, 750);

        // Mostrar componentes adicionales
        setIsTextVisible(true);
        setIsEditorVisible(true);
        setIsButtonVisible(true);
        setIsMedListVisible(true);
        setAreActionButtonsVisible(true);
        setDisablePatient(false);

        // Save the state
        setSearchState({
          identificacion: inputText,
          modo: selectedOption,
          pacienteData: data,
          diagnosticoData: diagnosticoData,
          medicamentos: medicamentos,
        });
      } else {
        console.log("Paciente no encontrado - ejecutando bloque else");
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "¡Oops!",
          textBody: "Paciente no encontrado, revisa el DUI o Expediente.",
          button: "Cerrar",
          onPressButton: () => Dialog.hide(),
        });
        // Restablecer estados y fondo
        setPacienteData(null);
        setInputText("");
        setContainerHeight(windowHeight);
        setBackgroundColor('#1F4687'); // Restaurar el fondo a azul
        setIsTextVisible(false);
        setIsEditorVisible(false);
        setIsButtonVisible(false);
        setIsMedListVisible(false);
        setAreActionButtonsVisible(false);
        setDisablePatient(true);
      }
    } catch (error) {
      console.error("Error en la búsqueda del paciente:", error);
      Dialog.show({
        type: ALERT_TYPE.ERROR,
        title: "Error",
        textBody: "Hubo un problema al buscar el paciente. Intenta de nuevo.",
        button: "Cerrar",
        onPressButton: () => Dialog.hide(),
      });
      // En caso de error, aseguramos que el fondo se mantenga azul
      setBackgroundColor('#1F4687');
    }
  };

  useEffect(() => {
    const fetchMedicoData = async () => {
      try {
        const data = await searchNodeBtUid(userUID);
        console.log("Info del medico: ", data);
        setMedicoData(data);
      } catch (error) {
        console.error("Error fetching medico data:", error);
      }
    };

    fetchMedicoData();
  }, [userUID]);
  // Maneja la selección de una opción
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsMenuOpen(false);
  };

  // Función para limpiar el input y restablecer estados
  const handleClearInput = () => {
    setInputText("");
    setContainerHeight(windowHeight); // Restablecemos la altura al valor inicial
    setPacienteData(null); // Ocultamos la información del paciente
    setIsTextVisible(false);
    setIsEditorVisible(false);
    setIsButtonVisible(false);
    setIsMedListVisible(false);
    setAreActionButtonsVisible(false);
    setDisablePatient(true);
    setMedicamentos([]);
    setDiagnosticoData("");
    setSearchState(null); // Clear the saved state
  };

  // Función para abrir el Bottom Sheet y agregar medicamento
  const agregarMedicamento = () => {
    vaciarBottomSheet();
    setindexMod(null);
    refRBSheet.current.open();
  };

  // Función para vaciar los campos del Bottom Sheet
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

  // Función para guardar el medicamento
  const savePrescriptionNote = (index) => {
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

  // Funciones para seleccionar opciones en los dropdowns
  const handleTimeOptionSelect = (option) => {
    setSelectedTimeOption(option);
    setTimeDropdownOpen(false);
  };

  const handleMedicationTypeSelect = (option) => {
    setSelectedMedicationType(option);
    setMedicationTypeDropdownOpen(false);
  };

  const handleAdministrationRouteSelect = (option) => {
    setSelectedAdministrationRoute(option);
    setAdministrationRouteDropdownOpen(false);
  };

  const handleTreatmentDurationSelect = (option) => {
    setSelectedTreatmentDuration(option);
    setTreatmentDurationDropdownOpen(false);
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

  const togglePatientMenu = () => {
    setIsPatientMenuOpen(!isPatientMenuOpen);
  };

  // Función que se ejecuta al presionar "Ver expediente"
  const handleHistorialMedico = () => {
    setModalVisible(true);
  };
  // Función que se ejecuta cuando el modal de AccesoM se completa con éxito
  const onModalSuccess = () => {
    setModalVisible(false);

    // Aquí puedes establecer los estados necesarios antes de navegar
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

    // Navegar al expediente del paciente
    router.push("./ExpedientePaciente");
  };

  const handleEnviar = () => {
    if (diagnosticoData.trim() !== '' && medicamentos.length > 0) {
      // Proceed to send the prescription
      setPatientPrescription(
        selectedOption,
        inputText,
        medicoData?.nombre || "Indeterminado",
        medicoData?.telefono || "Indeterminado",
        diagnosticoData || "Indeterminado",
        medicamentos || [],
        userUID
      )
        .then((message) => {
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: "Éxito",
            textBody: "La receta ha sido enviada con éxito",
            button: "Ok",
            closeOnOverlayTap: true,
            onPressButton: () => {
              handleClearInput();
              Dialog.hide();
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
    } else {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Advertencia",
        textBody: "Por favor, completa la información de diagnóstico y medicamentos antes de enviar la receta.",
        button: "Ok",
        closeOnOverlayTap: true,
        onPressButton: () => {
          Dialog.hide();
        },
      });
    }
  };

  return (
    <AlertNotificationRoot>
      
 
      <View style={{ flex: 1, backgroundColor: backgroundColor }}>
        {/* Encabezado y campo de búsqueda */}
       
      <Animated.View
        style={[styles.container, { height: containerHeight }]}
        layout={Layout.duration(750).easing(Easing.out(Easing.quad))}
      >
        <Text style={styles.title}>HEALTECH</Text>
        <Text style={styles.subtitle}>Busca a tu paciente aquí</Text>

        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <FontAwesome
              name="search"
              size={20}
              color="#000000"
              onPress={handleSearchPatient}
              style={styles.icon}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Busca tu paciente"
              placeholderTextColor="#999999"
              value={inputText}
              onChangeText={(text) => setInputText(text)}
              onSubmitEditing={handleSearchPatient}
            />

            {inputText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearInput}
              >
                <FontAwesome name="times" size={20} color="#000000" />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setIsMenuOpen(!isMenuOpen)}
            >
              <View style={styles.menuButtonContent}>
                <Text style={styles.optionText}>{selectedOption}</Text>
                <FontAwesome
                  name={isMenuOpen ? "chevron-up" : "chevron-down"}
                  size={20}
                  style={{ paddingRight: 10 }}
                  color="#000000"
                />
              </View>
            </TouchableOpacity>

            {isMenuOpen && (
              <View style={styles.dropdownMenu}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.option}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                    {selectedOption === option && (
                      <FontAwesome name="check" size={20} color="#000000" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Animated.View>
     
      {/* Mover el ScrollView aquí para que esté fuera del Animated.View */}
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Información del Paciente */}
        {pacienteData && (
          <View style={styles.contentContainer}>
            {/* Botón para desplegar el dropdown de datos del paciente */}
            <TouchableOpacity
              style={styles.patientMenuButton}
              onPress={togglePatientMenu}
              disabled={disablePatient}
            >
              <View style={styles.menuButtonContent}>
                <Text style={styles.optionText4w}>Datos del paciente</Text>
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

                {/* Botón de expediente */}
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
            {/* Modal para AccesoM */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(false);
              }}
            >
              <View style={styles.modalContainer}>
                <AccesoM
                  closeModal={() => setModalVisible(false)}
                  onSuccess={onModalSuccess}
                  id={inputText}
                  type={selectedOption}
                />
              </View>
            </Modal>

            {isTextVisible && (
              <Text style={styles.bigCenteredText}>Diagnóstico</Text>
            )}

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
                      value={nombreMedicamento}
                      onChangeText={(text) => {
                        setNombreMedicamento(text);
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
                      {/* Input de Unidad */}
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
                          setUnidad(text);
                        }}
                        keyboardType="numeric"
                        placeholder="Unidad"
                        placeholderTextColor="#999999"
                      />
                      {/* Input de Cada */}
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
                        onChangeText={(text) => setCada(text)}
                        keyboardType="numeric"
                        placeholder="Cada"
                        placeholderTextColor="#999999"
                      />
                      {/* Menú desplegable de Tiempo */}
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

                    {/* Opciones del Menú desplegable de Tiempo */}
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
                        }}
                      >
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

                    {/* Menú desplegable de Tipo de Medicamento */}
                    <View style={{ marginTop: 20 }}>
                      <Text
                        style={{
                          fontFamily: "CeraRoundProRegular",
                          fontSize: 14,
                          marginBottom: 5,
                        }}
                      >
                        Tipo de medicamento:
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setMedicationTypeDropdownOpen(!isMedicationTypeDropdownOpen)
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
                      {/* Opciones del Menú desplegable de Tipo de Medicamento */}
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

                    {/* Menú desplegable de Vía de Administración */}
                    <View style={{ marginTop: 20 }}>
                      <Text
                        style={{
                          fontFamily: "CeraRoundProRegular",
                          fontSize: 14,
                          marginBottom: 5,
                        }}
                      >
                        Vía de administración:
                      </Text>
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
                      {/* Opciones del Menú desplegable de Vía de Administración */}
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

                    {/* Menú desplegable de Duración de Tratamiento */}
                    <View style={{ marginTop: 20 }}>
                      <Text
                        style={{
                          fontFamily: "CeraRoundProRegular",
                          fontSize: 14,
                          marginBottom: 5,
                        }}
                      >
                        Duración de tratamiento:
                      </Text>
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
                          onChangeText={(text) => setDuracion(text)}
                          keyboardType="numeric"
                          placeholder="Número"
                          placeholderTextColor="#999999"
                        />
                        {/* Menú desplegable de Tiempo */}
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

                      {/* Opciones del Menú desplegable de Duración de Tratamiento */}
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

                    {/* Nota de Prescripción */}
                    <View style={{ paddingTop: 20 }}>
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
                          height: 200,
                          backgroundColor: "#D9D9D9",
                          fontSize: 16,
                          color: "black",
                          fontFamily: "CeraRoundProRegular",
                          padding: 10,
                          borderRadius: 8,
                          textAlignVertical: "top",
                        }}
                        placeholder="Escribe tu nota de prescripción aquí..."
                        multiline
                        value={prescriptionNote}
                        onChangeText={(text) => setPrescriptionNote(text)}
                      />

                      {/* Botones de Cancelar y Guardar */}
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
                            backgroundColor: "white",
                            borderRadius: 16,
                            alignItems: "center",
                            justifyContent: "center",
                            height: 40,
                            width: "48%",
                            borderWidth: 2,
                            borderColor: "#37817A",
                          }}
                          onPress={() => refRBSheet.current.close()} // Corrección aquí
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

                        {/* Botón Guardar o Modificar */}
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#37817A",
                            borderRadius: 16,
                            alignItems: "center",
                            justifyContent: "center",
                            height: 40,
                            width: "48%",
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

            {isMedListVisible && (
              <View style={styles.medicamentosContainer}>
                {medicamentos.flat().map((medicamento, index) => (
                  <View key={index} style={styles.medicamentoItem}>
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
                        textBody: "¿Estás seguro que quieres cancelar la receta?",
                        button: "Cancelar Receta",
                        closeOnOverlayTap: true,
                        onPressButton: () => {
                          handleClearInput();
                          Dialog.hide();
                        },
                      })
                    }
                  >
                    <Text style={styles.cancelarButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  {/* Botón Enviar */}
                  <TouchableOpacity
                    style={styles.enviarButton}
                    onPress={handleEnviar}
                  >
                    <Text style={styles.enviarButtonText}>Enviar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </AlertNotificationRoot>
          </View>
        )}
      </ScrollView>
      </View>

    
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  // Estilos originales del componente Busqueda con la animación

    // ... otros estilos ...
    searchContainer: {
      flexDirection: 'row',
      height: 50,
      width: '100%',
      backgroundColor: '#1F4687',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20, // Agregar padding a los lados
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: '#ccc',
      borderWidth: 1,
      height: 50,
      flex: 1,
      backgroundColor: 'white',
      borderRadius: 8,
      paddingHorizontal: 10, // Agregar padding interno
      marginRight: 10, // Espacio entre el input y el botón del menú
    },
    textInput: {
      flex: 1,
      paddingVertical: 10,
    },
    menuButton: {
      height: 50,
      minWidth: 100,
      paddingHorizontal: 10,
      borderColor: '#ccc',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      zIndex: 40,
      borderWidth: 1,
      borderRadius: 8,
    },
    container: {
      // Removemos el backgroundColor aquí para evitar conflictos
   backgroundColor: '#1F4687',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 20,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
      flex: 1,
      // Establece el fondo en transparente o blanco según necesites
      backgroundColor: 'transparent',
    },
  title: {
    fontSize: 55,
    fontFamily: 'CeraRoundProBlack',
    color: 'white',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'CeraRoundProRegular',
    color: 'white',
    marginBottom: 39,
  },
  searchContainer: {
    flexDirection: 'row',
    height: 50,
    width: 310,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    height: 70,
    width: 230,
    backgroundColor: 'white',
  },
  icon: {
    marginLeft: 10,
    marginRight: 5,
  },
  textInput: {
    flex: 1,
    padding: 10,
  },
  clearButton: {
    padding: 10,
  },
  menuButton: {
    height: 70,
    minWidth: 150,
    paddingHorizontal: 10,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    zIndex: 40,
  },
  menuButtonContent: {
    flexDirection: 'row',
    zIndex: 40,
    alignItems: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 63,
    left: 0,
    minWidth: 150,
    backgroundColor: 'white',
    borderColor: '#ccc',
    zIndex: 200,
    marginTop: 10, // Agrega espacio entre el botón y el menú
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribuye el espacio entre el texto y el ícono
    padding: 10,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    paddingHorizontal: 5,
    fontFamily: 'CeraRoundProRegular',
  },
  // Estilos adicionales para los nuevos componentes
  optionText4w: {
    fontSize: 18,
    flex: 1,

    textAlign: 'left',
    paddingHorizontal: 5,
    fontFamily: 'CeraRoundProBlack',
  },
  patientMenuButton: {
    height: 60,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: 20,
    zIndex: -40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
  },
  patientDropdownContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: -2,
    zIndex: -40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
  },
  patientDropdownMenu: {
    backgroundColor: '#D9D9D9',
    padding: 10,
    marginBottom: 60,
    zIndex: -40,
  },
  patientDataField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    width: '100%',
    marginBottom: 4,
  },
  patientInfoText: {
    marginLeft: 10,
    fontFamily: 'CeraRoundProRegular',
    fontSize: 16,
    color: 'black',
  },
  medicalHistoryButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#37817A',
    borderRadius: 20,
    padding: 9,
    width: 150,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicalHistoryButtonText: {
    color: 'white',
    fontFamily: 'CeraRoundProBlack',
    textAlign: 'center',
  },
  bigCenteredText: {
    marginTop: 26,
    fontSize: 18,
    fontFamily: 'CeraRoundProBlack',
    textAlign: 'left',
    marginLeft: 0,
    alignSelf: 'flex-start',
  },
  editorWrapper: {
    width: '100%',
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 8,
  },
  simpleTextInput: {
    width: '100%',
    height: 150,
    backgroundColor: '#D9D9D9',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    fontSize: 16,
    color: 'black',
    fontFamily: 'CeraRoundProRegular',
    textAlignVertical: 'top',
  },
  addMedicineButton: {
    marginTop: 20,
    backgroundColor: '#37817A',
    width: '60%',
    height: 45,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  addMedicineButtonText: {
    fontFamily: 'CeraRoundProBlack',
    color: 'white',
  },
  medicamentosTitle: {
    marginTop: 26,
    fontSize: 18,
    fontFamily: 'CeraRoundProBlack',
    textAlign: 'left',
    marginLeft: 0,
    alignSelf: 'flex-start',
  },
  medicamentosContainer: {
    width: '100%',
    backgroundColor: 'white',
    marginTop: 20,
    flexGrow: 1,
  },
  medicamentoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 0,
    justifyContent: 'space-between',
    width: '100%',
    height: 70,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medicamentoNombre: {
    fontFamily: 'CeraRoundProRegular',
    flex: 1,
    marginHorizontal: 10,
  },
  editIcon: {
    marginLeft: 10,
  },
  deleteIcon: {
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 0,
    marginTop: 20,
  },
  enviarButton: {
    backgroundColor: '#37817A',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelarButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: "#37817A",
  },
  enviarButtonText: {
    fontFamily: 'CeraRoundProBlack',
    color: 'white',
    textAlign: 'center',
  },
  cancelarButtonText: {
    fontFamily: 'CeraRoundProBlack',
    color: '#37817A',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});

export default Busqueda;

