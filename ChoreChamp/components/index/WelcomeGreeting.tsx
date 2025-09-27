/*
    Component that displays a time-based greeting along with the user's name.
    The greeting changes based on the current time of day:
    - Morning (5 AM - 9 AM): "God morgen"
    - Forenoon (9 AM - 12 PM): "God formiddag"
    - Afternoon (12 PM - 6 PM): "God dag"
    - Evening (6 PM - 12 AM): "God kveld"
    - Night (12 AM - 5 AM): "God natt"
    
    Props:
    - userName: string - The name of the user to greet.
*/


import React from 'react';
import { Text } from 'react-native';
import commonStyles from '@/app/commonStyles';
import { useTheme } from '@/contexts/ThemeContext';

export default function WelcomeGreeting({ userName }: { userName: string }) {
    const { colors } = useTheme();

    // Get greeting based on time of day
    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 9) {
            return "God morgen"; 
        } else if (hour >= 9 && hour < 12) {
            return "God formiddag"; 
        } else if (hour >= 12 && hour < 18) {
            return "God dag"; 
        } else if (hour >= 18 && hour < 24) {
            return "God kveld";
        } else {
            return "God natt";
        }
    };

    const timeBasedGreeting = getTimeBasedGreeting();

    return (
        <Text style={[commonStyles.headerTitle, { color: colors.text, marginTop: 0 }]}>
            {timeBasedGreeting},{"\n"}{userName}!
        </Text>
    );
}