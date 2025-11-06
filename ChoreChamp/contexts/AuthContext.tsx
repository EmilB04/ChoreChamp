

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

// React imports
import { createContext, useContext, useEffect, useState, useMemo } from "react";

// Firebase Auth imports
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithCredential,
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";

// Firebase Firestore imports
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";

// Expo imports
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as AuthSession from "expo-auth-session";

// Local imports
import { auth, db } from "@/lib/firebase";
import type { AppUser } from "@/types/types";

WebBrowser.maybeCompleteAuthSession();

// Load client IDs from app config for google login
const EXTRA = (Constants.expoConfig?.extra ?? {}) as {
    ANDROID_CLIENT_ID: string;
    IOS_CLIENT_ID: string;
    WEB_CLIENT_ID: string;
}

// 
const redirectUri = AuthSession.makeRedirectUri({
    scheme: "chorechamp",
});
console.log("Actual Redirect URI for Expo Go:", redirectUri);

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
        scopes: ['openid', 'profile', 'email'],
        
        redirectUri

    });

    useEffect(() => {
        (async () => {
            if (googleResponse?.type === 'success') {
                const idToken = googleResponse.authentication?.idToken ?? googleResponse.params?.id_token;
                if (idToken) {
                    const credential = GoogleAuthProvider.credential(idToken);
                    await signInWithCredential(auth, credential);
                }
            }
        })();
    }, [googleResponse]);


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
        async signInWithGoogle() {
            await googlePromptAsync({ showInRecents: true });
        }
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

