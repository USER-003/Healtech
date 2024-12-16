import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet,Modal,ActivityIndicator,} from 'react-native';
import { AlertNotificationRoot, ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { useRouter } from 'expo-router';
import { useFonts } from "expo-font";
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Paso1 = () => {
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailError, setEmailError] = useState(''); // Estado para el mensaje de error
  const router = useRouter(); // Hook para manejar la navegación en Expo Router
  const auth = getAuth();
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
    CeraRoundProBold: require("../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProMedium: require("../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  // Función para validar si el correo tiene un formato correcto
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar correo
    return emailRegex.test(email);
  };

  const sendPasswordReset = async () => {


    if (!validateEmail(email)) {
      setEmailError('Por favor, introduce un correo electrónico válido.');
    } else {
      setLoading(true);
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length === 0) {
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: "Correo no Registrado",
            textBody: `Parece que no hay una cuenta registrada con este correo. Verifica el email ingresado.`,
            autoClose: 2000,
          });
          return;
        }

        await sendPasswordResetEmail(auth, email);
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Correo Enviado",
          textBody: `Correo enviado para restablecer la contraseña. Revisa tu bandeja de entrada.`,
          autoClose: 2000,
        });
        router.push(`/views/movil/Recovery/Paso2?email=${email}`);
      } catch (error) {
        console.error(error);
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Ocurrió un Error",
          textBody: `Hubo un problema al enviar el correo. Verifica el email ingresado.`,
          autoClose: 2000,
        });
      } finally {
        setLoading(false);
      }
    }

  };

  return (
    <AlertNotificationRoot>
      <View style={styles.wrapper}>
        {/* Barra de "Volver" en la parte superior que ocupa all el ancho */}
        <View style={styles.rectangulo}>
          <TouchableOpacity onPress={() => router.back()} style={styles.touchable}>
            <View style={styles.icono}>
              <Entypo name="chevron-left" size={24} color="white" />
            </View>
            <Text style={styles.textoVolver}>Volver</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido principal */}
        <View style={styles.container}>
          {/* Icono y título */}
          <View style={styles.header}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="vpn-key" size={40} color="#45B5A9" style={styles.iconoRotado} />
            </View>
            <Modal transparent={true} visible={loading}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#37817A" />
              </View>
            </Modal>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.description}>
              Introduce la dirección de correo electrónico asociada a tu cuenta.
            </Text>
          </View>

          {/* Campo de correo */}
          <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
            <MaterialIcons
              name="email"
              size={20}
              color={emailFocused ? '#37817A' : '#ccc'}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              placeholder="correo@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text.replace(/\s/g, ''));
                setEmailError(''); // Elimina el error al escribir
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          {/* Mensaje de error si el correo no es válido */}
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Botón de enviar correo */}
          <TouchableOpacity style={styles.button} onPress={sendPasswordReset}>
            <Text style={styles.buttonText}>Enviar Correo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
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
  icono: {
    marginRight: 5,
  },
  textoVolver: {
    fontFamily: 'CeraRoundProBlack',
    fontSize: 22,
    color: 'white',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  iconoRotado: {
    transform: [{ rotate: '-60deg' }], // Ajusta la rotación para que apunte hacia la derecha
  },
  title: {
    fontSize: 24,
    fontFamily: 'CeraRoundProBold',
    marginTop: 20,
  },
  description: {
    fontSize: 14,
    fontFamily: 'CeraRoundProRegular',
    textAlign: 'center',
    marginTop: 10,
    color: '#7A7A7A',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 2,
    paddingHorizontal: 10,
    height: 55,
    marginBottom: 20,
  },
  inputContainerFocused: {
    borderColor: '#37817A',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'CeraRoundProRegular',
  },
  inputFocused: {
    fontFamily: 'CeraRoundProMedium',
  },
  errorText: {
    color: 'red',
    fontFamily: 'CeraRoundProRegular',
    fontSize: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#37817A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    height: 45,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'CeraRoundProBlack',
  },
});

export default Paso1;
