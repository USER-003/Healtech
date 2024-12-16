import React, { createContext, useState } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [identificacion, setData] = useState(""); // Identificación (DUI) para paciente o doctor
  const [modo, setModo] = useState("");
  const [evaluacion, setEvaluacion] = useState("");
  const [farmacos, setFarmacos] = useState("[]");
  const [dui, setDui] = useState(""); // Nuevo estado para DUI
  const [searchState, setSearchState] = useState(null);

  return (
    <DataContext.Provider
      value={{
        identificacion,
        setData,
        modo,
        setModo,
        evaluacion,
        setEvaluacion,
        farmacos,
        setFarmacos,
        dui,
        setDui, // Proporciona el setter y el valor del DUI
        searchState,
        setSearchState, // Provide the setter and value for searchState
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
