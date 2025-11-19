/**
 * 🧪 TEST COMPONENT: User Loader Button
 * 
 * Drop this component anywhere in your app to quickly load test users.
 * 
 * Usage:
 * ```tsx
 * import TestUserLoader from '@/components/TestUserLoader';
 * 
 * // In your component:
 * <TestUserLoader />
 * ```
 * 
 * ⚠️ IMPORTANT: Remove this component before production deployment!
 */

import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TestUserLoader() {
    const { loadSpecificUser } = useUser();
    const { colors } = useTheme();
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoadUser = async () => {
        if (!userId.trim()) {
            Alert.alert('Error', 'Please enter a user ID');
            return;
        }

        setLoading(true);
        try {
            await loadSpecificUser(userId.trim());
            Alert.alert('Success', `Loaded user: ${userId}`);
        } catch (error) {
            Alert.alert('Error', `Failed to load user: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { 
            backgroundColor: colors.contextBackground,
            borderColor: colors.tint,
        }]}>
            <View style={styles.header}>
                <Ionicons name="flask" size={20} color={colors.tint} />
                <Text style={[styles.title, { color: colors.text }]}>
                    🧪 Test User Loader
                </Text>
            </View>
            
            <TextInput
                style={[styles.input, { 
                    backgroundColor: colors.background,
                    borderColor: colors.tint,
                    color: colors.text,
                }]}
                placeholder="Enter user ID from Firestore"
                placeholderTextColor={colors.lightDarkText}
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
            />
            
            <TouchableOpacity 
                style={[
                    styles.button,
                    { backgroundColor: colors.tint },
                    loading && styles.buttonDisabled
                ]}
                onPress={handleLoadUser}
                disabled={loading}
            >
                <Text style={[styles.buttonText, { color: colors.darkText }]}>
                    {loading ? 'Loading...' : 'Load User'}
                </Text>
            </TouchableOpacity>

            <Text style={[styles.hint, { color: colors.lightDarkText }]}>
                💡 Find user IDs in Firebase Console → Firestore → users collection
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 12,
    },
    button: {
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    hint: {
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
});
