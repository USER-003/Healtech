import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Picker,
} from "react-native";
import { RadioButton } from "react-native-paper";
import Menu from "../../Menu";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import getUserUID from "../../../../../../../src/queryfb/general/getUserUID";
import obtenerRegistroClinicaAsociada from "../../../../../../../src/queryfb/admin/getRegistroClinica";
import { fetchRoles } from "../../../../../../../src/queryfb/general/fetchRoles";
import Swal from "sweetalert2"; // Importa sweetalert2
import setCollaboratorAccount from "../../../../../../../src/queryfb/admin/setColaborador";
import ProtectedRoute from "../../../../sesion/ProtectedRoute";

import {
  secundario,
  createUserWithEmailAndPassword,
} from "../../../../../../../src/config/secundary";

const CreateCollaborator = () => {
  const router = useRouter();
  const userUID = getUserUID(); // Obtener el UID del usuario actual
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [dui, setDui] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [job, setJob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("active");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [permissionsEnabled, setPermissionsEnabled] = useState(false);

  useEffect(() => {
    const fetchRolesData = async () => {
      if (userUID) {
        try {
          const clinicaId = await obtenerRegistroClinicaAsociada(userUID);
          const data = await fetchRoles(clinicaId);
          if (data) {
            const rolList = Object.keys(data).map((key) => ({
              uid: key,
              ...data[key],
            }));
            setRoles(rolList);
          }
        } catch (error) {
          console.error("Error fetching roles:", error);
        }
      }
    };
    fetchRolesData();
  }, [userUID]);

  const validateFields = () => {
    if (
      !name ||
      !surname ||
      !dui ||
      !phone ||
      !address ||
      !job ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, complete todos los campos obligatorios.",
      });
      return false;
    }
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Contraseñas no coinciden",
        text: "Las contraseñas ingresadas no coinciden.",
      });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateFields()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        secundario,
        email,
        password
      );
      const uid = userCredential.user.uid;

      // Obtener la clínica asociada al administrador
      const clinicaId = await obtenerRegistroClinicaAsociada(userUID);

      // Guardar la información del colaborador en la base de datos
      await setCollaboratorAccount(
        userUID,
        uid,
        name,
        surname,
        dui,
        phone,
        address,
        job,
        email,
        selectedRole,
        status
      );

      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "La cuenta ha sido creada correctamente.",
      }).then(() => {
        router.replace(`/views/web/admin/DashBoard`);
      });
    } catch (error) {
      console.error("Error al crear la cuenta:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al crear la cuenta. Inténtelo nuevamente.",
      });
    }
  };

  const handleGoBack = () => {
    router.replace(
      `/views/web/admin/Componentes/Administracion/colaborador/RegistrarColaboradores`
    );
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "colaborador"]}
      requiredPermissions={["colaboradores"]}
    >
      <View style={styles.container}>
        <Menu />
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.title}>Crear colaboradores</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información personal</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Apellidos"
                value={surname}
                onChangeText={setSurname}
              />
              <TextInput
                style={styles.input}
                placeholder="DUI"
                value={dui}
                onChangeText={setDui}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                style={styles.input}
                placeholder="Dirección"
                value={address}
                onChangeText={setAddress}
              />
              <TextInput
                style={styles.input}
                placeholder="Cargo"
                value={job}
                onChangeText={setJob}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Credenciales de acceso</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]} // Aplica un estilo especial aquí
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]} // Aplica un estilo especial aquí
                  placeholder="Confirmar contraseña"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estado</Text>
              <View style={styles.radioContainer}>
                <RadioButton
                  value="activo"
                  status={status === "activo" ? "checked" : "unchecked"}
                  onPress={() => setStatus("activo")}
                />
                <Text style={styles.radioLabel}>Activo</Text>
                <RadioButton
                  value="inactivo"
                  status={status === "inactivo" ? "checked" : "unchecked"}
                  onPress={() => setStatus("inactivo")}
                />
                <Text style={styles.radioLabel}>Inactivo</Text>
              </View>
              <View style={styles.rolePickerContainer}>
                <Picker
                  selectedValue={selectedRole}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedRole(itemValue)}
                >
                  <Picker.Item label="Seleccione un rol" value="" />
                  {roles.map((rol) => (
                    <Picker.Item
                      key={rol.uid}
                      label={rol.nombre}
                      value={rol.uid}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.buttonTextCancel} onPress={handleGoBack}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
  },
  formContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    color: "#1E3A8A",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "CeraRoundproMedium",
  },
  rolePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 15,
  },
  picker: {
    height: 40,
    width: "100%",
    fontFamily: "CeraRoundProRegular",
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#37817A",
    fontFamily: "CeraRoundproMedium",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    fontSize: 14,
    fontFamily: "CeraRoundproMedium",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginHorizontal: 5,
    paddingRight: 10,
  },
  passwordInput: {
    borderWidth: 0, // Elimina el borde interno del input
  },
  icon: {
    marginLeft: -35,
    padding: 10,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioLabel: {
    marginRight: 20,
    fontSize: 14,
    fontFamily: "CeraRoundproMedium",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#37817A",
    borderRadius: 25,
    width: "20%",
    padding: 10,
    margin: 5,
  },
  registerButton: {
    backgroundColor: "#37817A",
    borderRadius: 25,
    width: "20%",
    padding: 10,
    margin: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "CeraRoundproMedium",
  },
  buttonTextCancel: {
    color: "#37817A",
    textAlign: "center",
    fontFamily: "CeraRoundproMedium",
  },
});

export default CreateCollaborator;
