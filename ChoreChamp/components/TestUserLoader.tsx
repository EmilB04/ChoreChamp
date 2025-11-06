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

import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TestUserLoader() {
    const { loadSpecificUser } = useUser();
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
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="flask" size={20} color="#ff9500" />
                <Text style={styles.title}>🧪 Test User Loader</Text>
            </View>
            
            <TextInput
                style={styles.input}
                placeholder="Enter user ID from Firestore"
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="none"
                autoCorrect={false}
            />
            
            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLoadUser}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Loading...' : 'Load User'}
                </Text>
            </TouchableOpacity>

            <Text style={styles.hint}>
                💡 Find user IDs in Firebase Console → Firestore → users collection
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff3cd',
        borderWidth: 2,
        borderColor: '#ff9500',
        borderRadius: 12,
        padding: 16,
        margin: 16,
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
        color: '#856404',
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#ff9500',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#ff9500',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    hint: {
        fontSize: 12,
        color: '#856404',
        marginTop: 8,
        fontStyle: 'italic',
    },
});
