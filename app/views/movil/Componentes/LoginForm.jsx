import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import ProtectedRoute from "./ProtectedRoute";
import { useRouter } from "expo-router"; // Importa useRouter de expo-router



const LoginForm = ({
  onLogin,
  emailError,
  emailErrorFormat,
  passwordError,
  passwordErrorWrong,
  resetErrors, // Recibe resetErrors como prop
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordLengthError, setPasswordLengthError] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // Nuevo estado para controlar la visibilidad de la contraseña
  const router = useRouter(); // Hook para navegar en Expo Router

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

  const handleLogin = () => {
    setPasswordLengthError(false);

    if (password.length < 6) {
      setPasswordLengthError(true);
      return;
    }

    if (onLogin) {
      onLogin(username, password);
    }
  };

  const handleForgotPassword = () => {
    router.push('/views/movil/Recovery/Paso1'); // Usa la ruta correcta ahora que la carpeta es 'Recovery'
  };
  

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          emailFocused && styles.inputContainerFocused,
          (emailError || emailErrorFormat) && styles.inputContainerError,
        ]}
      >
        <FontAwesome
          name="envelope"
          size={14}
          color={
            emailError || emailErrorFormat
              ? "red"
              : emailFocused
                ? "#37817A"
                : "#ccc"
          }
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, emailFocused && styles.inputFocused]}
          placeholder="correo@example.com"
          value={username}
          onChangeText={(text) => {
            setUsername(text.replace(/\s/g, "")); // Elimina espacios
            resetErrors(); // Restablece errores
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
      </View>
      {(emailError || emailErrorFormat) && (
        <Text style={[styles.errorText, { color: "red" }]}>
          {emailError
            ? "El campo correo es obligatorio."
            : "El formato del correo es inválido."}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          passwordFocused && styles.inputContainerFocused,
          (passwordError ||
            passwordErrorWrong ||
            passwordLengthError) &&
          styles.inputContainerError,
        ]}
      >
        <FontAwesome
          name="lock"
          size={19}
          color={
            passwordError || passwordErrorWrong || passwordLengthError
              ? "red"
              : passwordFocused
                ? "#37817A"
                : "#ccc"
          }
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, passwordFocused && styles.inputFocused]}
          placeholder="contraseña"
          value={password}
          onChangeText={(text) => {
            setPassword(text.replace(/\s/g, "")); // Elimina espacios
            resetErrors(); // Restablece errores
          }}
          secureTextEntry={!passwordVisible} // Muestra u oculta la contraseña
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <FontAwesome
            name={passwordVisible ? "eye" : "eye-slash"}
            size={19}
            color="#ccc"
          />
        </TouchableOpacity>
      </View>
      {(passwordError || passwordErrorWrong || passwordLengthError) && (
        <Text style={[styles.errorText, { color: "red" }]}>
          {passwordError
            ? "El campo contraseña es obligatorio."
            : passwordErrorWrong
              ? "La Contraseña es Incorrecta."
              : "La contraseña debe tener al menos 6 caracteres."}
        </Text>
      )}

      
<TouchableOpacity onPress={handleForgotPassword}> 
        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>



      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>¿No tienes cuenta?</Text>
        <TouchableOpacity>
          <Text style={styles.registerLink}>
            Visita tu centro de salud más cercano.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginTop: 50,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 2,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  inputContainerFocused: {
    borderColor: "#37817A",
  },
  inputContainerError: {
    borderColor: "red",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    fontFamily: "CeraRoundProRegular",
  },
  inputFocused: {
    fontFamily: "CeraRoundProMedium",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "CeraRoundProRegular",
    marginBottom: 5,
  },
  forgotPasswordText: {
    color: "#45B5A9",
    fontFamily: "CeraRoundProMedium",
    fontSize: 14,
    textAlign: "right",
    marginBottom: 35,
  },
  button: {
    backgroundColor: "#37817A",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    height: 45,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "CeraRoundProBlack",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 98,
  },
  registerText: {
    fontSize: 12,
    fontFamily: "CeraRoundProMedium",
    color: "#000",
  },
  registerLink: {
    fontSize: 12,
    fontFamily: "CeraRoundProBlack",
    color: "#37817A",
    marginLeft: 5,
  },
});

export default LoginForm;
