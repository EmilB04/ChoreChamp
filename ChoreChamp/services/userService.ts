import { db } from '@/lib/firebase';
import { doc, DocumentReference, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    imageUri: string;
    email?: string;
    phone?: string;
    household?: DocumentReference;  // Firestore reference to household
    points?: number;
    language: 'nb' | 'en' | 'es' | 'de';
    notificationsEnabled?: boolean;
    locationEnabled?: boolean;
    darkModeEnabled?: boolean;
    role: {
        admin: boolean;
    };
}

/**
 * Fetch user data from Firestore by user ID
 */
export async function getUserData(userId: string): Promise<UserData | null> {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                id: userDoc.id,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                imageUri: data.imageUri || '',
                email: data.email,
                phone: data.phone,
                household: data.household,
                points: data.points || 0,
                language: data.language || 'nb',
                notificationsEnabled: data.notificationsEnabled ?? true,
                locationEnabled: data.locationEnabled ?? false,
                darkModeEnabled: data.darkModeEnabled ?? true,
                role: {
                    admin: data.role?.admin ?? false,
                },
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

/**
 * Update user data in Firestore
 */
export async function updateUserData(userId: string, data: Partial<Omit<UserData, 'id'>>): Promise<boolean> {
    try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, data as any);
        return true;
    } catch (error) {
        console.error('Error updating user data:', error);
        return false;
    }
}

/**
 * Create a new user in Firestore
 */
export async function createUser(userId: string, userData: Omit<UserData, 'id'>): Promise<boolean> {
    try {
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, userData);
        return true;
    } catch (error) {
        console.error('Error creating user:', error);
        return false;
    }
}

/**
 * Get household ID from user's household reference
 */
export function getHouseholdId(household: DocumentReference | undefined): string | undefined {
    return household?.id;
}
