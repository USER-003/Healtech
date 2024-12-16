import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Menu from "./Menu";
import { useRouter } from "expo-router";

import getUserUID from "../../../../../src/queryfb/general/getUserUID";
import getUserInfo from "../../../../../src/queryfb/admin/getUserInfo";
import searchRole from "../../../../../src/queryfb/general/searchRole"; // Importa la función de búsqueda de rol

import ProtectedRoute from "../../sesion/ProtectedRoute";
import Acceso from "../../verificacion/Acceso";

const UserInfoScreen = ({ navigation }) => {
  const router = useRouter();
  const userUID = getUserUID(); // Obtener el UID del usuario actual

  const [adminInfo, setAdminInfo] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false); // Estado del modal

  useEffect(() => {
    const fetchData = async () => {
      if (userUID) {
        try {
          const role = await searchRole(userUID);
          setUserRole(role);
          console.log("Rol encontrado: ", role);

          const adminData = await getUserInfo(userUID);
          setAdminInfo(adminData);
        } catch (error) {
          console.error("Error al obtener los datos:", error);
        }
      }
    };

    fetchData();
  }, [userUID]);

  const userInfo = {
    nombre: adminInfo?.nombre,
    identificacion: adminInfo?.dui,
    direccion: adminInfo?.direccion,
    telefono: adminInfo?.telefono,
    correo: adminInfo?.email,
    fechaNacimiento: adminInfo?.nacimiento,
    genero: adminInfo?.genero,
  };

  const handleEditarPerfil = () => {
    router.navigate("/views/web/admin/Componentes/EditarPerfil");
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "colaborador"]}>
      <View style={styles.container}>
        {/* Menú lateral */}
        <Menu />

        {/* Sección de información personal */}
        <View style={styles.rightContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Información personal</Text>
            {/* Mostrar el botón de "Actualizar datos" solo si no es "colaborador" */}
            {userRole !== "colaboradores" && (
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleEditarPerfil}
              >
                <Icon name="pencil" size={20} color="#fff" />
                <Text style={styles.updateButtonText}>Actualizar datos</Text>
              </TouchableOpacity>
            )}

          </View>

          <View style={styles.infoContainer}>
            {/* Información mostrada en filas de 3 elementos */}
            <View style={styles.row}>
              <View style={styles.item}>
                <Icon name="user" size={20} style={styles.icon} />
                <Text style={styles.label}>Nombre</Text>
                <Text style={styles.value}>{userInfo.nombre}</Text>
              </View>
              <View style={styles.item}>
                <Icon name="id-card" size={20} style={styles.icon} />
                <Text style={styles.label}>Identificación</Text>
                <Text style={styles.value}>{userInfo.identificacion}</Text>
              </View>
              <View style={styles.item}>
                <Icon name="map-marker" size={20} style={styles.icon} />
                <Text style={styles.label}>Dirección</Text>
                <Text style={styles.value}>{userInfo.direccion}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Icon name="phone" size={20} style={styles.icon} />
                <Text style={styles.label}>Teléfono</Text>
                <Text style={styles.value}>{userInfo.telefono}</Text>
              </View>
              <View style={styles.item}>
                <Icon name="envelope" size={20} style={styles.icon} />
                <Text style={styles.label}>Correo electrónico</Text>
                <Text style={styles.value}>{userInfo.correo}</Text>
              </View>

              {/* Mostrar el campo "Género" solo si no es "colaborador" */}
              {userRole !== "colaboradores" && (
                <View style={styles.item}>
                  <Icon name="venus-mars" size={20} style={styles.icon} />
                  <Text style={styles.label}>Género</Text>
                  <Text style={styles.value}>{userInfo.genero}</Text>
                </View>
              )}
            </View>

            {/* Fila de la fecha de nacimiento, mostrar solo si no es "colaborador" */}
            {userRole !== "colaboradores" && (
              <View style={styles.row}>
                <View style={[styles.item, styles.singleItem]}>
                  <Icon name="calendar" size={20} style={styles.icon} />
                  <Text style={styles.label}>Fecha de Nacimiento</Text>
                  <Text style={styles.value}>{userInfo.fechaNacimiento}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

  
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  rightContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  updateButton: {
    flexDirection: "row",
    backgroundColor: "#1F4687",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "CeraRoundProMedium",
  },
  infoContainer: {
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  item: {
    flex: 1,
    marginHorizontal: 5,
  },
  singleItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  icon: {
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 2,
    fontFamily: "CeraRoundProMedium",
  },
  value: {
    color: "#333",
    fontFamily: "CeraRoundProMedium",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#45B5A9",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default UserInfoScreen;
