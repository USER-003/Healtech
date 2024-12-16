import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import styles from "../../../../../styles/stylesWeb";
import { Grid, Row, Column } from "./Grid";
import { Picker } from "@react-native-picker/picker";
import ProtectedRoute from "../../sesion/ProtectedRoute";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const ModificarMedicamentoWeb = ({ onClose, onUpdate, onData }) => {
  // Inicializamos el estado con valores por defecto del medicamento a modificar
  const [nombreMedicamento, setNombreMedicamento] = useState(
    onData?.nombre_medicamento || ""
  );
  const [viaAdministracion, setViaAdministracion] = useState(
    onData?.via_administracion || "Oral"
  );
  const [formaFarmaceutica, setFormaFarmaceutica] = useState(
    onData?.forma_farmaceutica || "Tabletas"
  );
  const [duracionTratamiento, setDuracionTratamiento] = useState(
    onData?.duracion_tratamiento?.numero || ""
  );
  const [unidadDuracion, setUnidadDuracion] = useState(
    onData?.duracion_tratamiento?.tiempo || "Días"
  );
  const [dosisUnidad, setDosisUnidad] = useState(
    onData?.frecuencia_administracion?.dosis || ""
  );
  const [frecuenciaDosis, setFrecuenciaDosis] = useState(
    onData?.frecuencia_administracion?.cada || ""
  );
  const [unidadTiempo, setUnidadTiempo] = useState(
    onData?.frecuencia_administracion?.tiempo || "Horas"
  );
  const [informacionAdicional, setInformacionAdicional] = useState(
    onData?.informacion_adicional || ""
  );

  // Estados para el modal personalizado
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // "warning", "success", etc.
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtons, setModalButtons] = useState([]); // Array de configuraciones de botones

  const showModal = (title, message, type, buttons) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalButtons(buttons);
    setModalVisible(true);
  };

  // Manejo de datos para guardar la modificación
  const handleSave = () => {
    if (!nombreMedicamento || !duracionTratamiento) {
      showModal(
        "CAMPOS VACÍOS",
        "Por favor, completa todos los campos obligatorios.",
        "warning",
        [
          {
            text: "Cerrar",
            onPress: () => setModalVisible(false),
            style: { backgroundColor: "#37817A", color: "#fff" },
          },
        ]
      );
      return;
    }

    const medicamentoModificado = {
      nombre_medicamento: nombreMedicamento,
      duracion_tratamiento: {
        numero: duracionTratamiento,
        tiempo: unidadDuracion,
      },
      frecuencia_administracion: {
        dosis: dosisUnidad,
        cada: frecuenciaDosis,
        tiempo: unidadTiempo,
      },
      informacion_adicional: informacionAdicional,
      via_administracion: viaAdministracion,
      forma_farmaceutica: formaFarmaceutica,
    };

    onUpdate([medicamentoModificado]); // Enviar el medicamento modificado
    onClose();
  };

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <ScrollView>
        <View
          style={[styles.container, { backgroundColor: "white", padding: 40 }]}
        >
          <View
            style={[
              styles.headingContainer,
              { backgroundColor: "transparent" },
            ]}
          >
            <Text
              style={[
                styles.heading,
                { color: "black", fontFamily: "CeraRoundProRegular" },
              ]}
            >
              MODIFICAR MEDICAMENTO
            </Text>
          </View>

          <View
            style={[
              styles.mainContainer,
              { backgroundColor: "white", padding: 50 },
            ]}
          >
            <Grid style={{ width: "100%" }}>
              <Row>
                <Column size={4}>
                  <Text style={styles.label}>Medicamento:</Text>
                </Column>
                <Column size={4}>
                  <Text style={styles.label}>Forma farmacéutica:</Text>
                </Column>
                <Column size={4}>
                  <Text style={styles.label}>Vía de administración:</Text>
                </Column>
              </Row>
              <Row>
                <Column size={4}>
                  {/* Input del medicamento */}
                  <TextInput
                    style={{ borderWidth: 1, padding: 10, borderRadius: 10 }}
                    value={nombreMedicamento}
                    onChangeText={(text) => setNombreMedicamento(text.trim())}
                  />
                </Column>
                <Column size={4}>
                  <Picker
                    style={{ padding: 10 }}
                    selectedValue={formaFarmaceutica}
                    onValueChange={(itemValue) =>
                      setFormaFarmaceutica(itemValue)
                    }
                  >
                    <Picker.Item label="Tableta" value="Tableta" />
                    <Picker.Item label="Jarabe" value="Jarabe" />
                    <Picker.Item label="Inyectable" value="Inyectable" />
                    <Picker.Item label="Supositorio" value="Supositorio" />
                    <Picker.Item label="Inhalador" value="Inhalador" />
                    <Picker.Item label="Gotas" value="Gotas" />
                    <Picker.Item label="Crema" value="Crema" />
                  </Picker>
                </Column>
                <Column size={4}>
                  <Picker
                    style={{ padding: 10 }}
                    selectedValue={viaAdministracion}
                    onValueChange={(itemValue) =>
                      setViaAdministracion(itemValue)
                    }
                  >
                    <Picker.Item label="Vía oral" value="Oral" />
                    <Picker.Item label="Vía inhalada" value="Inhalado" />
                    <Picker.Item label="Vía inyectada" value="Inyectado" />
                    <Picker.Item label="Vía tópica" value="Tópico" />
                  </Picker>
                </Column>
              </Row>

              {/* Sección de duración del tratamiento */}
              <Row>
                <Column size={6}>
                  <Text style={styles.label}>Duración del tratamiento:</Text>
                </Column>
                <Column size={6}>
                  <Text style={styles.label}>Unidad de tiempo:</Text>
                </Column>
              </Row>
              <Row>
                <Column size={6}>
                  <TextInput
                    style={{ borderWidth: 1, padding: 10, borderRadius: 10 }}
                    value={String(duracionTratamiento)}
                    onChangeText={(text) => setDuracionTratamiento(text)}
                    keyboardType="numeric"
                    placeholder="Ej: 10"
                  />
                </Column>
                <Column size={6}>
                  <Picker
                    style={{ padding: 10 }}
                    selectedValue={unidadDuracion}
                    onValueChange={(itemValue) => setUnidadDuracion(itemValue)}
                  >
                    <Picker.Item label="Días" value="Días" />
                    <Picker.Item label="Semanas" value="Semanas" />
                    <Picker.Item label="Meses" value="Meses" />
                  </Picker>
                </Column>
              </Row>

              <Row>
                <Column size={3}>
                  <Text style={styles.label}>Unidad de dosis: </Text>
                </Column>
                <Column size={3}>
                  <Text style={styles.label}>Frecuencia (cada):</Text>
                </Column>

                <Column size={3}>
                  <Text style={styles.label}>
                    Intervalo de administración:
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column size={3}>
                  <TextInput
                    style={styles.inputM}
                    value={String(dosisUnidad)}
                    onChangeText={setDosisUnidad}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </Column>

                <Column size={3}>
                  <TextInput
                    style={styles.inputM}
                    value={String(frecuenciaDosis)}
                    onChangeText={setFrecuenciaDosis}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </Column>
                <Column size={3}>
                  <Picker
                    style={{ padding: 10 }}
                    selectedValue={unidadTiempo}
                    onValueChange={(itemValue) => setUnidadTiempo(itemValue)}
                  >
                    <Picker.Item label="Horas" value="Horas" />
                    <Picker.Item label="Días" value="Días" />
                  </Picker>
                </Column>
              </Row>

              <Row>
                <Column size={12}>
                  <Text
                    style={[
                      styles.label,
                      styles.bold,
                      { marginBottom: 20, textAlign: "center" },
                    ]}
                  >
                    Instrucciones adicionales
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column size={12}>
                  <TextInput
                    style={styles.textArea}
                    value={informacionAdicional}
                    onChangeText={setInformacionAdicional}
                    multiline={true}
                    numberOfLines={4}
                    placeholder="Escribe aquí..."
                  />
                </Column>
              </Row>

              <View style={{ height: 10 }} />

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
                    borderColor: "#37817A", // Color del borde
                    borderWidth: 2, // Ancho del borde
                    marginHorizontal: 10, // Espacio entre botones
                    alignItems: "center",
                  }}
                  onPress={onClose}
                >
                  <Text
                    style={{
                      color: "#37817A",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    width: "18%",
                    backgroundColor: "#37817A",
                    paddingVertical: 10,
                    paddingHorizontal: 25,
                    borderRadius: 25,
                    borderColor: "#37817A", // Color del borde
                    borderWidth: 2, // Ancho del borde
                    marginHorizontal: 10, // Espacio entre botones
                    alignItems: "center",
                  }}
                  onPress={handleSave}
                >
                  <Text
                    style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
                  >
                    Modificar
                  </Text>
                </TouchableOpacity>
              </View>
            </Grid>
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
};

export default ModificarMedicamentoWeb;

