import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDk9ugiZd0qIiIR594qxrCwFKM2I13uEaU",
  authDomain: "herwellness-814e1.firebaseapp.com",
  projectId: "herwellness-814e1",
  storageBucket: "herwellness-814e1.firebasestorage.app",
  messagingSenderId: "469025978843",
  appId: "1:469025978843:web:9c20db6d333003bb420ffe",
  measurementId: "G-EVBMQGJ1FM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);