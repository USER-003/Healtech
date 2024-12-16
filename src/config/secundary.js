import { initializeApp }  from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, fetchSignInMethodsForEmail } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.apiKey,
  authDomain: Constants.expoConfig.extra.authDomain,
  databaseURL:Constants.expoConfig.extra.databaseURL,
  projectId: Constants.expoConfig.extra.projectId,
  storageBucket: Constants.expoConfig.extra.storageBucket,
  messagingSenderId: Constants.expoConfig.extra.messagingSenderId,
  appId: Constants.expoConfig.extra.appId
};

const app = initializeApp(firebaseConfig, "Secondary"); // Inicializar
const db = getDatabase(app); // Realtime Database
const secundario = getAuth(app); // Authentication

export { db, secundario, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, fetchSignInMethodsForEmail };
