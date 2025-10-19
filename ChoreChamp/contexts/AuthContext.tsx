

// https://firebase.google.com/docs/auth/web/start/
// https://react.dev/reference/react/createContext/
// https://react.dev/reference/react/useContext/
// https://modularfirebase.web.app/reference/auth/
// https://firebase.google.com/docs/firestore/manage-data/add-data/
// https://modularfirebase.web.app/common-use-cases/firestore/

import { User } from "firebase/auth";
import { createContext } from "react";

export type AuthContextType = {
    user: User | null; 
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    logOut: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);


