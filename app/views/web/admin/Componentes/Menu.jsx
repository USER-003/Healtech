import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Icon } from "react-native-elements";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { getAuth, signOut } from "firebase/auth";
import ProtectedRoute from "../../sesion/ProtectedRoute";
import searchRole from "../../../../../src/queryfb/general/searchRole";
import getPermisosFromColaboradorUID from "../../../../../src/queryfb/admin/colaborador/getPermisosColaborador";
import { auth } from "../../../../../src/config/fb";
import FontAwesome from "react-native-vector-icons/FontAwesome"; // Importamos FontAwesome

const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProMedium: require("../../../../../assets/fonts/CeraRoundProMedium.otf"),
    CeraRoundProBold: require("../../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProRegular: require("../../../../../assets/fonts/CeraRoundProRegular.otf"),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return children;
};

const Sidebar = ({ onLogout }) => {
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isRolesDropdownOpen, setIsRolesDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState({});

  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("warning");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const role = await searchRole(user.uid);
          setUserRole(role);

          if (role === "colaboradores") {
            const rawPermissions = await getPermisosFromColaboradorUID(
              user.uid
            );

            // Normaliza los nombres de los permisos a minúsculas
            const normalizedPermissions = Object.keys(rawPermissions).reduce(
              (acc, key) => {
                acc[key.toLowerCase()] = rawPermissions[key];
                return acc;
              },
              {}
            );

            setPermissions(normalizedPermissions);
          }
        }
      } catch (error) {
        console.error("Error fetching user role or permissions:", error);
      }
    };

    fetchUserPermissions();
  }, [auth]);

  const toggleDropdown = () => setIsAdminDropdownOpen(!isAdminDropdownOpen);
  const toggleProfileDropdown = () =>
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  const toggleRolesDropdown = () =>
    setIsRolesDropdownOpen(!isRolesDropdownOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const handleNavigation = (path) => router.replace(path);

  // Función que muestra el modal de confirmación
  const handleLogout = () => {
    setModalTitle("¿Estás seguro?");
    setModalMessage("¿Deseas cerrar sesión?");
    setModalType("warning");
    setModalVisible(true);
  };

  // Función que realiza el cierre de sesión
  const confirmLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      handleNavigation("/views/web/sesion/Login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const hasPermission = (module) => userRole === "admin" || permissions[module];

  const showAdminModule =
    hasPermission("medicos") ||
    hasPermission("pacientes") ||
    hasPermission("colaboradores");

  const showRolesModule =
    hasPermission("crearroles") || hasPermission("administrarpermisos");

  return (
    <ProtectedRoute allowedRoles={["admin", "colaborador"]}>
      <LoadFonts>
        <View style={[styles.sidebar, isCollapsed && styles.sidebarCollapsed]}>
          <View style={[styles.header, isCollapsed && styles.headerCollapsed]}>
            {!isCollapsed && (
              <TouchableOpacity
                onPress={() => handleNavigation("/views/web/admin/DashBoard")}
              >
                <Text style={styles.title}>Dashboard</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={toggleCollapse}
              style={styles.collapseButton}
            >
              <Icon
                name={isCollapsed ? "menu" : "chevron-left"}
                type="material-community"
                color="#ffffff"
                size={24}
              />
            </TouchableOpacity>
          </View>

          {!isCollapsed && (
            <TouchableOpacity
              onPress={() =>
                handleNavigation("/views/web/admin/Componentes/MiPerfil")
              }
              style={styles.button}
            >
              <Icon
                name="account-edit"
                type="material-community"
                color="#ffffff"
                size={20}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Mi Perfil</Text>
            </TouchableOpacity>
          )}

          {!isCollapsed && showAdminModule && (
            <>
              <TouchableOpacity
                onPress={toggleDropdown}
                style={styles.dropdownHeader}
              >
                <Icon
                  name="account-cog"
                  type="material-community"
                  color="#ffffff"
                  size={20}
                />
                <Text style={styles.dropdownHeaderText}>Administración</Text>
                <Icon
                  name={isAdminDropdownOpen ? "chevron-up" : "chevron-down"}
                  type="material-community"
                  color="#ffffff"
                  size={20}
                />
              </TouchableOpacity>

              {isAdminDropdownOpen && (
                <View style={styles.dropdownContent}>
                  {hasPermission("pacientes") && (
                    <TouchableOpacity
                      onPress={() =>
                        handleNavigation(
                          "/views/web/admin/Componentes/Administracion/paciente/VerPacientes"
                        )
                      }
                      style={styles.button}
                    >
                      <Icon
                        name="account-plus"
                        type="material-community"
                        color="#ffffff"
                        size={20}
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Pacientes</Text>
                    </TouchableOpacity>
                  )}
                  {hasPermission("medicos") && (
                    <TouchableOpacity
                      onPress={() =>
                        handleNavigation(
                          "/views/web/admin/Componentes/Administracion/medico/VerDoctores"
                        )
                      }
                      style={styles.button}
                    >
                      <Icon
                        name="stethoscope"
                        type="material-community"
                        color="#ffffff"
                        size={20}
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Médicos</Text>
                    </TouchableOpacity>
                  )}
                  {hasPermission("colaboradores") && (
                    <TouchableOpacity
                      onPress={() =>
                        handleNavigation(
                          "/views/web/admin/Componentes/Administracion/colaborador/RegistrarColaboradores"
                        )
                      }
                      style={styles.button}
                    >
                      <Icon
                        name="account-group"
                        type="material-community"
                        color="#ffffff"
                        size={20}
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Colaboradores</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}

          {!isCollapsed && showRolesModule && (
            <>
              <TouchableOpacity
                onPress={toggleRolesDropdown}
                style={styles.dropdownHeader}
              >
                <Icon
                  name="lock"
                  type="material-community"
                  color="#ffffff"
                  size={20}
                />
                <Text style={styles.dropdownHeaderText}>Roles y Permisos</Text>
                <Icon
                  name={isRolesDropdownOpen ? "chevron-up" : "chevron-down"}
                  type="material-community"
                  color="#ffffff"
                  size={20}
                />
              </TouchableOpacity>

              {isRolesDropdownOpen && (
                <View style={styles.dropdownContent}>
                  {hasPermission("crearroles") && (
                    <TouchableOpacity
                      onPress={() =>
                        handleNavigation(
                          "/views/web/admin/Componentes/Roles&Permisos/AdministrarRoles"
                        )
                      }
                      style={styles.button}
                    >
                      <Icon
                        name="account-cog"
                        type="material-community"
                        color="#ffffff"
                        size={20}
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Roles del sistema</Text>
                    </TouchableOpacity>
                  )}
                  {hasPermission("administrarpermisos") && (
                    <TouchableOpacity
                      onPress={() =>
                        handleNavigation(
                          "/views/web/admin/Componentes/Roles&Permisos/Permisos"
                        )
                      }
                      style={styles.button}
                    >
                      <Icon
                        name="lock-check"
                        type="material-community"
                        color="#ffffff"
                        size={20}
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>
                        Administrar permisos
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}

          {!isCollapsed && hasPermission("miclinica") && (
            <TouchableOpacity
              onPress={() =>
                handleNavigation("/views/web/admin/Componentes/MiClinica")
              }
              style={styles.button}
            >
              <Icon
                name="hospital-building"
                type="material-community"
                color="#ffffff"
                size={20}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Mi Clínica</Text>
            </TouchableOpacity>
          )}

          {!isCollapsed && hasPermission("actividad") && (
            <TouchableOpacity
              onPress={() =>
                handleNavigation("/views/web/admin/Componentes/VerActividad")
              }
              style={styles.button}
            >
              <Icon
                name="chart-line"
                type="material-community"
                color="#ffffff"
                size={20}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Actividad</Text>
            </TouchableOpacity>
          )}

          {!isCollapsed && (
            <View style={styles.logoutContainer}>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                <Icon
                  name="logout"
                  type="material-community"
                  color="#ffffff"
                  size={20}
                  style={styles.logoutIcon}
                />
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Modal de confirmación */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FontAwesome
                name="exclamation-circle"
                size={60}
                color="#FF9800"
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonTextCancel}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisible(false);
                    confirmLogout();
                  }}
                >
                  <Text style={styles.modalButtonText}>Sí</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LoadFonts>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    height: "auto",
  },
  sidebarCollapsed: { width: "5%", paddingHorizontal: 5 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerCollapsed: { justifyContent: "center" },
  collapseButton: { alignSelf: "flex-end" },
  title: { color: "#ffffff", fontSize: 22, fontWeight: "bold" },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 8,
    paddingLeft: 10,
  },
  dropdownHeaderText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "CeraRoundProMedium",
    marginLeft: 10,
  },
  dropdownContent: {
    paddingLeft: 20, // Agregamos paddingLeft para indentar subitems
    fontFamily: "CeraRoundProMedium",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingLeft: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "CeraRoundProMedium",
    padding: 5,
  },
  buttonIcon: { marginRight: 10 },
  logoutContainer: {
    marginTop: "auto",
    padding: 10,
    backgroundColor: "#E53935",
    borderRadius: 5,
    justifyContent: "flex-end",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutIcon: { marginRight: 10 },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "CeraRoundProMedium",
  },
  // Estilos para el modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "50%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "CeraRoundProBold",
    textAlign: "center",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    fontFamily: "CeraRoundProRegular",
    textAlign: "center",
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  modalButton: {
    backgroundColor: "#37817A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#37817A",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "CeraRoundProBold",
  },
  modalButtonTextCancel: {
    color: "#37817A",
    fontSize: 16,
    fontFamily: "CeraRoundProBold",
  },
});

export default Sidebar;
