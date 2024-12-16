import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  FlatList,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faUser,
  faArrowLeft,
  faEdit,
  faCalendarAlt,
  faPlus,
  faTimes, // Importa faTimes para la equis
} from "@fortawesome/free-solid-svg-icons";
import styles from "../../../../styles/stylesWeb";
import { Grid, Row, Column } from "./Componentes/Grid";
import { useFonts } from "expo-font"; // Importa useFonts de Expo
import * as SplashScreen from "expo-splash-screen";

import searchPatientByCode from "../../../../src/queryfb/paciente/searchPatientByCode";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";

import EnfermedadCronica from "./Componentes/enf_cron";
import IntervencionQuirurgica from "./Componentes/int_quir";
import HospitalizacionPrevia from "./Componentes/hosp_prev";

import Header from "./Componentes/Header";

import ProtectedRoute from "../sesion/ProtectedRoute";

import { DatePickerModal } from "react-native-paper-dates"; // Importar DatePickerModal
import { Provider as PaperProvider } from "react-native-paper";
import managePacientAccount from "../../../../src/queryfb/paciente/updatePacientAccount";

// Componente Reutilizable para Alertas
const AlertModal = ({ visible, title, message, onClose }) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={alertStyles.modalOverlay}>
      <View style={alertStyles.modalContainer}>
        <Text style={alertStyles.modalTitle}>{title}</Text>
        <Text style={alertStyles.modalMessage}>{message}</Text>
        <TouchableOpacity style={alertStyles.okButton} onPress={onClose}>
          <Text style={alertStyles.okButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// Nuevo Componente para Confirmar Eliminación
const ConfirmDeleteModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent={true}
    onRequestClose={onCancel}
  >
    <View style={confirmStyles.modalOverlay}>
      <View style={confirmStyles.modalContainer}>
        <Text style={confirmStyles.modalTitle}>{title}</Text>
        <Text style={confirmStyles.modalMessage}>{message}</Text>
        <View style={confirmStyles.buttonRow}>
          <TouchableOpacity
            style={confirmStyles.cancelButton}
            onPress={onCancel}
          >
            <Text style={confirmStyles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={confirmStyles.confirmButton}
            onPress={onConfirm}
          >
            <Text style={confirmStyles.confirmButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

function ExpedientePacienteWeb() {
  // Identificar id y tipo de id (Dui o expediente)
  const { ID, type } = useLocalSearchParams();
  const [pacienteData, setPacienteData] = useState("");
  const [enfermedadesCronicas, setEnfermedadesCronicas] = useState([]);
  const [hospitalizacionesPrevias, setHospitalizacionesPrevias] = useState([]);
  const [intervencionesQuirurgicas, setIntervencionesQuirurgicas] = useState(
    []
  );

  // Estados para modales de edición
  const [isEditPersonalVisible, setIsEditPersonalVisible] = useState(false);
  const [isEditSaludVisible, setIsEditSaludVisible] = useState(false);

  // Estados para Alertas
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
  });

  // Estados para Confirmar Eliminación
  const [confirmDelete, setConfirmDelete] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Estados para datos personales editables
  const [editablePersonal, setEditablePersonal] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    expediente: "",
    email: "",
    nacionalidad: "",
    sexo: "",
    nacimiento: "",
  });

  // Estados para datos de salud editables
  const [editableSalud, setEditableSalud] = useState({
    peso: "",
    altura: "",
    tipo_sangre: "",
    alergias: [],
    medicamentos_cronicos: [],
    antecedentes_familiares: [],
  });

  // Estados para DatePickerModal
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [parsedBirthDate, setParsedBirthDate] = useState(new Date());

  // Estados para agregar nuevos elementos en Datos de Salud
  const [newAlergia, setNewAlergia] = useState("");
  const [newMedicamento, setNewMedicamento] = useState("");
  const [newAntecedente, setNewAntecedente] = useState("");

  // Estados para agregar Enfermedades Crónicas
  const [newEnfermedad, setNewEnfermedad] = useState("");

  // Estados para agregar Hospitalizaciones Previas
  const [newHospitalizacion, setNewHospitalizacion] = useState({
    razon: "",
    fecha_ingreso: "",
    fecha_alta: "",
  });
  const [isHospitalizacionPickerVisible, setHospitalizacionPickerVisibility] =
    useState(false);
  const [hospitalizacionDateField, setHospitalizacionDateField] =
    useState(null); // 'fecha_ingreso' or 'fecha_alta'

  // Estados para agregar Intervenciones Quirúrgicas
  const [newIntervencion, setNewIntervencion] = useState({
    razon: "",
    fecha_ingreso: "",
    fecha_alta: "",
  });
  const [isIntervencionPickerVisible, setIntervencionPickerVisibility] =
    useState(false);
  const [intervencionDateField, setIntervencionDateField] = useState(null); // 'fecha_ingreso' or 'fecha_alta'

  // Estados para modales de agregar
  const [isAddEnfermedadVisible, setIsAddEnfermedadVisible] = useState(false);
  const [isAddIntervencionVisible, setIsAddIntervencionVisible] =
    useState(false);
  const [isAddHospitalizacionVisible, setIsAddHospitalizacionVisible] =
    useState(false);

  // Estados para editar elementos
  const [enfermedadToEdit, setEnfermedadToEdit] = useState(null);
  const [intervencionToEdit, setIntervencionToEdit] = useState(null);
  const [hospitalizacionToEdit, setHospitalizacionToEdit] = useState(null);
  const [editEnfermedadText, setEditEnfermedadText] = useState("");
  const [editIntervencion, setEditIntervencion] = useState({
    razon: "",
    fecha_ingreso: "",
    fecha_alta: "",
  });
  const [editHospitalizacion, setEditHospitalizacion] = useState({
    razon: "",
    fecha_ingreso: "",
    fecha_alta: "",
  });

  useEffect(() => {
    // Llamar a la función para buscar datos del paciente al cargar el componente
    const fetchData = async () => {
      try {
        const data = await searchPatientByCode(type, ID);
        console.log(data);
        setPacienteData(data);

        if (data && data.historia_clinica) {
          // Procesar las enfermedades crónicas
          if (data.historia_clinica.enf_cron) {
            const enfCronData = data.historia_clinica.enf_cron;
            const enfermedadesArray = Object.keys(enfCronData).map((key) => ({
              id: key,
              enfermedad: enfCronData[key].enfermedad, // Extrae la enfermedad
            }));
            setEnfermedadesCronicas(enfermedadesArray);
          }

          // Procesar las hospitalizaciones previas
          if (data.historia_clinica.hosp_prev) {
            const hospPrevData = data.historia_clinica.hosp_prev;
            const hospitalizacionesArray = Object.keys(hospPrevData).map(
              (key) => ({
                id: key,
                razon: hospPrevData[key].razon, // Extrae la razón de la hospitalización
                fecha_alta: hospPrevData[key].fecha_alta,
                fecha_ingreso: hospPrevData[key].fecha_ingreso,
              })
            );
            setHospitalizacionesPrevias(hospitalizacionesArray);
          }

          // Procesar las intervenciones quirúrgicas
          if (data.historia_clinica.int_quir) {
            const intQuirData = data.historia_clinica.int_quir;
            const intervencionesArray = Object.keys(intQuirData).map((key) => ({
              id: key,
              razon: intQuirData[key].razon, // Extrae la razón de la intervención
              fecha_alta: intQuirData[key].fecha_alta,
              fecha_ingreso: intQuirData[key].fecha_ingreso,
            }));
            setIntervencionesQuirurgicas(intervencionesArray);
          }
        }

        // Inicializar estados editables con datos actuales
        setEditablePersonal({
          nombre: data?.nombre || "",
          direccion: data?.direccion || "",
          telefono: data?.telefono || "",
          identificacion:
            type === "DUI"
              ? data?.identificacion || ""
              : data?.expediente || "",
          email: data?.email || "",
          nacionalidad: data?.nacionalidad || "",
          sexo: data?.sexo || "",
          nacimiento: data?.nacimiento || "",
        });

        const alergiasList = Array.isArray(data?.datos_salud?.alergias)
          ? data.datos_salud.alergias
          : [];

        const medicamentosList = Array.isArray(
          data?.datos_salud?.medicamentos_cronicos
        )
          ? data.datos_salud.medicamentos_cronicos
          : [];

        const antecedentesList = Array.isArray(
          data?.datos_salud?.antecedentes_familiares
        )
          ? data.datos_salud.antecedentes_familiares
          : [];

        setEditableSalud({
          peso: data?.datos_salud?.peso || "",
          altura: data?.datos_salud?.altura || "",
          tipo_sangre: data?.datos_salud?.tipo_sangre || "",
          alergias: alergiasList,
          medicamentos_cronicos: medicamentosList,
          antecedentes_familiares: antecedentesList,
        });

        // Parsear la fecha de nacimiento para el DatePicker
        if (data?.nacimiento) {
          const [day, month, year] = data.nacimiento.split("/");
          setParsedBirthDate(new Date(`${year}-${month}-${day}`));
        }
      } catch (error) {
        console.error(error); // Manejar el error de búsqueda
        setAlert({
          visible: true,
          title: "Error",
          message: "No se pudo cargar la información del paciente.",
        });
      }
    };

    fetchData();
  }, [type, ID]);

  // Botones de navegación
  const handleAgregarReceta = () => {
    router.navigate(`/views/web/doctor/AgregarReceta?ID=${ID}&type=${type}`);
  };

  const hendleDiagnostico = () => {
    router.navigate(
      `/views/web/doctor/HistorialDiagnosticos?ID=${ID}&type=${type}`
    );
  };

  // Carga las fuentes personalizadas
  const [fontsLoaded, fontError] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
  });
  // Oculta la pantalla de carga una vez que las fuentes se hayan cargado o haya un error
  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplashScreen();
  }, [fontsLoaded, fontError]);

  // Si las fuentes no están cargadas o hay un error, retorna null
  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handleCardHosp = (fec_ing, fec_alt) => {
    setAlert({
      visible: true,
      title: "Detalles de hospitalización",
      message: `Fecha de Ingreso: ${fec_ing}\nFecha de Alta: ${fec_alt}`,
    });
  };

  const handleCardInt = (fec_ing, fec_alt) => {
    setAlert({
      visible: true,
      title: "Detalles de intervención",
      message: `Fecha de Ingreso: ${fec_ing}\nFecha de Alta: ${fec_alt}`,
    });
  };

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const [dia, mes, año] = fechaNacimiento.split("/").map(Number);
    const fechaNac = new Date(año, mes - 1, dia);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth() - fechaNac.getMonth();

    if (
      mesActual < 0 ||
      (mesActual === 0 && hoy.getDate() < fechaNac.getDate())
    ) {
      edad--;
    }

    return edad;
  };

  // Manejo de cambios en datos personales
  const handlePersonalChange = (field, value) => {
    setEditablePersonal({ ...editablePersonal, [field]: value });
  };

  // Manejo de cambios en datos de salud
  const handleSaludChange = (field, value) => {
    setEditableSalud({ ...editableSalud, [field]: value });
  };

  // Función para guardar los cambios personales
  const handleSavePersonal = async () => {
    try {
      const pacienteUID = pacienteData?.uid || "";
      // Construir el objeto con los datos actualizados
      const updatedData = {};
      Object.keys(editablePersonal).forEach((key) => {
        if (editablePersonal[key] !== pacienteData[key]) {
          updatedData[key] = editablePersonal[key];
        }
      });

      // Llama a la función para actualizar en Firebase
      await managePacientAccount(pacienteUID, updatedData);

      // Actualiza el estado local solo si Firebase fue exitoso
      setPacienteData({ ...pacienteData, ...editablePersonal });

      // Cierra el modal y muestra la alerta de éxito
      setIsEditPersonalVisible(false);
      setAlert({
        visible: true,
        title: "Éxito",
        message: "Datos personales actualizados correctamente.",
      });
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
      setAlert({
        visible: true,
        title: "Error",
        message: "Hubo un problema al actualizar los datos personales.",
      });
    }
  };

  // Guardar cambios de salud
  const handleSaveSalud = async () => {
    try {
      const pacienteUID = pacienteData?.uid || "";

      // Construir el objeto de datos a actualizar
      const updatedData = {};
      Object.keys(editableSalud).forEach((key) => {
        if (
          JSON.stringify(editableSalud[key]) !==
          JSON.stringify(pacienteData.datos_salud[key])
        ) {
          updatedData[`datos_salud/${key}`] = editableSalud[key];
        }
      });

      console.log("Datos de salud a actualizar:", updatedData);

      // Llama a la función para actualizar en Firebase
      await managePacientAccount(pacienteUID, updatedData);

      // Actualiza el estado local solo si Firebase fue exitoso
      setPacienteData({
        ...pacienteData,
        datos_salud: { ...editableSalud },
      });

      // Cierra el modal y muestra una alerta de éxito
      setIsEditSaludVisible(false);
      setAlert({
        visible: true,
        title: "Éxito",
        message: "Datos de salud actualizados correctamente.",
      });
    } catch (error) {
      console.error("Error al actualizar los datos de salud:", error);
      setAlert({
        visible: true,
        title: "Error",
        message: `Ocurrió un error al actualizar los datos de salud: ${error.message}`,
      });
    }
  };

  // Funciones para DatePickerModal de Nacimiento
  const openDatePicker = () => setDatePickerVisibility(true);
  const closeDatePicker = () => setDatePickerVisibility(false);

  const handleDateConfirm = ({ date }) => {
    if (date) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      handlePersonalChange("nacimiento", formattedDate);
      setParsedBirthDate(date);
    }
    closeDatePicker();
  };

  // Funciones para DatePickerModal de Hospitalizaciones Previas e Intervenciones Quirúrgicas
  const openHospitalizacionDatePicker = (field) => {
    setHospitalizacionDateField(field);
    setHospitalizacionPickerVisibility(true);
  };

  const closeHospitalizacionDatePicker = () => {
    setHospitalizacionPickerVisibility(false);
    setHospitalizacionDateField(null);
  };

  const handleHospitalizacionDateConfirm = ({ date }) => {
    if (date && hospitalizacionDateField) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      setNewHospitalizacion((prev) => ({
        ...prev,
        [hospitalizacionDateField]: formattedDate,
      }));
    }
    closeHospitalizacionDatePicker();
  };

  const openIntervencionDatePicker = (field) => {
    setIntervencionDateField(field);
    setIntervencionPickerVisibility(true);
  };

  const closeIntervencionDatePicker = () => {
    setIntervencionPickerVisibility(false);
    setIntervencionDateField(null);
  };

  const handleIntervencionDateConfirm = ({ date }) => {
    if (date && intervencionDateField) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      setNewIntervencion((prev) => ({
        ...prev,
        [intervencionDateField]: formattedDate,
      }));
    }
    closeIntervencionDatePicker();
  };

  // Funciones para agregar nuevos elementos en Datos de Salud
  const addAlergia = () => {
    if (newAlergia.trim()) {
      setEditableSalud({
        ...editableSalud,
        alergias: [...editableSalud.alergias, newAlergia.trim()],
      });
      setNewAlergia("");
    }
  };

  const removeAlergia = (index) => {
    const updatedAlergias = [...editableSalud.alergias];
    updatedAlergias.splice(index, 1);
    setEditableSalud({ ...editableSalud, alergias: updatedAlergias });
  };

  const addMedicamento = () => {
    if (newMedicamento.trim()) {
      setEditableSalud({
        ...editableSalud,
        medicamentos_cronicos: [
          ...editableSalud.medicamentos_cronicos,
          newMedicamento.trim(),
        ],
      });
      setNewMedicamento("");
    }
  };

  const removeMedicamento = (index) => {
    const updatedMedicamentos = [...editableSalud.medicamentos_cronicos];
    updatedMedicamentos.splice(index, 1);
    setEditableSalud({
      ...editableSalud,
      medicamentos_cronicos: updatedMedicamentos,
    });
  };

  const addAntecedente = () => {
    if (newAntecedente.trim()) {
      setEditableSalud({
        ...editableSalud,
        antecedentes_familiares: [
          ...editableSalud.antecedentes_familiares,
          newAntecedente.trim(),
        ],
      });
      setNewAntecedente("");
    }
  };

  const removeAntecedente = (index) => {
    const updatedAntecedentes = [...editableSalud.antecedentes_familiares];
    updatedAntecedentes.splice(index, 1);
    setEditableSalud({
      ...editableSalud,
      antecedentes_familiares: updatedAntecedentes,
    });
  };

  // Función para agregar una nueva Enfermedad Crónica
  const addEnfermedad = () => {
    if (newEnfermedad.trim()) {
      const newId = `ec_${Date.now()}`;
      setEnfermedadesCronicas([
        ...enfermedadesCronicas,
        { id: newId, enfermedad: newEnfermedad.trim() },
      ]);
      setNewEnfermedad("");
      setIsAddEnfermedadVisible(false);
      setAlert({
        visible: true,
        title: "Éxito",
        message: "Enfermedad crónica agregada correctamente.",
      });
    }
  };

  const removeEnfermedad = (id) => {
    setConfirmDelete({
      visible: true,
      title: "Confirmar Eliminación",
      message: "¿Estás seguro de que deseas eliminar esta enfermedad crónica?",
      onConfirm: () => {
        const updatedEnfermedades = enfermedadesCronicas.filter(
          (enfermedad) => enfermedad.id !== id
        );
        setEnfermedadesCronicas(updatedEnfermedades);
        setConfirmDelete({
          visible: false,
          title: "",
          message: "",
          onConfirm: null,
        });
        setAlert({
          visible: true,
          title: "Eliminado",
          message: "Enfermedad crónica eliminada correctamente.",
        });
      },
    });
  };

  // Función para agregar una nueva Hospitalización Previa
  const addHospitalizacion = () => {
    const { razon, fecha_ingreso, fecha_alta } = newHospitalizacion;
    if (razon.trim() && fecha_ingreso.trim() && fecha_alta.trim()) {
      const newId = `hosp_${Date.now()}`;
      setHospitalizacionesPrevias([
        ...hospitalizacionesPrevias,
        {
          id: newId,
          razon: razon.trim(),
          fecha_ingreso,
          fecha_alta,
        },
      ]);
      setNewHospitalizacion({
        razon: "",
        fecha_ingreso: "",
        fecha_alta: "",
      });
      setIsAddHospitalizacionVisible(false);
      setAlert({
        visible: true,
        title: "Éxito",
        message: "Hospitalización previa agregada correctamente.",
      });
    } else {
      setAlert({
        visible: true,
        title: "Error",
        message: "Por favor, completa todos los campos de hospitalización.",
      });
    }
  };

  const removeHospitalizacion = (id) => {
    setConfirmDelete({
      visible: true,
      title: "Confirmar Eliminación",
      message:
        "¿Estás seguro de que deseas eliminar esta hospitalización previa?",
      onConfirm: () => {
        const updatedHospitalizaciones = hospitalizacionesPrevias.filter(
          (hospitalizacion) => hospitalizacion.id !== id
        );
        setHospitalizacionesPrevias(updatedHospitalizaciones);
        setConfirmDelete({
          visible: false,
          title: "",
          message: "",
          onConfirm: null,
        });
        setAlert({
          visible: true,
          title: "Eliminado",
          message: "Hospitalización previa eliminada correctamente.",
        });
      },
    });
  };

  // Función para agregar una nueva Intervención Quirúrgica
  const addIntervencion = () => {
    const { razon, fecha_ingreso, fecha_alta } = newIntervencion;
    if (razon.trim() && fecha_ingreso.trim() && fecha_alta.trim()) {
      const newId = `int_${Date.now()}`;
      setIntervencionesQuirurgicas([
        ...intervencionesQuirurgicas,
        {
          id: newId,
          razon: razon.trim(),
          fecha_ingreso,
          fecha_alta,
        },
      ]);
      setNewIntervencion({
        razon: "",
        fecha_ingreso: "",
        fecha_alta: "",
      });
      setIsAddIntervencionVisible(false);
      setAlert({
        visible: true,
        title: "Éxito",
        message: "Intervención quirúrgica agregada correctamente.",
      });
    } else {
      setAlert({
        visible: true,
        title: "Error",
        message: "Por favor, completa todos los campos de intervención.",
      });
    }
  };

  const removeIntervencion = (id) => {
    setConfirmDelete({
      visible: true,
      title: "Confirmar Eliminación",
      message:
        "¿Estás seguro de que deseas eliminar esta intervención quirúrgica?",
      onConfirm: () => {
        const updatedIntervenciones = intervencionesQuirurgicas.filter(
          (intervencion) => intervencion.id !== id
        );
        setIntervencionesQuirurgicas(updatedIntervenciones);
        setConfirmDelete({
          visible: false,
          title: "",
          message: "",
          onConfirm: null,
        });
        setAlert({
          visible: true,
          title: "Eliminado",
          message: "Intervención quirúrgica eliminada correctamente.",
        });
      },
    });
  };

  // Funciones para editar Enfermedades Crónicas
  const handleEditEnfermedad = () => {
    if (enfermedadToEdit && editEnfermedadText.trim()) {
      const updatedEnfermedades = enfermedadesCronicas.map((enfermedad) =>
        enfermedad.id === enfermedadToEdit.id
          ? { ...enfermedad, enfermedad: editEnfermedadText.trim() }
          : enfermedad
      );
      setEnfermedadesCronicas(updatedEnfermedades);
      setEnfermedadToEdit(null);
      setEditEnfermedadText("");
      setAlert({
        visible: true,
        title: "Éxito",
        message: "Enfermedad crónica actualizada correctamente.",
      });
    } else {
      setAlert({
        visible: true,
        title: "Error",
        message: "Por favor, ingresa el nombre de la enfermedad.",
      });
    }
  };

  const handleCancelEditEnfermedad = () => {
    setEnfermedadToEdit(null);
    setEditEnfermedadText("");
  };

  // Funciones para editar Intervenciones Quirúrgicas
  const handleEditIntervencion = () => {
    if (
      intervencionToEdit &&
      editIntervencion.razon.trim() &&
      editIntervencion.fecha_ingreso.trim() &&
      editIntervencion.fecha_alta.trim()
    ) {
      const updatedIntervenciones = intervencionesQuirurgicas.map(
        (intervencion) =>
          intervencion.id === intervencionToEdit.id
            ? { ...intervencion, ...editIntervencion }
            : intervencion
      );
      setIntervencionesQuirurgicas(updatedIntervenciones);
      setIntervencionToEdit(null);
      setEditIntervencion({
        razon: "",
        fecha_ingreso: "",
        fecha_alta: "",
      });
      setAlert({
        visible: true,
        title: "Éxito",
        message: "Intervención quirúrgica actualizada correctamente.",
      });
    } else {
      setAlert({
        visible: true,
        title: "Error",
        message: "Por favor, completa todos los campos de intervención.",
      });
    }
  };

  const handleCancelEditIntervencion = () => {
    setIntervencionToEdit(null);
    setEditIntervencion({
      razon: "",
      fecha_ingreso: "",
      fecha_alta: "",
    });
  };

  // Funciones para editar Hospitalizaciones Previas
  const handleEditHospitalizacion = () => {
    if (
      hospitalizacionToEdit &&
      editHospitalizacion.razon.trim() &&
      editHospitalizacion.fecha_ingreso.trim() &&
      editHospitalizacion.fecha_alta.trim()
    ) {
      const updatedHospitalizaciones = hospitalizacionesPrevias.map(
        (hospitalizacion) =>
          hospitalizacion.id === hospitalizacionToEdit.id
            ? { ...hospitalizacion, ...editHospitalizacion }
            : hospitalizacion
      );
      setHospitalizacionesPrevias(updatedHospitalizaciones);
      setHospitalizacionToEdit(null);
      setEditHospitalizacion({
        razon: "",
        fecha_ingreso: "",
        fecha_alta: "",
      });
      setAlert({
        visible: true,
        title: "Éxito",
        message: "Hospitalización previa actualizada correctamente.",
      });
    } else {
      setAlert({
        visible: true,
        title: "Error",
        message: "Por favor, completa todos los campos de hospitalización.",
      });
    }
  };

  const handleCancelEditHospitalizacion = () => {
    setHospitalizacionToEdit(null);
    setEditHospitalizacion({
      razon: "",
      fecha_ingreso: "",
      fecha_alta: "",
    });
  };

  const renderItemsWithCommas = (items) => {
    return items.map((item, index) => (
      <Text key={index}>
        {item}
        {index < items.length - 1 ? ", " : ""}
      </Text>
    ));
  };

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <PaperProvider>
        <ScrollView>
          <Header />

          <View
            style={[
              styles.container,
              { backgroundColor: "white", padding: 40 },
            ]}
          >
            <View
              style={[
                styles.headingContainer,
                {
                  backgroundColor: "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              ]}
            >
              <Text
                style={[
                  styles.heading,
                  {
                    color: "black",
                    fontWeight: "bold",
                    fontFamily: "CeraRoundProRegular",
                    fontSize: 24,
                  },
                ]}
              >
                Expediente
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{
                    width: "50%",
                    backgroundColor: "#37817A",
                    paddingVertical: 10,
                    paddingHorizontal: 25,
                    borderRadius: 25,
                    borderColor: "#37817A", // Color del borde
                    borderWidth: 2, // Ancho del borde
                    marginHorizontal: 10, // Espacio entre botones
                    alignItems: "center",
                  }}
                  onPress={handleAgregarReceta}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Agregar receta
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: "50%",
                    backgroundColor: "white",
                    paddingVertical: 10,
                    paddingHorizontal: 25,
                    borderRadius: 25,
                    borderColor: "#37817A", // Color del borde
                    borderWidth: 2, // Ancho del borde
                    marginHorizontal: 10, // Espacio entre botones
                    alignItems: "center",
                  }}
                  onPress={hendleDiagnostico}
                >
                  <Text
                    style={{
                      color: "#37817A",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Diagnósticos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.mainContainer, { padding: 50 }]}>
              <Grid style={{ width: "100%" }}>
                {/* DATOS PERSONALES */}
                <Row style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={[
                      styles.heading,
                      {
                        color: "black",
                        fontWeight: "bold",
                        fontFamily: "CeraRoundProRegular",
                        fontSize: 18,
                        flex: 1,
                      },
                    ]}
                  >
                    DATOS PERSONALES
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsEditPersonalVisible(true)}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <FontAwesomeIcon icon={faEdit} size={20} color="#37817A" />
                    <Text
                      style={{
                        marginLeft: 5,
                        color: "#37817A",
                        fontFamily: "CeraRoundProRegular",
                        fontSize: 14,
                      }}
                    >
                      Editar datos personales
                    </Text>
                  </TouchableOpacity>
                </Row>

                <Row>
                  <Column size={4}>
                    <Text style={styles.label}>
                      Nombre:{" "}
                      <Text style={styles.pacienteData}>
                        {pacienteData?.nombre}
                      </Text>
                    </Text>
                  </Column>
                  <Column size={4}>
                    <Text style={styles.label}>
                      Dirección:{" "}
                      <Text style={styles.pacienteData}>
                        {pacienteData?.direccion}
                      </Text>
                    </Text>
                  </Column>
                  <Column size={4}>
                    <Text style={styles.label}>
                      Teléfono:{" "}
                      <Text style={styles.pacienteData}>
                        {pacienteData?.telefono}
                      </Text>
                    </Text>
                  </Column>
                </Row>

                <Row>
                  <Column size={4}>
                    <Text style={styles.label}>
                      {type === "DUI" ? "Identificación: " : "Expediente: "}
                      <Text style={styles.pacienteData}>
                        {type === "DUI"
                          ? pacienteData?.identificacion
                          : pacienteData?.expediente}
                      </Text>
                    </Text>
                  </Column>
                  <Column size={4}>
                    <Text style={styles.label}>
                      Correo:{" "}
                      <Text style={styles.pacienteData}>
                        {pacienteData?.email}
                      </Text>
                    </Text>
                  </Column>
                  <Column size={4}>
                    <Text style={styles.label}>
                      Nacionalidad:{" "}
                      <Text style={styles.pacienteData}>
                        {pacienteData?.nacionalidad}
                      </Text>
                    </Text>
                  </Column>
                </Row>

                <Row>
                  <Column size={4}>
                    <Text style={styles.label}>
                      Sexo:{" "}
                      <Text style={styles.pacienteData}>
                        {pacienteData?.sexo}
                      </Text>
                    </Text>
                  </Column>
                  <Column size={4}>
                    <Text style={styles.label}>
                      Edad:{" "}
                      <Text style={styles.pacienteData}>
                        {pacienteData?.nacimiento
                          ? calcularEdad(pacienteData?.nacimiento)
                          : "N/A"}
                      </Text>
                    </Text>
                  </Column>
                  <Column size={4}>
                    <Text style={styles.label}>
                      Fecha de nacimiento:{" "}
                      <Text style={styles.pacienteData}>
                        {pacienteData?.nacimiento}
                      </Text>
                    </Text>
                  </Column>
                </Row>
                <br />
                <Row></Row>
                <Row>
                  <View style={styles.containerTable}>
                    <View style={styles.table}>
                      <View style={styles.row}>
                        <View style={[styles.cell, styles.headerCell]}>
                          <Text style={styles.cellTextColor}>DATOS SALUD</Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.cell}>
                          <Text style={styles.cellText}>Peso</Text>
                        </View>
                        <View style={styles.cell}>
                          <Text style={styles.cellText}>
                            {pacienteData?.datos_salud?.peso} kg
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.cellColor}>
                          <Text style={styles.cellText}>Altura</Text>
                        </View>
                        <View style={styles.cellColor}>
                          <Text style={styles.cellText}>
                            {pacienteData?.datos_salud?.altura} cm
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.cell}>
                          <Text style={styles.cellText}>Tipo de sangre</Text>
                        </View>
                        <View style={styles.cell}>
                          <Text style={styles.cellText}>
                            {pacienteData?.datos_salud?.tipo_sangre}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.cellColor}>
                          <Text style={styles.cellText}>Alergias</Text>
                        </View>
                        <View style={styles.cellColor}>
                          <Text style={styles.cellText}>
                            {pacienteData?.datos_salud?.alergias &&
                              renderItemsWithCommas(
                                pacienteData.datos_salud.alergias
                              )}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.cell}>
                          <Text style={styles.cellText}>
                            Medicamentos crónicos
                          </Text>
                        </View>
                        <View style={styles.cell}>
                          <Text style={styles.cellText}>
                            {pacienteData?.datos_salud?.medicamentos_cronicos &&
                              renderItemsWithCommas(
                                pacienteData.datos_salud.medicamentos_cronicos
                              )}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.cellColor}>
                          <Text style={styles.cellText}>
                            Antecedentes familiares
                          </Text>
                        </View>
                        <View style={styles.cellColor}>
                          <Text style={styles.cellText}>
                            {pacienteData?.datos_salud
                              ?.antecedentes_familiares &&
                              renderItemsWithCommas(
                                pacienteData.datos_salud.antecedentes_familiares
                              )}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Row>
                <br />
                {/* Botón para modificar datos salud */}
                <Row style={{ marginTop: 20 }}>
                  <TouchableOpacity
                    style={modalStyles.modificarSaludButton}
                    onPress={() => setIsEditSaludVisible(true)}
                  >
                    <Text style={modalStyles.modificarSaludButtonText}>
                      Modificar datos salud
                    </Text>
                  </TouchableOpacity>
                </Row>
                <br />
                <br />
                {/* ENFERMEDADES CRÓNICAS */}
                <Row>
                  <Text
                    style={[
                      styles.heading,
                      {
                        color: "black",
                        fontWeight: "bold",
                        fontFamily: "CeraRoundProRegular",
                        textAlign: "center",
                        fontSize: 18,
                      },
                    ]}
                  >
                    ENFERMEDADES CRÓNICAS
                  </Text>
                </Row>

                {/* Botón Agregar Enfermedad Crónica */}
                <Row style={{ justifyContent: "flex-end", marginBottom: 10 }}>
                  <TouchableOpacity
                    style={modalStyles.agregarButton}
                    onPress={() => setIsAddEnfermedadVisible(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} size={16} color="#fff" />
                    <Text style={modalStyles.agregarButtonText}>Agregar</Text>
                  </TouchableOpacity>
                </Row>

                <View style={styles.tarjetas}>
                  {enfermedadesCronicas.map((enfermedad) => (
                    <View key={enfermedad.id} style={styles.box}>
                      <EnfermedadCronica
                        nombreEnfermedad={enfermedad.enfermedad}
                      />
                      <View style={{ flexDirection: "row", marginTop: 5 }}>
                        <TouchableOpacity
                          style={modalStyles.editButtonCustom}
                          onPress={() => {
                            setEnfermedadToEdit(enfermedad);
                            setEditEnfermedadText(enfermedad.enfermedad);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faEdit}
                            size={16}
                            color="#CCCCCC"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={modalStyles.deleteButtonCustom}
                          onPress={() => removeEnfermedad(enfermedad.id)}
                        >
                          <FontAwesomeIcon
                            icon={faTimes}
                            size={16}
                            color="#CCCCCC"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
                <br />

                {/* INTERVENCIONES QUIRÚRGICAS */}
                <Row>
                  <Text
                    style={[
                      styles.heading,
                      {
                        color: "black",
                        fontWeight: "bold",
                        fontFamily: "CeraRoundProRegular",
                        textAlign: "center",
                        fontSize: 18,
                      },
                    ]}
                  >
                    INTERVENCIONES QUIRÚRGICAS
                  </Text>
                </Row>

                {/* Botón Agregar Intervención Quirúrgica */}
                <Row style={{ justifyContent: "flex-end", marginBottom: 10 }}>
                  <TouchableOpacity
                    style={modalStyles.agregarButton}
                    onPress={() => setIsAddIntervencionVisible(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} size={16} color="#fff" />
                    <Text style={modalStyles.agregarButtonText}>Agregar</Text>
                  </TouchableOpacity>
                </Row>

                <View style={styles.tarjetas}>
                  {intervencionesQuirurgicas.map((intervencion) => (
                    <View key={intervencion.id} style={styles.box}>
                      <IntervencionQuirurgica
                        nombreIntervencion={intervencion.razon}
                        fec_alt={intervencion.fecha_alta}
                        fec_ing={intervencion.fecha_ingreso}
                        handleCardInt={handleCardInt}
                      />
                      <View style={{ flexDirection: "row", marginTop: 5 }}>
                        <TouchableOpacity
                          style={modalStyles.editButtonCustom}
                          onPress={() => {
                            setIntervencionToEdit(intervencion);
                            setEditIntervencion({
                              razon: intervencion.razon,
                              fecha_ingreso: intervencion.fecha_ingreso,
                              fecha_alta: intervencion.fecha_alta,
                            });
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faEdit}
                            size={16}
                            color="#CCCCCC"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={modalStyles.deleteButtonCustom}
                          onPress={() => removeIntervencion(intervencion.id)}
                        >
                          <FontAwesomeIcon
                            icon={faTimes}
                            size={16}
                            color="#CCCCCC"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
                <br />

                {/* HOSPITALIZACIONES PREVIAS */}
                <Row>
                  <Text
                    style={[
                      styles.heading,
                      {
                        color: "black",
                        fontWeight: "bold",
                        fontFamily: "CeraRoundProRegular",
                        textAlign: "center",
                        fontSize: 18,
                      },
                    ]}
                  >
                    HOSPITALIZACIONES PREVIAS
                  </Text>
                </Row>

                {/* Botón Agregar Hospitalización Previa */}
                <Row style={{ justifyContent: "flex-end", marginBottom: 10 }}>
                  <TouchableOpacity
                    style={modalStyles.agregarButton}
                    onPress={() => setIsAddHospitalizacionVisible(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} size={16} color="#fff" />
                    <Text style={modalStyles.agregarButtonText}>Agregar</Text>
                  </TouchableOpacity>
                </Row>

                <View style={styles.tarjetas}>
                  {hospitalizacionesPrevias.map((hospitalizacion) => (
                    <View key={hospitalizacion.id} style={styles.box}>
                      <HospitalizacionPrevia
                        nombreHospitalizacion={hospitalizacion.razon}
                        fec_alt={hospitalizacion.fecha_alta}
                        fec_ing={hospitalizacion.fecha_ingreso}
                        handleCardHosp={handleCardHosp}
                      />
                      <View style={{ flexDirection: "row", marginTop: 5 }}>
                        <TouchableOpacity
                          style={modalStyles.editButtonCustom}
                          onPress={() => {
                            setHospitalizacionToEdit(hospitalizacion);
                            setEditHospitalizacion({
                              razon: hospitalizacion.razon,
                              fecha_ingreso: hospitalizacion.fecha_ingreso,
                              fecha_alta: hospitalizacion.fecha_alta,
                            });
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faEdit}
                            size={16}
                            color="#CCCCCC"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={modalStyles.deleteButtonCustom}
                          onPress={() =>
                            removeHospitalizacion(hospitalizacion.id)
                          }
                        >
                          <FontAwesomeIcon
                            icon={faTimes}
                            size={16}
                            color="#CCCCCC"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
                <br />
              </Grid>
            </View>
          </View>

          {/* Modal para editar datos personales */}
          <Modal
            visible={isEditPersonalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsEditPersonalVisible(false)}
          >
            <View style={modalStyles.modalOverlay}>
              <View style={modalStyles.modalContainer}>
                <Text style={modalStyles.modalTitle}>
                  Editar Datos Personales
                </Text>
                <ScrollView>
                  {/* Primera fila */}
                  <View style={modalStyles.inputRow}>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Nombre</Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          modalStyles.inputHighlighted,
                        ]}
                        placeholder="Nombre"
                        value={editablePersonal.nombre}
                        onChangeText={(text) =>
                          handlePersonalChange("nombre", text)
                        }
                      />
                    </View>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Dirección</Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          modalStyles.inputHighlighted,
                        ]}
                        placeholder="Dirección"
                        value={editablePersonal.direccion}
                        onChangeText={(text) =>
                          handlePersonalChange("direccion", text)
                        }
                      />
                    </View>
                  </View>

                  {/* Segunda fila */}
                  <View style={modalStyles.inputRow}>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Teléfono</Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          modalStyles.inputHighlighted,
                        ]}
                        placeholder="Teléfono"
                        value={editablePersonal.telefono}
                        onChangeText={(text) =>
                          handlePersonalChange("telefono", text)
                        }
                        keyboardType="phone-pad"
                      />
                    </View>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>
                        {type === "DUI" ? "Identificación" : "Expediente"}
                      </Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          modalStyles.inputHighlighted,
                        ]}
                        placeholder={
                          type === "DUI" ? "Identificación" : "Expediente"
                        }
                        value={editablePersonal.identificacion}
                        onChangeText={(text) =>
                          handlePersonalChange("identificacion", text)
                        }
                        editable={false}
                      />
                    </View>
                  </View>

                  {/* Tercera fila */}
                  <View style={modalStyles.inputRow}>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Correo</Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          modalStyles.inputHighlighted,
                        ]}
                        placeholder="Correo"
                        value={editablePersonal.email}
                        onChangeText={(text) =>
                          handlePersonalChange("email", text)
                        }
                        keyboardType="email-address"
                      />
                    </View>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Nacionalidad</Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          modalStyles.inputHighlighted,
                        ]}
                        placeholder="Nacionalidad"
                        value={editablePersonal.nacionalidad}
                        onChangeText={(text) =>
                          handlePersonalChange("nacionalidad", text)
                        }
                      />
                    </View>
                  </View>

                  {/* Cuarta fila */}
                  <View style={modalStyles.inputRow}>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Sexo</Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          modalStyles.inputHighlighted,
                        ]}
                        placeholder="Sexo"
                        value={editablePersonal.sexo}
                        onChangeText={(text) =>
                          handlePersonalChange("sexo", text)
                        }
                      />
                    </View>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Edad</Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          modalStyles.inputHighlighted,
                        ]}
                        placeholder="Edad"
                        value={calcularEdad(
                          editablePersonal.nacimiento
                        ).toString()}
                        editable={false}
                      />
                    </View>
                  </View>

                  {/* Quinta fila: Fecha de Nacimiento con DatePickerModal */}
                  <View style={modalStyles.inputRow}>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Fecha de Nacimiento</Text>
                      <TouchableOpacity
                        style={modalStyles.datePickerContainer}
                        onPress={openDatePicker}
                      >
                        <Text style={modalStyles.dateText}>
                          {editablePersonal.nacimiento ||
                            "Selecciona una fecha"}
                        </Text>
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          size={20}
                          color="#37817A"
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={modalStyles.inputColumn}>
                      {/* Espacio vacío o puedes agregar otro campo si lo deseas */}
                    </View>
                  </View>

                  {/* DatePickerModal */}
                  <DatePickerModal
                    locale="es"
                    mode="single"
                    visible={isDatePickerVisible}
                    onDismiss={closeDatePicker}
                    date={parsedBirthDate}
                    onConfirm={handleDateConfirm}
                    label="Selecciona una fecha"
                    animationType="fade"
                  />
                </ScrollView>
                <View style={modalStyles.buttonContainer}>
                  <TouchableOpacity
                    style={modalStyles.cancelButton}
                    onPress={() => setIsEditPersonalVisible(false)}
                  >
                    <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={modalStyles.saveButton}
                    onPress={handleSavePersonal}
                  >
                    <Text style={modalStyles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal para editar datos de salud */}
          <Modal
            visible={isEditSaludVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsEditSaludVisible(false)}
          >
            <View style={modalStyles.modalOverlay}>
              <View style={modalStyles.modalContainer}>
                <Text style={modalStyles.modalTitle}>
                  Editar Datos de Salud
                </Text>
                <ScrollView>
                  {/* Primera fila: Peso, Altura, Tipo de sangre */}
                  <View style={modalStyles.inputRow}>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Peso</Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          modalStyles.inputHighlighted,
                        ]}
                        placeholder="Peso"
                        value={editableSalud.peso}
                        onChangeText={(text) => handleSaludChange("peso", text)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Altura</Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          modalStyles.inputHighlighted,
                        ]}
                        placeholder="Altura"
                        value={editableSalud.altura}
                        onChangeText={(text) =>
                          handleSaludChange("altura", text)
                        }
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Tipo de sangre</Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          modalStyles.inputHighlighted,
                        ]}
                        placeholder="Tipo de sangre"
                        value={editableSalud.tipo_sangre}
                        onChangeText={(text) =>
                          handleSaludChange("tipo_sangre", text)
                        }
                      />
                    </View>
                  </View>

                  {/* Segunda fila: Alergias, Medicamentos crónicos, Antecedentes familiares */}
                  <View style={modalStyles.inputRow}>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Alergias</Text>
                      <FlatList
                        data={editableSalud.alergias}
                        keyExtractor={(item, index) => `alergia_${index}`}
                        renderItem={({ item, index }) => (
                          <View style={styles.listItem}>
                            <Text style={styles.listText}>{item}</Text>
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => removeAlergia(index)}
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                size={16}
                                color="#CCCCCC"
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      />
                      <View style={modalStyles.addItemRow}>
                        <TextInput
                          style={[
                            modalStyles.inputSmall,
                            modalStyles.inputHighlighted,
                          ]}
                          placeholder="Nueva alergia"
                          value={newAlergia}
                          onChangeText={setNewAlergia}
                        />
                        <TouchableOpacity
                          style={modalStyles.addButton}
                          onPress={addAlergia}
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            size={20}
                            color="#fff"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Medicamentos crónicos</Text>
                      <FlatList
                        data={editableSalud.medicamentos_cronicos}
                        keyExtractor={(item, index) => `medicamento_${index}`}
                        renderItem={({ item, index }) => (
                          <View style={styles.listItem}>
                            <Text style={styles.listText}>{item}</Text>
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => removeMedicamento(index)}
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                size={16}
                                color="#CCCCCC"
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      />
                      <View style={modalStyles.addItemRow}>
                        <TextInput
                          style={[
                            modalStyles.inputSmall,
                            modalStyles.inputHighlighted,
                          ]}
                          placeholder="Nuevo medicamento"
                          value={newMedicamento}
                          onChangeText={setNewMedicamento}
                        />
                        <TouchableOpacity
                          style={modalStyles.addButton}
                          onPress={addMedicamento}
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            size={20}
                            color="#fff"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={modalStyles.inputColumn}>
                      <Text style={styles.label}>Antecedentes familiares</Text>
                      <FlatList
                        data={editableSalud.antecedentes_familiares}
                        keyExtractor={(item, index) => `antecedente_${index}`}
                        renderItem={({ item, index }) => (
                          <View style={styles.listItem}>
                            <Text style={styles.listText}>{item}</Text>
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => removeAntecedente(index)}
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                size={16}
                                color="#CCCCCC"
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      />
                      <View style={modalStyles.addItemRow}>
                        <TextInput
                          style={[
                            modalStyles.inputSmall,
                            modalStyles.inputHighlighted,
                          ]}
                          placeholder="Nuevo antecedente"
                          value={newAntecedente}
                          onChangeText={setNewAntecedente}
                        />
                        <TouchableOpacity
                          style={modalStyles.addButton}
                          onPress={addAntecedente}
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            size={20}
                            color="#fff"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </ScrollView>
                <View style={modalStyles.buttonContainer}>
                  <TouchableOpacity
                    style={modalStyles.cancelButton}
                    onPress={() => setIsEditSaludVisible(false)}
                  >
                    <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={modalStyles.saveButton}
                    onPress={handleSaveSalud}
                  >
                    <Text style={modalStyles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal para agregar Enfermedad Crónica */}
          <Modal
            visible={isAddEnfermedadVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsAddEnfermedadVisible(false)}
          >
            <View style={modalStyles.modalOverlay}>
              <View style={modalStyles.modalContainer}>
                <Text style={modalStyles.modalTitle}>
                  Agregar Enfermedad Crónica
                </Text>
                <TextInput
                  style={[modalStyles.input, modalStyles.inputHighlighted]}
                  placeholder="Escribe la enfermedad"
                  value={newEnfermedad}
                  onChangeText={setNewEnfermedad}
                />
                <View style={modalStyles.buttonContainer}>
                  <TouchableOpacity
                    style={modalStyles.cancelButton}
                    onPress={() => setIsAddEnfermedadVisible(false)}
                  >
                    <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={modalStyles.saveButton}
                    onPress={addEnfermedad}
                  >
                    <Text style={modalStyles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal para agregar Intervención Quirúrgica */}
          <Modal
            visible={isAddIntervencionVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsAddIntervencionVisible(false)}
          >
            <View style={modalStyles.modalOverlay}>
              <View style={modalStyles.modalContainer}>
                <Text style={modalStyles.modalTitle}>
                  Agregar Intervención Quirúrgica
                </Text>
                <TextInput
                  style={[modalStyles.input, modalStyles.inputHighlighted]}
                  placeholder="Escribe la intervención"
                  value={newIntervencion.razon}
                  onChangeText={(text) =>
                    setNewIntervencion({ ...newIntervencion, razon: text })
                  }
                />
                <View style={modalStyles.dateButtonsRow}>
                  <TouchableOpacity
                    style={[
                      modalStyles.dateButton,
                      { backgroundColor: "#CCCCCC" }, // Fecha de ingreso color #CCCCCC
                    ]}
                    onPress={() => openIntervencionDatePicker("fecha_ingreso")}
                  >
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      size={16}
                      color="#000"
                    />
                    <Text style={modalStyles.dateButtonText}>
                      {newIntervencion.fecha_ingreso
                        ? `Ingreso: ${newIntervencion.fecha_ingreso}`
                        : "Fecha Ingreso"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      modalStyles.dateButton,
                      { backgroundColor: "#37817A" }, // Fecha alta color #37817A
                    ]}
                    onPress={() => openIntervencionDatePicker("fecha_alta")}
                  >
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      size={16}
                      color="#fff"
                    />
                    <Text style={modalStyles.dateButtonText}>
                      {newIntervencion.fecha_alta
                        ? `Alta: ${newIntervencion.fecha_alta}`
                        : "Fecha Alta"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={modalStyles.buttonContainer}>
                  <TouchableOpacity
                    style={modalStyles.cancelButton}
                    onPress={() => setIsAddIntervencionVisible(false)}
                  >
                    <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={modalStyles.saveButton}
                    onPress={addIntervencion}
                  >
                    <Text style={modalStyles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal para agregar Hospitalización Previa */}
          <Modal
            visible={isAddHospitalizacionVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsAddHospitalizacionVisible(false)}
          >
            <View style={modalStyles.modalOverlay}>
              <View style={modalStyles.modalContainer}>
                <Text style={modalStyles.modalTitle}>
                  Agregar Hospitalización Previa
                </Text>
                <TextInput
                  style={[modalStyles.input, modalStyles.inputHighlighted]}
                  placeholder="Razón de hospitalización"
                  value={newHospitalizacion.razon}
                  onChangeText={(text) =>
                    setNewHospitalizacion({
                      ...newHospitalizacion,
                      razon: text,
                    })
                  }
                />
                <View style={modalStyles.dateButtonsRow}>
                  <TouchableOpacity
                    style={[
                      modalStyles.dateButton,
                      { backgroundColor: "#CCCCCC" }, // Fecha de ingreso color #CCCCCC
                    ]}
                    onPress={() =>
                      openHospitalizacionDatePicker("fecha_ingreso")
                    }
                  >
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      size={16}
                      color="#000"
                    />
                    <Text style={modalStyles.dateButtonText}>
                      {newHospitalizacion.fecha_ingreso
                        ? `Ingreso: ${newHospitalizacion.fecha_ingreso}`
                        : "Fecha Ingreso"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      modalStyles.dateButton,
                      { backgroundColor: "#37817A" }, // Fecha alta color #37817A
                    ]}
                    onPress={() => openHospitalizacionDatePicker("fecha_alta")}
                  >
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      size={16}
                      color="#fff"
                    />
                    <Text style={modalStyles.dateButtonText}>
                      {newHospitalizacion.fecha_alta
                        ? `Alta: ${newHospitalizacion.fecha_alta}`
                        : "Fecha Alta"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={modalStyles.buttonContainer}>
                  <TouchableOpacity
                    style={modalStyles.cancelButton}
                    onPress={() => setIsAddHospitalizacionVisible(false)}
                  >
                    <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={modalStyles.saveButton}
                    onPress={addHospitalizacion}
                  >
                    <Text style={modalStyles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal para editar Enfermedades Crónicas */}
          <Modal
            visible={enfermedadToEdit !== null}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setEnfermedadToEdit(null)}
          >
            <View style={modalStyles.modalOverlay}>
              <View style={modalStyles.modalContainer}>
                <Text style={modalStyles.modalTitle}>
                  Editar Enfermedad Crónica
                </Text>
                <TextInput
                  style={[modalStyles.input, modalStyles.inputHighlighted]}
                  placeholder="Escribe la enfermedad"
                  value={editEnfermedadText}
                  onChangeText={setEditEnfermedadText}
                />
                <View style={modalStyles.buttonContainer}>
                  <TouchableOpacity
                    style={modalStyles.cancelButton}
                    onPress={handleCancelEditEnfermedad}
                  >
                    <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={modalStyles.saveButton}
                    onPress={handleEditEnfermedad}
                  >
                    <Text style={modalStyles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal para editar Intervenciones Quirúrgicas */}
          <Modal
            visible={intervencionToEdit !== null}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIntervencionToEdit(null)}
          >
            <View style={modalStyles.modalOverlay}>
              <View style={modalStyles.modalContainer}>
                <Text style={modalStyles.modalTitle}>
                  Editar Intervención Quirúrgica
                </Text>
                <ScrollView>
                  <Text style={styles.label}>Razón</Text>
                  <TextInput
                    style={[modalStyles.input, modalStyles.inputHighlighted]}
                    placeholder="Razón de la intervención"
                    value={editIntervencion.razon}
                    onChangeText={(text) =>
                      setEditIntervencion({ ...editIntervencion, razon: text })
                    }
                  />
                  <View style={modalStyles.dateButtonsRow}>
                    <TouchableOpacity
                      style={[
                        modalStyles.dateButton,
                        { backgroundColor: "#CCCCCC" }, // Fecha de ingreso color #CCCCCC
                      ]}
                      onPress={() =>
                        openIntervencionDatePicker("fecha_ingreso")
                      }
                    >
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        size={16}
                        color="#000"
                      />
                      <Text style={modalStyles.dateButtonText}>
                        {editIntervencion.fecha_ingreso
                          ? `Ingreso: ${editIntervencion.fecha_ingreso}`
                          : "Fecha Ingreso"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        modalStyles.dateButton,
                        { backgroundColor: "#37817A" }, // Fecha alta color #37817A
                      ]}
                      onPress={() => openIntervencionDatePicker("fecha_alta")}
                    >
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        size={16}
                        color="#fff"
                      />
                      <Text style={modalStyles.dateButtonText}>
                        {editIntervencion.fecha_alta
                          ? `Alta: ${editIntervencion.fecha_alta}`
                          : "Fecha Alta"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
                <View style={modalStyles.buttonContainer}>
                  <TouchableOpacity
                    style={modalStyles.cancelButton}
                    onPress={handleCancelEditIntervencion}
                  >
                    <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={modalStyles.saveButton}
                    onPress={handleEditIntervencion}
                  >
                    <Text style={modalStyles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal para editar Hospitalizaciones Previas */}
          <Modal
            visible={hospitalizacionToEdit !== null}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setHospitalizacionToEdit(null)}
          >
            <View style={modalStyles.modalOverlay}>
              <View style={modalStyles.modalContainer}>
                <Text style={modalStyles.modalTitle}>
                  Editar Hospitalización Previa
                </Text>
                <ScrollView>
                  <Text style={styles.label}>Razón</Text>
                  <TextInput
                    style={[modalStyles.input, modalStyles.inputHighlighted]}
                    placeholder="Razón de hospitalización"
                    value={editHospitalizacion.razon}
                    onChangeText={(text) =>
                      setEditHospitalizacion({
                        ...editHospitalizacion,
                        razon: text,
                      })
                    }
                  />
                  <View style={modalStyles.dateButtonsRow}>
                    <TouchableOpacity
                      style={[
                        modalStyles.dateButton,
                        { backgroundColor: "#CCCCCC" }, // Fecha de ingreso color #CCCCCC
                      ]}
                      onPress={() =>
                        openHospitalizacionDatePicker("fecha_ingreso")
                      }
                    >
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        size={16}
                        color="#000"
                      />
                      <Text style={modalStyles.dateButtonText}>
                        {editHospitalizacion.fecha_ingreso
                          ? `Ingreso: ${editHospitalizacion.fecha_ingreso}`
                          : "Fecha Ingreso"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        modalStyles.dateButton,
                        { backgroundColor: "#37817A" }, // Fecha alta color #37817A
                      ]}
                      onPress={() =>
                        openHospitalizacionDatePicker("fecha_alta")
                      }
                    >
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        size={16}
                        color="#fff"
                      />
                      <Text style={modalStyles.dateButtonText}>
                        {editHospitalizacion.fecha_alta
                          ? `Alta: ${editHospitalizacion.fecha_alta}`
                          : "Fecha Alta"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
                <View style={modalStyles.buttonContainer}>
                  <TouchableOpacity
                    style={modalStyles.cancelButton}
                    onPress={handleCancelEditHospitalizacion}
                  >
                    <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={modalStyles.saveButton}
                    onPress={handleEditHospitalizacion}
                  >
                    <Text style={modalStyles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* ConfirmDeleteModal para confirmar eliminación */}
          <ConfirmDeleteModal
            visible={confirmDelete.visible}
            title={confirmDelete.title}
            message={confirmDelete.message}
            onConfirm={confirmDelete.onConfirm}
            onCancel={() =>
              setConfirmDelete({
                visible: false,
                title: "",
                message: "",
                onConfirm: null,
              })
            }
          />

          {/* AlertModal para mensajes de éxito y error */}
          <AlertModal
            visible={alert.visible}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert({ ...alert, visible: false })}
          />

          {/* DatePickerModal para Hospitalizaciones Previas */}
          <DatePickerModal
            locale="es"
            mode="single"
            visible={isHospitalizacionPickerVisible}
            onDismiss={closeHospitalizacionDatePicker}
            date={
              newHospitalizacion[hospitalizacionDateField]
                ? new Date(
                    newHospitalizacion[hospitalizacionDateField]
                      .split("/")
                      .reverse()
                      .join("-")
                  )
                : new Date()
            }
            onConfirm={handleHospitalizacionDateConfirm}
            label={
              hospitalizacionDateField === "fecha_ingreso"
                ? "Selecciona fecha de ingreso"
                : "Selecciona fecha de alta"
            }
            animationType="fade"
          />

          {/* DatePickerModal para Intervenciones Quirúrgicas */}
          <DatePickerModal
            locale="es"
            mode="single"
            visible={isIntervencionPickerVisible}
            onDismiss={closeIntervencionDatePicker}
            date={
              newIntervencion[intervencionDateField]
                ? new Date(
                    newIntervencion[intervencionDateField]
                      .split("/")
                      .reverse()
                      .join("-")
                  )
                : new Date()
            }
            onConfirm={handleIntervencionDateConfirm}
            label={
              intervencionDateField === "fecha_ingreso"
                ? "Selecciona fecha de ingreso"
                : "Selecciona fecha de alta"
            }
            animationType="fade"
          />
        </ScrollView>
      </PaperProvider>
    </ProtectedRoute>
  );
}

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "60%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "CeraRoundProRegular",
    marginBottom: 20,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  inputColumn: {
    flex: 1,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontFamily: "CeraRoundProRegular",
    flex: 1,
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    fontFamily: "CeraRoundProRegular",
    flex: 1,
    marginRight: 5,
  },
  inputHighlighted: {
    borderColor: "#37817A", // Color destacado
  },
  addItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  addButton: {
    backgroundColor: "#37817A",
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  agregarButton: {
    backgroundColor: "#37817A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  agregarButtonText: {
    color: "#fff",
    fontFamily: "CeraRoundProRegular",
    marginLeft: 5,
    fontSize: 14,
  },
  dateButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  dateButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontFamily: "CeraRoundProRegular",
    fontSize: 14,
    flexShrink: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 5,
  },
  listText: {
    fontFamily: "CeraRoundProRegular",
    fontSize: 16,
    flex: 1,
  },
  removeButton: {
    backgroundColor: "#e74c3c",
    padding: 4,
    borderRadius: 3,
  },
  // Nuevo estilo para el botón de eliminación personalizado
  deleteButtonCustom: {
    padding: 4,
    borderRadius: 3,
    marginTop: 5,
    marginLeft: 10,
  },
  // Nuevo estilo para el botón de edición personalizado
  editButtonCustom: {
    padding: 4,
    borderRadius: 3,
    marginTop: 5,
    marginLeft: 10,
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    justifyContent: "space-between",
  },
  dateText: {
    flex: 1,
    fontFamily: "CeraRoundProRegular",
    color: "#333",
  },
  selectedDate: {
    fontFamily: "CeraRoundProRegular",
    color: "#333",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#37817A",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontFamily: "CeraRoundProRegular",
  },
  cancelButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#37817A",
  },
  cancelButtonText: {
    color: "#37817A",
    fontFamily: "CeraRoundProRegular",
  },
  modificarSaludButton: {
    backgroundColor: "#37817A",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "30%",
    flexDirection: "row",
    justifyContent: "center",
  },
  modificarSaludButtonText: {
    color: "white",
    fontFamily: "CeraRoundProRegular",
    fontSize: 16,
    marginLeft: 5,
  },
});

const confirmStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "50%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "CeraRoundProRegular",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: "CeraRoundProRegular",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#37817A",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
    flex: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#37817A",
    fontFamily: "CeraRoundProRegular",
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#37817A",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontFamily: "CeraRoundProRegular",
    fontSize: 16,
  },
});

const alertStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "30%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "CeraRoundProRegular",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: "CeraRoundProRegular",
    textAlign: "center",
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: "#37817A",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  okButtonText: {
    color: "white",
    fontFamily: "CeraRoundProRegular",
    fontSize: 16,
  },
});

export default ExpedientePacienteWeb;
