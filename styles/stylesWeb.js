import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({

// INICIO - ESTILOS PARA WEB
textArea: {
  height: 150,
  justifyContent: "flex-start",
  textAlignVertical: 'top', // Alinea el texto en la parte superior del área
  borderColor: 'gray',
  borderWidth: 1,
  padding: 10,
},
inputM: {
  borderColor: 'grey',
  borderWidth: 1,
  paddingHorizontal: 10,
  padding:8,
  borderRadius:3,
},

container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily:'CeraRoundProRegular',
  },
  containerTable:{
    flex:1,
  },
  table: {
    borderWidth: 1,
    borderColor: 'black',
    margin: 10,
    flex: 1,
  },
  card: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    shadowColor: 'blue', // Color de la sombra
    shadowOffset: { width: 0, height: 5 }, // Posición de la sombra
    shadowOpacity: 0.75, // Opacidad de la sombra
    shadowRadius: 5, // Radio de la sombra
    elevation: 5, // Efecto de elevación en Android
    alignItems:'center',
    alignSelf:'center',
  },
  
  
    row: {
  
      flexDirection: 'row',
      justifyContent: 'center', // Centrar contenido horizontalmente
    },
    column: {
      flex: 1,
      alignItems: 'center', // Centrar contenido verticalmente
    },
    button: {
      backgroundColor: 'green',
      padding: 10,
      borderRadius: 20,
      width: 300,
    },
    buttonText: {
      color: 'white',
      textAlign: 'center',
      flex:1,
    },
  list: {
    marginTop: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    fontFamily:'CeraRoundProRegular',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  cell: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellColor:{
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:"#E8F4FC",
  },
  headerCell: {
    backgroundColor: '#2D86C0',
  },
  cellText: {
    textAlign: 'center',
    fontFamily:'CeraRoundProRegular',
    fontWeight: 'bold',
  },
  cellTextColor: {
    color: "white",
    textAlign: 'center',
    fontFamily:'CeraRoundProRegular',
    
  },
  
  
  
  inputContainer: {
      backgroundColor: '#D9D9D9',
      borderColor: '#D9D9D9',
      borderWidth: 1,
    },
    navbar: {
      backgroundColor: '#2A2A2E',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
    },
    logo: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      fontFamily:'CeraRoundProRegular',
    },
    profileIcon: {
      color: 'white',
    },
  
    scrollContainer: {
      flexGrow: 1,
      backgroundColor: '#345DF5',
      justifyContent: 'flex-start',
      paddingBottom: 20,
  
    },
    container: {
      flexGrow: 1,
      backgroundColor: 'white', // Añadido para que la vista tenga fondo blanco
      justifyContent: 'flex-start',
      paddingBottom: 20,
  
    },
    navbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal:10,
      padding: 20,
      backgroundColor: '#2A2A2E',
    },
    logo: {
      fontSize: 24,
      color: 'white',
      fontFamily: 'CeraRoundPro-Bold',
      marginLeft:10,
    },
    profileIcon: {
      fontSize: 20,
      color: 'white',
      marginRight:10,
    },
    leftContainer: {
      flexDirection: 'row', // Coloca el ícono y el texto en una fila
      alignItems: 'center', // Alinea verticalmente el ícono y el texto
    },
    centeredContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    name: {
      fontSize: 50,
      fontFamily:'CeraRoundProRegular',
      color: 'white',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 24,
      fontFamily: 'CeraRoundPro-Light',
      color: 'white',
      marginBottom: 20,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
      
      width: 500,
      fontFamily:'CeraRoundProRegular',
    },
    search: {
      marginBottom: 10,
    },
    input: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 20,
      marginRight: 10,
      color: 'black',
      backgroundColor: 'white',
      flex: 1,
      fontFamily:'CeraRoundProRegular',
    },
    searchIcon: {
      fontSize: 20,
      color: 'white',
    },
    content: {
      padding: 20,
    },
    heading: {
      fontSize: 24,
      marginBottom: 20,
    },
    bold: {
      fontWeight: 'bold',
    },
    formContainer: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    column: {
      flex: 1,
      padding: 5,
    },
    icon: {
      alignSelf: 'center',
      marginBottom: 10,
    },
    label: {
      fontSize: 16,
      marginBottom: 10,
      textAlign: 'left',
      fontWeight: 'bold',
      fontFamily: 'CeraRoundProRegular',
    },
    pacienteData: {
      fontWeight: 'normal', // Quita la negrita del texto de pacienteData
      color: 'black', // Color del texto (ajústalo si es necesario)
    },
    emptyColumn: {
      flex: 1,
    },
    column8: {
      flex: 8,
      alignItems: 'center', // Centrar verticalmente el textarea
    },
    textarea: {
      width: 600,
      alignSelf: 'center',
      borderRadius: 20,
      marginBottom: 20,
      backgroundColor: '#D9D9D9',
      borderWidth: 1,
      borderColor: 'black',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'black',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      marginBottom: 20,
      alignSelf: 'center',
    },
    addIcon: {
      fontSize: 20,
      color: 'white',
      marginRight: 10,
    },
    addText: {
      fontSize: 16,
      color: 'white',
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    button: {
      alignItems: 'center',
      borderRadius: 20,
      marginHorizontal: 5,
      width: '100%', // Ancho de los botones
      padding:10,
    },
    sendButton: {
      backgroundColor: '#345df5',
    },
    cancelButton: {
      backgroundColor: '#FF3131',
    },
    buttonText: {
      fontSize: 18,
      color: 'white',
    },
   buttonAggMedicamento:{
    backgroundColor:'#345DF5',
    color:'white',
    fontFamily: 'CeraRoundProRegular',
   },
   medicamento: {
    backgroundColor:'#DBD9D9',
    marginBottom: 10,
   },
   tarjetas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'left', // Para distribuir uniformemente las tarjetas
    marginBottom: 20, // Ajuste para separación inferior
    paddingHorizontal: 10, // Añadir un poco de espacio horizontal
    textDecorationLine:'none',
    
  },
  box: {
    width: '40%', // Aproximadamente la mitad del contenedor, ajustado para margen
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 20, // Aumentar el padding vertical para espacio interior
    paddingHorizontal: 15, // Aumentar el padding horizontal para espacio interior
    shadowColor: '#000', // Cambiado a un color negro más suave para la sombra
    shadowOffset: { width: 0, height: 1 }, // Sombra menos pronunciada
    shadowOpacity: 0.1, // Opacidad reducida para una sombra más sutil
    shadowRadius: 4, // Radio de la sombra ajustado
    elevation: 3, // Ajuste para menor elevación en Android
    alignItems: 'center',
    margin: 8, // Ajuste para la separación vertical entre tarjetas
    textDecorationLine:'none',
    
  },
    // Estilos para el modal personalizado
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  // FINAL - ESTILOS PARA WEB
 
  });
  
export default styles;