import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Entypo from 'react-native-vector-icons/Entypo'; // Para íconos Entypo
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Para el ícono de perfil
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Para íconos adicionales

// Importa los componentes separados
import MisRecetas from './MisRecetas';
import CentroRecor from './CentroRecor';
import MiPerfil from './MiPerfil';
import Keys from './Keys';
import HistorialPaciente from './HistorialPaciente';
import ProtectedRoute from '../Componentes/ProtectedRoute';

// Crea el Tab Navigator
const Tab = createBottomTabNavigator();

export default function HomePa() {
  return (
    <ProtectedRoute allowedRoles={"paciente"}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            switch (route.name) {
              case 'Recetas':
                return <Entypo name="home" size={size} color={color} />;
              case 'Recordatorios':
                return <Entypo name="clock" size={size} color={color} />;
              case 'Acces':
                return <Entypo name="key" size={size} color={color} />; // Ícono de llave
              case 'Historial':
                return <MaterialIcons name="history" size={size} color={color} />; // Ícono de historial
              case 'Perfil':
                return <FontAwesome name="user-circle" size={size} color={color} />;
              default:
                return null;
            }
          },
          tabBarActiveTintColor: '#45B5A9', // Color cuando está activo
          tabBarInactiveTintColor: 'gray', // Color cuando está inactivo
          tabBarLabelStyle: {
            paddingBottom: 5, // Ajusta la posición del texto
            fontSize: 12, // Tamaño del texto
          },
          tabBarStyle: {
            position: 'absolute', // Asegura que el navbar esté en la parte inferior
            bottom: 0, // Posiciona el tab bar en la parte inferior
            left: 0,
            right: 0,
            height: 60,  // Ajusta la altura si es necesario
          },
        })}
      >
        <Tab.Screen
          name="Recetas"
          component={MisRecetas}
          options={{ headerShown: false, tabBarLabel: 'Recetas' }}
        />
        <Tab.Screen
          name="Recordatorios"
          component={CentroRecor}
          options={{ headerShown: false, tabBarLabel: 'Recordatorios' }}
        />
        <Tab.Screen
          name="Acces"
          component={Keys}
          options={{ 
            headerShown: false, 
            tabBarLabel: 'Acceso' // Etiqueta de la pestaña
          }}
        />
        <Tab.Screen
          name="Historial"
          component={HistorialPaciente}
          options={{ 
            headerShown: false, 
            tabBarLabel: 'Historial' // Etiqueta de la pestaña
          }}
        />
        <Tab.Screen
          name="Perfil"
          component={MiPerfil}
          options={{ headerShown: false, tabBarLabel: 'Perfil' }}
        />
      </Tab.Navigator>
    </ProtectedRoute>
  );
}




