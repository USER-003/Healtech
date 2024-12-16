import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useFonts } from "expo-font";
import Menu from "./Componentes/Menu";
import { Icon } from "react-native-elements";
import { BarChart } from "react-native-chart-kit";
import ProtectedRoute from "../sesion/ProtectedRoute";
import getUserUID from "../../../../src/queryfb/general/getUserUID";
import getClinica from "../../../../src/queryfb/admin/getClinicaAsociada";
import {
  contarMedicos,
  contarPacientes,
  contarRecetas,
} from "../../../../src/queryfb/admin/data/getData";
import { DatePickerModal } from "react-native-paper-dates";
import { FontAwesome5 } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
    CeraRoundProBold: require("../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProMedium: require("../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return children;
};

const App = () => {
  const userUID = getUserUID();
  const [clinica, setClinica] = useState(null);
  const [metrics, setMetrics] = useState({
    recetas: 0,
    pacientes: 0,
    medicos: 0,
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (userUID) {
        try {
          const registroClinica = await getClinica(userUID);
          setClinica(registroClinica);
          await applyFilters();
        } catch (error) {
          console.error("Error al obtener los datos:", error);
        }
      }
    };
    fetchData();
  }, [userUID]);

  // Modifica la función applyFilters para aceptar parámetros opcionales de fecha
  const applyFilters = async (startDate = null, endDate = null) => {
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${year}-${month}-${day}`; // Formato yyyy-mm-dd
    };

    let fechaInicio = null;
    let fechaFin = null;

    if (startDate) {
      if (typeof startDate === "string") {
        fechaInicio = formatDate(
          new Date(startDate.split("/").reverse().join("-"))
        );
      }
    }

    if (endDate) {
      if (typeof endDate === "string") {
        fechaFin = formatDate(new Date(endDate.split("/").reverse().join("-")));
      }
    }

    try {
      // Llama a las funciones de datos con fechas opcionales
      const numeroMedicos = await contarMedicos(userUID, fechaInicio, fechaFin);
      const numeroPacientes = await contarPacientes(
        userUID,
        fechaInicio,
        fechaFin
      );
      const numeroRecetas = await contarRecetas(userUID, fechaInicio, fechaFin);

      setMetrics({
        recetas: numeroRecetas,
        pacientes: numeroPacientes,
        medicos: numeroMedicos,
      });
      setFilterModalVisible(false);
    } catch (error) {
      console.error("Error al aplicar filtros:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (userUID) {
        try {
          const registroClinica = await getClinica(userUID);
          setClinica(registroClinica);

          // Llama a applyFilters sin fechas para cargar todos los datos
          await applyFilters(null, null);
        } catch (error) {
          console.error("Error al obtener los datos:", error);
        }
      }
    };
    fetchData();
  }, [userUID]);

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    // Llama a applyFilters sin filtros de fechas para mostrar todos los datos
    applyFilters(null, null);
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "colaborador"]}>
      <LoadFonts>
        <View style={styles.container}>
          <Menu />
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.mainContent}>
              <View style={styles.clinicInfoContainer}>
                <View style={styles.iconContainer}>
                  <Icon
                    name="hospital-building"
                    type="material-community"
                    color="#1E3A8A"
                    size={80}
                  />
                </View>
                <View style={styles.clinicDetails}>
                  <Text style={styles.clinicTitle}>{clinica?.nombre}</Text>
                  <Text style={styles.clinicText}>
                    Dirección: {clinica?.direccion}
                  </Text>
                  <Text style={styles.clinicText}>
                    Teléfono: {clinica?.telefono}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setFilterModalVisible(true)}
              >
                <Text style={styles.filterButtonText}>Filtrar por fecha</Text>
              </TouchableOpacity>

              <View style={styles.metricsContainer}>
                <MetricCard
                  icon="file-document-outline"
                  title="Recetas Emitidas"
                  value={metrics.recetas}
                  color="#4CAF50"
                />
                <MetricCard
                  icon="account-multiple"
                  title="Pacientes Atendidos"
                  value={metrics.pacientes}
                  color="#FF9800"
                />
                <MetricCard
                  icon="doctor"
                  title="Médicos Registrados"
                  value={metrics.medicos}
                  color="#2196F3"
                />
              </View>

              <Text style={styles.chartTitle}>Métricas de la Clínica</Text>
              <BarChart
                data={{
                  labels: ["Recetas", "Pacientes", "Médicos"],
                  datasets: [
                    {
                      data: [
                        metrics.recetas,
                        metrics.pacientes,
                        metrics.medicos,
                      ],
                    },
                  ],
                }}
                width={screenWidth - 60}
                height={300}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
                  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  barPercentage: 0.5,
                }}
                style={styles.chart}
              />

              <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                fromDate={fromDate}
                toDate={toDate}
                setFromDate={setFromDate}
                setToDate={setToDate}
                applyFilters={applyFilters}
                resetFilters={resetFilters}
              />
            </View>
          </ScrollView>
        </View>
      </LoadFonts>
    </ProtectedRoute>
  );
};

const MetricCard = ({ icon, title, value, color }) => (
  <View style={[styles.metricCard, { borderColor: color }]}>
    <Icon name={icon} type="material-community" color={color} size={30} />
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricTitle}>{title}</Text>
  </View>
);

const FilterModal = ({
  visible,
  onClose,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  applyFilters,
  resetFilters,
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [currentDateField, setCurrentDateField] = useState(null);

  const openDatePicker = (field) => {
    setCurrentDateField(field);
    setDatePickerVisibility(true);
  };

  const closeDatePicker = () => setDatePickerVisibility(false);

  const handleDateConfirm = (params) => {
    const selectedDate = params.date;
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString("es-ES");
      if (currentDateField === "from") {
        setFromDate(formattedDate);
      } else if (currentDateField === "to") {
        setToDate(formattedDate);
      }
    }
    closeDatePicker();
  };

  const validateDatesAndApplyFilters = () => {
    if (fromDate && toDate) {
      const from = new Date(fromDate.split("/").reverse().join("-"));
      const to = new Date(toDate.split("/").reverse().join("-"));

      if (from <= to) {
        applyFilters(fromDate, toDate);
      } else {
        alert("La fecha inicial no puede ser mayor que la fecha final.");
      }
    } else {
      alert("Selecciona ambas fechas para aplicar el filtro.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      <View style={styles.filterModalContent}>
        <Text style={styles.filterTitle}>Filtrar por Fecha</Text>
        <View style={styles.dateFilterContainer}>
          <TouchableOpacity
            onPress={() => openDatePicker("from")}
            style={styles.dateInput}
          >
            <Text style={styles.dateText}>{fromDate || "Desde"}</Text>
            <FontAwesome5 name="calendar" size={16} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openDatePicker("to")}
            style={styles.dateInput}
          >
            <Text style={styles.dateText}>{toDate || "Hasta"}</Text>
            <FontAwesome5 name="calendar" size={16} color="#000" />
          </TouchableOpacity>
        </View>

        <DatePickerModal
          locale="es"
          mode="single"
          visible={isDatePickerVisible}
          onDismiss={closeDatePicker}
          onConfirm={handleDateConfirm}
          label="Selecciona una fecha"
        />

        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>Limpiar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyFilterButton}
            onPress={validateDatesAndApplyFilters}
          >
            <Text style={styles.applyFilterText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#FFFFFF" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  mainContent: { flex: 1, padding: 20 },
  clinicInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  iconContainer: { marginRight: 15 },
  clinicDetails: { flex: 1 },
  clinicTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
    fontFamily: "CeraRoundProBold",
  },
  clinicText: {
    fontSize: 14,
    color: "#333333",
    fontFamily: "CeraRoundProMedium",
  },
  filterButton: {
    backgroundColor: "#37817A",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "CeraRoundProMedium",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: "#FFFFFF",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 5,
    fontFamily: "CeraRoundProBold",
  },
  metricTitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "CeraRoundProMedium",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    fontFamily: "CeraRoundProMedium",
  },
  chart: { borderRadius: 16 },
  filterModalContent: {
    position: "absolute",
    top: "20%",
    left: "10%",
    right: "10%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  dateFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "48%",
  },
  dateText: { fontFamily: "CeraRoundProMedium", fontSize: 14 },
  filterButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  resetButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    width: "48%",
  },
  resetButtonText: { color: "#000", fontFamily: "CeraRoundProMedium" },
  applyFilterButton: {
    backgroundColor: "#37817A",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    width: "48%",
  },
  applyFilterText: { color: "#fff", fontFamily: "CeraRoundProMedium" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
});

export default App;
