import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { Icon, Button } from "react-native-elements";
import { useRouter } from "expo-router";
import Menu from "../../Menu";
import { fetchDoctors } from "../../../../../../../src/queryfb/doctor/fetchDoctors"; // Asegúrate de que la función esté correctamente importada
import ProtectedRoute from "../../../../sesion/ProtectedRoute";

const App = () => {
  const [doctors, setDoctors] = useState([]); // Estado para almacenar todos los doctores
  const [filteredDoctors, setFilteredDoctors] = useState([]); // Estado para almacenar los doctores filtrados
  const [searchText, setSearchText] = useState(""); // Estado para el texto de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const doctorsPerPage = 5; // Limitar a 5 doctores por página

  const router = useRouter();

  useEffect(() => {
    const getDoctors = async () => {
      try {
        const data = await fetchDoctors();
        if (data) {
          const doctorList = Object.keys(data).map((key) => ({
            uid: key,
            ...data[key],
          }));
          setDoctors(doctorList); // Guardamos todos los doctores
          setFilteredDoctors(doctorList); // Inicialmente, mostramos todos los doctores en la tabla
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    getDoctors();
  }, []);

  // Función para manejar la búsqueda en tiempo real
  const handleSearch = (text) => {
    setSearchText(text); // Actualiza el estado con el texto de búsqueda
    const filtered = doctors.filter((doctor) =>
      Object.values(doctor).some((value) =>
        String(value).toLowerCase().includes(text.toLowerCase())
      )
    );
    setFilteredDoctors(filtered); // Actualiza el estado con los doctores filtrados
    setCurrentPage(1); // Reinicia a la primera página cuando se hace una nueva búsqueda
  };

  // Obtener doctores para la página actual
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );

  // Función para cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Función para agregar un nuevo doctor
  const handleAddDoctor = () => {
    router.navigate(
      `/views/web/admin/Componentes/Administracion/medico/CrearMedico`
    );

    router.navigate(
      `/views/web/admin/Componentes/Administracion/medico/CrearMedico`
    );
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["medicos"]}
    >
      <View style={styles.container}>
        <Menu />
        <View style={styles.mainContent}>
          <Text style={styles.dashboardText}>
            Dashboard Administración de Doctores
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title="+ Nuevo Doctor"
              buttonStyle={styles.addButton}
              titleStyle={styles.addButtonText}
              onPress={handleAddDoctor}
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
              <Text style={styles.tableHeaderText}>DUI</Text>
              <Text style={styles.tableHeaderText}>Teléfono</Text>
              <Text style={styles.tableHeaderText}>Dirección</Text>
              <Text style={styles.tableHeaderText}>JVPM</Text>
              <Text style={styles.tableHeaderText}>Acciones</Text>
            </View>

            {currentDoctors.length > 0 ? (
              currentDoctors.map((doctor, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableRowText}>{doctor.nombre}</Text>
                  <Text style={styles.tableRowText}>{doctor.dui}</Text>
                  <Text style={styles.tableRowText}>{doctor.telefono}</Text>
                  <Text style={styles.tableRowText}>{doctor.direccion}</Text>
                  <Text style={styles.tableRowText}>{doctor.jvpm}</Text>
                  <View style={styles.actionIcons}>
                    <Icon
                      name="create"
                      type="ionicon"
                      color="#2E86C1"
                      size={25}
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
              <Text>No hay doctores registrados.</Text>
            )}
          </ScrollView>

          {/* Sección de paginación */}
          <View style={styles.pagination}>
            {Array.from(
              { length: Math.ceil(filteredDoctors.length / doctorsPerPage) },
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
