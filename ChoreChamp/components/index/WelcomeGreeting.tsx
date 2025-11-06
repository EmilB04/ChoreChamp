/*
    Component that displays a time-based greeting along with the user's name.
    The greeting changes based on the current time of day.
    
    Supports multiple languages (i18n ready):
    - NO (Norwegian): Default language
    - EN (English)
    - DE (German)
    - ES (Spanish)
    
    Time periods:
    - Morning (5 AM - 9 AM)
    - Forenoon (9 AM - 12 PM)
    - Afternoon (12 PM - 6 PM)
    - Evening (6 PM - 12 AM)
    - Night (12 AM - 5 AM)
    
    Props:
    - userName: string - The name of the user to greet.
    - language?: 'NO' | 'EN' | 'DE' | 'ES' - Language code (default: 'NO')
*/


import commonStyles from '@/app/commonStyles';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { Text } from 'react-native';

// i18n greeting translations
const GREETINGS = {
    NO: {
        morning: "God morgen",
        forenoon: "God formiddag",
        afternoon: "God dag",
        evening: "God kveld",
        night: "God natt",
    },
    EN: {
        morning: "Good morning",
        forenoon: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening",
        night: "Good night",
    },
    DE: {
        morning: "Guten Morgen",
        forenoon: "Guten Morgen",
        afternoon: "Guten Tag",
        evening: "Guten Abend",
        night: "Gute Nacht",
    },
    ES: {
        morning: "Buenos días",
        forenoon: "Buenos días",
        afternoon: "Buenas tardes",
        evening: "Buenas noches",
        night: "Buenas noches",
    },
} as const;

type Language = keyof typeof GREETINGS;
type GreetingPeriod = keyof typeof GREETINGS.NO;

export default function WelcomeGreeting({ 
    username,
    language = 'NO'
}: { 
    username: string;
    language?: Language;
}) {
    const { colors } = useTheme();

    // Get greeting period based on time of day
    const getGreetingPeriod = (): GreetingPeriod => {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 9) {
            return "morning"; 
        } else if (hour >= 9 && hour < 12) {
            return "forenoon"; 
        } else if (hour >= 12 && hour < 18) {
            return "afternoon"; 
        } else if (hour >= 18 && hour < 24) {
            return "evening";
        } else {
            return "night";
        }
    };

    const period = getGreetingPeriod();
    const greeting = GREETINGS[language][period];

    return (
        <Text style={[commonStyles.headerTitle, { color: colors.text, marginTop: 0 }]}>
            {greeting},{"\n"}{username}!
        </Text>
    );
}