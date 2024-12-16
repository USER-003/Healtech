import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { ref, set, remove, onValue } from "firebase/database";
import { db } from "../../../../src/config/fb.js";
import getUserUID from "../../../../src/queryfb/general/getUserUID";


const Keys = () => {
  const router = useRouter();
  const [keys, setKeys] = useState(['', '', '', '']);
  const [codeGenerated, setCodeGenerated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Tiempo en segundos
  const [timerCountdown, setTimerCountdown] = useState('');
  const [isCodeExpiredModalVisible, setIsCodeExpiredModalVisible] = useState(false);

  // Valor compartido para la escala de la animación
  const scaleValue = useSharedValue(0);

  //Id de usuario
  const userUID = getUserUID();


  // Estilo animado
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  // Efecto para controlar la animación al mostrar/ocultar la modal
  useEffect(() => {
    if (isCodeExpiredModalVisible) {
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
  }, [isCodeExpiredModalVisible]);


  //Detecta cambios en el nodo de codigo
  useEffect(() => {
    if (userUID) {
      const codeRef = ref(db, `paciente/${userUID}/codigo`);
      
      // Detectar cambios en el nodo
      const unsubscribe = onValue(codeRef, (snapshot) => {
        if (!snapshot.exists()) {
          // El nodo fue eliminado
          console.log("El nodo 'codigo' fue eliminado.");
          
          // Ejecutar evento cuando se elimine el nodo
          setTimeLeft(0); // Simula el tiempo restante en 0
          setCodeGenerated(false); // Reinicia el estado del código generado
          setKeys(['', '', '', '']); // Limpia las llaves
          setIsCodeExpiredModalVisible(true); // Muestra el modal de código expirado
        }
      });
  
      // Limpia el listener cuando el componente se desmonte o cambie el UID
      return () => unsubscribe();
    }
  }, [userUID]);

  const handleCopy = async () => {
    try {
      const code = keys.join('');
      await Clipboard.setStringAsync(code);
      Alert.alert('Copiar', `Código copiado al portapapeles`);
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al copiar el código al portapapeles.');
      console.error('Error al copiar al portapapeles:', error);
    }
  };


  //Funcion para generar el codigo de acceso
  const generateAccessCode = async (uid) => {
    
    try {
      const newCode = Math.floor(1000 + Math.random() * 9000);
      const codeArray = newCode.toString().split('').map(String);
      console.log("codeArray: "+ codeArray)
      setKeys(codeArray);
      setCodeGenerated(true);
      setTimeLeft(599); // 10 minutos en segundos

      const codeRef = ref(db, `paciente/${uid}/codigo`);
  
      // Crea el nodo con el código
      await set(codeRef, {
        valor: newCode,
        timestamp: Date.now(),
      });
  
      console.log(`Código generado para el paciente ${uid}: ${newCode}`);
  
      // Programar la eliminación automática después de 10 minutos
      setTimeout(async () => {
        try {
          await remove(codeRef);
          console.log(`Código temporal para el paciente ${uid} eliminado automáticamente.`);
        } catch (error) {
          console.error(`Error al eliminar el código para el paciente ${uid}:`, error);
        }
      }, 10 * 60 * 1000); // 10 minutos
  
    } catch (error) {
      console.error("Error al generar el código temporal:", error);
      throw error;
    }
  };


  const handleGenerateCode = () => {
    generateAccessCode(userUID)
  };

  useEffect(() => {
    let timerInterval = null;

    if (timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && codeGenerated) {
      // El tiempo ha expirado, mostrar la modal animada
      setIsCodeExpiredModalVisible(true);
      // Reiniciar el estado después de mostrar la modal
      setCodeGenerated(false);
      setKeys(['', '', '', '']);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timeLeft, codeGenerated]);

  useEffect(() => {
    if (timeLeft >= 0) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      setTimerCountdown(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }
  }, [timeLeft]);

  return (
    <View style={styles.wrapper}>
      

      {/* Contenido principal */}
      <View style={styles.container}>
        <Text style={styles.title}>Llaves de Acceso</Text>

        {/* Sección de información */}
        <View style={styles.infoBox}>
          <MaterialIcons name="warning" size={30} color="#45B5A9" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            La Llave de Acceso es un código único y temporal diseñado para proteger tu información médica. Este código permite que el administrador o médico autorizado acceda y modifique información importante y delicada relacionada contigo, como tus expedientes médicos o tratamientos.
          </Text>
        </View>

        <Text style={styles.subtitle}>Comienza a Usar las Llaves de Acceso</Text>

        {/* Botón de generar código */}
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerateCode}>
          <Text style={styles.generateButtonText}>
            {codeGenerated ? 'Generar código de nuevo' : 'Generar código'}
          </Text>
        </TouchableOpacity>

        {/* Mostrar solo si el código ha sido generado */}
        {codeGenerated && (
          <>
            {/* Campos de clave y botón copiar */}
            <View style={styles.keyContainer}>
              {keys.map((key, index) => (
                <TextInput
                  key={index}
                  style={styles.keyInput}
                  value={key}
                  maxLength={1}
                  editable={false} // Hace que los campos sean de solo lectura
                />
              ))}
              <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
                <MaterialIcons name="content-copy" size={20} color="#45B5A9" style={styles.copyIcon} />
                <Text style={styles.copyButtonText}>Copiar</Text>
              </TouchableOpacity>
            </View>

            {/* Temporizador */}
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>
                La Llave de Acceso estará activa durante 10 minutos. Una vez expirado este tiempo, deberá generarse un nuevo código si es necesario.
              </Text>
              <Text style={styles.timerCountdown}>{timerCountdown}</Text>
            </View>
          </>
        )}

        {/* Modal de código expirado */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isCodeExpiredModalVisible}
          onRequestClose={() => {
            setIsCodeExpiredModalVisible(false);
          }}
        >
          <View style={styles.modalBackground}>
            <Animated.View style={[styles.modalView, animatedStyle]}>
              <Text style={styles.modalTitle}>El código ha caducado</Text>
              <Text style={styles.modalMessage}>Por favor, genera uno nuevo si es necesario.</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    setIsCodeExpiredModalVisible(false);
                  }}
                >
                  <Text style={styles.confirmButtonText}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
 
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'flex-start', // Alinea los elementos a la izquierda
  },
  title: {
    paddingTop:70,
    fontSize: 24,
    fontFamily: 'CeraRoundProBlack',
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'column', // Cambiado a columna para centrar el icono y el texto
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center', 
  alignSelf: 'center', 
    
  },
  infoIcon: {
    marginBottom: 10, // Añade espacio debajo del icono
    alignItems: 'center', 
  },
  infoText: {
    
    fontFamily: 'CeraRoundProRegular',
    fontSize: 14,
    color: '#333',
    textAlign: 'center', // Centra el texto
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'CeraRoundProBlack',
    marginBottom: 25,
  },
  generateButton: {
    backgroundColor: '#45B5A9',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 30,
    alignSelf: 'flex-start', // Alinea el botón a la izquierda
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'CeraRoundProBlack',
  },
  keyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  keyInput: {
    width: 45,
    height: 45,
    marginHorizontal: 5,
    backgroundColor: '#CCCCCC',
    textAlign: 'center',
    borderRadius: 5,
    fontSize: 16,
    fontFamily: 'CeraRoundProRegular',
    color: 'black', // Color del texto negro
    padding: 5,     // Añadido padding para mayor espacio interno
  },
  copyButton: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyIcon: {
    marginRight: 5,
  },
  copyButtonText: {
    color: '#45B5A9',
    fontSize: 16,
    fontFamily: 'CeraRoundProBlack',
  },
  timerBox: {
    flexDirection: 'row', // Organiza el contenido horizontalmente
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between', // Espacia el texto y el temporizador
    width: '100%',
    marginBottom: 20, // Añadido margen inferior
  },
  timerText: {
    fontFamily: 'CeraRoundProRegular',
    fontSize: 14,
    color: '#333',
    paddingRight:20,
    flex: 1, // Ocupa el espacio disponible
    textAlign: 'left'
  },
  timerCountdown: {
    width: 60, // Establece un ancho fijo para evitar que el diseño cambie
    alignItems: 'flex-end',
    fontSize: 24,
    fontFamily: 'CeraRoundProBlack',
    color: '#333',
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
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
  },
  modalMessage: {
    fontFamily: 'CeraRoundProRegular',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#45B5A9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontFamily: 'CeraRoundProBold',
    fontSize: 16,
  },
});

export default Keys;



