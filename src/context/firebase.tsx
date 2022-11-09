import { initializeApp } from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { createContext } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyCnR4T_uqELHW-Cp_uH2Dms6eiwJdZmb_U",
  authDomain: "surverysays-260db.firebaseapp.com",
  projectId: "surverysays-260db",
  storageBucket: "surverysays-260db.appspot.com",
  messagingSenderId: "561360856516",
  appId: "1:561360856516:web:3e4f2ef681a330ebc07091",
  measurementId: "G-6G0LEDS7KS",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const firebaseContext = createContext({ app, db });
