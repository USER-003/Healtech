import React, { useState, useEffect, useContext, useRef } from "react";
import { View, Text, StyleSheet, FlatList, Switch, Platform, Modal, Pressable, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Menu, Provider } from 'react-native-paper';
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import ProtectedRoute from "../Componentes/ProtectedRoute";
import * as Notifications from 'expo-notifications';
import searchPatientByCode from "../../../../src/queryfb/paciente/searchPatientByCode";
import DataContext from "../doctor/DataContext";
import { addHours, addDays, format, parse, isToday, compareAsc, isBefore, parseISO, compareDesc } from "date-fns";
import { getDatabase, ref, update } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import getUserUID from "../../../../src/queryfb/general/getUserUID";


// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
  }),
});

const CentroRecor = () => {
  const { dui } = useContext(DataContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [nextReminder, setNextReminder] = useState(null);
  const [userDui, setUserDui] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  const notificationLock = useRef({});

  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
    CeraRoundProBold: require("../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProMedium: require("../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  //Id de usuario
  const userUID = getUserUID();

  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplashScreen();
  }, [fontsLoaded]);

  useEffect(() => {
    const createNotificationChannel = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminder-channel', {
          name: 'Recordatorios',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          enableVibrate: true,
        });
      }
    };

    createNotificationChannel();
  }, []);

  useEffect(() => {
    const createNotificationCategory = async () => {
      await Notifications.setNotificationCategoryAsync('medication-reminder', [
        { identifier: 'TAKEN', buttonTitle: 'Tomado', options: { opensAppToForeground: false } },
        { identifier: 'SNOOZE', buttonTitle: 'Posponer', options: { opensAppToForeground: false } }
      ]);
    };

    createNotificationCategory();
  }, []);

  const calculateNextTimeFromNow = (frecuencia, tiempo, activacionInicial) => {
    const now = activacionInicial || new Date();

    if (tiempo === "Horas") {
      const nextTime = addHours(now, frecuencia);
      return format(nextTime, 'hh:mm a');
    } else if (tiempo === "Días") {
      const nextTime = addDays(now, frecuencia);
      return format(nextTime, 'dd/MM/yyyy hh:mm a');
    }

    return "Tiempo no válido";
  };

  const transformRecetasData = (recetasData, activacionInicial) => {
    return Object.keys(recetasData).flatMap((recetaId) => {
      const receta = recetasData[recetaId];
      return Object.keys(receta.medicamentos || {}).map((medKey) => {

        const medicamento = receta.medicamentos[medKey];

        const frecuencia = medicamento.frecuencia_administracion.cada;
        const tiempo = medicamento.frecuencia_administracion.tiempo;

        return {
          id: recetaId,
          Medicamentoid: medicamento.medicamentoId,
          medicationKey: medKey,
          time: calculateNextTimeFromNow(frecuencia, tiempo, activacionInicial),
          medication: medicamento.nombre_medicamento,
          frequency: `Cada ${frecuencia} ${tiempo}`,
          fecha_emision: receta.fecha_emision,
          enabled: false,
          notificationId: null
        };
      });
    });
  };

  const parseTimeToday = (timeString) => {
    return parse(timeString, 'hh:mm a', new Date());
  };

  const findNextReminder = (reminders) => {
    const enabledReminders = reminders.filter((reminder) => reminder.enabled);
    if (enabledReminders.length === 0) {
      return null;
    }

    const now = new Date();

    const remindersWithFullDate = enabledReminders.map((reminder) => {
      if (reminder.time.includes("/")) {
        // Tiene fecha completa
        return { ...reminder, parsedTime: parseISO(reminder.time) };
      } else {
        // Solo tiene hora, entonces es para hoy
        return { ...reminder, parsedTime: parseTimeToday(reminder.time) };
      }
    });

    // Ordenar recordatorios por fecha y hora más cercana
    const sortedReminders = remindersWithFullDate.sort((a, b) =>
      compareAsc(a.parsedTime, b.parsedTime)
    );

    // Encontrar el primer recordatorio que esté en el futuro o ocurriendo ahora
    const nextReminder = sortedReminders.find(reminder =>
      isBefore(now, reminder.parsedTime) || now.getTime() === reminder.parsedTime.getTime()
    );

    return nextReminder || sortedReminders[0];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setReminders((prevReminders) =>
        prevReminders.map((reminder) => {
          if (!reminder.enabled) {
            return {
              ...reminder,
              time: calculateNextTimeFromNow(
                parseInt(reminder.frequency.split(' ')[1]),
                reminder.frequency.split(' ')[2],
                new Date()
              ),
            };
          }
          return reminder;
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const next = findNextReminder(reminders);
    setNextReminder(next);
  }, [reminders]);

  useEffect(() => {
    if (reminders.length > 0) {
      const next = findNextReminder(reminders);
      setNextReminder(next);
    }
  }, [reminders]);

  const handleSearchPatient = async () => {
    try {
      const data = await searchPatientByCode("DUI", dui);
      console.log("DUI CentroRecor: " + dui);
      console.log("Resultado de búsqueda del paciente:", data);

      if (data && data.Recetas) {
        setUserDui(dui);
        const activacionInicial = new Date();
        loadRemindersFromFirebase(data.Recetas, activacionInicial);
      } else {
        console.log("No se encontró información de este paciente.");
      }
    } catch (error) {
      console.error("Error al buscar el paciente:", error);
    }
  };







  const loadRemindersFromFirebase = async (recetasData, activacionInicial) => {
    try {
      const transformedReminders = transformRecetasData(recetasData, activacionInicial);
      setReminders(transformedReminders);
    } catch (error) {
      console.error("Error al cargar datos desde Firebase:", error);
    }
  };

  useEffect(() => {
    handleSearchPatient();
  }, []);


  // useFocusEffect(
  //   React.useCallback(() => {
  //     handleSearchPatient();  // Recargar la vista
  //   }, [])
  // );

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Se requieren permisos de notificaciones');
      }
    };

    requestPermissions();

    reminders.forEach((reminder) => {
      if (reminder.enabled) {
        scheduleNotification(reminder);
      }
    });
  }, [reminders]);

  const scheduleNotification = async (reminder) => {


    if (reminder.notificationId && notificationLock.current[reminder.Medicamentoid]) {

    } //Te falta arreglar esto ya que hay notificaciones que se guardan con un id null
    if (reminder.notificationId || notificationLock.current[reminder.Medicamentoid]) {
      console.log(`Ya hay una notificación programada para este recordatorio: ${reminder.notificationId}`);
      console.log(`Ya hay una notificación programada para este recordatorio: ${reminder.Medicamentoid}`);
      console.log("      ")

      return;
    }

    notificationLock.current[reminder.Medicamentoid] = true;

    const now = new Date();
    const targetTime = new Date(reminder.time);

    const triggerInSeconds = 5;


    if (triggerInSeconds > 0) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Recordatorio de Medicamento",
          body: `Es hora de tomar ${reminder.medication}`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'medication-reminder',
        },
        trigger: { seconds: triggerInSeconds },
        channelId: 'reminder-channel',
      });

      // Solo actualizar el estado de recordatorio si `notificationId` no es nulo
      if (notificationId) {
        setReminders((prevReminders) =>
          prevReminders.map((r) =>
            r.Medicamentoid === reminder.Medicamentoid ? { ...r, notificationId } : r
          )
        );
      } else {
        console.log("Error: El `notificationId` es nulo y no se guardará en el estado.");
      }
    } else {
      console.log("El tiempo del recordatorio ya pasó o está ocurriendo ahora mismo");
    }

    notificationLock.current[reminder.Medicamentoid] = false;
  };

  const cancelNotification = async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Notificación cancelada con éxito: ${notificationId}`);
    } catch (error) {
      console.error("Error al cancelar la notificación:", error);
    }
  };

  const rescheduleNotification = async (reminder) => {
    const snoozeTimeInSeconds = 5;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Recordatorio de Medicamento",
        body: `Es hora de tomar ${reminder.medication}`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: 'medication-reminder',
      },
      trigger: { seconds: snoozeTimeInSeconds },
      channelId: 'reminder-channel',
    });

    console.log(`Notificación pospuesta por 5 minutos: ${notificationId}`);

    setReminders((prevReminders) =>
      prevReminders.map((r) =>
        r.id === reminder.id ? { ...r, notificationId } : r
      )
    );
  };

  useEffect(() => {
    const listener = Notifications.addNotificationResponseReceivedListener(async response => {
      const notificationId = response.notification.request.identifier;
      const action = response.actionIdentifier;
      const currentTime = new Date();

      const relatedReminder = reminders.find(reminder => reminder.notificationId === notificationId);
      if (relatedReminder) {
        if (action === 'TAKEN') {
          await saveReminderAction(relatedReminder, "Tomado", currentTime);
          await Notifications.dismissNotificationAsync(notificationId);
        } else if (action === 'SNOOZE') {
          await rescheduleNotification(relatedReminder);
          await saveReminderAction(relatedReminder, "Pospuesto", currentTime);
          await Notifications.dismissNotificationAsync(notificationId);
        }
      }
    });

    return () => {
      listener.remove();
    };
  }, [reminders]);

  const saveReminderAction = async (reminder, action, currentTime) => {
    const timestamp = currentTime.getTime();

    const reminderNodePath = `/paciente/${userUID}/Recetas/${reminder.id}/medicamentos/${reminder.medicationKey}/recordatorios/${timestamp}`;

    const newReminderData = {
      accion: action,
      fecha: currentTime.toISOString(),
    };

    try {
      const db = getDatabase();
      const updates = {};
      updates[reminderNodePath] = newReminderData;
      await update(ref(db), updates);
      console.log(`Acción ${action} guardada exitosamente para el medicamento ${reminder.medication}`);
    } catch (error) {
      console.error("Error al guardar el recordatorio en la base de datos:", error);
    }
  };

  const sortReminders = (order) => {
    setReminders((prevReminders) => {
      const sortedReminders = [...prevReminders].sort((a, b) => {
        const dateA = new Date(a.fecha_emision.split("/").reverse().join("-"));
        const dateB = new Date(b.fecha_emision.split("/").reverse().join("-"));
        return order === "recent" ? compareDesc(dateA, dateB) : compareAsc(dateA, dateB);
      });
      return sortedReminders;
    });
  };



  // Función para cargar estadoSwitch desde AsyncStorage al iniciar la vista
  // Cargar estadoSwitch desde AsyncStorage al iniciar la vista
  // Función para cargar estados de los switches
  const loadSwitchState = async () => {
    try {
      const updatedReminders = await Promise.all(
        reminders.map(async (reminder) => {
          const storedValue = await AsyncStorage.getItem(
            `estadoSwitch_${reminder.Medicamentoid}_${reminder.medicationKey}`
          );
          const enabled = storedValue ? JSON.parse(storedValue) : reminder.enabled;
          return { ...reminder, enabled };
        })
      );

      // Actualizar el estado solo si hay cambios
      if (JSON.stringify(updatedReminders) !== JSON.stringify(reminders)) {
        setReminders(updatedReminders);
      }
    } catch (error) {
      console.error("Error al cargar estadoSwitch de AsyncStorage:", error);
    }
  };

  // Llama a `loadSwitchState` cada vez que se navega a esta vista
  useFocusEffect(
    React.useCallback(() => {
      loadSwitchState();
    }, [reminders.length]) // Recargar siempre que haya recordatorios disponibles
  );






  // useEffect(() => {
  //   const loadSwitchState = async () => {
  //     try {
  //       const updatedReminders = await Promise.all(
  //         reminders.map(async (reminder) => {
  //           console.log("Med ID (medicamento) CentroRecor al iniciar " + reminder.Medicamentoid);
  //           console.log("Med Name CentroRecor al iniciar: " + reminder.medicationKey);

  //           // Intentamos cargar el estado guardado en AsyncStorage para el switch actual
  //           const storedValue = await AsyncStorage.getItem(`estadoSwitch_${reminder.Medicamentoid}_${reminder.medicationKey}`);
  //           const enabled = storedValue ? JSON.parse(storedValue) : reminder.enabled;
  //           console.log("El storedValue de CentroRecor es: " + storedValue);

  //           // Retornamos el recordatorio actualizado con el estado correcto
  //           return {
  //             ...reminder,
  //             enabled,
  //           };
  //         })
  //       );

  //       // Si `updatedReminders` es diferente de `reminders`, se actualiza el estado
  //       if (JSON.stringify(updatedReminders) !== JSON.stringify(reminders)) {
  //         setReminders(updatedReminders);
  //       }
  //     } catch (error) {
  //       console.error("Error al cargar estadoSwitch de AsyncStorage:", error);
  //     }
  //   };

  //   if (reminders.length > 0) {
  //     loadSwitchState();
  //   }
  // }, [reminders.length]);









  const toggleSwitch = async (medicationKey, Medicamentoid) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder) => {
        if (reminder.medicationKey === medicationKey && reminder.Medicamentoid === Medicamentoid) {
          const updatedReminder = {
            ...reminder,
            enabled: !reminder.enabled,
          };

          if (updatedReminder.enabled) {
            console.log("Med Nombre CentroRecor en switch: " + reminder.medicationKey);
            console.log("Med ID CentroRecor en switch: " + Medicamentoid);

            Alert.alert("Recordatorio activado", `El recordatorio de ${updatedReminder.medication} ha sido activado.`);

            // Almacena el estado activado (true) en AsyncStorage y muestra el valor guardado en el log
            AsyncStorage.setItem(
              `estadoSwitch_${reminder.Medicamentoid}_${reminder.medicationKey}`,
              JSON.stringify(updatedReminder.enabled)
            ).then(async () => {
              const savedValue = await AsyncStorage.getItem(`estadoSwitch_${reminder.Medicamentoid}_${reminder.medicationKey}`);
              console.log(`Valor guardado en AsyncStorage para ${reminder.Medicamentoid} - ${reminder.medicationKey}: ${savedValue}`);
            });

            if (!updatedReminder.notificationId) {
              scheduleNotification(updatedReminder);
            }
          } else {
            // Desactivar el recordatorio, cancelar notificación y guardar el estado desactivado (false) en AsyncStorage
            if (updatedReminder.notificationId) {
              cancelNotification(updatedReminder.notificationId);
              updatedReminder.notificationId = null;
            }

            // Almacena el estado desactivado (false) en AsyncStorage y muestra el valor guardado en el log
            AsyncStorage.setItem(
              `estadoSwitch_${reminder.Medicamentoid}_${reminder.medicationKey}`,
              JSON.stringify(updatedReminder.enabled)
            ).then(async () => {
              const savedValue = await AsyncStorage.getItem(`estadoSwitch_${reminder.Medicamentoid}_${reminder.medicationKey}`);
              console.log(`Valor guardado en AsyncStorage para ${reminder.Medicamentoid} - ${reminder.medicationKey}: ${savedValue}`);
            });
          }

          return updatedReminder;
        }
        return reminder;
      })
    );
  };








  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const openModal = (reminder) => {
    setSelectedReminder(reminder);
    setModalVisible(true);
  };

  const renderReminder = ({ item }) => {
    return (
      <Pressable onPress={() => openModal(item)}>
        <View style={styles.reminderContainer}>
          <View style={styles.reminderText}>
            <Text style={styles.reminderTime}>{item.time}</Text>
            <Text style={styles.reminderMedication}>{item.medication}</Text>
          </View>
          <Text style={styles.reminderFrequency}>{item.frequency}</Text>
          <Switch
            value={item.enabled}
            onValueChange={() => toggleSwitch(item.medicationKey, item.Medicamentoid)}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <ProtectedRoute allowedRoles={"paciente"}>
      <Provider>
        <View style={styles.container}>
          <Text style={styles.title}>Próximo Recordatorio</Text>
          {nextReminder ? (
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{nextReminder.time}</Text>
            </View>
          ) : (
            <Text>No hay recordatorios activos</Text>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Recordatorios</Text>
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <Pressable onPress={openMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <FontAwesome
                    name="ellipsis-v"
                    size={20}
                    color="black"
                    style={styles.optionsIcon}
                  />
                </Pressable>


              }
            >
              <Menu.Item onPress={() => { sortReminders("recent"); closeMenu(); }} title="Más recientes" />
              <Menu.Item onPress={() => { sortReminders("oldest"); closeMenu(); }} title="Más antiguos" />
            </Menu>
          </View>

          <FlatList
            data={reminders}
            renderItem={renderReminder}
            keyExtractor={item => item.Medicamentoid}
            style={styles.reminderList}
            contentContainerStyle={{ paddingBottom: 50 }}
          />

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalView}>
                {selectedReminder && (
                  <>
                    <Text style={styles.modalTitle}>RECORDATORIO</Text>
                    <View style={styles.separator} />
                    <Text style={styles.modalText}>Medicamento</Text>
                    <Text style={styles.modalData}>{selectedReminder.medication}</Text>
                    <Text style={styles.modalText}>Horario</Text>
                    <Text style={styles.modalData}>
                      {`Tomar una píldora cada ${selectedReminder.frequency}`}
                    </Text>
                    <Text style={styles.modalText}>Centro de salud</Text>
                    <Text style={styles.modalData}>{selectedReminder.healthCenter || 'N/A'}</Text>
                    <Pressable
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>Cerrar Modal</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          </Modal>

        </View>
      </Provider>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontFamily: 'CeraRoundProBold',
    fontSize: 27,
    color: '#45B5A9',
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  time: {
    fontFamily: 'CeraRoundProBold',
    fontSize: 50,
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
    paddingHorizontal: 2,
  },
  footerText: {
    fontFamily: 'CeraRoundProBold',
    fontSize: 16,
    color: '#45B5A9',
  },
  optionsIcon: {
    alignSelf: 'flex-end',
  },
  reminderList: {
    marginTop: 20,
    width: '100%',
  },
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 10,
    borderRadius: 5,
    marginBottom: 13,
  },
  reminderText: {
    flex: 2,
  },
  reminderTime: {
    fontFamily: 'CeraRoundProBold',
    fontSize: 16,
    color: '#000',
  },
  reminderMedication: {
    fontFamily: 'CeraRoundProRegular',
    fontSize: 14,
    color: '#000',
  },
  reminderFrequency: {
    textAlign: 'center',
    fontFamily: 'CeraRoundProRegular',
    color: '#666666',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: 'CeraRoundProBold',
    fontSize: 22,
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontFamily: 'CeraRoundProRegular',
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
    marginVertical: 10,
  },
  modalData: {
    fontFamily: 'CeraRoundProBold',
    fontSize: 18,
    color: '#000',
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#37817A',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 20,
  },
  closeButtonText: {
    fontFamily: 'CeraRoundProBold',
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  separator: {
    height: 1.8,
    borderRadius: 12,
    backgroundColor: '#D9D9D9',
    marginBottom: 15,
    marginTop: 8,
  },
});

export default CentroRecor;
