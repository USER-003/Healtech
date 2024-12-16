import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Picker,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Calendar } from "react-native-calendars"; // Import del calendario
import Menu from "../../Menu";
import searchPatientByCode from "../../../../../../../src/queryfb/paciente/searchPatientByCode";
import { useLocalSearchParams } from "expo-router";
import { set } from "firebase/database";

const ModalesVista = () => {
  const [pacienteData, setPacienteData] = useState("");
  const { ID, type } = useLocalSearchParams();

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [expediente, setExpediente] = useState("");
  const [correo, setCorreo] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [edad, setEdad] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");

  const calcularEdad = (fechaNacimiento) => {
    if (fechaNacimiento) {
      // Convertir "DD/MM/YYYY" a "YYYY-MM-DD"
      const [dia, mes, anio] = fechaNacimiento.split("/");
      const fechaFormateada = `${anio}-${mes}-${dia}`; // "2003-12-24"

      // Calcular edad
      const hoy = new Date();
      const nacimiento = new Date(fechaFormateada);
      let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();

      // Ajustar si aún no ha pasado el cumpleaños este año
      const mesActual = hoy.getMonth();
      const diaActual = hoy.getDate();
      if (
        mesActual < nacimiento.getMonth() ||
        (mesActual === nacimiento.getMonth() &&
          diaActual < nacimiento.getDate())
      ) {
        edadCalculada--;
      }
      return edadCalculada.toString();
    } else {
      return "";
    }
  };

  useEffect(() => {
    // Llamar a la función para buscar datos del paciente al cargar el componente
    const fetchData = async () => {
      try {
        const data = await searchPatientByCode(type, ID);
        console.log(data);
        setPacienteData(data);

        const edad = calcularEdad(data.nacimiento);
        console.log(data.nacimiento);
        console.log(edad);
        // Actualizar los estados de los campos con la data obtenida
        setNombre(data.nombre || "");
        setDireccion(data.direccion || "");
        setTelefono(data.telefono || "");
        setExpediente(data.expediente || "");
        setCorreo(data.email || "");
        setNacionalidad(data.nacionalidad || "");
        setSelectedSex(data.sexo || "Masculino");
        setEdad(edad || ""); //Calcular la edad
        setSelectedDateNacimiento(data.nacimiento || "");
        setPeso(data.datos_salud.peso || "");
        setAltura(data.datos_salud.altura || "");
        setSelectedBloodType(data.datos_salud.tipo_sangre || "O+");
        setAlergias(data.datos_salud.alergias || []);
        setMedicamentos(data.datos_salud.medicamentos_cronicos || []);
        setAntecedentes(data.datos_salud.antecedentes_familiares || []);
        // Transformar enf_cron en array
        const enfermedadesArray = data.historia_clinica.enf_cron
          ? Object.keys(data.historia_clinica.enf_cron).map((key) => ({
              id: key,
              ...data.historia_clinica.enf_cron[key],
            }))
          : [];
        setEnfermedades(enfermedadesArray);

        // Transformar hosp_prev en array
        const hospitalizacionesArray = data.historia_clinica.hosp_prev
          ? Object.keys(data.historia_clinica.hosp_prev).map((key) => ({
              id: key,
              ...data.historia_clinica.hosp_prev[key],
            }))
          : [];
        setHospitalizaciones(hospitalizacionesArray);

        // Transformar int_quir en array
        const intervencionesArray = data.historia_clinica.int_quir
          ? Object.keys(data.historia_clinica.int_quir).map((key) => ({
              id: key,
              ...data.historia_clinica.int_quir[key],
            }))
          : [];
        setIntervenciones(intervencionesArray);
      } catch (error) {
        console.error("Error al buscar el paciente:", error);
      }
    };

    fetchData();
  }, [type, ID]);

  // -------------------------
  // Estados para Fecha de Nacimiento
  // -------------------------
  const [isNacimientoModalVisible, setNacimientoModalVisible] = useState(false);
  const [selectedDateNacimiento, setSelectedDateNacimiento] = useState("");

  // -------------------------
  // Estados para Enfermedades Crónicas
  // -------------------------
  const [openModalEnfermedad, setOpenModalEnfermedad] = useState(false); // Controla la visibilidad del modal
  const [enfermedadInput, setEnfermedadInput] = useState(""); // Almacena el texto de la enfermedad
  const [enfermedades, setEnfermedades] = useState([]); // Lista de enfermedades

  const [editingIndexEnfermedad, setEditingIndexEnfermedad] = useState(null); // Índice de la enfermedad que se está editando

  // -------------------------
  // Estados para Intervenciones Quirúrgicas
  // -------------------------
  const [intervencionesModalVisible, setIntervencionesModalVisible] =
    useState(false);
  const [intervencionInput, setIntervencionInput] = useState("");
  const [fechaIngresoIntervencion, setFechaIngresoIntervencion] = useState("");
  const [fechaAltaIntervencion, setFechaAltaIntervencion] = useState("");
  const [editingIndexIntervencion, setEditingIndexIntervencion] =
    useState(null);
  const [intervenciones, setIntervenciones] = useState([]);

  const [
    isIngresoIntervencionModalVisible,
    setIngresoIntervencionPickerVisible,
  ] = useState(false);
  const [isAltaIntervencionModalVisible, setAltaIntervencionPickerVisible] =
    useState(false);

  // -------------------------
  // Estados para Hospitalizaciones Previas
  // -------------------------
  const [hospitalizacionesModalVisible, setHospitalizacionesModalVisible] =
    useState(false);
  const [hospitalizacionInput, setHospitalizacionInput] = useState("");
  const [fechaIngresoHospitalizacion, setFechaIngresoHospitalizacion] =
    useState("");
  const [fechaAltaHospitalizacion, setFechaAltaHospitalizacion] = useState("");
  const [editingIndexHospitalizacion, setEditingIndexHospitalizacion] =
    useState(null);
  const [hospitalizaciones, setHospitalizaciones] = useState([]);

  const [
    isIngresoHospitalizacionPickerVisible,
    setIngresoHospitalizacionPickerVisible,
  ] = useState(false);
  const [
    isAltaHospitalizacionPickerVisible,
    setAltaHospitalizacionPickerVisible,
  ] = useState(false);

  // -------------------------
  // Estados para Dropdowns
  // -------------------------
  const [selectedBloodType, setSelectedBloodType] = useState("O+");
  const [selectedSex, setSelectedSex] = useState("Masculino");

  // -------------------------
  // Estados para listas de Salud
  // -------------------------
  const [alergias, setAlergias] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [antecedentes, setAntecedentes] = useState([]);

  // Estados separados para cada campo de entrada en Salud
  const [alergiasInput, setAlergiasInput] = useState("");
  const [medicamentosInput, setMedicamentosInput] = useState("");
  const [antecedentesInput, setAntecedentesInput] = useState("");

  // -------------------------
  // Estados para Modal de Mensajes
  // -------------------------
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageType, setMessageType] = useState("success"); // 'success' o 'error'
  const [messageText, setMessageText] = useState("");

  // -------------------------
  // Funciones para Mostrar y Ocultar el Modal de Mensajes
  // -------------------------
  const showMessageModal = (type, text) => {
    setMessageType(type);
    setMessageText(text);
    setMessageModalVisible(true);
  };

  const hideMessageModal = () => {
    setMessageModalVisible(false);
    setMessageText("");
    setMessageType("success");
  };

  // -------------------------
  // Funciones de Manejo de Fechas
  // -------------------------

  // Fecha de Nacimiento
  const handleSelectDateNacimiento = (day) => {
    setSelectedDateNacimiento(day.dateString);
    setNacimientoModalVisible(false);
    showMessageModal(
      "success",
      "Fecha de Nacimiento seleccionada correctamente."
    );
  };

  // Intervenciones Quirúrgicas - Fecha de Ingreso
  const handleSelectIngresoIntervencion = (day) => {
    setFechaIngresoIntervencion(day.dateString);
    setIngresoIntervencionPickerVisible(false);
    showMessageModal("success", "Fecha de Ingreso seleccionada correctamente.");
  };

  // Intervenciones Quirúrgicas - Fecha de Alta
  const handleSelectAltaIntervencion = (day) => {
    setFechaAltaIntervencion(day.dateString);
    setAltaIntervencionPickerVisible(false);
    showMessageModal("success", "Fecha de Alta seleccionada correctamente.");
  };

  // Hospitalizaciones Previas - Fecha de Ingreso
  const handleSelectIngresoHospitalizacion = (day) => {
    setFechaIngresoHospitalizacion(day.dateString);
    setIngresoHospitalizacionPickerVisible(false);
    showMessageModal("success", "Fecha de Ingreso seleccionada correctamente.");
  };

  // Hospitalizaciones Previas - Fecha de Alta
  const handleSelectAltaHospitalizacion = (day) => {
    setFechaAltaHospitalizacion(day.dateString);
    setAltaHospitalizacionPickerVisible(false);
    showMessageModal("success", "Fecha de Alta seleccionada correctamente.");
  };

  // -------------------------
  // Funciones de Manejo de Listas (Alergias, Medicamentos, Antecedentes)
  // -------------------------

  // Función genérica para agregar un ítem a una lista específica
  const addItem = (list, setList, inputValue, setInputValue, itemName) => {
    if (inputValue.trim()) {
      setList([...list, inputValue]);
      setInputValue("");
      showMessageModal("success", `${itemName} agregada correctamente.`);
    } else {
      showMessageModal(
        "error",
        `Por favor, ingresa una ${itemName.toLowerCase()}.`
      );
    }
  };

  // Función genérica para eliminar un ítem de una lista específica
  const removeItem = (list, setList, index, itemName) => {
    const updatedList = list.filter((item, i) => i !== index);
    setList(updatedList);
    showMessageModal("success", `${itemName} eliminada correctamente.`);
  };

  // Funciones específicas para manejar cada lista
  const handleAddAlergia = () => {
    addItem(alergias, setAlergias, alergiasInput, setAlergiasInput, "Alergia");
  };

  const handleAddMedicamento = () => {
    addItem(
      medicamentos,
      setMedicamentos,
      medicamentosInput,
      setMedicamentosInput,
      "Medicamento"
    );
  };

  const handleAddAntecedente = () => {
    addItem(
      antecedentes,
      setAntecedentes,
      antecedentesInput,
      setAntecedentesInput,
      "Antecedente"
    );
  };

  // -------------------------
  // Funciones de Agregar, Editar y Eliminar Enfermedades
  // -------------------------

  const [deleteModalEnfermedadVisible, setDeleteModalEnfermedadVisible] =
    useState(false); // Modal de confirmación
  const [enfermedadToDelete, setEnfermedadToDelete] = useState(null); // Índice de la enfermedad a eliminar

  const handleEliminarEnfermedad = (index) => {
    setEnfermedadToDelete(index);
    setDeleteModalEnfermedadVisible(true);
  };

  const confirmEliminarEnfermedad = () => {
    if (enfermedadToDelete !== null) {
      const updatedEnfermedades = enfermedades.filter(
        (_, i) => i !== enfermedadToDelete
      );
      setEnfermedades(updatedEnfermedades);
      setEnfermedadToDelete(null);
      setDeleteModalEnfermedadVisible(false);
      showMessageModal("success", "Enfermedad eliminada correctamente.");
    }
  };

  const cancelEliminarEnfermedad = () => {
    setEnfermedadToDelete(null);
    setDeleteModalEnfermedadVisible(false);
  };

  const handleEditarEnfermedad = (index) => {
    setEnfermedadInput(enfermedades[index]);
    setEditingIndexEnfermedad(index);
    setOpenModalEnfermedad(true);
  };

  const handleGuardarEnfermedad = () => {
    if (enfermedadInput.trim()) {
      if (editingIndexEnfermedad !== null) {
        // Editar la enfermedad existente
        const updatedEnfermedades = [...enfermedades];
        updatedEnfermedades[editingIndexEnfermedad] = enfermedadInput;
        setEnfermedades(updatedEnfermedades);
        setEditingIndexEnfermedad(null);
        showMessageModal("success", "Enfermedad editada correctamente.");
      } else {
        // Agregar una nueva enfermedad
        setEnfermedades([...enfermedades, enfermedadInput]);
        showMessageModal("success", "Enfermedad agregada correctamente.");
      }
      setEnfermedadInput(""); // Limpiar el campo de texto
      setOpenModalEnfermedad(false); // Cerrar el modal
    } else {
      showMessageModal(
        "error",
        "Por favor, ingresa el nombre de la enfermedad."
      );
    }
  };

  const handleCancelarEnfermedad = () => {
    setEnfermedadInput(""); // Limpiar el campo de texto
    setEditingIndexEnfermedad(null); // Resetear el índice de edición
    setOpenModalEnfermedad(false); // Cerrar el modal
  };

  // -------------------------
  // Funciones de Agregar, Editar y Eliminar Intervenciones Quirúrgicas
  // -------------------------

  const [deleteIntervencionModalVisible, setDeleteIntervencionModalVisible] =
    useState(false);
  const [intervencionToDelete, setIntervencionToDelete] = useState(null);

  const handleEliminarIntervencion = (index) => {
    setIntervencionToDelete(index);
    setDeleteIntervencionModalVisible(true);
  };

  const confirmEliminarIntervencion = () => {
    if (intervencionToDelete !== null) {
      const updatedIntervenciones = intervenciones.filter(
        (_, i) => i !== intervencionToDelete
      );
      setIntervenciones(updatedIntervenciones);
      setIntervencionToDelete(null);
      setDeleteIntervencionModalVisible(false);
      showMessageModal("success", "Intervención eliminada correctamente.");
    }
  };

  const cancelEliminarIntervencion = () => {
    setIntervencionToDelete(null);
    setDeleteIntervencionModalVisible(false);
  };

  const handleEditarIntervencion = (index) => {
    const intervencion = intervenciones[index];
    setIntervencionInput(intervencion.nombre);
    setFechaIngresoIntervencion(intervencion.fechaIngreso);
    setFechaAltaIntervencion(intervencion.fechaAlta);
    setEditingIndexIntervencion(index);
    setIntervencionesModalVisible(true);
  };

  const handleGuardarIntervencion = () => {
    if (
      intervencionInput.trim() &&
      fechaIngresoIntervencion &&
      fechaAltaIntervencion
    ) {
      if (editingIndexIntervencion !== null) {
        // Editar la intervención existente
        const updatedIntervenciones = [...intervenciones];
        updatedIntervenciones[editingIndexIntervencion] = {
          nombre: intervencionInput,
          fechaIngreso: fechaIngresoIntervencion,
          fechaAlta: fechaAltaIntervencion,
        };
        setIntervenciones(updatedIntervenciones);
        setEditingIndexIntervencion(null);
        showMessageModal("success", "Intervención editada correctamente.");
      } else {
        // Agregar una nueva intervención
        setIntervenciones([
          ...intervenciones,
          {
            nombre: intervencionInput,
            fechaIngreso: fechaIngresoIntervencion,
            fechaAlta: fechaAltaIntervencion,
          },
        ]);
        showMessageModal("success", "Intervención agregada correctamente.");
      }
      // Limpiar campos
      setIntervencionInput("");
      setFechaIngresoIntervencion("");
      setFechaAltaIntervencion("");
      setIntervencionesModalVisible(false);
    } else {
      showMessageModal("error", "Por favor, completa todos los campos.");
    }
  };

  const handleCancelarIntervencion = () => {
    setIntervencionInput("");
    setFechaIngresoIntervencion("");
    setFechaAltaIntervencion("");
    setEditingIndexIntervencion(null);
    setIntervencionesModalVisible(false);
  };

  // -------------------------
  // Funciones de Agregar, Editar y Eliminar Hospitalizaciones Previas
  // -------------------------

  const [
    deleteHospitalizacionModalVisible,
    setDeleteHospitalizacionModalVisible,
  ] = useState(false);
  const [hospitalizacionToDelete, setHospitalizacionToDelete] = useState(null);

  const handleEliminarHospitalizacion = (index) => {
    setHospitalizacionToDelete(index);
    setDeleteHospitalizacionModalVisible(true);
  };

  const confirmEliminarHospitalizacion = () => {
    if (hospitalizacionToDelete !== null) {
      const updatedHospitalizaciones = hospitalizaciones.filter(
        (_, i) => i !== hospitalizacionToDelete
      );
      setHospitalizaciones(updatedHospitalizaciones);
      setHospitalizacionToDelete(null);
      setDeleteHospitalizacionModalVisible(false);
      showMessageModal("success", "Hospitalización eliminada correctamente.");
    }
  };

  const cancelEliminarHospitalizacion = () => {
    setHospitalizacionToDelete(null);
    setDeleteHospitalizacionModalVisible(false);
  };

  const handleEditarHospitalizacion = (index) => {
    const hospitalizacion = hospitalizaciones[index];
    setHospitalizacionInput(hospitalizacion.nombre);
    setFechaIngresoHospitalizacion(hospitalizacion.fechaIngreso);
    setFechaAltaHospitalizacion(hospitalizacion.fechaAlta);
    setEditingIndexHospitalizacion(index);
    setHospitalizacionesModalVisible(true);
  };

  const handleGuardarHospitalizacion = () => {
    if (
      hospitalizacionInput.trim() &&
      fechaIngresoHospitalizacion &&
      fechaAltaHospitalizacion
    ) {
      if (editingIndexHospitalizacion !== null) {
        // Editar la hospitalización existente
        const updatedHospitalizaciones = [...hospitalizaciones];
        updatedHospitalizaciones[editingIndexHospitalizacion] = {
          nombre: hospitalizacionInput,
          fechaIngreso: fechaIngresoHospitalizacion,
          fechaAlta: fechaAltaHospitalizacion,
        };
        setHospitalizaciones(updatedHospitalizaciones);
        setEditingIndexHospitalizacion(null);
        showMessageModal("success", "Hospitalización editada correctamente.");
      } else {
        // Agregar una nueva hospitalización
        setHospitalizaciones([
          ...hospitalizaciones,
          {
            nombre: hospitalizacionInput,
            fechaIngreso: fechaIngresoHospitalizacion,
            fechaAlta: fechaAltaHospitalizacion,
          },
        ]);
        showMessageModal("success", "Hospitalización agregada correctamente.");
      }
      // Limpiar campos
      setHospitalizacionInput("");
      setFechaIngresoHospitalizacion("");
      setFechaAltaHospitalizacion("");
      setHospitalizacionesModalVisible(false);
    } else {
      showMessageModal("error", "Por favor, completa todos los campos.");
    }
  };

  const handleCancelarHospitalizacion = () => {
    setHospitalizacionInput("");
    setFechaIngresoHospitalizacion("");
    setFechaAltaHospitalizacion("");
    setEditingIndexHospitalizacion(null);
    setHospitalizacionesModalVisible(false);
  };

  // -------------------------
  // Renderizado del Componente
  // -------------------------

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Menú de navegación a la izquierda */}
        {/* Si tienes un componente Menu, descomenta la línea siguiente */}
        <Menu />

        {/* Contenido Principal */}
        <View style={styles.mainContent}>
          {/* Datos Personales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DATOS PERSONALES</Text>

            {/* Fila 1 */}
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Dirección"
                  value={direccion}
                  onChangeText={setDireccion}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Teléfono"
                  keyboardType="phone-pad"
                  value={telefono}
                  onChangeText={setTelefono}
                />
              </View>
            </View>

            {/* Fila 2 */}
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Expediente</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Expediente"
                  value={expediente}
                  onChangeText={setExpediente}
                  editable={false}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Correo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Correo"
                  keyboardType="email-address"
                  value={correo}
                  onChangeText={setCorreo}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Nacionalidad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nacionalidad"
                  value={nacionalidad}
                  onChangeText={setNacionalidad}
                />
              </View>
            </View>

            {/* Fila 3 */}
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Sexo</Text>
                <Picker
                  selectedValue={selectedSex}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedSex(itemValue)}
                >
                  <Picker.Item label="Masculino" value="Masculino" />
                  <Picker.Item label="Femenino" value="Femenino" />
                  <Picker.Item label="Otro" value="Otro" />
                </Picker>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Edad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Edad"
                  keyboardType="numeric"
                  value={edad}
                  onChangeText={setEdad}
                  editable={false}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Fecha de Nacimiento</Text>
                <TouchableOpacity
                  onPress={() => setNacimientoModalVisible(true)}
                >
                  <TextInput
                    style={styles.input}
                    value={selectedDateNacimiento ? selectedDateNacimiento : ""}
                    placeholder="Fecha de Nacimiento"
                    editable={false}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Modal para Fecha de Nacimiento */}
          <Modal
            visible={isNacimientoModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setNacimientoModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  Selecciona Fecha de Nacimiento
                </Text>
                <Calendar
                  onDayPress={handleSelectDateNacimiento}
                  markedDates={{
                    [selectedDateNacimiento]: {
                      selected: true,
                      marked: true,
                      selectedColor: "#31877A",
                    },
                  }}
                />
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setNacimientoModalVisible(false)}
                >
                  <Text style={styles.closeModalText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Datos de Salud */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DATOS DE SALUD</Text>

            {/* Fila 1 */}
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Peso (kg)"
                  keyboardType="numeric"
                  value={peso}
                  onChangeText={setPeso}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Altura (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Altura (cm)"
                  keyboardType="numeric"
                  value={altura}
                  onChangeText={setAltura}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Tipo de Sangre</Text>
                <Picker
                  selectedValue={selectedBloodType}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedBloodType(itemValue)}
                >
                  <Picker.Item label="O+" value="O+" />
                  <Picker.Item label="O-" value="O-" />
                  <Picker.Item label="A+" value="A+" />
                  <Picker.Item label="A-" value="A-" />
                  <Picker.Item label="B+" value="B+" />
                  <Picker.Item label="B-" value="B-" />
                  <Picker.Item label="AB+" value="AB+" />
                  <Picker.Item label="AB-" value="AB-" />
                </Picker>
              </View>
            </View>

            {/* Fila 2: Alergias, Medicamentos, Antecedentes */}
            <View style={styles.row}>
              {/* Caja de texto para Alergias */}
              <View style={[styles.column, { flex: 1, marginRight: 5 }]}>
                <Text style={styles.label}>Alergias</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputMedico}
                    placeholder="Alergias"
                    value={alergiasInput}
                    onChangeText={setAlergiasInput}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addButtonPlus,
                      { backgroundColor: "#37817A" },
                    ]}
                    onPress={handleAddAlergia}
                  >
                    <Icon name="plus" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
                {/* Mostrar alergias agregadas */}
                <View style={styles.itemsContainer}>
                  {alergias.map((item, index) => (
                    <View key={index} style={styles.itemContainer}>
                      <Text style={styles.itemText}>{item}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() =>
                          removeItem(alergias, setAlergias, index, "Alergia")
                        }
                      >
                        <Icon name="times" size={20} color="#cccccc" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              {/* Caja de texto para Medicamentos */}
              <View style={[styles.column, { flex: 1, marginHorizontal: 5 }]}>
                <Text style={styles.label}>Medicamentos</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputMedico}
                    placeholder="Medicamentos"
                    value={medicamentosInput}
                    onChangeText={setMedicamentosInput}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addButtonPlus,
                      { backgroundColor: "#37817A" },
                    ]}
                    onPress={handleAddMedicamento}
                  >
                    <Icon name="plus" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
                {/* Mostrar medicamentos agregados */}
                <View style={styles.itemsContainer}>
                  {medicamentos.map((item, index) => (
                    <View key={index} style={styles.itemContainer}>
                      <Text style={styles.itemText}>{item}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() =>
                          removeItem(
                            medicamentos,
                            setMedicamentos,
                            index,
                            "Medicamento"
                          )
                        }
                      >
                        <Icon name="times" size={20} color="#cccccc" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              {/* Caja de texto para Antecedentes */}
              <View style={[styles.column, { flex: 1, marginLeft: 5 }]}>
                <Text style={styles.label}>Antecedentes</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputMedico}
                    placeholder="Antecedentes"
                    value={antecedentesInput}
                    onChangeText={setAntecedentesInput}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addButtonPlus,
                      { backgroundColor: "#37817A" },
                    ]}
                    onPress={handleAddAntecedente}
                  >
                    <Icon name="plus" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
                {/* Mostrar antecedentes agregados */}
                <View style={styles.itemsContainer}>
                  {antecedentes.map((item, index) => (
                    <View key={index} style={styles.itemContainer}>
                      <Text style={styles.itemText}>{item}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() =>
                          removeItem(
                            antecedentes,
                            setAntecedentes,
                            index,
                            "Antecedente"
                          )
                        }
                      >
                        <Icon name="times" size={20} color="#cccccc" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Datos Médicos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DATOS MÉDICOS</Text>

            {/* Enfermedades Crónicas */}
            <View style={styles.addButtonContainer}>
              <Text style={styles.addButtonTitle}>Enfermedades Crónicas</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setOpenModalEnfermedad(true)} // Abre el modal
              >
                <Icon name="plus" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Agregar</Text>
              </TouchableOpacity>

              {/* Modal para Agregar/Editar Enfermedad */}
              <Modal
                visible={openModalEnfermedad}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCancelarEnfermedad}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                      {editingIndexEnfermedad !== null
                        ? "Editar Enfermedad"
                        : "Agregar Enfermedad"}
                    </Text>

                    {/* Entrada de texto para la enfermedad */}
                    <TextInput
                      style={styles.input}
                      placeholder="Escribe la enfermedad"
                      value={enfermedadInput}
                      onChangeText={setEnfermedadInput}
                    />

                    {/* Botones: Cancelar y Guardar */}
                    <View style={styles.modalButtonsContainer}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelarEnfermedad}
                      >
                        <Text style={styles.buttonCancelText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleGuardarEnfermedad}
                      >
                        <Text style={styles.buttonText}>Guardar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Modal de Confirmación para Eliminar Enfermedad */}
              <Modal
                visible={deleteModalEnfermedadVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelEliminarEnfermedad}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.confirmModalContainer}>
                    <Icon
                      name={
                        messageType === "success"
                          ? "check-circle"
                          : "times-circle"
                      }
                      size={50}
                      color={messageType === "success" ? "#4CAF50" : "#F44336"}
                      style={{ marginBottom: 10 }}
                    />
                    <Text style={styles.confirmModalTitle}>
                      Confirmar Eliminación
                    </Text>
                    <Text style={styles.confirmModalMessage}>
                      ¿Desea eliminar esta enfermedad?
                    </Text>

                    <View style={styles.confirmModalButtonsContainer}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelEliminarEnfermedad}
                      >
                        <Text style={styles.buttonCancelText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={confirmEliminarEnfermedad}
                      >
                        <Text style={styles.buttonDeleteText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Lista de Enfermedades Agregadas */}
              <View style={styles.enfermedadesContainer}>
                {enfermedades.map((enfermedadObj, index) => (
                  <View key={index} style={styles.card}>
                    {/* Accede a enfermedadObj.enfermedad */}
                    <Text style={styles.cardText}>
                      {enfermedadObj.enfermedad}
                    </Text>

                    {/* Contenedor de los iconos */}
                    <View style={styles.cardIcons}>
                      {/* Icono de editar */}
                      <TouchableOpacity
                        onPress={() => handleEditarEnfermedad(index)}
                      >
                        <Icon name="pencil" style={styles.icon} />
                      </TouchableOpacity>

                      {/* Icono de eliminar */}
                      <TouchableOpacity
                        onPress={() => handleEliminarEnfermedad(index)}
                      >
                        <Icon name="times" style={styles.icon} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Intervenciones Quirúrgicas */}
            <View style={styles.addButtonContainer}>
              <Text style={styles.addButtonTitle}>
                Intervenciones Quirúrgicas
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIntervencionesModalVisible(true)}
              >
                <Icon name="plus" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Agregar</Text>
              </TouchableOpacity>

              {/* Modal para Agregar/Editar Intervenciones Quirúrgicas */}
              <Modal
                visible={intervencionesModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={handleCancelarIntervencion}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                      {editingIndexIntervencion !== null
                        ? "Editar Intervención"
                        : "Agregar Intervención"}
                    </Text>

                    {/* Entrada de texto para la intervención */}
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre de la Intervención"
                      value={intervencionInput}
                      onChangeText={setIntervencionInput}
                    />

                    {/* Botones para fechas */}
                    <View style={styles.fechaButtonsContainer}>
                      {/* Fecha Ingreso */}
                      <TouchableOpacity
                        style={styles.fechaButton}
                        onPress={() =>
                          setIngresoIntervencionPickerVisible(true)
                        }
                      >
                        <Icon name="calendar" size={20} color="#fff" />
                        <Text style={styles.fechaButtonText}>
                          {fechaIngresoIntervencion
                            ? fechaIngresoIntervencion
                            : "Fecha Ingreso"}
                        </Text>
                      </TouchableOpacity>

                      {/* Fecha Alta */}
                      <TouchableOpacity
                        style={styles.fechaButton}
                        onPress={() => setAltaIntervencionPickerVisible(true)}
                      >
                        <Icon name="calendar" size={20} color="#fff" />
                        <Text style={styles.fechaButtonText}>
                          {fechaAltaIntervencion
                            ? fechaAltaIntervencion
                            : "Fecha Alta"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Date Picker para Fecha Ingreso */}
                    {isIngresoIntervencionModalVisible && (
                      <Calendar
                        onDayPress={handleSelectIngresoIntervencion}
                        markedDates={{
                          [fechaIngresoIntervencion]: {
                            selected: true,
                            marked: true,
                            selectedColor: "#31877A",
                          },
                        }}
                        style={{ height: 300 }}
                      />
                    )}

                    {/* Date Picker para Fecha Alta */}
                    {isAltaIntervencionModalVisible && (
                      <Calendar
                        onDayPress={handleSelectAltaIntervencion}
                        markedDates={{
                          [fechaAltaIntervencion]: {
                            selected: true,
                            marked: true,
                            selectedColor: "#31877A",
                          },
                        }}
                        style={{ height: 300 }}
                      />
                    )}

                    {/* Botones: Cancelar y Guardar */}
                    <View style={styles.modalButtonsContainer}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelarIntervencion}
                      >
                        <Text style={styles.buttonCancelText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleGuardarIntervencion}
                      >
                        <Text style={styles.buttonText}>Guardar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Modal de Confirmación para Eliminar Intervención */}
              <Modal
                visible={deleteIntervencionModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelEliminarIntervencion}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.confirmModalContainer}>
                    <Icon
                      name={
                        messageType === "success"
                          ? "check-circle"
                          : "times-circle"
                      }
                      size={50}
                      color={messageType === "success" ? "#4CAF50" : "#F44336"}
                      style={{ marginBottom: 10 }}
                    />
                    <Text style={styles.confirmModalTitle}>
                      Confirmar Eliminación
                    </Text>
                    <Text style={styles.confirmModalMessage}>
                      ¿Desea eliminar esta intervención?
                    </Text>

                    <View style={styles.confirmModalButtonsContainer}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelEliminarIntervencion}
                      >
                        <Text style={styles.buttonCancelText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={confirmEliminarIntervencion}
                      >
                        <Text style={styles.buttonDeleteText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Lista de Intervenciones Agregadas */}
              <View style={styles.enfermedadesContainer}>
                {intervenciones.map((intervencion, index) => (
                  <View key={index} style={styles.card}>
                    <Text style={styles.cardText}>{intervencion.razon}</Text>
                    <Text style={styles.cardSubText}>
                      Ingreso: {intervencion.fecha_ingreso}
                    </Text>
                    <Text style={styles.cardSubText}>
                      Alta: {intervencion.fecha_alta}
                    </Text>

                    {/* Contenedor de los iconos */}
                    <View style={styles.cardIcons}>
                      {/* Icono de editar */}
                      <TouchableOpacity
                        onPress={() => handleEditarIntervencion(index)}
                      >
                        <Icon name="pencil" style={styles.icon} />
                      </TouchableOpacity>

                      {/* Icono de eliminar */}
                      <TouchableOpacity
                        onPress={() => handleEliminarIntervencion(index)}
                      >
                        <Icon name="times" style={styles.icon} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Hospitalizaciones Previas */}
            <View style={styles.addButtonContainer}>
              <Text style={styles.addButtonTitle}>
                Hospitalizaciones Previas
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setHospitalizacionesModalVisible(true)}
              >
                <Icon name="plus" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Agregar</Text>
              </TouchableOpacity>

              {/* Modal para Agregar/Editar Hospitalizaciones Previas */}
              <Modal
                visible={hospitalizacionesModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={handleCancelarHospitalizacion}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                      {editingIndexHospitalizacion !== null
                        ? "Editar Hospitalización"
                        : "Agregar Hospitalización"}
                    </Text>

                    {/* Entrada de texto para la hospitalización */}
                    <TextInput
                      style={styles.input}
                      placeholder="Razón de la Hospitalización"
                      value={hospitalizacionInput}
                      onChangeText={setHospitalizacionInput}
                    />

                    {/* Botones para fechas */}
                    <View style={styles.fechaButtonsContainer}>
                      {/* Fecha Ingreso */}
                      <TouchableOpacity
                        style={styles.fechaButton}
                        onPress={() =>
                          setIngresoHospitalizacionPickerVisible(true)
                        }
                      >
                        <Icon name="calendar" size={20} color="#fff" />
                        <Text style={styles.fechaButtonText}>
                          {fechaIngresoHospitalizacion
                            ? fechaIngresoHospitalizacion
                            : "Fecha Ingreso"}
                        </Text>
                      </TouchableOpacity>

                      {/* Fecha Alta */}
                      <TouchableOpacity
                        style={styles.fechaButton}
                        onPress={() =>
                          setAltaHospitalizacionPickerVisible(true)
                        }
                      >
                        <Icon name="calendar" size={20} color="#fff" />
                        <Text style={styles.fechaButtonText}>
                          {fechaAltaHospitalizacion
                            ? fechaAltaHospitalizacion
                            : "Fecha Alta"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Date Picker para Fecha Ingreso */}
                    {isIngresoHospitalizacionPickerVisible && (
                      <Calendar
                        onDayPress={handleSelectIngresoHospitalizacion}
                        markedDates={{
                          [fechaIngresoHospitalizacion]: {
                            selected: true,
                            marked: true,
                            selectedColor: "#31877A",
                          },
                        }}
                        style={{ height: 300 }}
                      />
                    )}

                    {/* Date Picker para Fecha Alta */}
                    {isAltaHospitalizacionPickerVisible && (
                      <Calendar
                        onDayPress={handleSelectAltaHospitalizacion}
                        markedDates={{
                          [fechaAltaHospitalizacion]: {
                            selected: true,
                            marked: true,
                            selectedColor: "#31877A",
                          },
                        }}
                        style={{ height: 300 }}
                      />
                    )}

                    {/* Botones: Cancelar y Guardar */}
                    <View style={styles.modalButtonsContainer}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelarHospitalizacion}
                      >
                        <Text style={styles.buttonCancelText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleGuardarHospitalizacion}
                      >
                        <Text style={styles.buttonText}>Guardar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Modal de Confirmación para Eliminar Hospitalización */}
              <Modal
                visible={deleteHospitalizacionModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelEliminarHospitalizacion}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.confirmModalContainer}>
                    <Icon
                      name={
                        messageType === "success"
                          ? "check-circle"
                          : "times-circle"
                      }
                      size={50}
                      color={messageType === "success" ? "#4CAF50" : "#F44336"}
                      style={{ marginBottom: 10 }}
                    />
                    <Text style={styles.confirmModalTitle}>
                      Confirmar Eliminación
                    </Text>
                    <Text style={styles.confirmModalMessage}>
                      ¿Desea eliminar esta hospitalización?
                    </Text>

                    <View style={styles.confirmModalButtonsContainer}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelEliminarHospitalizacion}
                      >
                        <Text style={styles.buttonCancelText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={confirmEliminarHospitalizacion}
                      >
                        <Text style={styles.buttonDeleteText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Lista de Hospitalizaciones Agregadas */}
              <View style={styles.enfermedadesContainer}>
                {hospitalizaciones.map((hospitalizacion, index) => (
                  <View key={index} style={styles.card}>
                    {/* Accede a hospitalizacion.razon */}
                    <Text style={styles.cardText}>{hospitalizacion.razon}</Text>
                    <Text style={styles.cardSubText}>
                      Ingreso: {hospitalizacion.fecha_ingreso}
                    </Text>
                    <Text style={styles.cardSubText}>
                      Alta: {hospitalizacion.fecha_alta}
                    </Text>

                    {/* Contenedor de los iconos */}
                    <View style={styles.cardIcons}>
                      {/* Icono de editar */}
                      <TouchableOpacity
                        onPress={() => handleEditarHospitalizacion(index)}
                      >
                        <Icon name="pencil" style={styles.icon} />
                      </TouchableOpacity>

                      {/* Icono de eliminar */}
                      <TouchableOpacity
                        onPress={() => handleEliminarHospitalizacion(index)}
                      >
                        <Icon name="times" style={styles.icon} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Modal de Mensajes (Éxito o Error) */}
        <Modal
          visible={messageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={hideMessageModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.messageModalContainer}>
              <Icon
                name={
                  messageType === "success" ? "check-circle" : "times-circle"
                }
                size={60}
                color={messageType === "success" ? "#4CAF50" : "#F44336"}
                style={{ marginBottom: 15 }}
              />
              <Text style={styles.messageModalText}>{messageText}</Text>
              <TouchableOpacity
                style={styles.closeMessageButton}
                onPress={hideMessageModal}
              >
                <Text style={styles.closeMessageText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Estilos generales
  scrollContainer: {
    backgroundColor: "#f5f5f5",
  },
  container: {
    flexDirection: "row",
  },
  mainContent: {
    flex: 1,
    margin: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#31877A",
    fontFamily: "CeraRoundProMedium",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  column: {
    flex: 1,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    margin: 5,
    fontFamily: "CeraRoundProMedium",
  },
  picker: {
    height: 40,
    width: "100%",
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputMedico: {
    flex: 1,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    fontFamily: "CeraRoundProMedium",
  },
  addButtonPlus: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  itemsContainer: {
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    backgroundColor: "#e0f7fa",
    padding: 8,
    borderRadius: 5,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: "#00796b",
    fontFamily: "CeraRoundProMedium",
  },
  removeButton: {
    marginLeft: 10,
  },

  // Estilos para las cards (Enfermedades, Intervenciones, Hospitalizaciones)
  enfermedadesContainer: {
    marginTop: 20,
    justifyContent: "space-between",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    marginRight: 10,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Para Android
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00796b",
    fontFamily: "CeraRoundProMedium",
  },
  cardSubText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
    fontFamily: "CeraRoundProMedium",
  },
  cardIcons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  icon: {
    marginHorizontal: 5,
    color: "#00796b",
    fontSize: 18,
  },

  // Estilos para los modales
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semi-transparente
  },
  modalContainer: {
    width: "50%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  confirmModalContainer: {
    width: "50%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#00796b",
    fontFamily: "CeraRoundProMedium",
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#00796b",
    fontFamily: "CeraRoundProMedium",
  },
  confirmModalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
    fontFamily: "CeraRoundProMedium",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  fechaButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  fechaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00796b",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center",
  },
  fechaButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  confirmModalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#00796b",
    backgroundColor: "#fff", // Blanco para cancelar
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#00796b", // Verde para guardar
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#d32f2f", // Rojo para eliminar
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  closeModalButton: {
    marginTop: 15,
    alignItems: "center",
  },
  closeModalText: {
    color: "#00796b",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "CeraRoundProMedium",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  buttonCancelText: {
    color: "#00796b",
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  buttonDeleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },

  // Botones de agregar en las listas
  addButtonTitle: {
    color: "#31877A",
    fontFamily: "CeraRoundProMedium",
    fontSize: 20,
  },
  addButton: {
    backgroundColor: "#00796b",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "30%",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontFamily: "CeraRoundProMedium",
  },

  // Estilos para el Modal de Mensajes
  messageModalContainer: {
    width: "50%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  messageModalText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
  },
  closeMessageButton: {
    backgroundColor: "#00796b",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeMessageText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
});

export default ModalesVista;
