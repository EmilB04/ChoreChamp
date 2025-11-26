/*
    User model definitions for the ChoreChamp application.
    These types define the structure of user-related data used throughout the app.
*/

import { Timestamp } from "firebase/firestore";

export type languageOptions = 'nb' | 'en' | 'es' | 'de';

export type AppUser = {
    householdId: string[];  
    language: languageOptions;
    name: string;
    username: string;  // Display name, defaults to name if not set
    profilePicture?: string;
    role: { admin: boolean };
    createdAt: Timestamp;
}