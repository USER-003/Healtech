// app/views/movil/Recovery/ErrorScreen.jsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require('../../../../assets/fonts/CeraRoundProLight.otf'),
    CeraRoundProRegular: require('../../../../assets/fonts/CeraRoundProRegular.otf'),
    CeraRoundProBlack: require('../../../../assets/fonts/CeraRoundProBlack.otf'),
    CeraRoundProBold: require('../../../../assets/fonts/CeraRoundProBold.otf'),
    CeraRoundProMedium: require('../../../../assets/fonts/CeraRoundProMedium.otf'),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return children;
};

const ErrorScreen = () => {
  const router = useRouter();

  const handleBackToLogin = () => {
    // Navegar a la pantalla de inicio de sesión
    router.replace('/views/web/Recovery/OlvidasteContrasena');
  };

  return (
    <LoadFonts>
      <View style={styles.container}>
        <View style={styles.iconBackground}>
          <FontAwesome
            name="exclamation-triangle"
            size={40}
            color="#C72C41"
            style={styles.icon}
          />
        </View>
        <Text style={styles.title}>Enlace Inválido o Expirado</Text>
        <Text style={styles.subtitle}>
          El enlace que has utilizado es inválido o ha expirado. Por favor, solicita un nuevo enlace de restablecimiento de contraseña.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleBackToLogin}>
          <Text style={styles.buttonText}>Volver a enviar Correo</Text>
        </TouchableOpacity>
      </View>
    </LoadFonts>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20, justifyContent: 'center' },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FDECEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    // Estilo adicional si es necesario
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    fontFamily: 'CeraRoundProMedium',
    color: '#C72C41',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'CeraRoundProRegular',
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#37817A',
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'CeraRoundProMedium',
    fontSize: 16,
  },
});

export default ErrorScreen;
