/*
    Profile Header Component for ChoreChamp Application
    This component renders a customizable header for profile-related screens.
    It includes a back button, title, and an optional right-side element.
*/

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
    title: string;
    onBack: () => void;
    rightElement?: React.ReactNode;
}

export default function Header({ title, onBack, rightElement }: HeaderProps) {
    const { colors } = useTheme();
    
    return(
        <>
        {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.tint }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.darkText} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.darkText }]}>
                    {title}
                </Text>
                <View>
                    {rightElement}
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        marginBottom: 20,
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
});