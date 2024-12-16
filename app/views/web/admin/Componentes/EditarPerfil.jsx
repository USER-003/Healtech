import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import { RadioButton, Provider as PaperProvider } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Menu from "./Menu";
import { useRouter } from "expo-router";

import getUserUID from "../../../../../src/queryfb/general/getUserUID";
import getUserInfo from "../../../../../src/queryfb/admin/getUserInfo";
import actualizarAdmin from "../../../../../src/queryfb/admin/actualizarAdmin";

import ProtectedRoute from "../../sesion/ProtectedRoute";

const ProfileUpdateForm = () => {
  const router = useRouter();
  const userUID = getUserUID();

  const [adminInfo, setAdminInfo] = useState(null);

  const [name, setName] = useState("");
  const [dui, setDui] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Utilidad para convertir la fecha al formato adecuado (yyyy-mm-dd)
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    //Al crear el nuevo objeto se decrementa en uno el dia
    const fixeDay = parseInt(day) + 1;
    return new Date(`${year}-${month}-${fixeDay}`);
  };

  const parsedBirthDate = birthDate ? parseDate(birthDate) : new Date();

  useEffect(() => {
    const fetchData = async () => {
      if (userUID) {
        try {
          const adminData = await getUserInfo(userUID);
          setAdminInfo(adminData);
          setName(adminData?.nombre);
          setDui(adminData?.dui);
          setAddress(adminData?.direccion);
          setPhone(adminData?.telefono);
          setBirthDate(adminData?.nacimiento);
          setGender(adminData?.genero);
        } catch (error) {
          console.error("Error al obtener los datos:", error);
        }
      }
    };

    fetchData();
  }, [userUID]);

  const openDatePicker = () => setDatePickerVisibility(true);
  const closeDatePicker = () => setDatePickerVisibility(false);

  const handleDateConfirm = (params) => {
    const selectedDate = params.date;
    if (selectedDate) {
      // Convertimos la fecha al formato deseado "dd/mm/yyyy"
      const formattedDate = selectedDate.toLocaleDateString("es-ES");
      setBirthDate(formattedDate); // Guardamos la fecha formateada
    }
    closeDatePicker();
  };

  const validateFields = () => {
    const errors = [];

    // Mensajes de error
    const errorMessages = {
      nameEmpty: "El nombre no puede estar vacío o contener solo espacios.",
      nameStartsWithSpace: "El nombre no puede comenzar con espacios.",
      duiEmpty: "El DUI no puede estar vacío.",
      duiFormat: "El DUI debe tener exactamente 9 dígitos sin guion.",
      phoneEmpty: "El teléfono no puede estar vacío.",
      phoneFormat:
        "El teléfono debe contener solo dígitos y tener entre 8 y 10 caracteres.",
      addressEmpty: "La dirección no puede estar vacía.",
      addressStartsWithSpace: "La dirección no puede comenzar con espacios.",
      birthDateEmpty: "La fecha de nacimiento no puede estar vacía.",
    };

    // Función auxiliar para validar campos vacíos
    const validateEmptyField = (field, errorMsg) => {
      if (!field.trim()) errors.push(errorMsg);
    };

    // Validaciones
    validateEmptyField(name, errorMessages.nameEmpty);
    if (/^\s/.test(name)) errors.push(errorMessages.nameStartsWithSpace);

    validateEmptyField(dui, errorMessages.duiEmpty);
    if (!/^\d{9}$/.test(dui.trim())) errors.push(errorMessages.duiFormat);

    validateEmptyField(phone, errorMessages.phoneEmpty);
    if (!/^\d{8,10}$/.test(phone.trim()))
      errors.push(errorMessages.phoneFormat);

    validateEmptyField(address, errorMessages.addressEmpty);
    if (/^\s/.test(address)) errors.push(errorMessages.addressStartsWithSpace);

    if (!birthDate) errors.push(errorMessages.birthDateEmpty);

    // Mostrar el mensaje en el modal
    setModalMessage(
      errors.length > 0 ? errors.join("\n") : "Formulario enviado con éxito."
    );
    setModalVisible(true);

    // Retorna true si no hay errores, false si hay errores
    return errors.length === 0;
  };

  const handleUpdateAdmin = async () => {
    const isValid = validateFields(); // Validar campos antes de proceder

    if (isValid) {
      try {
        const [day, month, year] = birthDate.split("/");
        const nacimiento = { day, month, year };

        const datosAdmin = {
          nombre: name,
          email: adminInfo?.email,
          dui: adminInfo?.dui,
          telefono: phone,
          direccion: address,
          genero: gender,
          nacimiento,
          rol: "admin",
        };

        await actualizarAdmin(userUID, datosAdmin);

        setModalMessage(
          "Información del administrador actualizada exitosamente."
        );
        setIsSuccess(true);
        setModalVisible(true);
      } catch (error) {
        setModalMessage(
          `Error al actualizar el administrador: ${error.message}`
        );
        setIsSuccess(false);
        setModalVisible(true);
      }
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    router.replace("/views/web/admin/Componentes/MiPerfil");
  };

  const handleBack = () => {
    router.navigate("/views/web/admin/Componentes/MiPerfil");
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["prohibido"]}
    >
      <PaperProvider>
        <View style={styles.container}>
          <Menu />

          <ScrollView style={styles.content}>
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.back}>◀ VOLVER</Text>
            </TouchableOpacity>
            <br />
            <Text style={styles.title}>
              Dashboard <Text style={styles.subtitle}>Mi perfil</Text>
            </Text>

            <Text style={styles.sectionTitle}>Información personal</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder={"Nombre"}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder={"DUI"}
                value={dui}
                onChangeText={setDui}
                editable={false}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder={"Telefono"}
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                style={styles.input}
                placeholder={"Dirección"}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <Text style={styles.sectionTitle}>Fecha de nacimiento</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateInput}
                placeholder={"Fecha de nacimiento"}
                value={birthDate}
                editable={false}
              />
              <TouchableOpacity
                onPress={openDatePicker}
                style={styles.iconContainer}
              >
                <FontAwesome name="calendar" size={24} color="#37817A" />
              </TouchableOpacity>
            </View>

            <DatePickerModal
              locale="es"
              mode="single"
              visible={isDatePickerVisible}
              onDismiss={closeDatePicker}
              date={parsedBirthDate}
              onConfirm={handleDateConfirm}
              label="Selecciona una fecha"
              animationType="slide"
              contentContainerStyle={styles.datePickerModal}
            />

            <Text style={styles.sectionTitle}>Género</Text>
            <View style={styles.radioRow}>
              <View style={styles.radioItem}>
                <RadioButton
                  value="Masculino"
                  status={gender === "masculino" ? "checked" : "unchecked"}
                  onPress={() => setGender("masculino")}
                />
                <Text style={styles.radioText}>Masculino</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton
                  value="Femenino"
                  status={gender === "femenino" ? "checked" : "unchecked"}
                  onPress={() => setGender("femenino")}
                />
                <Text style={styles.radioText}>Femenino</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton
                  value="personalizado"
                  status={gender === "personalizado" ? "checked" : "unchecked"}
                  onPress={() => setGender("personalizado")}
                />
                <Text style={styles.radioText}>Prefiero no decirlo</Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdateAdmin}
              >
                <Text style={styles.updateButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>

            {/* Modal de resultado */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View
                  style={[
                    styles.modalContent,
                    isSuccess ? styles.success : styles.error,
                  ]}
                >
                  <Text style={styles.modalText}>{modalMessage}</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.modalButton}
                  >
                    <Text style={styles.modalButtonText} onPress={handleClose}>
                      Cerrar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </View>
      </PaperProvider>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  back: {
    fontFamily: "CeraRoundProMedium",
  },
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
  },
  subtitle: {
    color: "#37817A",
    fontFamily: "CeraRoundProMedium",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#37817A",
    marginVertical: 10,
    fontFamily: "CeraRoundProMedium",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    fontSize: 16,
    fontFamily: "CeraRoundProMedium",
  },
  dateInputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    paddingRight: 40,
    fontSize: 16,
    fontFamily: "CeraRoundProMedium",
  },
  iconContainer: {
    position: "absolute",
    right: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "40%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  success: {
    backgroundColor: "#d4edda",
  },
  error: {
    backgroundColor: "#f8d7da",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
  },
  modalButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#37817A",
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  radioRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginVertical: 10,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioText: {
    marginRight: 10,
    fontFamily: "CeraRoundProMedium",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 30,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderColor: "#37817A",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    margin: 10,
  },
  cancelButtonText: {
    color: "#37817A",
    fontSize: 16,
    fontFamily: "CeraRoundProMedium",
  },
  updateButton: {
    backgroundColor: "#37817A",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    margin: 10,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "CeraRoundProMedium",
  },
});

export default ProfileUpdateForm;
