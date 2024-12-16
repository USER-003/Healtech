import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useFonts } from "expo-font";
import { useRouter, useLocalSearchParams } from "expo-router";
import Menu from "../Menu";
import Swal from "sweetalert2";

import ProtectedRoute from "../../../sesion/ProtectedRoute";

import obtenerRegistroClinicaAsociada from "../../../../../../src/queryfb/admin/getRegistroClinica";
import getUserUID from "../../../../../../src/queryfb/general/getUserUID";

import verificarNombreRolExistente from "../../../../../../src/queryfb/admin/checkNombreRol";
import actualizarRol from "../../../../../../src/queryfb/admin/updateRol";
import obtenerDatosRol from "../../../../../../src/queryfb/admin/getDatosRol"; // Nueva función para obtener datos del rol

const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProMedium: require("../../../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return children;
};

const EditarRol = () => {
  const router = useRouter();
  const [nombreRol, setNombreRol] = useState("");
  const [validarNombreRepetido, setNombreRepetido] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [nombreError, setNombreError] = useState("");
  const [descripcionError, setDescripcionError] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { rol } = useLocalSearchParams(); // Obtenemos el ID del rol desde los parámetros de URL
  const userUID = getUserUID();

  // Función para cargar los datos del rol específico
  const cargarDatosRol = async () => {
    try {
      const registroClinica = await obtenerRegistroClinicaAsociada(userUID);
      if (registroClinica && rol) {
        const datosRol = await obtenerDatosRol(registroClinica, rol);
        if (datosRol) {
          setNombreRol(datosRol.nombre || "No encontrado");
          setNombreRepetido(datosRol.nombre || "No encontrado");
          setDescripcion(datosRol.descripcion || "No encontrado");
        }
      }
    } catch (error) {
      console.error("Error al cargar los datos del rol:", error);
    }
  };

  // Ejecuta cargarDatosRol solo cuando userUID y rol estén disponibles
  useEffect(() => {
    if (userUID && rol) {
      cargarDatosRol();
    }
  }, [userUID, rol]);

  useEffect(() => {
    cargarDatosRol(); // Cargar los datos del rol al iniciar
    const updateLayout = () => {
      setIsSmallScreen(Dimensions.get("window").width < 768);
    };
    Dimensions.addEventListener("change", updateLayout);
    return () => Dimensions.removeEventListener("change", updateLayout);
  }, [rol]);

  const handleActualizarRol = async () => {
    setNombreError("");
    setDescripcionError("");

    let hasError = false;
    if (nombreRol.trim() === "") {
      setNombreError(
        "El nombre del rol es obligatorio y no puede contener solo espacios"
      );
      hasError = true;
    }
    if (descripcion.trim() === "") {
      setDescripcionError(
        "La descripción es obligatoria y no puede contener solo espacios"
      );
      hasError = true;
    }
    if (hasError) return;

    try {
      const registroClinica = await obtenerRegistroClinicaAsociada(userUID);
      if (!registroClinica) {
        setNombreError(
          "No se encontró una clínica asociada para este usuario."
        );
        return;
      }

      // Verificar si el nombre ya existe en otros roles si es diferente al original
      if (nombreRol.trim() !== validarNombreRepetido) {
        const nombreExiste = await verificarNombreRolExistente(
          registroClinica,
          nombreRol.trim()
        );
        if (nombreExiste) {
          setNombreError(
            "El nombre del rol ya está en uso. Elija otro nombre."
          );
          return;
        }
      }

      // Llamar a actualizarRol con registroClinica incluido en el path
      await actualizarRol(
        registroClinica,
        rol,
        nombreRol.trim(),
        descripcion.trim()
      );

      Swal.fire({
        title: "Éxito",
        text: "El rol se ha actualizado correctamente",
        icon: "success",
      });

      router.replace(
        "/views/web/admin/Componentes/Roles&Permisos/AdministrarRoles"
      );
    } catch (error) {
      console.error("Error al actualizar el rol:", error);
      Swal.fire("Error", "Hubo un problema al actualizar el rol.", "error");
    }
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["crearroles"]}
    >
      <LoadFonts>
        <View style={styles.container}>
          <Menu />
          <View style={styles.mainContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>◀ VOLVER</Text>
            </TouchableOpacity>

            <Text style={styles.title}>MODIFICAR ROL</Text>

            <View
              style={[
                styles.formContainer,
                isSmallScreen
                  ? styles.smallScreenContainer
                  : styles.largeScreenContainer,
              ]}
            >
              {isSmallScreen && (
                <Image
                  source={require("./Imagenes/personal.jpg")}
                  style={styles.image}
                />
              )}

              <View style={styles.formLeft}>
                <Text style={styles.label}>NOMBRE DE ROL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el nombre del rol"
                  value={nombreRol}
                  onChangeText={setNombreRol}
                />
                {nombreError ? (
                  <Text style={styles.errorText}>{nombreError}</Text>
                ) : null}

                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={styles.textarea}
                  multiline
                  placeholder="Ingrese una descripción"
                  value={descripcion}
                  onChangeText={setDescripcion}
                />
                {descripcionError ? (
                  <Text style={styles.errorText}>{descripcionError}</Text>
                ) : null}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleActualizarRol}
                    style={styles.createButton}
                  >
                    <Text style={styles.createButtonText}>Modificar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!isSmallScreen && (
                <Image
                  source={require("./Imagenes/personal.jpg")}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}
            </View>
          </View>
        </View>
      </LoadFonts>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#FFFFFF" },
  mainContent: { flex: 1, padding: 20, flexDirection: "column" },
  backButton: { alignSelf: "flex-start", marginBottom: 20 },
  backText: { fontFamily: "CeraRoundProMedium", fontSize: 16 },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
  },
  formContainer: { justifyContent: "space-between", alignItems: "center" },
  largeScreenContainer: { flexDirection: "row" },
  smallScreenContainer: { flexDirection: "column" },
  formLeft: { flex: 1, paddingRight: 20 },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: "CeraRoundProMedium",
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 5,
    marginBottom: 5,
    fontFamily: "CeraRoundProMedium",
  },
  textarea: {
    width: "100%",
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 5,
    height: 200,
    marginBottom: 5,
    fontFamily: "CeraRoundProMedium",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    fontFamily: "CeraRoundProMedium",
  },
  image: { width: 400, height: 300, marginLeft: 10, resizeMode: "contain" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 20,
  },
  createButton: {
    backgroundColor: "#37817A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  createButtonText: { color: "#FFF", fontFamily: "CeraRoundProMedium" },
  cancelButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#37817A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelButtonText: { color: "#37817A", fontFamily: "CeraRoundProMedium" },
});

export default EditarRol;
