/*
This context manages user data such as name, image, email, phone, notification preferences, and dark mode settings.
It uses React's Context API to share user information throughout the component tree. 
The `useUser` hook allows easy access to the user data and update functions in any functional component.
Data is fetched from Firebase Firestore and synced in real-time.
*/

import { auth } from '@/lib/firebase';
import { getUserData, updateUserData as updateUserDataService } from '@/services/userService';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    username: string;  // Display name, defaults to firstName + lastName
    imageUri?: string;
    email?: string;
    phone?: string;
    household?: { 
        id: string;
    };  // references household ID
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user data when auth state changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                await loadUserData(user.uid);
            } else {
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
                // Convert Firestore household reference to simple object
                const householdId = data.household?.id;
                const userData = {
                    ...data,
                    household: householdId ? { id: householdId } : undefined,
                };
                setUserData(userData);
                
                // Console log the found user
                console.log('✅ User found and loaded:', {
                    id: userData.id,
                    name: `${userData.firstName} ${userData.lastName}`,
                    email: userData.email || 'No email',
                    phone: userData.phone || 'No phone',
                    hasImage: !!userData.imageUri,
                    household: householdId || 'No household',
                    points: userData.points || 0,
                    language: userData.language,
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

    // Manually refresh user data from Firestore
    const refreshUserData = async () => {
        if (userData?.id) {
            await loadUserData(userData.id);
        }
    };

    // FOR TESTING: Load a specific user by ID (bypasses auth)
    const loadSpecificUser = async (userId: string) => {
        console.log('🧪 TEST MODE: Force loading user:', userId);
        await loadUserData(userId);
    };

    const value: UserContextType = {
        userData,
        loading,
        updateUserData,
        refreshUserData,
        loadSpecificUser,
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
