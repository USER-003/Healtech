import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { Button } from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth'; // Importar Firebase Authentication
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


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

const ResetPasswordScreen = () => {
  const router = useRouter();
  const { oobCode } = useLocalSearchParams(); // Extraer oobCode de los parámetros de la URL

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [loading, setLoading] = useState(true); // Para manejar el estado de carga al verificar el código

  useEffect(() => {
    const auth = getAuth();

    // Verificar el código OOB y obtener el email asociado
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al verificar el código:', error);
        Alert.alert('Error', 'El enlace es inválido o ha expirado.');
        setLoading(false);
        // Redirigir al usuario a otra pantalla si es necesario
        router.replace('/views/web/Recovery/Error');
      });
  }, [oobCode]);

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[@$!%*?&_+]/.test(password)
    );
  };

  const handlePasswordChange = (text) => {
    setPassword(text.replace(/\s/g, ''));
    setShowPasswordRequirements(true);
  };

  const handleChangePassword = () => {
    if (!validatePassword(password)) {
      setErrorMessage('La contraseña no cumple con los requisitos');
    } else if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
    } else {
      setErrorMessage('');
      setLoading(true);
      const auth = getAuth();

      // Confirmar el restablecimiento de contraseña
      confirmPasswordReset(auth, oobCode, password)
        .then(() => {
          setLoading(false);
          Alert.alert('Éxito', 'Tu contraseña ha sido restablecida correctamente.');
          // Navegar a la pantalla de inicio de sesión u otra pantalla
          router.replace('/views/web/Recovery/ContrasenaActualizada');
        })
        .catch((error) => {
          setLoading(false);
          console.error('Error al restablecer la contraseña:', error);
          Alert.alert('Error', 'No se pudo restablecer la contraseña. Por favor, intenta nuevamente.');
        });
    }
  };

  const handleDash = () => {
    router.replace('/views/web/admin/DashBoard');
  };

  if (loading) {
    return (
      <LoadFonts>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#37817A" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </LoadFonts>
    );
  }

  return (
    <LoadFonts>
      <View style={styles.container}>
        <View style={styles.iconBackground}>
        <MaterialIcons name="vpn-key" size={40} color="#45B5A9" style={styles.iconoRotado} />
        </View>
        <Text style={styles.title}>Ingresa tu nueva contraseña</Text>
        <Text style={styles.subtitle}>
          Tu nueva contraseña debe ser diferente a las contraseñas utilizadas anteriormente.
        </Text>

        <View
          style={[
            styles.inputContainer,
            !validatePassword(password) && password ? styles.errorBorder : {},
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <MaterialIcons
              name={passwordVisible ? 'visibility' : 'visibility-off'}
              size={24}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        {showPasswordRequirements && (
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Debe contener al menos:</Text>
            <View style={styles.requirementItem}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={password.length >= 8 ? '#37817A' : '#7A7A7A'}
                style={{ marginRight: 5 }}
              />
              <Text style={{ color: password.length >= 8 ? '#37817A' : '#7A7A7A' }}>
                8 caracteres
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={/[A-Z]/.test(password) ? '#37817A' : '#7A7A7A'}
                style={{ marginRight: 5 }}
              />
              <Text style={{ color: /[A-Z]/.test(password) ? '#37817A' : '#7A7A7A' }}>
                1 mayúscula
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={/[0-9]/.test(password) ? '#37817A' : '#7A7A7A'}
                style={{ marginRight: 5 }}
              />
              <Text style={{ color: /[0-9]/.test(password) ? '#37817A' : '#7A7A7A' }}>
                1 número
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={/[@$!%*?&_+]/.test(password) ? '#37817A' : '#7A7A7A'}
                style={{ marginRight: 5 }}
              />
              <Text
                style={{ color: /[@$!%*?&_+]/.test(password) ? '#37817A' : '#7A7A7A' }}
              >
                1 símbolo especial (@$!%*?&_+)
              </Text>
            </View>
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            confirmPassword && password !== confirmPassword ? styles.errorBorder : {},
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Confirma contraseña"
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text.replace(/\s/g, ''))}
            secureTextEntry={!confirmPasswordVisible}
          />
          <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
            <MaterialIcons
              name={confirmPasswordVisible ? 'visibility' : 'visibility-off'}
              size={24}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Button mode="contained" style={styles.button} onPress={handleChangePassword}>
          RESTAURAR CONTRASEÑA
        </Button>

        <TouchableOpacity onPress={handleDash}>
          <Text style={styles.backText}>← Regresar al Login</Text>
        </TouchableOpacity>
      </View>
    </LoadFonts>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#37817A' },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DAEFED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconoRotado: {
    transform: [{ rotate: '-60deg' }],
  },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, fontFamily: 'CeraRoundProMedium' },
  subtitle: { textAlign: 'center', marginVertical: 10, fontFamily: 'CeraRoundProMedium' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 10,
    borderRadius: 8,
    width: '80%',
  },
  input: { flex: 1, fontSize: 16, fontFamily: 'CeraRoundProMedium' },
  errorBorder: { borderColor: 'red' },
  requirementsContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '80%',
    marginTop: 0,
    marginBottom: 10,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  errorText: { color: 'red', fontSize: 14, marginTop: -10, marginBottom: 10 },
  button: { width: '80%', backgroundColor: '#37817A', borderRadius: 5 },
  backText: { marginTop: 20, color: '#000000', fontFamily: 'CeraRoundProMedium' },
});

export default ResetPasswordScreen;
