import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import styles from "../../../../../styles/stylesWeb";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import ProtectedRoute from "../../sesion/ProtectedRoute";

function IntervencionQuirurgica({
  nombreIntervencion,
  handleCardInt,
  fec_ing,
  fec_alt,
}) {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <TouchableOpacity onPress={() => handleCardInt(fec_ing, fec_alt)}>
        <View style={styles.list}>
          <Text style={styles.item}>{nombreIntervencion}</Text>
        </View>
      </TouchableOpacity>
    </ProtectedRoute>
  );
}

export default IntervencionQuirurgica;
