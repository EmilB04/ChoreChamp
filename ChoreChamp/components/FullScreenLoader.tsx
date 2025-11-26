/*
    Full Screen Loader Component for ChoreChamp Application
    This component displays a full-screen loading indicator with optional text.
    It is used to indicate that a process is ongoing and the user should wait.
*/

import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function FullScreenLoader({ text = 'Laster inn...' }: { text?: string }) {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: 16,
        fontSize: 18,
    },
});
