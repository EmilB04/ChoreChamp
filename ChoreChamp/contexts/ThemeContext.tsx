/*
This context provides theming capabilities (light/dark mode) to the app.
It uses React's Context API to share the current color scheme and colors
throughout the component tree. The `useTheme` hook allows easy access to
the theme data in any functional component.
*/

import React, { createContext, useContext, ReactNode } from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from './UserContext';

interface ThemeContextType {
    colorScheme: 'light' | 'dark';
    colors: typeof Colors.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const systemColorScheme = useColorScheme() ?? 'dark';
    const { userData } = useUser();
    
    // Use user preference if set, otherwise follow system
    const colorScheme: 'light' | 'dark' = userData.darkModeEnabled !== undefined 
        ? (userData.darkModeEnabled ? 'dark' : 'light')
        : systemColorScheme;
    
    const colors = Colors[colorScheme];

    const value: ThemeContextType = {
        colorScheme,
        colors,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}