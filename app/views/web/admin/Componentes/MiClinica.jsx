import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useFonts } from "expo-font";
import Menu from "./Menu";
import { useRouter } from "expo-router";

import ProtectedRoute from "../../sesion/ProtectedRoute";

import getUserUID from "../../../../../src/queryfb/general/getUserUID";
import getUserInfo from "../../../../../src/queryfb/admin/getUserInfo";
import getClinicaAsociada from "../../../../../src/queryfb/admin/getClinicaAsociada";

const ClinicaInfo = () => {
  // Estados para almacenar los datos del formulario
  const [adminInfo, setAdminInfo] = useState(null);
  const [clinica, setClinica] = useState(null);

  const userUID = getUserUID(); // Obtener el UID del usuario actual

  const router = useRouter();

  // Estado para controlar el DateTimePicker
  const [showPicker, setShowPicker] = useState({
    show: false,
    day: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (userUID) {
        try {
          const clinicaData = await getClinicaAsociada(userUID);
          if (clinicaData) {
            setClinica(clinicaData);
          }

          const adminData = await getUserInfo(userUID);
          setAdminInfo(adminData);
        } catch (error) {
          console.error("Error al obtener los datos:", error);
        }
      }
    };

    fetchData();
  }, [userUID]);

  // Función para abrir el DateTimePicker
  const showTimePicker = (day) => {
    setShowPicker({ show: true, day });
  };

  // Función para manejar el cambio de hora en el picker
  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || new Date();
    setShowPicker({ ...showPicker, show: false });

    if (selectedTime) {
      const newTime = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setEditableData((prevState) => ({
        ...prevState,
        horarios: { ...prevState.horarios, [showPicker.day]: newTime },
      }));
    }
  };
  // Función para agregar un nuevo doctor
  const handleUpdate = () => {
    router.navigate(`/views/web/admin/Componentes/ActualizarDatosCli`);
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["miclinica"]}
    >
      <View style={styles.container}>
        <Menu />

        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Información de mi clínica</Text>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
            >
              <Icon name="edit" size={20} color="white" />
              <Text style={styles.updateText}>Actualizar datos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Nombre:</Text>
                <Text style={styles.value}>{clinica?.nombre}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Administrador:</Text>
                <Text style={styles.value}>{adminInfo?.nombre}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Teléfono:</Text>
                <Text style={styles.value}>{clinica?.telefono}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>N Registro:</Text>
                <Text style={styles.value}>{clinica?.registro}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.value}>{clinica?.direccion}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Entidad:</Text>
                <Text style={styles.value}>{clinica?.entidad}</Text>
              </View>
            </View>
          </View>

          <View style={styles.scheduleSection}>
            <Text style={styles.subtitle}>Horarios de atención</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>DÍA</Text>
                <Text style={styles.tableHeaderText}>APERTURA</Text>
                <Text style={styles.tableHeaderText}>CIERRE</Text>
                <Text style={styles.tableHeaderText}>ESTADO</Text>
              </View>

              {clinica?.horarios && Object.keys(clinica.horarios).length > 0 ? (
                // Ordenamos los días de lunes a domingo
                [
                  "lunes",
                  "martes",
                  "miercoles",
                  "jueves",
                  "viernes",
                  "sabado",
                  "domingo",
                ].map((day) => (
                  <View key={day} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{day.toUpperCase()}</Text>
                    <Text style={styles.tableCell}>
                      {clinica.horarios[day]?.isOpen
                        ? clinica.horarios[day].apertura
                        : "-"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {clinica.horarios[day]?.isOpen
                        ? clinica.horarios[day].cierre
                        : "-"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {clinica.horarios[day]?.isOpen ? "Abierto" : "Cerrado"}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell} colSpan={4}>
                    No se encontraron horarios de atención.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "CeraRoundProMedium",
    marginBottom: 20,
    fontWeight: "bold",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    fontFamily: "CeraRoundProMedium",
    backgroundColor: "#2D86C0",
    padding: 10,
    borderRadius: 5,
  },
  updateText: {
    color: "white",
    marginLeft: 5,
    fontFamily: "CeraRoundProMedium",
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  value: {
    marginBottom: 10,
    fontFamily: "CeraRoundProMedium",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "CeraRoundProMedium",
  },
  scheduleSection: {
    marginBottom: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2D86C0",
    padding: 10,
  },
  tableHeaderText: {
    flex: 1,
    textAlign: "center",
    fontFamily: "CeraRoundProMedium",
    color: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    fontFamily: "CeraRoundProMedium",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontFamily: "CeraRoundProMedium",
  },
});
export default ClinicaInfo;
