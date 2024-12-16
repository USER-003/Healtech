import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from "expo-router";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';

const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
    CeraRoundProBold: require("../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProMedium: require("../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return children;
};

const CheckInboxScreen = ({ navigation }) => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const auth = getAuth();

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

  const handleDash = () => {
    router.navigate("/views/web/admin/DashBoard");
  };

  return (
    <LoadFonts>
      <View style={styles.container}>
        <View style={styles.iconBackground}>
          <FontAwesome name="envelope" size={24} color="#37817A" style={styles.icon}/>
        </View>
        <Text style={styles.title}>Revisa tu bandeja de entrada</Text>
        <Text style={styles.subtitle}>
          Hemos enviado un link a tu correo electrónico para que puedas cambiar tu <br/> contraseña de forma
          exitosa.
        </Text>
        <Text style={styles.email}>{email || "No se proporcionó un correo electrónico."}</Text>

        <Text style={styles.resendText}>
          No recibiste tu correo de confirmación?{' '}
          {isResendEnabled ? (
            <Text style={styles.resendLink} onPress={handleResendEmail}>CLIC PARA REENVIAR</Text>
          ) : (
            <Text style={styles.disabledResendLink}>
              Espera {timer} segundos para reenviar
            </Text>
          )}
        </Text>
        
        <TouchableOpacity onPress={handleDash}>
          <Text style={styles.backText}>← Regresar al Login</Text>
        </TouchableOpacity>
      </View>
    </LoadFonts>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20 },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DAEFED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, fontFamily:'CeraRoundProMedium', },
  subtitle: { textAlign: 'center', marginVertical: 10, fontFamily:'CeraRoundProMedium', },
  email: { fontWeight: 'bold', marginVertical: 10,  fontFamily:'CeraRoundProMedium',  },
  resendText: { textAlign: 'center', fontFamily:'CeraRoundProMedium', },
  resendLink: { color: '#45B5A9', fontFamily:'CeraRoundProMedium', textDecorationLine: 'underline' },
  disabledResendLink: { color: '#aaa', fontFamily:'CeraRoundProMedium' },
  backText: { marginTop: 20, color: '#000000', fontFamily:'CeraRoundProMedium', },
});

export default CheckInboxScreen;
