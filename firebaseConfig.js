// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: 'pelikirjasto-78f68.firebaseapp.com',
  databaseURL: 'https://pelikirjasto-78f68-default-rtdb.firebaseio.com',
  projectId: 'pelikirjasto-78f68',
  storageBucket: 'pelikirjasto-78f68.firebasestorage.app',
  messagingSenderId: '738064481651',
  appId: '1:738064481651:web:d19d98a53d1fcd81f9d906',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
