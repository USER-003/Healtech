import React from "react";
import { Slot } from "expo-router";
import { DataProvider } from "./views/movil/doctor/DataContext";

const RootLayout = () => {
  return (
    <DataProvider>
      <Slot />
    </DataProvider>
  );
};

export default RootLayout;
