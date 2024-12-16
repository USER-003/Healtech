// components/Grid.js
import React from "react";
import { View, StyleSheet } from "react-native";
import ProtectedRoute from "../../sesion/ProtectedRoute";

const Grid = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <View style={styles.container}>{children}</View>
    </ProtectedRoute>
  );
};

const Row = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <View style={styles.row}>{children}</View>
    </ProtectedRoute>
  );
};

const Column = ({ size, children }) => {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <View style={[styles.column, { flex: size }]}>{children}</View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  column: {
    flex: 1,
    padding: 5,
  },
});

export { Grid, Row, Column };
