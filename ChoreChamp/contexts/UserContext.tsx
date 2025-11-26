/*
    This context manages user data such as name, image, email, phone, notification preferences, and dark mode settings.
    It uses React's Context API to share user information throughout the component tree. 
    The `useUser` hook allows easy access to the user data and update functions in any functional component.
    Data is fetched from Firebase Firestore and synced in real-time.
*/

import { auth } from '@/lib/firebase';
import { getUserData, updateUserData as updateUserDataService } from '@/services/userService';
import { DocumentReference } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    username: string;  // Display name, defaults to firstName + lastName
    imageUri?: string;
    email?: string;
    phone?: string;
    household?: (DocumentReference | string)[];  // Array of household references
    points?: number;
    language: 'nb' | 'en' | 'es' | 'de';
    notificationsEnabled?: boolean;
    locationEnabled?: boolean;
    darkModeEnabled?: boolean; // undefined = follow system, true = dark, false = light
    role: {
        admin: boolean;
    }
}

interface UserContextType {
    userData: UserData | null;
    loading: boolean;
    updateUserData: (data: Partial<UserData>) => Promise<void>;
    refreshUserData: () => Promise<void>;
    loadSpecificUser: (userId: string) => Promise<void>; // For testing
    resetToAuthUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [authUserId, setAuthUserId] = useState<string | null>(null);

    // Fetch user data when auth state changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setAuthUserId(user.uid);
                await loadUserData(user.uid);
            } else {
                setAuthUserId(null);
                setUserData(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Load user data from Firestore
    const loadUserData = async (userId: string) => {
        setLoading(true);
        try {
            const data = await getUserData(userId);
            if (data) {
                // Keep household array as-is (it's already an array of references)
                setUserData(data);
                
                // Console log the found user
                console.log('✅ User found and loaded:', {
                    id: data.id,
                    name: `${data.firstName} ${data.lastName}`,
                    email: data.email || 'No email',
                    phone: data.phone || 'No phone',
                    hasImage: !!data.imageUri,
                    households: data.household?.length || 0,
                    points: data.points || 0,
                    language: data.language,
                });
            } else {
                console.warn('⚠️ No user found with ID:', userId);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update user data both locally and in Firestore
    const updateUserData = async (data: Partial<UserData>) => {
        if (!userData) return;

        try {
            // Separate household from other data since it needs special handling
            const { household, ...restData } = data;
            
            // Update in Firestore (excluding household for now, as it requires DocumentReference)
            await updateUserDataService(userData.id, restData);
            
            // Update local state with all data including household
            setUserData(prev => prev ? { ...prev, ...data } : null);
        } catch (error) {
            console.error('Error updating user data:', error);
            throw error;
        }
    };


    // Manually refresh user data from Firestore (reloads current userData)
    const refreshUserData = async () => {
        if (userData?.id) {
            await loadUserData(userData.id);
        }
    };

    // Always reload the authenticated user (not test user)
    const resetToAuthUser = async () => {
        if (authUserId) {
            await loadUserData(authUserId);
        }
    };

    // FOR TESTING: Load a specific user by ID (bypasses auth)
    const loadSpecificUser = async (userId: string) => {
        // Only allow test user override if not logged in, or if explicitly not the auth user
        if (authUserId && userId === authUserId) {
            // If trying to load the real user, just reload
            await loadUserData(authUserId);
            return;
        }
        console.log('🧪 TEST MODE: Force loading user:', userId);
        await loadUserData(userId);
    };

    const value: UserContextType = {
        userData,
        loading,
        updateUserData,
        refreshUserData,
        loadSpecificUser,
        resetToAuthUser,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
