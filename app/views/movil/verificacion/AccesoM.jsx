// AccesoM.jsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import compareAndDeleteAccessCode from "../../../../src/queryfb/paciente/accessCode/readAccessCode";
import searchPatientUIDByDUI from "../../../../src/queryfb/paciente/getPacientUid";
import registrarLogSistema from "../../../../src/queryfb/general/setLog";

const AccesoM = ({ closeModal, onSuccess, id, type }) => {
  const [currentStep, setCurrentStep] = useState("verify"); // 'verify' o 'accessWithoutCode'
  const [code, setCode] = useState(["", "", "", ""]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [justification, setJustification] = useState("");
  const [description, setDescription] = useState("");

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackIcon, setFeedbackIcon] = useState("check-circle"); // icono por defecto

  const [errorJustification, setErrorJustification] = useState(false);
  const [errorCode, setErrorCode] = useState(false);

  // Función para cancelar y navegar entre pasos
  const handleCancel = () => {
    if (currentStep === "accessWithoutCode") {
      // Si está en el paso de acceso sin código, volver al paso de verificación
      setCurrentStep("verify");
      setErrorJustification(false);
    } else {
      // Si está en el paso de verificación, cerrar el componente
      if (closeModal) closeModal();
      // Reiniciar estados
      setCurrentStep("verify");
      setSelectedOption(null);
      setJustification("");
      setDescription("");
      setCode(["", "", "", ""]);
      setErrorCode(false);
    }
  };
    // Función para cambiar al paso de acceso sin código
    const handleAccessWithoutCode = () => {
      setCurrentStep("accessWithoutCode");
      setErrorJustification(false);
    };
    

  // Función para manejar la verificación del código
  const handleVerify = async () => {
    const enteredCode = code.join("");
    console.log("Código ingresado:", enteredCode);
    const pacientUid = await searchPatientUIDByDUI(id);
    const isMatch = await compareAndDeleteAccessCode(pacientUid, enteredCode);

    console.log(`Coincidencia: ${isMatch}, id: ${pacientUid}`);

    const accion = `Verificación de código para el paciente (UID: ${pacientUid})`;

    if (isMatch) {
      setFeedbackMessage("Acceso concedido");
      setFeedbackIcon("check-circle");
      setFeedbackModalVisible(true);

      try {
        await registrarLogSistema(accion, "Acceso", "exito");
        console.log("Log registrado exitosamente.");
      } catch (logError) {
        console.error("Error al registrar el log:", logError);
      }

      if (onSuccess) onSuccess();
      setCurrentStep("verify");
      setSelectedOption(null);
      setJustification("");
      setDescription("");
      setCode(["", "", "", ""]);
    } else {
      setFeedbackMessage("Código incorrecto o expirado. Intente nuevamente.");
      setFeedbackIcon("error-outline");
      setFeedbackModalVisible(true);
      setErrorCode(true);

      try {
        await registrarLogSistema(accion, "Acceso", "fallo");
        console.log("Log registrado exitosamente.");
      } catch (logError) {
        console.error("Error al registrar el log:", logError);
      }
    }
  };

  const handleSaveAccessWithoutCode = async () => {
    if (justification.trim() === "") {
      setErrorJustification(true);
      return;
    }
    

    if (!selectedOption) {
      setFeedbackMessage("Por favor, selecciona un motivo.");
      setFeedbackIcon("error-outline");
      setFeedbackModalVisible(true);
      return;
    }

    const accion = `Acceso sin código solicitado. Motivo: ${selectedOption}, Justificación: ${justification}`;

    try {
      console.log("Acceso sin código seleccionado:", selectedOption);
      console.log("Justificación:", justification);
      console.log("Descripción:", description);

      setFeedbackMessage("Motivo de acceso guardado exitosamente.");
      setFeedbackIcon("check-circle");
      setFeedbackModalVisible(true);

      await registrarLogSistema(accion, "Acceso", "exito");
      console.log("Log registrado exitosamente.");

      if (onSuccess) onSuccess();

      setCurrentStep("verify");
      setSelectedOption(null);
      setJustification("");
      setDescription("");
      setCode(["", "", "", ""]);
      setErrorJustification(false);
    } catch (error) {
      setFeedbackMessage("Error al guardar el acceso sin código.");
      setFeedbackIcon("error-outline");
      setFeedbackModalVisible(true);

      try {
        await registrarLogSistema(accion, "Acceso", "fallo");
        console.error("Log registrado con fallo.");
      } catch (logError) {
        console.error("Error al registrar el log:", logError);
      }
    }
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalVisible(false);
  };
    // Función para manejar la selección de opciones de radio
    const handleSelectOption = (option) => {
      setSelectedOption(option);
    };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <MaterialIcons name="verified" size={24} color="#37817A" />
        <Text style={styles.title}>Verificación requerida</Text>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Contenido Condicional */}
      {currentStep === "verify" ? (
        <>
          <Text style={styles.description}>
            Ingresa el código de acceso de 4 dígitos que generó
            previamente el paciente para continuar
          </Text>

          {/* Campos para el código */}
          <View style={styles.inputContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                style={[
                  styles.input,
                  errorCode && { borderColor: "red" },
                ]}
                maxLength={1}
                keyboardType="numeric"
                value={digit}
                onChangeText={(text) => {
                  const newCode = [...code];
                  newCode[index] = text;
                  setCode(newCode);
                  if (errorCode) setErrorCode(false);
                  // Opcional: Mover el enfoque al siguiente campo si no está vacío
                }}
              />
            ))}
          </View>
          {errorCode && (
            <Text style={styles.errorText}>
              Por favor, ingresa un código válido.
            </Text>
          )}

          {/* Botones */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerify}
            >
              <Text style={styles.verifyButtonText}>Verificar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.noCodeButton}
              onPress={handleAccessWithoutCode}
            >
              <Text style={styles.noCodeButtonText}>
                Sin código
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // Paso de Acceso sin Código
        <>
          {/* Campo para justificar motivo */}
          <TextInput
            style={[
              styles.justifyInput,
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
          {errorJustification && (
            <Text style={styles.errorText}>
              Este campo es obligatorio.
            </Text>
          )}

          {/* Motivo */}
          <Text style={styles.motivoText}>Motivo:</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => handleSelectOption("Emergencia médica")}
            >
              <View style={styles.radioCircle}>
                {selectedOption === "Emergencia médica" && (
                  <View style={styles.selectedRb} />
                )}
              </View>
              <Text style={styles.radioText}>Emergencia médica</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => handleSelectOption("Error del paciente")}
            >
              <View style={styles.radioCircle}>
                {selectedOption === "Error del paciente" && (
                  <View style={styles.selectedRb} />
                )}
              </View>
              <Text style={styles.radioText}>Error del paciente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => handleSelectOption("Soporte técnico")}
            >
              <View style={styles.radioCircle}>
                {selectedOption === "Soporte técnico" && (
                  <View style={styles.selectedRb} />
                )}
              </View>
              <Text style={styles.radioText}>Soporte técnico</Text>
            </TouchableOpacity>
          </View>

          {/* Descripción */}
          <TextInput
            style={styles.descriptionInput}
            placeholder="Descripción"
            multiline
            value={description}
            onChangeText={setDescription}
          />

          {/* Botones */}
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

      {/* Alerta */}
      <View style={styles.alertContainer}>
        <MaterialIcons name="error-outline" size={20} color="#000" />
        <Text style={styles.alertText}>
          Los accesos realizados "Acceso Sin Código" se registrarán
          automáticamente en un log central como eventos excepcionales.
          Usa esta opción únicamente en casos excepcionales.
        </Text>
      </View>

      {/* Modal de Feedback */}
      {feedbackModalVisible && (
        <View style={styles.feedbackBackground}>
          <View style={styles.feedbackContainer}>
            <MaterialIcons
              name={feedbackIcon}
              size={50}
              color={feedbackIcon === "check-circle" ? "#4CAF50" : "#F44336"}
            />
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
            <TouchableOpacity
              style={styles.closeFeedbackButton}
              onPress={handleCloseFeedbackModal}
            >
              <Text style={styles.closeFeedbackButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    width: '90%', // Ajusta el ancho según tus necesidades
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    // Otros estilos necesarios
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "CeraRoundProMedium",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: 5,
  },
  description: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    marginVertical: 10,
    fontFamily: "CeraRoundProMedium",
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    width: "80%", // Ajustado para usar el 80% del ancho del contenedor
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: 50,
    height: 50,
    textAlign: "center",
    fontSize: 18,
    color: "#000",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    alignSelf: "center",
    width: "80%", // Ancho ajustado
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%", // Ajustado para usar el 80% del ancho del contenedor
    marginVertical: 20,
  },
  verifyButton: {
    backgroundColor: "#37817A",
    padding: 11,
    borderRadius: 20,
    width: "47%",
    height:"86%",
    
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#fff",
    fontFamily: "CeraRoundProMedium",
  },
  noCodeButton: {
    margin: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#37817A",
    borderRadius: 20,
    width: "47%",

    alignItems: "center",
  },
  noCodeButtonText: {
    color: "#37817A",
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  justifyInput: {
    width: "80%", // Ajustado para usar el 80% del ancho del contenedor
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    height: 50,
    padding: 10,
    marginVertical: 15,
    fontFamily: "CeraRoundProMedium",
  },
  motivoText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
    alignSelf: "flex-start",
    marginLeft: "10%",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: "10%",
    marginVertical: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    width: "30%",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#37817A",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#37817A",
  },
  radioText: {
    fontSize: 14,
    color: "#000",
    marginLeft: 5,
    fontFamily: "CeraRoundProMedium",
  },
  descriptionInput: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    height: 100,
    padding: 10,
    marginVertical: 15,
    fontFamily: "CeraRoundProMedium",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#37817A",
    padding: 10,
    borderRadius: 20,
    width: "45%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#37817A",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "CeraRoundProMedium",
  },
  saveButton: {
    backgroundColor: "#37817A",
    padding: 10,
    borderRadius: 20,
    width: "45%",
    
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "CeraRoundProMedium",
  },
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    marginTop: 10,
  },
  alertText: {
    textAlign: "justify",
    marginLeft: 10,
    fontSize: 12,
    color: "#000",
    flex: 1,
    fontFamily: "CeraRoundProMedium",
  },
  feedbackBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  feedbackText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    fontFamily: "CeraRoundProMedium",
    width: "100%",
  },
  closeFeedbackButton: {
    marginTop: 20,
    backgroundColor: "#37817A",
    padding: 10,
    borderRadius: 5,
    width: "50%",
    alignItems: "center",
  },
  closeFeedbackButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
});

export default AccesoM;


