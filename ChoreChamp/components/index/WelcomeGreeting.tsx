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
import { useTranslation } from 'react-i18next';

type GreetingPeriod = 'morning' | 'forenoon' | 'afternoon' | 'evening' | 'night';

export default function WelcomeGreeting({ username }: { username: string }) {
    const { colors } = useTheme();
    const { t } = useTranslation('app');

    const getGreetingPeriod = (): GreetingPeriod => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 9) return 'morning';
        if (hour >= 9 && hour < 12) return 'forenoon';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 24) return 'evening';
        return 'night';
    };

    const period = getGreetingPeriod();
    const greeting = t(`greeting.${period}`);

    return (
        <Text style={[commonStyles.headerTitle, { color: colors.text, marginTop: 0 }]}>
            {greeting},{"\n"}{username}!
        </Text>
    );
}