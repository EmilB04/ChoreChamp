import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import * as FirebaseAuth from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// https://firebase.google.com/docs/web/setup
// https://docs.expo.dev/guides/using-firebase/ 

const firebaseConfig = {
  apiKey: "AIzaSyA_bhFiyDRwsswKsxgsBKQVP20O68oKOSs",
  authDomain: "chorechamp-a000a.firebaseapp.com",
  projectId: "chorechamp-a000a",
  storageBucket: "chorechamp-a000a.appspot.com", 
  appId: "1:958373042769:web:eca54d4aa785681900f670",
  // measurementId: "G-3GY9VYLJHE",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
try {
  auth = (FirebaseAuth as any).initializeAuth(app, {
    persistence: (FirebaseAuth as any).getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = FirebaseAuth.getAuth(app);
}

export { auth };
export const db = getFirestore(app);
