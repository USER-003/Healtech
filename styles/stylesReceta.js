import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  rectangulo: {
    width: '100%',
    height: 90,
    backgroundColor: 'black',
    flexDirection: 'row', // Alinear elementos horizontalmente
    alignItems: 'center', // Centrar verticalmente los elementos
    paddingHorizontal: 10, // Espaciado horizontal
  },
  icono: {
    marginRight: 5, // Espacio entre el icono y el texto
    paddingTop: 35, // Espacio por encima del icono
  },
  textoVolver: {
    fontFamily: 'CeraRoundProBlack', // Fuente personalizada
    fontSize: 22, // Tamaño de fuente
    color: 'white', // Color de fuente
    paddingTop: 30, // Espacio por encima del texto
  },
  touchable: {
    flexDirection: 'row', // Para alinear el icono y el texto en fila
    alignItems: 'center', // Para alinear verticalmente el contenido en el centro
  },
  textoDebajo: {
    marginTop: 10, // Espacio por encima del texto
    marginLeft: 10, // Espacio a la izquierda del texto
  },
  textoExpediente: {
    fontFamily: 'CeraRoundProBlack', // Fuente personalizada
    fontSize: 22, // Tamaño de fuente
    color: 'white', // Color de fuente
  },
  // Estilos para la caja de datos personales
  datosPersonalesContainer: {
    marginTop: -30,
    marginLeft: 10,
    paddingRight: 10,
    width: width - 20,
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 8,
  },
  recyclerView: {
    alignSelf: 'center',
    width: width - 20,
    marginRight: 5,
    marginLeft: 10,
    paddingHorizontal: 10,
    marginTop: 35,
    paddingBottom: 20,
  },
  datosPersonalesLabel: {
    fontFamily: 'CeraRoundProBlack',
    fontSize: 18,
    marginBottom: 10,
  },
  datosPersonalesTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  datosPersonalesText: {
    fontFamily: 'CeraRoundProRegular',
    fontSize: 10,
    borderRadius: 12,
    padding: 4,
    flex: 1,
    marginRight: 10,
  },
  datosPersonalesTextBackground: {
    fontFamily: 'CeraRoundProBlack',
    fontSize: 13,
    borderRadius: 4,
    padding: 4,
    flex: 1,
    marginRight: 10,
  },
  // Estilos para el contenedor de datos de salud
  datosSaludContainer: {
    marginTop: 20,
    marginLeft: 10,
    paddingRight: 10,
    width: width - 20,
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 8,
  },
  datosSaludLabel: {
    fontFamily: 'CeraRoundProBlack',
    fontSize: 18,
    marginBottom: 10,
  },
  tablaDatosSalud: {
    marginTop: 10,
  },
  datosSaludRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  datosSaludText: {
    fontFamily: 'CeraRoundProRegular',
    fontSize: 13,
    backgroundColor: 'white',
    textAlign: 'center',
    padding: 8,
    flex: 1,
    marginRight: 5,
    borderWidth: 0.1, // Ancho del borde
    borderColor: 'black', // Color del borde negro
  },
  datosSaludText2: {
    color: 'white', // Color de la fuente blanca
    fontFamily: 'CeraRoundProBlack',
    fontSize: 13,
    backgroundColor: '#2D86C0',
    textAlign: 'center',
    padding: 8,
    flex: 1,
    marginRight: 10,
  },
  datosSaludText3: {
    color: 'black', // Color de la fuente blanca
    fontFamily: 'CeraRoundProRegular',
    fontSize: 13,
    backgroundColor: '#E8F4FC',
    textAlign: 'center',
    padding: 8,
    flex: 1,
    marginRight: 5,
    marginTop: -4,
    borderWidth: 0.1, // Ancho del borde
    borderColor: 'black', // Color del borde negro
  },
  // Estilos para la caja de Enfermedades Crónicas
  enfermedadesCronicasContainer: {
    marginTop: -2,
    width: width - 20,
    height: 'auto',
    backgroundColor: 'white',
    padding: 8,
  },
  enfermedadesCronicasLabel: {
    fontFamily: 'CeraRoundProBlack',
    fontSize: 18,
    marginBottom: 10,
    marginLeft: 25,
  },
  tarjetaEnfermedad: {
    marginRight: 10,
    width: '100%',
    height: 64,
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tarjetaTexto: {
    fontFamily: 'CeraRoundProRegular',
    fontSize: 15,
    marginTop: 10,
    textAlign: 'left',
    color: 'black',
  },
  hospitalizacionesContainer: {
    marginTop: 20,
    marginLeft: 10,
    paddingRight: 10,
    width: width - 20,
    height: 'auto',
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 8,
  },
  hospitalizacionesLabel: {
    fontFamily: 'CeraRoundProBlack',
    fontSize: 18,
    marginBottom: 10,
  },
  rowContainer: {
    flexDirection: 'row', // Organiza los elementos en una fila horizontal
    marginBottom: 10, // Espacio entre filas
  },
  tarjetaHospitalizacion: {
    marginRight: 10,
    width: '100%',
    height: 60,
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tarjetaTextoHospitalizacion: {
    fontFamily: 'CeraRoundProRegular',
    fontSize: 15,
    marginTop: 10,
    textAlign: 'left',
    color: 'black',
  },
  iconStyle: {
    position: 'absolute',
    marginRight: 10,
    marginTop: 10,
    right: 10, // Alinea el ícono a la derecha
    top: '50%', // Centra el ícono verticalmente
    transform: [{ translateY: -10 }], // Ajusta la posición vertical
  },
  diagnosticoButton: {
    width: 140,
    height: 46,
    marginLeft: 'auto',
    marginRight: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: '#37817A',
  },
  diagnosticoButtonText: {
    fontFamily: 'CeraRoundProBlack',
    color: 'white',
  },
});

export default styles;




