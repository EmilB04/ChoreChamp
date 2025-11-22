

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
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";


// Firebase Auth imports
import type { User as FirebaseUser } from "firebase/auth";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";

// Firebase Firestore imports
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";

// Expo imports
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";

// Local imports
import { auth, db } from "@/lib/firebase";
import type { AppUser } from "@/types/types";
import { createUser, type UserData } from "@/services/userService";

WebBrowser.maybeCompleteAuthSession();


type Extra = {
    ANDROID_CLIENT_ID: string;
    IOS_CLIENT_ID: string;
    WEB_CLIENT_ID: string;
}

type AuthProviderProps = {
  children: ReactNode;
};

const EXTRA = (Constants.expoConfig?.extra ?? {}) as Extra;

const isExpoGo = Constants.executionEnvironment === "storeClient";
const owner = Constants.expoConfig?.owner;
const slug = Constants.expoConfig?.slug;

// When using Expo Go redirectUri is https://auth.expo.io...Else app scheme.
const redirectUri = isExpoGo && owner && slug
    ? `https://auth.expo.io/@${owner}/${slug}`
    : AuthSession.makeRedirectUri({ scheme: "chorechamp"});

const authRequestConfig = isExpoGo
    ? {
        webClientId: EXTRA.WEB_CLIENT_ID,
        androidClientId: EXTRA.WEB_CLIENT_ID,
        iosClientId: EXTRA.WEB_CLIENT_ID,
      }
    : {
        webClientId: EXTRA.WEB_CLIENT_ID,
         androidClientId: EXTRA.WEB_CLIENT_ID,
          iosClientId: EXTRA.WEB_CLIENT_ID,
      };

export type AuthContextType = {
    user: FirebaseUser | null;
    loading: boolean;

    // Email and password
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;

    // Phone and password
    signInWithPhone: (phone: string, countryCode: string, password: string) => Promise<void>;
    signUpWithPhoneProfile: (params: {
        firstName: string;
        lastName: string;
        phone: string;
        countryCode: string;
        birthDate: string; 
        password: string;
    }) => Promise<void>;


    logOut: () => Promise<void>;

    // Google
    signInWithGoogle: () => Promise<void>;
}

function buildEmailFromPhone (phone: string, countryCode: string) {
    const digits = phone.replace(/\D/g, "");
    const countryDigits = countryCode.replace("+", "");
    return `${countryDigits}${digits}@chorechamp.app`;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
        androidClientId: EXTRA.ANDROID_CLIENT_ID,
        iosClientId: EXTRA.IOS_CLIENT_ID,
        webClientId: EXTRA.WEB_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        responseType: 'id_token',
        redirectUri
    });

    useEffect(() => {
        if (googleResponse?.type !== 'success') return;
        const idToken = googleResponse.authentication?.idToken ?? googleResponse.params?.id_token;
        if (!idToken) return;

        (async () => {
            try {
                const credential = GoogleAuthProvider.credential(idToken);
                await signInWithCredential(auth, credential);
            } catch (error) {
                console.log("signInWithCredentials failed", error);
            }
            })();
        }, [googleResponse]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (!firebaseUser) return;

            try {
                const ref = doc(db, "users", firebaseUser.uid);
                const snapshot = await getDoc(ref);

                if (!snapshot.exists()) {
                    const displayName = firebaseUser.displayName ?? "";
                    const docData: AppUser = {
                        name: displayName,
                        username: displayName,  // Default username to name
                        language: "nb",
                        profilePicture: firebaseUser.photoURL ?? "",
                        householdId: [],
                        role: { admin: true },
                        createdAt: serverTimestamp() as unknown as Timestamp,
                    };
                    await setDoc(ref, docData);
                }
            } catch (err) {
                console.error("create/read user doc failed", err);
            }
        });

        return unsub;
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

        async signInWithPhone(phone, countryCode, password) {
            const email = buildEmailFromPhone(phone, countryCode);
            await signInWithEmailAndPassword(auth, email, password);
        },

        async signUpWithPhoneProfile({
            firstName,
            lastName,
            phone,
            countryCode,
            birthDate,
            password,
        }) {
            const email = buildEmailFromPhone(phone, countryCode);
            const fullName = `${firstName} ${lastName}`.trim();

            const credential = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(credential.user, { displayName: fullName });

            const userDoc: Omit<UserData, "id"> = {
                firstName,
                lastName,
                username: fullName,
                imageUri: "",
                email, 
                phone: `${countryCode} ${phone}`,
                birthDate, 
                household: [],
                points: 0,
                language: "nb",
                notificationsEnabled: true, 
                locationEnabled: false, 
                darkModeEnabled: true, 
                role: { admin: true },
            };

            await createUser(credential.user.uid, userDoc);
        },

        async logOut() {
            await signOut(auth);
        },
        
        async signInWithGoogle() {
            if (!googleRequest) return;
            try {
                await googlePromptAsync({ showInRecents: true });
              } catch (error) {
                console.log("googlePromptAsync error", error)
              }
            },
        }),
        [user, loading, googleRequest, googlePromptAsync]
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

