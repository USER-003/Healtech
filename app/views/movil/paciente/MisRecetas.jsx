import React, { useEffect, useState, useContext } from "react";
import {
  ScrollView,
  Modal,
  Text,
  View,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Entypo from "react-native-vector-icons/Entypo";
import styles from "../../../../styles/styleMisrecetas";
import searchPatientByCode from "../../../../src/queryfb/paciente/searchPatientByCode";
import HTMLView from "react-native-htmlview";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { format, differenceInDays } from "date-fns";
import DataContext from "../doctor/DataContext"; // Importa el contexto
import ProtectedRoute from "../Componentes/ProtectedRoute";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";
import { getDatabase, ref, update } from "firebase/database";
import getUserUID from "../../../../src/queryfb/general/getUserUID";


const MisRecetasPaciente = () => {
  const { dui, setDui } = useContext(DataContext); // Obtiene el DUI del contexto

  console.log("DUI: " + dui);
  const usuario = dui;
  const [recetasOriginales, setRecetasOriginales] = useState([]);
  const [recetasFiltradas, setRecetasFiltradas] = useState([]);
  const [diasTranscurridos, setDiasTranscurrido] = useState([]);
  const [diasTranscurridosCalculo, setDiasTranscurridoCalculo] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedButton, setSelectedButton] = useState("todas");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedMedIndices, setExpandedMedIndices] = useState([]);
  const [countTodas, setCountTodas] = useState(0);
  const [countEnProgreso, setCountEnProgreso] = useState(0);
  const [countCompletadas, setCountCompletadas] = useState(0);
  const [buttonDisabledState, setButtonDisabledState] = useState({});

  const [fontsLoaded] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
    CeraRoundProBold: require("../../../../assets/fonts/CeraRoundProBold.otf"),
    CeraRoundProMedium: require("../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplashScreen();
  }, [fontsLoaded]);



  // Función para cargar estados de los botones
const loadButtonStates = async () => {
  const newButtonStates = {};
  for (const item of recetasFiltradas.flatMap(receta => receta.medicamentos)) {
    const key = `estadoSwitch_${item.Medicamentoid}_${item.medicationKey}`;
    const storedValue = await AsyncStorage.getItem(key);
    newButtonStates[key] = storedValue === "true";
  }
  setButtonDisabledState(newButtonStates);
};

