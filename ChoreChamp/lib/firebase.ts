// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// https://firebase.google.com/docs/web/setup

const firebaseConfig = {
  apiKey: "AIzaSyA_bhFiyDRwsswKsxgsBKQVP20O68oKOSs",
  authDomain: "chorechamp-a000a.firebaseapp.com",
  projectId: "chorechamp-a000a",
  // storageBucket: "chorechamp-a000a.appspot.com", 
  appId: "1:958373042769:web:eca54d4aa785681900f670",
  // measurementId: "G-3GY9VYLJHE",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
