import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get, child } from "firebase/database";
import { db } from "../../../../src/config/fb";
import { useRouter } from "expo-router";
import Swal from "sweetalert2";
import validarClinicaAsociada from "../../../../src/queryfb/admin/checkClinicaAsociada";

const ProtectedRegister = ({ allowedRoles, skip, children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();
  const router = useRouter();

  // Función para obtener el rol del usuario
  const fetchUserRole = async (userUid) => {
    const dbRef = ref(db);
    let snapshot = await get(child(dbRef, `admin/${userUid}`));
    if (snapshot.exists()) return { role: "admin" };

    snapshot = await get(child(dbRef, `doctor/${userUid}`));
    if (snapshot.exists()) return { role: "doctor" };

    snapshot = await get(child(dbRef, `paciente/${userUid}`));
    if (snapshot.exists()) return { role: "paciente" };

    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userInfo = await fetchUserRole(user.uid);
          if (userInfo) {
            const { role } = userInfo;

            // Validar rol del usuario
            if (!allowedRoles.includes(role)) {
              router.replace("/views/web/sesion/Desautorizado");
              return;
            }

            // Si el usuario es admin, verificar si tiene una clínica asociada
            if (role === "admin" && !skip === true) {
              const clinicaAsociada = await validarClinicaAsociada(user.uid);

              if (clinicaAsociada) {
                // Si ya tiene una clínica, no puede crear otra, redirigir al dashboard
                Swal.fire({
                  title: "Ya tienes una clínica registrada",
                  text: "No puedes registrar otra clínica.",
                  icon: "info",
                });
                router.replace("/views/web/admin/DashBoard");
                return;
              }
            }
          } else {
            // Si no se encontró rol, redirigir al login
            router.replace("/views/web/sesion/Login");
            return;
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario:", error);
          router.replace("/views/web/sesion/Login");
          return;
        }
      } else {
        // Si no hay sesión activa, redirigir al login
        router.replace("/views/web/sesion/Login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, allowedRoles, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
};

export default ProtectedRegister;
