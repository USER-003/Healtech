import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  // Se eliminaron los estilos relacionados con el rectángulo de "Volver"
  inputContainer: {
    paddingTop:50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    paddingHorizontal: 10,
    alignSelf: "center",
    width: "90%",
    borderRadius: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  calendarButton: {
    marginLeft: 10,
    padding: 10, // Aumenta el área táctil
  },
  clearIcon: {
    marginLeft: 10,
    padding: 5, // Aumenta el área táctil
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
  },
  modalContent: {
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  calendar: {
    borderRadius: 10,
  },
  // Contenedor para los botones "Cancelar" y "Guardar"
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 30,
  },
  // Estilos para el botón "Cancelar"
  cancelButton: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#45B5A9",
    marginRight: 5,
  },
  cancelButtonText: {
    color: "#45B5A9",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Estilos para el botón "Guardar"
  saveButton: {
    flex: 1,
    backgroundColor: "#45B5A9",
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 5,
  },
  saveButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  diagnosisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  medicamentoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recyclerView: {
    alignSelf: "center",
    width: "90%",
    marginRight: 5,
    marginLeft: 10,
    paddingHorizontal: 10,
    marginTop: 35,
    paddingBottom: 20,
  },
  card: {
    marginTop: 10,
    backgroundColor: "white",
    marginBottom: 15,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 15,
  },
  cardDetailTitle: {
    fontWeight: "bold",
    marginRight: 5,
    padding: 5,
    color: "black",
    fontFamily: "CeraRoundProBlack",
    fontSize: 10,
  },
  cardDetailValue: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    width: "auto",
    fontSize: 18,
    fontFamily: "CeraRoundProBlack",
  },
  cardDetailValue2: {
    backgroundColor: "#D9D9D9",
    padding: 10,
    width: "auto",
    fontSize: 18,
    fontFamily: "CeraRoundProLight",
  },
  cardBack: {
    width: "auto",
    height: 100,
    backgroundColor: "#D9D9D9",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },

  cardText: {
    color: "black",
    fontSize: 16,
    fontFamily: "CeraRoundProBlack",
  },
});

export default styles;

