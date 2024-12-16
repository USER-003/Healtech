import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Linking, Alert, Modal,TouchableOpacity  } from 'react-native';
import { Button } from 'react-native-paper';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { Pressable } from 'react-native';
import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState(''); // 'success' or 'warning'
  const auth = getAuth();
  const router = useRouter();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showModal = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
    }, 5000);
  };

  const sendPasswordReset = async () => {
    
    if (!validateEmail(email)) {
      setEmailError('Por favor, introduce un correo electrónico válido.');
    } else {
      
      try {
        setLoading(true);
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length === 0) {
          showModal("Parece que no hay una cuenta registrada con este correo. Verifica el email ingresado.", "warning");
          return;
        }
  
        await sendPasswordResetEmail(auth, email);
        showModal("Correo enviado para restablecer la contraseña. Revisa tu bandeja de entrada.", "success");
        router.push(`/views/web/Recovery/RevisarBandeja?email=${email}`);
      } catch (error) {
        console.error(error);
        showModal("Hubo un problema al enviar el correo. Verifica el email ingresado.", "warning");
        
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenEmailService = () => {
    
    Alert.alert(
      "Selecciona el servicio de correo",
      "Elige el servicio de correo al que deseas ir",
      [
        { text: "Gmail", onPress: () => Linking.openURL("https://mail.google.com") },
        { text: "Outlook", onPress: () => Linking.openURL("https://outlook.live.com") },
        { text: "Cancelar", style: "cancel" }
      ],
      { cancelable: true }
    );

    sendPasswordReset();
  };

  const handleDash = () => {
    router.navigate("/views/web/admin/DashBoard");
  };

  return (
    <LoadFonts>
      <View style={styles.container}>
        <View style={styles.iconBackground}>
        <MaterialIcons name="vpn-key" size={40} color="#45B5A9" style={styles.iconoRotado} />
        </View>
        <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
        <Text style={styles.subtitle}>
          Introduce la dirección de correo electrónico asociada a tu cuenta para enviarte un{" "}
          correo con una confirmación para restablecer tu contraseña.
        </Text>

        <Modal transparent={true} visible={loading}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#37817A" />
          </View>
        </Modal>

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          Pressable="true"
          onRequestClose={() => setModalVisible(false)}
        >
 <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible(false)} activeOpacity={1}>
            <TouchableOpacity style={[styles.modalContainer, modalType === 'success' ? styles.successBackground : styles.warningBackground]} activeOpacity={1}>
              <Text style={styles.modalText}>{modalMessage}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Correo electrónico:</Text>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            inputMode="email"
            textAlign="center"
            value={email}
            onChangeText={(text) => {
              setEmail(text.replace(/\s/g, ''));
              setEmailError('');
            }}
            autoCapitalize="none"
            onFocus={() => setEmailError('')}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <Button mode="contained" style={styles.button} onPress={handleOpenEmailService}>
          <Text style={styles.text}>RESTAURAR CONTRASEÑA</Text>
        </Button>
        
        <Pressable onPress={handleDash}>
          <Text style={styles.backText}>← Regresar al Login</Text>
        </Pressable>
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
  iconoRotado: {
    transform: [{ rotate: '-60deg' }],
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginVertical: 10, 
    fontFamily: 'CeraRoundProMedium' 
  },
  subtitle: { 
    textAlign: 'center', 
    fontSize: 14, 
    color: '#000000', 
    marginBottom: 20, 
    fontFamily: 'CeraRoundProMedium' 
  },
  inputContainer: {
    width: '50%',
    alignItems: 'flex-start', 
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'CeraRoundProMedium',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
  },
  button: { width: '50%', backgroundColor: '#37817A', borderRadius: 5 },
  backText: { marginTop: 20, color: '#000000', fontFamily: 'CeraRoundProMedium' },
  text: { fontFamily: 'CeraRoundProMedium', color: '#FFFFFF' },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    maxWidth: "80%",
  },
  successBackground: {
    backgroundColor: "#4caf50",
  },
  warningBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});

export default ForgotPasswordScreen;
