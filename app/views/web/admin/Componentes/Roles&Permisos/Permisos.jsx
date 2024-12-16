import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Picker,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import SwitchToggle from "@imcarlosguerrero/react-native-switch-toggle";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Menu from "../Menu";
import { useFonts } from "expo-font";

import getUserUID from "../../../../../../src/queryfb/general/getUserUID";
import obtenerRegistroClinicaAsociada from "../../../../../../src/queryfb/admin/getRegistroClinica";
import { fetchRoles } from "../../../../../../src/queryfb/general/fetchRoles";
import obtenerPermisosDeRol from "../../../../../../src/queryfb/admin/obtenerPermisosDeRol";
import guardarPermisos from "../../../../../../src/queryfb/admin/setPermisos";
import ProtectedRoute from "../../../sesion/ProtectedRoute";

// Carga la tipografía
const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require("../../../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../../../assets/fonts/CeraRoundProBlack.otf"),
    CeraRoundProBold: require("../../../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProMedium: require("../../../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return children;
};

const formatPermissionName = (name) => name.replace(/([A-Z])/g, " $1").trim();

const Permisos = () => {
  const defaultPermissions = {
    Pacientes: false,
    Medicos: false,
    Colaboradores: false,
    CrearRoles: false,
    AdministrarPermisos: false,
    MiClinica: false,
    Actividad: false,
  };

  const [permissions, setPermissions] = useState(defaultPermissions);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [permissionsEnabled, setPermissionsEnabled] = useState(false);
  const userUID = getUserUID();

  const permissionOrder = [
    "Pacientes",
    "Medicos",
    "Colaboradores",
    "CrearRoles",
    "AdministrarPermisos",
    "MiClinica",
    "Actividad",
  ];

  useEffect(() => {
    const getRoles = async () => {
      if (userUID) {
        try {
          const registroClinica = await obtenerRegistroClinicaAsociada(userUID);
          const data = await fetchRoles(registroClinica);

          if (data) {
            const rolList = Object.keys(data).map((key) => ({
              uid: key,
              ...data[key],
            }));
            setRoles(rolList);
          }
        } catch (error) {
          console.error("Error fetching roles:", error);
        }
      }
    };

    getRoles();
  }, [userUID]);

  useEffect(() => {
    const loadRolePermissions = async () => {
      if (selectedRole) {
        try {
          const registroClinica = await obtenerRegistroClinicaAsociada(userUID);
          const permisos = await obtenerPermisosDeRol(
            registroClinica,
            selectedRole
          );

          if (permisos) {
            setPermissions(permisos);
          } else {
            setPermissions(defaultPermissions);
          }
          setPermissionsEnabled(true);
        } catch (error) {
          console.error("Error loading permissions:", error);
        }
      } else {
        setPermissions(defaultPermissions);
        setPermissionsEnabled(false);
      }
    };

    loadRolePermissions();
  }, [selectedRole]);

  const toggleSwitch = (key) => {
    if (permissionsEnabled) {
      setPermissions({ ...permissions, [key]: !permissions[key] });
    }
  };

  const handleSave = async () => {
    if (!Object.values(permissions).some((value) => value === true)) {
      setModalType("error");
      setModalMessage("Debe seleccionar al menos un módulo y permiso.");
      setModalVisible(true);
      return;
    }

    try {
      const registroClinica = await obtenerRegistroClinicaAsociada(userUID);
      const success = await guardarPermisos(
        registroClinica,
        selectedRole,
        permissions
      );

      setModalType(success ? "success" : "error");
      setModalMessage(
        success
          ? `Permisos asignados correctamente al rol seleccionado.`
          : "Hubo un problema al asignar los permisos."
      );
    } catch (error) {
      console.error("Error al asignar permisos:", error);
      setModalType("error");
      setModalMessage(
        "Hubo un error al asignar permisos. Por favor, intente nuevamente."
      );
    }

    setModalVisible(true);
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["administrarpermisos"]}
    >
      <LoadFonts>
        <View style={styles.container}>
          <Menu />
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.mainContent}>
              <Text style={styles.title}>ROLES DE SISTEMA</Text>
              <Text style={styles.subtitle}>Asignar permisos</Text>

              <View style={styles.rolePickerContainer}>
                <Picker
                  selectedValue={selectedRole}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedRole(itemValue)}
                >
                  <Picker.Item label="Seleccione un rol" value="" />
                  {roles.map((rol) => (
                    <Picker.Item
                      key={rol.uid}
                      label={rol.nombre}
                      value={rol.uid}
                    />
                  ))}
                </Picker>
              </View>

              {permissionsEnabled && (
                <>
                  <View style={styles.moduloEstadoContainer}>
                    <Text style={styles.moduloText}>Módulo</Text>
                    <Text style={styles.estadoText}>Estado</Text>
                  </View>

                  <View style={styles.permissionsContainer}>
                    {permissionOrder.map((key) => (
                      <View key={key} style={styles.permissionRow}>
                        <Text style={styles.permissionText}>
                          {formatPermissionName(key)}
                        </Text>
                        <SwitchToggle
                          switchOn={permissions[key]}
                          onPress={() => toggleSwitch(key)}
                          circleColorOff="#ccc"
                          circleColorOn="#2D86C0"
                          backgroundColorOn="#E6F0FA"
                          backgroundColorOff="#E6E6E6"
                          containerStyle={styles.switchContainer}
                          circleStyle={styles.switchCircle}
                          disabled={!permissionsEnabled}
                        />
                      </View>
                    ))}
                  </View>
                </>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    !permissionsEnabled && styles.disabledButton,
                  ]}
                  onPress={handleSave}
                  disabled={!permissionsEnabled}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <FontAwesome
                  name={
                    modalType === "success"
                      ? "check-circle"
                      : "exclamation-circle"
                  }
                  size={60}
                  color={modalType === "success" ? "#4CAF50" : "#FF5252"}
                  style={styles.modalIcon}
                />
                <Text style={styles.modalText}>{modalMessage}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </LoadFonts>
    </ProtectedRoute>
  );
};

// Estilos para el componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  mainContent: {
    flex: 1,
    padding: 20,
    marginLeft: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontFamily: "CeraRoundProBlack",
    fontSize: 27,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: "CeraRoundProRegular",
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  rolePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 15,
  },
  picker: {
    height: 40,
    width: "50%",
    fontFamily: "CeraRoundProRegular",
    fontSize: 14,
  },
  moduloEstadoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  moduloText: {
    fontFamily: "CeraRoundProBold",
    fontSize: 18,
    color: "#000",
    flex: 1,
  },
  estadoText: {
    fontFamily: "CeraRoundProBold",
    fontSize: 18,
    color: "#000",
    flex: 1.1,
    textAlign: "left",
  },
  permissionsContainer: {
    marginBottom: 10,
  },
  permissionRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginVertical: 8,
  },
  permissionText: {
    fontFamily: "CeraRoundProRegular",
    fontSize: 14,
    color: "#333",
    marginRight: 10,
    width: "46.5%",
  },
  switchContainer: {
    width: 69,
    height: 28,
    borderRadius: 20,
    alignItems: "center",
    padding: 2,
  },
  switchCircle: {
    width: 16,
    height: 16,
    borderRadius: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#37817A",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  saveButtonText: {
    fontFamily: "CeraRoundProRegular",
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    fontFamily: "CeraRoundProBold",
    textAlign: "center",
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "CeraRoundProBold",
  },
});

export default Permisos;
