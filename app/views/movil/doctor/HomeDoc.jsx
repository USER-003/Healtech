import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Entypo from "react-native-vector-icons/Entypo"; // Para otros íconos
import FontAwesome from "react-native-vector-icons/FontAwesome"; // Para el ícono de perfil
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Para el ícono de consulta médica

// Importa los componentes Miper y AgregaReceta
import Miper from "./Miper";
import AgregaReceta from "./Busqueda";
import Busqueda from "./Busqueda";

// Crea el Tab Navigator
const Tab = createBottomTabNavigator();

export default function HomeDoc() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Asigna un ícono a cada ruta
          if (route.name === "Consulta Médica") {
            // Usar el ícono que se asemeje al que subiste
            return <MaterialIcons name="add-box" size={size} color={color} />;
          } else if (route.name === "Perfil") {
            iconName = "user-circle"; // Ícono para el perfil
            return <FontAwesome name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: "#45B5A9", // Color cuando está activo
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          paddingBottom: 5, // Ajuste del texto
          fontSize: 12, // Tamaño del texto
        },
        tabBarStyle: {
          position: "absolute", // Navbar fijo en la parte inferior
          bottom: 0,
          left: 0,
          right: 0,
          height: 60, // Ajuste de la altura
        },
      })}
    >
      <Tab.Screen
        name="Consulta Médica"
        component={AgregaReceta}
        options={{ headerShown: false }} // Deshabilitar el encabezado
      />
      <Tab.Screen
        name="Perfil"
        component={Miper}
        options={{ headerShown: false }} // Deshabilitar el encabezado
      />
    </Tab.Navigator>
  );
}
