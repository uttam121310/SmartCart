import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  

  apiKey: "AIzaSyD54tjLBFVDMfnpQJdf2H_2FNH3aDfY4Fk",
  authDomain: "smartcart-95e97.firebaseapp.com",
  projectId: "smartcart-95e97",
  storageBucket: "smartcart-95e97.firebasestorage.app",
  messagingSenderId: "957607207247",
  appId: "1:957607207247:web:96b9fd482e662a109e253a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);