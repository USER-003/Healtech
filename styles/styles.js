import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    navbar:{
        backgroundColor: "#2A2A2E",
    },
    container: {
      flexGrow: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingBottom: 20,
      backgroundColor: 'white',
      flexGrow: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingBottom: 20,
      backgroundColor: 'white',
  },
  containerAnimated: {
    flexGrow: 1,
    
  },
  rectangle: {
      width: 420,
      height: 214,
      backgroundColor: '#345DF5',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      marginTop: 0,
      padding: 20,
  },
  welcomeText: {
      fontFamily: 'CeraRoundProBlack',
      fontSize: 28,
      color: 'white',
      marginTop: 30,
      marginLeft: 20,
      marginBottom: -8,
  },
  doctorText: {
      fontFamily: 'CeraRoundProLight',
      fontSize: 24,
      marginLeft: 24,
      color: 'white',
      marginBottom: 10,
  },
  searchContainer: {
      flexDirection: 'row',
      height: 50,
      width: 310,
      alignItems: 'center',
      justifyContent: 'center',
  },
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: '#ccc',
      borderWidth: 1,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      height: 50,
      marginLeft: 60,
      width: 230,
      backgroundColor: 'white',
  },
  icon: {
      marginLeft: 10,
      marginRight: 5,
  },
  textInput: {
      flex: 1,
      padding: 10,
  },
  clearButton: {
      padding: 10,
  },
  menuButton: {
      height: 50,
      width: 130,
      borderWidth: 1,
      borderColor: '#ccc',
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
  },
  menuButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  dropdownMenu: {
      position: 'absolute',
      top: 50,
      left: 235,
      width: 130,
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      zIndex: 40,
  },
  option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      zIndex: 2,
  },
  optionText: {
      fontSize: 16,
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 5,
      zIndex: 2,
      fontFamily: 'CeraRoundProRegular',
      zIndex: -40,
  },
  optionText4w: {
      fontSize: 18,
      flex: 1,
      textAlign:'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
      zIndex: 2,
      fontFamily: 'CeraRoundProRegular',
      zIndex: -40,
      fontSize: 18,
  },
  doctorMenuButton: {
      height: 50,
      width: '90%',
      borderWidth: 1,
      borderColor: '#ccc',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      backgroundColor: 'white',
      borderRadius: 6,
      marginTop: 20,
      zIndex: -40,
  },
  doctorDropdownMenu: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 10,
      marginTop: 4,
    
      zIndex: -40,
  },
  doctorInfoText: {
      fontSize: 8,
      color: 'black',
      fontFamily: 'CeraRoundProLight',
      marginBottom: 5,
  },
  doctorInfoField: {
    borderWidth: 1,
    borderColor:'#000',
      borderRadius: 10,
      padding: 8,
      width: '97%',
      fontFamily: 'CeraRoundProRegular',
      fontSize: 16,
      marginBottom: 4,
  },
  patientMenuButton: {
      height: 50,
      width: '90%',
      borderWidth: 1,
      borderColor: '#ccc',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      backgroundColor: 'white',
      borderRadius: 6,
      marginTop: 20,
  },
  labelText:{
      fontSize: 9,
      color: 'black',
      fontFamily: 'CeraRoundProLight',
      marginBottom: 5,
  },
  patientDataField: {
    borderWidth: 1,
    borderColor:'#000',
      borderRadius: 10,
      padding: 8,
      width: '100%',
      fontFamily: 'CeraRoundProRegular',
      fontSize: 16,
      marginBottom: 4,
  },
  patientDropdownMenu: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 10,
      marginTop: 4,
  },
  patientInfoText: {
      fontSize: 16,
      fontFamily: 'CeraRoundProRegular',
      marginBottom: 5,
  },
  flexRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
  },
  patientDataFieldHalf: {
      flex: 0.4,
  },
  medicalHistoryButton: {
      flex: 0.48,
      backgroundColor: '#345DF5',
      borderRadius: 8,
      padding: 9,
      marginTop: 13,
      alignItems: 'center',
  },
  medicalHistoryButtonText: {
      color: 'white',
      fontFamily: 'CeraRoundProBlack',
      textAlign: 'center',
  },
  medicalHistoryButton: {
      flex: 0.48,
      backgroundColor: '#345DF5',
      borderRadius: 8,
      padding: 9,
      marginTop: 13,
      alignItems: 'center',
  },
  medicalHistoryButtonText: {
      color: 'white',
      fontFamily: 'CeraRoundProBlack',
      textAlign: 'center',
  },
  bigCenteredText: {
      fontSize: 25, // Tamaño de fuente 25
      fontFamily: 'CeraRoundProBlack', // Usar la fuente CeraRoundProBlack
      textAlign: 'center', // Centrado
      marginVertical: 20, // Margen superior e inferior para separación
  },
  editorWrapper: {
      width: 330, // Ancho deseado para el contenedor del editor
      alignSelf: 'center',
      borderRadius: 8,
  },
  richEditorContainer: {
      width: '700',
      height: 200,
      backgroundColor: '#F0DEDE',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      marginTop: 20,
      alignSelf: 'center',
  },
  richToolbar: {
      color: 'white',
      borderRadius: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F0DEDE',
      paddingBottom: 5,
  },
  richEditor: {
      flex: 1,
      padding: 10,
      fontSize: 16,
      color: 'white',
      fontFamily: 'CeraRoundProRegular',
  },
  addMedicineButton: {
      marginTop: 20, // Espacio superior para separar el botón del editor de texto
      backgroundColor: 'black', // Color de fondo del botón
      paddingVertical: 15, // Padding vertical para agrandar el botón
      paddingHorizontal: 60, // Padding horizontal para que sea ancho
      borderRadius: 8, // Borde redondeado de 20
      alignItems: 'center', // Centra el texto en el botón
      justifyContent: 'center', // Centra el texto verticalmente
  },
  addMedicineButtonText: {
      fontFamily: 'CeraRoundProBlack', // Fuente
      color: 'white', // Color del texto
      fontSize: 18, // Tamaño de fuente
  },
  // Contenedor para la lista de medicamentos
  medicamentosContainer: {
      width: 330,
      backgroundColor: '#FFFFFF',
      borderRadius: 17,
      padding: 10,
      marginTop: 20,
      flexGrow: 1, // Permite que el contenedor se expanda según el contenido
  },
  medicamentosTitle: {
      textAlign: 'center',
      fontFamily: 'CeraRoundProBlack',
      fontSize: 24,
      marginBottom: 10,
      color: 'white',
  },
  // Estilo para los ítems de medicamentos
  medicamentoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 17,
      padding: 10,
      marginBottom: 10,
      justifyContent: 'space-between',
      width: '100%',
  },
  medicamentoNombre: {
      fontFamily: 'CeraRoundProRegular',
      flex: 1,
      marginHorizontal: 10,
  },
  // Estilo para íconos de editar y eliminar
  editIcon: {
      marginRight: 10,
  },
  deleteIcon: {
      marginLeft: 10,
  },
  // Estilo para los botones Enviar y Cancelar
  buttonContainer: {
  marginTop: 10, // Espaciado entre la vista de medicamentos y los botones
  justifyContent: 'center',
  alignItems: 'center',
  },
  // Estilo para el botón Enviar
  enviarButton: {
  backgroundColor: '#345DF5',
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 20,
  marginBottom: 10, // Espaciado entre los botones
  },
  // Estilo para el texto del botón Enviar
  enviarButtonText: {
  fontFamily: 'CeraRoundProBlack',
  color: 'white',
  fontSize: 18,
  textAlign: 'center',
  width:200,
  },
  // Estilo para el botón Cancelar
  cancelarButton: {
  backgroundColor: '#FF3131',
  borderRadius: 10,
  paddingVertical: 8,
  paddingHorizontal: 15,
  width:200,
  },
  // Estilo para el texto del botón Cancelar
  cancelarButtonText: {
  fontFamily: 'CeraRoundProBlack',
  color: 'white',
  fontSize: 16,
  textAlign: 'center',
  },
  modalContainer: {
  backgroundColor: 'white',
  alignItems: 'center',
  borderRadius: 10,
  padding: 20,
  },
  icon2: {
  marginBottom: 20,
  },
  modalTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 10,
  },
  modalText: {
  fontSize: 18,
  marginBottom: 20,
  textAlign: 'center',
  },
  closeButton: {
  backgroundColor: '#FF0000',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 5,
  },
  closeButtonText: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
  },
    rectangle: {
        width: 420,
        height: 214,
        backgroundColor: '#1F4687',

        marginTop: 0,
        padding: 20,
    },
    welcomeText: {
        fontFamily: 'CeraRoundProBlack',
        fontSize: 28,
        color: 'white',
        marginTop: 34,
        marginLeft: 16,
        marginBottom: 10,
    },

    searchContainer: {
        flexDirection: 'row',
        height: 67,
        width: 320,
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 0.5,

        height: 60,
        marginLeft: 60,
        width: 230,
        backgroundColor: 'white',
    },
    icon: {
        marginLeft: 10,
        marginRight: 5,
    },
    textInput: {
        flex: 1,
        padding: 10,
    },
    clearButton: {
        padding: 10,
    },
    menuButton: {
        height: 60,
        width: 115,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',

    },
    menuButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 64,
        left: 248,
        width: 114,

        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ccc',

        zIndex: 40,

    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        zIndex: 2,
    },
    optionText: {
        fontSize: 16,
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 5,
        zIndex: 2,
        fontFamily: 'CeraRoundProRegular',
        zIndex: -40,
    },
    optionText4w: {
        fontSize: 18,
        flex: 1,
        textAlign: 'left',
        justifyContent: 'left',
        marginLeft: 10,
        paddingHorizontal: 5,
        zIndex: 2,
        fontFamily: 'CeraRoundProRegular',
        zIndex: -40,
        fontSize: 18,
    },

    patientMenuButton: {
        height: 60,
        width: '90%',
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'left',
        backgroundColor: 'white',
        marginTop: 20,
        zIndex: -40,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3.84,
        elevation: 5,
    },

    // Añade un nuevo estilo para el contenedor principal del dropdown
    patientDropdownContainer: {
        width: '90%',
        backgroundColor: 'white', // Fondo gris claro
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginTop: -2,
        zIndex: -40,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3.84,
        elevation: 5,
    },

    patientDropdownMenu: {
        backgroundColor: '#D9D9D9', // Fondo blanco para la información del paciente

        padding: 10,

        marginBottom: 60, // Añadido margen inferior para separar el botón del expediente
        zIndex: -40,
    },

    patientDataField: {
        flexDirection: 'row', // Para alinear el ícono y el texto en fila
        alignItems: 'center', // Centrar verticalmente el ícono y el texto
        padding: 8,
        width: '100%',
        marginBottom: 4,
    },

    patientInfoText: {
        marginLeft: 10, // Espacio entre el ícono y el texto
        fontFamily: 'CeraRoundProRegular',
        fontSize: 16,
        color: 'black',
    },
    medicalHistoryButton: {
        position: 'absolute', // Posiciona el botón de manera absoluta
        right: 10, // Alinea el botón a la derecha del contenedor
        bottom: 10, // Alinea el botón en la parte inferior
        backgroundColor: '#37817A',
        borderRadius: 20,
        padding: 9,
        width: 150, // Ancho ajustado para el botón
        height: 45, // Altura del botón
        justifyContent: 'center', // Centrar el texto dentro del botón
        alignItems: 'center', // Centrar el texto dentro del botón
    },

    medicalHistoryButtonText: {
        color: 'white',
        fontFamily: 'CeraRoundProBlack',
        textAlign: 'center', // Centrar texto dentro del botón
    },


    bigCenteredText: {
        marginTop: 26,
        fontSize: 18, // Tamaño de fuente 18
        fontFamily: 'CeraRoundProBlack', // Usar la fuente CeraRoundProRegular
        textAlign: 'left', // Alinear el texto a la izquierda

        marginLeft: 18,
        alignSelf: 'flex-start', // Alinear el texto a la izquierda dentro de su contenedor


    },
    editorWrapper: {
        width: '90%',
        marginLeft: 16, // Margen de 16 a la izquierda
        marginRight: 16, // Margen de 16 a la izquierda
        alignSelf: 'center',
        borderRadius: 8,
    },

    simpleTextInput: {
        width: '100%', // Ocupa todo el ancho disponible en el contenedor
        height: 150, // Mantiene la altura del editor original
        backgroundColor: '#D9D9D9', // Color de fondo
        borderWidth: 1,
        borderColor: '#ccc',

        padding: 10, // Espacio interno
        fontSize: 16, // Tamaño de fuente
        color: 'black', // Color del texto
        fontFamily: 'CeraRoundProRegular', // Fuente personalizada
        textAlignVertical: 'top', // Asegura que el texto empieza desde arriba
    },




    addMedicineButton: {
        marginTop: 20, // Espacio superior para separar el botón del editor de texto
        marginLeft: 16, // Margen izquierdo de 16px
        backgroundColor: '#37817A',
        width: 250, // Ancho ajustado para el botón
        height: 45,
        borderRadius: 20, // Borde redondeado
        alignItems: 'center', // Centra el texto en el botón
        justifyContent: 'center', // Centra el texto verticalmente
        alignSelf: 'flex-start', // Alinear el botón a la izquierda del contenedor
    },


    addMedicineButtonText: {
        fontFamily: 'CeraRoundProBlack', // Fuente
        color: 'white', // Color del texto

    },
    medicamentosTitle: {
        marginTop: 26,
        fontSize: 18, // Tamaño de fuente 18
        fontFamily: 'CeraRoundProBlack', // Usar la fuente CeraRoundProBlack
        textAlign: 'left', // Alinear el texto a la izquierda
        marginLeft: 19, // Margen izquierdo de 18px
        alignSelf: 'flex-start', // Alinear el texto a la izquierda dentro de su contenedor
      },
      
    // Contenedor para la lista de medicamentos
    medicamentosContainer: {
        width: '250',
        backgroundColor: 'white',
        marginTop: 20,
        marginLeft: 25,
        marginRight:25,
        flexGrow: 1, // Permite que el contenedor se expanda según el contenido
    },
  
    // Estilo para los ítems de medicamentos
    medicamentoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        
        padding: 10,
        marginBottom: 0,
        justifyContent: 'space-between',
        width: '105%',
        height:70,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 3.84,
        elevation: 5,
    },
    medicamentoNombre: {
        fontFamily: 'CeraRoundProRegular',
        flex: 1,
        marginHorizontal: 10,
    },
    // Estilo para íconos de editar y eliminar
    editIcon: {
        marginLeft: 10,
    },
    deleteIcon: {
        marginLeft: 10,
    },
    // Estilo para los botones Enviar y Cancelar
    buttonContainer: {
        flexDirection: 'row', // Alinear botones en una fila
        justifyContent: 'space-between', // Espaciar los botones
        marginHorizontal: 20, // Margen horizontal para todo el contenedor
        marginTop: 20, // Espacio superior
      },
      
      enviarButton: {
        backgroundColor: '#37817A',
        borderRadius:20 ,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '48%', // Ancho relativo para ajustar con el botón "Cancelar"
        alignItems: 'center',
        justifyContent: 'center',
      },
      
      cancelarButton: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '48%', // Ancho relativo para ajustar con el botón "Enviar"
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2, // Ancho del borde
        borderColor: "#37817A",
      },
      
      enviarButtonText: {
        fontFamily: 'CeraRoundProBlack',
        color: 'white',
        textAlign: 'center',
      },
      
      cancelarButtonText: {
        fontFamily: 'CeraRoundProBlack',
        color: '#37817A',
        textAlign: 'center',
      },
      


});

export default styles;