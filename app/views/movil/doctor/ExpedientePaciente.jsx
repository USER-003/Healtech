import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Entypo from "react-native-vector-icons/Entypo";
import { router, useRouter, Link } from "expo-router";
import DataContext from "./DataContext";
import searchPatientByCode from "../../../../src/queryfb/paciente/searchPatientByCode";
import Icon from "react-native-vector-icons/FontAwesome";
import ProtectedRoute from "../Componentes/ProtectedRoute";

import styles from "../../../../styles/stylesReceta";
// Definir componente funcional HospitalizacionModal
const HospitalizacionModal = ({ visible, onHide, fechaAlta, fechaIngreso }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            width: 300,
            borderRadius: 10,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "CeraRoundProBlack",
              fontSize: 18,
              marginBottom: 10,
            }}
          >
            Detalles
          </Text>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontFamily: "CeraRoundProRegular", fontSize: 16 }}>
              Fecha de ingreso:
            </Text>
            <Text style={{ fontFamily: "CeraRoundProRegular", fontSize: 14 }}>
              {fechaIngreso}
            </Text>
          </View>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: "CeraRoundProRegular", fontSize: 16 }}>
              Fecha de alta:
            </Text>
            <Text style={{ fontFamily: "CeraRoundProRegular", fontSize: 14 }}>
              {fechaAlta}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onHide}
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "black",
            }}
          >
            <Text
              style={{
                fontFamily: "CeraRoundProRegular",
                fontSize: 16,
                color: "#000",
              }}
            >
              Cerrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ExpedienteUsuariomovil = () => {
  const { identificacion, setData, modo, setModo, searchState } = useContext(DataContext);
  const [pacienteData, setPacienteData] = useState("");
  const [enfermedadesCronicas, setEnfermedadesCronicas] = useState([]);
  const [hospitalizacionesPrevias, setHospitalizacionesPrevias] = useState([]);
  const [intervencionesQuirurgicas, setIntervencionesQuirurgicas] = useState([]);
  const [diagnosticoData, setDiagnosticoData] = useState(searchState?.diagnosticoData || "");
  const [medicamentos, setMedicamentos] = useState(searchState?.medicamentos || []);

  const router = useRouter();

  useEffect(() => {
    // Llamar a la función para buscar datos del médico al cargar el componente
    (async () => {
      try {
        console.log(modo + ", " + identificacion);
        const data = await searchPatientByCode(modo, identificacion);
        setPacienteData(data);
        console.log(data.Recetas.medicamentos);

        if (data && data.historia_clinica && data.historia_clinica.enf_cron) {
          const enfCronData = data.historia_clinica.enf_cron;
          const enfermedadesArray = Object.keys(enfCronData).map(
            (key, index) => ({
              id: key,
              enfermedad: enfCronData[key].enfermedad, // Aquí debes ajustar según la estructura del objeto enfermedad
            })
          );
          console.log(enfermedadesArray);
          // Actualizar el estado con las enfermedades crónicas
          setEnfermedadesCronicas(enfermedadesArray);

          // Procesar las hospitalizaciones previas
          if (
            data &&
            data.historia_clinica &&
            data.historia_clinica.hosp_prev
          ) {
            const hospPrevData = data.historia_clinica.hosp_prev;
            const hospitalizacionesArray = Object.keys(hospPrevData).map(
              (key) => ({
                id: key,
                hospitalizacion: hospPrevData[key].razon, // Ajusta esto según la estructura real de hosp_prev[key]
                fecha_alta: hospPrevData[key].fecha_alta,
                fecha_ingreso: hospPrevData[key].fecha_ingreso,
              })
            );
            console.log(hospitalizacionesArray);
            setHospitalizacionesPrevias(hospitalizacionesArray);
          }

          // Procesar las intervenciones quirúrgicas
          if (data && data.historia_clinica && data.historia_clinica.int_quir) {
            const intQuirData = data.historia_clinica.int_quir;
            const intervencionesArray = Object.keys(intQuirData).map((key) => ({
              id: key,
              intervencion: intQuirData[key].razon, // Extrae la razón de la intervención
              fecha_alta: intQuirData[key].fecha_alta, // Asegúrate de que estas propiedades existen
              fecha_ingreso: intQuirData[key].fecha_ingreso, // Verifica que esta propiedad esté presente en los datos
            }));
            console.log(intervencionesArray);
            setIntervencionesQuirurgicas(intervencionesArray);
          }
        }
      } catch (error) {
        console.error(error); // Manejar el error de búsqueda
      }
    })();
  }, []);

  //controla que abra el modal en hospitalizaciones
  const [modalVisible, setModalVisible] = useState(false);
  const [fechaAlta, setFechaAlta] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  // Carga las fuentes personalizadas
  const [fontsLoaded, fontError] = useFonts({
    CeraRoundProLight: require("../../../../assets/fonts/CeraRoundProLight.otf"),
    CeraRoundProRegular: require("../../../../assets/fonts/CeraRoundProRegular.otf"),
    CeraRoundProBlack: require("../../../../assets/fonts/CeraRoundProBlack.otf"),
  });

  // Prevenir el autohide de la pantalla de carga
  SplashScreen.preventAutoHideAsync();

  // Oculta la pantalla de carga una vez que las fuentes se hayan cargado o haya un error
  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplashScreen();
  }, [fontsLoaded, fontError]);

  // Si las fuentes no están cargadas o hay un error, retorna null
  if (!fontsLoaded && !fontError) {
    return null;
  }
  // Datos de enfermedades crónicas

  // Obtener el ancho de la pantalla
  const screenWidth = Dimensions.get("window").width;

  // Función para manejar el clic en una hospitalización
  const handleHospitalizacionClick = (fechaAlta, fechaIngreso) => {
    setFechaAlta(fechaAlta);
    setFechaIngreso(fechaIngreso);
    setModalVisible(true);
  };

  // Función para manejar el evento de clic en el botón de diagnóstico
  const handleDiagnosticoButtonClick = () => {
    router.navigate("views/movil/doctor/HistorialDiagnosticos");
    console.log("Botón de diagnóstico clicado");
  };

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento.split("/").reverse().join("-")); // Asegúrate que el formato de fecha sea DD/MM/AAAA
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  };

  const renderItemsWithCommas = (items) => {
    return items.map((item, index) => (
      <Text key={index}>
        {item}
        {index < items.length - 1 ? ", " : ""}
      </Text>
    ));
  };

  const saveStateAndNavigateBack = () => {
    setData({
      identificacion,
      modo,
      pacienteData,
      enfermedadesCronicas,
      hospitalizacionesPrevias,
      intervencionesQuirurgicas,
      diagnosticoData,
      medicamentos,
    });
    router.back();
  };

  return (
    <ProtectedRoute>
      <ScrollView style={styles.scrollView}>
        <View style={styles.rectangulo}>
          {/* Icono de retroceso */}
          <TouchableOpacity
            onPress={saveStateAndNavigateBack}
            style={styles.touchable}
          >
            <View style={styles.icono}>
              <Entypo name="chevron-left" size={24} color="white" />
            </View>
            <Text style={styles.textoVolver}>Volver</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={handleDiagnosticoButtonClick}
          style={styles.diagnosticoButton}
        >
          <Text style={styles.diagnosticoButtonText}>Historial médico</Text>
        </TouchableOpacity>

        {/* Texto debajo del rectángulo */}
        <View style={styles.textoDebajo}>
          <Text style={styles.textoExpediente}>Expediente Paciente</Text>
        </View>
        {/* Caja de datos personales */}
        <View style={styles.datosPersonalesContainer}>
          <Text style={styles.datosPersonalesLabel}>DATOS PERSONALES</Text>

          <View style={styles.datosPersonalesTextContainer}>
            <Text style={styles.datosPersonalesText}>Nombre</Text>
            <Text style={styles.datosPersonalesText}>Dirección</Text>
          </View>

          <View style={styles.datosPersonalesTextContainer}>
            <Text style={styles.datosPersonalesTextBackground}>
              {pacienteData?.nombre}
            </Text>
            <Text style={styles.datosPersonalesTextBackground}>
              {pacienteData?.direccion}
            </Text>
          </View>

          <View style={styles.datosPersonalesTextContainer}>
            <Text style={styles.datosPersonalesText}>Teléfono</Text>
            <Text style={styles.datosPersonalesText}>
              {modo === "DUI" ? "Identificación" : "Expediente"}
            </Text>
          </View>

          <View style={styles.datosPersonalesTextContainer}>
            <Text style={styles.datosPersonalesTextBackground}>
              {pacienteData?.telefono}
            </Text>
            <Text style={styles.datosPersonalesTextBackground}>
              {modo === "DUI"
                ? pacienteData?.identificacion
                : pacienteData?.expediente}
            </Text>
          </View>

          <View style={styles.datosPersonalesTextContainer}>
            <Text style={styles.datosPersonalesText}>Correo</Text>
            <Text style={styles.datosPersonalesText}>Nacionalidad</Text>
          </View>

          <View style={styles.datosPersonalesTextContainer}>
            <Text style={styles.datosPersonalesTextBackground}>
              {pacienteData?.email}
            </Text>
            <Text style={styles.datosPersonalesTextBackground}>
              {pacienteData?.nacionalidad}
            </Text>
          </View>

          <View style={styles.datosPersonalesTextContainer}>
            <Text style={styles.datosPersonalesText}>Sexo</Text>
            <Text style={styles.datosPersonalesText}>Edad</Text>
          </View>
          {/* Sexta línea */}
          <View style={styles.datosPersonalesTextContainer}>
            <Text style={styles.datosPersonalesTextBackground}>
              {pacienteData?.sexo}
            </Text>
            <Text style={styles.datosPersonalesTextBackground}>
              {pacienteData?.nacimiento
                ? calcularEdad(pacienteData?.nacimiento)
                : "N/A"}
            </Text>
          </View>
          <View style={styles.datosPersonalesTextContainer}>
            <Text style={styles.datosPersonalesText}>Fecha de nacimiento </Text>
          </View>
          {/* Sexta línea */}
          <View style={styles.datosPersonalesTextContainer}>
            <Text style={styles.datosPersonalesTextBackground}>
              {pacienteData?.nacimiento}
            </Text>
          </View>
        </View>
        {/* Container de Datos de Salud */}
        <View style={styles.datosSaludContainer}>
          <View style={styles.tablaDatosSalud}>
            {/* Primera fila */}
            <View style={styles.datosSaludRow}>
              <Text style={styles.datosSaludText2}>DATOS SALUD</Text>
            </View>
            {/* Segunda fila */}
            <View style={styles.datosSaludRow}>
              <Text style={styles.datosSaludText}>Peso:</Text>
              <Text style={styles.datosSaludText}>
                {pacienteData?.datos_salud?.peso}
              </Text>
            </View>
            {/* Tercera fila */}
            <View style={styles.datosSaludRow}>
              <Text style={styles.datosSaludText3}>Altura:</Text>
              <Text style={styles.datosSaludText3}>
                {pacienteData?.datos_salud?.altura}
              </Text>
            </View>
            {/* Cuarta fila */}
            <View style={styles.datosSaludRow}>
              <Text style={styles.datosSaludText}>Tipo de sangre:</Text>
              <Text style={styles.datosSaludText}>
                {pacienteData?.datos_salud?.tipo_sangre}
              </Text>
            </View>
            {/* Quinta fila */}
            <View style={styles.datosSaludRow}>
              <Text style={styles.datosSaludText3}>Alergias:</Text>
              <Text style={styles.datosSaludText3}>
                {pacienteData?.datos_salud?.alergias &&
                  renderItemsWithCommas(pacienteData.datos_salud.alergias)}
              </Text>
            </View>
            {/* Sexta fila */}
            <View style={styles.datosSaludRow}>
              <Text style={styles.datosSaludText}>Medicamentos Crónicos:</Text>
              <Text style={styles.datosSaludText}>
                {pacienteData?.datos_salud?.medicamentos_cronicos &&
                  renderItemsWithCommas(
                    pacienteData.datos_salud.medicamentos_cronicos
                  )}
              </Text>
            </View>
            {/* Séptima fila */}
            <View style={styles.datosSaludRow}>
              <Text style={styles.datosSaludText3}>
                Antecedentes Familiares:
              </Text>
              <Text style={styles.datosSaludText3}>
                {pacienteData?.datos_salud?.antecedentes_familiares &&
                  renderItemsWithCommas(
                    pacienteData.datos_salud.antecedentes_familiares
                  )}
              </Text>
            </View>
          </View>
        </View>
        {/*  */}
        <Text style={styles.enfermedadesCronicasLabel}>
          ENFERMEDADES CRÓNICAS
        </Text>
        <View style={styles.enfermedadesCronicasContainer}>
          <View style={styles.enfermedadesCronicasContainer}>
            {enfermedadesCronicas.map((enfermedad) => (
              <View key={enfermedad.id} style={styles.tarjetaEnfermedad}>
                <Text style={styles.tarjetaTexto}>{enfermedad.enfermedad}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Container de Hospitaliazaciones Previas */}
        <View style={styles.hospitalizacionesContainer}>
          <Text style={styles.hospitalizacionesLabel}>
            INTERVENCIONES QUIRÚRGICAS
          </Text>
          {intervencionesQuirurgicas.map((intervencion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                handleHospitalizacionClick(
                  intervencion.fecha_alta,
                  intervencion.fecha_ingreso
                )
              }
              style={[styles.tarjetaEnfermedad, { marginBottom: 10 }]}
            >
              <Text style={styles.tarjetaTexto}>
                {intervencion.intervencion}
              </Text>
              <Icon
                name="plus"
                size={20}
                color="black"
                style={styles.iconStyle}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Container de Hospitaliazaciones Previas */}
        <View style={styles.hospitalizacionesContainer}>
          <Text style={styles.hospitalizacionesLabel}>
            HOSPITALIZACIONES PREVIAS
          </Text>
          {hospitalizacionesPrevias.map((hospitalizacion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                handleHospitalizacionClick(
                  hospitalizacion.fecha_alta,
                  hospitalizacion.fecha_ingreso
                )
              }
              style={[styles.tarjetaHospitalizacion, { marginBottom: 10 }]}
            >
              <Text style={styles.tarjetaTextoHospitalizacion}>
                {hospitalizacion.hospitalizacion}
              </Text>
              <Icon
                name="plus"
                size={20}
                color="black"
                style={styles.iconStyle}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Modal de hospitalización */}
        <HospitalizacionModal
          visible={modalVisible}
          onHide={() => setModalVisible(false)}
          fechaAlta={fechaAlta}
          fechaIngreso={fechaIngreso}
        />

        {/* Botón de diagnóstico */}
      </ScrollView>
    </ProtectedRoute>
  );
};

export default ExpedienteUsuariomovil;
