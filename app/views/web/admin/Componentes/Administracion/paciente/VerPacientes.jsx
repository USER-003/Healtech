import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { Icon, Button } from "react-native-elements";
import { useRouter } from "expo-router";
import Menu from "../../Menu";
import { fetchPatients } from "../../../../../../../src/queryfb/paciente/fetchPatients"; // Asegúrate de que la función esté correctamente importada
import ProtectedRoute from "../../../../sesion/ProtectedRoute";
import AccessModal from "../../../../verificacion/Acceso";

const App = () => {
  const [patients, setPatients] = useState([]); // Estado para almacenar todos los pacientes
  const [filteredPatients, setFilteredPatients] = useState([]); // Estado para almacenar los pacientes filtrados
  const [searchText, setSearchText] = useState(""); // Estado para el texto de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const patientsPerPage = 5; // Limitar a 5 pacientes por página

  const router = useRouter();

  const [isAccessModalVisible, setIsAccessModalVisible] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  //Recordar que no todos tienen DUI
  const [selectedPatientType, setSelectedPatientType] = useState("");

  useEffect(() => {
    const getPatients = async () => {
      try {
        const data = await fetchPatients();
        if (data) {
          const patientList = Object.keys(data).map((key) => ({
            uid: key,
            ...data[key],
          }));
          setPatients(patientList); // Guardamos todos los pacientes
          setFilteredPatients(patientList); // Inicialmente, mostramos todos los pacientes en la tabla
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    getPatients();
  }, []);

  // Función para manejar la búsqueda en tiempo real
  const handleSearch = (text) => {
    setSearchText(text); // Actualiza el estado con el texto de búsqueda
    const filtered = patients.filter((patient) =>
      Object.values(patient).some((value) =>
        String(value).toLowerCase().includes(text.toLowerCase())
      )
    );
    setFilteredPatients(filtered); // Actualiza el estado con los pacientes filtrados
    setCurrentPage(1); // Reinicia a la primera página cuando se hace una nueva búsqueda
  };

  // Obtener pacientes para la página actual
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );

  // Función para cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Función para agregar un nuevo paciente
  const handleAddPatient = () => {
    router.navigate(
      `/views/web/admin/Componentes/Administracion/paciente/CrearPaciente`
    );

    router.navigate(
      `/views/web/admin/Componentes/Administracion/paciente/CrearPaciente`
    );
  };

  const handleEdit = (dui) => {
    // Configura los datos necesarios para la modal
    setSelectedPatientId(dui);
    setSelectedPatientType("DUI");
    setIsAccessModalVisible(true); // Abre la modal
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["pacientes"]}
    >
      <View style={styles.container}>
        <Menu />
        <View style={styles.mainContent}>
          <Text style={styles.dashboardText}>
            Dashboard Administración de Pacientes
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title="+ Nuevo Paciente"
              buttonStyle={styles.addButton}
              titleStyle={styles.addButtonText}
              onPress={handleAddPatient}
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, DUI, teléfono..."
              value={searchText}
              onChangeText={handleSearch} // Ejecuta la búsqueda en tiempo real
            />
          </View>

          <ScrollView style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Nombre</Text>
              <Text style={styles.tableHeaderText}>Identificacion</Text>
              <Text style={styles.tableHeaderText}>Teléfono</Text>
              <Text style={styles.tableHeaderText}>Dirección</Text>
              <Text style={styles.tableHeaderText}>Género</Text>
              <Text style={styles.tableHeaderText}>Acciones</Text>
            </View>

            {currentPatients.length > 0 ? (
              currentPatients.map((patient, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableRowText}>{patient.nombre}</Text>
                  <Text style={styles.tableRowText}>
                    {patient.identificacion}
                  </Text>
                  <Text style={styles.tableRowText}>{patient.telefono}</Text>
                  <Text style={styles.tableRowText}>{patient.direccion}</Text>
                  <Text style={styles.tableRowText}>{patient.sexo}</Text>
                  <View style={styles.actionIcons}>
                    <Icon
                      name="create"
                      type="ionicon"
                      color="#2E86C1"
                      size={25}
                      onPress={() => handleEdit(patient.identificacion)}
                    />
                    <Icon
                      name="print"
                      type="ionicon"
                      color="#6BB5DE"
                      size={25}
                    />
                    <Icon
                      name="trash"
                      type="ionicon"
                      color="#CCCCCC"
                      size={25}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text>No hay pacientes registrados.</Text>
            )}
          </ScrollView>

          {/* Sección de paginación */}
          <View style={styles.pagination}>
            {Array.from(
              { length: Math.ceil(filteredPatients.length / patientsPerPage) },
              (_, i) => (
                <Button
                  key={i + 1}
                  title={`${i + 1}`}
                  onPress={() => paginate(i + 1)}
                  disabled={currentPage === i + 1} // Deshabilitar el botón si estamos en la página actual
                  buttonStyle={
                    currentPage === i + 1
                      ? styles.activePage
                      : styles.inactivePage
                  }
                />
              )
            )}
          </View>
        </View>
      </View>
      <AccessModal
        visible={isAccessModalVisible}
        onClose={() => setIsAccessModalVisible(false)} // Función para cerrar la modal
        onSuccessRedirect={() => {
          setIsAccessModalVisible(false);
          router.replace(
            `/views/web/admin/Componentes/Administracion/paciente/EditarPaciente?ID=${selectedPatientId}&type=${selectedPatientType}`
          );
        }} // Función de redirección en caso de éxito
        patientId={selectedPatientId}
        patientType={selectedPatientType}
      />
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  dashboardText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#37817A",
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "#37817A",
    paddingHorizontal: 20,
    marginRight: 10,
  },
  addButtonText: {
    color: "#FFF",
    fontFamily: "CeraRoundProMedium",
  },
  exportButton: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "#37817A",
    paddingHorizontal: 20,
    marginRight: 10,
  },
  exportButtonText: {
    color: "#37817A",
    fontFamily: "CeraRoundProMedium",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    fontFamily: "CeraRoundProMedium",
  },
  table: {
    backgroundColor: "#FFF",
    borderRadius: 0,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#D9D9D9",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },
  tableRowText: {
    flex: 1,
    fontFamily: "CeraRoundProMedium",
  },
  actionIcons: {
    flexDirection: "row",
    flex: 1,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  activePage: {
    backgroundColor: "#37817A",
    marginHorizontal: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: "white",
  },
  inactivePage: {
    backgroundColor: "#CCCCCC",
    marginHorizontal: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default App;
