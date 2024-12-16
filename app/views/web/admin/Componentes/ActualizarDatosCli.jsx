import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal, // Importamos Modal desde 'react-native'
} from "react-native";
import { Button, Checkbox } from "react-native-paper";
import { useRouter } from "expo-router";
import { TimePickerModal } from "react-native-paper-dates";
import Menu from "./Menu";
import { useFonts } from "expo-font";

import ProtectedRoute from "../../sesion/ProtectedRoute";

import getUserUID from "../../../../../src/queryfb/general/getUserUID";
import getUserInfo from "../../../../../src/queryfb/admin/getUserInfo";
import getClinicaAsociada from "../../../../../src/queryfb/admin/getClinicaAsociada";

import actualizarClinica from "../../../../../src/queryfb/admin/actualizarClinica";
import actualizarHorarios from "../../../../../src/queryfb/admin/actualizarHorarios";

// Eliminamos la importación de SweetAlert
// import Swal from "sweetalert2";
import FontAwesome from "react-native-vector-icons/FontAwesome"; // Importamos FontAwesome

const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProMedium: require("../../../../../assets/fonts/CeraRoundProMedium.otf"),
    CeraRoundProBold: require("../../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProRegular: require("../../../../../assets/fonts/CeraRoundProRegular.otf"),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return children;
};

