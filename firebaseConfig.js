// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: 'pelikirjasto-cf54d.firebaseapp.com',
  databaseURL: 'https://pelikirjasto-cf54d-default-rtdb.firebaseio.com',
  projectId: 'pelikirjasto-cf54d',
  storageBucket: 'pelikirjasto-cf54d.firebasestorage.app',
  messagingSenderId: '274522609079',
  appId: '1:274522609079:web:3c31a31a9c138b22c78432',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
