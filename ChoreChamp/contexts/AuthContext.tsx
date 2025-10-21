

// https://firebase.google.com/docs/auth/web/start/
// https://react.dev/reference/react/createContext/
// https://react.dev/reference/react/useContext/
// https://modularfirebase.web.app/reference/auth/
// https://firebase.google.com/docs/firestore/manage-data/add-data/
// https://modularfirebase.web.app/common-use-cases/firestore/
// https://docs.expo.dev/versions/latest/sdk/auth-session/ 
// https://docs.expo.dev/guides/authentication/
// https://firebase.google.com/docs/auth/web/google-signin/
// https://docs.expo.dev/versions/latest/sdk/constants/

import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import type { AppUser } from "@/types/types";   
import { createContext, useEffect, useState, useMemo } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { useContext } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

// Load client IDs from app config for google login
const EXTRA = (Constants.expoConfig?.extra ?? {}) as {
    ANDROID_CLIENT_ID: string;
    IOS_CLIENT_ID: string;
    WEB_CLIENT_ID: string;
}

export type AuthContextType = {
    user: FirebaseUser | null; 
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    logOut: () => Promise<void>;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
        androidClientId: EXTRA.ANDROID_CLIENT_ID,
        iosClientId: EXTRA.IOS_CLIENT_ID,
        webClientId: EXTRA.WEB_CLIENT_ID,
        scopes: ['profile', 'email'],
    });

    useEffect(() => {
        const unsubscribeAuthListener = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser) {
                const ref = doc(db, 'users', firebaseUser.uid);
                const snapshot = await getDoc(ref);

                if (!snapshot.exists()) {
                    const docData: AppUser = {
                        name: firebaseUser.displayName ?? "", 
                        language: "nb",
                        profilePicture: firebaseUser.photoURL ?? "",
                        householdId: [],
                        role: { admin: true },
                        createdAt: serverTimestamp() as unknown as Timestamp,
                    };
                    await setDoc(ref, docData);
                }
            }
        });
        return unsubscribeAuthListener;
    }, []);

    const value = useMemo<AuthContextType>(() => ({
        user,
        loading,
        async signIn(email, password) {
            await signInWithEmailAndPassword(auth, email, password);
        },

        async signUp(email, password, displayName) {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            if (displayName) {
                await updateProfile(credential.user, { displayName });
            }
      },
      async logOut() {
        await signOut(auth);
      },
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
      
