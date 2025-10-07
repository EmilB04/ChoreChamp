import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserData {
    name: string;
    imageUri: string;
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
        imageUri: "https://i.pravatar.cc/150?"
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
