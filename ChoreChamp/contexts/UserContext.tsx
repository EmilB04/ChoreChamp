/*
This context manages user data such as name, image, email, phone, notification preferences, and dark mode settings.
It uses React's Context API to share user information throughout the component tree. 
The `useUser` hook allows easy access to the user data and update functions in any functional component.
*/

import React, { createContext, ReactNode, useContext, useState } from 'react';

interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    imageUri: string;
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
    userData: UserData;
    updateUserData: (data: Partial<UserData>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const [userData, setUserData] = useState<UserData>({
        id: 'user-123',
        firstName: "Emil",
        lastName: "Berglund",
        imageUri: "",
        email: "emilbe@hiof.no",
        phone: "+47 123 45 678",
        household: {
            id: 'NMogPiBLWF4nmwsHBTlP',
        },
        points: 33,
        language: 'nb',
        notificationsEnabled: true,
        locationEnabled: false,
        darkModeEnabled: true, 
        role: {
            admin: true,
        },
    });

    const updateUserData = (data: Partial<UserData>) => {
        setUserData(prev => ({ ...prev, ...data }));
    };

    const value: UserContextType = {
        userData,
        updateUserData,
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
