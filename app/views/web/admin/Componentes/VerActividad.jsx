import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Searchbar, DataTable, IconButton } from "react-native-paper";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import Menu from "./Menu";
import ProtectedRoute from "../../sesion/ProtectedRoute";
import fetchLogs from "../../../../../src/queryfb/general/fetchLogs";
import getUserUID from "../../../../../src/queryfb/general/getUserUID";
import { TextInput } from "react-native-gesture-handler";
import { DatePickerModal } from "react-native-paper-dates";

import RNHTMLtoPDF from "react-native-html-to-pdf";
import { Platform, Alert } from "react-native";
import jsPDF from "jspdf";

import * as XLSX from "xlsx";

const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProMedium: require("../../../../../assets/fonts/CeraRoundProMedium.otf"),
  });
  return fontsLoaded ? children : <ActivityIndicator size="large" />;
};

const LogView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const [exportOptionsVisible, setExportOptionsVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortNewest, setSortNewest] = useState(true);

  const userUID = getUserUID();
  const router = useRouter();

  const onChangeSearch = (query) => setSearchQuery(query);

  useEffect(() => {
    const loadLogs = async () => {
      if (userUID) {
        try {
          const fetchedLogs = await fetchLogs(userUID);
          setLogs(fetchedLogs);
        } catch (error) {
          console.error("Error al obtener los logs:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadLogs();
  }, [userUID]);

  const getFilteredField = (log) => {
    return `${log.fecha} ${log.hora} ${Object.keys(log.usuario)[0]} ${
      log.accion
    } ${log.moduloAfectado} ${log.resultado}`;
  };

  const filteredLogs = logs
    .filter((log) => {
      const fieldValue = getFilteredField(log);
      return fieldValue
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    })
    .filter((log) => {
      if (fromDate && toDate) {
        const logDate = new Date(log.fecha.split("/").reverse().join("-"));
        const from = new Date(fromDate.split("/").reverse().join("-"));
        const to = new Date(toDate.split("/").reverse().join("-"));
        return logDate >= from && logDate <= to;
      }
      return true;
    })
    .sort((a, b) =>
      sortNewest
        ? new Date(b.fecha.split("/").reverse().join("-")) -
          new Date(a.fecha.split("/").reverse().join("-"))
        : new Date(a.fecha.split("/").reverse().join("-")) -
          new Date(b.fecha.split("/").reverse().join("-"))
    );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#37817A"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  const handleLogInfo = (id) => {
    router.navigate(`/views/web/admin/Componentes/LogInfo?id=${id}`);
  };

  const goToFirstPage = () => setPage(0);
  const goToLastPage = () =>
    setPage(Math.ceil(filteredLogs.length / itemsPerPage) - 1);

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["actividad"]}
    >
      <LoadFonts>
        <View style={styles.container}>
          <Menu />
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.content}>
              <View style={styles.searchContainer}>
                <Searchbar
                  placeholder="Búsqueda específica de Log"
                  onChangeText={onChangeSearch}
                  value={searchQuery}
                  style={styles.searchbar}
                />
                <TouchableOpacity
                  onPress={() => setFilterModalVisible(true)}
                  style={styles.filterButton}
                >
                  <Text style={styles.filterButtonText}>
                    Filtrar{" "}
                    <FontAwesome5 name="filter" size={10} color="#fff" />
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setExportOptionsVisible(true)}
                  style={styles.export}
                >
                  <Text style={styles.exportText}>
                    Exportar{" "}
                    <FontAwesome5 name="file-export" size={10} color="#fff" />
                  </Text>
                </TouchableOpacity>
              </View>

              <ExportDropdown
                visible={exportOptionsVisible}
                onClose={() => setExportOptionsVisible(false)}
                filteredLogs={filteredLogs}
              />

              <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                fromDate={fromDate}
                toDate={toDate}
                setFromDate={setFromDate}
                setToDate={setToDate}
                sortNewest={sortNewest}
                setSortNewest={setSortNewest}
              />

              {filteredLogs.length > 0 ? (
                <DataTable style={styles.table}>
                  <DataTable.Header style={styles.tableHeader}>
                    <DataTable.Title textStyle={styles.tableHeaderText}>
                      Fecha y hora
                    </DataTable.Title>
                    <DataTable.Title textStyle={styles.tableHeaderText}>
                      Usuario
                    </DataTable.Title>
                    <DataTable.Title textStyle={styles.tableHeaderText}>
                      Descripción
                    </DataTable.Title>
                    <DataTable.Title textStyle={styles.tableHeaderText}>
                      Módulo
                    </DataTable.Title>
                    <DataTable.Title textStyle={styles.tableHeaderText}>
                      Resultado
                    </DataTable.Title>
                    <DataTable.Title textStyle={styles.tableHeaderText}>
                      Ver más
                    </DataTable.Title>
                  </DataTable.Header>
                  {filteredLogs
                    .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
                    .map((log, index) => (
                      <DataTable.Row key={index} style={styles.tableRow}>
                        <DataTable.Cell textStyle={styles.tableCellText}>
                          {log.fecha + " " + log.hora}
                        </DataTable.Cell>
                        <DataTable.Cell textStyle={styles.tableCellText}>
                          {Object.values(log.usuario)[1]}
                        </DataTable.Cell>
                        <DataTable.Cell textStyle={styles.tableCellText}>
                          {log.accion} {console.table(log)}
                        </DataTable.Cell>
                        <DataTable.Cell textStyle={styles.tableCellText}>
                          {log.moduloAfectado}
                        </DataTable.Cell>
                        <DataTable.Cell textStyle={styles.tableCellText}>
                          {log.resultado}
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Text style={styles.viewMoreText}>
                            <IconButton
                              icon="eye"
                              size={20}
                              onPress={() => handleLogInfo(log.id)}
                              color="#2D86C0"
                            />
                          </Text>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                  <DataTable.Pagination
                    page={page}
                    numberOfPages={Math.ceil(
                      filteredLogs.length / itemsPerPage
                    )}
                    onPageChange={(page) => setPage(page)}
                    label={`Página ${page + 1} de ${Math.ceil(
                      filteredLogs.length / itemsPerPage
                    )} | Total registros: ${filteredLogs.length}`}
                    showFastPaginationControls
                    onFirstPagePress={goToFirstPage}
                    onLastPagePress={goToLastPage}
                  />
                </DataTable>
              ) : (
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                  No hay logs disponibles.
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </LoadFonts>
    </ProtectedRoute>
  );
};

const FilterModal = ({
  visible,
  onClose,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  sortNewest,
  setSortNewest,
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
        <Text style={styles.filterTitle}>Filtrar</Text>
        <View style={styles.dateFilterContainer}>
          <Text style={styles.filterLabel}>Seleccionar fecha:</Text>
          <View style={styles.datePickerContainer}>
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
        </View>

        <DatePickerModal
          locale="es"
          mode="single"
          visible={isDatePickerVisible}
          onDismiss={closeDatePicker}
          onConfirm={handleDateConfirm}
          label="Selecciona una fecha"
          animationType="slide"
          contentContainerStyle={styles.datePickerModal}
        />

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setSortNewest(!sortNewest)}
          >
            <View
              style={[
                styles.checkboxCircle,
                sortNewest && styles.checkboxSelected,
              ]}
            />
            <Text style={styles.checkboxLabel}>
              {sortNewest ? "Log más reciente" : "Log más antiguo"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setFromDate("");
              setToDate("");
            }}
          >
            <Text style={styles.resetButtonText}>Limpiar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyFilterButton} onPress={onClose}>
            <Text style={styles.applyFilterText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ExportDropdown = ({ visible, onClose, filteredLogs }) => {
  const [format, setFormat] = useState("CSV");
  const [exportType, setExportType] = useState("Máximo");
  const [customCount, setCustomCount] = useState("");

  const handleExport = () => {
    if (format === "JSON") {
      exportAsJSON();
    } else if (format === "CSV") {
      exportAsCSV();
    } else if (format === "Excel") {
      exportAsExcel();
    } else if (format === "PDF") {
      exportAsPDF();
    }
    onClose();
    console.log(`Exportando en formato ${format} con tipo ${exportType}`);
  };

  const exportAsJSON = () => {
    const logsToExport =
      exportType === "Máximo"
        ? filteredLogs
        : filteredLogs.slice(0, customCount ? parseInt(customCount) : 0);
    const jsonContent = JSON.stringify(logsToExport, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "logs_export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    const logsToExport =
      exportType === "Máximo"
        ? filteredLogs
        : filteredLogs.slice(0, customCount ? parseInt(customCount) : 0);
    const headers = [
      "Fecha",
      "Hora",
      "Usuario",
      "Descripción",
      "Módulo",
      "Resultado",
    ];
    const csvContent = [
      "\uFEFF" + headers.join(","), // Encabezados con BOM
      ...logsToExport.map((log) =>
        [
          log.fecha,
          log.hora,
          Object.values(log.usuario)[1],
          log.accion,
          log.moduloAfectado,
          log.resultado,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "logs_export.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsExcel = () => {
    const logsToExport =
      exportType === "Máximo"
        ? filteredLogs
        : filteredLogs.slice(0, customCount ? parseInt(customCount) : 0);

    // Preparar los datos en formato de hoja de cálculo
    const worksheetData = [
      ["Fecha", "Hora", "Usuario", "Descripción", "Módulo", "Resultado"],
      ...logsToExport.map((log) => [
        log.fecha,
        log.hora,
        Object.values(log.usuario)[1],
        log.accion,
        log.moduloAfectado,
        log.resultado,
      ]),
    ];

    // Crear el libro de trabajo y la hoja de cálculo
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");

    // Convertir a archivo .xlsx y descargarlo
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "logs_export.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = async () => {
    const logsToExport =
      exportType === "Máximo"
        ? filteredLogs
        : filteredLogs.slice(0, customCount ? parseInt(customCount) : 0);

    if (Platform.OS === "web") {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Registro de Logs", 10, 10);
      doc.setFontSize(12);

      let y = 20; // Posición inicial en Y para el primer registro
      const pageHeight = doc.internal.pageSize.height; // Altura de la página
      const lineHeight = 10; // Altura de cada línea de texto

      logsToExport.forEach((log, index) => {
        // Verificar si queda espacio suficiente en la página actual, si no, añadir nueva página
        if (y + lineHeight * 4 > pageHeight - 20) {
          // Ajustado a 4 líneas por registro
          doc.addPage();
          y = 20; // Reiniciar la posición Y para la nueva página
        }

        // Añadir el contenido del log al PDF con ajuste de línea
        doc.text(`Fecha: ${log.fecha}`, 10, y);
        doc.text(`Hora: ${log.hora}`, 50, y);
        doc.text(`Usuario: ${Object.values(log.usuario)[1]}`, 100, y);

        // Ajuste de línea para Descripción, Módulo y Resultado, con ancho máximo
        doc.text(`Descripción: ${log.accion}`, 10, y + lineHeight, {
          maxWidth: 80,
        });
        doc.text(`Módulo: ${log.moduloAfectado}`, 100, y + lineHeight, {
          maxWidth: 50,
        });
        doc.text(`Resultado: ${log.resultado}`, 150, y + lineHeight, {
          maxWidth: 50,
        });

        y += lineHeight * 4; // Mover la posición Y para el siguiente registro, ajustado a 4 líneas
      });

      doc.save("logs_export.pdf");
    } else {
      const htmlContent = `
        <h1 style="text-align: center;">Registro de Logs</h1>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Usuario</th>
            <th>Descripción</th>
            <th>Módulo</th>
            <th>Resultado</th>
          </tr>
          ${logsToExport
            .map(
              (log) => `
            <tr>
              <td>${log.fecha}</td>
              <td>${log.hora}</td>
              <td>${Object.keys(log.usuario)[0]}</td>
              <td>${log.accion}</td>
              <td>${log.moduloAfectado}</td>
              <td>${log.resultado}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      `;

      const options = {
        html: htmlContent,
        fileName: "logs_export",
        directory: "Documents",
      };

      try {
        const file = await RNHTMLtoPDF.convert(options);
        Alert.alert("PDF guardado en:", file.filePath);
      } catch (error) {
        console.error("Error al generar PDF:", error);
      }
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
      <View style={styles.exportModalContent}>
        <Text style={styles.exportSectionTitle}>FORMATO</Text>
        <View style={styles.radioGroup}>
          {["CSV", "PDF", "Excel", "JSON"].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.radioOption}
              onPress={() => setFormat(item)}
            >
              <View
                style={[
                  styles.radioCircle,
                  format === item && styles.selectedRadio,
                ]}
              />
              <Text style={styles.radioLabel}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.exportSectionTitle}>EXPORTAR</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setExportType("Máximo")}
          >
            <View
              style={[
                styles.radioCircle,
                exportType === "Máximo" && styles.selectedRadio,
              ]}
            />
            <Text style={styles.radioLabel}>Máximo (Todos)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setExportType("Personalizado")}
          >
            <View
              style={[
                styles.radioCircle,
                exportType === "Personalizado" && styles.selectedRadio,
              ]}
            />
            <Text style={styles.radioLabel}>Personalizado</Text>
          </TouchableOpacity>
        </View>
        {exportType === "Personalizado" && (
          <View style={styles.customInputContainer}>
            <Text style={styles.customInputLabel}>Cantidad:</Text>
            <TextInput
              style={styles.customInput}
              keyboardType="numeric"
              value={customCount}
              onChangeText={setCustomCount}
              placeholder="Cantidad"
            />
          </View>
        )}
        <TouchableOpacity style={styles.confirmExport} onPress={handleExport}>
          <Text style={styles.confirmExportText}>Exportar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
    flex: 1,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    margin: 10,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 8,
  },
  checkboxSelected: {
    backgroundColor: "#37817A",
  },
  checkboxLabel: {
    fontFamily: "CeraRoundProMedium",
  },

  container: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 12,
  },
  dropdownButton: {
    backgroundColor: "#fff",
    color: "#000",
    borderWidth: 1,
    borderColor: "#000",
    margin: 10,
    padding: 8,
    borderRadius: 4,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  searchbar: {
    flex: 1,
    minWidth: "40%",
    marginRight: 20,
    fontFamily: "CeraRoundProMedium",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
  },
  placeholderText: {
    fontFamily: "CeraRoundProMedium",
    fontSize: 16,
    color: "#C9C9C9",
  },
  filterButton: {
    backgroundColor: "#000000",
    color: "#fff",
    margin: 10,
    padding: 10,
    borderRadius: 4,
  },
  filterButtonText: {
    color: "#fff",
    fontFamily: "CeraRoundProMedium",
  },
  filterModalContent: {
    position: "absolute",
    top: "15%",
    marginLeft: "45%",
    width: "50%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "CeraRoundProMedium",
  },
  dateFilterContainer: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    fontFamily: "CeraRoundProMedium",
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
    borderRadius: 4,
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontFamily: "CeraRoundProMedium",
    fontSize: 14,
  },
  filterButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    width: "48%",
  },
  resetButtonText: {
    color: "#000",
    fontFamily: "CeraRoundProMedium",
  },
  applyFilterButton: {
    backgroundColor: "#37817A",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    width: "48%",
  },
  applyFilterText: {
    color: "#fff",
    fontFamily: "CeraRoundProMedium",
  },
  table: {
    borderRadius: 10,
    borderColor: "#fff",
    borderWidth: 3,
  },
  tableHeader: {
    backgroundColor: "#2D86C0",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  tableHeaderText: {
    color: "#fff",
    fontFamily: "CeraRoundProMedium",
    fontSize: 16,
  },
  tableCellText: {
    color: "#000",
    fontFamily: "CeraRoundProMedium",
    fontSize: 14,
  },
  tableRow: {
    backgroundColor: "#fff",
  },
  viewMoreText: {
    color: "#2D86C0",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  dropdownContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 1,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 5,
    textAlign: "center",
    fontFamily: "CeraRoundProMedium",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalContent: {
    position: "absolute",
    top: 70,
    right: 125,
    alignSelf: "flex-end",
    width: "6%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    zIndex: 1000,
    fontFamily: "CeraRoundProMedium",
  },
  exportModalContent: {
    position: "absolute",
    top: 80,
    right: 10,
    alignSelf: "flex-end",
    width: "25%",
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    maxHeight: "80%",
    zIndex: 1000,
    fontFamily: "CeraRoundProMedium",
  },
  exportSectionTitle: {
    fontFamily: "CeraRoundProMedium",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  radioGroup: {
    flexDirection: "column",
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  selectedRadio: {
    backgroundColor: "#37817A",
  },
  radioLabel: {
    fontFamily: "CeraRoundProMedium",
    fontSize: 14,
  },
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  customInputLabel: {
    fontFamily: "CeraRoundProMedium",
    fontSize: 14,
    marginRight: 10,
  },
  customInput: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
    borderRadius: 4,
    width: 80,
    fontFamily: "CeraRoundProMedium",
  },
  confirmExport: {
    backgroundColor: "#37817A",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 10,
  },
  confirmExportText: {
    fontFamily: "CeraRoundProMedium",
    color: "#fff",
    fontSize: 16,
  },
  export: {
    backgroundColor: "#37817A",
    padding: 10,
    borderRadius: 4,
    margin: 10,
  },
  exportText: {
    fontFamily: "CeraRoundProMedium",
    color: "#fff",
  },
});

export default LogView;
