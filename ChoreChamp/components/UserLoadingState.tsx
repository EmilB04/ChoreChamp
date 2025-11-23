/**
 * UserLoadingState Component
 * 
 * Displays a loading or "no user data" state with debug information.
 * Used across tabs that require user data to function.
 * 
 * Features:
 * - Shows loading spinner when fetching data
 * - Shows "No User Data" message when user not found
 * - Includes test button to load a specific user
 * - Console logs debug information
 */

import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { debugFirebaseConnection } from '@/utils/firebaseDebug';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserLoadingStateProps {
    pageName?: string; // Optional name for debugging (e.g., "Dashboard", "Profile")
}

export default function UserLoadingState({ pageName = 'Page' }: UserLoadingStateProps) {
    const { colors } = useTheme();
    const { userData, loading, loadSpecificUser } = useUser();

    // 🧪 DEBUG: Log user fetch status
    useEffect(() => {
        console.log(`🔍 DEBUG [${pageName}] - User fetch status:`, {
            loading,
            hasUserData: !!userData,
            userId: userData?.id || 'None',
            userName: userData ? `${userData.firstName} ${userData.lastName}` : 'None',
        });
    }, [loading, userData, pageName]);

    // 🧪 TEST FUNCTION: Load a specific user for testing
    const testLoadUser = async () => {
        const testUserId = 'mRExgH1pI1e6TpGkj76Cn7Me9od2';

        console.log(`🧪 [${pageName}] Loading test user:`, testUserId);
        await loadSpecificUser(testUserId);
    };

    // 🔍 DEBUG FUNCTION: Test Firebase connection
    const testFirebaseConnection = async () => {
        console.log(`🔍 [${pageName}] Running Firebase diagnostics...`);
        await debugFirebaseConnection();
    };

    // Only render if there's no user data
    if (!userData) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {loading ? 'Loading...' : 'No User Data'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.lightDarkText }]}>
                    {loading ? '🔄 Fetching user data...' : '❌ User not found or not logged in'}
                </Text>
                {!loading && (
                    <>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.tint }]}
                            onPress={testLoadUser}
                        >
                            <Text style={[styles.buttonText, { color: colors.darkText }]}>
                                🧪 Load Test User
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#ff9500', marginTop: 12 }]}
                            onPress={testFirebaseConnection}
                        >
                            <Text style={[styles.buttonText, { color: '#fff' }]}>
                                🔍 Debug Firebase
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        );
    }

    // If userData exists, don't render anything (let parent component render its content)
    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        opacity: 0.7,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 14,
    },
});
