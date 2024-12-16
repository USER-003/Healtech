import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  fetchSignInMethodsForEmail, } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.apiKey,
  authDomain: Constants.expoConfig.extra.authDomain,
  databaseURL: Constants.expoConfig.extra.databaseURL || 'https://mock.firebaseio.com', //Para Jest
  projectId: Constants.expoConfig.extra.projectId,
  storageBucket: Constants.expoConfig.extra.storageBucket,
  messagingSenderId: Constants.expoConfig.extra.messagingSenderId,
  appId: Constants.expoConfig.extra.appId
};

// Verificar si Firebase ya está inicializado antes de inicializarlo nuevamente
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getDatabase(app);
const auth = getAuth(app);

export {
  db,
  auth,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
};
