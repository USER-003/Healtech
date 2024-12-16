import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Text,
  Provider as PaperProvider,
  Checkbox,
  DefaultTheme,
  ActivityIndicator,
} from "react-native-paper";
import { TimePickerModal } from "react-native-paper-dates";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";

import setHorarios from "../../../../src/queryfb/admin/setHorarios";

import ProtectedRegister from "./ProtectecRegister";

import getUserUID from "../../../../src/queryfb/general/getUserUID";
import { ref, get, child } from "firebase/database";
import { db } from "../../../../src/config/fb";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#37817A",
    accent: "#37817A",
  },
};

const RegisterClinicSchedule = () => {
  const router = useRouter();
  const userUID = getUserUID(); // Obtener UID del usuario autenticado
  const [adminInfo, setAdminInfo] = useState(null); // Estado para guardar la info del admin

  // Función para obtener la información del administrador con el UID
  useEffect(() => {
    const fetchAdminInfo = async () => {
      if (!userUID) return;

      try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `admin/${userUID}`));
        if (snapshot.exists()) {
          setAdminInfo(snapshot.val()); // Guardar la información del admin en el estado
        } else {
          console.log("No se encontró información para este UID de admin.");
        }
      } catch (error) {
        console.error(
          "Error al obtener la información del administrador:",
          error
        );
      }
    };

    fetchAdminInfo();
  }, [userUID]);

  // Esto se ejecutará cuando la información de admin esté cargada
  useEffect(() => {
    if (adminInfo) {
      console.log(adminInfo.clinica);
    }
  }, [adminInfo]);

  const [schedule, setSchedule] = useState({
    lunes: { isOpen: false, apertura: "09:00 AM", cierre: "05:00 PM" },
    martes: { isOpen: false, apertura: "09:00 AM", cierre: "05:00 PM" },
    miercoles: { isOpen: false, apertura: "09:00 AM", cierre: "05:00 PM" },
    jueves: { isOpen: false, apertura: "09:00 AM", cierre: "05:00 PM" },
    viernes: { isOpen: false, apertura: "09:00 AM", cierre: "05:00 PM" },
    sabado: { isOpen: false, apertura: "09:00 AM", cierre: "05:00 PM" },
    domingo: { isOpen: false, apertura: "09:00 AM", cierre: "05:00 PM" },
  });

  const LoadFonts = ({ children }) => {
    const [fontsLoaded] = useFonts({
      CeraRoundProMedium: require("../../../../assets/fonts/CeraRoundProMedium.otf"),
    });

    if (!fontsLoaded) {
      return <ActivityIndicator size="large" />;
    }

    return children;
  };

  const [showTimePicker, setShowTimePicker] = useState({ day: "", field: "" });
  const [visibleTimePicker, setVisibleTimePicker] = useState(false);

  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("info");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalAction, setModalAction] = useState(null);

  const handleScheduleChange = (day, field, value) => {
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [day]: { ...prevSchedule[day], [field]: value },
    }));
  };

  const handleDayToggle = (day) => {
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [day]: { ...prevSchedule[day], isOpen: !prevSchedule[day].isOpen },
    }));
  };

  const handleTimeConfirm = ({ hours, minutes }) => {
    const currentTime = `${hours}:${minutes < 10 ? `0${minutes}` : minutes} ${
      hours >= 12 ? "PM" : "AM"
    }`;
    handleScheduleChange(showTimePicker.day, showTimePicker.field, currentTime);
    setVisibleTimePicker(false);
  };

  const handleSubmit = async () => {
    // Validación básica para asegurarse de que hay horarios
    if (!schedule || Object.keys(schedule).length === 0) {
      setModalTitle("Error");
      setModalMessage("No se han seleccionado horarios.");
      setModalType("error");
      setModalVisible(true);
      return;
    }

    // Mostrar mensaje de confirmación al usuario antes de guardar los horarios
    setModalTitle("¿Estás seguro?");
    setModalMessage("Estás a punto de registrar los horarios de atención.");
    setModalType("warning");
    setModalVisible(true);
    setModalAction("submitSchedule");
  };

  const handleBefore = () => {
    setModalTitle("¿Estás seguro?");
    setModalMessage(
      "No has registrado los horarios de atención. Este paso es opcional. ¿Deseas continuar?"
    );
    setModalType("warning");
    setModalVisible(true);
    setModalAction("skipSchedule");
  };

  const handleModalConfirm = async () => {
    if (modalAction === "submitSchedule") {
      // Proceder a registrar los horarios
      try {
        console.log("Horarios registrados:", schedule);

        // Acceder dinámicamente a la primera clave dentro de adminInfo.clinica
        const clinicId = Object.keys(adminInfo.clinica)[0]; // Obtiene la primera clave (el número dinámico)

        // Validar si se obtuvo correctamente el clinicId
        if (!clinicId) {
          setModalTitle("Error");
          setModalMessage("No se pudo obtener el ID de la clínica.");
          setModalType("error");
          setModalVisible(true);
          return;
        }

        // Guardar los horarios
        await setHorarios(clinicId, schedule);

        // Mostrar mensaje de éxito
        setModalTitle("Éxito");
        setModalMessage("Horarios registrados exitosamente.");
        setModalType("success");
        setModalVisible(true);
        setModalAction("redirectToDashboard");
      } catch (error) {
        console.error("Error al registrar los horarios:", error);
        // Mostrar mensaje de error
        setModalTitle("Error");
        setModalMessage(
          "Hubo un problema al registrar los horarios. Inténtalo de nuevo."
        );
        setModalType("error");
        setModalVisible(true);
      }
    } else if (modalAction === "skipSchedule") {
      // El usuario decidió omitir los horarios y continuar
      router.replace("/views/web/admin/DashBoard");
      setModalAction(null);
      setModalVisible(false);
    }
    // No reiniciamos modalAction aquí para mantener su valor
    // y permitir que la redirección ocurra al cerrar el modal
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setModalAction(null);
  };

  return (
    <ProtectedRegister allowedRoles={["admin"]} skip={true}>
      <PaperProvider theme={theme}>
        <LoadFonts>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.content}>
              <View style={styles.formContainer}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                  <Text style={styles.radioLabel}>
                    Paso 3: Selecciona el horario de tu clínica
                  </Text>
                  <Text style={styles.title}>Horario de atención</Text>

                  {[
                    "lunes",
                    "martes",
                    "miercoles",
                    "jueves",
                    "viernes",
                    "sabado",
                    "domingo",
                  ].map((day) => (
                    <View key={day} style={styles.dayRow}>
                      <View style={styles.dayLabelContainer}>
                        <Checkbox
                          status={schedule[day].isOpen ? "checked" : "unchecked"}
                          onPress={() => handleDayToggle(day)}
                        />
                        <Text style={styles.dayLabel}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </Text>
                      </View>

                      {schedule[day].isOpen ? (
                        <View style={styles.timeContainer}>
                          <Button
                            mode="outlined"
                            onPress={() => {
                              setShowTimePicker({ day, field: "apertura" });
                              setVisibleTimePicker(true);
                            }}
                          >
                            Apertura: {schedule[day].apertura}
                          </Button>
                          <Button
                            mode="outlined"
                            onPress={() => {
                              setShowTimePicker({ day, field: "cierre" });
                              setVisibleTimePicker(true);
                            }}
                          >
                            Cierre: {schedule[day].cierre}
                          </Button>
                        </View>
                      ) : (
                        <Text style={styles.closedLabel}>CERRADO</Text>
                      )}
                    </View>
                  ))}

                  <TimePickerModal
                    visible={visibleTimePicker}
                    onDismiss={() => setVisibleTimePicker(false)}
                    onConfirm={handleTimeConfirm}
                    hours={12} // Initial hours
                    minutes={0} // Initial minutes
                    label="Seleccione la hora"
                    cancelLabel="Cancelar"
                    confirmLabel="Ok"
                    animationType="fade"
                  />

                  <View style={styles.row}>
                    <Button
                      mode="contained"
                      onPress={handleBefore}
                      style={styles.buttonCancel}
                    >
                      <Text style={styles.cancelButtonText}>Omitir</Text>
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      style={styles.button}
                    >
                      Registrar
                    </Button>
                  </View>
                </ScrollView>
              </View>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: "/assets/calendar.jpg" }}
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
                      onPress={handleModalCancel}
                    >
                      <Text style={styles.modalButtonTextCancel}>
                        {modalAction === "skipSchedule"
                          ? "Regresar y registrar horarios"
                          : "Cancelar"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={handleModalConfirm}
                    >
                      <Text style={styles.modalButtonText}>
                        {modalAction === "skipSchedule"
                          ? "Sí, continuar sin horarios"
                          : "Registrar"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      if (modalAction === "redirectToDashboard") {
                        router.replace("/views/web/admin/DashBoard");
                        setModalAction(null);
                      }
                      setModalVisible(false);
                    }}
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
    </ProtectedRegister>
  );
};

const styles = StyleSheet.create({
  // Tus estilos existentes...
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 20,
    fontFamily: "CeraRoundProMedium",
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
  radioLabel: {
    fontFamily: "CeraRoundProMedium",
    color: "#37817A",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  title: {
    textAlign: "left",
    fontSize: 30,
    marginBottom: 20,
    color: "#37817A",
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  dayLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
  },
  timeContainer: {
    flex: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayLabel: {
    fontSize: 16,
    color: "#37817A",
    marginLeft: 10,
  },
  closedLabel: {
    color: "grey",
    fontSize: 16,
    textAlign: "right",
    flex: 3,
  },
  button: {
    width: "30%",
    backgroundColor: "#37817A",
    fontFamily: "CeraRoundProMedium",
  },
  buttonCancel: {
    width: "30%",
    backgroundColor: "#FFFFFF",
    borderColor: "#37817A",
    borderWidth: 1,
  },
  cancelButtonText: {
    color: "#37817A",
    fontFamily: "CeraRoundProMedium",
  },
  imageContainer: {
    width: "50%",
    backgroundColor: "#ffffff",
  },
  image: {
    width: "100%",
    height: "100%",
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

export default RegisterClinicSchedule;


