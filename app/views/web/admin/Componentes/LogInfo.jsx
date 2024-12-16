import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import Menu from "./Menu";
import { useFonts } from "expo-font";
import ProtectedRoute from "../../sesion/ProtectedRoute";
import getLog from "../../../../../src/queryfb/general/getLog";

const LoadFonts = ({ children }) => {
  const [fontsLoaded] = useFonts({
    CeraRoundProMedium: require("../../../../../assets/fonts/CeraRoundProMedium.otf"),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return children;
};

const router = useRouter();
const { width } = Dimensions.get("window");

const LogDetail = () => {
  const { id } = useLocalSearchParams(); // Obtenemos el ID del log desde los parámetros de URL
  const [logData, setLogData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para obtener el log específico
    const fetchLogData = async () => {
      if (id) {
        try {
          const log = await getLog(id); // Llama a la función `getLog` con el `id` del log
          setLogData(log);
        } catch (error) {
          console.error("Error al obtener el log:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLogData();
  }, [id]);

  const handleBack = () => {
    router.navigate("/views/web/admin/Componentes/VerActividad");
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#37817A"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  if (!logData) {
    return (
      <Text style={{ textAlign: "center", marginTop: 20 }}>
        Log no encontrado.
      </Text>
    );
  }

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["actividad"]}
    >
      <LoadFonts>
        <View style={styles.container}>
          <Menu />
          <ScrollView contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.back}>◀ VOLVER</Text>
            </TouchableOpacity>

            <View style={styles.cardContainer}>
              {/* Card 1: Fecha y hora */}
              <Card style={styles.card}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="access-time" size={24} color="#37817A" />
                </View>
                <Card.Content>
                  <Title>Fecha y hora</Title>
                  <Paragraph>{logData.fecha + " " + logData.hora}</Paragraph>
                </Card.Content>
              </Card>

              {/* Card 2: Descripción */}
              <Card style={styles.card}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="file-alt" size={24} color="#37817A" />
                </View>
                <Card.Content>
                  <Title>Descripción</Title>
                  <Paragraph>{logData.accion}</Paragraph>
                </Card.Content>
              </Card>

              {/* Card 3: Usuario (UID) */}
              <Card style={styles.card}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="user" size={24} color="#37817A" />
                </View>
                <Card.Content>
                  <Title>Usuario (UID)</Title>
                  <Paragraph>
                    {Object.values(logData.usuario)[1]}{" "}
                    {Object.keys(logData.usuario)[0]}
                  </Paragraph>
                </Card.Content>
              </Card>

              {/* Card 4: Módulo */}
              <Card style={styles.card}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="bookmark" size={24} color="#37817A" />
                </View>
                <Card.Content>
                  <Title>Módulo</Title>
                  <Paragraph>{logData.moduloAfectado}</Paragraph>
                </Card.Content>
              </Card>

              {/* Card 5: Resultado */}
              <Card style={styles.card}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="check-square" size={24} color="#37817A" />
                </View>
                <Card.Content>
                  <Title>Resultado</Title>
                  <Paragraph>{logData.resultado}</Paragraph>
                </Card.Content>
              </Card>
            </View>
          </ScrollView>
        </View>
      </LoadFonts>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderColor: "#37817A",
    borderWidth: 1,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  back: {
    alignSelf: "flex-start",
    marginBottom: 20,
    fontFamily: "CeraRoundProMedium",
  },
});

export default LogDetail;
