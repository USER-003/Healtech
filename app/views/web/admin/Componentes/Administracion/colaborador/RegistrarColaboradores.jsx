import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { Icon, Button } from "react-native-elements";
import { useRouter } from "expo-router";
import Menu from "../../Menu"; // Ya tienes este componente importado
// import { fetchCollaborators } from "../../../../../../../src/queryfb/colaborator/fetchColaboradores";
import ProtectedRoute from "../../../../sesion/ProtectedRoute";
import { fetchCollaborators } from "../../../../../../../src/queryfb/admin/colaborador/fetchColaboradores";

const Collaborators = () => {
  const [collaborators, setCollaborators] = useState([]); // Estado para almacenar todos los colaboradores
  const [filteredCollaborators, setFilteredCollaborators] = useState([]); // Estado para almacenar los colaboradores filtrados
  const [searchText, setSearchText] = useState(""); // Estado para el texto de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const collaboratorsPerPage = 5; // Limitar a 5 colaboradores por página

  const router = useRouter();

  useEffect(() => {
    const getCollaborators = async () => {
      try {
        const data = await fetchCollaborators();
        if (data) {
          const collaboratorList = Object.keys(data).map((key) => ({
            uid: key,
            ...data[key],
          }));
          setCollaborators(collaboratorList); // Guardamos todos los colaboradores
          setFilteredCollaborators(collaboratorList); // Inicialmente, mostramos todos los colaboradores en la tabla
        }
      } catch (error) {
        console.error("Error fetching collaborators:", error);
      }
    };

    getCollaborators();
  }, []);

  // Función para manejar la búsqueda en tiempo real
  const handleSearch = (text) => {
    setSearchText(text); // Actualiza el estado con el texto de búsqueda
    const filtered = collaborators.filter((collaborator) =>
      Object.values(collaborator).some((value) =>
        String(value).toLowerCase().includes(text.toLowerCase())
      )
    );
    setFilteredCollaborators(filtered); // Actualiza el estado con los colaboradores filtrados
    setCurrentPage(1); // Reinicia a la primera página cuando se hace una nueva búsqueda
  };

  // Obtener colaboradores para la página actual
  const indexOfLastCollaborator = currentPage * collaboratorsPerPage;
  const indexOfFirstCollaborator =
    indexOfLastCollaborator - collaboratorsPerPage;
  const currentCollaborators = filteredCollaborators.slice(
    indexOfFirstCollaborator,
    indexOfLastCollaborator
  );

  // Función para cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Función para agregar un nuevo colaborador
  const handleAddCollaborator = () => {
    router.navigate(
      "/views/web/admin/Componentes/Administracion/colaborador/CrearColaborador"
    );
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["colaboradores"]}
    >
      <View style={styles.container}>
        <Menu />
        <View style={styles.mainContent}>
          <Text style={styles.dashboardText}>Dashboard Colaboradores</Text>

          <View style={styles.buttonContainer}>
            <Button
              title="+ Nuevo colaborador"
              buttonStyle={styles.addButton}
              titleStyle={styles.addButtonText}
              onPress={handleAddCollaborator}
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, DUI, teléfono..."
              value={searchText}
              onChangeText={handleSearch} // Ejecuta la búsqueda en tiempo real
            />
          </View>

          <ScrollView style={styles.tablñe}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Nombre</Text>
              <Text style={styles.tableHeaderText}>Apellido</Text>
              <Text style={styles.tableHeaderText}>DUI</Text>
              <Text style={styles.tableHeaderText}>Cargo</Text>
              <Text style={styles.tableHeaderText}>Teléfono</Text>
              <Text style={styles.tableHeaderText}>Estado</Text>
            </View>

            {currentCollaborators.length > 0 ? (
              currentCollaborators.map((collaborator, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableRowText}>{collaborator.nombre}</Text>
                  <Text style={styles.tableRowText}>
                    {collaborator.apellido}
                  </Text>
                  <Text style={styles.tableRowText}>{collaborator.dui}</Text>
                  <Text style={styles.tableRowText}>{collaborator.cargo}</Text>
                  <Text style={styles.tableRowText}>
                    {collaborator.telefono}
                  </Text>
                  <Text style={styles.tableRowText}>{collaborator.status}</Text>
                </View>
              ))
            ) : (
              <Text>No hay colaboradores registrados.</Text>
            )}
          </ScrollView>

          {/* Sección de paginación */}
          <View style={styles.pagination}>
            {Array.from(
              {
                length: Math.ceil(
                  filteredCollaborators.length / collaboratorsPerPage
                ),
              },
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

export default Collaborators;
