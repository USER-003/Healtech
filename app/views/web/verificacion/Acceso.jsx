import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import setLog from "../../../../src/queryfb/general/setLog";
import compareAndDeleteAccessCode from "../../../../src/queryfb/paciente/accessCode/readAccessCode";
import searchPatientUIDByDUI from "../../../../src/queryfb/paciente/getPacientUid";

const AccessModal = ({ visible, onClose, onSuccessRedirect, patientId }) => {
  const [currentStep, setCurrentStep] = useState("verify");
  const [code, setCode] = useState(["", "", "", ""]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [justification, setJustification] = useState("");
  const [description, setDescription] = useState("");
  const [errorJustification, setErrorJustification] = useState(false);
  const [errorCode, setErrorCode] = useState(false);

  // Función para manejar la verificación del código
  const handleVerify = async () => {
    const enteredCode = code.join("");
    console.log("Código ingresado:", enteredCode);
    const pacientUid = await searchPatientUIDByDUI(patientId);
    const isMatch = await compareAndDeleteAccessCode(pacientUid, enteredCode);

    console.log(`Coincidencia: ${isMatch}, id: ${pacientUid}`);

    // Lógica de verificación del código (ejemplo: código "1234" es válido)
    if (isMatch) {
      // Acción a realizar si el código es correcto
      onSuccessRedirect();
      onClose();
    } else {
      // Mantener la modal abierta para que el usuario pueda intentar nuevamente
      setErrorCode(true);
    }
  };

  const handleSaveAccessWithoutCode = () => {
    if (!justification.trim() || !selectedOption) {
      setErrorJustification(true);
      return;
    }

    // Generar el log con toda la información
    const logMessage = `
        Acceso sin código seleccionado: ${selectedOption}
        Justificación: ${justification}
        Descripción: ${description}
        Paciente ID: ${patientId}
      `;
    console.log(logMessage);
    setLog(logMessage, "Acceso", "éxito");

    // Aquí se debe registrar el log o realizar acciones necesarias.
    onSuccessRedirect();
    onClose();
  };

  const handleCancel = () => {
    setCurrentStep("verify");
    setCode(["", "", "", ""]);
    setSelectedOption(null);
    setJustification("");
    setDescription("");
    setErrorCode(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="verified" size={24} color="#37817A" />
            <Text style={styles.title}>Verificación requerida</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {currentStep === "verify" ? (
            <>
              <Text style={styles.description}>
                Ingresa el código de acceso de 4 dígitos que generó previamente
                el paciente para continuar
              </Text>
              <View style={styles.inputContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    style={[styles.input, errorCode && { borderColor: "red" }]}
                    maxLength={1}
                    keyboardType="numeric"
                    value={digit}
                    onChangeText={(text) => {
                      const newCode = [...code];
                      newCode[index] = text;
                      setCode(newCode);
                      if (errorCode) setErrorCode(false);
                    }}
                  />
                ))}
              </View>
              {errorCode && (
                <Text style={styles.errorText}>
                  Por favor, ingresa un código válido.
                </Text>
              )}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={handleVerify}
                >
                  <Text style={styles.verifyButtonText}>Verificar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.noCodeButton}
                  onPress={() => setCurrentStep("accessWithoutCode")}
                >
                  <Text style={styles.noCodeButtonText}>Acceso sin código</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TextInput
                style={[
                  styles.textInput,
                  errorJustification && { borderColor: "red" },
                ]}
                placeholder="Justifique su motivo de acceso"
                multiline
                value={justification}
                onChangeText={(text) => {
                  setJustification(text);
                  if (errorJustification) setErrorJustification(false);
                }}
              />
              <Text style={styles.label}>Motivo:</Text>
              <View style={styles.radioGroup}>
                {[
                  "Emergencia médica",
                  "Error del paciente",
                  "Soporte técnico",
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.radioOption}
                    onPress={() => setSelectedOption(option)}
                  >
                    <View style={styles.radioCircle}>
                      {selectedOption === option && (
                        <View style={styles.selectedCircle} />
                      )}
                    </View>
                    <Text style={styles.radioText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="Descripción"
                multiline
                value={description}
                onChangeText={setDescription}
              />
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveAccessWithoutCode}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          <View style={styles.alertContainer}>
            <MaterialIcons name="error-outline" size={20} color="#000" />
            <Text style={styles.alertText}>
              Los accesos realizados "Acceso Sin Código" se registrarán
              automáticamente en un log central como eventos excepcionales. Usa
              esta opción únicamente en casos excepcionales.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  description: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    marginVertical: 10,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: 50,
    height: 50,
    textAlign: "center",
    fontSize: 18,
    marginHorizontal: 5,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: "100%",
    height: 40,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    alignSelf: "flex-start",
    fontWeight: "bold",
    marginVertical: 10,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#37817A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  selectedCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#37817A",
  },
  radioText: {
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: "100%",
    height: 80,
    padding: 10,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  verifyButton: {
    backgroundColor: "#37817A",
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#fff",
  },
  noCodeButton: {
    borderWidth: 1,
    borderColor: "#37817A",
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  noCodeButtonText: {
    color: "#37817A",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#37817A",
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#37817A",
  },
  saveButton: {
    backgroundColor: "#37817A",
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
  },
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  alertText: {
    marginLeft: 10,
    fontSize: 12,
    color: "#000",
  },
});

export default AccessModal;
