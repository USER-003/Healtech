import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  CheckBox,
  Picker,
  Modal,
} from "react-native";
import { Button } from "react-native-elements";
import { useRouter } from "expo-router";

import setPacientAccount from "../../../../../../../src/queryfb/paciente/setPacientAccount";
import checkIdExists from "../../../../../../../src/queryfb/paciente/checkIdPacientExist";
import {
  getExpedienteNumber,
  incrementExpedienteNumber,
} from "../../../../../../../src/queryfb/paciente/getExpedienteNumber";

import Menu from "../../Menu";
import { useLocalSearchParams } from "expo-router";
import Swal from "sweetalert2"; // Importa sweetalert2
import ProtectedRoute from "../../../../sesion/ProtectedRoute";
import getUserUID from "../../../../../../../src/queryfb/general/getUserUID";

const App = () => {
  const userUID = getUserUID(); // Obtener el UID del usuario actual
  const [nombre, setNombre] = useState("");
  const [expediente, setExpediente] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [esMenor, setEsMenor] = useState(false); // Estado para manejar si es menor
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [tipoSangre, setTipoSangre] = useState("");
  const [alergias, setAlergias] = useState("");
  const [medicamentosCronicos, setMedicamentosCronicos] = useState("");
  const [antecedentesFamiliares, setAntecedentesFamiliares] = useState("");
  const [enfermedadesCronicas, setEnfermedadesCronicas] = useState([]);
  const [cirugiasAnteriores, setCirugiasAnteriores] = useState([]);
  const [hospitalizacionesPrevias, setHospitalizacionesPrevias] = useState([]);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [sexo, setSexo] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const { ID } = useLocalSearchParams();
  const router = useRouter();

  // Funciones para añadir y remover enfermedades crónicas
  const handleAddEnfermedadCronica = () => {
    setEnfermedadesCronicas([...enfermedadesCronicas, ""]);
  };

  const handleRemoveEnfermedadCronica = (index) => {
    const list = [...enfermedadesCronicas];
    list.splice(index, 1);
    setEnfermedadesCronicas(list);
  };

  const handleEnfermedadChange = (value, index) => {
    const list = [...enfermedadesCronicas];
    list[index] = value;
    setEnfermedadesCronicas(list);
  };

  // Funciones para añadir y remover cirugías anteriores
  const handleAddCirugia = () => {
    setCirugiasAnteriores([
      ...cirugiasAnteriores,
      { razon: "", fechaIngreso: "", fechaAlta: "" },
    ]);
  };

  const handleRemoveCirugia = (index) => {
    const list = [...cirugiasAnteriores];
    list.splice(index, 1);
    setCirugiasAnteriores(list);
  };

  const handleCirugiaChange = (value, index, field) => {
    const list = [...cirugiasAnteriores];
    list[index][field] = value;
    setCirugiasAnteriores(list);
  };

  // Funciones para añadir y remover hospitalizaciones previas
  const handleAddHospitalizacion = () => {
    setHospitalizacionesPrevias([
      ...hospitalizacionesPrevias,
      { razon: "", fechaIngreso: "", fechaAlta: "" },
    ]);
  };

  const handleRemoveHospitalizacion = (index) => {
    const list = [...hospitalizacionesPrevias];
    list.splice(index, 1);
    setHospitalizacionesPrevias(list);
  };

  const handleHospitalizacionChange = (value, index, field) => {
    const list = [...hospitalizacionesPrevias];
    list[index][field] = value;
    setHospitalizacionesPrevias(list);
  };

  const validateFields = () => {
    if (
      !nombre ||
      !expediente ||
      !identificacion ||
      !direccion ||
      !telefono ||
      !email ||
      !nacionalidad ||
      !fechaNacimiento ||
      !sexo ||
      !peso ||
      !altura ||
      !tipoSangre
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, complete todos los campos obligatorios.",
      });
      return false;
    }

    const identificacionRegex = esMenor ? /^\d{11}$/ : /^\d{9}$/;
    if (!identificacionRegex.test(identificacion)) {
      Swal.fire({
        icon: "warning",
        title: "Identificación inválida",
        text: esMenor
          ? "Por favor, ingrese un Carnet de Minoridad válido de 11 dígitos."
          : "Por favor, ingrese un DUI válido de 9 dígitos.",
      });
      return false;
    }

    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(telefono)) {
      Swal.fire({
        icon: "warning",
        title: "Teléfono inválido",
        text: "El número de teléfono debe contener exactamente 8 dígitos numéricos.",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "warning",
        title: "Correo inválido",
        text: "Por favor, ingrese un correo electrónico válido.",
      });
      return false;
    }

    const dateRegex =
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d\d$/;
    if (!dateRegex.test(fechaNacimiento)) {
      Swal.fire({
        icon: "warning",
        title: "Fecha inválida",
        text: "Por favor, ingrese una fecha de nacimiento válida en el formato DD/MM/AAAA.",
      });
      return false;
    }

    const numberRegex = /^[0-9]+$/;
    if (!numberRegex.test(peso)) {
      Swal.fire({
        icon: "warning",
        title: "Peso inválido",
        text: "Por favor, ingrese un peso válido (solo números).",
      });
      return false;
    }

    if (!numberRegex.test(altura)) {
      Swal.fire({
        icon: "warning",
        title: "Altura inválida",
        text: "Por favor, ingrese una altura válida (solo números).",
      });
      return false;
    }

    if (!isChecked) {
      Swal.fire({
        icon: "warning",
        title: "Términos y condiciones",
        text: "Debe aceptar los términos y condiciones para continuar.",
      });
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateFields()) return;

    try {
      // Verifica si el identificador ya está registrado
      const exists = await checkIdExists(identificacion);
      if (exists) {
        Swal.fire({
          icon: "warning",
          title: "Identificador ya registrado",
          text: "El identificador que ingresaste ya está en uso. Por favor, ingresa un identificador diferente.",
        });
        return;
      }

      const nuevoExpediente = await incrementExpedienteNumber();

      // Si no existe, procede a crear la cuenta del paciente
      await setPacientAccount(
        userUID,
        ID,
        nombre,
        nuevoExpediente,
        identificacion,
        esMenor,
        direccion,
        telefono,
        email,
        nacionalidad,
        peso,
        altura,
        tipoSangre,
        alergias,
        medicamentosCronicos,
        antecedentesFamiliares,
        enfermedadesCronicas,
        cirugiasAnteriores,
        hospitalizacionesPrevias,
        fechaNacimiento,
        sexo
      );
      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Cuenta de paciente creada exitosamente.",
      }).then(() => {
        router.replace("views/web/admin/DashBoard");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error al crear la cuenta: ${error.message}`,
      });
    }
  };

  const handleShowTerms = () => {
    setShowTermsModal(true);
  };

  const handleAcceptTerms = () => {
    setIsChecked(true);
    setShowTermsModal(false);
  };

  // Función para obtener el nuevo número de expediente
  const handleExpediente = async () => {
    try {
      const nuevoExpediente = await getExpedienteNumber();
      console.log("Nuevo número de expediente:", nuevoExpediente);
      setExpediente(nuevoExpediente); // Establece el nuevo número de expediente en el estado
    } catch (error) {
      console.error("Error al generar el número de expediente:", error);
    }
  };

  // Ejecutar handleExpediente al cargar el componente
  useEffect(() => {
    handleExpediente();
  }, []); // Se ejecuta solo una vez al montar el componente

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["pacientes"]}
    >
      <View style={styles.container}>
        <Menu />
        <View style={styles.mainContent}>
          <Text style={styles.dashboardText}>Agregando nuevo paciente</Text>

          <ScrollView style={styles.formContainer}>
            <View style={styles.card}>
              <Text style={styles.formTitle}>Datos personales</Text>

              <View style={styles.checkboxContainer}>
                <CheckBox value={esMenor} onValueChange={setEsMenor} />
                <Text style={styles.checkboxLabel}>
                  {" "}
                  Paciente es menor de edad
                </Text>
              </View>

              <TextInput
                style={[styles.input, styles.fullWidth, styles.marginBottom]}
                placeholder="Nombre*"
                value={nombre}
                onChangeText={setNombre}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="# Expediente*"
                  value={expediente}
                  onChangeText={setExpediente}
                  editable={false}
                />
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder={esMenor ? "Carnet de Minoridad*" : "DUI*"}
                  value={identificacion}
                  onChangeText={setIdentificacion}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Dirección*"
                  value={direccion}
                  onChangeText={setDireccion}
                />
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Teléfono*"
                  value={telefono}
                  onChangeText={setTelefono}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Email*"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Nacionalidad*"
                  value={nacionalidad}
                  onChangeText={setNacionalidad}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Fecha de Nacimiento (DD/MM/AAAA)*"
                  value={fechaNacimiento}
                  onChangeText={setFechaNacimiento}
                />
                <Picker
                  selectedValue={sexo}
                  style={[styles.input, styles.halfWidth]}
                  onValueChange={(itemValue) => setSexo(itemValue)}
                >
                  <Picker.Item label="Seleccione Sexo*" value="" />
                  <Picker.Item label="Masculino" value="masculino" />
                  <Picker.Item label="Femenino" value="femenino" />
                </Picker>
              </View>

              <Text style={styles.formTitle}>Campos de salud</Text>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Peso (kg)*"
                  value={peso}
                  onChangeText={setPeso}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Altura (cm)*"
                  value={altura}
                  onChangeText={setAltura}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.row}>
                <Picker
                  selectedValue={tipoSangre}
                  style={[styles.input, styles.halfWidth]}
                  onValueChange={(itemValue) => setTipoSangre(itemValue)}
                >
                  <Picker.Item label="Tipo de Sangre*" value="" />
                  <Picker.Item label="O+" value="O+" />
                  <Picker.Item label="O-" value="O-" />
                  <Picker.Item label="A+" value="A+" />
                  <Picker.Item label="A-" value="A-" />
                  <Picker.Item label="B+" value="B+" />
                  <Picker.Item label="B-" value="B-" />
                  <Picker.Item label="AB+" value="AB+" />
                  <Picker.Item label="AB-" value="AB-" />
                </Picker>

                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Alergias"
                  value={alergias}
                  onChangeText={setAlergias}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Medicamentos crónicos"
                  value={medicamentosCronicos}
                  onChangeText={setMedicamentosCronicos}
                />
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Antecedentes familiares"
                  value={antecedentesFamiliares}
                  onChangeText={setAntecedentesFamiliares}
                />
              </View>

              <Text style={styles.formTitle}>Historial médico</Text>

              <View style={styles.row}>
                <Text style={styles.subTitle}>Enfermedades Crónicas</Text>
              </View>

              {enfermedadesCronicas.map((enfermedad, index) => (
                <View key={index} style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enfermedad Crónica"
                    value={enfermedad}
                    onChangeText={(text) => handleEnfermedadChange(text, index)}
                  />
                  <Button
                    style={styles.inputDelete}
                    title="Eliminar"
                    onPress={() => handleRemoveEnfermedadCronica(index)}
                  />
                </View>
              ))}
              <Button
                style={styles.inputAdd}
                title="Añadir Enfermedad Crónica"
                onPress={handleAddEnfermedadCronica}
              />
              <br />
              <View style={styles.row}>
                <Text style={styles.subTitle}>Cirugías Anteriores</Text>
              </View>

              {cirugiasAnteriores.map((cirugia, index) => (
                <View key={index} style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Razón"
                    value={cirugia.razon}
                    onChangeText={(text) =>
                      handleCirugiaChange(text, index, "razon")
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Fecha de Ingreso (DD/MM/AAAA)"
                    value={cirugia.fechaIngreso}
                    onChangeText={(text) =>
                      handleCirugiaChange(text, index, "fechaIngreso")
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Fecha de Alta (DD/MM/AAAA)"
                    value={cirugia.fechaAlta}
                    onChangeText={(text) =>
                      handleCirugiaChange(text, index, "fechaAlta")
                    }
                  />
                  <Button
                    style={styles.inputDelete}
                    title="Eliminar"
                    onPress={() => handleRemoveCirugia(index)}
                  />
                </View>
              ))}
              <Button
                title="Añadir Cirugía"
                onPress={handleAddCirugia}
                style={styles.inputAdd}
              />
              <br />
              <View style={styles.row}>
                <Text style={styles.subTitle}>Hospitalizaciones Previas</Text>
              </View>

              {hospitalizacionesPrevias.map((hospitalizacion, index) => (
                <View key={index} style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Razón"
                    value={hospitalizacion.razon}
                    onChangeText={(text) =>
                      handleHospitalizacionChange(text, index, "razon")
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Fecha de Ingreso (DD/MM/AAAA)"
                    value={hospitalizacion.fechaIngreso}
                    onChangeText={(text) =>
                      handleHospitalizacionChange(text, index, "fechaIngreso")
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Fecha de Alta (DD/MM/AAAA)"
                    value={hospitalizacion.fechaAlta}
                    onChangeText={(text) =>
                      handleHospitalizacionChange(text, index, "fechaAlta")
                    }
                  />
                  <Button
                    style={styles.inputDelete}
                    title="Eliminar"
                    onPress={() => handleRemoveHospitalizacion(index)}
                  />
                </View>
              ))}
              <Button
                style={styles.inputAdd}
                title="Añadir Hospitalización"
                onPress={handleAddHospitalizacion}
              />
              <br />
              <View style={styles.checkboxContainer}>
                <CheckBox value={isChecked} onValueChange={setIsChecked} />
                <Text style={styles.checkboxLabel}>
                  {" "}
                  Acepto los{" "}
                  <Text style={styles.linkText} onPress={handleShowTerms}>
                    términos y condiciones
                  </Text>
                </Text>
              </View>

              <Button
                title="Guardar"
                buttonStyle={styles.submitButton}
                disabled={!isChecked} // Desactiva el botón si no se aceptan los términos
                onPress={handleRegister} // Llama a handleRegister cuando se presiona el botón
              />
            </View>
          </ScrollView>
        </View>

        {/* Modal para mostrar términos y condiciones */}
        <Modal
          visible={showTermsModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>Términos y Condiciones</Text>
                <Text style={styles.modalText}>
                  1. **Privacidad de Datos**: La información de salud, incluidos
                  los datos personales y médicos del paciente, se almacenará de
                  manera segura y no se compartirá sin el consentimiento del
                  paciente.
                </Text>
                <Text style={styles.modalText}>
                  2. **Uso de la Aplicación**: La aplicación debe ser utilizada
                  únicamente por médicos autorizados para gestionar los
                  expedientes médicos de sus pacientes.
                </Text>
                <Text style={styles.modalText}>
                  3. **Consentimiento del Paciente**: Al crear una cuenta en
                  esta aplicación, los pacientes consienten en proporcionar su
                  información médica para fines de diagnóstico y tratamiento.
                </Text>
                <Text style={styles.modalText}>
                  4. **Responsabilidad del Médico**: Los médicos son
                  responsables del uso adecuado de los expedientes médicos y de
                  respetar la privacidad y la ética profesional.
                </Text>
                <Text style={styles.modalText}>
                  5. **Actualización de Información**: Los pacientes deben
                  mantener su información actualizada para recibir un
                  tratamiento adecuado.
                </Text>
                <Text style={styles.modalText}>
                  6. **Jurisdicción**: Estos términos están regidos por las
                  leyes de El Salvador, y cualquier disputa se resolverá bajo
                  esta jurisdicción.
                </Text>
              </ScrollView>

              <Button title="Aceptar" onPress={handleAcceptTerms} />
            </View>
          </View>
        </Modal>
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  sidebar: {
    width: "20%",
    backgroundColor: "#1E3A8A",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  dashboardText: {
    color: "#1E3A8A",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
  },
  formContainer: {
    backgroundColor: "#FFF",
    borderRadius: 0,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderColor: "#D9D9D9",
    borderWidth: 1,
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
  },
  row: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "CeraRoundProMedium",
  },
  input: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 5,
    fontFamily: "CeraRoundProMedium",
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputDelete: {
    width: "25%",
  },
  inputAdd: {
    width: "25%",
  },
  fullWidth: {
    flex: 1,
  },
  halfWidth: {
    flex: 0.5,
    margin: 1.5,
  },
  marginBottom: {
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: "CeraRoundProMedium",
  },
  linkText: {
    color: "#37817A",
    textDecorationLine: "underline",
  },
  submitButton: {
    backgroundColor: "#37817A",
    borderRadius: 5,
    width: "20%",
    fontFamily: "CeraRoundProMedium",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalScrollView: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 10,
    color: "#333",
    textAlign: "justify",
  },
  modalButton: {
    backgroundColor: "#37817A",
    marginTop: 20,
  },
});

export default App;
