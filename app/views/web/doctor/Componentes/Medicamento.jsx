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

function AgregarMedicamento({
  nombreMedicamento,
  toggleModalModificar,
  index,
  handleDelete,
}) {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <View style={styles.medicamento}>
        <Row>
          <Column size={10}>
            <Text style={styles.label}>{nombreMedicamento}</Text>
          </Column>
          <Column size={1}>
            <TouchableOpacity onPress={() => toggleModalModificar(index)}>
              <FontAwesomeIcon icon={faPenToSquare} size={32} color="#000" />
            </TouchableOpacity>
          </Column>

          <Column size={1}>
            <TouchableOpacity onPress={() => handleDelete(index)}>
              <FontAwesomeIcon icon={faTrash} size={32} color="#000" />
            </TouchableOpacity>
          </Column>
        </Row>
      </View>
    </ProtectedRoute>
  );
}

export default AgregarMedicamento;
