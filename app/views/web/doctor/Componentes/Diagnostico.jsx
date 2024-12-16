import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import HTMLView from "react-native-htmlview";
import ProtectedRoute from "../../sesion/ProtectedRoute";

const MedicationItem = ({ medication }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <View style={{ marginBottom: 10 }}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: "white",
            padding: 10,
            borderWidth: 1,
            borderBlockColor: "black",
          }}
          onPress={() => setExpanded(!expanded)}
        >
          <Text>{medication.nombre}</Text>
          <FontAwesomeIcon icon={faCaretDown} style={{ marginLeft: 10 }} />
        </TouchableOpacity>
        {expanded && (
          <View
            style={{
              backgroundColor: "white",
              padding: 10,
              borderWidth: 1,
              borderBlockColor: "black",
            }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Días de tratamiento:
            </Text>
            <Text style={{ padding: 10, backgroundColor: "#FFFFFF" }}>
              {medication.diasTratamiento}
            </Text>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Frecuencia:
            </Text>
            <Text style={{ padding: 10, backgroundColor: "#FFFFFF" }}>
              {medication.frecuencia}
            </Text>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Comentarios:
            </Text>
            <HTMLView
              style={{ padding: 10, backgroundColor: "#FFFFFF" }}
              value={medication.comentarios}
            ></HTMLView>
          </View>
        )}
      </View>
    </ProtectedRoute>
  );
};

const AcordionItem = ({ nombre_doc, fecha, diagnostico, medicamentos }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <View style={{ marginBottom: 10 }}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: "#FFFFFF",
            padding: 10,
            borderWidth: 1,
            borderBlockColor: "black",
          }}
          onPress={() => setExpanded(!expanded)}
        >
          <Text>
            {nombre_doc} - {fecha}
          </Text>
          <FontAwesomeIcon icon={faCaretDown} style={{ marginLeft: 10 }} />
        </TouchableOpacity>
        {expanded && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              padding: 10,
              borderWidth: 1,
              borderBlockColor: "black",
            }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Médico:</Text>
            <Text style={{ padding: 10, backgroundColor: "white" }}>
              {nombre_doc}
            </Text>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Diagnóstico:
            </Text>
            <HTMLView
              style={{ padding: 10, backgroundColor: "white" }}
              value={diagnostico}
            ></HTMLView>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Medicamentos:
            </Text>
            {medicamentos.map((medication, index) => (
              <MedicationItem key={index} medication={medication} />
            ))}
          </View>
        )}
      </View>
    </ProtectedRoute>
  );
};

export default AcordionItem;
