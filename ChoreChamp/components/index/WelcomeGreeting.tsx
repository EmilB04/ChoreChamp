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


import React from 'react';
import { Text } from 'react-native';
import commonStyles from '@/app/commonStyles';
import { useTheme } from '@/contexts/ThemeContext';
import i18n from '@/app/i18n/i18n';

type GreetingPeriod = 'morning' | 'forenoon' | 'afternoon' | 'evening' | 'night';

export default function WelcomeGreeting({ userName }: { userName: string }) {
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
    // Prefer i18n translations in the 'onboarding' namespace. Provide Norwegian
    // defaults as a fallback via defaultValue so tests and non-initialized i18n
    // still render readable greetings.
    const key = `greeting.${period}`;
    const defaultMap: Record<GreetingPeriod, string> = {
        morning: 'God morgen',
        forenoon: 'God formiddag',
        afternoon: 'God dag',
        evening: 'God kveld',
        night: 'God natt',
    };

    const greeting = i18n.t(key, { defaultValue: defaultMap[period], ns: 'onboarding' });

    return (
        <Text style={[commonStyles.headerTitle, { color: colors.text, marginTop: 0 }]}>
            {greeting},{"\n"}{userName}!
        </Text>
    );
}