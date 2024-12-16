import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { Icon, Button } from "react-native-elements";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import Menu from "../Menu";
import ProtectedRoute from "../../../sesion/ProtectedRoute";
import { fetchRoles } from "../../../../../../src/queryfb/general/fetchRoles";
import obtenerRegistroClinicaAsociada from "../../../../../../src/queryfb/admin/getRegistroClinica";
import getUserUID from "../../../../../../src/queryfb/general/getUserUID";
import deleteRol from "../../../../../../src/queryfb/admin/deleteRol";
import Swal from "sweetalert2"; // Importar SweetAlert2s

const screenWidth = Dimensions.get("window").width;

const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProMedium: require("../../../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return children;
};

const App = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rolesPerPage = 5;
  const userUID = getUserUID(); // Obtener el UID
  console.log("El uid es: " + userUID);

  useEffect(() => {
    const getRoles = async () => {
      try {
        if (userUID) {
          const registroClinica = await obtenerRegistroClinicaAsociada(userUID);
          const data = await fetchRoles(registroClinica);
          if (data) {
            const rolList = Object.keys(data).map((key) => ({
              uid: key,
              ...data[key],
            }));
            setRoles(rolList);
            setFilteredRoles(rolList);
          }
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    getRoles();
  }, [userUID]);

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = roles.filter((rol) =>
      Object.values(rol).some((value) =>
        String(value).toLowerCase().includes(text.toLowerCase())
      )
    );
    setFilteredRoles(filtered);
    setCurrentPage(1);
  };

  const indexOfLastRol = currentPage * rolesPerPage;
  const indexOfFirstRol = indexOfLastRol - rolesPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstRol, indexOfLastRol);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAddRole = () => {
    router.navigate("/views/web/admin/Componentes/Roles&Permisos/Roles");
  };

  const handleEliminarRol = async (rolId) => {
    try {
      const registroClinica = await obtenerRegistroClinicaAsociada(userUID);
      if (!registroClinica) {
        setNombreError(
          "No se encontró una clínica asociada para este usuario."
        );
        return;
      }

      // Confirmación de eliminación con SweetAlert2
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        // Eliminar el rol
        await deleteRol(registroClinica, rolId);
        Swal.fire(
          "Eliminado",
          "El rol ha sido eliminado con éxito.",
          "success"
        );

        // Actualiza los estados de roles y filteredRoles simultáneamente
        setRoles((prevRoles) => prevRoles.filter((rol) => rol.uid !== rolId));
        setFilteredRoles((prevFilteredRoles) =>
          prevFilteredRoles.filter((rol) => rol.uid !== rolId)
        );
      }
    } catch (error) {
      console.error("Error al eliminar el rol:", error);
      Swal.fire(
        "Error",
        "Hubo un problema al intentar eliminar el rol.",
        "error"
      );
    }
  };

  const handleEditRole = (rol) => {
    router.navigate(
      `/views/web/admin/Componentes/Roles&Permisos/EditarRol?rol=${rol.uid}`
    );
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["crearroles"]}
    >
      <LoadFonts>
        <View style={styles.container}>
          <Menu />
          <View style={styles.mainContent}>
            <Text style={styles.title}>Dashboard ROLES DE SISTEMA</Text>
            <View style={styles.buttonContainer}>
              <Button
                title="+ Nuevo ROL"
                buttonStyle={styles.addButton}
                titleStyle={styles.addButtonText}
                onPress={handleAddRole}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre, descripcion, fecha..."
                value={searchText}
                onChangeText={handleSearch}
              />
            </View>

            <ScrollView style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Nombre</Text>
                <Text style={styles.tableHeaderText}>Descripción</Text>
                <Text style={styles.tableHeaderText}>Fecha de creación</Text>
                <Text style={styles.tableHeaderText}>Acciones</Text>
              </View>

              {currentRoles.length > 0 ? (
                currentRoles.map((rol, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableRowText}>{rol.nombre}</Text>
                    <Text style={styles.tableRowText}>{rol.descripcion}</Text>
                    <Text style={styles.tableRowText}>{rol.fechaCreacion}</Text>
                    <View style={styles.actionIcons}>
                      <Icon
                        name="eye"
                        type="ionicon"
                        color="#2E86C1"
                        size={25}
                        onPress={() => handleEditRole(rol)} // Llama a la función con el rol actual
                      />

                      <Icon
                        name="trash"
                        type="ionicon"
                        color="#e53935"
                        size={25}
                        onPress={() => handleEliminarRol(rol.uid)} // Llama a handleEliminarRol con el ID del rol
                      />
                    </View>
                  </View>
                ))
              ) : (
                <Text>No hay roles registrados.</Text>
              )}
            </ScrollView>

            <View style={styles.pagination}>
              {Array.from(
                { length: Math.ceil(filteredRoles.length / rolesPerPage) },
                (_, i) => (
                  <Button
                    key={i + 1}
                    title={`${i + 1}`}
                    onPress={() => paginate(i + 1)}
                    disabled={currentPage === i + 1}
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
      </LoadFonts>
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
  title: {
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
    flex: 1, // Hace que el campo de búsqueda se ajuste al espacio disponible
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    borderRadius: 5,
    fontFamily: "CeraRoundProMedium",
    minWidth: 150, // Establece un ancho mínimo para evitar que sea demasiado pequeño
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
