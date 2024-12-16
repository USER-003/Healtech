import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faUserDoctor,
  faUser,
  faArrowLeft,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AcordionItem from "./Componentes/Diagnostico";
import searchPatientByCode from "../../../../src/queryfb/paciente/searchPatientByCode";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "./Componentes/Header";
import ProtectedRoute from "../sesion/ProtectedRoute";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { parse, format, isBefore, addDays, isEqual } from "date-fns";
import { es } from "date-fns/locale";

// Configuración del calendario en español
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

const MedicamentoItem = ({ medicamento, index, isExpanded, toggleExpand }) => (
  <View style={styles.card}>
    <TouchableOpacity
      onPress={() => toggleExpand(index)}
      style={styles.medicamentoHeader}
    >
      <Text style={[styles.cardText, { flex: 1 }]}>{medicamento.nombre}</Text>
      <FontAwesomeIcon
        icon={isExpanded ? faArrowLeft : faCalendarAlt}
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
        <Text style={styles.cardDetailValue2}>
          {medicamento.comentarios || "Sin comentarios"}
        </Text>
      </View>
    )}
  </View>
);

function DiagnosticosWeb() {
  const { type, ID } = useLocalSearchParams();
  const [pacienteData, setPacienteData] = useState("");
  const [recetas, setRecetas] = useState([]);
  const [allRecetas, setAllRecetas] = useState([]);
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");
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

  const fetchData = async () => {
    try {
      const data = await searchPatientByCode(type, ID);
      setPacienteData(data);

      if (data && data.Recetas) {
        const recetasData = data.Recetas;
        const recetasArray = Object.keys(recetasData).map((key) => {
          const receta = recetasData[key];
          const medicamentosArray = receta.medicamentos
            ? Object.keys(receta.medicamentos).map((medKey) => ({
                nombre: receta.medicamentos[medKey].nombre_medicamento,
                diasTratamiento: `${receta.medicamentos[medKey].duracion_tratamiento.numero} ${receta.medicamentos[medKey].duracion_tratamiento.tiempo}`,
                frecuencia: `${receta.medicamentos[medKey].frecuencia_administracion.cada} ${receta.medicamentos[medKey].frecuencia_administracion.tiempo}`,
                comentarios: receta.medicamentos[medKey].informacion_adicional,
              }))
            : [];

          const originalFecha = receta.fecha_emision;
          const formattedFecha = formatDateToInternalFunction(originalFecha);

          return {
            titulo: receta.nombre_doctor || "Sin título",
            fecha: formattedFecha,
            medico: receta.nombre_doctor,
            diagnostico: receta.diagnostico,
            medicamentos: medicamentosArray,
          };
        });

        setAllRecetas(recetasArray);
        setRecetas(recetasArray);
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  };

  const handleSearchAndFilter = () => {
    const filtered = allRecetas.filter((receta) => {
      const matchesText = searchText
        ? receta.medico.toLowerCase().includes(searchText.toLowerCase()) ||
          receta.diagnostico
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          receta.medicamentos.some((med) =>
            med.nombre.toLowerCase().includes(searchText.toLowerCase())
          )
        : true;

      const matchesDate =
        startDate && endDate
          ? receta.fecha >= startDate && receta.fecha <= endDate
          : startDate
          ? receta.fecha === startDate
          : true;

      return matchesText && matchesDate;
    });

    setRecetas(filtered);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    handleSearchAndFilter();
  };

  const handleDateSearch = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    handleSearchAndFilter();
  };

  const handleErase = () => {
    setStartDate("");
    setEndDate("");
    setSearchText("");
    setRecetas(allRecetas);
  };

  useEffect(() => {
    fetchData();
  }, [type, ID]);

  const generateMarkedDates = () => {
    if (startDate && endDate) {
      const dates = getDatesInRangeFunction(startDate, endDate);
      const marked = {};
      dates.forEach((date, index) => {
        if (index === 0) {
          marked[date] = {
            startingDay: true,
            color: "#45B5A9",
            textColor: "white",
          };
        } else if (index === dates.length - 1) {
          marked[date] = {
            endingDay: true,
            color: "#45B5A9",
            textColor: "white",
          };
        } else {
          marked[date] = { color: "#45B5A9", textColor: "white" };
        }
      });
      return marked;
    }
    return startDate
      ? {
          [startDate]: {
            selected: true,
            selectedColor: "#45B5A9",
            textColor: "white",
          },
        }
      : {};
  };

  if (!fontsLoaded && !fontError) return null;

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <ScrollView>
        <Header />
        <View style={styles.container}>
          <View style={styles.searchFilterContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              onChangeText={handleSearch}
              value={searchText}
            />
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              style={styles.dateInputContainer}
            >
              <Text style={styles.dateInputText}>
                {startDate && endDate
                  ? `${formatDateToDisplayFunction(
                      startDate
                    )} - ${formatDateToDisplayFunction(endDate)}`
                  : startDate
                  ? `Fecha: ${formatDateToDisplayFunction(startDate)}`
                  : "Seleccionar Fecha"}
              </Text>
              <FontAwesomeIcon icon={faCalendarAlt} size={20} color="white" />
            </TouchableOpacity>
            {(startDate || endDate) && (
              <TouchableOpacity onPress={handleErase} style={styles.clearIcon}>
                <FontAwesomeIcon icon={faArrowLeft} size={20} color="gray" />
              </TouchableOpacity>
            )}
          </View>
          <Modal
            transparent
            visible={isModalVisible}
            animationType="slide"
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Calendar
                  onDayPress={(day) => {
                    const formattedDate = `${day.year}-${String(
                      day.month
                    ).padStart(2, "0")}-${String(day.day).padStart(2, "0")}`;
                    if (!startDate || (startDate && endDate)) {
                      setStartDate(formattedDate);
                      setEndDate("");
                    } else if (formattedDate >= startDate) {
                      setEndDate(formattedDate);
                    } else {
                      setStartDate(formattedDate);
                      setEndDate("");
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
                  }}
                  style={styles.calendar}
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => setIsModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (startDate) {
                        setIsModalVisible(false);
                        handleDateSearch(startDate, endDate || null);
                      }
                    }}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <View style={styles.mainContainer}>
            {recetas.length > 0 ? (
              recetas.map((item, index) => (
                <AcordionItem
                  key={index}
                  nombre_doc={item.medico}
                  fecha={item.fecha}
                  diagnostico={item.diagnostico}
                  medicamentos={item.medicamentos}
                />
              ))
            ) : (
              <Text style={styles.noRecetasText}>
                No se encontraron recetas para los filtros aplicados.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 30,
    flex: 1,
  },
  searchFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchInput: {
    flex: 2,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    fontFamily: "CeraRoundProRegular",
    fontSize: 16,
    color: "#000",
  },
  dateInputContainer: {
    width: "15%",
    backgroundColor: "#37817A",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginLeft: 10,
    justifyContent: "space-between",
  },
  dateInputText: {
    flex: 1,
    color: "white",
    fontFamily: "CeraRoundProRegular",
    fontSize: 16,
  },
  clearIcon: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: 350,
    alignItems: "center",
  },
  calendar: {
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#37817A",
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#37817A",
    fontFamily: "CeraRoundProRegular",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#37817A",
    padding: 5,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontFamily: "CeraRoundProRegular",
    fontSize: 16,
  },
  mainContainer: {
    backgroundColor: "white",
    padding: 50,
  },
  noRecetasText: {
    fontFamily: "CeraRoundProMedium",
    fontSize: 16,
    color: "#555",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  medicamentoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardText: {
    fontSize: 16,
    fontFamily: "CeraRoundProRegular",
  },
  cardDetailTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    fontFamily: "CeraRoundProRegular",
  },
  cardDetailValue: {
    fontSize: 14,
    marginTop: 5,
    fontFamily: "CeraRoundProRegular",
  },
  cardDetailValue2: {
    fontSize: 14,
    marginTop: 5,
    fontFamily: "CeraRoundProRegular",
  },
});

export default DiagnosticosWeb;
