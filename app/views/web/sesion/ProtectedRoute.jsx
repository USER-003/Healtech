import React, { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get, child } from "firebase/database";
import { db } from "../../../../src/config/fb";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import validarClinicaAsociada from "../../../../src/queryfb/admin/checkClinicaAsociada";
import getPermisosFromColaboradorUID from "../../../../src/queryfb/admin/colaborador/getPermisosColaborador";
import FontAwesome from "react-native-vector-icons/FontAwesome"; // Importamos FontAwesome

const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 horas

const ProtectedRoute = ({ allowedRoles, requiredPermissions, children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]); // Permisos específicos del usuario
  const auth = getAuth();
  const router = useRouter();

  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("warning");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalAction, setModalAction] = useState(null);

  const fetchUserRole = async (userUid) => {
    const dbRef = ref(db);
    let snapshot = await get(child(dbRef, `admin/${userUid}`));
    if (snapshot.exists()) return { role: "admin", data: snapshot.val() };

    snapshot = await get(child(dbRef, `doctor/${userUid}`));
    if (snapshot.exists()) return { role: "doctor", data: snapshot.val() };

    snapshot = await get(child(dbRef, `paciente/${userUid}`));
    if (snapshot.exists()) return { role: "paciente", data: snapshot.val() };

    snapshot = await get(child(dbRef, `colaboradores/${userUid}`));
    if (snapshot.exists()) {
      return { role: "colaborador", data: snapshot.val() };
    }

    return null;
  };

  const checkSessionExpiration = async () => {
    try {
      const storedLoginTime = await AsyncStorage.getItem("loginTime");
      if (storedLoginTime) {
        const loginTime = JSON.parse(storedLoginTime);
        const currentTime = Date.now();

        if (currentTime - loginTime > SESSION_TIMEOUT) {
          setModalTitle("La sesión expiró");
          setModalMessage("Debes volver a iniciar sesión para continuar");
          setModalType("warning");
          setModalVisible(true);
          setModalAction(async () => {
            await signOut(auth);
            router.replace("/views/web/sesion/Login");
          });
          return true;
        }
      }
    } catch (error) {
      console.error("Error al verificar la expiración de la sesión:", error);
    }
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isExpired = await checkSessionExpiration();
        if (isExpired) return;

        try {
          const userInfo = await fetchUserRole(user.uid);
          if (userInfo) {
            const { role } = userInfo;
            setUserRole(role);

            if (role === "admin") {
              const clinicaAsociada = await validarClinicaAsociada(user.uid);
              if (!clinicaAsociada) {
                setModalTitle("Aún no ha registrado una clínica");
                setModalMessage(
                  "Necesitas registrar una clínica antes de continuar"
                );
                setModalType("warning");
                setModalVisible(true);
                setModalAction(() => {
                  router.replace("/views/web/sesion/RegistroClinica");
                });
                return;
              }
            }

            if (!allowedRoles.includes(role)) {
              router.replace("/views/web/sesion/Desautorizado");
              return;
            }

            // Verificar permisos específicos si es colaborador
            if (role === "colaborador" && requiredPermissions) {
              const rawPermissions = await getPermisosFromColaboradorUID(
                user.uid
              );

              const normalizedPermissions = Object.keys(rawPermissions).reduce(
                (acc, key) => {
                  if (rawPermissions[key]) {
                    acc[key.toLowerCase()] = true;
                  }
                  return acc;
                },
                {}
              );

              console.log(
                "Validando: ",
                normalizedPermissions,
                ", contra: ",
                requiredPermissions
              );

              const hasPermissions = requiredPermissions.every(
                (perm) => normalizedPermissions[perm] === true
              );

              if (!hasPermissions) {
                router.replace("/views/web/sesion/Desautorizado");
                return;
              }
            }
          } else {
            router.replace("/views/web/sesion/Login");
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario:", error);
        }
      } else {
        router.replace("/views/web/sesion/Login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, allowedRoles, requiredPermissions, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      {children}
      {/* Modal personalizado */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          if (modalAction) {
            modalAction();
          }
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FontAwesome
              name={
                modalType === "success"
                  ? "check-circle"
                  : modalType === "warning"
                  ? "exclamation-circle"
                  : modalType === "error"
                  ? "times-circle"
                  : "info-circle"
              }
              size={60}
              color={
                modalType === "success"
                  ? "#4CAF50"
                  : modalType === "warning"
                  ? "#FF9800"
                  : modalType === "error"
                  ? "#F44336"
                  : "#2196F3"
              }
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                if (modalAction) {
                  modalAction();
                }
              }}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // ... otros estilos ...
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
  modalTitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: "#37817A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ProtectedRoute;
