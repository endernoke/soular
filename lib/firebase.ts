import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  initializeAuth,
  getReactNativePersistence,
  ReactNativeAsyncStorage  // This is a workaround, see this for details: https://github.com/firebase/firebase-js-sdk/issues/8020#issuecomment-1970966119
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
const asyncStorage = AsyncStorage as unknown as ReactNativeAsyncStorage;
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(asyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);