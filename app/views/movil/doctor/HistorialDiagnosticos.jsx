import React, { useEffect, useState, useContext } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Calendar, LocaleConfig } from "react-native-calendars";
import styles from "../../../../styles/StyleDiagnostico";
import DataContext from "./DataContext";
import searchPatientByCode from "../../../../src/queryfb/paciente/searchPatientByCode";
import { useRouter } from "expo-router";
import HTMLView from "react-native-htmlview";
import ProtectedRoute from "../Componentes/ProtectedRoute";
import {
  parse,
  format,
  isBefore,
  isAfter,
  addDays,
  isEqual,
} from "date-fns";
import { es } from "date-fns/locale";

// Configurar el calendario en español
LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  monthNamesShort: [
    "Ene.",
    "Feb.",
    "Mar.",
    "Abr.",
    "May.",
    "Jun.",
    "Jul.",
    "Ago.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dic.",
  ],
  dayNames: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ],
  dayNamesShort: ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."],
  today: "Hoy",
};
LocaleConfig.defaultLocale = "es";

// Funciones auxiliares para manejar fechas como cadenas de texto
const parseDate = (dateStr) => {
  let parsedDate;
  if (dateStr.includes("/")) {
    parsedDate = parse(dateStr, "dd/MM/yyyy", new Date(), { locale: es });
  } else if (dateStr.includes("-")) {
    parsedDate = parse(dateStr, "yyyy-MM-dd", new Date(), { locale: es });
  }
  return parsedDate;
};

const addOneDayFunction = (dateStr) => {
  const date = parseDate(dateStr);
  const newDate = addDays(date, 1);
  return format(newDate, "yyyy-MM-dd");
};

const getDatesInRangeFunction = (startStr, endStr) => {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  let current = start;
  const dates = [];

  while (isBefore(current, end) || isEqual(current, end)) {
    dates.push(format(current, "yyyy-MM-dd"));
    current = addDays(current, 1);
  }

  return dates;
};

const formatDateToDisplayFunction = (dateStr) => {
  const date = parseDate(dateStr);
  if (!date || isNaN(date)) return "Fecha inválida";
  return format(date, "dd/MM/yyyy");
};

const formatDateToInternalFunction = (dateStr) => {
  const date = parseDate(dateStr);
  if (!date || isNaN(date)) return null;
  return format(date, "yyyy-MM-dd");
};

// Componente para mostrar los medicamentos
const MedicamentoItem = ({
  medicamento,
  index,
  isExpanded,
  toggleExpand,
}) => (
  <View style={styles.card}>
    <TouchableOpacity
      onPress={() => toggleExpand(index)}
      style={styles.medicamentoHeader}
    >
      <Text style={[styles.cardText, { flex: 1 }]}>{medicamento.nombre}</Text>
      <Entypo
        name={isExpanded ? "chevron-small-up" : "chevron-small-down"}
        size={24}
        color="black"
      />
    </TouchableOpacity>
    {isExpanded && (
      <View style={{ marginTop: 10 }}>
        <Text style={styles.cardDetailTitle}>Días de Tratamiento</Text>
        <Text style={styles.cardDetailValue}>
          {medicamento.diasTratamiento}
        </Text>
        <Text style={styles.cardDetailTitle}>Frecuencia</Text>
        <Text style={styles.cardDetailValue}>
          {"Cada " + medicamento.frecuencia}
        </Text>
        <Text style={styles.cardDetailTitle}>Comentarios de Ingesta</Text>
        <HTMLView
          style={styles.cardDetailValue2}
          value={medicamento.comentarios || "Sin comentarios"}
        />
      </View>
    )}
  </View>
);

