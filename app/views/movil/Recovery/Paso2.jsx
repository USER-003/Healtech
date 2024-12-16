import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from "expo-font";
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const Paso2 = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams(); // Se obtiene el parámetro de email
  const auth = getAuth();

  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
    CeraRoundProBold: require("../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProMedium: require("../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  const [timer, setTimer] = useState(60); // Temporizador de 60 segundos
  const [isResendEnabled, setIsResendEnabled] = useState(false);

  useEffect(() => {
    // Inicia el temporizador y disminuye cada segundo
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResendEnabled(true); // Habilita el botón de reenvío cuando el tiempo llega a 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(interval);
  }, []);

  const handleResendEmail = () => {
    if (email) {
      sendPasswordResetEmail(auth, email);
      console.log(`Reenviando correo a: ${email}`);
      setTimer(60); // Reinicia el temporizador
      setIsResendEnabled(false); // Deshabilita el botón de nuevo
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {/* Barra de "Volver" en la parte superior */}
      <View style={styles.rectangulo}>
        <TouchableOpacity onPress={() => router.back()} style={styles.touchable}>
          <Entypo name="chevron-left" size={24} color="white" />
          <Text style={styles.textoVolver}>Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.iconBackground}>
          <MaterialIcons name="email" size={40} color="#45B5A9" />
        </View>

        <Text style={styles.title}>Revisa tu bandeja de entrada</Text>
        <Text style={styles.description}>
          Hemos enviado un link a tu correo electrónico para que puedas cambiar tu contraseña de forma exitosa.
        </Text>
        <Text style={styles.email}>{email || "No se proporcionó un correo electrónico."}</Text>

        {/* Texto de reenviar correo con temporizador */}
        <Text style={styles.resendText}>
          No recibiste confirmación?{' '}
          {isResendEnabled ? (
            <Text style={styles.linkText} onPress={handleResendEmail}>CLIC PARA REENVIAR</Text>
          ) : (
            <Text style={styles.disabledResendLink}>
              Espera {timer} segundos para reenviar
            </Text>
          )}
        </Text>

        <TouchableOpacity style={styles.backToLogin} onPress={() => router.push('/views/movil/login/Login')}>
          <Text style={styles.backToLoginText}>← Regresar al login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  rectangulo: {
    paddingTop: 20,
    width: '100%',
    height: 80,
    backgroundColor: '#2A2A2E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoVolver: {
    fontFamily: 'CeraRoundProBlack',
    fontSize: 22,
    color: 'white',
    marginLeft: 5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 400,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(69, 181, 169, 0.2)', // Fondo circular con transparencia
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'CeraRoundProBold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    fontFamily: 'CeraRoundProRegular',
    textAlign: 'center',
    color: '#7A7A7A',
    marginBottom: 10,
  },
  email: {
    fontFamily: 'CeraRoundProBlack',
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'CeraRoundProRegular',
    color: '#7A7A7A',
    textAlign: 'center',
  },
  linkText: {
    color: '#45B5A9',
    fontFamily: 'CeraRoundProBold',
    textDecorationLine: 'underline',
  },
  disabledResendLink: {
    color: '#aaa',
    fontFamily: 'CeraRoundProRegular',
  },
  backToLogin: {
    marginTop: 20,
  },
  backToLoginText: {
    fontSize: 16,
    fontFamily: 'CeraRoundProRegular',
    color: '#000',
  },
});

export default Paso2;
