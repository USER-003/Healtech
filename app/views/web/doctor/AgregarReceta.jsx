import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faUser,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import ModalRN from "react-native-modal";
import AgregarMedicamentoWeb from "./Componentes/AgregarMedicamento";
import ModificarMedicamentoWeb from "./Componentes/ModificarMedicamento";
import { Grid, Row, Column } from "./Componentes/Grid";
import searchPatientByCode from "../../../../src/queryfb/paciente/searchPatientByCode";
import setPatientPrescription from "../../../../src/queryfb/paciente/setPatientPrescription";
import searchNodeBtUid from "../../../../src/queryfb/doctor/searchNodeByUid";
import Header from "./Componentes/Header";
import ProtectedRoute from "../sesion/ProtectedRoute";
import getUserUID from "../../../../src/queryfb/general/getUserUID";
import FontAwesome from "react-native-vector-icons/FontAwesome"; // Import FontAwesome

function AgregarRecetaWeb() {
  const userUID = getUserUID();
  const [diagnosticoData, setDiagnosticoData] = useState("");
  const [pacienteData, setPacienteData] = useState(null);
  const [medicoData, setMedicoData] = useState("");
  const [medicamentos, setMedicamentos] = useState([]);

  const [modMedicamento, setModMedicamento] = useState(null);
  const [modIndex, setModIndex] = useState(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisible2, setModalVisible2] = useState(false);

  const [modalVisible, setModalVisibleCustom] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtons, setModalButtons] = useState([]);

  const showModal = (title, message, type, buttons) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalButtons(buttons);
    setModalVisibleCustom(true);
  };

  const router = useRouter();
  const { type, ID } = useLocalSearchParams();

  useEffect(() => {
    const fetchPacienteData = async () => {
      try {
        const data = await searchPatientByCode(type, ID);
        setPacienteData(data);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchPacienteData();
  }, [type, ID]);

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

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const toggleModalModificar = (index) => {
    setModMedicamento(medicamentos[index]);
    setModIndex(index);
    setModalVisible2(!isModalVisible2);
  };

  const handleSave = (newMedicamento) => {
    setMedicamentos((prevMedicamentos) => [
      ...prevMedicamentos,
      ...newMedicamento,
    ]);
  };

  const handleUpdate = (updatedMedicamento) => {
    setMedicamentos((prevMedicamentos) =>
      prevMedicamentos.map((medicamento, index) =>
        index === modIndex ? updatedMedicamento[0] : medicamento
      )
    );
    setModMedicamento(null);
    setModIndex(null);
    setModalVisible2(false);
  };

  const handleDelete = (index) => {
    setMedicamentos((prevMedicamentos) =>
      prevMedicamentos.filter((_, i) => i !== index)
    );
    setModMedicamento(null);
    setModIndex(null);
    setModalVisible2(false);
  };

  const handleCancelar = () => {
    showModal(
      "¿Está seguro que quiere salir de esta página?",
      "No se guardarán los cambios",
      "warning",
      [
        {
          text: "Cancelar",
          onPress: () => {
            setModalVisibleCustom(false);
            router.replace(`/views/web/doctor/Expediente?ID=${ID}&type=${type}`);
          },
          style: { backgroundColor: "red", color: "#fff" },
        },
        {
          text: "Seguir en la página",
          onPress: () => setModalVisibleCustom(false),
          style: { backgroundColor: "#37817A", color: "#fff" },
        },
      ]
    );
  };

  const handleEnviar = () => {
    if (!diagnosticoData) {
      return showModal(
        "LA RECETA SE ENCUENTRA VACÍA",
        "Por favor, agregue un diagnóstico para continuar",
        "warning",
        [
          {
            text: "Cerrar",
            onPress: () => setModalVisibleCustom(false),
            style: { backgroundColor: "#37817A", color: "#fff" },
          },
        ]
      );
    }
    showModal(
      "¿Estás seguro que quieres agregar esta receta?",
      `Se le notificará al paciente, ${pacienteData?.nombre}`,
      "question",
      [
        {
          text: "Guardar",
          onPress: () => {
            setModalVisibleCustom(false);
            console.log("EL doctor es: ", userUID);
            setPatientPrescription(
              type,
              ID,
              medicoData?.nombre || "Indeterminado",
              medicoData?.telefono || "Indeterminado",
              diagnosticoData || "Indeterminado",
              medicamentos || [],
              userUID
            );
            router.replace(`/views/web/doctor/Expediente?ID=${ID}&type=${type}`);
          },
          style: { backgroundColor: "#37817A", color: "#fff" },
        },
        {
          text: "Cancelar",
          onPress: () => setModalVisibleCustom(false),
          style: { backgroundColor: "red", color: "#fff" },
        },
      ]
    );
  };

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />

        <View style={styles.container}>
          <Grid style={{ width: "100%" }}>
            <Row>
              <Column>
                <Text style={styles.subHeading}>INFORMACIÓN DEL PACIENTE</Text>
                <FontAwesomeIcon
                  icon={faUser}
                  style={styles.iconReceta}
                  size={150}
                />
              </Column>
              <Column>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputText}>
                    {pacienteData ? pacienteData.nombre : "Cargando..."}
                  </Text>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputText}>
                    {type === "DUI"
                      ? pacienteData?.identificacion
                      : pacienteData?.expediente}
                  </Text>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputText}>
                    {pacienteData?.telefono || "Sin teléfono"}
                  </Text>
                </View>
              </Column>
            </Row>
          </Grid>

          <Text style={[styles.label, styles.bold]}>DIAGNÓSTICO</Text>
          <TextInput
            style={styles.textArea}
            value={diagnosticoData}
            onChangeText={setDiagnosticoData}
            multiline
            numberOfLines={4}
            placeholder="Escribe aquí..."
          />

          <View style={{ height: 10 }} />

          <TouchableOpacity
            style={{
              width: "18%",
              backgroundColor: "#37817A",
              paddingVertical: 10,
              paddingHorizontal: 25,
              borderRadius: 25,
              marginHorizontal: 10,
              alignItems: "center",
            }}
            onPress={toggleModal}
          >
            <Text
              style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}
            >
              Agregar Medicamento
            </Text>
          </TouchableOpacity>

          {medicamentos.length > 0 && (
            <>
              <Text style={[styles.label, styles.bold]}>
                MEDICAMENTOS AGREGADOS
              </Text>
              <View>
                {medicamentos.map((medicamento, index) => (
                  <View key={index} style={styles.medicamentoCard}>
                    <Row>
                      <Column size={10}>
                        <Text style={styles.medicamentoText}>
                          {medicamento.nombre_medicamento}
                        </Text>
                      </Column>
                      <Column size={1}>
                        <TouchableOpacity
                          onPress={() => toggleModalModificar(index)}
                        >
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            size={32}
                            color="#000"
                          />
                        </TouchableOpacity>
                      </Column>
                      <Column size={1}>
                        <TouchableOpacity onPress={() => handleDelete(index)}>
                          <FontAwesomeIcon
                            icon={faTrash}
                            size={32}
                            color="#000"
                          />
                        </TouchableOpacity>
                      </Column>
                    </Row>
                  </View>
                ))}
              </View>
            </>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{
                width: "18%",
                backgroundColor: "white",
                paddingVertical: 10,
                paddingHorizontal: 25,
                borderRadius: 25,
                borderColor: "#37817A",
                borderWidth: 2,
                marginHorizontal: 10,
                alignItems: "center",
              }}
              onPress={handleCancelar}
            >
              <Text
                style={{ color: "#37817A", fontSize: 16, fontWeight: "bold" }}
              >
                CANCELAR
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: "18%",
                backgroundColor: "#37817A",
                paddingVertical: 10,
                paddingHorizontal: 25,
                borderRadius: 25,
                borderColor: "#37817A",
                borderWidth: 2,
                marginHorizontal: 10,
                alignItems: "center",
              }}
              onPress={handleEnviar}
            >
              <Text
                style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
              >
                ENVIAR
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ModalRN isVisible={isModalVisible}>
          <AgregarMedicamentoWeb onSave={handleSave} onClose={toggleModal} />
        </ModalRN>
        <ModalRN isVisible={isModalVisible2}>
          <ModificarMedicamentoWeb
            onData={modMedicamento || {}}
            onUpdate={handleUpdate}
            onDelete={() => handleDelete(modIndex)}
            onClose={() => setModalVisible2(false)}
          />
        </ModalRN>

        {/* Custom Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisibleCustom(false)}
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
                    : modalType === "question"
                    ? "question-circle"
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
                    : modalType === "question"
                    ? "#2196F3"
                    : "#2196F3"
                }
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <View style={styles.modalButtonContainer}>
                {modalButtons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalButton,
                      { backgroundColor: button.style.backgroundColor },
                    ]}
                    onPress={button.onPress}
                  >
                    <Text
                      style={[
                        styles.modalButtonText,
                        { color: button.style.color },
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  textArea: {
    height: 150,
    justifyContent: "flex-start",
    textAlignVertical: "top",
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
  },
  medicamentoCard: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    borderColor: "#ddd",
    borderWidth: 1,
  },
  medicamentoTextBold: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  medicamentoInfo: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  medicamentoActions: {
    marginTop: 10,
  },
  iconButton: {
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  iconReceta: {
    color: "black",
    alignSelf: "center",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    padding: 20,
    backgroundColor: "#2A2A2E",
  },
  logo: {
    fontSize: 24,
    color: "white",
    marginLeft: 10,
  },
  profileIcon: {
    fontSize: 20,
    color: "white",
    marginRight: 10,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: "100%",
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputText: {
    fontSize: 16,
    textAlign: "left",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#37817A",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonCancelar: {
    backgroundColor: "#FF3131",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginHorizontal: 10,
    alignItems: "center",
  },
  buttonEnviar: {
    backgroundColor: "#37817A",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginHorizontal: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
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
    width: "80%",
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AgregarRecetaWeb;
