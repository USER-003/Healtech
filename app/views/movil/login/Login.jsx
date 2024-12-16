import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  ActivityIndicator,
  View,
  Image,
  StyleSheet,
} from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import LoginForm from "../Componentes/LoginForm";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import { auth, signInWithEmailAndPassword } from "../../../../src/config/fb";
import searchRole from "../../../../src/queryfb/general/searchRole";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DataContext from "../doctor/DataContext";
import searchPatientByUid from "../../../../src/queryfb/paciente/searchPatientByUid";
import searchDoctorByUid from "../../../../src/queryfb/doctor/searchNodeByUid";

import ProtectedRoute from "../Componentes/ProtectedRoute";

const LoginPaMedi = () => {
  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
    CeraRoundProBold: require("../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProMedium: require("../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  const [emailError, setEmailError] = useState(false);
  const [emailErrorFormat, setEmailErrorFormat] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorWrong, setpasswordErrorWrong] = useState(false);
  const [userNotRegisteredError, setUserNotRegisteredError] = useState(false);
  const [generalError, setGeneralError] = useState(false);
  const [adminRoleError, setAdminRoleError] = useState(false);
  const [tooManyRequestsError, setTooManyRequestsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplashScreen();
  }, [fontsLoaded]);

  const { setDui } = useContext(DataContext);

  // Expresión regular para validar el formato de correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const resetErrors = () => {
    setEmailError(false);
    setEmailErrorFormat(false);
    setPasswordError(false);
    setpasswordErrorWrong(false);
    setUserNotRegisteredError(false);
    setGeneralError(false);
    setAdminRoleError(false);
    setTooManyRequestsError(false);
  };

  const handleLogin = async (email, password) => {
    resetErrors();

    // Verifica que los campos no estén vacíos
    if (!email.trim()) {
      setEmailError(true);
      return;
    }
    if (!password.trim()) {
      setPasswordError(true);
      return;
    }

    // Verifica el formato del correo
    if (!emailRegex.test(email)) {
      setEmailErrorFormat(true);
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      // Guardar la marca de tiempo de inicio de sesión
      const loginTime = Date.now(); // Hora actual en milisegundos
      await AsyncStorage.setItem("loginTimeP", JSON.stringify(loginTime)); // Guardar en AsyncStorage

      // Usa la función searchRole para obtener el rol del usuario
      const role = await searchRole(user.uid);

      // Redirige según el rol del usuario
      if (role == "admin") {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "¡Oops!",
          textBody:
            "Eres admin. Por favor inicia sesión con tu cuenta en la web. Healtech.com",
          button: "Cerrar",
          onPressButton: () => Dialog.hide(),
        });
      } else if (role == "doctor") {
        const doctorData = await searchDoctorByUid(user.uid); // Buscar datos del doctor por UID
        if (doctorData) {
          setDui(doctorData.dui); // Guarda el DUI del doctor en el contexto
          setTimeout(() => {
            router.navigate("/views/movil/doctor/HomeDoc");
          }, 500);
        }
      } else if (role == "paciente") {
        const patientData = await searchPatientByUid(user.uid); // Buscar datos del paciente por UID
        if (patientData) {
          setDui(patientData.identificacion);
          setTimeout(() => {
            router.navigate("/views/movil/paciente/HomePa");
          }, 500);
          // Guarda el DUI del paciente en el contexto
          // Redirige al paciente
        }
      } else if (role == "colaboradores") {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "¡Oops!",
          textBody:
            "Eres colaborador. Por favor inicia sesión con tu cuenta en la web. Healtech.com",
          button: "Cerrar",
          onPressButton: () => Dialog.hide(),
        });
      } else {
        //Alerta de rol no reconocido
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "¡Oops!",
          textBody:
            "Parece que no tienes un rol asignado! Contacta con tu administrador o ve a la clínica más cercana.",
          button: "Ok",
          onPressButton: () => Dialog.hide(),
        });
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      if (error.code === "auth/user-not-found") {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "¡Oops!",
          textBody:
            "Parece que no tienes una cuenta registrada con este correo.",
          button: "Cerrar",
          onPressButton: () => Dialog.hide(),
        });
      } else if (error.code === "auth/wrong-password") {
        setpasswordErrorWrong(true);
      } else if (error.code === "auth/too-many-requests") {
        setTooManyRequestsError(true);
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "¡Demasiados intentos fallidos!",
          textBody:
            "Tu cuenta ha sido deshabilitada temporalmente debido a múltiples intentos fallidos. Puedes restaurarla restableciendo tu contraseña o intenta nuevamente más tarde.",
          button: "Cerrar",
          onPressButton: () => Dialog.hide(),
        });
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "¡Oops!",
          textBody: "Ocurrió un error al tratar de iniciar sesión.",
          button: "Cerrar",
          onPressButton: () => Dialog.hide(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <Image
          source={require("../../../../assets/LoginImg.png")}
          style={styles.image}
        />
        <Modal transparent={true} visible={loading}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#37817A" />
          </View>
        </Modal>
        <LoginForm
          onLogin={handleLogin}
          emailError={emailError}
          emailErrorFormat={emailErrorFormat}
          passwordError={passwordError}
          passwordErrorWrong={passwordErrorWrong}
          resetErrors={resetErrors} // Pasa resetErrors como prop
        />
      </View>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 95,
  },
  image: {
    width: 400,
    height: 200,
    resizeMode: "contain",
    marginBottom: -5,
  },
});

export default LoginPaMedi;
