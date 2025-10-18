import { Timestamp } from "firebase/firestore";

export type User = {
    householdId: string; 
    language: 'no' | 'en' | 'es' | 'de';
    name: string;
    profilePicture: string;
    role: { admin: boolean };
    createdAt: Timestamp;
}