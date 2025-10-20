import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface BackButtonProps {
    onPress?: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
    const router = useRouter();
    const { colors } = useTheme();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.back();
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
            style={styles.backButton}
        >
            <Ionicons name="chevron-back" size={22} color={colors.tint} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        left: 5,
        height: '100%',
        justifyContent: 'center',
        padding: 8,
    },
});