const Formulario = () => {
  const [adminInfo, setAdminInfo] = useState(null);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nRegistro, setRegistro] = useState("");
  const [direccion, setDireccion] = useState("");
  const [entidad, setEntidad] = useState("");

  const [schedule, setSchedule] = useState({});

  const router = useRouter();
  const userUID = getUserUID();
  console.log(userUID);

  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("warning");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (userUID) {
        try {
          const clinicaData = await getClinicaAsociada(userUID);
          if (clinicaData) {
            setNombre(clinicaData.nombre);
            setTelefono(clinicaData.telefono);
            setRegistro(clinicaData.registro);
            setDireccion(clinicaData.direccion);
            setEntidad(clinicaData.entidad);
            setSchedule(clinicaData.horarios); // Asignar los horarios obtenidos de Firebase
          }

          const adminData = await getUserInfo(userUID);
          setAdminInfo(adminData);
        } catch (error) {
          console.error("Error al obtener los datos:", error);
        }
      }
    };

    fetchData();
  }, [userUID]);

  // Función de validación del formulario
  const validarFormulario = () => {
    // Validar que los campos no estén vacíos
    if (!nombre || !direccion || !entidad || !telefono) {
      setModalTitle("Error");
      setModalMessage("Por favor, complete todos los campos.");
      setModalType("error");
      setModalVisible(true);
      return false;
    }

    // Validar el teléfono
    const regexTelefono = /^[0-9]{8}$/;
    if (!regexTelefono.test(telefono)) {
      setModalTitle("Error");
      setModalMessage("El número de teléfono debe contener exactamente 8 dígitos.");
      setModalType("error");
      setModalVisible(true);
      return false;
    }

    return true;
  };

  // Función para manejar el cierre del modal
  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      router.replace("/views/web/admin/Componentes/MiClinica"); // Redirigir a la vista principal
    }
  };

  // Función para manejar la actualización de la clínica
  const handleActualizar = async () => {
    if (!validarFormulario()) {
      return;
    }
    const datosClinica = {
      nombre,
      direccion,
      telefono,
      entidad,
    };

    try {
      console.log(userUID, nRegistro, datosClinica);
      console.log(schedule);
      // Actualizar información básica de la clínica
      await actualizarClinica(userUID, nRegistro, {
        nombre,
        direccion,
        telefono,
        entidad,
      });

      // Actualizar horarios de la clínica
      await actualizarHorarios(nRegistro, schedule);

      setModalTitle("Éxito");
      setModalMessage("La información de la clínica ha sido actualizada correctamente.");
      setModalType("success");
      setModalVisible(true);

      // No redirigimos aquí, lo haremos después de cerrar el modal
      // router.replace("/views/web/admin/Componentes/MiClinica"); // Redirigir a la vista principal
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
      setModalTitle("Error");
      setModalMessage("Hubo un problema al actualizar los datos de la clínica.");
      setModalType("error");
      setModalVisible(true);
    }
  };

  const [showTimePicker, setShowTimePicker] = useState({ day: "", field: "" });
  const [visibleTimePicker, setVisibleTimePicker] = useState(false);

  const handleScheduleChange = (day, field, value) => {
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [day]: { ...prevSchedule[day], [field]: value },
    }));
  };

  const handleDayToggle = (day) => {
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [day]: { ...prevSchedule[day], isOpen: !prevSchedule[day]?.isOpen },
    }));
  };

  const handleTimeConfirm = ({ hours, minutes }) => {
    const currentTime = `${hours}:${minutes < 10 ? `0${minutes}` : minutes} ${
      hours >= 12 ? "PM" : "AM"
    }`;
    handleScheduleChange(showTimePicker.day, showTimePicker.field, currentTime);
    setVisibleTimePicker(false);
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "colaborador"]}>
      <LoadFonts>
        <View style={styles.container}>
          <Menu />
          <ScrollView style={styles.mainContent}>
            <Text style={styles.title}>Actualizar información de clínica</Text>
            <Text style={styles.label}>Información general</Text>
            {/* Fila 1: Nombre y Administrador */}
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
              />
              <TextInput
                style={styles.input}
                editable={false}
                placeholder="Administrador"
                value={adminInfo?.nombre || ""}
                onChangeText={(text) =>
                  setAdminInfo((prev) => ({ ...prev, nombre: text }))
                }
              />
            </View>
            {/* Fila 2: Teléfono y N Registro */}
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                keyboardType="numeric"
                value={telefono}
                onChangeText={setTelefono}
              />
              <TextInput
                style={styles.input}
                editable={false}
                placeholder="N Registro"
                value={nRegistro}
                onChangeText={setRegistro}
              />
            </View>
            {/* Fila 3: Dirección */}
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.fullWidth]}
                placeholder="Dirección"
                value={direccion}
                onChangeText={setDireccion}
              />
            </View>
            {/* Entidad: Radio Buttons */}
            <Text style={styles.label}>Entidad</Text>
            <View style={styles.radioContainer}>
              <View style={styles.radioOption}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    entidad === "Pública" ? styles.radioSelected : null,
                  ]}
                  onPress={() => setEntidad("Pública")}
                />
                <Text style={styles.radioText}>Pública</Text>
              </View>
              <View style={styles.radioOption}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    entidad === "Privada" ? styles.radioSelected : null,
                  ]}
                  onPress={() => setEntidad("Privada")}
                />
                <Text style={styles.radioText}>Privada</Text>
              </View>
            </View>
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
                    status={schedule[day]?.isOpen ? "checked" : "unchecked"}
                    onPress={() => handleDayToggle(day)}
                  />
                  <Text style={styles.dayLabel}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Text>
                </View>

                {schedule[day]?.isOpen ? (
                  <View style={styles.timeContainer}>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setShowTimePicker({ day, field: "apertura" });
                        setVisibleTimePicker(true);
                      }}
                    >
                      Apertura: {schedule[day]?.apertura || "09:00 AM"}
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setShowTimePicker({ day, field: "cierre" });
                        setVisibleTimePicker(true);
                      }}
                    >
                      Cierre: {schedule[day]?.cierre || "05:00 PM"}
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
              hours={12}
              minutes={0}
              label="Seleccione la hora"
              cancelLabel="Cancelar"
              confirmLabel="Ok"
              animationType="fade"
            />
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.buttonCancel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleActualizar}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Actualizar datos</Text>
              </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "left",
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  button: {
    fontFamily: "CeraRoundProMedium",
    width: "20%",
    backgroundColor: "#37817A",
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    margin: 5,
  },
  buttonCancel: {
    width: "20%",
    padding: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#37817A",
    borderRadius: 25,
    alignItems: "center",
    margin: 5,
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
    justifyContent: "space-between",
    marginBottom: 15,
  },
  fullWidth: {
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    fontFamily: "CeraRoundProMedium",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  radioContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#37817A",
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: "#37817A",
  },
  radioText: {
    fontSize: 16,
    fontFamily: "CeraRoundProMedium",
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dayLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayLabel: {
    fontSize: 16,
    fontFamily: "CeraRoundProMedium",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  closedLabel: {
    fontSize: 14,
    color: "#000000",
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

export default Formulario;
