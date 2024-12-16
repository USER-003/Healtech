import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Icon } from "react-native-elements";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import ProtectedRoute from '../Componentes/ProtectedRoute';
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import searchPatientByUid from '../../../../src/queryfb/paciente/searchPatientByUid';

// Importamos react-native-reanimated
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

const MiPerfil = () => {
  const router = useRouter();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [patientData, setPatientData] = useState({
    name: '',
    direccion: '',
    identificacion: '',
    nacionalidad: '',
    telefono: '',
    email: '',
    sexo: '',
    edad: '',
    fechaNacimiento: '',
  });

  // Estado para controlar la visibilidad de la modal
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  // Valor compartido para la escala
  const scaleValue = useSharedValue(0);

  // Estilo animado
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  // Efecto para controlar la animación al mostrar/ocultar la modal
  useEffect(() => {
    if (isLogoutModalVisible) {
      scaleValue.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    } else {
      scaleValue.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [isLogoutModalVisible]);

  // Carga de fuentes
  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
    CeraRoundProBold: require("../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProMedium: require("../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplashScreen();
  }, [fontsLoaded]);

  useEffect(() => {
    if (currentUser) {
      const uid = currentUser.uid;
      searchPatientByUid(uid)
        .then(data => {
          if (data) {
            const calculatedAge = calculateAge(data.nacimiento);
            setPatientData({
              name: data.nombre,
              direccion: data.direccion || 'No disponible',
              identificacion: data.identificacion || 'No disponible',
              nacionalidad: data.nacionalidad || 'No disponible',
              telefono: data.telefono || 'No disponible',
              email: data.email || 'No disponible',
              sexo: data.sexo || 'No especificado',
              fechaNacimiento: data.nacimiento || 'No disponible',
              edad: calculatedAge,
            }); 
          }
        })
        .catch(error => console.error("Error al cargar datos del paciente:", error));
    }
  }, [currentUser]);

  const calculateAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'No disponible';
    
    const [day, month, year] = fechaNacimiento.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    
    if (isNaN(birthDate)) return 'Formato de fecha no válido';

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} años`;
  };

  if (!fontsLoaded) {
    return null;
  }

  // Función para mostrar la modal de confirmación
  const confirmLogout = () => {
    setIsLogoutModalVisible(true);
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleNavigation("/views/movil/login/Login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleNavigation = (path) => {
    router.replace(path);
  };

  return (
    <ProtectedRoute allowedRoles={"paciente"}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.leftAligned}>
              <Text style={styles.roleText}>PACIENTE</Text>
              <Text style={styles.nameText}>{patientData.name}</Text>
            </View>
            {/* Reemplazamos el ícono de usuario por el ícono de tuerca */}
           
            <FontAwesome name="user" size={80} color="#45B5A9" style={styles.profileIcon} />
          
          </View>

          <View style={styles.infoSection}>
            <View style={styles.actionRowContainer}>
              <Text style={styles.sectionTitle}>Información básica</Text>
              <TouchableOpacity style={styles.updateButton} onPress={() => router.push('./EditPerfil')}>
                <Icon name="pencil" type="font-awesome" color="#45B5A9" size={20} />
                <Text style={styles.updateText}>Actualizar</Text>
              </TouchableOpacity>
            </View>

            <InfoRow icon="map-marker" label="Dirección" value={patientData.direccion} />
            <InfoRow icon="id-card" label="Identificación" value={patientData.identificacion} />
            <InfoRow icon="globe" label="Nacionalidad" value={patientData.nacionalidad} />
            <InfoRow icon="phone" label="Teléfono" value={patientData.telefono} />
            <InfoRow icon="envelope" label="Correo electrónico" value={patientData.email} />
            <InfoRow icon="venus-mars" label="Sexo" value={patientData.sexo} />
            <InfoRow icon="hourglass-half" label="Edad" value={patientData.edad} />
            <InfoRow icon="birthday-cake" label="Fecha de nacimiento" value={patientData.fechaNacimiento} />
          </View>

          <View style={styles.logoutButtonContainer}>
            <TouchableOpacity onPress={confirmLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
            </TouchableOpacity>
          </View>

          {/* Modal de confirmación con animación */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={isLogoutModalVisible}
            onRequestClose={() => {
              setIsLogoutModalVisible(false);
            }}
          >
            <View style={styles.modalBackground}>
              <Animated.View style={[styles.modalView, animatedStyle]}>
                <Text style={styles.modalTitle}>¿Desea cerrar sesión?</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      setIsLogoutModalVisible(false);
                      handleLogout();
                    }}
                  >
                    <Text style={styles.confirmButtonText}>Sí</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsLogoutModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Modal>

        </View>
        <View style={{ paddingBottom: 60 }}></View>
      </ScrollView>
    </ProtectedRoute>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Icon name={icon} type="font-awesome" color="#000" size={24} />
    <View style={styles.infoTextColumn}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  // ...tus estilos existentes

  // Añadimos los estilos modificados para los botones
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#45B5A9',
    borderRadius: 10,
    paddingVertical: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontFamily: 'CeraRoundProBold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#45B5A9',
  },
  cancelButtonText: {
    color: '#45B5A9',
    fontFamily: 'CeraRoundProBold',
    fontSize: 16,
  },
  // Estilos para la modal y el fondo
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontFamily: 'CeraRoundProBold',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  // Resto de tus estilos...
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40,
    justifyContent: 'space-between', // Ajustamos para separar los elementos
  },
  leftAligned: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  roleText: {
    color: '#45B5A9',
    fontSize: 16,
    fontFamily: 'CeraRoundProBold',
  },
  nameText: {
    fontSize: 20,
    fontFamily: 'CeraRoundProRegular',
    marginVertical: 10,
  },
  // Removemos el estilo profileIcon si ya no se usa
  // Añadimos el estilo para settingsIcon
  settingsIcon: {
    marginRight: 10,
  },
  logoutButtonContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginTop: 'auto',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#45B5A9',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: '#45B5A9',
    fontFamily: 'CeraRoundProBold',
    fontSize: 16,
  },
  actionRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  updateText: {
    color: '#45B5A9',
    fontSize: 16,
    marginLeft: 5,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'CeraRoundProBold',
    fontSize: 18,
    color: '#45B5A9',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  infoTextColumn: {
    marginLeft: 10,
  },
  infoLabel: {
    fontFamily: 'CeraRoundProMedium',
    fontSize: 14,
    color: '#333',
  },
  infoValue: {
    fontFamily: 'CeraRoundProBlack',
    fontSize: 18,
    color: '#000',
  },
});

export default MiPerfil;

