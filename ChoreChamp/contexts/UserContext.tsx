/*
This context manages user data such as name, image, email, phone, notification preferences, and dark mode settings.
It uses React's Context API to share user information throughout the component tree. 
The `useUser` hook allows easy access to the user data and update functions in any functional component.
*/

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserData {
    name: string;
    imageUri: string;
    email?: string;
    phone?: string;
    notificationsEnabled?: boolean;
    darkModeEnabled?: boolean; // undefined = follow system, true = dark, false = light
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
        name: "Emil Berglund",
        imageUri: "https://i.pravatar.cc/150?",
        email: "emil.berglund@email.com",
        phone: "+47 123 45 678",
        notificationsEnabled: true,
        darkModeEnabled: true, 
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