const DiagnosticoPacienteMovil = () => {
  // Estados para el modal y la selección de fechas
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(""); // Fecha de inicio (YYYY-MM-DD)
  const [endDate, setEndDate] = useState(""); // Fecha de fin (YYYY-MM-DD)

  // Estados para expandir diagnósticos y medicamentos
  const [expandedDiagnosisIndexes, setExpandedDiagnosisIndexes] =
    useState([]);
  const [expandedMedicationIndexes, setExpandedMedicationIndexes] =
    useState([]);

  const { identificacion, modo } = useContext(DataContext);
  const [allRecetas, setAllRecetas] = useState([]); // Todas las recetas
  const [recetas, setRecetas] = useState([]); // Recetas filtradas
  const [pacienteData, setPacienteData] = useState("");
  const [searchText, setSearchText] = useState("");

  const router = useRouter();

  // Carga de fuentes
  const [fontsLoaded, fontError] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
  });

  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplashScreen();
  }, [fontsLoaded, fontError]);

  // Función para obtener los datos del paciente
  const fetchData = async () => {
    try {
      const data = await searchPatientByCode(modo, identificacion);
      setPacienteData(data);
      if (data && data.Recetas) {
        const recetasData = data.Recetas;
        const recetasArray = Object.keys(recetasData).map((key) => {
          const receta = recetasData[key];
          const medicamentosArray = receta.medicamentos
            ? Object.keys(receta.medicamentos).map((medKey) => ({
                nombre:
                  receta.medicamentos[medKey].nombre_medicamento.toLowerCase(),
                diasTratamiento: `${receta.medicamentos[medKey].duracion_tratamiento.numero} ${receta.medicamentos[medKey].duracion_tratamiento.tiempo}`,
                frecuencia: `${receta.medicamentos[medKey].frecuencia_administracion.cada} ${receta.medicamentos[medKey].frecuencia_administracion.tiempo}`,
                comentarios:
                  receta.medicamentos[medKey].informacion_adicional,
              }))
            : [];

          const originalFecha = receta.fecha_emision;
          const formattedFecha = formatDateToInternalFunction(originalFecha);

          return {
            titulo: receta.nombre_doctor || "Sin título",
            fecha: formattedFecha, // 'YYYY-MM-DD' o null
            medico: receta.nombre_doctor,
            diagnostico: receta.diagnostico,
            medicamentos: medicamentosArray,
          };
        });

        setAllRecetas(recetasArray); // Guarda todas las recetas
        setRecetas(recetasArray); // Inicializa las recetas a mostrar
      } else {
        console.log("No hay recetas en los datos obtenidos.");
      }
    } catch (error) {
      console.error(
        "Error al obtener los datos del usuario:",
        error
      ); // Manejar el error de búsqueda
    }
  };

  // Función para filtrar recetas según la fecha, rango o texto
  const handleSearch = (start, end, text) => {
    let filtered = allRecetas;

    if (start && !end) {
      // Filtrado por una sola fecha
      filtered = filtered.filter((receta) => receta.fecha === start);
    } else if (start && end) {
      // Filtrado por rango de fechas
      filtered = filtered.filter((receta) => {
        if (!receta.fecha) return false;
        return receta.fecha >= start && receta.fecha <= end;
      });
    }

    if (text) {
      const lowerText = text.toLowerCase();
      filtered = filtered.filter((receta) => {
        const matchTitulo =
          receta.titulo &&
          receta.titulo.toLowerCase().includes(lowerText);
        const matchMedico =
          receta.medico &&
          receta.medico.toLowerCase().includes(lowerText);
        const matchDiagnostico =
          receta.diagnostico &&
          receta.diagnostico.toLowerCase().includes(lowerText);
        const matchMedicamentos = receta.medicamentos.some((med) =>
          med.nombre.includes(lowerText)
        );

        return (
          matchTitulo || matchMedico || matchDiagnostico || matchMedicamentos
        );
      });
    }

    setRecetas(filtered);
  };

  // Función para borrar la selección de fechas y texto
  const handleErase = () => {
    setStartDate("");
    setEndDate("");
    setSearchText("");
    setRecetas(allRecetas); // Muestra todas las recetas
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Función para expandir o contraer diagnósticos
  const toggleDiagnosisExpand = (index) => {
    if (expandedDiagnosisIndexes.includes(index)) {
      setExpandedDiagnosisIndexes(
        expandedDiagnosisIndexes.filter((item) => item !== index)
      );
    } else {
      setExpandedDiagnosisIndexes([...expandedDiagnosisIndexes, index]);
    }
  };

  // Función para expandir o contraer medicamentos
  const toggleMedicationExpand = (diagnosisIndex, medicationIndex) => {
    const key = `${diagnosisIndex}-${medicationIndex}`;
    if (expandedMedicationIndexes.includes(key)) {
      setExpandedMedicationIndexes(
        expandedMedicationIndexes.filter((item) => item !== key)
      );
    } else {
      setExpandedMedicationIndexes([...expandedMedicationIndexes, key]);
    }
  };

  // Función para generar markedDates según la selección
  const generateMarkedDates = () => {
    if (startDate && endDate) {
      const dates = getDatesInRangeFunction(startDate, endDate);

      const marked = {};

      dates.forEach((date, index) => {
        if (index === 0) {
          // Día de inicio
          marked[date] = {
            startingDay: true,
            color: "#45B5A9",
            textColor: "white",
          };
        } else if (index === dates.length - 1) {
          // Día de fin
          marked[date] = {
            endingDay: true,
            color: "#45B5A9",
            textColor: "white",
          };
        } else {
          // Días intermedios
          marked[date] = {
            color: "#45B5A9",
            textColor: "white",
          };
        }
      });

      return marked;
    } else if (startDate) {
      return {
        [startDate]: {
          selected: true,
          selectedColor: "#45B5A9",
          textColor: "white",
        },
      };
    }

    return {};
  };

  return (
    <ProtectedRoute>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Botón para volver */}
        <View style={styles.rectangulo}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            style={styles.touchable}
          >
            <View style={styles.icono}>
              <Entypo name="chevron-left" size={24} color="white" />
            </View>
            <Text style={styles.textoVolver}>Volver</Text>
          </TouchableOpacity>
        </View>

        {/* Input de búsqueda y botón de calendario */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={
              startDate && endDate
                ? `${formatDateToDisplayFunction(
                    startDate
                  )} - ${formatDateToDisplayFunction(endDate)}`
                : startDate
                ? `${formatDateToDisplayFunction(startDate)}`
                : searchText
            }
            placeholder="Buscar"
            onChangeText={(text) => {
              setSearchText(text);
              handleSearch(startDate, endDate, text);
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setIsModalVisible(true);
            }}
            style={styles.calendarButton}
          >
            <FontAwesome name="calendar" size={24} color="#45B5A9" />
          </TouchableOpacity>
          {(startDate || endDate || searchText) && (
            <TouchableOpacity onPress={handleErase} style={styles.clearIcon}>
              <FontAwesome name="times-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>

        {/* Modal que contiene el calendario */}
        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Calendar
                onDayPress={(day) => {
                  const formattedDate = `${day.year}-${String(day.month).padStart(
                    2,
                    "0"
                  )}-${String(day.day).padStart(2, "0")}`; // 'YYYY-MM-DD'

                  if (!startDate || (startDate && endDate)) {
                    // Si no hay una fecha de inicio o ya hay un rango seleccionado, empezar de nuevo
                    setStartDate(formattedDate);
                    setEndDate("");
                  } else {
                    // Si ya hay una fecha de inicio, establecer la fecha de fin
                    if (formattedDate >= startDate) {
                      setEndDate(formattedDate);
                    } else {
                      // Si la fecha de fin es anterior a la de inicio, reiniciar la selección con la nueva fecha como startDate
                      setStartDate(formattedDate);
                      setEndDate("");
                    }
                  }
                }}
                markedDates={generateMarkedDates()}
                markingType={"period"}
                theme={{
                  selectedDayBackgroundColor: "#45B5A9",
                  selectedDayTextColor: "white",
                  todayTextColor: "#45B5A9",
                  arrowColor: "#45B5A9",
                  monthTextColor: "#45B5A9",
                  textDayFontFamily: "CeraRoundProRegular",
                  textMonthFontFamily: "CeraRoundProBlack",
                  textDayHeaderFontFamily: "CeraRoundProRegular",
                  todayBackgroundColor: "#e6ffe6",
                }}
                style={styles.calendar}
              />
              {/* Contenedor para los botones */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsModalVisible(false);
                    handleSearch(startDate, endDate, searchText);
                  }}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Lista de recetas */}
        <View style={styles.recyclerView}>
          {recetas.length > 0 ? (
            recetas.map((item, index) => (
              <View
                key={index}
                style={[styles.card, { backgroundColor: "white" }]}
              >
                <TouchableOpacity
                  onPress={() => toggleDiagnosisExpand(index)}
                  style={styles.diagnosisHeader}
                >
                  <Text style={[styles.cardText, { flex: 1 }]}>
                    {item.titulo ? item.titulo : "Sin título"}
                  </Text>
                  <Text style={styles.cardText}>
                    {item.fecha
                      ? formatDateToDisplayFunction(item.fecha)
                      : "Sin fecha"}
                  </Text>
                  <Entypo
                    name={
                      expandedDiagnosisIndexes.includes(index)
                        ? "chevron-small-up"
                        : "chevron-small-down"
                    }
                    size={24}
                    color="black"
                  />
                </TouchableOpacity>
                {expandedDiagnosisIndexes.includes(index) && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.cardDetailTitle}>
                      Médico Encargado
                    </Text>
                    <Text style={styles.cardDetailValue}>
                      Dr. {item.medico ? item.medico : "Desconocido"}
                    </Text>
                    <Text style={styles.cardDetailTitle}>Diagnóstico</Text>
                    <HTMLView
                      style={styles.cardBack}
                      value={
                        item.diagnostico || "Sin diagnóstico disponible"
                      }
                    />
                    <Text style={styles.cardDetailTitle}>Medicamentos</Text>

                    {item.medicamentos.map((med, medIndex) => (
                      <MedicamentoItem
                        key={medIndex}
                        medicamento={med}
                        index={medIndex}
                        isExpanded={expandedMedicationIndexes.includes(
                          `${index}-${medIndex}`
                        )}
                        toggleExpand={() =>
                          toggleMedicationExpand(index, medIndex)
                        }
                      />
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text>No se encontraron recetas</Text>
          )}
        </View>
      </ScrollView>
    </ProtectedRoute>
  );
};

export default DiagnosticoPacienteMovil;






