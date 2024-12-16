import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useRouter } from "expo-router";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFonts } from "expo-font";

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
const router = useRouter();

const handleDash = () => {
  router.replace("https://healtech.page.link/Q9dx");
};

const PasswordUpdatedScreen = ({ navigation }) => {
  return (
    <LoadFonts>
    <View style={styles.container}>
      <View style={styles.iconBackground}>
      <FontAwesome name="check" size={24} color="#37817A" style={styles.icon}/>
      </View>
      <Text style={styles.title}>Contraseña actualizada</Text>
      <Text style={styles.subtitle}>
        Su contraseña se ha actualizado exitosamente. <br/> Haz clic abajo para ingresar.
      </Text><br/>
      <Button mode="contained" style={styles.button} onPress={handleDash}>
        <Text style={styles.continueText}>
        CONTINUAR
      </Text>
      </Button>
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
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, fontFamily:'CeraRoundProMedium', },
  subtitle: { textAlign: 'center', marginVertical: 10, fontFamily:'CeraRoundProMedium', },
  button: { width: '50%', backgroundColor: '#37817A', fontFamily:'CeraRoundProMedium',  borderRadius: 5,  },
  continueText:{fontFamily:'CeraRoundProMedium' },
});

export default PasswordUpdatedScreen;