// UseFocusEffect para recargar estados cada vez que se navega a esta vista
useFocusEffect(
  React.useCallback(() => {
    loadButtonStates();
  }, [recetasFiltradas]) // Se asegura de recargar cuando cambien las recetas
);
  
  
  

  const transformRecetasData = (recetasData) => {
    return Object.keys(recetasData).flatMap((recetaId) => {
      const receta = recetasData[recetaId];
      let maxDiasTratamiento = 0;
      const medicamentosArray = receta.medicamentos
        ? Object.keys(receta.medicamentos).map((medKey) => {
            const medicamento = receta.medicamentos[medKey];
            const duracionTratamiento = medicamento.duracion_tratamiento.numero;
            if (duracionTratamiento > maxDiasTratamiento) {
              maxDiasTratamiento = duracionTratamiento;
            }
            return {
              id: recetaId,  // Aquí se utiliza recetaId como id único de la receta
              Medicamentoid: medicamento.medicamentoId,
              medicationKey: medKey,
              nombre: medicamento.nombre_medicamento,
              diasTratamiento: `${duracionTratamiento} ${medicamento.duracion_tratamiento.tiempo}`,
              frecuencia: `${medicamento.frecuencia_administracion.cada} ${medicamento.frecuencia_administracion.tiempo}`,
              comentarios: medicamento.informacion_adicional,
              diaMax: duracionTratamiento,
              dosis: medicamento.frecuencia_administracion.dosis,
              fecha_emision: receta.fecha_emision,
            };
          })
        : [];
      return {
        id: recetaId,
        titulo: "Unidad de Salud",
        fecha: receta.fecha_emision,
        medico: receta.nombre_doctor,
        telefono: receta.numero_doctor,
        diagnostico: receta.diagnostico,
        medicamentos: medicamentosArray,
        diasTratamiento: maxDiasTratamiento,
      };
    });
  };
  

  const calcularDiaTratamiento = (recetas) => {
    const hoy = format(new Date(), "yyyy-MM-dd");
    return recetas.map((entry) => {
      const [dia, mes, anio] = entry.fecha.split("/");
      const fecha_inicio = format(new Date(anio, mes - 1, dia), "yyyy-MM-dd");
      let currentDay = differenceInDays(new Date(hoy), new Date(fecha_inicio));
      if (currentDay > entry.diasTratamiento) {
        currentDay = entry.diasTratamiento;
      } else if (currentDay < 1) {
        currentDay = 1;
      }
      return currentDay;
    });
  };

  const calcularProgreso = (diasTranscurridos, diasTratamiento) => {
    return (diasTranscurridos / diasTratamiento) * 100;
  };

  const recetasCompletadas = (consultas, diasTranscurridos) => {
    return consultas.filter((receta, index) => {
      const progreso = calcularProgreso(
        diasTranscurridos[index],
        receta.diasTratamiento
      );
      return progreso >= 100;
    });
  };

  const recetasProgreso = (consultas, diasTranscurridos) => {
    return consultas.filter((receta, index) => {
      const progreso = calcularProgreso(
        diasTranscurridos[index],
        receta.diasTratamiento
      );
      return progreso > 0 && progreso < 100;
    });
  };

  const handleSearchPatient = async () => {
    try {
      const data = await searchPatientByCode("DUI", usuario);
      if (data && data.Recetas) {
        const recetasTotales = transformRecetasData(data.Recetas);
        const diasTratamientoArray = recetasTotales.map(
          (receta) => receta.diasTratamiento
        );
        const diasTranscurridosArray = calcularDiaTratamiento(recetasTotales);
        setDiasTranscurrido(diasTranscurridosArray);

        const recetasEnProgreso = recetasProgreso(
          recetasTotales,
          diasTranscurridosArray
        );
        const recetasCompletas = recetasCompletadas(
          recetasTotales,
          diasTranscurridosArray
        );

        setCountTodas(recetasTotales.length);
        setCountEnProgreso(recetasEnProgreso.length);
        setCountCompletadas(recetasCompletas.length);

        setRecetasOriginales(recetasTotales);
        setRecetasFiltradas(
          getFilteredRecetas(
            selectedButton,
            recetasTotales,
            recetasEnProgreso,
            recetasCompletas
          )
        );
      } else {
        console.log(
          "Error inesperado, no se encontró una cuenta conectada a este id: " +
            usuario
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleSearchPatient();
  }, []);

  useEffect(() => {
    const data = getFilteredRecetas(
      selectedButton,
      recetasOriginales,
      recetasProgreso(recetasOriginales, diasTranscurridos),
      recetasCompletadas(recetasOriginales, diasTranscurridos)
    );
    setRecetasFiltradas(data);
  }, [selectedButton, recetasOriginales, diasTranscurridos]);

  // Actualización global de días transcurridos en base a recetas en escenario
  useEffect(() => {
    setDiasTranscurridoCalculo(calcularDiaTratamiento(recetasFiltradas));
  }, [recetasFiltradas]);

  const getFilteredRecetas = (
    filter,
    todasRecetas,
    enProgresoRecetas,
    completadasRecetas
  ) => {
    switch (filter) {
      case "todas":
        return todasRecetas;
      case "enProgreso":
        return enProgresoRecetas;
      case "terminadas":
        return completadasRecetas;
      default:
        return todasRecetas;
    }
  };

  const handleButtonPress = (filter) => {
    setSelectedButton(filter);
  };

  const handleSearch = () => {
    if (!searchText) {
      setRecetasFiltradas(
        getFilteredRecetas(
          selectedButton,
          recetasOriginales,
          recetasProgreso(recetasOriginales, diasTranscurridos),
          recetasCompletadas(recetasOriginales, diasTranscurridos)
        )
      );
    } else {
      const filtered = recetasOriginales.filter(
        (receta) => receta.fecha === searchText
      );
      setRecetasFiltradas(filtered);
    }
  };

  const handleErase = () => {
    setSearchText("");
    setRecetasFiltradas(
      getFilteredRecetas(
        selectedButton,
        recetasOriginales,
        recetasProgreso(recetasOriginales, diasTranscurridos),
        recetasCompletadas(recetasOriginales, diasTranscurridos)
      )
    );
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const toggleExpandMed = (index) => {
    if (expandedMedIndices.includes(index)) {
      setExpandedMedIndices(expandedMedIndices.filter((i) => i !== index));
    } else {
      setExpandedMedIndices([...expandedMedIndices, index]);
    }
  };

  // El botón con la lógica para guardar `estadoSwitch`
  const handleReminderPress = async (medId, medName, Medicamentoid) => {
    const key = `estadoSwitch_${Medicamentoid}_${medName}`;
    const currentStatus = buttonDisabledState[key] || false;

    
  
    try {
      // Guardar el estado opuesto al actual en AsyncStorage
      await AsyncStorage.setItem(key, currentStatus ? "false" : "true");
  
      // Actualizar el estado local
      setButtonDisabledState((prevState) => ({
        ...prevState,
        [key]: !currentStatus,
      }));
  
      Alert.alert(
        "Recordatorio",
        `El recordatorio para ${medName} ha sido ${currentStatus ? "desactivado" : "activado"}.`
      );
    } catch (error) {
      console.error("Error al guardar estadoSwitch en AsyncStorage:", error);
    }
  };
  
  //Id de usuario
  const userUID = getUserUID();

  //Función para Actualizar Estado en Firebase
  const actualizarEstadoReceta = (id) => {
    const db = getDatabase();
    const recetaRef = ref(db, `paciente/${userUID}/Recetas/${id}`);
    
    update(recetaRef, { estado_receta: "Completado" })
      .then(() => {
        console.log("Estado actualizado correctamente");
      })
      .catch((error) => {
        console.error("Error al actualizar estado de la receta:", error);
      });
};


useEffect(() => {
  if (recetasFiltradas.length > 0 && diasTranscurridosCalculo.length > 0) {
    recetasFiltradas.forEach((receta, index) => {
      const progreso =
        diasTranscurridosCalculo[index] &&
        receta.diasTratamiento > 0
          ? (diasTranscurridosCalculo[index] / receta.diasTratamiento) * 100
          : 0;


      if (progreso >= 100 && receta.id) {
        actualizarEstadoReceta(receta.id);
      }
    });
  }
}, [recetasFiltradas, diasTranscurridosCalculo]);





  const isMedExpanded = (index) => {
    return expandedMedIndices.includes(index);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={"paciente"}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>MIS RECETAS</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Buscar receta"
            placeholderTextColor={styles.placeholderColor}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            enterKeyHint="search"
          />
          {searchText !== "" && (
            <TouchableOpacity onPress={handleErase} style={styles.clearIcon}>
              <FontAwesome name="times-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  selectedButton === "todas" ? "#37817A" : "#CCC",
              },
            ]}
            onPress={() => handleButtonPress("todas")}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: selectedButton === "todas" ? "#FFFFFF" : "#000000",
                },
              ]}
            >
              Todas ({countTodas})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  selectedButton === "enProgreso" ? "#37817A" : "#DFDADA",
              },
            ]}
            onPress={() => handleButtonPress("enProgreso")}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: selectedButton === "enProgreso" ? "#FFFFFF" : "#000000",
                },
              ]}
            >
              En progreso ({countEnProgreso})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  selectedButton === "terminadas" ? "#37817A" : "#E0DADA",
              },
            ]}
            onPress={() => handleButtonPress("terminadas")}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: selectedButton === "terminadas" ? "#FFFFFF" : "#000000",
                },
              ]}
            >
              Terminadas ({countCompletadas})
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recyclerViewContainer}>
          {recetasFiltradas.map((item, index) => {
            const progress =
              (diasTranscurridosCalculo[index] / item.diasTratamiento) * 100;

            let backgroundColor = "";
            if (progress === 0 || progress < 25) {
              backgroundColor = "#345DF5";
            } else if (progress >= 25 && progress < 50) {
              backgroundColor = "#FFEA79";
            } else if (progress >= 50 && progress < 100) {
              backgroundColor = "#FFD179";
            } else if (progress === 100) {
              backgroundColor = "#61DC6D";
            }

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.card,
                  {
                    backgroundColor: "#FFFFFF",
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4,
                    shadowRadius: 3.84,
                    elevation: 5,
                    height: progress === 100 ? 150 : 110,
                  },
                ]}
                onPress={() => {
                  setSelectedRecipe(item);
                  toggleModal();
                }}
              >
                <View style={styles.cardTopContainer}>
                  <View>
                    <Text style={styles.cardTitle}>{item.titulo}</Text>
                    <Text style={styles.cardText}>{item.medico}</Text>
                  </View>
                  <Text style={[styles.cardDate, { marginLeft: "auto" }]}>
                    {item.fecha}
                  </Text>
                </View>
                {progress === 100 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      marginRight: 10,
                    }}
                  >
                    <Text
                      style={{ fontFamily: "CeraRoundProLight", fontSize: 15 }}
                    >
                      Completa
                    </Text>
                    <Entypo
                      name="check"
                      size={15}
                      color="#FFFFFF"
                      style={{
                        backgroundColor: "#61DC6D",
                        marginLeft: 5,
                        padding: 1,
                        borderRadius: 5,
                      }}
                    />
                  </View>
                )}
                <View style={styles.cardProgressContainer}>
                  <View
                    style={[
                      styles.cardProgress,
                      {
                        width: "100%",
                        backgroundColor: "#999999",
                        position: "absolute",
                        top: 0,
                      },
                    ]}
                  ></View>
                  <View
                    style={[
                      styles.cardProgress,
                      {
                        width: `${progress}%`,
                        backgroundColor: backgroundColor,
                      },
                    ]}
                  ></View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalView}>
            <View style={styles.header1}>
              <Text style={styles.headerText1}>Mi receta</Text>
              <TouchableOpacity onPress={toggleModal}>
                <Entypo name="cross" size={25} color="black" />
              </TouchableOpacity>
            </View>
            <View style={styles.separator} />
            <ScrollView style={{ width: "100%" }}>
              <Text style={styles.modalTextTitle}>
                {selectedRecipe && selectedRecipe.titulo}
              </Text>
              <Text style={styles.modalText}>Medico: </Text>
              <Text style={styles.modalTextSubtitle}>
                {selectedRecipe && selectedRecipe.medico}
              </Text>
              <Text style={styles.modalText}>Telefono: </Text>
              <Text style={styles.modalTextSubtitle}>
                {selectedRecipe && selectedRecipe.telefono}
              </Text>
              <Text style={styles.modalText}>Fecha: </Text>
              <Text style={styles.modalTextSubtitle}>
                {selectedRecipe && selectedRecipe.fecha}
              </Text>
              <Text style={styles.modalText}>Diagnotico: </Text>
              <HTMLView
                style={styles.modalTextSubtitle2}
                value={selectedRecipe && selectedRecipe.diagnostico}
              ></HTMLView>
              <Text style={styles.modalText}>Medicamentos:</Text>
              {selectedRecipe &&
                selectedRecipe.medicamentos.map((med, index) => (
                  <View key={index} style={styles.card1}>
                    <TouchableOpacity
                      onPress={() => toggleExpandMed(index)}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={[styles.cardText1, { flex: 1 }]}>
                        {med.nombre}
                      </Text>
                      <Entypo
                        name={
                          isMedExpanded(index)
                            ? "chevron-small-up"
                            : "chevron-small-down"
                        }
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                    {isMedExpanded(index) && (
                      <View style={{ marginTop: 10 }}>
                        <Text style={styles.cardDetailTitle}>
                          Días de Tratamiento
                        </Text>
                        <Text style={styles.modalTextSubtitle}>
                          {med.diasTratamiento}
                        </Text>
                        <Text style={styles.cardDetailTitle}>Frecuencia</Text>
                        <Text style={styles.modalTextSubtitle}>
                          {med.dosis + " Cada " + med.frecuencia}
                        </Text>
                        <Text style={styles.cardDetailTitle}>
                          Comentarios de Ingesta
                        </Text>
                        <HTMLView
                          style={styles.modalTextSubtitle2}
                          value={med.comentarios}
                        ></HTMLView>
                        <TouchableOpacity
  onPress={() => handleReminderPress(med.id, med.nombre, med.Medicamentoid)}
  style={[
    styles.reminderContainer,
    {
      backgroundColor: buttonDisabledState[`estadoSwitch_${med.Medicamentoid}_${med.nombre}`]
        ? "#E0E0E0" // Color de fondo si el botón está activado
        : "#37817A", // Color de fondo si el botón está desactivado
    },
  ]}
>
  <Text style={styles.reminderText}>
    {buttonDisabledState[`estadoSwitch_${med.Medicamentoid}_${med.nombre}`]
      ? "RECORDATORIO ACTIVADO"
      : "ACTIVAR RECORDATORIO"}
  </Text>
  <Entypo
    name="clock"
    size={24}
    color="black"
    style={styles.reminderIcon}
  />
</TouchableOpacity>


                      </View>
                    )}
                  </View>
                ))}
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>
      <View style={{ paddingBottom: 60 }}></View>
    </ProtectedRoute>
  );
};

export default MisRecetasPaciente;
