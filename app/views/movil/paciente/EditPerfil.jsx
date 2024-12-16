import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Input } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ALERT_TYPE, Dialog, AlertNotificationRoot } from "react-native-alert-notification";
import searchPatientByUid from "../../../../src/queryfb/paciente/searchPatientByUid"; // Módulo para buscar paciente por UID
import updateEmailForPatient from '../../../../src/queryfb/paciente/updateEmailForPatient'; // Módulo para actualizar correo
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { db } from '../../../../src/config/fb';
import { ref, update } from 'firebase/database';

const EditPerfil = () => {
    const navigation = useNavigation();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [originalData, setOriginalData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (currentUser) {
            const uid = currentUser.uid;
            searchPatientByUid(uid)
                .then(data => {
                    if (data) {
                        setEmail(data.email);
                        setTelefono(data.telefono);
                        setDireccion(data.direccion);
                        setOriginalData(data); // Guardar los datos originales
                    }
                })
                .catch(error => console.error("Error al cargar datos del paciente:", error));
        } else {
            console.error("Usuario no autenticado");
        }
    }, [currentUser]);

    const validateFields = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Correo electrónico no puede estar vacío';
        if (!telefono.trim()) newErrors.telefono = 'Teléfono no puede estar vacío';
        if (!direccion.trim()) newErrors.direccion = 'Dirección no puede estar vacía';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleGuardar = () => {
        if (validateFields() && (email !== originalData.email || telefono !== originalData.telefono || direccion !== originalData.direccion)) {
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: 'Confirmación',
                textBody: '¿Estás seguro de guardar los cambios?',
                button: 'Sí',
                onPressButton: checkEmailAvailability,
            });
        } else {
            Dialog.show({
                type: ALERT_TYPE.INFO,
                title: 'Sin Cambios',
                textBody: 'No se detectaron cambios en el perfil.',
                button: 'OK'
            });
        }
    };

    const checkEmailAvailability = async () => {
        if (email !== originalData.email) {
            try {
                const methods = await fetchSignInMethodsForEmail(auth, email);
                if (methods.length > 0) {
                    Dialog.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: 'El correo electrónico ya está registrado.',
                        button: 'OK',
                    });
                } else {
                    updateProfile(); // Procede con la actualización si el correo está disponible
                }
            } catch (error) {
                Dialog.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: `Error al comprobar el correo: ${error.message}`,
                    button: 'OK',
                });
            }
        } else {
            updateProfile(); // Procede directamente si el correo no ha cambiado
        }
    };

    const updateProfile = async () => {
        const uid = currentUser.uid;
        const updates = {};

        if (email !== originalData.email) {
            try {
                await updateEmailForPatient(uid, email);
                updates.email = email;
            } catch (error) {
                Dialog.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: `Error al actualizar el correo: ${error.message}`,
                    button: 'OK',
                });
                return;
            }
        }
        if (telefono !== originalData.telefono) {
            updates.telefono = telefono;
        }
        if (direccion !== originalData.direccion) {
            updates.direccion = direccion;
        }

        // Realiza la actualización en la base de datos
        try {
            await update(ref(db, `paciente/${uid}`), updates);
            Dialog.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Éxito',
                textBody: 'Perfil actualizado correctamente',
                button: 'OK',
                onPressButton: () => navigation.goBack()
            });
        } catch (error) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: `Error al actualizar perfil: ${error.message}`,
                button: 'OK',
            });
        }
    };

    return (
        <AlertNotificationRoot>
            <View style={styles.wrapper}>
            <View style={styles.rectangulo}>
                <TouchableOpacity onPress={() => router.back()} style={styles.touchable}>
                    <View style={styles.icono}>
                        <Entypo name="chevron-left" size={24} color="white" />
                    </View>
                    <Text style={styles.textoVolver}>Volver</Text>
                </TouchableOpacity>
            </View>

                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.title}>Actualizar datos.</Text>

                    <View style={[styles.inputContainer, errors.email && styles.inputContainerError]}>
                        <MaterialIcons name="email" size={24} color="#37817A" style={styles.icon} />
                        <Input
                            placeholder="Ingresa tu correo"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            inputStyle={styles.input}
                            containerStyle={{ flex: 1 }}
                            errorMessage={errors.email}
                            errorStyle={styles.errorText}
                        />
                    </View>

                    <View style={[styles.inputContainer, errors.telefono && styles.inputContainerError]}>
                        <FontAwesome name="phone" size={24} color="#37817A" style={styles.icon} />
                        <Input
                            placeholder="Ingresa tu teléfono"
                            value={telefono}
                            onChangeText={setTelefono}
                            keyboardType="phone-pad"
                            inputStyle={styles.input}
                            containerStyle={{ flex: 1 }}
                            errorMessage={errors.telefono}
                            errorStyle={styles.errorText}
                        />
                    </View>

                    <View style={[styles.inputContainer, errors.direccion && styles.inputContainerError]}>
                        <Entypo name="location-pin" size={24} color="#37817A" style={styles.icon} />
                        <Input
                            placeholder="Ingresa tu dirección"
                            value={direccion}
                            onChangeText={setDireccion}
                            inputStyle={styles.input}
                            containerStyle={{ flex: 1 }}
                            errorMessage={errors.direccion}
                            errorStyle={styles.errorText}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.buttonGuardar} onPress={handleGuardar}>
                            <Text style={styles.buttonTextGuardar}>Guardar Cambios</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonCancelar} onPress={() => navigation.goBack()}>
                            <Text style={styles.buttonTextCancelar}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </AlertNotificationRoot>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#fff',
    },
    rectangulo: {
        paddingTop: 20,
        width: '100%',
        height: 80,
        backgroundColor: '#2A2A2E',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 30,
    },
    touchable: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textoVolver: {
        fontFamily: 'CeraRoundProBlack',
        fontSize: 22,
        color: 'white',
        marginLeft: 5,
    },
    container: {
        flexGrow: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#ccc",
        borderWidth: 2,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    inputContainerError: {
        borderColor: "red",
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 55,
        fontSize: 16,
        fontFamily: "CeraRoundProRegular",
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginLeft: 10,
    },
    infoTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F6F3', // Fondo con un color suave
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginTop: 20,
    },
    infoTextIcon: {
        marginRight: 10,
        color: '#45B5A9', // Color del ícono
    },
    infoText: {
        fontSize: 14,
        color: '#37817A',
        textAlign: 'center',
        fontFamily: "CeraRoundProBold",
        flexShrink: 1, // Para que el texto se ajuste al tamaño disponible
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    buttonGuardar: {
        backgroundColor: "#37817A",
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: "center",
        height: 45,
        width: '48%',
    },
    buttonTextGuardar: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "CeraRoundProBlack",
    },
    buttonCancelar: {
        backgroundColor: "#fff",
        borderColor: "#45B5A9",
        borderWidth: 2,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: "center",
        height: 45,
        width: '48%',
    },
    buttonTextCancelar: {
        color: "#45B5A9",
        fontSize: 16,
        fontFamily: "CeraRoundProBlack",
    },
});

export default EditPerfil;
