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
import { Grid, Row, Column } from "./Grid";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import ProtectedRoute from "../../sesion/ProtectedRoute";

function EnfermedadCronica({ nombreEnfermedad }) {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <View style={styles.list}>
        <Text style={styles.item}>{nombreEnfermedad}</Text>
      </View>
    </ProtectedRoute>
  );
}

export default EnfermedadCronica;
