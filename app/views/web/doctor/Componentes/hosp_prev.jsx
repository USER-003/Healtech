import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import styles from "../../../../../styles/stylesWeb";
import ProtectedRoute from "../../sesion/ProtectedRoute";

function HospitalizacionPrevia({
  nombreHospitalizacion,
  handleCardHosp,
  fec_ing,
  fec_alt,
}) {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <TouchableOpacity onPress={() => handleCardHosp(fec_ing, fec_alt)}>
        <View style={styles.list}>
          <Text style={styles.item}>{nombreHospitalizacion}</Text>
        </View>
      </TouchableOpacity>
    </ProtectedRoute>
  );
}

export default HospitalizacionPrevia;
