import { Timestamp } from "firebase/firestore";

export type languageOptions = 'nb' | 'en' | 'es' | 'de';

export type AppUser = {
    householdId: string[];  
    language: languageOptions;
    name: string;
    profilePicture?: string;
    role: { admin: boolean };
    createdAt: Timestamp;
}