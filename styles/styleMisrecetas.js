import { StyleSheet } from 'react-native';


const textColor = '#000';
const textColor2 = '#FFFFFF';
const inputBackgroundColor = '#FFFFFF';

const cardBackgroundColor = '#FFFFFF';
const cardProgressColor = '#999999';
const modalBackgroundColor = '#FFFFFF';
const modalTextColor = '#000000';

const modalBackgroundTITLES = '#FFFFFF';

const styles = StyleSheet.create({
  container: {
    
    
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
   
    width: '100%',
  },
  menuIcon: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 22,
    color: textColor,
    fontFamily: 'CeraRoundProBlack',
    textAlign: 'center',
    flex: 1,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    width: '90%',
    height: 55,
    backgroundColor: inputBackgroundColor,
    borderRadius: 20,
    paddingHorizontal: 8,
    alignSelf: 'center',
     borderWidth: 1, // Ancho del borde
  borderColor: '#ccc', // Color del borde suave
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: textColor,
    fontFamily: 'CeraRoundProRegular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginLeft:'5%',
    width: '90%',
    height: 30,
    alignSelf: 'left',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: '100%',
  },
  buttonText: {
    fontSize: 13.5,
    color: textColor,
    fontFamily: 'CeraRoundProLight',
  },
  recyclerViewContainer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: cardBackgroundColor,
  
    flexDirection: 'column',
    fontFamily: 'CeraRoundProRegular',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  cardTopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 24,
    marginTop: 10,
    color: textColor,
    fontFamily: 'CeraRoundProBlack',
  },
  cardText: {
    fontSize: 17,
    color: textColor,
    fontFamily: 'CeraRoundProLight',
  },
  cardBottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cardDate: {
    fontSize: 15,
    color: textColor,
    fontFamily: 'CeraRoundProRegular',
  },
  cardProgressContainer: {
    marginTop: 10,
  },
  cardProgress: {
    width: '100%',
    height: 10,
    backgroundColor: cardProgressColor,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 20,
  },
  modalView: {
    margin: 20,
    marginTop: 90,
    backgroundColor: modalBackgroundColor,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    width: '90%',
    height: '70%',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 30,
  },
  header1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerText1: {
    fontFamily: 'CeraRoundProBlack',
    fontSize: 20,
    color: modalTextColor,
    textAlign: 'center', // Añadido para centrar el texto
    flex: 1, // Añadido para que el texto ocupe el espacio disponible
  },
  separator: {
    width: '100%',
    height: 2,
    borderRadius: 12,
    backgroundColor: 'black',
    marginBottom: 20,
    marginTop:8,
  },
  modalTextTitle: {
    fontFamily: 'CeraRoundProBlack',
    fontSize: 22,
   
    marginBottom: 15,
    textAlign: 'Left',
    paddingBottom:0,
  },
  modalTextSubtitle:{
  fontSize:16,
    paddingTop:5,
    padding: 8,
    width: 'auto',
    
    
    paddingBottom:10,
  },
  modalTextSubtitle2:{
    
      paddingTop:5,
      padding: 8,
      width: 'auto',
      
     
      paddingBottom:10,
    },
  modalText: {
    fontWeight: 'bold',
    
    color: modalTextColor,
    fontFamily: 'CeraRoundProLight', // Usando la tipografía
    fontSize: 14,
    paddingBottom:5,
    paddingTop:8,
  },
  modalMed: {
    marginBottom: 10,
  },
  card1: {
    marginTop: 10,
    fontFamily: 'CeraRoundProBlack',
    backgroundColor: modalBackgroundTITLES,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1.5, // Ancho del borde
    borderColor: 'black', // Color del borde
    padding: 15,
    
  },
  cardDetailValue2:{
    backgroundColor: '#F0DEDE',
    borderRadius: 8,
    padding: 10,
    width: 'auto',
    fontSize: 18,
    fontFamily: 'CeraRoundProRegular',
  },
  reminderContainer: {
    backgroundColor: '#37817A',
    borderRadius: 8,
    padding:8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
},
reminderText: {
    fontFamily: 'CeraRoundProMedium',
    fontSize: 16,
    color:'white',
},
reminderIcon: {
    marginLeft: 40,
},


  
  
});

export default styles;


