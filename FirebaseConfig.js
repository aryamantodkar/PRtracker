import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {getFirestore} from "firebase/firestore";

export const provider = new GoogleAuthProvider()
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

const firebaseConfig = {
  apiKey: "AIzaSyDHlGDpPYmRHLLj3uUWtRsOQL9oJmNKexk",
  authDomain: "prtracker-20ef6.firebaseapp.com",
  projectId: "prtracker-20ef6",
  storageBucket: "prtracker-20ef6.appspot.com",
  messagingSenderId: "300959691005",
  appId: "1:300959691005:web:3c32fe90e784640ed84e94",
  measurementId: "G-MYC10YW36W"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);