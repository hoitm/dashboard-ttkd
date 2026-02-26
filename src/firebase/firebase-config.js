// src/firebase/firebase-config.js
import { initializeApp } from "firebase/app";
import { getMessaging }  from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD2SVMDLDvnVnIRSBMfbzubCFQJuWtjt_Y",
  authDomain: "hoitmerprd.firebaseapp.com",
  projectId: "hoitmerprd",
  storageBucket: "hoitmerprd.appspot.com",
  messagingSenderId: "603554851974",
  appId: "1:603554851974:web:d39cf201ddd6b6217f7507",
  measurementId: "G-9XCJBPXSJ0"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
