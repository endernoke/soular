import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD16YldlbL-maZILv-dJ61stuSNGqBDwKU",
  authDomain: "soular-app.firebaseapp.com",
  projectId: "soular-app",
  storageBucket: "soular-app.firebasestorage.app",
  messagingSenderId: "502515877215",
  appId: "1:502515877215:web:501e4cf827082d9c1a22ea",
  measurementId: "G-ZGHF7QRYRX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
